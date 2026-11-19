-- Welle 1, Block 2a: profile links and the profile address
--
-- 1. A profile revision gets an Instagram handle and up to five further links
--    next to the existing website (official_url) and public contact.
--    - instagram_handle: the plain handle without "@", at most 30 characters.
--    - extra_links: a JSON array of up to five objects {"url": "https://..."}.
--      The display name is derived from the domain by the application.
--    Any of website, Instagram, a further link or the public contact satisfies
--    the existing gap rule "link_or_contact".
-- 2. The profile address (slug) stays changeable by its owner until the first
--    approval. After that it is fixed (it is part of every shared link).
--
-- Nothing here makes anything public on its own: the new columns follow the
-- same revision, confirmation and publication rules as the existing fields.

-- ---------------------------------------------------------------------------
-- 1. Columns, check, grants
-- ---------------------------------------------------------------------------
create function app_private.profile_links_valid(p_links jsonb)
returns boolean
language sql
immutable
parallel safe
set search_path = pg_catalog
as $$
  select case
    when jsonb_typeof(p_links) <> 'array' then false
    when jsonb_array_length(p_links) > 5 then false
    else not exists (
      select 1
        from jsonb_array_elements(p_links) as e(item)
       where jsonb_typeof(e.item) <> 'object'
          or jsonb_typeof(e.item -> 'url') is distinct from 'string'
          or (e.item ->> 'url') !~ '^https?://[^[:space:]]+$'
          or length(e.item ->> 'url') > 300
          or (select count(*) from jsonb_object_keys(e.item)) <> 1
    )
  end
$$;

-- Only organizers write revisions, so only they evaluate the check.
grant execute on function app_private.profile_links_valid(jsonb)
  to authenticated;

alter table public.profile_revisions
  add column instagram_handle text
    constraint profile_revisions_instagram_format
      check (instagram_handle is null
             or instagram_handle ~ '^[A-Za-z0-9._]{1,30}$'),
  add column extra_links jsonb not null default '[]'::jsonb
    constraint profile_revisions_extra_links_valid
      check (app_private.profile_links_valid(extra_links));

grant select (instagram_handle, extra_links)
  on public.profile_revisions to authenticated, anon;
grant insert (instagram_handle, extra_links)
  on public.profile_revisions to authenticated;
grant update (instagram_handle, extra_links)
  on public.profile_revisions to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Completeness: any link or the public contact is enough
-- ---------------------------------------------------------------------------
create or replace function app_private.profile_gaps(p_revision_id uuid)
returns text[]
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(
    (select array_remove(array[
        case when r.name is null or btrim(r.name) = '' then 'name' end,
        case when r.short_intro is null or btrim(r.short_intro) = ''
             then 'short_intro' end,
        case when r.official_url is null
              and r.instagram_handle is null
              and jsonb_array_length(r.extra_links) = 0
              and (r.public_contact is null or btrim(r.public_contact) = '')
             then 'link_or_contact' end,
        case when mu.id is null or mu.confirmed_at is null
                  or mu.public_object_path is null
             then 'profile_image' end
      ], null)
       from public.profile_revisions r
       left join public.media_uses mu on mu.id = r.profile_image_use_id
      where r.id = p_revision_id),
    array['revision_missing'])
$$;

-- ---------------------------------------------------------------------------
-- 3. Public read surface: the two new columns are appended
-- ---------------------------------------------------------------------------
create or replace view public.public_profiles with (security_invoker = true) as
select p.id,
       p.slug,
       r.name,
       r.short_intro,
       r.official_url,
       r.public_contact,
       mu.public_object_path as profile_image_path,
       r.confirmed_at as published_at,
       r.instagram_handle,
       r.extra_links
  from public.profiles p
  join public.profile_revisions r on r.id = p.published_revision_id
  join public.media_uses mu
    on mu.id = r.profile_image_use_id
   and mu.confirmed_at is not null
   and mu.public_object_path is not null
 where p.publication_state = 'published'
   and p.first_approved_revision_id is not null;

-- ---------------------------------------------------------------------------
-- 4. Change the profile address until the first approval
--
--    Error codes (Postgres custom codes, like DK001 to DK005):
--      DK003  not allowed in this state (not the owner, or already approved)
--      DK006  address does not match the format
--      DK007  address is reserved (system route)
--      DK008  address is already taken
--    The format and the reserved names stay in the constraint
--    profiles_slug_format, the uniqueness in profiles_slug_key. This function
--    only translates their failures into codes the application can show.
-- ---------------------------------------------------------------------------
create function public.change_profile_slug(
  p_profile_id uuid,
  p_slug text
)
returns text
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_uid uuid := auth.uid();
  v_slug text := lower(btrim(p_slug));
  v_first_approved uuid;
  v_state public.publication_state;
begin
  if v_uid is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  select p.first_approved_revision_id, p.publication_state
    into v_first_approved, v_state
    from public.profiles p
   where p.id = p_profile_id and p.owner_id = v_uid
     for update;

  -- Not the owner looks the same as not found: no probing of other profiles.
  if not found or v_first_approved is not null or v_state = 'published' then
    raise exception 'address cannot be changed' using errcode = 'DK003';
  end if;

  if v_slug is null or v_slug !~ '^[a-z0-9](?:[a-z0-9-]{1,38})[a-z0-9]$' then
    raise exception 'invalid address format' using errcode = 'DK006';
  end if;

  if v_slug = (select slug from public.profiles where id = p_profile_id) then
    return v_slug;
  end if;

  begin
    update public.profiles set slug = v_slug where id = p_profile_id;
  exception
    when unique_violation then
      raise exception 'address already taken' using errcode = 'DK008';
    when check_violation then
      -- The format was checked above, so the constraint can only be refusing
      -- a reserved name.
      raise exception 'address is reserved' using errcode = 'DK007';
  end;

  return v_slug;
end;
$$;

revoke all on function public.change_profile_slug(uuid, text)
  from public, anon;
grant execute on function public.change_profile_slug(uuid, text)
  to authenticated;
