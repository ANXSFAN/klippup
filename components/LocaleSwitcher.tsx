"use client";
import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { locales, LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { GlobeIcon, ChevronDownIcon } from "./Icons";

/**
 * Cookie-based locale switcher (no i18n routing — the URL stays the same).
 * Writes NEXT_LOCALE and refreshes so server components re-render with the
 * new locale's messages.
 */
export default function LocaleSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const active = useLocale() as Locale;
  const t = useTranslations("locale");
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const pick = (locale: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
    setOpen(false);
    router.refresh();
  };

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("label")}
        className="h-9 px-3 rounded-full card-glass flex items-center gap-1.5 text-[12.5px] text-black/80 hover:text-ink transition"
      >
        <GlobeIcon size={14} className="text-black/45" />
        <span className="tabular-nums uppercase">{active}</span>
        <ChevronDownIcon size={13} className="text-black/45" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1.5 min-w-[140px] rounded-xl card-glass p-1 z-50 shadow-card">
          {locales.map((locale) => (
            <button
              key={locale}
              type="button"
              onClick={() => pick(locale)}
              className={`w-full text-left text-[12.5px] rounded-lg px-2.5 py-1.5 transition flex items-center justify-between ${
                locale === active
                  ? "bg-black/[0.06] text-ink font-medium"
                  : "text-black/70 hover:bg-black/[0.04] hover:text-ink"
              }`}
            >
              <span>{t(locale)}</span>
              <span className="text-[10px] text-black/40 uppercase tabular-nums">{locale}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
