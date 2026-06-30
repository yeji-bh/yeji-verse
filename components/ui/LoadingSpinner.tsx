interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-10 w-10 border-[3px]",
};

export function LoadingSpinner({ className = "", size = "md" }: LoadingSpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-[var(--color-border)] border-t-[var(--color-accent)] ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
