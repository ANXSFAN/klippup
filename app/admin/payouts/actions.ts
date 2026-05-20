"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { createPayoutSchema, type CreatePayoutValues } from "@/lib/validators";

export type AdminActionResult<T = void> =
  | ({ ok: true } & (T extends void ? { id?: string } : T))
  | { ok: false; error: string };

async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("UNAUTHENTICATED");
  if (profile.role !== "ADMIN") throw new Error("NOT_ADMIN");
  return profile;
}

/**
 * Manual settlement. Verifies that every selected submission:
 *  - belongs to this creator
 *  - is APPROVED
 *  - has no payoutId already (no double-spend)
 *  - has earningsCents > 0
 *
 * Then in one transaction: creates the Payout (amountCents = sum), updates
 * each submission's status to PAID + sets payoutId, and bumps the creator's
 * cumulative totalEarned.
 */
export async function createPayout(
  input: CreatePayoutValues
): Promise<AdminActionResult<{ id: string }>> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  const parsed = createPayoutSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID" };
  const v = parsed.data;

  const submissions = await prisma.submission.findMany({
    where: { id: { in: v.submissionIds } },
    select: { id: true, status: true, payoutId: true, earningsCents: true, creatorId: true }
  });

  if (submissions.length !== v.submissionIds.length) {
    return { ok: false, error: "MISSING_SUBMISSIONS" };
  }
  for (const s of submissions) {
    if (s.creatorId !== v.creatorId) return { ok: false, error: "WRONG_CREATOR" };
    if (s.status !== "APPROVED") return { ok: false, error: "NOT_APPROVED" };
    if (s.payoutId) return { ok: false, error: "ALREADY_PAID" };
    if (s.earningsCents <= 0) return { ok: false, error: "ZERO_AMOUNT" };
  }
  const amountCents = submissions.reduce((sum, s) => sum + s.earningsCents, 0);

  const created = await prisma.$transaction(async (tx) => {
    const payout = await tx.payout.create({
      data: {
        creatorId: v.creatorId,
        amountCents,
        method: v.method,
        details: v.details.trim() || null,
        txnRef: v.txnRef.trim() || null,
        notes: v.notes.trim() || null
      }
    });
    await tx.submission.updateMany({
      where: { id: { in: v.submissionIds } },
      data: { status: "PAID", payoutId: payout.id }
    });
    await tx.creatorProfile.upsert({
      where: { userId: v.creatorId },
      create: { userId: v.creatorId, totalEarned: amountCents },
      update: { totalEarned: { increment: amountCents } }
    });
    return payout;
  });

  await createNotification({
    userId: v.creatorId,
    type: "PAYOUT_SENT",
    payload: { amountCents, count: v.submissionIds.length },
    link: "/creator/earnings"
  });

  revalidatePath("/admin/payouts");
  revalidatePath("/admin/submissions");
  revalidatePath("/admin");
  revalidatePath("/brand/submissions");
  revalidatePath("/creator/submissions");
  revalidatePath("/creator/earnings");
  return { ok: true, id: created.id };
}
