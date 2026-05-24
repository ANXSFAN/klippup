import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth";
import { getCreatorEarnings, getCreatorProfile } from "@/lib/creator-queries";

const formatCents = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default async function CreatorDashboardPage() {
  const t = await getTranslations("creator.dashboard");
  const tE = await getTranslations("creator.earnings");
  const tO = await getTranslations("creator.dashboard.onboarding");
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const [{ summary }, creator] = await Promise.all([
    getCreatorEarnings(profile.id),
    getCreatorProfile(profile.id)
  ]);

  const hasName = profile.displayName.trim().length > 0;
  const hasSocial = creator
    ? Object.values(creator.socials).some((v) => v.trim().length > 0)
    : false;
  // Matches the server-side guard (isCreatorFinancialComplete) but reads the
  // string-shaped form data carried on CreatorProfileData.fiscal.
  const hasFiscal = creator
    ? Boolean(
        creator.fiscal.legalName.trim() &&
          creator.fiscal.taxIdType &&
          creator.fiscal.taxId.trim() &&
          creator.fiscal.birthDate &&
          (creator.fiscal.address.street.trim() ||
            creator.fiscal.address.postalCode.trim() ||
            creator.fiscal.address.city.trim()) &&
          creator.fiscal.iban.trim()
      )
    : false;
  const onboardingDone = hasName && hasSocial && hasFiscal;

  const stats = [
    { label: tE("stats.totalEarned"), value: formatCents(summary.totalEarnedCents) },
    { label: tE("stats.approvedUnpaid"), value: formatCents(summary.approvedUnpaidCents) },
    { label: tE("stats.pendingCount"), value: summary.pendingCount }
  ];

  const steps = [
    { key: "displayName", done: hasName, label: tO("steps.displayName") },
    { key: "socials", done: hasSocial, label: tO("steps.socials") },
    { key: "fiscal", done: hasFiscal, label: tO("steps.fiscal") }
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {t("welcome", { name: profile.displayName })}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
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
              <Link href="/creator/profile">
                {tO("cta")}
                <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

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
