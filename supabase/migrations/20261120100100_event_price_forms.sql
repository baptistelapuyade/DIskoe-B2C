-- Event step 4 "Preis und Zugang" (Figma EVT-04a to 04n).
--
-- 1. price_model gets four more forms (added in the migration before):
--      free          no amount
--      fixed         price_amount_minor > 0
--      range         price_amount_minor > 0 (from) and price_max_amount_minor
--                    > price_amount_minor (to)
--      from_price    price_amount_minor > 0 ("ab 10,00 €")
--      donation      no amount ("Eintritt gegen Spende")
--      min_donation  price_amount_minor > 0 (minimum donation)
--      unknown       only together with price_state = 'unknown'
--    Unknown stays its own answer. It never turns into free or 0.
-- 2. price_fee_model: the answer to "Pflichtgebühren" for a money price.
--      included  the fees are in the price ("inkl. Gebühren")
--      unknown   not known yet; the page says nothing about fees. It is not
--                "no fees".
--    NULL means not answered. Only a price with an amount can carry it.
-- 3. The new columns are granted like the other price columns, the public
--    view shows them, and the copy function carries them over.
-- Whether an online ticket is sold out lives inside access_routes (a key
-- "availability" of the route), so it needs no column.

create type public.price_fee_model as enum ('included', 'unknown');

alter table public.event_revisions
  add column price_max_amount_minor integer,
  add column price_fee_model public.price_fee_model;

alter table public.event_revisions
  drop constraint event_revisions_price_state;

alter table public.event_revisions
  add constraint event_revisions_price_state check (
    case price_state
      when 'provided' then
        coalesce(
          (price_model in ('free', 'donation')
             and price_amount_minor is null
             and price_max_amount_minor is null)
          or (price_model in ('fixed', 'from_price', 'min_donation')
                and price_amount_minor > 0
                and price_max_amount_minor is null)
          or (price_model = 'range'
                and price_amount_minor > 0
                and price_max_amount_minor > price_amount_minor),
          false)
      when 'unknown' then
        coalesce(price_model = 'unknown'
                 and price_amount_minor is null
                 and price_max_amount_minor is null, false)
      else
        price_model is null and price_amount_minor is null
        and price_max_amount_minor is null
    end
  );

alter table public.event_revisions
  add constraint event_revisions_price_fee_model check (
    price_fee_model is null
    or (price_state = 'provided'
        and price_model in ('fixed', 'from_price', 'min_donation', 'range'))
  );

comment on column public.event_revisions.price_max_amount_minor is
  'Upper end of a price range in cents; only with price_model = range.';
comment on column public.event_revisions.price_fee_model is
  'Mandatory fees of a money price: included, or unknown (never "no fees"). NULL = not answered.';

-- Column rights, like the other price columns.
grant select (price_max_amount_minor, price_fee_model)
  on public.event_revisions to authenticated, anon;
grant insert (price_max_amount_minor, price_fee_model)
  on public.event_revisions to authenticated;
grant update (price_max_amount_minor, price_fee_model)
  on public.event_revisions to authenticated;

-- The public view: new columns at the end (a view may only gain columns there).
create or replace view public.public_events with (security_invoker = true) as
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
       r.confirmed_at as published_at,
       r.price_max_amount_minor,
       r.price_fee_model
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

-- The copy of a revision (rescheduling) carries the new columns.
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
