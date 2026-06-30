"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/components/providers/AuthProvider";
import { IconClose } from "@/components/ui/IconButton";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

export function AuthModal({ open, onClose, initialMode = "login" }: AuthModalProps) {
  const { t } = useTranslation("common");
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setUsername("");
    setPassword("");
    setError("");
    setMode(initialMode);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const switchMode = (next: "login" | "register") => {
    setError("");
    setMode(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const ok =
      mode === "login"
        ? await login(username, password)
        : await register(username, password);

    setLoading(false);
    if (ok) {
      handleClose();
    } else {
      setError(t("authError"));
    }
  };

  return (
    <Modal open={open} onClose={handleClose} size="md">
      <div className="flex items-center justify-between border-b border-[var(--color-borderSubtle)] px-5 py-4">
        <h2 className="text-base font-semibold">
          {mode === "login" ? t("loginTitle") : t("registerTitle")}
        </h2>
        <button type="button" onClick={handleClose} aria-label={t("close")}>
          <IconClose className="h-5 w-5 text-[var(--color-textMuted)]" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        <div>
          <label className="mb-1 block text-xs text-[var(--color-textSubtle)]">
            {t("username")}
          </label>
          <input
            type="text"
            required
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--color-textSubtle)]">
            {t("password")}
          </label>
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[var(--color-accent)] py-2.5 text-sm font-medium text-[var(--color-accentText)] disabled:opacity-50"
        >
          {mode === "login" ? t("login") : t("register")}
        </button>

        <p className="text-center text-xs text-[var(--color-textMuted)]">
          {mode === "login" ? (
            <>
              {t("noAccount")}{" "}
              <button
                type="button"
                onClick={() => switchMode("register")}
                className="text-[var(--color-accent)] hover:underline"
              >
                {t("goRegister")}
              </button>
            </>
          ) : (
            <>
              {t("hasAccount")}{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="text-[var(--color-accent)] hover:underline"
              >
                {t("goLogin")}
              </button>
            </>
          )}
        </p>
      </form>
    </Modal>
  );
}
