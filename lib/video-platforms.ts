import type { Platform } from "./types";

export function detectPlatform(url: string): Platform | string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");

    if (host.includes("youtube.com") || host === "youtu.be") return "youtube";
    if (host.includes("bilibili.com") || host === "b23.tv") return "bilibili";
    if (host.includes("twitter.com") || host === "x.com") return "twitter";
    if (host.includes("instagram.com")) return "instagram";
    if (host.includes("tiktok.com")) return "tiktok";
    if (host.includes("weibo.com") || host === "weibo.cn") return "weibo";

    return "other";
  } catch {
    return "other";
  }
}

export type YouTubeThumbnailQuality =
  | "default"
  | "mqdefault"
  | "hqdefault"
  | "sddefault"
  | "maxresdefault";

/** 儲存與顯示用：720p，多數影片都有，品質與載入速度平衡 */
export const YOUTUBE_THUMBNAIL_QUALITY: YouTubeThumbnailQuality = "hqdefault";

export function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return parsed.pathname.slice(1).split("/")[0]?.split("?")[0] || null;
    }

    if (host.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/")[2] || null;
      }
      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/")[2] || null;
      }
      return parsed.searchParams.get("v");
    }

    return null;
  } catch {
    return null;
  }
}

export function extractBilibiliBvid(url: string): string | null {
  const ids = extractBilibiliId(url);
  return ids?.bvid ?? null;
}

export function extractBilibiliId(url: string): { bvid?: string; aid?: string } | null {
  try {
    const parsed = new URL(url);
    const bvidMatch = parsed.pathname.match(/\/video\/(BV[a-zA-Z0-9]+)/i);
    if (bvidMatch) return { bvid: bvidMatch[1] };
    const aidMatch = parsed.pathname.match(/\/video\/av(\d+)/i);
    if (aidMatch) return { aid: aidMatch[1] };
    const bvid = parsed.searchParams.get("bvid");
    if (bvid) return { bvid };
    return null;
  } catch {
    return null;
  }
}

export function getYouTubeThumbnailUrl(
  videoId: string,
  quality: YouTubeThumbnailQuality = YOUTUBE_THUMBNAIL_QUALITY,
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/** 同步解析：YouTube 可直接組 URL；Bilibili 需走 API 取 data.pic */
export function getThumbnailUrl(url: string, platform?: Platform | string): string | null {
  const p = platform ?? detectPlatform(url);

  if (p === "youtube") {
    const id = extractYouTubeId(url);
    return id ? getYouTubeThumbnailUrl(id) : null;
  }

  return null;
}

export function getEmbedUrl(
  url: string,
  platform?: Platform | string,
  options?: { autoplay?: boolean },
): string | null {
  const p = platform ?? detectPlatform(url);
  const autoplay = options?.autoplay ? 1 : 0;

  if (p === "youtube") {
    const id = extractYouTubeId(url);
    return id
      ? `https://www.youtube.com/embed/${id}?autoplay=${autoplay}&rel=0`
      : null;
  }

  if (p === "bilibili") {
    const ids = extractBilibiliId(url);
    if (ids?.bvid) {
      return `https://player.bilibili.com/player.html?bvid=${ids.bvid}&danmaku=0&autoplay=${autoplay}`;
    }
    if (ids?.aid) {
      return `https://player.bilibili.com/player.html?aid=${ids.aid}&danmaku=0&autoplay=${autoplay}`;
    }
  }

  return null;
}

export function getPlatformLabel(platform: Platform | string): string {
  const labels: Record<string, string> = {
    youtube: "YouTube",
    bilibili: "Bilibili",
    twitter: "X",
    instagram: "Instagram",
    tiktok: "TikTok",
    weibo: "Weibo",
    other: "Link",
  };
  return labels[platform] ?? platform;
}

export function getPlatformViewCount(video: {
  sources: { viewCount: number | null }[];
}): number | null {
  const platformViews = video.sources
    .map((s) => s.viewCount)
    .filter((v): v is number => v !== null && v > 0);

  if (platformViews.length === 0) return null;
  return Math.max(...platformViews);
}

/** @deprecated use getPlatformViewCount */
export function getDisplayViewCount(video: {
  sources: { viewCount: number | null }[];
  siteViews?: number;
}): number {
  return getPlatformViewCount(video) ?? 0;
}

export function getVideoYear(video: { publishedDate?: string; year?: number }): number {
  if (video.publishedDate) {
    return Number(video.publishedDate.slice(0, 4));
  }
  return video.year ?? 0;
}
