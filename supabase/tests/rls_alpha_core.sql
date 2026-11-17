-- RLS, grant and invariant tests for the Alpha core schema.
--
-- Run by scripts/test-rls.sh against PostgreSQL with local-shim.sql applied.
-- Plain SQL, no pgTAP: every check calls a helper from schema "tests" that
-- aborts the whole run on the first failure (psql ON_ERROR_STOP).
--
-- Cast: F founder, A and B organizers (each with a provisioned profile),
-- V logged-in visitor without any profile, and anon.

\set ON_ERROR_STOP on
\set uid_f 'f0000000-0000-0000-0000-00000000000f'
\set uid_a 'a0000000-0000-0000-0000-00000000000a'
\set uid_b 'b0000000-0000-0000-0000-00000000000b'
\set uid_v 'c0000000-0000-0000-0000-00000000000c'
\set nobody '99999999-9999-9999-9999-999999999999'

-- Silence result sets; errors and notices still reach stderr.
\o /dev/null
\t on

-- ===========================================================================
-- Test helpers (live only in this run, never in a migration)
-- ===========================================================================
create schema tests;
create table tests.results (id serial primary key, name text not null);

create function tests.record(p_name text) returns void
language sql security definer set search_path = pg_catalog, tests
as $$ insert into tests.results (name) values (p_name) $$;

create function tests.as_superuser() returns void language plpgsql as $$
begin
  reset role;
  perform set_config('request.jwt.claim.sub', '', false);
end $$;

create function tests.as_user(p_uid uuid) returns void language plpgsql as $$
begin
  reset role;
  perform set_config('request.jwt.claim.sub', p_uid::text, false);
  set role authenticated;
end $$;

create function tests.as_anon() returns void language plpgsql as $$
begin
  reset role;
  perform set_config('request.jwt.claim.sub', '', false);
  set role anon;
end $$;

-- The statement must fail with exactly this SQLSTATE (and, if given, a
-- DETAIL containing p_detail).
create function tests.expect_error(
  p_sql text, p_state text, p_name text, p_detail text default null
) returns void language plpgsql as $$
declare
  v_state text;
  v_detail text;
begin
  begin
    execute p_sql;
  exception when others then
    get stacked diagnostics v_detail = pg_exception_detail;
    v_state := sqlstate;
    if v_state is distinct from p_state then
      raise exception 'FAIL [%]: expected SQLSTATE %, got % (%)',
        p_name, p_state, v_state, sqlerrm;
    end if;
    if p_detail is not null and position(p_detail in coalesce(v_detail, '')) = 0 then
      raise exception 'FAIL [%]: expected detail containing %, got %',
        p_name, p_detail, v_detail;
    end if;
    perform tests.record(p_name);
    return;
  end;
  raise exception 'FAIL [%]: expected SQLSTATE % but the statement succeeded',
    p_name, p_state;
end $$;

create function tests.expect_ok(p_sql text, p_name text) returns void
language plpgsql as $$
begin
  execute p_sql;
  perform tests.record(p_name);
end $$;

create function tests.expect_affected(p_sql text, p_rows int, p_name text)
returns void language plpgsql as $$
declare v_rows int;
begin
  execute p_sql;
  get diagnostics v_rows = row_count;
  if v_rows <> p_rows then
    raise exception 'FAIL [%]: expected % affected rows, got %',
      p_name, p_rows, v_rows;
  end if;
  perform tests.record(p_name);
end $$;

create function tests.expect_count(p_sql text, p_rows bigint, p_name text)
returns void language plpgsql as $$
declare v bigint;
begin
  execute 'select count(*) from (' || p_sql || ') q' into v;
  if v <> p_rows then
    raise exception 'FAIL [%]: expected % rows, got %', p_name, p_rows, v;
  end if;
  perform tests.record(p_name);
end $$;

create function tests.expect_true(p_sql text, p_name text) returns void
language plpgsql as $$
declare v boolean;
begin
  execute p_sql into v;
  if v is distinct from true then
    raise exception 'FAIL [%]: condition is not true (%)', p_name, p_sql;
  end if;
  perform tests.record(p_name);
end $$;

-- Builds and runs an event revision INSERT as the current role. Defaults make
-- a complete, valid revision; p_over replaces or adds columns.
create function tests.ev_insert(p_event uuid, p_use uuid, p_over jsonb default '{}')
returns uuid language plpgsql as $$
declare
  v jsonb;
  v_cols text;
  v_vals text;
  v_id uuid;
begin
  v := jsonb_build_object(
    'event_id', p_event, 'created_by', auth.uid(),
    'title_state', 'provided', 'title', 'Summer Opening',
    'description_state', 'provided', 'description', 'A first night.',
    'format_state', 'provided', 'primary_format', 'opening',
    'start_state', 'provided', 'start_at', '2027-06-05 19:00:00+02',
    'place_state', 'provided', 'place_name', 'Hall 3',
    'address_line', 'Main St 1', 'postal_code', '10115', 'city', 'Berlin',
    'price_state', 'unknown', 'price_model', 'unknown',
    'access_state', 'provided', 'access_routes', '[{"kind": "walk_in"}]'::jsonb,
    'atmosphere_state', 'provided', 'atmosphere_tags', '{warm,loud}',
    'event_image_use_id', p_use
  ) || p_over;
  select string_agg(quote_ident(k), ', '),
         string_agg(quote_nullable(v ->> k), ', ')
    into v_cols, v_vals
    from jsonb_object_keys(v) k;
  execute format('insert into public.event_revisions (%s) values (%s) returning id',
                 v_cols, v_vals) into v_id;
  return v_id;
end $$;

-- Owner-side media helpers: asset + use + explicit confirmation.
create function tests.new_profile_image_use(p_profile uuid, p_confirm boolean default true)
returns uuid language plpgsql as $$
declare v_asset uuid; v_use uuid;
begin
  insert into public.media_assets (uploader_id, private_object_path, mime_type)
  values (auth.uid(), auth.uid()::text || '/' || gen_random_uuid() || '.jpg', 'image/jpeg')
  returning id into v_asset;
  insert into public.media_uses (asset_id, profile_id, role, alt_text)
  values (v_asset, p_profile, 'profile_image', 'Test image') returning id into v_use;
  if p_confirm then
    update public.media_uses set confirmed_at = now() where id = v_use;
  end if;
  return v_use;
end $$;

-- Confirmation without alt text must fail (called as the owner).
-- Confirms an image use with the given description (NULL or blank allowed)
-- and reports whether it was stored as NULL and got its reserved path. The
-- subtransaction is rolled back, so the helper leaves no rows behind.
create function tests.confirm_with_alt_is_null(p_profile uuid, p_alt text, p_mime text default 'image/jpeg')
returns boolean language plpgsql as $$
declare v_asset uuid; v_use uuid; v_ok boolean;
begin
  begin
    insert into public.media_assets (uploader_id, private_object_path, mime_type)
    values (auth.uid(), auth.uid()::text || '/' || gen_random_uuid() || '.jpg', p_mime)
    returning id into v_asset;
    insert into public.media_uses (asset_id, profile_id, role, alt_text)
    values (v_asset, p_profile, 'profile_image', p_alt) returning id into v_use;
    update public.media_uses set confirmed_at = now() where id = v_use;
    select alt_text is null and public_object_path is not null and confirmed_at is not null
      into v_ok from public.media_uses where id = v_use;
    raise exception 'rollback' using errcode = 'RB000';
  exception when sqlstate 'RB000' then
    return v_ok;
  end;
end $$;

create function tests.new_profile_image_use_mime(p_profile uuid, p_mime text)
returns uuid language plpgsql as $$
declare v_asset uuid; v_use uuid;
begin
  insert into public.media_assets (uploader_id, private_object_path, mime_type)
  values (auth.uid(), auth.uid()::text || '/' || gen_random_uuid() || '.bin', p_mime)
  returning id into v_asset;
  insert into public.media_uses (asset_id, profile_id, role, alt_text)
  values (v_asset, p_profile, 'profile_image', 'Test image') returning id into v_use;
  update public.media_uses set confirmed_at = now() where id = v_use;
  return v_use;
end $$;

create function tests.new_event_image_use(p_event uuid, p_confirm boolean default true)
returns uuid language plpgsql as $$
declare v_asset uuid; v_use uuid;
begin
  insert into public.media_assets (uploader_id, private_object_path, mime_type)
  values (auth.uid(), auth.uid()::text || '/' || gen_random_uuid() || '.jpg', 'image/jpeg')
  returning id into v_asset;
  insert into public.media_uses (asset_id, event_id, role, alt_text)
  values (v_asset, p_event, 'event_image', 'Test image') returning id into v_use;
  if p_confirm then
    update public.media_uses set confirmed_at = now() where id = v_use;
  end if;
  return v_use;
end $$;

-- Event image helpers (Slice 4: event images reserve a public path too).
create function tests.confirm_event_image_with_alt_is_null(p_event uuid, p_alt text)
returns boolean language plpgsql as $$
declare v_asset uuid; v_use uuid; v_ok boolean;
begin
  begin
    insert into public.media_assets (uploader_id, private_object_path, mime_type)
    values (auth.uid(), auth.uid()::text || '/' || gen_random_uuid() || '.jpg', 'image/jpeg')
    returning id into v_asset;
    insert into public.media_uses (asset_id, event_id, role, alt_text)
    values (v_asset, p_event, 'event_image', p_alt) returning id into v_use;
    update public.media_uses set confirmed_at = now() where id = v_use;
    select alt_text is null and public_object_path is not null and confirmed_at is not null
      into v_ok from public.media_uses where id = v_use;
    raise exception 'rollback' using errcode = 'RB000';
  exception when sqlstate 'RB000' then
    return v_ok;
  end;
end $$;

create function tests.new_event_image_use_mime(p_event uuid, p_mime text)
returns uuid language plpgsql as $$
declare v_asset uuid; v_use uuid;
begin
  insert into public.media_assets (uploader_id, private_object_path, mime_type)
  values (auth.uid(), auth.uid()::text || '/' || gen_random_uuid() || '.bin', p_mime)
  returning id into v_asset;
  insert into public.media_uses (asset_id, event_id, role, alt_text)
  values (v_asset, p_event, 'event_image', 'Test image') returning id into v_use;
  update public.media_uses set confirmed_at = now() where id = v_use;
  return v_use;
end $$;

grant usage on schema tests to public;
grant execute on all functions in schema tests to public;

-- ===========================================================================
-- Fixture: users and the founder role (simulates the one-time admin bootstrap)
-- ===========================================================================
insert into auth.users (id, email) values
  (:'uid_f', 'founder@example.test'),
  (:'uid_a', 'owner-a@example.test'),
  (:'uid_b', 'owner-b@example.test'),
  (:'uid_v', 'visitor@example.test');
insert into public.app_roles (user_id, is_founder) values (:'uid_f', true);

-- ===========================================================================
-- 1. Provisioning: only the founder creates profile shells
-- ===========================================================================
select tests.as_user(:'uid_a');
select tests.expect_error(format('select public.provision_profile_owner(%L, %L)', :'uid_b', 'sneaky-one'),
  '42501', 'owner cannot provision profiles');
select tests.as_user(:'uid_v');
select tests.expect_error(format('select public.provision_profile_owner(%L, %L)', :'uid_v', 'sneaky-two'),
  '42501', 'visitor cannot provision profiles');
select tests.as_anon();
select tests.expect_error(format('select public.provision_profile_owner(%L, %L)', :'uid_v', 'sneaky-three'),
  '42501', 'anon cannot execute provision_profile_owner');

select tests.as_user(:'uid_f');
select public.provision_profile_owner(:'uid_a', 'owner-a', 'Alpha Events') as pa \gset
select public.provision_profile_owner(:'uid_b', 'Owner-B') as pb \gset
select tests.expect_error(format('select public.provision_profile_owner(%L, %L)', :'uid_v', 'Admin'),
  '23514', 'reserved slug is rejected');
select tests.expect_error(format('select public.provision_profile_owner(%L, %L)', :'uid_v', 'ab'),
  '23514', 'too short slug is rejected');
select tests.expect_error(format('select public.provision_profile_owner(%L, %L)', :'uid_v', 'my_slug'),
  '23514', 'slug with invalid character is rejected');
select tests.expect_error(format('select public.provision_profile_owner(%L, %L)', :'uid_v', 'müller'),
  '23514', 'non-ASCII slug is rejected');
select tests.expect_error(format('select public.provision_profile_owner(%L, %L)', :'uid_v', ' OWNER-A '),
  '23505', 'duplicate slug is rejected after normalisation');
select tests.expect_error(format('select public.provision_profile_owner(%L, %L)', :'nobody', 'nobody-here'),
  'DK005', 'unknown target user is rejected');
select tests.expect_true(format($q$select slug = 'owner-b' from public.profiles where id = %L$q$, :'pb'),
  'slug is normalised to lower case');

-- No INSERT path for clients
select tests.as_user(:'uid_a');
select tests.expect_error(format('insert into public.profiles (owner_id, slug) values (%L, %L)', :'uid_a', 'sneaky-four'),
  '42501', 'authenticated cannot insert profiles');
select tests.as_user(:'uid_v');
select tests.expect_error(format('insert into public.profiles (owner_id, slug) values (%L, %L)', :'uid_v', 'sneaky-five'),
  '42501', 'visitor cannot insert profiles');

-- Visibility of the private shells
select tests.as_user(:'uid_a');
select tests.expect_count('select id from public.profiles', 1, 'owner A sees only the own shell');
select tests.as_user(:'uid_b');
select tests.expect_count('select id from public.profiles', 1, 'owner B sees only the own shell');
select tests.as_user(:'uid_v');
select tests.expect_count('select id from public.profiles', 0, 'visitor sees no private shell');
select tests.as_anon();
select tests.expect_count('select id from public.profiles', 0, 'anon sees no private shell');
select tests.as_user(:'uid_f');
select tests.expect_count('select id from public.profiles', 2, 'founder reads all shells');

-- Columns that must never reach clients
select tests.as_anon();
select tests.expect_error('select owner_id from public.profiles', '42501', 'anon cannot read owner_id');
select tests.expect_error('select draft_revision_id from public.profiles', '42501', 'anon cannot read draft_revision_id');
select tests.expect_error('select * from public.profiles', '42501', 'anon cannot select *');
select tests.as_user(:'uid_a');
select tests.expect_error('select owner_id from public.profiles', '42501', 'authenticated cannot read owner_id');
select tests.expect_error('select approved_by from public.profiles', '42501', 'authenticated cannot read approved_by');
select tests.expect_error('select * from public.profiles', '42501', 'authenticated cannot select *');

-- ===========================================================================
-- 2. Owner builds the profile draft
-- ===========================================================================
select tests.as_user(:'uid_a');
select draft_revision_id as r1 from public.profiles where id = :'pa' \gset
select tests.expect_true(format('select revision_no = 1 from public.profile_revisions where id = %L', :'r1'),
  'shell draft is revision 1');
select tests.expect_affected(
  format($q$update public.profile_revisions set name = 'Alpha Events', short_intro = 'Nights in Berlin.', public_contact = 'hello@example.test' where id = %L$q$, :'r1'),
  1, 'owner edits the draft revision');
select tests.expect_error(format('update public.profile_revisions set revision_no = 5 where id = %L', :'r1'),
  '42501', 'client cannot change revision_no');
