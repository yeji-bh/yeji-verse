import { NextResponse } from "next/server";
import { isAllowedThumbnailProxyUrl } from "@/lib/thumbnail";

const BILIBILI_HEADERS = {
  Referer: "https://www.bilibili.com",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

const FETCH_TIMEOUT_MS = 8_000;

function candidateUrls(url: string): string[] {
  const urls = [url];
  if (url.startsWith("http://")) {
    urls.push(`https://${url.slice("http://".length)}`);
  } else if (url.startsWith("https://")) {
    urls.push(`http://${url.slice("https://".length)}`);
  }
  return urls;
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

  if (!url || !isAllowedThumbnailProxyUrl(url)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  let lastError: unknown;

  for (const candidate of candidateUrls(url)) {
    try {
      const upstream = await fetchUpstream(candidate);
      if (!upstream.ok) {
        lastError = new Error(`Upstream ${upstream.status}`);
        continue;
      }

      const body = await upstream.arrayBuffer();
      const contentType = upstream.headers.get("content-type") ?? "image/jpeg";

      return new NextResponse(body, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
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
