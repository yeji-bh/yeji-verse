"use client";

import { useState } from "react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { LOCALES } from "@/lib/i18n";
import {
  IconFilter,
  IconGlobe,
  IconMoon,
  IconPlus,
  IconSearch,
  IconSun,
} from "@/components/ui/IconButton";
import { IconButton } from "@/components/ui/IconButton";

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
  const { t, locale, setLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const [langOpen, setLangOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 sm:gap-3 border-b border-[var(--color-borderSubtle)] bg-[var(--color-bg)]/80 backdrop-blur-xl px-4 py-3 sm:px-6">
      {showFilterButton && (
        <button
          type="button"
          onClick={onFilterClick}
          className="lg:hidden inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bgMuted)] text-[var(--color-textMuted)]"
          aria-label={t("filters")}
        >
          <IconFilter />
        </button>
      )}

      <div className="relative flex-1 max-w-xl">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSubtle)]" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("search")}
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] py-2 pl-9 pr-4 text-sm text-[var(--color-text)] placeholder:text-[var(--color-textSubtle)] outline-none focus:border-[var(--color-accent)] transition-colors"
        />
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div className="relative">
          <IconButton
            label={t("language")}
            onClick={() => setLangOpen((o) => !o)}
          >
            <IconGlobe />
          </IconButton>
          {langOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40"
                onClick={() => setLangOpen(false)}
                aria-hidden
              />
              <div className="absolute right-0 top-full z-50 mt-1.5 min-w-[140px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bgElevated)] py-1 shadow-[var(--color-shadow)]">
                {LOCALES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLocale(l.code);
                      setLangOpen(false);
                    }}
                    className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                      locale === l.code
                        ? "text-[var(--color-accent)] bg-[var(--color-accentMuted)]"
                        : "text-[var(--color-textMuted)] hover:bg-[var(--color-bgMuted)]"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <IconButton
          label={theme === "dark" ? t("themeLight") : t("themeDark")}
          onClick={toggleTheme}
        >
          {theme === "dark" ? <IconSun /> : <IconMoon />}
        </IconButton>

        <button
          type="button"
          onClick={onSubmitClick}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-[var(--color-accentText)] transition-colors hover:bg-[var(--color-accentHover)]"
        >
          <IconPlus className="h-4 w-4" />
          <span className="hidden sm:inline">{t("submit")}</span>
        </button>
      </div>
    </header>
  );
}
