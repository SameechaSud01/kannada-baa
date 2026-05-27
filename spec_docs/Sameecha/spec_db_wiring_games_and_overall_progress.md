# Claude Code Spec — DB wiring for games + overall progress + hardcoded-data migration (Kannada Baa)

> Status: **accepted** (2026-05-27, owner sign-off via chat). Implementation proceeds PR-by-PR on branch `db-wiring-overall-progress`.
> Branch: `db-wiring-overall-progress`.
> Related foundation: [STATE.md](../../docs/foundation/STATE.md), [CONTENT.md](../../docs/foundation/CONTENT.md), [CONTRADICTIONS.md](../../docs/foundation/CONTRADICTIONS.md) C10.
> Related per-feature: [spec_progress_persistence.md](spec_progress_persistence.md) (pattern this spec mirrors).

## Goal

Close the gap between the app's scaffolded DB schema and the actual code paths. After this lands:

1. The three game runners with implementations — **Opposites**, **Dictation**, **Image Match** — read their items from the per-game DB tables, not from `src/games/*/data/*.ts`.
2. Each of those games exposes **8 subgames**, one per `lessons.lesson_no` (1–8), with the subgame for lesson N gated behind `user_lesson_progress` completion of lesson N (the same gate `useCompletedLessons()` already enforces in [LessonSelector](../../components/lesson/LessonSelector.tsx)).
3. Per-item attempt history lives in `*_progress` tables, with personal-best semantics mirroring `record_lesson_completion`.
4. Aggregate user metrics land in `user_overall_progress` and are surfaced via a new selector.
5. The two non-game hardcoded data files in repo — [data/emergency.json](../../data/emergency.json) and the per-game `data/*.ts` files — get migrated to DB (closing [CONTRADICTIONS.md](../../docs/foundation/CONTRADICTIONS.md) C10) and the JSON/TS files are demoted to seed artifacts.

## Out of scope (explicitly deferred)

| Item | Why deferred |
|---|---|
| `conversation_items` / `conversation_progress` | No runner exists — see [app/(games)/[game]/[n].tsx](../../app/%28games%29/%5Bgame%5D/%5Bn%5D.tsx) `ComingSoon` branch. Wire when the runner is built. |
| `quick_quiz_items` / `quick_quiz_progress` | Same — no runner. |
| `word_of_the_day` | No consuming feature surface in the app yet. Leave scaffolded. |
| Migrating `constants/lessons/*.ts` Phrase/Drill content to DB | Owned by [spec_lesson_content_source.md](spec_lesson_content_source.md). This spec only consumes `lessons.content_json` (already populated) to seed per-game items. |
| Lessons 3–8 authoring (Phrase/Drill TS files) | Curriculum work — out of band. This spec uses `lessons.content_json.reference.words` (already seeded for L1–L6 via [2026-05-20_lessons_content.sql](../../services/api/migrations/2026-05-20_lessons_content.sql)) plus the existing TS data files to build item sets. L7, L8 subgames remain `[OPEN]` until the lesson content lands. |
| `fill_blank` drill type | Tracked separately ([CONTRADICTIONS.md](../../docs/foundation/CONTRADICTIONS.md) C7). |

## Architecture rules (read first — non-negotiables)

