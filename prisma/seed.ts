/**
 * Seeds the database from the original static dataset (data/campaigns.ts).
 * Idempotent: wipes and recreates everything. Run via `npx tsx prisma/seed.ts`
 * (or `npx prisma db seed`).
 */
import "dotenv/config";
import { prisma } from "../lib/db";
import {
  campaigns as gridCampaigns,
  featured as featuredCampaigns,
  heroCampaign,
  platformIcons,
  type Campaign as StaticCampaign,
  type Platform as PlatformSlug
} from "../data/campaigns";

const PLATFORM_LABELS: Record<PlatformSlug, string> = {
  tiktok: "TikTok",
  youtube: "YouTube",
  instagram: "Instagram",
  x: "X",
  twitch: "Twitch"
};
const PLATFORM_ORDER: PlatformSlug[] = ["tiktok", "youtube", "instagram", "x", "twitch"];

// Default badge label per category. A campaign keeps `categoryLabel` only when it
// differs from this (e.g. category "art" displayed as "Film").
const CATEGORY_LABELS: Record<string, string> = {
  ugc: "UGC",
  music: "Music",
  gaming: "Gaming",
  lifestyle: "Lifestyle",
  fashion: "Fashion",
  tech: "Tech",
  fitness: "Fitness",
  food: "Food",
  auto: "Auto",
  art: "Art"
};
const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS);

type Slot = "HERO" | "FEATURED" | "GRID";

async function main() {
  // --- wipe (children first; FKs cascade from Campaign anyway) ---
  await prisma.campaignPlacement.deleteMany();
  await prisma.campaignPlatform.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.platform.deleteMany();
  await prisma.category.deleteMany();

  // --- platforms ---
  const platformIdBySlug = new Map<string, string>();
  for (let i = 0; i < PLATFORM_ORDER.length; i++) {
    const slug = PLATFORM_ORDER[i];
    const p = await prisma.platform.create({
      data: { slug, label: PLATFORM_LABELS[slug], glyph: platformIcons[slug], sortOrder: i }
    });
    platformIdBySlug.set(slug, p.id);
  }

  // --- categories ---
  const categoryIdBySlug = new Map<string, string>();
  for (let i = 0; i < CATEGORY_ORDER.length; i++) {
    const slug = CATEGORY_ORDER[i];
    const c = await prisma.category.create({
      data: { slug, label: CATEGORY_LABELS[slug], sortOrder: i }
    });
    categoryIdBySlug.set(slug, c.id);
  }

  // --- campaigns ---
  const all: { c: StaticCampaign; slot: Slot; order: number }[] = [
    { c: heroCampaign, slot: "HERO", order: 0 },
    ...featuredCampaigns.map((c, i) => ({ c, slot: "FEATURED" as Slot, order: i })),
    ...gridCampaigns.map((c, i) => ({ c, slot: "GRID" as Slot, order: i }))
  ];

  for (const { c, slot, order } of all) {
    const categoryId = categoryIdBySlug.get(c.category);
    if (!categoryId) throw new Error(`Unknown category "${c.category}" on ${c.id}`);

    const defaultLabel = CATEGORY_LABELS[c.category];
    const categoryLabel = c.categoryLabel === defaultLabel ? null : c.categoryLabel;

    await prisma.campaign.create({
      data: {
        id: c.id,
        brand: c.brand,
        brandVerified: c.brandVerified,
        title: c.title,
        artTitle: c.artTitle ?? null,
        description: c.description,
        coverUrl: c.cover,
        categoryId,
        categoryLabel,
        raised: c.raised,
        budget: c.budget,
        participants: c.participants,
        rate: c.rate,
        launchedAt: new Date(Date.now() - c.ageDays * 86_400_000),
        hot: c.hot ?? false,
        status: "PUBLISHED",
        poweredBy: c.poweredBy ?? null,
        requirementsSteps: c.requirementsSteps ?? null,
        requirements: [],
        earnings: c.earnings ?? undefined,
        topEarners: undefined,
        resources: undefined,
        totalViews: c.totalViews ?? null,
        viewsSeries: [],
        placements: { create: [{ slot, sortOrder: order }] },
        platforms: {
          create: c.platforms.map((slug, i) => {
            const platformId = platformIdBySlug.get(slug);
            if (!platformId) throw new Error(`Unknown platform "${slug}" on ${c.id}`);
            return { platformId, order: i };
          })
        }
      }
    });
  }

  const [cats, plats, camps] = await Promise.all([
    prisma.category.count(),
    prisma.platform.count(),
    prisma.campaign.count()
  ]);
  console.log(`Seeded ${cats} categories, ${plats} platforms, ${camps} campaigns.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
