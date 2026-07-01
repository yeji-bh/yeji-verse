"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/components/providers/ThemeProvider";
import { localeLabels, locales, setAppLocale, type AppLocale } from "@/lib/i18n/client";
import {
  IconClose,
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

function SearchField({
  value,
  onChange,
  placeholder,
  className = "",
  inputRef,
  onFocus,
  onBlur,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  const { t } = useTranslation("common");

  return (
    <div className={`relative ${className}`}>
      <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-textSubtle)]" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] py-2 pl-9 text-sm outline-none focus:border-[var(--color-accent)] ${
          value ? "pr-9" : "pr-3"
        }`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[var(--color-textMuted)] hover:bg-[var(--color-bgMuted)] hover:text-[var(--color-text)]"
          aria-label={t("clearSearch")}
        >
          <IconClose className="h-4 w-4" />
        </button>
      )}
    </div>
  );
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
  const [mobileSearchFocused, setMobileSearchFocused] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const langThemeControls = (
    <div className="flex items-center -space-x-1">
      <div className="relative">
        <PlainIconButton
          label={t("language")}
          onClick={() => setLangOpen((o) => !o)}
          className="h-8 w-8"
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
        className="h-8 w-8"
      >
        {theme === "dark" ? <IconSun className="h-5 w-5" /> : <IconMoon className="h-5 w-5" />}
      </PlainIconButton>
    </div>
  );

  const handleMobileSearchFocus = () => {
    setMobileSearchFocused(true);
    window.setTimeout(() => {
      mobileSearchRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 300);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-borderSubtle)] bg-[var(--color-bg)]/90 backdrop-blur-xl">
      {/* Mobile */}
      <div className="scroll-mt-4 px-3 py-3 lg:hidden">
        {!mobileSearchFocused && (
          <div className="relative mb-3 flex min-h-8 items-center">
            <div className="z-10 flex shrink-0 items-center">
              {showFilterButton ? (
                <PlainIconButton
                  label={t("filters")}
                  onClick={onFilterClick}
                  className="h-8 w-8"
                >
                  <IconFilter className="h-5 w-5" />
                </PlainIconButton>
              ) : (
                <div className="h-8 w-8" />
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
        )}
        <div className="flex items-center gap-2">
          <SearchField
            inputRef={mobileSearchRef}
            value={search}
            onChange={onSearchChange}
            placeholder={t("search")}
            className="min-w-0 flex-1"
            onFocus={handleMobileSearchFocus}
            onBlur={() => setMobileSearchFocused(false)}
          />
          {!mobileSearchFocused && (
            <button
              type="button"
              onClick={onSubmitClick}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-[var(--color-accentText)]"
              aria-label={t("submitVideo")}
            >
              <IconPlus className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex items-center gap-3 px-6 py-3">
        <p className="min-w-0 flex-1 text-xs text-[var(--color-textSubtle)] leading-relaxed">
          *{t("thumbnailDisclaimer")}
        </p>
        <SearchField
          value={search}
          onChange={onSearchChange}
          placeholder={t("search")}
          className="w-72 shrink-0"
        />
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
