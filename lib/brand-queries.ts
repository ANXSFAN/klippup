import { prisma } from "./db";
import type {
  BrandCampaignEditData,
  BrandCampaignInsights,
  BrandCampaignRow,
  BrandCampaignStats,
  BrandDashboardStats,
  BrandProfileData,
  BrandSubmissionRow,
  CampaignEarnings,
  CampaignStatus,
  SubmissionApiData,
  SubmissionStatus
} from "./types";

/**
 * All numbers a brand needs to glance at on /brand. Campaign counts are
 * filtered to ones owned by this brand; submission counts are joined through
 * campaigns so we never count submissions on campaigns we don't own.
 */
export async function getBrandDashboardStats(
  brandUserId: string
): Promise<BrandDashboardStats> {
  const [
    campaigns,
    drafts,
    published,
    pendingSubmissions,
    approvedSubmissions,
    totalSubmissions
  ] = await Promise.all([
    prisma.campaign.count({ where: { brandUserId } }),
    prisma.campaign.count({ where: { brandUserId, status: "DRAFT" } }),
    prisma.campaign.count({ where: { brandUserId, status: "PUBLISHED" } }),
    prisma.submission.count({
      where: { campaign: { brandUserId }, status: "PENDING" }
    }),
    prisma.submission.count({
      where: { campaign: { brandUserId }, status: "APPROVED" }
    }),
    prisma.submission.count({ where: { campaign: { brandUserId } } })
  ]);

  return {
    campaigns,
    drafts,
    published,
    pendingSubmissions,
    approvedSubmissions,
    totalSubmissions
  };
}

/** Brand's own campaigns, with per-campaign pending counts for quick triage. */
export async function listBrandCampaigns(
  brandUserId: string
): Promise<BrandCampaignRow[]> {
  const rows = await prisma.campaign.findMany({
    where: { brandUserId },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      _count: { select: { submissions: true } },
      submissions: { where: { status: "PENDING" }, select: { id: true } }
    }
  });

  return rows.map((c) => ({
    id: c.id,
    title: c.title,
    cover: c.coverUrl,
    categoryLabel: c.categoryLabel ?? c.category.label,
    status: c.status as CampaignStatus,
    raised: c.raised,
    budget: c.budget,
    pendingCount: c.submissions.length,
    submissionCount: c._count.submissions,
    createdAt: c.createdAt
  }));
}

/** Strict ownership check: only return data if `brandUserId` owns the campaign. */
export async function getBrandCampaignForEdit(
  brandUserId: string,
  campaignId: string
): Promise<BrandCampaignEditData | null> {
  const c = await prisma.campaign.findFirst({
    where: { id: campaignId, brandUserId },
    include: { platforms: { orderBy: { order: "asc" } } }
  });
  if (!c) return null;

  const blank = { rate: "", min: "", max: "" };
  const e = (c.earnings as CampaignEarnings | null) ?? {};

  return {
    id: c.id,
    title: c.title,
    artTitle: c.artTitle ?? "",
    description: c.description,
    coverUrl: c.coverUrl,
    categoryId: c.categoryId,
    categoryLabel: c.categoryLabel ?? "",
    platformIds: c.platforms.map((p) => p.platformId),
    budget: String(c.budget),
    participants: String(c.participants),
    rate: c.rate,
    launchedAt: c.launchedAt.toISOString().slice(0, 10),
    poweredBy: c.poweredBy ?? "",
    requirements: c.requirements.map((value) => ({ value })),
    earnings: {
      tiktok: { ...blank, ...(e.tiktok ?? {}) },
      youtube: { ...blank, ...(e.youtube ?? {}) },
      instagram: { ...blank, ...(e.instagram ?? {}) }
    },
    status: c.status as CampaignStatus
  };
}

/**
 * Submissions across all campaigns owned by `brandUserId`. Joined to surface
 * creator + platform info we render in the review table.
 */
