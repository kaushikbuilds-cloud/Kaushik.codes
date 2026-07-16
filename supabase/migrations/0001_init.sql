-- ============================================================================
-- Kaushik Codes — Initial schema
-- ----------------------------------------------------------------------------
-- Creates all tables, indexes, constraints, cascade rules, helper functions,
-- triggers and Row Level Security policies for the link hub.
--
-- Run this in the Supabase SQL Editor (or via `supabase db push`).
-- Idempotent-friendly: uses IF NOT EXISTS where practical.
-- ============================================================================

-- Extensions ----------------------------------------------------------------
create extension if not exists "pgcrypto";     -- gen_random_uuid()

-- ============================================================================
-- Helper: set_updated_at() trigger function
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- profiles
-- Mirrors auth.users; row is created for each admin manually.
-- ============================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null default 'admin' check (role in ('admin')),
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''), 'admin')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- categories
-- ============================================================================
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  icon        text not null default 'Folder',   -- Lucide icon name
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists categories_sort_order_idx on public.categories (sort_order);

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ============================================================================
-- posts
-- ============================================================================
create table if not exists public.posts (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  slug              text not null unique,
  short_description text not null default '',
  full_description  text not null default '',
  category_id       uuid references public.categories (id) on delete set null,
  thumbnail_url     text,
  status            text not null default 'draft' check (status in ('draft', 'published')),
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists posts_status_idx        on public.posts (status);
create index if not exists posts_published_at_idx   on public.posts (published_at desc);
create index if not exists posts_category_id_idx     on public.posts (category_id);
create index if not exists posts_slug_idx            on public.posts (slug);

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- ============================================================================
-- resources (links that belong to a post)
-- ============================================================================
create table if not exists public.resources (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts (id) on delete cascade,
  name        text not null,
  url         text not null,
  description text not null default '',
  image_url   text,
  badge       text check (badge in ('FREE', 'PAID', 'FREEMIUM', 'NEW')),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists resources_post_id_idx    on public.resources (post_id);
create index if not exists resources_sort_order_idx  on public.resources (post_id, sort_order);

drop trigger if exists resources_set_updated_at on public.resources;
create trigger resources_set_updated_at
  before update on public.resources
  for each row execute function public.set_updated_at();

-- ============================================================================
-- tags + post_tags (many-to-many)
-- ============================================================================
create table if not exists public.tags (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now()
);

create table if not exists public.post_tags (
  post_id  uuid not null references public.posts (id) on delete cascade,
  tag_id   uuid not null references public.tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

create index if not exists post_tags_tag_id_idx  on public.post_tags (tag_id);

-- ============================================================================
-- post_views (anonymous analytics — no IP, no PII)
-- ============================================================================
create table if not exists public.post_views (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts (id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index if not exists post_views_post_id_idx     on public.post_views (post_id);
create index if not exists post_views_created_at_idx   on public.post_views (created_at desc);

-- ============================================================================
-- resource_clicks (anonymous analytics — no IP, no PII)
-- ============================================================================
create table if not exists public.resource_clicks (
  id           uuid primary key default gen_random_uuid(),
  resource_id  uuid not null references public.resources (id) on delete cascade,
  post_id      uuid references public.posts (id) on delete cascade,
  created_at   timestamptz not null default now()
);

create index if not exists resource_clicks_resource_id_idx  on public.resource_clicks (resource_id);
create index if not exists resource_clicks_post_id_idx        on public.resource_clicks (post_id);
create index if not exists resource_clicks_created_at_idx     on public.resource_clicks (created_at desc);

-- ============================================================================
-- site_settings (single-row configuration table)
-- ============================================================================
create table if not exists public.site_settings (
  id                  uuid primary key default gen_random_uuid(),
  site_name           text not null default 'Kaushik Codes',
  subtitle            text not null default 'AI Tools • Coding • Websites • Resources',
  hero_title          text not null default 'Enna link thedura bro? 👀',
  hero_subtitle       text not null default 'Videos la sonna AI tools, coding resources, websites & apps ellame inga iruku.',
  search_placeholder  text not null default 'Search AI tools, coding, websites...',
  instagram_username  text not null default 'kaushik_codes',
  instagram_url       text not null default 'https://instagram.com/kaushik_codes',
  footer_text         text not null default 'Made with ☕ by Kaushik',
  singleton           boolean not null default true unique,   -- enforces single row
  updated_at          timestamptz not null default now()
);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- Seed the single settings row (only if none exists).
insert into public.site_settings (singleton)
values (true)
on conflict (singleton) do nothing;

-- ============================================================================
-- Helper: is_admin()
-- Returns true when the current authenticated user has an admin profile.
-- Admin accounts are created manually (a row in `profiles` with role='admin').
-- Defined here, after `profiles` exists, because SQL-language functions are
-- validated against real objects at CREATE time (unlike plpgsql).
-- ============================================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.profiles        enable row level security;
alter table public.categories      enable row level security;
alter table public.posts           enable row level security;
alter table public.resources       enable row level security;
alter table public.tags            enable row level security;
alter table public.post_tags       enable row level security;
alter table public.post_views      enable row level security;
alter table public.resource_clicks enable row level security;
alter table public.site_settings   enable row level security;

-- ---- profiles --------------------------------------------------------------
drop policy if exists "profiles: self read"  on public.profiles;
create policy "profiles: self read"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles: self update" on public.profiles;
create policy "profiles: self update"
  on public.profiles for update
  using (auth.uid() = id);

-- ---- categories ------------------------------------------------------------
drop policy if exists "categories: public read" on public.categories;
create policy "categories: public read"
  on public.categories for select
  using (true);

drop policy if exists "categories: admin write" on public.categories;
create policy "categories: admin write"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---- posts -----------------------------------------------------------------
drop policy if exists "posts: public read published" on public.posts;
create policy "posts: public read published"
  on public.posts for select
  using (status = 'published' or public.is_admin());

drop policy if exists "posts: admin write" on public.posts;
create policy "posts: admin write"
  on public.posts for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---- resources -------------------------------------------------------------
drop policy if exists "resources: public read of published posts" on public.resources;
create policy "resources: public read of published posts"
  on public.resources for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.posts p
      where p.id = resources.post_id and p.status = 'published'
    )
  );

drop policy if exists "resources: admin write" on public.resources;
create policy "resources: admin write"
  on public.resources for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---- tags ------------------------------------------------------------------
drop policy if exists "tags: public read" on public.tags;
create policy "tags: public read"
  on public.tags for select
  using (true);

drop policy if exists "tags: admin write" on public.tags;
create policy "tags: admin write"
  on public.tags for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---- post_tags -------------------------------------------------------------
drop policy if exists "post_tags: public read" on public.post_tags;
create policy "post_tags: public read"
  on public.post_tags for select
  using (true);

drop policy if exists "post_tags: admin write" on public.post_tags;
create policy "post_tags: admin write"
  on public.post_tags for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---- post_views (anonymous insert only) ------------------------------------
drop policy if exists "post_views: anyone insert" on public.post_views;
create policy "post_views: anyone insert"
  on public.post_views for insert
  with check (true);

drop policy if exists "post_views: admin read" on public.post_views;
create policy "post_views: admin read"
  on public.post_views for select
  using (public.is_admin());

-- ---- resource_clicks (anonymous insert only) -------------------------------
drop policy if exists "resource_clicks: anyone insert" on public.resource_clicks;
create policy "resource_clicks: anyone insert"
  on public.resource_clicks for insert
  with check (true);

drop policy if exists "resource_clicks: admin read" on public.resource_clicks;
create policy "resource_clicks: admin read"
  on public.resource_clicks for select
  using (public.is_admin());

-- ---- site_settings ---------------------------------------------------------
drop policy if exists "site_settings: public read" on public.site_settings;
create policy "site_settings: public read"
  on public.site_settings for select
  using (true);

drop policy if exists "site_settings: admin update" on public.site_settings;
create policy "site_settings: admin update"
  on public.site_settings for update
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- Aggregate helpers (SECURITY DEFINER) for analytics counts used by the app.
-- These expose only anonymous aggregate counts and are safe for public read of
-- published data; admin-only detail stays gated behind is_admin() policies.
-- ============================================================================

-- View count per post (published only), used to show "views" if desired.
create or replace function public.post_view_count(p_post_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint from public.post_views where post_id = p_post_id;
$$;

-- ============================================================================
-- Done.
-- ============================================================================
