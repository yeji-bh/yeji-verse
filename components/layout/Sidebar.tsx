"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/components/providers/AuthProvider";
import { FilterBadgeGroup } from "@/components/ui/FilterBadgeGroup";
import { SortControls } from "@/components/ui/SortControls";
import { CATEGORIES } from "@/lib/constants";
import { getFilterYears } from "@/lib/years";
import type { SortBy, SortOrder, VideoFilters } from "@/lib/types";
import { IconHeart, IconLogout, IconSettings } from "@/components/ui/IconButton";
import { AuthModal } from "@/components/auth/AuthModal";

interface SidebarProps {
  filters: VideoFilters;
  allTags: string[];
  onToggleCategory: (category: string) => void;
  onClearCategories: () => void;
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
  onToggleYear: (year: number) => void;
  onClearYears: () => void;
  onSetSortBy: (sortBy: SortBy) => void;
  onSetSortOrder: (sortOrder: SortOrder) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  showUnwatchedOnly?: boolean;
  onToggleShowUnwatchedOnly?: () => void;
  onClearShowUnwatchedOnly?: () => void;
  showBrowseFilters?: boolean;
  hideSort?: boolean;
  showBranding?: boolean;
  scrollable?: boolean;
  className?: string;
  onNavigate?: () => void;
}

function NavLink({
  href,
  active,
  children,
  onNavigate,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-2.5 rounded-xl py-2.5 px-3 text-sm font-medium transition-colors ${
        active
          ? "bg-[var(--color-accentMuted)] text-[var(--color-accent)]"
          : "text-[var(--color-textMuted)] hover:bg-[var(--color-bgMuted)] hover:text-[var(--color-text)]"
      }`}
    >
      {children}
    </Link>
  );
}

export function Sidebar({
  filters,
  allTags,
  onToggleCategory,
  onClearCategories,
  onToggleTag,
  onClearTags,
  onToggleYear,
  onClearYears,
  onSetSortBy,
  onSetSortOrder,
  onClearFilters,
  hasActiveFilters,
  showUnwatchedOnly = false,
  onToggleShowUnwatchedOnly,
  onClearShowUnwatchedOnly,
  showBrowseFilters = false,
  hideSort = false,
  showBranding = true,
  scrollable = true,
  className = "",
  onNavigate,
}: SidebarProps) {
  const { t } = useTranslation("common");
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const filterYears = getFilterYears();

  const openAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const content = (
    <>
      {showBranding && (
        <div>
          <h1 className="text-lg font-bold tracking-tight">
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--color-gradient)" }}
            >
              {t("siteName")}
            </span>
          </h1>
          <p className="mt-0.5 text-xs text-[var(--color-textSubtle)]">{t("siteTagline")}</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {user ? (
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-xs text-[var(--color-textMuted)]">
              {user.username}
            </span>
            <div className="flex shrink-0 items-center gap-0.5">
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="inline-flex h-9 w-9 items-center justify-center text-[var(--color-textMuted)] hover:text-[var(--color-text)]"
                  aria-label={t("admin")}
                >
                  <IconSettings className="h-5 w-5" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex h-9 w-9 items-center justify-center text-[var(--color-textMuted)] hover:text-[var(--color-text)]"
                aria-label={t("logout")}
              >
                <IconLogout className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => openAuth("login")}
              className="rounded-xl bg-[var(--color-accent)] px-3 py-2.5 text-xs font-medium text-[var(--color-accentText)]"
            >
              {t("login")}
            </button>
            <button
              type="button"
              onClick={() => openAuth("register")}
              className="rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-xs text-[var(--color-textMuted)] hover:border-[var(--color-accent)]"
            >
              {t("register")}
            </button>
          </div>
        )}
      </div>

      <div className="h-px bg-[var(--color-borderSubtle)]" />

      <div className="space-y-1">
        <NavLink href="/" active={pathname === "/"} onNavigate={onNavigate}>
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          {t("allVideos")}
        </NavLink>
        <NavLink href="/starter" active={pathname === "/starter"} onNavigate={onNavigate}>
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
          </svg>
          {t("starterNav")}
        </NavLink>
        <NavLink href="/favorites" active={pathname === "/favorites"} onNavigate={onNavigate}>
          <IconHeart className="h-4 w-4 shrink-0" />
          {t("favorites")}
        </NavLink>
        <NavLink href="/checklist" active={pathname === "/checklist"} onNavigate={onNavigate}>
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          {t("checklist")}
        </NavLink>
      </div>

      <div className="h-px bg-[var(--color-borderSubtle)]" />

      <div className="flex flex-col gap-5 px-3">
        {!hideSort && (
          <SortControls
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSortByChange={onSetSortBy}
            onSortOrderChange={onSetSortOrder}
          />
        )}

        {showBrowseFilters && (
          <>
            <FilterBadgeGroup
              label={t("year")}
              showAll
              allLabel={t("filterAll")}
              onSelectAll={onClearYears}
              items={filterYears.map((y) => ({ value: y, label: String(y) }))}
              selected={filters.years}
              onToggle={onToggleYear}
            />

            <FilterBadgeGroup
              label={t("category")}
              showAll
              allLabel={t("filterAll")}
              onSelectAll={onClearCategories}
              items={CATEGORIES.map((c) => ({ value: c, label: t(c) }))}
              selected={filters.categories}
              onToggle={onToggleCategory}
            />

            <FilterBadgeGroup
              label={t("checklistFilter")}
              showAll
              allLabel={t("checklistFilterAll")}
              onSelectAll={onClearShowUnwatchedOnly}
              items={[{ value: "unwatched", label: t("onlyUnwatched") }]}
              selected={showUnwatchedOnly ? ["unwatched"] : []}
              onToggle={() => onToggleShowUnwatchedOnly?.()}
            />

            <FilterBadgeGroup
              label={t("tags")}
              showAll
              allLabel={t("filterAll")}
              onSelectAll={onClearTags}
              items={allTags.map((tag) => ({ value: tag, label: tag }))}
              selected={filters.tags}
              onToggle={onToggleTag}
            />

            {(hasActiveFilters || showUnwatchedOnly) && (
              <button
                type="button"
                onClick={onClearFilters}
                className="text-xs text-[var(--color-accent)] hover:underline"
              >
                {t("clearFilters")}
              </button>
            )}
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      {scrollable ? (
        <aside className={`min-h-0 flex-1 overflow-y-auto ${className}`}>
          <div className="flex flex-col gap-5 pl-5 pr-5 pb-12 pt-5">{content}</div>
        </aside>
      ) : (
        <aside className={`flex flex-col gap-5 ${className}`}>{content}</aside>
      )}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />
    </>
  );
}
