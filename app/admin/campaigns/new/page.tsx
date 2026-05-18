import { getTranslations } from "next-intl/server";
import CampaignForm from "@/components/admin/CampaignForm";
import { getFormOptions } from "@/lib/queries";

export default async function NewCampaignPage() {
  const t = await getTranslations("admin.campaigns.form");
  const options = await getFormOptions();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t("createTitle")}</h1>
      <CampaignForm options={options} />
    </div>
  );
}
