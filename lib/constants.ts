import type { Category, SortOption } from "./types";

export const CATEGORIES: Category[] = [
  "vlog",
  "variety",
  "fancam",
  "solo",
  "stage",
  "cover",
  "behind",
  "other",
];

export const SORT_OPTIONS: SortOption[] = [
  "newest",
  "oldest",
  "views",
  "title",
];

export const KNOWN_PLATFORMS = ["youtube", "bilibili", "other"] as const;

export const MAX_TAGS = 6;

export const FAVORITES_KEY = "yeji-verse-favorites";
export const THEME_KEY = "yeji-verse-theme";
export const LOCALE_KEY = "yeji-verse-locale";
