import { Badge } from "./Badge";

interface FilterBadgeGroupProps<T extends string | number> {
  label: string;
  items: { value: T; label: string }[];
  selected: T[];
  onToggle: (value: T) => void;
  showAll?: boolean;
  allLabel?: string;
  onSelectAll?: () => void;
}

export function FilterBadgeGroup<T extends string | number>({
  label,
  items,
  selected,
  onToggle,
  showAll = false,
  allLabel = "All",
  onSelectAll,
}: FilterBadgeGroupProps<T>) {
  if (items.length === 0 && !showAll) return null;

  return (
    <div className="space-y-2.5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-textSubtle)]">
        {label}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {showAll && (
          <Badge
            active={selected.length === 0}
            onClick={() => onSelectAll?.()}
          >
            {allLabel}
          </Badge>
        )}
        {items.map((item) => (
          <Badge
            key={String(item.value)}
            active={selected.includes(item.value)}
            onClick={() => onToggle(item.value)}
          >
            {item.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
