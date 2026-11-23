-- DISKOE B2C Alpha, Slice 10: changing a live profile (Figma LPA-01 to 06).
--
-- 1. publish_profile() now needs both declarations of the owner (Figma
--    LPA-04a). The application checks them first, the database refuses
--    anything else, as it does for the first submission. The audit row
--    "publish" exists only when both were confirmed.
-- 2. discard_profile_draft() really deletes the private draft of a live
--    profile (Figma LPA-06a). Owners have no delete policy and published or
--    approved revisions are frozen, so the deletion is a function with its own
--    checks. The deleted revision stays traceable through the audit row
--    "discard_draft" (append-only, no foreign key to the revision).

alter table public.publication_audit
  drop constraint publication_audit_action_check,
  add constraint publication_audit_action_check check (action in
    ('provision_owner', 'approve_first', 'publish', 'reschedule', 'cancel',
     'withdraw', 'submit_for_review', 'request_changes', 'postpone',
     'discard_draft'));

-- ---------------------------------------------------------------------------
-- 1. publish_profile with the two declarations
-- ---------------------------------------------------------------------------
drop function public.publish_profile(uuid, uuid, uuid);

create function public.publish_profile(
  p_profile_id uuid,
  p_expected_draft_revision_id uuid,
  p_expected_published_revision_id uuid default null,
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
  if v_profile.first_approved_revision_id is null then
    raise exception 'first approval is missing' using errcode = 'DK003';
  end if;
  if v_profile.publication_state = 'withdrawn' then
    raise exception 'profile is withdrawn' using errcode = 'DK003';
  end if;
  if v_profile.draft_revision_id is distinct from p_expected_draft_revision_id
     or v_profile.published_revision_id
        is distinct from p_expected_published_revision_id then
    raise exception 'profile changed since the preview'
      using errcode = 'DK001';
  end if;
  if v_profile.published_revision_id = p_expected_draft_revision_id then
    raise exception 'nothing new to publish' using errcode = 'DK003';
  end if;
  -- First publication: only the revision the founder approved.
  if v_profile.published_revision_id is null
     and v_profile.first_approved_revision_id
         is distinct from p_expected_draft_revision_id then
    raise exception 'draft differs from the approved revision'
      using errcode = 'DK001';
  end if;

  v_gaps := app_private.profile_gaps(p_expected_draft_revision_id);
  if cardinality(v_gaps) > 0 then
    raise exception 'revision is incomplete'
      using errcode = 'DK002', detail = array_to_string(v_gaps, ',');
  end if;

  -- Publishing is the owner's explicit confirmation of this revision.
  update public.profile_revisions
     set confirmed_at = now(), confirmed_by = v_uid
   where id = p_expected_draft_revision_id;

  update public.profiles
     set published_revision_id = p_expected_draft_revision_id,
         publication_state = 'published'
   where id = p_profile_id;

  insert into public.publication_audit
    (actor_id, entity_type, entity_id, revision_id, action)
  values (v_uid, 'profile', p_profile_id, p_expected_draft_revision_id,
          'publish');
end;
$$;

revoke all on function public.publish_profile(uuid, uuid, uuid, boolean, boolean)
  from public, anon, authenticated;
grant execute on function public.publish_profile(uuid, uuid, uuid, boolean, boolean)
  to authenticated;

-- ---------------------------------------------------------------------------
-- 2. discard_profile_draft
-- ---------------------------------------------------------------------------
create function public.discard_profile_draft(
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
  -- Only changes to a live profile can be discarded; before that the draft is
  -- the profile itself.
  if v_profile.published_revision_id is null then
    raise exception 'profile has nothing published' using errcode = 'DK003';
  end if;
  -- Already discarded (or never changed): nothing to delete.
  if v_profile.draft_revision_id is null
     or v_profile.draft_revision_id = v_profile.published_revision_id then
    raise exception 'there is no draft to discard' using errcode = 'DK003';
  end if;
  if v_profile.draft_revision_id is distinct from p_expected_draft_revision_id then
    raise exception 'draft revision changed since it was reviewed'
      using errcode = 'DK001';
  end if;

  -- The profile points at the published revision again before the draft row
  -- goes (foreign key). A frozen revision is refused by its own trigger.
  update public.profiles
     set draft_revision_id = published_revision_id
   where id = p_profile_id;

  delete from public.profile_revisions
   where id = p_expected_draft_revision_id
     and profile_id = p_profile_id;

  insert into public.publication_audit
    (actor_id, entity_type, entity_id, revision_id, action)
  values (v_uid, 'profile', p_profile_id, p_expected_draft_revision_id,
          'discard_draft');
end;
$$;

revoke all on function public.discard_profile_draft(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.discard_profile_draft(uuid, uuid)
  to authenticated;
