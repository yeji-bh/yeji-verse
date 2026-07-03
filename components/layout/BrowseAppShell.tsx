"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

type BrowseMode = "all" | "favorites" | "starter" | "checklist";

function getMode(pathname: string): BrowseMode {
  if (pathname === "/favorites") return "favorites";
  if (pathname === "/starter") return "starter";
  if (pathname === "/checklist") return "checklist";
  return "all";
}

export function BrowseAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mode = getMode(pathname);

  return (
    <>
      <AppShell mode={mode} />
      {children}
    </>
  );
}
