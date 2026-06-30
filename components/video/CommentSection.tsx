"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Comment } from "@/lib/types";

interface CommentSectionProps {
  videoId: string;
}

export function CommentSection({ videoId }: CommentSectionProps) {
  const { t } = useTranslation("common");
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/videos/${videoId}/comments`);
    if (res.ok) setComments(await res.json());
  }, [videoId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/videos/${videoId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, nickname }),
    });
    setLoading(false);
    if (res.ok) {
      setContent("");
      load();
    }
  };

  return (
    <div className="space-y-4 border-t border-[var(--color-borderSubtle)] pt-4">
      <h3 className="text-sm font-semibold text-[var(--color-text)]">{t("comments")}</h3>

      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder={t("commentNickname")}
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("commentPlaceholder")}
          rows={2}
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] resize-none"
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-xs font-medium text-[var(--color-accentText)] disabled:opacity-50"
        >
          {t("commentSubmit")}
        </button>
      </form>

      <div className="space-y-3 max-h-48 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-xs text-[var(--color-textSubtle)]">{t("noComments")}</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="rounded-xl bg-[var(--color-bgMuted)] p-3">
              <p className="text-xs font-medium text-[var(--color-text)]">
                {c.nickname || t("anonymous")}
              </p>
              <p className="mt-1 text-sm text-[var(--color-textMuted)]">{c.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
