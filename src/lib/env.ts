/**
 * Centralised, validated access to Vite environment variables.
 * Fails fast with a clear message if a required variable is missing.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing environment variable "${name}". ` +
        `Copy .env.example to .env and fill in your Supabase values.`,
    );
  }
  return value;
}

export const env = {
  supabaseUrl: required('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL),
  supabaseAnonKey: required('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY),
  siteUrl: (import.meta.env.VITE_SITE_URL ?? window.location.origin).replace(/\/$/, ''),
} as const;
