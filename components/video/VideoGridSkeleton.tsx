const PLACEHOLDER_COUNT = 12;

export function VideoGridSkeleton({ count = PLACEHOLDER_COUNT }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"
      aria-busy="true"
      aria-label="Loading videos"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-xl bg-[var(--color-bgMuted)]">
          <div className="aspect-video w-full bg-[var(--color-borderSubtle)]" />
          <div className="space-y-2 p-3">
            <div className="h-4 w-full rounded bg-[var(--color-borderSubtle)]" />
            <div className="h-3 w-2/3 rounded bg-[var(--color-borderSubtle)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
