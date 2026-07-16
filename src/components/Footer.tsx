import { Instagram } from 'lucide-react';
import { useSettings } from '@/features/settings/useSettings';

export function Footer() {
  const { data: settings } = useSettings();

  const footerText = settings?.footer_text ?? 'Made with ☕ by Kaushik';
  const username = settings?.instagram_username ?? 'kaushik_codes';
  const instagramUrl = settings?.instagram_url ?? 'https://instagram.com/kaushik_codes';

  return (
    <footer className="mt-16 border-t border-border">
      <div className="container-app flex flex-col items-center gap-4 py-10 text-center">
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          <Instagram size={16} />
          Follow @{username}
        </a>
        <p className="text-sm text-muted">{footerText}</p>
      </div>
    </footer>
  );
}
