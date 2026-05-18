import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Megaphone, Send, Wallet, User } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentProfile } from "@/lib/auth";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import LogoutButton from "@/components/portal/LogoutButton";
import PortalSidebar, { type PortalNavItem } from "@/components/portal/PortalSidebar";

const NAV: PortalNavItem[] = [
  { href: "/creator", key: "dashboard", icon: LayoutDashboard, exact: true },
  { href: "/creator/campaigns", key: "campaigns", icon: Megaphone },
  { href: "/creator/submissions", key: "submissions", icon: Send },
  { href: "/creator/earnings", key: "earnings", icon: Wallet },
  { href: "/creator/profile", key: "profile", icon: User }
];

export default async function CreatorLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/creator");
  if (profile.role !== "CREATOR") redirect("/post-login");

  return (
    <div className="min-h-screen flex bg-secondary/40">
      <PortalSidebar
        brandHref="/creator"
        subtitleKey="subtitle"
        items={NAV}
        ns="creator"
      />
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
