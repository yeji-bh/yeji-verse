"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconChevronUp } from "@/components/ui/IconButton";

const SHOW_AFTER_PX = 320;

export function BackToTop() {
  const { t } = useTranslation("common");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={t("backToTop")}
      className={`back-to-top-btn fixed bottom-5 right-4 z-20 flex h-12 w-12 items-center justify-center border border-[var(--color-border)] bg-[var(--color-bg)]/90 text-[var(--color-textMuted)] shadow-[var(--color-shadow)] backdrop-blur-xl transition-all duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] sm:bottom-6 sm:right-6 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <IconChevronUp className="h-5 w-5" />
    </button>
  );
}
