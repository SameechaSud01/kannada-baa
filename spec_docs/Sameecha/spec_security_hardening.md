---
doc: SPEC_SECURITY_HARDENING
status: proposed
owner: samee
last-reviewed: 2026-06-01
branch: security-hardening
related:
  - ../../.claude/CLAUDE.md
  - ../../docs/foundation/SCOPE.md
  - ../../services/api/supabase.ts
  - ../../services/api/migrations/2026-05-20_auth_onboarding.sql
  - ../../scripts/security-scan.sh
  - ./spec_auth_onboarding.md
---

# Security hardening (baseline)

Fixes the medium- and low-severity findings surfaced in the 2026-06-01 security review of the Kannada Baa Expo app. The review confirmed the baseline is solid (RLS on every user-data table, secrets in Keychain, no JWT/service-role keys in source or history); this spec closes the residual gaps before OAuth (Google + Apple) lands.

Items #3 and parts of #1 are prerequisites for the upcoming OAuth spec — see §6 Cross-spec impact.

## Goal

After this spec lands:

1. **Password policy** is 8+ characters at the client boundary (was 6).
2. **`handle_new_user` trigger** length-caps and scheme-validates anything pulled from `raw_user_meta_data` so OAuth-provided `full_name` / `avatar_url` can't poison `public.users`.
3. **`Linking.openURL` call sites** that consume non-literal URLs validate the scheme is `https:` before opening.
4. **`security-scan.sh`** widens its file-type coverage, narrows its console-statement noise, and gains an extra check for non-Supabase `fetch` calls.
5. **Production builds** strip `console.log` / `console.debug` automatically via Babel.
6. **`syncOnboardingToSupabase` failure** is retried on next app boot rather than silently lost.
7. **Expo SDK is on a track that resolves the `npm audit` build-tooling vulns** (scheduled, not blocked on this spec).

## Out of scope (explicitly deferred)

| Item | Why deferred |
|---|---|
| Supabase dashboard config (rate limits, email confirmation, password-strength rules) | Owner choice; out-of-repo. Tracked as finding #5 in the review; deferred per owner direction (2026-06-01 chat) because OAuth lands next and will re-shape these settings anyway. |
| OAuth provider wiring (Google, Apple) | Lives in a separate spec — this one only prepares the trigger. |
| Account recovery (forgot password) flow | Open question in [SCOPE.md](../../docs/foundation/SCOPE.md). Touches Supabase email config, deserves its own spec. |
| Biometric app lock (Face ID / fingerprint gate at app open) | No PII / payment data → not justified at current scope. |
| Replacing AsyncStorage with `expo-secure-store` for the Zustand stores | `useUserStore` / `useProgressStore` hold no secrets — only display name, progress, prefs. Re-evaluate only if those stores ever hold a token. |
| Removing the `EXPO_PUBLIC_SUPABASE_ANON_KEY` from the client bundle | By design — anon key is meant to be public; RLS is the real guard. Confirmed in 2026-06-01 review. |
| Certificate pinning | Mobile-app threat-model overkill at this scope; Supabase uses standard CA-signed TLS, iOS ATS + Android default network security config enforce TLS. |

## Architecture principles

1. **Mobile threat model, not web.** Classic browser security headers (CSP / HSTS / X-Frame-Options / CORS) live on Supabase's edge and are managed; this spec does not touch them. The native app's surface is: auth flow, deep links, third-party content URLs, on-device storage, and bundled secrets.
2. **Server-side authorization is the only authority.** Client-side validation (e.g. password length) is UX, not security. Anything that protects user data must be enforceable in SQL / RLS / a `security definer` function with a fixed `search_path`.
3. **Validate at boundaries.** User-controllable input that crosses a trust boundary (OAuth `raw_user_meta_data` → `public.users`; external string → `Linking.openURL`) is normalized and bounded before it lands.
4. **Defense in depth on logs.** `console.warn` / `console.error` stay in source for diagnostics; production builds drop `console.log` / `console.debug` at build time. No PII / tokens log paths regardless.
5. **No regressions.** Every change in this spec ships with a failing-then-passing check (lint, scan, runtime test, or RLS query). If a change cannot be verified, it does not ship.

