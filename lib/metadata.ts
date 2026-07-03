import { detectPlatform, extractBilibiliId, extractYouTubeId, getEmbedUrl, getThumbnailUrl } from "./video-platforms";
import { normalizeStoredThumbnail } from "./thumbnail";
import type { VideoMetadata } from "./types";

const BILIBILI_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Referer: "https://www.bilibili.com",
};

/** 正規化為 yyyy-mm-dd */
export function toPublishedDateString(value: string | number): string | null {
  try {
    if (typeof value === "number") {
      const ms = value > 1e12 ? value : value * 1000;
      const d = new Date(ms);
      if (Number.isNaN(d.getTime())) return null;
      return d.toISOString().slice(0, 10);
    }

    const ymd = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (ymd) return ymd[1];

    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

export function normalizeImageUrl(url: string | null | undefined): string | null {
  return normalizeStoredThumbnail(url);
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

async function fetchYouTubePublishedDate(videoId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;

    const html = await res.text();
    const match =
      html.match(/"publishDate":"(\d{4}-\d{2}-\d{2})/) ??
      html.match(/"datePublished":"(\d{4}-\d{2}-\d{2})/) ??
      html.match(/"uploadDate":"(\d{4}-\d{2}-\d{2})/);

    return match ? toPublishedDateString(match[1]) : null;
  } catch {
    return null;
  }
}

function decodeYouTubeJsonString(value: string): string {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\")
    .trim();
}

async function fetchYouTubeDescription(videoId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;

    const html = await res.text();
    const shortMatch = html.match(/"shortDescription":"((?:\\.|[^"\\])*)"/);
    if (shortMatch) return decodeYouTubeJsonString(shortMatch[1]) || null;

    const simpleMatch = html.match(/"description":\{"simpleText":"((?:\\.|[^"\\])*)"/);
    if (simpleMatch) return decodeYouTubeJsonString(simpleMatch[1]) || null;

    return null;
  } catch {
    return null;
  }
}

async function fetchBilibiliView(url: string): Promise<{
  title: string | null;
  description: string | null;
  thumbnail: string | null;
  publishedDate: string | null;
}> {
  const ids = extractBilibiliId(url);
  if (!ids) return { title: null, description: null, thumbnail: null, publishedDate: null };

  const param = ids.bvid ? `bvid=${ids.bvid}` : `aid=${ids.aid}`;
  try {
    const res = await fetch(
      `https://api.bilibili.com/x/web-interface/view?${param}`,
      {
        headers: BILIBILI_HEADERS,
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return { title: null, description: null, thumbnail: null, publishedDate: null };
    const json = (await res.json()) as {
      code?: number;
      data?: { title?: string; desc?: string; pic?: string; pubdate?: number };
    };
    if (json.code !== 0 || !json.data) {
      return { title: null, description: null, thumbnail: null, publishedDate: null };
    }
    return {
      title: json.data.title ?? null,
      description: json.data.desc?.trim() || null,
      thumbnail: normalizeImageUrl(json.data.pic),
      publishedDate:
        json.data.pubdate != null
          ? toPublishedDateString(json.data.pubdate)
          : null,
    };
  } catch {
    return { title: null, description: null, thumbnail: null, publishedDate: null };
  }
}

export async function fetchBilibiliThumbnail(url: string): Promise<string | null> {
  const { thumbnail } = await fetchBilibiliView(url);
  return thumbnail;
}

export async function fetchUrlMetadata(url: string): Promise<VideoMetadata> {
  const platform = detectPlatform(url);
  let title: string | null = null;
  let description: string | null = null;
  let thumbnail: string | null = null;
  let publishedDate: string | null = null;

  if (platform === "youtube") {
    const id = extractYouTubeId(url);
    thumbnail = getThumbnailUrl(url, platform);
    const [ytTitle, ytDate, ytDescription] = await Promise.all([
      fetchYouTubeTitle(url),
      id ? fetchYouTubePublishedDate(id) : Promise.resolve(null),
      id ? fetchYouTubeDescription(id) : Promise.resolve(null),
    ]);
    title = ytTitle;
    publishedDate = ytDate;
    description = ytDescription;
  } else if (platform === "bilibili") {
    const meta = await fetchBilibiliView(url);
    title = meta.title;
    description = meta.description;
    thumbnail = meta.thumbnail;
    publishedDate = meta.publishedDate;
  } else {
    thumbnail = getThumbnailUrl(url, platform);
  }

  return {
    title,
    description,
    thumbnail: normalizeImageUrl(thumbnail),
    platform,
    embedUrl: getEmbedUrl(url, platform),
    publishedDate,
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
