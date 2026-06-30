"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export function useIncrementalRender<T extends { id?: string }>(items: T[], batchSize = 24) {
  const [count, setCount] = useState(batchSize);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const itemsKey = useMemo(
    () => items.map((item) => item.id ?? "").join("\0"),
    [items],
  );

  useEffect(() => {
    setCount(batchSize);
  }, [itemsKey, batchSize]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || count >= items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setCount((prev) => Math.min(prev + batchSize, items.length));
        }
      },
      { rootMargin: "800px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [items.length, count, batchSize]);

  return {
    visibleItems: items.slice(0, count),
    sentinelRef,
    hasMore: count < items.length,
  };
}
