import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { mockVideos } from "@/data/mock-videos";
import { getVideosFromDb } from "@/db/client";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "我的收藏",
  description: "你收藏的黃禮志影片列表。",
  alternates: { canonical: "/favorites" },
});

export default async function FavoritesPage() {
  const dbVideos = await getVideosFromDb();
  const videos = dbVideos ?? mockVideos;

  return <AppShell initialVideos={videos} mode="favorites" />;
}
