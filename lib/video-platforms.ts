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

export function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1).split("/")[0] || null;
    if (parsed.pathname.startsWith("/shorts/")) {
      return parsed.pathname.split("/")[2] || null;
    }
    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}

export function extractBilibiliId(url: string): { bvid?: string; aid?: string } | null {
  try {
    const parsed = new URL(url);
    const bvidMatch = parsed.pathname.match(/\/video\/(BV[\w]+)/i);
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

export function getThumbnailUrl(url: string, platform?: Platform | string): string | null {
  const p = platform ?? detectPlatform(url);

  if (p === "youtube") {
    const id = extractYouTubeId(url);
    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
  }

  if (p === "bilibili") {
    const ids = extractBilibiliId(url);
    if (ids?.bvid) {
      return `https://i0.hdslb.com/bfs/archive/${ids.bvid}.jpg`;
    }
  }

  return null;
}

export function getEmbedUrl(url: string, platform?: Platform | string): string | null {
  const p = platform ?? detectPlatform(url);

  if (p === "youtube") {
    const id = extractYouTubeId(url);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (p === "bilibili") {
    const ids = extractBilibiliId(url);
    if (ids?.bvid) {
      return `https://player.bilibili.com/player.html?bvid=${ids.bvid}&high_quality=1&danmaku=0`;
    }
    if (ids?.aid) {
      return `https://player.bilibili.com/player.html?aid=${ids.aid}&high_quality=1&danmaku=0`;
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

export function getDisplayViewCount(video: {
  sources: { viewCount: number | null }[];
  siteViews: number;
}): number {
  const platformViews = video.sources
    .map((s) => s.viewCount)
    .filter((v): v is number => v !== null && v > 0);

  if (platformViews.length > 0) {
    return Math.max(...platformViews);
  }

  return video.siteViews;
}
