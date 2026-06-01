# Claude Code Spec — Google + Apple OAuth Sign-In (Kannada Baa)

> **Status:** DRAFT v2 — Q1–Q4 closed 2026-05-31. Awaiting final owner
> review before implementation. One `[OPEN]` question remains (Q5, Apple
> email relay — no action required for this spec).

## Goal

Let users sign up and sign in with **Google** and **Apple** alongside the
existing email/password flow, on both iOS and Android. After this lands, the
[(auth)/login](../../app/(auth)/login.tsx) screen offers three entry points
(email, Google, Apple); each sign-up method is independent (no identity
linking — see Rule 1); and the onboarding flow defined by
[spec_auth_onboarding.md](spec_auth_onboarding.md) fires for first-time OAuth
users just as it does for email signups.

## Context

- App: Kannada Baa (Expo / React Native, Zustand + AsyncStorage, Supabase).
- Auth today: Supabase email/password only. "Confirm email" is OFF; `signUp`
  returns a live session immediately. See
  [spec_auth_onboarding.md](spec_auth_onboarding.md) for the existing flow.
- `public.users` is auto-populated by the `handle_new_user` trigger on every
  `auth.users` insert (spec_auth_onboarding Migration 2). The trigger does
  **not** care which provider created the auth row — it fires the same way
  for email, Google, or Apple. This spec relies on that.
- Foundation reference: [docs/foundation/STATE.md](../../docs/foundation/STATE.md)
  §`useAuthStore` is `[LOCKED]` (not persisted; Supabase owns the session).
  This spec adds **no** new fields to `useAuthStore`.
- Routing gate: `AppGate` in [app/_layout.tsx](../../app/_layout.tsx). Already
  agnostic to provider — it reads `session` and `public.users.onboarding_completed_at`.
- App config: scheme `kannada-baa`, iOS bundle `com.samsud01.kannadabaa`,
  Android package `com.samsud01.kannadabaa` ([app.json](../../app.json)).
- **Out-of-scope reversal:** [spec_auth_onboarding.md](spec_auth_onboarding.md)
  line 268 listed "OAuth providers (Google, Apple, etc)" as out of scope.
  This spec is the explicit successor. The earlier exclusion is now
  **superseded**, not in conflict.

## Architecture rules (read first — non-negotiables)

1. **One sign-up method per email — no identity linking.** If a user
   signed up with email/password, they cannot later sign in with Google or
   Apple using the same email (and vice versa). The OAuth call fails at
   the Supabase layer; the client catches the error and shows a toast
   telling the user to sign in with their original method. The client
   never creates or merges `public.users` rows. Owner-decided 2026-05-31
   to keep the auth model strict for now; an identity-linking spec can
   come later if users ask for it.
2. **OAuth uses native flows where the platform offers one.**
   - Google → `@react-native-google-signin/google-signin` (native UI on
     iOS + Android) → ID token → `supabase.auth.signInWithIdToken({provider: 'google', token})`.
   - Apple on iOS → `expo-apple-authentication` (native sheet) → identity
     token + nonce → `supabase.auth.signInWithIdToken({provider: 'apple', token, nonce})`.
   - Apple on Android → there is no native Apple SDK; use
     `supabase.auth.signInWithOAuth({provider: 'apple', options: { redirectTo: 'kannada-baa://auth/callback' }})`
     with `expo-web-browser` for the in-app browser.
3. **Onboarding is the same for every provider.** The
   `handle_new_user` trigger inserts `public.users` with
   `onboarding_completed_at = null`. `AppGate` then routes the new user to
   `/onboarding/welcome` exactly as email signup does today. No
   provider-specific onboarding branching.
4. **No state-shape changes.** `useAuthStore` keeps the
   `session | user | isLoading` shape locked in [STATE.md](../../docs/foundation/STATE.md).
   `useUserStore` is untouched; its hydration from `public.users` already
   handles whatever the OAuth provider populated (name, avatar_url).
5. **`useAuthStore.signOut()` continues to handle every provider.**
   `supabase.auth.signOut()` clears the Supabase session for any provider.
   The native Google SDK has its own `signOut()` and `revokeAccess()` — we
   call `GoogleSignin.signOut()` from inside `useAuthStore.signOut()` so a
   subsequent Google tap re-prompts the account picker. Apple has no
   equivalent revoke call needed for re-login.
