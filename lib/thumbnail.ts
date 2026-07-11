const HDSLB_RE = /(?:^https?:)?\/\/[^/]*hdslb\.com\//i;

/** ~184px card × 2 DPR on mobile; 480 still sharp on desktop 3–4 col grids. */
export const THUMB_DISPLAY_WIDTH = 480;

export function isBilibiliCdnUrl(url: string): boolean {
  return HDSLB_RE.test(url);
}

/** 儲存用：B 站封面保留 API 回傳的 http 格式 */
export function normalizeStoredThumbnail(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  if (isBilibiliCdnUrl(url)) {
    return url.replace(/^https:\/\//i, "http://").replace(/^\/\//, "http://");
  }
  return url.replace(/^http:\/\//i, "https://");
}

/**
 * Prefer a smaller Bilibili CDN variant for list cards.
 * Falls back to the original URL if the sized variant is unavailable (handled by proxy).
 */
export function bilibiliSizedUrl(
  url: string,
  width = THUMB_DISPLAY_WIDTH,
): string[] {
  const base = url.split("@")[0] ?? url;
  const w = Math.min(Math.max(width, 320), 1280);
  const h = Math.round((w * 9) / 16);
  return [
    `${base}@${w}w_${h}h_1c.webp`,
    `${base}@${w}w_${h}h_1c.jpg`,
    `${base}@${w}w.webp`,
    base,
  ];
}

/** 前端顯示：B 站 CDN 走同源 proxy，避免瀏覽器直接請求被 403 */
export function getThumbnailDisplayUrl(
  url: string | null | undefined,
  width = THUMB_DISPLAY_WIDTH,
): string {
  if (!url) return "/placeholder-video.svg";
  if (isBilibiliCdnUrl(url)) {
    return `/api/thumbnail?url=${encodeURIComponent(url)}&w=${width}`;
  }
  // YouTube: prefer mqdefault (320x180) over hq/maxres for cards
  if (/img\.youtube\.com\/vi\//i.test(url) || /i\.ytimg\.com\/vi\//i.test(url)) {
    return url
      .replace(/\/(maxresdefault|sddefault|hqdefault)\.jpg/i, "/mqdefault.jpg")
      .replace(/^http:\/\//i, "https://");
  }
  return url;
}

export function isAllowedThumbnailProxyUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      /\.hdslb\.com$/i.test(parsed.hostname)
    );
  } catch {
    return false;
  }
}
