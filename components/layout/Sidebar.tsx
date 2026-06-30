"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/providers/LocaleProvider";
import { FilterBadgeGroup } from "@/components/ui/FilterBadgeGroup";
import { CATEGORIES, SORT_OPTIONS } from "@/lib/constants";
import type { SortOption, VideoFilters } from "@/lib/types";
import { IconHeart } from "@/components/ui/IconButton";

interface SidebarProps {
  filters: VideoFilters;
  allTags: string[];
  allYears: number[];
  onToggleCategory: (category: string) => void;
  onToggleTag: (tag: string) => void;
  onToggleYear: (year: number) => void;
  onSetSort: (sort: SortOption) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  className?: string;
}

export function Sidebar({
  filters,
  allTags,
  allYears,
  onToggleCategory,
  onToggleTag,
  onToggleYear,
  onSetSort,
  onClearFilters,
  hasActiveFilters,
  className = "",
}: SidebarProps) {
  const { t, categoryLabel, sortLabel } = useLocale();
  const pathname = usePathname();

  return (
    <aside
      className={`flex flex-col gap-6 overflow-y-auto ${className}`}
    >
      <div className="space-y-1">
        <Link
          href="/"
          className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
            pathname === "/"
              ? "bg-[var(--color-accentMuted)] text-[var(--color-accent)]"
              : "text-[var(--color-textMuted)] hover:bg-[var(--color-bgMuted)] hover:text-[var(--color-text)]"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          {t("allVideos")}
        </Link>
        <Link
          href="/favorites"
          className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
            pathname === "/favorites"
              ? "bg-[var(--color-accentMuted)] text-[var(--color-accent)]"
              : "text-[var(--color-textMuted)] hover:bg-[var(--color-bgMuted)] hover:text-[var(--color-text)]"
          }`}
        >
          <IconHeart className="h-4 w-4" />
          {t("favorites")}
        </Link>
      </div>

      <div className="h-px bg-[var(--color-borderSubtle)]" />

      <FilterBadgeGroup
        label={t("category")}
        items={CATEGORIES.map((c) => ({
          value: c,
          label: categoryLabel(c),
        }))}
        selected={filters.categories}
        onToggle={onToggleCategory}
      />

      {allTags.length > 0 && (
        <FilterBadgeGroup
          label={t("tags")}
          items={allTags.map((tag) => ({ value: tag, label: tag }))}
          selected={filters.tags}
          onToggle={onToggleTag}
        />
      )}

      {allYears.length > 0 && (
        <FilterBadgeGroup
          label={t("year")}
          items={allYears.map((y) => ({
            value: y,
            label: String(y),
          }))}
          selected={filters.years}
          onToggle={onToggleYear}
        />
      )}

      <FilterBadgeGroup
        label={t("sort")}
        items={SORT_OPTIONS.map((s) => ({
          value: s,
          label: sortLabel(s),
        }))}
        selected={[filters.sort]}
        onToggle={(sort) => onSetSort(sort as SortOption)}
        single
      />

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="text-xs text-[var(--color-accent)] hover:underline"
        >
          {t("clearFilters")}
        </button>
      )}
    </aside>
  );
}
