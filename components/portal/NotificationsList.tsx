"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { markAllAsRead, markAsRead } from "@/app/notifications/actions";
import { cn } from "@/lib/utils";
import type { NotificationRow } from "@/lib/types";

interface Props {
  rows: NotificationRow[];
}

export default function NotificationsList({ rows }: Props) {
  const t = useTranslations("notifications");
  const fmt = useFormatter();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const unread = rows.filter((r) => !r.readAt);
  const read = rows.filter((r) => r.readAt);

  const handleClickRow = (row: NotificationRow) => {
    if (!row.readAt) {
      startTransition(async () => {
        await markAsRead(row.id);
        router.refresh();
      });
    }
  };

  const handleMarkAll = () => {
    if (unread.length === 0) return;
    startTransition(async () => {
      await markAllAsRead();
      router.refresh();
    });
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-10 text-center text-muted-foreground">
        {t("listPage.empty")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {unread.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {t("listPage.unread", { count: unread.length })}
            </h2>
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={pending}
              className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              {t("bell.markAllRead")}
            </button>
          </div>
          <ul className="rounded-lg border border-border bg-card divide-y divide-border overflow-hidden">
            {unread.map((row) => (
              <RowItem
                key={row.id}
                row={row}
                onClick={handleClickRow}
                relativeTime={fmt.relativeTime(row.createdAt)}
              />
            ))}
          </ul>
        </section>
      )}
      {read.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">
            {t("listPage.read")}
          </h2>
          <ul className="rounded-lg border border-border bg-card divide-y divide-border overflow-hidden">
            {read.map((row) => (
              <RowItem
                key={row.id}
                row={row}
                onClick={handleClickRow}
                relativeTime={fmt.relativeTime(row.createdAt)}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function RowItem({
  row,
  onClick,
  relativeTime
}: {
  row: NotificationRow;
  onClick: (r: NotificationRow) => void;
  relativeTime: string;
}) {
  const body = (
    <div
      className={cn(
        "px-4 py-3 hover:bg-secondary/50 transition-colors cursor-pointer",
        !row.readAt && "bg-primary/5"
      )}
    >
      <div className="flex items-start gap-3">
        {!row.readAt && (
          <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground">{row.title}</div>
          {row.body && (
            <div className="text-sm text-muted-foreground mt-0.5">{row.body}</div>
          )}
          <div className="text-xs text-muted-foreground mt-1">{relativeTime}</div>
        </div>
      </div>
    </div>
  );
  return (
    <li onClick={() => onClick(row)}>
      {row.link ? <Link href={row.link}>{body}</Link> : body}
    </li>
  );
}
