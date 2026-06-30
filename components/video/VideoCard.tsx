"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { useTranslation } from "react-i18next";
import { IconHeart } from "@/components/ui/IconButton";
import { getThumbnailDisplayUrl } from "@/lib/thumbnail";
import type { Video } from "@/lib/types";

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
  const { t } = useTranslation("common");

  return (
    <article className="group cursor-pointer" onClick={onClick}>
      <div className="relative aspect-video overflow-hidden rounded-xl bg-[var(--color-bgMuted)]">
        <Image
          src={getThumbnailDisplayUrl(video.thumbnail)}
          alt={video.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          unoptimized
        />

        <span className="absolute top-2 left-2 z-10 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          {t(video.category)}
        </span>

        <button
          type="button"
          onClick={onToggleFavorite}
          className={`absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
            isFavorite
              ? "bg-[var(--color-accent)] text-[var(--color-accentText)]"
              : "bg-black/45 text-white opacity-0 group-hover:opacity-100"
          } ${isFavorite ? "opacity-100" : ""}`}
          aria-label={isFavorite ? t("unfavorite") : t("favorite")}
        >
          <IconHeart filled={isFavorite} className="h-3.5 w-3.5" />
        </button>
      </div>

      <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
        {video.title}
      </h3>

      {video.tags.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {video.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </article>
  );
}
