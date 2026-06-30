import { detectPlatform, extractBilibiliId, extractYouTubeId, getEmbedUrl, getThumbnailUrl } from "./video-platforms";
import type { VideoMetadata } from "./types";

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

async function fetchBilibiliMeta(url: string): Promise<{ title: string | null; thumbnail: string | null }> {
  const ids = extractBilibiliId(url);
  if (!ids) return { title: null, thumbnail: null };

  const param = ids.bvid ? `bvid=${ids.bvid}` : `aid=${ids.aid}`;
  try {
    const res = await fetch(`https://api.bilibili.com/x/web-interface/view?${param}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { title: null, thumbnail: null };
    const json = (await res.json()) as {
      data?: { title?: string; pic?: string };
    };
    return {
      title: json.data?.title ?? null,
      thumbnail: json.data?.pic ?? null,
    };
  } catch {
    return { title: null, thumbnail: null };
  }
}

export async function fetchUrlMetadata(url: string): Promise<VideoMetadata> {
  const platform = detectPlatform(url);
  let title: string | null = null;
  let thumbnail = getThumbnailUrl(url, platform);

  if (platform === "youtube") {
    title = await fetchYouTubeTitle(url);
  } else if (platform === "bilibili") {
    const meta = await fetchBilibiliMeta(url);
    title = meta.title;
    thumbnail = meta.thumbnail ?? thumbnail;
  }

  return {
    title,
    thumbnail,
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
        next: { revalidate: 3600 },
      });
      if (!res.ok) return null;
      const json = (await res.json()) as { data?: { stat?: { view?: number } } };
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
