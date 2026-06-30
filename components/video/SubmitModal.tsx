"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { TagInput } from "@/components/ui/TagInput";
import { useAuth } from "@/components/providers/AuthProvider";
import { IconClose } from "@/components/ui/IconButton";
import { CATEGORIES, KNOWN_PLATFORMS } from "@/lib/constants";
import type { Category, SubmitVideoPayload } from "@/lib/types";
import { detectPlatform, getThumbnailUrl } from "@/lib/video-platforms";

interface SubmitModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export function SubmitModal({ open, onClose, onSubmitted }: SubmitModalProps) {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("vlog");
  const [tags, setTags] = useState<string[]>([]);
  const [publishedDate, setPublishedDate] = useState(todayString());
  const [platform, setPlatform] = useState("");
  const [url, setUrl] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setTitle("");
    setCategory("vlog");
    setTags([]);
    setPublishedDate(todayString());
    setPlatform("");
    setUrl("");
    setThumbnail("");
    setError("");
    setSuccess(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const parseUrl = async (link: string) => {
    const trimmed = link.trim();
    if (!trimmed) return;

    setParsing(true);
    try {
      const res = await fetch("/api/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      setPlatform(data.platform ?? detectPlatform(trimmed));
      if (data.title && !title) setTitle(data.title);
      if (data.thumbnail) setThumbnail(data.thumbnail);
      else {
        const thumb = getThumbnailUrl(trimmed, data.platform);
        if (thumb) setThumbnail(thumb);
      }
    } catch {
      setPlatform(detectPlatform(trimmed));
    } finally {
      setParsing(false);
    }
  };

  useEffect(() => {
    if (!url.trim()) return;
    const timer = setTimeout(() => parseUrl(url), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!title.trim() || !url.trim()) {
      setError(t("submitError"));
      setLoading(false);
      return;
    }

    const payload: SubmitVideoPayload = {
      title: title.trim(),
      category,
      tags,
      publishedDate,
      sources: [
        {
          platform: platform || detectPlatform(url),
          url: url.trim(),
        },
      ],
    };

    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, thumbnail }),
      });

      if (!res.ok) throw new Error("failed");

      setSuccess(true);
      onSubmitted();
      setTimeout(handleClose, user?.role === "admin" ? 800 : 1500);
    } catch {
      setError(t("submitError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} size="lg">
      <div className="flex items-center justify-between border-b border-[var(--color-borderSubtle)] px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">{t("submitTitle")}</h2>
          <p className="mt-0.5 text-xs text-[var(--color-textSubtle)]">{t("submitHint")}</p>
        </div>
        <button type="button" onClick={handleClose} aria-label={t("close")}>
          <IconClose className="h-5 w-5 text-[var(--color-textMuted)]" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[75vh] p-5 space-y-5">
        {thumbnail && (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[var(--color-bgMuted)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbnail} alt="" className="h-full w-full object-cover" />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-textSubtle)]">
            {t("videoTitle")}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-textSubtle)]">
            {t("videoCategory")}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <Badge key={c} active={category === c} onClick={() => setCategory(c)}>
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
            value={publishedDate}
            onChange={(e) => setPublishedDate(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-textSubtle)]">
            {t("sources")}
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm sm:w-36 outline-none focus:border-[var(--color-accent)]"
            >
              <option value="">{t("platform")}</option>
              {KNOWN_PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t("link")}
              required
              className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          {parsing && (
            <p className="text-xs text-[var(--color-textSubtle)]">{t("parsing")}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-textSubtle)]">
            {t("tags")}
          </label>
          <TagInput
            tags={tags}
            onChange={setTags}
            placeholder={t("videoTags")}
            hint={t("tagsMax")}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && (
          <p className="text-sm text-[var(--color-accent)]">
            {user?.role === "admin" ? t("submitSuccess") : t("submitPending")}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-xl border border-[var(--color-border)] py-2.5 text-sm"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-[var(--color-accent)] py-2.5 text-sm font-medium text-[var(--color-accentText)] disabled:opacity-50"
          >
            {loading ? t("submitting") : t("confirmSubmit")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
