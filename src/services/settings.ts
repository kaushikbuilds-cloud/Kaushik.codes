import { supabase } from '@/lib/supabase';
import type { SiteSettings } from '@/types/database';

/** Fetch the single site_settings row. */
export async function fetchSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .single();

  if (error) throw error;
  return data as SiteSettings;
}

export type SettingsUpdate = Partial<
  Omit<SiteSettings, 'id' | 'singleton' | 'updated_at'>
>;

/** Update the site settings (admin only, enforced by RLS). */
export async function updateSettings(
  id: string,
  patch: SettingsUpdate,
): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from('site_settings')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as SiteSettings;
}
