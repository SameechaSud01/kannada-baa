-- spec_docs/Sameecha/spec_security_hardening.md §2
-- Replaces handle_new_user to safely consume provider metadata for OAuth.
-- Idempotent and safe to re-run.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  raw_name text := meta ->> 'full_name';
  raw_avatar text := meta ->> 'avatar_url';
  safe_name text;
  safe_avatar text;
begin
  -- Length cap. raw_user_meta_data is user-controllable — never trust verbatim.
  safe_name := nullif(left(coalesce(raw_name, ''), 80), '');

  -- Scheme allowlist. We only store URLs the device can safely Image.prefetch().
  -- Anything that doesn't start with https:// (file://, javascript:, data:, http://, ...)
  -- becomes NULL. Length cap is post-scheme-check.
  if raw_avatar is not null and raw_avatar like 'https://%' then
    safe_avatar := nullif(left(raw_avatar, 500), '');
  else
    safe_avatar := null;
  end if;

  insert into public.users (id, email, name, avatar_url, current_streak)
  values (
    new.id,
    new.email,
    safe_name,
    safe_avatar,
    0
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger already exists from 2026-05-20_auth_onboarding.sql Migration 2.
-- create or replace function above is enough; no drop/recreate of the trigger.
