"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileFilterDrawer } from "@/components/layout/MobileFilterDrawer";
import { VideoGrid } from "@/components/video/VideoGrid";
import { VideoModal } from "@/components/video/VideoModal";
import { SubmitModal } from "@/components/video/SubmitModal";
import { useFavorites } from "@/hooks/useFavorites";
import { useFilters } from "@/hooks/useFilters";
import { getAllTags } from "@/data/mock-videos";
import type { Video } from "@/lib/types";

interface AppShellProps {
  initialVideos: Video[];
  mode?: "all" | "favorites";
}

export function AppShell({ initialVideos, mode = "all" }: AppShellProps) {
  const { t } = useTranslation("common");
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const { favorites, toggle, isFavorite, hydrated } = useFavorites();
  const {
    filters,
    filtered,
    toggleCategory,
    toggleTag,
    toggleYear,
    setSort,
    setSearch,
    clearFilters,
    hasActiveFilters,
  } = useFilters(videos);

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const allTags = getAllTags(videos);

  const displayVideos =
    mode === "favorites" && hydrated
      ? filtered.filter((v) => favorites.includes(v.id))
      : filtered;

  const refreshVideos = useCallback(async () => {
    try {
      const res = await fetch("/api/videos");
      if (res.ok) setVideos(await res.json());
    } catch {
      /* keep current */
    }
  }, []);

  useEffect(() => {
    refreshVideos();
  }, [refreshVideos]);

  const sidebarProps = {
    filters,
    allTags,
    onToggleCategory: toggleCategory,
    onToggleTag: toggleTag,
    onToggleYear: toggleYear,
    onSetSort: setSort,
    onClearFilters: clearFilters,
    hasActiveFilters,
  };

  const emptyMessage =
    mode === "favorites"
      ? t("noFavorites")
      : hasActiveFilters
        ? t("noResults")
        : t("noVideos");

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <div className="hidden lg:flex w-64 xl:w-72 shrink-0 flex-col border-r border-[var(--color-borderSubtle)] p-5">
        <Sidebar {...sidebarProps} className="flex-1" />
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        <Header
          search={filters.search}
          onSearchChange={setSearch}
          onSubmitClick={() => setSubmitOpen(true)}
          onFilterClick={() => setFilterOpen(true)}
          showFilterButton
        />

        <main className="flex-1 p-4 sm:p-6">
          <p className="mb-4 text-xs text-[var(--color-textSubtle)]">
            {t("resultsCount", { count: displayVideos.length })}
          </p>
          <VideoGrid
            videos={displayVideos}
            onVideoClick={setSelectedVideo}
            isFavorite={isFavorite}
            onToggleFavorite={toggle}
            emptyMessage={emptyMessage}
            emptyHint={mode === "favorites" ? t("noFavoritesHint") : undefined}
          />
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
      />

      <SubmitModal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        onSubmitted={refreshVideos}
      />
    </div>
  );
}
