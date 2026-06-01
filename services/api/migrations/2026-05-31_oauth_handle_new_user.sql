-- spec_docs/Sameecha/spec_oauth_google_apple.md — Migration 1
-- Run in the Supabase SQL editor before deploying the matching app code.
-- Idempotent; safe to re-run.
--
-- Extends handle_new_user to read name + avatar_url from raw_user_meta_data
-- when an OAuth provider (Google, Apple) populates it. Email/password signups
-- have empty meta, so existing behavior is unchanged.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  provider_name text := meta ->> 'full_name';
  provider_avatar text := meta ->> 'avatar_url';
begin
  insert into public.users (id, email, name, avatar_url, current_streak)
  values (
    new.id,
    new.email,
    nullif(provider_name, ''),
    nullif(provider_avatar, ''),
    0
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
