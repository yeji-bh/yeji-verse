import { BrowseAppShell } from "@/components/layout/BrowseAppShell";
import { getStarterVideosFromDb, getVideosFromDb } from "@/db/client";

export default async function BrowseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [dbVideos, starterVideos] = await Promise.all([
    getVideosFromDb(),
    getStarterVideosFromDb(),
  ]);

  return (
    <BrowseAppShell allVideos={dbVideos} starterVideos={starterVideos}>
      {children}
    </BrowseAppShell>
  );
}
