-- DISKOE B2C Alpha: review flow "variant B" (founder decision 2026-10-27).
--
--   * The owner's submission already contains the consent to publish. The
--     founder's approval therefore publishes the submitted revision in the
--     same transaction. The owner's separate first-publish step disappears.
--     publish_profile() stays for later revisions (they remain private
--     drafts until the owner confirms them).
--   * The founder can ask the owner a question instead of approving
--     (request_profile_changes). The question is stored, not just mailed.
--   * Sending a system mail is recorded per profile, revision and kind, so a
--     retry can never send the same mail twice (profile_mails,
--     claim_profile_mail, finish_profile_mail). The recipient address leaves
--     the database only through claim_profile_mail and only to a founder.
--   * The founder may write the public copy of the profile image at approval
--     (storage policy helper), still only to the path reserved by the
--     published revision.

-- ---------------------------------------------------------------------------
-- 1. Audit vocabulary
-- ---------------------------------------------------------------------------
alter table public.publication_audit
  drop constraint publication_audit_action_check,
  add constraint publication_audit_action_check check (action in
    ('provision_owner', 'approve_first', 'publish', 'reschedule', 'cancel',
     'withdraw', 'submit_for_review', 'request_changes'));

-- ---------------------------------------------------------------------------
-- 2. Questions from the founder
-- ---------------------------------------------------------------------------
create table public.review_requests (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  revision_id uuid not null,
  message text not null
    constraint review_requests_message_length
      check (char_length(message) between 1 and 500),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  -- The question belongs to a revision of exactly this profile.
  constraint review_requests_revision_fk
    foreign key (revision_id, profile_id)
    references public.profile_revisions (id, profile_id) on delete cascade,
  -- One question per submitted revision. A new question needs a new
  -- submission, which needs a changed revision.
  constraint review_requests_revision_key unique (revision_id)
);

create index review_requests_profile_idx on public.review_requests (profile_id);

alter table public.review_requests enable row level security;

create policy review_requests_select on public.review_requests
  for select to authenticated
  using (app_private.owns_profile(profile_id) or app_private.is_founder());

revoke all on public.review_requests from anon, authenticated;
-- created_by (the founder's id) is not needed by the owner.
grant select (id, profile_id, revision_id, message, created_at)
  on public.review_requests to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Mail log (no addresses, no message text, no provider error text)
-- ---------------------------------------------------------------------------
create table public.profile_mails (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  revision_id uuid not null,
  kind text not null check (kind in ('profile_live', 'profile_question')),
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'failed')),
  attempts integer not null default 1 check (attempts >= 1),
  claimed_at timestamptz not null default now(),
  finished_at timestamptz,
  -- "Accepted by the provider", not "delivered".
  provider_message_id text,
  constraint profile_mails_revision_fk
    foreign key (revision_id, profile_id)
    references public.profile_revisions (id, profile_id) on delete cascade,
  constraint profile_mails_once_key unique (profile_id, revision_id, kind),
  constraint profile_mails_finished_together check (
    (status = 'pending') = (finished_at is null)
  )
);

alter table public.profile_mails enable row level security;

create policy profile_mails_select_founder on public.profile_mails
  for select to authenticated
  using (app_private.is_founder());

revoke all on public.profile_mails from anon, authenticated;
grant select (id, profile_id, revision_id, kind, status, attempts,
              claimed_at, finished_at)
  on public.profile_mails to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Approval publishes (replaces the 3c version, same signature and grants)
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
  if v_submitter is null then
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

