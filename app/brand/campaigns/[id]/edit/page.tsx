import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import BrandCampaignForm from "@/components/brand/BrandCampaignForm";
import BrandInvoicesCard from "@/components/brand/BrandInvoicesCard";
import { getCurrentProfile } from "@/lib/auth";
import { getBrandCampaignForEdit } from "@/lib/brand-queries";
import { getFormOptions } from "@/lib/queries";

export default async function EditBrandCampaignPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const [initial, { categories, platforms }] = await Promise.all([
    getBrandCampaignForEdit(profile.id, id),
    getFormOptions()
  ]);
  if (!initial) notFound();

  const t = await getTranslations("brand.campaignForm");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("editTitle")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("editSubtitle")}</p>
      </div>
      <BrandInvoicesCard campaignId={id} brandUserId={profile.id} />
      <BrandCampaignForm initial={initial} categories={categories} platforms={platforms} />
    </div>
  );
}
