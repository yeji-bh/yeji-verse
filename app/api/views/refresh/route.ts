import { NextResponse } from "next/server";
import { fetchPlatformViewCount } from "@/lib/metadata";
import { getVideosFromDb, updateSourceViewCount } from "@/db/client";
import { mockVideos } from "@/data/mock-videos";

export async function POST() {
  const videos = (await getVideosFromDb()) ?? mockVideos;
  const updated: { sourceId: string; viewCount: number | null }[] = [];

  for (const video of videos) {
    for (const source of video.sources) {
      const count = await fetchPlatformViewCount(source.url, source.platform);
      if (count !== null) {
        await updateSourceViewCount(source.id, count);
        updated.push({ sourceId: source.id, viewCount: count });
      }
    }
  }

  return NextResponse.json({
    updated: updated.length,
    details: updated,
  });
}