export async function listBrandSubmissions(
  brandUserId: string,
  options?: { campaignId?: string }
): Promise<BrandSubmissionRow[]> {
  const rows = await prisma.submission.findMany({
    where: {
      campaign: { brandUserId },
      ...(options?.campaignId ? { campaignId: options.campaignId } : {})
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      campaign: { select: { id: true, title: true, coverUrl: true } },
      creator: { select: { id: true, displayName: true, email: true } },
      platform: { select: { slug: true, label: true, glyph: true } }
    }
  });

  return rows.map((s) => ({
    id: s.id,
    campaignId: s.campaignId,
    campaignTitle: s.campaign.title,
    campaignCover: s.campaign.coverUrl,
    creatorId: s.creatorId,
    creatorName: s.creator.displayName,
    creatorEmail: s.creator.email,
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
    reviewedAt: s.reviewedAt,
    createdAt: s.createdAt,
    screenshotUrl: s.screenshotUrl,
    apiData: (s.apiData as SubmissionApiData | null) ?? null
  }));
}

/**
 * Per-campaign KPIs for the brand portal's review page. Verifies ownership
 * via `brandUserId` so brands can't peek at each other's stats.
 */
export async function getBrandCampaignStats(
  brandUserId: string,
  campaignId: string
): Promise<BrandCampaignStats | null> {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brandUserId },
    select: { id: true, budget: true }
  });
  if (!campaign) return null;

  const [pending, approved, paid, agg] = await Promise.all([
    prisma.submission.count({ where: { campaignId, status: "PENDING" } }),
    prisma.submission.count({ where: { campaignId, status: "APPROVED" } }),
    prisma.submission.count({ where: { campaignId, status: "PAID" } }),
    prisma.submission.groupBy({
      by: ["status"],
      where: { campaignId, status: { in: ["APPROVED", "PAID"] } },
      _sum: { earningsCents: true }
    })
  ]);

  let approvedCents = 0;
  let paidCents = 0;
  for (const g of agg) {
    if (g.status === "APPROVED") approvedCents = g._sum.earningsCents ?? 0;
    else if (g.status === "PAID") paidCents = g._sum.earningsCents ?? 0;
  }

  const budgetCents = campaign.budget * 100;
  const remainingCents = Math.max(0, budgetCents - (approvedCents + paidCents));

  return {
    total: pending + approved + paid,
    pending,
    approved,
    paid,
    approvedCents,
    paidCents,
    budgetCents,
    remainingCents
  };
}

/**
 * Aggregated insights for a single campaign: funnel, 14-day verified-views
 * trend, platform mix, and top creators. Ownership-checked.
 */
