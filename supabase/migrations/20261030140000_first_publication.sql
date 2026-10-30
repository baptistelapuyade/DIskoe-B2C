-- DISKOE B2C Alpha, Slice 5: publishing a profile together with its first
-- event, and publishing later events without the founder.
--
-- Founder decisions (29./30.10.2026):
--   * The FIRST event is submitted together with the profile and approved by
--     the founder together with it. The approval publishes both.
--   * Every LATER event is published by the organizer, with the same two
--     confirmations (rights, usage) and no founder review. The founder's
--     approval of the profile covers them.
--   * Event images may be copied to the public bucket after publication, at
--     the path the database reserved (events/<event id>/<use id>.<ext>).
--
-- Changes:
--   1. review_requests can belong to a pair (profile revision, event
--      revision); a question blocks a new submission only while neither
--      revision has changed.
--   2. submit_first_publication / approve_first_publication (new).
--   3. request_profile_changes gets an optional event revision.
--   4. publish_event gets the two confirmations and, while the event has no
--      first approval, lets the owner of an approved and published profile
--      approve and publish it himself. approved_by is the founder who
--      approved the profile, so the existing constraints and public policies
--      keep holding unchanged.
--   5. is_publishable_media_path also covers the image of a published event.
--
-- Audit vocabulary is unchanged: submit_for_review, approve_first, publish and
-- request_changes already exist and are written for entity_type 'event' too.

-- ---------------------------------------------------------------------------
-- 1. Questions belong to a pair of revisions
-- ---------------------------------------------------------------------------
alter table public.review_requests
  add column event_revision_id uuid
    references public.event_revisions (id) on delete cascade;

-- One question per submitted pair. NULL (profile only) counts as one value.
alter table public.review_requests
  drop constraint review_requests_revision_key,
  add constraint review_requests_pair_key
    unique nulls not distinct (revision_id, event_revision_id);

grant select (event_revision_id) on public.review_requests to authenticated;

-- ---------------------------------------------------------------------------
-- 2a. The owner submits profile and first event together
-- ---------------------------------------------------------------------------
create function public.submit_first_publication(
  p_profile_id uuid,
  p_expected_draft_revision_id uuid,
  p_event_id uuid,
  p_expected_event_draft_revision_id uuid,
  p_confirmed_rights boolean,
  p_confirmed_usage boolean
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
  v_gaps text[];
  v_event_gaps text[];
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
  if p_confirmed_rights is not true or p_confirmed_usage is not true then
    raise exception 'both declarations must be confirmed'
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

  select * into v_event from public.events
   where id = p_event_id for update;
  if not found or v_event.organizer_id <> p_profile_id then
    raise exception 'not allowed' using errcode = '42501';
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

  if exists (select 1 from public.review_requests q
              where q.revision_id = p_expected_draft_revision_id
                and q.event_revision_id = p_expected_event_draft_revision_id) then
    raise exception 'this submission has an open question; change it first'
      using errcode = 'DK003';
  end if;

  v_gaps := app_private.profile_gaps(p_expected_draft_revision_id);
  v_event_gaps := app_private.event_gaps(p_expected_event_draft_revision_id);
  if cardinality(v_gaps) > 0 or cardinality(v_event_gaps) > 0 then
    raise exception 'revision is incomplete'
      using errcode = 'DK002',
            detail = array_to_string(
              array(select 'profile.' || g from unnest(v_gaps) g)
              || array(select 'event.' || g from unnest(v_event_gaps) g),
              ',');
  end if;

  insert into public.publication_audit
    (actor_id, entity_type, entity_id, revision_id, action)
  values (v_uid, 'profile', p_profile_id, p_expected_draft_revision_id,
          'submit_for_review'),
         (v_uid, 'event', p_event_id, p_expected_event_draft_revision_id,
          'submit_for_review');
end;
$$;

-- ---------------------------------------------------------------------------
-- 2b. The founder approves both, one transaction
-- ---------------------------------------------------------------------------
create function public.approve_first_publication(
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
  if v_submitter is null or v_submitter <> v_owner then
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

-- ---------------------------------------------------------------------------
-- 3. The founder's question may name the event as well
-- ---------------------------------------------------------------------------
drop function public.request_profile_changes(uuid, uuid, text);

create function public.request_profile_changes(
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
  if not exists (
       select 1 from public.publication_audit a
        where a.entity_type = 'profile' and a.entity_id = p_profile_id
          and a.revision_id = p_expected_draft_revision_id
          and a.action = 'submit_for_review') then
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
       or not exists (
         select 1 from public.publication_audit a
          where a.entity_type = 'event' and a.entity_id = v_event.id
            and a.revision_id = p_expected_event_draft_revision_id
            and a.action = 'submit_for_review') then
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
-- 4. Later events: the owner publishes after the profile approval
-- ---------------------------------------------------------------------------
drop function public.publish_event(uuid, uuid, uuid, bigint, public.event_status);

create function public.publish_event(
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
  if v_event.first_approved_revision_id is null
     and (p_confirmed_rights is not true or p_confirmed_usage is not true) then
    raise exception 'both declarations must be confirmed'
      using errcode = '22023';
  end if;
  if v_event.first_approved_revision_id is not null
     and v_event.published_revision_id is null
     and v_event.first_approved_revision_id
         is distinct from p_expected_draft_revision_id then
    raise exception 'draft differs from the approved revision'
      using errcode = 'DK001';
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

-- ---------------------------------------------------------------------------
-- Grants (each function checks its caller itself)
-- ---------------------------------------------------------------------------
revoke all on function
  public.submit_first_publication(uuid, uuid, uuid, uuid, boolean, boolean),
  public.approve_first_publication(uuid, uuid, uuid, uuid),
  public.request_profile_changes(uuid, uuid, text, uuid),
  public.publish_event(uuid, uuid, uuid, bigint, public.event_status, boolean, boolean)
  from public, anon;
grant execute on function
  public.submit_first_publication(uuid, uuid, uuid, uuid, boolean, boolean),
  public.approve_first_publication(uuid, uuid, uuid, uuid),
  public.request_profile_changes(uuid, uuid, text, uuid),
  public.publish_event(uuid, uuid, uuid, bigint, public.event_status, boolean, boolean)
  to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Storage: the public copy of a published event's image
-- ---------------------------------------------------------------------------
-- Same rule as for the profile image: only the path reserved by the database,
-- only for the published revision of a published event of a published
-- profile, only for its owner or a founder. Still no update and no delete
-- policy on storage.objects, so a replaced image stays reachable by its URL.
create or replace function app_private.is_publishable_media_path(p_path text)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
      from public.media_uses mu
      join public.profile_revisions r on r.profile_image_use_id = mu.id
      join public.profiles p
        on p.published_revision_id = r.id and p.id = mu.profile_id
     where mu.public_object_path = p_path
       and mu.confirmed_at is not null
       and p.publication_state = 'published'
       and (p.owner_id = auth.uid() or app_private.is_founder()))
  or exists (
    select 1
      from public.media_uses mu
      join public.event_revisions r on r.event_image_use_id = mu.id
      join public.events e
        on e.published_revision_id = r.id and e.id = mu.event_id
      join public.profiles p on p.id = e.organizer_id
     where mu.public_object_path = p_path
       and mu.confirmed_at is not null
       and e.publication_state = 'published'
       and e.first_approved_revision_id is not null
       and p.publication_state = 'published'
       and p.first_approved_revision_id is not null
       and (p.owner_id = auth.uid() or app_private.is_founder()))
$$;