select tests.expect_error(format('update public.profile_revisions set confirmed_at = now() where id = %L', :'r1'),
  '42501', 'client cannot confirm a revision');
select tests.expect_error(format('update public.profile_revisions set created_by = %L where id = %L', :'uid_b', :'r1'),
  '42501', 'client cannot rewrite created_by');
select tests.expect_error(format('update public.profiles set published_revision_id = %L where id = %L', :'r1', :'pa'),
  '42501', 'owner cannot set published_revision_id directly');
select tests.expect_error(format('update public.profiles set first_approved_revision_id = %L where id = %L', :'r1', :'pa'),
  '42501', 'owner cannot set the approval directly');
select tests.expect_error(format($q$update public.profiles set publication_state = 'published' where id = %L$q$, :'pa'),
  '42501', 'owner cannot flip publication_state');
select tests.expect_error(format('update public.profiles set owner_id = %L where id = %L', :'uid_b', :'pa'),
  '42501', 'owner cannot reassign the profile');

-- Media: only the uploader's own prefix, only for own parents
select tests.expect_error(format($q$insert into public.media_assets (uploader_id, private_object_path, mime_type) values (%L, 'other/x.jpg', 'image/jpeg')$q$, :'uid_a'),
  '42501', 'asset path must sit under the uploader prefix');
select tests.expect_error(format($q$insert into public.media_assets (uploader_id, private_object_path, mime_type) values (%L, %L, 'image/gif')$q$, :'uid_a', :'uid_a' || '/x.gif'),
  '23514', 'only jpeg, png and webp assets are accepted');
select tests.expect_true(format('select tests.confirm_with_alt_is_null(%L, null)', :'pa'),
  'a profile image can be confirmed without a description');
select tests.expect_true(format('select tests.confirm_with_alt_is_null(%L, %L)', :'pa', '   '),
  'a blank description is stored as NULL');
select tests.new_profile_image_use(:'pa', false) as use_a \gset
select tests.expect_true(format('select public_object_path is null and confirmed_at is null from public.media_uses where id = %L', :'use_a'),
  'an unconfirmed image use has no public path');
select tests.expect_error(format('update public.media_uses set public_object_path = %L where id = %L', 'public/x.jpg', :'use_a'),
  '42501', 'client cannot write public_object_path');
select tests.expect_affected(format('update public.media_uses set confirmed_at = now() where id = %L', :'use_a'),
  1, 'owner confirms the media use');
select tests.as_superuser();
select tests.expect_true(format('select confirmed_by = %L and confirmed_at is not null from public.media_uses where id = %L', :'uid_a', :'use_a'),
  'confirmation is stamped with the confirming user');
select tests.expect_true(format($q$select public_object_path = 'profiles/' || profile_id || '/' || id || '.jpg' from public.media_uses where id = %L$q$, :'use_a'),
  'confirmation reserves the public path (a path, not a file)');
select tests.as_user(:'uid_a');
select tests.expect_affected(format('update public.media_uses set confirmed_by = %L where id = %L', :'uid_b', :'use_a'),
  1, 'attempt to rewrite confirmed_by is accepted but neutralised');
select tests.as_superuser();
select tests.expect_true(format('select confirmed_by = %L from public.media_uses where id = %L', :'uid_a', :'use_a'),
  'confirmed_by cannot be re-pointed');
select tests.as_superuser();
select asset_id as asset_a from public.media_uses where id = :'use_a' \gset
select tests.as_user(:'uid_b');
select tests.expect_error(format($q$insert into public.media_uses (asset_id, profile_id, role) values (%L, %L, 'profile_image')$q$, :'asset_a', :'pb'),
  '42501', 'B cannot attach A''s asset even knowing its id');
select tests.expect_count(format('select id from public.media_uses where id = %L', :'use_a'), 0, 'B cannot see A''s media use');
select tests.as_user(:'uid_a');
select tests.expect_affected(format('update public.profile_revisions set profile_image_use_id = %L where id = %L', :'use_a', :'r1'),
  1, 'owner links the image to the draft');

-- ===========================================================================
-- 3. Founder approval is bound to the exact revision
-- ===========================================================================
select tests.as_user(:'uid_a');
select tests.expect_error(format('select public.approve_first_profile(%L, %L)', :'pa', :'r1'),
  '42501', 'owner cannot approve (not a founder)');
select tests.as_superuser();
select draft_revision_id as rb1 from public.profiles where id = :'pb' \gset
select tests.as_user(:'uid_f');
select tests.expect_error(format('select public.approve_first_profile(%L, %L)', :'pb', :'rb1'),
  'DK002', 'approval refuses an incomplete revision (no image)', 'profile_image');

select tests.as_user(:'uid_f');
select tests.expect_error(format('select public.approve_first_profile(%L, %L)', :'pa', gen_random_uuid()),
  'DK001', 'approval of a different revision is refused');
select tests.expect_error(format('select public.approve_first_profile(%L, %L)', :'pa', :'r1'),
  'DK003', 'approval needs the owner''s submission of exactly this revision');
select tests.as_superuser();
select tests.expect_true(format($q$select first_approved_revision_id is null and published_revision_id is null and publication_state = 'private' from public.profiles where id = %L$q$, :'pa'),
  'a refused approval changes nothing');

-- The owner submits r1 (consent to publish), then tries to swap the draft
-- before the founder decides. The approval stays bound to the submitted one.
select tests.as_user(:'uid_a');
select public.submit_profile_for_review(:'pa', :'r1', true, true);
select tests.expect_affected(
  format($q$insert into public.profile_revisions (profile_id, name, short_intro, public_contact, profile_image_use_id, created_by) values (%L, 'Unreviewed', 'Not seen by the founder', 'x@example.test', %L, %L)$q$, :'pa', :'use_a', :'uid_a'),
  1, 'owner creates a second revision');
select id as r2 from public.profile_revisions where profile_id = :'pa' and revision_no = 2 \gset
select tests.expect_true(format('select revision_no = 2 from public.profile_revisions where id = %L', :'r2'),
  'database assigns the next revision number');
select tests.expect_affected(format('update public.profiles set draft_revision_id = %L where id = %L', :'r2', :'pa'),
  1, 'owner points the draft at the unreviewed revision');
select tests.as_user(:'uid_f');
select tests.expect_error(format('select public.approve_first_profile(%L, %L)', :'pa', :'r1'),
  'DK001', 'approval of the submitted revision is refused after a draft swap');
select tests.expect_error(format('select public.approve_first_profile(%L, %L)', :'pa', :'r2'),
  'DK003', 'an unsubmitted revision cannot be approved');
select tests.as_user(:'uid_a');
select tests.expect_affected(format('update public.profiles set draft_revision_id = %L where id = %L', :'r1', :'pa'),
  1, 'owner restores the submitted draft');
select tests.as_user(:'uid_f');
select public.approve_first_profile(:'pa', :'r1');
select tests.as_superuser();
select tests.expect_true(format('select first_approved_revision_id = %L and approved_by = %L and approved_at is not null from public.profiles where id = %L', :'r1', :'uid_f', :'pa'),
  'approval binds the exact revision and the founder');
select tests.expect_true(format($q$select published_revision_id = %L and publication_state = 'published' from public.profiles where id = %L$q$, :'r1', :'pa'),
  'approval publishes the same revision');
select tests.expect_true(format('select confirmed_by = %L and confirmed_at is not null from public.profile_revisions where id = %L', :'uid_a', :'r1'),
  'the submitting owner is the confirming user of the published revision');
select tests.expect_true(format($q$select count(*) = 4 from public.publication_audit where entity_id = %L and action in ('provision_owner','submit_for_review','approve_first','publish')$q$, :'pa'),
  'provisioning, submission, approval and publication are audited');
select tests.as_user(:'uid_f');
select tests.expect_error(format('select public.approve_first_profile(%L, %L)', :'pa', :'r1'),
  'DK003', 'second approval is refused');

-- Self-approval: even a founder cannot approve a profile he owns.
select tests.as_superuser();
insert into public.app_roles (user_id, is_founder) values (:'uid_b', true);
select tests.as_user(:'uid_b');
select tests.expect_error(format('select public.approve_first_profile(%L, %L)', :'pb', :'rb1'),
  '42501', 'founder cannot approve his own profile');
select tests.as_superuser();
delete from public.app_roles where user_id = :'uid_b';

-- ===========================================================================
-- 4. Publication: approved revision only, then ordinary publishing
-- ===========================================================================
select tests.as_user(:'uid_b');
select tests.expect_error(format('select public.publish_profile(%L, %L, null)', :'pb', :'rb1'),
  'DK003', 'cannot publish without first approval');
select tests.expect_error(format('select public.publish_profile(%L, %L, null)', :'pa', :'r1'),
  '42501', 'B cannot publish A''s profile');
select tests.as_user(:'uid_v');
select tests.expect_error(format('select public.publish_profile(%L, %L, null)', :'pa', :'r1'),
  '42501', 'visitor cannot publish');
select tests.as_anon();
select tests.expect_error(format('select public.publish_profile(%L, %L, null)', :'pa', :'r1'),
  '42501', 'anon cannot execute publish_profile');

select tests.as_user(:'uid_a');
select tests.expect_error(format('select public.publish_profile(%L, %L, null)', :'pa', gen_random_uuid()),
  'DK001', 'stale draft expectation is refused');

-- First publication is no longer an owner action: approval already did it.
select tests.as_user(:'uid_a');
select tests.expect_error(format('select public.publish_profile(%L, %L, null)', :'pa', :'r1'),
  'DK001', 'the owner cannot repeat the first publication');
select tests.expect_error(format('select public.publish_profile(%L, %L, %L)', :'pa', :'r1', gen_random_uuid()),
  'DK001', 'wrong published expectation is refused');

select tests.as_anon();
select tests.expect_count('select id from public.public_profiles', 1, 'anon sees the published profile');
select tests.expect_true($q$select name = 'Alpha Events' from public.public_profiles where slug = 'owner-a'$q$,
  'public view shows the approved revision');
select tests.expect_count(format('select id from public.profile_revisions where id = %L', :'r1'), 1,
  'anon reads the published revision directly');
select tests.expect_count(format('select id from public.profile_revisions where id = %L', :'r2'), 0,
  'anon cannot read the draft revision');
select tests.as_user(:'uid_b');
select tests.expect_count(format('select id from public.profile_revisions where id = %L', :'r2'), 0,
  'B cannot read A''s draft revision');

-- Published revisions are frozen; drafts stay editable and private.
select tests.as_user(:'uid_a');
select tests.expect_affected(format($q$update public.profile_revisions set name = 'Changed' where id = %L$q$, :'r1'),
  0, 'owner cannot edit the published revision');
select tests.expect_affected(format($q$update public.profile_revisions set name = 'Alpha Events Reloaded' where id = %L$q$, :'r2'),
  1, 'owner can still edit the draft');
select tests.as_anon();
select tests.expect_true($q$select name = 'Alpha Events' from public.public_profiles where slug = 'owner-a'$q$,
  'draft edits stay invisible to the public');
select tests.as_superuser();
select tests.expect_error(format($q$update public.profile_revisions set name = 'Changed' where id = %L$q$, :'r1'),
  '55000', 'trigger freezes the published revision even for the table owner');
select tests.expect_error(format('delete from public.profile_revisions where id = %L', :'r1'),
  '55000', 'published revision cannot be deleted');
select tests.expect_error(format('update public.profiles set first_approved_revision_id = %L where id = %L', :'r2', :'pa'),
  '55000', 'first approval cannot be re-pointed');
select tests.expect_error(format('update public.profiles set approved_by = %L where id = %L', :'uid_a', :'pa'),
  '55000', 'approver cannot be rewritten');
select tests.expect_true(format('select confirmed_by = %L and confirmed_at is not null from public.profile_revisions where id = %L', :'uid_a', :'r1'),
  'publishing stamped the owner as confirming user');

-- Later publication needs no new founder approval.
select tests.as_user(:'uid_a');
select tests.expect_affected(format('update public.profiles set draft_revision_id = %L where id = %L', :'r2', :'pa'),
  1, 'owner selects the next draft');
select tests.expect_error(format('select public.publish_profile(%L, %L, null)', :'pa', :'r2'),
  'DK001', 'stale published expectation is refused');
select public.publish_profile(:'pa', :'r2', :'r1');
select tests.as_anon();
select tests.expect_true($q$select name = 'Alpha Events Reloaded' from public.public_profiles where slug = 'owner-a'$q$,
  'second revision goes live without a new approval');
select tests.as_user(:'uid_a');
select tests.expect_error(format('select public.publish_profile(%L, %L, %L)', :'pa', :'r2', :'r2'),
  'DK003', 'publishing the live revision again is refused');

-- ===========================================================================
-- 5. Events: creation, answer states, constraints
-- ===========================================================================
select tests.as_user(:'uid_b');
select tests.expect_error(format($q$insert into public.events (organizer_id, slug) values (%L, 'foreign-event')$q$, :'pa'),
  '42501', 'B cannot create an event for A''s profile');
select tests.as_user(:'uid_a');
select tests.expect_error(format($q$insert into public.events (organizer_id, slug, publication_state) values (%L, 'preset-state', 'published')$q$, :'pa'),
  '42501', 'client cannot preset publication_state');
select tests.expect_error(format($q$insert into public.events (organizer_id, slug, state_version) values (%L, 'preset-version', 5)$q$, :'pa'),
  '42501', 'client cannot preset state_version');
select tests.expect_error(format($q$insert into public.events (organizer_id, slug) values (%L, 'Bad_Slug')$q$, :'pa'),
  '23514', 'event slug format is enforced');
select tests.expect_affected(format($q$insert into public.events (organizer_id, slug) values (%L, 'summer-opening')$q$, :'pa'),
  1, 'owner creates an event shell');
select id as e1 from public.events where slug = 'summer-opening' \gset
select tests.new_event_image_use(:'e1') as use_e1 \gset

select tests.expect_error(format('select tests.ev_insert(%L, %L, %L)', :'e1', :'use_e1', '{"price_state":"provided","price_model":null}'),
  '23514', 'provided price needs a model');
select tests.expect_error(format('select tests.ev_insert(%L, %L, %L)', :'e1', :'use_e1', '{"price_state":"provided","price_model":"fixed"}'),
  '23514', 'fixed price needs an amount');
select tests.expect_error(format('select tests.ev_insert(%L, %L, %L)', :'e1', :'use_e1', '{"price_state":"provided","price_model":"unknown"}'),
  '23514', 'a provided price cannot be unknown');
select tests.expect_error(format('select tests.ev_insert(%L, %L, %L)', :'e1', :'use_e1', '{"price_model":"free"}'),
  '23514', 'unknown price state cannot carry the free model');
select tests.expect_error(format('select tests.ev_insert(%L, %L, %L)', :'e1', :'use_e1', '{"price_amount_minor":0}'),
  '23514', 'unknown price is never 0');
select tests.expect_error(format('select tests.ev_insert(%L, %L, %L)', :'e1', :'use_e1', '{"price_state":"unanswered","price_model":"free"}'),
  '23514', 'unanswered price cannot carry a value');
select tests.expect_error(format('select tests.ev_insert(%L, %L, %L)', :'e1', :'use_e1', '{"title":"   "}'),
  '23514', 'provided title cannot be blank');
