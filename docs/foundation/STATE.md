---
doc: STATE
status: reviewed
owner: samee
last-reviewed: 2026-05-23
related:
  - SCOPE.md
  - NAVIGATION.md
  - CONTENT.md
---

# State

> **Decision layer.** `[LOCKED]` means decided — do not reopen, resolve, or build the opposite; changing it needs an explicit spec PR plus owner sign-off. `[OPEN]` means genuinely undecided — safe to propose, do not implement until closed. A `TODO:` is a real task only if it does not contradict a `[LOCKED]` item; a TODO that contradicts a locked decision is stale text to delete, not a task. Code-vs-spec divergences are tracked in [CONTRADICTIONS.md](CONTRADICTIONS.md).

Owns: Zustand stores (shape, persistence, selectors), Supabase data model (tables, RLS), TanStack Query keys, reset / logout behavior.

## Client state — Zustand stores

Three stores in [stores/](../../stores/). One per concern.

### `useAuthStore`

`[LOCKED]` — matches [stores/useAuthStore.ts](../../stores/useAuthStore.ts). **Not persisted** — session is the source of truth; Supabase client itself persists via `expo-secure-store`.

| Field | Type | Notes |
|---|---|---|
| `session` | `Session \| null` | Supabase Session |
| `user` | `User \| null` | Derived from `session.user` on `setSession` |
| `isLoading` | `boolean` | True while session probe runs at boot |

Actions: `setSession(session)`, `setLoading(loading)`.

### `useUserStore`

