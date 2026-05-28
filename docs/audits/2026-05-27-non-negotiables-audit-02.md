---
doc: AUDIT
audit: app-non-negotiables
status: report
owner: samee
date: 2026-05-27
session: 02
related:
  - docs/foundation/README.md
  - docs/foundation/CONTRADICTIONS.md
---

# Kannada Baa — Non-Negotiables Audit (Session 02)

**Scope:** Expo / React Native app with Supabase backend, run on `main` at HEAD `58e9e29`.
**Method:** Static read-only inspection — no code modified.
**Audit spec:** "App Non-Negotiables — Audit Spec For Claude Code" (single-pass report, no auto-fix).

> A prior audit at [2026-05-27-non-negotiables-audit.md](2026-05-27-non-negotiables-audit.md) exists from earlier today. This is an independent re-run.

---

## 1. Structure

### 1.1 Separation of concerns

**[PASS]** No direct `fetch` / `axios` calls in UI
- `Evidence:` `grep -rn "fetch(" --include="*.tsx" app/ components/ src/` returns only React Query `() => refetch()` calls in [app/emergency.tsx:107](../../app/emergency.tsx), [src/games/imagematch/ImageMatchGame.tsx:65](../../src/games/imagematch/ImageMatchGame.tsx), [src/games/opposites/OppositeGame.tsx:45](../../src/games/opposites/OppositeGame.tsx), [src/games/dictation/DictationGame.tsx:37](../../src/games/dictation/DictationGame.tsx). No `axios` in [package.json](../../package.json).
- `Notes:` Clean layering — components → hooks (`hooks/useLessons.ts`, `hooks/games/*`) → services (`services/api/*`) → Supabase.

**[PASS]** Business logic out of JSX
- `Evidence:` [app/lesson/[id].tsx](../../app/lesson/[id].tsx) routes phases via `useLessonRunner`; [components/lesson/DoneCard.tsx](../../components/lesson/DoneCard.tsx) and tab screens read computed values from hooks. No deep inline conditionals or side-effects in render.

**[PASS]** No DB/ORM imports in UI
- `Evidence:` `grep -rn "from '@supabase" --include="*.tsx" app/ components/ src/` → zero hits. All `supabase.from(...)` is in `services/api/*`.

### 1.2 Single source of truth for state

**[PASS]** One primary state library
- `Evidence:` Zustand only (no Redux/Jotai/MobX in [package.json](../../package.json)). Three stores: [stores/useAuthStore.ts](../../stores/useAuthStore.ts), [stores/useUserStore.ts](../../stores/useUserStore.ts), [stores/progressStore.ts](../../stores/progressStore.ts).

**[PASS]** Server vs client state cleanly split
- `Evidence:` React Query for server state (lessons, fun facts, emergency phrases, game vocab, overall progress); Zustand for client/local state.

**[NEEDS REVIEW]** `completedLessons` exists both locally and server-side
- `Evidence:` [stores/progressStore.ts](../../stores/progressStore.ts) persists `completedLessons` in AsyncStorage; server also tracks them via `recordLessonCompletion`. [app/_layout.tsx:43-68](../../app/_layout.tsx) `hydrateCompletions()` does a union merge.
- `Notes:` Deliberate offline-first design per `spec_progress_persistence.md`. Worth confirming `xp` / `streak` / `totalPhrasesLearned` (currently local-only) don't drift if any future feature stores them server-side.

### 1.3 Folder organization

**[NEEDS REVIEW]** Type-based folder layout at 23 screens
- `Evidence:` Top-level is type-based (`app/`, `components/`, `hooks/`, `services/`, `stores/`); only games use feature folders ([src/games/imagematch/](../../src/games/imagematch/), `opposites/`, `dictation/`). 23 `.tsx` files under `app/`, 10 files in `components/lesson/`, 10 hooks.
- `Notes:` Spec rule is "feature-based above ~10 screens or 3+ features." Currently tractable but on the bubble — revisit if `components/lesson/` or `hooks/` keeps growing.

