-- DISKOE B2C Alpha core schema (Phase 4 / Slice 1, part 1 of 2).
--
-- Source of truth: .planning/phases/04-durchstich/PLAN.md, section
-- "SQL-Datenmodell und Zugriffsentwurf". Field names follow the data contract
-- v0.3 and are TECHNICAL PROPOSALS: the contract is not signed off. Only the
-- fields of the Durchstich are modelled here.
--
-- Part 2 (20261023120100_alpha_core_security.sql) adds grants, RLS, views and
-- the privileged functions. Nothing in this file grants access to anyone.

-- ---------------------------------------------------------------------------
-- Privilege hygiene first: nothing created below may inherit broad grants.
-- Supabase grants new tables/sequences/functions in "public" to anon and
-- authenticated by default. We turn that off for everything created by the
-- migration role from here on, and the security migration revokes explicitly
-- as well.
-- ---------------------------------------------------------------------------
alter default privileges in schema public
  revoke all on tables from anon, authenticated;
alter default privileges in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges in schema public
  revoke all on functions from anon, authenticated;
alter default privileges
  revoke execute on functions from public;

-- Internal schema: not listed in supabase/config.toml [api].schemas, so
-- PostgREST never exposes anything in it.
create schema if not exists app_private;
revoke all on schema app_private from public;

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.answer_state as enum
  ('provided', 'unknown', 'not_applicable', 'skipped', 'unanswered');
create type public.profile_kind as enum ('veranstalter');
create type public.publication_state as enum
  ('private', 'published', 'withdrawn');
create type public.event_status as enum
  ('scheduled', 'rescheduled', 'postponed_undated', 'cancelled');
create type public.primary_format as enum
  ('concert', 'dj_set', 'club_night', 'listening_session', 'opening',
   'exhibition', 'screening');
create type public.price_model as enum ('free', 'fixed', 'unknown');
create type public.access_kind as enum
  ('walk_in', 'door', 'online_ticket', 'online_registration');
create type public.media_role as enum ('profile_image', 'event_image');

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------
-- Founder flag. Never derived from e-mail or client claims. Set once per
-- Supabase project by an administrator (see docs/runbooks/founder-bootstrap.md).
create table public.app_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  is_founder boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Profiles and their revisions
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  kind public.profile_kind not null default 'veranstalter',
  owner_id uuid not null references auth.users (id),
  slug text not null,
  draft_revision_id uuid,
  published_revision_id uuid,
  first_approved_revision_id uuid,
  approved_by uuid references auth.users (id),
  approved_at timestamptz,
  publication_state public.publication_state not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_slug_key unique (slug),
  -- Top-level URL segment: ASCII only, 3-40 characters. The reserved list
  -- mirrors PLAN.md (system routes). Entries that the character set already
  -- rules out (_next, .well-known, sitemap.xml, ...) are not repeated.
  -- Keep in sync with the application constant added in Slice 3.
  constraint profiles_slug_format check (
    slug ~ '^[a-z0-9](?:[a-z0-9-]{1,38})[a-z0-9]$'
    and slug <> all (array[
      'e', 'organizer', 'internal', 'login', 'auth', 'api', 'impressum',
      'datenschutz', 'agb', 'hilfe', 'support', 'admin', 'www'
    ])
  ),
  -- The three approval fields are all NULL or all set.
  constraint profiles_approval_together check (
    (first_approved_revision_id is null and approved_by is null
       and approved_at is null)
    or (first_approved_revision_id is not null and approved_by is not null
       and approved_at is not null)
  ),
  constraint profiles_published_needs_revision check (
    publication_state <> 'published'
    or (published_revision_id is not null
        and first_approved_revision_id is not null)
  )
);

create table public.profile_revisions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  revision_no integer not null,
  name text,
  short_intro text,
  official_url text,
  public_contact text,
  profile_image_use_id uuid,
  confirmed_at timestamptz,
  confirmed_by uuid references auth.users (id),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  constraint profile_revisions_no_key unique (profile_id, revision_no),
  -- Target of the composite foreign keys that bind a revision to its owner.
  constraint profile_revisions_id_profile_key unique (id, profile_id),
  constraint profile_revisions_url_format check (
    official_url is null or official_url ~ '^https?://[^[:space:]]+$'
  ),
  constraint profile_revisions_confirmed_together check (
    (confirmed_at is null) = (confirmed_by is null)
  )
);

-- Cyclic references, added after both tables exist. The composite keys make
-- the database itself reject a revision that belongs to another profile.
alter table public.profiles
  add constraint profiles_draft_revision_fk
    foreign key (draft_revision_id, id)
    references public.profile_revisions (id, profile_id),
  add constraint profiles_published_revision_fk
    foreign key (published_revision_id, id)
    references public.profile_revisions (id, profile_id),
  add constraint profiles_first_approved_revision_fk
    foreign key (first_approved_revision_id, id)
    references public.profile_revisions (id, profile_id);

