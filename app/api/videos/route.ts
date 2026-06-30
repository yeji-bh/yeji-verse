import { NextResponse } from "next/server";
import { mockVideos } from "@/data/mock-videos";
import { getVideosFromDb, insertVideoToDb } from "@/db/client";
import { fetchUrlMetadata } from "@/lib/metadata";
import { getThumbnailUrl } from "@/lib/video-platforms";
import type { SubmitVideoPayload } from "@/lib/types";

let memoryStore = [...mockVideos];

export async function GET() {
  const dbVideos = await getVideosFromDb();
  const videos = dbVideos ?? memoryStore;
  return NextResponse.json(videos);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = body as SubmitVideoPayload & { thumbnail?: string };

    const id = crypto.randomUUID();
    const primaryUrl = payload.sources[0]?.url ?? "";
    let thumbnail = payload.thumbnail || "";

    if (!thumbnail && primaryUrl) {
      const meta = await fetchUrlMetadata(primaryUrl);
      thumbnail = meta.thumbnail ?? getThumbnailUrl(primaryUrl, meta.platform) ?? "";
    }

    const videoData = {
      ...payload,
      id,
      thumbnail,
    };

    const dbVideo = await insertVideoToDb(videoData);

    if (dbVideo) {
      return NextResponse.json(dbVideo, { status: 201 });
    }

    const newVideo = {
      id,
      title: payload.title,
      description: payload.description ?? "",
      category: payload.category,
      tags: payload.tags,
      year: payload.year,
      thumbnail,
      siteViews: 0,
      createdAt: new Date().toISOString(),
      sources: payload.sources.map((s, i) => ({
        id: `${id}-src-${i}`,
        platform: s.platform,
        url: s.url,
        viewCount: null,
        viewCountUpdatedAt: null,
      })),
    };

    memoryStore = [newVideo, ...memoryStore];
    return NextResponse.json(newVideo, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
