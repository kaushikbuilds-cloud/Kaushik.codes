-- ============================================================================
-- Kaushik Codes — Storage bucket + policies
-- ----------------------------------------------------------------------------
-- Creates the public `media` bucket used for post thumbnails and resource
-- images, and locks down write access to admins only.
-- ============================================================================

-- Create a public bucket (readable by anyone, writable by admins).
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- ---- Public read -----------------------------------------------------------
drop policy if exists "media: public read" on storage.objects;
create policy "media: public read"
  on storage.objects for select
  using (bucket_id = 'media');

-- ---- Admin write (insert / update / delete) --------------------------------
drop policy if exists "media: admin insert" on storage.objects;
create policy "media: admin insert"
  on storage.objects for insert
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media: admin update" on storage.objects;
create policy "media: admin update"
  on storage.objects for update
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media: admin delete" on storage.objects;
create policy "media: admin delete"
  on storage.objects for delete
  using (bucket_id = 'media' and public.is_admin());
