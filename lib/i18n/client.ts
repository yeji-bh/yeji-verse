"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import {
  defaultLocale,
  detectLocaleFromBrowser,
  fallbackLocale,
  locales,
  localeLabels,
  type AppLocale,
} from "./settings";
import zhTW from "./locales/zh-TW.json";
import zhCN from "./locales/zh-CN.json";
import en from "./locales/en.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";

const LOCALE_KEY = "yeji-verse-locale";

const resources = {
  "zh-TW": { common: zhTW },
  "zh-CN": { common: zhCN },
  en: { common: en },
  ja: { common: ja },
  ko: { common: ko },
};

const customDetector = {
  name: "yejiBrowser",
  lookup() {
    if (typeof window === "undefined") return defaultLocale;
    const stored = localStorage.getItem(LOCALE_KEY) as AppLocale | null;
    if (stored && locales.includes(stored)) return stored;
    return detectLocaleFromBrowser();
  },
  cacheUserLanguage(lng: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCALE_KEY, lng);
    }
  },
};

const detector = new LanguageDetector();
detector.addDetector(customDetector);

if (!i18n.isInitialized) {
  i18n
    .use(detector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: fallbackLocale,
      defaultNS: "common",
      ns: ["common"],
      interpolation: { escapeValue: false },
      detection: {
        order: ["yejiBrowser"],
        caches: ["yejiBrowser"],
      },
      react: { useSuspense: false },
    });
}

export function setAppLocale(locale: AppLocale) {
  localStorage.setItem(LOCALE_KEY, locale);
  void i18n.changeLanguage(locale);
  document.documentElement.lang = locale;
}

export function categoryLabelKey(category: string): string {
  return category;
}

export function sortLabelKey(sort: string): string {
  const map: Record<string, string> = {
    newest: "sortNewest",
    oldest: "sortOldest",
    views: "sortViews",
    title: "sortTitle",
  };
  return map[sort] ?? "sortNewest";
}

export { i18n, LOCALE_KEY, defaultLocale, locales, localeLabels };
export type { AppLocale };
