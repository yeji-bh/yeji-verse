"use client";

import { useEffect, useRef } from "react";

export function useLoadMoreOnScroll(
  onLoadMore: (() => void) | undefined,
  enabled: boolean,
  loading: boolean,
) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const lockedRef = useRef(false);

  useEffect(() => {
    if (!loading) lockedRef.current = false;
  }, [loading]);

  useEffect(() => {
    if (!enabled || !onLoadMore) return;

    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || lockedRef.current || loading) return;
        lockedRef.current = true;
        onLoadMore();
      },
      { rootMargin: "160px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, onLoadMore, loading]);

  return sentinelRef;
}
