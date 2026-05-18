import Link from "next/link";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentProfile } from "@/lib/auth";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import LogoutButton from "@/components/portal/LogoutButton";
import PortalSidebar from "@/components/portal/PortalSidebar";

export default async function BrandLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/brand");
  if (profile.role !== "BRAND") redirect("/post-login");

  return (
    <div className="min-h-screen flex bg-secondary/40">
      <PortalSidebar brandHref="/brand" subtitleKey="subtitle" ns="brand" />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-end gap-4">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ←  KlippUp
          </Link>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {profile.displayName}
          </span>
          <LocaleSwitcher />
          <LogoutButton />
        </header>
        <main className="flex-1 p-6 lg:p-8">{children}</main>
        <Toaster richColors position="top-right" />
      </div>
    </div>
  );
}