1. **DB is the source of truth for game items.** TS files in `src/games/*/data/` become **seed artifacts only** — after the seed migration runs, the files exist solely so the seed can be re-run idempotently. App code does not import them at runtime. Once the DB is authoritative for ≥1 week of real-device traffic without regressions, the TS files are deletable (separate cleanup PR — not this spec).
2. **Subgame identity = `(game_key, lesson_id)`.** "Lessons 1–8 correlate to games each having 8 subgames" is encoded by the existing `lesson_id` FK on every `*_items` table. There is no new `subgame_id` concept. A subgame is a query: `select * from <game>_items where lesson_id = $1`.
3. **Subgame gating mirrors the lesson gate.** Subgame N for any game is playable iff lesson N is in `user_lesson_progress.completed_at is not null` for the current user. The check uses the existing `useCompletedLessons()` selector — no new gate logic.
4. **Per-item attempts are server-first** for the personal-best fields. Following [spec_progress_persistence.md](spec_progress_persistence.md) §Architecture rule 3: the DB write succeeds before client state updates. On failure, surface a toast; do not silently swallow.
5. **`*_progress.is_correct` is personal-best.** Once `true`, future `false` attempts increment `attempts` and update `last_played` but do not flip the flag back. Mirrors the `score` semantic in `record_lesson_completion`. Expressed as a single RPC per game (`record_<game>_attempt`).
6. **`user_overall_progress` is computed, not authored.** It is recomputed server-side from `user_lesson_progress` + the three game `*_progress` tables. Trigger fires on insert/update of any source table for the affected `user_id`. The app reads it; the app never writes to it directly.
7. **RLS is mandatory before any client read/write.** `*_items` tables: `select` for `authenticated`. `*_progress` tables: `select`/`insert`/`update` own (`auth.uid() = user_id`), no delete. `user_overall_progress`: `select` own; no client writes (trigger-managed). All five table groups (3 game pairs + emergency + overall) get RLS in the same migration block; no client code lands until that block has run in Supabase.
8. **Offline-first stays a goal but is not built here.** Today the games work offline because the data is in TS. After this spec, games require a session sync at boot. A future spec wraps each `*_items` fetch with a TanStack Query persister + on-device fallback to the seed file. We accept the temporary regression for the duration of this spec.
9. **No new state libraries.** TanStack Query owns server reads/mutations; Zustand stays for local UI state only.

## Subgame content model

Each game gets up to 8 item sets (lessons 1–8). L1, L2 are implemented today and have rich content. L3–L6 have `content_json.reference` vocabulary already in the DB. L7, L8 are empty until authored.

### Item sourcing per game

| Game | Source for per-lesson items | L1–L2 strategy | L3–L6 strategy | L7–L8 |
|---|---|---|---|---|
| **Opposites** | Word pairs (target, opposite, distractors). Today: [src/games/opposites/data/wordPairs.ts](../../src/games/opposites/data/wordPairs.ts) (124 lines, ~12 pairs, no lesson tag). | Author L1, L2 item subsets by manually mapping which existing pairs use L1/L2 vocab. If insufficient, author 4 new pairs per lesson from `Phrase[]` in [constants/lessons/](../../constants/lessons/). Target: **4–6 pairs per lesson**. | Author 4–6 pairs per lesson from `content_json.reference.words`. Antonym pairs may be sparse in some lessons (e.g. L4 "pointing") — accept fewer items where natural antonyms don't exist. | Empty until lesson authored. Subgame card shows "locked: complete Lesson N first" — uses existing lock chrome. |
| **Dictation** | Words user listens to and types. Today: [src/games/dictation/data/wordBank.ts](../../src/games/dictation/data/wordBank.ts) (10 words, no lesson tag). | Per-lesson subset of words drawn from `Phrase.kannada` in TS constants. **6–10 words per lesson.** | Same, drawn from `content_json.reference.words` Kannada+transliteration. | Empty until authored. |
| **Image Match** | Kannada word ↔ visual. Today: [src/games/imagematch/data/vocabBank.ts](../../src/games/imagematch/data/vocabBank.ts) (12 items with emojis, no lesson tag). | Per-lesson subset of visualizable concrete nouns. **4–8 items per lesson.** Many lesson phrases are not visualizable (greetings, "how are you") — accept smaller item sets. | Same, sourced from `content_json.reference.words` filtered to concrete nouns. | Empty until authored. |

### Distractor / option generation

- **Opposites**: distractors live in `opposites_items` as additional rows or as a JSON column. The existing TS shape uses an `opts` array per pair. To preserve that shape without changing the DB schema dramatically, add a column `distractors_json jsonb not null default '[]'::jsonb` to `opposites_items` (each entry: `{ kn, tr, en }`). Three distractors per item; client shuffles at runtime.
- **Image Match**: today the game randomizes distractors client-side from the full bank. Keep that behavior — fetch the full lesson's `image_match_items` set, and let the runner pick a target item then sample 3 distractors from the same lesson's set. If a lesson has fewer than 4 items, the runner falls back to sampling from the union of completed lessons' items (existing behavior generalizes).
- **Dictation**: no distractors — the `accepted: string[]` field is a TS-side feature today. Add a column `accepted_json jsonb not null default '[]'::jsonb` to `dictation_items` to carry the alternate accepted spellings.

