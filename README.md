# Kannada Baa

A mobile app for learning Kannada — built with Expo (SDK 54), Expo Router, React Native 0.81, Zustand, TanStack Query, and Supabase. Styling is inline `style={{...}}` objects drawing from token files in `constants/`.

> **For Claude Code:** this README is the source of truth for local setup and project conventions. The repo's `.claude/CLAUDE.md` is gitignored and not shared — everything you need is here.

---

## Prerequisites

- **Node.js** 20.x or newer
- **npm** 10.x (the lockfile is npm — do not switch to yarn/pnpm)
- **Git**
- **Xcode** (latest) with an iOS simulator — for iOS dev
- **Android Studio** with an emulator (or a physical device + USB) — for Android dev
- **Expo CLI** is invoked via `npx`; no global install needed
- (Optional) **EAS CLI** if you're cutting builds: `npm i -g eas-cli`

You do **not** need to run `pod install` or touch `ios/`/`android/` — there are no native folders checked in. Expo prebuild handles natives when needed.

---

## First-time setup

```bash
# 1. Clone and enter the repo
git clone <repo-url> "Kannada Baa"
cd "Kannada Baa"

# 2. Install dependencies
npm install

# 3. Create your .env (see "Environment variables" below)
#    Ask Samee for the Supabase values — they're not in the repo.
touch .env

# 4. Verify the toolchain
npm run typecheck
```

If `typecheck` is clean, you're ready to run the app.

---

## Environment variables

Create a `.env` at the repo root with these keys (values come from Samee — Slack/DM him):

```bash
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

Notes:
- Both keys are read via `expo-constants` / `process.env` at build time. The `EXPO_PUBLIC_` prefix is required for them to be exposed to the client.
- `.env` is gitignored — never commit it.
- The anon key is safe to share within the team but should not be posted publicly.

---

## Running the app

```bash
npm start          # Expo dev server with QR code (Expo Go or dev client)
npm run ios        # boot iOS simulator and launch
npm run android    # boot Android emulator and launch
npm run web        # run in browser (limited — primary targets are iOS/Android)
```

Tips:
- Press `i` / `a` / `w` in the Metro terminal to launch iOS / Android / web after `npm start`.
- Press `r` to reload, `j` to open the JS debugger.
- If Metro gets into a weird state: `npx expo start -c` to clear the cache.

---

## Scripts

| Script | What it does |
|---|---|
| `npm start` | Start the Expo dev server |
| `npm run ios` | Launch on iOS simulator |
| `npm run android` | Launch on Android emulator |
| `npm run web` | Launch in browser |
| `npm run typecheck` | `tsc --noEmit` — strict TypeScript check |
| `npm run security-scan` | Local secret/PII scan (script is gitignored — ask Samee if you need it) |
| `npm run pre-push` | Runs `typecheck` then `security-scan` — run before pushing |

---

## Project layout

```
app/                Expo Router screens — file-based routing
  _layout.tsx       Root layout: fonts, auth gate, QueryClient
  (auth)/           Login / signup flow
  (tabs)/           Main tab navigator
  onboarding/       First-run onboarding screens
  lesson/           Lesson runner
  heritage/         Heritage detail screens
components/         Reusable components, grouped by domain
constants/          colors, copy, fonts, spacing, lesson content
data/               Static JSON: lessons.json, phrases.json
hooks/              Custom React hooks
services/           External integrations
  api/              Supabase client
  audio/            TTS / audio playback
  text/             Text helpers (e.g. transliteration)
