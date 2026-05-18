import { getTranslations } from "next-intl/server";
import SubmissionsClient from "./SubmissionsClient";
import { getCurrentProfile } from "@/lib/auth";
import { listCreatorSubmissions } from "@/lib/creator-queries";

export default async function CreatorSubmissionsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const t = await getTranslations("creator.submissionsPage");
  const rows = await listCreatorSubmissions(profile.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>
      <SubmissionsClient rows={rows} />
    </div>
  );
}
