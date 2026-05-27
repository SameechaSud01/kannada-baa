-- spec_docs/Sameecha/spec_db_wiring_games_and_overall_progress.md (PR1 of 3)
-- Run in the Supabase SQL editor before deploying any matching app code.
-- Each block is idempotent and safe to re-run.
--
-- This migration adds the DB substrate only. No app code reads from the
-- touched tables yet. PR2 wires the Opposites runner + Emergency screen;
-- PR3 wires Dictation, Image Match, and the overall-progress surface.
--
-- Tables touched:
--   - opposites_items, opposites_progress
--   - dictation_items, dictation_progress
--   - image_match_items, image_match_progress
--   - emergency_phrases
--   - user_overall_progress
--
-- Seed data (per-game items + emergency phrases) lives in the companion
-- file 2026-05-27_db_wiring_games_seed.sql. Apply schema first, then seed.

-- ============================================================
-- Migration 1 — Schema additions to per-game item tables
-- ============================================================
-- Added so the existing TS-side game data shape round-trips through the DB:
--   opposites_items: options_json carries the 4-option list (answer + 3 distractors)
--                    matching src/games/opposites/types.ts:QuestionPair.opts.
--                    transliteration + meaning describe the prompt word.
--   dictation_items: accepted_json carries alternate spellings (e.g. "neeru",
--                    "niru") matching src/games/dictation/types.ts:DictationWord.
--                    phonetic is the syllable-break hint.
--   image_match_items: emoji is the visual fallback used when image_url is
--                    null. Matches src/games/imagematch/types.ts:VocabItem.emoji.
--
-- sort_order is the per-lesson ordering key and the upsert target used by
-- the companion seed migration. sort_order = 0 is reserved for any
-- legacy/scaffolded row; seeded rows use sort_order >= 1.

alter table public.opposites_items
  add column if not exists options_json jsonb not null default '[]'::jsonb,
  add column if not exists transliteration text,
  add column if not exists meaning text,
  add column if not exists sort_order int not null default 0;

alter table public.dictation_items
  add column if not exists accepted_json jsonb not null default '[]'::jsonb,
  add column if not exists phonetic text,
  add column if not exists sort_order int not null default 0;

-- The scaffolded dictation_items.audio_url shipped NOT NULL, but the MVP audio
-- path is runtime TTS via deviceTtsAudioService (CONTENT.md §Audio): no static
-- audio file URL exists yet. Relax to nullable so seed rows can omit it.
-- Idempotent: dropping NOT NULL on an already-nullable column is a no-op.
alter table public.dictation_items
  alter column audio_url drop not null;

alter table public.image_match_items
  add column if not exists emoji text,
  add column if not exists sort_order int not null default 0;

-- Same reasoning as dictation_items.audio_url: image_match_items.image_url
-- shipped NOT NULL, but the MVP visual is the emoji fallback (CONTENT.md
-- §Images). Real per-phrase illustrations are post-MVP.
alter table public.image_match_items
  alter column image_url drop not null;

-- Composite uniqueness on (lesson_id, sort_order) is the upsert target.
-- ALTER TABLE ADD CONSTRAINT lacks IF NOT EXISTS — use a catalog probe instead.
-- Catching SQLSTATEs is fragile here because Postgres raises duplicate_table
-- (42P07) when the constraint's backing index name collides AND
-- duplicate_object (42710) when the constraint name itself collides.

do $$ begin
  if not exists (
    select 1 from pg_constraint
     where conname  = 'opposites_items_lesson_sort_unique'
       and conrelid = 'public.opposites_items'::regclass
  ) then
    alter table public.opposites_items
      add constraint opposites_items_lesson_sort_unique unique (lesson_id, sort_order);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
     where conname  = 'dictation_items_lesson_sort_unique'
       and conrelid = 'public.dictation_items'::regclass
  ) then
    alter table public.dictation_items
      add constraint dictation_items_lesson_sort_unique unique (lesson_id, sort_order);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
     where conname  = 'image_match_items_lesson_sort_unique'
       and conrelid = 'public.image_match_items'::regclass
  ) then
    alter table public.image_match_items
      add constraint image_match_items_lesson_sort_unique unique (lesson_id, sort_order);
  end if;
