"use client";

import { VideoCard } from "./VideoCard";
import { useTranslation } from "react-i18next";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useLoadMoreOnScroll } from "@/hooks/useLoadMoreOnScroll";
import type { Video } from "@/lib/types";

interface VideoGridProps {
  videos: Video[];
  onVideoClick: (video: Video) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  emptyMessage?: string;
  emptyHint?: string;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

export function VideoGrid({
  videos,
  onVideoClick,
  isFavorite,
  onToggleFavorite,
  emptyMessage,
  emptyHint,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}: VideoGridProps) {
  const { t } = useTranslation("common");
  const sentinelRef = useLoadMoreOnScroll(
    onLoadMore,
    hasMore,
    loadingMore,
  );

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-bgMuted)]">
          <svg className="h-8 w-8 text-[var(--color-textSubtle)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
        <p className="text-sm text-[var(--color-textMuted)]">
          {emptyMessage ?? t("noResults")}
        </p>
        {emptyHint && (
          <p className="mt-1 text-xs text-[var(--color-textSubtle)]">
            {emptyHint}
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onClick={() => onVideoClick(video)}
            isFavorite={isFavorite(video.id)}
            onToggleFavorite={(e) => {
              e.stopPropagation();
              onToggleFavorite(video.id);
            }}
          />
        ))}
      </div>
      {hasMore && (
        <div
          ref={sentinelRef}
          className="flex items-center justify-center gap-2 py-10 text-xs text-[var(--color-textSubtle)]"
        >
          {loadingMore ? (
            <>
              <LoadingSpinner size="sm" />
              <span>{t("loadingMore")}</span>
            </>
          ) : (
            <span className="sr-only">{t("loadingMore")}</span>
          )}
        </div>
      )}
    </>
  );
}
