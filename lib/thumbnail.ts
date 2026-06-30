const HDSLB_RE = /(?:^https?:)?\/\/[^/]*hdslb\.com\//i;

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

/** 前端顯示：B 站 CDN 走同源 proxy，避免瀏覽器直接請求被 403 */
export function getThumbnailDisplayUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder-video.svg";
  if (isBilibiliCdnUrl(url)) {
    return `/api/thumbnail?url=${encodeURIComponent(url)}`;
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
