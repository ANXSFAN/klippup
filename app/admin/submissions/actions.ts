"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import {
  approveSubmissionSchema,
  rejectSubmissionSchema,
  type ApproveSubmissionValues,
  type RejectSubmissionValues
} from "@/lib/validators";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("UNAUTHENTICATED");
  if (profile.role !== "ADMIN") throw new Error("NOT_ADMIN");
  return profile;
}

/**
 * Admin counterpart of brand approveSubmission — no ownership check, can act on
 * any submission across the platform. Same field set so the shared dialog UI
 * fits both paths.
 */
export async function adminApproveSubmission(
  input: ApproveSubmissionValues
): Promise<AdminActionResult> {
  let profile;
  try {
    profile = await requireAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  const parsed = approveSubmissionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID" };
  const v = parsed.data;

  const existing = await prisma.submission.findUnique({
    where: { id: v.submissionId },
    select: { id: true, status: true }
  });
  if (!existing) return { ok: false, error: "NOT_FOUND" };
  if (existing.status === "PAID") return { ok: false, error: "ALREADY_PAID" };

  const earningsCents = Number.parseInt(v.earningsCents, 10);
  const updated = await prisma.submission.update({
    where: { id: v.submissionId },
    data: {
      status: "APPROVED",
      viewsVerified: Number.parseInt(v.viewsVerified, 10),
      earningsCents,
      rejectReason: null,
      notes: v.notes.trim() || null,
      reviewedById: profile.id,
      reviewedAt: new Date()
    },
    select: { creatorId: true, campaign: { select: { title: true } } }
  });

  await createNotification({
    userId: updated.creatorId,
    type: "SUBMISSION_APPROVED",
    payload: { campaignTitle: updated.campaign.title, amountCents: earningsCents },
    link: "/creator/submissions"
  });

  revalidatePath("/admin");
  revalidatePath("/admin/submissions");
  revalidatePath("/admin/payouts");
  revalidatePath("/brand/submissions");
  revalidatePath("/creator/submissions");
  revalidatePath("/creator/earnings");
  return { ok: true };
}

export async function adminRejectSubmission(
  input: RejectSubmissionValues
): Promise<AdminActionResult> {
  let profile;
  try {
    profile = await requireAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  const parsed = rejectSubmissionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID" };
  const v = parsed.data;

  const existing = await prisma.submission.findUnique({
    where: { id: v.submissionId },
    select: { id: true, status: true }
  });
  if (!existing) return { ok: false, error: "NOT_FOUND" };
  if (existing.status === "PAID") return { ok: false, error: "ALREADY_PAID" };

  const reason = v.reason.trim();
  const updated = await prisma.submission.update({
    where: { id: v.submissionId },
    data: {
      status: "REJECTED",
      rejectReason: reason,
      earningsCents: 0,
      viewsVerified: null,
      reviewedById: profile.id,
      reviewedAt: new Date()
    },
    select: { creatorId: true, campaign: { select: { title: true } } }
  });

  await createNotification({
    userId: updated.creatorId,
    type: "SUBMISSION_REJECTED",
    payload: { campaignTitle: updated.campaign.title, reason },
    link: "/creator/submissions"
  });

  revalidatePath("/admin");
  revalidatePath("/admin/submissions");
  revalidatePath("/brand/submissions");
  revalidatePath("/creator/submissions");
  return { ok: true };
}
