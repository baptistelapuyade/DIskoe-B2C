-- DISKOE B2C Alpha, Slice 2: "which profiles are assigned to me".
--
-- Clients cannot read profiles.owner_id (Slice 1 hides it on purpose, or every
-- logged-in user could read the account ids of published organizers). The
-- organizer area still has to know which profiles belong to the signed-in
-- user. This view answers exactly that and nothing else:
--
--   * security_invoker: the base-table column grants and RLS of the caller
--     apply, so no new access is created, only a safe filter.
--   * The filter app_private.owns_profile(id) keeps only profiles that the
--     caller owns. Without it the public SELECT policy on profiles would also
--     return other organizers' published profiles.
--   * Only authenticated may read it. anon gets nothing.
--
-- Being the owner is established only by the founder-provisioned owner_id
-- (provision_profile_owner). Nothing here derives rights from an e-mail
-- address.

create view public.my_profiles with (security_invoker = true) as
select p.id,
       p.slug,
       p.publication_state,
       p.draft_revision_id,
       p.published_revision_id,
       p.first_approved_revision_id,
       r.name as draft_name
  from public.profiles p
  left join public.profile_revisions r on r.id = p.draft_revision_id
 where app_private.owns_profile(p.id);

revoke all on public.my_profiles from public, anon, authenticated;
grant select on public.my_profiles to authenticated;

comment on view public.my_profiles is
  'Profiles owned by the caller. The only client-side way to learn the own assignment without exposing owner_id.';
