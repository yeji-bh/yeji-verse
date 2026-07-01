"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { TagInput } from "@/components/ui/TagInput";
import { VideoPlayer } from "./VideoPlayer";
import { CommentSection } from "./CommentSection";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  IconClose,
  IconExternal,
  IconHeart,
} from "@/components/ui/IconButton";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { HoverTooltip } from "@/components/ui/HoverTooltip";
import {
  SourceFields,
  createEmptySource,
  normalizeSources,
  type SourceInput,
} from "@/components/video/SourceFields";
import { useVideoUrlParser } from "@/hooks/useVideoUrlParser";
import { CATEGORIES } from "@/lib/constants";
import type { Category, Video } from "@/lib/types";
import { getPlatformLabel } from "@/lib/video-platforms";

interface VideoModalProps {
  video: Video | null;
  open: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isChecked: boolean;
  onToggleChecked: () => void;
  onVideoUpdated?: (video: Video) => void;
  onVideoDeleted?: (id: string) => void;
}

export function VideoModal({
  video,
  open,
  onClose,
  isFavorite,
  onToggleFavorite,
  isChecked,
  onToggleChecked,
  onVideoUpdated,
  onVideoDeleted,
}: VideoModalProps) {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<Category>("vlog");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editDate, setEditDate] = useState("");
  const [editSources, setEditSources] = useState<SourceInput[]>([createEmptySource()]);
  const [editThumbnail, setEditThumbnail] = useState("");
  const { parseUrl, parsing, cancelParse } = useVideoUrlParser();

  useEffect(() => {
    setEditing(false);
    cancelParse();
  }, [video?.id, cancelParse]);

  const primaryEditUrl = editSources[0]?.url ?? "";

  useEffect(() => {
    if (!editing || !primaryEditUrl.trim()) return;

    const timer = setTimeout(async () => {
      const data = await parseUrl(primaryEditUrl);
      if (!data) return;
      setEditSources((prev) =>
        prev.map((s, i) => (i === 0 ? { ...s, platform: data.platform } : s)),
      );
      if (data.title) setEditTitle(data.title);
      if (data.publishedDate) setEditDate(data.publishedDate);
      if (data.thumbnail) setEditThumbnail(data.thumbnail);
    }, 500);

    return () => clearTimeout(timer);
  }, [primaryEditUrl, editing, parseUrl]);

  if (!video) return null;

  const source = video.sources[0];

  const startEdit = () => {
    setEditTitle(video.title);
    setEditCategory(video.category);
    setEditTags([...video.tags]);
    setEditDate(video.publishedDate);
    setEditSources(
      video.sources.length > 0
        ? video.sources.map((s) => ({ platform: s.platform, url: s.url }))
        : [createEmptySource()],
    );
    setEditThumbnail(video.thumbnail);
    setEditing(true);
  };

  const handleSave = async () => {
    const normalized = normalizeSources(editSources);
    if (normalized.length === 0) {
      alert(t("submitError"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/videos/${video.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          category: editCategory,
          tags: editTags,
          publishedDate: editDate,
          thumbnail: editThumbnail || video.thumbnail,
          sources: normalized,
        }),
      });
      if (!res.ok) throw new Error("failed");
      const updated = (await res.json()) as Video;
      onVideoUpdated?.(updated);
      setEditing(false);
    } catch {
      alert(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("confirmDeleteVideo"))) return;
    try {
      const res = await fetch(`/api/videos/${video.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("failed");
      onVideoDeleted?.(video.id);
      onClose();
    } catch {
      alert(t("saveError"));
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="xl" mobileFullscreen>
      {editing ? (
        <>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bgMuted)] text-[var(--color-textMuted)] hover:text-[var(--color-text)]"
            aria-label={t("close")}
          >
            <IconClose className="h-4 w-4" />
          </button>
        <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4 sm:flex-none sm:max-h-[90vh]">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-textSubtle)]">
                  {t("videoTitle")}
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-textSubtle)]">
                  {t("videoDate")}
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="date-input w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                />
              </div>
              <SourceFields
                sources={editSources}
                onChange={setEditSources}
                parsing={parsing}
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-textSubtle)]">
                  {t("videoCategory")}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => (
                    <Badge
                      key={c}
                      active={editCategory === c}
                      onClick={() => setEditCategory(c)}
                    >
                      {t(c)}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-textSubtle)]">
                  {t("tags")}
                </label>
                <TagInput tags={editTags} onChange={setEditTags} hint={t("tagsMax")} />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                cancelParse();
                setEditing(false);
              }}
              className="flex-1 rounded-xl border border-[var(--color-border)] py-2 text-sm"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-xl bg-[var(--color-accent)] py-2 text-sm font-medium text-[var(--color-accentText)] disabled:opacity-50"
            >
              {saving ? t("submitting") : t("save")}
            </button>
          </div>
        </div>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bgMuted)] text-[var(--color-textMuted)] hover:text-[var(--color-text)] lg:hidden"
            aria-label={t("close")}
          >
            <IconClose className="h-4 w-4" />
          </button>
        <div className="flex min-h-0 flex-1 flex-col lg:max-h-[90vh] lg:flex-row lg:overflow-hidden">
          <div className="min-h-0 lg:flex-[1.65] lg:overflow-y-auto">
            {source && (
              <div className="modal-video-shell">
                <VideoPlayer
                  url={source.url}
                  platform={source.platform}
                  title={video.title}
                  thumbnail={video.thumbnail}
                  embedOnMount
                />
              </div>
            )}

            <div className="space-y-2 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-wrap gap-1.5 sm:gap-2">
                  <Badge className="max-lg:!px-2 max-lg:!py-0.5 max-lg:!text-[10px]">
                    {t(video.category)}
                  </Badge>
                  {video.tags.map((tag) => (
                    <Badge key={tag} className="max-lg:!px-2 max-lg:!py-0.5 max-lg:!text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
                {isAdmin && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={startEdit}
                      className="border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-textMuted)] hover:border-[var(--color-accent)]"
                    >
                      {t("edit")}
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="border border-red-300 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      {t("delete")}
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-base font-bold leading-snug text-[var(--color-text)] sm:text-xl lg:text-2xl">
                  {video.title}
                </h2>
                <time
                  dateTime={video.publishedDate}
                  className="mt-1 block text-xs text-[var(--color-textSubtle)] sm:text-sm"
                >
                  {video.publishedDate}
                </time>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                {video.sources.map((s) => (
                  <HoverTooltip key={s.id} label={t("openOriginal")}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] sm:gap-2 sm:px-3 sm:py-2.5 sm:text-sm"
                    >
                      <PlatformIcon platform={s.platform} className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                      {getPlatformLabel(s.platform)}
                      <IconExternal className="h-3 w-3 opacity-60 sm:h-3.5 sm:w-3.5" />
                    </a>
                  </HoverTooltip>
                ))}
                <HoverTooltip
                  label={isChecked ? t("markUnwatched") : t("markWatched")}
                >
                  <button
                    type="button"
                    onClick={onToggleChecked}
                    className={`inline-flex h-8 w-8 shrink-0 items-center justify-center border sm:h-10 sm:w-10 ${
                      isChecked
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "border-[var(--color-border)] text-[var(--color-textMuted)] hover:border-[var(--color-accent)]"
                    }`}
                    aria-label={isChecked ? t("markUnwatched") : t("markWatched")}
                  >
                    <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                    </svg>
                  </button>
                </HoverTooltip>
                <HoverTooltip label={isFavorite ? t("unfavorite") : t("favorite")}>
                  <button
                    type="button"
                    onClick={onToggleFavorite}
                    className={`inline-flex h-8 w-8 shrink-0 items-center justify-center border sm:h-10 sm:w-10 ${
                      isFavorite
                        ? "border-[var(--color-accent)] bg-[var(--color-accentMuted)] text-[var(--color-accent)]"
                        : "border-[var(--color-border)] text-[var(--color-textMuted)] hover:border-[var(--color-accent)]"
                    }`}
                    aria-label={isFavorite ? t("unfavorite") : t("favorite")}
                  >
                    <IconHeart filled={isFavorite} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </HoverTooltip>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-col border-t border-[var(--color-borderSubtle)] p-4 sm:p-5 lg:flex-1 lg:border-l lg:border-t-0">
            <CommentSection videoId={video.id} fillHeight onClose={onClose} />
          </div>
        </div>
        </>
      )}
    </Modal>
  );
}