## Decision summary

| Topic | Decision | Tag |
|---|---|---|
| Minimum password length raised from 6 → 8 at the client | Yes — UX hint only; real strength lives in Supabase Auth config | `[LOCKED]` |
| `handle_new_user` length-caps `name` (80 chars) and `avatar_url` (500 chars) | Yes | `[LOCKED]` |
| `handle_new_user` requires `avatar_url` to start with `https://` or stores NULL | Yes | `[LOCKED]` |
| `openUrl` helper in [help.tsx](../../app/settings/help.tsx) restricts scheme to `https:` | Yes | `[LOCKED]` |
| Add a single shared `safeOpenUrl(url)` helper in `lib/safeOpenUrl.ts` | Yes — one source of truth for scheme validation | `[LOCKED]` |
| `babel-plugin-transform-remove-console` in production-only Babel config | Yes — keeps `warn` / `error`; strips `log` / `debug` | `[LOCKED]` |
| `security-scan.sh` extends globs to `*.sql`, `*.md`, `*.yml` and narrows pattern 2 to `console.log` / `console.debug` only | Yes | `[LOCKED]` |
| `security-scan.sh` adds a new check for non-Supabase `fetch(...)` / `axios` / `XMLHttpRequest` in app source | Yes | `[LOCKED]` |
| Onboarding sync retry: re-run `syncOnboardingToSupabase` on next boot if local `hasCompletedOnboarding=true` but DB `onboarding_completed_at` is null | Yes | `[LOCKED]` |
| Expo SDK bump to resolve `xmldom` / `postcss` / `uuid` / `ws` build-tool advisories | Scheduled — not blocked on this spec; tracked as §7 | `[OPEN]` |
| Avatar `name` / `avatar_url` caps: 80 / 500 chars | Defaults proposed; owner may tighten | `[OPEN]` |

## 1. Password minimum length

`[LOCKED]`

### Change

