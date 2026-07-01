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
  IconEye,
  IconHeart,
} from "@/components/ui/IconButton";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import {
  SourceFields,
  createEmptySource,
  normalizeSources,
  type SourceInput,
} from "@/components/video/SourceFields";
import { useVideoUrlParser } from "@/hooks/useVideoUrlParser";
import { CATEGORIES } from "@/lib/constants";
import type { Category, Video } from "@/lib/types";
import { getPlatformLabel, getPlatformViewCount } from "@/lib/video-platforms";

interface VideoModalProps {
  video: Video | null;
  open: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onVideoUpdated?: (video: Video) => void;
  onVideoDeleted?: (id: string) => void;
}

export function VideoModal({
  video,
  open,
  onClose,
  isFavorite,
  onToggleFavorite,
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
  const platformViews = getPlatformViewCount(video);

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
    <Modal open={open} onClose={onClose} size="lg" mobileFullscreen>
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white"
        aria-label={t("close")}
      >
        <IconClose className="h-4 w-4" />
      </button>

      {editing ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:flex-none sm:max-h-[90vh]">
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
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto pb-8 lg:grid lg:max-h-[90vh] lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:overflow-hidden lg:pb-0">
          <div className="space-y-4 p-4 sm:p-5 lg:min-h-0 lg:overflow-y-auto">
            {source && (
              <div className="-mx-4 -mt-4 sm:-mx-5 sm:-mt-5 lg:-mx-5 lg:-mt-5">
                <VideoPlayer
                  url={source.url}
                  platform={source.platform}
                  title={video.title}
                  thumbnail={video.thumbnail}
                  flat
                />
              </div>
            )}

            <h2 className="text-lg font-semibold leading-snug sm:text-xl">{video.title}</h2>

            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-textMuted)]">
              <span>{video.publishedDate}</span>
              {platformViews !== null && (
                <span className="inline-flex items-center gap-1">
                  <IconEye className="h-3.5 w-3.5" />
                  {platformViews.toLocaleString()} {t("views")}
                </span>
              )}
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                <Badge active>{t(video.category)}</Badge>
                {video.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
              {isAdmin && (
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={startEdit}
                    className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-textMuted)] hover:border-[var(--color-accent)]"
                  >
                    {t("edit")}
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    {t("delete")}
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              {video.sources.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  <PlatformIcon platform={s.platform} className="h-4 w-4 shrink-0" />
                  {getPlatformLabel(s.platform)}
                  <IconExternal className="h-3.5 w-3.5 opacity-60" />
                </a>
              ))}
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
          </div>

          <div className="border-t border-[var(--color-borderSubtle)] p-4 sm:p-5 lg:flex lg:flex-col lg:overflow-hidden lg:border-l lg:border-t-0">
            <CommentSection videoId={video.id} fillHeight className="border-t-0 pt-0" />
          </div>
        </div>
      )}
    </Modal>
  );
}