6. **No new state library, no new auth provider library beyond the two
   above, no email-confirmation work, no password-reset flow, no account
   deletion UI.** This spec is OAuth login + signup only.

## Prerequisite — re-enable the EAS dev client

The repo currently ships in **Expo Go** (commit `6931e87` reverted the dev
client). Both `@react-native-google-signin/google-signin` and
`expo-apple-authentication` ship native modules and **will not run in Expo
Go** — they require a custom dev client.

Owner-decided 2026-05-31 to re-enable the EAS dev client as part of this
spec's implementation. Concretely, the implementing PR (or a small
predecessor PR) must:
- Revert `6931e87` or land an equivalent change re-adding the dev-client
  build config.
- Run `npx expo prebuild` to regenerate `ios/` and `android/` against the
  new plugin list (Google Sign-In + Apple Authentication both need this).
- Document the new local-dev workflow in the README — contributors install
  the `eas build --profile development` build instead of scanning a QR
  with Expo Go.

No Expo Go fallback is provided; the OAuth screens simply do not work in
Expo Go and won't be rendered there.

## Supabase dashboard setup (one-time, must precede app code)

Run by the project owner against project `fhhzrzmmulqgmfwmeodq`. None of this
is automatable from the app; document the steps in the spec PR description so
they're reproducible.

### Google
- Google Cloud Console → create an OAuth 2.0 Client ID for **iOS**
  (bundle `com.samsud01.kannadabaa`), one for **Android** (package
  `com.samsud01.kannadabaa` + SHA-1 fingerprint of the EAS keystore), and
  one for **Web** (used by Supabase as the audience).
- Supabase Auth → Providers → Google → enable, paste the **Web client ID**
  and **Web client secret**. The iOS/Android client IDs are passed at
  runtime to `GoogleSignin.configure({ webClientId, iosClientId })` — they
  do **not** go in the Supabase dashboard.

### Apple
- Apple Developer → Identifiers → enable **Sign in with Apple** capability
  on the existing App ID `com.samsud01.kannadabaa`.
- Create a **Services ID** (e.g. `com.samsud01.kannadabaa.web`) for the
  Android web-flow callback.
- Generate a **Key** with Sign in with Apple capability → download the
  `.p8`. Note the Key ID and Team ID.
- Supabase Auth → Providers → Apple → enable, paste the Services ID, Team
  ID, Key ID, and Private Key (`.p8` contents).
- Add the callback URL Supabase shows in its dashboard
  (`https://fhhzrzmmulqgmfwmeodq.supabase.co/auth/v1/callback`) to the
  Services ID's "Return URLs" in Apple Developer.

### Identity linking
- Supabase Auth → Settings → **Allow Manual Linking** → **OFF** (default).
  Per Rule 1, we explicitly do **not** want OAuth to auto-link onto an
  existing email/password account. When a user attempts OAuth with an
  email that already belongs to another `auth.users` row, Supabase
  returns an error; the client catches it and shows the
  "use your original method" toast (see `login.tsx` changes below).

## DB migrations

No new schema. `auth.users` already supports multiple identities per user;
the `handle_new_user` trigger from
[spec_auth_onboarding.md](spec_auth_onboarding.md) Migration 2 already
handles the OAuth-created row.

`public.users.name` and `public.users.avatar_url` were already nullable and
client-writable. If an OAuth provider returns a `name` or `avatar_url`,
they're written by the **trigger** (extend `handle_new_user` to populate
them from `new.raw_user_meta_data` when present). The client never writes
these fields.

### Migration 1 — extend `handle_new_user` to read provider metadata

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  provider_name text := meta ->> 'full_name';
  provider_avatar text := meta ->> 'avatar_url';
