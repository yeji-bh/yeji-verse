"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { SessionUser } from "@/lib/types";
import { CHECKLIST_KEY, CLIPS_KEY, FAVORITES_KEY } from "@/lib/constants";

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function syncFavoritesOnLogin() {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    const ids: string[] = stored ? JSON.parse(stored) : [];
    if (ids.length === 0) return;

    const res = await fetch("/api/favorites/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(data.ids));
    }
  } catch {
    /* ignore */
  }
}

async function syncChecklistOnLogin() {
  try {
    const stored = localStorage.getItem(CHECKLIST_KEY);
    const ids: string[] = stored ? JSON.parse(stored) : [];
    if (ids.length === 0) return;

    const res = await fetch("/api/checklist/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(CHECKLIST_KEY, JSON.stringify(data.ids));
    }
  } catch {
    /* ignore */
  }
}

async function syncClipsOnLogin() {
  try {
    const stored = localStorage.getItem(CLIPS_KEY);
    const clips = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(clips) || clips.length === 0) return;

    const res = await fetch("/api/clips/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clips }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(CLIPS_KEY, JSON.stringify(data.clips));
    }
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setUser(data.user);
    await syncFavoritesOnLogin();
    await syncChecklistOnLogin();
    await syncClipsOnLogin();
    return true;
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setUser(data.user);
    await syncFavoritesOnLogin();
    await syncChecklistOnLogin();
    await syncClipsOnLogin();
    return true;
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