**[PASS]** Shared UI primitives clearly located
- `Evidence:` [components/ui/](../../components/ui/) (`Button`, `ExitBackButton`, `RoundIconButton`, `TabBar`).

**[PASS]** No circular imports
- `Evidence:` `npx madge --circular --extensions ts,tsx app components src services stores hooks lib utils` → "✔ No circular dependency found!" across 139 files.

### 1.4 Typed contracts at boundaries

**[PASS]** TypeScript strict mode on
- `Evidence:` [tsconfig.json:4](../../tsconfig.json) `"strict": true`.

**[PASS]** No `any` returned from data fetchers
- `Evidence:` `grep -rn ": any\|as any"` in `app/ components/ src/ services/ stores/ hooks/ lib/ utils/ constants/` → zero hits. Three `@ts-expect-error` in [components/modals/ModalHost.tsx](../../components/modals/ModalHost.tsx) with explicit justification ("props are validated at the show() call site").

**[FAIL]** Navigation routes not type-checked
- `Evidence:` Expo Router typed-routes not enabled — no `experiments.typedRoutes` in [app.json](../../app.json). Per-screen `useLocalSearchParams<{ id: string }>()` types the params shape but `router.push('/lesson/...')` is an unchecked string template.
- `Notes:` Low blast radius at 23 screens, but a typo in a route string would fail silently at runtime. Enabling typed-routes is essentially free.

**[PASS]** Store shapes typed
- `Evidence:` `interface UserState` in [stores/useUserStore.ts:12-44](../../stores/useUserStore.ts), `interface ProgressState` in [stores/progressStore.ts:5-45](../../stores/progressStore.ts).

---

## 2. Stack

### 2.1 Dependency health

**[FAIL]** Expo SDK is 2 majors behind
- `Evidence:` `expo` at `54.0.34`, latest is `56.0.5` (`npm outdated`). `react-native` 0.81.5 vs latest 0.85.3.
- `Notes:` Audit rule allows current or one major behind. This is the most material stack finding.

**[FAIL]** 21 npm audit vulnerabilities (1 high, 20 moderate)
- `Evidence:` `npm audit` flags:
  - **High:** `@xmldom/xmldom` (DoS + multiple XML injection CVEs) via `@expo/cli` / `@expo/metro-config` chain.
  - **Moderate:** `postcss`, `brace-expansion`, `ws`, `@expo/config`, others.
- `Notes:` `npm audit fix --force` resolves most of these by upgrading to Expo 56 — i.e. the SDK upgrade above is the same fix. The `@xmldom/xmldom` chain is build-time only, but high severity still warrants action.

**[PASS]** No deps with >12-month-old last commit
- `Evidence:` Sampled top-level deps — all actively maintained.

### 2.2 Escape hatches

**[PASS]** Supabase has documented export path
- `Evidence:` Postgres + PostgREST; migrations versioned in [services/api/migrations/](../../services/api/migrations/) (11 .sql files).

**[PASS]** Auth wrapped in a single service
- `Evidence:` Sole `createClient` call in [services/api/supabase.ts](../../services/api/supabase.ts). Direct `supabase.auth.*` usage confined to [app/_layout.tsx](../../app/_layout.tsx) (auth listener) and [app/(auth)/login.tsx](../../app/(auth)/login.tsx) (signIn/signUp). Provider swap = rewrite two screens + the adapter.

### 2.3 Expo-specific

**[RESOLVED]** Expo Go vs Dev Client not explicitly documented
- `Evidence:` `expo-dev-client` is installed ([package.json:31](../../package.json)), and `eas.json:development.developmentClient = true`. With `expo-notifications`, `expo-secure-store`, and a custom `bundleIdentifier`, Expo Go will not work.
- `Notes:` README does not call this out. One sentence in README would unblock new contributors.
- `Update (2026-05-28):` Reverted the dev-client change — `expo-dev-client` removed and the `ios`/`android` scripts restored to `expo start`. The app now runs in **Expo Go**: only local notifications are used ([lib/reminders.ts](../../lib/reminders.ts), no push tokens), and no native module outside the Expo Go SDK is required. README and ONBOARDING.md now document the Expo Go workflow. `expo-secure-store` / `bundleIdentifier` do not block Expo Go.

