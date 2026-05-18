import { getTranslations } from "next-intl/server";
import ProfileForm from "./ProfileForm";
import { getCurrentProfile } from "@/lib/auth";
import { getCreatorProfile } from "@/lib/creator-queries";

export default async function CreatorProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const t = await getTranslations("creator.profilePage");
  const data = await getCreatorProfile(profile.id);
  if (!data) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>
      <ProfileForm initial={data} />
    </div>
  );
}
