"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { useLocale } from "@/components/providers/LocaleProvider";
import { IconEye, IconHeart } from "@/components/ui/IconButton";
import type { Video } from "@/lib/types";
import {
  getDisplayViewCount,
  getPlatformLabel,
} from "@/lib/video-platforms";

function formatViews(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

interface VideoCardProps {
  video: Video;
  onClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

export function VideoCard({
  video,
  onClick,
  isFavorite,
  onToggleFavorite,
}: VideoCardProps) {
  const { categoryLabel } = useLocale();
  const primaryPlatform = video.sources[0]?.platform ?? "other";
  const views = getDisplayViewCount(video);

  return (
    <article className="group cursor-pointer" onClick={onClick}>
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-[var(--color-bgMuted)]">
        <Image
          src={video.thumbnail || "/placeholder-video.svg"}
          alt={video.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <button
          type="button"
          onClick={onToggleFavorite}
          className={`absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
            isFavorite
              ? "bg-[var(--color-accent)] text-[var(--color-accentText)]"
              : "bg-black/40 text-white opacity-0 group-hover:opacity-100"
          } ${isFavorite ? "opacity-100" : ""}`}
          aria-label={isFavorite ? "unfavorite" : "favorite"}
        >
          <IconHeart filled={isFavorite} className="h-4 w-4" />
        </button>

        <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          {getPlatformLabel(primaryPlatform)}
        </span>
      </div>

      <div className="mt-2.5 space-y-1.5">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
          {video.title}
        </h3>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge active size="sm">
            {categoryLabel(video.category)}
          </Badge>
          {video.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} size="sm">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-[var(--color-textSubtle)]">
          <span className="inline-flex items-center gap-1">
            <IconEye />
            {formatViews(views)}
          </span>
          <span>{video.year}</span>
        </div>
      </div>
    </article>
  );
}
