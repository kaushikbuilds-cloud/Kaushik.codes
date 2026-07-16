#!/usr/bin/env node
/**
 * Optional: generate a full sitemap.xml including every published post.
 *
 * Usage:
 *   VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... VITE_SITE_URL=https://kaushik.codes \
 *   node scripts/generate-sitemap.mjs
 *
 * Writes to public/sitemap.xml. Run it before `npm run build` (or in a Vercel
 * build step) whenever you want per-post URLs in the sitemap. It only reads
 * PUBLISHED posts via the anon key + RLS, so it is safe to run anywhere.
 */
import { createClient } from '@supabase/supabase-js';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const site = (process.env.VITE_SITE_URL || 'https://kaushik.codes').replace(/\/$/, '');

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(url, key);

const { data, error } = await supabase
  .from('posts')
  .select('slug, updated_at')
  .eq('status', 'published')
  .order('published_at', { ascending: false });

if (error) {
  console.error('Failed to fetch posts:', error.message);
  process.exit(1);
}

const urls = [
  { loc: `${site}/`, changefreq: 'daily', priority: '1.0' },
  ...(data ?? []).map((p) => ({
    loc: `${site}/links/${p.slug}`,
    lastmod: p.updated_at ? new Date(p.updated_at).toISOString() : undefined,
    changefreq: 'weekly',
    priority: '0.8',
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/sitemap.xml');
await writeFile(out, xml, 'utf8');
console.log(`Wrote ${urls.length} URLs to public/sitemap.xml`);
