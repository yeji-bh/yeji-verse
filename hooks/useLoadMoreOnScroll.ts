"use client";

import { useCallback, useEffect, useRef } from "react";

const VIEWPORT_MARGIN_PX = 200;

export function useLoadMoreOnScroll(
  onLoadMore: (() => void) | undefined,
  enabled: boolean,
  loading: boolean,
) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  const loadingRef = useRef(loading);
  const enabledRef = useRef(enabled);
  const lockedRef = useRef(false);

  onLoadMoreRef.current = onLoadMore;
  loadingRef.current = loading;
  enabledRef.current = enabled;

  const tryLoad = useCallback(() => {
    if (!enabledRef.current || !onLoadMoreRef.current) return;
    if (loadingRef.current || lockedRef.current) return;

    const el = sentinelRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight + VIEWPORT_MARGIN_PX) {
      lockedRef.current = true;
      onLoadMoreRef.current();
    }
  }, []);

  useEffect(() => {
    if (!loading) lockedRef.current = false;
  }, [loading]);

  useEffect(() => {
    if (!enabled) return;

    const onScroll = () => tryLoad();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    tryLoad();
    const raf = requestAnimationFrame(tryLoad);
    const timer = window.setTimeout(tryLoad, 100);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [enabled, tryLoad]);

  useEffect(() => {
    if (!enabled || loading) return;
    tryLoad();
    const timer = window.setTimeout(tryLoad, 50);
    return () => clearTimeout(timer);
  }, [enabled, loading, tryLoad]);

  return sentinelRef;
}
