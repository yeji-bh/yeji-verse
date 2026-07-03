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
  className = "h-9 w-9",
  disabled = false,
}: PlainIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`inline-flex shrink-0 items-center justify-center text-[var(--color-textMuted)] transition-colors hover:text-[var(--color-text)] disabled:pointer-events-none disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
