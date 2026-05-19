import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth";
import { getBrandDashboardStats, getBrandProfile } from "@/lib/brand-queries";

export default async function BrandDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const t = await getTranslations("brand.dashboard");
  const tO = await getTranslations("brand.dashboard.onboarding");
  const [stats, brand] = await Promise.all([
    getBrandDashboardStats(profile.id),
    getBrandProfile(profile.id)
  ]);

  const hasBrandName = (brand?.brandName ?? "").trim().length > 0;
  const hasWebsite = (brand?.website ?? "").trim().length > 0;
  const hasDescription = (brand?.description ?? "").trim().length > 0;
  const onboardingDone = hasBrandName && hasWebsite && hasDescription;

  const steps = [
    { key: "brandName", done: hasBrandName, label: tO("steps.brandName") },
    { key: "website", done: hasWebsite, label: tO("steps.website") },
    { key: "description", done: hasDescription, label: tO("steps.description") }
  ];
  const doneCount = steps.filter((s) => s.done).length;

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

      {!onboardingDone && (
        <Card className="border-primary/40 bg-primary/[0.04]">
          <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">{tO("title")}</h2>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {tO("progress", { done: doneCount, total: steps.length })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{tO("subtitle")}</p>
              <ul className="mt-3 space-y-1.5">
                {steps.map((s) => (
                  <li
                    key={s.key}
                    className={`flex items-center gap-2 text-sm ${
                      s.done ? "text-muted-foreground line-through" : "text-foreground"
                    }`}
                  >
                    {s.done ? (
                      <CheckCircle2 className="size-4 text-primary" />
                    ) : (
                      <Circle className="size-4 text-muted-foreground" />
                    )}
                    <span>{s.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button asChild className="self-start sm:self-center">
              <Link href="/brand/profile">
                {tO("cta")}
                <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

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
