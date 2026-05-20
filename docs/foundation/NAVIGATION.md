---
doc: NAVIGATION
status: reviewed
owner: samee
last-reviewed: 2026-05-19
related:
  - SCOPE.md
  - STATE.md
  - DESIGN.md
---

# Navigation

> **Decision layer.** `[LOCKED]` means decided — do not reopen, resolve, or build the opposite; changing it needs an explicit spec PR plus owner sign-off. `[OPEN]` means genuinely undecided — safe to propose, do not implement until closed. A `TODO:` is a real task only if it does not contradict a `[LOCKED]` item; a TODO that contradicts a locked decision is stale text to delete, not a task. Code-vs-spec divergences are tracked in [CONTRADICTIONS.md](CONTRADICTIONS.md).

Owns: route tree, params, deep links, auth gating, **and** named user journeys.

## Stack

`[LOCKED]`

Expo Router 6 (file-based). One screen per file in [app/](../../app/). No native code; route groups via `(group)` parentheses.

## Root layout

`[LOCKED]` — matches [app/_layout.tsx](../../app/_layout.tsx).

File: [app/_layout.tsx](../../app/_layout.tsx). Wraps everything in:
1. `QueryClientProvider` (TanStack Query)
2. `SafeAreaProvider`
3. `AppGate` — handles auth + onboarding redirect

Loads fonts, sets audio mode (`playsInSilentModeIOS: true`), probes Kannada TTS on boot.

## Route table

`[LOCKED]` — paths and group layouts match the live route tree. Header column entries marked `TODO` are `[OPEN]`.

| Path | File | Group layout | Header | Notes |
|---|---|---|---|---|
| `/(auth)/login` | [login.tsx](../../app/%28auth%29/login.tsx) | Stack, `headerShown: false`, bg `Colors.surface` | none | Email/password via Supabase |
| `/(tabs)/` | [index.tsx](../../app/%28tabs%29/index.tsx) | Custom `TabBar`, `headerShown: false` | none | Home |
| `/(tabs)/learn` | [learn.tsx](../../app/%28tabs%29/learn.tsx) | ↑ | none | Lesson catalog |
| `/(tabs)/practice` | [practice.tsx](../../app/%28tabs%29/practice.tsx) | ↑ | none | Games menu |
| `/(tabs)/profile` | [profile.tsx](../../app/%28tabs%29/profile.tsx) | ↑ | none | Profile + settings |
| `/(games)/dictation` | [dictation.tsx](../../app/%28games%29/dictation.tsx) | Stack, `headerShown: false` | none | Dictation game |
| `/(games)/opposites` | [opposites.tsx](../../app/%28games%29/opposites.tsx) | ↑ | none | Opposites game |
| `/onboarding/welcome` | [welcome.tsx](../../app/onboarding/welcome.tsx) | Stack, `slide_from_right`, `headerShown: false` | none | Intro |
| `/onboarding/goal` | [goal.tsx](../../app/onboarding/goal.tsx) | ↑ | none | Learning mode (step 1/3) |
| `/onboarding/motivation` | [motivation.tsx](../../app/onboarding/motivation.tsx) | ↑ | none | Motivation (step 2/3, max 3) |
| `/onboarding/commitment` | [commitment.tsx](../../app/onboarding/commitment.tsx) | ↑ | none | Daily goal (step 3/3) |
| `/lesson/[id]` | [[id].tsx](../../app/lesson/%5Bid%5D.tsx) | root stack | TODO | Lesson runner. Param: `id` = `LessonId` |
| `/practice/[id]` | [[id].tsx](../../app/practice/%5Bid%5D.tsx) | root stack | TODO | Game detail. Param: `id` = game id |
| `/heritage/[id]` | [[id].tsx](../../app/heritage/%5Bid%5D.tsx) | root stack | TODO | Heritage detail. Param: `id` = slug |
| `/emergency` | [emergency.tsx](../../app/emergency.tsx) | root stack | TODO | Emergency phrase guide |

> **TODO:** Header behavior for dynamic routes (`/lesson/[id]`, `/practice/[id]`, `/heritage/[id]`, `/emergency`) — confirm if any show a header or all are headerless.

## Auth + onboarding gating

`[LOCKED]` — matches `AppGate` in [app/_layout.tsx](../../app/_layout.tsx).

Decision matrix:

| Session? | Onboarded? | Current group | Action |
|---|---|---|---|
| ❌ | — | not `(auth)` | redirect to `/(auth)/login` |
| ❌ | — | `(auth)` | stay |
| ✅ | ❌ | not `onboarding` | redirect to `/onboarding/welcome` |
| ✅ | ❌ | `onboarding` | stay |
| ✅ | ✅ | `(auth)` or `onboarding` | redirect to `/(tabs)` |
| ✅ | ✅ | other | stay |

