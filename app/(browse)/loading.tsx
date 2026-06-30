import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function BrowseLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
      <LoadingSpinner size="lg" />
    </div>
  );
}