select tests.expect_error(format('select tests.ev_insert(%L, %L, %L)', :'e1', :'use_e1', '{"title_state":"unanswered"}'),
  '23514', 'unanswered title cannot carry text');
select tests.expect_error(format('select tests.ev_insert(%L, %L, %L)', :'e1', :'use_e1', '{"start_at":null}'),
  '23514', 'provided start needs a value');
select tests.expect_error(format('select tests.ev_insert(%L, %L, %L)', :'e1', :'use_e1', '{"end_state":"provided"}'),
  '23514', 'provided end needs a value');
select tests.expect_error(format('select tests.ev_insert(%L, %L, %L)', :'e1', :'use_e1', '{"end_state":"provided","end_at":"2027-06-05 18:00:00+02"}'),
  '23514', 'end must be after start');
select tests.expect_error(format('select tests.ev_insert(%L, %L, %L)', :'e1', :'use_e1', '{"timezone":"UTC"}'),
  '23514', 'timezone is fixed to Europe/Berlin');
select tests.expect_error(format('select tests.ev_insert(%L, %L, %L)', :'e1', :'use_e1', '{"country_code":"de"}'),
  '23514', 'country code must be upper case ISO');
select tests.expect_error(format('select tests.ev_insert(%L, %L, %L)', :'e1', :'use_e1', '{"atmosphere_tags":"{a,b,c,d}"}'),
  '23514', 'more than three atmosphere tags are refused (P04)');
select tests.expect_error(format('select tests.ev_insert(%L, %L, %L)', :'e1', :'use_e1', '{"atmosphere_tags":"{}"}'),
  '23514', 'provided atmosphere needs tags or a description');
select tests.expect_error(format('select tests.ev_insert(%L, %L, %L)', :'e1', :'use_e1', '{"access_routes":[]}'),
  '23514', 'provided access needs a route');
select tests.expect_error(format('select tests.ev_insert(%L, %L, %L)', :'e1', :'use_e1', '{"access_routes":[{"kind":"teleport"}]}'),
  '23514', 'access route kind must be a known kind');
select tests.expect_error(format('select tests.ev_insert(%L, %L, %L)', :'e1', :'use_e1', '{"access_routes":[{"url":"x"}]}'),
  '23514', 'access route needs a kind');
select tests.expect_error(format('select tests.ev_insert(%L, %L, %L)', :'e1', :'use_e1', '{"access_routes":["walk_in"]}'),
  '23514', 'access route must be an object');
select tests.expect_error(format('select tests.ev_insert(%L, %L, %L)', :'e1', :'use_e1', '{"revision_no":9}'),
  '42501', 'client cannot choose revision_no');
select tests.expect_error(format('select tests.ev_insert(%L, %L, %L)', :'e1', :'use_e1', '{"confirmed_at":"2027-01-01"}'),
  '42501', 'client cannot insert a confirmed revision');
select tests.expect_error(format('select tests.ev_insert(%L, %L, %L)', :'e1', :'use_e1', jsonb_build_object('created_by', :'uid_b')::text),
  '42501', 'client cannot forge created_by');
select tests.expect_error(format('select tests.ev_insert(%L, %L)', :'e1', :'use_a'),
  '23503', 'an event cannot use another entity''s media use');
select tests.as_user(:'uid_b');
select tests.expect_error(format('select tests.ev_insert(%L, %L)', :'e1', :'use_e1'),
  '42501', 'B cannot add revisions to A''s event');

-- P03: an own atmosphere description alone satisfies the requirement.
select tests.as_user(:'uid_a');
select tests.expect_ok(format('select tests.ev_insert(%L, %L, %L)', :'e1', :'use_e1', '{"atmosphere_tags":"{}","atmosphere_description":"Quiet and dark"}'),
  'own atmosphere description is valid without tags (P03)');
-- Unknown price is a valid, deliberate answer (P07).
select tests.ev_insert(:'e1', :'use_e1') as ev1 \gset
select tests.expect_affected(format('update public.events set draft_revision_id = %L where id = %L', :'ev1', :'e1'),
  1, 'owner selects the event draft');

-- Event image confirmation (Slice 4): the description is optional (Slice 5)
-- and the database reserves events/<event id>/<use id>.<ext>. A path, not a file.
select tests.expect_true(format('select tests.confirm_event_image_with_alt_is_null(%L, null)', :'e1'),
  'an event image can be confirmed without a description');
select tests.expect_true(format('select tests.confirm_event_image_with_alt_is_null(%L, %L)', :'e1', E' \n '),
  'a blank event image description is stored as NULL');
select tests.new_event_image_use(:'e1', false) as use_e3 \gset
select tests.expect_true(format('select public_object_path is null and confirmed_at is null from public.media_uses where id = %L', :'use_e3'),
  'an unconfirmed event image use has no public path');
select tests.expect_error(format('update public.media_uses set public_object_path = %L where id = %L', 'events/x.jpg', :'use_e3'),
  '42501', 'client cannot write public_object_path of an event image');
select tests.as_user(:'uid_b');
select tests.expect_affected(format('update public.media_uses set confirmed_at = now() where id = %L', :'use_e3'),
  0, 'B cannot confirm A''s event image use');
select tests.as_user(:'uid_a');
select tests.expect_affected(format('update public.media_uses set confirmed_at = now() where id = %L', :'use_e3'),
  1, 'A confirms the event image use');
select tests.new_event_image_use_mime(:'e1', 'image/webp') as use_e4 \gset
select tests.as_superuser();
select tests.expect_true(format($q$select public_object_path = 'events/' || event_id || '/' || id || '.jpg' and confirmed_by = %L from public.media_uses where id = %L$q$, :'uid_a', :'use_e3'),
  'confirming an event image reserves events/<event>/<use>.jpg and stamps the user');
select tests.expect_true(format($q$select public_object_path like 'events/%%.webp' from public.media_uses where id = %L$q$, :'use_e4'),
  'the reserved event path carries the extension of the asset type');
select public_object_path as ppe3 from public.media_uses where id = :'use_e3' \gset
select tests.as_user(:'uid_a');
select tests.expect_error(format($q$insert into storage.objects (bucket_id, name) values ('public-media', %L)$q$, :'ppe3'),
  '42501', 'an event image path cannot be written before the event is published');

-- ===========================================================================
-- 6. Event approval, publication, privacy of drafts, status-only cancellation
-- ===========================================================================
select tests.expect_error(format($q$select public.publish_event(%L, %L, null, 0, 'scheduled')$q$, :'e1', :'ev1'),
  '22023', 'a profile-approved event needs both declarations to be published by its owner');
-- Confirming the image reserves a path (Slice 4). Clear it to model an event
-- whose image has no public path yet.
select tests.as_superuser();
update public.media_uses set public_object_path = null where id = :'use_e1';
select tests.as_user(:'uid_f');
select tests.expect_error(format('select public.approve_first_event(%L, %L)', :'e1', :'ev1'),
  'DK002', 'event approval refuses a missing public image', 'event_image');
select tests.as_superuser();
update public.media_uses set public_object_path = 'public/events/' || id where id = :'use_e1';

select tests.as_user(:'uid_a');
select tests.expect_error(format('select public.approve_first_event(%L, %L)', :'e1', :'ev1'),
  '42501', 'owner cannot approve the own event');
select tests.as_user(:'uid_f');
select tests.expect_error(format('select public.approve_first_event(%L, %L)', :'e1', gen_random_uuid()),
  'DK001', 'event approval of a different revision is refused');
select public.approve_first_event(:'e1', :'ev1');

-- A founder who owns the organizer still cannot approve (checked before state).
select tests.as_superuser();
insert into public.app_roles (user_id, is_founder) values (:'uid_a', true);
select tests.as_user(:'uid_a');
select tests.expect_error(format('select public.approve_first_event(%L, %L)', :'e1', :'ev1'),
  '42501', 'founder cannot approve an event of his own organizer');
select tests.as_superuser();
delete from public.app_roles where user_id = :'uid_a';

-- Attack: swap the draft after approval.
select tests.as_user(:'uid_a');
select tests.ev_insert(:'e1', :'use_e1', '{"title":"Sneaky"}') as ev_bad \gset
select tests.expect_affected(format('update public.events set draft_revision_id = %L where id = %L', :'ev_bad', :'e1'),
  1, 'owner points the event draft at an unreviewed revision');
select tests.expect_error(format($q$select public.publish_event(%L, %L, null, 0, 'scheduled')$q$, :'e1', :'ev_bad'),
  'DK001', 'unreviewed event revision cannot be first-published');
select tests.expect_affected(format('update public.events set draft_revision_id = %L where id = %L', :'ev1', :'e1'),
  1, 'owner restores the approved event draft');
select tests.expect_error(format($q$select public.publish_event(%L, %L, null, 7, 'scheduled')$q$, :'e1', :'ev1'),
  'DK001', 'stale state_version is refused');
select tests.expect_error(format($q$select public.publish_event(%L, %L, null, 0, 'rescheduled')$q$, :'e1', :'ev1'),
  'DK001', 'wrong expected status is refused');

select public.publish_event(:'e1', :'ev1', null, 0, 'scheduled');

select tests.as_superuser();
select tests.expect_true(format($q$select state_version = 1 and public_status = 'scheduled' and published_revision_id = %L from public.events where id = %L$q$, :'ev1', :'e1'),
  'publishing bumps state_version');
select tests.as_anon();
select tests.expect_count('select id from public.public_events', 1, 'anon sees the published event');
select tests.expect_true($q$select price_state = 'unknown' and price_model = 'unknown' and price_amount_minor is null and end_at is null from public.public_events where slug = 'summer-opening'$q$,
  'unknown price and unknown end stay unknown publicly (P07, P12)');

-- A private change stays private.
select tests.as_user(:'uid_a');
select tests.ev_insert(:'e1', :'use_e1', '{"title":"Renamed privately"}') as ev2 \gset
select tests.expect_affected(format('update public.events set draft_revision_id = %L where id = %L', :'ev2', :'e1'),
  1, 'owner prepares a private change');
select tests.as_anon();
select tests.expect_true($q$select title = 'Summer Opening' from public.public_events where slug = 'summer-opening'$q$,
  'private event change is not public');
select tests.expect_count(format('select id from public.event_revisions where id = %L', :'ev2'), 0,
  'anon cannot read the draft event revision');

-- Cancellation changes status only.
select tests.as_user(:'uid_b');
select tests.expect_error(format($q$select public.cancel_event(%L, %L, 1, 'scheduled')$q$, :'e1', :'ev1'),
  '42501', 'B cannot cancel A''s event');
select tests.as_user(:'uid_a');
select tests.expect_error(format($q$select public.cancel_event(%L, %L, 0, 'scheduled')$q$, :'e1', :'ev1'),
  'DK001', 'cancellation with a stale version is refused');
select tests.expect_error(format($q$select public.cancel_event(%L, %L, 1, 'scheduled')$q$, :'e1', gen_random_uuid()),
  'DK001', 'cancellation of a different published revision is refused');
select tests.expect_error(format($q$select public.cancel_event(%L, %L, 1, 'rescheduled')$q$, :'e1', :'ev1'),
  'DK001', 'cancellation with the wrong status is refused');
select tests.expect_error(format($q$update public.events set public_status = 'cancelled' where id = %L$q$, :'e1'),
  '42501', 'client cannot set public_status directly');
select public.cancel_event(:'e1', :'ev1', 1, 'scheduled');

select tests.as_superuser();
select tests.expect_true(format($q$select public_status = 'cancelled' and published_revision_id = %L and draft_revision_id = %L and state_version = 2 and cancelled_by = %L and cancelled_at is not null from public.events where id = %L$q$, :'ev1', :'ev2', :'uid_a', :'e1'),
  'cancel_event changes status only and leaves both revisions untouched (P23)');
select tests.as_anon();
select tests.expect_true($q$select public_status = 'cancelled' and title = 'Summer Opening' from public.public_events where slug = 'summer-opening'$q$,
  'cancelled event shows the old public text, not the private draft');
select tests.as_user(:'uid_a');
select tests.expect_error(format($q$select public.publish_event(%L, %L, %L, 2, 'cancelled')$q$, :'e1', :'ev2', :'ev1'),
  'DK003', 'a cancelled event cannot be published again');
select tests.expect_error(format($q$select public.cancel_event(%L, %L, 2, 'cancelled')$q$, :'e1', :'ev1'),
  'DK003', 'a cancelled event cannot be cancelled twice');
select tests.expect_error(format($q$select public.reschedule_event(%L, %L, %L, 2, 'cancelled')$q$, :'e1', :'ev2', :'ev1'),
  'DK003', 'a cancelled event cannot be rescheduled');

-- Rescheduling: a second event goes through the real approval path first.
select tests.expect_affected(format($q$insert into public.events (organizer_id, slug) values (%L, 'second-night')$q$, :'pa'),
  1, 'owner creates a second event');
select id as e2 from public.events where slug = 'second-night' \gset
select tests.new_event_image_use(:'e2') as use_e2 \gset
select tests.ev_insert(:'e2', :'use_e2') as evs1 \gset
select tests.expect_ok(format('update public.events set draft_revision_id = %L where id = %L', :'evs1', :'e2'),
  'owner selects the second event draft');
select tests.as_superuser();
update public.media_uses set public_object_path = 'public/events/' || id where id = :'use_e2';
select tests.as_user(:'uid_f');
select public.approve_first_event(:'e2', :'evs1');
select tests.as_user(:'uid_a');
select public.publish_event(:'e2', :'evs1', null, 0, 'scheduled');
select tests.ev_insert(:'e2', :'use_e2') as evs_same \gset
select tests.expect_ok(format('update public.events set draft_revision_id = %L where id = %L', :'evs_same', :'e2'),
  'owner prepares an unchanged draft');
select tests.expect_error(format($q$select public.reschedule_event(%L, %L, %L, 1, 'scheduled')$q$, :'e2', :'evs_same', :'evs1'),
  'DK003', 'reschedule needs a changed start time');
select tests.ev_insert(:'e2', :'use_e2', '{"start_at":"2027-06-06 19:00:00+02"}') as evs2 \gset
select tests.expect_ok(format('update public.events set draft_revision_id = %L where id = %L', :'evs2', :'e2'),
  'owner prepares the new start');
select tests.expect_error(format($q$select public.reschedule_event(%L, %L, %L, 0, 'scheduled')$q$, :'e2', :'evs2', :'evs1'),
  'DK001', 'reschedule with a stale version is refused');
select public.reschedule_event(:'e2', :'evs2', :'evs1', 1, 'scheduled');
select tests.as_superuser();
select tests.expect_true(format($q$select public_status = 'rescheduled' and published_revision_id = %L and state_version = 2 from public.events where id = %L$q$, :'evs2', :'e2'),
  'reschedule publishes the new revision and marks the status');
select tests.as_anon();
select tests.expect_true($q$select start_at = '2027-06-06 19:00:00+02'::timestamptz and public_status = 'rescheduled' from public.public_events where slug = 'second-night'$q$,
  'public view shows the new start');

-- Postponing without a date: status only, a replacement date can follow.
select tests.as_user(:'uid_b');
select tests.expect_error(format($q$select public.postpone_event(%L, %L, 2, 'rescheduled')$q$, :'e2', :'evs2'),
  '42501', 'B cannot postpone A''s event');