begin
  insert into public.users (id, email, name, avatar_url, current_streak)
  values (
    new.id,
    new.email,
    nullif(provider_name, ''),
    nullif(provider_avatar, ''),
    0
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
```

Notes:
- `on conflict do nothing` preserves the existing idempotency contract.
- `raw_user_meta_data` is empty for email/password signups, so existing
  email behavior is unchanged (`name` / `avatar_url` stay null).
- Google passes `full_name`, `avatar_url`. Apple passes `full_name` on the
  **first** sign-in only (Apple's documented one-shot quirk). For Apple
  re-signins, `meta` will be empty; the trigger has already populated
  fields on the first run.

## App changes

### Dependencies

Add to [package.json](../../package.json):
- `@react-native-google-signin/google-signin` (latest 13.x — supports new arch
  and Expo SDK 51+; verify against project's Expo SDK at implementation time).
- `expo-apple-authentication`.
- `expo-web-browser` (already a transitive dependency, but pin explicitly
  for the Android Apple flow).

Add to [app.json](../../app.json) `plugins`:
- `"@react-native-google-signin/google-signin"`
- `"expo-apple-authentication"`

Add to [app.json](../../app.json) `ios.usesAppleSignIn: true`.

Add to [app.json](../../app.json) `ios.infoPlist.CFBundleURLTypes` the
Google iOS reversed-client-ID URL scheme (Google Cloud Console gives this
verbatim when you generate the iOS client ID).

### `.env.example` additions

```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
```

(No Android client ID at runtime — the SDK uses the Web client ID for
Android, matched against the package + SHA fingerprint server-side. No
Apple secrets in the app — Apple is fully handled by Supabase.)

### `services/auth/google.ts` (new file)

Encapsulates the Google native flow. Single function returns the Supabase
session or throws.

```ts
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from '../api/supabase';

let configured = false;

function configureOnce() {
  if (configured) return;
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID!,
  });
  configured = true;
}

export async function signInWithGoogle() {
  configureOnce();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const { idToken } = await GoogleSignin.signIn();
  if (!idToken) throw new Error('Google did not return an ID token');
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });
  if (error) throw error;
  return data;
}

export async function signOutGoogle() {
  configureOnce();
  try {
    await GoogleSignin.signOut();
  } catch {
    // benign if the user wasn't currently signed in with Google
  }
}
```

Notes:
- Caller catches `statusCodes.SIGN_IN_CANCELLED` and shows no toast (user
  intentionally backed out).
- All other errors → generic "Couldn't sign in with Google" toast. Do not
  surface the underlying Google error string.

### `services/auth/apple.ts` (new file)

Two functions: native (iOS) and web (Android). Caller picks by `Platform.OS`.

```ts
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { supabase } from '../api/supabase';

export async function isAppleSupported(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  return AppleAuthentication.isAvailableAsync();
}

export async function signInWithAppleNative() {
  // Apple requires the nonce to be hashed; we send the raw nonce to Supabase
  // and the hashed nonce to Apple, then Supabase verifies the hash matches.
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce,
  );
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });
  if (!credential.identityToken) {
    throw new Error('Apple did not return an identity token');
  }
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
    nonce: rawNonce,
  });
  if (error) throw error;
  return data;
}

export async function signInWithAppleWeb() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: 'kannada-baa://auth/callback',
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;
  if (!data.url) throw new Error('Supabase did not return an Apple OAuth URL');
  const result = await WebBrowser.openAuthSessionAsync(
    data.url,
    'kannada-baa://auth/callback',
  );
  if (result.type !== 'success' || !result.url) {
    throw new Error('Apple sign-in cancelled');
  }
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    result.url,
  );
  if (exchangeError) throw exchangeError;
}
```

Notes:
- Apple's `FULL_NAME` is delivered only on the **first** sign-in. The
  Migration 1 trigger picks it up from `raw_user_meta_data` at that point
  and persists to `public.users.name`. Subsequent sign-ins will be missing
  the name; the trigger's `on conflict do nothing` preserves what was
  written.
- The Android web flow returns to the app via the `kannada-baa://` scheme.
  `supabase.auth.detectSessionInUrl` is currently OFF in
  [supabase.ts](../../services/api/supabase.ts); we need to either flip it
  ON or manually parse `Linking.getInitialURL()` and call
  `supabase.auth.exchangeCodeForSession()`. **Implementation decision
  required — see `[OPEN] Q2`.**

### `stores/useAuthStore.ts`

Extend `signOut()` to also call `signOutGoogle()`:

```ts
signOut: async () => {
  await supabase.auth.signOut();
  await signOutGoogle().catch(() => undefined);
  resetLessonsCache();
  set({ session: null, user: null });
},
```

No other changes. No fields added. Apple has no client-side signOut needed.

### `app/(auth)/login.tsx`

Add OAuth buttons below the existing email/password form. Layout:

```
[ email input ]
[ password input ]
[ LOG IN / SIGN UP cta ]

———————— or ————————

[ Continue with Google ]
[ Continue with Apple ]   ← iOS only
```

