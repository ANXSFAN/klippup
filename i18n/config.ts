// Central place for the supported locales. Add a locale here + a matching
// `messages/<locale>.json` file and it becomes available everywhere.
export const locales = ["es", "zh"] as const;
export type Locale = (typeof locales)[number];

// The product is used in Spain — Spanish is the default.
export const defaultLocale: Locale = "es";

// Cookie that holds the visitor's chosen locale (no i18n routing — URLs stay clean).
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const localeNames: Record<Locale, string> = {
  es: "Español",
  zh: "中文"
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
