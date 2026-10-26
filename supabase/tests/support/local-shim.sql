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

-- Minimal stand-in for Supabase Storage: the tables our policies attach to.
-- The storage API itself is not reproduced; the tests exercise the policies
-- with direct SQL, which is what the API does on behalf of the user. The real
-- behaviour is covered by the rls-supabase CI job against the local stack.
create schema storage;

create table storage.buckets (
  id text primary key,
  name text not null unique,
  public boolean not null default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);

create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text,
  owner uuid,
  created_at timestamptz not null default now()
);
alter table storage.objects enable row level security;

grant usage on schema storage to anon, authenticated, service_role;
grant all on all tables in schema storage to anon, authenticated, service_role;
