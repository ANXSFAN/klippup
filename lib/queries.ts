import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "./db";
import type { CampaignEditData } from "./validators";
import type {
  AdminCampaignRow,
  AdminCategoryRow,
  AdminPlatformRow,
  CampaignEarnings,
  CampaignResource,
  CampaignStatus,
  CampaignView,
  ChartPoint,
  DashboardCharts,
  DashboardStats,
  DiscoverFacets,
  DiscoverPage,
  FormOptions,
  PlacementSlot,
  PlatformSlug,
  SearchCampaignsResult,
  SearchFilters,
  TopEarner
} from "./types";

const DAY_MS = 86_400_000;

type CampaignWithRelations = Prisma.CampaignGetPayload<{
  include: {
    category: true;
    platforms: { include: { platform: true } };
  };
}>;

function toView(c: CampaignWithRelations): CampaignView {
  const platforms = [...c.platforms]
    .sort((a, b) => a.order - b.order)
    .map((p) => p.platform.slug as PlatformSlug);

  return {
    id: c.id,
    brand: c.brand,
    brandVerified: c.brandVerified,
    title: c.title,
    artTitle: c.artTitle,
    cover: c.coverUrl,
    description: c.description,
    category: c.category.slug,
    categoryLabel: c.categoryLabel ?? c.category.label,
    platforms,
    raised: c.raised,
    budget: c.budget,
    participants: c.participants,
    rate: c.rate,
    ageDays: Math.max(0, Math.round((Date.now() - c.launchedAt.getTime()) / DAY_MS)),
    hot: c.hot,
    poweredBy: c.poweredBy,
    requirementsSteps: c.requirementsSteps,
    requirements: c.requirements,
    earnings: (c.earnings as CampaignEarnings | null) ?? null,
    topEarners: (c.topEarners as TopEarner[] | null) ?? [],
    resources: (c.resources as CampaignResource[] | null) ?? [],
    totalViews: c.totalViews,
    viewsSeries: c.viewsSeries
  };
}

/**
 * Loads everything the home page renders, grouped by placement slot and ordered
 * by each slot's sortOrder. Only PUBLISHED campaigns are included.
 */
export async function getDiscoverPage(): Promise<DiscoverPage> {
  const placements = await prisma.campaignPlacement.findMany({
    where: { campaign: { status: "PUBLISHED" } },
    orderBy: [{ slot: "asc" }, { sortOrder: "asc" }],
    include: {
      campaign: {
        include: {
          category: true,
          platforms: { include: { platform: true }, orderBy: { order: "asc" } }
        }
      }
    }
  });

  const page: DiscoverPage = { hero: [], featured: [], grid: [] };
  for (const p of placements) {
    const view = toView(p.campaign);
    if (p.slot === "HERO") page.hero.push(view);
    else if (p.slot === "FEATURED") page.featured.push(view);
    else page.grid.push(view);
  }
  return page;
}

/**
 * Filter chips / dropdowns on the public Discover page. Pre-loaded once per
 * request so client SearchBar doesn't have to fetch.
 */
export async function getDiscoverFacets(): Promise<DiscoverFacets> {
  const [categories, platforms, totalPublished] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
      select: { slug: true, label: true }
    }),
    prisma.platform.findMany({
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
      select: { slug: true, label: true, glyph: true }
    }),
    prisma.campaign.count({ where: { status: "PUBLISHED" } })
  ]);
  return { categories, platforms, totalPublished };
}

/**
 * Loads one PUBLISHED campaign for the public /campaigns/[id] page. Returns
 * null for missing or non-published campaigns — the page will call notFound().
 *
 * Overrides topEarners with real submission data (APPROVED/PAID by
 * viewsVerified desc, top 3) when available; falls back to the admin-edited
 * Campaign.topEarners JSON, then to a localized mock in the UI.
 */
export async function getCampaignDetail(id: string): Promise<CampaignView | null> {
  const [c, earners] = await Promise.all([
    prisma.campaign.findFirst({
      where: { id, status: "PUBLISHED" },
      include: {
        category: true,
        platforms: { include: { platform: true }, orderBy: { order: "asc" } }
      }
    }),
    prisma.submission.findMany({
      where: {
        campaignId: id,
        status: { in: ["APPROVED", "PAID"] },
        viewsVerified: { gt: 0 }
      },
      orderBy: { viewsVerified: "desc" },
      take: 3,
      select: {
        viewsVerified: true,
        creator: { select: { displayName: true } }
      }
    })
  ]);
  if (!c) return null;
  const view = toView(c);
  if (earners.length > 0) {
    view.topEarners = earners.map((s) => ({
      views: s.viewsVerified ?? 0,
      name: s.creator.displayName
    }));
  }
  return view;
}