select tests.as_user(:'uid_a');
select tests.ev_insert(:'e2', :'use_e2', '{"title":"Private rename"}') as evs3 \gset
select tests.expect_ok(format('update public.events set draft_revision_id = %L where id = %L', :'evs3', :'e2'),
  'owner prepares a private change before postponing');
select tests.expect_error(format($q$select public.postpone_event(%L, %L, 1, 'rescheduled')$q$, :'e2', :'evs2'),
  'DK001', 'postponing with a stale version is refused');
select tests.expect_error(format($q$select public.postpone_event(%L, %L, 2, 'scheduled')$q$, :'e2', :'evs2'),
  'DK001', 'postponing with the wrong status is refused');
select tests.expect_error(format($q$select public.postpone_event(%L, %L, 2, 'rescheduled')$q$, :'e2', gen_random_uuid()),
  'DK001', 'postponing a different published revision is refused');
select public.postpone_event(:'e2', :'evs2', 2, 'rescheduled');
select tests.as_superuser();
select tests.expect_true(format($q$select public_status = 'postponed_undated' and published_revision_id = %L and draft_revision_id = %L and state_version = 3 from public.events where id = %L$q$, :'evs2', :'evs3', :'e2'),
  'postpone_event changes status only and leaves both revisions untouched');
select tests.expect_true(format($q$select count(*) = 1 from public.publication_audit where entity_id = %L and action = 'postpone' and revision_id = %L$q$, :'e2', :'evs2'),
  'postponing is audited');
select tests.as_anon();
select tests.expect_true($q$select public_status = 'postponed_undated' and title <> 'Private rename' from public.public_events where slug = 'second-night'$q$,
  'public view shows the status and not the private draft');
select tests.as_user(:'uid_a');
select tests.expect_error(format($q$select public.postpone_event(%L, %L, 3, 'postponed_undated')$q$, :'e2', :'evs2'),
  'DK003', 'an already postponed event cannot be postponed again');
select tests.ev_insert(:'e2', :'use_e2', '{"start_at":"2027-07-10 19:00:00+02"}') as evs4 \gset
select tests.expect_ok(format('update public.events set draft_revision_id = %L where id = %L', :'evs4', :'e2'),
  'owner prepares a replacement date');
select public.reschedule_event(:'e2', :'evs4', :'evs2', 3, 'postponed_undated');
select tests.as_superuser();
select tests.expect_true(format($q$select public_status = 'rescheduled' and published_revision_id = %L and state_version = 4 from public.events where id = %L$q$, :'evs4', :'e2'),
  'a replacement date can be published after postponing');
select tests.as_anon();
select tests.expect_true($q$select start_at = '2027-07-10 19:00:00+02'::timestamptz and public_status = 'rescheduled' from public.public_events where slug = 'second-night'$q$,
  'public view shows the replacement date');

-- A cancelled event can neither be postponed nor rescheduled.
select tests.as_user(:'uid_a');
select tests.expect_error(format($q$select public.postpone_event(%L, %L, 2, 'cancelled')$q$, :'e1', :'ev1'),
  'DK003', 'a cancelled event cannot be postponed');

-- Rescheduling that changes the date only: the public revision is a copy of the
-- live one, the private draft keeps its other changes and takes over the date.
select tests.as_user(:'uid_a');
select tests.expect_affected(format($q$insert into public.events (organizer_id, slug) values (%L, 'third-night')$q$, :'pa'),
  1, 'owner creates a third event');
select id as e3 from public.events where slug = 'third-night' \gset
select tests.new_event_image_use(:'e3') as use_e3 \gset
select tests.ev_insert(:'e3', :'use_e3', '{"title":"Third Night"}') as evt1 \gset
select tests.expect_ok(format('update public.events set draft_revision_id = %L where id = %L', :'evt1', :'e3'),
  'owner selects the third event draft');
select tests.as_superuser();
update public.media_uses set public_object_path = 'public/events/' || id where id = :'use_e3';
select tests.as_user(:'uid_f');
select public.approve_first_event(:'e3', :'evt1');
select tests.as_user(:'uid_a');
select public.publish_event(:'e3', :'evt1', null, 0, 'scheduled');
select tests.ev_insert(:'e3', :'use_e3', '{"title":"Private Title","description":"Private text."}') as evt2 \gset
select tests.expect_ok(format('update public.events set draft_revision_id = %L where id = %L', :'evt2', :'e3'),
  'owner has a private draft with other changes');

select tests.as_user(:'uid_b');
select tests.expect_error(format($q$select public.reschedule_event_date(%L, %L, 1, 'scheduled', '2027-08-01 20:00:00+02', null)$q$, :'e3', :'evt1'),
  '42501', 'B cannot reschedule A''s event');
select tests.as_user(:'uid_a');
select tests.expect_error(format($q$select public.reschedule_event_date(%L, %L, 0, 'scheduled', '2027-08-01 20:00:00+02', null)$q$, :'e3', :'evt1'),
  'DK001', 'date change with a stale version is refused');
select tests.expect_error(format($q$select public.reschedule_event_date(%L, %L, 1, 'rescheduled', '2027-08-01 20:00:00+02', null)$q$, :'e3', :'evt1'),
  'DK001', 'date change with the wrong status is refused');
select tests.expect_error(format($q$select public.reschedule_event_date(%L, %L, 1, 'scheduled', '2027-08-01 20:00:00+02', null)$q$, :'e3', gen_random_uuid()),
  'DK001', 'date change against another published revision is refused');
select tests.expect_error(format($q$select public.reschedule_event_date(%L, %L, 1, 'scheduled', '2027-06-05 19:00:00+02', null)$q$, :'e3', :'evt1'),
  'DK003', 'the new start must differ from the current one');
select tests.expect_error(format($q$select public.reschedule_event_date(%L, %L, 1, 'scheduled', null, null)$q$, :'e3', :'evt1'),
  '22023', 'a new start is required');
select tests.expect_error(format($q$select public.reschedule_event_date(%L, %L, 1, 'scheduled', '2027-08-01 20:00:00+02', '2027-08-01 19:00:00+02')$q$, :'e3', :'evt1'),
  '22023', 'the end must be after the start');
select tests.expect_error(format($q$select public.reschedule_event_date(%L, %L, 2, 'cancelled', '2027-08-01 20:00:00+02', null)$q$, :'e1', :'ev1'),
  'DK003', 'a cancelled event cannot get a new date');

select public.reschedule_event_date(:'e3', :'evt1', 1, 'scheduled', '2027-08-01 20:00:00+02', '2027-08-02 02:00:00+02');
select tests.as_superuser();
select published_revision_id as evt3 from public.events where id = :'e3' \gset
select tests.expect_true(format($q$select public_status = 'rescheduled' and state_version = 2 and published_revision_id not in (%L, %L) and draft_revision_id = %L from public.events where id = %L$q$, :'evt1', :'evt2', :'evt2', :'e3'),
  'the date change publishes a new revision and leaves the draft pointer');
select tests.expect_true(format($q$select title = 'Third Night' and description = 'A first night.' and start_at = '2027-08-01 20:00:00+02' and end_at = '2027-08-02 02:00:00+02' and end_state = 'provided' and confirmed_at is not null and confirmed_by = %L and event_image_use_id = %L from public.event_revisions where id = %L$q$, :'uid_a', :'use_e3', :'evt3'),
  'the new public revision is the live text with the new date, confirmed by the owner');
select tests.expect_true(format($q$select (to_jsonb(a) - array['id','revision_no','created_at','confirmed_at','confirmed_by','start_at','end_at','end_state']) = (to_jsonb(b) - array['id','revision_no','created_at','confirmed_at','confirmed_by','start_at','end_at','end_state']) from public.event_revisions a, public.event_revisions b where a.id = %L and b.id = %L$q$, :'evt1', :'evt3'),
  'the copy changes nothing but the date (every other column equal)');
select tests.expect_true(format($q$select title = 'Private Title' and description = 'Private text.' and start_at = '2027-08-01 20:00:00+02' and end_at = '2027-08-02 02:00:00+02' from public.event_revisions where id = %L$q$, :'evt2'),
  'the private draft keeps its changes and takes over the date');
select tests.expect_true(format($q$select start_at = '2027-06-05 19:00:00+02' from public.event_revisions where id = %L$q$, :'evt1'),
  'the earlier public revision stays as it was');
select tests.expect_true(format($q$select count(*) = 1 from public.publication_audit where entity_id = %L and action = 'reschedule' and revision_id = %L$q$, :'e3', :'evt3'),
  'the date change is audited');
select tests.as_anon();
select tests.expect_true($q$select title = 'Third Night' and description = 'A first night.' and start_at = '2027-08-01 20:00:00+02' and end_at = '2027-08-02 02:00:00+02' and public_status = 'rescheduled' from public.public_events where slug = 'third-night'$q$,
  'public view shows the new date and not the private text');

-- From "new date follows", without an end.
select tests.as_user(:'uid_a');
select public.postpone_event(:'e3', :'evt3', 2, 'rescheduled');
select public.reschedule_event_date(:'e3', :'evt3', 3, 'postponed_undated', '2027-09-01 20:00:00+02', null);
select tests.as_superuser();
select published_revision_id as evt4 from public.events where id = :'e3' \gset
select tests.expect_true(format($q$select public_status = 'rescheduled' and state_version = 4 from public.events where id = %L$q$, :'e3'),
  'a replacement date works after postponing');
select tests.expect_true(format($q$select start_at = '2027-09-01 20:00:00+02' and end_at is null and end_state = 'unknown' from public.event_revisions where id = %L$q$, :'evt4'),
  'no end stays an unknown end');
select tests.expect_true(format($q$select start_at = '2027-09-01 20:00:00+02' and end_at is null and end_state = 'unknown' and title = 'Private Title' from public.event_revisions where id = %L$q$, :'evt2'),
  'the draft takes over the missing end as well');

-- A draft that is the live revision moves to the new revision.
select tests.as_user(:'uid_a');
select tests.expect_ok(format('update public.events set draft_revision_id = %L where id = %L', :'evt4', :'e3'),
  'owner points the draft at the live revision');
select public.reschedule_event_date(:'e3', :'evt4', 4, 'rescheduled', '2027-10-01 20:00:00+02', null);
select tests.as_superuser();
select tests.expect_true(format($q$select draft_revision_id = published_revision_id and draft_revision_id <> %L from public.events where id = %L$q$, :'evt4', :'e3'),
  'a draft equal to the live revision follows the new live revision');

-- A frozen draft is copied, never edited.
select published_revision_id as evt5 from public.events where id = :'e3' \gset
select tests.as_user(:'uid_a');
select tests.expect_ok(format('update public.events set draft_revision_id = %L where id = %L', :'evt1', :'e3'),
  'owner points the draft at an old confirmed revision');
select public.reschedule_event_date(:'e3', :'evt5', 5, 'rescheduled', '2027-11-01 20:00:00+01', null);
select tests.as_superuser();
select tests.expect_true(format($q$select e.draft_revision_id not in (%L, e.published_revision_id) and r.confirmed_at is null and r.start_at = '2027-11-01 20:00:00+01' and r.title = 'Third Night' from public.events e join public.event_revisions r on r.id = e.draft_revision_id where e.id = %L$q$, :'evt1', :'e3'),
  'a frozen draft becomes a new unconfirmed copy with the new date');
select tests.expect_true(format($q$select start_at = '2027-06-05 19:00:00+02' from public.event_revisions where id = %L$q$, :'evt1'),
  'the frozen revision itself is untouched');

-- ===========================================================================
-- 7. Cross-role access matrix: founder, owners, visitor, anon, direct tables
-- ===========================================================================
-- Founder reads, but writes only through functions.
select tests.as_user(:'uid_f');
select tests.expect_true('select count(*) >= 3 from public.profile_revisions', 'founder reads all profile revisions');
select tests.expect_true('select count(*) >= 4 from public.event_revisions', 'founder reads all event revisions');
select tests.expect_affected(format($q$update public.profiles set draft_revision_id = null where id = %L$q$, :'pa'),
  0, 'founder updates no profile row directly (no policy)');
select tests.expect_affected(format($q$update public.profile_revisions set name = 'x' where id = %L$q$, :'r2'),
  0, 'founder updates no revision row directly (no policy)');
select tests.expect_affected(format($q$update public.events set draft_revision_id = null where id = %L$q$, :'e1'),
  0, 'founder updates no event row directly (no policy)');

-- Role table: nobody grants himself the founder role.
select tests.as_user(:'uid_v');
select tests.expect_error(format('insert into public.app_roles (user_id, is_founder) values (%L, true)', :'uid_v'),
  '42501', 'visitor cannot grant himself the founder role');
select tests.as_user(:'uid_a');
select tests.expect_error(format('update public.app_roles set is_founder = true where user_id = %L', :'uid_a'),
  '42501', 'owner cannot promote himself');
select tests.expect_count('select user_id from public.app_roles', 0, 'owner sees no foreign role rows');
select tests.as_user(:'uid_f');
select tests.expect_count('select user_id from public.app_roles', 1, 'founder sees his own role row');
select tests.as_anon();
select tests.expect_error('select user_id from public.app_roles', '42501', 'anon cannot read app_roles');

-- B versus A's private data
select tests.as_user(:'uid_b');
select tests.expect_count(format('select id from public.events where id = %L', :'e1'), 1,
  'B sees A''s published event as any visitor would');
select tests.expect_count(format('select id from public.event_revisions where id = %L', :'ev2'), 0,
  'B cannot read A''s draft event revision');
select tests.expect_affected(format('update public.events set draft_revision_id = %L where id = %L', :'ev1', :'e1'),
  0, 'B cannot update A''s event');
select tests.expect_affected(format('update public.profiles set draft_revision_id = %L where id = %L', :'r1', :'pa'),
  0, 'B cannot update A''s profile');
select tests.expect_count(format('select id from public.media_assets where id = (select asset_id from public.media_uses where id = %L)', :'use_a'), 0,
  'B cannot read A''s asset');

-- Nobody deletes anything through the API.
select tests.as_user(:'uid_a');
select tests.expect_error('delete from public.profiles', '42501', 'owner cannot delete profiles');
select tests.expect_error('delete from public.events', '42501', 'owner cannot delete events');
select tests.expect_error('delete from public.profile_revisions', '42501', 'owner cannot delete profile revisions');
select tests.expect_error('delete from public.event_revisions', '42501', 'owner cannot delete event revisions');
select tests.expect_error('delete from public.media_assets', '42501', 'owner cannot delete assets');
select tests.expect_error('delete from public.media_uses', '42501', 'owner cannot delete media uses');
select tests.expect_error('delete from public.publication_audit', '42501', 'owner cannot delete audit rows');
select tests.as_user(:'uid_f');
select tests.expect_error('delete from public.profiles', '42501', 'founder cannot delete profiles');
select tests.as_anon();
select tests.expect_error('delete from public.profiles', '42501', 'anon cannot delete profiles');
select tests.expect_error('insert into public.events (organizer_id, slug) values (gen_random_uuid(), ''anon-event'')',
  '42501', 'anon cannot insert events');
select tests.expect_error('update public.profiles set slug = ''x''', '42501', 'anon cannot update profiles');
select tests.expect_error('select id from public.media_assets', '42501', 'anon cannot read media_assets');
select tests.expect_error('select id from public.publication_audit', '42501', 'anon cannot read the audit log');

