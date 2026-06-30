"use client";

import { useCallback, useMemo, useState } from "react";
import type { SortOption, Video, VideoFilters } from "@/lib/types";
import { getPlatformViewCount, getVideoYear } from "@/lib/video-platforms";

const defaultFilters: VideoFilters = {
  categories: [],
  tags: [],
  years: [],
  sort: "newest",
  search: "",
};

export function useFilters(videos: Video[]) {
  const [filters, setFilters] = useState<VideoFilters>(defaultFilters);

  const toggleCategory = useCallback((category: string) => {
    setFilters((f) => ({
      ...f,
      categories: f.categories.includes(category as VideoFilters["categories"][number])
        ? f.categories.filter((c) => c !== category)
        : [...f.categories, category as VideoFilters["categories"][number]],
    }));
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setFilters((f) => ({
      ...f,
      tags: f.tags.includes(tag)
        ? f.tags.filter((t) => t !== tag)
        : [...f.tags, tag],
    }));
  }, []);

  const toggleYear = useCallback((year: number) => {
    setFilters((f) => ({
      ...f,
      years: f.years.includes(year)
        ? f.years.filter((y) => y !== year)
        : [...f.years, year],
    }));
  }, []);

  const setSort = useCallback((sort: SortOption) => {
    setFilters((f) => ({ ...f, sort }));
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
      result = result.filter((v) => filters.categories.includes(v.category));
    }

    if (filters.tags.length > 0) {
      result = result.filter((v) =>
        filters.tags.some((t) => v.tags.includes(t)),
      );
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

    switch (filters.sort) {
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        break;
      case "views":
        result.sort(
          (a, b) => (getPlatformViewCount(b) ?? 0) - (getPlatformViewCount(a) ?? 0),
        );
        break;
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }

    return result;
  }, [videos, filters]);

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.tags.length > 0 ||
    filters.years.length > 0 ||
    filters.search.trim().length > 0;

  return {
    filters,
    filtered,
    toggleCategory,
    toggleTag,
    toggleYear,
    setSort,
    setSearch,
    clearFilters,
    hasActiveFilters,
  };
}