### Image Match: emoji vs `image_url`

The current `image_match_items` schema has `image_url`, no `emoji`. Today the game uses emojis from `vocabBank.ts`. **Decision: add `emoji text` column** rather than smuggling emojis into `image_url`. `image_url` stays for future real images. Runner prefers `image_url` when present, falls back to `emoji`. This avoids breaking the future-image path.

## DB migrations

All migrations go into `services/api/migrations/2026-05-27_db_wiring_games_and_overall.sql`. Each block is idempotent and safe to re-run.

### Migration 1 — schema additions to per-game item tables

```sql
-- Opposites: carry per-item distractors and option shape.
alter table public.opposites_items
  add column if not exists distractors_json jsonb not null default '[]'::jsonb,
  add column if not exists transliteration text,
  add column if not exists meaning text;

-- Dictation: carry per-item accepted-spelling list and phonetic hint.
alter table public.dictation_items
  add column if not exists accepted_json jsonb not null default '[]'::jsonb,
  add column if not exists phonetic text;

-- Image Match: carry emoji fallback and explicit english label.
alter table public.image_match_items
  add column if not exists emoji text;
```

### Migration 2 — RLS on all five touched table groups

Pattern mirrors `ulp_*_own` from [2026-05-20_progress_persistence.sql](../../services/api/migrations/2026-05-20_progress_persistence.sql).

```sql
-- *_items: select for authenticated, no client writes.
-- *_progress: select/insert/update own, no delete.
-- emergency_phrases: select for authenticated, no client writes.
-- user_overall_progress: select own, no client writes (trigger-managed).
```

Full policies enumerated in the migration file. Five groups × ~3 policies each = ~15 policy statements; each `drop policy if exists` then `create policy`.

### Migration 3 — per-game personal-best RPCs

One RPC per game, all SECURITY INVOKER, all mirroring `record_lesson_completion` semantics:

```sql
create or replace function public.record_opposites_attempt(
  p_item_id uuid,
  p_is_correct boolean
) returns void language plpgsql security invoker set search_path = public as $$
begin
  insert into public.opposites_progress (user_id, item_id, is_correct, attempts, last_played)
  values (auth.uid(), p_item_id, p_is_correct, 1, now())
  on conflict (user_id, item_id) do update
    set is_correct = public.opposites_progress.is_correct or excluded.is_correct,
        attempts = public.opposites_progress.attempts + 1,
        last_played = excluded.last_played;
end;
$$;
```

Identical shape for `record_dictation_attempt`, `record_image_match_attempt`.

### Migration 4 — `user_overall_progress` recompute trigger

```sql
create or replace function public.recompute_overall_progress(p_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_total int;
  v_completed int;
  v_pct numeric;
begin
  -- weighting: lessons 50%, three games 50% (split 1/6 each, equal weight per game).
  -- "complete" = lesson done OR (per-game) is_correct true on ≥80% of that lesson's items.
  -- exact formula in the migration file; documented here.
  -- ...
  insert into public.user_overall_progress (user_id, total_score, progress_pct, recomputed_at)
  values (p_user_id, v_total, v_pct, now())
  on conflict (user_id) do update
    set total_score = excluded.total_score,
        progress_pct = excluded.progress_pct,
        recomputed_at = excluded.recomputed_at;
end;
$$;

-- Triggers on each source table, AFTER INSERT OR UPDATE, FOR EACH ROW, call recompute_overall_progress(NEW.user_id).
```

Trigger fires on `user_lesson_progress`, `opposites_progress`, `dictation_progress`, `image_match_progress`. **Why SECURITY DEFINER:** the trigger updates `user_overall_progress` rows owned by other users in principle, even though in practice it only touches `NEW.user_id`'s row — RLS would otherwise block the trigger write. The function still scopes its UPSERT to the exact user_id from the triggering row.

> **`[OPEN]` question for owner:** the exact weighting formula. The strawman above is "50% lessons, 50% games (split 3 ways)". Counter-proposals welcome — but the formula must be locked in this spec before the migration runs.

### Migration 5 — seed per-game items from current TS data + lessons.content_json

Authored as a separate SQL file `2026-05-27_db_wiring_games_seed.sql` because seed data is voluminous and changes more often than the schema.

