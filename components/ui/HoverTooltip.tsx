"use client";

interface HoverTooltipProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function HoverTooltip({ label, children, className = "" }: HoverTooltipProps) {
  return (
    <span className={`group/tooltip relative inline-flex ${className}`}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap border border-[var(--color-border)] bg-[var(--color-bgElevated)] px-2.5 py-1.5 text-xs text-[var(--color-text)] opacity-0 shadow-[var(--color-shadow)] transition-opacity duration-75 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