/**
 * Full-text-ish search over PUBLISHED campaigns. Matches q against title /
 * description / brand (case-insensitive contains), filters by category slug
 * and/or platform slug. Returns view-models ready for cards.
 */
export async function searchCampaigns(
  filters: SearchFilters
): Promise<SearchCampaignsResult> {
  const where: Prisma.CampaignWhereInput = { status: "PUBLISHED" };
  const q = filters.q?.trim();
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { brand: { contains: q, mode: "insensitive" } }
    ];
  }
  if (filters.categorySlug) {
    where.category = { slug: filters.categorySlug };
  }
  if (filters.platformSlug) {
    where.platforms = { some: { platform: { slug: filters.platformSlug } } };
  }

  const [rows, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      orderBy: [{ launchedAt: "desc" }, { createdAt: "desc" }],
      include: {
        category: true,
        platforms: { include: { platform: true }, orderBy: { order: "asc" } }
      }
    }),
    prisma.campaign.count({ where })
  ]);

  return { items: rows.map(toView), total };
}

/** Every campaign, for the admin list table (no status filter). */
export async function getAdminCampaigns(): Promise<AdminCampaignRow[]> {
  const rows = await prisma.campaign.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      category: true,
      platforms: { include: { platform: true }, orderBy: { order: "asc" } },
      placements: { orderBy: { slot: "asc" } },
      brandUser: { select: { displayName: true } }
    }
  });

  return rows.map((c) => ({
    id: c.id,
    title: c.title,
    brand: c.brand,
    coverUrl: c.coverUrl,
    categoryLabel: c.categoryLabel ?? c.category.label,
    platformGlyphs: c.platforms.map((p) => p.platform.glyph),
    placements: c.placements.map((p) => p.slot as PlacementSlot),
    raised: c.raised,
    budget: c.budget,
    participants: c.participants,
    status: c.status as CampaignStatus,
    brandOwnerName: c.brandUser?.displayName ?? null
  }));
}

/** Aggregate counts shown on the admin dashboard. */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [campaigns, published, drafts, archived, categories, platforms, agg] =
    await Promise.all([
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: "PUBLISHED" } }),
      prisma.campaign.count({ where: { status: "DRAFT" } }),
      prisma.campaign.count({ where: { status: "ARCHIVED" } }),
      prisma.category.count(),
      prisma.platform.count(),
      prisma.campaign.aggregate({ _sum: { budget: true } })
    ]);

  return {
    campaigns,
    published,
    drafts,
    archived,
    categories,
    platforms,
    totalBudget: agg._sum.budget ?? 0
  };
}

/** Categories with a usage count, for the admin categories table. */
export async function getAdminCategories(): Promise<AdminCategoryRow[]> {
  const rows = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    include: { _count: { select: { campaigns: true } } }
  });
  return rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    label: c.label,
    sortOrder: c.sortOrder,
    campaignCount: c._count.campaigns
  }));
}

/** Platforms with a usage count, for the admin platforms table. */
export async function getAdminPlatforms(): Promise<AdminPlatformRow[]> {
  const rows = await prisma.platform.findMany({
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    include: { _count: { select: { campaigns: true } } }
  });
  return rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    label: p.label,
    glyph: p.glyph,
    sortOrder: p.sortOrder,
    campaignCount: p._count.campaigns
  }));
}

/**
 * Chart series for the admin dashboard. `byMonth` is bucketed in JS rather than
 * via raw SQL — fine at v1 volumes (≤ a few hundred campaigns).
 */
