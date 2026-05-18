"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  changeRoleSchema,
  setVerifiedSchema,
  type ChangeRoleValues,
  type SetVerifiedValues
} from "@/lib/validators";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("UNAUTHENTICATED");
  if (profile.role !== "ADMIN") throw new Error("NOT_ADMIN");
  return profile;
}

/**
 * Promotes/demotes a user. When the role changes, also makes sure the
 * matching sub-profile row exists so the rest of the app doesn't blow up
 * (BRAND needs BrandProfile; CREATOR is fine without CreatorProfile but we
 * still seed an empty row so /creator/profile renders).
 */
export async function changeUserRole(input: ChangeRoleValues): Promise<AdminActionResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  const parsed = changeRoleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID" };
  const { userId, role } = parsed.data;

  const user = await prisma.profile.findUnique({
    where: { id: userId },
    select: { id: true, role: true, displayName: true }
  });
  if (!user) return { ok: false, error: "NOT_FOUND" };

  await prisma.$transaction(async (tx) => {
    await tx.profile.update({ where: { id: userId }, data: { role } });
    if (role === "BRAND") {
      await tx.brandProfile.upsert({
        where: { userId },
        create: { userId, brandName: user.displayName },
        update: {}
      });
    }
    if (role === "CREATOR") {
      await tx.creatorProfile.upsert({
        where: { userId },
        create: { userId },
        update: {}
      });
    }
  });

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function setBrandVerified(input: SetVerifiedValues): Promise<AdminActionResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  const parsed = setVerifiedSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID" };
  const { userId, verified } = parsed.data;

  const brand = await prisma.brandProfile.findUnique({ where: { userId } });
  if (!brand) return { ok: false, error: "NOT_A_BRAND" };

  await prisma.$transaction([
    prisma.brandProfile.update({ where: { userId }, data: { verified } }),
    // Reflect on existing campaigns so cards show the right badge.
    prisma.campaign.updateMany({
      where: { brandUserId: userId },
      data: { brandVerified: verified }
    })
  ]);

  revalidatePath("/admin/users");
  revalidatePath("/");
  return { ok: true };
}
