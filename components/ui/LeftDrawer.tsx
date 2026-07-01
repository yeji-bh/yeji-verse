"use client";

import { useEffect } from "react";
import { IconClose } from "@/components/ui/IconButton";

interface LeftDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function LeftDrawer({ open, onClose, children }: LeftDrawerProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--color-bgOverlay)] backdrop-blur-sm"
        onClick={onClose}
        aria-label="close"
      />
      <div className="relative flex h-full w-[min(88vw,320px)] animate-drawer-in flex-col bg-[var(--color-bgElevated)] shadow-[var(--color-shadowLg)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 text-[var(--color-textMuted)] hover:text-[var(--color-text)]"
        >
          <IconClose className="h-5 w-5" />
        </button>
        <div className="flex min-h-0 flex-1 flex-col pt-12">{children}</div>
      </div>
    </div>
  );
}
