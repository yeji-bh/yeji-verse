"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "@/components/providers/LocaleProvider";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: "md" | "lg" | "xl";
}

const sizeClasses = {
  md: "max-w-lg",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
};

export function Modal({
  open,
  onClose,
  children,
  className = "",
  size = "lg",
}: ModalProps) {
  const { t } = useLocale();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[var(--color-bgOverlay)] backdrop-blur-md"
        onClick={onClose}
        aria-label={t("close")}
      />
      <div
        ref={dialogRef}
        className={`relative w-full ${sizeClasses[size]} max-h-[95vh] sm:max-h-[90vh] overflow-hidden rounded-t-2xl sm:rounded-2xl border border-[var(--color-border)] bg-[var(--color-bgElevated)] shadow-[var(--color-shadowLg)] animate-modal-in ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
