"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import type { Video } from "@/lib/types";

type BrowseMode = "all" | "favorites" | "starter";

function getMode(pathname: string): BrowseMode {
  if (pathname === "/favorites") return "favorites";
  if (pathname === "/starter") return "starter";
  return "all";
}

interface BrowseAppShellProps {
  starterVideos: Video[] | null;
  children: React.ReactNode;
}

export function BrowseAppShell({
  starterVideos: serverStarterVideos,
  children,
}: BrowseAppShellProps) {
  const pathname = usePathname();
  const mode = getMode(pathname);
  const [starterVideos, setStarterVideos] = useState<Video[] | null>(
    serverStarterVideos,
  );

  useEffect(() => {
    setStarterVideos(serverStarterVideos);
  }, [serverStarterVideos]);

  const initialVideos = mode === "starter" ? starterVideos : null;

  return (
    <>
      <AppShell
        initialVideos={initialVideos}
        mode={mode}
        onStarterVideosChange={(videos) => setStarterVideos(videos)}
      />
      {children}
    </>
  );
}
