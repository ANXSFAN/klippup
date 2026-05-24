import { FileText } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listInvoicesForCampaign } from "@/lib/invoice-queries";
import type { InvoiceStatus } from "@/lib/types";

const STATUS_VARIANT: Record<
  InvoiceStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  PROFORMA: "secondary",
  ISSUED: "default",
  PAID: "outline",
  CANCELLED: "destructive"
};

const formatEUR = (cents: number) =>
  (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });

interface Props {
  campaignId: string;
  brandUserId: string;
}

export default async function BrandInvoicesCard({ campaignId, brandUserId }: Props) {
  const t = await getTranslations("brand.invoices");
  const rows = await listInvoicesForCampaign(campaignId, brandUserId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("title")}</CardTitle>
        <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          rows.map((r) => (
            <a
              key={r.id}
              href={`/api/invoices/${r.id}/pdf`}
              target="_blank"
              rel="noopener"
              className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="size-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium font-mono">{r.serialNumber}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.issueDate).toLocaleDateString("es-ES")}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge variant={STATUS_VARIANT[r.status]} className="text-[10px]">
                  {t(`status.${r.status}`)}
                </Badge>
                <span className="tabular-nums text-sm font-medium">
                  {formatEUR(r.totalCents)}
                </span>
              </div>
            </a>
          ))
        )}
      </CardContent>
    </Card>
  );
}
