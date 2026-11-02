-- Rescheduling with a replacement date that changes only the date (NACH-11).
--
-- reschedule_event publishes the whole private draft, so an organizer with
-- other private changes could not give a replacement date without publishing
-- them. reschedule_event_date builds the new public revision from the live one
-- and changes nothing but start and end. The private draft takes over the new
-- date, so that publishing it later does not turn the date back.

-- ---------------------------------------------------------------------------
-- 1. Copy of a revision with another start and end
-- ---------------------------------------------------------------------------
-- Every column except id, revision_no (a trigger assigns it), created_at and
-- the confirmation. A confirmed copy is stamped with p_confirmed_by.
create function app_private.copy_event_revision(
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
    price_state, price_model, price_amount_minor, currency,
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
    r.price_state, r.price_model, r.price_amount_minor, r.currency,
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

revoke all on function
  app_private.copy_event_revision(uuid, timestamptz, timestamptz, uuid, uuid)
  from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. reschedule_event_date
-- ---------------------------------------------------------------------------
create function public.reschedule_event_date(
  p_event_id uuid,
  p_expected_published_revision_id uuid,
  p_expected_state_version bigint,
  p_expected_status public.event_status,
  p_new_start timestamptz,
  p_new_end timestamptz
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
  v_new_id uuid;
  v_draft public.event_revisions;
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
     or v_event.public_status not in
        ('scheduled', 'rescheduled', 'postponed_undated') then
    raise exception 'only a live, non-cancelled event can be rescheduled'
      using errcode = 'DK003';
  end if;
  if v_event.state_version <> p_expected_state_version
     or v_event.public_status <> p_expected_status
     or v_event.published_revision_id
        is distinct from p_expected_published_revision_id then
    raise exception 'event changed since the preview' using errcode = 'DK001';
  end if;

  if p_new_start is null then
    raise exception 'a new start is required' using errcode = '22023';
  end if;
  if p_new_end is not null and p_new_end <= p_new_start then
    raise exception 'the end must be after the start' using errcode = '22023';
  end if;

  select r.start_at into v_old_start from public.event_revisions r
   where r.id = v_event.published_revision_id;
  if p_new_start is not distinct from v_old_start then
    raise exception 'the new start equals the current start'
      using errcode = 'DK003';
  end if;

  -- The new public revision: the live one with another date.
  v_new_id := app_private.copy_event_revision(
    v_event.published_revision_id, p_new_start, p_new_end, v_uid, v_uid);

  v_gaps := app_private.event_gaps(v_new_id);
  if cardinality(v_gaps) > 0 then
    raise exception 'revision is incomplete'
      using errcode = 'DK002', detail = array_to_string(v_gaps, ',');
  end if;

  -- The private draft takes over the date and keeps everything else.
  if v_event.draft_revision_id is null
     or v_event.draft_revision_id = v_event.published_revision_id then
    update public.events
       set draft_revision_id = v_new_id
     where id = p_event_id;
  else
    select * into v_draft from public.event_revisions
     where id = v_event.draft_revision_id;

    if v_draft.confirmed_at is null
       and v_draft.id is distinct from v_event.first_approved_revision_id then
      update public.event_revisions
         set start_state = 'provided',
             start_at = p_new_start,
             end_state = case when p_new_end is null then 'unknown'::public.answer_state
                              else 'provided'::public.answer_state end,
             end_at = p_new_end
       where id = v_draft.id;
    else
      -- A frozen draft is never edited: its copy becomes the new draft.
      update public.events
         set draft_revision_id = app_private.copy_event_revision(
               v_draft.id, p_new_start, p_new_end, v_uid, null)
       where id = p_event_id;
    end if;
  end if;

  update public.events
     set published_revision_id = v_new_id,
         public_status = 'rescheduled',
         state_version = state_version + 1
   where id = p_event_id;

  insert into public.publication_audit
    (actor_id, entity_type, entity_id, revision_id, action)
  values (v_uid, 'event', p_event_id, v_new_id, 'reschedule');
end;
$$;

revoke all on function
  public.reschedule_event_date(uuid, uuid, bigint, public.event_status,
                               timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function
  public.reschedule_event_date(uuid, uuid, bigint, public.event_status,
                               timestamptz, timestamptz)
  to authenticated;
