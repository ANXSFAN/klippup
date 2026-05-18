import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import DeleteCampaignButton from "@/components/admin/DeleteCampaignButton";
import PublishCampaignButton from "@/components/admin/PublishCampaignButton";
import { formatMoney } from "@/lib/format";
import { getAdminCampaigns } from "@/lib/queries";
import type { CampaignStatus } from "@/lib/types";

const STATUS_VARIANT: Record<CampaignStatus, "default" | "secondary" | "outline"> = {
  PUBLISHED: "default",
  DRAFT: "secondary",
  ARCHIVED: "outline"
};

export default async function AdminCampaignsPage() {
  const t = await getTranslations("admin.campaigns");
  const rows = await getAdminCampaigns();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("count", { count: rows.length })}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/campaigns/new">{t("new")}</Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columns.campaign")}</TableHead>
              <TableHead>{t("columns.owner")}</TableHead>
              <TableHead>{t("columns.category")}</TableHead>
              <TableHead>{t("columns.platforms")}</TableHead>
              <TableHead>{t("columns.placements")}</TableHead>
              <TableHead className="text-right">{t("columns.progress")}</TableHead>
              <TableHead className="text-right">{t("columns.participants")}</TableHead>
              <TableHead>{t("columns.status")}</TableHead>
              <TableHead className="text-right">{t("columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
                  {t("empty")}
                </TableCell>
              </TableRow>
            )}
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.coverUrl}
                      alt=""
                      className="w-12 h-8 rounded object-cover bg-muted shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-medium truncate max-w-[260px]">{c.title}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[260px]">
                        {c.brand}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  {c.brandOwnerName ? (
                    <span className="text-foreground">{c.brandOwnerName}</span>
                  ) : (
                    <span className="text-muted-foreground italic">{t("platformOwner")}</span>
                  )}
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">{c.categoryLabel}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {c.platformGlyphs.map((g, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center justify-center w-6 h-6 rounded bg-secondary text-[10px] font-semibold text-secondary-foreground"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {c.placements.length === 0 ? (
                      <span className="text-muted-foreground text-sm">{t("none")}</span>
                    ) : (
                      c.placements.map((p) => (
                        <Badge key={p} variant="outline" className="text-[10px]">
                          {t(`placements.${p}`)}
                        </Badge>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm whitespace-nowrap">
                  {formatMoney(c.raised)}
                  <span className="text-muted-foreground"> / {formatMoney(c.budget)}</span>
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm">{c.participants}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[c.status]}>{t(`status.${c.status}`)}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    {c.status === "DRAFT" && (
                      <PublishCampaignButton id={c.id} name={c.title} />
                    )}
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      aria-label={t("edit")}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Link href={`/admin/campaigns/${c.id}/edit`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <DeleteCampaignButton id={c.id} name={c.title} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
