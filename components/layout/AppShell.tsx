"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileFilterDrawer } from "@/components/layout/MobileFilterDrawer";
import { VideoGrid } from "@/components/video/VideoGrid";
import { VideoModal } from "@/components/video/VideoModal";
import { SubmitModal } from "@/components/video/SubmitModal";
import { StarterManageModal } from "@/components/starter/StarterManageModal";
import { useAuth } from "@/components/providers/AuthProvider";
import { useFavorites } from "@/hooks/useFavorites";
import { useFilters } from "@/hooks/useFilters";
import { usePaginatedVideos } from "@/hooks/usePaginatedVideos";
import { getAllTags } from "@/lib/videos";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Video } from "@/lib/types";

interface AppShellProps {
  initialVideos: Video[] | null;
  mode?: "all" | "favorites" | "starter";
  onStarterVideosChange?: (videos: Video[]) => void;
}

export function AppShell({
  initialVideos,
  mode = "all",
  onStarterVideosChange,
}: AppShellProps) {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const paginated = mode === "all" || mode === "favorites";

  const pagination = usePaginatedVideos(paginated);
  const {
    videos: paginatedVideos,
    setVideos: setPaginatedVideos,
    loading: paginatedLoading,
    loadingMore,
    hasMore,
    fullyLoaded,
    total: videoTotal,
    loadMore,
    loadAll,
    reset: resetPagination,
  } = pagination;
  const [starterVideos, setStarterVideos] = useState<Video[]>(initialVideos ?? []);
  const [starterLoading, setStarterLoading] = useState(
    mode === "starter" && initialVideos === null,
  );

  const videos = paginated ? paginatedVideos : starterVideos;
  const loading = paginated ? paginatedLoading : starterLoading;

  const { favorites, toggle, isFavorite, hydrated } = useFavorites();
  const {
    filters,
    filtered,
    toggleCategory,
    clearCategories,
    toggleTag,
    clearTags,
    toggleYear,
    clearYears,
    setSortBy,
    setSortOrder,
    setSearch,
    clearFilters,
    hasActiveFilters,
  } = useFilters(videos, { preserveOrder: mode === "starter" });

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [starterManageOpen, setStarterManageOpen] = useState(false);

  const allTags = getAllTags(videos);

  const displayVideos =
    mode === "favorites" && hydrated
      ? filtered.filter((v) => favorites.includes(v.id))
      : filtered;

  const resultCount =
    paginated && mode === "all" && !hasActiveFilters
      ? videoTotal
      : displayVideos.length;

  const setVideos = paginated ? setPaginatedVideos : setStarterVideos;

  const refreshVideos = useCallback(async () => {
    if (paginated) {
      resetPagination();
      return;
    }
    try {
      const res = await fetch("/api/starter");
      if (res.ok) setStarterVideos(await res.json());
    } catch {
      /* keep current */
    }
  }, [paginated, resetPagination]);

  useEffect(() => {
    setSelectedVideo(null);

    if (paginated) return;

    if (initialVideos !== null) {
      setStarterVideos(initialVideos);
      setStarterLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setStarterLoading(true);
      try {
        const res = await fetch("/api/starter");
        if (!cancelled && res.ok) {
          setStarterVideos(await res.json());
        }
      } catch {
        /* keep current */
      } finally {
        if (!cancelled) setStarterLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialVideos, paginated]);

  useEffect(() => {
    if (!paginated || !hasActiveFilters || fullyLoaded) return;
    void loadAll();
  }, [hasActiveFilters, paginated, fullyLoaded, loadAll]);

  const sidebarProps = {
    filters,
    allTags,
    hideSort: mode === "starter",
    onToggleCategory: toggleCategory,
    onClearCategories: clearCategories,
    onToggleTag: toggleTag,
    onClearTags: clearTags,
    onToggleYear: toggleYear,
    onClearYears: clearYears,
    onSetSortBy: setSortBy,
    onSetSortOrder: setSortOrder,
    onClearFilters: clearFilters,
    hasActiveFilters,
  };

  const emptyMessage =
    mode === "favorites"
      ? t("noFavorites")
      : mode === "starter"
        ? hasActiveFilters
          ? t("noResults")
          : t("starterEmpty")
        : hasActiveFilters
          ? t("noResults")
          : t("noVideos");

  const emptyHint =
    mode === "favorites"
      ? t("noFavoritesHint")
      : mode === "starter" && !hasActiveFilters
        ? t("starterEmptyHint")
        : undefined;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden h-dvh w-64 flex-col border-r border-[var(--color-borderSubtle)] bg-[var(--color-bg)] lg:flex xl:w-72">
        <Sidebar {...sidebarProps} className="min-h-0 flex-1" />
      </aside>

      <div className="flex min-h-screen flex-col min-w-0 lg:ml-64 xl:ml-72">
        <Header
          search={filters.search}
          onSearchChange={setSearch}
          onSubmitClick={() => setSubmitOpen(true)}
          onFilterClick={() => setFilterOpen(true)}
          showFilterButton
        />

        <main className="flex-1 p-4 sm:p-6">
          {mode === "starter" && (
            <header className="mb-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1
                    className="text-2xl font-bold tracking-tight bg-clip-text text-transparent"
                    style={{ backgroundImage: "var(--color-gradient)" }}
                  >
                    {t("starterTitle")}
                  </h1>
                  <p className="mt-1 text-sm text-[var(--color-textMuted)]">
                    {t("starterSubtitle")}
                  </p>
                </div>
                {user?.role === "admin" && (
                  <button
                    type="button"
                    onClick={() => setStarterManageOpen(true)}
                    className="shrink-0 rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-textMuted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    {t("starterManage")}
                  </button>
                )}
              </div>
            </header>
          )}
          {loading ? (
            <div className="flex justify-center py-24">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              <p className="mb-4 text-xs text-[var(--color-textSubtle)]">
                {t("resultsCount", { count: resultCount })}
              </p>
              <VideoGrid
                videos={displayVideos}
                onVideoClick={setSelectedVideo}
                isFavorite={isFavorite}
                onToggleFavorite={toggle}
                emptyMessage={emptyMessage}
                emptyHint={emptyHint}
                hasMore={paginated && hasMore && !hasActiveFilters}
                loadingMore={paginated && loadingMore}
                onLoadMore={paginated ? () => void loadMore() : undefined}
              />
            </>
          )}
        </main>
      </div>

      <MobileFilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        {...sidebarProps}
      />

      <VideoModal
        video={selectedVideo}
        open={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        isFavorite={selectedVideo ? isFavorite(selectedVideo.id) : false}
        onToggleFavorite={() => selectedVideo && toggle(selectedVideo.id)}
        onVideoUpdated={(updated) => {
          setVideos((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
          setSelectedVideo(updated);
        }}
        onVideoDeleted={(id) => {
          setVideos((prev) => prev.filter((v) => v.id !== id));
          setSelectedVideo(null);
        }}
      />

      {mode === "starter" && (
        <StarterManageModal
          open={starterManageOpen}
          onClose={() => setStarterManageOpen(false)}
          currentVideos={starterVideos}
          onUpdated={(updated) => {
            setStarterVideos(updated);
            onStarterVideosChange?.(updated);
          }}
        />
      )}

      <SubmitModal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        onSubmitted={refreshVideos}
      />
    </div>
  );
}
