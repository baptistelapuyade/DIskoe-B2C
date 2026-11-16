-- Failure code of a system mail attempt (founder-readable)
--
-- Why: when the SMTP provider refuses a mail, the founder only saw "Mail
-- fehlgeschlagen" and had to search the hosting log for the reason. The app
-- now records the short error code of the attempt (for example EAUTH).
--
-- Privacy: only the code from the mail library (letters, digits, "_" and "-",
-- at most 40 characters). Never an address, never the provider's message
-- text. The column is readable by the founder only, like the rest of the log.

alter table public.profile_mails
  add column failure_code text
    constraint profile_mails_failure_code_format
      check (failure_code is null or failure_code ~ '^[A-Za-z0-9_-]{1,40}$');

grant select (failure_code) on public.profile_mails to authenticated;

-- The old five-argument signature goes away so that calls stay unambiguous.
drop function public.finish_profile_mail(uuid, uuid, text, boolean, text);

create function public.finish_profile_mail(
  p_profile_id uuid,
  p_revision_id uuid,
  p_kind text,
  p_success boolean,
  p_provider_message_id text default null,
  p_failure_code text default null
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
           then left(p_provider_message_id, 200) else null end,
         -- An invalid code is dropped instead of failing the log entry.
         failure_code = case
           when p_success then null
           when p_failure_code ~ '^[A-Za-z0-9_-]{1,40}$' then p_failure_code
           else null end
   where profile_id = p_profile_id and revision_id = p_revision_id
     and kind = p_kind and status = 'pending';
  if not found then
    raise exception 'no pending mail to finish' using errcode = 'DK003';
  end if;
end;
$$;

revoke all on function
  public.finish_profile_mail(uuid, uuid, text, boolean, text, text)
  from public, anon;
grant execute on function
  public.finish_profile_mail(uuid, uuid, text, boolean, text, text)
  to authenticated;

-- A retry sets the row back to "pending" and keeps the old code until the new
-- attempt ends. The app shows the code only while the status is "failed", and
-- finish_profile_mail replaces or clears it.
