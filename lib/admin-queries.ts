import { prisma } from "./db";
import type {
  AdminPayoutRow,
  AdminSubmissionRow,
  AdminUserRow,
  PendingPayoutCreator,
  SubmissionApiData,
  SubmissionStatus
} from "./types";

/**
 * All Profile rows for /admin/users. Joins to BrandProfile / CreatorProfile
 * + aggregate counts. Cheap enough for the v1 user scale; if it grows we'll
 * paginate.
 */
export async function listUsers(): Promise<AdminUserRow[]> {
  const rows = await prisma.profile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      brand: { select: { brandName: true, verified: true } },
      _count: {
        select: {
          campaigns: true,
          submissions: true
        }
      }
    }
  });

  // Aggregate creator paid earnings in one round-trip.
  const creatorIds = rows.filter((r) => r.role === "CREATOR").map((r) => r.id);
  const paidByCreator = new Map<string, number>();
  if (creatorIds.length > 0) {
    const sums = await prisma.submission.groupBy({
      by: ["creatorId"],
      where: { creatorId: { in: creatorIds }, status: "PAID" },
      _sum: { earningsCents: true }
    });
    for (const s of sums) paidByCreator.set(s.creatorId, s._sum.earningsCents ?? 0);
  }

  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    displayName: r.displayName,
    role: r.role,
    createdAt: r.createdAt,
    brandName: r.brand?.brandName,
    brandVerified: r.brand?.verified,
    submissionCount: r._count.submissions,
    campaignCount: r._count.campaigns,
    totalEarnedCents: r.role === "CREATOR" ? paidByCreator.get(r.id) ?? 0 : undefined
  }));
}

/** Submissions across ALL campaigns, with brand owner display. */
export async function listAdminSubmissions(): Promise<AdminSubmissionRow[]> {
  const rows = await prisma.submission.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      campaign: {
        select: {
          id: true,
          title: true,
          coverUrl: true,
          brand: true,
          brandUserId: true
        }
      },
      creator: { select: { id: true, displayName: true, email: true } },
      platform: { select: { slug: true, label: true, glyph: true } }
    }
  });

  return rows.map((s) => ({
    id: s.id,
    campaignId: s.campaignId,
    campaignTitle: s.campaign.title,
    campaignCover: s.campaign.coverUrl,
    brandOwner: s.campaign.brandUserId ? s.campaign.brand : null,
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
    apiData: (s.apiData as SubmissionApiData | null) ?? null
  }));
}

/** Creators with APPROVED + payoutId IS NULL submissions, grouped. */
export async function listPendingPayoutCreators(): Promise<PendingPayoutCreator[]> {
  const submissions = await prisma.submission.findMany({
    where: { status: "APPROVED", payoutId: null, earningsCents: { gt: 0 } },
    orderBy: { reviewedAt: "desc" },
    include: {
      campaign: { select: { title: true } },
      platform: { select: { label: true } },
      creator: {
        select: {
          id: true,
          displayName: true,
          email: true,
          creator: { select: { payoutInfo: true } }
        }
      }
    }
  });

  const byCreator = new Map<string, PendingPayoutCreator>();
  for (const s of submissions) {
    const existing = byCreator.get(s.creatorId);
    if (existing) {
      existing.totalCents += s.earningsCents;
      existing.submissions.push({
        id: s.id,
        campaignTitle: s.campaign.title,
        platformLabel: s.platform.label,
        videoUrl: s.videoUrl,
        viewsVerified: s.viewsVerified,
        earningsCents: s.earningsCents,
        approvedAt: s.reviewedAt
      });
    } else {
      const info = (s.creator.creator?.payoutInfo ?? {}) as Record<string, unknown>;
      const method = typeof info.method === "string" ? info.method : "";
      const validMethod: "paypal" | "bank" | "other" | "" =
        method === "paypal" || method === "bank" || method === "other" ? method : "";
      byCreator.set(s.creatorId, {
        creatorId: s.creatorId,
        creatorName: s.creator.displayName,
        creatorEmail: s.creator.email,
        payoutMethod: validMethod,
        payoutDetails: typeof info.details === "string" ? info.details : "",
        totalCents: s.earningsCents,
        submissions: [
          {
            id: s.id,
            campaignTitle: s.campaign.title,
            platformLabel: s.platform.label,
            videoUrl: s.videoUrl,
            viewsVerified: s.viewsVerified,
            earningsCents: s.earningsCents,
            approvedAt: s.reviewedAt
          }
        ]
      });
    }
  }

  return [...byCreator.values()].sort((a, b) => b.totalCents - a.totalCents);
}

/** Past payouts table for /admin/payouts. */
export async function listPayouts(): Promise<AdminPayoutRow[]> {
  const rows = await prisma.payout.findMany({
    orderBy: { paidAt: "desc" },
    include: {
      creator: { select: { displayName: true, email: true } },
      _count: { select: { submissions: true } }
    }
  });
  return rows.map((p) => ({
    id: p.id,
    creatorId: p.creatorId,
    creatorName: p.creator.displayName,
    creatorEmail: p.creator.email,
    amountCents: p.amountCents,
    method: p.method,
    details: p.details,
    txnRef: p.txnRef,
    notes: p.notes,
    paidAt: p.paidAt,
    submissionCount: p._count.submissions
  }));
}
