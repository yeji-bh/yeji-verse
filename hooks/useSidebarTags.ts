"use client";

import { useCallback, useEffect, useState } from "react";

export function useSidebarTags() {
  const [tags, setTags] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/tags");
      if (!res.ok) return;
      const data = (await res.json()) as string[];
      if (Array.isArray(data)) setTags(data);
    } catch {
      /* keep current */
    }
  }, []);

  useEffect(() => {
    // Tags are non-critical for first paint — load after idle.
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    const run = () => void refresh();
    if (typeof requestIdleCallback !== "undefined") {
      idleId = requestIdleCallback(run, { timeout: 4000 });
    } else {
      timeoutId = window.setTimeout(run, 2500);
    }
    return () => {
      if (idleId !== undefined) cancelIdleCallback(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [refresh]);

  return { tags, refresh };
}