-- ---------------------------------------------------------------------------
-- 5. A revision with an open question cannot simply be submitted again
-- ---------------------------------------------------------------------------
create or replace function public.submit_profile_for_review(
  p_profile_id uuid,
  p_expected_draft_revision_id uuid,
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
  v_gaps text[];
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
  if exists (select 1 from public.review_requests q
              where q.revision_id = p_expected_draft_revision_id) then
    raise exception 'revision has an open question; change it first'
      using errcode = 'DK003';
  end if;

  v_gaps := app_private.profile_gaps(p_expected_draft_revision_id);
  if cardinality(v_gaps) > 0 then
    raise exception 'revision is incomplete'
      using errcode = 'DK002', detail = array_to_string(v_gaps, ',');
  end if;

  insert into public.publication_audit
    (actor_id, entity_type, entity_id, revision_id, action)
  values (v_uid, 'profile', p_profile_id, p_expected_draft_revision_id,
          'submit_for_review');
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. The founder's question
-- ---------------------------------------------------------------------------
create function public.request_profile_changes(
  p_profile_id uuid,
  p_expected_draft_revision_id uuid,
  p_message text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_uid uuid := auth.uid();
  v_profile public.profiles;
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
  if exists (select 1 from public.review_requests q
              where q.revision_id = p_expected_draft_revision_id) then
    raise exception 'this revision already has a question'
      using errcode = 'DK003';
  end if;

  insert into public.review_requests
    (profile_id, revision_id, message, created_by)
  values (p_profile_id, p_expected_draft_revision_id, v_message, v_uid);

  insert into public.publication_audit
    (actor_id, entity_type, entity_id, revision_id, action)
  values (v_uid, 'profile', p_profile_id, p_expected_draft_revision_id,
          'request_changes');
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. Mail claim: re-check the state right before sending, once only
-- ---------------------------------------------------------------------------
-- Returns the owner's address when the caller may send now, or NULL when
-- nothing is to be sent (already sent, or another attempt is still running).
-- A failed attempt, or one pending for more than five minutes, can be claimed
-- again. The address is not logged anywhere by this function.
create function public.claim_profile_mail(
  p_profile_id uuid,
  p_revision_id uuid,
  p_kind text
)
returns text
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_uid uuid := auth.uid();
  v_profile public.profiles;
  v_mail public.profile_mails;
  v_email text;
begin
  if v_uid is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if not app_private.is_founder() then
    raise exception 'only a founder may send these mails'
      using errcode = '42501';
  end if;
  if p_kind not in ('profile_live', 'profile_question') then
    raise exception 'unknown mail kind' using errcode = '22023';
  end if;

  select * into v_profile from public.profiles
   where id = p_profile_id for update;
  if not found then
    raise exception 'profile not found' using errcode = 'P0002';
  end if;

  -- The state the mail talks about must still be true.
  if p_kind = 'profile_live' then
    if v_profile.publication_state <> 'published'
       or v_profile.published_revision_id is distinct from p_revision_id
       or v_profile.first_approved_revision_id is distinct from p_revision_id then
      raise exception 'profile is not live with this revision'
        using errcode = 'DK003';
    end if;
  else
    if v_profile.first_approved_revision_id is not null
       or v_profile.draft_revision_id is distinct from p_revision_id
       or not exists (select 1 from public.review_requests q
                       where q.revision_id = p_revision_id
                         and q.profile_id = p_profile_id) then
      raise exception 'there is no open question for this revision'
        using errcode = 'DK003';
    end if;
  end if;

  insert into public.profile_mails (profile_id, revision_id, kind)
  values (p_profile_id, p_revision_id, p_kind)
  on conflict (profile_id, revision_id, kind) do nothing;

  if found then
    -- First claim: the row was just created as pending.
    null;
  else
    select * into v_mail from public.profile_mails
     where profile_id = p_profile_id and revision_id = p_revision_id
       and kind = p_kind
     for update;
    if v_mail.status = 'sent'
       or (v_mail.status = 'pending'
           and v_mail.claimed_at > now() - interval '5 minutes') then
      return null;
    end if;
    update public.profile_mails
       set status = 'pending', claimed_at = now(), finished_at = null,
           attempts = attempts + 1
     where id = v_mail.id;
  end if;

  select u.email::text into v_email
    from auth.users u where u.id = v_profile.owner_id;
  return v_email;
end;
$$;

create function public.finish_profile_mail(
  p_profile_id uuid,
  p_revision_id uuid,
  p_kind text,
  p_success boolean,
  p_provider_message_id text default null
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if not app_private.is_founder() then
    raise exception 'only a founder may send these mails'
      using errcode = '42501';
  end if;

  update public.profile_mails
     set status = case when p_success then 'sent' else 'failed' end,
         finished_at = now(),
         provider_message_id = case when p_success
           then left(p_provider_message_id, 200) else null end
   where profile_id = p_profile_id and revision_id = p_revision_id
     and kind = p_kind and status = 'pending';
  if not found then
    raise exception 'no pending mail to finish' using errcode = 'DK003';
  end if;
end;
$$;

revoke all on function
  public.request_profile_changes(uuid, uuid, text),
  public.claim_profile_mail(uuid, uuid, text),
  public.finish_profile_mail(uuid, uuid, text, boolean, text)
  from public, anon;
-- Each function checks its caller itself.
grant execute on function
  public.request_profile_changes(uuid, uuid, text),
  public.claim_profile_mail(uuid, uuid, text),
  public.finish_profile_mail(uuid, uuid, text, boolean, text)
  to authenticated;

-- ---------------------------------------------------------------------------
-- 8. Storage: the founder may write the public copy at approval
-- ---------------------------------------------------------------------------
-- Same reserved path as before (published revision of a published profile,
-- confirmed image use). Only the "who" widens from owner to owner or founder.
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
$$;
