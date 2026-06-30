export type Category =
  | "vlog"
  | "variety"
  | "fancam"
  | "solo"
  | "stage"
  | "cover"
  | "behind";

export type SortOption = "newest" | "oldest" | "views" | "title";

export type Platform =
  | "youtube"
  | "bilibili"
  | "twitter"
  | "instagram"
  | "tiktok"
  | "weibo"
  | "other";

export interface VideoSource {
  id: string;
  platform: Platform | string;
  url: string;
  viewCount: number | null;
  viewCountUpdatedAt: string | null;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  category: Category;
  tags: string[];
  year: number;
  thumbnail: string;
  sources: VideoSource[];
  siteViews: number;
  createdAt: string;
}

export interface VideoFilters {
  categories: Category[];
  tags: string[];
  years: number[];
  sort: SortOption;
  search: string;
}

export interface VideoMetadata {
  title: string | null;
  thumbnail: string | null;
  platform: Platform | string;
  embedUrl: string | null;
}

export interface SubmitVideoPayload {
  title: string;
  description: string;
  category: Category;
  tags: string[];
  year: number;
  sources: { platform: string; url: string }[];
}
