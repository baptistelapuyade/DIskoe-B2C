-- Event step 7 "Mehr zum Abend" (Figma EVT-07, EVT-07m-a to 07m-k).
--
-- The optional blocks of an event (Einlass und Alter, Besuchsmodus, Sprache
-- und Untertitel, Musik, Beteiligte, Mitbringen und Teilnahme) are stored in
-- one jsonb column of the revision, one key per block that is on the page.
--   NULL    the step was never saved; the suggestions of the format apply.
--   object  exactly the blocks that are there (a removed block has no key).
-- The field names inside a block are a proposal of the app (the data contract
-- leaves them open); the app validates them. The database checks only what
-- protects it: the value is an object, it has only known keys, each block is
-- an object, and the whole value is small.
--
-- The column is not shown to visitors yet: the public view and the anon rights
-- follow with the public event page (PUB-01), when the blocks are rendered.

alter table public.event_revisions
  add column modules jsonb;

alter table public.event_revisions
  add constraint event_revisions_modules_shape check (
    modules is null
    or (
      jsonb_typeof(modules) = 'object'
      and (modules - array[
            'entry_age', 'visit_mode', 'language',
            'music', 'participants', 'bring_participation'
          ]) = '{}'::jsonb
      and (modules -> 'entry_age' is null
           or jsonb_typeof(modules -> 'entry_age') = 'object')
      and (modules -> 'visit_mode' is null
           or jsonb_typeof(modules -> 'visit_mode') = 'object')
      and (modules -> 'language' is null
           or jsonb_typeof(modules -> 'language') = 'object')
      and (modules -> 'music' is null
           or jsonb_typeof(modules -> 'music') = 'object')
      and (modules -> 'participants' is null
           or jsonb_typeof(modules -> 'participants') = 'object')
      and (modules -> 'bring_participation' is null
           or jsonb_typeof(modules -> 'bring_participation') = 'object')
      and octet_length(modules::text) <= 6000
    )
  );

comment on column public.event_revisions.modules is
  'Optional blocks of "Mehr zum Abend", one key per block on the page. NULL = step never saved (suggestions apply); {} = the organizer removed every block.';

-- Column rights for the owner (authenticated); no anon right yet.
grant select (modules) on public.event_revisions to authenticated;
grant insert (modules) on public.event_revisions to authenticated;
grant update (modules) on public.event_revisions to authenticated;

-- The copy of a revision (rescheduling) carries the blocks over.
create or replace function app_private.copy_event_revision(
  p_source_id uuid,
  p_start_at timestamptz,
  p_end_at timestamptz,
  p_created_by uuid,
  p_confirmed_by uuid
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_id uuid;
begin
  insert into public.event_revisions (
    event_id, revision_no,
    title_state, title, description_state, description,
    format_state, primary_format,
    start_state, start_at, timezone, end_state, end_at,
    place_state, place_name, address_line, postal_code, city, country_code,
    price_state, price_model, price_amount_minor, price_max_amount_minor,
    price_fee_model, currency,
    access_state, access_routes,
    atmosphere_state, atmosphere_tags, atmosphere_description,
    modules,
    event_image_use_id,
    confirmed_at, confirmed_by, created_by
  )
  select
    r.event_id, 0,
    r.title_state, r.title, r.description_state, r.description,
    r.format_state, r.primary_format,
    'provided', p_start_at, r.timezone,
    case when p_end_at is null then 'unknown'::public.answer_state
         else 'provided'::public.answer_state end,
    p_end_at,
    r.place_state, r.place_name, r.address_line, r.postal_code, r.city,
    r.country_code,
    r.price_state, r.price_model, r.price_amount_minor,
    r.price_max_amount_minor, r.price_fee_model, r.currency,
    r.access_state, r.access_routes,
    r.atmosphere_state, r.atmosphere_tags, r.atmosphere_description,
    r.modules,
    r.event_image_use_id,
    case when p_confirmed_by is null then null else now() end,
    p_confirmed_by,
    p_created_by
  from public.event_revisions r
  where r.id = p_source_id
  returning id into v_id;

  return v_id;
end;
$$;
