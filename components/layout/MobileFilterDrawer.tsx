"use client";

import { LeftDrawer } from "@/components/ui/LeftDrawer";
import { Sidebar } from "./Sidebar";
import type { SortOption, VideoFilters } from "@/lib/types";

interface MobileFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: VideoFilters;
  allTags: string[];
  onToggleCategory: (category: string) => void;
  onToggleTag: (tag: string) => void;
  onToggleYear: (year: number) => void;
  onSetSort: (sort: SortOption) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function MobileFilterDrawer({
  open,
  onClose,
  ...sidebarProps
}: MobileFilterDrawerProps) {
  return (
    <LeftDrawer open={open} onClose={onClose}>
      <Sidebar {...sidebarProps} showBranding />
    </LeftDrawer>
  );
}
