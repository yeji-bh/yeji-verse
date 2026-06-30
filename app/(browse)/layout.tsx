import { BrowseAppShell } from "@/components/layout/BrowseAppShell";
import { getStarterVideosFromDb } from "@/db/client";

export default async function BrowseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const starterVideos = await getStarterVideosFromDb();

  return (
    <BrowseAppShell starterVideos={starterVideos}>
      {children}
    </BrowseAppShell>
  );
}
