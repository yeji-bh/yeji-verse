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
    void refresh();
  }, [refresh]);

  return { tags, refresh };
}
