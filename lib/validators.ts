import { z } from "zod";

/** All fields are strings (the form holds raw input); the Server Action parses
 *  numbers / arrays / JSON before writing to the DB. Keeps RHF + zod in sync
 *  without input/output type mismatches. */

const numericText = z
  .string()
  .regex(/^\d*$/, "Introduce un número entero")
  .default("");

const requiredNumericText = z.string().regex(/^\d+$/, "Introduce un número entero");

const earningsRow = z.object({
  rate: z.string().default(""),
  min: z.string().default(""),
  max: z.string().default("")
});

export const placementSlots = ["HERO", "FEATURED", "GRID"] as const;
export const campaignStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export const resourceKinds = ["drive", "link"] as const;

export const campaignFormSchema = z.object({
  brand: z.string().min(1, "Obligatorio"),
  brandVerified: z.boolean().default(true),
  title: z.string().min(1, "Obligatorio"),
  artTitle: z.string().default(""),
  description: z.string().min(1, "Obligatorio"),
  coverUrl: z.string().min(1, "Obligatorio"),
  categoryId: z.string().min(1, "Obligatorio"),
  categoryLabel: z.string().default(""),
  platformIds: z.array(z.string()).default([]),
  placements: z.array(z.enum(placementSlots)).default([]),
  raised: numericText,
  budget: requiredNumericText,
  participants: numericText,
  rate: z.string().default(""),
  launchedAt: z.string().default(""),
  hot: z.boolean().default(false),
  status: z.enum(campaignStatuses).default("PUBLISHED"),
  poweredBy: z.string().default(""),
  requirements: z.array(z.object({ value: z.string() })).default([]),
  earnings: z
    .object({
      tiktok: earningsRow,
      youtube: earningsRow,
      instagram: earningsRow
    })
    .default({
      tiktok: { rate: "", min: "", max: "" },
      youtube: { rate: "", min: "", max: "" },
      instagram: { rate: "", min: "", max: "" }
    }),
  topEarners: z
    .array(z.object({ views: z.string().default(""), name: z.string().default("") }))
    .default([]),
  resources: z
    .array(
      z.object({
        name: z.string().default(""),
        subtitle: z.string().default(""),
        kind: z.enum(resourceKinds).default("link"),
        url: z.string().default("")
      })
    )
    .default([]),
  totalViews: z.string().default(""),
  viewsSeries: z.string().default("")
});

export type CampaignFormValues = z.infer<typeof campaignFormSchema>;
export type CampaignEditData = CampaignFormValues & { id: string };

/** Shared shape for the simple category / platform dialog form. `glyph` is only
 *  used by platforms; categories leave it blank. */
export const entityFormSchema = z.object({
  slug: z
    .string()
    .min(1, "Obligatorio")
    .regex(/^[a-z0-9][a-z0-9-]*$/, "Solo minúsculas, números y guiones"),
  label: z.string().min(1, "Obligatorio"),
  glyph: z.string().default(""),
  sortOrder: z.string().regex(/^-?\d+$/, "Introduce un número").default("0")
});
export type EntityFormValues = z.infer<typeof entityFormSchema>;
export function emptyEntityForm(): EntityFormValues {
  return { slug: "", label: "", glyph: "", sortOrder: "0" };
}

export type EntityActionResult = { ok: true } | { ok: false; error: string };

/** A complete blank value set — used as RHF defaultValues for the "new" form. */
export function emptyCampaignForm(): CampaignFormValues {
  return {
    brand: "",
    brandVerified: true,
    title: "",
    artTitle: "",
    description: "",
    coverUrl: "",
    categoryId: "",
    categoryLabel: "",
    platformIds: [],
    placements: [],
    raised: "",
    budget: "",
    participants: "",
    rate: "",
    launchedAt: "",
    hot: false,
    status: "PUBLISHED",
    poweredBy: "",
    requirements: [],
    earnings: {
      tiktok: { rate: "", min: "", max: "" },
      youtube: { rate: "", min: "", max: "" },
      instagram: { rate: "", min: "", max: "" }
    },
    topEarners: [],
    resources: [],
    totalViews: "",
    viewsSeries: ""
  };
}

// ---------- creator submission ----------

