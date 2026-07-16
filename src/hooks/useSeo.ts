import { useEffect } from 'react';
import { env } from '@/lib/env';

interface SeoOptions {
  title: string;
  description?: string;
  image?: string | null;
  path?: string; // e.g. "/links/my-post"
  type?: 'website' | 'article';
  noindex?: boolean;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Imperatively manage per-page SEO tags (title, description, OG, Twitter,
 * canonical, robots). Runs on mount and whenever inputs change.
 */
export function useSeo({
  title,
  description,
  image,
  path,
  type = 'website',
  noindex = false,
}: SeoOptions): void {
  useEffect(() => {
    const url = `${env.siteUrl}${path ?? ''}`;
    document.title = title;

    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
      setMeta('name', 'twitter:description', description);
    }

    setMeta('property', 'og:title', title);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', url);
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');

    if (image) {
      setMeta('property', 'og:image', image);
      setMeta('name', 'twitter:image', image);
    }

    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setLink('canonical', url);
  }, [title, description, image, path, type, noindex]);
}
