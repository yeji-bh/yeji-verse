"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Video } from "@/lib/types";

export const VIDEO_PAGE_SIZE = 12;

interface PaginatedResponse {
  videos: Video[];
  total: number;
  hasMore: boolean;
}

function mergeVideos(prev: Video[], next: Video[]): Video[] {
  const seen = new Set(prev.map((v) => v.id));
  const merged = [...prev];
  for (const video of next) {
    if (!seen.has(video.id)) {
      merged.push(video);
      seen.add(video.id);
    }
  }
  return merged;
}

export function usePaginatedVideos(enabled: boolean) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [fullyLoaded, setFullyLoaded] = useState(false);
  const offsetRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const stateRef = useRef({ hasMore: false, fullyLoaded: false });
  stateRef.current = { hasMore, fullyLoaded };

  const fetchPage = useCallback(
    async (offset: number, append: boolean, signal?: AbortSignal) => {
      const res = await fetch(
        `/api/videos?limit=${VIDEO_PAGE_SIZE}&offset=${offset}`,
        { signal },
      );
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as PaginatedResponse;
      setVideos((prev) => (append ? mergeVideos(prev, data.videos) : data.videos));
      setHasMore(data.hasMore);
      setTotal(data.total);
      offsetRef.current = offset + data.videos.length;
      return data;
    },
    [],
  );

  const loadMore = useCallback(async () => {
    const { hasMore: canLoad, fullyLoaded: done } = stateRef.current;
    if (!canLoad || done || loadingMoreRef.current) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      await fetchPage(offsetRef.current, true);
    } catch {
      /* keep current */
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [fetchPage]);

  const loadAll = useCallback(async () => {
    if (fullyLoaded || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const res = await fetch("/api/videos");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setVideos(data);
          setHasMore(false);
          setTotal(data.length);
          setFullyLoaded(true);
          offsetRef.current = data.length;
        }
      }
    } catch {
      /* keep current */
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [fullyLoaded]);

  const reset = useCallback(() => {
    offsetRef.current = 0;
    setFullyLoaded(false);
    loadingMoreRef.current = false;
    setLoadingMore(false);
    setLoading(true);

    void fetchPage(0, false)
      .catch(() => {
        setVideos([]);
        setHasMore(false);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [fetchPage]);

  useEffect(() => {
    if (!enabled) return;

    const ac = new AbortController();
    setLoading(true);
    offsetRef.current = 0;
    setFullyLoaded(false);

    (async () => {
      try {
        await fetchPage(0, false, ac.signal);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setVideos([]);
        setHasMore(false);
        setTotal(0);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [enabled, fetchPage]);

  return {
    videos,
    setVideos,
    loading,
    loadingMore,
    hasMore: hasMore && !fullyLoaded,
    fullyLoaded,
    total,
    loadMore,
    loadAll,
    reset,
  };
}
