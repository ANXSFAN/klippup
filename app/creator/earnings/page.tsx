import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import SubmissionStatusBadge from "@/components/creator/SubmissionStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { getCurrentProfile } from "@/lib/auth";
import { getCreatorEarnings } from "@/lib/creator-queries";

const formatCents = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default async function CreatorEarningsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const t = await getTranslations("creator.earnings");
  const tSubs = await getTranslations("creator.submissionsPage");
  const { summary, earningSubmissions } = await getCreatorEarnings(profile.id);

  const cards = [
    { label: t("stats.totalEarned"), value: formatCents(summary.totalEarnedCents) },
    { label: t("stats.approvedUnpaid"), value: formatCents(summary.approvedUnpaidCents) },
    { label: t("stats.pendingCount"), value: summary.pendingCount }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {c.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tabular-nums">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">{t("breakdown")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {earningSubmissions.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {t("empty")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tSubs("columns.campaign")}</TableHead>
                  <TableHead>{tSubs("columns.platform")}</TableHead>
                  <TableHead>{tSubs("columns.url")}</TableHead>
                  <TableHead className="text-right">{tSubs("columns.views")}</TableHead>
                  <TableHead className="text-right">{tSubs("columns.earnings")}</TableHead>
                  <TableHead>{tSubs("columns.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earningSubmissions.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Link
                        href={`/creator/campaigns/${r.campaignId}`}
                        className="text-sm font-medium hover:underline truncate max-w-[200px] inline-block"
                      >
                        {r.campaignTitle}
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
                        <span className="truncate max-w-[160px]">{r.videoUrl}</span>
                        <ExternalLink className="size-3 shrink-0" />
                      </a>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {r.viewsVerified != null ? r.viewsVerified.toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm font-medium">
                      {formatCents(r.earningsCents)}
                    </TableCell>
                    <TableCell>
                      <SubmissionStatusBadge status={r.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
