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
import { CATEGORIES, KNOWN_PLATFORMS } from "@/lib/constants";
import type { Category, Video } from "@/lib/types";
import { getPlatformViewCount } from "@/lib/video-platforms";

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
  const [editPlatform, setEditPlatform] = useState("youtube");
  const [editUrl, setEditUrl] = useState("");

  useEffect(() => {
    setEditing(false);
  }, [video?.id]);

  if (!video) return null;

  const source = video.sources[0];
  const platformViews = getPlatformViewCount(video);

  const startEdit = () => {
    setEditTitle(video.title);
    setEditCategory(video.category);
    setEditTags([...video.tags]);
    setEditDate(video.publishedDate);
    setEditPlatform(source?.platform ?? "youtube");
    setEditUrl(source?.url ?? "");
    setEditing(true);
  };

  const handleSave = async () => {
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
          thumbnail: video.thumbnail,
          sources: [{ platform: editPlatform, url: editUrl.trim() }],
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
            thumbnail={video.thumbnail}
          />
        )}

        {isAdmin && !editing && (
          <div className="flex justify-end gap-2">
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

        {editing ? (
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
                {t("videoDate")}
              </label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={editPlatform}
                onChange={(e) => setEditPlatform(e.target.value)}
                className="select-control rounded-lg border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm sm:w-36 outline-none focus:border-[var(--color-accent)]"
              >
                {KNOWN_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <input
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-textSubtle)]">
                {t("tags")}
              </label>
              <TagInput tags={editTags} onChange={setEditTags} hint={t("tagsMax")} />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
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
          <>
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

            <div className="flex justify-end gap-2">
              {source && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[var(--color-accentText)]"
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
          </>
        )}

        <CommentSection videoId={video.id} />
      </div>
    </Modal>
  );
}
