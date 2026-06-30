export function tagKey(tag: string): string {
  return tag.trim().toLowerCase();
}

export function tagsMatch(a: string, b: string): boolean {
  return tagKey(a) === tagKey(b);
}

export function hasTag(tags: string[], tag: string): boolean {
  return tags.some((t) => tagsMatch(t, tag));
}

export function dedupeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const trimmed = tag.trim();
    if (!trimmed) continue;
    const key = tagKey(trimmed);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

export function addTag(tags: string[], raw: string): string[] {
  const tag = raw.trim();
  if (!tag || hasTag(tags, tag)) return tags;
  return [...tags, tag];
}

export function removeTag(tags: string[], tag: string): string[] {
  return tags.filter((t) => !tagsMatch(t, tag));
}

export function videoHasAnyTag(
  videoTags: string[],
  filterTags: string[],
): boolean {
  return filterTags.some((ft) => videoTags.some((vt) => tagsMatch(vt, ft)));
}

export function collectUniqueTags(videos: { tags: string[] }[]): string[] {
  const map = new Map<string, string>();

  for (const video of videos) {
    for (const tag of video.tags) {
      const trimmed = tag.trim();
      if (!trimmed) continue;
      const key = tagKey(trimmed);
      if (!map.has(key)) map.set(key, trimmed);
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}

/** 依影片使用次數排序，回傳熱門標籤（不分大小寫合併） */
export function collectPopularTags(
  videos: { tags: string[] }[],
  limit = 50,
): string[] {
  const counts = new Map<string, { label: string; count: number }>();

  for (const video of videos) {
    const seenInVideo = new Set<string>();
    for (const tag of video.tags) {
      const trimmed = tag.trim();
      if (!trimmed) continue;
      const key = tagKey(trimmed);
      if (seenInVideo.has(key)) continue;
      seenInVideo.add(key);

      const existing = counts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(key, { label: trimmed, count: 1 });
      }
    }
  }

  return Array.from(counts.values())
    .sort(
      (a, b) =>
        b.count - a.count ||
        a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
    )
    .slice(0, limit)
    .map((item) => item.label);
}
