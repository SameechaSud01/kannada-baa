# Kannada Baa — Windows Onboarding

Welcome! This guide gets you from a fresh Windows machine to a running build of **Kannada Baa**, plus a tour of the codebase so you can start making changes.

If you hit anything that this guide doesn't cover, DM Samee — and please send a PR updating this file with what you learned.

---

## 1. What is this app?

**Kannada Baa** (ಕನ್ನಡ ಬಾ — "Kannada, come!") is a mobile app that teaches conversational Kannada to non-Kannadigas living in Bengaluru. The audience is 20–35 year olds who want to get past pointing-and-smiling at autos, shops, and neighbours.

Design principles you'll see reflected everywhere:
- **Warm and forgiving** — no streak shaming, no XP grinds, no "you broke your streak!" dread.
- **Beginner-first** — every Kannada word ships with a transliteration; no assumed prior exposure.
- **Karnataka identity** — green/gold palette (the flag), Mysore red accents, Lora italic for transliterations, Noto Serif Kannada for the script itself.

---

## 2. The stack at a glance

| Layer | Choice | Why it matters to you |
|---|---|---|
| Framework | **Expo SDK 54** (managed workflow) | No `ios/` or `android/` folders in git — Expo regenerates them. You never run `pod install` or open Android Studio for our code. |
| Runtime | **React Native 0.81**, React 19 | New Architecture (Fabric/TurboModules) is **on** — see [app.json](app.json) `newArchEnabled: true`. |
| Navigation | **Expo Router 6** (file-based) | Files in [app/](app/) become routes. Folder = nested stack. `(parens)` folders are route groups (no URL segment). |
| Styling | **NativeWind 4** (Tailwind for RN) + design tokens in [constants/](constants/) | Pull colors/spacing from tokens; no hex literals in components. |
| Sizing | **react-native-size-matters** | `moderateScale()` / `scale()` / `verticalScale()` instead of raw pixels — this is enforced. |
| Local state | **Zustand 5** (in [stores/](stores/)) | Persisted via AsyncStorage; secrets via `expo-secure-store`. |
| Server state | **TanStack Query 5** | Do not fetch in `useEffect` for data that belongs in a query. |
| Backend | **Supabase** (Postgres + Auth) | Single client in [services/api/supabase.ts](services/api/supabase.ts). |
| Audio | **expo-av** + **expo-speech** | Device TTS for Kannada playback, see [services/audio/](services/audio/). |
| Lesson content | Static TS modules in [constants/lessons/](constants/lessons/) + JSON in [data/](data/) | Content is in-app, not fetched. |
| Language | **TypeScript strict** | No `any`, no `@ts-ignore`, no non-null `!` on values that could realistically be null. |

---

## 3. Windows prerequisites

You will be doing **Android-only** development. iOS simulators do not run on Windows — there's no Xcode for Windows and no legal way around it. If you absolutely need to test iOS, either (a) share a Mac with Samee for the final pass, or (b) publish a dev build through EAS and install it on a borrowed iPhone.

Install these, in order:

