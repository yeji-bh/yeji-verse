"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { TagInput } from "@/components/ui/TagInput";
import { VideoPlayer } from "./VideoPlayer";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  IconClose,
  IconExternal,
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
import { RelatedVideos } from "@/components/video/RelatedVideos";
import { AddClipForm } from "@/components/video/AddClipForm";
import { CATEGORIES, getSubcategoriesForCategory } from "@/lib/constants";
import type { Category, Subcategory, Video } from "@/lib/types";
import { getPlatformLabel } from "@/lib/video-platforms";

function IconBookmark({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
      />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
    </svg>
  );
}

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
  onSelectVideo?: (video: Video) => void;
  startSeconds?: number;
  onAddClip?: (startSeconds: number, note: string) => void;
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
  onSelectVideo,
  startSeconds = 0,
  onAddClip,
}: VideoModalProps) {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState<Category>("vlog");
  const [editSubcategory, setEditSubcategory] = useState<Subcategory | null>(null);
  const [editTags, setEditTags] = useState<string[]>([]);
  const editSubcategoryOptions = getSubcategoriesForCategory(editCategory);
  const [editDate, setEditDate] = useState("");
  const [editSources, setEditSources] = useState<SourceInput[]>([createEmptySource()]);
  const [editThumbnail, setEditThumbnail] = useState("");
  const { parseUrl, parsing, cancelParse } = useVideoUrlParser();
  const dragStartY = useRef(0);
  const dragOffsetY = useRef(0);
  const sheetDraggingRef = useRef(false);
  const sheetMovedRef = useRef(false);
  const [sheetOffset, setSheetOffset] = useState(0);
  const [sheetDragging, setSheetDragging] = useState(false);
  const [isLg, setIsLg] = useState(false);
  const [playStartSeconds, setPlayStartSeconds] = useState(startSeconds);
  const [addingClip, setAddingClip] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsLg(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    setEditing(false);
    setAddingClip(false);
    cancelParse();
    sheetDraggingRef.current = false;
    setSheetOffset(0);
    setSheetDragging(false);
  }, [video?.id, cancelParse]);

  useEffect(() => {
    setPlayStartSeconds(startSeconds);
  }, [video?.id, startSeconds]);

  const onSheetTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    dragOffsetY.current = 0;
    sheetMovedRef.current = false;
    sheetDraggingRef.current = true;
    setSheetDragging(true);
  };

  const onSheetTouchMove = (e: React.TouchEvent) => {
    if (!sheetDraggingRef.current) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    const next = Math.max(0, dy);
    if (next > 8) sheetMovedRef.current = true;
    dragOffsetY.current = next;
    setSheetOffset(next);
  };

  const onSheetTouchEnd = () => {
    if (!sheetDraggingRef.current) return;
    sheetDraggingRef.current = false;
    setSheetDragging(false);
    if (dragOffsetY.current > 96) {
      setSheetOffset(0);
      onClose();
      return;
    }
    setSheetOffset(0);
  };

  const onSheetHandleClick = () => {
    if (sheetMovedRef.current) return;
    onClose();
  };

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
      if (data.description) setEditDescription(data.description);
      if (data.publishedDate) setEditDate(data.publishedDate);
      if (data.thumbnail) setEditThumbnail(data.thumbnail);
    }, 500);

    return () => clearTimeout(timer);
  }, [primaryEditUrl, editing, parseUrl]);

  if (!video) return null;

  const source = video.sources[0];

  const startEdit = () => {
    setEditTitle(video.title);
    setEditDescription(video.description);
    setEditCategory(video.category);
    setEditSubcategory(video.subcategory);
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
          description: editDescription.trim(),
          category: editCategory,
          subcategory:
            editSubcategoryOptions.length > 0 ? editSubcategory : null,
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
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      mobileFullscreen
      sheetOffset={sheetOffset}
      sheetDragging={sheetDragging}
    >
      {editing ? (
        <>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center modal-close-btn text-[var(--color-textMuted)] hover:text-[var(--color-text)]"
            aria-label={t("close")}
          >
            <IconClose className="h-4 w-4" />
          </button>
          <div className="min-h-0 flex-1 overflow-y-auto space-y-4 p-5 sm:max-h-[90vh] sm:flex-none">
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
                    className="w-full border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-textSubtle)]">
                    {t("description")}
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={4}
                    className="w-full resize-y border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
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
                    className="date-input w-full border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
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
                        onClick={() => {
                          setEditCategory(c);
                          setEditSubcategory(null);
                        }}
                      >
                        {t(c)}
                      </Badge>
                    ))}
                  </div>
                </div>
                {editSubcategoryOptions.length > 0 && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-textSubtle)]">
                      {t("subcategory")}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {editSubcategoryOptions.map((s) => (
                        <Badge
                          key={s}
                          active={editSubcategory === s}
                          onClick={() =>
                            setEditSubcategory((prev) =>
                              prev === s ? null : s,
                            )
                          }
                        >
                          {t(s)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
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
                className="flex-1 border border-[var(--color-border)] py-2 text-sm"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-[var(--color-accent)] py-2 text-sm font-medium text-[var(--color-accentText)] disabled:opacity-50"
              >
                {saving ? t("submitting") : t("save")}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Mobile */}
          <div className="flex min-h-0 max-h-[inherit] flex-col lg:hidden">
            <div
              className="relative z-30 shrink-0 flex touch-none flex-col items-center bg-[var(--color-bgElevated)] px-5 pt-3 pb-2"
              onTouchStart={onSheetTouchStart}
              onTouchMove={onSheetTouchMove}
              onTouchEnd={onSheetTouchEnd}
              onTouchCancel={onSheetTouchEnd}
              onClick={onSheetHandleClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClose();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={t("close")}
            >
              <div className="modal-sheet-handle" aria-hidden />
            </div>

            {source && (
              <div className="relative z-10 shrink-0">
                <div className="modal-video-shell">
                  <VideoPlayer
                    key={`${source.id}-${playStartSeconds}`}
                    url={source.url}
                    platform={source.platform}
                    title={video.title}
                    thumbnail={video.thumbnail}
                    embedOnMount
                    startSeconds={playStartSeconds}
                  />
                </div>
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="px-5 pt-4 pb-4 text-left">
                <h2 className="m-0 w-full text-left text-lg font-bold leading-snug text-[var(--color-text)] [hanging-punctuation:allow-end]">
                  {video.title}
                </h2>

                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--color-textSubtle)]">
                  <span className="inline-flex items-center gap-1.5">
                    <IconCalendar className="h-4 w-4 shrink-0 opacity-70" />
                    <time dateTime={video.publishedDate}>{video.publishedDate}</time>
                  </span>
                  <span aria-hidden>·</span>
                  <span className="modal-category-label">
                    {t(video.category)}
                    {video.subcategory ? ` · ${t(video.subcategory)}` : ""}
                  </span>
                </div>

                {video.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {video.tags.map((tag) => (
                      <span key={tag} className="modal-tag-pill">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {video.description.trim() && (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-textMuted)]">
                    {video.description}
                  </p>
                )}

                <div className="mt-4 flex items-stretch gap-2">
                  {video.sources.map((s) => (
                    <a
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="modal-cta-gradient inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium"
                    >
                      <PlatformIcon platform={s.platform} className="h-4 w-4 shrink-0" />
                      <span className="truncate">{getPlatformLabel(s.platform)}</span>
                      <IconExternal className="h-3.5 w-3.5 shrink-0 opacity-90" />
                    </a>
                  ))}
                  <button
                    type="button"
                    onClick={onToggleChecked}
                    className={`modal-action-ghost inline-flex h-11 w-11 shrink-0 items-center justify-center ${
                      isChecked
                        ? "!border-emerald-500 !bg-emerald-500/15 !text-emerald-600 dark:!text-emerald-400"
                        : ""
                    }`}
                    aria-label={isChecked ? t("markUnwatched") : t("markWatched")}
                  >
                    <IconCheck className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onToggleFavorite}
                    className={`modal-action-ghost inline-flex h-11 w-11 shrink-0 items-center justify-center ${
                      isFavorite
                        ? "!border-[var(--color-accent)] !bg-[var(--color-accentMuted)] !text-[var(--color-accent)]"
                        : ""
                    }`}
                    aria-label={isFavorite ? t("unfavorite") : t("favorite")}
                  >
                    <IconHeart filled={isFavorite} className="h-4 w-4" />
                  </button>
                  {onAddClip && (
                    <button
                      type="button"
                      onClick={() => setAddingClip((v) => !v)}
                      className={`modal-action-ghost inline-flex h-11 w-11 shrink-0 items-center justify-center ${
                        addingClip
                          ? "!border-[var(--color-accent)] !bg-[var(--color-accentMuted)] !text-[var(--color-accent)]"
                          : ""
                      }`}
                      aria-label={t("clipAdd")}
                      aria-expanded={addingClip}
                    >
                      <IconBookmark className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {onAddClip && addingClip && (
                  <div className="mt-3">
                    <AddClipForm
                      onAdd={onAddClip}
                      onCancel={() => setAddingClip(false)}
                    />
                  </div>
                )}

                {isAdmin && (
                  <div className="mt-3 flex items-center gap-4 text-xs">
                    <button
                      type="button"
                      onClick={startEdit}
                      className="text-[var(--color-textMuted)] hover:text-[var(--color-accent)]"
                    >
                      {t("edit")}
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="text-red-500 hover:underline"
                    >
                      {t("delete")}
                    </button>
                  </div>
                )}

                {onSelectVideo && !isLg && (
                  <RelatedVideos videoId={video.id} onSelect={onSelectVideo} />
                )}
              </div>
            </div>
          </div>

          {/* Desktop */}
          <div className="relative hidden min-h-0 flex-1 flex-col overflow-y-auto lg:flex lg:max-h-[90vh]">
            {source ? (
              <div className="relative p-5 pb-0">
                <div className="modal-video-shell modal-video-shell--desktop">
                  <VideoPlayer
                    key={`${source.id}-${playStartSeconds}`}
                    url={source.url}
                    platform={source.platform}
                    title={video.title}
                    thumbnail={video.thumbnail}
                    embedOnMount
                    startSeconds={playStartSeconds}
                  />
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute top-7 right-7 z-20 flex h-9 w-9 items-center justify-center modal-close-btn text-[var(--color-textMuted)] transition-colors hover:text-[var(--color-text)]"
                  aria-label={t("close")}
                >
                  <IconClose className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center modal-close-btn text-[var(--color-textMuted)] transition-colors hover:text-[var(--color-text)]"
                aria-label={t("close")}
              >
                <IconClose className="h-4 w-4" />
              </button>
            )}

            <div className="space-y-4 p-5">
              <h2 className="text-xl font-bold leading-snug text-[var(--color-text)] lg:text-2xl">
                {video.title}
              </h2>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--color-textSubtle)]">
                <span className="inline-flex items-center gap-1.5">
                  <IconCalendar className="h-4 w-4 shrink-0 opacity-70" />
                  <time dateTime={video.publishedDate}>{video.publishedDate}</time>
                </span>
                <span aria-hidden>·</span>
                <span className="modal-category-label">
                  {t(video.category)}
                  {video.subcategory ? ` · ${t(video.subcategory)}` : ""}
                </span>
              </div>

              {video.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag) => (
                    <span key={tag} className="modal-tag-pill">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {video.description.trim() && (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-textMuted)]">
                  {video.description}
                </p>
              )}

              <div className="flex flex-wrap items-stretch gap-2 pt-1">
                {video.sources.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modal-cta-gradient inline-flex min-w-[10rem] flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium"
                  >
                    <PlatformIcon platform={s.platform} className="h-4 w-4 shrink-0" />
                    <span className="truncate">{getPlatformLabel(s.platform)}</span>
                    <IconExternal className="h-3.5 w-3.5 shrink-0 opacity-90" />
                  </a>
                ))}
                <button
                  type="button"
                  onClick={onToggleChecked}
                  className={`modal-action-ghost inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium ${
                    isChecked
                      ? "!border-emerald-500 !bg-emerald-500/15 !text-emerald-600 dark:!text-emerald-400"
                      : ""
                  }`}
                  aria-label={isChecked ? t("markUnwatched") : t("markWatched")}
                >
                  <IconCheck className="h-4 w-4 shrink-0" />
                  <span>{isChecked ? t("markUnwatched") : t("markWatched")}</span>
                </button>
                <button
                  type="button"
                  onClick={onToggleFavorite}
                  className={`modal-action-ghost inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium ${
                    isFavorite
                      ? "!border-[var(--color-accent)] !bg-[var(--color-accentMuted)] !text-[var(--color-accent)]"
                      : ""
                  }`}
                  aria-label={isFavorite ? t("unfavorite") : t("favorite")}
                >
                  <IconHeart filled={isFavorite} className="h-4 w-4 shrink-0" />
                  <span>{isFavorite ? t("unfavorite") : t("favorite")}</span>
                </button>
                {onAddClip && (
                  <button
                    type="button"
                    onClick={() => setAddingClip((v) => !v)}
                    className={`modal-action-ghost inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium ${
                      addingClip
                        ? "!border-[var(--color-accent)] !bg-[var(--color-accentMuted)] !text-[var(--color-accent)]"
                        : ""
                    }`}
                    aria-label={t("clipAdd")}
                    aria-expanded={addingClip}
                  >
                    <IconBookmark className="h-4 w-4 shrink-0" />
                    <span>{t("clipAdd")}</span>
                  </button>
                )}
              </div>

              {onAddClip && addingClip && (
                <AddClipForm
                  onAdd={onAddClip}
                  onCancel={() => setAddingClip(false)}
                />
              )}

              {isAdmin && (
                <div className="flex items-center gap-2 border-t border-[var(--color-borderSubtle)] pt-4">
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

              {onSelectVideo && isLg && (
                <RelatedVideos videoId={video.id} onSelect={onSelectVideo} />
              )}
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
