interface BadgeProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md";
}

export function Badge({
  children,
  active = false,
  onClick,
  className = "",
  size = "sm",
}: BadgeProps) {
  const sizeClass = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";
  const base = `inline-flex items-center font-medium transition-colors ${sizeClass}`;
  const color = active
    ? "bg-[var(--color-badgeActive)] text-[var(--color-badgeActiveText)]"
    : "bg-[var(--color-badge)] text-[var(--color-badgeText)] hover:bg-[var(--color-bgMuted)]";

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} ${color} cursor-pointer ${className}`}
      >
        {children}
      </button>
    );
  }

  return <span className={`${base} ${color} ${className}`}>{children}</span>;
}