-- ---------------------------------------------------------------------------
-- Events and their revisions
-- ---------------------------------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.profiles (id),
  slug text not null,
  draft_revision_id uuid,
  published_revision_id uuid,
  first_approved_revision_id uuid,
  approved_by uuid references auth.users (id),
  approved_at timestamptz,
  publication_state public.publication_state not null default 'private',
  public_status public.event_status not null default 'scheduled',
  state_version bigint not null default 0,
  cancelled_at timestamptz,
  cancelled_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_slug_key unique (slug),
  constraint events_slug_format check (
    slug ~ '^[a-z0-9](?:[a-z0-9-]{1,78})[a-z0-9]$'
  ),
  constraint events_approval_together check (
    (first_approved_revision_id is null and approved_by is null
       and approved_at is null)
    or (first_approved_revision_id is not null and approved_by is not null
       and approved_at is not null)
  ),
  constraint events_published_needs_revision check (
    publication_state <> 'published'
    or (published_revision_id is not null
        and first_approved_revision_id is not null)
  ),
  constraint events_cancelled_consistent check (
    (public_status = 'cancelled') = (cancelled_at is not null)
    and (cancelled_at is null) = (cancelled_by is null)
  )
);

-- Answer-state rules (AGENTS.md "Antwortzustände"):
--   * state = 'provided'   -> the value columns hold a type-valid, non-blank
--                             value
--   * every other state    -> the value columns are NULL (or empty for
--                             arrays/jsonb). Unknown is never 0, false or ''.
-- Price: 'unknown' has exactly one representation, price_state = 'unknown'
-- together with price_model = 'unknown'. It can never turn into free or 0.
create table public.event_revisions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  revision_no integer not null,
  title_state public.answer_state not null default 'unanswered',
  title text,
  description_state public.answer_state not null default 'unanswered',
  description text,
  format_state public.answer_state not null default 'unanswered',
  primary_format public.primary_format,
  start_state public.answer_state not null default 'unanswered',
  start_at timestamptz,
  timezone text not null default 'Europe/Berlin',
  end_state public.answer_state not null default 'unanswered',
  end_at timestamptz,
  place_state public.answer_state not null default 'unanswered',
  place_name text,
  address_line text,
  postal_code text,
  city text,
  country_code text default 'DE',
  price_state public.answer_state not null default 'unanswered',
  price_model public.price_model,
  price_amount_minor integer,
  currency char(3) default 'EUR',
  access_state public.answer_state not null default 'unanswered',
  access_routes jsonb not null default '[]'::jsonb,
  atmosphere_state public.answer_state not null default 'unanswered',
  atmosphere_tags text[] not null default '{}',
  atmosphere_description text,
  event_image_use_id uuid,
  confirmed_at timestamptz,
  confirmed_by uuid references auth.users (id),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  constraint event_revisions_no_key unique (event_id, revision_no),
  constraint event_revisions_id_event_key unique (id, event_id),
  constraint event_revisions_timezone check (timezone = 'Europe/Berlin'),
  constraint event_revisions_end_after_start check (
    end_at is null or start_at is null or end_at > start_at
  ),
  constraint event_revisions_price_amount check (
    price_amount_minor is null or price_amount_minor >= 0
  ),
  constraint event_revisions_atmosphere_max check (
    cardinality(atmosphere_tags) <= 3
  ),
  constraint event_revisions_confirmed_together check (
    (confirmed_at is null) = (confirmed_by is null)
  ),
  constraint event_revisions_country check (
    country_code is null or country_code ~ '^[A-Z]{2}$'
  ),

  constraint event_revisions_title_state check (
    case when title_state = 'provided'
      then title is not null and btrim(title) <> ''
      else title is null end
  ),
  constraint event_revisions_description_state check (
    case when description_state = 'provided'
      then description is not null and btrim(description) <> ''
      else description is null end
  ),
  constraint event_revisions_format_state check (
    (format_state = 'provided') = (primary_format is not null)
  ),
  constraint event_revisions_start_state check (
    (start_state = 'provided') = (start_at is not null)
  ),
  constraint event_revisions_end_state check (
    (end_state = 'provided') = (end_at is not null)
  ),
  constraint event_revisions_place_state check (
    case when place_state = 'provided'
      then place_name is not null and btrim(place_name) <> ''
        and address_line is not null and btrim(address_line) <> ''
      else place_name is null and address_line is null
        and postal_code is null and city is null end
  ),
  -- A CHECK that evaluates to NULL passes, so every branch is coalesced to
  -- false: a NULL price_model must fail 'provided' and 'unknown', not slip by.
  constraint event_revisions_price_state check (
    case price_state
      when 'provided' then
        coalesce(
          (price_model = 'free' and price_amount_minor is null)
          or (price_model = 'fixed' and price_amount_minor > 0),
          false)
      when 'unknown' then
        coalesce(price_model = 'unknown' and price_amount_minor is null, false)
      else
        price_model is null and price_amount_minor is null
    end
  ),
  -- access_routes: JSON array of objects whose "kind" is a public.access_kind
  -- label. Further per-route rules (for example a valid URL for online
  -- access, P08) are validated in the application layer.
  constraint event_revisions_access_state check (
    jsonb_typeof(access_routes) = 'array'
    and not jsonb_path_exists(
      access_routes,
      '$[*] ? (@.type() != "object" || !exists(@.kind) || !(@.kind == "walk_in" || @.kind == "door" || @.kind == "online_ticket" || @.kind == "online_registration"))'
    )
    and (access_state = 'provided') = (jsonb_array_length(access_routes) >= 1)
  ),
  constraint event_revisions_atmosphere_state check (
    case when atmosphere_state = 'provided'
      then cardinality(atmosphere_tags) >= 1
        or (atmosphere_description is not null
            and btrim(atmosphere_description) <> '')
      else cardinality(atmosphere_tags) = 0 and atmosphere_description is null
    end
  )
);

