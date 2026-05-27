# Claude Code Spec — Auth + Onboarding Persistence (Kannada Baa)

## Goal
Make signup deliver the new user into the onboarding flow on the same session,
and persist their onboarding answers (`learning_mode`, `motivations`,
`daily_goal_minutes`) into `public.users` so the same answers survive a
re-install, a different device, or a session refresh. After this lands, the
trio of (auth identity, onboarding answers, local hydration) is consistent for
every account and every device.

## Context
- App: Kannada Baa (Expo / React Native, Zustand + AsyncStorage, Supabase).
- Auth is Supabase email/password. "Confirm email" is OFF in Supabase project
  settings — `signUp` returns a live session immediately. This setting is
  assumed by the spec; turning it back ON later requires a follow-up spec for
  deep-link confirmation handling.
- Onboarding screens live in `app/onboarding/` (`welcome`, `goal`,
  `motivation`, `commitment`) and currently write only to Zustand
  (`useUserStore.setOnboarding`) — nothing reaches the DB.
- Supabase has `public.users` with `id, email, name, avatar_url,
  learning_mode, current_streak, created_at`. No row gets inserted today; only
  `auth.users` is populated.
- Routing gate is `AppGate` in `app/_layout.tsx`.

## Observed bug this spec closes
Symptom: user signs up, sees no onboarding, lands "somewhere" (often
`/(tabs)`), believes signup didn't work. On next login with the same
credentials, the session works (account exists in `auth.users`) and they end
up at the same place — to the user this reads as "login works, signup
doesn't."

Root cause: `AppGate` decides onboarding-vs-tabs from `hasCompletedOnboarding`
in AsyncStorage. The flag is stale across accounts on the same device (once
true, stays true). A fresh account with no DB row inherits the previous
account's flag and skips onboarding. There is also a contributing UX bug —
`login.tsx` unconditionally shows a "check your email" Alert even when no
confirmation is required.

## Architecture rules (read first — non-negotiables)
1. **DB is the source of truth for onboarding completion.**
   `public.users.onboarding_completed_at` (timestamptz nullable) is the only
   load-bearing flag. `useUserStore.hasCompletedOnboarding` is a derived
   cache, hydrated from the DB on every session sync. Never trust the local
   flag without a session sync since boot.
2. **`auth.users` ↔ `public.users` is 1:1 and trigger-maintained.**
   A Postgres trigger creates the matching `public.users` row on every
   `auth.users` insert. Client code never inserts into `public.users`. Client
   code only `select`s and `update`s its own row, gated by RLS.
3. **Onboarding write is atomic and gated.** The "Let's Go" button on
   `commitment.tsx` writes to the DB first; only on success does it set the
   local flag and navigate. On failure, stay on the screen, show a toast, do
   not corrupt local state.
4. **Cross-account state leak is prevented on user *bind*, not on signOut.**
   `useAuthStore.signOut()` preserves persisted user + progress state. The
   `AppGate` bind effect calls `resetForUser(newId)` whenever
   `storedUserId !== currentUserId`, which is the actual cross-account
   guard. Wiping state on signOut breaks same-user re-login: the routing
   effect briefly reads `hasCompletedOnboarding=false` and bounces the
   user through `/onboarding/welcome` before the DB sync resolves.
   *(Original spec called for a signOut reset; that caused the flicker
   bug. The bind-effect reset covers the same intent without the race.)*
5. **No new state libraries, no new auth providers, no email-confirmation
   work in this spec.** Stay inside the existing Zustand + Supabase stack.

## DB migrations (run in Supabase SQL editor)

### Migration 1 — extend `public.users`
```sql
alter table public.users
  add column if not exists motivations text[] not null default '{}',
  add column if not exists daily_goal_minutes int4,
  add column if not exists onboarding_completed_at timestamptz;

alter table public.users
  drop constraint if exists users_learning_mode_check,
  add constraint users_learning_mode_check
    check (learning_mode in ('spoken', 'written', 'both'));

alter table public.users
  drop constraint if exists users_daily_goal_minutes_check,
  add constraint users_daily_goal_minutes_check
    check (daily_goal_minutes is null or daily_goal_minutes in (5, 10, 20));
```

