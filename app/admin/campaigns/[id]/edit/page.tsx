import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import CampaignForm from "@/components/admin/CampaignForm";
import { getCampaignForEdit, getFormOptions } from "@/lib/queries";

export default async function EditCampaignPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("admin.campaigns.form");
  const [options, data] = await Promise.all([getFormOptions(), getCampaignForEdit(id)]);
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t("editTitle")}</h1>
      <CampaignForm options={options} initial={data} campaignId={id} />
    </div>
  );
}
