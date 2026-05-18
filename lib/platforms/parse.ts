import type { PlatformSlug } from "@/lib/types";

export interface ParsedVideo {
  /** Detected platform slug, or null if the URL didn't match. */
  platformSlug: PlatformSlug | null;
  /** The platform-native video id (numeric for TikTok/X, char string for YT/IG). */
  videoId: string | null;
}

/**
 * Best-effort link parser used by the creator submission flow.
 * Recognises the canonical share/watch URLs for the 5 platforms we support;
 * doesn't attempt to fetch or validate (Phase E's API extension will do that).
 */
export function parseVideoUrl(input: string): ParsedVideo {
  const url = input.trim();
  if (!url) return { platformSlug: null, videoId: null };

  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return { platformSlug: null, videoId: null };
  }

  const host = u.hostname.replace(/^www\./, "").toLowerCase();
  const path = u.pathname;

  // TikTok — /@user/video/12345 or shortened vm.tiktok.com/XXX
  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) {
    const m = path.match(/\/video\/(\d+)/);
    if (m) return { platformSlug: "tiktok", videoId: m[1] };
    if (host === "vm.tiktok.com" || host === "vt.tiktok.com") {
      const id = path.replace(/^\/+|\/+$/g, "");
      return { platformSlug: "tiktok", videoId: id || null };
    }
    return { platformSlug: "tiktok", videoId: null };
  }

  // YouTube — youtube.com/watch?v=, /shorts/, /embed/, youtu.be/
  if (host === "youtube.com" || host.endsWith(".youtube.com")) {
    if (path === "/watch") {
      return { platformSlug: "youtube", videoId: u.searchParams.get("v") };
    }
    const m = path.match(/^\/(shorts|embed|live|v)\/([^/?#]+)/);
    if (m) return { platformSlug: "youtube", videoId: m[2] };
    return { platformSlug: "youtube", videoId: null };
  }
  if (host === "youtu.be") {
    const id = path.replace(/^\/+/, "").split("/")[0];
    return { platformSlug: "youtube", videoId: id || null };
  }

  // Instagram — /reel/XXX, /p/XXX, /tv/XXX
  if (host === "instagram.com" || host.endsWith(".instagram.com")) {
    const m = path.match(/^\/(reel|p|tv)\/([^/?#]+)/);
    return { platformSlug: "instagram", videoId: m?.[2] ?? null };
  }

  // X / Twitter — /<user>/status/<id>
  if (
    host === "x.com" ||
    host === "twitter.com" ||
    host.endsWith(".x.com") ||
    host.endsWith(".twitter.com")
  ) {
    const m = path.match(/\/status\/(\d+)/);
    return { platformSlug: "x", videoId: m?.[1] ?? null };
  }

  // Twitch — /videos/<id> or /<channel>/clip/<id>
  if (host === "twitch.tv" || host.endsWith(".twitch.tv")) {
    const m = path.match(/^\/videos\/(\d+)/) || path.match(/\/clip\/([^/?#]+)/);
    return { platformSlug: "twitch", videoId: m?.[1] ?? null };
  }
  if (host === "clips.twitch.tv") {
    const id = path.replace(/^\/+/, "").split("/")[0];
    return { platformSlug: "twitch", videoId: id || null };
  }

  return { platformSlug: null, videoId: null };
}
