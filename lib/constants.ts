import type { Category, SortOption } from "./types";

export const CATEGORIES: Category[] = [
  "vlog",
  "variety",
  "fancam",
  "solo",
  "stage",
  "cover",
  "behind",
];

export const SORT_OPTIONS: SortOption[] = [
  "newest",
  "oldest",
  "views",
  "title",
];

export const KNOWN_PLATFORMS = [
  "youtube",
  "bilibili",
  "twitter",
  "instagram",
  "tiktok",
  "weibo",
] as const;

export const FAVORITES_KEY = "yeji-verse-favorites";
export const THEME_KEY = "yeji-verse-theme";
export const LOCALE_KEY = "yeji-verse-locale";
