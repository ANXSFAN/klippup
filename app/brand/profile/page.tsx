import { getTranslations } from "next-intl/server";
import BrandProfileForm from "./BrandProfileForm";
import { getCurrentProfile } from "@/lib/auth";
import { getBrandProfile } from "@/lib/brand-queries";

export default async function BrandProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const t = await getTranslations("brand.profilePage");
  const data = await getBrandProfile(profile.id);
  if (!data) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>
      <BrandProfileForm initial={data} />
    </div>
  );
}
