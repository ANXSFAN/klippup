"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useFormatter, useTranslations } from "next-intl";
import { Camera, Check, ExternalLink, ImageOff, X } from "lucide-react";
import SubmissionStatusBadge from "@/components/creator/SubmissionStatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  approveSubmissionSchema,
  rejectSubmissionSchema,
  type ApproveSubmissionValues,
  type RejectSubmissionValues
} from "@/lib/validators";
import type { BrandSubmissionRow, SubmissionStatus } from "@/lib/types";

type Filter = "ALL" | SubmissionStatus;
const FILTERS: Filter[] = ["PENDING", "APPROVED", "REJECTED", "PAID", "ALL"];

const formatCents = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Row shape accepted by ReviewQueue. brandOwner is optional — admin scope
 *  fills it in to show an extra column. */
export type ReviewQueueRow = BrandSubmissionRow & { brandOwner?: string | null };

export type ReviewActionResult = { ok: true } | { ok: false; error: string };

interface Props {
  rows: ReviewQueueRow[];
  /** When true, hides the "Campaign" column (we're already inside a campaign-scoped page). */
  scopedToCampaign?: boolean;
  /** When true, surfaces the "Brand owner" column (used on /admin/submissions). */
  showBrandOwner?: boolean;
  /** URL pattern for a row's campaign link. Use `{id}` as the placeholder.
   *  Defaults to the brand portal path. Kept as a string (not a function) so it
   *  can cross the server → client component boundary safely. */
  campaignHrefPattern?: string;
  approveAction: (input: ApproveSubmissionValues) => Promise<ReviewActionResult>;
  rejectAction: (input: RejectSubmissionValues) => Promise<ReviewActionResult>;
}

