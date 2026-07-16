import { cn } from '@/utils/cn';
import type { PostStatus } from '@/types/database';

export function StatusPill({ status }: { status: PostStatus }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
        status === 'published'
          ? 'border-green-500/30 bg-green-500/10 text-green-400'
          : 'border-amber-500/30 bg-amber-500/10 text-amber-400',
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          status === 'published' ? 'bg-green-400' : 'bg-amber-400',
        )}
      />
      {status === 'published' ? 'Published' : 'Draft'}
    </span>
  );
}
