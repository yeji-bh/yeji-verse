"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { getThumbnailDisplayUrl } from "@/lib/thumbnail";
import { formatTimestamp } from "@/lib/time";
import type { ClipBookmark, Video } from "@/lib/types";

interface ClipListProps {
  clips: ClipBookmark[];
  videosById: Map<string, Video>;
  onClipClick: (clip: ClipBookmark, video: Video) => void;
  onRemove: (id: string) => void;
  emptyMessage?: string;
  emptyHint?: string;
}

export function ClipList({
  clips,
  videosById,
  onClipClick,
  onRemove,
  emptyMessage,
  emptyHint,
}: ClipListProps) {
  const { t } = useTranslation("common");

  if (clips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-bgMuted)]">
          <svg
            className="h-8 w-8 text-[var(--color-textSubtle)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>
        <p className="text-sm text-[var(--color-textMuted)]">
          {emptyMessage ?? t("noClips")}
        </p>
        {emptyHint && (
          <p className="mt-1 text-xs text-[var(--color-textSubtle)]">{emptyHint}</p>
        )}
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {clips.map((clip) => {
        const video = videosById.get(clip.videoId);
        if (!video) return null;
        const thumbSrc = video.thumbnail
          ? getThumbnailDisplayUrl(video.thumbnail)
          : null;

        return (
          <li key={clip.id}>
            <div className="flex gap-3 rounded-xl border border-[var(--color-borderSubtle)] bg-[var(--color-bgElevated)] p-2.5 sm:p-3">
              <button
                type="button"
                onClick={() => onClipClick(clip, video)}
                className="flex min-w-0 flex-1 gap-3 text-left"
              >
                <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-[var(--color-bgMuted)] sm:h-20 sm:w-36">
                  {thumbSrc ? (
                    <Image
                      src={thumbSrc}
                      alt=""
                      fill
                      sizes="144px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : null}
                  <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1.5 py-0.5 font-mono text-[10px] font-medium text-white">
                    {formatTimestamp(clip.startSeconds)}
                  </span>
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                  <p className="line-clamp-2 text-sm font-medium text-[var(--color-text)]">
                    {video.title}
                  </p>
                  {clip.note ? (
                    <p className="mt-1 whitespace-pre-wrap break-words text-xs text-[var(--color-textMuted)]">
                      {clip.note}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-[var(--color-textSubtle)]">
                      {t("clipAt", { time: formatTimestamp(clip.startSeconds) })}
                    </p>
                  )}
                </div>
              </button>
              <button
                type="button"
                onClick={() => onRemove(clip.id)}
                className="shrink-0 self-start px-2 py-1 text-xs text-[var(--color-textSubtle)] hover:text-red-500"
              >
                {t("remove")}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
