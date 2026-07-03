"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/components/providers/ThemeProvider";
import { localeLabels, locales, setAppLocale, type AppLocale } from "@/lib/i18n/client";
import { HeaderSettingsModal } from "@/components/layout/HeaderSettingsModal";
import {
  IconClose,
  IconDice,
  IconFilter,
  IconGlobe,
  IconMoon,
  IconPlus,
  IconSearch,
  IconSettings,
  IconSun,
} from "@/components/ui/IconButton";
import { PlainIconButton } from "@/components/ui/PlainIconButton";

interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSubmitClick: () => void;
  onRandomClick?: () => void;
  randomLoading?: boolean;
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
  inputClassName = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onFocus?: () => void;
  onBlur?: () => void;
  inputClassName?: string;
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
        className={`w-full border border-[var(--color-border)] bg-[var(--color-input)] h-9 py-0 pl-9 text-sm outline-none focus:border-[var(--color-accent)] ${
          value ? "pr-9" : "pr-3"
        } ${inputClassName}`}
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
  onRandomClick,
  randomLoading = false,
  onFilterClick,
  showFilterButton = false,
}: HeaderProps) {
  const { t, i18n } = useTranslation("common");
  const { theme, toggleTheme } = useTheme();
  const [langOpen, setLangOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileSearchFocused, setMobileSearchFocused] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const randomButton = onRandomClick ? (
    <button
      type="button"
      onClick={onRandomClick}
      disabled={randomLoading}
      aria-label={t("randomVideo")}
      className="header-toolbar-btn header-toolbar-btn--pink"
    >
      <IconDice className={`h-4 w-4 text-white ${randomLoading ? "animate-pulse" : ""}`} />
    </button>
  ) : null;

  const langThemeControls = (
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <button
          type="button"
          onClick={() => setLangOpen((o) => !o)}
          aria-label={t("language")}
          className="header-toolbar-btn"
        >
          <IconGlobe className="h-4 w-4" />
        </button>
        {langOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40"
              onClick={() => setLangOpen(false)}
              aria-hidden
            />
            <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] border border-[var(--color-border)] bg-[var(--color-bgElevated)] py-1 shadow-[var(--color-shadow)]">
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
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? t("themeLight") : t("themeDark")}
        className="header-toolbar-btn"
      >
        {theme === "dark" ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
      </button>
    </div>
  );

  const handleMobileSearchFocus = () => {
    setMobileSearchFocused(true);
    window.setTimeout(() => {
      mobileSearchRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 300);
  };

  return (
    <>
    <header className="sticky top-0 z-30 border-b border-[var(--color-borderSubtle)] bg-[var(--color-bg)]/90 backdrop-blur-xl">
      {/* Mobile */}
      <div className="scroll-mt-4 py-3 pr-3 pl-3.5 lg:hidden">
        {!mobileSearchFocused && (
          <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center">
            <div className="flex justify-start">
              {showFilterButton ? (
                <PlainIconButton label={t("filters")} onClick={onFilterClick}>
                  <IconFilter className="h-5 w-5" />
                </PlainIconButton>
              ) : (
                <div className="h-9 w-9" />
              )}
            </div>
            <h1 className="pointer-events-none px-2 text-center text-lg font-bold whitespace-nowrap">
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--color-gradient)" }}
              >
                {t("siteName")}
              </span>
            </h1>
            <div className="flex justify-end">
              <PlainIconButton
                label={t("settings")}
                onClick={() => setSettingsOpen(true)}
              >
                <IconSettings className="h-5 w-5" />
              </PlainIconButton>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <SearchField
            inputRef={mobileSearchRef}
            value={search}
            onChange={onSearchChange}
            placeholder={t("search")}
            className="min-w-0 flex-1"
            inputClassName="!pl-10"
            onFocus={handleMobileSearchFocus}
            onBlur={() => setMobileSearchFocused(false)}
          />
          {!mobileSearchFocused && (
            <>
              {onRandomClick ? (
                <button
                  type="button"
                  onClick={onRandomClick}
                  disabled={randomLoading}
                  aria-label={t("randomVideo")}
                  className="header-toolbar-btn header-toolbar-btn--pink"
                >
                  <IconDice className={`h-4 w-4 text-white ${randomLoading ? "animate-pulse" : ""}`} />
                </button>
              ) : null}
              <button
                type="button"
                onClick={onSubmitClick}
                className="header-submit-btn !h-9 !w-9 shrink-0 !px-0 justify-center"
                aria-label={t("submitVideo")}
              >
                <IconPlus className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden items-center gap-2 px-6 py-3 lg:flex">
        <p className="soft-muted-text min-w-0 flex-1 text-xs leading-relaxed">
          *{t("thumbnailDisclaimer")}
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          {randomButton}
          <SearchField
            value={search}
            onChange={onSearchChange}
            placeholder={t("search")}
            className="w-72"
          />
          {langThemeControls}
        </div>
        <button type="button" onClick={onSubmitClick} className="header-submit-btn shrink-0">
          <IconPlus className="h-4 w-4" />
          {t("submitVideo")}
        </button>
      </div>
    </header>

    <HeaderSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
