"use client";

interface PlainIconButtonProps {
  onClick?: () => void;
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function PlainIconButton({
  onClick,
  label,
  children,
  className = "",
}: PlainIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`inline-flex h-10 w-10 items-center justify-center text-[var(--color-textMuted)] transition-colors hover:text-[var(--color-text)] ${className}`}
    >
      {children}
    </button>
  );
}
