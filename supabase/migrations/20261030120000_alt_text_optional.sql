-- DISKOE B2C Alpha, Slice 5: the image description (alt text) is optional.
--
-- Founder decision (30.10.2026): an image without a description counts as
-- pure decoration. Confirming a profile or event image no longer needs alt
-- text. An empty or blank description is stored as NULL, so "no description"
-- has exactly one representation.
--
-- Everything else in the function is unchanged from
-- 20261028180000_event_image_path.sql: the confirmation stamp, the immutable
-- confirmation and the reserved public path.

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
  new.alt_text := nullif(btrim(new.alt_text), '');

  if old.confirmed_at is not null then
    new.confirmed_at := old.confirmed_at;
    new.confirmed_by := old.confirmed_by;
  elsif new.confirmed_at is not null then
    new.confirmed_at := now();
    new.confirmed_by := auth.uid();

    if new.role in ('profile_image', 'event_image') then
      select a.mime_type into v_mime
        from public.media_assets a where a.id = new.asset_id;
      v_ext := case v_mime
                 when 'image/jpeg' then 'jpg'
                 when 'image/png'  then 'png'
                 when 'image/webp' then 'webp'
               end;

      new.public_object_path :=
        case new.role
          when 'profile_image' then
            'profiles/' || new.profile_id || '/' || new.id || '.' || v_ext
          else
            'events/' || new.event_id || '/' || new.id || '.' || v_ext
        end;
    end if;
  else
    new.confirmed_by := null;
  end if;
  return new;
end;
$$;