export async function getDashboardCharts(): Promise<DashboardCharts> {
  const [categoryGroups, platformGroups, statusGroups, campaigns] = await Promise.all([
    prisma.campaign.groupBy({ by: ["categoryId"], _count: { _all: true } }),
    prisma.campaignPlatform.groupBy({ by: ["platformId"], _count: { _all: true } }),
    prisma.campaign.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.campaign.findMany({ select: { createdAt: true } })
  ]);

  const [categories, platforms] = await Promise.all([
    prisma.category.findMany({ select: { id: true, slug: true, label: true } }),
    prisma.platform.findMany({ select: { id: true, slug: true, label: true } })
  ]);
  const catById = new Map(categories.map((c) => [c.id, c]));
  const platById = new Map(platforms.map((p) => [p.id, p]));

  const byCategory: ChartPoint[] = categoryGroups
    .map((g) => {
      const c = catById.get(g.categoryId);
      return {
        label: c?.label ?? g.categoryId,
        key: c?.slug ?? g.categoryId,
        value: g._count._all
      };
    })
    .sort((a, b) => b.value - a.value);

  const byPlatform: ChartPoint[] = platformGroups
    .map((g) => {
      const p = platById.get(g.platformId);
      return {
        label: p?.label ?? g.platformId,
        key: p?.slug ?? g.platformId,
        value: g._count._all
      };
    })
    .sort((a, b) => b.value - a.value);

  const statusOrder: CampaignStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];
  const statusMap = new Map(statusGroups.map((g) => [g.status, g._count._all]));
  const byStatus: ChartPoint[] = statusOrder.map((s) => ({
    label: s,
    key: s,
    value: statusMap.get(s) ?? 0
  }));

  // Last 6 calendar months including current, oldest first.
  const now = new Date();
  const buckets: ChartPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.push({ label: key, key, value: 0 });
  }
  const indexByKey = new Map(buckets.map((b, i) => [b.key, i]));
  for (const c of campaigns) {
    const k = `${c.createdAt.getFullYear()}-${String(c.createdAt.getMonth() + 1).padStart(2, "0")}`;
    const idx = indexByKey.get(k);
    if (idx !== undefined) buckets[idx].value += 1;
  }

  return { byCategory, byPlatform, byStatus, byMonth: buckets };
}

/** Categories + platforms for the campaign form's selectors. */
export async function getFormOptions(): Promise<FormOptions> {
  const [categories, platforms] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, slug: true, label: true }
    }),
    prisma.platform.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, slug: true, label: true, glyph: true }
    })
  ]);
  return { categories, platforms };
}

/** Loads one campaign in the shape the edit form expects (everything stringified). */
export async function getCampaignForEdit(id: string): Promise<CampaignEditData | null> {
  const c = await prisma.campaign.findUnique({
    where: { id },
    include: {
      platforms: { orderBy: { order: "asc" } },
      placements: { orderBy: { sortOrder: "asc" } }
    }
  });
  if (!c) return null;

  const blank = { rate: "", min: "", max: "" };
  const e = (c.earnings as CampaignEarnings | null) ?? {};
  const topEarners = (c.topEarners as TopEarner[] | null) ?? [];
  const resources = (c.resources as CampaignResource[] | null) ?? [];

  return {
    id: c.id,
    brand: c.brand,
    brandVerified: c.brandVerified,
    title: c.title,
    artTitle: c.artTitle ?? "",
    description: c.description,
    coverUrl: c.coverUrl,
    categoryId: c.categoryId,
    categoryLabel: c.categoryLabel ?? "",
    platformIds: c.platforms.map((p) => p.platformId),
    placements: c.placements.map((p) => p.slot as PlacementSlot),
    raised: String(c.raised),
    budget: String(c.budget),
    participants: String(c.participants),
    rate: c.rate,
    launchedAt: c.launchedAt.toISOString().slice(0, 10),
    hot: c.hot,
    status: c.status as CampaignStatus,
    poweredBy: c.poweredBy ?? "",
    requirements: c.requirements.map((value) => ({ value })),
    earnings: {
      tiktok: { ...blank, ...(e.tiktok ?? {}) },
      youtube: { ...blank, ...(e.youtube ?? {}) },
      instagram: { ...blank, ...(e.instagram ?? {}) }
    },
    topEarners: topEarners.map((t) => ({ views: String(t.views), name: t.name })),
    resources: resources.map((r) => ({
      name: r.name,
      subtitle: r.subtitle ?? "",
      kind: r.kind === "drive" ? "drive" : "link",
      url: r.url ?? ""
    })),
    totalViews: c.totalViews ?? "",
    viewsSeries: c.viewsSeries.join(", ")
  };
}