-- Audit trail: visible to the owner without actor, never writable.
select tests.as_user(:'uid_a');
select tests.expect_true(format($q$select count(*) = 5 from public.publication_audit where entity_id = %L$q$, :'pa'),
  'owner reads the complete audit trail of the own profile (provision, submit, approve, 2x publish)');
select tests.expect_count(format('select id from public.publication_audit where entity_id = %L', :'pb'), 0,
  'owner does not see audit rows of other profiles');
select tests.expect_error('select actor_id from public.publication_audit', '42501', 'actor_id is hidden from clients');
select tests.expect_error(format($q$insert into public.publication_audit (actor_id, entity_type, entity_id, action) values (%L, 'profile', %L, 'publish')$q$, :'uid_a', :'pa'),
  '42501', 'clients cannot write audit rows');
select tests.as_superuser();
select tests.expect_error('update public.publication_audit set action = ''cancel''', '55000', 'audit rows cannot be updated');
select tests.expect_error('delete from public.publication_audit', '55000', 'audit rows cannot be deleted');
select tests.expect_error('truncate public.publication_audit', '55000', 'audit log cannot be truncated');
select tests.expect_true(format($q$select count(*) = 1 from public.publication_audit where entity_id = %L and action = 'cancel'$q$, :'e1'),
  'cancellation is audited exactly once');

-- Internal functions are unreachable for clients.
select tests.as_user(:'uid_a');
select tests.expect_error(format('select app_private.profile_gaps(%L)', :'r1'), '42501', 'authenticated cannot call profile_gaps');
select tests.expect_error(format('select app_private.event_gaps(%L)', :'ev1'), '42501', 'authenticated cannot call event_gaps');
select tests.as_anon();
select tests.expect_error('select app_private.is_founder()', '42501', 'anon cannot call is_founder');

-- my_profiles: the only way for a client to learn its own assignment.
select tests.as_user(:'uid_a');
select tests.expect_count('select id from public.my_profiles', 1, 'owner A sees exactly one assigned profile');
select tests.expect_true(format($q$select id = %L from public.my_profiles$q$, :'pa'),
  'owner A sees the own profile in my_profiles');
select tests.as_user(:'uid_b');
select tests.expect_count('select id from public.my_profiles', 1, 'owner B sees exactly one assigned profile');
select tests.expect_true(format($q$select id = %L from public.my_profiles$q$, :'pb'),
  'owner B sees the own profile in my_profiles');
select tests.as_user(:'uid_v');
select tests.expect_count('select id from public.my_profiles', 0,
  'visitor without assignment sees no profile in my_profiles');
select tests.as_user(:'uid_f');
select tests.expect_count('select id from public.my_profiles', 0,
  'founder owns no profile and so sees none in my_profiles');
select tests.as_anon();
select tests.expect_error('select id from public.my_profiles', '42501', 'anon cannot read my_profiles');
select tests.as_user(:'uid_a');
select tests.expect_error('select owner_id from public.my_profiles', '42703', 'my_profiles exposes no owner_id');
select tests.expect_error(format($q$update public.my_profiles set slug = 'x' where id = %L$q$, :'pa'),
  '55000', 'my_profiles is not updatable (join view, and no UPDATE privilege either)');
-- The public published profile of another organizer is visible in profiles,
-- but never counts as "mine".
select tests.expect_true(format($q$select count(*) = 0 from public.my_profiles where id <> %L$q$, :'pa'),
  'my_profiles never lists foreign profiles');

-- ===========================================================================
-- 7b. Media storage: private originals, public bucket only for published images
-- ===========================================================================
select tests.as_superuser();
select public_object_path as pp from public.media_uses where id = :'use_a' \gset
select tests.expect_true($q$select public and file_size_limit = 5242880 from storage.buckets where id = 'public-media'$q$,
  'public-media is public with a size limit');
select tests.expect_true($q$select not public and file_size_limit = 5242880 from storage.buckets where id = 'private-media'$q$,
  'private-media is private with a size limit');
select tests.expect_true($q$select allowed_mime_types = array['image/jpeg','image/png','image/webp'] from storage.buckets where id in ('private-media','public-media') group by allowed_mime_types$q$,
  'both buckets accept only jpeg, png and webp');
select tests.expect_true($q$select array_agg(policyname::text order by policyname::text) = array['private_media_insert_own','private_media_select','public_media_insert_published_profile_image','public_media_select'] from pg_policies where schemaname = 'storage' and tablename = 'objects'$q$,
  'storage.objects carries exactly our four policies (no update, no delete)');

-- private originals: own prefix only
select tests.as_user(:'uid_a');
select tests.expect_affected(format($q$insert into storage.objects (bucket_id, name) values ('private-media', %L)$q$, :'uid_a' || '/original-a.jpg'),
  1, 'A uploads below the own prefix');
select tests.expect_error(format($q$insert into storage.objects (bucket_id, name) values ('private-media', %L)$q$, :'uid_b' || '/planted.jpg'),
  '42501', 'A cannot upload below B''s prefix');
select tests.expect_error($q$insert into storage.objects (bucket_id, name) values ('private-media', 'no-prefix.jpg')$q$,
  '42501', 'an upload without the user prefix is refused');
select tests.expect_count($q$select id from storage.objects where bucket_id = 'private-media'$q$, 1, 'A sees the own original');
select tests.expect_affected($q$update storage.objects set name = name || 'x' where bucket_id = 'private-media'$q$,
  0, 'clients cannot rename objects');
-- (No DELETE test: real Storage blocks direct deletes with its own trigger; the
-- policy inventory above proves that no DELETE policy exists.)
select tests.as_user(:'uid_b');
select tests.expect_count($q$select id from storage.objects where bucket_id = 'private-media'$q$, 0, 'B cannot see A''s original');
select tests.as_user(:'uid_v');
select tests.expect_count($q$select id from storage.objects where bucket_id = 'private-media'$q$, 0, 'a visitor cannot see A''s original');
select tests.as_user(:'uid_f');
select tests.expect_count($q$select id from storage.objects where bucket_id = 'private-media'$q$, 1, 'the founder can read originals');
select tests.expect_error(format($q$insert into storage.objects (bucket_id, name) values ('private-media', %L)$q$, :'uid_a' || '/founder-plant.jpg'),
  '42501', 'the founder cannot write into A''s prefix');
select tests.as_anon();
select tests.expect_count($q$select id from storage.objects where bucket_id = 'private-media'$q$, 0, 'anon cannot see originals');
select tests.expect_error(format($q$insert into storage.objects (bucket_id, name) values ('private-media', %L)$q$, :'uid_a' || '/anon.jpg'),
  '42501', 'anon cannot upload');

-- public bucket: only the path reserved by the published revision, only its owner
select tests.as_user(:'uid_b');
select tests.expect_error(format($q$insert into storage.objects (bucket_id, name) values ('public-media', %L)$q$, :'pp'),
  '42501', 'B cannot write A''s published image path');
select tests.as_user(:'uid_a');
select tests.expect_error(format($q$insert into storage.objects (bucket_id, name) values ('public-media', %L)$q$, 'profiles/' || :'pa' || '/other.jpg'),
  '42501', 'A cannot write any other public path');
select tests.expect_error($q$insert into storage.objects (bucket_id, name) values ('public-media', 'anything.jpg')$q$,
  '42501', 'A cannot write an arbitrary public path');
select tests.expect_affected(format($q$insert into storage.objects (bucket_id, name) values ('public-media', %L)$q$, :'pp'),
  1, 'A copies the published image to its reserved public path');
select tests.as_anon();
select tests.expect_count($q$select id from storage.objects where bucket_id = 'public-media'$q$, 1, 'anon reads the published image');
select tests.expect_error(format($q$insert into storage.objects (bucket_id, name) values ('public-media', %L)$q$, :'pp' || '.copy'),
  '42501', 'anon cannot write to the public bucket');

-- a new draft image of a published profile stays out of the public bucket
select tests.as_user(:'uid_a');
select tests.new_profile_image_use(:'pa', true) as use_a2 \gset
select tests.new_profile_image_use_mime(:'pa', 'image/webp') as use_a3 \gset
select tests.as_superuser();
select public_object_path as ppa2 from public.media_uses where id = :'use_a2' \gset
select tests.expect_true(format($q$select public_object_path like '%%.webp' from public.media_uses where id = %L$q$, :'use_a3'),
  'the reserved path carries the extension of the asset type');
select tests.as_user(:'uid_a');
select tests.expect_affected(
  format($q$insert into public.profile_revisions (profile_id, name, short_intro, public_contact, profile_image_use_id, created_by) values (%L, 'Next draft', 'New image', 'x@example.test', %L, %L)$q$, :'pa', :'use_a2', :'uid_a'),
  1, 'A starts a new revision with a new image');
select id as r3 from public.profile_revisions where profile_id = :'pa' and revision_no = 3 \gset
select tests.expect_affected(format('update public.profiles set draft_revision_id = %L where id = %L', :'r3', :'pa'),
  1, 'A points the draft at the new revision');
select tests.expect_error(format($q$insert into storage.objects (bucket_id, name) values ('public-media', %L)$q$, :'ppa2'),
  '42501', 'the draft image of a published profile cannot be copied to the public bucket');
select tests.expect_affected(format('update public.profiles set draft_revision_id = %L where id = %L', :'r2', :'pa'),
  1, 'A restores the previous draft pointer');

-- a draft image never reaches the public bucket
select tests.as_user(:'uid_b');
select tests.new_profile_image_use(:'pb', true) as use_b \gset
select tests.as_superuser();
select public_object_path as ppb from public.media_uses where id = :'use_b' \gset
select tests.as_user(:'uid_b');
select tests.expect_true(format($q$select public_object_path is not null from public.media_uses where id = %L$q$, :'use_b'),
  'B''s confirmed draft image has a reserved path');
select tests.expect_affected(format('update public.profile_revisions set profile_image_use_id = %L where id = %L', :'use_b', :'rb1'),
  1, 'B links the image to the draft revision');
select tests.expect_error(format($q$insert into storage.objects (bucket_id, name) values ('public-media', %L)$q$, :'ppb'),
  '42501', 'an unpublished profile cannot copy its image to the public bucket');

-- ===========================================================================
-- 7c. Submission for the founder's first review
-- ===========================================================================
select tests.as_user(:'uid_b');
select tests.expect_error(format('select public.submit_profile_for_review(%L, %L, true, true)', :'pb', :'rb1'),
  'DK002', 'an incomplete draft cannot be submitted', 'name');
select tests.expect_affected(
  format($q$update public.profile_revisions set name = 'Beta Events', short_intro = 'Beta nights.', official_url = 'https://beta.example.test' where id = %L$q$, :'rb1'),
  1, 'B completes the draft details');
select tests.expect_error(format('select public.submit_profile_for_review(%L, %L, true, false)', :'pb', :'rb1'),
  '22023', 'both declarations are mandatory (usage missing)');
select tests.expect_error(format('select public.submit_profile_for_review(%L, %L, false, true)', :'pb', :'rb1'),
  '22023', 'both declarations are mandatory (rights missing)');
select tests.expect_error(format('select public.submit_profile_for_review(%L, %L, null, true)', :'pb', :'rb1'),
  '22023', 'a null declaration is not a confirmation');
select tests.expect_error(format('select public.submit_profile_for_review(%L, %L, true, true)', :'pb', gen_random_uuid()),
  'DK001', 'a stale revision cannot be submitted');
select tests.as_user(:'uid_a');
select tests.expect_error(format('select public.submit_profile_for_review(%L, %L, true, true)', :'pb', :'rb1'),
  '42501', 'A cannot submit B''s profile');
select tests.expect_error(format('select public.submit_profile_for_review(%L, %L, true, true)', :'pa', :'r2'),
  'DK003', 'an already approved profile cannot be submitted again');
select tests.as_user(:'uid_v');
select tests.expect_error(format('select public.submit_profile_for_review(%L, %L, true, true)', :'pb', :'rb1'),
  '42501', 'a visitor cannot submit');
select tests.as_anon();
select tests.expect_error(format('select public.submit_profile_for_review(%L, %L, true, true)', :'pb', :'rb1'),
  '42501', 'anon cannot execute submit_profile_for_review');
select tests.as_user(:'uid_b');
select tests.expect_count(format($q$select id from public.publication_audit where entity_id = %L and action = 'submit_for_review'$q$, :'pb'),
  0, 'failed submissions leave no audit row');
select public.submit_profile_for_review(:'pb', :'rb1', true, true);
select tests.expect_count(format($q$select id from public.publication_audit where entity_id = %L and action = 'submit_for_review' and revision_id = %L$q$, :'pb', :'rb1'),
  1, 'the submission is audited for the exact revision');
select tests.as_user(:'uid_f');
select tests.expect_count(format($q$select id from public.publication_audit where entity_id = %L and action = 'submit_for_review'$q$, :'pb'),
  1, 'the founder can see the submission');
select tests.as_user(:'uid_a');
select tests.expect_count(format($q$select id from public.publication_audit where entity_id = %L and action = 'submit_for_review'$q$, :'pb'),
  0, 'A cannot see B''s submission');
select tests.as_superuser();
select tests.expect_true(format($q$select actor_id = %L from public.publication_audit where entity_id = %L and action = 'submit_for_review'$q$, :'uid_b', :'pb'),
  'the audit row names the submitting owner');

-- ===========================================================================
-- 7d. The founder's question, the mail log, approval after a correction
-- ===========================================================================
-- State here: B submitted rb1 (7c), nothing decided yet.
select tests.as_user(:'uid_b');
select tests.expect_error(format('select public.request_profile_changes(%L, %L, %L)', :'pb', :'rb1', 'May I?'),
  '42501', 'an owner cannot ask a question');
select tests.as_user(:'uid_a');
select tests.expect_error(format('select public.request_profile_changes(%L, %L, %L)', :'pb', :'rb1', 'May I?'),
  '42501', 'another owner cannot ask a question');
select tests.as_user(:'uid_v');
select tests.expect_error(format('select public.request_profile_changes(%L, %L, %L)', :'pb', :'rb1', 'May I?'),
  '42501', 'a visitor cannot ask a question');
select tests.as_anon();
select tests.expect_error(format('select public.request_profile_changes(%L, %L, %L)', :'pb', :'rb1', 'May I?'),
  '42501', 'anon cannot execute request_profile_changes');

select tests.as_user(:'uid_f');
select tests.expect_error(format('select public.request_profile_changes(%L, %L, %L)', :'pb', :'rb1', '   '),
  '22023', 'an empty question is refused');
select tests.expect_error(format('select public.request_profile_changes(%L, %L, %L)', :'pb', :'rb1', repeat('x', 501)),
  '22023', 'a question over 500 characters is refused');
select tests.expect_error(format('select public.request_profile_changes(%L, %L, %L)', :'pb', gen_random_uuid(), 'May I?'),
  'DK001', 'a question about a stale revision is refused');
select tests.expect_error(format('select public.request_profile_changes(%L, %L, %L)', :'pa', :'r2', 'May I?'),
  'DK003', 'an approved profile cannot get a first-review question');
select tests.expect_count('select id from public.review_requests', 0, 'refused questions leave no row');
select tests.expect_count(format($q$select id from public.publication_audit where entity_id = %L and action = 'request_changes'$q$, :'pb'),
  0, 'refused questions leave no audit row');

-- Mails before any question or approval
select tests.expect_error(format('select public.claim_profile_mail(%L, %L, %L)', :'pb', :'rb1', 'profile_question'),
  'DK003', 'no question mail without a question');
