"use client";

import { useTranslation } from "react-i18next";
import { SORT_BY_OPTIONS } from "@/lib/constants";
import type { SortBy, SortOrder } from "@/lib/types";

interface SortControlsProps {
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSortByChange: (sortBy: SortBy) => void;
  onSortOrderChange: (sortOrder: SortOrder) => void;
}

const sortByLabelKey: Record<SortBy, string> = {
  createdAt: "sortByCreatedAt",
  title: "sortByTitle",
};

export function SortControls({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
}: SortControlsProps) {
  const { t } = useTranslation("common");

  const toggleOrder = () => {
    onSortOrderChange(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="space-y-2.5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-textSubtle)]">
        {t("sort")}
      </h3>
      <div className="flex gap-2">
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as SortBy)}
          className="select-control min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          aria-label={t("sortByLabel")}
        >
          {SORT_BY_OPTIONS.map((field) => (
            <option key={field} value={field}>
              {t(sortByLabelKey[field])}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={toggleOrder}
          className="inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-input)] text-sm font-medium text-[var(--color-textMuted)] hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
          aria-label={sortOrder === "asc" ? t("sortAsc") : t("sortDesc")}
          title={sortOrder === "asc" ? t("sortAsc") : t("sortDesc")}
        >
          {sortOrder === "asc" ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0-4 4m4-4 4 4" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0 4-4m-4 4-4-4" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
