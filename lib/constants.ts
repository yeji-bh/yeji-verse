import type { Category, SortBy } from "./types";

export const CATEGORIES: Category[] = [
  "vlog",
  "variety",
  "fancam",
  "fansite",
  "solo",
  "stage",
  "cover",
  "behind",
  "challenge",
  "brand",
  "predebut",
  "fanmade",
  "concert",
  "live",
  "other",
];

export const SORT_BY_OPTIONS: SortBy[] = ["createdAt", "views", "title"];

export const KNOWN_PLATFORMS = ["youtube", "bilibili", "other"] as const;

export const MAX_TAGS = 6;
export const SIDEBAR_TAG_LIMIT = 50;

export const FAVORITES_KEY = "yeji-verse-favorites";
export const THEME_KEY = "yeji-verse-theme";
export const LOCALE_KEY = "yeji-verse-locale";