1. **Node.js 20 LTS** — [nodejs.org](https://nodejs.org/) → "LTS" download. Verify with `node -v` (should print `v20.x.x`).
2. **Git for Windows** — [git-scm.com](https://git-scm.com/download/win). During install, accept the default "Checkout as-is, commit Unix-style line endings" option (see §8 on line endings).
3. **A real terminal** — use **Windows Terminal** (free from the Microsoft Store) with **PowerShell 7**. Avoid `cmd.exe`; some Expo CLI output assumes ANSI colour support.
4. **VS Code** — [code.visualstudio.com](https://code.visualstudio.com/). Recommended extensions:
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense (works with NativeWind)
   - Expo Tools
5. **Android Studio** — [developer.android.com/studio](https://developer.android.com/studio). When the setup wizard runs, accept the **Android SDK**, **Android SDK Platform-Tools**, and **Android Virtual Device** components. We need API level 34+ to match `expo-router`/RN 0.81.
6. **Environment variables** (Settings → System → About → Advanced system settings → Environment Variables):
   - `ANDROID_HOME` → `C:\Users\<you>\AppData\Local\Android\Sdk`
   - Add to `Path`: `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\emulator`
   - Restart your terminal after setting these. Confirm with `adb --version` and `emulator -list-avds`.
7. **(Optional) EAS CLI** — only if you'll be cutting cloud builds: `npm i -g eas-cli`.

> **You do *not* need:** Xcode, CocoaPods, Ruby, JDK installed separately (Android Studio bundles one), `react-native` CLI globally, Yarn, or pnpm. The lockfile is npm — stay on npm.

### Create an Android Virtual Device (AVD)

1. Android Studio → "More Actions" → "Virtual Device Manager".
2. **Create Device** → pick **Pixel 6** (good middle-ground for our 375×667 floor / 414×896 ceiling testing).
3. System image: **API 34 (UpsideDownCake)** with **Google APIs** (not "Google Play" — Google APIs is lighter and enough for us).
4. Finish. Launch the emulator at least once from the AVD Manager to make sure it boots before we hand control to Expo.

> **Performance tip:** in BIOS, enable **Intel VT-x** (Intel) or **AMD-V** (AMD) virtualization. Without it, the emulator runs ~10× slower. On Windows, also enable **Hyper-V** *or* install **Intel HAXM** via the SDK Manager — not both.

---

## 4. Clone, configure, run

```powershell
# 1. Clone (use quotes — the folder name has a space)
git clone <repo-url> "Kannada Baa"
cd "Kannada Baa"

# 2. Install dependencies (~3-5 min on first install)
npm install

# 3. Create your .env file at the repo root
#    Get the actual values from Samee — they are not in the repo.
ni .env
```

Open the new `.env` in VS Code and add:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

Both keys must keep the `EXPO_PUBLIC_` prefix — that's how Expo exposes them to the client bundle. `.env` is gitignored; never commit it.

Verify the toolchain is happy:

```powershell
npm run typecheck
```

Clean output = you're ready to run the app.

### Boot the app on the Android emulator

```powershell
# Start your AVD first (either from Android Studio's Device Manager,
# or from the terminal:)
emulator -avd Pixel_6_API_34

# In a separate terminal, in the repo root:
npm run android
```

The Metro bundler will start, install Expo Go into the emulator, and launch the app. First boot takes 1–2 min; subsequent reloads are near-instant.

### Or: run on your physical Android phone

Often faster than the emulator on a mid-spec laptop.

1. On the phone: Settings → About phone → tap "Build number" 7 times to unlock developer options.
2. Developer options → enable **USB debugging**.
3. Plug in via USB, accept the "Allow debugging from this computer?" prompt.
4. Confirm visible: `adb devices` should list your phone.
5. Install **Expo Go** from the Play Store.
6. From the repo: `npm start`, then scan the QR code with the Expo Go app.

### Common scripts

| Script | What it does |
|---|---|
| `npm start` | Start Metro with the QR code (scan it with the Expo Go app) |
| `npm run android` | Boot Metro and launch on a connected emulator/device |
| `npm run web` | Run in browser — limited, primary targets are iOS/Android |
| `npm run typecheck` | `tsc --noEmit` — strict check, must pass before pushing |
| `npm run pre-push` | typecheck + security scan (run before every push) |

> No `npm run ios` for you on Windows. It exists in [package.json](package.json#L8) but only works on macOS.

---

## 5. Tour of the codebase

```
app/                  Expo Router screens (file-based routing)
  _layout.tsx         Root: fonts, auth gate, QueryClient, audio setup
  (auth)/             Login flow (route group — no URL segment)
  (tabs)/             Main bottom-tab nav: index, learn, practice, profile
  onboarding/         First-run welcome → motivation → goal → commitment
  lesson/[id].tsx     Dynamic lesson runner
  heritage/[id].tsx   Heritage detail pages

components/
  lesson/             Lesson UI — IntakePhase, QuizCard, ScenarioPhase, etc.
  onboarding/         Onboarding-specific UI
  ui/                 Shared UI: AudioButtons, LessonCard, ProgressBar, TabBar...

constants/
  colors.ts           Material 3 tonal palette — single source of truth
  copy.ts             User-facing strings (en) — use via useCopy()
  fonts.ts            DM Sans / Lora / Noto Serif Kannada font name map
  spacing.ts          Spacing scale (used with moderateScale)
  lessons/            Lesson content as typed TS modules (one per lesson)

data/
  lessons.json        Legacy bundled lessons
  phrases.json        Phrase library

hooks/
  progress.ts         Progress-store derived hooks
  useCopy.ts          Returns translated string from constants/copy.ts
  useLessonRunner.ts  Lesson state machine driver

services/
  api/supabase.ts     Supabase client (uses expo-secure-store for sessions)
  audio/              AudioService + deviceTtsAudioService (expo-speech)
  text/               Transliteration matching helpers

stores/               Zustand stores
  useAuthStore.ts     Supabase session + loading flag
  useUserStore.ts     User profile + onboarding completion flag
  progressStore.ts    Lesson completion, streak, words learned

utils/                Small pure helpers
assets/               Images, icons, splash
scripts/              Local-only dev scripts (gitignored)
```

### How a screen boots — read this once

[app/_layout.tsx](app/_layout.tsx) is the root. On launch it:

1. Loads the three font families (`useFonts`) — until they resolve, splash stays up and the app renders `null`. If a screen ever flashes wrong fonts, this is why.
2. Configures audio: `playsInSilentModeIOS: true`, then probes whether the device has a Kannada TTS voice installed.
3. Wraps everything in `QueryClientProvider`.
4. Inside `AppGate`, subscribes to Supabase auth changes and routes based on three flags:
   - no session → `/(auth)/login`
   - session + `!hasCompletedOnboarding` → `/onboarding/welcome`
   - session + onboarded → `/(tabs)`
5. Waits for both Zustand stores (`useUserStore`, `useProgressStore`) to hydrate before routing — otherwise users would briefly see the login screen even when authenticated.

If you're confused why a redirect happened, the answer is almost always in that file.

---

## 6. Conventions — read before your first PR

These come from [.claude/CLAUDE.md](.claude/CLAUDE.md) (gitignored) and the [README](README.md). Summary of the rules that catch newcomers:

- **No raw pixels.** Wrap every `width`/`height`/`padding`/`margin`/`borderRadius`/`fontSize` in `moderateScale()` / `scale()` / `verticalScale()` from `react-native-size-matters`. For full-bleed elements, prefer `'100%'` or flex.
- **Safe areas everywhere.** Every screen wraps content in `SafeAreaView` from `react-native-safe-area-context` — *not* the one from `react-native`. For custom layouts, use `useSafeAreaInsets()`.
- **Pressable, not TouchableOpacity.** Min touch target 44×44 pt. `accessibilityLabel` on icon-only buttons.
- **One screen per file** in [app/](app/). Route name = file name.
- **No fetch in components.** All network goes through the Supabase client in [services/api/](services/api/). Use React Query for caching.
- **No hex literals in components.** Pull colors from [constants/colors.ts](constants/colors.ts) so dark mode and future palette tweaks work.
- **TypeScript strict.** No `any`, no `@ts-ignore`, no `!` non-null assertions where the value could realistically be null. Use `unknown` and narrow.
- **`FlatList` / `FlashList` for lists > ~10 items.** Stable `keyExtractor` (never the array index).
- **No drive-by refactors.** Smallest change that solves the problem. Don't touch `ios/`, `android/`, or lockfiles unless explicitly asked.
- **Verify visually.** After any UI change, screenshot the affected screen and look at it before declaring done. On Windows the screenshot command is `adb exec-out screencap -p > screen.png` (PowerShell: redirect with `| Set-Content -Encoding Byte screen.png`). Always test on a small screen as well — iPhone SE size (375×667) is our small-screen floor.

Two things specifically I want to flag because they bite people:

- **`ScrollView` padding** goes in `contentContainerStyle`, not `style`.
- **`Image` always needs explicit dimensions** or it collapses to 0×0. Use `expo-image` (not RN `Image`) for caching.

---

## 7. Before you push

```powershell
npm run pre-push
```

This runs `typecheck` and the local secret scan. Don't push with type errors. If `security-scan` flags something, fix it — do not bypass it. (The script itself lives in [scripts/](scripts/) which is gitignored — ask Samee for a copy if it isn't on your machine.)

---

## 8. Windows-specific gotchas

These are not in the README because the README assumes macOS.

- **Path length limit (260 chars).** `node_modules` nesting can exceed Windows' default MAX_PATH. Enable long paths:
  - Run PowerShell **as admin**: `Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1`
  - And: `git config --global core.longpaths true`
  - Reboot.
- **Line endings.** Git for Windows installs with `core.autocrlf=true` by default, which can rewrite line endings on checkout and confuse Metro on some files. We prefer `input`: `git config --global core.autocrlf input`.
- **Folder name has a space.** "Kannada Baa" has a space. Always quote paths in PowerShell: `cd "Kannada Baa"`. Some older RN tooling chokes on spaces; if you hit weird errors, you can clone into `kannada-baa` (no space) — there's nothing in the repo that depends on the folder name.
- **Antivirus / Windows Defender** can slow Metro to a crawl by scanning every file change. Add an exclusion for the repo folder and your global `npm` cache (`%AppData%\npm-cache`).
- **Symlinks.** Some Metro / Expo plugins use symlinks. Either run your terminal as Administrator, or enable "Developer Mode" in Settings → Privacy & security → For developers.
- **PowerShell execution policy.** If `npm` scripts fail with "running scripts is disabled", run once as admin: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.
- **`adb devices` shows nothing.** Almost always either (a) phone's USB mode is "Charging only" — switch to "File transfer / MTP", or (b) you skipped the on-device "Allow USB debugging" prompt — unplug, replug, and watch the phone screen.
- **Emulator extremely slow.** Make sure HAXM (Intel) or Hyper-V (Microsoft) is enabled; without hardware acceleration the emulator is unusable.

---

## 9. Troubleshooting (the cross-platform ones)

- **`Unable to resolve module ...`** — kill Metro, then `npx expo start -c` to clear the cache.
- **Supabase calls failing with "missing env"** — confirm `.env` exists at repo root and both `EXPO_PUBLIC_*` keys are set; restart Metro after editing `.env`.
- **Fonts not loading / app stuck on splash** — [app/_layout.tsx](app/_layout.tsx) blocks render until `useFonts` resolves. If your network blocks Google Fonts, this hangs. Try a different network.
- **Kannada audio doesn't play on the emulator** — emulators often don't ship a Kannada TTS voice. Test audio on a real Android device (Settings → System → Languages → Text-to-speech → install Kannada voice).

---

## 10. Where to go next

Suggested first PR ideas to get familiar with the codebase:
- Read [app/_layout.tsx](app/_layout.tsx) end to end, then add a `console.log` somewhere in the routing flow and watch it fire as you sign in/out.
- Pick one screen — [app/(tabs)/practice.tsx](app/(tabs)/practice.tsx) is currently in flux — and trace where its data comes from (likely a Zustand store + static lesson content).
- Add a new entry to [constants/copy.ts](constants/copy.ts) and use it via `useCopy()` somewhere.

Ping Samee (sameechasudheer@gmail.com) for the Supabase env values, the gitignored `scripts/security-scan.sh`, and access to the spec doc (`namma-app-v1-spec.docx`) which is also gitignored. Welcome aboard.
