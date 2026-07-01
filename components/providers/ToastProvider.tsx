"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface ToastState {
  message: string;
  id: number;
  variant: ToastVariant;
}

export type ToastVariant = "success" | "error";

const ToastContext = createContext<{
  showToast: (message: string, variant?: ToastVariant) => void;
} | null>(null);

const TOAST_DURATION_MS = 2500;

const TOAST_STYLES: Record<ToastVariant, string> = {
  success: "border-emerald-600/30 bg-emerald-600 text-white",
  error: "border-red-600/30 bg-red-600 text-white",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = Date.now();
    setToast({ message, id, variant });

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[200] max-w-[min(90vw,24rem)] -translate-x-1/2">
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={`animate-[toast-in_0.2s_ease-out] rounded-xl border px-4 py-3 text-center text-sm shadow-lg ${TOAST_STYLES[toast.variant]}`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
