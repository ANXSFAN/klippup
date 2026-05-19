import type { PlatformSlug } from "./types";

/** Short letter glyph per platform — used by the icon fallback. */
export const platformIcons: Record<PlatformSlug, string> = {
  tiktok: "TT",
  youtube: "YT",
  instagram: "IG",
  x: "X",
  twitch: "TW"
};

/** Compact USD formatter — `$1.5M`, `$13,000`, `$481`. */
export const formatMoney = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `$${n.toLocaleString("en-US")}`;
  return `$${n}`;
};

/**
 * Parse the campaign's `rate` display string ("$1/1K", "$0.50/1K", "$3/1k")
 * into a numeric dollars-per-1000-views value. Returns null on shapes we
 * don't recognise — callers should hide the estimate rather than guess.
 */
export function parseRate(rate: string | null | undefined): number | null {
  if (!rate) return null;
  const match = rate.match(/\$\s*(\d+(?:\.\d+)?)\s*\/\s*1\s*[kK]/);
  if (!match) return null;
  const n = parseFloat(match[1]);
  return Number.isFinite(n) ? n : null;
}

/** USD cents → "$1.23"; suitable for inline numbers in cards / forms. */
export const formatDollars = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
