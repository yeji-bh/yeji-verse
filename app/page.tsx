import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { mockVideos } from "@/data/mock-videos";
import { getVideosFromDb } from "@/db/client";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "全部影片",
  description:
    "瀏覽黃禮志全部影片：Vlog、直拍、舞台、綜藝、Cover 等，可依分類、標籤與年份篩選。",
  alternates: { canonical: "/" },
});

export default async function HomePage() {
  const dbVideos = await getVideosFromDb();
  const videos = dbVideos ?? mockVideos;

  return <AppShell initialVideos={videos} />;
}
