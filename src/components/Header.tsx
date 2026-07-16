import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';
import { useSettings } from '@/features/settings/useSettings';

export function Header() {
  const { data: settings } = useSettings();

  const siteName = settings?.site_name ?? 'Kaushik Codes';
  const subtitle = settings?.subtitle ?? 'AI Tools • Coding • Websites • Resources';
  const instagramUrl = settings?.instagram_url ?? 'https://instagram.com/kaushik_codes';

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="container-app flex h-14 items-center justify-between">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <LogoMark />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold leading-tight text-white">
              {siteName}
            </span>
            <span className="block truncate text-[11px] leading-tight text-muted">
              {subtitle}
            </span>
          </span>
        </Link>

        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <Instagram size={18} />
        </a>
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 7v10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M15 7 10 12l5 5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
