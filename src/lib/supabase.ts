import { createClient } from '@supabase/supabase-js';
import { env } from './env';

/**
 * Single shared Supabase browser client.
 * Uses ONLY the anon/public key. Auth session is persisted to localStorage so
 * the admin stays signed in across reloads.
 */
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'kaushik-codes-auth',
  },
});
