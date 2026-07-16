import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { SmartImage } from '@/components/ui/SmartImage';
import { displayHost, faviconFor, normalizeUrl } from '@/utils/url';
import { trackResourceClick } from '@/services/analytics';
import type { Resource } from '@/types/database';

export function ResourceCard({ resource }: { resource: Resource }) {
  const href = normalizeUrl(resource.url);

  const handleClick = () => {
    // Fire-and-forget analytics; navigation is not blocked.
    void trackResourceClick(resource.id, resource.post_id);
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onClick={handleClick}
      className="card group flex items-center gap-3.5 p-3.5 transition-colors hover:border-border-soft hover:bg-bg-elevated"
    >
      <SmartImage
        src={resource.image_url}
        alt={resource.name}
        className="h-12 w-12 shrink-0 rounded-xl"
        imgClassName="object-contain p-1.5"
        fallback={
          <img
            src={faviconFor(href)}
            alt=""
            loading="lazy"
            className="h-7 w-7 rounded"
          />
        }
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate text-sm font-semibold text-white">{resource.name}</h4>
          {resource.badge && <Badge badge={resource.badge} />}
        </div>
        {resource.description ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted">{resource.description}</p>
        ) : (
          <p className="mt-0.5 truncate text-xs text-muted">{displayHost(href)}</p>
        )}
      </div>

      <span className="shrink-0 rounded-lg border border-border p-2 text-muted transition-colors group-hover:border-accent group-hover:text-accent">
        <ExternalLink size={16} />
      </span>
    </a>
  );
}
