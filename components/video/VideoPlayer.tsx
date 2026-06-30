"use client";

import { getEmbedUrl } from "@/lib/video-platforms";

interface VideoPlayerProps {
  url: string;
  platform: string;
  title: string;
}

export function VideoPlayer({ url, platform, title }: VideoPlayerProps) {
  const embedUrl = getEmbedUrl(url, platform);

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

  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-[var(--color-bgMuted)]">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-[var(--color-accent)] hover:underline"
      >
        {url}
      </a>
    </div>
  );
}
