-- DISKOE B2C Alpha, Slice 11: removing the files of a discarded draft.
--
-- Until now objects in storage were immutable for clients (no UPDATE and no
-- DELETE policy). Discarding an event draft deletes the database rows of its
-- images (discard_event_draft) and the application then removes the files.
-- The policy is as narrow as it can be:
--   * only the private bucket, only below the caller's own "<user id>/" prefix;
--   * only a file that no image use refers to any more. An original that a
--     profile or an event still uses (published or draft) cannot be deleted.
-- Public copies (public-media) stay immutable.

create function app_private.private_media_unreferenced(p_path text)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select not exists (
    select 1
      from public.media_assets a
      join public.media_uses u on u.asset_id = a.id
     where a.private_object_path = p_path
  );
$$;

revoke all on function app_private.private_media_unreferenced(text)
  from public, anon;
grant execute on function app_private.private_media_unreferenced(text)
  to authenticated;

create policy private_media_delete_unreferenced on storage.objects
  for delete to authenticated
  using (bucket_id = 'private-media'
         and starts_with(name, auth.uid()::text || '/')
         and app_private.private_media_unreferenced(name));
