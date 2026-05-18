import { getTranslations } from "next-intl/server";
import BrandCampaignForm from "@/components/brand/BrandCampaignForm";
import { getFormOptions } from "@/lib/queries";

export default async function NewBrandCampaignPage() {
  const t = await getTranslations("brand.campaignForm");
  const { categories, platforms } = await getFormOptions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("createTitle")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>
      <BrandCampaignForm categories={categories} platforms={platforms} />
    </div>
  );
}
