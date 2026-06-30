export type Category =
  | "vlog"
  | "variety"
  | "fancam"
  | "fansite"
  | "solo"
  | "stage"
  | "cover"
  | "behind"
  | "challenge"
  | "brand"
  | "predebut"
  | "fanmade"
  | "concert"
  | "live"
  | "other";

export type SortBy = "createdAt" | "views" | "title";
export type SortOrder = "asc" | "desc";

export type Platform =
  | "youtube"
  | "bilibili"
  | "twitter"
  | "instagram"
  | "tiktok"
  | "weibo"
  | "other";

export type UserRole = "user" | "admin";

export type VideoStatus = "pending" | "approved" | "rejected";

export interface User {
  id: string;
  username: string;
  displayName: string | null;
  role: UserRole;
  createdAt: string;
}

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
  publishedDate: string;
  year: number;
  thumbnail: string;
  sources: VideoSource[];
  siteViews: number;
  status: VideoStatus;
  submittedBy: string | null;
  createdAt: string;
}

export interface Comment {
  id: string;
  videoId: string;
  nickname: string | null;
  content: string;
  userId: string | null;
  createdAt: string;
}

export interface VideoFilters {
  categories: Category[];
  tags: string[];
  years: number[];
  sortBy: SortBy;
  sortOrder: SortOrder;
  search: string;
}

export interface VideoMetadata {
  title: string | null;
  thumbnail: string | null;
  platform: Platform | string;
  embedUrl: string | null;
  publishedDate: string | null;
}

export interface SubmitVideoPayload {
  title: string;
  category: Category;
  tags: string[];
  publishedDate: string;
  sources: { platform: string; url: string }[];
}

export interface SessionUser {
  id: string;
  username: string;
  displayName: string | null;
  role: UserRole;
}