select tests.expect_error(format('select public.claim_profile_mail(%L, %L, %L)', :'pb', :'rb1', 'profile_live'),
  'DK003', 'no live mail before approval');
select tests.expect_error(format('select public.claim_profile_mail(%L, %L, %L)', :'pb', :'rb1', 'newsletter'),
  '22023', 'only the two system mail kinds exist');

select public.request_profile_changes(:'pb', :'rb1', '  Does the link work?  ');
select tests.as_superuser();
select tests.expect_true(format($q$select message = 'Does the link work?' and created_by = %L from public.review_requests where revision_id = %L$q$, :'uid_f', :'rb1'),
  'the question is stored trimmed with the founder as author');
select tests.as_user(:'uid_f');
select tests.expect_error(format('select public.request_profile_changes(%L, %L, %L)', :'pb', :'rb1', 'Again?'),
  'DK003', 'one question per submitted revision');
select tests.expect_count(format($q$select id from public.publication_audit where entity_id = %L and action = 'request_changes' and revision_id = %L$q$, :'pb', :'rb1'),
  1, 'the question is audited');

-- Who reads the question
select tests.as_user(:'uid_b');
select tests.expect_true(format($q$select message = 'Does the link work?' from public.review_requests where profile_id = %L$q$, :'pb'),
  'the owner reads the question about the own profile');
select tests.expect_error('select created_by from public.review_requests', '42501', 'the author of the question is hidden from the owner');
select tests.expect_error(format($q$insert into public.review_requests (profile_id, revision_id, message, created_by) values (%L, %L, 'x', %L)$q$, :'pb', :'rb1', :'uid_b'),
  '42501', 'clients cannot write questions directly');
select tests.as_user(:'uid_a');
select tests.expect_count('select id from public.review_requests', 0, 'another owner does not see the question');
select tests.as_user(:'uid_v');
select tests.expect_count('select id from public.review_requests', 0, 'a visitor does not see the question');
select tests.as_anon();
select tests.expect_error('select id from public.review_requests', '42501', 'anon cannot read questions');
select tests.as_user(:'uid_f');
select tests.expect_count('select id from public.review_requests', 1, 'the founder reads all questions');

-- A revision with an open question cannot be submitted again unchanged.
select tests.as_user(:'uid_b');
select tests.expect_error(format('select public.submit_profile_for_review(%L, %L, true, true)', :'pb', :'rb1'),
  'DK003', 'a revision with an open question cannot be resubmitted');

-- Mail log: claim, retry, once only
select tests.expect_error(format('select public.claim_profile_mail(%L, %L, %L)', :'pb', :'rb1', 'profile_question'),
  '42501', 'an owner cannot claim a mail');
select tests.expect_error(format('select public.finish_profile_mail(%L, %L, %L, true)', :'pb', :'rb1', 'profile_question'),
  '42501', 'an owner cannot finish a mail');
select tests.expect_count('select id from public.profile_mails', 0, 'the mail log shows nothing to owners');
select tests.as_anon();
select tests.expect_error(format('select public.claim_profile_mail(%L, %L, %L)', :'pb', :'rb1', 'profile_question'),
  '42501', 'anon cannot claim a mail');
select tests.expect_error('select id from public.profile_mails', '42501', 'anon cannot read the mail log');
select tests.as_user(:'uid_f');
select tests.expect_error(format('select public.finish_profile_mail(%L, %L, %L, true)', :'pb', :'rb1', 'profile_question'),
  'DK003', 'nothing to finish before a claim');
select tests.expect_true(format($q$select public.claim_profile_mail(%L, %L, %L) = 'owner-b@example.test'$q$, :'pb', :'rb1', 'profile_question'),
  'the first claim returns the owner address');
select tests.expect_true(format($q$select public.claim_profile_mail(%L, %L, %L) is null$q$, :'pb', :'rb1', 'profile_question'),
  'a second claim while one is running returns nothing');
select public.finish_profile_mail(:'pb', :'rb1', 'profile_question', false, null, 'EAUTH');
select tests.expect_true(format($q$select status = 'failed' and attempts = 1 and finished_at is not null and failure_code = 'EAUTH' from public.profile_mails where revision_id = %L$q$, :'rb1'),
  'a failed attempt is recorded with its error code');
select tests.as_user(:'uid_b');
select tests.expect_count(format('select failure_code from public.profile_mails where revision_id = %L', :'rb1'), 0,
  'an owner does not see the failure code');
select tests.as_user(:'uid_f');
select tests.expect_true(format($q$select public.claim_profile_mail(%L, %L, %L) = 'owner-b@example.test'$q$, :'pb', :'rb1', 'profile_question'),
  'a failed mail can be claimed again');
select public.finish_profile_mail(:'pb', :'rb1', 'profile_question', true, 'provider-id-1');
select tests.as_superuser();
select tests.expect_true(format($q$select status = 'sent' and attempts = 2 and provider_message_id = 'provider-id-1' and failure_code is null from public.profile_mails where revision_id = %L$q$, :'rb1'),
  'a sent mail is recorded with the provider id and without the old error code');
select tests.as_user(:'uid_f');
select tests.expect_true(format($q$select public.claim_profile_mail(%L, %L, %L) is null$q$, :'pb', :'rb1', 'profile_question'),
  'a sent mail is never claimed again');
select tests.expect_error(format('select public.finish_profile_mail(%L, %L, %L, true)', :'pb', :'rb1', 'profile_question'),
  'DK003', 'a finished mail cannot be finished twice');
select tests.expect_count($q$select id from public.profile_mails$q$, 1, 'one mail row exists per profile, revision and kind');
select tests.as_user(:'uid_b');
select tests.expect_count('select id from public.profile_mails', 0, 'the owner does not see the mail log row about the own profile');
select tests.as_user(:'uid_a');
select tests.expect_count('select id from public.profile_mails', 0, 'another owner does not see the mail log');
select tests.as_user(:'uid_f');

-- The owner corrects: new revision (same image), submits again; the old
-- question is no longer open for the new draft.
select tests.as_user(:'uid_b');
select tests.expect_affected(
  format($q$insert into public.profile_revisions (profile_id, name, short_intro, official_url, profile_image_use_id, created_by) values (%L, 'Beta Events', 'Beta nights.', 'https://beta.example.test/fixed', %L, %L)$q$, :'pb', :'use_b', :'uid_b'),
  1, 'B creates the corrected revision');
select id as rb2 from public.profile_revisions where profile_id = :'pb' and revision_no = 2 \gset
select tests.expect_affected(format('update public.profiles set draft_revision_id = %L where id = %L', :'rb2', :'pb'),
  1, 'B points the draft at the corrected revision');
select tests.as_user(:'uid_f');
select tests.expect_error(format('select public.request_profile_changes(%L, %L, %L)', :'pb', :'rb2', 'Early?'),
  'DK003', 'no question about an unsubmitted revision');
select tests.expect_error(format('select public.approve_first_profile(%L, %L)', :'pb', :'rb2'),
  'DK003', 'the corrected revision cannot be approved before it is submitted');
select tests.expect_error(format('select public.approve_first_profile(%L, %L)', :'pb', :'rb1'),
  'DK001', 'the old revision cannot be approved after the correction');
select tests.expect_error(format('select public.claim_profile_mail(%L, %L, %L)', :'pb', :'rb1', 'profile_question'),
  'DK003', 'the old question mail is no longer claimable');
select tests.as_user(:'uid_b');
select public.submit_profile_for_review(:'pb', :'rb2', true, true);

-- Storage: before approval nobody may publish B's image; the founder may
-- only write the reserved path afterwards.
select tests.as_user(:'uid_f');
select tests.expect_error(format($q$insert into storage.objects (bucket_id, name) values ('public-media', %L)$q$, :'ppb'),
  '42501', 'the founder cannot write the public copy before approval');
select tests.expect_error(format('select public.claim_profile_mail(%L, %L, %L)', :'pb', :'rb2', 'profile_live'),
  'DK003', 'no live mail before approval of the corrected revision');
select public.approve_first_profile(:'pb', :'rb2');
select tests.as_superuser();
select tests.expect_true(format($q$select published_revision_id = %L and first_approved_revision_id = %L and publication_state = 'published' from public.profiles where id = %L$q$, :'rb2', :'rb2', :'pb'),
  'approving the corrected revision publishes it');
select tests.expect_true(format('select confirmed_by = %L and confirmed_at is not null from public.profile_revisions where id = %L', :'uid_b', :'rb2'),
  'the submitting owner confirmed the corrected revision');
select tests.expect_true(format($q$select count(*) filter (where action = 'submit_for_review') = 2 and count(*) filter (where action = 'request_changes') = 1 and count(*) filter (where action = 'approve_first') = 1 and count(*) filter (where action = 'publish') = 1 from public.publication_audit where entity_id = %L$q$, :'pb'),
  'the whole review of B is in the audit trail');
select tests.as_anon();
select tests.expect_true($q$select name = 'Beta Events' and official_url = 'https://beta.example.test/fixed' from public.public_profiles where slug = 'owner-b'$q$,
  'the public sees the corrected revision of B');
select tests.as_user(:'uid_f');
select tests.expect_error(format($q$insert into storage.objects (bucket_id, name) values ('public-media', %L)$q$, 'profiles/' || :'pb' || '/not-reserved.jpg'),
  '42501', 'the founder cannot write an unreserved public path');
select tests.expect_ok(format($q$insert into storage.objects (bucket_id, name) values ('public-media', %L)$q$, :'ppb'),
  'the founder writes the reserved public copy after approval');
select tests.as_user(:'uid_a');
select tests.expect_error(format($q$insert into storage.objects (bucket_id, name) values ('public-media', %L)$q$, :'ppb' || '.again'),
  '42501', 'another owner still cannot write into the public bucket');

-- Live mail for the approved revision, only for it
select tests.as_user(:'uid_f');
select tests.expect_error(format('select public.claim_profile_mail(%L, %L, %L)', :'pb', :'rb1', 'profile_live'),
  'DK003', 'no live mail for a superseded revision');
select tests.expect_true(format($q$select public.claim_profile_mail(%L, %L, %L) = 'owner-b@example.test'$q$, :'pb', :'rb2', 'profile_live'),
  'the live mail can be claimed for the published revision');
select public.finish_profile_mail(:'pb', :'rb2', 'profile_live', true, null);
select tests.expect_error(format('select public.approve_first_profile(%L, %L)', :'pb', :'rb2'),
  'DK003', 'a profile cannot be approved twice');

-- A claim stuck in pending for more than five minutes can be taken over;
-- a fresh one cannot.
select tests.as_superuser();
update public.profile_mails
   set status = 'pending', finished_at = null, claimed_at = now()
 where profile_id = :'pb' and revision_id = :'rb2' and kind = 'profile_live';
select tests.as_user(:'uid_f');
select tests.expect_true(format($q$select public.claim_profile_mail(%L, %L, %L) is null$q$, :'pb', :'rb2', 'profile_live'),
  'a fresh pending claim is respected');
select tests.as_superuser();
update public.profile_mails set claimed_at = now() - interval '6 minutes'
 where profile_id = :'pb' and revision_id = :'rb2' and kind = 'profile_live';
select tests.as_user(:'uid_f');
select tests.expect_true(format($q$select public.claim_profile_mail(%L, %L, %L) = 'owner-b@example.test'$q$, :'pb', :'rb2', 'profile_live'),
  'a stale pending claim is taken over');
select public.finish_profile_mail(:'pb', :'rb2', 'profile_live', true, null);
select tests.as_superuser();
select tests.expect_error(format($q$insert into public.profile_mails (profile_id, revision_id, kind) values (%L, %L, 'profile_live')$q$, :'pb', :'rb2'),
  '23505', 'the database allows one row per profile, revision and kind');
select tests.expect_error(format($q$insert into public.profile_mails (profile_id, revision_id, kind) values (%L, %L, 'newsletter')$q$, :'pb', :'rb2'),
  '23514', 'the database allows only the two system mail kinds');

-- ===========================================================================
-- 7e. First publication (profile + first event) and later events (Slice 5)
-- ===========================================================================
\set uid_d 'd0000000-0000-0000-0000-00000000000d'
select tests.as_superuser();
insert into auth.users (id, email) values (:'uid_d', 'owner-c@example.test');
select tests.as_user(:'uid_f');
select public.provision_profile_owner(:'uid_d', 'owner-c', 'Gamma Events') as pc \gset
select tests.as_user(:'uid_d');
select draft_revision_id as rc1 from public.profiles where id = :'pc' \gset
select tests.new_profile_image_use(:'pc', true) as use_c \gset
select tests.expect_affected(format('update public.profile_revisions set profile_image_use_id = %L where id = %L', :'use_c', :'rc1'),
  1, 'C attaches the confirmed profile image');
select tests.expect_affected(format($q$insert into public.events (organizer_id, slug) values (%L, 'c-first-night')$q$, :'pc'),
  1, 'C creates the first event');
select id as ec1 from public.events where slug = 'c-first-night' \gset
select tests.expect_affected(format($q$insert into public.events (organizer_id, slug) values (%L, 'c-second-night')$q$, :'pc'),
  1, 'C creates the second event');
select id as ec2 from public.events where slug = 'c-second-night' \gset
select tests.new_event_image_use(:'ec1') as use_ce1 \gset
select tests.new_event_image_use(:'ec2') as use_ce2 \gset
select tests.ev_insert(:'ec1', :'use_ce1') as evc1 \gset
select tests.ev_insert(:'ec2', :'use_ce2') as evc2 \gset
select tests.expect_affected(format('update public.events set draft_revision_id = %L where id = %L', :'evc1', :'ec1'),
  1, 'C selects the first event draft');
select tests.expect_affected(format('update public.events set draft_revision_id = %L where id = %L', :'evc2', :'ec2'),
  1, 'C selects the second event draft');

-- Before the founder approved the profile an event cannot publish itself.
select tests.expect_error(format($q$select public.publish_event(%L, %L, null, 0, 'scheduled', true, true)$q$, :'ec1', :'evc1'),
  'DK003', 'an event of an unapproved profile cannot be published by its owner');

-- Submission of profile and first event together
select tests.expect_error(format('select public.submit_first_publication(%L, %L, %L, %L, true, true)', :'pc', :'rc1', :'ec1', :'evc1'),
  'DK002', 'an incomplete profile blocks the joint submission', 'profile.short_intro');
select tests.expect_affected(
  format($q$update public.profile_revisions set name = 'Gamma Events', short_intro = 'Gamma nights.', official_url = 'https://gamma.example.test' where id = %L$q$, :'rc1'),
  1, 'C completes the profile draft');
select tests.expect_error(format('select public.submit_first_publication(%L, %L, %L, %L, true, false)', :'pc', :'rc1', :'ec1', :'evc1'),
  '22023', 'both declarations are mandatory for the joint submission');
select tests.expect_error(format('select public.submit_first_publication(%L, %L, %L, %L, true, true)', :'pc', :'rc1', :'ec1', gen_random_uuid()),
  'DK001', 'a stale event revision cannot be submitted');
select tests.expect_error(format('select public.submit_first_publication(%L, %L, %L, %L, true, true)', :'pc', :'rc1', :'e1', :'ev1'),
  '42501', 'an event of another organizer cannot ride along');
