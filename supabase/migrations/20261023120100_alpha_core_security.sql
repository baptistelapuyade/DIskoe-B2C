-- DISKOE B2C Alpha core security (Phase 4 / Slice 1, part 2 of 2).
--
-- Grants, row level security, the two public views and the privileged
-- functions. Design source: PLAN.md, "Verbindliche anonyme Lesearchitektur,
-- Grants und RLS" and the adversarial review table.
--
-- Deviations from PLAN.md, all in the stricter direction (see SLICE-1-SUMMARY):
--   * authenticated gets no SELECT on profiles.owner_id / approved_by, so a
--     logged-in visitor cannot read the account ids of published organizers.
--     Policies decide ownership through app_private.owns_profile() instead.
--   * Founders get read access to every table but no direct UPDATE; every
--     founder write goes through a function.
--   * Helper predicates live in the non-exposed schema app_private.
--
-- Clients select explicit columns. `select *` as anon/authenticated fails by
-- design because only named columns are granted.

-- ---------------------------------------------------------------------------
-- 1. Start from zero: remove every inherited table, sequence and function
--    privilege from the client roles, then grant back only what is listed.
-- ---------------------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;
revoke all on all functions in schema app_private from public, anon, authenticated;

grant usage on schema app_private to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Helper predicates (SECURITY DEFINER so policies need no column grants)
-- ---------------------------------------------------------------------------
create function app_private.is_founder()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(
    (select r.is_founder from public.app_roles r where r.user_id = auth.uid()),
    false)
$$;

create function app_private.owns_profile(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.profiles p
     where p.id = p_profile_id and p.owner_id = auth.uid())
$$;

create function app_private.owns_event(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
      from public.events e
      join public.profiles p on p.id = e.organizer_id
     where e.id = p_event_id and p.owner_id = auth.uid())
$$;

