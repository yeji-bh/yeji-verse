"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { VideoPlayer } from "./VideoPlayer";
import { useLocale } from "@/components/providers/LocaleProvider";
import {
  IconClose,
  IconExternal,
  IconEye,
  IconHeart,
  IconShare,
} from "@/components/ui/IconButton";
import type { Video } from "@/lib/types";
import {
  getDisplayViewCount,
  getPlatformLabel,
} from "@/lib/video-platforms";

function formatViews(count: number): string {
  return count.toLocaleString();
}

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
  const { t, categoryLabel } = useLocale();
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && video) {
      setActiveSourceIndex(0);
      fetch(`/api/views/${video.id}`, { method: "POST" }).catch(() => {});
    }
  }, [open, video]);

  if (!video) return null;

  const activeSource = video.sources[activeSourceIndex] ?? video.sources[0];
  const displayViews = getDisplayViewCount(video);
  const hasPlatformViews = video.sources.some((s) => s.viewCount !== null);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="xl">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
        aria-label={t("close")}
      >
        <IconClose className="h-4 w-4" />
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 max-h-[95vh] overflow-y-auto">
        <div className="lg:col-span-2 p-4 sm:p-6 space-y-4">
          {activeSource && (
            <VideoPlayer
              url={activeSource.url}
              platform={activeSource.platform}
              title={video.title}
            />
          )}

          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-text)] leading-tight">
              {video.title}
            </h2>

            <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-textMuted)]">
              <span>{video.year}</span>
              <span className="text-[var(--color-border)]">·</span>
              <span className="inline-flex items-center gap-1">
                <IconEye />
                {formatViews(displayViews)} {t("views")}
              </span>
              <Badge active>{categoryLabel(video.category)}</Badge>
            </div>

            {video.sources.length > 1 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-textSubtle)]">
                  {t("selectSource")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {video.sources.map((source, i) => (
                    <Badge
                      key={source.id}
                      active={i === activeSourceIndex}
                      onClick={() => setActiveSourceIndex(i)}
                    >
                      {getPlatformLabel(source.platform)}
                      {source.viewCount !== null && (
                        <span className="ml-1 opacity-70">
                          ({formatViews(source.viewCount)})
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {video.description && (
              <p className="text-sm leading-relaxed text-[var(--color-textMuted)]">
                {video.description}
              </p>
            )}
          </div>
        </div>

        <div className="border-t lg:border-t-0 lg:border-l border-[var(--color-borderSubtle)] p-4 sm:p-6 space-y-5">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-textSubtle)]">
              {t("tags")}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {video.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2 rounded-xl bg-[var(--color-bgMuted)] p-3">
            <p className="text-xs text-[var(--color-textSubtle)]">
              {hasPlatformViews ? t("platformViews") : t("siteViews")}
            </p>
            <p className="text-2xl font-semibold text-[var(--color-text)]">
              {formatViews(displayViews)}
            </p>
            <p className="text-[10px] leading-relaxed text-[var(--color-textSubtle)]">
              {t("viewCountNote")}
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            {activeSource && (
              <a
                href={activeSource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[var(--color-accentText)] transition-colors hover:bg-[var(--color-accentHover)]"
              >
                <IconExternal />
                {t("openOriginal")}
              </a>
            )}
            <button
              type="button"
              onClick={onToggleFavorite}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                isFavorite
                  ? "border-[var(--color-accent)] bg-[var(--color-accentMuted)] text-[var(--color-accent)]"
                  : "border-[var(--color-border)] text-[var(--color-textMuted)] hover:border-[var(--color-accent)]"
              }`}
              aria-label={isFavorite ? t("unfavorite") : t("favorite")}
            >
              <IconHeart filled={isFavorite} />
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-textMuted)] hover:border-[var(--color-accent)] transition-colors"
              aria-label={t("share")}
            >
              <IconShare />
            </button>
          </div>

          {copied && (
            <p className="text-xs text-[var(--color-accent)]">{t("copied")}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
