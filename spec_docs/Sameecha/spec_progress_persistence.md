# Claude Code Spec — Progress Persistence (Kannada Baa)

## Goal
Persist lesson completion to `public.user_lesson_progress` so a user's
"which lessons have I finished" history survives reinstall, device switch,
and session refresh. After this lands, `useProgressStore.completedLessons`
becomes a hydrated cache of server truth, not a device-local secret.

Scope is intentionally tight: **only lesson completion + per-lesson score**.
Streak, XP, total phrases learned, total minutes practiced, and weekly
activity stay client-only for this spec. A follow-up spec (Spec A2) will
mirror those scalars once there's a real cross-device need.

## Context
- App: Kannada Baa (Expo / React Native, Zustand + AsyncStorage, Supabase).
- Auth + the `public.users` row are already unified by
  `spec_auth_onboarding.md` (migration `2026-05-20_auth_onboarding.sql`).
  This spec assumes that work has shipped — `users` rows exist for every
  signed-in user, RLS is on, `AppGate` already hydrates `useUserStore` from
  `fetchUserRow`.
- Lesson content lives in `constants/lessons/*.ts` (one lesson today:
  `greetings`). The DB `lessons` table exists but is unread by
  the app. Whether content stays in constants or migrates to DB is
  **out of scope** — owned by a future `spec_lesson_content_source.md`.
