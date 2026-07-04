"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { useTranslation } from "react-i18next";
import { getThumbnailDisplayUrl } from "@/lib/thumbnail";
import type { Video } from "@/lib/types";

interface VideoCardProps {
  video: Video;
  onClick: () => void;
  isChecked: boolean;
  onToggleChecked: (e: React.MouseEvent) => void;
  /** Above-the-fold cards: load eagerly for LCP */
  priority?: boolean;
}

const TAG_GAP_PX = 6;

function CardMetaRow({ tags, date }: { tags: string[]; date: string }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLTimeElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(tags.length);

  const recompute = useCallback(() => {
    const row = rowRef.current;
    const measure = measureRef.current;
    const dateEl = dateRef.current;

    if (!row || !dateEl) {
      setVisibleCount(tags.length);
      return;
    }

    if (tags.length === 0) return;

    const rowWidth = row.clientWidth;
    const dateWidth = dateEl.offsetWidth;
    const available = rowWidth - dateWidth - TAG_GAP_PX;

    if (available <= 0) {
      setVisibleCount(0);
      return;
    }

    const badges = measure?.querySelectorAll(".card-tag-measure") ?? [];
    let used = 0;
    let count = 0;

    for (let i = 0; i < badges.length; i++) {
      const badgeWidth = (badges[i] as HTMLElement).offsetWidth;
      const nextUsed = count === 0 ? badgeWidth : used + TAG_GAP_PX + badgeWidth;
      if (nextUsed > available) break;
      used = nextUsed;
      count++;
    }

    setVisibleCount(count);
  }, [tags]);

  useLayoutEffect(() => {
    recompute();
  }, [recompute, date]);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const observer = new ResizeObserver(() => recompute());
    observer.observe(row);
    return () => observer.disconnect();
  }, [recompute]);

  return (
    <div ref={rowRef} className="relative mt-2 flex flex-nowrap items-center gap-1.5">
      {tags.length > 0 && (
        <>
          <div
            ref={measureRef}
            className="pointer-events-none absolute left-0 top-0 -z-10 flex gap-1.5 opacity-0"
            aria-hidden
          >
            {tags.map((tag, index) => (
              <Badge
                key={`measure-${index}`}
                size="sm"
                className="card-tag-measure max-lg:!px-1.5 max-lg:!py-0.5 max-lg:!text-[10px] shrink-0 whitespace-nowrap"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-1.5 overflow-hidden">
            {tags.slice(0, visibleCount).map((tag, index) => (
              <Badge key={`${index}-${tag}`} size="sm" className="max-lg:!px-1.5 max-lg:!py-0.5 max-lg:!text-[10px] shrink-0 whitespace-nowrap">
                {tag}
              </Badge>
            ))}
          </div>
        </>
      )}

      <time
        ref={dateRef}
        dateTime={date}
        className="ml-auto shrink-0 whitespace-nowrap text-[10px] text-[var(--color-textSubtle)] sm:text-xs"
      >
        {date}
      </time>
    </div>
  );
}

function LazyThumbnail({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(priority);

  useEffect(() => {
    if (priority) {
      setShouldLoad(true);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "80px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [priority]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {shouldLoad ? (
        <Image
          src={src}
          alt={alt}
          fill
          loading={priority ? "eager" : "lazy"}
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-[var(--color-bgMuted)]" aria-hidden />
      )}
    </div>
  );
}

export function VideoCard({
  video,
  onClick,
  isChecked,
  onToggleChecked,
  priority = false,
}: VideoCardProps) {
  const { t } = useTranslation("common");
  const displayTags = [t(video.category), ...video.tags];

  return (
    <article
      className="group cursor-pointer [content-visibility:auto] [contain-intrinsic-size:auto_260px]"
      onClick={onClick}
    >
      <div className="relative aspect-video overflow-hidden bg-[var(--color-bgMuted)] shadow-[var(--color-shadow)]">
        <LazyThumbnail
          src={getThumbnailDisplayUrl(video.thumbnail)}
          alt={video.title}
          priority={priority}
        />

        <div className="absolute top-2 right-2 z-10 sm:top-2.5 sm:right-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleChecked(e);
            }}
            className={`flex h-6 w-6 items-center justify-center rounded-full text-white transition-colors sm:h-7 sm:w-7 ${
              isChecked ? "bg-emerald-500/95" : "bg-black/45"
            }`}
            aria-label={isChecked ? t("markUnwatched") : t("markWatched")}
          >
            <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>

      <h3 className="mt-2 line-clamp-2 text-xs font-semibold leading-snug text-[var(--color-text)] transition-colors group-hover:text-[var(--color-accent)] sm:mt-3 sm:text-sm">
        {video.title}
      </h3>

      <CardMetaRow tags={displayTags} date={video.publishedDate} />
    </article>
  );
}
