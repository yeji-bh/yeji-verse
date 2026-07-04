"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileFilterDrawer } from "@/components/layout/MobileFilterDrawer";
import { VideoGrid } from "@/components/video/VideoGrid";
import { VideoGridSkeleton } from "@/components/video/VideoGridSkeleton";
import { VideoModal } from "@/components/video/VideoModal";
import { ClipList } from "@/components/video/ClipList";
import { SubmitModal } from "@/components/video/SubmitModal";
import { StarterManageModal } from "@/components/starter/StarterManageModal";
import { useAuth } from "@/components/providers/AuthProvider";
import { useFavorites } from "@/hooks/useFavorites";
import { useFilters } from "@/hooks/useFilters";
import { usePaginatedVideos } from "@/hooks/usePaginatedVideos";
import { useFavoriteVideos } from "@/hooks/useFavoriteVideos";
import { useChecklist } from "@/hooks/useChecklist";
import { useClips } from "@/hooks/useClips";
import { useSidebarTags } from "@/hooks/useSidebarTags";
import { getAllTags } from "@/lib/videos";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { BackToTop } from "@/components/ui/BackToTop";
import type { ClipBookmark, Video } from "@/lib/types";

type BrowseMode = "all" | "favorites" | "starter" | "checklist" | "clips";

interface AppShellProps {
  mode?: BrowseMode;
  initialVideos?: Video[];
  initialTotal?: number;
}

