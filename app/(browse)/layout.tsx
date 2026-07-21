import { unstable_cache } from "next/cache";
import { BrowseAppShell } from "@/components/layout/BrowseAppShell";
import { getStarterVideosFromDb, getVideosPageFromDb } from "@/db/client";
import { getThumbnailDisplayUrl } from "@/lib/thumbnail";

// Build has no Turso credentials — force-static baked empty HTML and hurt LCP.
export const dynamic = "force-dynamic";

const getCachedBrowseSnapshot = unstable_cache(
  async () => {
    const [page, starterVideos] = await Promise.all([
      getVideosPageFromDb(12, 0, "approved"),
      getStarterVideosFromDb(),
    ]);
    return { page, starterVideos };
  },
  ["browse-layout-snapshot"],
  { revalidate: 600 },
);

export default async function BrowseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { page, starterVideos } = await getCachedBrowseSnapshot();
  const videos = page?.videos ?? [];
  const lcpCandidates = videos.slice(0, 4);

  return (
    <>
      {lcpCandidates.map((video, index) => {
        const src = getThumbnailDisplayUrl(video.thumbnail);
        if (src === "/placeholder-video.svg") return null;
        return (
          <link
            key={video.id}
            rel="preload"
            as="image"
            href={src}
            fetchPriority={index === 0 ? "high" : "low"}
          />
        );
      })}
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