export async function getCampaignInsights(
  brandUserId: string,
  campaignId: string
): Promise<BrandCampaignInsights | null> {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brandUserId },
    select: { id: true, title: true }
  });
  if (!campaign) return null;

  const [funnelGroups, recent, platformGroups, topCreatorGroups] = await Promise.all([
    prisma.submission.groupBy({
      by: ["status"],
      where: { campaignId },
      _count: { _all: true }
    }),
    prisma.submission.findMany({
      where: {
        campaignId,
        status: { in: ["APPROVED", "PAID"] },
        viewsVerified: { not: null }
      },
      select: { reviewedAt: true, createdAt: true, viewsVerified: true }
    }),
    prisma.submission.groupBy({
      by: ["platformId"],
      where: { campaignId },
      _count: { _all: true }
    }),
    prisma.submission.groupBy({
      by: ["creatorId"],
      where: { campaignId, status: { in: ["APPROVED", "PAID"] } },
      _sum: { earningsCents: true, viewsVerified: true },
      _count: { _all: true }
    })
  ]);

  const [platforms, creators] = await Promise.all([
    prisma.platform.findMany({
      where: { id: { in: platformGroups.map((g) => g.platformId) } },
      select: { id: true, slug: true, label: true }
    }),
    prisma.profile.findMany({
      where: { id: { in: topCreatorGroups.map((g) => g.creatorId) } },
      select: { id: true, displayName: true }
    })
  ]);
  const platformDict = new Map(platforms.map((p) => [p.id, p]));
  const creatorDict = new Map(creators.map((c) => [c.id, c]));

  const funnel = { pending: 0, approved: 0, paid: 0, rejected: 0 };
  for (const g of funnelGroups) {
    if (g.status === "PENDING") funnel.pending = g._count._all;
    else if (g.status === "APPROVED") funnel.approved = g._count._all;
    else if (g.status === "PAID") funnel.paid = g._count._all;
    else if (g.status === "REJECTED") funnel.rejected = g._count._all;
  }

  // 14-day buckets keyed by YYYY-MM-DD, oldest first
  const days = 14;
  const buckets: { key: string; value: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.push({ key: d.toISOString().slice(0, 10), value: 0 });
  }
  const bucketByKey = new Map(buckets.map((b) => [b.key, b]));
  for (const s of recent) {
    if (s.viewsVerified == null) continue;
    const ref = s.reviewedAt ?? s.createdAt;
    const key = ref.toISOString().slice(0, 10);
    const b = bucketByKey.get(key);
    if (b) b.value += s.viewsVerified;
  }
  const trend = buckets.map((b) => ({ key: b.key, label: b.key.slice(5), value: b.value }));

  const byPlatform = platformGroups
    .map((g) => {
      const p = platformDict.get(g.platformId);
      return {
        key: p?.slug ?? g.platformId,
        label: p?.label ?? "—",
        value: g._count._all
      };
    })
    .sort((a, b) => b.value - a.value);

  const topCreators = topCreatorGroups
    .map((g) => ({
      id: g.creatorId,
      name: creatorDict.get(g.creatorId)?.displayName ?? "—",
      submissions: g._count._all,
      viewsVerified: g._sum.viewsVerified ?? 0,
      earningsCents: g._sum.earningsCents ?? 0
    }))
    .sort((a, b) => b.earningsCents - a.earningsCents)
    .slice(0, 10);

  return {
    campaignTitle: campaign.title,
    funnel,
    trend,
    byPlatform,
    topCreators
  };
}

export async function getBrandProfile(
  brandUserId: string
): Promise<BrandProfileData | null> {
  const profile = await prisma.profile.findUnique({
    where: { id: brandUserId },
    include: { brand: true }
  });
  if (!profile) return null;

  const taxIdType = profile.brand?.taxIdType;
  const validTaxIdType: BrandProfileData["billing"]["taxIdType"] =
    taxIdType === "NIF" || taxIdType === "CIF" || taxIdType === "VAT" || taxIdType === "OTHER"
      ? taxIdType
      : "";

  return {
    id: profile.id,
    email: profile.email,
    brandName: profile.brand?.brandName ?? profile.displayName,
    website: profile.brand?.website ?? "",
    description: profile.brand?.description ?? "",
    verified: profile.brand?.verified ?? false,
    billing: {
      legalName: profile.brand?.legalName ?? "",
      taxIdType: validTaxIdType,
      taxId: profile.brand?.taxId ?? "",
      country: profile.brand?.country ?? "ES",
      address: parseAddress(profile.brand?.address),
      billingEmail: profile.brand?.billingEmail ?? ""
    }
  };
}

function parseAddress(raw: unknown): BrandProfileData["billing"]["address"] {
  if (!raw || typeof raw !== "object") {
    return { street: "", city: "", postalCode: "", region: "" };
  }
  const o = raw as Record<string, unknown>;
  const stringOr = (v: unknown, f: string) => (typeof v === "string" ? v : f);
  return {
    street: stringOr(o.street, ""),
    city: stringOr(o.city, ""),
    postalCode: stringOr(o.postalCode, ""),
    region: stringOr(o.region, "")
  };
}