- Divider: thin `Colors.outlineVariant` rule + centered "or" label, padding
  `Spacing.xl` top/bottom.
- Buttons: `Pressable`, 44pt min height, full width, `Radius.md`,
  `Spacing.md` between them. Background `Colors.surfaceContainerHigh`,
  border `Colors.outlineVariant`, text/icon `Colors.onSurface`. Per
  [DESIGN.md](../../docs/foundation/DESIGN.md) — all values from token
  files, no hex literals, all sizing through `moderateScale` /
  `Spacing` / `Radius` / `Fonts`.
- Brand glyphs: use the official Google "G" SVG and Apple logomark SVG.
  Add them under [components/auth/](../../components/auth/) as
  `GoogleGlyph.tsx` and `AppleGlyph.tsx` (small components, 18×18 inside
  a 20×20 box). Do not inline SVG markup in the screen.
- Apple button: only rendered when `await isAppleSupported()` resolves
  `true`. Use a small `useEffect` to set local state — do not render and
  then hide (avoids layout flash). On Android, the button does not exist
  in the tree.
- Loading: while either OAuth call is in flight, disable all three CTAs
  (email submit, Google, Apple). Show a centered spinner inside the
  pressed button.
- Order: Google **above** Apple. (Owner-decided 2026-05-31. Re-evaluate
  before public launch — Apple HIG prefers Apple first.)
- Errors:
  - User cancellation (Google `SIGN_IN_CANCELLED`, Apple
    `ERR_REQUEST_CANCELED`) → silent.
  - **Email already belongs to a different sign-up method** (per Rule 1).
    Supabase returns a recognisable error here; catch it specifically.
    Show a new toast `Toasts.emailUsesDifferentMethod()` with copy along
    the lines of: "This email is already registered. Sign in with the
    method you originally used." Add the toast to
    [components/modals/instances/toastCatalog.ts](../../components/modals/instances/toastCatalog.ts).
    The exact Supabase error code/message to match on must be confirmed
    at implementation time against a manual test — see Manual test plan
    step 7. Most likely candidates are status `422` with
    `error_code = 'email_exists'` or message containing
    `"User already registered"` / `"identity_already_exists"`. Implementer
    matches on whichever fires; do not branch on substring of an opaque
    "unknown error" string.
  - All other errors → `Toasts.signInFailed()` (existing toast).

Existing email/password code is untouched.

### `app/_layout.tsx` (`AppGate`)

**No change.** The Android Apple deep-link callback is handled entirely
inside [services/auth/apple.ts](../../services/auth/apple.ts)
`signInWithAppleWeb`: `WebBrowser.openAuthSessionAsync(authUrl, returnUrl)`
blocks until the OS routes the `kannada-baa://auth/callback?code=…` URL
back to the app, then we synchronously call
`supabase.auth.exchangeCodeForSession(result.url)`. The resulting session
fires `onAuthStateChange`, which `AppGate` is already subscribed to.
`detectSessionInUrl` stays `false` in
[services/api/supabase.ts](../../services/api/supabase.ts) — no behaviour
change at the client config layer.

### `stores/useUserStore.ts`

No change. `hydrateFromUserRow` already mirrors `name` / `avatar_url` from
`public.users` (or will after `displayName` is also kept in sync — see
[spec_onboarding_tweaks.md](spec_onboarding_tweaks.md) §displayName).

### Other files

- [services/api/supabase.ts](../../services/api/supabase.ts) — possibly
  `detectSessionInUrl: true` (`[OPEN] Q2`).
- [app.json](../../app.json) — add plugins, `usesAppleSignIn`, Google
  iOS URL scheme as listed above.
- [package.json](../../package.json) — three new deps.
- [.env.example](../../.env.example) — two new vars.

No changes to: any `app/onboarding/*` file, `app/(tabs)/profile.tsx`,
`progressStore`, lesson/game runners, or any DB table other than the
trigger function in Migration 1.

## Out of scope (explicitly do not add)

- Password reset, email confirmation, magic-link sign-in.
- Account deletion (delete-my-data flow).
- Re-running onboarding from settings for OAuth users — onboarding fires
  once per `auth.users` insert and never again, identical to email signup.
- Provider-specific UX on the profile screen ("Connected to Google"
  badge, etc.). All `public.users` reads are provider-agnostic.
- Multiple identities per user beyond what Supabase manual linking handles
  automatically. We do not surface "Link Apple to your Google account"
  buttons.
