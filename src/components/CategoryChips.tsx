import { cn } from '@/utils/cn';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import type { Category } from '@/types/database';

export function CategoryChips({
  categories,
  active,
  onSelect,
}: {
  categories: Category[];
  active: string | null;
  onSelect: (slug: string | null) => void;
}) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0">
      <Chip label="All" active={active === null} onClick={() => onSelect(null)} />
      {categories.map((cat) => (
        <Chip
          key={cat.id}
          label={cat.name}
          icon={cat.icon}
          active={active === cat.slug}
          onClick={() => onSelect(cat.slug)}
        />
      ))}
    </div>
  );
}

function Chip({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-accent bg-accent/15 text-white'
          : 'border-border bg-bg-soft text-muted hover:border-border-soft hover:text-white',
      )}
    >
      {icon && <CategoryIcon name={icon} size={14} />}
      {label}
    </button>
  );
}
