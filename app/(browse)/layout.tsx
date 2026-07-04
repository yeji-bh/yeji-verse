import { BrowseAppShell } from "@/components/layout/BrowseAppShell";
import { getVideosPageFromDb } from "@/db/client";
import { getThumbnailDisplayUrl } from "@/lib/thumbnail";

export const dynamic = "force-static";

export default async function BrowseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Build-time snapshot for LCP: first page of videos is in the HTML so the
  // largest image is discoverable without waiting on client JS + API.
  const page = await getVideosPageFromDb(12, 0, "approved");
  const videos = page?.videos ?? [];
  const lcpSrc = videos[0]
    ? getThumbnailDisplayUrl(videos[0].thumbnail)
    : null;

  return (
    <>
      {lcpSrc && lcpSrc !== "/placeholder-video.svg" && (
        <link rel="preload" as="image" href={lcpSrc} fetchPriority="high" />
      )}
      <BrowseAppShell initialVideos={videos} initialTotal={page?.total ?? 0}>
        {children}
      </BrowseAppShell>
    </>
  );
}
