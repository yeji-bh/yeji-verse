"use client";

import { Modal } from "@/components/ui/Modal";
import { Sidebar } from "./Sidebar";
import { IconClose } from "@/components/ui/IconButton";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { SortOption, VideoFilters } from "@/lib/types";

interface MobileFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: VideoFilters;
  allTags: string[];
  allYears: number[];
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
  const { t } = useLocale();

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="flex items-center justify-between border-b border-[var(--color-borderSubtle)] px-5 py-4">
        <h2 className="text-base font-semibold text-[var(--color-text)]">
          {t("filters")}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-[var(--color-textMuted)] hover:text-[var(--color-text)]"
          aria-label={t("close")}
        >
          <IconClose />
        </button>
      </div>
      <div className="overflow-y-auto p-5 max-h-[70vh]">
        <Sidebar {...sidebarProps} />
      </div>
    </Modal>
  );
}
