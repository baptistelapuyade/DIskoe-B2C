-- Slice 5, rest: postponing a live event without a replacement date (NACH-12)
-- and giving a replacement date afterwards (NACH-13).
--
-- 1. The audit vocabulary learns "postpone".
-- 2. postpone_event sets the public status to postponed_undated. Like
--    cancel_event it never touches published_revision_id, so a private draft
--    can not become public by postponing.
-- 3. reschedule_event also accepts postponed_undated, so a replacement date can
--    be published later.

-- ---------------------------------------------------------------------------
-- 1. Audit vocabulary
-- ---------------------------------------------------------------------------
alter table public.publication_audit
  drop constraint publication_audit_action_check,
  add constraint publication_audit_action_check check (action in
    ('provision_owner', 'approve_first', 'publish', 'reschedule', 'cancel',
     'withdraw', 'submit_for_review', 'request_changes', 'postpone'));

-- ---------------------------------------------------------------------------
-- 2. postpone_event
-- ---------------------------------------------------------------------------
create function public.postpone_event(
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
     or v_event.published_revision_id is null
     or v_event.public_status not in ('scheduled', 'rescheduled') then
    raise exception 'only a live, scheduled event can be postponed'
      using errcode = 'DK003';
  end if;
  if v_event.state_version <> p_expected_state_version
     or v_event.public_status <> p_expected_status
     or v_event.published_revision_id
        is distinct from p_expected_published_revision_id then
    raise exception 'event changed since the preview' using errcode = 'DK001';
  end if;

  update public.events
     set public_status = 'postponed_undated',
         state_version = state_version + 1
   where id = p_event_id;

  insert into public.publication_audit
    (actor_id, entity_type, entity_id, revision_id, action)
  values (v_uid, 'event', p_event_id, v_event.published_revision_id,
          'postpone');
end;
$$;

revoke all on function
  public.postpone_event(uuid, uuid, bigint, public.event_status)
  from public, anon, authenticated;
grant execute on function
  public.postpone_event(uuid, uuid, bigint, public.event_status)
  to authenticated;

-- ---------------------------------------------------------------------------
-- 3. reschedule_event: also from postponed_undated
-- ---------------------------------------------------------------------------
create or replace function public.reschedule_event(
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
     or v_event.public_status not in
        ('scheduled', 'rescheduled', 'postponed_undated') then
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
