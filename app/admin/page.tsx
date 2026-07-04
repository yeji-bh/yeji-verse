"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { IconExternal } from "@/components/ui/IconButton";
import { getThumbnailDisplayUrl } from "@/lib/thumbnail";
import { getPlatformLabel } from "@/lib/video-platforms";
import type { Video } from "@/lib/types";

function ReviewCard({
  video,
  onApprove,
  onReject,
  onDelete,
}: {
  video: Video;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation("common");
  const thumb = getThumbnailDisplayUrl(video.thumbnail);

  return (
    <article className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bgElevated)]">
      <div className="flex flex-col gap-4 p-4 sm:flex-row">
        <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-[var(--color-bgMuted)] sm:w-48">
          {video.thumbnail ? (
            <Image
              src={thumb}
              alt={video.title}
              fill
              className="object-cover"
              sizes="192px"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[var(--color-textSubtle)]">
              —
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h3 className="text-base font-semibold leading-snug text-[var(--color-text)]">
              {video.title}
            </h3>
            <p className="mt-1 text-xs text-[var(--color-textSubtle)]">
              {t("submittedAt")}: {new Date(video.createdAt).toLocaleString()}
            </p>
          </div>

          <dl className="grid gap-2 text-sm">
            <div className="flex flex-wrap gap-x-2">
              <dt className="shrink-0 text-[var(--color-textSubtle)]">{t("category")}</dt>
              <dd className="text-[var(--color-text)]">{t(video.category)}</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="shrink-0 text-[var(--color-textSubtle)]">{t("videoDate")}</dt>
              <dd className="text-[var(--color-text)]">{video.publishedDate || "—"}</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="shrink-0 text-[var(--color-textSubtle)]">{t("tags")}</dt>
              <dd className="text-[var(--color-text)]">
                {video.tags.length > 0 ? (
                  <span className="flex flex-wrap gap-1.5">
                    {video.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[var(--color-bgMuted)] px-2 py-0.5 text-xs text-[var(--color-textMuted)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </span>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="mb-1 text-[var(--color-textSubtle)]">{t("description")}</dt>
              <dd className="whitespace-pre-wrap text-[var(--color-textMuted)]">
                {video.description.trim() || "—"}
              </dd>
            </div>
            <div>
              <dt className="mb-1.5 text-[var(--color-textSubtle)]">{t("sources")}</dt>
              <dd className="space-y-1.5">
                {video.sources.length > 0 ? (
                  video.sources.map((s) => (
                    <a
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 break-all text-[var(--color-accent)] hover:underline"
                    >
                      <PlatformIcon platform={s.platform} className="h-4 w-4 shrink-0" />
                      <span className="font-medium">{getPlatformLabel(s.platform)}</span>
                      <span className="text-[var(--color-textMuted)]">{s.url}</span>
                      <IconExternal className="h-3.5 w-3.5 shrink-0 opacity-70" />
                    </a>
                  ))
                ) : (
                  <span className="text-[var(--color-textMuted)]">—</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-[var(--color-borderSubtle)] px-4 py-3">
        <button
          type="button"
          onClick={onApprove}
          className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-[var(--color-accentText)]"
        >
          {t("approve")}
        </button>
        <button
          type="button"
          onClick={onReject}
          className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs"
        >
          {t("reject")}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg border border-red-300 px-3 py-1.5 text-xs text-red-500"
        >
          {t("delete")}
        </button>
      </div>
    </article>
  );
}

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
              <ReviewCard
                key={v.id}
                video={v}
                onApprove={() => setStatus(v.id, "approved")}
                onReject={() => setStatus(v.id, "rejected")}
                onDelete={() => remove(v.id)}
              />
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
