import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { getTranslations } from "next-intl/server";
import CampaignInsights from "@/components/brand/CampaignInsights";
import CampaignTabs from "@/components/brand/CampaignTabs";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth";
import { getCampaignInsights } from "@/lib/brand-queries";

export default async function BrandCampaignInsightsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const insights = await getCampaignInsights(profile.id, id);
  if (!insights) notFound();

  const t = await getTranslations("brand.reviewPage");
  const tInsights = await getTranslations("brand.insights");

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
            <h1 className="text-2xl font-semibold">{insights.campaignTitle}</h1>
            <p className="text-sm text-muted-foreground mt-1">{tInsights("subtitle")}</p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/brand/campaigns/${id}/edit`}>
              <Pencil className="size-4 mr-1" />
              {t("editCampaign")}
            </Link>
          </Button>
        </div>
      </div>

      <CampaignTabs id={id} active="insights" />

      <CampaignInsights data={insights} />
    </div>
  );
}
