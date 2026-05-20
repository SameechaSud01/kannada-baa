-- spec_docs/Sameecha/spec_progress_persistence.md
-- Run in the Supabase SQL editor before deploying the matching app code.
-- Each block is idempotent and safe to re-run.

-- ============================================================
-- Migration 1 — lessons.slug + user_lesson_progress.score bounds
-- ============================================================
-- slug is the bridge between constants/lessons/*.ts string IDs and DB uuids.
-- Nullable for now: rows authored before this spec may not have a slug yet.
-- The unique index allows multiple null rows (partial unique).
alter table public.lessons
  add column if not exists slug text;

create unique index if not exists lessons_slug_unique
  on public.lessons (slug)
  where slug is not null;

-- Score is the 0–100 percentage DoneCard computes
-- (round(correctCount / totalDrills * 100)). Null is allowed so the
-- AppGate backfill can record pre-spec local completions without
-- fabricating a fake 0%.
alter table public.user_lesson_progress
  drop constraint if exists user_lesson_progress_score_check,
  add constraint user_lesson_progress_score_check
    check (score is null or (score >= 0 and score <= 100));

-- ============================================================
-- Migration 2 — seed slug for the one shipped lesson
-- ============================================================
-- Idempotent. If the lesson row doesn't exist yet, insert it.
-- If it exists without a slug, set the slug.
-- If it exists with a slug, do nothing.
insert into public.lessons (lesson_no, title, content_json, slug)
values (1, 'Greetings', '{}'::jsonb, 'greetings')
on conflict (lesson_no) do update
  set slug = coalesce(public.lessons.slug, excluded.slug);

-- ============================================================
-- Migration 3 — record_lesson_completion RPC (personal-best UPSERT)
-- ============================================================
-- The client cannot express "score = GREATEST(existing, new)" through
-- PostgREST's upsert, so we expose a SECURITY INVOKER function that
-- relies on RLS for authorization. Callers pass p_score = null for the
-- pre-spec backfill path (see AppGate); a null incoming score never
-- overwrites a real one, and a real incoming score can only raise it.
create or replace function public.record_lesson_completion(
  p_lesson_id uuid,
  p_score int
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  insert into public.user_lesson_progress (user_id, lesson_id, score, completed_at)
  values (auth.uid(), p_lesson_id, p_score, now())
  on conflict (user_id, lesson_id) do update
    set score = (
          case
            when excluded.score is null then public.user_lesson_progress.score
            when public.user_lesson_progress.score is null then excluded.score
            else greatest(public.user_lesson_progress.score, excluded.score)
          end
        ),
        completed_at = coalesce(public.user_lesson_progress.completed_at, excluded.completed_at);
end;
$$;

-- ============================================================
-- Migration 4 — RLS on lessons and user_lesson_progress
-- ============================================================
-- lessons: all authenticated users can read; nobody writes from the client.
alter table public.lessons enable row level security;

drop policy if exists "lessons_select_authenticated" on public.lessons;
create policy "lessons_select_authenticated" on public.lessons
  for select using (auth.role() = 'authenticated');

-- user_lesson_progress: select/insert/update own; no delete.
alter table public.user_lesson_progress enable row level security;

drop policy if exists "ulp_select_own" on public.user_lesson_progress;
create policy "ulp_select_own" on public.user_lesson_progress
  for select using (auth.uid() = user_id);

drop policy if exists "ulp_insert_own" on public.user_lesson_progress;
create policy "ulp_insert_own" on public.user_lesson_progress
  for insert with check (auth.uid() = user_id);

drop policy if exists "ulp_update_own" on public.user_lesson_progress;
create policy "ulp_update_own" on public.user_lesson_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- intentionally no delete policy.
