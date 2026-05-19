"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  approveSubmissionSchema,
  brandCampaignFormSchema,
  brandProfileFormSchema,
  rejectSubmissionSchema,
  type ApproveSubmissionValues,
  type BrandCampaignFormValues,
  type BrandProfileFormValues,
  type RejectSubmissionValues
} from "@/lib/validators";

export type ActionResult<T = void> =
  | ({ ok: true } & (T extends void ? { id?: string } : T))
  | { ok: false; error: string };

async function requireBrand() {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("UNAUTHENTICATED");
  if (profile.role !== "BRAND") throw new Error("NOT_A_BRAND");
  return profile;
}

interface ScalarCampaignData {
  title: string;
  artTitle: string | null;
  description: string;
  coverUrl: string;
  categoryId: string;
  categoryLabel: string | null;
  budget: number;
  participants: number;
  rate: string;
  launchedAt: Date;
  poweredBy: string | null;
  requirements: string[];
  earnings: Prisma.InputJsonValue | typeof Prisma.DbNull;
}

function buildScalarData(v: BrandCampaignFormValues): ScalarCampaignData {
  const earnings = packEarnings(v.earnings);
  return {
    title: v.title.trim(),
    artTitle: v.artTitle.trim() || null,
    description: v.description.trim(),
    coverUrl: v.coverUrl.trim(),
    categoryId: v.categoryId,
    categoryLabel: v.categoryLabel.trim() || null,
    budget: Number.parseInt(v.budget, 10),
    participants: v.participants === "" ? 0 : Number.parseInt(v.participants, 10),
    rate: v.rate.trim(),
    launchedAt: new Date(`${v.launchedAt}T00:00:00`),
    poweredBy: v.poweredBy.trim() || null,
    requirements: v.requirements.map((r) => r.value.trim()).filter(Boolean),
    earnings
  };
}

function packEarnings(
  e: BrandCampaignFormValues["earnings"]
): Prisma.InputJsonValue | typeof Prisma.DbNull {
  const trim = (row: { rate: string; min: string; max: string }) => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) {
      const t = v.trim();
      if (t) out[k] = t;
    }
    return out;
  };
  const out: Record<string, Record<string, string>> = {};
  for (const k of ["tiktok", "youtube", "instagram"] as const) {
    const row = trim(e[k]);
    if (Object.keys(row).length > 0) out[k] = row;
  }
  return Object.keys(out).length === 0 ? Prisma.DbNull : (out as Prisma.InputJsonValue);
}

