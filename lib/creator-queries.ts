import { prisma } from "./db";
import type {
  CampaignEarnings,
  CreatorCampaignCard,
  CreatorCampaignDetail,
  CreatorEarningsSummary,
  CreatorProfileData,
  CreatorSubmissionRow,
  SubmissionStatus
} from "./types";

/**
 * PUBLISHED campaigns for the creator browse grid, each annotated with how
 * many submissions THIS creator already filed against it.
 */
export async function listCreatorCampaigns(
  creatorId: string
): Promise<CreatorCampaignCard[]> {
  const [campaigns, mineGroups] = await Promise.all([
    prisma.campaign.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { launchedAt: "desc" },
      include: {
        category: true,
        platforms: { include: { platform: true }, orderBy: { order: "asc" } }
      }
    }),
    prisma.submission.groupBy({
      by: ["campaignId"],
      where: { creatorId },
      _count: { _all: true }
    })
  ]);

  const myCountByCampaign = new Map(
    mineGroups.map((g) => [g.campaignId, g._count._all])
  );

  return campaigns.map((c) => ({
    id: c.id,
    brand: c.brand,
    title: c.title,
    cover: c.coverUrl,
    rate: c.rate,
    raised: c.raised,
    budget: c.budget,
    categoryLabel: c.categoryLabel ?? c.category.label,
    platformGlyphs: c.platforms.map((p) => p.platform.glyph),
    mySubmissionCount: myCountByCampaign.get(c.id) ?? 0
  }));
}

function mapSubmissionRow(s: {
  id: string;
  campaignId: string;
  campaign: { title: string; coverUrl: string };
  platform: { slug: string; label: string; glyph: string };
  videoUrl: string;
  videoId: string | null;
  status: SubmissionStatus;
  viewsClaimed: number | null;
  viewsVerified: number | null;
  earningsCents: number;
  rejectReason: string | null;
  createdAt: Date;
}): CreatorSubmissionRow {
  return {
    id: s.id,
    campaignId: s.campaignId,
    campaignTitle: s.campaign.title,
    campaignCover: s.campaign.coverUrl,
    platformSlug: s.platform.slug,
    platformGlyph: s.platform.glyph,
    platformLabel: s.platform.label,
    videoUrl: s.videoUrl,
    videoId: s.videoId,
    status: s.status as SubmissionStatus,
    viewsClaimed: s.viewsClaimed,
    viewsVerified: s.viewsVerified,
    earningsCents: s.earningsCents,
    rejectReason: s.rejectReason,
    createdAt: s.createdAt
  };
}

export async function getCreatorCampaignDetail(
  creatorId: string,
  campaignId: string
): Promise<CreatorCampaignDetail | null> {
  const c = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      category: true,
      platforms: { include: { platform: true }, orderBy: { order: "asc" } }
    }
  });
  if (!c || c.status !== "PUBLISHED") return null;

  const submissions = await prisma.submission.findMany({
    where: { creatorId, campaignId },
    orderBy: { createdAt: "desc" },
    include: {
      campaign: { select: { title: true, coverUrl: true } },
      platform: { select: { slug: true, label: true, glyph: true } }
    }
  });

  return {
    id: c.id,
    brand: c.brand,
    title: c.title,
    artTitle: c.artTitle,
    description: c.description,
    cover: c.coverUrl,
    categoryLabel: c.categoryLabel ?? c.category.label,
    rate: c.rate,
    raised: c.raised,
    budget: c.budget,
    participants: c.participants,
    requirements: c.requirements,
    earnings: (c.earnings as CampaignEarnings | null) ?? null,
    platforms: c.platforms.map((p) => ({
      id: p.platform.id,
      slug: p.platform.slug,
      label: p.platform.label,
      glyph: p.platform.glyph
    })),
    mySubmissions: submissions.map((s) =>
      mapSubmissionRow({ ...s, status: s.status as SubmissionStatus })
    )
  };
}

export async function listCreatorSubmissions(
  creatorId: string
): Promise<CreatorSubmissionRow[]> {
  const rows = await prisma.submission.findMany({
    where: { creatorId },
    orderBy: { createdAt: "desc" },
    include: {
      campaign: { select: { title: true, coverUrl: true } },
      platform: { select: { slug: true, label: true, glyph: true } }
    }
  });
  return rows.map((s) => mapSubmissionRow({ ...s, status: s.status as SubmissionStatus }));
}

export async function getCreatorEarnings(creatorId: string): Promise<{
  summary: CreatorEarningsSummary;
  earningSubmissions: CreatorSubmissionRow[];
}> {
  const [paid, approved, pending, earningRows] = await Promise.all([
    prisma.submission.aggregate({
      where: { creatorId, status: "PAID" },
      _sum: { earningsCents: true }
    }),
    prisma.submission.aggregate({
      where: { creatorId, status: "APPROVED" },
      _sum: { earningsCents: true }
    }),
    prisma.submission.count({
      where: { creatorId, status: "PENDING" }
    }),
    prisma.submission.findMany({
      where: { creatorId, status: { in: ["APPROVED", "PAID"] } },
      orderBy: { reviewedAt: "desc" },
      include: {
        campaign: { select: { title: true, coverUrl: true } },
        platform: { select: { slug: true, label: true, glyph: true } }
      }
    })
  ]);

  return {
    summary: {
      totalEarnedCents: paid._sum.earningsCents ?? 0,
      approvedUnpaidCents: approved._sum.earningsCents ?? 0,
      pendingCount: pending
    },
    earningSubmissions: earningRows.map((s) =>
      mapSubmissionRow({ ...s, status: s.status as SubmissionStatus })
    )
  };
}

export async function getCreatorProfile(
  creatorId: string
): Promise<CreatorProfileData | null> {
  const profile = await prisma.profile.findUnique({
    where: { id: creatorId },
    include: { creator: true }
  });
  if (!profile) return null;

  const socials = (profile.creator?.socials ?? {}) as Record<string, unknown>;
  const payoutInfo = (profile.creator?.payoutInfo ?? {}) as Record<string, unknown>;
  const method = typeof payoutInfo.method === "string" ? payoutInfo.method : "";
  const validMethod: "paypal" | "bank" | "other" | "" =
    method === "paypal" || method === "bank" || method === "other" ? method : "";

  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    socials: {
      tiktok: stringOr(socials.tiktok, ""),
      youtube: stringOr(socials.youtube, ""),
      instagram: stringOr(socials.instagram, ""),
      x: stringOr(socials.x, ""),
      twitch: stringOr(socials.twitch, "")
    },
    payout: {
      method: validMethod,
      details: stringOr(payoutInfo.details, "")
    }
  };
}

function stringOr(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}
