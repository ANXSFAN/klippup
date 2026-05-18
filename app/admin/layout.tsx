import Link from "next/link";
import { getTranslations } from "next-intl/server";
import AdminSidebar from "@/components/admin/AdminSidebar";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { Toaster } from "@/components/ui/sonner";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("admin");

  return (
    <div className="min-h-screen flex bg-secondary/40 text-foreground">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 border-b border-border bg-card flex items-center justify-end gap-3 px-6">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("viewSite")}
          </Link>
          <LocaleSwitcher />
        </header>
        <main className="flex-1 p-6 lg:p-8 min-w-0">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
