import { NextResponse } from "next/server";
import {
  getVideosFromDb,
  insertVideoToDb,
} from "@/db/client";
import { fetchUrlMetadata } from "@/lib/metadata";
import { dedupeTags } from "@/lib/tags";
import { getSessionUser, requireAdmin } from "@/lib/session";
import { getThumbnailUrl } from "@/lib/video-platforms";
import type { SubmitVideoPayload, Video, VideoStatus } from "@/lib/types";

let memoryStore: Video[] = [];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const adminView = searchParams.get("admin") === "true";

  if (adminView) {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const videos = await getVideosFromDb("all");
    return NextResponse.json(videos ?? memoryStore);
  }

  const dbVideos = await getVideosFromDb("approved");
  const videos = (dbVideos ?? memoryStore).filter(
    (v) => v.status === "approved",
  );
  return NextResponse.json(videos);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = body as SubmitVideoPayload & {
      thumbnail?: string;
      direct?: boolean;
    };
    payload.tags = dedupeTags(payload.tags ?? []);

    const session = await getSessionUser();
    const isAdmin = session?.role === "admin";

    const id = crypto.randomUUID();
    const primaryUrl = payload.sources[0]?.url ?? "";
    let thumbnail = payload.thumbnail || "";

    if (!thumbnail && primaryUrl) {
      const meta = await fetchUrlMetadata(primaryUrl);
      thumbnail =
        meta.thumbnail ?? getThumbnailUrl(primaryUrl, meta.platform) ?? "";
    }

    const status: VideoStatus = isAdmin ? "approved" : "pending";
    const year = Number(payload.publishedDate.slice(0, 4));

    const videoData = {
      ...payload,
      id,
      thumbnail,
      description: "",
      status,
      submittedBy: session?.id ?? null,
    };

    const dbVideo = await insertVideoToDb(videoData);

    if (dbVideo) {
      return NextResponse.json(dbVideo, { status: 201 });
    }

    const newVideo: Video = {
      id,
      title: payload.title,
      description: "",
      category: payload.category,
      tags: payload.tags,
      publishedDate: payload.publishedDate,
      year,
      thumbnail,
      siteViews: 0,
      status,
      submittedBy: session?.id ?? null,
      createdAt: new Date().toISOString(),
      sources: payload.sources.map((s, i) => ({
        id: `${id}-src-${i}`,
        platform: s.platform,
        url: s.url,
        viewCount: null,
        viewCountUpdatedAt: null,
      })),
    };

    if (status === "approved") {
      memoryStore = [newVideo, ...memoryStore];
    }

    return NextResponse.json(newVideo, { status: 201 });
  } catch (err) {
    console.error("POST /api/videos failed:", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
