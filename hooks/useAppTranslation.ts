"use client";

import { useTranslation } from "react-i18next";
import { categoryLabelKey, sortByLabelKey } from "@/lib/i18n/client";

export function useAppTranslation() {
  const { t, i18n } = useTranslation("common");

  return {
    t,
    locale: i18n.language,
    categoryLabel: (category: string) => t(categoryLabelKey(category)),
    sortByLabel: (sortBy: string) => t(sortByLabelKey(sortBy)),
  };
}
