"use client";

import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { VideoPlayer } from "./VideoPlayer";
import { CommentSection } from "./CommentSection";
import {
  IconClose,
  IconExternal,
  IconEye,
  IconHeart,
} from "@/components/ui/IconButton";
import type { Video } from "@/lib/types";
import { getPlatformViewCount } from "@/lib/video-platforms";

interface VideoModalProps {
  video: Video | null;
  open: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function VideoModal({
  video,
  open,
  onClose,
  isFavorite,
  onToggleFavorite,
}: VideoModalProps) {
  const { t } = useTranslation("common");

  if (!video) return null;

  const source = video.sources[0];
  const platformViews = getPlatformViewCount(video);

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white"
        aria-label={t("close")}
      >
        <IconClose className="h-4 w-4" />
      </button>

      <div className="max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4">
        {source && (
          <VideoPlayer
            url={source.url}
            platform={source.platform}
            title={video.title}
          />
        )}

        <h2 className="text-lg sm:text-xl font-semibold leading-tight">{video.title}</h2>

        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-textMuted)]">
          <span>{video.publishedDate}</span>
          {platformViews !== null && (
            <span className="inline-flex items-center gap-1">
              <IconEye className="h-3.5 w-3.5" />
              {platformViews.toLocaleString()} {t("views")}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge active>{t(video.category)}</Badge>
          {video.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>

        <div className="flex gap-2">
          {source && (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[var(--color-accentText)]"
            >
              <IconExternal className="h-4 w-4" />
              {t("openOriginal")}
            </a>
          )}
          <button
            type="button"
            onClick={onToggleFavorite}
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
              isFavorite
                ? "border-[var(--color-accent)] bg-[var(--color-accentMuted)] text-[var(--color-accent)]"
                : "border-[var(--color-border)]"
            }`}
            aria-label={isFavorite ? t("unfavorite") : t("favorite")}
          >
            <IconHeart filled={isFavorite} className="h-4 w-4" />
          </button>
        </div>

        <CommentSection videoId={video.id} />
      </div>
    </Modal>
  );
}
