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

    const trimmed = value.trim();
    if (!trimmed) return null;

    // Unix timestamp as string (Bilibili page JSON)
    if (/^\d{9,13}$/.test(trimmed)) {
      return toPublishedDateString(Number(trimmed));
    }

    const ymd = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    if (ymd) return ymd[1];

    const d = new Date(trimmed);
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

async function fetchBilibiliFromPage(url: string): Promise<{
  title: string | null;
  description: string | null;
  thumbnail: string | null;
  publishedDate: string | null;
}> {
  try {
    const res = await fetch(url, {
      headers: {
        ...BILIBILI_HEADERS,
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) {
      return { title: null, description: null, thumbnail: null, publishedDate: null };
    }
    const html = await res.text();
    const pick = (property: string) => {
      const re = new RegExp(
        `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
        "i",
      );
      const reAlt = new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
        "i",
      );
      return html.match(re)?.[1] ?? html.match(reAlt)?.[1] ?? null;
    };

    const rawTitle =
      pick("og:title") ??
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ??
      null;
    const title = rawTitle
      ? rawTitle
          .replace(/\s*[|_].*哔哩哔哩.*$/i, "")
          .replace(/\s*[|_]\s*bilibili\s*$/i, "")
          .trim() || null
      : null;

    const description =
      pick("og:description") ??
      pick("description") ??
      html.match(/"desc"\s*:\s*"((?:\\.|[^"\\])*)"/)?.[1]?.replace(/\\n/g, "\n").replace(/\\"/g, '"') ??
      null;

    // og:image is often a tiny @100w variant — strip size suffix for full cover.
    const rawImage = pick("og:image");
    const imageBase = rawImage
      ? rawImage.replace(/^\/\//, "https://").split("@")[0]
      : null;
    const thumbnail = normalizeImageUrl(imageBase);

    const rawDate =
      html.match(/itemprop=["']uploadDate["'][^>]*content=["']([^"']+)["']/i)?.[1] ??
      html.match(/content=["']([^"']+)["'][^>]*itemprop=["']uploadDate["']/i)?.[1] ??
      pick("og:video:release_date") ??
      html.match(/"pubdate"\s*:\s*(\d+)/)?.[1] ??
      html.match(/"publish_time"\s*:\s*"?(\d+)"?/)?.[1] ??
      null;
    const publishedDate = rawDate ? toPublishedDateString(rawDate) : null;

    return { title, description, thumbnail, publishedDate };
  } catch {
    return { title: null, description: null, thumbnail: null, publishedDate: null };
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
    if (res.ok) {
      const json = (await res.json()) as {
        code?: number;
        data?: { title?: string; desc?: string; pic?: string; pubdate?: number };
      };
      if (json.code === 0 && json.data) {
        return {
          title: json.data.title ?? null,
          description: json.data.desc?.trim() || null,
          thumbnail: normalizeImageUrl(json.data.pic),
          publishedDate:
            json.data.pubdate != null
              ? toPublishedDateString(json.data.pubdate)
              : null,
        };
      }
    }
  } catch {
    /* fall through to page scrape — api.bilibili.com is often blocked on edge */
  }

  const pageUrls = ids.bvid
    ? [
        `https://www.bilibili.com/video/${ids.bvid}`,
        `https://m.bilibili.com/video/${ids.bvid}`,
      ]
    : [
        `https://www.bilibili.com/video/av${ids.aid}`,
        `https://m.bilibili.com/video/av${ids.aid}`,
      ];

  for (const pageUrl of pageUrls) {
    const scraped = await fetchBilibiliFromPage(pageUrl);
    if (scraped.title || scraped.thumbnail) return scraped;
  }

  return { title: null, description: null, thumbnail: null, publishedDate: null };
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
