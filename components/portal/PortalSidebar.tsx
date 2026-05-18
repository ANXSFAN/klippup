"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PortalNavItem {
  href: string;
  key: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface Props {
  brandHref: string;
  subtitleKey: string;
  items: PortalNavItem[];
  /** Translation namespace for `subtitleKey` and each `item.key`. */
  ns: string;
}

export default function PortalSidebar({ brandHref, subtitleKey, items, ns }: Props) {
  const pathname = usePathname();
  const t = useTranslations(ns);

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-card flex flex-col">
      <Link href={brandHref} className="h-16 flex items-center gap-2.5 px-5 border-b border-border">
        <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
          K
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-semibold">KlippUp</span>
          <span className="block text-[11px] text-muted-foreground">{t(subtitleKey)}</span>
        </span>
      </Link>
      <nav className="flex-1 p-3 space-y-1">
        {items.map(({ href, key, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
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