select tests.as_user(:'uid_a');
select tests.expect_error(format('select public.submit_first_publication(%L, %L, %L, %L, true, true)', :'pc', :'rc1', :'ec1', :'evc1'),
  '42501', 'another owner cannot submit C''s profile and event');
select tests.as_user(:'uid_v');
select tests.expect_error(format('select public.submit_first_publication(%L, %L, %L, %L, true, true)', :'pc', :'rc1', :'ec1', :'evc1'),
  '42501', 'a visitor cannot submit');
select tests.as_anon();
select tests.expect_error(format('select public.submit_first_publication(%L, %L, %L, %L, true, true)', :'pc', :'rc1', :'ec1', :'evc1'),
  '42501', 'anon cannot execute submit_first_publication');
select tests.as_user(:'uid_d');
select tests.expect_count(format($q$select id from public.publication_audit where entity_id in (%L, %L) and action = 'submit_for_review'$q$, :'pc', :'ec1'),
  0, 'failed joint submissions leave no audit row');
select public.submit_first_publication(:'pc', :'rc1', :'ec1', :'evc1', true, true);
select tests.expect_count(format($q$select id from public.publication_audit where entity_id in (%L, %L) and action = 'submit_for_review'$q$, :'pc', :'ec1'),
  2, 'the joint submission is audited for profile and event');
select tests.as_anon();
select tests.expect_count($q$select slug from public.public_events where slug = 'c-first-night'$q$, 0,
  'a submitted event is still private');
select tests.expect_count($q$select slug from public.public_profiles where slug = 'owner-c'$q$, 0,
  'a submitted profile is still private');

-- The founder decides on the pair
select tests.as_user(:'uid_d');
select tests.expect_error(format('select public.approve_first_publication(%L, %L, %L, %L)', :'pc', :'rc1', :'ec1', :'evc1'),
  '42501', 'the owner cannot approve the own submission');
select tests.as_user(:'uid_f');
select tests.expect_error(format('select public.approve_first_publication(%L, %L, %L, %L)', :'pc', :'rc1', :'ec1', gen_random_uuid()),
  'DK001', 'approval of a different event revision is refused');
select tests.expect_error(format('select public.approve_first_publication(%L, %L, %L, %L)', :'pc', :'rc1', :'e1', :'ev1'),
  'P0002', 'approval with an event of another organizer is refused');
select tests.as_superuser();
select tests.expect_true(format($q$select first_approved_revision_id is null and publication_state = 'private' from public.profiles where id = %L$q$, :'pc'),
  'a refused joint approval leaves the profile untouched (one transaction)');
select tests.as_user(:'uid_f');
select public.request_profile_changes(:'pc', :'rc1', 'Is the venue right?', :'evc1');
select tests.expect_true(format($q$select event_revision_id = %L from public.review_requests where revision_id = %L$q$, :'evc1', :'rc1'),
  'the question belongs to the pair of revisions');
select tests.expect_error(format('select public.request_profile_changes(%L, %L, %L, %L)', :'pc', :'rc1', 'Again?', :'evc1'),
  'DK003', 'a pair has one question only');
select tests.expect_error(format('select public.request_profile_changes(%L, %L, %L, %L)', :'pc', :'rc1', 'Other?', gen_random_uuid()),
  'DK001', 'a question about an unknown event revision is refused');
select tests.as_user(:'uid_d');
select tests.expect_error(format('select public.submit_first_publication(%L, %L, %L, %L, true, true)', :'pc', :'rc1', :'ec1', :'evc1'),
  'DK003', 'the unchanged pair cannot be submitted again');
-- The owner changes the event only; the new pair can be submitted.
select tests.ev_insert(:'ec1', :'use_ce1', '{"title":"Gamma Opening"}') as evc1b \gset
select tests.expect_affected(format('update public.events set draft_revision_id = %L where id = %L', :'evc1b', :'ec1'),
  1, 'C selects the corrected event draft');
select public.submit_first_publication(:'pc', :'rc1', :'ec1', :'evc1b', true, true);
select tests.as_user(:'uid_f');
select tests.expect_error(format('select public.approve_first_publication(%L, %L, %L, %L)', :'pc', :'rc1', :'ec1', :'evc1'),
  'DK001', 'the old event revision cannot be approved after the correction');
select public.approve_first_publication(:'pc', :'rc1', :'ec1', :'evc1b');
select tests.as_superuser();
select tests.expect_true(format($q$select first_approved_revision_id = %L and published_revision_id = %L and publication_state = 'published' and approved_by = %L from public.profiles where id = %L$q$, :'rc1', :'rc1', :'uid_f', :'pc'),
  'the joint approval publishes the profile');
select tests.expect_true(format($q$select first_approved_revision_id = %L and published_revision_id = %L and publication_state = 'published' and approved_by = %L and approved_at is not null and state_version = 1 from public.events where id = %L$q$, :'evc1b', :'evc1b', :'uid_f', :'ec1'),
  'the joint approval publishes the first event');
select tests.expect_true(format('select confirmed_by = %L and confirmed_at is not null from public.event_revisions where id = %L', :'uid_d', :'evc1b'),
  'the submitting owner confirmed the event revision');
select tests.expect_true(format($q$select count(*) filter (where action = 'approve_first') = 1 and count(*) filter (where action = 'publish') = 1 and count(*) filter (where action = 'submit_for_review') = 2 from public.publication_audit where entity_type = 'event' and entity_id = %L$q$, :'ec1'),
  'the event approval is in the audit trail');
select tests.as_anon();
select tests.expect_true($q$select title = 'Gamma Opening' from public.public_events where slug = 'c-first-night'$q$,
  'the public sees the first event after the joint approval');

-- Public image copy of the first event: reserved path, owner or founder only
select tests.as_superuser();
select public_object_path as ppce1 from public.media_uses where id = :'use_ce1' \gset
select tests.as_user(:'uid_a');
select tests.expect_error(format($q$insert into storage.objects (bucket_id, name) values ('public-media', %L)$q$, :'ppce1'),
  '42501', 'another owner cannot write the event image into the public bucket');
select tests.as_user(:'uid_f');
select tests.expect_error(format($q$insert into storage.objects (bucket_id, name) values ('public-media', %L)$q$, 'events/' || :'ec1' || '/not-reserved.jpg'),
  '42501', 'the founder cannot write an unreserved event path');
select tests.expect_ok(format($q$insert into storage.objects (bucket_id, name) values ('public-media', %L)$q$, :'ppce1'),
  'the founder writes the reserved public copy of the event image');
select tests.as_user(:'uid_d');
select tests.expect_error(format($q$insert into storage.objects (bucket_id, name) values ('public-media', %L)$q$, :'ppce1' || '.copy'),
  '42501', 'the owner cannot write another event path');
select tests.expect_affected(format($q$update storage.objects set name = name || 'x' where name = %L$q$, :'ppce1'),
  0, 'a public event image cannot be renamed (no update policy)');

-- Later events: the owner publishes with both declarations, no founder
select tests.expect_error(format($q$select public.publish_event(%L, %L, null, 0, 'scheduled')$q$, :'ec2', :'evc2'),
  '22023', 'a later event needs both declarations');
select tests.expect_error(format($q$select public.publish_event(%L, %L, null, 0, 'scheduled', true, false)$q$, :'ec2', :'evc2'),
  '22023', 'a later event needs the usage declaration');
select tests.expect_error(format($q$select public.publish_event(%L, %L, null, 0, 'scheduled', null, true)$q$, :'ec2', :'evc2'),
  '22023', 'a null declaration is not a confirmation for a later event');
select tests.expect_error(format($q$select public.publish_event(%L, %L, null, 5, 'scheduled', true, true)$q$, :'ec2', :'evc2'),
  'DK001', 'a stale state version is refused for a later event');
select tests.expect_error(format($q$select public.publish_event(%L, %L, null, 0, 'scheduled', true, true)$q$, :'ec2', gen_random_uuid()),
  'DK001', 'an unknown draft is refused for a later event');
select tests.as_user(:'uid_a');
select tests.expect_error(format($q$select public.publish_event(%L, %L, null, 0, 'scheduled', true, true)$q$, :'ec2', :'evc2'),
  '42501', 'another owner cannot publish C''s later event');
select tests.as_anon();
select tests.expect_count($q$select slug from public.public_events where slug = 'c-second-night'$q$, 0,
  'the later event is private until its owner publishes it');
select tests.as_user(:'uid_d');
select public.publish_event(:'ec2', :'evc2', null, 0, 'scheduled', true, true);
select tests.as_superuser();
select tests.expect_true(format($q$select first_approved_revision_id = %L and published_revision_id = %L and publication_state = 'published' and approved_by = %L and state_version = 1 from public.events where id = %L$q$, :'evc2', :'evc2', :'uid_f', :'ec2'),
  'a later event is covered by the profile approval (approved_by = the approving founder)');
select tests.expect_true(format($q$select count(*) filter (where action = 'publish' and actor_id = %L) = 1 and count(*) filter (where action = 'approve_first') = 0 from public.publication_audit where entity_type = 'event' and entity_id = %L$q$, :'uid_d', :'ec2'),
  'the self-publication is audited as the owner''s publish only');
select tests.as_anon();
select tests.expect_true($q$select slug = 'c-second-night' from public.public_events where slug = 'c-second-night'$q$,
  'the public sees the later event after its owner published it');
select tests.as_superuser();
select public_object_path as ppce2 from public.media_uses where id = :'use_ce2' \gset
select tests.as_user(:'uid_d');
select tests.expect_ok(format($q$insert into storage.objects (bucket_id, name) values ('public-media', %L)$q$, :'ppce2'),
  'the owner writes the public copy of a later event image');
select tests.as_user(:'uid_a');
select tests.expect_error(format($q$insert into storage.objects (bucket_id, name) values ('public-media', %L)$q$, :'ppce2' || '.copy'),
  '42501', 'another owner cannot write a copy for C''s later event');
select tests.as_user(:'uid_d');
select tests.expect_error(format($q$select public.publish_event(%L, %L, %L, 1, 'scheduled', true, true)$q$, :'ec2', :'evc2', :'evc2'),
  'DK003', 'nothing new to publish for a later event');

-- ===========================================================================
-- 8. Privilege snapshot and object inventory (a new object fails the run)
-- ===========================================================================
select tests.as_superuser();
create role tests_nobody nologin;  -- holds only what PUBLIC grants

-- 8a. Column privileges of anon and authenticated, as an explicit snapshot.
create table tests.expected_col_grants (
  grantee text, rel text, priv text, cols text[]
);
insert into tests.expected_col_grants values
  ('authenticated', 'app_roles', 'SELECT', array['user_id','is_founder']),
  ('authenticated', 'profiles', 'SELECT', array['id','kind','slug','draft_revision_id','published_revision_id','first_approved_revision_id','approved_at','publication_state','created_at','updated_at']),
  ('authenticated', 'profiles', 'UPDATE', array['draft_revision_id']),
  ('anon',          'profiles', 'SELECT', array['id','slug','published_revision_id','first_approved_revision_id','publication_state']),
  ('authenticated', 'profile_revisions', 'SELECT', array['id','profile_id','revision_no','name','short_intro','official_url','public_contact','profile_image_use_id','confirmed_at','created_at']),
  ('authenticated', 'profile_revisions', 'INSERT', array['profile_id','name','short_intro','official_url','public_contact','profile_image_use_id','created_by']),
  ('authenticated', 'profile_revisions', 'UPDATE', array['name','short_intro','official_url','public_contact','profile_image_use_id']),
  ('anon',          'profile_revisions', 'SELECT', array['id','name','short_intro','official_url','public_contact','profile_image_use_id','confirmed_at']),
  ('authenticated', 'events', 'SELECT', array['id','organizer_id','slug','draft_revision_id','published_revision_id','first_approved_revision_id','approved_at','publication_state','public_status','state_version','cancelled_at','created_at','updated_at']),
  ('authenticated', 'events', 'INSERT', array['organizer_id','slug']),
  ('authenticated', 'events', 'UPDATE', array['draft_revision_id']),
  ('anon',          'events', 'SELECT', array['id','slug','organizer_id','published_revision_id','first_approved_revision_id','publication_state','public_status']),
  ('authenticated', 'event_revisions', 'SELECT', array['id','event_id','revision_no','title_state','title','description_state','description','format_state','primary_format','start_state','start_at','timezone','end_state','end_at','place_state','place_name','address_line','postal_code','city','country_code','price_state','price_model','price_amount_minor','currency','access_state','access_routes','atmosphere_state','atmosphere_tags','atmosphere_description','event_image_use_id','confirmed_at','created_at']),
  ('authenticated', 'event_revisions', 'INSERT', array['event_id','title_state','title','description_state','description','format_state','primary_format','start_state','start_at','timezone','end_state','end_at','place_state','place_name','address_line','postal_code','city','country_code','price_state','price_model','price_amount_minor','currency','access_state','access_routes','atmosphere_state','atmosphere_tags','atmosphere_description','event_image_use_id','created_by']),
  ('authenticated', 'event_revisions', 'UPDATE', array['title_state','title','description_state','description','format_state','primary_format','start_state','start_at','timezone','end_state','end_at','place_state','place_name','address_line','postal_code','city','country_code','price_state','price_model','price_amount_minor','currency','access_state','access_routes','atmosphere_state','atmosphere_tags','atmosphere_description','event_image_use_id']),
  ('anon',          'event_revisions', 'SELECT', array['id','title','description','primary_format','start_at','timezone','end_state','end_at','place_name','address_line','postal_code','city','country_code','price_state','price_model','price_amount_minor','currency','access_routes','atmosphere_tags','atmosphere_description','event_image_use_id','confirmed_at']),
  ('authenticated', 'media_assets', 'SELECT', array['id','uploader_id','private_object_path','mime_type','created_at']),
  ('authenticated', 'media_assets', 'INSERT', array['uploader_id','private_object_path','mime_type']),
  ('authenticated', 'media_assets', 'UPDATE', array['mime_type']),
  ('authenticated', 'review_requests', 'SELECT', array['id','profile_id','revision_id','message','created_at','event_revision_id']),
  ('authenticated', 'profile_mails', 'SELECT', array['id','profile_id','revision_id','kind','status','attempts','claimed_at','finished_at','failure_code']),
  ('authenticated', 'media_uses', 'SELECT', array['id','asset_id','profile_id','event_id','role','public_object_path','alt_text','crop','confirmed_at']),
  ('authenticated', 'media_uses', 'INSERT', array['asset_id','profile_id','event_id','role','alt_text','crop']),
  ('authenticated', 'media_uses', 'UPDATE', array['alt_text','crop','confirmed_at','confirmed_by']),
  ('anon',          'media_uses', 'SELECT', array['id','public_object_path','confirmed_at']),
  ('authenticated', 'publication_audit', 'SELECT', array['id','entity_type','entity_id','revision_id','action','created_at']);

select tests.expect_count($q$
  select g.grantee, g.rel, c.col, g.priv
    from tests.expected_col_grants g, unnest(g.cols) c(col)
  except
  select ro, rel, col, priv
    from unnest(array['anon','authenticated']) ro,
         (select c.relname rel, a.attname col
            from pg_class c
            join pg_namespace n on n.oid = c.relnamespace
            join pg_attribute a on a.attrelid = c.oid
           where n.nspname = 'public' and c.relkind = 'r'
             and a.attnum > 0 and not a.attisdropped) cols,
         unnest(array['SELECT','INSERT','UPDATE']) priv
   where has_column_privilege(ro, format('public.%I', rel)::regclass, col, priv)
$q$, 0, 'every expected column grant exists');

