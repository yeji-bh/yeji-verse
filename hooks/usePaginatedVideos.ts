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

interface InitialPage {
  videos: Video[];
  total: number;
}

export function usePaginatedVideos(
  enabled: boolean,
  initialPage?: InitialPage | null,
) {
  const hasInitial = Boolean(initialPage && initialPage.videos.length > 0);
  const [videos, setVideos] = useState<Video[]>(
    () => initialPage?.videos ?? [],
  );
  const [loading, setLoading] = useState(enabled && !hasInitial);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(() =>
    hasInitial
      ? initialPage!.videos.length < initialPage!.total
      : false,
  );
  const [total, setTotal] = useState(() => initialPage?.total ?? 0);
  const [fullyLoaded, setFullyLoaded] = useState(false);
  const offsetRef = useRef(hasInitial ? initialPage!.videos.length : 0);
  const totalRef = useRef(initialPage?.total ?? 0);
  const loadingMoreRef = useRef(false);
  const loadAllAbortRef = useRef<AbortController | null>(null);
  const initialUsedRef = useRef(hasInitial);
  const stateRef = useRef({ hasMore: false, fullyLoaded: false });
  stateRef.current = { hasMore, fullyLoaded };
  totalRef.current = total;

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
      totalRef.current = data.total;
      offsetRef.current = offset + data.videos.length;
      return data;
    },
    [],
  );

  const abortLoadAll = useCallback(() => {
    loadAllAbortRef.current?.abort();
    loadAllAbortRef.current = null;
  }, []);

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
    if (fullyLoaded) return;

    abortLoadAll();
    const ac = new AbortController();
    loadAllAbortRef.current = ac;

    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const res = await fetch("/api/videos", { signal: ac.signal });
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;

      const expectedTotal = totalRef.current;
      const gotAll = expectedTotal === 0 || data.length >= expectedTotal;

      setVideos(data);
      setTotal(Math.max(expectedTotal, data.length));
      totalRef.current = Math.max(expectedTotal, data.length);
      setFullyLoaded(gotAll);
      setHasMore(!gotAll);
      offsetRef.current = data.length;
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
    } finally {
      if (loadAllAbortRef.current === ac) {
        loadAllAbortRef.current = null;
      }
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [abortLoadAll, fullyLoaded]);

  const reset = useCallback(() => {
    abortLoadAll();
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
        totalRef.current = 0;
      })
      .finally(() => setLoading(false));
  }, [abortLoadAll, fetchPage]);

  useEffect(() => {
    if (!enabled) return;

    const ac = new AbortController();

    // First paint already has build-time data for LCP — refresh in the background
    // without clearing the grid (avoids skeleton flash and keeps HTML LCP image).
    if (initialUsedRef.current) {
      initialUsedRef.current = false;
      void fetchPage(0, false, ac.signal).catch(() => {
        /* keep initial snapshot */
      });
      return () => ac.abort();
    }

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
        totalRef.current = 0;
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
    abortLoadAll,
  };
}
