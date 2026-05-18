import { getTranslations } from "next-intl/server";
import DashboardCharts from "@/components/admin/DashboardCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import { getDashboardCharts, getDashboardStats } from "@/lib/queries";

export default async function AdminDashboardPage() {
  const t = await getTranslations("admin.dashboard");
  const [s, charts] = await Promise.all([getDashboardStats(), getDashboardCharts()]);

  const stats: { label: string; value: string | number }[] = [
    { label: t("stats.campaigns"), value: s.campaigns },
    { label: t("stats.published"), value: s.published },
    { label: t("stats.drafts"), value: s.drafts },
    { label: t("stats.categories"), value: s.categories },
    { label: t("stats.platforms"), value: s.platforms },
    { label: t("stats.totalBudget"), value: formatMoney(s.totalBudget) }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((st) => (
          <Card key={st.label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {st.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tabular-nums">{st.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <DashboardCharts data={charts} />
    </div>
  );
}
