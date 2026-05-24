import { prisma } from "./db";
import type { InvoiceRow, InvoiceStatus } from "./types";

interface RawInvoiceRow {
  id: string;
  serialNumber: string;
  issueDate: Date;
  description: string;
  baseCents: number;
  ivaRatePercent: number;
  ivaCents: number;
  totalCents: number;
  ivaNote: string;
  status: string;
  brandUserId: string;
  campaignId: string | null;
  paidAt: Date | null;
  brandUser: { displayName: string; brand: { brandName: string } | null };
  campaign: { title: string } | null;
}

function mapInvoice(r: RawInvoiceRow): InvoiceRow {
  return {
    id: r.id,
    serialNumber: r.serialNumber,
    issueDate: r.issueDate,
    description: r.description,
    baseCents: r.baseCents,
    ivaRatePercent: r.ivaRatePercent,
    ivaCents: r.ivaCents,
    totalCents: r.totalCents,
    ivaNote: r.ivaNote,
    status: r.status as InvoiceStatus,
    brandUserId: r.brandUserId,
    brandName: r.brandUser.brand?.brandName ?? r.brandUser.displayName,
    campaignId: r.campaignId,
    campaignTitle: r.campaign?.title ?? null,
    paidAt: r.paidAt
  };
}

const includeJoins = {
  brandUser: { select: { displayName: true, brand: { select: { brandName: true } } } },
  campaign: { select: { title: true } }
} as const;

export async function listAdminInvoices(): Promise<InvoiceRow[]> {
  const rows = await prisma.invoice.findMany({
    orderBy: [{ year: "desc" }, { serialNumber: "desc" }],
    include: includeJoins
  });
  return rows.map(mapInvoice);
}

export async function listInvoicesForBrand(brandUserId: string): Promise<InvoiceRow[]> {
  const rows = await prisma.invoice.findMany({
    where: { brandUserId },
    orderBy: [{ year: "desc" }, { serialNumber: "desc" }],
    include: includeJoins
  });
  return rows.map(mapInvoice);
}

export async function listInvoicesForCampaign(
  campaignId: string,
  brandUserId?: string
): Promise<InvoiceRow[]> {
  const rows = await prisma.invoice.findMany({
    where: { campaignId, ...(brandUserId ? { brandUserId } : {}) },
    orderBy: { issueDate: "desc" },
    include: includeJoins
  });
  return rows.map(mapInvoice);
}