- OAuth on web. The app does not ship a web build today; Supabase's
  `signInWithOAuth` is wired only for the Android Apple case.
- Analytics on provider selection.
- Reduced-scope Apple sign-in (private email relay handling beyond what
  Supabase records). Whatever email Supabase receives is what
  `public.users.email` stores.

## Acceptance criteria

- [ ] **Fresh install, sign up with Google, never-used email** → Google
      account picker opens → on selection, app lands on
      `/onboarding/welcome`. Completing onboarding writes to `public.users`
      and routes to `/(tabs)`. `auth.users` row has one identity
      (`google`); `public.users.name` and `avatar_url` are populated by
      the trigger.
- [ ] **Same, with Apple on iOS** → Apple sheet appears → on success,
      `/onboarding/welcome`. `public.users.name` populated on the first
      sign-in only (Apple quirk); subsequent sign-ins do not overwrite.
- [ ] **Apple on Android** → in-app browser opens Apple's web sign-in →
      on success, app returns to `/onboarding/welcome`.
- [ ] **Existing email-password user taps "Continue with Google" using
      the same email** → OAuth call fails at the Supabase layer, login
      screen stays open, `Toasts.emailUsesDifferentMethod()` fires. No
      new row in `auth.users` or `public.users`. Same behaviour for an
      Apple attempt against an existing email-password email, and for the
      reverse case (existing Google user, tries email/password signup with
      the same email — Supabase already rejects this today; verify the
      toast copy is still appropriate).
- [ ] **Returning Google user, signed out** → tapping "Continue with
      Google" again routes directly to `/(tabs)` (onboarding skipped
      because `onboarding_completed_at` is set). No flicker through
      `/onboarding/welcome`.
- [ ] **Sign out (any provider) and sign in as a different OAuth account
      on the same device** → user-switch detected by `AppGate`,
      `resetForUser` fires, fresh user lands in onboarding.
- [ ] **Google account picker re-prompts after sign-out** (verifies
      `signOutGoogle` is wired). Apple has no equivalent; the OS sheet
      will skip the picker if the user has signed in before, which is
      acceptable.
- [ ] **Cancelling the Google or Apple sheet** → no toast, login screen
      stays as-is, no error logged at warning level (info level only).
- [ ] **Network failure mid-OAuth** → toast "Couldn't sign in",
      buttons re-enable. No partial session in storage.
- [ ] **Both Google and Apple buttons are 44×44pt minimum**, hit-tested
      on iPhone SE per [CLAUDE.md](../../.claude/CLAUDE.md) "Touch and
      accessibility".
- [ ] **`useAuthStore` has no new fields** (verified by diff). The
      provider used is not persisted client-side; it lives in
      `auth.users.identities` only.
- [ ] **No code path imports `@react-native-google-signin/google-signin`
      or `expo-apple-authentication` outside `services/auth/`.**
- [ ] **Apple Sign-In button is hidden on Android and on iOS devices
      where `AppleAuthentication.isAvailableAsync()` returns false** (very
      old iOS).
- [ ] Spec `spec_auth_onboarding.md` line 268 is updated in this PR's
      same commit to remove the OAuth-out-of-scope bullet and reference
      this spec instead.

## Manual test plan

1. **Dev client built.** Confirm `eas build --profile development` produces
   an installable build with the Google and Apple native modules linked.
   (Cannot use Expo Go — see the Hard Blocker section.)
2. **Supabase dashboard.** Confirm Google + Apple providers show "Enabled"
   in Supabase. Confirm "Allow Manual Linking" is ON.
3. **Google iOS.** Wipe install. Tap "Continue with Google" → pick a fresh
   Google account → land on `/onboarding/welcome`. Complete onboarding →
   `/(tabs)`. Check Supabase `auth.users` → 1 row with `google` identity;
   `public.users` row populated with name + avatar.
4. **Google Android.** Same as above on Android dev client.
5. **Apple iOS.** Tap "Continue with Apple" → complete native sheet →
   `/onboarding/welcome`. Sign out, sign back in with Apple → land on
   `/(tabs)` directly (no second onboarding). `public.users.name` from
   the first sign-in is still there.
6. **Apple Android.** Tap "Continue with Apple" → in-app browser opens →
   complete sign-in → app returns and routes correctly.
