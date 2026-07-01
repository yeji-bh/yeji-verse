"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
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

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: defaultLocale,
    fallbackLng: fallbackLocale,
    defaultNS: "common",
    ns: ["common"],
    interpolation: { escapeValue: false },
    initImmediate: false,
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

export function sortByLabelKey(sortBy: string): string {
  const map: Record<string, string> = {
    createdAt: "sortByCreatedAt",
    views: "sortByViews",
    title: "sortByTitle",
  };
  return map[sortBy] ?? "sortByCreatedAt";
}

export { i18n, LOCALE_KEY, defaultLocale, locales, localeLabels, detectLocaleFromBrowser };
export type { AppLocale };
