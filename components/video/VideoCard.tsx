"use client";

import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/Badge";
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

function CardMetaRow({ tags, date }: { tags: string[]; date: string }) {
  return (
    <div className="mt-2 flex flex-nowrap items-center gap-1.5 overflow-hidden">
      {tags.length > 0 && (
        <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-1.5 overflow-hidden">
          {tags.map((tag, index) => (
            <Badge
              key={`${index}-${tag}`}
              size="sm"
              className="max-lg:!px-1.5 max-lg:!py-0.5 max-lg:!text-[10px] shrink-0 whitespace-nowrap"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <time
        dateTime={date}
        className="ml-auto shrink-0 whitespace-nowrap text-[10px] text-[var(--color-textSubtle)] sm:text-xs"
      >
        {date}
      </time>
    </div>
  );
}

function Thumbnail({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    // Native img keeps LCP discoverable and avoids Next/Image + IO quirks in the grid.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
    />
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
  const displayTags = [
    video.subcategory
      ? `${t(video.category)} · ${t(video.subcategory)}`
      : t(video.category),
    ...video.tags,
  ];

  return (
    <article className="group cursor-pointer" onClick={onClick}>
      <div className="relative aspect-video overflow-hidden bg-[var(--color-bgMuted)] shadow-[var(--color-shadow)]">
        <Thumbnail
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
