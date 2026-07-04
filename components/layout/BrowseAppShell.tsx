"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import type { Video } from "@/lib/types";

type BrowseMode = "all" | "favorites" | "starter" | "checklist" | "clips";

function getMode(pathname: string): BrowseMode {
  if (pathname === "/favorites") return "favorites";
  if (pathname === "/starter") return "starter";
  if (pathname === "/checklist") return "checklist";
  if (pathname === "/clips") return "clips";
  return "all";
}

interface BrowseAppShellProps {
  children: React.ReactNode;
  initialVideos?: Video[];
  initialTotal?: number;
}

export function BrowseAppShell({
  children,
  initialVideos = [],
  initialTotal = 0,
}: BrowseAppShellProps) {
  const pathname = usePathname();
  const mode = getMode(pathname);

  return (
    <>
      <AppShell
        mode={mode}
        initialVideos={initialVideos}
        initialTotal={initialTotal}
      />
      {children}
    </>
  );
}
