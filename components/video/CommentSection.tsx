"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatRelativeTime } from "@/lib/relative-time";
import type { Comment } from "@/lib/types";

interface CommentSectionProps {
  videoId: string;
  className?: string;
  fillHeight?: boolean;
}

function CommentTime({ createdAt }: { createdAt: string }) {
  const { t } = useTranslation("common");
  const [label, setLabel] = useState(() => formatRelativeTime(createdAt, t));

  useEffect(() => {
    const update = () => setLabel(formatRelativeTime(createdAt, t));
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, [createdAt, t]);

  return (
    <time dateTime={createdAt} className="shrink-0 text-xs text-[var(--color-textSubtle)]">
      {label}
    </time>
  );
}

export function CommentSection({ videoId, className = "", fillHeight = false }: CommentSectionProps) {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

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
      body: JSON.stringify({
        content,
        nickname: user ? user.username : nickname,
      }),
    });
    setLoading(false);
    if (res.ok) {
      setContent("");
      load();
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) return;
    setSavingId(commentId);
    try {
      const res = await fetch(`/api/videos/${videoId}/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });
      if (!res.ok) throw new Error("failed");
      cancelEdit();
      load();
    } catch {
      alert(t("saveError"));
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm(t("confirmDeleteComment"))) return;
    try {
      const res = await fetch(`/api/videos/${videoId}/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("failed");
      if (editingId === commentId) cancelEdit();
      load();
    } catch {
      alert(t("saveError"));
    }
  };

  const canManage = (comment: Comment) => !!user && comment.userId === user.id;

  return (
    <div
      className={`space-y-4 border-t border-[var(--color-borderSubtle)] pt-4 ${
        fillHeight ? "lg:flex lg:flex-col" : ""
      } ${className}`}
    >
      <h3 className="text-sm font-semibold text-[var(--color-text)]">{t("comments")}</h3>

      <form onSubmit={handleSubmit} className="space-y-2">
        {user ? (
          <p className="text-xs text-[var(--color-textMuted)]">
            <span className="font-medium text-[var(--color-text)]">{user.username}</span>
          </p>
        ) : (
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={t("commentNickname")}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        )}
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

      <div
        className={`space-y-3 overflow-y-auto ${
          fillHeight ? "max-h-48 lg:max-h-72 lg:shrink-0" : "max-h-48"
        }`}
      >
        {comments.length === 0 ? (
          <p className="text-xs text-[var(--color-textSubtle)]">{t("noComments")}</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="rounded-xl bg-[var(--color-bgMuted)] p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-xs font-medium text-[var(--color-text)]">
                    {c.nickname || t("anonymous")}
                  </p>
                  <CommentTime createdAt={c.createdAt} />
                </div>
                {canManage(c) && editingId !== c.id && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="text-xs text-[var(--color-textMuted)] hover:text-[var(--color-accent)]"
                    >
                      {t("edit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      {t("delete")}
                    </button>
                  </div>
                )}
              </div>

              {editingId === c.id ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs"
                    >
                      {t("cancel")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(c.id)}
                      disabled={savingId === c.id || !editContent.trim()}
                      className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-[var(--color-accentText)] disabled:opacity-50"
                    >
                      {savingId === c.id ? t("submitting") : t("save")}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-sm text-[var(--color-textMuted)]">{c.content}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
