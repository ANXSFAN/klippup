"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fetchVideoMetrics } from "@/lib/platforms/metrics";
import { parseVideoUrl } from "@/lib/platforms/parse";
import {
  profileFormSchema,
  submissionFormSchema,
  type ProfileFormValues,
  type SubmissionFormValues
} from "@/lib/validators";

export type ActionResult<T = void> =
  | ({ ok: true } & (T extends void ? { id?: string } : T))
  | { ok: false; error: string };

async function requireCreator() {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("UNAUTHENTICATED");
  if (profile.role !== "CREATOR") throw new Error("NOT_A_CREATOR");
  return profile;
}

/**
 * Files a new submission against a PUBLISHED campaign. Validates that the
 * picked platform is actually allowed by the campaign — anything else would
 * pollute the brand's review queue with junk.
 */
export async function createSubmission(
  input: SubmissionFormValues
): Promise<ActionResult<{ id: string }>> {
  let profile;
  try {
    profile = await requireCreator();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const parsed = submissionFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID" };
  const v = parsed.data;

  const campaign = await prisma.campaign.findUnique({
    where: { id: v.campaignId },
    select: {
      id: true,
      status: true,
      platforms: { select: { platformId: true } }
    }
  });
  if (!campaign) return { ok: false, error: "CAMPAIGN_NOT_FOUND" };
  if (campaign.status !== "PUBLISHED") {
    return { ok: false, error: "CAMPAIGN_NOT_OPEN" };
  }
  const allowed = new Set(campaign.platforms.map((p) => p.platformId));
  if (!allowed.has(v.platformId)) {
    return { ok: false, error: "PLATFORM_NOT_ALLOWED" };
  }

  const { platformSlug, videoId } = parseVideoUrl(v.videoUrl);
  const viewsClaimed = v.viewsClaimed === "" ? null : Number.parseInt(v.viewsClaimed, 10);

  // Same campaign + same creator + same URL is almost certainly a mistake —
  // either a double-submit or an attempt to re-submit a rejected clip. We
  // also match case-insensitively to catch trailing-slash / casing variants.
  const existing = await prisma.submission.findFirst({
    where: {
      creatorId: profile.id,
      campaignId: v.campaignId,
      videoUrl: { equals: v.videoUrl.trim(), mode: "insensitive" }
    },
    select: { id: true }
  });
  if (existing) return { ok: false, error: "DUPLICATE" };

  // Best-effort: fetch public metrics so the brand's review queue already has
  // a title/thumbnail (and a verified view count for YouTube) on first load.
  // Bounded by the fetcher's internal 3s timeout; a null result is fine.
  const metrics = platformSlug
    ? await fetchVideoMetrics(platformSlug, videoId ?? "", v.videoUrl)
    : null;

  const created = await prisma.submission.create({
    data: {
      creatorId: profile.id,
      campaignId: v.campaignId,
      platformId: v.platformId,
      videoUrl: v.videoUrl,
      videoId,
      viewsClaimed,
      screenshotUrl: v.screenshotUrl.trim() || null,
      apiData: metrics ? (metrics as unknown as Prisma.InputJsonValue) : Prisma.DbNull
    },
    select: { id: true }
  });

  revalidatePath("/creator");
  revalidatePath("/creator/campaigns");
  revalidatePath(`/creator/campaigns/${v.campaignId}`);
  revalidatePath("/creator/submissions");
  revalidatePath("/creator/earnings");
  return { ok: true, id: created.id };
}

/**
 * Updates the creator's profile (display name + social handles + payout).
 * Splits into two upserts so the form can update either piece independently
 * if we want later, but for v1 the form posts the whole thing.
 */
export async function updateCreatorProfile(
  input: ProfileFormValues
): Promise<ActionResult> {
  let profile;
  try {
    profile = await requireCreator();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const parsed = profileFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID" };
  const v = parsed.data;

  const socials = trimSocials(v.socials);
  const socialsValue =
    Object.keys(socials).length === 0 ? Prisma.DbNull : (socials as Prisma.InputJsonValue);
  const payoutValue: Prisma.InputJsonValue | typeof Prisma.DbNull =
    v.payout.method && v.payout.details.trim()
      ? ({ method: v.payout.method, details: v.payout.details.trim() } as Prisma.InputJsonValue)
      : Prisma.DbNull;

  await prisma.$transaction([
    prisma.profile.update({
      where: { id: profile.id },
      data: { displayName: v.displayName.trim() }
    }),
    prisma.creatorProfile.upsert({
      where: { userId: profile.id },
      create: {
        userId: profile.id,
        socials: socialsValue,
        payoutInfo: payoutValue
      },
      update: {
        socials: socialsValue,
        payoutInfo: payoutValue
      }
    })
  ]);

  revalidatePath("/creator");
  revalidatePath("/creator/profile");
  return { ok: true };
}

function trimSocials(socials: Record<string, string>) {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(socials)) {
    const v = value.trim();
    if (v) out[key] = v;
  }
  return out;
}
