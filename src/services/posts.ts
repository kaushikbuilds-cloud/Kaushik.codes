import { supabase } from '@/lib/supabase';
import type {
  Post,
  PostListItem,
  PostStatus,
  PostWithRelations,
  Resource,
  Tag,
} from '@/types/database';
import { slugify } from '@/utils/slug';

// ---------------------------------------------------------------------------
// Shared select fragments
// ---------------------------------------------------------------------------
const LIST_SELECT = '*, category:categories(*), resources(count)';
const FULL_SELECT =
  '*, category:categories(*), resources(*), post_tags(tag:tags(*))';

interface RawListRow extends Post {
  category: PostListItem['category'];
  resources: { count: number }[] | null;
}

interface RawFullRow extends Post {
  category: PostWithRelations['category'];
  resources: Resource[] | null;
  post_tags: { tag: Tag | null }[] | null;
}

function mapListRow(row: RawListRow): PostListItem {
  return {
    ...row,
    category: row.category ?? null,
    resource_count: row.resources?.[0]?.count ?? 0,
  };
}

function mapFullRow(row: RawFullRow): PostWithRelations {
  return {
    ...row,
    category: row.category ?? null,
    resources: (row.resources ?? []).sort((a, b) => a.sort_order - b.sort_order),
    tags: (row.post_tags ?? [])
      .map((pt) => pt.tag)
      .filter((t): t is Tag => t !== null),
  };
}

// ---------------------------------------------------------------------------
// Public queries
// ---------------------------------------------------------------------------

/** Published posts, newest first. Optionally filter by category slug. */
export async function fetchPublishedPosts(
  categorySlug?: string | null,
): Promise<PostListItem[]> {
  let query = supabase
    .from('posts')
    .select(LIST_SELECT)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (categorySlug) {
    // Resolve category id from slug first to keep the filter index-friendly.
    const { data: cat, error: catErr } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle();
    if (catErr) throw catErr;
    if (!cat) return [];
    query = query.eq('category_id', cat.id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as RawListRow[]).map(mapListRow);
}

/** A single published post (or any status for admins) by slug, with relations. */
export async function fetchPostBySlug(
  slug: string,
): Promise<PostWithRelations | null> {
  const { data, error } = await supabase
    .from('posts')
    .select(FULL_SELECT)
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapFullRow(data as RawFullRow);
}

// ---------------------------------------------------------------------------
// Search index (published posts enriched for instant client-side search)
// ---------------------------------------------------------------------------

const SEARCH_SELECT =
  '*, category:categories(*), resources(name), post_tags(tag:tags(name))';

interface RawSearchRow extends Post {
  category: PostListItem['category'];
  resources: { name: string }[] | null;
  post_tags: { tag: { name: string } | null }[] | null;
}

/** A list item plus the searchable text fields (tags + resource names). */
export interface SearchablePost extends PostListItem {
  tag_names: string[];
  resource_names: string[];
  search_blob: string;
}

/**
 * Fetch every published post with the fields needed for instant search:
 * title, description, category name, tag names and resource names.
 * Sorted newest first so the same result powers the "Latest Links" grid.
 */
export async function fetchSearchIndex(): Promise<SearchablePost[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(SEARCH_SELECT)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) throw error;

  return ((data ?? []) as RawSearchRow[]).map((row) => {
    const tag_names = (row.post_tags ?? [])
      .map((pt) => pt.tag?.name)
      .filter((n): n is string => Boolean(n));
    const resource_names = (row.resources ?? []).map((r) => r.name);
    const blob = [
      row.title,
      row.short_description,
      row.full_description,
      row.category?.name ?? '',
      ...tag_names,
      ...resource_names,
    ]
      .join(' ')
      .toLowerCase();

    return {
      ...row,
      category: row.category ?? null,
      resource_count: resource_names.length,
      tag_names,
      resource_names,
      search_blob: blob,
    };
  });
}

// ---------------------------------------------------------------------------
// Admin queries
// ---------------------------------------------------------------------------

/** All posts (any status) for the admin list. */
export async function fetchAllPosts(): Promise<PostListItem[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(LIST_SELECT)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as RawListRow[]).map(mapListRow);
}