- For each lesson 1–8 and each game (opposites, dictation, image_match), insert the per-lesson item set with `lesson_id = (select id from lessons where lesson_no = N)`.
- Idempotent: `insert ... on conflict (id) do update set ...` with deterministic uuids derived from `(game_key, lesson_no, item_index)` via `uuid_generate_v5(...)` so re-running the seed doesn't duplicate rows.
- L7, L8 rows omitted (zero items) — runner shows "locked: complete Lesson N first" for those subgames regardless.

### Migration 6 — seed `emergency_phrases` from `data/emergency.json` (resolves C10)

Single `insert ... on conflict (id) do update` block with the 9 phrases (3 groups × 3 items). Idempotent. After this lands, [docs/foundation/CONTENT.md](../../docs/foundation/CONTENT.md) Emergency content section flips to "DB-backed".

## App code changes

### New accessors

| File | Reads | Writes |
|---|---|---|
| `services/api/games/opposites.ts` | `fetchOppositesItems(lessonId)` → `OppositesItem[]`; `fetchOppositesProgress(userId, lessonId)` → `OppositesProgress[]` | `recordOppositesAttempt(itemId, isCorrect)` via RPC |
| `services/api/games/dictation.ts` | same shape | `recordDictationAttempt` |
| `services/api/games/imageMatch.ts` | same shape | `recordImageMatchAttempt` |
| `services/api/overall.ts` | `fetchOverallProgress(userId)` → `{ total_score, progress_pct, recomputed_at }` | — (trigger-managed) |
| `services/api/emergency.ts` | `fetchEmergencyPhrases()` → grouped shape matching today's JSON consumer | — |

Each accessor file uses the existing `supabase` singleton from [services/api/supabase.ts](../../services/api/supabase.ts).

### New hooks

| Hook | Wraps | Notes |
|---|---|---|
| `useOppositesItems(lessonId)` | `useQuery(['opposites-items', lessonId], …)` | Stale time 1h; lesson content is near-static. |
| `useDictationItems(lessonId)` | `useQuery(['dictation-items', lessonId], …)` | Same. |
| `useImageMatchItems(lessonId)` | `useQuery(['image-match-items', lessonId], …)` | Same. |
| `useGameProgress(game, lessonId)` | `useQuery(['<game>-progress', userId, lessonId], …)` | Refetched on focus. |
| `useRecordGameAttempt(game)` | `useMutation(['record<Game>Attempt'], …)` | Invalidates the matching `*-progress` query and `['overall-progress', userId]`. |
| `useOverallProgress()` | `useQuery(['overall-progress', userId], …)` | Refetched on focus and after any attempt mutation. |
| `useEmergencyPhrases()` | `useQuery(['emergency-phrases'], …)` | Stale time 24h. |

Hook files live in `hooks/games/` and `hooks/`. Query/mutation keys registered in [STATE.md](../../docs/foundation/STATE.md) §Query key conventions in the same PR.

### Per-game runner refactor (minimal)

Each of `OppositeGame.tsx`, `DictationGame.tsx`, `ImageMatchGame.tsx` accepts a `lessonNo: number` prop. The route at [app/(games)/[game]/[n].tsx](../../app/%28games%29/%5Bgame%5D/%5Bn%5D.tsx) is already shaped for this — it passes `n` from `useLocalSearchParams`. Pipe `n` down. Inside the runner:

1. Map `lessonNo` → `lessonId` via the same slug/id map used by lesson code (cache in memory at session start).
2. `const items = useOppositesItems(lessonId)`.
3. Loading / error / empty states: existing patterns in [components/lesson/](../../components/lesson/) — show spinner, retry toast, "no items yet — complete more lessons" empty state. The empty state for L7/L8 subgames doubles as the locked state.
4. On answer submit, call `useRecordGameAttempt(game).mutate({ itemId, isCorrect })` and proceed.

### Selector additions to `hooks/progress.ts`

```ts
export function useOverallProgressPct(): number { /* from useOverallProgress */ }
export function useOverallScore(): number       { /* from useOverallProgress */ }
```

`useOverallProgressPct` replaces no existing selector — surfaces something brand new. Where it's rendered is TODO (likely the Profile screen progress band; spec'd separately if a UI surface is built).

### Emergency screen migration

