"use client";

import { useTranslation } from "react-i18next";
import { categoryLabelKey, sortLabelKey } from "@/lib/i18n/client";

export function useAppTranslation() {
  const { t, i18n } = useTranslation("common");

  return {
    t,
    locale: i18n.language,
    categoryLabel: (category: string) => t(categoryLabelKey(category)),
    sortLabel: (sort: string) => t(sortLabelKey(sort)),
  };
}
