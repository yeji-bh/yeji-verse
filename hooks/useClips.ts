"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { CLIPS_KEY } from "@/lib/constants";
import { createId } from "@/lib/id";
import type { ClipBookmark } from "@/lib/types";
import { useTranslation } from "react-i18next";

function readLocalClips(): ClipBookmark[] {
  try {
    const stored = localStorage.getItem(CLIPS_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as ClipBookmark[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalClips(clips: ClipBookmark[]) {
  localStorage.setItem(CLIPS_KEY, JSON.stringify(clips));
}

export function useClips() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation("common");
  const [clips, setClips] = useState<ClipBookmark[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setClips(readLocalClips());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch("/api/clips")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.clips) {
          setClips(data.clips);
          writeLocalClips(data.clips);
        }
      })
      .catch(() => {});
  }, [user]);

  const addClip = useCallback(
    async (videoId: string, startSeconds: number, note = "") => {
      const start = Math.max(0, Math.floor(startSeconds));
      const existing = clips.find(
        (c) => c.videoId === videoId && c.startSeconds === start,
      );
      if (existing) {
        showToast(t("clipAlreadyExists"), "error");
        return existing;
      }

      const clip: ClipBookmark = {
        id: createId(),
        videoId,
        startSeconds: start,
        note: note.trim().slice(0, 200),
        createdAt: new Date().toISOString(),
      };

      if (user) {
        const res = await fetch("/api/clips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clip),
        });
        if (res.ok) {
          const data = await res.json();
          setClips(data.clips);
          writeLocalClips(data.clips);
          showToast(t("clipAdded"), "success");
          return data.clip as ClipBookmark;
        }
        showToast(t("saveError"), "error");
        return null;
      }

      setClips((prev) => {
        const next = [clip, ...prev];
        writeLocalClips(next);
        return next;
      });
      showToast(t("clipAdded"), "success");
      return clip;
    },
    [clips, user, showToast, t],
  );

  const removeClip = useCallback(
    async (id: string) => {
      if (user) {
        const res = await fetch("/api/clips", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (res.ok) {
          const data = await res.json();
          setClips(data.clips);
          writeLocalClips(data.clips);
          showToast(t("clipRemoved"), "error");
        }
        return;
      }

      setClips((prev) => {
        const next = prev.filter((c) => c.id !== id);
        writeLocalClips(next);
        return next;
      });
      showToast(t("clipRemoved"), "error");
    },
    [user, showToast, t],
  );

  return { clips, hydrated, addClip, removeClip };
}