Today [app/emergency.tsx](../../app/emergency.tsx) imports [data/emergency.json](../../data/emergency.json). Switch to `useEmergencyPhrases()`. JSON file stays in repo (used by Migration 6 seed) but the import in `app/emergency.tsx` is removed. Loading state mirrors the lesson loading pattern.

## Acceptance criteria

A reviewer should be able to verify each item by running the app + reading the changed files. **Do not declare done without taking a screenshot of each surface per [CLAUDE.md](../../.claude/CLAUDE.md) §Workflow.**

1. **Migrations run cleanly twice in a row** (idempotency). Supabase SQL editor shows no errors on re-run.
2. **RLS denies cross-user reads** on every `*_progress` table. Manual probe: switch users, attempt a `select * from opposites_progress where user_id = '<other-user-uuid>'` — expect zero rows.
3. **Each of opposites / dictation / image-match shows 8 subgame cards** on its lesson selector (the existing [LessonSelector](../../components/lesson/LessonSelector.tsx) already renders 8 — confirm gating shows L1, L2 unlocked, L3–L8 locked or "no items yet" depending on seed state).
4. **A completed attempt round-trips to the DB.** Take dictation L1 on device, answer one item, foreground a Supabase SQL probe of `dictation_progress` — row exists with `attempts >= 1` and correct `is_correct`.
5. **Replaying a correct item does not flip `is_correct` to false** on a later wrong attempt — personal-best preserved (mirrors C6 idempotency test).
6. **`user_overall_progress` updates after the attempt** — same SQL probe shows `recomputed_at` newer than the attempt's `last_played`.
7. **Emergency screen still renders** the same 3 groups × 3 items with no visual diff, fetched from DB.
8. **No app code imports `src/games/*/data/*.ts`** at runtime — `grep -r "wordPairs\|wordBank\|vocabBank" app/ components/ hooks/ src/games/*/[!d]*` returns zero hits (the files themselves and the seed migration are the only allowed references).
9. **`data/emergency.json` is no longer imported** by `app/emergency.tsx` — same grep pattern returns zero hits in `app/`.
10. **Foundation docs updated** in the same PR: STATE.md §Tables flips the five touched tables from "Scaffolded" to "Active"; STATE.md §Query keys adds the new keys; CONTRADICTIONS.md C10 moves to Resolved.

## Order of operations (suggested PR slicing)

This is a lot. Likely 3 PRs.

1. **PR1 — schema + RLS + RPCs + seed (no app reads yet).** Migrations 1–6 land. App still reads from TS. Verifiable: SQL probes succeed; no user-visible change.
2. **PR2 — Opposites runner wired to DB + emergency screen wired.** Acceptance items 3, 4, 5, 7, 9 pass for Opposites + Emergency. Dictation/ImageMatch unchanged.
3. **PR3 — Dictation + Image Match runners wired + overall progress trigger active.** Acceptance items 4–6, 8 fully pass. Foundation doc updates land here.

PR1 is reversible (migrations alone). PR2 introduces the first user-facing dependency on the DB; PR3 finishes the cutover.

## Locked decisions (2026-05-27)

- [x] **`user_overall_progress` weighting formula** — **50% lessons / 50% games (split 3 ways equal)**. Lessons completed ÷ 8 contributes 50%; each of opposites / dictation / image_match contributes ~16.67% (subgames-cleared ÷ 8 per game).
- [x] **Subgame "complete" threshold for the overall recompute** — **≥80% of that lesson's items have `is_correct = true` (personal-best, ever)**. Once a subgame crosses the threshold, future wrong answers do not un-complete it.
- [x] **L7, L8 subgame UX** — **"locked: complete Lesson N first"** (consistency with lesson chrome). The locked state and the "no items yet" empty state share visual treatment.
- [x] **Image Match emoji column** — **add `emoji text`** to `image_match_items`. Runner prefers `image_url` when present, falls back to `emoji`.
- [x] **TS data files cleanup** — **keep through PR3 as seed-only artifacts; delete in a 4th cleanup PR** after ≥1 week of clean device traffic.
- [x] **L1, L2 Opposites items** — **author fresh from lesson Phrase vocab**. Existing `wordPairs.ts` pairs get reassigned to whichever lesson their vocab best fits (likely L3+).