select tests.expect_count($q$
  select ro, rel, col, priv
    from unnest(array['anon','authenticated']) ro,
         (select c.relname rel, a.attname col
            from pg_class c
            join pg_namespace n on n.oid = c.relnamespace
            join pg_attribute a on a.attrelid = c.oid
           where n.nspname = 'public' and c.relkind = 'r'
             and a.attnum > 0 and not a.attisdropped) cols,
         unnest(array['SELECT','INSERT','UPDATE']) priv
   where has_column_privilege(ro, format('public.%I', rel)::regclass, col, priv)
  except
  select g.grantee, g.rel, c.col, g.priv
    from tests.expected_col_grants g, unnest(g.cols) c(col)
$q$, 0, 'no column grant exists beyond the snapshot');

-- 8b. No table-level privilege for client roles on any base table; views are
-- read-only.
select tests.expect_count($q$
  select ro, c.relname, priv
    from unnest(array['anon','authenticated']) ro,
         pg_class c join pg_namespace n on n.oid = c.relnamespace,
         unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) priv
   where n.nspname = 'public' and c.relkind = 'r'
     and has_table_privilege(ro, c.oid, priv)
$q$, 0, 'no table-level privileges on base tables for client roles');
select tests.expect_count($q$
  select ro, c.relname, priv
    from unnest(array['anon','authenticated']) ro,
         pg_class c join pg_namespace n on n.oid = c.relnamespace,
         unnest(array['INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) priv
   where n.nspname = 'public' and c.relkind = 'v'
     and has_table_privilege(ro, c.oid, priv)
$q$, 0, 'views are read-only for client roles');
select tests.expect_true($q$
  select bool_and(has_table_privilege(ro, 'public.' || v, 'SELECT'))
    from unnest(array['anon','authenticated']) ro,
         unnest(array['public_profiles','public_events']) v
$q$, 'both roles can read both public views');
select tests.expect_true($q$
  select has_table_privilege('authenticated', 'public.my_profiles', 'SELECT')
     and not has_table_privilege('anon', 'public.my_profiles', 'SELECT')
$q$, 'my_profiles is readable by authenticated only');

-- 8c. Sequences
select tests.expect_count($q$
  select ro, c.relname
    from unnest(array['anon','authenticated']) ro,
         pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'S'
     and (has_sequence_privilege(ro, c.oid, 'USAGE')
          or has_sequence_privilege(ro, c.oid, 'SELECT')
          or has_sequence_privilege(ro, c.oid, 'UPDATE'))
$q$, 0, 'client roles have no sequence privileges');

-- 8d. Function EXECUTE: exactly the four helpers and eight privileged
-- functions for authenticated, nothing for anon or PUBLIC.
create table tests.expected_exec (nspname text, proname text);
insert into tests.expected_exec values
  ('public', 'auth_code_status'), ('public', 'auth_code_fail'),
  ('public', 'auth_code_clear'),
  ('app_private', 'is_founder'), ('app_private', 'owns_profile'),
  ('app_private', 'owns_event'),
  ('app_private', 'is_publishable_media_path'),
  ('public', 'provision_profile_owner'), ('public', 'approve_first_profile'),
  ('public', 'approve_first_event'), ('public', 'publish_profile'),
  ('public', 'publish_event'), ('public', 'reschedule_event'),
  ('public', 'cancel_event'), ('public', 'postpone_event'),
  ('public', 'reschedule_event_date'),
  ('public', 'submit_profile_for_review'),
  ('public', 'request_profile_changes'), ('public', 'claim_profile_mail'),
  ('public', 'finish_profile_mail'),
  ('public', 'submit_first_publication'), ('public', 'approve_first_publication');
select tests.expect_count($q$
  select n.nspname, p.proname
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname in ('public', 'app_private')
     and has_function_privilege('authenticated', p.oid, 'EXECUTE')
  except select nspname, proname from tests.expected_exec
$q$, 0, 'authenticated executes nothing beyond the expected functions');
select tests.expect_count($q$
  select nspname, proname from tests.expected_exec
  except
  select n.nspname, p.proname
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where has_function_privilege('authenticated', p.oid, 'EXECUTE')
$q$, 0, 'authenticated can execute every expected function');
select tests.expect_count($q$
  select n.nspname, p.proname
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname in ('public', 'app_private')
     and (has_function_privilege('anon', p.oid, 'EXECUTE')
          or has_function_privilege('tests_nobody', p.oid, 'EXECUTE'))
     -- The sign-in code counter runs before there is a session (ORG-02b).
     and p.proname not in ('auth_code_status', 'auth_code_fail', 'auth_code_clear')
$q$, 0, 'anon and PUBLIC execute no function except the sign-in counter');
select tests.expect_count($q$
  select p.proname
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and p.proname in ('auth_code_status', 'auth_code_fail', 'auth_code_clear')
     and has_function_privilege('anon', p.oid, 'EXECUTE')
     and not has_function_privilege('tests_nobody', p.oid, 'EXECUTE')
$q$, 3, 'only anon and authenticated execute the sign-in counter functions');

-- 8e. Every SECURITY DEFINER function pins its search_path.
select tests.expect_count($q$
  select p.proname
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname in ('public', 'app_private') and p.prosecdef
     and not coalesce(p.proconfig @> array['search_path=pg_catalog, public'], false)
$q$, 0, 'security definer functions fix their search_path');

-- 8f. RLS everywhere, policies as inventoried, views are security_invoker.
select tests.expect_count($q$
  select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
$q$, 0, 'row level security is enabled on every public table');
select tests.expect_count($q$
  select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'v'
     and not coalesce(c.reloptions @> array['security_invoker=true'], false)
$q$, 0, 'public views are security_invoker');

create table tests.expected_policies (tablename text, policyname text);
insert into tests.expected_policies values
  ('app_roles', 'app_roles_select_self_or_founder'),
  ('profiles', 'profiles_select_public'), ('profiles', 'profiles_select_owner'),
  ('profiles', 'profiles_select_founder'), ('profiles', 'profiles_update_owner'),
  ('profile_revisions', 'profile_revisions_select_public'),
  ('profile_revisions', 'profile_revisions_select_owner'),
  ('profile_revisions', 'profile_revisions_select_founder'),
  ('profile_revisions', 'profile_revisions_insert_owner'),
  ('profile_revisions', 'profile_revisions_update_owner'),
  ('events', 'events_select_public'), ('events', 'events_select_owner'),
  ('events', 'events_select_founder'), ('events', 'events_insert_owner'),
  ('events', 'events_update_owner'),
  ('event_revisions', 'event_revisions_select_public'),
  ('event_revisions', 'event_revisions_select_owner'),
  ('event_revisions', 'event_revisions_select_founder'),
  ('event_revisions', 'event_revisions_insert_owner'),
  ('event_revisions', 'event_revisions_update_owner'),
  ('media_assets', 'media_assets_select_uploader'),
  ('media_assets', 'media_assets_select_founder'),
  ('media_assets', 'media_assets_insert_uploader'),
  ('media_assets', 'media_assets_update_uploader'),
  ('media_uses', 'media_uses_select_public'), ('media_uses', 'media_uses_select_owner'),
  ('media_uses', 'media_uses_select_founder'), ('media_uses', 'media_uses_insert_owner'),
  ('media_uses', 'media_uses_update_owner'),
  ('publication_audit', 'publication_audit_select'),
  ('review_requests', 'review_requests_select'),
  ('profile_mails', 'profile_mails_select_founder');
select tests.expect_count($q$
  select tablename, policyname from pg_policies where schemaname = 'public'
  except select tablename, policyname from tests.expected_policies
$q$, 0, 'no unexpected policy exists');
select tests.expect_count($q$
  select tablename, policyname from tests.expected_policies
  except select tablename, policyname from pg_policies where schemaname = 'public'
$q$, 0, 'every expected policy exists');
select tests.expect_count($q$
  select tablename, policyname from pg_policies
   where schemaname = 'public' and cmd = 'DELETE'
$q$, 0, 'no DELETE policy exists');
select tests.expect_count($q$
  select tablename, policyname from pg_policies
   where schemaname = 'public' and tablename = 'profiles' and cmd in ('INSERT', 'ALL')
$q$, 0, 'profiles has no INSERT policy');

-- 8g. Object inventory
create table tests.expected_objects (kind text, nspname text, name text);
insert into tests.expected_objects values
  ('table', 'public', 'app_roles'), ('table', 'public', 'profiles'),
  ('table', 'public', 'profile_revisions'), ('table', 'public', 'events'),
  ('table', 'public', 'event_revisions'), ('table', 'public', 'media_assets'),
  ('table', 'public', 'media_uses'), ('table', 'public', 'publication_audit'),
  ('view', 'public', 'public_profiles'), ('view', 'public', 'public_events'),
  ('view', 'public', 'my_profiles'),
  ('table', 'public', 'review_requests'), ('table', 'public', 'profile_mails'),
  ('sequence', 'public', 'publication_audit_id_seq'),
  ('sequence', 'public', 'review_requests_id_seq'),
  ('sequence', 'public', 'profile_mails_id_seq'),
  ('function', 'public', 'provision_profile_owner'),
  ('function', 'public', 'approve_first_profile'),
  ('function', 'public', 'approve_first_event'),
  ('function', 'public', 'publish_profile'), ('function', 'public', 'publish_event'),
  ('function', 'public', 'reschedule_event'), ('function', 'public', 'cancel_event'),
  ('function', 'public', 'postpone_event'),
  ('function', 'public', 'reschedule_event_date'),
  ('function', 'app_private', 'copy_event_revision'),
  ('function', 'app_private', 'is_founder'), ('function', 'app_private', 'owns_profile'),
  ('function', 'app_private', 'owns_event'), ('function', 'app_private', 'profile_gaps'),
  ('function', 'app_private', 'event_gaps'),
  ('function', 'app_private', 'touch_updated_at'),
  ('function', 'app_private', 'guard_first_approval'),
  ('function', 'app_private', 'assign_profile_revision_no'),
  ('function', 'app_private', 'assign_event_revision_no'),
  ('function', 'app_private', 'guard_profile_revision_frozen'),
  ('function', 'app_private', 'guard_event_revision_frozen'),
  ('function', 'app_private', 'audit_append_only'),
  ('function', 'app_private', 'stamp_media_use_confirmation'),
  ('function', 'app_private', 'is_publishable_media_path'),
  ('function', 'public', 'submit_profile_for_review'),
  ('function', 'public', 'request_profile_changes'),
  ('function', 'public', 'claim_profile_mail'),
  ('function', 'public', 'finish_profile_mail'),
  ('function', 'public', 'submit_first_publication'),
  ('function', 'public', 'approve_first_publication'),
  ('table', 'public', 'auth_code_attempts'),
  ('function', 'public', 'auth_code_status'),
  ('function', 'public', 'auth_code_fail'),
  ('function', 'public', 'auth_code_clear');

select tests.expect_count($q$
  select case c.relkind when 'r' then 'table' when 'v' then 'view'
                        when 'm' then 'matview' when 'S' then 'sequence'
                        else c.relkind::text end, n.nspname, c.relname
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname in ('public', 'app_private') and c.relkind in ('r', 'v', 'm', 'S')
  union all
  select 'function', n.nspname, p.proname
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname in ('public', 'app_private')
  except select kind, nspname, name from tests.expected_objects
$q$, 0, 'no unexpected table, view, sequence or function exists');
select tests.expect_count($q$
  select kind, nspname, name from tests.expected_objects
  except
  (select case c.relkind when 'r' then 'table' when 'v' then 'view'
                         when 'm' then 'matview' when 'S' then 'sequence'
                         else c.relkind::text end, n.nspname, c.relname
     from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname in ('public', 'app_private')
   union all
   select 'function', n.nspname, p.proname
     from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('public', 'app_private'))
$q$, 0, 'every inventoried object exists');

-- ===========================================================================
-- 9. Sign-in code attempts (ORG-02b)
-- ===========================================================================
select tests.as_anon();
select tests.expect_error($q$ select count(*) from public.auth_code_attempts $q$,
  '42501', 'anon cannot read the attempt table');
select tests.expect_error($q$ delete from public.auth_code_attempts $q$,
  '42501', 'anon cannot change the attempt table');
select tests.as_user(:'uid_a');
select tests.expect_error($q$ select count(*) from public.auth_code_attempts $q$,
  '42501', 'authenticated cannot read the attempt table');
select tests.as_anon();
select tests.expect_error($q$ select public.auth_code_fail('not-a-hash') $q$,
  '22023', 'a key that is not an HMAC hex string is rejected');
select tests.expect_true($q$ select public.auth_code_status(repeat('a', 64)) is null $q$,
  'a fresh key is not locked');
select tests.expect_true($q$
  select public.auth_code_fail(repeat('a', 64)) is null
     and public.auth_code_fail(repeat('a', 64)) is null
     and public.auth_code_fail(repeat('a', 64)) is null
     and public.auth_code_fail(repeat('a', 64)) is null
$q$, 'four wrong codes do not lock');
select tests.expect_true($q$ select public.auth_code_status(repeat('a', 64)) is null $q$,
  'still not locked after four wrong codes');
select tests.expect_true($q$
  select public.auth_code_fail(repeat('a', 64)) > now() + interval '9 minutes'
     and public.auth_code_fail(repeat('a', 64)) < now() + interval '11 minutes'
$q$, 'the fifth wrong code locks for about ten minutes');
select tests.expect_true($q$
  select public.auth_code_status(repeat('a', 64)) > now()
$q$, 'the status reports the lock');
select tests.expect_true($q$ select public.auth_code_status(repeat('b', 64)) is null $q$,
  'another key is not affected');
select tests.expect_ok($q$ select public.auth_code_clear(repeat('a', 64)) $q$,
  'a new code clears the lock');
select tests.expect_true($q$ select public.auth_code_status(repeat('a', 64)) is null $q$,
  'the key is free after clearing');
select tests.as_superuser();
-- An expired lock starts a new count instead of locking again at once.
insert into public.auth_code_attempts (key_hash, failures, locked_until, updated_at)
values (repeat('c', 64), 5, now() - interval '1 minute', now());
select tests.as_anon();
select tests.expect_true($q$ select public.auth_code_status(repeat('c', 64)) is null $q$,
  'an expired lock is not reported');
select tests.expect_true($q$ select public.auth_code_fail(repeat('c', 64)) is null $q$,
  'after an expired lock the next wrong code starts at one');
select tests.as_superuser();
select tests.expect_true($q$
  select failures = 1 and locked_until is null
    from public.auth_code_attempts where key_hash = repeat('c', 64)
$q$, 'the count restarted at one');
-- Old rows are pruned.
insert into public.auth_code_attempts (key_hash, failures, updated_at)
values (repeat('d', 64), 2, now() - interval '2 days');
select tests.as_anon();
select public.auth_code_fail(repeat('e', 64));
select tests.as_superuser();
select tests.expect_count($q$
  select 1 from public.auth_code_attempts where key_hash = repeat('d', 64)
$q$, 0, 'rows older than a day are removed');

-- ===========================================================================
-- Summary
-- ===========================================================================
\o
\t off
select format('%s assertions passed', count(*)) as result from tests.results;
