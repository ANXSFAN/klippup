import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth";
import { getCreatorEarnings } from "@/lib/creator-queries";

const formatCents = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default async function CreatorDashboardPage() {
  const t = await getTranslations("creator.dashboard");
  const tE = await getTranslations("creator.earnings");
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const { summary } = await getCreatorEarnings(profile.id);

  const stats = [
    { label: tE("stats.totalEarned"), value: formatCents(summary.totalEarnedCents) },
    { label: tE("stats.approvedUnpaid"), value: formatCents(summary.approvedUnpaidCents) },
    { label: tE("stats.pendingCount"), value: summary.pendingCount }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {t("welcome", { name: profile.displayName })}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tabular-nums">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">{t("comingSoon")}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t("comingSoonDesc")}</p>
          </div>
          <Button asChild>
            <Link href="/creator/campaigns">
              {t("browseCampaigns")}
              <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
