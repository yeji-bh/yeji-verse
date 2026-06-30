"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import type { Video } from "@/lib/types";

export default function AdminPage() {
  const { t } = useTranslation("common");
  const { user, loading } = useAuth();
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/videos?admin=true");
    if (res.ok) setVideos(await res.json());
  }, []);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "admin") load();
  }, [user, load]);

  const setStatus = async (id: string, status: string) => {
    await fetch(`/api/videos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm(t("delete"))) return;
    await fetch(`/api/videos/${id}`, { method: "DELETE" });
    load();
  };

  if (loading || !user || user.role !== "admin") {
    return null;
  }

  const pending = videos.filter((v) => v.status === "pending");

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{t("admin")}</h1>
          <Link href="/" className="text-sm text-[var(--color-accent)]">
            {t("backToHome")}
          </Link>
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--color-textMuted)]">
            {t("pending")} ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <p className="text-sm text-[var(--color-textSubtle)]">—</p>
          ) : (
            pending.map((v) => (
              <div
                key={v.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] p-4"
              >
                <div>
                  <p className="font-medium">{v.title}</p>
                  <p className="text-xs text-[var(--color-textSubtle)]">
                    {v.year} · {t(v.category)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus(v.id, "approved")}
                    className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs text-[var(--color-accentText)]"
                  >
                    {t("approve")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(v.id, "rejected")}
                    className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs"
                  >
                    {t("reject")}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(v.id)}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-xs text-red-500"
                  >
                    {t("delete")}
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--color-textMuted)]">
            {t("approved")} ({videos.filter((v) => v.status === "approved").length})
          </h2>
          {videos
            .filter((v) => v.status === "approved")
            .map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-xl border border-[var(--color-border)] p-4"
              >
                <p className="text-sm font-medium">{v.title}</p>
                <button
                  type="button"
                  onClick={() => remove(v.id)}
                  className="text-xs text-red-500"
                >
                  {t("delete")}
                </button>
              </div>
            ))}
        </section>
      </div>
    </div>
  );
}