alter table public.events
  add constraint events_draft_revision_fk
    foreign key (draft_revision_id, id)
    references public.event_revisions (id, event_id),
  add constraint events_published_revision_fk
    foreign key (published_revision_id, id)
    references public.event_revisions (id, event_id),
  add constraint events_first_approved_revision_fk
    foreign key (first_approved_revision_id, id)
    references public.event_revisions (id, event_id);

-- ---------------------------------------------------------------------------
-- Media: uploaded originals and their per-use confirmation
-- ---------------------------------------------------------------------------
create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid not null references auth.users (id),
  private_object_path text not null,
  mime_type text not null,
  created_at timestamptz not null default now(),
  constraint media_assets_path_key unique (private_object_path)
);

-- One row per concrete use of an asset. confirmed_* records the owner's
-- explicit confirmation for exactly this use (ADR-005). public_object_path is
-- filled only by the controlled promotion step (a later slice); clients can
-- never write it.
create table public.media_uses (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.media_assets (id),
  profile_id uuid references public.profiles (id),
  event_id uuid references public.events (id),
  role public.media_role not null,
  public_object_path text,
  alt_text text,
  crop jsonb,
  confirmed_at timestamptz,
  confirmed_by uuid references auth.users (id),
  constraint media_uses_one_parent check (
    (profile_id is not null)::int + (event_id is not null)::int = 1
  ),
  constraint media_uses_role_matches_parent check (
    (role = 'profile_image') = (profile_id is not null)
  ),
  constraint media_uses_confirmed_together check (
    (confirmed_at is null) = (confirmed_by is null)
  ),
  constraint media_uses_id_profile_key unique (id, profile_id),
  constraint media_uses_id_event_key unique (id, event_id)
);

-- A revision may only reference a media use that belongs to its own entity.
alter table public.profile_revisions
  add constraint profile_revisions_image_use_fk
    foreign key (profile_image_use_id, profile_id)
    references public.media_uses (id, profile_id);
alter table public.event_revisions
  add constraint event_revisions_image_use_fk
    foreign key (event_image_use_id, event_id)
    references public.media_uses (id, event_id);