Hydration: both `useUserStore.isHydrated` AND `useProgressStore.isHydrated` must be true before `AppGate` redirects. Otherwise stale persisted state may cause flicker.

**Why hydrate first:** the persisted onboarding flag controls the redirect target. Without waiting for hydration, an onboarded user briefly sees `/(auth)/login`.

## Deep linking

`[LOCKED]` — scheme matches [app.json](../app.json).

- **Scheme:** `kannada-baa` (declared in [app.json](../app.json)).
- **Custom linking config:** none. All routes are file-based and addressable via path.

> **TODO:** Universal links / Android App Links (`https://`) — needed for marketing? Out of MVP?

## Modal vs push

`[OPEN]` — for route-level modal presentation. Overlay modals **have shipped** via the [MODALS](../../spec_docs/Sameecha/MODALS.md) spec (dialogs, bottom sheets, full-screen takeovers, toasts) and live outside the route stack via `ModalHost` + `ToastHost`. They're orthogonal to the question below.

> **TODO:** No *route-level* modal presentation currently. Confirm: all navigation is push-stack?
> Candidate route-level modals:
> - `/emergency` — it's a "tool" screen, not a page; modal might fit.
> - Lesson runner — full-screen takeover with no tab bar; modal presentation feels right.

## Back behavior

`[LOCKED]` — resolved 2026-05-19.

Every screen except the four `(tabs)` roots, `(auth)/login`, and `onboarding/welcome` shows a back affordance. The chip is a 40×40 round button (`Colors.surfaceContainerHighest` bg, `Icons.back` 20pt in `Colors.primary`), placed top-left at `insets.top + Spacing.sm` / `Spacing.lg`. Implemented by [components/ui/ExitBackButton.tsx](../../../components/ui/ExitBackButton.tsx).

Per-flow rules:

| Flow | Back affordance | Behavior on tap |
|---|---|---|
| `(tabs)` (home, learn, practice, profile) | none | n/a — root tabs |
| `(auth)/login` | none | first screen of its flow |
| `/onboarding/welcome` | none | first onboarding step; no meaningful prior route |
| `/onboarding/{goal,motivation,commitment}` | inline Back/Continue pair (existing) | `router.back()` — no confirm; selections are not yet committed to the store |
| `/lesson/[id]` scenario / intake / drill / output | floating chip overlay | `ExitLessonDialog` (lesson variant) — destructive confirm, blocks backdrop tap + Android hardware back. See [MODALS](../../spec_docs/Sameecha/MODALS.md) §6.1. |
| `/lesson/[id]` done | none | Existing close button on `DoneCard` handles exit |
| `/(games)/dictation`, `/(games)/opposites` mid-game | inline chip in header row | `ExitLessonDialog` (game variant). See [MODALS](../../spec_docs/Sameecha/MODALS.md) §6.1. |
| `/(games)/*` result screen | floating chip overlay | Plain `router.back()` — nothing to lose |
| `/practice/[id]`, `/heritage/[id]`, `/emergency` | screen-owned back arrow (existing) | Plain `router.back()` |

**Why confirm only mid-flow:** drill attempts and in-progress game state are not persisted; a stray back tap on a phone is easy and otherwise silently loses work. Once a lesson reaches `done` or a game reaches `result`, progress is already committed, so plain back is fine.

## User journeys

Named multi-screen flows. Each names entry → exit.

### J1: First-time sign-up

`[LOCKED]` — describes the live flow.

1. App launch → `AppGate` → no session → `/(auth)/login`
2. User taps "Create account" toggle → fills email/password → submits
3. Supabase confirms (no email-verification flow in MVP — TODO confirm)
4. `setSession()` fires → `AppGate` reruns → not onboarded → `/onboarding/welcome`
5. Welcome → Goal → Motivation → Commitment → `setOnboarding()` → `/(tabs)`

### J2: Complete a lesson

`[LOCKED]`

1. From `/(tabs)/learn` → tap next available lesson → `/lesson/[id]`
2. Phase: `scenario` → `intake` → `drill` → `output` → `done`
3. On `done`: `completeLesson()` fires → updates progress store → user taps close → back to `/(tabs)/learn`

### J3: Play a game

`[LOCKED]`

1. From `/(tabs)/practice` → tap a game card → `/practice/[gameId]`
2. Select source lesson(s) → game launches → `/(games)/<gameId>`
3. Game completes → return to practice menu

### J4: Emergency phrase

`[LOCKED]`

1. From `/(tabs)/` (home) → "Stuck right now?" card → `/emergency`
2. Browse 3 groups → tap a phrase → TTS plays
3. Back out via header/swipe

> **TODO:** J5+ — heritage flow, profile edit flow.

## Open questions

`[OPEN]`

- Should the lesson runner be a modal presentation (full-screen takeover) instead of a stack push?
- Email-verification flow (Supabase supports it) — gate before onboarding, or skip in MVP?
- Account deletion / sign-out flow — sign-out exists but no UX spec.
