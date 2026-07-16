import { supabase } from '@/lib/supabase';

/** Sign in an admin with email + password. */
export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/** Sign the current admin out. */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Get the current session (or null). */
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
