import { supabase } from '@/lib/supabase';
import type { Category } from '@/types/database';
import { slugify } from '@/utils/slug';

/** Fetch all categories ordered by sort_order then name. */
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Category[];
}

export interface CategoryInput {
  name: string;
  slug?: string;
  icon: string;
  sort_order: number;
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const payload = {
    name: input.name.trim(),
    slug: (input.slug?.trim() || slugify(input.name)) || slugify(input.name),
    icon: input.icon,
    sort_order: input.sort_order,
  };
  const { data, error } = await supabase
    .from('categories')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return data as Category;
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>,
): Promise<Category> {
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.slug !== undefined) payload.slug = input.slug.trim() || slugify(input.name ?? '');
  if (input.icon !== undefined) payload.icon = input.icon;
  if (input.sort_order !== undefined) payload.sort_order = input.sort_order;

  const { data, error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

/** Count how many posts reference a category (used in the delete warning). */
export async function countPostsInCategory(categoryId: string): Promise<number> {
  const { count, error } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', categoryId);

  if (error) throw error;
  return count ?? 0;
}