- `useProgressStore.completeLesson` is locked-idempotent (see
  [docs/foundation/STATE.md](../../docs/foundation/STATE.md#streak-logic)
  and [CONTRADICTIONS.md](../../docs/foundation/CONTRADICTIONS.md) C6).
  This spec must preserve that property.
- Only call site for `completeLesson` is
  [components/lesson/DoneCard.tsx](../../components/lesson/DoneCard.tsx),
  which also fires `updateStreak()` and `recordActivity()`.

## Observed gap this spec closes
Today, completing a lesson on device A leaves no trace on device B. A user
who reinstalls or signs in on a new phone sees a fresh "no lessons
completed" state even if they finished lessons last week. The data
shape exists in the DB (`user_lesson_progress`) but the client never
writes to it.

## Architecture rules (read first — non-negotiables)
1. **DB is the source of truth for "did I complete lesson X?".**
   `useProgressStore.completedLessons` is a hydrated cache. On every
   session sync, `AppGate` fetches the user's completion rows and merges
   them into the store. Never trust the local list without a session sync
   since boot.
2. **Lesson identity bridge is `lessons.slug` (text unique).**
   `constants/lessons/*.ts` keeps its string IDs (`'greetings'`).
   The client looks up `lesson_id` (uuid) from slug once per session and
   caches the map in memory. No uuid leaks into component code.
3. **Lesson completion is server-first.**
   The DB write to `user_lesson_progress` must succeed before client state
   updates. On failure, the `DoneCard` stays on screen with a retryable
   toast — no local flag flip, no navigation, no XP award. Mirrors the
   `commitment.tsx` pattern from `spec_auth_onboarding.md`.
4. **`completeLesson` stays idempotent.**
   Server-side: the write is an UPSERT keyed on `(user_id, lesson_id)`.
   Client-side: the existing early-return in
   `useProgressStore.completeLesson` (when the slug is already in
   `completedLessons`) is preserved. Replaying a finished lesson must
   not double-write or double-XP. **Test the replay path (C6).**
5. **Hydration is merge-not-replace.**
   When `AppGate` receives the server completion list, it unions it with
   any local-only slugs (from before this spec shipped) and pushes the
   local-only ones up to the server in a single backfill batch. After
   one successful sync, local and server agree.
6. **No new state libraries, no per-item progress, no DB content migration
   in this spec.** Stay inside the existing Zustand + Supabase stack.
   Per-game tables (`conversation_progress`, `dictation_progress`, etc.)
   are not touched here.

## DB migrations (run in Supabase SQL editor)

### Migration 1 — add `lessons.slug` and constraints
```sql
-- slug is the bridge between constants/lessons/*.ts string IDs and DB uuids.
-- Nullable for now: rows authored before this spec may not have a slug yet.
-- The unique index allows multiple null rows (Postgres default behavior).
alter table public.lessons
  add column if not exists slug text;

create unique index if not exists lessons_slug_unique
  on public.lessons (slug)
  where slug is not null;

-- Score is the 0–100 percentage DoneCard computes
-- (round(correctCount / totalDrills * 100)).
alter table public.user_lesson_progress
  drop constraint if exists user_lesson_progress_score_check,
  add constraint user_lesson_progress_score_check
    check (score is null or (score >= 0 and score <= 100));
```

### Migration 2 — seed slug for the one shipped lesson
```sql
-- Idempotent. If the lesson row doesn't exist yet, insert it.
-- If it exists without a slug, set the slug.
-- If it exists with a slug, do nothing.
insert into public.lessons (lesson_no, title, content_json, slug)
values (1, 'Greetings', '{}'::jsonb, 'greetings')
on conflict (lesson_no) do update
  set slug = coalesce(public.lessons.slug, excluded.slug);
```

> **Note:** Any lesson authored in `constants/lessons/` going forward must
> have a matching `public.lessons` row with a slug before the new lesson
> ships to users. If `fetchLessonIdBySlug` returns null at runtime, the
> "Done" tap fails server-first (toast + stay on screen).

### Migration 3 — RLS on `lessons` and `user_lesson_progress`
```sql
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
```

## App changes

### `services/api/lessons.ts` (new file)
Single typed accessor for `public.lessons`. Slug→uuid cache lives here.

```ts
// Module-level cache. Cleared on signOut via a reset() export.
const slugToId = new Map<string, string>();

export async function fetchLessonIdBySlug(slug: string): Promise<string | null>;
// Reads from cache first; falls back to a select. Caches the result.
// Returns null if no row matches — caller decides whether that's fatal.

export function resetLessonsCache(): void;
// Called from useAuthStore.signOut to drop stale slug→uuid mappings.
```

Implementation notes:
- One row per query is fine; this is called at most once per lesson
  completion per session.
- Cache survives the session but clears on signOut.

### `services/api/progress.ts` (new file)
Single typed accessor for `public.user_lesson_progress`. No component
talks to `supabase.from('user_lesson_progress')` directly.

```ts
export type LessonCompletion = {
  slug: string;
  completed_at: string; // ISO timestamp
  score: number | null;
};

export async function recordLessonCompletion(
  userId: string,
  lessonId: string, // uuid
  score: number,    // 0–100
): Promise<void>;
// UPSERT into user_lesson_progress on (user_id, lesson_id).
// Sets completed_at = now() server-side via `new Date().toISOString()`
// (consistent with spec_auth_onboarding's pattern).
// On UPSERT conflict, score updates to the new value
// (later attempts overwrite earlier — see Risks).

export async function fetchCompletedLessons(
  userId: string,
): Promise<LessonCompletion[]>;
// Joins user_lesson_progress → lessons on lesson_id, returns slugs.
// Rows whose lessons.slug is null are filtered out (they can't be
// matched to constants/lessons/*.ts anyway).
```

### `stores/progressStore.ts`
Add one action; preserve everything else.

- Add `hydrateFromServerCompletions(slugs: string[])`:
  - Merges `slugs` into `completedLessons` as a deduped union.
  - Does **not** touch `xp`, `streak`, `lessonProgress`, or any other
    field — those are out of scope for this spec.
- `completeLesson` signature and body **unchanged**. It remains a
  synchronous client-state mutation. The DB write happens in the
  mutation hook below, before `completeLesson` is called.
- `reset()` unchanged.

### `hooks/useCompleteLessonMutation.ts` (new file)
TanStack Query mutation that wraps the server-first sequence. This is
where the new control flow lives so `DoneCard` stays presentational.

```ts
export function useCompleteLessonMutation();
// mutate({ slug, score, phrasesLearned, minutesPracticed }) →
//   1. const userId = useAuthStore.getState().user?.id (throw if missing)
//   2. const lessonId = await fetchLessonIdBySlug(slug)
//      throw if null — "Lesson not registered on server. Try again later."
//   3. await recordLessonCompletion(userId, lessonId, score)
//   4. useProgressStore.getState().completeLesson(
//        slug, score, phrasesLearned, minutesPracticed)
//   5. useProgressStore.getState().updateStreak()
//   6. useProgressStore.getState().recordActivity()
//   7. queryClient.invalidateQueries(['lesson-completions', userId])
// On error: throw (caller surfaces toast and stays on screen).
```

Order matters: steps 4–6 only run after step 3 succeeds. This is the
server-first contract.

### `components/lesson/DoneCard.tsx`
Replace the inline sync trio with the mutation.

- Remove the direct `useProgressStore` action grabs for
  `completeLesson`, `updateStreak`, `recordActivity`.
- Call `useCompleteLessonMutation()` and invoke `mutate(...)` from the
  existing "Done" handler.
- Disable the "Done" button while `mutation.isPending`, with a spinner
  inside the button (per CLAUDE.md form rules).
- On error, surface a toast (`"Couldn't save your progress. Try again."`)
  and stay on the screen. Do NOT navigate.

### `app/_layout.tsx` (AppGate)
Extend the existing post-session sync to also hydrate completions.

- After `hydrateFromUserRow(row)` resolves, call
  `fetchCompletedLessons(userId)`.
- Compute `localOnly = useProgressStore.getState().completedLessons.filter(
    s => !server.includes(s))`.
- If `localOnly.length > 0`, push each as a backfill —
  `recordLessonCompletion(userId, fetchLessonIdBySlug(slug), score=0)`.
  Use `score=0` because we don't have the original score locally.
  Log a warning per failed backfill but don't block routing.
- Call `useProgressStore.getState().hydrateFromServerCompletions(
    [...server.map(c => c.slug), ...localOnly])`.
- Routing useEffect is **not** blocked on this fetch — same pattern as
  the auth spec. If the fetch is in flight, routing uses the cached
  store value; once the fetch resolves, the store update triggers a
  re-render and any UI that depends on `completedLessons` refreshes.

### `stores/useAuthStore.ts`
- In the existing `signOut()`, after `useProgressStore.getState().reset()`,
  also call `resetLessonsCache()` from `services/api/lessons.ts`.
  Prevents slug→uuid leaking across accounts.

## Out of scope (explicitly do not add)
- Persisting `streak`, `xp`, `totalPhrasesLearned`,
  `totalMinutesPracticed`, `weeklyActivity`, `todayMinutes`,
  `lastGoalCelebrationDate` to the DB. All stay client-only.
- Per-item progress (`conversation_progress`, `dictation_progress`,
  `image_match_progress`, `opposites_progress`, `quick_quiz_progress`).
- Writing `user_overall_progress`. Looks materialized (`recomputed_at`);
  owner of that table decides whether to add a trigger.
- Migrating lesson content from `constants/lessons/` to `public.lessons`
  rows. Owned by a future spec.
- New UI for showing per-lesson score history. Score is persisted for
  future use; nothing reads it from the server in this spec.
- A "Retry" UI on the toast — the user can re-tap "Done" themselves.
- Email confirmation, OAuth, password reset, account deletion.

## Acceptance criteria
- [ ] Fresh install + sign in → completing a lesson writes a
      `user_lesson_progress` row with `score`, `completed_at` populated.
      Verify in Supabase dashboard.
- [ ] Sign out, sign in on a fresh install of the same device → the
      previously completed lesson appears in `completedLessons` (verify
      via any UI that reads it; if none, log `completedLessons` at boot).
- [ ] Replay a completed lesson → the local store does not double-count
      (idempotency preserved), and the server row's `score` updates if
      the new score differs (UPSERT behavior).
- [ ] Network down during "Done" tap → toast appears, user stays on
      DoneCard, no local flag flip, no streak/XP bump. Reconnect, tap
      again → succeeds.
- [ ] Pre-spec local completions backfill: simulate by sign-out, manually
      delete the user's `user_lesson_progress` rows in Supabase, sign
      back in. On next AppGate sync, the local slugs push back to the
      server (verify rows reappear with `score=0`).
- [ ] No code path calls `supabase.from('user_lesson_progress')` or
      `supabase.from('lessons')` from outside `services/api/`.
- [ ] Authoring a new lesson in `constants/lessons/` without seeding
      `public.lessons` → "Done" tap shows the
      "Lesson not registered on server" toast and stays on screen. (Not
      a great UX, but it's the documented contract.)
- [ ] `useProgressStore.completeLesson` is invoked **only after** the DB
      write succeeds. No call site outside `useCompleteLessonMutation`.
- [ ] Sign-out clears the slug→uuid cache (verify by signing in as a
      different account and confirming the first lesson completion
      re-queries the slug map).
- [ ] A unit test exists for the C6 idempotency contract: calling
      `useProgressStore.completeLesson` twice with the same slug does
      not double-count `xp`, `totalPhrasesLearned`,
      `totalMinutesPracticed`, or `completedLessons.length`. (This
      closes a long-standing gap independently of this spec; bundle it.)

## Manual test plan
1. **Migrations applied.** Run all three SQL blocks in Supabase. Confirm
   `lessons` has the `slug` column with a unique-where-not-null index,
   `user_lesson_progress` has the score check constraint, RLS is on,
   and `select slug from lessons where slug = 'greetings'`
   returns one row.
2. **Fresh signup + first lesson.**
   - Sign up with a new email, complete onboarding (uses
     `spec_auth_onboarding.md`'s code path).
   - Open the lesson, finish all phases, tap "Done".
   - Confirm: "Done" button disables with spinner during the write.
   - Confirm: navigates back to tabs.
   - Open Supabase dashboard → `user_lesson_progress` → find row with
     `user_id = ...`, `lesson_id = ...` (the uuid for slug
     `greetings`), `score = <0–100>`, `completed_at` set.
3. **Replay the same lesson.**
   - Re-enter the same lesson, finish it, tap "Done".
   - Confirm: no second row appears (UPSERT). If the new score differs,
     the row's `score` updates.
   - Confirm: client `xp` and `completedLessons` do not double-count
     (idempotency intact).
4. **Sign-out → sign-in on the same device.**
   - Sign out.
   - Confirm: `completedLessons` clears locally (existing reset
     behavior).
   - Sign in with the same credentials.
   - Confirm: after AppGate sync, `completedLessons` includes
     `'greetings'` (hydrated from server).
5. **Backfill of pre-spec local completions.**
   - In Supabase, manually delete the user's `user_lesson_progress`
     rows (simulate "shipped this spec but user has local-only state").
   - Re-launch the app (force-quit, reopen). User is still signed in.
   - Confirm: AppGate's backfill loop posts the missing slugs to the
     server with `score=0`. Verify the row reappears.
6. **Network failure during "Done".**
   - Reach DoneCard. Enable airplane mode. Tap "Done".
   - Confirm: toast appears, screen stays, no navigation, no local
     state mutation.
   - Disable airplane mode. Tap "Done" again. Succeeds and navigates.
7. **Unauthored lesson.**
   - Add a stub lesson to `constants/lessons/` with id
     `'fake-test-lesson'`. Do **not** insert a matching `public.lessons`
     row.
   - Open it, complete it, tap "Done".
   - Confirm: toast "Lesson not registered on server" appears, screen
     stays.
   - Insert the matching row in Supabase. Tap "Done" again. Succeeds.

## Risks / open questions
- `[OPEN]` — Score on UPSERT conflict: current proposal is "later attempt
  overwrites earlier." Alternative: keep the **highest** score (`update
  set score = greatest(user_lesson_progress.score, excluded.score)`).
  Latter is more user-friendly ("personal best"). Decide before coding.
- `[OPEN]` — Backfill score=0: pre-spec local completions land on the
  server with `score=0` because we don't have the original score. This
  is lossy. Alternative: skip score on backfill (`score=null`) so the
  row exists but doesn't claim "0%". Recommend null over 0.
- `[OPEN]` — Slug cache invalidation: if a lesson row's slug is changed
  in the DB while the app is running, the cache will serve a stale
  uuid. Acceptable for now (slugs are immutable in practice); revisit
  if content authoring goes live.
- `[OPEN]` — `recordLessonCompletion` failure during AppGate backfill
  is currently logged-and-ignored. If it persists across launches the
  user's local completions never sync. Decide: do we surface a banner?
  Recommend: log only for now; banner is a follow-up if it happens in
  practice.
- `[OPEN]` — TanStack Query is set up but no queries are active today
  (per `docs/foundation/STATE.md`). This spec introduces the first
  mutation. Confirm we're locking in
  `['lesson-completions', userId]` as the query key for the read, and
  `completeLesson` as the mutation key, per STATE.md's `[OPEN]` query
  key convention.
- `[OPEN]` — Should we also write `score` (best or last) back into
  `useProgressStore` as a new `lessonScores: Record<slug, number>`
  field for future UI? Current proposal: no — out of scope, would
  require a STATE.md update.

## Reference
- [docs/foundation/STATE.md](../../docs/foundation/STATE.md) — store
  shapes, persistence, the `[LOCKED]` idempotency contract.
- [docs/foundation/CONTRADICTIONS.md](../../docs/foundation/CONTRADICTIONS.md)
  C6 — the missing idempotency test that this spec bundles a fix for.
- [spec_auth_onboarding.md](spec_auth_onboarding.md) — the pattern this
  spec mirrors (server-first writes, RLS, AppGate hydration, single
  accessor file per table).
- DB schema dump from user message of 2026-05-20: `user_lesson_progress`
  (user_id+lesson_id PK, completed_at nullable, score nullable),
  `lessons` (id uuid PK, lesson_no int4 unique, title, content_json,
  audio_url nullable, created_at).
