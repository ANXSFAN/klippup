import { getFormatter, getTranslations } from "next-intl/server";
import PayoutsClient from "./PayoutsClient";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { listPayouts, listPendingPayoutCreators } from "@/lib/admin-queries";

const formatCents = (cents: number) =>
  (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });

export default async function AdminPayoutsPage() {
  const t = await getTranslations("admin.payouts");
  const fmt = await getFormatter();
  const [pending, history] = await Promise.all([
    listPendingPayoutCreators(),
    listPayouts()
  ]);
  const totalPending = pending.reduce((sum, p) => sum + p.totalCents, 0);
  const totalCreators = pending.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("stats.pendingAmount")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              {formatCents(totalPending)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("stats.acrossCreators", { count: totalCreators })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("stats.payoutsAll")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">{history.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("stats.totalPaid", {
                amount: formatCents(history.reduce((sum, p) => sum + p.amountCents, 0))
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">{t("pendingTitle")}</h2>
        {pending.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            {t("pendingEmpty")}
          </Card>
        ) : (
          <PayoutsClient creators={pending} />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">{t("historyTitle")}</h2>
        <Card className="overflow-hidden">
          {history.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {t("historyEmpty")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("columns.creator")}</TableHead>
                  <TableHead className="text-right">{t("columns.amount")}</TableHead>
                  <TableHead>{t("columns.method")}</TableHead>
                  <TableHead>{t("columns.txnRef")}</TableHead>
                  <TableHead className="text-right">{t("columns.submissions")}</TableHead>
                  <TableHead className="text-right">{t("columns.paidAt")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{p.creatorName}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {p.creatorEmail}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums font-medium">
                      {formatCents(p.amountCents)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs uppercase">
                        {p.method}
                      </Badge>
                      {p.details && (
                        <div className="text-[11px] text-muted-foreground mt-1 max-w-[180px] truncate">
                          {p.details}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.txnRef ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">
                      {p.submissionCount}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground tabular-nums">
                      {fmt.dateTime(p.paidAt, { dateStyle: "medium", timeStyle: "short" })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </section>
    </div>
  );
}
