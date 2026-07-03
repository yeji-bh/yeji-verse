"use client";

interface PlainIconButtonProps {
  onClick?: () => void;
  label: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function PlainIconButton({
  onClick,
  label,
  children,
  className = "",
  disabled = false,
}: PlainIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`inline-flex h-10 w-10 items-center justify-center text-[var(--color-textMuted)] transition-colors hover:text-[var(--color-text)] disabled:pointer-events-none disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
