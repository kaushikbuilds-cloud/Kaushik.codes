/**
 * Database row types — kept in sync with supabase/migrations/0001_init.sql.
 * These describe the shape of rows returned from Supabase.
 */

export type PostStatus = 'draft' | 'published';
export type ResourceBadge = 'FREE' | 'PAID' | 'FREEMIUM' | 'NEW';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  post_id: string;
  name: string;
  url: string;
  description: string;
  image_url: string | null;
  badge: ResourceBadge | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  category_id: string | null;
  thumbnail_url: string | null;
  status: PostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** A post joined with its category, resources and tags. */
export interface PostWithRelations extends Post {
  category: Category | null;
  resources: Resource[];
  tags: Tag[];
}

/** A post as shown in listings (with resource count + category). */
export interface PostListItem extends Post {
  category: Category | null;
  resource_count: number;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  subtitle: string;
  hero_title: string;
  hero_subtitle: string;
  search_placeholder: string;
  instagram_username: string;
  instagram_url: string;
  footer_text: string;
  singleton: boolean;
  updated_at: string;
}

export interface PostView {
  id: string;
  post_id: string;
  created_at: string;
}

export interface ResourceClick {
  id: string;
  resource_id: string;
  post_id: string | null;
  created_at: string;
}
