import { supabase } from '@/lib/supabase';

const BUCKET = 'media';

/**
 * Upload an image to the public `media` bucket and return its public URL.
 * `folder` groups files (e.g. 'thumbnails', 'resources').
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : 'png';
  const path = `${folder}/${crypto.randomUUID()}.${safeExt}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '31536000',
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Delete an image by its public URL (best-effort). */
export async function deleteImageByUrl(publicUrl: string): Promise<void> {
  const marker = `/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path = publicUrl.slice(idx + marker.length);
  await supabase.storage.from(BUCKET).remove([path]);
}
