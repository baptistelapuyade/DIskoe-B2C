-- DISKOE B2C Alpha, Slice 12: changing a live event (Figma EVB-01 to 06).
--
-- 1. publish_event() needs both declarations of the owner for every
--    publication, not only for an event without its own first approval
--    (Figma EVB-04a). The application checks them first, the database refuses
--    anything else, as it does for a live profile (publish_profile).
-- 2. discard_event_changes() really deletes the private draft of a live event
--    (Figma EVB-06a). Owners have no delete policy and published or confirmed
--    revisions are frozen, so the deletion is a function with its own checks.
--    The deleted revision stays traceable through the audit row
--    "discard_draft" (append-only, no foreign key to the revision). A picture
--    that only the discarded draft used goes with it; the function returns the
--    storage paths of its originals, like discard_event_draft.

-- ---------------------------------------------------------------------------
-- 1. publish_event with the declarations always required
-- ---------------------------------------------------------------------------
create or replace function public.publish_event(
  p_event_id uuid,
  p_expected_draft_revision_id uuid,
  p_expected_published_revision_id uuid,
  p_expected_state_version bigint,
  p_expected_status public.event_status,
  p_confirmed_rights boolean default false,
  p_confirmed_usage boolean default false
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_uid uuid := auth.uid();
  v_event public.events;
  v_profile public.profiles;
  v_gaps text[];
begin
  if v_uid is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  select * into v_event from public.events
   where id = p_event_id for update;
  if found then
    select * into v_profile from public.profiles p
     where p.id = v_event.organizer_id;
  end if;
  if not found or v_profile.owner_id <> v_uid then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  -- Without a first approval of its own, the event may be published by the
  -- owner only when the founder has approved and published the profile.
  if v_event.first_approved_revision_id is null
     and (v_profile.first_approved_revision_id is null
          or v_profile.approved_by is null
          or v_profile.publication_state <> 'published') then
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
  if v_event.first_approved_revision_id is not null
     and v_event.published_revision_id is null
     and v_event.first_approved_revision_id
         is distinct from p_expected_draft_revision_id then
    raise exception 'draft differs from the approved revision'
      using errcode = 'DK001';
  end if;

  -- Every publication by the owner needs both declarations, also changes to
  -- a live event (Figma EVB-04a). The application checks them first.
  if p_confirmed_rights is not true or p_confirmed_usage is not true then
    raise exception 'both declarations must be confirmed'
      using errcode = '22023';
  end if;

  v_gaps := app_private.event_gaps(p_expected_draft_revision_id);
  if cardinality(v_gaps) > 0 then
    raise exception 'revision is incomplete'
      using errcode = 'DK002', detail = array_to_string(v_gaps, ',');
  end if;

  if v_event.first_approved_revision_id is null then
    -- The profile approval covers this event. approved_by names the founder
    -- who approved the profile.
    update public.events
       set first_approved_revision_id = p_expected_draft_revision_id,
           approved_by = v_profile.approved_by,
           approved_at = now()
     where id = p_event_id;
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

revoke all on function
  public.publish_event(uuid, uuid, uuid, bigint, public.event_status, boolean, boolean)
  from public, anon;
grant execute on function
  public.publish_event(uuid, uuid, uuid, bigint, public.event_status, boolean, boolean)
  to authenticated;

-- ---------------------------------------------------------------------------
-- 2. discard_event_changes
-- ---------------------------------------------------------------------------
create function public.discard_event_changes(
  p_event_id uuid,
  p_expected_draft_revision_id uuid
)
returns text[]
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_uid uuid := auth.uid();
  v_event public.events;
  v_profile public.profiles;
  v_draft public.event_revisions;
  v_published public.event_revisions;
  v_use uuid;
  v_asset uuid;
  v_paths text[] := '{}';
begin
  if v_uid is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  select * into v_event from public.events
   where id = p_event_id for update;
  if found then
    select * into v_profile from public.profiles p
     where p.id = v_event.organizer_id;
  end if;
  -- Not found and not owned look identical on purpose.
  if not found or v_profile.owner_id <> v_uid then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  -- Only changes to a live event can be discarded; before that the draft is
  -- the event itself (discard_event_draft).
  if v_event.published_revision_id is null then
    raise exception 'event has nothing published' using errcode = 'DK003';
  end if;
  -- Already discarded (or never changed): nothing to delete.
  if v_event.draft_revision_id is null
     or v_event.draft_revision_id = v_event.published_revision_id then
    raise exception 'there is no draft to discard' using errcode = 'DK003';
  end if;
  if v_event.draft_revision_id is distinct from p_expected_draft_revision_id then
    raise exception 'draft revision changed since it was reviewed'
      using errcode = 'DK001';
  end if;

  select * into v_draft from public.event_revisions
   where id = p_expected_draft_revision_id and event_id = p_event_id;
  select * into v_published from public.event_revisions
   where id = v_event.published_revision_id;

  -- The event points at the published revision again before the draft row
  -- goes (foreign key). A frozen revision is refused by its own trigger.
  update public.events
     set draft_revision_id = published_revision_id
   where id = p_event_id;

  delete from public.event_revisions where id = v_draft.id;

  -- A picture that only the discarded draft used: its use, and its asset if
  -- nothing else uses it.
  v_use := v_draft.event_image_use_id;
  if v_use is not null
     and v_use is distinct from v_published.event_image_use_id
     and not exists (select 1 from public.event_revisions r
                      where r.event_image_use_id = v_use) then
    select asset_id into v_asset from public.media_uses where id = v_use;
    delete from public.media_uses where id = v_use;
    with gone as (
      delete from public.media_assets a
       where a.id = v_asset
         and not exists (select 1 from public.media_uses u
                          where u.asset_id = a.id)
      returning a.private_object_path
    )
    select coalesce(array_agg(private_object_path), '{}') into v_paths
      from gone;
  end if;

  insert into public.publication_audit
    (actor_id, entity_type, entity_id, revision_id, action)
  values (v_uid, 'event', p_event_id, p_expected_draft_revision_id,
          'discard_draft');

  return v_paths;
end;
$$;

revoke all on function public.discard_event_changes(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.discard_event_changes(uuid, uuid)
  to authenticated;
