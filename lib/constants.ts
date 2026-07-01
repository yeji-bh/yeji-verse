import type { Category, SortBy } from "./types";

export const CATEGORIES: Category[] = [
  "vlog",
  "variety",
  "fancam",
  "solo",
  "stage",
  "cover",
  "behind",
  "challenge",
  "brand",
  "fansign",
  "predebut",
  "fanmade",
  "concert",
  "live",
  "other",
];

export const SORT_BY_OPTIONS: SortBy[] = ["createdAt", "views", "title"];

export const KNOWN_PLATFORMS = ["youtube", "bilibili", "other"] as const;

export const MAX_TAGS = 6;
export const MAX_VIDEO_SOURCES = 3;
export const SIDEBAR_TAG_LIMIT = 19;

export const FAVORITES_KEY = "yeji-verse-favorites";
export const THEME_KEY = "yeji-verse-theme";
export const LOCALE_KEY = "yeji-verse-locale";

/** @deprecated fansite merged into fancam */
const LEGACY_CATEGORY_ALIASES: Record<string, Category> = {
  fansite: "fancam",
};

export function normalizeCategory(category: string): Category {
  return LEGACY_CATEGORY_ALIASES[category] ?? (category as Category);
}