[app/(auth)/login.tsx:39](../../app/%28auth%29/login.tsx#L39):

```diff
- if (!EMAIL_RE.test(normalizedEmail) || password.length < 6) {
+ if (!EMAIL_RE.test(normalizedEmail) || password.length < 8) {
```

[app/(auth)/login.tsx:173](../../app/%28auth%29/login.tsx#L173) — sign-up placeholder:

```diff
- placeholder={isSignUp ? 'Password (min 6 characters)' : 'Password'}
+ placeholder={isSignUp ? 'Password (min 8 characters)' : 'Password'}
```

[components/modals/instances/toastCatalog.ts](../../components/modals/instances/toastCatalog.ts) — `invalidCredentials` subtitle:

```diff
- subtitle: 'Enter a valid email and a password of 6+ characters',
+ subtitle: 'Enter a valid email and a password of 8+ characters',
```

### Acceptance

- Sign-up form rejects a 7-char password with `Toasts.invalidCredentials()` and never calls `signUp`.
- Sign-up form accepts an 8-char password and proceeds to `supabase.auth.signUp`.
- Existing users with 6- or 7-char passwords can **still log in** (login path checks `password.length < 8` but Supabase has no client-enforceable history of the password they used to set; this is intentional — we don't lock anyone out, we only raise the bar for new passwords). Owner: confirm acceptable, otherwise lower login-path check to `< 6` and keep the `< 8` only on the signup branch. **`[OPEN]` until owner confirms.**

## 2. `handle_new_user` trigger hardening

`[LOCKED]`

### Context

The current `handle_new_user` ([2026-05-20_auth_onboarding.sql](../../services/api/migrations/2026-05-20_auth_onboarding.sql) Migration 2) only writes `id, email, current_streak`. The draft OAuth migration in the working tree (`2026-05-31_oauth_handle_new_user.sql`, currently unstaged) extends it to pull `full_name` and `avatar_url` from `raw_user_meta_data`. That field is **user-controllable** at signup — a hostile client can set any string. This section hardens that draft before it lands.

### Migration

New migration `2026-MM-DD_oauth_handle_new_user_hardened.sql` that supersedes the unstaged draft. Owner: discard the unstaged draft after confirming this section reflects intent.

```sql
-- spec_docs/Sameecha/spec_security_hardening.md §2
-- Replaces handle_new_user to safely consume provider metadata for OAuth.
-- Idempotent and safe to re-run.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  raw_name text := meta ->> 'full_name';
  raw_avatar text := meta ->> 'avatar_url';
  safe_name text;
  safe_avatar text;
begin
  -- Length cap. raw_user_meta_data is user-controllable — never trust verbatim.
  safe_name := nullif(left(coalesce(raw_name, ''), 80), '');

  -- Scheme allowlist. We only store URLs the device can safely Image.prefetch().
  -- Anything that doesn't start with https:// (file://, javascript:, data:, http://, ...)
  -- becomes NULL. Length cap is post-scheme-check.
  if raw_avatar is not null and raw_avatar like 'https://%' then
    safe_avatar := nullif(left(raw_avatar, 500), '');
  else
    safe_avatar := null;
  end if;

  insert into public.users (id, email, name, avatar_url, current_streak)
  values (
    new.id,
    new.email,
    safe_name,
    safe_avatar,
    0
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger already exists from 2026-05-20_auth_onboarding.sql Migration 2.
-- create or replace function above is enough; no drop/recreate of the trigger.
```

### Rationale per check

| Check | Why |
|---|---|
| `left(..., 80)` on `name` | Caps the column at a sane display length. Existing `displayName` UI assumes one-line text. |
| `nullif(..., '')` after the cap | Empty strings collapse to `NULL` so the existing `row.name ?? null` reads stay clean. |
| `like 'https://%'` on `avatar_url` | Prevents `javascript:`, `data:`, `file:`, `http:` from being persisted. Even though no app code currently renders `avatar_url` as an `<Image>`, a future regression that pipes it to `Image.source.uri` would otherwise expose the device IP / leak fetch metadata to attacker-controlled hosts. |
| `left(..., 500)` on `avatar_url` | DoS / storage cap. Provider URLs (Google, Apple, GitHub) are well under this. |
| `security definer` + `set search_path = public` | Already present in the existing trigger. Confirmed correct — prevents search-path hijack on the function's privileged execution context. **Do not remove.** |

### Backfill

If any row in `public.users` was created via the unstaged draft trigger before this spec landed, the only realistic exposure is an oversized `avatar_url` or a non-`https://` `avatar_url`. One-shot SQL the owner can run from the Supabase dashboard:

```sql
update public.users
   set avatar_url = null
 where avatar_url is not null
   and (avatar_url not like 'https://%' or length(avatar_url) > 500);

update public.users
   set name = left(name, 80)
 where name is not null and length(name) > 80;
```

These are idempotent. Not part of the migration file — operational cleanup only.

### Acceptance

- Manually insert into `auth.users` with `raw_user_meta_data = '{"avatar_url":"javascript:alert(1)","full_name":"X"}'`:
  - `public.users.avatar_url` for that id is `NULL`.
  - `public.users.name` for that id is `'X'`.
- Manually insert with `raw_user_meta_data = '{"avatar_url":"https://example.com/' || repeat('a', 600) || '"}'`:
  - `public.users.avatar_url` for that id has `length() <= 500`.
- Existing trigger behavior (`on conflict (id) do nothing`) preserved — re-running signup for an existing id is a no-op.

## 3. `Linking.openURL` scheme validation

`[LOCKED]`

### New helper

[lib/safeOpenUrl.ts](../../lib/safeOpenUrl.ts) — new file. One source of truth so a future regression can't reintroduce the gap site-by-site.

```ts
import * as Linking from 'expo-linking';

/**
 * Opens an external URL only if it is an https: URL. mailto: and tel: schemes
 * are explicitly NOT supported here — call Linking.openURL directly for those.
 * The intent is: any URL that came from a non-literal source (DB column,
 * remote config, OAuth provider metadata, etc.) goes through this helper.
 */
export function safeOpenUrl(url: string | null | undefined): Promise<void> {
  if (!url || typeof url !== 'string') return Promise.resolve();
  if (!/^https:\/\//i.test(url)) return Promise.resolve();
  return Linking.openURL(url).catch(() => undefined);
}
```

### Call-site changes

[app/settings/help.tsx](../../app/settings/help.tsx) — replace the local `openUrl` (lines 58-61) with the helper:

```diff
- function openUrl(url: string | null) {
-   if (!url) return;
-   Linking.openURL(url).catch(() => undefined);
- }
+ import { safeOpenUrl } from '../../lib/safeOpenUrl';
+ // openUrl removed — call sites use safeOpenUrl directly.
```

…and replace `() => openUrl(PRIVACY_URL)` / `() => openUrl(TERMS_URL)` with `() => safeOpenUrl(PRIVACY_URL)` / `() => safeOpenUrl(TERMS_URL)`.

Other current `Linking.openURL` call sites do **not** need the wrapper:

- `buildMailto(...)` results: scheme is `mailto:`, address is hardcoded. Leave as-is.
- `Linking.openSettings()`: OS API, no URL. Leave as-is.
- No other non-literal URL sources exist in the tree as of 2026-06-01.

### Test

[__tests__/lib/safeOpenUrl.test.ts](../../__tests__/lib/safeOpenUrl.test.ts) (new):

| Input | `Linking.openURL` called? |
|---|---|
| `'https://example.com'` | Yes |
| `'HTTPS://EXAMPLE.COM'` (uppercase scheme) | Yes |
| `'http://example.com'` | No |
| `'javascript:alert(1)'` | No |
| `'file:///etc/passwd'` | No |
| `'mailto:x@y.com'` | No |
| `null` / `undefined` / `''` / `42` | No |

Mock `expo-linking` with a jest mock. Mirrors the pattern in [`__tests__/stores/`](../../__tests__/stores).

### Acceptance

- Scan with `grep -RnE 'Linking\.openURL\s*\(\s*(?![\x27"](mailto:|https?://[^"\x27)]+))' app/ components/` returns zero results outside `lib/safeOpenUrl.ts`. (i.e. no non-literal URL is ever passed to `Linking.openURL` directly.)
- The 7 tests above pass.

## 4. Production console stripping

`[LOCKED]`

### Dependency

Add `babel-plugin-transform-remove-console` to `devDependencies`. Single-purpose, ~50 LoC, maintained.

### `babel.config.js`

Current:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

Updated:

```js
module.exports = function (api) {
  api.cache(true);
  const plugins = [];
  if (process.env.NODE_ENV === 'production') {
    plugins.push([
      'transform-remove-console',
      { exclude: ['warn', 'error'] },
    ]);
  }
  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
```

### Rationale for the `exclude` list

- `console.log` / `console.debug` are diagnostic — strip in production.
- `console.warn` / `console.error` survive because they are the project's error breadcrumbs (37 sites verified 2026-06-01) and feed Expo's crash console + future Sentry/Bugsnag integration. They do not log secrets (verified by the review).

### Acceptance

- `NODE_ENV=production npx babel components/lesson/PracticeWordsPhase.tsx --presets=babel-preset-expo --plugins='transform-remove-console,{"exclude":["warn","error"]}' | grep -c 'console.warn'` returns the same count as the source file. (`warn` survives.)
- Same command grep'd for `console.log` returns `0` (none in this file anyway, but the EAS production bundle should likewise contain zero `console.log` calls — verifiable via `eas build:inspect` or `npx expo export --platform ios --dump-sourcemap` and grep on the output bundle).

## 5. `security-scan.sh` improvements

`[LOCKED]`

### Changes to [scripts/security-scan.sh](../../scripts/security-scan.sh)

1. **Extend file-type globs** in `SCAN_FILES` to include `*.sql`, `*.md`, `*.yml`, `*.yaml`, `*.env*` (excluding `.env.example`). Catches secrets pasted into migrations, READMEs, GitHub Actions, or local env files.

2. **Narrow pattern 2 (console statements)** to `console\.\(log\|debug\)` only. `warn` and `error` are legitimate (and now build-time-stripped if a release engineer wants them gone). Reduces 17 warnings to ~0 on a clean tree.

3. **Add a new check (6/6) for non-Supabase fetch calls.** Today, all network goes through the `supabase` client. A regression that introduces a raw `fetch('https://attacker.com/...')` should fail the scan.

   ```bash
   echo "[ 6/6 ] Checking for direct HTTP calls outside the Supabase client..."
   RAW_FETCH=$(echo "$SCAN_FILES" | xargs grep -lnE '(^|[^.])fetch\(|axios|XMLHttpRequest' 2>/dev/null \
     | grep -v 'services/api/' \
     | grep -v '__tests__' \
     | grep -v 'react-native' \
     | grep -v 'node_modules' || true)
   if [ -n "$RAW_FETCH" ]; then
     echo -e "${YELLOW}  WARN: Direct fetch/axios/XHR found outside services/api/:${NC}"
     echo "$RAW_FETCH" | head -10
     WARNED=1
   else
     echo -e "${GREEN}  PASS${NC}"
   fi
   ```

4. **Update header from `[ 1/5 ]`…`[ 5/5 ]` to `[ 1/6 ]`…`[ 6/6 ]`**.

5. **Document in [`scripts/security-scan.sh`](../../scripts/security-scan.sh) header comment** what the scan does and does NOT catch (see Limitations below).

### Limitations (documented as comments at top of script)

The scan does **not** check:

- Secrets in git history pre-commit (would need `gitleaks` or similar — `[OPEN]` for a future spec).
- Secrets in `package-lock.json` / `ios/` / `android/` (these are excluded from `SCAN_DIRS`; on purpose, since they regenerate).
- Runtime secrets in environment-injected EAS Build values.
- Dependency vulns (use `npm audit`).

### Acceptance

- Run `bash scripts/security-scan.sh` on a clean tree → all 6 checks PASS, zero warnings (after the changes in §4 ship; on this commit alone it'll WARN on existing `console.log` if any sneak in).
- Introduce a `fetch('https://example.com')` in `hooks/useLessons.ts` → check 6 fails with a WARN listing that file.

## 6. Onboarding sync retry

`[LOCKED]`

### Problem

[services/api/onboarding.ts:28-30](../../services/api/onboarding.ts#L28-L30) swallows the error and the user's local `hasCompletedOnboarding` flips to `true`. If the server write was the only one that mattered (e.g. user reinstalls before next boot), the data is lost. The fix is not to *block* the user on save failure (that decision stays), but to *retry* on next session boot.

### Service

[services/api/onboarding.ts](../../services/api/onboarding.ts) — extend `syncOnboardingToSupabase` to return a typed result so callers know whether to mark a pending retry:

```ts
export type SyncResult = { ok: true } | { ok: false; error: unknown };

export async function syncOnboardingToSupabase(row: OnboardingRow): Promise<SyncResult> {
  const { error } = await supabase
    .from('users')
    .update({
      name: row.name,
      learning_mode: row.learningMode,
      motivations: row.motivations,
      daily_goal_minutes: row.dailyGoalMinutes,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq('id', row.userId);

  if (error) {
    console.warn('[onboarding] sync to users table failed', error);
    return { ok: false, error };
  }
  return { ok: true };
}
```

### Store

[stores/useUserStore.ts](../../stores/useUserStore.ts) — add a single new field:

| Field | Type | Default | Purpose |
|---|---|---|---|
| `pendingOnboardingSync` | `OnboardingData \| null` | `null` | Snapshot of the answers to retry. Cleared when retry succeeds. |

…and one setter `setPendingOnboardingSync(data | null)`. Persisted via the existing AsyncStorage middleware.

### Boot path

[app/_layout.tsx](../../app/_layout.tsx) `AppGate.useEffect` (the `fetchUserRow` block, lines 126-143) — after a successful row fetch:

```ts
fetchUserRow(userId)
  .then(async (row) => {
    if (!row) return;
    useUserStore.getState().hydrateFromUserRow(row);

    // §6 retry: if local says onboarding is done but the DB row's flag is null,
    // the prior sync silently failed. Retry once now that we have a session.
    const pending = useUserStore.getState().pendingOnboardingSync;
    if (pending && !row.onboarding_completed_at) {
      const result = await syncOnboardingToSupabase({
        userId,
        name: pending.displayName ?? null,
        learningMode: pending.learningMode,
        motivations: pending.motivations,
        dailyGoalMinutes: pending.dailyGoalMinutes,
      });
      if (result.ok) {
        useUserStore.getState().setPendingOnboardingSync(null);
      }
      // On failure, leave the snapshot — we'll try again next boot. No toast:
      // user already completed onboarding from their POV.
    }
    // …existing reminders re-arm block continues here…
  })
```

### Onboarding write path

[app/onboarding/commitment.tsx](../../app/onboarding/commitment.tsx) — wherever `syncOnboardingToSupabase` is called today (currently fire-and-forget), update to:

```ts
const result = await syncOnboardingToSupabase(row);
if (!result.ok) {
  useUserStore.getState().setPendingOnboardingSync({
    displayName, learningMode, motivations, dailyGoalMinutes,
  });
}
```

The user is still routed forward immediately on UI; the retry happens silently on next boot.

### Acceptance

- Airplane-mode test: complete onboarding with network off → user reaches home screen → `useUserStore.pendingOnboardingSync` is populated → DB `users.onboarding_completed_at` is null.
- Re-open the app with network on → boot path retries → `users.onboarding_completed_at` is set → `pendingOnboardingSync` is cleared.
- Network-on path unchanged: `syncOnboardingToSupabase` succeeds → `pendingOnboardingSync` remains `null` (never written).

## 7. Expo SDK / dependency vulns

`[OPEN]` — scheduled, not blocked on this spec.

### What `npm audit --omit=dev` flagged on 2026-06-01

| Package | Severity | Reachable in runtime bundle? |
|---|---|---|
| `@xmldom/xmldom` | High | No — used by `@expo/config-plugins` at build time only. |
| `postcss` | Moderate | No — `@expo/metro-config` build chain. |
| `uuid` (<11) | Moderate | No — `xcode` → `@expo/config-plugins` build chain. |
| `ws` (8.0.0–8.20.0) | Moderate | No — Metro / dev-server only. |
| `brace-expansion` | Moderate | No — `glob` transitive. |

All five are build-tooling, not runtime. The user's installed app cannot reach them.

### Plan

- Track Expo SDK 56 stable release. When it ships and is compatible with the rest of `package.json`, run `npx expo upgrade 56` in a dedicated branch, smoke-test on iPhone SE + a mid-Android, and merge.
- No code changes in this spec for #7. The audit comment is part of `scripts/security-scan.sh`'s new header.

### Acceptance

- `npm audit --omit=dev` post-Expo-56-upgrade returns 0 high, ≤2 moderate (transitive build-only).

## 8. Cross-spec impact

| Spec / doc | Update needed |
|---|---|
| [SCOPE.md](../../docs/foundation/SCOPE.md) §Auth | After OAuth ships, update from "Supabase email/password" to "Supabase email/password + Google + Apple". Not touched by this spec. |
| [spec_auth_onboarding.md](spec_auth_onboarding.md) | Add a footnote: `handle_new_user` was hardened in `spec_security_hardening.md` §2 to safely consume OAuth provider metadata. |
| `spec_oauth_*.md` (upcoming) | Should reference §2 of this spec as a prerequisite. The OAuth spec only adds Google/Apple sign-in UI + Supabase provider config; the trigger that consumes `raw_user_meta_data` is owned here. |
| [CONTRADICTIONS.md](../../docs/foundation/CONTRADICTIONS.md) | No new entry — none of the changes here conflict with a locked decision. |

## 9. PR breakdown

Three PRs against branch `security-hardening`. Sequenced so OAuth (next spec) can start as soon as PR1 + PR2 land.

### PR1 — Trigger hardening + password bump + safeOpenUrl

Touches: SQL migration, login screen, toast catalog, help screen, new `lib/safeOpenUrl.ts`, tests.

- §1 Password 6 → 8.
- §2 New SQL migration. Discards the unstaged draft `2026-05-31_oauth_handle_new_user.sql` after owner confirms.
- §3 `lib/safeOpenUrl.ts` + help screen migration + 7 unit tests.

Why bundled: these three are the highest-signal review changes (security-relevant) and small. Easy to revert if any one regresses.

### PR2 — Build-time stripping + scan upgrades

Touches: `babel.config.js`, `package.json` (+1 devDep), `scripts/security-scan.sh`.

- §4 `transform-remove-console`.
- §5 scan widen + narrow + new check 6.

Verify: run `npm run security-scan` on the post-PR1 tree before merging.

### PR3 — Onboarding sync retry

Touches: `services/api/onboarding.ts`, `stores/useUserStore.ts`, `app/_layout.tsx`, `app/onboarding/commitment.tsx`, + STATE.md row.

- §6 retry plumbing.
- [STATE.md](../../docs/foundation/STATE.md) updated to add `pendingOnboardingSync` to the `useUserStore` table.

### Not in any PR

- §7 (Expo SDK bump) — separate branch when SDK 56 is stable.

## 10. Tests

| Layer | Test | Spec section |
|---|---|---|
| `lib/safeOpenUrl.ts` | 7-case truth table from §3. | §3 |
| `services/api/onboarding.ts` | `syncOnboardingToSupabase` returns `{ok:true}` on success / `{ok:false, error}` on Supabase error. Mock Supabase. | §6 |
| `app/_layout.tsx` AppGate (integration) | When `pendingOnboardingSync` is non-null and DB row's `onboarding_completed_at` is null, boot path calls `syncOnboardingToSupabase` and clears the pending value on success. | §6 |
| SQL trigger (manual SQL editor verification, no test harness yet) | Three insert cases from §2 Acceptance. | §2 |
| Scan (CI) | `scripts/security-scan.sh` passes on the post-PR2 tree. Pre-push hook is already wired. | §5 |

Visual / screen-snapshot tests not added — per [CLAUDE.md](../../.claude/CLAUDE.md) Testing section.

## 11. Open questions (owner sign-off needed before PR1)

1. **§1**: Should the login-path (vs signup-path) password check also raise to 8? Default: **no** (don't lock out existing users with 6/7-char passwords).
2. **§2**: Confirm 80 / 500 caps for `name` / `avatar_url`. Tighten if you have a known display width / storage budget.
3. **§2**: Confirm the unstaged `2026-05-31_oauth_handle_new_user.sql` in the working tree is discarded in favor of the §2 migration. The IDE selection that surfaced this review was that file.
4. **§4**: Confirm we strip `console.log` / `console.debug` only and keep `warn` / `error`. Alternative is to strip everything (cleaner bundle, no diagnostic breadcrumbs).
5. **§6**: Confirm "retry silently on next boot" is the right UX (no toast either way). Alternative is a one-time toast on success ("Synced your earlier setup").
6. **§7**: Confirm Expo SDK 56 bump is scheduled but not gated on this spec.

All other decisions in §Decision summary are `[LOCKED]` and may proceed once the above are resolved.