-- ---------------------------------------------------------------------------
-- Audit: append-only record of privileged actions
-- ---------------------------------------------------------------------------
create table public.publication_audit (
  id bigint generated always as identity primary key,
  actor_id uuid not null references auth.users (id),
  entity_type text not null check (entity_type in ('profile', 'event')),
  entity_id uuid not null,
  revision_id uuid,
  action text not null check (action in
    ('provision_owner', 'approve_first', 'publish', 'reschedule', 'cancel',
     'withdraw')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes (primary and unique keys already index the rest)
-- ---------------------------------------------------------------------------
create index profiles_owner_idx on public.profiles (owner_id);
create index events_organizer_idx on public.events (organizer_id);
create index events_public_idx on public.events (publication_state)
  where publication_state = 'published';
create index media_uses_profile_idx on public.media_uses (profile_id)
  where profile_id is not null;
create index media_uses_event_idx on public.media_uses (event_id)
  where event_id is not null;
create index media_uses_asset_idx on public.media_uses (asset_id);
create index publication_audit_entity_idx
  on public.publication_audit (entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- Invariant triggers
-- ---------------------------------------------------------------------------
-- Trigger functions run with the privileges of whoever fires them for
-- ordinary statements, so those that must read across RLS are SECURITY
-- DEFINER with a fixed search_path and fully qualified names.

create function app_private.touch_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function app_private.touch_updated_at();
create trigger events_touch_updated_at
  before update on public.events
  for each row execute function app_private.touch_updated_at();

-- The first approval binds exactly one revision and can never change.
create function app_private.guard_first_approval()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if old.first_approved_revision_id is not null
     and (new.first_approved_revision_id, new.approved_by, new.approved_at)
         is distinct from
         (old.first_approved_revision_id, old.approved_by, old.approved_at)
  then
    raise exception 'first approval of % % is immutable', tg_table_name, old.id
      using errcode = '55000';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_first_approval
  before update on public.profiles
  for each row execute function app_private.guard_first_approval();
create trigger events_guard_first_approval
  before update on public.events
  for each row execute function app_private.guard_first_approval();

-- revision_no is assigned by the database; a client-supplied value is ignored.
create function app_private.assign_profile_revision_no()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  select coalesce(max(r.revision_no), 0) + 1
    into new.revision_no
    from public.profile_revisions r
   where r.profile_id = new.profile_id;
  return new;
end;
$$;

create function app_private.assign_event_revision_no()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  select coalesce(max(r.revision_no), 0) + 1
    into new.revision_no
    from public.event_revisions r
   where r.event_id = new.event_id;
  return new;
end;
$$;

create trigger profile_revisions_assign_no
  before insert on public.profile_revisions
  for each row execute function app_private.assign_profile_revision_no();
create trigger event_revisions_assign_no
  before insert on public.event_revisions
  for each row execute function app_private.assign_event_revision_no();

-- A revision is frozen once it has been confirmed (that is, published at some
-- point) or is the first-approved or the currently published revision. The
-- only permitted change is the one-time confirmation itself (confirmed_at and
-- confirmed_by going from NULL to a value), which the publish functions make.
create function app_private.guard_profile_revision_frozen()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_frozen boolean;
begin
  select old.confirmed_at is not null
         or exists (
           select 1 from public.profiles p
            where p.id = old.profile_id
              and old.id in (p.first_approved_revision_id,
                             p.published_revision_id))
    into v_frozen;

  if not v_frozen then
    return case tg_op when 'DELETE' then old else new end;
  end if;

  if tg_op = 'UPDATE'
     and old.confirmed_at is null
     and new.confirmed_at is not null
     and (to_jsonb(new) - 'confirmed_at' - 'confirmed_by')
         = (to_jsonb(old) - 'confirmed_at' - 'confirmed_by')
  then
    return new;
  end if;

  raise exception 'profile revision % is frozen', old.id
    using errcode = '55000';
end;
$$;

create function app_private.guard_event_revision_frozen()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_frozen boolean;
begin
  select old.confirmed_at is not null
         or exists (
           select 1 from public.events e
            where e.id = old.event_id
              and old.id in (e.first_approved_revision_id,
                             e.published_revision_id))
    into v_frozen;

  if not v_frozen then
    return case tg_op when 'DELETE' then old else new end;
  end if;

  if tg_op = 'UPDATE'
     and old.confirmed_at is null
     and new.confirmed_at is not null
     and (to_jsonb(new) - 'confirmed_at' - 'confirmed_by')
         = (to_jsonb(old) - 'confirmed_at' - 'confirmed_by')
  then
    return new;
  end if;

  raise exception 'event revision % is frozen', old.id
    using errcode = '55000';
end;
$$;

create trigger profile_revisions_frozen
  before update or delete on public.profile_revisions
  for each row execute function app_private.guard_profile_revision_frozen();
create trigger event_revisions_frozen
  before update or delete on public.event_revisions
  for each row execute function app_private.guard_event_revision_frozen();

-- Audit rows are never changed or removed.
create function app_private.audit_append_only()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  raise exception 'publication_audit is append-only'
    using errcode = '55000';
end;
$$;

create trigger publication_audit_no_change
  before update or delete on public.publication_audit
  for each row execute function app_private.audit_append_only();
create trigger publication_audit_no_truncate
  before truncate on public.publication_audit
  for each statement execute function app_private.audit_append_only();

comment on table public.profiles is
  'Organizer profile shell. Created only by provision_profile_owner. Content lives in profile_revisions.';
comment on table public.events is
  'Event shell. Public state is published_revision_id plus public_status; the draft never reaches the public.';
comment on column public.event_revisions.price_model is
  'free | fixed | unknown. unknown is only valid together with price_state = unknown.';