/** A single post by id with relations, for the editor. */
export async function fetchPostById(id: string): Promise<PostWithRelations | null> {
  const { data, error } = await supabase
    .from('posts')
    .select(FULL_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapFullRow(data as RawFullRow);
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export interface ResourceInput {
  id?: string;
  name: string;
  url: string;
  description: string;
  image_url: string | null;
  badge: Resource['badge'];
}

export interface PostInput {
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  category_id: string | null;
  thumbnail_url: string | null;
  status: PostStatus;
  resources: ResourceInput[];
  tags: string[]; // tag names
}

/** Ensure a slug is unique, appending -2, -3, … if needed. */
async function ensureUniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const clean = slugify(base) || 'post';
  let candidate = clean;
  let n = 1;
  // Loop until we find a slug not used by another post.
  // Bounded by a sensible max to avoid infinite loops.
  while (n < 100) {
    let q = supabase.from('posts').select('id').eq('slug', candidate).limit(1);
    if (ignoreId) q = q.neq('id', ignoreId);
    const { data, error } = await q;
    if (error) throw error;
    if (!data || data.length === 0) return candidate;
    n += 1;
    candidate = `${clean}-${n}`;
  }
  return `${clean}-${Date.now()}`;
}

/** Upsert tags by name and return their ids. */
async function resolveTagIds(names: string[]): Promise<string[]> {
  const unique = Array.from(
    new Map(
      names
        .map((n) => n.trim())
        .filter(Boolean)
        .map((n) => [slugify(n), n]),
    ).entries(),
  ); // [slug, name][]

  if (unique.length === 0) return [];

  const rows = unique.map(([slug, name]) => ({ slug, name }));
  const { data, error } = await supabase
    .from('tags')
    .upsert(rows, { onConflict: 'slug' })
    .select('id');

  if (error) throw error;
  return (data ?? []).map((t) => t.id as string);
}

/** Replace the resources for a post (delete-all + insert keeps ordering simple). */
async function saveResources(postId: string, resources: ResourceInput[]): Promise<void> {
  const { error: delErr } = await supabase
    .from('resources')
    .delete()
    .eq('post_id', postId);
  if (delErr) throw delErr;

  if (resources.length === 0) return;

  const rows = resources.map((r, index) => ({
    post_id: postId,
    name: r.name.trim(),
    url: r.url.trim(),
    description: r.description.trim(),
    image_url: r.image_url,
    badge: r.badge,
    sort_order: index,
  }));

  const { error: insErr } = await supabase.from('resources').insert(rows);
  if (insErr) throw insErr;
}

/** Replace the tag associations for a post. */
async function savePostTags(postId: string, tagNames: string[]): Promise<void> {
  const { error: delErr } = await supabase
    .from('post_tags')
    .delete()
    .eq('post_id', postId);
  if (delErr) throw delErr;

  const tagIds = await resolveTagIds(tagNames);
  if (tagIds.length === 0) return;

  const rows = tagIds.map((tag_id) => ({ post_id: postId, tag_id }));
  const { error: insErr } = await supabase.from('post_tags').insert(rows);
  if (insErr) throw insErr;
}

function publishedAtFor(status: PostStatus, existing: string | null): string | null {
  if (status !== 'published') return null;
  return existing ?? new Date().toISOString();
}

export async function createPost(input: PostInput): Promise<Post> {
  const slug = await ensureUniqueSlug(input.slug || input.title);

  const { data, error } = await supabase
    .from('posts')
    .insert({
      title: input.title.trim(),
      slug,
      short_description: input.short_description.trim(),
      full_description: input.full_description.trim(),
      category_id: input.category_id,
      thumbnail_url: input.thumbnail_url,
      status: input.status,
      published_at: publishedAtFor(input.status, null),
    })
    .select('*')
    .single();

  if (error) throw error;
  const post = data as Post;

  await saveResources(post.id, input.resources);
  await savePostTags(post.id, input.tags);

  return post;
}

export async function updatePost(id: string, input: PostInput): Promise<Post> {
  // Read existing to preserve original published_at when already published.
  const { data: existing, error: exErr } = await supabase
    .from('posts')
    .select('published_at, status')
    .eq('id', id)
    .single();
  if (exErr) throw exErr;

  const slug = await ensureUniqueSlug(input.slug || input.title, id);

  const { data, error } = await supabase
    .from('posts')
    .update({
      title: input.title.trim(),
      slug,
      short_description: input.short_description.trim(),
      full_description: input.full_description.trim(),
      category_id: input.category_id,
      thumbnail_url: input.thumbnail_url,
      status: input.status,
      published_at: publishedAtFor(
        input.status,
        (existing as { published_at: string | null }).published_at,
      ),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  const post = data as Post;

  await saveResources(post.id, input.resources);
  await savePostTags(post.id, input.tags);

  return post;
}

export async function deletePost(id: string): Promise<void> {
  // resources, post_tags cascade via FK ON DELETE CASCADE.
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
}

export async function setPostStatus(id: string, status: PostStatus): Promise<void> {
  const { data: existing } = await supabase
    .from('posts')
    .select('published_at')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('posts')
    .update({
      status,
      published_at: publishedAtFor(
        status,
        (existing as { published_at: string | null } | null)?.published_at ?? null,
      ),
    })
    .eq('id', id);

  if (error) throw error;
}
