import { NextResponse } from "next/server";
import {
  bilibiliSizedUrl,
  isAllowedThumbnailProxyUrl,
  THUMB_DISPLAY_WIDTH,
} from "@/lib/thumbnail";

const BILIBILI_HEADERS = {
  Referer: "https://www.bilibili.com",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

const FETCH_TIMEOUT_MS = 8_000;
const CACHE_CONTROL =
  "public, max-age=604800, stale-while-revalidate=2592000, immutable";

function withProtocolFallbacks(url: string): string[] {
  if (url.startsWith("http://")) {
    return [url, `https://${url.slice("http://".length)}`];
  }
  if (url.startsWith("https://")) {
    return [url, `http://${url.slice("https://".length)}`];
  }
  return [url];
}

function candidateUrls(url: string, width: number): string[] {
  const sized = bilibiliSizedUrl(url, width);
  const out: string[] = [];
  for (const candidate of sized) {
    for (const withProto of withProtocolFallbacks(candidate)) {
      out.push(withProto);
    }
  }
  return out;
}

async function fetchUpstream(url: string): Promise<Response> {
  return fetch(url, {
    headers: BILIBILI_HEADERS,
    cache: "no-store",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    redirect: "follow",
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const width = Math.min(
    Math.max(Number(searchParams.get("w")) || THUMB_DISPLAY_WIDTH, 320),
    1280,
  );

  if (!url || !isAllowedThumbnailProxyUrl(url)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  let lastError: unknown;

  for (const candidate of candidateUrls(url, width)) {
    try {
      const upstream = await fetchUpstream(candidate);
      if (!upstream.ok) {
        lastError = new Error(`Upstream ${upstream.status}`);
        continue;
      }

      const contentType = upstream.headers.get("content-type") ?? "";
      // Skip HTML error pages sometimes returned by CDN
      if (contentType.includes("text/html")) {
        lastError = new Error("Unexpected HTML response");
        continue;
      }

      const body = await upstream.arrayBuffer();
      if (body.byteLength < 100) {
        lastError = new Error("Empty body");
        continue;
      }

      return new NextResponse(body, {
        headers: {
          "Content-Type": contentType || "image/jpeg",
          "Cache-Control": CACHE_CONTROL,
        },
      });
    } catch (err) {
      lastError = err;
    }
  }

  const timedOut =
    lastError instanceof Error &&
    (lastError.name === "TimeoutError" || lastError.name === "AbortError");

  return NextResponse.json(
    { error: timedOut ? "Upstream timeout" : "Fetch failed" },
    { status: 502 },
  );
}
