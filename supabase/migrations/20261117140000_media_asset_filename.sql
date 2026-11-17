-- The original file name of an upload, shown to the uploader in the profile
-- picture step ("profilbild.jpg", Figma ORG-05c). Private like the asset itself:
-- media_assets is readable by the uploader and the founder only. Nullable,
-- because older uploads and event images do not carry it.
alter table public.media_assets
  add column if not exists original_filename text
  check (original_filename is null or char_length(original_filename) between 1 and 120);

grant select (original_filename) on public.media_assets to authenticated;
grant insert (original_filename) on public.media_assets to authenticated;
