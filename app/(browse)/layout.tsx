import { BrowseAppShell } from "@/components/layout/BrowseAppShell";
import { getStarterVideosFromDb, getVideosPageFromDb } from "@/db/client";
import { getThumbnailDisplayUrl } from "@/lib/thumbnail";

export const dynamic = "force-static";

export default async function BrowseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Build-time snapshots so home + starter render without waiting on client fetch.
  const [page, starterVideos] = await Promise.all([
    getVideosPageFromDb(12, 0, "approved"),
    getStarterVideosFromDb(),
  ]);
  const videos = page?.videos ?? [];
  const lcpSrc = videos[0]
    ? getThumbnailDisplayUrl(videos[0].thumbnail)
    : null;

  return (
    <>
      {lcpSrc && lcpSrc !== "/placeholder-video.svg" && (
        <link rel="preload" as="image" href={lcpSrc} fetchPriority="high" />
      )}
      <BrowseAppShell
        initialVideos={videos}
        initialTotal={page?.total ?? 0}
        initialStarterVideos={starterVideos ?? []}
      >
        {children}
      </BrowseAppShell>
    </>
  );
}
