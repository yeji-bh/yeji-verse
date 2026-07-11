"use client";

import { useCallback, useRef, useState } from "react";
import { detectPlatform, getThumbnailUrl } from "@/lib/video-platforms";

export interface ParsedVideoUrl {
  platform: string;
  title: string | null;
  description: string | null;
  publishedDate: string | null;
  thumbnail: string;
}

export function useVideoUrlParser() {
  const parseSeq = useRef(0);
  const [parsing, setParsing] = useState(false);

  const cancelParse = useCallback(() => {
    parseSeq.current += 1;
    setParsing(false);
  }, []);

  const parseUrl = useCallback(async (link: string): Promise<ParsedVideoUrl | null> => {
    const trimmed = link.trim();
    if (!trimmed) return null;

    const seq = ++parseSeq.current;
    setParsing(true);

    try {
      const res = await fetch("/api/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      if (seq !== parseSeq.current) return null;
      if (!res.ok) throw new Error("metadata parse failed");

      const data = await res.json();
      if (data?.error) throw new Error("metadata parse failed");
      const platform = data.platform ?? detectPlatform(trimmed);

      return {
        platform,
        title: data.title ?? null,
        description: data.description ?? null,
        publishedDate: data.publishedDate ?? null,
        thumbnail: data.thumbnail ?? getThumbnailUrl(trimmed, platform) ?? "",
      };
    } catch {
      if (seq !== parseSeq.current) return null;
      const platform = detectPlatform(trimmed);
      return {
        platform,
        title: null,
        description: null,
        publishedDate: null,
        thumbnail: getThumbnailUrl(trimmed, platform) ?? "",
      };
    } finally {
      if (seq === parseSeq.current) setParsing(false);
    }
  }, []);

  return { parseUrl, parsing, cancelParse };
}
