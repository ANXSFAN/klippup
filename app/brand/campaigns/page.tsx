import Link from "next/link";
import { Pencil, Plus, Send } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import DuplicateCampaignButton from "@/components/brand/DuplicateCampaignButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { getCurrentProfile } from "@/lib/auth";
import { listBrandCampaigns } from "@/lib/brand-queries";
import { formatMoney } from "@/lib/format";

const STATUS_TONES: Record<string, string> = {
  DRAFT: "bg-amber-100 text-amber-900",
  PUBLISHED: "bg-emerald-100 text-emerald-900",
  ARCHIVED: "bg-zinc-200 text-zinc-700"
};

export default async function BrandCampaignsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const t = await getTranslations("brand.campaignList");
  const tStatus = await getTranslations("admin.campaigns.status");
  const fmt = await getFormatter();
  const rows = await listBrandCampaigns(profile.id);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("count", { count: rows.length })}
          </p>
        </div>
        <Button asChild>
          <Link href="/brand/campaigns/new">
            <Plus className="size-4 mr-1" />
            {t("new")}
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">{t("empty")}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.campaign")}</TableHead>
                <TableHead>{t("columns.category")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead>{t("columns.progress")}</TableHead>
                <TableHead className="text-right">{t("columns.pending")}</TableHead>
                <TableHead className="text-right">{t("columns.total")}</TableHead>
                <TableHead className="text-right">{t("columns.created")}</TableHead>
                <TableHead className="text-right">{t("columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={r.cover}
                        alt={r.title}
                        className="w-12 h-8 rounded object-cover shrink-0"
                      />
                      <span className="font-medium text-sm truncate max-w-[220px]">
                        {r.title}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{r.categoryLabel}</TableCell>
                  <TableCell>
                    <Badge
                      className={`border-transparent ${STATUS_TONES[r.status] ?? ""}`}
                    >
                      {tStatus(r.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs tabular-nums">
                    <span className="font-medium">{formatMoney(r.raised)}</span>
                    <span className="text-muted-foreground"> / {formatMoney(r.budget)}</span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.pendingCount > 0 ? (
                      <Badge className="border-transparent bg-amber-100 text-amber-900">
                        {r.pendingCount}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {r.submissionCount}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground tabular-nums">
                    {fmt.dateTime(r.createdAt, { dateStyle: "medium" })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" title={t("review")}>
                        <Link href={`/brand/campaigns/${r.id}/submissions`}>
                          <Send className="size-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="icon" title={t("edit")}>
                        <Link href={`/brand/campaigns/${r.id}/edit`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <DuplicateCampaignButton id={r.id} />
                    </div>
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
