"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Bell } from "lucide-react";
import { useTranslations, useFormatter } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { markAllAsRead, markAsRead } from "@/app/notifications/actions";
import { cn } from "@/lib/utils";
import type { NotificationRow } from "@/lib/types";

interface Props {
  rows: NotificationRow[];
  unread: number;
}

export default function NotificationBell({ rows, unread }: Props) {
  const t = useTranslations("notifications");
  const fmt = useFormatter();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleClickRow = (row: NotificationRow) => {
    if (!row.readAt) {
      startTransition(async () => {
        await markAsRead(row.id);
        router.refresh();
      });
    }
  };

  const handleMarkAll = () => {
    if (unread === 0) return;
    startTransition(async () => {
      await markAllAsRead();
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("bell.aria")}
          className="relative rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-[10px] font-semibold text-primary-foreground flex items-center justify-center">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="text-sm font-semibold">{t("bell.title")}</span>
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={pending || unread === 0}
            className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground"
          >
            {t("bell.markAllRead")}
          </button>
        </div>
        {rows.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            {t("bell.empty")}
          </div>
        ) : (
          <ul className="max-h-96 overflow-y-auto">
            {rows.map((row) => {
              const content = (
                <div
                  className={cn(
                    "px-3 py-2.5 hover:bg-secondary/60 transition-colors cursor-pointer",
                    !row.readAt && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!row.readAt && (
                      <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground line-clamp-2">
                        {row.title}
                      </div>
                      {row.body && (
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {row.body}
                        </div>
                      )}
                      <div className="text-[11px] text-muted-foreground mt-1">
                        {fmt.relativeTime(row.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              );
              return (
                <li key={row.id} onClick={() => handleClickRow(row)}>
                  {row.link ? <Link href={row.link}>{content}</Link> : content}
                </li>
              );
            })}
          </ul>
        )}
        <div className="border-t border-border px-3 py-2">
          <Link
            href="/notifications"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {t("bell.viewAll")}
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
