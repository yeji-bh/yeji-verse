"use client";

import type { ComponentProps } from "react";
import { LeftDrawer } from "@/components/ui/LeftDrawer";
import { Sidebar } from "./Sidebar";

type SidebarFilterProps = Omit<
  ComponentProps<typeof Sidebar>,
  "showBranding" | "className"
>;

interface MobileFilterDrawerProps extends SidebarFilterProps {
  open: boolean;
  onClose: () => void;
}

export function MobileFilterDrawer({
  open,
  onClose,
  ...sidebarProps
}: MobileFilterDrawerProps) {
  return (
    <LeftDrawer open={open} onClose={onClose}>
      <Sidebar {...sidebarProps} showBranding scrollable={false} />
    </LeftDrawer>
  );
}
