"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  FileText,
  FolderTree,
  LayoutDashboard,
  Megaphone,
  MonitorPlay,
  Send,
  Settings,
  Users,
  Wallet,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV: { href: string; key: string; icon: LucideIcon; exact?: boolean }[] = [
  { href: "/admin", key: "dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/campaigns", key: "campaigns", icon: Megaphone },
  { href: "/admin/submissions", key: "submissions", icon: Send },
  { href: "/admin/invoices", key: "invoices", icon: FileText },
  { href: "/admin/payouts", key: "payouts", icon: Wallet },
  { href: "/admin/users", key: "users", icon: Users },
  { href: "/admin/categories", key: "categories", icon: FolderTree },
  { href: "/admin/platforms", key: "platforms", icon: MonitorPlay },
  { href: "/admin/settings", key: "settings", icon: Settings }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const t = useTranslations("admin");

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-card flex flex-col">
      <Link href="/admin" className="h-16 flex items-center gap-2.5 px-5 border-b border-border">
        <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
          K
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-semibold">{t("brand")}</span>
          <span className="block text-[11px] text-muted-foreground">{t("subtitle")}</span>
        </span>
      </Link>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ href, key, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{t(`nav.${key}`)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
