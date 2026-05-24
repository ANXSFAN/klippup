"use client";

import { useTransition } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { setInvoiceStatus } from "./actions";
import type { InvoiceRow, InvoiceStatus } from "@/lib/types";

const STATUSES: InvoiceStatus[] = ["PROFORMA", "ISSUED", "PAID", "CANCELLED"];
const SELECT_CLS =
  "h-8 rounded-md border border-input bg-transparent px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const formatEUR = (cents: number) =>
  (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });

export default function InvoicesClient({ rows }: { rows: InvoiceRow[] }) {
  const t = useTranslations("admin.invoices");
  const [pending, startTransition] = useTransition();

  const handleChange = (id: string, status: InvoiceStatus) => {
    startTransition(async () => {
      const res = await setInvoiceStatus(id, status);
      if (!res.ok) {
        toast.error(t("errors.statusChange"));
        return;
      }
      toast.success(t("statusChanged"));
    });
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("columns.serial")}</TableHead>
            <TableHead>{t("columns.client")}</TableHead>
            <TableHead>{t("columns.campaign")}</TableHead>
            <TableHead className="text-right">{t("columns.base")}</TableHead>
            <TableHead className="text-right">{t("columns.iva")}</TableHead>
            <TableHead className="text-right">{t("columns.total")}</TableHead>
            <TableHead>{t("columns.status")}</TableHead>
            <TableHead>{t("columns.date")}</TableHead>
            <TableHead className="text-right">{t("columns.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
                {t("empty")}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs whitespace-nowrap">
                  {r.serialNumber}
                </TableCell>
                <TableCell className="text-sm">{r.brandName}</TableCell>
                <TableCell className="text-sm text-muted-foreground truncate max-w-[240px]">
                  {r.campaignTitle ?? "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm">
                  {formatEUR(r.baseCents)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm">
                  {formatEUR(r.ivaCents)}
                  {r.ivaRatePercent > 0 ? (
                    <span className="text-muted-foreground text-xs">
                      {" "}
                      ({r.ivaRatePercent}%)
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm font-medium">
                  {formatEUR(r.totalCents)}
                </TableCell>
                <TableCell>
                  <select
                    className={SELECT_CLS}
                    value={r.status}
                    disabled={pending}
                    onChange={(e) => handleChange(r.id, e.target.value as InvoiceStatus)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {t(`status.${s}`)}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(r.issueDate).toLocaleDateString("es-ES")}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      aria-label={t("download")}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <a
                        href={`/api/invoices/${r.id}/pdf`}
                        target="_blank"
                        rel="noopener"
                      >
                        <FileText className="size-4" />
                      </a>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
