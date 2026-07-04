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
  /** 直接嵌入播放器，不顯示縮圖與自訂播放按鈕 */
  embedOnMount?: boolean;
}

export function VideoPlayer({
  url,
  platform,
  title,
  thumbnail,
  embedOnMount = false,
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(embedOnMount);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const embedUrl =
    embedOnMount || playing
      ? getEmbedUrl(url, platform, { autoplay: !embedOnMount && playing })
      : null;
  const thumbSrc = thumbnail ? getThumbnailDisplayUrl(thumbnail) : null;

  useEffect(() => {
    setPlaying(embedOnMount);
    setIframeLoaded(false);
  }, [url, embedOnMount]);

  if (embedUrl) {
    return (
      <div className="relative block aspect-video w-full overflow-hidden bg-black">
        {thumbSrc && !iframeLoaded && (
          <Image
            src={thumbSrc}
            alt=""
            fill
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
            unoptimized
            priority={embedOnMount}
          />
        )}
        <iframe
          src={embedUrl}
          title={title}
          className={`absolute inset-0 h-full w-full transition-opacity duration-200 ${
            iframeLoaded ? "opacity-100" : "opacity-0"
          }`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
          allowFullScreen
          onLoad={() => setIframeLoaded(true)}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative block aspect-video w-full overflow-hidden bg-black"
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
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur-sm transition-transform group-hover:scale-105">
          <svg className="ml-0.5 h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5.14v14.72a1 1 0 0 0 1.5.86l11.04-7.36a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14Z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
