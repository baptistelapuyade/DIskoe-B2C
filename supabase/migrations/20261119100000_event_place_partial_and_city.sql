-- Event steps (Figma EVT-03a to 03c, EVT-08): "Später weitermachen" keeps what
-- was typed, also a place that is not complete yet. And the city is needed
-- before an event can be submitted (Figma EVT-03b: "Gib die Stadt an.").
--
-- 1. event_revisions_place_state: a place that is answered ('provided') still
--    needs name and address. A place that is not answered yet ('unanswered')
--    may hold the part that was typed (name only, name and street, ...). The
--    other states (unknown, not applicable, skipped) keep all columns empty.
--    A partial place is never public: it is not 'provided', so the gap list
--    names the place and nothing can be submitted or published with it.
-- 2. app_private.event_gaps: a provided place without a city is a gap. Old
--    drafts without a city are not rewritten; they show the gap on the next
--    check, and the owner adds the city.

alter table public.event_revisions
  drop constraint event_revisions_place_state;

alter table public.event_revisions
  add constraint event_revisions_place_state check (
    case
      when place_state = 'provided'
        then place_name is not null and btrim(place_name) <> ''
         and address_line is not null and btrim(address_line) <> ''
      when place_state = 'unanswered'
        then true
      else place_name is null and address_line is null
         and postal_code is null and city is null
    end
  );

create or replace function app_private.event_gaps(p_revision_id uuid)
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
        case when r.place_state <> 'provided'
                  or r.city is null or btrim(r.city) = '' then 'place' end,
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
