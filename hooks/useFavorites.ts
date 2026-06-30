"use client";

import { useCallback, useEffect, useState } from "react";
import { FAVORITES_KEY } from "@/lib/constants";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((ids: string[]) => {
    setFavorites(ids);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  }, []);

  const toggle = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        const next = prev.includes(id)
          ? prev.filter((f) => f !== id)
          : [...prev, id];
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites],
  );

  return { favorites, toggle, isFavorite, hydrated, persist };
}
