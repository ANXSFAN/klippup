import { prisma } from "./db";
import type {
  CreatorPublicProfile,
  CreatorPublicSubmission,
  SubmissionStatus
} from "./types";

const SOCIAL_KEYS = ["tiktok", "youtube", "instagram", "x", "twitch"] as const;

function readSocial(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/**
 * Public-facing creator profile fetched at /creators/[id]. Combines Profile
 * basics, CreatorProfile.socials JSON, a PAID earnings rollup, and the most
 * recent APPROVED/PAID submissions on PUBLISHED campaigns.
 *
 * Email is deliberately omitted — public pages never leak it.
 */
export async function getCreatorPublicProfile(
  id: string
): Promise<CreatorPublicProfile | null> {
  const profile = await prisma.profile.findUnique({
    where: { id },
    include: { creator: true }
  });
  if (!profile || profile.role !== "CREATOR") return null;

  const socialsJson = (profile.creator?.socials ?? {}) as Record<string, unknown>;
  const socials = Object.fromEntries(
    SOCIAL_KEYS.map((k) => [k, readSocial(socialsJson[k])])
  ) as CreatorPublicProfile["socials"];

  const [paidAgg, approvedCount, recent] = await Promise.all([
    prisma.submission.aggregate({
      where: { creatorId: id, status: "PAID" },
      _sum: { earningsCents: true }
    }),
    prisma.submission.count({
      where: { creatorId: id, status: { in: ["APPROVED", "PAID"] } }
    }),
    prisma.submission.findMany({
      where: {
        creatorId: id,
        status: { in: ["APPROVED", "PAID"] },
        campaign: { status: "PUBLISHED" }
      },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: {
        campaign: { select: { id: true, title: true, coverUrl: true } },
        platform: { select: { label: true, glyph: true } }
      }
    })
  ]);

  const recentSubmissions: CreatorPublicSubmission[] = recent.map((s) => ({
    id: s.id,
    campaignId: s.campaignId,
    campaignTitle: s.campaign.title,
    campaignCover: s.campaign.coverUrl,
    platformLabel: s.platform.label,
    platformGlyph: s.platform.glyph,
    videoUrl: s.videoUrl,
    viewsVerified: s.viewsVerified,
    status: s.status as SubmissionStatus,
    createdAt: s.createdAt
  }));

  return {
    id: profile.id,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    joinedAt: profile.createdAt,
    socials,
    totalEarnedCents: paidAgg._sum.earningsCents ?? 0,
    approvedCount,
    recentSubmissions
  };
}
