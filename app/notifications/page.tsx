import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth";
import { listMyNotifications } from "@/lib/notification-queries";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import NotificationsList from "@/components/portal/NotificationsList";

export default async function NotificationsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/notifications");

  const t = await getTranslations("notifications");
  const rows = await listMyNotifications(profile.id, 100);
  const backHref =
    profile.role === "CREATOR" ? "/creator" : profile.role === "BRAND" ? "/brand" : "/admin";

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
        <Link href={backHref} className="text-sm text-muted-foreground hover:text-foreground">
          ← {t("listPage.back")}
        </Link>
        <LocaleSwitcher />
      </header>
      <main className="max-w-3xl mx-auto p-6 lg:p-8">
        <h1 className="text-2xl font-semibold mb-6">{t("listPage.title")}</h1>
        <NotificationsList rows={rows} />
      </main>
    </div>
  );
}
