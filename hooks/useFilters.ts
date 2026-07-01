"use client";

import { useCallback, useMemo, useState } from "react";
import type { SortBy, SortOrder, Video, VideoFilters } from "@/lib/types";
import { hasTag, removeTag, videoHasAnyTag } from "@/lib/tags";
import { normalizeCategory } from "@/lib/constants";
import { getPlatformViewCount, getVideoYear } from "@/lib/video-platforms";

const defaultFilters: VideoFilters = {
  categories: [],
  tags: [],
  years: [],
  sortBy: "createdAt",
  sortOrder: "desc",
  search: "",
};

function compareVideos(
  a: Video,
  b: Video,
  sortBy: SortBy,
  sortOrder: SortOrder,
): number {
  let cmp = 0;

  switch (sortBy) {
    case "views":
      cmp = (getPlatformViewCount(a) ?? 0) - (getPlatformViewCount(b) ?? 0);
      break;
    case "title":
      cmp = a.title.localeCompare(b.title);
      break;
    default:
      cmp =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  }

  return sortOrder === "asc" ? cmp : -cmp;
}

export function useFilters(videos: Video[], options?: { preserveOrder?: boolean }) {
  const preserveOrder = options?.preserveOrder ?? false;
  const [filters, setFilters] = useState<VideoFilters>(defaultFilters);

  const toggleCategory = useCallback((category: string) => {
    setFilters((f) => ({
      ...f,
      categories: f.categories.includes(category as VideoFilters["categories"][number])
        ? f.categories.filter((c) => c !== category)
        : [...f.categories, category as VideoFilters["categories"][number]],
    }));
  }, []);

  const clearCategories = useCallback(() => {
    setFilters((f) => ({ ...f, categories: [] }));
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setFilters((f) => ({
      ...f,
      tags: hasTag(f.tags, tag)
        ? removeTag(f.tags, tag)
        : [...f.tags, tag],
    }));
  }, []);

  const clearTags = useCallback(() => {
    setFilters((f) => ({ ...f, tags: [] }));
  }, []);

  const toggleYear = useCallback((year: number) => {
    setFilters((f) => ({
      ...f,
      years: f.years.includes(year)
        ? f.years.filter((y) => y !== year)
        : [...f.years, year],
    }));
  }, []);

  const clearYears = useCallback(() => {
    setFilters((f) => ({ ...f, years: [] }));
  }, []);

  const setSortBy = useCallback((sortBy: SortBy) => {
    setFilters((f) => ({ ...f, sortBy }));
  }, []);

  const setSortOrder = useCallback((sortOrder: SortOrder) => {
    setFilters((f) => ({ ...f, sortOrder }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilters((f) => ({ ...f, search }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const filtered = useMemo(() => {
    let result = [...videos];

    if (filters.categories.length > 0) {
      result = result.filter((v) =>
        filters.categories.includes(normalizeCategory(v.category)),
      );
    }

    if (filters.tags.length > 0) {
      result = result.filter((v) => videoHasAnyTag(v.tags, filters.tags));
    }

    if (filters.years.length > 0) {
      result = result.filter((v) => filters.years.includes(getVideoYear(v)));
    }

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.tags.some((t) => t.toLowerCase().includes(q)) ||
          v.description.toLowerCase().includes(q),
      );
    }

    if (!preserveOrder) {
      result.sort((a, b) =>
        compareVideos(a, b, filters.sortBy, filters.sortOrder),
      );
    }

    return result;
  }, [videos, filters, preserveOrder]);

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.tags.length > 0 ||
    filters.years.length > 0 ||
    filters.search.trim().length > 0;

  return {
    filters,
    filtered,
    toggleCategory,
    clearCategories,
    toggleTag,
    clearTags,
    toggleYear,
    clearYears,
    setSortBy,
    setSortOrder,
    setSearch,
    clearFilters,
    hasActiveFilters,
  };
}
