import type { PlatformSlug, SubmissionApiData } from "@/lib/types";

/**
 * Best-effort fetcher for public video metrics, used at submission time and
 * on the reviewer's "refresh" button. Returns null for unsupported platforms
 * or transient errors — callers should treat that as "no data, fall back to
 * the creator-declared number".
 *
 * Per-platform notes:
 *   - youtube : Data API v3 (free tier, ~10k units/day, this call costs 1)
 *   - tiktok  : public oEmbed — title/author/thumbnail only, no view count.
 *               TikTok's Display API (real view counts) needs a developer
 *               registration we haven't done yet.
 */
const FETCH_TIMEOUT_MS = 3000;

export async function fetchVideoMetrics(
  slug: PlatformSlug,
  videoId: string,
  videoUrl: string
): Promise<SubmissionApiData | null> {
  try {
    if (slug === "youtube") return await fetchYouTube(videoId);
    if (slug === "tiktok") return await fetchTikTok(videoUrl);
    return null;
  } catch (e) {
    console.error(`[metrics] ${slug} fetch failed`, e);
    return null;
  }
}

async function fetchYouTube(videoId: string): Promise<SubmissionApiData | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key || !videoId) return null;

  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "statistics,snippet");
  url.searchParams.set("id", videoId);
  url.searchParams.set("key", key);

  const r = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
  });
  if (!r.ok) return null;
  const json = (await r.json()) as YoutubeVideosResponse;
  const item = json.items?.[0];
  if (!item) return null;

  return {
    views: numeric(item.statistics?.viewCount),
    likes: numeric(item.statistics?.likeCount),
    title: item.snippet?.title ?? null,
    thumbnailUrl:
      item.snippet?.thumbnails?.high?.url ??
      item.snippet?.thumbnails?.medium?.url ??
      null,
    authorName: item.snippet?.channelTitle ?? null,
    fetchedAt: new Date().toISOString(),
    source: "youtube_api"
  };
}

async function fetchTikTok(videoUrl: string): Promise<SubmissionApiData | null> {
  if (!videoUrl) return null;
  const r = await fetch(
    `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`,
    {
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    }
  );
  if (!r.ok) return null;
  const json = (await r.json()) as TikTokOembedResponse;
  if (!json.title && !json.thumbnail_url) return null;

  return {
    views: null,
    likes: null,
    title: json.title ?? null,
    thumbnailUrl: json.thumbnail_url ?? null,
    authorName: json.author_name ?? null,
    fetchedAt: new Date().toISOString(),
    source: "tiktok_oembed"
  };
}

function numeric(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

interface YoutubeVideosResponse {
  items?: {
    statistics?: {
      viewCount?: string;
      likeCount?: string;
      commentCount?: string;
    };
    snippet?: {
      title?: string;
      channelTitle?: string;
      thumbnails?: {
        high?: { url?: string };
        medium?: { url?: string };
      };
    };
  }[];
}

interface TikTokOembedResponse {
  title?: string;
  thumbnail_url?: string;
  author_name?: string;
}
