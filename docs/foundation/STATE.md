---
doc: STATE
status: reviewed
owner: samee
last-reviewed: 2026-05-19
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
| `hasCompletedOnboarding` | `boolean` | Controls `/onboarding` redirect (see [NAVIGATION.md](NAVIGATION.md#auth--onboarding-gating)). |
| `learningMode` | `'spoken' \| 'written' \| 'both' \| null` | From onboarding step 1. |
| `motivations` | `string[]` | From onboarding step 2 (max 3). |
| `dailyGoalMinutes` | `5 \| 10 \| 20 \| null` | From onboarding step 3. |
| `mode` | `'rowdy' \| 'classic'` | `[LOCKED: SCHEDULED FOR REMOVAL]` — see [CONTENT.md](CONTENT.md#voice-system) and [CONTRADICTIONS.md](CONTRADICTIONS.md) C3. UI voice tone; drives `useCopy()` resolution today. |
| `hasSeenTtsWarning` | `boolean` | One-time per install flag for the TTS-unavailable dialog. Added for [MODALS](../../spec_docs/Sameecha/MODALS.md) §6.9. |
| `permissionDenials` | `Partial<Record<'notifications' \| 'mic', string>>` | ISO timestamp of last "Not now" tap, per permission kind. Used to throttle re-asks (≤ once/week). Added for [MODALS](../../spec_docs/Sameecha/MODALS.md) §6.8. |
| `isHydrated` | `boolean` | Set true by `onRehydrateStorage`. |

Actions: `setOnboarding(data)`, `setLearningMode(mode)`, `setMode(mode)`, `setHasSeenTtsWarning(seen)`, `recordPermissionDenial(kind)`, `setHydrated(hydrated)`. **`setMode` is also scheduled for removal alongside the field.**

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

Actions: `updateLessonProgress(lessonId, phraseIndex)`, `completeLesson(lessonId, score, phrasesLearned, minutesPracticed)`, `updateStreak()`, `recordActivity()`, `markGoalCelebrated()`, `hydrateFromServerCompletions(slugs)`, `setHydrated(hydrated)`.

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

Client: [services/api/supabase.ts](../../services/api/supabase.ts). Singleton; reads `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` (throws if missing). `public.users`, `public.lessons`, and `public.user_lesson_progress` are the tables in active use; per-game progress tables exist in the DB but the app does not yet read or write them.

### Tables

`[OPEN]`

> **TODO:** Define and document. No tables are read/written from the app today beyond Supabase's internal `auth.users`.
>
> Likely needed for v1:
>
> | Table | Purpose | Key columns |
> |---|---|---|
> | `profiles` | Persist `useUserStore` server-side | `user_id` (PK, FK auth.users), `learning_mode`, `motivations`, `daily_goal_minutes`, `mode` |
> | `progress` | Persist `useProgressStore` server-side | `user_id` (PK, FK auth.users), `streak`, `xp`, `completed_lessons` (jsonb), `last_active_date` |
> | `lesson_progress` | Per-lesson phrase resume | `user_id` + `lesson_id` (PK), `phrase_index` |
> | `weekly_activity` | Activity log | `user_id`, `date` (PK), `activity_count` |

### RLS policies

`[OPEN]`

> **TODO:** Define. Default rule: `row.user_id === auth.uid()`.

## TanStack Query

`QueryClient` initialised in [app/_layout.tsx](../../app/_layout.tsx) with defaults. **No queries currently active** — lesson content is static.

### Query key conventions

`[LOCKED]` — first conventions landed with [spec_progress_persistence.md](../../spec_docs/Sameecha/spec_progress_persistence.md). Future query keys follow the same `[<resource>, userId, …]` shape.

| Key | Reads | Source |
|---|---|---|
| `['lesson-completions', userId]` | Server list of completed lessons (slug + score + completed_at) | [services/api/progress.ts](../../services/api/progress.ts) `fetchCompletedLessons` |

### Mutation conventions

`[LOCKED]` — first mutation landed with [spec_progress_persistence.md](../../spec_docs/Sameecha/spec_progress_persistence.md).

| Mutation key | Hook | Invalidates |
|---|---|---|
| `['completeLesson']` | [hooks/useCompleteLessonMutation.ts](../../hooks/useCompleteLessonMutation.ts) | `['lesson-completions', userId]` |

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
