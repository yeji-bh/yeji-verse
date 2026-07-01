"use client";

import { useEffect, useState } from "react";
import type { Video } from "@/lib/types";

export function useFavoriteVideos(ids: string[], enabled: boolean) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const idsKey = [...ids].sort().join(",");

  useEffect(() => {
    if (!enabled) return;

    if (ids.length === 0) {
      setVideos([]);
      setLoading(false);
      return;
    }

    const ac = new AbortController();
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/videos?ids=${encodeURIComponent(ids.join(","))}`,
          { signal: ac.signal },
        );
        if (!cancelled && res.ok) {
          const data = await res.json();
          setVideos(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [enabled, idsKey]);

  return { videos, setVideos, loading };
}
