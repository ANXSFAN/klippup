import { getTranslations } from "next-intl/server";
import ComingSoon from "@/components/admin/ComingSoon";

export default async function AdminSettingsPage() {
  const t = await getTranslations("admin.nav");
  return <ComingSoon title={t("settings")} />;
}
