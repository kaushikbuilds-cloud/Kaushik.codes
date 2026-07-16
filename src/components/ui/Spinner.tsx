import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Spinner({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return <Loader2 size={size} className={cn('animate-spin', className)} />;
}

export function FullScreenSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner size={28} className="text-accent" />
    </div>
  );
}
