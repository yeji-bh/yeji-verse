import { collectPopularTags } from "@/lib/tags";
import { SIDEBAR_TAG_LIMIT } from "@/lib/constants";
import type { Video } from "@/lib/types";

export function getAllTags(videos: Video[]): string[] {
  return collectPopularTags(videos, SIDEBAR_TAG_LIMIT);
}
