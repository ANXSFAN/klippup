"use client";
import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { signOut } from "@/app/(auth)/actions";
import { UserIcon, ChevronDownIcon } from "./Icons";
import type { ProfileSnapshot } from "@/lib/auth";

/**
 * Login/portal entry pill that lives in the top-right of the home page's search
 * bar. Matches LocaleSwitcher's visual language (card-glass h-9 pill + dropdown).
 * Receives the current profile from a server parent so the menu is correct on
 * first paint — no client-side auth fetch, no flicker.
 */
export default function AccountMenu({ profile }: { profile: ProfileSnapshot | null }) {
  const t = useTranslations("account");
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const portalHref =
    profile?.role === "BRAND" ? "/brand"
      : profile?.role === "ADMIN" ? "/admin"
      : "/creator";
  const portalLabel =
    profile?.role === "BRAND" ? t("brandPortal")
      : profile?.role === "ADMIN" ? t("adminPortal")
      : t("creatorPortal");
  const initial = profile?.displayName?.[0]?.toUpperCase() ?? "";

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    setOpen(false);
    setLoggingOut(false);
    router.refresh();
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("label")}
        className="h-9 px-3 rounded-full card-glass flex items-center gap-1.5 text-[12.5px] text-black/80 hover:text-ink transition"
      >
        {profile ? (
          <span className="size-5 inline-flex items-center justify-center rounded-full bg-black/[0.08] text-[10px] font-semibold text-ink">
            {initial}
          </span>
        ) : (
          <UserIcon size={14} className="text-black/45" />
        )}
        <span className="max-w-[120px] truncate">
          {profile ? profile.displayName : t("signIn")}
        </span>
        <ChevronDownIcon size={13} className="text-black/45" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1.5 min-w-[180px] rounded-xl card-glass p-1 z-50 shadow-card">
          {profile ? (
            <>
              <Link
                href={portalHref}
                onClick={() => setOpen(false)}
                className="block text-[12.5px] rounded-lg px-2.5 py-1.5 transition text-ink hover:bg-black/[0.04]"
              >
                {portalLabel}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full text-left text-[12.5px] rounded-lg px-2.5 py-1.5 transition text-black/70 hover:bg-black/[0.04] hover:text-ink disabled:opacity-50"
              >
                {loggingOut ? t("loggingOut") : t("logout")}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block text-[12.5px] rounded-lg px-2.5 py-1.5 transition text-ink hover:bg-black/[0.04]"
              >
                {t("signIn")}
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="block text-[12.5px] rounded-lg px-2.5 py-1.5 transition text-black/70 hover:bg-black/[0.04] hover:text-ink"
              >
                {t("signUp")}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