end $$;

-- ============================================================
-- Migration 2 — RLS on every touched table
-- ============================================================
-- *_items:                 select for authenticated, no client writes (seed-only).
-- *_progress:              select / insert / update own, no delete.
-- emergency_phrases:       select for authenticated, no client writes.
-- user_overall_progress:   select own, no client writes (trigger-managed).
--
-- Policy naming mirrors the ulp_*_own pattern from 2026-05-20_progress_persistence.sql.

-- ---- opposites_items
alter table public.opposites_items enable row level security;
drop policy if exists "opposites_items_select_authenticated" on public.opposites_items;
create policy "opposites_items_select_authenticated" on public.opposites_items
  for select using (auth.role() = 'authenticated');

-- ---- opposites_progress
alter table public.opposites_progress enable row level security;
drop policy if exists "opposites_progress_select_own" on public.opposites_progress;
create policy "opposites_progress_select_own" on public.opposites_progress
  for select using (auth.uid() = user_id);
drop policy if exists "opposites_progress_insert_own" on public.opposites_progress;
create policy "opposites_progress_insert_own" on public.opposites_progress
  for insert with check (auth.uid() = user_id);
drop policy if exists "opposites_progress_update_own" on public.opposites_progress;
create policy "opposites_progress_update_own" on public.opposites_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- intentionally no delete policy.

-- ---- dictation_items
alter table public.dictation_items enable row level security;
drop policy if exists "dictation_items_select_authenticated" on public.dictation_items;
create policy "dictation_items_select_authenticated" on public.dictation_items
  for select using (auth.role() = 'authenticated');

-- ---- dictation_progress
alter table public.dictation_progress enable row level security;
drop policy if exists "dictation_progress_select_own" on public.dictation_progress;
create policy "dictation_progress_select_own" on public.dictation_progress
  for select using (auth.uid() = user_id);
drop policy if exists "dictation_progress_insert_own" on public.dictation_progress;
create policy "dictation_progress_insert_own" on public.dictation_progress
  for insert with check (auth.uid() = user_id);
drop policy if exists "dictation_progress_update_own" on public.dictation_progress;
create policy "dictation_progress_update_own" on public.dictation_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- image_match_items
alter table public.image_match_items enable row level security;
drop policy if exists "image_match_items_select_authenticated" on public.image_match_items;
create policy "image_match_items_select_authenticated" on public.image_match_items
  for select using (auth.role() = 'authenticated');

-- ---- image_match_progress
alter table public.image_match_progress enable row level security;
drop policy if exists "image_match_progress_select_own" on public.image_match_progress;
create policy "image_match_progress_select_own" on public.image_match_progress
  for select using (auth.uid() = user_id);
drop policy if exists "image_match_progress_insert_own" on public.image_match_progress;
create policy "image_match_progress_insert_own" on public.image_match_progress
  for insert with check (auth.uid() = user_id);
drop policy if exists "image_match_progress_update_own" on public.image_match_progress;
create policy "image_match_progress_update_own" on public.image_match_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- emergency_phrases
alter table public.emergency_phrases enable row level security;
drop policy if exists "emergency_phrases_select_authenticated" on public.emergency_phrases;
create policy "emergency_phrases_select_authenticated" on public.emergency_phrases
  for select using (auth.role() = 'authenticated');

-- ---- user_overall_progress
alter table public.user_overall_progress enable row level security;
drop policy if exists "user_overall_progress_select_own" on public.user_overall_progress;
create policy "user_overall_progress_select_own" on public.user_overall_progress
  for select using (auth.uid() = user_id);
-- intentionally no client insert/update/delete. The trigger function below
-- runs as SECURITY DEFINER and UPSERTs the row.

