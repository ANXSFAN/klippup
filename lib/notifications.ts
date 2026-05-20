import { prisma } from "./db";
import type { NotificationType } from "./types";

/**
 * Best-effort notification writer. Never throws — if the insert fails (e.g.
 * the target user was deleted), we swallow and log so the host action's
 * success isn't blocked by a notification side-effect.
 */
export async function createNotification(args: {
  userId: string;
  type: NotificationType;
  payload: Record<string, unknown>;
  link?: string | null;
}): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: args.userId,
        type: args.type,
        payload: args.payload as object,
        link: args.link ?? null
      }
    });
  } catch (err) {
    console.warn("[createNotification] failed", { userId: args.userId, type: args.type, err });
  }
}