export const submissionFormSchema = z.object({
  campaignId: z.string().min(1),
  platformId: z.string().min(1, "Selecciona una plataforma"),
  videoUrl: z.string().url("URL inválida"),
  viewsClaimed: z.string().regex(/^\d*$/, "Introduce un número entero").default("")
});
export type SubmissionFormValues = z.infer<typeof submissionFormSchema>;

// ---------- creator profile ----------

export const profileFormSchema = z.object({
  displayName: z.string().min(1, "Obligatorio"),
  socials: z.object({
    tiktok: z.string().default(""),
    youtube: z.string().default(""),
    instagram: z.string().default(""),
    x: z.string().default(""),
    twitch: z.string().default("")
  }),
  payout: z.object({
    method: z.enum(["paypal", "bank", "other", ""]).default(""),
    details: z.string().default("")
  })
});
export type ProfileFormValues = z.infer<typeof profileFormSchema>;

// ---------- brand campaign ----------

export const brandCampaignFormSchema = z.object({
  title: z.string().min(1, "Obligatorio"),
  artTitle: z.string().default(""),
  description: z.string().min(1, "Obligatorio"),
  coverUrl: z.string().min(1, "Obligatorio"),
  categoryId: z.string().min(1, "Obligatorio"),
  categoryLabel: z.string().default(""),
  platformIds: z.array(z.string()).min(1, "Selecciona al menos una plataforma"),
  budget: requiredNumericText,
  participants: numericText,
  rate: z.string().min(1, "Obligatorio"),
  launchedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD"),
  poweredBy: z.string().default(""),
  requirements: z.array(z.object({ value: z.string() })).default([]),
  earnings: z.object({
    tiktok: earningsRow,
    youtube: earningsRow,
    instagram: earningsRow
  })
});
export type BrandCampaignFormValues = z.infer<typeof brandCampaignFormSchema>;

export function emptyBrandCampaignForm(): BrandCampaignFormValues {
  return {
    title: "",
    artTitle: "",
    description: "",
    coverUrl: "",
    categoryId: "",
    categoryLabel: "",
    platformIds: [],
    budget: "",
    participants: "",
    rate: "",
    launchedAt: new Date().toISOString().slice(0, 10),
    poweredBy: "",
    requirements: [],
    earnings: {
      tiktok: { rate: "", min: "", max: "" },
      youtube: { rate: "", min: "", max: "" },
      instagram: { rate: "", min: "", max: "" }
    }
  };
}

// ---------- brand profile ----------

export const brandProfileFormSchema = z.object({
  brandName: z.string().min(1, "Obligatorio"),
  website: z.string().default(""),
  description: z.string().default("")
});
export type BrandProfileFormValues = z.infer<typeof brandProfileFormSchema>;

// ---------- submission review (brand + admin) ----------

export const approveSubmissionSchema = z.object({
  submissionId: z.string().min(1),
  viewsVerified: z.string().regex(/^\d+$/, "Introduce un número entero"),
  earningsCents: z.string().regex(/^\d+$/, "Introduce un número entero"),
  notes: z.string().default("")
});
export type ApproveSubmissionValues = z.infer<typeof approveSubmissionSchema>;

export const rejectSubmissionSchema = z.object({
  submissionId: z.string().min(1),
  reason: z.string().min(1, "Obligatorio")
});
export type RejectSubmissionValues = z.infer<typeof rejectSubmissionSchema>;

// ---------- admin (Phase D) ----------

export const changeRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["CREATOR", "BRAND", "ADMIN"])
});
export type ChangeRoleValues = z.infer<typeof changeRoleSchema>;

export const setVerifiedSchema = z.object({
  userId: z.string().min(1),
  verified: z.boolean()
});
export type SetVerifiedValues = z.infer<typeof setVerifiedSchema>;

export const createPayoutSchema = z.object({
  creatorId: z.string().min(1),
  method: z.enum(["paypal", "bank", "other"]),
  details: z.string().default(""),
  txnRef: z.string().default(""),
  notes: z.string().default(""),
  submissionIds: z.array(z.string().min(1)).min(1, "Selecciona al menos un envío")
});
export type CreatePayoutValues = z.infer<typeof createPayoutSchema>;
