"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useFormatter, useTranslations } from "next-intl";
import { Check, ExternalLink, X } from "lucide-react";
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
                {!scopedToCampaign && <TableHead>{t("columns.campaign")}</TableHead>}
                {showBrandOwner && <TableHead>{t("columns.brand")}</TableHead>}
                <TableHead>{t("columns.creator")}</TableHead>
                <TableHead>{t("columns.platform")}</TableHead>
                <TableHead>{t("columns.url")}</TableHead>
                <TableHead className="text-right">{t("columns.claimed")}</TableHead>
                <TableHead className="text-right">{t("columns.verified")}</TableHead>
                <TableHead className="text-right">{t("columns.earnings")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead className="text-right">{t("columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  {!scopedToCampaign && (
                    <TableCell>
                      <Link
                        href={buildHref(r.campaignId)}
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
                  <TableCell>
                    <a
                      href={r.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    >
                      <span className="truncate max-w-[160px]">{r.videoUrl}</span>
                      <ExternalLink className="size-3 shrink-0" />
                    </a>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {r.viewsClaimed != null ? r.viewsClaimed.toLocaleString() : "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {r.viewsVerified != null ? r.viewsVerified.toLocaleString() : "—"}
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
                            onClick={() => setApproving(r)}
                            className="h-7 text-[11px]"
                          >
                            <Check className="size-3 mr-0.5" />
                            {t("approve")}
                          </Button>
                          {r.status !== "REJECTED" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setRejecting(r)}
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
              ))}
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
      viewsVerified: String(row.viewsVerified ?? row.viewsClaimed ?? ""),
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
        <p className="text-[11px] text-muted-foreground">
          {t("viewsClaimedWas", { views: row.viewsClaimed?.toLocaleString() ?? "—" })}
        </p>
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
