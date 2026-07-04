"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: "md" | "lg" | "xl";
  mobileFullscreen?: boolean;
  /** 手機版也垂直置中（預設為底部滑出） */
  centered?: boolean;
  /** 手機 sheet 拖曳位移（作用在整個容器） */
  sheetOffset?: number;
  sheetDragging?: boolean;
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
  centered = false,
  sheetOffset = 0,
  sheetDragging = false,
}: ModalProps) {
  const { t } = useTranslation("common");
  const dialogRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!open || !mounted) return null;

  const overlayAlign = mobileFullscreen
    ? "items-end sm:items-center"
    : centered
      ? "items-center px-4"
      : "items-end p-0 sm:items-center sm:p-4";

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex justify-center ${overlayAlign}`}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 z-0 bg-[var(--color-bgOverlay)] backdrop-blur-md"
        onClick={onClose}
        aria-label={t("close")}
      />
      <div
        ref={dialogRef}
        className={`modal-shell relative z-10 w-full ${sizeClasses[size]} overflow-hidden bg-[var(--color-bgElevated)] shadow-[var(--color-shadowLg)] ${
          sheetDragging || sheetOffset > 0 ? "" : "animate-modal-in"
        } ${
          mobileFullscreen
            ? "flex h-auto max-h-[100dvh] flex-col self-end sm:max-h-[90vh] sm:self-auto sm:flex-none"
            : "max-h-[95vh] sm:max-h-[90vh]"
        } ${className}`}
        style={
          mobileFullscreen
            ? {
                transform: sheetOffset > 0 ? `translateY(${sheetOffset}px)` : undefined,
                transition: sheetDragging ? "none" : "transform 0.2s ease-out",
                willChange: sheetDragging ? "transform" : undefined,
              }
            : undefined
        }
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