**[PASS]** EAS Build configured
- `Evidence:` [eas.json](../../eas.json) has dev/preview/production profiles. [app.json:50](../../app.json) sets `eas.projectId = adccfc42-...`.
- `Notes:` `production` profile is `{}` — relies on defaults. Adequate for now; consider explicit `channel` / `distribution` when prepping store releases.

**[FAIL]** `expo-updates` not configured
- `Evidence:` `expo-updates` not in [package.json](../../package.json). No `updates` block in [app.json](../../app.json).
- `Notes:` Only a fail if OTA updates are intended. If shipping store-only updates, mark N/A. Recommend deciding explicitly.

---

## 3. Scalability

### 3.1 Lists and pagination

**[PASS — with caveat]** No `FlatList` / `FlashList`, but every list is bounded and small today
- `Evidence:` `grep -rn "FlatList\|FlashList" --include="*.tsx"` → zero hits. Mapped lists I sampled:
  - [app/(tabs)/learn.tsx:197](../../app/(tabs)/learn.tsx) — 8 planned lesson rows
  - [app/(tabs)/practice.tsx:179](../../app/(tabs)/practice.tsx) — 5 games
  - [app/(tabs)/profile.tsx:478](../../app/(tabs)/profile.tsx) — fixed settings items
  - [app/emergency.tsx:200](../../app/emergency.tsx) — 9 phrases in 3 groups
  - [components/lesson/TeachPhrasesPhase.tsx:103](../../components/lesson/TeachPhrasesPhase.tsx) — chips for one phrase
- `Notes:` Today: every list is < 20 items, so PASS. Watch item: game vocab banks (`useImageMatchItems`, `useDictationItems`, `useOppositesItems`) pull from DB; if any starts returning > 50 rows and gets `.map()`-ed in the game UI, this flips to FAIL.

**[PASS]** Stable `keyExtractor` / `key=`
- `Evidence:` Lists key on `slug` / `item.id` / composite strings. No `key={index}` on dynamic lists in the screens sampled.

### 3.2 Backend

**[N/A]** Stateless app servers — backend is Supabase (managed Postgres + PostgREST).

**[NEEDS REVIEW]** DB indexes on filter/sort columns
- `Evidence:` Did not inspect every migration. Hot-path filters: `slug`, `user_id`, `lesson_no`.
- `Notes:` Cannot verify from client repo alone — open the [services/api/migrations/](../../services/api/migrations/) `.sql` files and confirm `CREATE INDEX` on `lessons.slug`, `user_lesson_completions.user_id`, etc. Likely fine (`slug` is typically UNIQUE → indexed) but worth a one-off check.

**[NEEDS REVIEW]** N+1 patterns
- `Evidence:` [app/_layout.tsx:52-63](../../app/_layout.tsx) `hydrateCompletions()` loops over `localOnly` slugs and calls `fetchLessonIdBySlug` + `recordLessonCompletion` per slug. For the typical user the loop is 0–8 items (lesson count), so practically a non-issue.
- `Notes:` Bounded by lesson count, not user-driven growth — leave as-is unless lesson count balloons.

### 3.3 Caching

**[PASS]** Explicit per-query cache policy
- `Evidence:` Every `useQuery` sets `staleTime` matched to data velocity:
  - 24h: emergency phrases, Karnataka fun facts
  - 60min: game vocab banks (imageMatch, dictation, opposites)
  - 5min: lessons
  - 60s: overall progress

### 3.4 Observability

