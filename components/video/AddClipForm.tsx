"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { parseTimestamp } from "@/lib/time";

interface AddClipFormProps {
  onAdd: (startSeconds: number, note: string) => void;
  onCancel: () => void;
}

export function AddClipForm({ onAdd, onCancel }: AddClipFormProps) {
  const { t } = useTranslation("common");
  const [timeInput, setTimeInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    const seconds = parseTimestamp(timeInput);
    if (seconds === null) {
      setError(t("clipTimeInvalid"));
      return;
    }
    onAdd(seconds, noteInput.trim().slice(0, 50));
    setTimeInput("");
    setNoteInput("");
    setError("");
    onCancel();
  };

  return (
    <div className="rounded-xl border border-[var(--color-borderSubtle)] bg-[var(--color-bgMuted)]/40 p-3">
      <p className="text-xs text-[var(--color-textSubtle)]">{t("clipBookmarksHint")}</p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start">
        <input
          type="text"
          inputMode="numeric"
          value={timeInput}
          onChange={(e) => {
            setTimeInput(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder={t("clipTimePlaceholder")}
          className="w-full border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] sm:max-w-[8rem]"
          aria-label={t("clipTimePlaceholder")}
          autoFocus
        />
        <input
          type="text"
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder={t("clipNotePlaceholder")}
          className="min-w-0 flex-1 border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          maxLength={50}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs text-[var(--color-textMuted)] hover:text-[var(--color-text)]"
        >
          {t("cancel")}
        </button>
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-[var(--color-accentText)]"
        >
          {t("clipAdd")}
        </button>
      </div>
    </div>
  );
}