grant execute on function app_private.is_founder() to authenticated;
grant execute on function app_private.owns_profile(uuid) to authenticated;
grant execute on function app_private.owns_event(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Completeness gate. Hard minimum only; the detailed, user-facing gap
--    messages stay in the application (Slices 3 and 4). Returns gap codes.
-- ---------------------------------------------------------------------------
create function app_private.profile_gaps(p_revision_id uuid)
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

create function app_private.event_gaps(p_revision_id uuid)
returns text[]
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(
    (select array_remove(array[
        case when r.title_state <> 'provided' then 'title' end,
        case when r.description_state <> 'provided' then 'description' end,
        case when r.format_state <> 'provided' then 'primary_format' end,
        case when r.start_state <> 'provided' then 'start' end,
        case when r.place_state <> 'provided' then 'place' end,
        -- A deliberately confirmed "unknown" price is a valid answer.
        case when r.price_state not in ('provided', 'unknown') then 'price' end,
        case when r.access_state <> 'provided' then 'access' end,
        case when r.atmosphere_state <> 'provided' then 'atmosphere' end,
        case when mu.id is null or mu.confirmed_at is null
                  or mu.public_object_path is null
             then 'event_image' end
      ], null)
       from public.event_revisions r
       left join public.media_uses mu on mu.id = r.event_image_use_id
      where r.id = p_revision_id),
    array['revision_missing'])
$$;

-- ---------------------------------------------------------------------------
-- 4. Media-use confirmation is a one-way, server-stamped act
-- ---------------------------------------------------------------------------
-- The owner flips confirmed_at to a non-null value to confirm this use. The
-- timestamp and the confirming user are stamped here, so a client cannot
-- back-date, impersonate, or take a confirmation back.
create function app_private.stamp_media_use_confirmation()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if old.confirmed_at is not null then
    new.confirmed_at := old.confirmed_at;
    new.confirmed_by := old.confirmed_by;
  elsif new.confirmed_at is not null then
    new.confirmed_at := now();
    new.confirmed_by := auth.uid();
  else
    new.confirmed_by := null;
  end if;
  return new;
end;
$$;

create trigger media_uses_stamp_confirmation
  before update on public.media_uses
  for each row execute function app_private.stamp_media_use_confirmation();

-- ---------------------------------------------------------------------------
-- 5. Row level security
-- ---------------------------------------------------------------------------
alter table public.app_roles enable row level security;
alter table public.profiles enable row level security;
alter table public.profile_revisions enable row level security;
alter table public.events enable row level security;
alter table public.event_revisions enable row level security;
alter table public.media_assets enable row level security;
alter table public.media_uses enable row level security;
alter table public.publication_audit enable row level security;

-- app_roles ------------------------------------------------------------------
create policy app_roles_select_self_or_founder on public.app_roles
  for select to authenticated
  using (user_id = auth.uid() or app_private.is_founder());

-- profiles -------------------------------------------------------------------
-- There is deliberately no INSERT and no DELETE policy: profile shells exist
-- only through provision_profile_owner().
create policy profiles_select_public on public.profiles
  for select to anon, authenticated
  using (publication_state = 'published'
         and first_approved_revision_id is not null);
create policy profiles_select_owner on public.profiles
  for select to authenticated
  using (app_private.owns_profile(id));
create policy profiles_select_founder on public.profiles
  for select to authenticated
  using (app_private.is_founder());
create policy profiles_update_owner on public.profiles
  for update to authenticated
  using (app_private.owns_profile(id))
  with check (app_private.owns_profile(id));

-- profile_revisions ----------------------------------------------------------
create policy profile_revisions_select_public on public.profile_revisions
  for select to anon, authenticated
  using (exists (
    select 1 from public.profiles p
     where p.published_revision_id = profile_revisions.id
       and p.publication_state = 'published'
       and p.first_approved_revision_id is not null));
create policy profile_revisions_select_owner on public.profile_revisions
  for select to authenticated
  using (app_private.owns_profile(profile_id));
create policy profile_revisions_select_founder on public.profile_revisions
  for select to authenticated
  using (app_private.is_founder());
create policy profile_revisions_insert_owner on public.profile_revisions
  for insert to authenticated
  with check (created_by = auth.uid()
              and app_private.owns_profile(profile_id)
              and confirmed_at is null);
-- Editable only while neither confirmed nor first-approved.
create policy profile_revisions_update_owner on public.profile_revisions
  for update to authenticated
  using (app_private.owns_profile(profile_id)
         and confirmed_at is null
         and not exists (
           select 1 from public.profiles p
            where p.id = profile_revisions.profile_id
              and p.first_approved_revision_id = profile_revisions.id))
  with check (app_private.owns_profile(profile_id));

-- events ---------------------------------------------------------------------
create policy events_select_public on public.events
  for select to anon, authenticated
  using (publication_state = 'published'
         and first_approved_revision_id is not null
         and exists (
           select 1 from public.profiles p
            where p.id = events.organizer_id
              and p.publication_state = 'published'
              and p.first_approved_revision_id is not null));
create policy events_select_owner on public.events
  for select to authenticated
  using (app_private.owns_profile(organizer_id));
create policy events_select_founder on public.events
  for select to authenticated
  using (app_private.is_founder());
-- Column grants (organizer_id, slug only) force the safe initial values:
-- private, scheduled, version 0, no revisions, no approval.
create policy events_insert_owner on public.events
  for insert to authenticated
  with check (app_private.owns_profile(organizer_id));
create policy events_update_owner on public.events
  for update to authenticated
  using (app_private.owns_profile(organizer_id))
  with check (app_private.owns_profile(organizer_id));

-- event_revisions ------------------------------------------------------------
create policy event_revisions_select_public on public.event_revisions
  for select to anon, authenticated
  using (exists (
    select 1
      from public.events e
      join public.profiles p on p.id = e.organizer_id
     where e.published_revision_id = event_revisions.id
       and e.publication_state = 'published'
       and e.first_approved_revision_id is not null
       and p.publication_state = 'published'
       and p.first_approved_revision_id is not null));
create policy event_revisions_select_owner on public.event_revisions
  for select to authenticated
  using (app_private.owns_event(event_id));
create policy event_revisions_select_founder on public.event_revisions
  for select to authenticated
  using (app_private.is_founder());
create policy event_revisions_insert_owner on public.event_revisions
  for insert to authenticated
  with check (created_by = auth.uid()
              and app_private.owns_event(event_id)
              and confirmed_at is null);
create policy event_revisions_update_owner on public.event_revisions
  for update to authenticated
  using (app_private.owns_event(event_id)
         and confirmed_at is null
         and not exists (
           select 1 from public.events e
            where e.id = event_revisions.event_id
              and e.first_approved_revision_id = event_revisions.id))
  with check (app_private.owns_event(event_id));

-- media_assets ---------------------------------------------------------------
create policy media_assets_select_uploader on public.media_assets
  for select to authenticated
  using (uploader_id = auth.uid());
create policy media_assets_select_founder on public.media_assets
  for select to authenticated
  using (app_private.is_founder());
create policy media_assets_insert_uploader on public.media_assets
  for insert to authenticated
  with check (uploader_id = auth.uid()
              and starts_with(private_object_path, auth.uid()::text || '/'));
create policy media_assets_update_uploader on public.media_assets
  for update to authenticated
  using (uploader_id = auth.uid()
         and not exists (
           select 1 from public.media_uses u
            where u.asset_id = media_assets.id and u.confirmed_at is not null))
  with check (uploader_id = auth.uid());

-- media_uses -----------------------------------------------------------------
create policy media_uses_select_public on public.media_uses
  for select to anon, authenticated
  using (
    confirmed_at is not null
    and public_object_path is not null
    and (
      exists (
        select 1
          from public.profile_revisions r
          join public.profiles p on p.published_revision_id = r.id
         where r.profile_image_use_id = media_uses.id
           and p.publication_state = 'published'
           and p.first_approved_revision_id is not null)
      or exists (
        select 1
          from public.event_revisions r
          join public.events e on e.published_revision_id = r.id
          join public.profiles op on op.id = e.organizer_id
         where r.event_image_use_id = media_uses.id
           and e.publication_state = 'published'
           and e.first_approved_revision_id is not null
           and op.publication_state = 'published'
           and op.first_approved_revision_id is not null)));
create policy media_uses_select_owner on public.media_uses
  for select to authenticated
  using (app_private.owns_profile(profile_id)
         or app_private.owns_event(event_id));
create policy media_uses_select_founder on public.media_uses
  for select to authenticated
  using (app_private.is_founder());
create policy media_uses_insert_owner on public.media_uses
  for insert to authenticated
  with check (
    (app_private.owns_profile(profile_id) or app_private.owns_event(event_id))
    and exists (
      select 1 from public.media_assets a
       where a.id = asset_id and a.uploader_id = auth.uid()));
-- Editable until a confirmed revision uses it.
create policy media_uses_update_owner on public.media_uses
  for update to authenticated
  using (
    (app_private.owns_profile(profile_id) or app_private.owns_event(event_id))
    and not exists (
      select 1 from public.profile_revisions r
       where r.profile_image_use_id = media_uses.id
         and r.confirmed_at is not null)
    and not exists (
      select 1 from public.event_revisions r
       where r.event_image_use_id = media_uses.id
         and r.confirmed_at is not null))
  with check (
    app_private.owns_profile(profile_id) or app_private.owns_event(event_id));

-- publication_audit ----------------------------------------------------------
create policy publication_audit_select on public.publication_audit
  for select to authenticated
  using ((entity_type = 'profile' and app_private.owns_profile(entity_id))
         or (entity_type = 'event' and app_private.owns_event(entity_id))
         or app_private.is_founder());

-- ---------------------------------------------------------------------------
-- 6. Column grants (named columns only; never table-wide)
-- ---------------------------------------------------------------------------
-- app_roles
grant select (user_id, is_founder) on public.app_roles to authenticated;

-- profiles: no owner_id, no approved_by
grant select (id, kind, slug, draft_revision_id, published_revision_id,
              first_approved_revision_id, approved_at, publication_state,
              created_at, updated_at)
  on public.profiles to authenticated;
grant update (draft_revision_id) on public.profiles to authenticated;
-- anon: exactly what the public views read from the base table
grant select (id, slug, published_revision_id, first_approved_revision_id,
              publication_state)
  on public.profiles to anon;

-- profile_revisions: no created_by, no confirmed_by
grant select (id, profile_id, revision_no, name, short_intro, official_url,
              public_contact, profile_image_use_id, confirmed_at, created_at)
  on public.profile_revisions to authenticated;
grant insert (profile_id, name, short_intro, official_url, public_contact,
              profile_image_use_id, created_by)
  on public.profile_revisions to authenticated;
grant update (name, short_intro, official_url, public_contact,
              profile_image_use_id)
  on public.profile_revisions to authenticated;
grant select (id, name, short_intro, official_url, public_contact,
              profile_image_use_id, confirmed_at)
  on public.profile_revisions to anon;

-- events: no approved_by, no cancelled_by
grant select (id, organizer_id, slug, draft_revision_id, published_revision_id,
              first_approved_revision_id, approved_at, publication_state,
              public_status, state_version, cancelled_at, created_at,
              updated_at)
  on public.events to authenticated;
grant insert (organizer_id, slug) on public.events to authenticated;
grant update (draft_revision_id) on public.events to authenticated;
grant select (id, slug, organizer_id, published_revision_id,
              first_approved_revision_id, publication_state, public_status)
  on public.events to anon;

-- event_revisions
grant select (id, event_id, revision_no, title_state, title, description_state,
              description, format_state, primary_format, start_state, start_at,
              timezone, end_state, end_at, place_state, place_name,
              address_line, postal_code, city, country_code, price_state,
              price_model, price_amount_minor, currency, access_state,
              access_routes, atmosphere_state, atmosphere_tags,
              atmosphere_description, event_image_use_id, confirmed_at,
              created_at)
  on public.event_revisions to authenticated;
grant insert (event_id, title_state, title, description_state, description,
              format_state, primary_format, start_state, start_at, timezone,
              end_state, end_at, place_state, place_name, address_line,
              postal_code, city, country_code, price_state, price_model,
              price_amount_minor, currency, access_state, access_routes,
              atmosphere_state, atmosphere_tags, atmosphere_description,
              event_image_use_id, created_by)
  on public.event_revisions to authenticated;
grant update (title_state, title, description_state, description,
              format_state, primary_format, start_state, start_at, timezone,
              end_state, end_at, place_state, place_name, address_line,
              postal_code, city, country_code, price_state, price_model,
              price_amount_minor, currency, access_state, access_routes,
              atmosphere_state, atmosphere_tags, atmosphere_description,
              event_image_use_id)
  on public.event_revisions to authenticated;
grant select (id, title, description, primary_format, start_at, timezone,
              end_state, end_at, place_name, address_line, postal_code, city,
              country_code, price_state, price_model, price_amount_minor,
              currency, access_routes, atmosphere_tags,
              atmosphere_description, event_image_use_id, confirmed_at)
  on public.event_revisions to anon;

-- media_assets: owner only, never anon
grant select (id, uploader_id, private_object_path, mime_type, created_at)
  on public.media_assets to authenticated;
grant insert (uploader_id, private_object_path, mime_type)
  on public.media_assets to authenticated;
grant update (mime_type) on public.media_assets to authenticated;

-- media_uses: public_object_path and confirmed_by are never client-written
grant select (id, asset_id, profile_id, event_id, role, public_object_path,
              alt_text, crop, confirmed_at)
  on public.media_uses to authenticated;
grant insert (asset_id, profile_id, event_id, role, alt_text, crop)
  on public.media_uses to authenticated;
grant update (alt_text, crop, confirmed_at, confirmed_by)
  on public.media_uses to authenticated;
grant select (id, public_object_path, confirmed_at)
  on public.media_uses to anon;

-- publication_audit: no actor_id for clients; no writes
grant select (id, entity_type, entity_id, revision_id, action, created_at)
  on public.publication_audit to authenticated;

-- ---------------------------------------------------------------------------
-- 7. Public read surface: two narrow security_invoker views
-- ---------------------------------------------------------------------------
create view public.public_profiles with (security_invoker = true) as
select p.id,
       p.slug,
       r.name,
       r.short_intro,
       r.official_url,
       r.public_contact,
       mu.public_object_path as profile_image_path,
       r.confirmed_at as published_at
  from public.profiles p
  join public.profile_revisions r on r.id = p.published_revision_id
  join public.media_uses mu
    on mu.id = r.profile_image_use_id
   and mu.confirmed_at is not null
   and mu.public_object_path is not null
 where p.publication_state = 'published'
   and p.first_approved_revision_id is not null;

create view public.public_events with (security_invoker = true) as
select e.id,
       e.slug,
       e.organizer_id,
       e.public_status,
       r.title,
       r.description,
       r.primary_format,
       r.start_at,
       r.timezone,
       r.end_state,
       r.end_at,
       r.place_name,
       r.address_line,
       r.postal_code,
       r.city,
       r.country_code,
       r.price_state,
       r.price_model,
       r.price_amount_minor,
       r.currency,
       r.access_routes,
       r.atmosphere_tags,
       r.atmosphere_description,
       mu.public_object_path as event_image_path,
       r.confirmed_at as published_at
  from public.events e
  join public.profiles p on p.id = e.organizer_id
  join public.event_revisions r on r.id = e.published_revision_id
  join public.media_uses mu
    on mu.id = r.event_image_use_id
   and mu.confirmed_at is not null
   and mu.public_object_path is not null
 where e.publication_state = 'published'
   and e.first_approved_revision_id is not null
   and p.publication_state = 'published'
   and p.first_approved_revision_id is not null;

grant select on public.public_profiles, public.public_events
  to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 8. Privileged functions: the only write paths for provisioning, approval,
--    publication and status changes. All are SECURITY DEFINER with a fixed
--    search_path, read auth.uid() once, never accept an actor from the
--    client, lock the target row, and write the audit row atomically.
--
--    SQLSTATEs used (class DK is application specific):
--      28000  not authenticated
--      42501  not allowed (wrong role, not the owner, self-approval)
--      P0002  target not found
--      DK001  stale expectation (revision, version or status moved)
--      DK002  revision incomplete (DETAIL lists the gap codes)
--      DK003  invalid state for this action
--      DK005  unknown target user
-- ---------------------------------------------------------------------------

create function public.provision_profile_owner(
  target_user_id uuid,
  target_slug text,
  target_name text default null
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_uid uuid := auth.uid();
  v_profile_id uuid;
  v_revision_id uuid;
begin
  if v_uid is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if not app_private.is_founder() then
    raise exception 'only a founder may provision profiles'
      using errcode = '42501';
  end if;
  if not exists (select 1 from auth.users u where u.id = target_user_id) then
    raise exception 'unknown target user' using errcode = 'DK005';
  end if;

  -- Slug rules (format, reserved names, uniqueness) are enforced by the
  -- constraints on public.profiles.
  insert into public.profiles (owner_id, slug)
  values (target_user_id, lower(btrim(target_slug)))
  returning id into v_profile_id;

  -- An optional pre-agreed name only seeds the private draft. It is never
  -- confirmed and never public on its own.
  insert into public.profile_revisions (profile_id, name, created_by)
  values (v_profile_id, nullif(btrim(target_name), ''), v_uid)
  returning id into v_revision_id;

  update public.profiles
     set draft_revision_id = v_revision_id
   where id = v_profile_id;

  insert into public.publication_audit
    (actor_id, entity_type, entity_id, revision_id, action)
  values (v_uid, 'profile', v_profile_id, v_revision_id, 'provision_owner');

  return v_profile_id;
end;
$$;

create function public.approve_first_profile(
  p_profile_id uuid,
  p_expected_draft_revision_id uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_uid uuid := auth.uid();
  v_profile public.profiles;
  v_gaps text[];
begin
  if v_uid is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if not app_private.is_founder() then
    raise exception 'only a founder may approve' using errcode = '42501';
  end if;

  select * into v_profile from public.profiles
   where id = p_profile_id for update;
  if not found then
    raise exception 'profile not found' using errcode = 'P0002';
  end if;
  if v_profile.owner_id = v_uid then
    raise exception 'self-approval is not allowed' using errcode = '42501';
  end if;
  if v_profile.first_approved_revision_id is not null then
    raise exception 'profile already has a first approval'
      using errcode = 'DK003';
  end if;
  if v_profile.draft_revision_id is distinct from p_expected_draft_revision_id then
    raise exception 'draft revision changed since it was reviewed'
      using errcode = 'DK001';
  end if;

  v_gaps := app_private.profile_gaps(p_expected_draft_revision_id);
  if cardinality(v_gaps) > 0 then
    raise exception 'revision is incomplete'
      using errcode = 'DK002', detail = array_to_string(v_gaps, ',');
  end if;

  update public.profiles
     set first_approved_revision_id = p_expected_draft_revision_id,
         approved_by = v_uid,
         approved_at = now()
   where id = p_profile_id;

  insert into public.publication_audit
    (actor_id, entity_type, entity_id, revision_id, action)
  values (v_uid, 'profile', p_profile_id, p_expected_draft_revision_id,
          'approve_first');
end;
$$;

create function public.approve_first_event(
  p_event_id uuid,
  p_expected_draft_revision_id uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_uid uuid := auth.uid();
  v_event public.events;
  v_owner uuid;
  v_gaps text[];
begin
  if v_uid is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if not app_private.is_founder() then
    raise exception 'only a founder may approve' using errcode = '42501';
  end if;

  select * into v_event from public.events
   where id = p_event_id for update;
  if not found then
    raise exception 'event not found' using errcode = 'P0002';
  end if;
  select p.owner_id into v_owner from public.profiles p
   where p.id = v_event.organizer_id;
  if v_owner = v_uid then
    raise exception 'self-approval is not allowed' using errcode = '42501';
  end if;
  if v_event.first_approved_revision_id is not null then
    raise exception 'event already has a first approval'
      using errcode = 'DK003';
  end if;
  if v_event.draft_revision_id is distinct from p_expected_draft_revision_id then
    raise exception 'draft revision changed since it was reviewed'
      using errcode = 'DK001';
  end if;

  v_gaps := app_private.event_gaps(p_expected_draft_revision_id);
  if cardinality(v_gaps) > 0 then
    raise exception 'revision is incomplete'
      using errcode = 'DK002', detail = array_to_string(v_gaps, ',');
  end if;

  update public.events
     set first_approved_revision_id = p_expected_draft_revision_id,
         approved_by = v_uid,
         approved_at = now()
   where id = p_event_id;

  insert into public.publication_audit
    (actor_id, entity_type, entity_id, revision_id, action)
  values (v_uid, 'event', p_event_id, p_expected_draft_revision_id,
          'approve_first');
end;
$$;

create function public.publish_profile(
  p_profile_id uuid,
  p_expected_draft_revision_id uuid,
  p_expected_published_revision_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_uid uuid := auth.uid();
  v_profile public.profiles;
  v_gaps text[];
begin
  if v_uid is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  select * into v_profile from public.profiles
   where id = p_profile_id for update;
  -- Not found and not owned look identical on purpose.
  if not found or v_profile.owner_id <> v_uid then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if v_profile.first_approved_revision_id is null then
    raise exception 'first approval is missing' using errcode = 'DK003';
  end if;
  if v_profile.publication_state = 'withdrawn' then
    raise exception 'profile is withdrawn' using errcode = 'DK003';
  end if;
  if v_profile.draft_revision_id is distinct from p_expected_draft_revision_id
     or v_profile.published_revision_id
        is distinct from p_expected_published_revision_id then
    raise exception 'profile changed since the preview'
      using errcode = 'DK001';
  end if;
  if v_profile.published_revision_id = p_expected_draft_revision_id then
    raise exception 'nothing new to publish' using errcode = 'DK003';
  end if;
  -- First publication: only the revision the founder approved.
  if v_profile.published_revision_id is null
     and v_profile.first_approved_revision_id
         is distinct from p_expected_draft_revision_id then
    raise exception 'draft differs from the approved revision'
      using errcode = 'DK001';
  end if;

  v_gaps := app_private.profile_gaps(p_expected_draft_revision_id);
  if cardinality(v_gaps) > 0 then
    raise exception 'revision is incomplete'
      using errcode = 'DK002', detail = array_to_string(v_gaps, ',');
  end if;

  -- Publishing is the owner's explicit confirmation of this revision.
  update public.profile_revisions
     set confirmed_at = now(), confirmed_by = v_uid
   where id = p_expected_draft_revision_id;

  update public.profiles
     set published_revision_id = p_expected_draft_revision_id,
         publication_state = 'published'
   where id = p_profile_id;

  insert into public.publication_audit
    (actor_id, entity_type, entity_id, revision_id, action)
  values (v_uid, 'profile', p_profile_id, p_expected_draft_revision_id,
          'publish');
end;
$$;

create function public.publish_event(
  p_event_id uuid,
  p_expected_draft_revision_id uuid,
  p_expected_published_revision_id uuid,
  p_expected_state_version bigint,
  p_expected_status public.event_status
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_uid uuid := auth.uid();
  v_event public.events;
  v_owner uuid;
  v_gaps text[];
begin
  if v_uid is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  select * into v_event from public.events
   where id = p_event_id for update;
  if found then
    select p.owner_id into v_owner from public.profiles p
     where p.id = v_event.organizer_id;
  end if;
  if not found or v_owner <> v_uid then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if v_event.first_approved_revision_id is null then
    raise exception 'first approval is missing' using errcode = 'DK003';
  end if;
  if v_event.publication_state = 'withdrawn'
     or v_event.public_status = 'cancelled' then
    -- Re-activating a cancelled event is not part of the Durchstich.
    raise exception 'event is cancelled or withdrawn' using errcode = 'DK003';
  end if;
  if v_event.state_version <> p_expected_state_version
     or v_event.public_status <> p_expected_status
     or v_event.draft_revision_id is distinct from p_expected_draft_revision_id
     or v_event.published_revision_id
        is distinct from p_expected_published_revision_id then
    raise exception 'event changed since the preview' using errcode = 'DK001';
  end if;
  if v_event.published_revision_id = p_expected_draft_revision_id then
    raise exception 'nothing new to publish' using errcode = 'DK003';
  end if;
  if v_event.published_revision_id is null
     and v_event.first_approved_revision_id
         is distinct from p_expected_draft_revision_id then
    raise exception 'draft differs from the approved revision'
      using errcode = 'DK001';
  end if;

  v_gaps := app_private.event_gaps(p_expected_draft_revision_id);
  if cardinality(v_gaps) > 0 then
    raise exception 'revision is incomplete'
      using errcode = 'DK002', detail = array_to_string(v_gaps, ',');
  end if;

  update public.event_revisions
     set confirmed_at = now(), confirmed_by = v_uid
   where id = p_expected_draft_revision_id;

  update public.events
     set published_revision_id = p_expected_draft_revision_id,
         publication_state = 'published',
         state_version = state_version + 1
   where id = p_event_id;

  insert into public.publication_audit
    (actor_id, entity_type, entity_id, revision_id, action)
  values (v_uid, 'event', p_event_id, p_expected_draft_revision_id, 'publish');
end;
$$;

-- Publishes a draft whose start time differs from the live one and marks the
-- event as rescheduled. Same locking and expectation rules as publish_event.
create function public.reschedule_event(
  p_event_id uuid,
  p_expected_draft_revision_id uuid,
  p_expected_published_revision_id uuid,
  p_expected_state_version bigint,
  p_expected_status public.event_status
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_uid uuid := auth.uid();
  v_event public.events;
  v_owner uuid;
  v_old_start timestamptz;
  v_new_start timestamptz;
  v_gaps text[];
begin
  if v_uid is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  select * into v_event from public.events
   where id = p_event_id for update;
  if found then
    select p.owner_id into v_owner from public.profiles p
     where p.id = v_event.organizer_id;
  end if;
  if not found or v_owner <> v_uid then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if v_event.publication_state <> 'published'
     or v_event.published_revision_id is null
     or v_event.public_status not in ('scheduled', 'rescheduled') then
    raise exception 'only a live, non-cancelled event can be rescheduled'
      using errcode = 'DK003';
  end if;
  if v_event.state_version <> p_expected_state_version
     or v_event.public_status <> p_expected_status
     or v_event.draft_revision_id is distinct from p_expected_draft_revision_id
     or v_event.published_revision_id
        is distinct from p_expected_published_revision_id then
    raise exception 'event changed since the preview' using errcode = 'DK001';
  end if;

  select r.start_at into v_old_start from public.event_revisions r
   where r.id = v_event.published_revision_id;
  select r.start_at into v_new_start from public.event_revisions r
   where r.id = p_expected_draft_revision_id;
  if v_new_start is not distinct from v_old_start then
    raise exception 'the draft does not change the start time'
      using errcode = 'DK003';
  end if;

  v_gaps := app_private.event_gaps(p_expected_draft_revision_id);
  if cardinality(v_gaps) > 0 then
    raise exception 'revision is incomplete'
      using errcode = 'DK002', detail = array_to_string(v_gaps, ',');
  end if;

  update public.event_revisions
     set confirmed_at = now(), confirmed_by = v_uid
   where id = p_expected_draft_revision_id;

  update public.events
     set published_revision_id = p_expected_draft_revision_id,
         public_status = 'rescheduled',
         state_version = state_version + 1
   where id = p_event_id;

  insert into public.publication_audit
    (actor_id, entity_type, entity_id, revision_id, action)
  values (v_uid, 'event', p_event_id, p_expected_draft_revision_id,
          'reschedule');
end;
$$;

-- Status only. It never touches published_revision_id, so a cancellation can
-- not publish a private draft (v0.3 P23).
create function public.cancel_event(
  p_event_id uuid,
  p_expected_published_revision_id uuid,
  p_expected_state_version bigint,
  p_expected_status public.event_status
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_uid uuid := auth.uid();
  v_event public.events;
  v_owner uuid;
begin
  if v_uid is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  select * into v_event from public.events
   where id = p_event_id for update;
  if found then
    select p.owner_id into v_owner from public.profiles p
     where p.id = v_event.organizer_id;
  end if;
  if not found or v_owner <> v_uid then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if v_event.publication_state <> 'published'
     or v_event.public_status = 'cancelled' then
    raise exception 'only a live, non-cancelled event can be cancelled'
      using errcode = 'DK003';
  end if;
  if v_event.state_version <> p_expected_state_version
     or v_event.public_status <> p_expected_status
     or v_event.published_revision_id
        is distinct from p_expected_published_revision_id then
    raise exception 'event changed since the preview' using errcode = 'DK001';
  end if;

  update public.events
     set public_status = 'cancelled',
         cancelled_at = now(),
         cancelled_by = v_uid,
         state_version = state_version + 1
   where id = p_event_id;

  insert into public.publication_audit
    (actor_id, entity_type, entity_id, revision_id, action)
  values (v_uid, 'event', p_event_id, v_event.published_revision_id, 'cancel');
end;
$$;

revoke all on function
  public.provision_profile_owner(uuid, text, text),
  public.approve_first_profile(uuid, uuid),
  public.approve_first_event(uuid, uuid),
  public.publish_profile(uuid, uuid, uuid),
  public.publish_event(uuid, uuid, uuid, bigint, public.event_status),
  public.reschedule_event(uuid, uuid, uuid, bigint, public.event_status),
  public.cancel_event(uuid, uuid, bigint, public.event_status)
  from public, anon, authenticated;

-- Each function checks its caller itself; EXECUTE for authenticated only lets
-- a logged-in user reach those checks.
grant execute on function
  public.provision_profile_owner(uuid, text, text),
  public.approve_first_profile(uuid, uuid),
  public.approve_first_event(uuid, uuid),
  public.publish_profile(uuid, uuid, uuid),
  public.publish_event(uuid, uuid, uuid, bigint, public.event_status),
  public.reschedule_event(uuid, uuid, uuid, bigint, public.event_status),
  public.cancel_event(uuid, uuid, bigint, public.event_status)
  to authenticated;
