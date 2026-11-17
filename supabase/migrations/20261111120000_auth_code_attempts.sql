-- Sign-in code attempts (ORG-02b): after five wrong codes the sign-in is
-- locked for ten minutes.
--
-- This is a usability guarantee, not the security boundary: the auth provider's
-- own rate limits stay the hard protection, because anyone holding the public
-- key can call the provider directly. The counter is keyed by an HMAC of the
-- normalized address that the app computes with a server-side secret
-- (AUTH_ATTEMPT_PEPPER). The database never sees the address, and nobody
-- without the secret can compute a key to lock or unlock someone else.
--
-- Access: no direct table access for anyone (RLS on, no policy, no grant). The
-- three functions below are the only way in. They are callable by anon and
-- authenticated because the sign-in happens before there is a session.

create table public.auth_code_attempts (
  key_hash text primary key check (key_hash ~ '^[0-9a-f]{64}$'),
  failures integer not null default 0 check (failures >= 0),
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.auth_code_attempts enable row level security;
revoke all on table public.auth_code_attempts from anon, authenticated;

-- Returns the end of the lock, or null when the sign-in is not locked.
create function public.auth_code_status(p_key text)
returns timestamptz
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select a.locked_until
    from public.auth_code_attempts a
   where a.key_hash = p_key and a.locked_until > now()
$$;

-- Records one wrong code. The fifth wrong code in a row starts the lock.
-- Returns the end of the lock, or null while attempts are left.
create function public.auth_code_fail(p_key text)
returns timestamptz
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  c_max constant integer := 5;
  c_lock constant interval := interval '10 minutes';
  v_row public.auth_code_attempts;
begin
  if p_key is null or p_key !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid key' using errcode = '22023';
  end if;

  -- Old rows are not needed any more.
  delete from public.auth_code_attempts
   where updated_at < now() - interval '1 day';

  insert into public.auth_code_attempts as a (key_hash, failures, updated_at)
  values (p_key, 1, now())
  on conflict (key_hash) do update
    set failures = case
          when a.locked_until is not null and a.locked_until <= now() then 1
          else a.failures + 1
        end,
        locked_until = case
          when a.locked_until is not null and a.locked_until <= now() then null
          else a.locked_until
        end,
        updated_at = now()
  returning * into v_row;

  if v_row.failures >= c_max and v_row.locked_until is null then
    update public.auth_code_attempts
       set locked_until = now() + c_lock
     where key_hash = p_key
    returning locked_until into v_row.locked_until;
  end if;

  return v_row.locked_until;
end
$$;

-- A successful sign-in or a new code starts from zero.
create function public.auth_code_clear(p_key text)
returns void
language sql
security definer
set search_path = pg_catalog, public
as $$
  delete from public.auth_code_attempts where key_hash = p_key
$$;

revoke all on function
  public.auth_code_status(text),
  public.auth_code_fail(text),
  public.auth_code_clear(text)
  from public, anon, authenticated;
grant execute on function
  public.auth_code_status(text),
  public.auth_code_fail(text),
  public.auth_code_clear(text)
  to anon, authenticated;