7. **No identity linking (collision toast).** Email-sign-up
   `test+a@yourdomain.com` and complete onboarding. Sign out. Tap
   "Continue with Google" with a Google account whose primary email is
   `test+a@yourdomain.com`. Expect: stays on login screen, toast
   "This email is already registered. Sign in with the method you
   originally used." Capture the Supabase error code/message during this
   test — the toast wiring above only fires for the matched error. Repeat
   with Apple. Then repeat the reverse: Google-sign-up first, sign out,
   try email/password signup with the same email — verify Supabase
   already rejects this and a sensible toast appears (existing
   `Toasts.signInFailed()` is acceptable if no provider-aware toast is
   wired for that direction).
8. **Cancellation.** Tap "Continue with Google" → cancel the sheet → no
   toast, login screen stays. Same for Apple.
9. **Network failure.** Airplane mode on, tap "Continue with Google" →
   toast appears, buttons re-enable, no partial session.
10. **iPhone SE layout.** All three CTAs visible above the keyboard with
    no clipping.
11. **User switch.** Sign in with Google account A → complete onboarding
    → sign out → sign in with Google account B → land on
    `/onboarding/welcome` (bind effect's `resetForUser` fires).

## Where to wire it

- DB: run Migration 1 in Supabase SQL editor before merging app code.
- Supabase dashboard: complete all provider setup steps above first.
- Native: `services/auth/google.ts` and `services/auth/apple.ts` are the
  only files that import the provider SDKs.
- UI: [app/(auth)/login.tsx](../../app/(auth)/login.tsx) is the sole caller
  of `signInWithGoogle` / `signInWithAppleNative` / `signInWithAppleWeb`.
- Sign-out: [stores/useAuthStore.ts](../../stores/useAuthStore.ts)
  `signOut()` is the only exit point; all sign-out UI dispatches through
  it (unchanged from spec_auth_onboarding).
- Routing: no change to [app/_layout.tsx](../../app/_layout.tsx) beyond
  the Android deep-link path (see `[OPEN] Q2`).

## Resolved decisions

Closed during spec drafting 2026-05-31:

- **Q1 (identity linking) — RESOLVED: no auto-link.** When OAuth and
  email/password share an email, Supabase blocks the OAuth attempt; the
  client shows the
  `Toasts.emailUsesDifferentMethod()` toast asking the user to sign in
  with their original method. "Allow Manual Linking" stays OFF in the
  Supabase dashboard. A future identity-linking spec can revisit if
  needed; this one keeps the model strict. Captured in Rule 1.
- **Q2 (Android Apple deep-link) — RESOLVED: handle inside
  `signInWithAppleWeb`.** `WebBrowser.openAuthSessionAsync` blocks until
  the OS routes the callback URL back, and we call
  `exchangeCodeForSession(result.url)` inline. `AppGate` and
  `detectSessionInUrl` are untouched.
- **Q3 (Expo Go) — RESOLVED: re-enable EAS dev client.** Captured in
  the Prerequisite section above. The implementing PR includes the
  dev-client revert + a README update.
- **Q4 (button order) — RESOLVED: Google above Apple** for now;
  re-evaluate before public launch.

## Risks / open questions

### `[OPEN] Q5` — Apple email relay

Apple offers "Hide My Email" → Supabase receives a
`@privaterelay.appleid.com` address. We accept and store it as-is. This
may break future email-based notification flows (e.g.
[spec_profile_settings_wiring.md](spec_profile_settings_wiring.md)
reminders are local-only, so no immediate issue). No action required in
this spec; flagging so future email-out work doesn't assume the address
is real.

## Reference

- [spec_auth_onboarding.md](spec_auth_onboarding.md) — predecessor; this
  spec supersedes its "OAuth out of scope" line.
- [docs/foundation/NAVIGATION.md](../../docs/foundation/NAVIGATION.md)
  §Auth + onboarding gating — `AppGate`'s `[LOCKED]` decision matrix
  remains the contract this spec must satisfy.
- [docs/foundation/STATE.md](../../docs/foundation/STATE.md) §useAuthStore
  — `[LOCKED]` shape; this spec adds no fields.
- Supabase Auth docs:
  - Google native sign-in:
    https://supabase.com/docs/guides/auth/social-login/auth-google#native-sign-in
  - Apple native sign-in:
    https://supabase.com/docs/guides/auth/social-login/auth-apple#native-sign-in
  - Identity linking:
    https://supabase.com/docs/guides/auth/auth-identity-linking
