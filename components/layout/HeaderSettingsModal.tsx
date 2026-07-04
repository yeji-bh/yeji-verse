"use client";

import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal";
import { IconClose } from "@/components/ui/IconButton";
import { useTheme } from "@/components/providers/ThemeProvider";
import { localeLabels, locales, setAppLocale, type AppLocale } from "@/lib/i18n/client";

interface HeaderSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

function SettingsRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="shrink-0 text-sm font-medium text-[var(--color-text)]">
        {label}
      </span>
      <div className="flex min-w-0 justify-end">{children}</div>
    </div>
  );
}

export function HeaderSettingsModal({ open, onClose }: HeaderSettingsModalProps) {
  const { t, i18n } = useTranslation("common");
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      centered
      className="modal-shell--rounded-full flex max-h-[50dvh] w-full max-w-md flex-col"
    >
      <div className="flex flex-col px-6 py-5">
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-[var(--color-borderSubtle)] pb-3">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">
            {t("settings")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--color-textMuted)] hover:bg-[var(--color-bgMuted)] hover:text-[var(--color-text)]"
            aria-label={t("close")}
          >
            <IconClose className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-4">
          <SettingsRow label={t("darkThemeMode")}>
            <button
              type="button"
              role="switch"
              aria-checked={isDark}
              aria-label={isDark ? t("themeLight") : t("themeDark")}
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                isDark ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  isDark ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </SettingsRow>

          <SettingsRow label={t("language")}>
            <select
              value={i18n.language}
              onChange={(e) => setAppLocale(e.target.value as AppLocale)}
              className="select-control h-9 w-36 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
            >
              {locales.map((code) => (
                <option key={code} value={code}>
                  {localeLabels[code]}
                </option>
              ))}
            </select>
          </SettingsRow>
        </div>
      </div>
    </Modal>
  );
}
