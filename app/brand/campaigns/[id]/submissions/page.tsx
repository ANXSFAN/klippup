import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { approveSubmission, rejectSubmission } from "@/app/brand/actions";
import ReviewQueue from "@/components/brand/ReviewQueue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth";
import {
  getBrandCampaignForEdit,
  getBrandCampaignStats,
  listBrandSubmissions
} from "@/lib/brand-queries";
import { formatDollars } from "@/lib/format";

export default async function BrandCampaignReviewPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return null;

  // We reuse getBrandCampaignForEdit for the ownership check + title.
  const campaign = await getBrandCampaignForEdit(profile.id, id);
  if (!campaign) notFound();

  const t = await getTranslations("brand.reviewPage");
  const tStats = await getTranslations("brand.reviewPage.kpi");
  const [rows, stats] = await Promise.all([
    listBrandSubmissions(profile.id, { campaignId: id }),
    getBrandCampaignStats(profile.id, id)
  ]);

  const kpis = stats
    ? [
        { label: tStats("total"), value: String(stats.total) },
        { label: tStats("pending"), value: String(stats.pending) },
        {
          label: tStats("approved"),
          value: String(stats.approved),
          sub: formatDollars(stats.approvedCents)
        },
        {
          label: tStats("paid"),
          value: String(stats.paid),
          sub: formatDollars(stats.paidCents)
        },
        {
          label: tStats("remaining"),
          value: formatDollars(stats.remainingCents),
          sub: tStats("ofBudget", { amount: formatDollars(stats.budgetCents) })
        }
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Button asChild variant="ghost" size="sm" className="-ml-2 h-7">
          <Link href="/brand/campaigns">
            <ArrowLeft className="size-4 mr-1" />
            {t("backToCampaigns")}
          </Link>
        </Button>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{campaign.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("forCampaign")}</p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/brand/campaigns/${id}/edit`}>
              <Pencil className="size-4 mr-1" />
              {t("editCampaign")}
            </Link>
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {kpis.map((k) => (
            <Card key={k.label}>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {k.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold tabular-nums">{k.value}</div>
                {k.sub && (
                  <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
                    {k.sub}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ReviewQueue
        rows={rows}
        scopedToCampaign
        approveAction={approveSubmission}
        rejectAction={rejectSubmission}
      />
    </div>
  );
}
