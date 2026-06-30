"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  categoryLabel,
  sortLabel,
  t,
  type Locale,
  type TranslationKey,
} from "@/lib/i18n";
import { LOCALE_KEY } from "@/lib/constants";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  categoryLabel: (category: string) => string;
  sortLabel: (sort: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh-TW");

  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_KEY) as Locale | null;
    if (stored) setLocaleState(stored);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(LOCALE_KEY, next);
  }, []);

  const translate = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      t(locale, key, params),
    [locale],
  );

  const getCategoryLabel = useCallback(
    (category: string) => categoryLabel(locale, category),
    [locale],
  );

  const getSortLabel = useCallback(
    (sort: string) => sortLabel(locale, sort),
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: translate,
      categoryLabel: getCategoryLabel,
      sortLabel: getSortLabel,
    }),
    [locale, setLocale, translate, getCategoryLabel, getSortLabel],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
