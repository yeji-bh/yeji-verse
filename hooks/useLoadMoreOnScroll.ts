"use client";

import { useEffect, useRef } from "react";

const ROOT_MARGIN = "320px 0px";

export function useLoadMoreOnScroll(
  onLoadMore: (() => void) | undefined,
  enabled: boolean,
  loading: boolean,
) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  const loadingRef = useRef(loading);

  onLoadMoreRef.current = onLoadMore;
  loadingRef.current = loading;

  useEffect(() => {
    if (!enabled || loading) return;

    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || loadingRef.current) return;
        onLoadMoreRef.current?.();
      },
      { rootMargin: ROOT_MARGIN },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, loading]);

  return sentinelRef;
}
