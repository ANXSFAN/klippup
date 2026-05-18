import "dotenv/config";
import { Prisma } from "../app/generated/prisma/client";
import { prisma } from "../lib/db";

/**
 * Idempotent: seeds ~8 submissions for creator@test.klippup.local spread across
 * the first few PUBLISHED campaigns and platforms, with a mix of statuses so
 * the creator dashboard / submission list / earnings page all have content.
 *
 * Strategy: deterministic videoUrls keyed by (campaignId, platformId, index),
 * so re-running the script upserts the same set instead of duplicating.
 */

const CREATOR_EMAIL = "creator@test.klippup.local";

interface PlannedSubmission {
  campaignIndex: number; // index into the campaigns array
  platformIndex: number; // index into that campaign's platforms
  status: "PENDING" | "APPROVED" | "PAID";
  viewsClaimed: number;
  viewsVerified?: number;
  earningsCents?: number;
}

// Spread across 5 different campaigns; 3 PENDING + 3 APPROVED + 2 PAID.
const PLAN: PlannedSubmission[] = [
  { campaignIndex: 0, platformIndex: 0, status: "PENDING", viewsClaimed: 12_000 },
  { campaignIndex: 0, platformIndex: 0, status: "APPROVED", viewsClaimed: 48_000, viewsVerified: 45_300, earningsCents: 4530 },
  { campaignIndex: 1, platformIndex: 0, status: "PAID", viewsClaimed: 180_000, viewsVerified: 178_900, earningsCents: 17_890 },
  { campaignIndex: 2, platformIndex: 0, status: "PENDING", viewsClaimed: 5_500 },
  { campaignIndex: 2, platformIndex: 0, status: "APPROVED", viewsClaimed: 88_000, viewsVerified: 82_100, earningsCents: 8210 },
  { campaignIndex: 3, platformIndex: 0, status: "PAID", viewsClaimed: 320_000, viewsVerified: 315_400, earningsCents: 31_540 },
  { campaignIndex: 3, platformIndex: 0, status: "PENDING", viewsClaimed: 2_100 },
  { campaignIndex: 4, platformIndex: 0, status: "APPROVED", viewsClaimed: 67_000, viewsVerified: 64_300, earningsCents: 6430 }
];

function urlFor(slug: string, key: string): string {
  switch (slug) {
    case "tiktok":
      return `https://www.tiktok.com/@klipuptest/video/${key}`;
    case "youtube":
      return `https://www.youtube.com/watch?v=${key}`;
    case "instagram":
      return `https://www.instagram.com/reel/${key}/`;
    case "x":
      return `https://x.com/klipuptest/status/${key}`;
    case "twitch":
      return `https://www.twitch.tv/videos/${key}`;
    default:
      return `https://example.com/${key}`;
  }
}

async function main() {
  const creator = await prisma.profile.findUnique({
    where: { email: CREATOR_EMAIL },
    select: { id: true }
  });
  if (!creator) throw new Error(`Creator ${CREATOR_EMAIL} not found — run scripts/create-test-users.ts first.`);

  const campaigns = await prisma.campaign.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { launchedAt: "desc" },
    include: { platforms: { orderBy: { order: "asc" }, include: { platform: true } } },
    take: 8
  });
  if (campaigns.length === 0) throw new Error("No PUBLISHED campaigns found — seed the data first.");

  // Find an admin to use as the reviewer; falls back to creator if none.
  const admin = await prisma.profile.findFirst({ where: { role: "ADMIN" }, select: { id: true } });
  const reviewerId = admin?.id ?? creator.id;

  let created = 0;
  let updated = 0;

  for (let i = 0; i < PLAN.length; i++) {
    const p = PLAN[i];
    const camp = campaigns[p.campaignIndex % campaigns.length];
    if (!camp || camp.platforms.length === 0) continue;
    const cp = camp.platforms[p.platformIndex % camp.platforms.length];
    const platformSlug = cp.platform.slug;

    // Deterministic per-(campaign, platform, index) so reruns target the same row.
    const idKey = `seed-${camp.id.slice(0, 6)}-${platformSlug}-${i}`;
    const videoUrl = urlFor(platformSlug, idKey);

    const existing = await prisma.submission.findFirst({
      where: { creatorId: creator.id, campaignId: camp.id, videoUrl }
    });

    const reviewed = p.status === "APPROVED" || p.status === "PAID";
    const data = {
      creatorId: creator.id,
      campaignId: camp.id,
      platformId: cp.platformId,
      videoUrl,
      videoId: idKey,
      viewsClaimed: p.viewsClaimed,
      status: p.status,
      viewsVerified: p.viewsVerified ?? null,
      earningsCents: p.earningsCents ?? 0,
      reviewedById: reviewed ? reviewerId : null,
      reviewedAt: reviewed ? new Date() : null,
      rejectReason: null,
      notes: null,
      apiData: Prisma.DbNull
    };

    if (existing) {
      await prisma.submission.update({ where: { id: existing.id }, data });
      updated++;
      console.log(`  [${p.status}] ${camp.title.slice(0, 32).padEnd(32)} (${platformSlug})  ~ updated`);
    } else {
      await prisma.submission.create({ data });
      created++;
      console.log(`  [${p.status}] ${camp.title.slice(0, 32).padEnd(32)} (${platformSlug})  + created`);
    }
  }

  console.log(`\nDone. created=${created} updated=${updated}`);
}

main()
  .catch((err) => {
    console.error("\nFailed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
