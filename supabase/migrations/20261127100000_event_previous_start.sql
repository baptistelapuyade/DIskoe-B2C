-- Public event page, status "new date" (PUB-01j): the date it replaced.
--
-- A guest who sees "Rescheduled" wants to know which date no longer applies
-- ("Bisher: Fr, 23. Oktober"). A cancelled or postponed event still has that
-- date in its published revision. A rescheduled event gets a new revision, and
-- anon may read the published revision only, so the old date is not readable.
-- events.previous_start_at keeps it: a trigger sets it whenever the published
-- revision changes to one with another start. The start only, no end: the page
-- shows "Fr, 23. Oktober 2026 · 22:00 Uhr".
--
-- NULL means unknown, not "none": an event rescheduled before this column
-- existed is filled in below from its earlier revision where there is one.

alter table public.events add column previous_start_at timestamptz;

create function app_private.events_remember_previous_start()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_old timestamptz;
  v_new timestamptz;
begin
  if old.published_revision_id is null
     or new.published_revision_id is null
     or new.published_revision_id is not distinct from old.published_revision_id
  then
    return new;
  end if;

  select r.start_at into v_old from public.event_revisions r
   where r.id = old.published_revision_id;
  select r.start_at into v_new from public.event_revisions r
   where r.id = new.published_revision_id;

  -- A small change that keeps the date keeps what was remembered.
  if v_old is not null and v_new is distinct from v_old then
    new.previous_start_at := v_old;
  end if;

  return new;
end;
$$;

revoke all on function app_private.events_remember_previous_start()
  from public, anon, authenticated;

create trigger events_remember_previous_start
  before update on public.events
  for each row execute function app_private.events_remember_previous_start();

-- Events that are rescheduled now: the latest earlier revision with another
-- start (the revisions of one event are numbered in order).
update public.events e
   set previous_start_at = (
         select p.start_at
           from public.event_revisions p
           join public.event_revisions cur on cur.id = e.published_revision_id
          where p.event_id = e.id
            and p.revision_no < cur.revision_no
            and p.confirmed_at is not null
            and p.start_at is not null
            and p.start_at is distinct from cur.start_at
          order by p.revision_no desc
          limit 1)
 where e.public_status = 'rescheduled'
   and e.published_revision_id is not null;

grant select (previous_start_at) on public.events to anon, authenticated;

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
       r.price_fee_model,
       (r.modules - 'participants' - 'bring_participation') as modules,
       e.previous_start_at
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
