-- DISKOE B2C Alpha, Slice 3a: storage buckets, storage policies and the
-- reserved public path of a confirmed profile image.
--
-- Design (see .planning/phases/04-durchstich/SLICE-3-SUMMARY.md):
--   * private-media: originals. The uploader (and the founder, read-only) can
--     reach an object only below their own "<user id>/" prefix. Never public.
--   * public-media: published images only. Everyone can read. An object can be
--     written only at the exact path that the *published* revision of a profile
--     owned by the caller reserves in media_uses.public_object_path. So an
--     unpublished draft image can never become public, and nobody needs a
--     service-role key in the app for the copy step.
--   * The reserved path is assigned by the database when the owner confirms the
--     image use, together with the mandatory alt text. It is a path, not a file:
--     profile_gaps() sees a complete image, while the file only exists in
--     public-media after publish_profile() succeeded.
--   * No UPDATE and no DELETE policy on storage.objects: objects are immutable
--     for clients. Replacing or removing media is a later, explicit step.

-- ---------------------------------------------------------------------------
-- 1. Only image types we can serve
-- ---------------------------------------------------------------------------
alter table public.media_assets
  add constraint media_assets_mime_allowed
    check (mime_type in ('image/jpeg', 'image/png', 'image/webp'));

-- ---------------------------------------------------------------------------
-- 2. Confirmation: alt text is mandatory, the public path is reserved
--    (profile images only; event images follow in Slice 4/5).
-- ---------------------------------------------------------------------------
create or replace function app_private.stamp_media_use_confirmation()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_mime text;
  v_ext text;
begin
  if old.confirmed_at is not null then
    new.confirmed_at := old.confirmed_at;
    new.confirmed_by := old.confirmed_by;
  elsif new.confirmed_at is not null then
    new.confirmed_at := now();
    new.confirmed_by := auth.uid();

    if new.role = 'profile_image' then
      if new.alt_text is null or btrim(new.alt_text) = '' then
        raise exception 'alt text is required to confirm an image'
          using errcode = '23514';
      end if;

      select a.mime_type into v_mime
        from public.media_assets a where a.id = new.asset_id;
      v_ext := case v_mime
                 when 'image/jpeg' then 'jpg'
                 when 'image/png'  then 'png'
                 when 'image/webp' then 'webp'
               end;

      new.public_object_path :=
        'profiles/' || new.profile_id || '/' || new.id || '.' || v_ext;
    end if;
  else
    new.confirmed_by := null;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. May the caller write this path into the public bucket?
-- ---------------------------------------------------------------------------
create function app_private.is_publishable_media_path(p_path text)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
      from public.media_uses mu
      join public.profile_revisions r on r.profile_image_use_id = mu.id
      join public.profiles p
        on p.published_revision_id = r.id and p.id = mu.profile_id
     where mu.public_object_path = p_path
       and mu.confirmed_at is not null
       and p.publication_state = 'published'
       and p.owner_id = auth.uid())
$$;

revoke all on function app_private.is_publishable_media_path(text)
  from public, anon;
grant execute on function app_private.is_publishable_media_path(text)
  to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Buckets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('private-media', 'private-media', false, 5242880,
   array['image/jpeg', 'image/png', 'image/webp']),
  ('public-media', 'public-media', true, 5242880,
   array['image/jpeg', 'image/png', 'image/webp']);

-- ---------------------------------------------------------------------------
-- 5. Policies on storage.objects (RLS is already enabled by Supabase)
-- ---------------------------------------------------------------------------
create policy private_media_insert_own on storage.objects
  for insert to authenticated
  with check (bucket_id = 'private-media'
              and starts_with(name, auth.uid()::text || '/'));

create policy private_media_select on storage.objects
  for select to authenticated
  using (bucket_id = 'private-media'
         and (starts_with(name, auth.uid()::text || '/')
              or app_private.is_founder()));

create policy public_media_select on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'public-media');

create policy public_media_insert_published_profile_image on storage.objects
  for insert to authenticated
  with check (bucket_id = 'public-media'
              and app_private.is_publishable_media_path(name));
