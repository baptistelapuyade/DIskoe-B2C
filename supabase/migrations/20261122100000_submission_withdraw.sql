-- Slice 8 "Einreichen" (Figma EIN-01, EIN-02, PRF-01 to PRF-03).
--
-- 1. Withdrawing a submission (PRF-03). Until now an owner could hand in a
--    draft but not take it back. "In review" meant: some audit row
--    'submit_for_review' exists for the current draft revision. Now the LATEST
--    of 'submit_for_review' and 'withdraw' decides (app_private.is_submitted).
--    The audit table stays append-only; a withdrawal is one more row.
--    The founder's approval and question refuse a withdrawn submission.
-- 2. The required "Mehr zum Abend" block of a format is checked on submit and
--    publish like title and price: opening needs the visit mode, screening
--    needs language and subtitles. "Unknown" is a valid answer (the value is
--    "unknown", not empty); a block that is missing or has no value is a gap.
--
-- Functions replaced below are copies of their latest definitions with the
-- submission lookup changed; nothing else in them differs.

-- ---------------------------------------------------------------------------
-- 1a. Is this revision handed in right now?
-- ---------------------------------------------------------------------------
create function app_private.is_submitted(
  p_entity_type text,
  p_entity_id uuid,
  p_revision_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(
    (select a.action = 'submit_for_review'
       from public.publication_audit a
      where a.entity_type = p_entity_type
        and a.entity_id = p_entity_id
        and a.revision_id = p_revision_id
        and a.action in ('submit_for_review', 'withdraw')
      order by a.id desc
      limit 1),
    false)
$$;

revoke all on function app_private.is_submitted(text, uuid, uuid)
  from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 1b. The owner withdraws the submission of profile and first event
-- ---------------------------------------------------------------------------
-- One call for the pair: the profile draft and the draft of every event of
-- this profile that is handed in at the moment. Nothing changes in the drafts.
--   DK001  the profile draft changed since it was shown
--   DK003  already decided: first approval exists, or the founder asked a
--          question about this revision (the owner changes the draft instead)
-- A submission that is not handed in (never, or withdrawn already) is not an
-- error: the call returns without a new audit row, so a double click is safe.
create function public.withdraw_submission(
  p_profile_id uuid,
  p_expected_draft_revision_id uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_uid uuid := auth.uid();
  v_profile public.profiles;
  v_event record;
begin
  if v_uid is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  select * into v_profile from public.profiles
   where id = p_profile_id for update;
  -- Not found and not owned look identical on purpose.
  if not found or v_profile.owner_id <> v_uid then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if v_profile.first_approved_revision_id is not null then
    raise exception 'profile already has a first approval'
      using errcode = 'DK003';
  end if;
  if v_profile.draft_revision_id is distinct from p_expected_draft_revision_id then
    raise exception 'draft revision changed since it was shown'
      using errcode = 'DK001';
  end if;
  if exists (select 1 from public.review_requests q
              where q.revision_id = p_expected_draft_revision_id) then
    raise exception 'revision has a question; change it instead'
      using errcode = 'DK003';
  end if;

  if not app_private.is_submitted('profile', p_profile_id,
                                  p_expected_draft_revision_id) then
    return;
  end if;

  insert into public.publication_audit
    (actor_id, entity_type, entity_id, revision_id, action)
  values (v_uid, 'profile', p_profile_id, p_expected_draft_revision_id,
          'withdraw');

  for v_event in
    select e.id, e.draft_revision_id
      from public.events e
     where e.organizer_id = p_profile_id
       and e.first_approved_revision_id is null
       and e.draft_revision_id is not null
     order by e.created_at
  loop
    if app_private.is_submitted('event', v_event.id, v_event.draft_revision_id) then
      insert into public.publication_audit
        (actor_id, entity_type, entity_id, revision_id, action)
      values (v_uid, 'event', v_event.id, v_event.draft_revision_id,
              'withdraw');
    end if;
  end loop;
end;
$$;

revoke all on function public.withdraw_submission(uuid, uuid)
  from public, anon;
grant execute on function public.withdraw_submission(uuid, uuid)
  to authenticated;

-- ---------------------------------------------------------------------------
-- 1c. The founder's functions refuse a withdrawn submission
-- ---------------------------------------------------------------------------
create or replace function public.approve_first_profile(
  p_profile_id uuid,
  p_expected_draft_revision_id uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_uid uuid := auth.uid();
  v_profile public.profiles;
  v_gaps text[];
  v_submitter uuid;
begin
  if v_uid is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if not app_private.is_founder() then
    raise exception 'only a founder may approve' using errcode = '42501';
  end if;

  select * into v_profile from public.profiles
   where id = p_profile_id for update;
  if not found then
    raise exception 'profile not found' using errcode = 'P0002';
  end if;
  if v_profile.owner_id = v_uid then
    raise exception 'self-approval is not allowed' using errcode = '42501';
  end if;
  if v_profile.first_approved_revision_id is not null then
    raise exception 'profile already has a first approval'
      using errcode = 'DK003';
  end if;
  if v_profile.draft_revision_id is distinct from p_expected_draft_revision_id then
    raise exception 'draft revision changed since it was reviewed'
      using errcode = 'DK001';
  end if;

  v_gaps := app_private.profile_gaps(p_expected_draft_revision_id);
  if cardinality(v_gaps) > 0 then
    raise exception 'revision is incomplete'
      using errcode = 'DK002', detail = array_to_string(v_gaps, ',');
  end if;

  -- The owner's submission carries the consent to publish. Without it for
  -- exactly this revision there is nothing to publish.
  select a.actor_id into v_submitter
    from public.publication_audit a
   where a.entity_type = 'profile' and a.entity_id = p_profile_id
     and a.revision_id = p_expected_draft_revision_id
     and a.action = 'submit_for_review'
   order by a.id desc
   limit 1;
  -- A withdrawn submission (the latest audit row is a withdrawal) is no
  -- submission any more.
  if v_submitter is null
     or not app_private.is_submitted('profile', p_profile_id,
                                     p_expected_draft_revision_id) then
    raise exception 'revision was not submitted for review'
      using errcode = 'DK003';
  end if;

  update public.profiles
     set first_approved_revision_id = p_expected_draft_revision_id,
         approved_by = v_uid,
         approved_at = now(),
         published_revision_id = p_expected_draft_revision_id,
         publication_state = 'published'
   where id = p_profile_id;

  -- The submitting owner is the confirming user of this revision.
  update public.profile_revisions
     set confirmed_at = now(), confirmed_by = v_submitter
   where id = p_expected_draft_revision_id;

  insert into public.publication_audit
    (actor_id, entity_type, entity_id, revision_id, action)
  values (v_uid, 'profile', p_profile_id, p_expected_draft_revision_id,
          'approve_first'),
         (v_uid, 'profile', p_profile_id, p_expected_draft_revision_id,
          'publish');
end;
$$;

create or replace function public.approve_first_publication(
  p_profile_id uuid,
  p_expected_draft_revision_id uuid,
  p_event_id uuid,
  p_expected_event_draft_revision_id uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_uid uuid := auth.uid();
  v_event public.events;
  v_submitter uuid;
  v_owner uuid;
  v_gaps text[];
begin
  if v_uid is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if not app_private.is_founder() then
    raise exception 'only a founder may approve' using errcode = '42501';
  end if;

  -- Checks the founder role, self-approval, draft revision, gaps and the
  -- submission of the profile, then approves and publishes it. Any failure
  -- below rolls the profile approval back, because this is one transaction.
  perform public.approve_first_profile(p_profile_id, p_expected_draft_revision_id);

  select * into v_event from public.events
   where id = p_event_id for update;
  if not found or v_event.organizer_id <> p_profile_id then
    raise exception 'event not found' using errcode = 'P0002';
  end if;
  select p.owner_id into v_owner from public.profiles p
   where p.id = p_profile_id;
  if v_owner = v_uid then
    raise exception 'self-approval is not allowed' using errcode = '42501';
  end if;
  if v_event.first_approved_revision_id is not null then
    raise exception 'event already has a first approval'
      using errcode = 'DK003';
  end if;
  if v_event.draft_revision_id
       is distinct from p_expected_event_draft_revision_id then
    raise exception 'event draft changed since it was reviewed'
      using errcode = 'DK001';
  end if;

  v_gaps := app_private.event_gaps(p_expected_event_draft_revision_id);
  if cardinality(v_gaps) > 0 then
    raise exception 'revision is incomplete'
      using errcode = 'DK002', detail = array_to_string(v_gaps, ',');
  end if;

  -- The owner's submission carries the consent for exactly this revision.
  select a.actor_id into v_submitter
    from public.publication_audit a
   where a.entity_type = 'event' and a.entity_id = p_event_id
     and a.revision_id = p_expected_event_draft_revision_id
     and a.action = 'submit_for_review'
   order by a.id desc
   limit 1;
  if v_submitter is null or v_submitter <> v_owner
     or not app_private.is_submitted('event', p_event_id,
                                     p_expected_event_draft_revision_id) then
    raise exception 'event revision was not submitted for review'
      using errcode = 'DK003';
  end if;

  update public.events
     set first_approved_revision_id = p_expected_event_draft_revision_id,
         approved_by = v_uid,
         approved_at = now(),
         published_revision_id = p_expected_event_draft_revision_id,
         publication_state = 'published',
         state_version = state_version + 1
   where id = p_event_id;

  update public.event_revisions
     set confirmed_at = now(), confirmed_by = v_submitter
   where id = p_expected_event_draft_revision_id;

  insert into public.publication_audit
    (actor_id, entity_type, entity_id, revision_id, action)
  values (v_uid, 'event', p_event_id, p_expected_event_draft_revision_id,
          'approve_first'),
         (v_uid, 'event', p_event_id, p_expected_event_draft_revision_id,
          'publish');
end;
$$;

create or replace function public.request_profile_changes(
  p_profile_id uuid,
  p_expected_draft_revision_id uuid,
  p_message text,
  p_expected_event_draft_revision_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_uid uuid := auth.uid();
  v_profile public.profiles;
  v_event public.events;
  v_message text := btrim(coalesce(p_message, ''));
begin
  if v_uid is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if not app_private.is_founder() then
    raise exception 'only a founder may ask' using errcode = '42501';
  end if;

  select * into v_profile from public.profiles
   where id = p_profile_id for update;
  if not found then
    raise exception 'profile not found' using errcode = 'P0002';
  end if;
  if v_profile.owner_id = v_uid then
    raise exception 'a founder cannot review his own profile'
      using errcode = '42501';
  end if;
  if char_length(v_message) not between 1 and 500 then
    raise exception 'message must have 1 to 500 characters'
      using errcode = '22023';
  end if;
  if v_profile.first_approved_revision_id is not null then
    raise exception 'profile already has a first approval'
      using errcode = 'DK003';
  end if;
  if v_profile.draft_revision_id is distinct from p_expected_draft_revision_id then
    raise exception 'draft revision changed since it was reviewed'
      using errcode = 'DK001';
  end if;
  if not app_private.is_submitted('profile', p_profile_id,
                                  p_expected_draft_revision_id) then
    raise exception 'revision was not submitted for review'
      using errcode = 'DK003';
  end if;

  if p_expected_event_draft_revision_id is not null then
    select e.* into v_event from public.events e
     where e.draft_revision_id = p_expected_event_draft_revision_id
       and e.organizer_id = p_profile_id
     for update;
    if not found then
      raise exception 'event draft changed since it was reviewed'
        using errcode = 'DK001';
    end if;
    if v_event.first_approved_revision_id is not null
       or not app_private.is_submitted('event', v_event.id,
                                       p_expected_event_draft_revision_id) then
      raise exception 'event revision was not submitted for review'
        using errcode = 'DK003';
    end if;
  end if;

  if exists (select 1 from public.review_requests q
              where q.revision_id = p_expected_draft_revision_id
                and q.event_revision_id
                    is not distinct from p_expected_event_draft_revision_id) then
    raise exception 'this submission already has a question'
      using errcode = 'DK003';
  end if;

  insert into public.review_requests
    (profile_id, revision_id, event_revision_id, message, created_by)
  values (p_profile_id, p_expected_draft_revision_id,
          p_expected_event_draft_revision_id, v_message, v_uid);

  insert into public.publication_audit
    (actor_id, entity_type, entity_id, revision_id, action)
  values (v_uid, 'profile', p_profile_id, p_expected_draft_revision_id,
          'request_changes');
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Required "Mehr zum Abend" block in the gap check
-- ---------------------------------------------------------------------------
-- Same list as before (20261119100000) plus 'visit_mode' (opening) and
-- 'language' (screening). The app has the same rule in requiredAnswered().
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
        -- Required block of the format. "unknown" is a value, a missing block
        -- or a missing value is a gap.
        case when r.format_state = 'provided'
                  and r.primary_format = 'opening'
                  and nullif(r.modules -> 'visit_mode' ->> 'mode', '') is null
             then 'visit_mode' end,
        case when r.format_state = 'provided'
                  and r.primary_format = 'screening'
                  and (nullif(r.modules -> 'language' ->> 'program', '') is null
                       or nullif(r.modules -> 'language' ->> 'subtitles', '') is null)
             then 'language' end,
        case when mu.id is null or mu.confirmed_at is null
                  or mu.public_object_path is null
             then 'event_image' end
      ], null)
       from public.event_revisions r
       left join public.media_uses mu on mu.id = r.event_image_use_id
      where r.id = p_revision_id),
    array['revision_missing'])
$$;
