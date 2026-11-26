-- Public event page (PUB-01): the blocks of "Mehr zum Abend" become visible.
--
-- The page shows four blocks: Einlass und Alter (entry_age), Besuchsmodus
-- (visit_mode), Sprache und Untertitel (language) and Musik (music). The two
-- free-text blocks (participants, bring_participation) have no public design
-- yet, so the public view leaves them out. They stay in the base column, which
-- anon may read for a published revision only (the existing row policy), like
-- every other public column of a revision.
--
-- The view gains its new column at the end (a view may only gain columns
-- there). NULL stays NULL: a step that was never saved shows nothing.

grant select (modules) on public.event_revisions to anon;

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
       (r.modules - 'participants' - 'bring_participation') as modules
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
