import { Badge } from "./Badge";

interface FilterBadgeGroupProps<T extends string | number> {
  label: string;
  items: { value: T; label: string }[];
  selected: T[];
  onToggle: (value: T) => void;
  single?: boolean;
}

export function FilterBadgeGroup<T extends string | number>({
  label,
  items,
  selected,
  onToggle,
  single = false,
}: FilterBadgeGroupProps<T>) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-textSubtle)]">
        {label}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge
            key={String(item.value)}
            active={selected.includes(item.value)}
            onClick={() => {
              if (single || !selected.includes(item.value)) {
                onToggle(item.value);
              }
            }}
          >
            {item.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