export default function ReviewQueue({
  rows,
  scopedToCampaign,
  showBrandOwner,
  campaignHrefPattern = "/brand/campaigns/{id}/submissions",
  approveAction,
  rejectAction
}: Props) {
  const buildHref = (id: string) => campaignHrefPattern.replace("{id}", id);
  const t = useTranslations("brand.reviewPage");
  const tStatus = useTranslations("creator.submissionStatus");
  const fmt = useFormatter();

  const [filter, setFilter] = useState<Filter>("PENDING");
  const [approving, setApproving] = useState<ReviewQueueRow | null>(null);
  const [rejecting, setRejecting] = useState<ReviewQueueRow | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter === "ALL" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter]
  );

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { ALL: rows.length, PENDING: 0, APPROVED: 0, REJECTED: 0, PAID: 0 };
    for (const r of rows) c[r.status] += 1;
    return c;
  }, [rows]);

  // Reset focus when the visible set shifts (filter switch, row removal).
  useEffect(() => {
    if (focusedId && !filtered.some((r) => r.id === focusedId)) {
      setFocusedId(null);
    }
  }, [filtered, focusedId]);

  // J/K to walk rows, A/R to act on the focused one, Esc to drop focus.
  // Ignored while typing in a form field or while a dialog is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) {
          return;
        }
      }
      if (approving || rejecting) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (filtered.length === 0) return;

      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        const idx = focusedId ? filtered.findIndex((r) => r.id === focusedId) : -1;
        const next = filtered[Math.min(filtered.length - 1, idx + 1)];
        if (next) setFocusedId(next.id);
        return;
      }
      if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        const idx = focusedId ? filtered.findIndex((r) => r.id === focusedId) : 0;
        const prev = filtered[Math.max(0, idx - 1)];
        if (prev) setFocusedId(prev.id);
        return;
      }
      if (e.key === "Escape") {
        setFocusedId(null);
        return;
      }
      if ((e.key === "a" || e.key === "A") && focusedId) {
        const row = filtered.find((r) => r.id === focusedId);
        if (row && row.status !== "PAID") {
          e.preventDefault();
          setApproving(row);
        }
      } else if ((e.key === "r" || e.key === "R") && focusedId) {
        const row = filtered.find((r) => r.id === focusedId);
        if (row && row.status !== "PAID" && row.status !== "REJECTED") {
          e.preventDefault();
          setRejecting(row);
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [filtered, focusedId, approving, rejecting]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
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
        <span className="ml-auto hidden md:inline text-[11px] text-muted-foreground">
          {t("shortcutHint")}
        </span>
      </div>

      <Card className="overflow-visible">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">{t("empty")}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {!scopedToCampaign && <TableHead>{t("columns.campaign")}</TableHead>}
                {showBrandOwner && <TableHead>{t("columns.brand")}</TableHead>}
                <TableHead className="w-[88px]">{t("columns.video")}</TableHead>
                <TableHead>{t("columns.creator")}</TableHead>
                <TableHead>{t("columns.platform")}</TableHead>
                <TableHead className="text-right">{t("columns.claimed")}</TableHead>
                <TableHead className="text-right">{t("columns.verified")}</TableHead>
                <TableHead className="text-right">{t("columns.earnings")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead className="text-right">{t("columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => {
                const isFocused = r.id === focusedId;
                return (
                  <TableRow
                    key={r.id}
                    onClick={() => setFocusedId(r.id)}
                    className={cn(
                      "cursor-pointer transition-colors",
                      isFocused && "bg-primary/[0.06] hover:bg-primary/[0.08]"
                    )}
                  >
                    {!scopedToCampaign && (
                      <TableCell>
                        <Link
                          href={buildHref(r.campaignId)}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm font-medium hover:underline truncate max-w-[180px] inline-block"
                        >
                          {r.campaignTitle}
                        </Link>
                      </TableCell>
                    )}
                    {showBrandOwner && (
                      <TableCell className="text-xs text-muted-foreground">
                        {r.brandOwner ?? t("platformOwned")}
                      </TableCell>
                    )}
                    <TableCell className="relative">
                      <ThumbnailCell row={r} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{r.creatorName}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {r.creatorEmail}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <span className="size-5 inline-flex items-center justify-center rounded bg-secondary text-[10px] font-semibold">
                          {r.platformGlyph}
                        </span>
                        {r.platformLabel}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">
                      {r.viewsClaimed != null ? r.viewsClaimed.toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">
                      {r.viewsVerified != null ? (
                        r.viewsVerified.toLocaleString()
                      ) : r.apiData?.views != null ? (
                        <span className="inline-flex items-center gap-1 justify-end">
                          <span className="text-muted-foreground">
                            {r.apiData.views.toLocaleString()}
                          </span>
                          <span
                            title={t("apiAutoHint", { source: r.apiData.source })}
                            className="text-[9px] px-1 rounded-full bg-emerald-100 text-emerald-700 font-medium"
                          >
                            {t("apiAuto")}
                          </span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">
                      {r.earningsCents > 0 ? formatCents(r.earningsCents) : "—"}
                    </TableCell>
                    <TableCell>
                      <SubmissionStatusBadge status={r.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {r.status !== "PAID" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setApproving(r);
                              }}
                              className="h-7 text-[11px]"
                            >
                              <Check className="size-3 mr-0.5" />
                              {t("approve")}
                            </Button>
                            {r.status !== "REJECTED" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRejecting(r);
                                }}
                                className="h-7 text-[11px] text-destructive hover:text-destructive"
                              >
                                <X className="size-3 mr-0.5" />
                                {t("reject")}
                              </Button>
                            )}
                          </>
                        )}
                        {r.reviewedAt && r.status !== "PENDING" && (
                          <span className="text-[10px] text-muted-foreground">
                            {fmt.dateTime(r.reviewedAt, { dateStyle: "short" })}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={!!approving} onOpenChange={(o) => !o && setApproving(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("approveTitle")}</DialogTitle>
          </DialogHeader>
          {approving && (
            <ApproveForm
              key={approving.id}
              row={approving}
              onClose={() => setApproving(null)}
              approveAction={approveAction}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("rejectTitle")}</DialogTitle>
          </DialogHeader>
          {rejecting && (
            <RejectForm
              key={rejecting.id}
              row={rejecting}
              onClose={() => setRejecting(null)}
              rejectAction={rejectAction}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * The thumbnail cell: small 16:9 preview from apiData.thumbnailUrl + a "camera"
 * badge when the creator uploaded a proof screenshot. Hover surfaces a larger
 * popover with both images side by side, so reviewers can verify the screenshot
 * matches the video without opening anything.
 */
function ThumbnailCell({ row }: { row: ReviewQueueRow }) {
  const t = useTranslations("brand.reviewPage");
  const thumb = row.apiData?.thumbnailUrl ?? null;
  const shot = row.screenshotUrl ?? null;
  const popoverCount = (thumb ? 1 : 0) + (shot ? 1 : 0);

  return (
    <div className="group/thumb relative inline-flex flex-col gap-1 isolate">
      <a
        href={row.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        title={row.videoUrl}
        className="block"
      >
        <div className="relative w-[72px] h-[40px] rounded overflow-hidden bg-secondary border border-border">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt={row.apiData?.title ?? row.videoUrl}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <ImageOff className="size-3.5" />
            </div>
          )}
          {shot && (
            <span
              title={t("hasScreenshot")}
              className="absolute top-0.5 right-0.5 inline-flex size-4 items-center justify-center rounded-sm bg-primary text-primary-foreground"
            >
              <Camera className="size-2.5" />
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-0.5 text-[10px] text-muted-foreground group-hover/thumb:text-foreground">
          <span>{t("openVideo")}</span>
          <ExternalLink className="size-2.5" />
        </div>
      </a>

      {popoverCount > 0 && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-[88px] top-1/2 -translate-y-1/2 z-50 rounded-md overflow-hidden border border-border bg-card shadow-xl opacity-0 scale-95 transition-all duration-150 group-hover/thumb:opacity-100 group-hover/thumb:scale-100 p-1.5",
            popoverCount === 2 ? "w-[400px]" : "w-[240px]"
          )}
        >
          <div
            className={cn(
              "grid gap-1.5",
              popoverCount === 2 ? "grid-cols-2" : "grid-cols-1"
            )}
          >
            {thumb && (
              <PopoverImage
                src={thumb}
                label={row.apiData?.title ?? t("videoPreview")}
                sublabel={row.apiData?.authorName ?? undefined}
              />
            )}
            {shot && (
              <PopoverImage
                src={shot}
                label={t("screenshotPreview")}
                accent
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PopoverImage({
  src,
  label,
  sublabel,
  accent
}: {
  src: string;
  label: string;
  sublabel?: string;
  accent?: boolean;
}) {
  return (
    <div className="relative aspect-video rounded overflow-hidden bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 px-1.5 py-1 bg-gradient-to-t to-transparent",
          accent ? "from-primary/90" : "from-black/80"
        )}
      >
        <div className="text-[10px] font-medium text-white truncate">{label}</div>
        {sublabel && (
          <div className="text-[9px] text-white/70 truncate">{sublabel}</div>
        )}
      </div>
    </div>
  );
}

function ApproveForm({
  row,
  onClose,
  approveAction
}: {
  row: ReviewQueueRow;
  onClose: () => void;
  approveAction: (input: ApproveSubmissionValues) => Promise<ReviewActionResult>;
}) {
  const t = useTranslations("brand.reviewPage");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(approveSubmissionSchema),
    defaultValues: {
      submissionId: row.id,
      viewsVerified: String(
        row.viewsVerified ?? row.apiData?.views ?? row.viewsClaimed ?? ""
      ),
      earningsCents: row.earningsCents > 0 ? String(row.earningsCents) : "",
      notes: ""
    }
  });

  const onSubmit = (values: ApproveSubmissionValues) =>
    startTransition(async () => {
      const res = await approveAction(values);
      if (!res.ok) {
        toast.error(t("error"));
        return;
      }
      toast.success(t("approved"));
      onClose();
      router.refresh();
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("submissionId")} />
      <div className="text-xs text-muted-foreground">
        {t("creatorLabel")}:{" "}
        <span className="text-foreground font-medium">{row.creatorName}</span>
        <span className="mx-2">·</span>
        {row.platformLabel}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="viewsVerified">{t("fields.viewsVerified")}</Label>
        <Input id="viewsVerified" inputMode="numeric" {...register("viewsVerified")} />
        {errors.viewsVerified && (
          <p className="text-xs text-destructive">{errors.viewsVerified.message}</p>
        )}
        <div className="text-[11px] text-muted-foreground space-y-0.5">
          <p>{t("viewsClaimedWas", { views: row.viewsClaimed?.toLocaleString() ?? "—" })}</p>
          {row.apiData?.views != null && (
            <p className="text-emerald-700">
              {t("apiVerifiedHint", {
                views: row.apiData.views.toLocaleString(),
                source: row.apiData.source
              })}
            </p>
          )}
          {row.apiData && row.apiData.views == null && (
            <p className="text-amber-700">
              {t("apiNoViewsHint", { source: row.apiData.source })}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="earningsCents">{t("fields.earningsCents")}</Label>
        <Input id="earningsCents" inputMode="numeric" {...register("earningsCents")} />
        {errors.earningsCents && (
          <p className="text-xs text-destructive">{errors.earningsCents.message}</p>
        )}
        <p className="text-[11px] text-muted-foreground">{t("earningsCentsHint")}</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">{t("fields.notes")}</Label>
        <Textarea id="notes" rows={2} {...register("notes")} />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? t("saving") : t("confirmApprove")}
        </Button>
      </DialogFooter>
    </form>
  );
}

function RejectForm({
  row,
  onClose,
  rejectAction
}: {
  row: ReviewQueueRow;
  onClose: () => void;
  rejectAction: (input: RejectSubmissionValues) => Promise<ReviewActionResult>;
}) {
  const t = useTranslations("brand.reviewPage");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(rejectSubmissionSchema),
    defaultValues: {
      submissionId: row.id,
      reason: row.rejectReason ?? ""
    }
  });

  const onSubmit = (values: RejectSubmissionValues) =>
    startTransition(async () => {
      const res = await rejectAction(values);
      if (!res.ok) {
        toast.error(t("error"));
        return;
      }
      toast.success(t("rejected"));
      onClose();
      router.refresh();
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("submissionId")} />
      <div className="text-xs text-muted-foreground">
        {t("creatorLabel")}:{" "}
        <span className="text-foreground font-medium">{row.creatorName}</span>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reason">{t("fields.reason")}</Label>
        <Textarea id="reason" rows={3} {...register("reason")} />
        {errors.reason && <p className="text-xs text-destructive">{errors.reason.message}</p>}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
          {t("cancel")}
        </Button>
        <Button type="submit" variant="destructive" disabled={pending}>
          {pending ? t("saving") : t("confirmReject")}
        </Button>
      </DialogFooter>
    </form>
  );
}
