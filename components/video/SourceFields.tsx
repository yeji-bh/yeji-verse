"use client";

import { useTranslation } from "react-i18next";
import { KNOWN_PLATFORMS, MAX_VIDEO_SOURCES } from "@/lib/constants";
import { detectPlatform } from "@/lib/video-platforms";

export interface SourceInput {
  platform: string;
  url: string;
}

export function createEmptySource(platform = "youtube"): SourceInput {
  return { platform, url: "" };
}

interface SourceFieldsProps {
  sources: SourceInput[];
  onChange: (sources: SourceInput[]) => void;
  parsing?: boolean;
}

export function SourceFields({ sources, onChange, parsing = false }: SourceFieldsProps) {
  const { t } = useTranslation("common");

  const updateSource = (index: number, patch: Partial<SourceInput>) => {
    onChange(sources.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const addSource = () => {
    if (sources.length >= MAX_VIDEO_SOURCES) return;
    onChange([...sources, createEmptySource()]);
  };

  const removeSource = (index: number) => {
    if (sources.length <= 1) return;
    onChange(sources.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-textSubtle)]">
          {t("sources")}
        </label>
        <span className="text-xs text-[var(--color-textSubtle)]">{t("sourcesMax")}</span>
      </div>
      <p className="text-xs text-[var(--color-textSubtle)]">{t("sourceParseHint")}</p>

      <div className="space-y-2">
        {sources.map((source, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-2">
            <select
              value={source.platform}
              onChange={(e) => updateSource(index, { platform: e.target.value })}
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
              value={source.url}
              onChange={(e) => {
                const url = e.target.value;
                const patch: Partial<SourceInput> = { url };
                if (index > 0) {
                  patch.platform = detectPlatform(url);
                }
                updateSource(index, patch);
              }}
              placeholder={t("link")}
              required={index === 0}
              className="min-w-0 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
            {sources.length > 1 && (
              <button
                type="button"
                onClick={() => removeSource(index)}
                className="shrink-0 rounded-xl border border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-textMuted)] hover:border-red-300 hover:text-red-500"
              >
                {t("remove")}
              </button>
            )}
          </div>
        ))}
      </div>

      {sources.length < MAX_VIDEO_SOURCES && (
        <button
          type="button"
          onClick={addSource}
          className="text-xs text-[var(--color-accent)] hover:underline"
        >
          {t("addSource")}
        </button>
      )}

      {parsing && (
        <p className="text-xs text-[var(--color-textSubtle)]">{t("parsing")}</p>
      )}
    </div>
  );
}

export function normalizeSources(sources: SourceInput[]): SourceInput[] {
  return sources
    .map((s) => ({
      platform: (s.platform || detectPlatform(s.url)).trim() || "other",
      url: s.url.trim(),
    }))
    .filter((s) => s.url)
    .slice(0, MAX_VIDEO_SOURCES);
}
