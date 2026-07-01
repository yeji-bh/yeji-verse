"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: "md" | "lg" | "xl";
  mobileFullscreen?: boolean;
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
  mobileFullscreen = false,
}: ModalProps) {
  const { t } = useTranslation("common");
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
      className={`fixed inset-0 z-50 flex justify-center p-0 sm:p-4 ${
        mobileFullscreen ? "items-stretch sm:items-center" : "items-end sm:items-center"
      }`}
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
        className={`modal-shell relative w-full ${sizeClasses[size]} overflow-hidden bg-[var(--color-bgElevated)] shadow-[var(--color-shadowLg)] animate-modal-in ${
          mobileFullscreen
            ? "flex h-[100dvh] max-h-[100dvh] flex-col sm:h-auto sm:max-h-[90vh] sm:flex-none"
            : "max-h-[95vh] sm:max-h-[90vh]"
        } ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
