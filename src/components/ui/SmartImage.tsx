import { useState } from 'react';
import { cn } from '@/utils/cn';

/**
 * Lazy-loaded image with a graceful fallback. If the src fails to load (or is
 * empty), renders the provided fallback node instead.
 */
export function SmartImage({
  src,
  alt,
  className,
  imgClassName,
  fallback,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallback: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  return (
    <div className={cn('flex items-center justify-center overflow-hidden bg-bg-elevated', className)}>
      {showFallback ? (
        fallback
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className={cn('h-full w-full object-cover', imgClassName)}
        />
      )}
    </div>
  );
}
