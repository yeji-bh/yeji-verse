import type { TFunction } from "i18next";

export function formatRelativeTime(iso: string, t: TFunction): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs) || diffMs < 0) return t("timeJustNow");

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return t("timeJustNow");

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t("timeMinutesAgo", { count: minutes });

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("timeHoursAgo", { count: hours });

  const days = Math.floor(hours / 24);
  if (days < 30) return t("timeDaysAgo", { count: days });

  const months = Math.floor(days / 30);
  if (months < 12) return t("timeMonthsAgo", { count: months });

  const years = Math.floor(days / 365);
  return t("timeYearsAgo", { count: Math.max(years, 1) });
}