**[FAIL]** No crash reporter wired up
- `Evidence:` `grep -rn "Sentry\|Crashlytics"` in app code → zero hits. Not in [package.json](../../package.json).
- `Notes:` `console.warn` is used for non-fatal paths but nothing surfaces crashes. For a pre-launch app this is acceptable; before any store release, wire one up (Sentry is the lowest-friction Expo fit).

**[FAIL]** No analytics
- `Evidence:` No Mixpanel / Amplitude / Segment / PostHog in deps.
- `Notes:` Only a fail if product decisions depend on usage data. Worth a deliberate yes/no.

**[N/A]** Server log structure — no custom server.

---

## 4. Usability

### 4.1 Async states

**[NEEDS REVIEW]** Loading / empty / error coverage uneven across fetching screens
- `Evidence (sampled):`
  - [app/emergency.tsx](../../app/emergency.tsx) — full loading + error + retry ✓
  - [app/lesson/[id].tsx:28](../../app/lesson/[id].tsx) — `LessonLoading` + `LessonNotFound` ✓
  - [src/games/*Game.tsx](../../src/games/) — `ErrorState onRetry` + retry ✓
  - [app/(tabs)/profile.tsx:247](../../app/(tabs)/profile.tsx) — shows "—" while overall progress loads, no explicit error UI
  - [app/(tabs)/index.tsx](../../app/(tabs)/index.tsx) — fun-facts query has `console.warn` only on error; UI falls back silently to bundled JSON ✓ (acceptable — bundled fallback IS the error state)
  - [app/(tabs)/learn.tsx](../../app/(tabs)/learn.tsx) — uses `lessonsQuery.data ?? []` with no loading or error UI
- `Notes:` `learn.tsx` and `profile.tsx` are the gaps. `learn.tsx` renders 8 planned slots even when the DB lessons query is pending or failed, masking the error.

**[PASS]** No blank-white loading screens
- `Evidence:` Splash kept up until fonts load ([app/_layout.tsx:217-221](../../app/_layout.tsx)); per-screen loading uses styled placeholders.

**[NEEDS REVIEW]** Error states with actionable next step
- `Evidence:` `emergency.tsx`, game screens, and lesson-not-found all have retry/back actions. `learn.tsx` and `profile.tsx` (above) silently swallow query errors.

### 4.2 Touch targets

**[PASS]** Primary `Button` honors 44pt minimum
- `Evidence:` [components/ui/Button.tsx:74](../../components/ui/Button.tsx) `minHeight: moderateScale(44)`.

**[NEEDS REVIEW]** No project-wide minimum on `Pressable`
- `Evidence:` 238 `Pressable` instances across the codebase; only [components/ui/Button.tsx](../../components/ui/Button.tsx) enforces `minHeight: 44`. Profile settings items use `minHeight: moderateScale(56)` ✓. Other icon-only `Pressable`s (e.g. `ExitBackButton`, `RoundIconButton`) need spot-checking for 44pt compliance.

### 4.3 Offline behavior

**[FAIL]** No NetInfo / explicit offline handling
- `Evidence:` `grep -rn "NetInfo"` → zero hits.
- `Notes:` Each fetching screen surfaces errors locally (which covers most offline cases). But there is no global "you're offline" banner, no offline-aware cache invalidation, no documented offline support story. For a learning app where the user may be on patchy network, this is worth a decision: either document "online required" explicitly or wire NetInfo + retry-on-reconnect.

### 4.4 Accessibility

**[PASS]** Labels widespread
- `Evidence:` `grep -rn "accessibilityLabel\|accessibilityRole" --include="*.tsx" app/ components/ src/` → 160 hits. Sampled icon buttons in profile/practice/emergency all have labels.

**[NEEDS REVIEW]** Text contrast
- `Evidence:` Color tokens in [constants/colors.ts](../../constants/colors.ts) were not contrast-checked in this audit. Spot eye-check looks fine (green primary on cream surface) but not measured.

**[NEEDS REVIEW]** Dynamic-type safety
- `Evidence:` Many text nodes set `maxFontSizeMultiplier` (1.2–1.4 typical) — good — but coverage is not universal. Worth a sweep on dense screens (`profile.tsx`, `learn.tsx`, lesson phase UIs) to confirm no hardcoded height clips scaled text.

### 4.5 Primary action clarity

**[NEEDS REVIEW]** Judgment call — visual review required
- `Evidence:` Tab screens (`index.tsx`, `learn.tsx`, `practice.tsx`) each appear to have a clear primary CTA in code, but per spec this needs a rendered-screen review against [DESIGN.md](../foundation/DESIGN.md). Not assessable from static reading alone.

---

## 5. Security & Cross-cutting

### 5.1 Secrets

**[PASS]** No hardcoded secrets in source
- `Evidence:` `grep -rEn "sk_[a-zA-Z0-9]|AKIA[0-9A-Z]{16}|-----BEGIN"` outside `node_modules` → zero. [scripts/security-scan.sh](../../scripts/security-scan.sh) runs an expanded pattern list as `npm run security-scan`.

**[PASS]** `.env` gitignored
- `Evidence:` [.gitignore:34-35](../../.gitignore) — `.env`, `.env*.local`. `.env.example` committed; `.env` not tracked.

**[PASS]** Session tokens in SecureStore (not AsyncStorage)
- `Evidence:` [services/api/supabase.ts](../../services/api/supabase.ts) uses a chunked SecureStore adapter (handles the iOS Keychain 2KB-per-item limit). `grep -rn "AsyncStorage.setItem"` finds zero direct calls — only Zustand persist for non-sensitive data (`user_prefs`, `kannada-baa-progress`).
- `Notes:` The chunking adapter is non-trivial code; it's tested by the auth flow working in practice but does not have unit tests. Low risk — verified observationally.

### 5.2 Migrations

**[PASS]** DB migrations versioned in source
- `Evidence:` [services/api/migrations/](../../services/api/migrations/) holds 11 dated `.sql` files plus a seed `.csv`. Visible in git.

**[FAIL]** No client-side persisted-store versioning
- `Evidence:` Both Zustand `persist()` configs ([stores/useUserStore.ts:149-155](../../stores/useUserStore.ts), [stores/progressStore.ts:144-150](../../stores/progressStore.ts)) omit `version` and `migrate`. A future shape change to `UserState` or `ProgressState` will land on existing users with the old AsyncStorage blob and either crash or silently drop fields.
- `Notes:` Set `version: 1` now (free) so when the first migration is needed, the bump-to-`2` + `migrate` path exists.

### 5.3 CI / build hygiene

**[FAIL]** No CI workflows
- `Evidence:` No `.github/workflows/`, no `.gitlab-ci.yml`, no `circle.yml`. `package.json` defines a `pre-push` script (`typecheck + security-scan`) but nothing enforces it on PR or merge.
- `Notes:` `npm run test`, `npm run typecheck`, `npm run security-scan` all exist locally — wiring a minimal GitHub Actions workflow is a small change with high leverage.

### 5.4 Testing baseline

**[PASS]** Smoke tests on key game flows + progress store
- `Evidence:` 9 test files in [__tests__/](../../__tests__/) covering dictation, image-match, opposites game logic + [progressStore.test.ts](../../__tests__/stores/progressStore.test.ts) (idempotency contract).
- `Notes:` No auth flow tests, no lesson runner tests. Gap, but not a blocker.

**[PASS]** No `.skip` / `.only` in tests
- `Evidence:` `grep -rn "\.only\|\.skip\|xit\|xdescribe" __tests__/` → only one hit, and it's `skipWord()` (a legitimate game action), not a test directive.

---

## Cross-cutting findings from CONTRADICTIONS.md

These weren't part of the audit checklist but surfaced during foundation-doc review and are relevant to the report's "open questions" section:

- **C3** — Rowdy/classic voice system locked for removal but still wired end-to-end in code ([constants/copy.ts](../../constants/copy.ts), [hooks/useCopy.ts](../../hooks/useCopy.ts), [stores/useUserStore.ts](../../stores/useUserStore.ts)). Blocks future copy edits from being clean.
- **C7** — `fill_blank` drill type is a placeholder that renders "Not yet implemented — skipping." Lessons 2–8 must not depend on this drill type until it's built or removed from the type union.
- **C9** — Stale "NativeWind" references in [README.md](../../README.md) lines 3 and 153. Code is clean; doc is not.

These are tracked in [CONTRADICTIONS.md](../foundation/CONTRADICTIONS.md) and are not new — flagging for the same fix queue.

---

## 6. Summary

### Counts

| Section | PASS | FAIL | NEEDS REVIEW | N/A |
|---|---|---|---|---|
| 1. Structure | 9 | 1 | 2 | 0 |
| 2. Stack | 4 | 3 | 1 | 0 |
| 3. Scalability | 3 | 2 | 3 | 1 |
| 4. Usability | 2 | 1 | 5 | 0 |
| 5. Security & Cross-cutting | 5 | 2 | 0 | 0 |
| **Total** | **23** | **9** | **11** | **1** |

### Critical failures — fix before any public release

1. **`@xmldom/xmldom` high CVE chain + 20 moderate** (§2.1). Fix via Expo SDK 54 → 56 upgrade.
2. **No crash reporter** (§3.4). Sentry recommended for Expo.
3. **Zustand persist stores have no `version`** (§5.2). One-line preventive fix; expensive to recover from once users have stale blobs.
4. **No CI** (§5.3). Scripts exist (`typecheck`, `test`, `security-scan`) — just wire them.
5. **Loading/error coverage gap on `learn.tsx` and `profile.tsx`** (§4.1). User-visible regression risk every time the lessons table is unavailable.

### Recommended fixes — ranked by impact ÷ effort

1. **Set `version: 1` on both Zustand persisted stores.** (§5.2) — 2 lines, prevents future-you from a hard problem.
2. **Add minimal GitHub Actions workflow** running `npm test && npm run typecheck && npm run security-scan` on PRs. (§5.3) — ~30 lines of YAML.
3. **Add loading + error UI to `learn.tsx` and `profile.tsx`** matching the `emergency.tsx` pattern. (§4.1).
4. **Enable `experiments.typedRoutes: true`** in [app.json](../../app.json). (§1.4) — free typed-routes if `expo-router` 6 supports it on SDK 54.
5. ~~**Document Expo Dev Client requirement in README.**~~ (§2.3) — obsolete; dev client reverted on 2026-05-28, app runs in Expo Go (see §2.3 update).
6. **Upgrade Expo SDK 54 → 56.** (§2.1) — non-trivial, but resolves most npm-audit findings simultaneously.
7. **Decide on OTA strategy** (`expo-updates` yes/no) and document. (§2.3).
8. **Wire Sentry** before first store release. (§3.4).
9. **Decide on analytics** (yes/no, which tool) before product-decision conversations need data. (§3.4).
10. **Sweep `Pressable` instances for 44pt min size**, especially icon-only buttons. (§4.2).
11. **Contrast-check the design tokens** in [constants/colors.ts](../../constants/colors.ts) against WCAG AA. (§4.4).
12. **Resolve C3, C7, C9** from [CONTRADICTIONS.md](../foundation/CONTRADICTIONS.md) — pre-existing tracked work, not new findings.

### Open questions for the user

1. Is OTA via `expo-updates` intended? (Determines §2.3 fail vs N/A.)
2. Is analytics intentionally absent, or just deferred? (§3.4)
3. What's the offline support story — "online required" documented, or proper NetInfo + retry-on-reconnect? (§4.3)
4. Should this audit's recommendations be tracked as TODOs in `spec_docs/` or as GitHub issues?

---

**Audit complete. No code modified.** Awaiting direction on which items to address.
