import { cn } from '@/utils/cn';
import type { ResourceBadge } from '@/types/database';

const BADGE_STYLES: Record<ResourceBadge, string> = {
  FREE: 'bg-green-500/15 text-green-400 border-green-500/30',
  PAID: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  FREEMIUM: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  NEW: 'bg-accent/15 text-accent border-accent/30',
};

export function Badge({
  badge,
  className,
}: {
  badge: ResourceBadge;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
        BADGE_STYLES[badge],
        className,
      )}
    >
      {badge}
    </span>
  );
}

export function NewBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white',
        className,
      )}
    >
      NEW
    </span>
  );
}

export function CategoryBadge({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-border bg-bg-soft px-2.5 py-0.5 text-[11px] font-medium text-muted',
        className,
      )}
    >
      {name}
    </span>
  );
}
