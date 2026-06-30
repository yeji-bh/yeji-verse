"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal";
import { IconClose } from "@/components/ui/IconButton";
import { getThumbnailDisplayUrl } from "@/lib/thumbnail";
import type { Video } from "@/lib/types";

const RECENT_LIBRARY_LIMIT = 20;

interface StarterManageModalProps {
  open: boolean;
  onClose: () => void;
  currentVideos: Video[];
  onUpdated: (videos: Video[]) => void;
}

export function StarterManageModal({
  open,
  onClose,
  currentVideos,
  onUpdated,
}: StarterManageModalProps) {
  const { t } = useTranslation("common");
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [picks, setPicks] = useState<Video[]>(currentVideos);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragIndexRef = useRef<number | null>(null);
  const picksRef = useRef(picks);
  const savedOrderRef = useRef("");

  picksRef.current = picks;

  const pickIds = useMemo(() => new Set(picks.map((v) => v.id)), [picks]);

  const loadLibrary = useCallback(async () => {
    const res = await fetch("/api/videos");
    if (res.ok) setAllVideos(await res.json());
  }, []);

  useEffect(() => {
    if (open) {
      setPicks(currentVideos);
      savedOrderRef.current = currentVideos.map((v) => v.id).join(",");
      setSearch("");
      setSelected(new Set());
      setMessage("");
      setDraggingId(null);
      dragIndexRef.current = null;
      loadLibrary();
    }
  }, [open, currentVideos, loadLibrary]);

  const available = useMemo(() => {
    const q = search.trim().toLowerCase();
    let pool = allVideos.filter((v) => !pickIds.has(v.id));

    if (q) {
      pool = pool.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.tags.some((tag) => tag.toLowerCase().includes(q)),
      );
    }

    return pool
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, RECENT_LIBRARY_LIMIT);
  }, [allVideos, pickIds, search]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const persistOrder = async (ids: string[]) => {
    const res = await fetch("/api/starter", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoIds: ids }),
    });
    if (!res.ok) throw new Error("failed");
    const data = await res.json();
    setPicks(data.videos);
    onUpdated(data.videos);
    savedOrderRef.current = data.videos.map((v: Video) => v.id).join(",");
  };

  const batchAdd = async () => {
    if (selected.size === 0) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/starter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoIds: [...selected] }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setPicks(data.videos);
      onUpdated(data.videos);
      savedOrderRef.current = data.videos.map((v: Video) => v.id).join(",");
      setSelected(new Set());
      const parts: string[] = [];
      if (data.added?.length) parts.push(t("starterAddedCount", { count: data.added.length }));
      if (data.skipped?.length) parts.push(t("starterSkippedCount", { count: data.skipped.length }));
      if (data.invalid?.length) parts.push(t("starterInvalidCount", { count: data.invalid.length }));
      setMessage(parts.join(" · ") || t("starterAddDone"));
    } catch {
      setMessage(t("saveError"));
    } finally {
      setLoading(false);
    }
  };

  const removePick = async (videoId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/starter", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setPicks(data.videos);
      onUpdated(data.videos);
      savedOrderRef.current = data.videos.map((v: Video) => v.id).join(",");
    } catch {
      setMessage(t("saveError"));
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (index: number, videoId: string) => {
    dragIndexRef.current = index;
    setDraggingId(videoId);
  };

  const handleDragOver = (e: React.DragEvent, overIndex: number) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from === null || from === overIndex) return;

    setPicks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(overIndex, 0, moved);
      return next;
    });
    dragIndexRef.current = overIndex;
  };

  const handleDragEnd = async () => {
    const ids = picksRef.current.map((v) => v.id);
    const orderKey = ids.join(",");
    setDraggingId(null);
    dragIndexRef.current = null;

    if (orderKey === savedOrderRef.current) return;

    setLoading(true);
    setMessage("");
    try {
      await persistOrder(ids);
    } catch {
      setMessage(t("saveError"));
      setPicks(currentVideos);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="xl">
      <div className="flex items-center justify-between border-b border-[var(--color-borderSubtle)] px-5 py-4">
        <h2 className="text-base font-semibold">{t("starterManage")}</h2>
        <button type="button" onClick={onClose} aria-label={t("close")}>
          <IconClose className="h-5 w-5 text-[var(--color-textMuted)]" />
        </button>
      </div>

      <div className="max-h-[75vh] overflow-y-auto p-5 space-y-6">
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-medium text-[var(--color-textMuted)]">
              {t("starterCurrentList")} ({picks.length})
            </h3>
            {picks.length > 1 && (
              <p className="text-xs text-[var(--color-textSubtle)]">{t("starterDragHint")}</p>
            )}
          </div>
          {picks.length === 0 ? (
            <p className="text-sm text-[var(--color-textSubtle)]">{t("starterEmpty")}</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {picks.map((v, i) => (
                <div
                  key={v.id}
                  draggable={!loading}
                  onDragStart={() => handleDragStart(i, v.id)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDragEnd={handleDragEnd}
                  className={`group relative cursor-grab rounded-xl border bg-[var(--color-bg)] active:cursor-grabbing ${
                    draggingId === v.id
                      ? "border-[var(--color-accent)] opacity-60"
                      : "border-[var(--color-border)]"
                  }`}
                >
                  <span className="absolute top-1.5 left-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-md bg-black/60 text-[10px] font-medium text-white">
                    {i + 1}
                  </span>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => removePick(v.id)}
                    className="absolute top-1.5 right-1.5 z-10 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    {t("remove")}
                  </button>
                  <div className="relative aspect-video overflow-hidden rounded-t-xl bg-[var(--color-bgMuted)]">
                    <Image
                      src={getThumbnailDisplayUrl(v.thumbnail)}
                      alt={v.title}
                      fill
                      sizes="160px"
                      className="object-cover pointer-events-none"
                      unoptimized
                      draggable={false}
                    />
                  </div>
                  <p className="line-clamp-2 p-2 text-xs leading-snug text-[var(--color-text)]">
                    {v.title}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="h-px bg-[var(--color-borderSubtle)]" />

        <section className="space-y-3">
          <h3 className="text-sm font-medium text-[var(--color-textMuted)]">
            {t("starterAddFromLibrary")}
          </h3>
          <p className="text-xs text-[var(--color-textSubtle)]">{t("starterAddHint")}</p>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("starterSearchPlaceholder")}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
          <ul className="max-h-48 space-y-1 overflow-y-auto">
            {available.length === 0 ? (
              <li className="py-4 text-center text-sm text-[var(--color-textSubtle)]">
                {t("noResults")}
              </li>
            ) : (
              available.map((v) => (
                <li key={v.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-[var(--color-bgMuted)]">
                    <input
                      type="checkbox"
                      checked={selected.has(v.id)}
                      onChange={() => toggleSelect(v.id)}
                      className="h-4 w-4 accent-[var(--color-accent)]"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm">{v.title}</span>
                    <span className="shrink-0 text-xs text-[var(--color-textSubtle)]">
                      {t(v.category)}
                    </span>
                  </label>
                </li>
              ))
            )}
          </ul>
          <button
            type="button"
            disabled={loading || selected.size === 0}
            onClick={batchAdd}
            className="w-full rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[var(--color-accentText)] disabled:opacity-50"
          >
            {loading ? t("submitting") : t("starterAddSelected", { count: selected.size })}
          </button>
          {message && (
            <p className="text-center text-xs text-[var(--color-textMuted)]">{message}</p>
          )}
        </section>
      </div>
    </Modal>
  );
}
