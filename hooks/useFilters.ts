"use client";

import { useCallback, useMemo, useState } from "react";
import type { SortBy, SortOrder, Subcategory, Video, VideoFilters } from "@/lib/types";
import { hasTag, videoHasAnyTag } from "@/lib/tags";
import {
  CATEGORY_SUBCATEGORIES,
  getSubcategoriesForCategory,
  normalizeCategory,
} from "@/lib/constants";
import { getVideoYear } from "@/lib/video-platforms";

const defaultFilters: VideoFilters = {
  categories: [],
  subcategories: [],
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
    case "title":
      cmp = a.title.localeCompare(b.title);
      break;
    case "publishedDate":
      cmp = a.publishedDate.localeCompare(b.publishedDate);
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
    setFilters((f) => {
      const cat = category as VideoFilters["categories"][number];
      const nextCategories = f.categories.includes(cat) ? [] : [cat];
      const allowed = new Set(
        nextCategories.flatMap((c) => getSubcategoriesForCategory(c)),
      );
      return {
        ...f,
        categories: nextCategories,
        subcategories: f.subcategories.filter((s) => allowed.has(s)),
      };
    });
  }, []);

  const clearCategories = useCallback(() => {
    setFilters((f) => ({ ...f, categories: [], subcategories: [] }));
  }, []);

  const toggleSubcategory = useCallback((subcategory: string) => {
    setFilters((f) => {
      const sub = subcategory as Subcategory;
      return {
        ...f,
        subcategories: f.subcategories.includes(sub)
          ? []
          : [sub],
      };
    });
  }, []);

  const clearSubcategories = useCallback(() => {
    setFilters((f) => ({ ...f, subcategories: [] }));
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setFilters((f) => ({
      ...f,
      tags: hasTag(f.tags, tag) ? [] : [tag],
    }));
  }, []);

  const clearTags = useCallback(() => {
    setFilters((f) => ({ ...f, tags: [] }));
  }, []);

  const toggleYear = useCallback((year: number) => {
    setFilters((f) => ({
      ...f,
      years: f.years.includes(year) ? [] : [year],
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
    setFilters((f) => ({
      ...f,
      categories: [],
      subcategories: [],
      tags: [],
      years: [],
      search: "",
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const activeSubcategoryOptions = useMemo(() => {
    if (filters.categories.length === 0) return [];
    return filters.categories.flatMap(
      (c) => CATEGORY_SUBCATEGORIES[c] ?? [],
    );
  }, [filters.categories]);

  const filtered = useMemo(() => {
    let result = [...videos];

    if (filters.categories.length > 0) {
      result = result.filter((v) =>
        filters.categories.includes(normalizeCategory(v.category)),
      );
    }

    if (filters.subcategories.length > 0) {
      result = result.filter(
        (v) => v.subcategory && filters.subcategories.includes(v.subcategory),
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
    filters.subcategories.length > 0 ||
    filters.tags.length > 0 ||
    filters.years.length > 0 ||
    filters.search.trim().length > 0;

  return {
    filters,
    filtered,
    activeSubcategoryOptions,
    toggleCategory,
    clearCategories,
    toggleSubcategory,
    clearSubcategories,
    toggleTag,
    clearTags,
    toggleYear,
    clearYears,
    setSortBy,
    setSortOrder,
    setSearch,
    clearFilters,
    resetFilters,
    hasActiveFilters,
  };
}
