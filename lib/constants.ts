import type { Category, SortBy } from "./types";

export const CATEGORIES: Category[] = [
  "vlog",
  "variety",
  "mv",
  "practiceRoom",
  "fancam",
  "solo",
  "stage",
  "cover",
  "behind",
  "challenge",
  "brand",
  "interview",
  "fansign",
  "predebut",
  "fanmade",
  "concert",
  "live",
  "preview",
  "stats",
  "skill",
  "clarification",
  "radio",
  "audioSource",
  "other",
];

export const SORT_BY_OPTIONS: SortBy[] = ["createdAt", "title"];

export const KNOWN_PLATFORMS = ["youtube", "bilibili", "other"] as const;

export const MAX_TAGS = 6;
export const MAX_VIDEO_SOURCES = 3;
export const SIDEBAR_TAG_LIMIT = 19;

export const FAVORITES_KEY = "yeji-verse-favorites";
export const CHECKLIST_KEY = "yeji-verse-checklist";
export const THEME_KEY = "yeji-verse-theme";
export const LOCALE_KEY = "yeji-verse-locale";

/** @deprecated merged categories */
const LEGACY_CATEGORY_ALIASES: Record<string, Category> = {
  fansite: "fancam",
  officialVariety: "variety",
};

export function normalizeCategory(category: string): Category {
  return LEGACY_CATEGORY_ALIASES[category] ?? (category as Category);
}
