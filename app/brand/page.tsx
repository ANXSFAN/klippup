import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth";
import { getBrandDashboardStats } from "@/lib/brand-queries";

export default async function BrandDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const t = await getTranslations("brand.dashboard");
  const stats = await getBrandDashboardStats(profile.id);

  const cards = [
    { label: t("stats.campaigns"), value: stats.campaigns, sub: t("stats.draftsAndPublished", { drafts: stats.drafts, published: stats.published }) },
    { label: t("stats.pendingSubmissions"), value: stats.pendingSubmissions, sub: t("stats.totalSubmissions", { count: stats.totalSubmissions }) },
    { label: t("stats.approvedSubmissions"), value: stats.approvedSubmissions, sub: "" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {t("welcome", { name: profile.displayName })}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/brand/campaigns/new">
            <Plus className="size-4 mr-1" />
            {t("newCampaign")}
          </Link>
        </Button>
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
              {c.sub && <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">{t("reviewCta")}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t("reviewCtaDesc")}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/brand/submissions">
              {t("openReview")}
              <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
