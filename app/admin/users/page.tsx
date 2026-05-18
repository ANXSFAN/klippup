import { getTranslations } from "next-intl/server";
import UsersClient from "./UsersClient";
import { getCurrentProfile } from "@/lib/auth";
import { listUsers } from "@/lib/admin-queries";

export default async function AdminUsersPage() {
  const t = await getTranslations("admin.users");
  const me = await getCurrentProfile();
  const rows = await listUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("count", { count: rows.length })}
        </p>
      </div>
      <UsersClient rows={rows} currentUserId={me?.id ?? ""} />
    </div>
  );
}
