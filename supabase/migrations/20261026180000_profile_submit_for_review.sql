-- DISKOE B2C Alpha, Slice 3b: the owner submits the complete profile draft for
-- the founder's first review.
--
-- The Figma flow ("Profil zur Erstprüfung einreichen" with two declarations,
-- then "in Prüfung") needs a persisted fact that this exact revision was
-- submitted. No new state column is added: the submission is an append-only
-- audit row (actor, revision, time). A profile counts as "in review" while its
-- current draft revision has such a row and no first approval exists.
--
-- The two declarations are required parameters, so the owner's explicit
-- confirmation cannot be skipped by calling the function directly. Their text
-- stays in the application (TODO(spec): legal wording is not final).

alter table public.publication_audit
  drop constraint publication_audit_action_check,
  add constraint publication_audit_action_check check (action in
    ('provision_owner', 'approve_first', 'publish', 'reschedule', 'cancel',
     'withdraw', 'submit_for_review'));

create function public.submit_profile_for_review(
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

revoke all on function public.submit_profile_for_review(uuid, uuid, boolean, boolean)
  from public, anon;
grant execute on function public.submit_profile_for_review(uuid, uuid, boolean, boolean)
  to authenticated;
