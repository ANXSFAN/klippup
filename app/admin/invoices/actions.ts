"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  buildInvoiceFromCampaign,
  reserveSerialNumber,
  type BrandInvoiceSnapshot
} from "@/lib/invoice";
import { isBrandFinancialComplete } from "@/lib/tax";
import type { InvoiceStatus } from "@/lib/types";

export type AdminInvoiceResult<T = void> =
  | ({ ok: true } & (T extends void ? { id?: string } : T))
  | { ok: false; error: string };

async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("UNAUTHENTICATED");
  if (profile.role !== "ADMIN") throw new Error("NOT_ADMIN");
  return profile;
}

const STATUSES: InvoiceStatus[] = ["PROFORMA", "ISSUED", "PAID", "CANCELLED"];

/**
 * Issues an invoice for a brand-owned campaign. Refuses if:
 *  - the campaign isn't owned by a brand user (platform-seeded campaigns have
 *    no recipient to invoice),
 *  - the brand profile is missing billing fields,
 *  - the campaign already has a non-cancelled invoice.
 *
 * Serial number reservation happens inside the same transaction as the row
 * insert so a rollback leaves no gap in the per-year sequence.
 */
export async function createInvoiceForCampaign(
  campaignId: string
): Promise<AdminInvoiceResult<{ id: string }>> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: {
      id: true,
      title: true,
      budget: true,
      brandUserId: true,
      brandUser: {
        select: {
          id: true,
          displayName: true,
          brand: true
        }
      }
    }
  });
  if (!campaign) return { ok: false, error: "CAMPAIGN_NOT_FOUND" };
  if (!campaign.brandUserId || !campaign.brandUser?.brand) {
    return { ok: false, error: "PLATFORM_CAMPAIGN_NO_BRAND" };
  }
  const brand = campaign.brandUser.brand;
  if (!isBrandFinancialComplete(brand)) {
    return { ok: false, error: "BRAND_BILLING_INCOMPLETE" };
  }

  const existing = await prisma.invoice.findFirst({
    where: { campaignId, status: { not: "CANCELLED" } },
    select: { id: true }
  });
  if (existing) return { ok: false, error: "ALREADY_HAS_INVOICE" };

  const brandAddress = (brand.address ?? {}) as Record<string, unknown>;
  const snapshot: BrandInvoiceSnapshot = {
    legalName: brand.legalName ?? "",
    taxId: brand.taxId ?? "",
    taxIdType: brand.taxIdType ?? "",
    country: brand.country ?? "ES",
    billingEmail: brand.billingEmail ?? "",
    brandName: brand.brandName,
    address: {
      street: typeof brandAddress.street === "string" ? brandAddress.street : "",
      city: typeof brandAddress.city === "string" ? brandAddress.city : "",
      postalCode:
        typeof brandAddress.postalCode === "string" ? brandAddress.postalCode : "",
      region: typeof brandAddress.region === "string" ? brandAddress.region : ""
    }
  };

  const year = new Date().getFullYear();
  const built = buildInvoiceFromCampaign({
    campaign: { id: campaign.id, title: campaign.title, budget: campaign.budget },
    brand: snapshot,
    brandUserId: campaign.brandUserId,
    year
  });

  const created = await prisma.$transaction(async (tx) => {
    const { serialNumber } = await reserveSerialNumber(tx, year);
    return tx.invoice.create({
      data: {
        serialNumber,
        year,
        brandUserId: built.brandUserId,
        campaignId: campaign.id,
        description: built.description,
        baseCents: built.baseCents,
        ivaRatePercent: built.ivaRatePercent,
        ivaCents: built.ivaCents,
        totalCents: built.totalCents,
        ivaNote: built.ivaNote,
        snapshotPlatform: built.snapshotPlatform as unknown as Prisma.InputJsonValue,
        snapshotBrand: built.snapshotBrand as unknown as Prisma.InputJsonValue,
        status: "PROFORMA"
      },
      select: { id: true }
    });
  });

  revalidatePath("/admin/invoices");
  revalidatePath("/admin/campaigns");
  revalidatePath(`/brand/campaigns/${campaign.id}/edit`);
  return { ok: true, id: created.id };
}

export async function setInvoiceStatus(
  id: string,
  status: InvoiceStatus
): Promise<AdminInvoiceResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  if (!STATUSES.includes(status)) return { ok: false, error: "INVALID_STATUS" };

  const existing = await prisma.invoice.findUnique({
    where: { id },
    select: { id: true, status: true, campaignId: true }
  });
  if (!existing) return { ok: false, error: "NOT_FOUND" };

  await prisma.invoice.update({
    where: { id },
    data: {
      status,
      paidAt: status === "PAID" ? new Date() : null
    }
  });

  revalidatePath("/admin/invoices");
  if (existing.campaignId) {
    revalidatePath(`/brand/campaigns/${existing.campaignId}/edit`);
  }
  return { ok: true };
}
