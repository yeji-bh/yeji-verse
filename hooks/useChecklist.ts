"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { CHECKLIST_KEY } from "@/lib/constants";

export function useChecklist() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation("common");
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [showUnwatchedOnly, setShowUnwatchedOnly] = useState(false);

  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(CHECKLIST_KEY);
      if (stored) setCheckedIds(JSON.parse(stored));
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
    fetch("/api/checklist")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.ids) {
          setCheckedIds(data.ids);
          localStorage.setItem(CHECKLIST_KEY, JSON.stringify(data.ids));
        }
      })
      .catch(() => {});
  }, [user]);

  const toggleChecked = useCallback(
    async (id: string) => {
      const removing = checkedIds.includes(id);

      if (user) {
        const res = await fetch("/api/checklist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId: id }),
        });
        if (res.ok) {
          const data = await res.json();
          setCheckedIds(data.ids);
          localStorage.setItem(CHECKLIST_KEY, JSON.stringify(data.ids));
          showToast(
            t(removing ? "checklistRemoved" : "checklistAdded"),
            removing ? "error" : "success",
          );
        }
        return;
      }

      setCheckedIds((prev) => {
        const next = prev.includes(id)
          ? prev.filter((v) => v !== id)
          : [...prev, id];
        localStorage.setItem(CHECKLIST_KEY, JSON.stringify(next));
        return next;
      });
      showToast(
        t(removing ? "checklistRemoved" : "checklistAdded"),
        removing ? "error" : "success",
      );
    },
    [user, checkedIds, showToast, t],
  );

  const isChecked = useCallback((id: string) => checkedIds.includes(id), [checkedIds]);

  return {
    checkedIds,
    hydrated,
    isChecked,
    toggleChecked,
    showUnwatchedOnly,
    setShowUnwatchedOnly,
  };
}