-- ============================================================
-- Migration 3 — Per-game personal-best attempt RPCs
-- ============================================================
-- Mirrors record_lesson_completion shape: SECURITY INVOKER + RLS-trusted.
-- Personal-best semantic:
--   is_correct:  once true, stays true (OR-merge on conflict).
--   attempts:    monotonically increments by 1 per call.
--   last_played: latest call wins.

create or replace function public.record_opposites_attempt(
  p_item_id uuid,
  p_is_correct boolean
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  insert into public.opposites_progress (user_id, item_id, is_correct, attempts, last_played)
  values (auth.uid(), p_item_id, p_is_correct, 1, now())
  on conflict (user_id, item_id) do update
    set is_correct  = public.opposites_progress.is_correct or excluded.is_correct,
        attempts    = public.opposites_progress.attempts + 1,
        last_played = excluded.last_played;
end;
$$;

create or replace function public.record_dictation_attempt(
  p_item_id uuid,
  p_is_correct boolean
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  insert into public.dictation_progress (user_id, item_id, is_correct, attempts, last_played)
  values (auth.uid(), p_item_id, p_is_correct, 1, now())
  on conflict (user_id, item_id) do update
    set is_correct  = public.dictation_progress.is_correct or excluded.is_correct,
        attempts    = public.dictation_progress.attempts + 1,
        last_played = excluded.last_played;
end;
$$;

create or replace function public.record_image_match_attempt(
  p_item_id uuid,
  p_is_correct boolean
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  insert into public.image_match_progress (user_id, item_id, is_correct, attempts, last_played)
  values (auth.uid(), p_item_id, p_is_correct, 1, now())
  on conflict (user_id, item_id) do update
    set is_correct  = public.image_match_progress.is_correct or excluded.is_correct,
        attempts    = public.image_match_progress.attempts + 1,
        last_played = excluded.last_played;
end;
$$;

-- ============================================================
-- Migration 4 — Overall progress recompute function + triggers
-- ============================================================
-- Formula (locked 2026-05-27 by owner sign-off; see spec §Locked decisions):
--   progress_pct = 50 * (lessons_done / 8)
--                + (50/3) * (opposites_subgames_done / 8)
--                + (50/3) * (dictation_subgames_done / 8)
--                + (50/3) * (image_match_subgames_done / 8)
--   where:
--     lessons_done            = COUNT(user_lesson_progress where completed_at is not null),
--                               capped at 8.
--     <game>_subgames_done    = COUNT(distinct lesson_id) for that game where >= 80% of
--                               that lesson's items have is_correct = true for the user
--                               (personal-best, lifetime), capped at 8.
--
--   total_score = AVG of best lesson scores across completed lessons, rounded to int 0..100.
--                 0 if no completed lessons with a non-null score.
--
-- SECURITY DEFINER because the function UPSERTs into user_overall_progress,
-- which RLS otherwise blocks for non-self writes. The function only ever
-- writes the row matching its p_user_id parameter; the trigger wrapper
-- always passes NEW.user_id, so the effective surface is "this trigger
-- can only update this user's row".

create or replace function public.recompute_overall_progress(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lessons_done numeric;
  v_opp_done     numeric;
  v_dict_done    numeric;
  v_im_done      numeric;
  v_progress_pct numeric;
  v_total_score  int;
begin
  if p_user_id is null then
    return;
  end if;

  -- Lessons completed (capped at 8)
  select least(count(*), 8)
    into v_lessons_done
    from public.user_lesson_progress
   where user_id = p_user_id
     and completed_at is not null;

  -- Opposites subgames cleared (>=80% of lesson's items correct, lifetime)
  with item_totals as (
    select lesson_id, count(*)::numeric as total
      from public.opposites_items
     where lesson_id is not null
     group by lesson_id
  ),
  user_correct as (
    select i.lesson_id, count(*) filter (where p.is_correct) as correct
      from public.opposites_items i
      left join public.opposites_progress p
        on p.item_id = i.id and p.user_id = p_user_id
     where i.lesson_id is not null
     group by i.lesson_id
  )
  select least(count(*), 8)
    into v_opp_done
    from item_totals t
    join user_correct c on c.lesson_id = t.lesson_id
   where t.total > 0
     and c.correct::numeric / t.total >= 0.8;

  -- Dictation subgames cleared
  with item_totals as (
    select lesson_id, count(*)::numeric as total
      from public.dictation_items
     where lesson_id is not null
     group by lesson_id
  ),
  user_correct as (
    select i.lesson_id, count(*) filter (where p.is_correct) as correct
      from public.dictation_items i
      left join public.dictation_progress p
        on p.item_id = i.id and p.user_id = p_user_id
     where i.lesson_id is not null
     group by i.lesson_id
  )
  select least(count(*), 8)
    into v_dict_done
    from item_totals t
    join user_correct c on c.lesson_id = t.lesson_id
   where t.total > 0
     and c.correct::numeric / t.total >= 0.8;

  -- Image Match subgames cleared
  with item_totals as (
    select lesson_id, count(*)::numeric as total
      from public.image_match_items
     where lesson_id is not null
     group by lesson_id
  ),
  user_correct as (
    select i.lesson_id, count(*) filter (where p.is_correct) as correct
      from public.image_match_items i
      left join public.image_match_progress p
        on p.item_id = i.id and p.user_id = p_user_id
     where i.lesson_id is not null
     group by i.lesson_id
  )
  select least(count(*), 8)
    into v_im_done
    from item_totals t
    join user_correct c on c.lesson_id = t.lesson_id
   where t.total > 0
     and c.correct::numeric / t.total >= 0.8;

  -- Weighted progress (0..100)
  v_progress_pct := 50.0 * (coalesce(v_lessons_done, 0) / 8.0)
                  + (50.0 / 3.0) * (coalesce(v_opp_done, 0)  / 8.0)
                  + (50.0 / 3.0) * (coalesce(v_dict_done, 0) / 8.0)
                  + (50.0 / 3.0) * (coalesce(v_im_done, 0)   / 8.0);

  -- Total score = average best lesson score across completed lessons
  select coalesce(round(avg(score))::int, 0)
    into v_total_score
    from public.user_lesson_progress
   where user_id = p_user_id
     and completed_at is not null
     and score is not null;

  insert into public.user_overall_progress (user_id, total_score, progress_pct, recomputed_at)
  values (p_user_id, v_total_score, round(v_progress_pct, 2), now())
  on conflict (user_id) do update
    set total_score   = excluded.total_score,
        progress_pct  = excluded.progress_pct,
        recomputed_at = excluded.recomputed_at;
end;
$$;

-- Trigger wrapper: fires the recompute for whichever user_id just changed.
-- Single function reused across 4 triggers (one per source table).
create or replace function public.trg_recompute_overall_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.recompute_overall_progress(NEW.user_id);
  return NEW;
end;
$$;

drop trigger if exists trg_ulp_recompute_overall on public.user_lesson_progress;
create trigger trg_ulp_recompute_overall
  after insert or update on public.user_lesson_progress
  for each row execute function public.trg_recompute_overall_progress();

drop trigger if exists trg_opp_recompute_overall on public.opposites_progress;
create trigger trg_opp_recompute_overall
  after insert or update on public.opposites_progress
  for each row execute function public.trg_recompute_overall_progress();

drop trigger if exists trg_dict_recompute_overall on public.dictation_progress;
create trigger trg_dict_recompute_overall
  after insert or update on public.dictation_progress
  for each row execute function public.trg_recompute_overall_progress();

drop trigger if exists trg_im_recompute_overall on public.image_match_progress;
create trigger trg_im_recompute_overall
  after insert or update on public.image_match_progress
  for each row execute function public.trg_recompute_overall_progress();
