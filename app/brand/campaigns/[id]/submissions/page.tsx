import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { approveSubmission, rejectSubmission } from "@/app/brand/actions";
import ReviewQueue from "@/components/brand/ReviewQueue";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth";
import { getBrandCampaignForEdit, listBrandSubmissions } from "@/lib/brand-queries";

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
  const rows = await listBrandSubmissions(profile.id, { campaignId: id });

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
      <ReviewQueue
        rows={rows}
        scopedToCampaign
        approveAction={approveSubmission}
        rejectAction={rejectSubmission}
      />
    </div>
  );
}
