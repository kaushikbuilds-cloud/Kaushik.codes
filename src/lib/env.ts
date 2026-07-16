/**
 * Centralised, validated access to Vite environment variables.
 * Throws a single ConfigError listing every missing variable so the
 * bootstrap in main.tsx can render a clear, actionable message instead of a
 * blank page.
 */

export class ConfigError extends Error {
  missing: string[];
  constructor(missing: string[]) {
    super(
      `Missing environment variable${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}. ` +
        `Copy .env.example to .env and fill in your Supabase values ` +
        `(or set them in your Vercel project's Environment Variables).`,
    );
    this.name = 'ConfigError';
    this.missing = missing;
  }
}

function readEnv() {
  const missing: string[] = [];

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.trim() === '') missing.push('VITE_SUPABASE_URL');

  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseAnonKey || supabaseAnonKey.trim() === '') missing.push('VITE_SUPABASE_ANON_KEY');

  if (missing.length > 0) throw new ConfigError(missing);

  return {
    supabaseUrl: supabaseUrl as string,
    supabaseAnonKey: supabaseAnonKey as string,
    siteUrl: (import.meta.env.VITE_SITE_URL ?? window.location.origin).replace(/\/$/, ''),
  };
}

export const env = readEnv();