Notes:
- `learning_mode` already exists on `public.users`. Allow `null` until
  onboarding completes (the trigger inserts with default `null`).
- `motivations` defaults to empty array, not null, so reads never need
  null-guards.

### Migration 2 — auto-create `public.users` on auth signup
```sql
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
```

`on conflict do nothing` makes the trigger idempotent — re-running migration
or backfilling existing users is safe.

### Migration 3 — backfill existing `auth.users`
```sql
insert into public.users (id, email, current_streak)
select id, email, 0
from auth.users
on conflict (id) do nothing;
```
There are 4 existing rows in `auth.users` (verified via dashboard) with no
matching `public.users` row. Backfill so they don't 404 on first login.

### Migration 4 — RLS
```sql
alter table public.users enable row level security;

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);
-- intentionally no insert/delete policies — trigger handles insert; no delete.
```

## App changes

### `services/api/users.ts` (new file)
Single typed accessor for the `public.users` row. No component talks to
`supabase.from('users')` directly.

```ts
export type UserRow = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  learning_mode: 'spoken' | 'written' | 'both' | null;
  motivations: string[];
  daily_goal_minutes: 5 | 10 | 20 | null;
  current_streak: number;
  onboarding_completed_at: string | null;
  created_at: string;
};

export async function fetchUserRow(userId: string): Promise<UserRow | null>;
export async function completeOnboarding(userId: string, input: {
  learning_mode: 'spoken' | 'written' | 'both';
  motivations: string[];
  daily_goal_minutes: 5 | 10 | 20;
}): Promise<UserRow>;  // throws on failure; sets onboarding_completed_at server-side via now()
```

`completeOnboarding` uses `.update({...}).eq('id', userId).select().single()`
so the caller gets the persisted row back and can mirror it into local state
without a separate read.

### `app/(auth)/login.tsx`
- Remove the unconditional `Alert.alert('Check your email for a confirmation link!')`.
  Only show it when `data.session === null` after `signUp` (defensive — if
  someone re-enables email confirmation, this still works without crashing).
- Trim email (`email.trim().toLowerCase()`) before passing to Supabase to
  avoid duplicate accounts from casing/whitespace.
- Minimal client-side validation: non-empty email matching `/^\S+@\S+\.\S+$/`,
  password length ≥ 6. Show a toast on validation failure, don't hit Supabase.
- Do not toggle `isSignUp` to false on success — let `AppGate` route the user
  away. State reset is moot.
- No other UI changes; the screen layout in this file is in scope only for
  the bug-fix edits above.

### `services/api/supabase.ts`
No changes needed.

### `stores/useUserStore.ts`
- Add `setMotivations(motivations: string[])` action so `motivation.tsx`
  stops calling `setState` directly.
- Add `reset()` action that returns to initial defaults:
  ```ts
  hasCompletedOnboarding: false,
  learningMode: null,
  motivations: [],
  dailyGoalMinutes: null,
  // preserve: mode, hasSeenTtsWarning, permissionDenials, isHydrated
  ```
  Rationale: device-scoped prefs (TTS warning seen, permission denials)
  survive account switches because they describe the *device*, not the user.
- Add `hydrateFromUserRow(row: UserRow)` action: sets `learningMode`,
  `motivations`, `dailyGoalMinutes`, and
  `hasCompletedOnboarding = !!row.onboarding_completed_at` in one set call.
  Used by `AppGate` after every session sync.

