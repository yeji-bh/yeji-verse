import { AppShell } from "@/components/layout/AppShell";
import { mockVideos } from "@/data/mock-videos";
import { getVideosFromDb } from "@/db/client";

export default async function FavoritesPage() {
  const dbVideos = await getVideosFromDb();
  const videos = dbVideos ?? mockVideos;

  return <AppShell initialVideos={videos} mode="favorites" />;
}
