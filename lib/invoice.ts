import type { Prisma } from "@/app/generated/prisma/client";
import { calculateIva, type IvaNote } from "./tax";

/**
 * Issuer subject (KlippUp platform) used on every invoice. Sourced from env
 * so the legal/banking details live alongside other secrets and never end up
 * in the database or git. Falls back to obvious placeholders in dev so the
 * PDF still renders without crashing — but production MUST set these.
 */
export interface PlatformEntity {
  legalName: string;
  taxId: string;
  taxIdType: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    region: string;
    country: string;
  };
  iban: string;
  email: string;
}

export function getPlatformEntity(): PlatformEntity {
  return {
    legalName: process.env.PLATFORM_LEGAL_NAME ?? "KlippUp (configurar)",
    taxId: process.env.PLATFORM_TAX_ID ?? "B00000000",
    taxIdType: process.env.PLATFORM_TAX_ID_TYPE ?? "CIF",
    address: {
      street: process.env.PLATFORM_ADDRESS_STREET ?? "",
      city: process.env.PLATFORM_ADDRESS_CITY ?? "",
      postalCode: process.env.PLATFORM_ADDRESS_POSTAL_CODE ?? "",
      region: process.env.PLATFORM_ADDRESS_REGION ?? "",
      country: process.env.PLATFORM_ADDRESS_COUNTRY ?? "ES"
    },
    iban: process.env.PLATFORM_IBAN ?? "",
    email: process.env.PLATFORM_EMAIL ?? ""
  };
}

/**
 * Atomic per-year serial number reservation. MUST be called inside the same
 * transaction that creates the Invoice row — that way a rollback releases the
 * number and we never leave a gap.
 *
 * Postgres serializes the row-level update under the upsert, so two parallel
 * issuances in the same year will queue rather than duplicate.
 */
export async function reserveSerialNumber(
  tx: Prisma.TransactionClient,
  year: number
): Promise<{ year: number; number: number; serialNumber: string }> {
  const counter = await tx.invoiceCounter.upsert({
    where: { year },
    create: { year, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } }
  });
  const padded = String(counter.lastNumber).padStart(4, "0");
  return {
    year,
    number: counter.lastNumber,
    serialNumber: `F-${year}-${padded}`
  };
}

export interface BrandInvoiceSnapshot {
  legalName: string;
  taxId: string;
  taxIdType: string;
  country: string;
  billingEmail: string;
  brandName: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    region: string;
  };
}

interface BuildInvoiceArgs {
  campaign: {
    id: string;
    title: string;
    budget: number; // EUR (not cents) — matches Campaign.budget
  };
  brand: BrandInvoiceSnapshot;
  brandUserId: string;
  year: number;
}

export interface BuiltInvoice {
  description: string;
  baseCents: number;
  ivaRatePercent: number;
  ivaCents: number;
  totalCents: number;
  ivaNote: IvaNote;
  snapshotPlatform: PlatformEntity;
  snapshotBrand: BrandInvoiceSnapshot;
  brandUserId: string;
  year: number;
}

/**
 * Pre-computes everything for an Invoice row except the serial number, which
 * gets reserved inside the same transaction that writes the row.
 */
export function buildInvoiceFromCampaign(args: BuildInvoiceArgs): BuiltInvoice {
  const platform = getPlatformEntity();
  const iva = calculateIva({
    brandCountry: args.brand.country || "ES",
    brandTaxIdType: args.brand.taxIdType || null
  });
  const baseCents = args.campaign.budget * 100;
  const ivaCents = Math.round(baseCents * iva.rate);
  const totalCents = baseCents + ivaCents;
  return {
    description: `Campaña: ${args.campaign.title} — presupuesto de €${args.campaign.budget.toLocaleString("es-ES")}`,
    baseCents,
    ivaRatePercent: Math.round(iva.rate * 100),
    ivaCents,
    totalCents,
    ivaNote: iva.note,
    snapshotPlatform: platform,
    snapshotBrand: args.brand,
    brandUserId: args.brandUserId,
    year: args.year
  };
}

/** Formatter shared by PDF + UI. */
export function formatEUR(cents: number): string {
  return (cents / 100).toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR"
  });
}
