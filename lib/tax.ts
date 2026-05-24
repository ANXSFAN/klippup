/**
 * Spain-first fiscal rules — IRPF (creator withholding) and IVA (brand VAT).
 *
 * Single source of truth. Used by:
 *   - createSubmission / createBrandCampaign guards (financial-complete check)
 *   - Payout calculation (creator IRPF withholding)
 *   - Brand invoice PDF generation (IVA rate + note)
 */

/** EUR cents threshold over which a creator MUST be registered as autónomo. */
export const AUTONOMO_THRESHOLD_CENTS = 100_000; // €1,000

/** EUR cents threshold over which a creator MUST upload an ID document. */
export const KYC_DOCUMENT_THRESHOLD_CENTS = 100_000; // €1,000

/** New autónomos get a reduced 7% IRPF for the first 2 calendar years. */
export const AUTONOMO_REDUCED_YEARS = 2;
export const AUTONOMO_REDUCED_IRPF = 0.07;
export const AUTONOMO_STANDARD_IRPF = 0.15;
export const IRNR_EU_RATE = 0.19;
export const IRNR_NON_EU_RATE = 0.24;
export const IVA_STANDARD = 0.21;

const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE"
]);

export type IrpfReason =
  | "AUTONOMO_REDUCED"
  | "AUTONOMO_STANDARD"
  | "IRNR_EU"
  | "IRNR_NON_EU"
  | "NONE";

/**
 * Returns the withholding rate the platform applies on each payout, plus the
 * reason string used to render the invoice / payment note.
 *
 * Spanish autónomos: 7% for the first 2 years of `actividad económica`, 15%
 * after that. Non-residents fall under IRNR (19% EU / 24% non-EU). A Spanish
 * creator who isn't an autónomo can't legally invoice, so rate = 0 and the
 * guard layer (see `isCreatorFinancialComplete`) blocks payouts above the
 * €1k/year threshold anyway.
 */
export function calculateIrpf(args: {
  country: string | null;
  isAutonomo: boolean;
  autonomoSince: Date | null;
}): { rate: number; reason: IrpfReason } {
  const country = args.country ?? "ES";
  if (country !== "ES") {
    return EU_COUNTRIES.has(country)
      ? { rate: IRNR_EU_RATE, reason: "IRNR_EU" }
      : { rate: IRNR_NON_EU_RATE, reason: "IRNR_NON_EU" };
  }
  if (!args.isAutonomo) {
    return { rate: 0, reason: "NONE" };
  }
  if (args.autonomoSince) {
    const yearsActive =
      (Date.now() - args.autonomoSince.getTime()) /
      (365.25 * 24 * 3600 * 1000);
    if (yearsActive < AUTONOMO_REDUCED_YEARS) {
      return { rate: AUTONOMO_REDUCED_IRPF, reason: "AUTONOMO_REDUCED" };
    }
  }
  return { rate: AUTONOMO_STANDARD_IRPF, reason: "AUTONOMO_STANDARD" };
}

export type IvaNote = "ES" | "REVERSE_CHARGE" | "EXPORT";

/**
 * VAT to charge a brand. ES = 21%. EU + valid VAT number = reverse charge 0%.
 * Non-EU = export of services 0%. Used by the invoice generator.
 */
export function calculateIva(args: {
  brandCountry: string | null;
  brandTaxIdType: string | null;
}): { rate: number; note: IvaNote } {
  const country = args.brandCountry ?? "ES";
  if (country === "ES") return { rate: IVA_STANDARD, note: "ES" };
  if (EU_COUNTRIES.has(country) && args.brandTaxIdType === "VAT") {
    return { rate: 0, note: "REVERSE_CHARGE" };
  }
  return { rate: 0, note: "EXPORT" };
}

// ---------- completeness guards ----------

/** Minimal fields a creator must fill before their first submission. */
export interface CreatorFinancialState {
  legalName: string | null;
  taxIdType: string | null;
  taxId: string | null;
  country: string | null;
  birthDate: Date | null;
  address: unknown; // Json — non-null = filled (form enforces shape)
  iban: string | null;
}

export function isCreatorFinancialComplete(s: CreatorFinancialState): boolean {
  return Boolean(
    s.legalName?.trim() &&
      s.taxIdType &&
      s.taxId?.trim() &&
      s.country?.trim() &&
      s.birthDate &&
      s.address &&
      s.iban?.trim()
  );
}

/** Minimal fields a brand must fill before publishing/creating a campaign. */
export interface BrandFinancialState {
  legalName: string | null;
  taxIdType: string | null;
  taxId: string | null;
  country: string | null;
  address: unknown;
  billingEmail: string | null;
}

export function isBrandFinancialComplete(s: BrandFinancialState): boolean {
  return Boolean(
    s.legalName?.trim() &&
      s.taxIdType &&
      s.taxId?.trim() &&
      s.country?.trim() &&
      s.address &&
      s.billingEmail?.trim()
  );
}

/**
 * Spanish creators not registered as autónomo are allowed to earn up to
 * €1,000/year on the platform (actividad esporádica grey zone). Past that
 * we block new submissions until they either register as autónomo or accept
 * that earnings stop being payable.
 */
export function exceedsAutonomoThreshold(args: {
  country: string | null;
  isAutonomo: boolean;
  totalEarnedCents: number;
}): boolean {
  const country = args.country ?? "ES";
  if (country !== "ES") return false;
  if (args.isAutonomo) return false;
  return args.totalEarnedCents >= AUTONOMO_THRESHOLD_CENTS;
}
