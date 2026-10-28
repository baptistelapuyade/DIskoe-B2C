-- DISKOE B2C Alpha, Slice 4: the reserved public path of a confirmed event
-- image.
--
-- Until now only profile images got a reserved public path when the owner
-- confirmed the use. app_private.event_gaps() asks for a non-null
-- public_object_path, so an event image could never count as complete.
--
-- This migration adds the event branch to the confirmation trigger, nothing
-- else:
--   * Confirming an event image needs alt text, like a profile image.
--   * The database reserves events/<event id>/<use id>.<ext>. It is a path, not
--     a file: the file only exists in public-media after publication (Slice 5,
--     which also adds the storage policy for this path). The existing
--     public-media insert policy still knows profile images only, so an event
--     image cannot reach the public bucket through this migration.
--   * The profile branch is unchanged.

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

    if new.role in ('profile_image', 'event_image') then
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
