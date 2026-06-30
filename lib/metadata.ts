import { detectPlatform, extractBilibiliId, extractYouTubeId, getEmbedUrl, getThumbnailUrl } from "./video-platforms";
import type { VideoMetadata } from "./types";

const BILIBILI_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Referer: "https://www.bilibili.com",
};

export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.replace(/^http:\/\//i, "https://");
}

async function fetchYouTubeTitle(url: string): Promise<string | null> {
  const id = extractYouTubeId(url);
  if (!id) return null;

  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string };
    return data.title ?? null;
  } catch {
    return null;
  }
}

async function fetchBilibiliView(url: string): Promise<{
  title: string | null;
  thumbnail: string | null;
}> {
  const ids = extractBilibiliId(url);
  if (!ids) return { title: null, thumbnail: null };

  const param = ids.bvid ? `bvid=${ids.bvid}` : `aid=${ids.aid}`;
  try {
    const res = await fetch(
      `https://api.bilibili.com/x/web-interface/view?${param}`,
      {
        headers: BILIBILI_HEADERS,
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return { title: null, thumbnail: null };
    const json = (await res.json()) as {
      code?: number;
      data?: { title?: string; pic?: string };
    };
    if (json.code !== 0 || !json.data) return { title: null, thumbnail: null };
    return {
      title: json.data.title ?? null,
      thumbnail: normalizeImageUrl(json.data.pic),
    };
  } catch {
    return { title: null, thumbnail: null };
  }
}

export async function fetchBilibiliThumbnail(url: string): Promise<string | null> {
  const { thumbnail } = await fetchBilibiliView(url);
  return thumbnail;
}

export async function fetchUrlMetadata(url: string): Promise<VideoMetadata> {
  const platform = detectPlatform(url);
  let title: string | null = null;
  let thumbnail: string | null = null;

  if (platform === "youtube") {
    thumbnail = getThumbnailUrl(url, platform);
    title = await fetchYouTubeTitle(url);
  } else if (platform === "bilibili") {
    const meta = await fetchBilibiliView(url);
    title = meta.title;
    thumbnail = meta.thumbnail;
  } else {
    thumbnail = getThumbnailUrl(url, platform);
  }

  return {
    title,
    thumbnail: normalizeImageUrl(thumbnail),
    platform,
    embedUrl: getEmbedUrl(url, platform),
  };
}

export async function fetchPlatformViewCount(
  url: string,
  platform?: string,
): Promise<number | null> {
  const p = platform ?? detectPlatform(url);

  if (p === "bilibili") {
    const ids = extractBilibiliId(url);
    if (!ids) return null;
    const param = ids.bvid ? `bvid=${ids.bvid}` : `aid=${ids.aid}`;
    try {
      const res = await fetch(`https://api.bilibili.com/x/web-interface/view?${param}`, {
        headers: BILIBILI_HEADERS,
        next: { revalidate: 3600 },
      });
      if (!res.ok) return null;
      const json = (await res.json()) as {
        code?: number;
        data?: { stat?: { view?: number } };
      };
      if (json.code !== 0) return null;
      return json.data?.stat?.view ?? null;
    } catch {
      return null;
    }
  }

  if (p === "youtube") {
    const id = extractYouTubeId(url);
    if (!id) return null;
    try {
      const res = await fetch(`https://www.youtube.com/watch?v=${id}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 86400 },
      });
      if (!res.ok) return null;
      const html = await res.text();
      const match = html.match(/"viewCount":"(\d+)"/);
      return match ? Number(match[1]) : null;
    } catch {
      return null;
    }
  }

  return null;
}