### `stores/progressStore.ts`
- Add a `reset()` action mirroring the same pattern: clear `streak`, `xp`,
  `completedLessons`, `todayMinutes`, etc. back to initial defaults.
  (Detailed shape is owned by `progressStore.ts`; this spec just declares the
  contract: "post-`reset()` the store is indistinguishable from a fresh
  install".)

### `stores/useAuthStore.ts`
- Add an async `signOut()` action that:
  1. `await supabase.auth.signOut()`
  2. `resetLessonsCache()` (in-memory only)
  3. `set({ session: null, user: null })`
- Do **not** call `useUserStore.reset()` / `useProgressStore.reset()` here —
  the AppGate bind effect's `resetForUser` handles cross-account wipe when
  a different user binds next. See rule 4 above.
- Existing `setSession` / `setLoading` are unchanged.

### `app/(tabs)/profile.tsx`
- Replace the direct `await supabase.auth.signOut()` call with the new
  `useAuthStore.getState().signOut()`.
- No other changes.

### `app/_layout.tsx` (AppGate)
- In the `onAuthStateChange` callback, after `setSession(session)`:
  - If `session?.user`, call `fetchUserRow(session.user.id)`.
  - On success, call `useUserStore.getState().hydrateFromUserRow(row)`.
  - On failure (e.g. trigger lag, race on very first signup), log a warning
    and proceed — `hasCompletedOnboarding` stays at its current value.
    Routing useEffect will re-run after the next session event.
- Do NOT block the routing useEffect on the fetch. If the fetch is in
  flight, routing uses the current cached value; once the fetch resolves,
  `hydrateFromUserRow` triggers the store subscription and routing re-runs.

### `app/onboarding/motivation.tsx`
- Initialize `useState` from `useUserStore.getState().motivations` so backing
  out and returning preserves selections.
- Call `useUserStore.getState().setMotivations(selected)` instead of
  `useUserStore.setState({ motivations: selected })`.

### `app/onboarding/commitment.tsx` `handleFinish`
- Read `userId = useAuthStore.getState().user?.id`. If missing, toast
  ("Please sign in again") and stop — should not happen in practice but
  guards against an unsynced state.
- Read `learningMode` and `motivations` from `useUserStore.getState()`.
  If `learningMode` is null or `motivations` is empty, route back to the
  first incomplete screen instead of submitting (defensive — the existing
  screen flow should prevent this).
- `await completeOnboarding(userId, { learning_mode, motivations, daily_goal_minutes })`.
  - On success → `useUserStore.getState().hydrateFromUserRow(row)` → `router.replace('/(tabs)')`.
  - On failure → toast "Couldn't save your answers. Try again." → stay on
    screen. Do NOT call `setOnboarding` locally. The user can re-tap "Let's
    Go".

### `app/onboarding/goal.tsx`
- No behaviour change required; the existing pattern of writing to the store
  on Continue is fine. Optional: trim the local `useState` init to use
  `useUserStore((s) => s.learningMode)` so re-renders pick up store updates,
  but not required for the bug fix.

## Out of scope (explicitly do not add)
- Email confirmation handling (deep links, post-confirm redirect). Spec
  assumes "Confirm email" stays OFF.
- OAuth providers (Google, Apple, etc).
- Profile editing (name, avatar). Onboarding writes the three answer fields
  only; everything else on `public.users` is owned by other features.
- Re-running onboarding from settings. If the user wants to change their
  learning mode, that's handled in `profile.tsx` via `setLearningMode`
  (existing) — this spec does not gate or repeat onboarding.
- Migration of legacy AsyncStorage `hasCompletedOnboarding=true` rows
  belonging to no DB row. Acceptable to re-run onboarding once for those
  users (they're internal testers).
- Password reset flows.
- Analytics / event tracking on signup or onboarding completion.

## Acceptance criteria
- [ ] Fresh install + sign up with a never-used email → onboarding shows
      immediately after signup; completing it persists three fields to
      `public.users` (verify in Supabase dashboard) AND lands on `/(tabs)`.
- [ ] Sign out, sign in with the same email → routes straight to `/(tabs)`
      without onboarding. `useUserStore` reflects the persisted answers.
- [ ] Sign out, sign up with a SECOND fresh email on the same device →
      onboarding shows. Cross-account stale-flag bug is gone.
- [ ] Kill app, reopen → still signed in to last account, routed correctly,
      local stores rehydrated from the DB.
- [ ] Network down during "Let's Go" tap on `commitment.tsx` → toast
      appears, user stays on screen, no local flag flip, no navigation.
      Retry on reconnect succeeds.
- [ ] Backfill migration ran → all 4 existing `auth.users` rows have a
      matching `public.users` row with `onboarding_completed_at IS NULL`
      (these accounts route into onboarding on next login).
- [ ] No code path calls `supabase.from('users').insert(...)` from the
      client. Only `update` and `select`.
- [ ] No code path reads `hasCompletedOnboarding` from local state without
      a session sync having happened since boot.
- [ ] `login.tsx` no longer shows "check your email" when a session is
      returned.
- [ ] After signing out and signing back in as the **same** user, the app
      routes straight to `/(tabs)` with no flash of `/onboarding/welcome`
      (persisted state survives signOut; bind effect no-ops since
      `storedUserId === currentUserId`).
- [ ] After signing out and signing in as a **different** user on the same
      device, that user sees fresh state (bind effect's `resetForUser`
      fires because `storedUserId !== currentUserId`).

## Manual test plan
1. **Migrations applied.** Run all four SQL blocks in Supabase. Confirm
   `public.users` has the four new columns and constraints, the trigger
   exists, and `select count(*) from public.users` matches
   `select count(*) from auth.users`.
2. **New signup, fresh email.**
   - Wipe AsyncStorage (delete app + reinstall, or expo dev clear).
   - Sign up `test+a@yourdomain.com` / `password123`.
   - Confirm: no "check your email" alert; onboarding `welcome` screen
     renders immediately.
   - Complete onboarding (`both`, 2 motivations, 10 min).
   - Confirm: `/(tabs)` renders. Open Supabase dashboard → `public.users`
     → find row → `learning_mode=both`, `motivations={...}`,
     `daily_goal_minutes=10`, `onboarding_completed_at` is set.
3. **Sign out and back in.**
   - Sign out from `profile.tsx`.
   - Sign in with the same credentials.
   - Confirm: lands on `/(tabs)`, no onboarding. Open profile, learning
     mode chip reflects "both".
4. **Second fresh account, same device.**
   - Sign out.
   - Sign up `test+b@yourdomain.com`.
   - Confirm: onboarding renders. This was previously broken — verify it.
5. **App restart preserves session.**
   - Kill the app cold. Reopen.
   - Confirm: still signed in to last account, routed to `/(tabs)`, local
     stores reflect persisted answers.
6. **Network failure during "Let's Go".**
   - On a fresh signup, reach `commitment.tsx`.
   - Enable airplane mode. Tap "Let's Go".
   - Confirm: toast appears, screen stays, no navigation.
   - Disable airplane mode. Tap "Let's Go" again.
   - Confirm: persists and navigates.
7. **Backfilled accounts.**
   - Sign in as one of the 4 pre-existing accounts (the four already in
     `auth.users`).
   - Confirm: onboarding renders (because their `public.users` row exists
     but `onboarding_completed_at` is null).

## Where to wire it
- DB: run migrations 1–4 in Supabase SQL editor before merging app code.
- API surface: `services/api/users.ts` is the only file that touches the
  `public.users` table from the client. Components import `fetchUserRow` /
  `completeOnboarding` from there.
- Routing/hydration: `AppGate` in `app/_layout.tsx` owns the
  session-to-store sync.
- Onboarding write: `commitment.tsx` is the sole caller of
  `completeOnboarding`.
- Sign-out reset: `useAuthStore.signOut()` is the sole exit point; all
  signOut UI dispatches through it.

## Risks / open questions
- `[OPEN]` — Should `useUserStore.reset()` also clear `hasSeenTtsWarning`
  and `permissionDenials`? Current proposal preserves them as
  device-scoped. Decide before implementing.
- `[OPEN]` — If `fetchUserRow` returns `null` for a session whose
  `auth.users` row exists but `public.users` row does not (trigger lag, or
  trigger failed silently in a future migration), should the client
  upsert a row as a fallback? Current proposal: log + leave it; the next
  app boot will retry. Acceptable for MVP; revisit if it surfaces in
  practice.
- `[OPEN]` — Should `commitment.tsx` "Let's Go" disable while the request
  is in flight to prevent double-submit? Recommendation: yes, with a
  small spinner inside the button (per CLAUDE.md form rules). Confirm
  before coding.

## Reference
- DB schema dump from user message of 2026-05-20 (12 tables; this spec only
  touches `public.users`).
- Supabase Auth dashboard at this URL confirms 4 existing `auth.users` rows:
  https://supabase.com/dashboard/project/fhhzrzmmulqgmfwmeodq/auth/users
- `docs/foundation/STATE.md` for the existing `useUserStore` / store
  conventions.
- `docs/foundation/CONTRADICTIONS.md` C3 — the `mode: 'rowdy' | 'classic'`
  field is being removed; this spec preserves it untouched (its removal is
  scheduled separately, not in this spec).
