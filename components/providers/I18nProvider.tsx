"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import {
  detectLocaleFromBrowser,
  i18n,
  LOCALE_KEY,
  locales,
  type AppLocale,
} from "@/lib/i18n/client";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_KEY) as AppLocale | null;
    const lng =
      stored && locales.includes(stored) ? stored : detectLocaleFromBrowser();
    if (i18n.resolvedLanguage !== lng) {
      void i18n.changeLanguage(lng);
    }
    document.documentElement.lang = lng;
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
