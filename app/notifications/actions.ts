"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type NotificationActionResult = { ok: true } | { ok: false; error: string };

export async function markAsRead(id: string): Promise<NotificationActionResult> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "UNAUTHENTICATED" };

  await prisma.notification.updateMany({
    where: { id, userId: profile.id, readAt: null },
    data: { readAt: new Date() }
  });
  revalidatePath("/notifications");
  return { ok: true };
}

export async function markAllAsRead(): Promise<NotificationActionResult> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "UNAUTHENTICATED" };

  await prisma.notification.updateMany({
    where: { userId: profile.id, readAt: null },
    data: { readAt: new Date() }
  });
  revalidatePath("/notifications");
  return { ok: true };
}
