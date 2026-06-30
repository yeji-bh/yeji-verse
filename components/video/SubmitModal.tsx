"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { useLocale } from "@/components/providers/LocaleProvider";
import { IconClose, IconPlus } from "@/components/ui/IconButton";
import { CATEGORIES, KNOWN_PLATFORMS } from "@/lib/constants";
import type { Category, SubmitVideoPayload } from "@/lib/types";
import { detectPlatform, getThumbnailUrl } from "@/lib/video-platforms";

interface SourceInput {
  platform: string;
  url: string;
}

interface SubmitModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export function SubmitModal({ open, onClose, onSubmitted }: SubmitModalProps) {
  const { t, categoryLabel } = useLocale();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("vlog");
  const [tags, setTags] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [sources, setSources] = useState<SourceInput[]>([
    { platform: "", url: "" },
  ]);
  const [thumbnail, setThumbnail] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsingIndex, setParsingIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setTitle("");
    setDescription("");
    setCategory("vlog");
    setTags("");
    setYear(new Date().getFullYear());
    setSources([{ platform: "", url: "" }]);
    setThumbnail("");
    setError("");
    setSuccess(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const parseSource = async (index: number) => {
    const url = sources[index]?.url.trim();
    if (!url) return;

    setParsingIndex(index);
    try {
      const res = await fetch("/api/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      setSources((prev) => {
        const next = [...prev];
        next[index] = {
          platform: data.platform ?? detectPlatform(url),
          url,
        };
        return next;
      });

      if (data.title && !title) setTitle(data.title);
      if (data.thumbnail) setThumbnail(data.thumbnail);
      else {
        const thumb = getThumbnailUrl(url, data.platform);
        if (thumb) setThumbnail(thumb);
      }
    } catch {
      setSources((prev) => {
        const next = [...prev];
        next[index] = { platform: detectPlatform(url), url };
        return next;
      });
    } finally {
      setParsingIndex(null);
    }
  };

  const addSource = () => {
    setSources((prev) => [...prev, { platform: "", url: "" }]);
  };

  const removeSource = (index: number) => {
    if (sources.length <= 1) return;
    setSources((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSource = (
    index: number,
    field: keyof SourceInput,
    value: string,
  ) => {
    setSources((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const validSources = sources.filter((s) => s.url.trim());
    if (!title.trim() || validSources.length === 0) {
      setError(t("submitError"));
      setLoading(false);
      return;
    }

    const payload: SubmitVideoPayload = {
      title: title.trim(),
      description: description.trim(),
      category,
      tags: tags
        .split(/[,，、]/)
        .map((t) => t.trim())
        .filter(Boolean),
      year,
      sources: validSources.map((s) => ({
        platform: s.platform || detectPlatform(s.url),
        url: s.url.trim(),
      })),
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
      setTimeout(handleClose, 1200);
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
          <h2 className="text-base font-semibold text-[var(--color-text)]">
            {t("submitTitle")}
          </h2>
          <p className="mt-0.5 text-xs text-[var(--color-textSubtle)]">
            {t("submitHint")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="text-[var(--color-textMuted)] hover:text-[var(--color-text)]"
          aria-label={t("close")}
        >
          <IconClose />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[75vh] p-5 space-y-5">
        {thumbnail && (
          <div
            className="h-32 rounded-xl bg-cover bg-center"
            style={{ backgroundImage: `url(${thumbnail})` }}
          />
        )}

        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-textSubtle)]">
            {t("sources")}
          </label>
          {sources.map((source, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-2">
              <select
                value={source.platform}
                onChange={(e) => updateSource(i, "platform", e.target.value)}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] sm:w-36"
              >
                <option value="">{t("platform")}</option>
                {KNOWN_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
                <option value="other">other</option>
              </select>
              <input
                type="url"
                value={source.url}
                onChange={(e) => updateSource(i, "url", e.target.value)}
                onBlur={() => parseSource(i)}
                placeholder={t("link")}
                className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => parseSource(i)}
                  disabled={parsingIndex === i}
                  className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-textMuted)] hover:border-[var(--color-accent)] disabled:opacity-50"
                >
                  {parsingIndex === i ? t("parsing") : t("parseLink")}
                </button>
                {sources.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSource(i)}
                    className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-textMuted)] hover:text-red-400"
                  >
                    {t("remove")}
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addSource}
            className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline"
          >
            <IconPlus className="h-3 w-3" />
            {t("addSource")}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-textSubtle)]">
              {t("videoTitle")}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-textSubtle)]">
              {t("videoDescription")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] resize-none"
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
                  active={category === c}
                  onClick={() => setCategory(c)}
                >
                  {categoryLabel(c)}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-textSubtle)]">
                {t("videoTags")}
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-textSubtle)]">
                {t("videoYear")}
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={2000}
                max={2100}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && (
          <p className="text-sm text-[var(--color-accent)]">{t("submitSuccess")}</p>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-xl border border-[var(--color-border)] py-2.5 text-sm text-[var(--color-textMuted)] hover:bg-[var(--color-bgMuted)]"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-[var(--color-accent)] py-2.5 text-sm font-medium text-[var(--color-accentText)] hover:bg-[var(--color-accentHover)] disabled:opacity-50"
          >
            {loading ? t("submitting") : t("confirmSubmit")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
