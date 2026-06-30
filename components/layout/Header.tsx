"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/components/providers/ThemeProvider";
import { localeLabels, locales, setAppLocale, type AppLocale } from "@/lib/i18n/client";
import {
  IconFilter,
  IconGlobe,
  IconMoon,
  IconPlus,
  IconSearch,
  IconSun,
} from "@/components/ui/IconButton";
import { PlainIconButton } from "@/components/ui/PlainIconButton";

interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSubmitClick: () => void;
  onFilterClick?: () => void;
  showFilterButton?: boolean;
}

export function Header({
  search,
  onSearchChange,
  onSubmitClick,
  onFilterClick,
  showFilterButton = false,
}: HeaderProps) {
  const { t, i18n } = useTranslation("common");
  const { theme, toggleTheme } = useTheme();
  const [langOpen, setLangOpen] = useState(false);

  const langThemeControls = (
    <div className="flex items-center gap-0">
      <div className="relative">
        <PlainIconButton
          label={t("language")}
          onClick={() => setLangOpen((o) => !o)}
          className="h-9 w-9"
        >
          <IconGlobe className="h-5 w-5" />
        </PlainIconButton>
        {langOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40"
              onClick={() => setLangOpen(false)}
              aria-hidden
            />
            <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bgElevated)] py-1 shadow-[var(--color-shadow)]">
              {locales.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setAppLocale(code as AppLocale);
                    setLangOpen(false);
                  }}
                  className={`block w-full px-3 py-2 text-left text-sm ${
                    i18n.language === code
                      ? "text-[var(--color-accent)] bg-[var(--color-accentMuted)]"
                      : "text-[var(--color-textMuted)] hover:bg-[var(--color-bgMuted)]"
                  }`}
                >
                  {localeLabels[code]}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <PlainIconButton
        label={theme === "dark" ? t("themeLight") : t("themeDark")}
        onClick={toggleTheme}
        className="h-9 w-9"
      >
        {theme === "dark" ? <IconSun className="h-5 w-5" /> : <IconMoon className="h-5 w-5" />}
      </PlainIconButton>
    </div>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-borderSubtle)] bg-[var(--color-bg)]/90 backdrop-blur-xl">
      {/* Mobile */}
      <div className="lg:hidden px-4 py-3 space-y-3">
        <div className="relative flex min-h-9 items-center">
          <div className="z-10 flex shrink-0 items-center">
            {showFilterButton ? (
              <PlainIconButton
                label={t("filters")}
                onClick={onFilterClick}
                className="h-9 w-9"
              >
                <IconFilter className="h-5 w-5" />
              </PlainIconButton>
            ) : (
              <div className="h-9 w-9" />
            )}
          </div>
          <h1 className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-base font-bold">
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--color-gradient)" }}
            >
              {t("siteName")}
            </span>
          </h1>
          <div className="z-10 ml-auto flex shrink-0 items-center">
            {langThemeControls}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-textSubtle)]" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("search")}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <button
            type="button"
            onClick={onSubmitClick}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-[var(--color-accentText)]"
            aria-label={t("submitVideo")}
          >
            <IconPlus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex items-center gap-3 px-6 py-3">
        <p className="min-w-0 flex-1 text-xs text-[var(--color-textSubtle)] leading-relaxed">
          *{t("thumbnailDisclaimer")}
        </p>
        <div className="relative w-72 shrink-0">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-textSubtle)]" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("search")}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] py-2 pl-9 pr-4 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        {langThemeControls}
        <button
          type="button"
          onClick={onSubmitClick}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accentText)]"
        >
          <IconPlus className="h-4 w-4" />
          {t("submitVideo")}
        </button>
      </div>
    </header>
  );
}