stores/             Zustand stores (auth, user, progress)
utils/              Small pure helpers
assets/             Images, icons, splash
scripts/            Local-only dev scripts (gitignored)
```

One screen per file in `app/`. Route name = filename.

---

## Stack and conventions

This section is what Claude Code needs to make changes safely. Follow these rules — the project's local `CLAUDE.md` enforces the same.

### Sizing — no raw pixels
- Use `moderateScale()` / `scale()` / `verticalScale()` from `react-native-size-matters` for `width`, `height`, `padding`, `margin`, `borderRadius`, `fontSize`.
- Prefer `'100%'` / flex over fixed numbers for full-width/height elements.
- Never write `padding: 24` — write `padding: moderateScale(16)`.

### Safe areas
- Every screen wraps content in `SafeAreaView` from `react-native-safe-area-context` (not from `react-native`).
- For custom layouts, use `useSafeAreaInsets()`.

### Navigation
- Expo Router's built-in Stack / Tabs / Drawer headers. Don't rebuild headers inside screens.
- If a screen needs a custom header, hide the router header in that screen's options.

### Touch and accessibility
- Min touch target: 44×44pt.
- Use `Pressable` (not `TouchableOpacity`) for new interactives.
- Set `maxFontSizeMultiplier` on text that must not break layout.
- `accessibilityLabel` on icon-only buttons.

### State
- Local: `useState` / `useReducer`.
- Cross-screen: **Zustand** (see `stores/`).
- Server state: **TanStack Query** — do not fetch in `useEffect` for data that belongs in a query.
- Persistence: AsyncStorage via Zustand `persist` middleware; secrets go through `expo-secure-store`.

### Data fetching
- All network calls go through Supabase client in `services/api/`. Don't call `fetch` directly from components.
- Handle loading, error, and empty states explicitly. Never swallow errors silently.

### Styling
- Inline `style={{...}}` objects drawing values from the tokens file in `constants/` (colors, spacing, fonts).
- Dark mode colors via tokens, never hex literals in components.
- No inline `style={{...}}` for more than one or two dynamic props.

### TypeScript
- Strict mode is on. Do not disable it or `@ts-ignore` — fix the type.
- Avoid `any`. Use `unknown` and narrow.
- Props types: `<ComponentName>Props`, exported alongside the component.
- No non-null assertions (`!`) on values that could realistically be null at runtime.

### Performance
- `FlatList` / `FlashList` for any list > ~10 items. Never `.map()` a long array inside a `ScrollView`.
- Stable `keyExtractor` (not array index).
- `React.memo` + `useCallback` for expensive children.
- Images: `expo-image` (not RN `Image`).

### Permissions / native
- Use Expo modules (`expo-av`, `expo-secure-store`, etc.) — not bare RN equivalents.
- Request permission with an in-app explanation before triggering the system prompt.
- Handle denied state gracefully.
- Never log secrets, tokens, or PII.

### Workflow — verify visually before declaring done
1. After any UI change, run the app and screenshot the affected screen:
   - iOS: `xcrun simctl io booted screenshot /tmp/screen.png`
   - Android: `adb exec-out screencap -p > /tmp/screen.png`
2. Check the screenshot: nothing clipped by notch/home indicator, no element taking disproportionate space, touch targets look tappable, text not crammed.
3. Test on iPhone SE (375×667) as the small-screen floor as well as a larger device.
4. Do not declare a screen "done" without seeing it rendered.

### Code changes
- Smallest change that solves the problem. No drive-by refactors.
- Don't modify `ios/`, `android/`, or lockfiles unless explicitly asked.
- After any dependency change, run the app to verify it still builds.

---

## Auth and routing flow

`app/_layout.tsx` defines the gate:

1. Wait for fonts + Zustand stores to hydrate.
2. Subscribe to Supabase auth state.
3. Route by state:
   - no session → `/(auth)/login`
   - session + onboarding incomplete → `/onboarding/welcome`
   - session + onboarded → `/(tabs)`

---

## Troubleshooting

- **`Unable to resolve module ...`** — kill Metro, then `npx expo start -c`.
- **Supabase calls failing with "missing env"** — confirm `.env` exists at repo root and both `EXPO_PUBLIC_*` keys are set; restart Metro after editing `.env`.
- **iOS sim won't boot** — open Xcode once and accept the license, then `xcrun simctl list devices` should show simulators.
- **Android emulator slow** — use a system image with Google APIs and enable host GPU.
- **Fonts not loading** — `_layout.tsx` blocks render until `useFonts` resolves; if it hangs, network may be blocking Google Fonts.

---

## Before you push

```bash
npm run pre-push
```

This runs `typecheck` and the local secret scan. Don't push with type errors. If `security-scan` flags something, fix it — do not bypass it.
