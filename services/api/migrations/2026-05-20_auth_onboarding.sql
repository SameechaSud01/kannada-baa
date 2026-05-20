-- spec_docs/Sameecha/spec_auth_onboarding.md
-- Run in the Supabase SQL editor before deploying the matching app code.
-- Each block is idempotent and safe to re-run.

-- ============================================================
-- Migration 1 — extend public.users
-- ============================================================
alter table public.users
  add column if not exists motivations text[] not null default '{}',
  add column if not exists daily_goal_minutes int4,
  add column if not exists onboarding_completed_at timestamptz;

-- learning_mode must be nullable: the trigger (Migration 2) and the
-- backfill (Migration 3) both insert rows before the user has chosen one.
-- onboarding_completed_at is what gates the "done" state.
alter table public.users
  alter column learning_mode drop not null;

alter table public.users
  drop constraint if exists users_learning_mode_check,
  add constraint users_learning_mode_check
    check (learning_mode is null or learning_mode in ('spoken', 'written', 'both'));

alter table public.users
  drop constraint if exists users_daily_goal_minutes_check,
  add constraint users_daily_goal_minutes_check
    check (daily_goal_minutes is null or daily_goal_minutes in (5, 10, 20));

-- ============================================================
-- Migration 2 — auto-create public.users on auth signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, current_streak)
  values (new.id, new.email, 0)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Migration 3 — backfill existing auth.users
-- ============================================================
insert into public.users (id, email, current_streak)
select id, email, 0
from auth.users
on conflict (id) do nothing;

-- ============================================================
-- Migration 4 — RLS
-- ============================================================
alter table public.users enable row level security;

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);
-- intentionally no insert/delete policies — trigger handles insert; no delete.
