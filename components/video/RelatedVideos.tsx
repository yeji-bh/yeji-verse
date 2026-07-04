"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { getThumbnailDisplayUrl } from "@/lib/thumbnail";
import type { Video } from "@/lib/types";

const SLOT_COUNT = 5;

const relatedCache = new Map<string, Video[]>();
const relatedInflight = new Map<string, Promise<Video[]>>();

function loadRelatedVideos(videoId: string): Promise<Video[]> {
  const cached = relatedCache.get(videoId);
  if (cached) return Promise.resolve(cached);

  const pending = relatedInflight.get(videoId);
  if (pending) return pending;

  const request = fetch(
    `/api/videos/related?id=${encodeURIComponent(videoId)}&limit=${SLOT_COUNT}`,
  )
    .then(async (res) => {
      if (!res.ok) return [] as Video[];
      const data = (await res.json()) as Video[];
      return Array.isArray(data) ? data : [];
    })
    .then((data) => {
      relatedCache.set(videoId, data);
      relatedInflight.delete(videoId);
      return data;
    })
    .catch(() => {
      relatedInflight.delete(videoId);
      return [] as Video[];
    });

  relatedInflight.set(videoId, request);
  return request;
}

interface RelatedVideosProps {
  videoId: string;
  onSelect: (video: Video) => void;
}

function RelatedThumb({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const img = new window.Image();
    img.src = src;
    if (img.complete) {
      setLoaded(true);
      return;
    }
    const markLoaded = () => setLoaded(true);
    img.addEventListener("load", markLoaded);
    img.addEventListener("error", markLoaded);
    return () => {
      img.removeEventListener("load", markLoaded);
      img.removeEventListener("error", markLoaded);
    };
  }, [src]);

  return (
    <div className="relative aspect-video overflow-hidden bg-[var(--color-bgMuted)]">
      {!loaded && (
        <div
          className="absolute inset-0 z-[1] animate-pulse bg-[var(--color-borderSubtle)]"
          aria-hidden
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 33vw, 12vw"
        className={`object-cover transition-opacity duration-300 group-hover:scale-[1.02] group-hover:transition-transform ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        unoptimized
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

function RelatedSlotSkeleton({ index }: { index: number }) {
  return (
    <div
      className={`min-w-0 animate-pulse ${index >= 3 ? "hidden lg:block" : ""}`}
      aria-hidden
    >
      <div className="aspect-video bg-[var(--color-borderSubtle)]" />
      <div className="mt-1.5 space-y-1.5">
        <div className="h-3 w-full rounded bg-[var(--color-borderSubtle)]" />
        <div className="h-3 w-2/3 rounded bg-[var(--color-borderSubtle)]" />
      </div>
    </div>
  );
}

export function RelatedVideos({ videoId, onSelect }: RelatedVideosProps) {
  const { t } = useTranslation("common");
  const [videos, setVideos] = useState<Video[] | null>(
    () => relatedCache.get(videoId) ?? null,
  );

  useEffect(() => {
    let cancelled = false;
    const cached = relatedCache.get(videoId);
    if (cached) {
      setVideos(cached);
      return;
    }

    setVideos(null);
    void loadRelatedVideos(videoId).then((data) => {
      if (!cancelled) setVideos(data);
    });

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  if (videos !== null && videos.length === 0) return null;

  const loading = videos === null;

  return (
    <section className="mt-5 border-t border-[var(--color-borderSubtle)] pt-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--color-text)]">
        {t("relatedVideos")}
      </h3>
      <div className="grid grid-cols-3 gap-2 lg:grid-cols-5 lg:gap-3">
        {loading
          ? Array.from({ length: SLOT_COUNT }, (_, index) => (
              <RelatedSlotSkeleton key={index} index={index} />
            ))
          : videos.map((video, index) => (
              <button
                key={video.id}
                type="button"
                onClick={() => onSelect(video)}
                className={`group min-w-0 text-left ${index >= 3 ? "hidden lg:block" : ""}`}
              >
                {video.thumbnail ? (
                  <RelatedThumb
                    src={getThumbnailDisplayUrl(video.thumbnail)}
                    alt={video.title}
                  />
                ) : (
                  <div className="aspect-video bg-[var(--color-bgMuted)]" />
                )}
                <p className="mt-1.5 line-clamp-2 min-h-[2lh] text-[11px] font-medium leading-snug text-[var(--color-textMuted)] transition-colors group-hover:text-[var(--color-accent)] sm:text-xs">
                  {video.title}
                </p>
              </button>
            ))}
      </div>
    </section>
  );
}