`[LOCKED]` — matches [stores/useUserStore.ts](../../stores/useUserStore.ts). **Persisted** via AsyncStorage, key `user_prefs`. The `mode` row below is scheduled for removal — see [CONTENT.md](CONTENT.md#voice-system) and [CONTRADICTIONS.md](CONTRADICTIONS.md) C3.

| Field | Type | Notes |
|---|---|---|
| `userId` | `string \| null` | Supabase `user.id` this persisted data belongs to. AppGate compares against `session.user.id` on every auth change; a mismatch triggers `resetForUser(newId)` + `useProgressStore.reset()`. Prevents prior-user onboarding state leaking into a new sign-up on the same install. |
| `hasCompletedOnboarding` | `boolean` | Controls `/onboarding` redirect (see [NAVIGATION.md](NAVIGATION.md#auth--onboarding-gating)). |
| `displayName` | `string \| null` | From onboarding step 1 (`/onboarding/name`). Preferred over Supabase user metadata for greeting/avatar. See [spec_onboarding_tweaks](../../spec_docs/Sameecha/spec_onboarding_tweaks.md). |
| `learningMode` | `'spoken' \| 'written' \| 'both' \| null` | From onboarding step 2. |
| `motivations` | `string[]` | From onboarding step 3 (max 3; "Other" entries are stored as free-text). |
| `dailyGoalMinutes` | `5 \| 10 \| 20 \| null` | From onboarding step 4. |
| `mode` | `'rowdy' \| 'classic'` | `[LOCKED: SCHEDULED FOR REMOVAL]` — see [CONTENT.md](CONTENT.md#voice-system) and [CONTRADICTIONS.md](CONTRADICTIONS.md) C3. UI voice tone; drives `useCopy()` resolution today. |
| `hasSeenTtsWarning` | `boolean` | One-time per install flag for the TTS-unavailable dialog. Added for [MODALS](../../spec_docs/Sameecha/MODALS.md) §6.9. |
| `permissionDenials` | `Partial<Record<'notifications' \| 'mic', string>>` | ISO timestamp of last "Not now" tap, per permission kind. Used to throttle re-asks (≤ once/week). Added for [MODALS](../../spec_docs/Sameecha/MODALS.md) §6.8. |
| `isHydrated` | `boolean` | Set true by `onRehydrateStorage`. |

Actions: `setOnboarding(data)`, `setDisplayName(name)`, `setLearningMode(mode)`, `setMode(mode)`, `setHasSeenTtsWarning(seen)`, `recordPermissionDenial(kind)`, `setHydrated(hydrated)`, `bindUser(userId)`, `resetForUser(userId)`. **`setMode` is also scheduled for removal alongside the field.** `resetForUser` clears per-user fields (`hasCompletedOnboarding`, `displayName`, `learningMode`, `motivations`, `dailyGoalMinutes`) and keeps install-scoped flags (`mode`, `hasSeenTtsWarning`, `permissionDenials`).

> **Note:** Profile screen collapses `learningMode`: `'written'` / `'both'` → `'fluency'`; `'spoken'` → `'spoken'`. This collapse should be a derived selector, not duplicated UI logic. **TODO:** refactor into `useFluencyMode()`.

### `useProgressStore`

`[LOCKED]` — matches [stores/progressStore.ts](../../stores/progressStore.ts). **Persisted** via AsyncStorage, key `kannada-baa-progress`.

| Field | Type | Notes |
|---|---|---|
| `streak` | `number` | Current daily streak. |
| `lastActiveDate` | `string` | ISO `YYYY-MM-DD`. |
| `completedLessons` | `string[]` | Lesson IDs. |
| `lessonProgress` | `Record<string, number>` | `lessonId → phrase index` (mid-lesson resume). |
| `xp` | `number` | 20 pts if score ≥80%, 10 pts otherwise. |
| `totalPhrasesLearned` | `number` | Cumulative across lessons. |
| `totalMinutesPracticed` | `number` | Tracked but **not surfaced in UI** (TODO). |
| `weeklyActivity` | `Record<string, boolean>` | ISO date → true; for week view (not yet surfaced). |
| `todayMinutes` | `number` | Minutes practiced today, used to detect daily-goal crossing for the celebration dialog. Reset implicitly when `todayMinutesDate` rolls over. Added for [MODALS](../../spec_docs/Sameecha/MODALS.md) §6.7. |
| `todayMinutesDate` | `string` | ISO `YYYY-MM-DD` for which `todayMinutes` was last accumulated. |
| `lastGoalCelebrationDate` | `string \| null` | ISO date the `GoalCompleteDialog` last fired. Prevents re-firing the same day. Added for [MODALS](../../spec_docs/Sameecha/MODALS.md) §6.7. |
| `isHydrated` | `boolean` | Set true by `onRehydrateStorage`. |

Actions: `updateLessonProgress(lessonId, phraseIndex)`, `completeLesson(lessonId, score, phrasesLearned, minutesPracticed)`, `updateStreak()`, `recordActivity()`, `markGoalCelebrated()`, `hydrateFromServerCompletions(slugs)`, `setHydrated(hydrated)`, `reset()`. `reset()` wipes all progress and is called by `AppGate` on sign-out and when the signed-in Supabase user changes; `hydrateFromServerCompletions(slugs)` merges server-fetched completion slugs into `completedLessons` (deduped union, completion-only).

> **Note (MODALS §6.7):** `completeLesson` now also increments `todayMinutes` by `minutesPracticed` (with date-rollover). `DoneCard` calls it with an `ESTIMATED_MIN_PER_LESSON = 5` placeholder until per-lesson timing is wired.

> **Note (spec_progress_persistence):** `completedLessons` is now a **hydrated cache** of server truth. The store mutation is still client-only and idempotent, but the canonical call path runs through `useCompleteLessonMutation` (DB UPSERT first, then store). `hydrateFromServerCompletions` is the union-merge AppGate calls after `fetchCompletedLessons` resolves. `xp`, `streak`, `totalPhrasesLearned`, `totalMinutesPracticed`, and `weeklyActivity` remain client-only for now — a future Spec A2 mirrors those scalars.

#### Streak logic

`[LOCKED]`

- `completeLesson` is **idempotent** — replaying a completed lesson does not double-count XP or streak.
- `updateStreak` runs separately:
  - If today === `lastActiveDate` → no-op
  - If yesterday === `lastActiveDate` → increment
  - Otherwise → reset to 1
  - Always update `lastActiveDate` to today

**Why idempotent:** users frequently replay lessons. If completion incremented streak/XP on every replay, the metrics become meaningless. The streak is "did you practice today?", not "how many times did you tap done?"

## Persistence summary

`[LOCKED]` — AsyncStorage is the settled persistence layer. MMKV was a never-implemented plan from the March braindump; it is not on the roadmap. **This spec wins over any memory note, README line, or [.claude/CLAUDE.md](../.claude/CLAUDE.md) sentence still saying MMKV.** Verified against the live code: both [stores/useUserStore.ts](../../stores/useUserStore.ts) and [stores/progressStore.ts](../../stores/progressStore.ts) import `@react-native-async-storage/async-storage` and wrap it with `createJSONStorage`.

| Store | Backend | Key | Hydration gate? |
|---|---|---|---|
| `useAuthStore` | Supabase client (via `expo-secure-store`) | n/a | Yes (`getSession()` resolves) |
| `useUserStore` | AsyncStorage | `user_prefs` | Yes (gates onboarding redirect) |
| `useProgressStore` | AsyncStorage | `kannada-baa-progress` | Yes (gates onboarding redirect) |

## Selectors / hooks

`[LOCKED]` — current selectors. Additional selectors below are `[OPEN]`.

Wrap stores; **screens should not read stores directly.** Defined in [hooks/progress.ts](../../hooks/progress.ts).

| Selector | Returns | Source |
|---|---|---|
| `useStreak()` | `number` | `progressStore.streak` |
| `useWordsLearned()` | `number` | `progressStore.totalPhrasesLearned` |
| `useCompletedLessons()` | `string[]` | `progressStore.completedLessons` |
| `useDailyGoalToday()` | `{ completed: 0\|1, target: 1 }` | `progressStore.weeklyActivity[today]` |

> **TODO:** add selectors for `useFluencyMode()` (the collapsed `learningMode`), `useXp()`, `useCurrentLesson()`.

## Reset / logout

`[OPEN]`

> **TODO:** Audit current behavior:
> 1. What clears on sign-out? (Supabase session yes. `useUserStore`? `useProgressStore`?)
> 2. If a user signs out and back in with the same account, should progress restore? (Yes, but currently only if persisted to server — which doesn't happen yet.)
> 3. Account deletion — what state lives where?

## Server state — Supabase

Client: [services/api/supabase.ts](../../services/api/supabase.ts). Singleton; reads `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` (throws if missing). `public.users`, `public.lessons`, and `public.user_lesson_progress` are the tables the app reads or writes today. Everything else in the schema is scaffolded for future features and untouched by app code (verified via grep across `app/`, `components/`, `hooks/`, `stores/`, `services/`).

### Tables

`[LOCKED]` — schema reflects the live Supabase project as of 2026-05-27. Use this as the canonical list; do not propose tables that contradict what is here without an explicit migration.

#### Active (read or written by app code today)

| Table | Purpose | Key columns | Accessor |
|---|---|---|---|
| `users` | Persist auth identity + onboarding answers | `id` (PK, FK `auth.users`), `email` (unique), `name`, `avatar_url`, `learning_mode` (`'spoken'\|'written'\|'both'`), `motivations` (`text[]`), `daily_goal_minutes` (`5\|10\|20`), `current_streak`, `onboarding_completed_at`, `created_at` | [services/api/users.ts](../../services/api/users.ts) (see [spec_auth_onboarding.md](../../spec_docs/Sameecha/spec_auth_onboarding.md)) |
| `lessons` | Per-lesson row; FK anchor for completions | `id` (uuid PK), `lesson_no` (int unique, used for ordering), `title`, `slug` (text unique-where-not-null — bridge to `constants/lessons/*.ts` string IDs), `situation`, `real_world_prompt`, `content_json` (jsonb reference snapshot — see [spec_lesson_content_source.md](../../spec_docs/Sameecha/spec_lesson_content_source.md)), `audio_url` (nullable), `created_at` | [services/api/lessons.ts](../../services/api/lessons.ts) |
| `user_lesson_progress` | "Did I finish lesson X?" + best score | `user_id` + `lesson_id` (composite PK), `completed_at` (nullable), `score` (nullable int, 0–100 check, personal-best semantic via `record_lesson_completion` RPC) | [services/api/progress.ts](../../services/api/progress.ts) (see [spec_progress_persistence.md](../../spec_docs/Sameecha/spec_progress_persistence.md)) |
| `opposites_items` / `opposites_progress` | Server backing for the Opposites game. items seeded from former [wordPairs.ts](../../src/games/opposites/data/wordPairs.ts) + lesson vocab. progress is per-item personal-best via `record_opposites_attempt` RPC. | items: `id` (PK), `lesson_id`, `sort_order`, `word`, `opposite`, `options_json`, `transliteration`, `meaning` · progress: `user_id` + `item_id` (PK), `is_correct`, `attempts`, `last_played` | [services/api/games/opposites.ts](../../services/api/games/opposites.ts) (see [spec_db_wiring_games_and_overall_progress.md](../../spec_docs/Sameecha/spec_db_wiring_games_and_overall_progress.md)) |
| `dictation_items` / `dictation_progress` | Server backing for the Dictation game. Per-item personal-best via `record_dictation_attempt` RPC. | items: `id` (PK), `lesson_id`, `sort_order`, `audio_url` (nullable), `expected_answer`, `accepted_json`, `phonetic` · progress: `user_id` + `item_id` (PK), `is_correct`, `attempts`, `last_played` | [services/api/games/dictation.ts](../../services/api/games/dictation.ts) |
| `image_match_items` / `image_match_progress` | Server backing for the Image Match game. Per-item personal-best via `record_image_match_attempt` RPC. Runner samples distractors from the lesson + 2 neighbors for sparse lessons. | items: `id` (PK), `lesson_id`, `sort_order`, `image_url` (nullable), `kannada`, `transliteration`, `meaning`, `emoji` · progress: `user_id` + `item_id` (PK), `is_correct`, `attempts`, `last_played` | [services/api/games/imageMatch.ts](../../services/api/games/imageMatch.ts) |
| `emergency_phrases` | Server-backed emergency content (replaces [data/emergency.json](../../data/emergency.json), resolves C10) | `id` (PK), `category`, `kannada`, `transliteration`, `meaning`, `audio_url` (nullable), `sort_order` | [services/api/emergency.ts](../../services/api/emergency.ts) |
| `user_overall_progress` | Aggregated user metrics. Recomputed server-side via the `recompute_overall_progress` trigger function (formula: 50% lessons + 50% games split 3 ways; subgame complete = ≥80% items correct lifetime). Client reads via `useOverallProgress()`; the Profile screen surfaces `progress_pct`. | `user_id` (PK), `total_score`, `progress_pct`, `recomputed_at` | [services/api/overall.ts](../../services/api/overall.ts) |

#### Scaffolded (exist in DB; not yet read or written by app code)

| Table | Intended purpose | Key columns |
|---|---|---|
| `word_of_the_day` | Daily featured word (no consuming feature yet) | `for_date` (date PK), `kannada`, `meaning`, `audio_url` (nullable) |
| `conversation_items` / `conversation_progress` | Per-item state for the planned Conversations game ([CONTENT.md](CONTENT.md#planned-games-not-yet-implemented)) | items: `id` (PK), `lesson_id`, `scenario`, `turns_json` · progress: `user_id` + `item_id` (PK), `completed`, `attempts`, `last_played` |
| `quick_quiz_items` / `quick_quiz_progress` | Per-item state for the planned Quick Quiz game | items: `id` (PK), `lesson_id`, `question`, `options_json`, `correct_index` · progress: `user_id` + `item_id` (PK), `is_correct`, `attempts`, `last_played` |

> **Note:** Wiring any scaffolded table requires its own spec — do not start reads/writes from a chat prompt. Each per-game table pair will need: a single accessor file under `services/api/`, an RLS pass mirroring the `ulp_*_own` pattern below, and a query/mutation key registered in the tables further down this doc.

### RLS policies

`[LOCKED]` — for the three active tables. Scaffolded tables are `[OPEN]` (must be locked down before any client read/write).

| Table | Policy | Source |
|---|---|---|
| `users` | `select`/`update` own row (`auth.uid() = id`); no insert/delete from client (trigger `on_auth_user_created` handles insert) | [2026-05-20_auth_onboarding.sql](../../services/api/migrations/2026-05-20_auth_onboarding.sql) |
| `lessons` | `select` for any authenticated user; no client writes | [2026-05-20_progress_persistence.sql](../../services/api/migrations/2026-05-20_progress_persistence.sql) |
| `user_lesson_progress` | `select`/`insert`/`update` own (`auth.uid() = user_id`); no delete. Writes go through the `record_lesson_completion` SECURITY INVOKER RPC for personal-best UPSERT semantic | [2026-05-20_progress_persistence.sql](../../services/api/migrations/2026-05-20_progress_persistence.sql) |

### RLS policies — per-game and emergency tables (added 2026-05-27)

| Table | Policy | Source |
|---|---|---|
| `opposites_items` / `dictation_items` / `image_match_items` | `select` for any authenticated user; no client writes (seed-only) | [2026-05-27_db_wiring_games_and_overall.sql](../../services/api/migrations/2026-05-27_db_wiring_games_and_overall.sql) |
| `opposites_progress` / `dictation_progress` / `image_match_progress` | `select`/`insert`/`update` own (`auth.uid() = user_id`); no delete. Writes go through `record_<game>_attempt` SECURITY INVOKER RPCs for personal-best UPSERT semantic. | [2026-05-27_db_wiring_games_and_overall.sql](../../services/api/migrations/2026-05-27_db_wiring_games_and_overall.sql) |
| `emergency_phrases` | `select` for any authenticated user; no client writes | [2026-05-27_db_wiring_games_and_overall.sql](../../services/api/migrations/2026-05-27_db_wiring_games_and_overall.sql) |
| `user_overall_progress` | `select` own (`auth.uid() = user_id`); no client writes (trigger-managed via `recompute_overall_progress` SECURITY DEFINER function) | [2026-05-27_db_wiring_games_and_overall.sql](../../services/api/migrations/2026-05-27_db_wiring_games_and_overall.sql) |

> **TODO (still-scaffolded tables):** before the first client read/write of `word_of_the_day`, `conversation_items/progress`, or `quick_quiz_items/progress`, apply the same RLS pattern. PR3 wires `dictation_*` and `image_match_*` reads/writes (substrate is already in place from PR1).

## TanStack Query

`QueryClient` initialised in [app/_layout.tsx](../../app/_layout.tsx) with defaults. Lesson reference data (`public.lessons` rows) is fetched ad-hoc through [services/api/lessons.ts](../../services/api/lessons.ts) without a Query wrapper today.

### Query key conventions

`[LOCKED]` — first conventions landed with [spec_progress_persistence.md](../../spec_docs/Sameecha/spec_progress_persistence.md). Future query keys follow the same `[<resource>, …scoping]` shape (userId when the data is user-scoped, lesson scope otherwise).

| Key | Reads | Source |
|---|---|---|
| `['lesson-completions', userId]` | Server list of completed lessons (slug + score + completed_at) | [services/api/progress.ts](../../services/api/progress.ts) `fetchCompletedLessons` |
| `['opposites-items', lessonNo]` | Opposites items for one lesson, ordered by sort_order | [services/api/games/opposites.ts](../../services/api/games/opposites.ts) `fetchOppositesItemsByLessonNo` (see [spec_db_wiring_games_and_overall_progress.md](../../spec_docs/Sameecha/spec_db_wiring_games_and_overall_progress.md)) |
| `['dictation-items', lessonNo]` | Dictation items for one lesson | [services/api/games/dictation.ts](../../services/api/games/dictation.ts) `fetchDictationItemsByLessonNo` |
| `['image-match-items', lessonNo]` | Image Match items for one lesson | [services/api/games/imageMatch.ts](../../services/api/games/imageMatch.ts) `fetchImageMatchItemsByLessonNo` |
| `['overall-progress', userId]` | User's `user_overall_progress` row | [services/api/overall.ts](../../services/api/overall.ts) `fetchOverallProgress` |
| `['emergency-phrases']` | Grouped emergency phrases (auto / trouble / basics) | [services/api/emergency.ts](../../services/api/emergency.ts) `fetchEmergencyPhrases` |

### Mutation conventions

`[LOCKED]` — first mutation landed with [spec_progress_persistence.md](../../spec_docs/Sameecha/spec_progress_persistence.md).

| Mutation key | Hook | Invalidates |
|---|---|---|
| `['completeLesson']` | [hooks/useCompleteLessonMutation.ts](../../hooks/useCompleteLessonMutation.ts) | `['lesson-completions', userId]`, `['overall-progress', userId]` |
| `['recordOppositesAttempt']` | [hooks/games/opposites.ts](../../hooks/games/opposites.ts) `useRecordOppositesAttempt` | `['overall-progress', userId]` |
| `['recordDictationAttempt']` | [hooks/games/dictation.ts](../../hooks/games/dictation.ts) `useRecordDictationAttempt` | `['overall-progress', userId]` |
| `['recordImageMatchAttempt']` | [hooks/games/imageMatch.ts](../../hooks/games/imageMatch.ts) `useRecordImageMatchAttempt` | `['overall-progress', userId]` |

## Cross-store sync rules

`[OPEN]`

> **TODO:** Once Supabase persistence is live, document the sync direction:
> - Onboarding completion → write to `profiles` → on next launch, hydrate `useUserStore` from server if it diverges.
> - Lesson completion → write to `progress` → invalidate query.
> - Conflict resolution: server wins, client wins, or last-write?

## Open questions

`[OPEN]`

- Once Supabase tables exist, source of truth for progress — client first (offline-first) or server first (multi-device)?
- Should `useProgressStore` and `useUserStore` merge into one, or stay separated for clarity?
