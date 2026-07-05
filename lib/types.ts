export type Category =
  | "vlog"
  | "variety"
  | "mv"
  | "practiceRoom"
  | "fancam"
  | "stage"
  | "cover"
  | "behind"
  | "challenge"
  | "brand"
  | "interview"
  | "fansign"
  | "predebut"
  | "fanmade"
  | "concert"
  | "live"
  | "preview"
  | "stats"
  | "skill"
  | "clarification"
  | "radio"
  | "audioSource"
  | "other";

/** Sub-filters under variety / cover. */
export type Subcategory =
  | "varietySolo"
  | "varietyMulti"
  | "coverDance"
  | "coverVocal"
  | "coverSingDance";

export type SortBy = "createdAt" | "publishedDate" | "title";
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
  subcategory: Subcategory | null;
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

export interface VideoFilters {
  categories: Category[];
  subcategories: Subcategory[];
  tags: string[];
  years: number[];
  sortBy: SortBy;
  sortOrder: SortOrder;
  search: string;
}

export interface VideoMetadata {
  title: string | null;
  description: string | null;
  thumbnail: string | null;
  platform: Platform | string;
  embedUrl: string | null;
  publishedDate: string | null;
}

export interface SubmitVideoPayload {
  title: string;
  description?: string;
  category: Category;
  subcategory?: Subcategory | null;
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

/** Timestamp bookmark within a video (clip favorite MVP). */
export interface ClipBookmark {
  id: string;
  videoId: string;
  startSeconds: number;
  note: string;
  createdAt: string;
}
