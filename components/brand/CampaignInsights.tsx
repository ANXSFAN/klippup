"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDollars } from "@/lib/format";
import type { BrandCampaignInsights } from "@/lib/types";

const PRIMARY = "hsl(25 100% 55%)";
const PIE_COLORS = [
  "hsl(25 100% 55%)",
  "#94a3b8",
  "#1f2937",
  "#fbbf24",
  "#10b981"
];

interface Props {
  data: BrandCampaignInsights;
}

export default function CampaignInsights({ data }: Props) {
  const t = useTranslations("brand.insights");
  const { funnel, trend, byPlatform, topCreators } = data;

  const totalReviewed = funnel.approved + funnel.paid + funnel.rejected;
  const approvalRate =
    totalReviewed === 0
      ? null
      : Math.round(((funnel.approved + funnel.paid) / totalReviewed) * 100);

  const funnelCards = [
    { key: "pending", value: funnel.pending, label: t("funnel.pending") },
    { key: "approved", value: funnel.approved, label: t("funnel.approved") },
    { key: "paid", value: funnel.paid, label: t("funnel.paid") },
    { key: "rejected", value: funnel.rejected, label: t("funnel.rejected") }
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {funnelCards.map((c) => (
          <Card key={c.key}>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {c.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      {approvalRate !== null && (
        <p className="text-sm text-muted-foreground">
          {t("approvalRate", { rate: approvalRate })}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("trendTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {trend.some((p) => p.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ left: 0, right: 16, top: 8, bottom: 4 }}>
                  <CartesianGrid stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} tickMargin={6} />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={11}
                    allowDecimals={false}
                    width={48}
                    tickFormatter={(v) => formatCompact(v as number)}
                  />
                  <Tooltip
                    formatter={(v) => formatCompact(v as number)}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={PRIMARY}
                    strokeWidth={2}
                    dot={{ r: 3, fill: PRIMARY }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState text={t("empty")} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("byPlatformTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {byPlatform.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byPlatform}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={50}
                    outerRadius={88}
                    paddingAngle={2}
                  >
                    {byPlatform.map((d, i) => (
                      <Cell key={d.key} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState text={t("empty")} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("topCreatorsTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topCreators.length === 0 ? (
            <EmptyState text={t("empty")} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-muted-foreground text-left">
                  <tr className="border-b border-border">
                    <th className="py-2 font-medium">#</th>
                    <th className="py-2 font-medium">{t("columns.creator")}</th>
                    <th className="py-2 font-medium text-right">{t("columns.submissions")}</th>
                    <th className="py-2 font-medium text-right">{t("columns.views")}</th>
                    <th className="py-2 font-medium text-right">{t("columns.earnings")}</th>
                  </tr>
                </thead>
                <tbody>
                  {topCreators.map((c, i) => (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="py-2 tabular-nums text-muted-foreground">{i + 1}</td>
                      <td className="py-2">
                        <Link
                          href={`/creators/${c.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {c.name}
                        </Link>
                      </td>
                      <td className="py-2 text-right tabular-nums">{c.submissions}</td>
                      <td className="py-2 text-right tabular-nums">
                        {formatCompact(c.viewsVerified)}
                      </td>
                      <td className="py-2 text-right tabular-nums font-medium">
                        {formatDollars(c.earningsCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}
