-- Local stand-in for the parts of Supabase that our migrations depend on.
--
-- Used ONLY by scripts/test-rls.sh against a throwaway PostgreSQL cluster.
-- This file is never a migration and must never run against a real project:
-- Supabase provides all of this itself.
--
-- What it reproduces, and why it matters for the tests:
--   * the roles anon / authenticated / service_role
--   * auth.users and auth.uid() (reads the JWT claim exactly like Supabase)
--   * Supabase's permissive DEFAULT PRIVILEGES in schema public. Every new
--     table, sequence and function is granted to anon / authenticated /
--     service_role. Our migrations must revoke this explicitly; with the
--     defaults reproduced here the tests prove that they do.

create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;

create schema auth;

create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique
);

create function auth.uid()
returns uuid
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'
  )::uuid
$$;

-- Clients cannot read auth.users directly on Supabase.
revoke all on table auth.users from public;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;

-- Supabase hands out broad privileges on everything created in public.
grant usage on schema public to anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  grant all on sequences to anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  grant all on functions to anon, authenticated, service_role;
