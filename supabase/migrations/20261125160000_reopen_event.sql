-- Reopening a cancelled event with a new date (Figma EVV-06a/b).
--
-- reschedule_event_date refuses a cancelled event. reopen_event is the one way
-- back: it builds a new public revision from the live one that changes nothing
-- but start and end, lifts the cancellation and sets the status to
-- "rescheduled". As with reschedule_event_date the private draft takes over
-- the new date and keeps every other change private. The cancellation stays
-- traceable: the audit row "reopen" is appended, the earlier "cancel" row
-- stays.

alter table public.publication_audit
  drop constraint publication_audit_action_check,
  add constraint publication_audit_action_check check (action in
    ('provision_owner', 'approve_first', 'publish', 'reschedule', 'cancel',
     'withdraw', 'submit_for_review', 'request_changes', 'postpone',
     'discard_draft', 'reopen'));

create function public.reopen_event(
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
     or v_event.public_status <> 'cancelled' then
    raise exception 'only a cancelled event can be reopened'
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

  -- The cancellation columns and the status go together (table check).
  update public.events
     set published_revision_id = v_new_id,
         public_status = 'rescheduled',
         cancelled_at = null,
         cancelled_by = null,
         state_version = state_version + 1
   where id = p_event_id;

  insert into public.publication_audit
    (actor_id, entity_type, entity_id, revision_id, action)
  values (v_uid, 'event', p_event_id, v_new_id, 'reopen');
end;
$$;

revoke all on function
  public.reopen_event(uuid, uuid, bigint, public.event_status,
                      timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function
  public.reopen_event(uuid, uuid, bigint, public.event_status,
                      timestamptz, timestamptz)
  to authenticated;
