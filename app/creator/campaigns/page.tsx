import { getTranslations } from "next-intl/server";
import CreatorCampaignGrid from "@/components/creator/CreatorCampaignGrid";
import { getCurrentProfile } from "@/lib/auth";
import { listCreatorCampaigns } from "@/lib/creator-queries";

export default async function CreatorCampaignsPage() {
  const t = await getTranslations("creator.campaignList");
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const campaigns = await listCreatorCampaigns(profile.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>
      <CreatorCampaignGrid campaigns={campaigns} />
    </div>
  );
}