export function AppShell({
  mode = "all",
  initialVideos = [],
  initialTotal = 0,
}: AppShellProps) {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const paginated = mode === "all";

  const pagination = usePaginatedVideos(
    paginated,
    paginated && initialVideos.length > 0
      ? { videos: initialVideos, total: initialTotal }
      : null,
  );
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
    abortLoadAll,
  } = pagination;
  const [starterVideos, setStarterVideos] = useState<Video[]>([]);
  const [starterLoading, setStarterLoading] = useState(mode === "starter");
  const [selectedStartSeconds, setSelectedStartSeconds] = useState(0);

  const { favorites, toggle, isFavorite, hydrated } = useFavorites();
  const {
    checkedIds,
    isChecked,
    toggleChecked,
    showUnwatchedOnly,
    setShowUnwatchedOnly,
  } = useChecklist();
  const { clips, hydrated: clipsHydrated, addClip, removeClip } = useClips();
  const clipVideoIds = useMemo(
    () => [...new Set(clips.map((c) => c.videoId))],
    [clips],
  );
  const {
    videos: favoriteVideos,
    setVideos: setFavoriteVideos,
    loading: favoriteLoading,
  } = useFavoriteVideos(favorites, mode === "favorites" && hydrated);
  const {
    videos: checklistVideos,
    setVideos: setChecklistVideos,
    loading: checklistLoading,
  } = useFavoriteVideos(checkedIds, mode === "checklist" && hydrated);
  const {
    videos: clipVideos,
    setVideos: setClipVideos,
    loading: clipVideosLoading,
  } = useFavoriteVideos(clipVideoIds, mode === "clips" && clipsHydrated);

  const videos =
    mode === "checklist"
      ? checklistVideos
      : mode === "favorites"
        ? favoriteVideos
        : mode === "clips"
          ? clipVideos
          : paginated
            ? paginatedVideos
            : starterVideos;
  const loading =
    mode === "checklist"
      ? checklistLoading
      : mode === "favorites"
        ? favoriteLoading
        : mode === "clips"
          ? clipVideosLoading
          : paginated
            ? paginatedLoading
            : starterLoading;

  const {
    filters,
    filtered,
    activeSubcategoryOptions,
    toggleCategory,
    clearCategories,
    toggleSubcategory,
    clearSubcategories,
    toggleTag,
    clearTags,
    toggleYear,
    clearYears,
    setSortBy,
    setSortOrder,
    setSearch,
    clearFilters,
    resetFilters,
    hasActiveFilters,
  } = useFilters(videos, { preserveOrder: mode === "starter" });

  const prevHasActiveFiltersRef = useRef(hasActiveFilters || showUnwatchedOnly);
  const prevModeRef = useRef(mode);
  const prevDefaultSortRef = useRef(true);

  const isDefaultPaginationSort =
    filters.sortBy === "createdAt" && filters.sortOrder === "desc";

  const needsFullCatalog =
    mode === "all" &&
    !hasActiveFilters &&
    !showUnwatchedOnly &&
    !isDefaultPaginationSort;

  const catalogLoading = loading || (needsFullCatalog && !fullyLoaded);
  const showGridSkeleton = catalogLoading && videos.length === 0;

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [randomLoading, setRandomLoading] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [starterManageOpen, setStarterManageOpen] = useState(false);
  const [siteVideoTotal, setSiteVideoTotal] = useState(0);
  const skipFilterScrollRef = useRef(true);
  const { tags: sidebarTags, refresh: refreshSidebarTags } = useSidebarTags();

  const allTags = sidebarTags.length > 0 ? sidebarTags : getAllTags(videos);

  const displayVideos = showUnwatchedOnly
    ? filtered.filter((v) => !isChecked(v.id))
    : filtered;

  const checklistTotal = Math.max(videoTotal, siteVideoTotal);

  const handleClearFilters = useCallback(() => {
    clearFilters();
    setShowUnwatchedOnly(false);
  }, [clearFilters]);

  useEffect(() => {
    if (videoTotal > 0) {
      setSiteVideoTotal(videoTotal);
    }
  }, [videoTotal]);

  useEffect(() => {
    if (skipFilterScrollRef.current) {
      skipFilterScrollRef.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 1023px)").matches) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [
    filters.categories,
    filters.subcategories,
    filters.tags,
    filters.years,
    filters.sortBy,
    filters.sortOrder,
    showUnwatchedOnly,
  ]);

  useEffect(() => {
    if (siteVideoTotal > 0) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/videos?limit=1&offset=0");
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { total: number };
        setSiteVideoTotal(data.total ?? 0);
      } catch {
        /* keep current */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [siteVideoTotal]);

  const resultCount =
    mode === "all" && !hasActiveFilters ? videoTotal : displayVideos.length;

  const setVideos =
    mode === "checklist"
      ? setChecklistVideos
      : mode === "favorites"
        ? setFavoriteVideos
        : mode === "clips"
          ? setClipVideos
          : paginated
            ? setPaginatedVideos
            : setStarterVideos;

  const clipVideosById = useMemo(() => {
    const map = new Map<string, Video>();
    for (const v of clipVideos) map.set(v.id, v);
    return map;
  }, [clipVideos]);

  const displayClips = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    if (!q) return clips;
    return clips.filter((c) => {
      const video = clipVideosById.get(c.videoId);
      return (
        video?.title.toLowerCase().includes(q) ||
        c.note.toLowerCase().includes(q) ||
        video?.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [clips, clipVideosById, filters.search]);

  const openVideo = useCallback((video: Video, startSeconds = 0) => {
    setSelectedStartSeconds(startSeconds);
    setSelectedVideo(video);
  }, []);

  const handleLoadMore = useCallback(() => {
    void loadMore();
  }, [loadMore]);

  const refreshVideos = useCallback(async () => {
    void refreshSidebarTags();
    if (paginated) {
      if (hasActiveFilters || showUnwatchedOnly) {
        await loadAll();
        return;
      }
      resetPagination();
      return;
    }
    try {
      const res = await fetch("/api/starter");
      if (res.ok) setStarterVideos(await res.json());
    } catch {
      /* keep current */
    }
  }, [paginated, hasActiveFilters, showUnwatchedOnly, loadAll, resetPagination, refreshSidebarTags]);

  useEffect(() => {
    if (prevModeRef.current === mode) return;
    prevModeRef.current = mode;
    resetFilters();
    setShowUnwatchedOnly(false);
  }, [mode, resetFilters, setShowUnwatchedOnly]);

  useEffect(() => {
    setSelectedVideo(null);
    setSelectedStartSeconds(0);

    if (mode !== "starter") return;

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
  }, [mode]);

  useEffect(() => {
    if (
      mode !== "all" ||
      (!hasActiveFilters && !showUnwatchedOnly) ||
      fullyLoaded
    ) {
      return;
    }
    void loadAll();
  }, [mode, hasActiveFilters, showUnwatchedOnly, fullyLoaded, loadAll]);

  useEffect(() => {
    if (mode !== "all") return;

    const isDefault = filters.sortBy === "createdAt" && filters.sortOrder === "desc";
    const wasDefault = prevDefaultSortRef.current;
    prevDefaultSortRef.current = isDefault;

    if (!isDefault) {
      if (!fullyLoaded) void loadAll();
      return;
    }

    if (!wasDefault && isDefault && fullyLoaded) {
      resetPagination();
    }
  }, [
    mode,
    filters.sortBy,
    filters.sortOrder,
    fullyLoaded,
    loadAll,
    resetPagination,
  ]);

  useEffect(() => {
    if (mode !== "all") {
      prevHasActiveFiltersRef.current = hasActiveFilters;
      return;
    }

    const wasFiltering = prevHasActiveFiltersRef.current;
    if (wasFiltering && !hasActiveFilters && !showUnwatchedOnly) {
      abortLoadAll();
      if (paginatedVideos.length < videoTotal) {
        resetPagination();
      }
    }

    prevHasActiveFiltersRef.current = hasActiveFilters || showUnwatchedOnly;
  }, [
    mode,
    hasActiveFilters,
    showUnwatchedOnly,
    paginatedVideos.length,
    videoTotal,
    abortLoadAll,
    resetPagination,
  ]);

  const handleRandomVideo = useCallback(async () => {
    if (randomLoading) return;
    setRandomLoading(true);
    try {
      const res = await fetch("/api/videos/random");
      if (!res.ok) return;
      const video = (await res.json()) as Video;
      openVideo(video);
    } catch {
      /* ignore */
    } finally {
      setRandomLoading(false);
    }
  }, [randomLoading, openVideo]);

  const handleClipClick = useCallback(
    (clip: ClipBookmark, video: Video) => {
      openVideo(video, clip.startSeconds);
    },
    [openVideo],
  );

  const sidebarProps = {
    filters,
    allTags,
    showBrowseFilters: mode === "all",
    onToggleCategory: toggleCategory,
    onClearCategories: clearCategories,
    onToggleTag: toggleTag,
    onClearTags: clearTags,
    onToggleYear: toggleYear,
    onClearYears: clearYears,
    onSetSortBy: setSortBy,
    onSetSortOrder: setSortOrder,
    showUnwatchedOnly,
    onClearFilters: handleClearFilters,
    hasActiveFilters,
    onToggleShowUnwatchedOnly: () => setShowUnwatchedOnly((v) => !v),
    onClearShowUnwatchedOnly: () => setShowUnwatchedOnly(false),
    hideSort: mode === "starter" || mode === "clips",
  };

  const showSubcategoryBar =
    mode === "all" && activeSubcategoryOptions.length > 0;

  const emptyMessage =
    mode === "checklist"
      ? t("noChecklist")
      : mode === "favorites"
        ? t("noFavorites")
        : mode === "clips"
          ? t("noClips")
          : mode === "starter"
            ? hasActiveFilters
              ? t("noResults")
              : t("starterEmpty")
            : hasActiveFilters
              ? t("noResults")
              : t("noVideos");

  const emptyHint =
    mode === "checklist"
      ? t("noChecklistHint")
      : mode === "favorites"
        ? t("noFavoritesHint")
        : mode === "clips"
          ? t("noClipsHint")
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
          onRandomClick={handleRandomVideo}
          randomLoading={randomLoading}
          onFilterClick={() => setFilterOpen(true)}
          showFilterButton
        />

        <main className="flex-1 p-4 sm:p-6">
          {mode === "starter" && (
            <header className="mb-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1
                    className="text-base font-bold tracking-tight bg-clip-text text-transparent lg:text-2xl"
                    style={{ backgroundImage: "var(--color-gradient)" }}
                  >
                    {t("starterTitle")}
                  </h1>
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
          {mode === "clips" && (
            <header className="mb-6">
              <h1
                className="text-base font-bold tracking-tight bg-clip-text text-transparent lg:text-2xl"
                style={{ backgroundImage: "var(--color-gradient)" }}
              >
                {t("clipsTitle")}
              </h1>
              <p className="mt-1 text-sm text-[var(--color-textMuted)]">
                {t("clipsSubtitle")}
              </p>
            </header>
          )}
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-xs text-[var(--color-textSubtle)]">
              {showGridSkeleton
                ? t("loading")
                : mode === "checklist"
                  ? t("checklistProgress", {
                      completed: checkedIds.length,
                      total: checklistTotal,
                    })
                  : mode === "clips"
                    ? t("clipsCount", { count: displayClips.length })
                    : t("resultsCount", { count: resultCount })}
            </p>
            {mode === "all" && (hasActiveFilters || showUnwatchedOnly) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="shrink-0 text-xs font-medium text-[var(--color-accent)] lg:hidden"
              >
                {t("clearFilters")}
              </button>
            )}
          </div>
          {showSubcategoryBar && (
            <div className="mb-4 flex flex-wrap items-center gap-1.5">
              <Badge
                active={filters.subcategories.length === 0}
                onClick={clearSubcategories}
              >
                {t("filterAll")}
              </Badge>
              {activeSubcategoryOptions.map((s) => (
                <Badge
                  key={s}
                  active={filters.subcategories.includes(s)}
                  onClick={() => toggleSubcategory(s)}
                >
                  {t(s)}
                </Badge>
              ))}
            </div>
          )}
          {showGridSkeleton ? (
            <VideoGridSkeleton />
          ) : mode === "clips" ? (
            <ClipList
              clips={displayClips}
              videosById={clipVideosById}
              onClipClick={handleClipClick}
              onRemove={(id) => void removeClip(id)}
              emptyMessage={
                clips.length > 0 && displayClips.length === 0
                  ? t("noResults")
                  : emptyMessage
              }
              emptyHint={
                clips.length > 0 && displayClips.length === 0
                  ? undefined
                  : emptyHint
              }
            />
          ) : (
            <VideoGrid
              videos={displayVideos}
              onVideoClick={(v) => openVideo(v)}
              isChecked={isChecked}
              onToggleChecked={toggleChecked}
              emptyMessage={emptyMessage}
              emptyHint={emptyHint}
              hasMore={
                mode === "all" &&
                hasMore &&
                !hasActiveFilters &&
                !showUnwatchedOnly &&
                isDefaultPaginationSort
              }
              loadingMore={mode === "all" && loadingMore}
              onLoadMore={mode === "all" ? handleLoadMore : undefined}
            />
          )}
          {catalogLoading && videos.length > 0 && (
            <div className="flex justify-center py-6">
              <LoadingSpinner size="md" />
            </div>
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
        onClose={() => {
          setSelectedVideo(null);
          setSelectedStartSeconds(0);
        }}
        isFavorite={selectedVideo ? isFavorite(selectedVideo.id) : false}
        onToggleFavorite={() => selectedVideo && toggle(selectedVideo.id)}
        isChecked={selectedVideo ? isChecked(selectedVideo.id) : false}
        onToggleChecked={() => selectedVideo && void toggleChecked(selectedVideo.id)}
        onSelectVideo={(v) => openVideo(v)}
        startSeconds={selectedStartSeconds}
        onAddClip={(startSeconds, note) => {
          if (selectedVideo) void addClip(selectedVideo.id, startSeconds, note);
        }}
        onVideoUpdated={(updated) => {
          setVideos((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
          setSelectedVideo(updated);
        }}
        onVideoDeleted={(id) => {
          setVideos((prev) => prev.filter((v) => v.id !== id));
          setSelectedVideo(null);
          setSelectedStartSeconds(0);
        }}
      />

      {mode === "starter" && (
        <StarterManageModal
          open={starterManageOpen}
          onClose={() => setStarterManageOpen(false)}
          currentVideos={starterVideos}
          onUpdated={(updated) => {
            setStarterVideos(updated);
          }}
        />
      )}

      <SubmitModal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        onSubmitted={refreshVideos}
      />

      <BackToTop />
    </div>
  );
}
