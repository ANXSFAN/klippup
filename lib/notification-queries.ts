import { getTranslations } from "next-intl/server";
import { prisma } from "./db";
import type { NotificationRow, NotificationType } from "./types";

interface RawNotification {
  id: string;
  type: NotificationType;
  payload: unknown;
  link: string | null;
  readAt: Date | null;
  createdAt: Date;
}

/**
 * Render a notification's title/body using the current request's locale. We
 * store raw type + payload so the same row reads correctly in es / zh once
 * the user flips LocaleSwitcher.
 */
function renderRow(
  row: RawNotification,
  t: (key: string, vars?: Record<string, string | number>) => string
): NotificationRow {
  const p = (row.payload ?? {}) as Record<string, unknown>;
  const str = (k: string): string => {
    const v = p[k];
    return typeof v === "string" ? v : v == null ? "" : String(v);
  };
  const num = (k: string): number => {
    const v = p[k];
    return typeof v === "number" ? v : 0;
  };

  let title = "";
  let body: string | null = null;
  switch (row.type) {
    case "SUBMISSION_APPROVED":
      title = t("types.SUBMISSION_APPROVED.title", { campaign: str("campaignTitle") });
      body = t("types.SUBMISSION_APPROVED.body", {
        amount: (num("amountCents") / 100).toFixed(2)
      });
      break;
    case "SUBMISSION_REJECTED":
      title = t("types.SUBMISSION_REJECTED.title", { campaign: str("campaignTitle") });
      body = str("reason") || null;
      break;
    case "PAYOUT_SENT":
      title = t("types.PAYOUT_SENT.title", {
        amount: (num("amountCents") / 100).toFixed(2)
      });
      body = t("types.PAYOUT_SENT.body", { count: num("count") });
      break;
    case "CAMPAIGN_PUBLISHED":
      title = t("types.CAMPAIGN_PUBLISHED.title", { campaign: str("campaignTitle") });
      body = null;
      break;
  }

  return {
    id: row.id,
    type: row.type,
    title,
    body,
    link: row.link,
    readAt: row.readAt,
    createdAt: row.createdAt
  };
}

export async function listMyNotifications(
  userId: string,
  limit = 20
): Promise<NotificationRow[]> {
  const [rows, t] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit
    }),
    getTranslations("notifications")
  ]);
  return rows.map((r) => renderRow(r as RawNotification, t));
}

export async function countUnread(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, readAt: null } });
}
