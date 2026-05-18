"use client";

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
import type { ChartPoint, DashboardCharts as Data } from "@/lib/types";

const BAR_COLOR = "hsl(25 100% 55%)";
const LINE_COLOR = "hsl(25 100% 55%)";
const PIE_COLORS = ["#94a3b8", "hsl(25 100% 55%)", "#1f2937"];

function ChartCard({
  title,
  empty,
  hasData,
  children
}: {
  title: string;
  empty: string;
  hasData: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {hasData ? (
          children
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {empty}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HBar({ data }: { data: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke="#e5e7eb" />
        <XAxis type="number" allowDecimals={false} stroke="#9ca3af" fontSize={12} />
        <YAxis
          type="category"
          dataKey="label"
          stroke="#6b7280"
          fontSize={12}
          width={88}
          interval={0}
        />
        <Tooltip
          cursor={{ fill: "rgba(0,0,0,0.04)" }}
          contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
        />
        <Bar dataKey="value" fill={BAR_COLOR} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function StatusPie({
  data,
  labelFor
}: {
  data: ChartPoint[];
  labelFor: (key: string) => string;
}) {
  const labeled = data.map((d) => ({ ...d, label: labelFor(d.key) }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={labeled}
          dataKey="value"
          nameKey="label"
          innerRadius={50}
          outerRadius={88}
          paddingAngle={2}
        >
          {labeled.map((d, i) => (
            <Cell key={d.key} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function MonthlyLine({ data }: { data: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ left: 0, right: 16, top: 8, bottom: 4 }}>
        <CartesianGrid stroke="#e5e7eb" vertical={false} />
        <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} tickMargin={6} />
        <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} width={28} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={LINE_COLOR}
          strokeWidth={2}
          dot={{ r: 3, fill: LINE_COLOR }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function DashboardCharts({ data }: { data: Data }) {
  const t = useTranslations("admin.dashboard.charts");
  const tStatus = useTranslations("admin.campaigns.status");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard
        title={t("byCategory")}
        empty={t("empty")}
        hasData={data.byCategory.length > 0}
      >
        <HBar data={data.byCategory} />
      </ChartCard>

      <ChartCard
        title={t("byPlatform")}
        empty={t("empty")}
        hasData={data.byPlatform.length > 0}
      >
        <HBar data={data.byPlatform} />
      </ChartCard>

      <ChartCard
        title={t("byStatus")}
        empty={t("empty")}
        hasData={data.byStatus.some((s) => s.value > 0)}
      >
        <StatusPie
          data={data.byStatus}
          labelFor={(key) => tStatus(key as "DRAFT" | "PUBLISHED" | "ARCHIVED")}
        />
      </ChartCard>

      <ChartCard
        title={t("byMonth")}
        empty={t("empty")}
        hasData={data.byMonth.some((m) => m.value > 0)}
      >
        <MonthlyLine data={data.byMonth} />
      </ChartCard>
    </div>
  );
}
