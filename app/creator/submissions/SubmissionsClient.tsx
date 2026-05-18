"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useTranslations, useFormatter } from "next-intl";
import SubmissionStatusBadge from "@/components/creator/SubmissionStatusBadge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { CreatorSubmissionRow, SubmissionStatus } from "@/lib/types";

type Filter = "ALL" | SubmissionStatus;
const FILTERS: Filter[] = ["ALL", "PENDING", "APPROVED", "REJECTED", "PAID"];

const formatCents = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function SubmissionsClient({ rows }: { rows: CreatorSubmissionRow[] }) {
  const t = useTranslations("creator.submissionsPage");
  const tStatus = useTranslations("creator.submissionStatus");
  const fmt = useFormatter();
  const [filter, setFilter] = useState<Filter>("ALL");

  const filtered = useMemo(
    () => (filter === "ALL" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter]
  );

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { ALL: rows.length, PENDING: 0, APPROVED: 0, REJECTED: 0, PAID: 0 };
    for (const r of rows) c[r.status] += 1;
    return c;
  }, [rows]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "h-8 px-3 rounded-full text-xs font-medium transition-colors",
              filter === f
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            )}
          >
            {f === "ALL" ? t("all") : tStatus(f)}
            <span className="ml-1.5 tabular-nums opacity-70">({counts[f]})</span>
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">{t("empty")}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.campaign")}</TableHead>
                <TableHead>{t("columns.platform")}</TableHead>
                <TableHead>{t("columns.url")}</TableHead>
                <TableHead className="text-right">{t("columns.views")}</TableHead>
                <TableHead className="text-right">{t("columns.earnings")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead className="text-right">{t("columns.submitted")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Link
                      href={`/creator/campaigns/${r.campaignId}`}
                      className="flex items-center gap-2 hover:underline"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={r.campaignCover}
                        alt={r.campaignTitle}
                        className="w-10 h-7 object-cover rounded shrink-0"
                      />
                      <span className="font-medium text-sm truncate max-w-[200px]">
                        {r.campaignTitle}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span className="size-5 inline-flex items-center justify-center rounded bg-secondary text-[10px] font-semibold">
                        {r.platformGlyph}
                      </span>
                      {r.platformLabel}
                    </span>
                  </TableCell>
                  <TableCell>
                    <a
                      href={r.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    >
                      <span className="truncate max-w-[180px]">{r.videoUrl}</span>
                      <ExternalLink className="size-3 shrink-0" />
                    </a>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm">
                    {r.viewsVerified != null
                      ? r.viewsVerified.toLocaleString()
                      : r.viewsClaimed != null
                        ? (
                            <span className="text-muted-foreground">
                              {r.viewsClaimed.toLocaleString()}
                            </span>
                          )
                        : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm">
                    {r.earningsCents > 0 ? formatCents(r.earningsCents) : "—"}
                  </TableCell>
                  <TableCell>
                    <SubmissionStatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground tabular-nums">
                    {fmt.dateTime(r.createdAt, { dateStyle: "medium" })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