/** Brand creates a new campaign — always DRAFT, brand display = BrandProfile.brandName. */
export async function createBrandCampaign(
  input: BrandCampaignFormValues
): Promise<ActionResult<{ id: string }>> {
  let profile;
  try {
    profile = await requireBrand();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  const parsed = brandCampaignFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID" };

  const brandProfile = await prisma.brandProfile.findUnique({ where: { userId: profile.id } });
  if (!brandProfile) return { ok: false, error: "MISSING_BRAND_PROFILE" };

  const v = parsed.data;
  const data = buildScalarData(v);

  const created = await prisma.campaign.create({
    data: {
      ...data,
      brand: brandProfile.brandName,
      brandVerified: brandProfile.verified,
      brandUserId: profile.id,
      status: "DRAFT",
      raised: 0,
      hot: false,
      platforms: {
        create: v.platformIds.map((id, order) => ({ platformId: id, order }))
      }
    },
    select: { id: true }
  });

  revalidatePath("/brand");
  revalidatePath("/brand/campaigns");
  return { ok: true, id: created.id };
}

/**
 * Update a campaign the brand owns. Brands cannot change status (admin gate)
 * nor placements / brand verification. Once ARCHIVED the campaign is locked.
 */
export async function updateBrandCampaign(
  id: string,
  input: BrandCampaignFormValues
): Promise<ActionResult<{ id: string }>> {
  let profile;
  try {
    profile = await requireBrand();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  const parsed = brandCampaignFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID" };

  const existing = await prisma.campaign.findFirst({
    where: { id, brandUserId: profile.id },
    select: { id: true, status: true }
  });
  if (!existing) return { ok: false, error: "NOT_FOUND" };
  if (existing.status === "ARCHIVED") return { ok: false, error: "ARCHIVED" };

  const v = parsed.data;
  const data = buildScalarData(v);

  await prisma.campaign.update({
    where: { id },
    data: {
      ...data,
      platforms: {
        deleteMany: {},
        create: v.platformIds.map((pid, order) => ({ platformId: pid, order }))
      }
    }
  });

  revalidatePath("/");
  revalidatePath("/brand");
  revalidatePath("/brand/campaigns");
  revalidatePath(`/brand/campaigns/${id}/edit`);
  return { ok: true, id };
}

/**
 * Clone an existing campaign into a fresh DRAFT owned by the same brand.
 * Copies title (+ " (copy)") / description / cover / category / platforms /
 * rate / budget / requirements / earnings — everything reusable as a template.
 * Drops things that don't make sense to inherit: placements, raised, hot,
 * artTitle/poweredBy/topEarners/resources/viewsSeries.
 */
export async function duplicateBrandCampaign(
  id: string
): Promise<ActionResult<{ id: string }>> {
  let profile;
  try {
    profile = await requireBrand();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const src = await prisma.campaign.findFirst({
    where: { id, brandUserId: profile.id },
    include: {
      platforms: { orderBy: { order: "asc" } }
    }
  });
  if (!src) return { ok: false, error: "NOT_FOUND" };

  const brandProfile = await prisma.brandProfile.findUnique({
    where: { userId: profile.id }
  });
  if (!brandProfile) return { ok: false, error: "MISSING_BRAND_PROFILE" };

  const created = await prisma.campaign.create({
    data: {
      title: `${src.title} (copy)`,
      artTitle: null,
      description: src.description,
      coverUrl: src.coverUrl,
      categoryId: src.categoryId,
      categoryLabel: src.categoryLabel,
      budget: src.budget,
      participants: src.participants,
      rate: src.rate,
      launchedAt: new Date(),
      poweredBy: null,
      requirements: src.requirements,
      earnings:
        src.earnings == null ? Prisma.DbNull : (src.earnings as Prisma.InputJsonValue),
      brand: brandProfile.brandName,
      brandVerified: brandProfile.verified,
      brandUserId: profile.id,
      status: "DRAFT",
      raised: 0,
      hot: false,
      platforms: {
        create: src.platforms.map((p) => ({ platformId: p.platformId, order: p.order }))
      }
    },
    select: { id: true }
  });

  revalidatePath("/brand");
  revalidatePath("/brand/campaigns");
  return { ok: true, id: created.id };
}

export async function deleteBrandCampaign(id: string): Promise<ActionResult> {
  let profile;
  try {
    profile = await requireBrand();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const existing = await prisma.campaign.findFirst({
    where: { id, brandUserId: profile.id },
    select: { id: true, status: true }
  });
  if (!existing) return { ok: false, error: "NOT_FOUND" };
  // Once published, deletion would leave creators' submissions orphan-ish — block it.
  if (existing.status === "PUBLISHED") return { ok: false, error: "ALREADY_PUBLISHED" };

  await prisma.campaign.delete({ where: { id } });
  revalidatePath("/brand/campaigns");
  return { ok: true };
}

type ReviewGuardResult =
  | { ok: true; submission: { id: string; status: "PENDING" | "APPROVED" | "REJECTED" | "PAID" } }
  | { ok: false; error: "NOT_FOUND" | "NOT_YOURS" };

async function ensureCanReview(
  brandUserId: string,
  submissionId: string
): Promise<ReviewGuardResult> {
  const s = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { id: true, status: true, campaign: { select: { brandUserId: true } } }
  });
  if (!s) return { ok: false, error: "NOT_FOUND" };
  if (s.campaign.brandUserId !== brandUserId) return { ok: false, error: "NOT_YOURS" };
  return { ok: true, submission: { id: s.id, status: s.status } };
}

export async function approveSubmission(
  input: ApproveSubmissionValues
): Promise<ActionResult> {
  let profile;
  try {
    profile = await requireBrand();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  const parsed = approveSubmissionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID" };
  const v = parsed.data;

  const guard = await ensureCanReview(profile.id, v.submissionId);
  if (!guard.ok) return { ok: false, error: guard.error };
  if (guard.submission.status === "PAID") return { ok: false, error: "ALREADY_PAID" };

  await prisma.submission.update({
    where: { id: v.submissionId },
    data: {
      status: "APPROVED",
      viewsVerified: Number.parseInt(v.viewsVerified, 10),
      earningsCents: Number.parseInt(v.earningsCents, 10),
      rejectReason: null,
      notes: v.notes.trim() || null,
      reviewedById: profile.id,
      reviewedAt: new Date()
    }
  });

  revalidatePath("/brand");
  revalidatePath("/brand/submissions");
  revalidatePath("/creator/submissions");
  revalidatePath("/creator/earnings");
  return { ok: true };
}

export async function rejectSubmission(
  input: RejectSubmissionValues
): Promise<ActionResult> {
  let profile;
  try {
    profile = await requireBrand();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  const parsed = rejectSubmissionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID" };
  const v = parsed.data;

  const guard = await ensureCanReview(profile.id, v.submissionId);
  if (!guard.ok) return { ok: false, error: guard.error };
  if (guard.submission.status === "PAID") return { ok: false, error: "ALREADY_PAID" };

  await prisma.submission.update({
    where: { id: v.submissionId },
    data: {
      status: "REJECTED",
      rejectReason: v.reason.trim(),
      earningsCents: 0,
      viewsVerified: null,
      reviewedById: profile.id,
      reviewedAt: new Date()
    }
  });

  revalidatePath("/brand");
  revalidatePath("/brand/submissions");
  revalidatePath("/creator/submissions");
  return { ok: true };
}

export async function updateBrandProfile(
  input: BrandProfileFormValues
): Promise<ActionResult> {
  let profile;
  try {
    profile = await requireBrand();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  const parsed = brandProfileFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID" };
  const v = parsed.data;

  await prisma.$transaction([
    prisma.profile.update({
      where: { id: profile.id },
      data: { displayName: v.brandName.trim() }
    }),
    prisma.brandProfile.upsert({
      where: { userId: profile.id },
      create: {
        userId: profile.id,
        brandName: v.brandName.trim(),
        website: v.website.trim() || null,
        description: v.description.trim() || null
      },
      update: {
        brandName: v.brandName.trim(),
        website: v.website.trim() || null,
        description: v.description.trim() || null
      }
    })
  ]);

  revalidatePath("/brand");
  revalidatePath("/brand/profile");
  return { ok: true };
}
