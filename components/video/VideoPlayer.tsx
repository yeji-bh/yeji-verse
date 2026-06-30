"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getEmbedUrl } from "@/lib/video-platforms";
import { getThumbnailDisplayUrl } from "@/lib/thumbnail";

interface VideoPlayerProps {
  url: string;
  platform: string;
  title: string;
  thumbnail?: string;
}

export function VideoPlayer({ url, platform, title, thumbnail }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const embedUrl = playing ? getEmbedUrl(url, platform, { autoplay: true }) : null;

  useEffect(() => {
    setPlaying(false);
  }, [url]);

  if (embedUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  const thumbSrc = thumbnail ? getThumbnailDisplayUrl(thumbnail) : null;

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative aspect-video w-full overflow-hidden rounded-xl bg-black"
      aria-label={title}
    >
      {thumbSrc ? (
        <Image
          src={thumbSrc}
          alt=""
          fill
          sizes="(max-width: 896px) 100vw, 896px"
          className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-[var(--color-bgMuted)]" />
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover:bg-black/35">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur-sm transition-transform group-hover:scale-105">
          <svg className="ml-1 h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5.14v14.72a1 1 0 0 0 1.5.86l11.04-7.36a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14Z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
