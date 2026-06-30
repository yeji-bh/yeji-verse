"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { FAVORITES_KEY } from "@/lib/constants";

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadFromStorage();
    setHydrated(true);
  }, [loadFromStorage]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/favorites")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.ids) {
          setFavorites(data.ids);
          localStorage.setItem(FAVORITES_KEY, JSON.stringify(data.ids));
        }
      })
      .catch(() => {});
  }, [user]);

  const toggle = useCallback(
    async (id: string) => {
      if (user) {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId: id }),
        });
        if (res.ok) {
          const data = await res.json();
          setFavorites(data.ids);
          localStorage.setItem(FAVORITES_KEY, JSON.stringify(data.ids));
        }
        return;
      }

      setFavorites((prev) => {
        const next = prev.includes(id)
          ? prev.filter((f) => f !== id)
          : [...prev, id];
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
        return next;
      });
    },
    [user],
  );

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites],
  );

  return { favorites, toggle, isFavorite, hydrated };
}
