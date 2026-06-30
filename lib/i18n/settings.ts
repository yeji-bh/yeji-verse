export const locales = ["zh-TW", "zh-CN", "en", "ja", "ko"] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = "zh-TW";
export const fallbackLocale: AppLocale = "zh-TW";

export const localeLabels: Record<AppLocale, string> = {
  "zh-TW": "繁體中文",
  "zh-CN": "简体中文",
  en: "English",
  ja: "日本語",
  ko: "한국어",
};

/** 依瀏覽器語系推斷 App 語系 */
export function detectLocaleFromBrowser(): AppLocale {
  if (typeof navigator === "undefined") return defaultLocale;

  const candidates = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const raw of candidates) {
    const tag = raw.toLowerCase().replace(/-/g, "_");

    if (tag.startsWith("en")) return "en";
    if (
      tag.startsWith("zh_tw") ||
      tag.startsWith("zh_hk") ||
      tag.startsWith("zh_hant") ||
      tag.startsWith("zh_mo")
    ) {
      return "zh-TW";
    }
    if (tag.startsWith("zh")) return "zh-CN";
    if (tag.startsWith("ja")) return "ja";
    if (tag.startsWith("ko")) return "ko";
  }

  return defaultLocale;
}
