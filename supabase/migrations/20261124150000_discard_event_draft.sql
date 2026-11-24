-- DISKOE B2C Alpha, Slice 11: discarding the draft of an event that was never
-- published (Figma EVB-07a and 07b).
--
-- discard_event_draft() deletes the event with its draft revisions and the
-- uploaded images of the draft. Owners have no delete policy and published,
-- approved or confirmed revisions are frozen, so the deletion is a function
-- with its own checks:
--   * only the owner of the profile (not found and not owned look the same);
--   * only an event that was never public: no published revision, no first
--     approval, publication state "private";
--   * not while it is submitted for review, and not once any of its revisions
--     was confirmed (a submission confirms the revision and freezes it, even
--     if the owner withdrew it later);
--   * only the draft the owner looked at (optimistic check, DK001).
-- It returns the storage paths of the originals whose files should now go.
-- The deleted event stays traceable through the audit row "discard_draft"
-- (append-only, no foreign key to the event).

create function public.discard_event_draft(
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
  v_last text;
  v_assets uuid[];
  v_paths text[];
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

  if v_event.published_revision_id is not null
     or v_event.first_approved_revision_id is not null
     or v_event.publication_state <> 'private' then
    raise exception 'event was public' using errcode = 'DK003';
  end if;
  if v_event.draft_revision_id is distinct from p_expected_draft_revision_id then
    raise exception 'draft revision changed since it was reviewed'
      using errcode = 'DK001';
  end if;

  select a.action into v_last
    from public.publication_audit a
   where a.entity_type = 'event'
     and a.entity_id = p_event_id
     and a.action in ('submit_for_review', 'withdraw')
   order by a.id desc
   limit 1;
  if v_last = 'submit_for_review' then
    raise exception 'event is in review' using errcode = 'DK003';
  end if;
  if exists (select 1 from public.event_revisions r
              where r.event_id = p_event_id and r.confirmed_at is not null) then
    raise exception 'event was submitted before' using errcode = 'DK003';
  end if;

  select coalesce(array_agg(distinct mu.asset_id), '{}')
    into v_assets
    from public.media_uses mu
   where mu.event_id = p_event_id;

  -- The event points at its draft, a revision points at its image use and the
  -- image use at the event: the cycle is cut at the event first.
  update public.events
     set draft_revision_id = null
   where id = p_event_id;
  delete from public.event_revisions where event_id = p_event_id;
  delete from public.media_uses where event_id = p_event_id;

  with gone as (
    delete from public.media_assets a
     where a.id = any (v_assets)
       and not exists (select 1 from public.media_uses u where u.asset_id = a.id)
    returning a.private_object_path
  )
  select coalesce(array_agg(private_object_path), '{}') into v_paths from gone;

  delete from public.events where id = p_event_id;

  insert into public.publication_audit
    (actor_id, entity_type, entity_id, revision_id, action)
  values (v_uid, 'event', p_event_id, p_expected_draft_revision_id,
          'discard_draft');

  return v_paths;
end;
$$;

revoke all on function public.discard_event_draft(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.discard_event_draft(uuid, uuid)
  to authenticated;
