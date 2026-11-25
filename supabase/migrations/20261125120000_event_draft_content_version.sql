-- DISKOE B2C Alpha, Slice 12 (follow-up): publishing checks the stand of the
-- draft, not only its id.
--
-- A draft revision of a live event is edited in place until it is published.
-- Two tabs (or devices) on the same draft could therefore publish a stand
-- that the page in front of the owner never showed. event_revisions gets a
-- counter that rises with every change of its content; the publish screen
-- passes the counter it showed and publish_event() refuses (DK001) if it moved.

alter table public.event_revisions
  add column content_version integer not null default 1;

-- Readable for owners like the other columns; never writable by clients (no
-- insert or update grant): the trigger below is the only writer.
grant select (content_version) on public.event_revisions to authenticated;

create function app_private.bump_event_revision_version()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  -- Fires after event_revisions_frozen (trigger names run in order), so the
  -- one-time confirmation of a frozen revision is still allowed. Only a real
  -- change of content raises the counter.
  if (to_jsonb(new) - 'content_version') is distinct from (to_jsonb(old) - 'content_version') then
    new.content_version := old.content_version + 1;
  end if;
  return new;
end;
$$;

create trigger event_revisions_version
  before update on public.event_revisions
  for each row execute function app_private.bump_event_revision_version();

-- ---------------------------------------------------------------------------
-- publish_event with the expected stand of the draft
-- ---------------------------------------------------------------------------
drop function public.publish_event(uuid, uuid, uuid, bigint, public.event_status, boolean, boolean);

create function public.publish_event(
  p_event_id uuid,
  p_expected_draft_revision_id uuid,
  p_expected_published_revision_id uuid,
  p_expected_state_version bigint,
  p_expected_status public.event_status,
  p_confirmed_rights boolean default false,
  p_confirmed_usage boolean default false,
  p_expected_draft_version integer default null
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
  -- The draft is edited in place until it is published. A page that shows an
  -- older stand of the same draft (a second tab saved meanwhile) must not
  -- publish what its owner has not seen. NULL skips the check for callers
  -- that do not show the draft first.
  if p_expected_draft_version is not null
     and not exists (
       select 1 from public.event_revisions r
        where r.id = p_expected_draft_revision_id
          and r.content_version = p_expected_draft_version) then
    raise exception 'draft changed since the preview' using errcode = 'DK001';
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
  public.publish_event(uuid, uuid, uuid, bigint, public.event_status, boolean, boolean, integer)
  from public, anon;
grant execute on function
  public.publish_event(uuid, uuid, uuid, bigint, public.event_status, boolean, boolean, integer)
  to authenticated;
