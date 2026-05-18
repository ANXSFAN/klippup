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
