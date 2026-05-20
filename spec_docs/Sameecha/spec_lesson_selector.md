# Claude Code Spec — Reusable LessonSelector (Namma Kannada)

## Goal
Build ONE reusable lesson-selector screen used by every main game
(Opposites, Matching, Listen, Spell It, Say It, and any future game).
The user lands on it after picking a game, sees all 8 lessons stacked
vertically as pills, taps an unlocked one to start that lesson of that
game. Locked lessons are visible but disabled.

## Context
- App: Namma Kannada — Kannada learning app for non-Kannadigas in Bengaluru.
- Stack: Expo (React Native) + React Native Elements + Moti + Reanimated.
- Tone: calm, non-pressuring, scannable. This is a navigational hub the
  user passes through often — it must get out of the way.
- A working web reference of the exact target layout, copy and pill
  design exists (`LessonSelectorDemo.jsx`). Use it as the visual and
  behavioural source of truth. Translate web CSS to Moti/Reanimated.

## Architecture rules (read first — these are the non-negotiables)
1. ONE source of truth for lessons. Lesson identity (number, glyph,
   theme name, unlock state) lives in a single lesson model. Every
   game's selector reads from it. Do not duplicate lesson lists
   per-game. Do not let the selector own this data.
2. UNLOCKS ARE GLOBAL. Unlocking Lesson 3 in the Lessons tab unlocks
   Lesson 3 across every game. The selector receives unlock state, it
   does not compute it.
3. The GLYPH and THEME for a lesson number are constant across games
   (Lesson 1 is "ನ — Greetings" everywhere).
4. The ONLY per-game differences in this screen are: the title shown
   in the header, and a one-line tagline beneath it. Everything else
   (pill design, spacing, help copy, chip, layout) is identical across
   every game. This is what makes the games feel like one app.

## Dependencies (verify, do not blindly reinstall)
- `moti`, `react-native-reanimated`, `@rneui/themed`,
  `react-native-safe-area-context`
Verify: `cat package.json | grep -E "moti|reanimated|rneui|safe-area"`.
Use `npx expo install` for any RN packages that need adding.

## Component API
```ts
type Lesson = {
  n: number;          // 1..8
  glyph: string;      // single Kannada character
  theme: string;      // e.g. "Greetings"
  unlocked: boolean;  // from the shared lesson model
};

type Game = {
  key: string;        // e.g. "opposites"
  title: string;      // e.g. "Opposites"
  tagline: string;    // e.g. "Pick the opposite of each word."
};

type Props = {
  game: Game;
  lessons: Lesson[];              // exactly 8, ordered by n ascending
  onSelectLesson: (lesson: Lesson) => void;   // fires only for unlocked
  onBack: () => void;
};
```
Notes:
- The component does NOT fetch lessons. It receives them.
- `onSelectLesson` is only ever called for unlocked lessons. Locked
  pills are non-pressable; do not call the handler for them.
- The component does NOT navigate. Parent decides where the tap goes
  (i.e. routing into the chosen game's exercise screen).

## Visual tokens (exact)
- Page bg: `#FBF5DC`
- Pill bg (unlocked): `#FFFFFF`
- Pill bg (locked): `#EFEADA`
- Pill border (unlocked): `1px #EADFC4`
- Pill border (locked): `1px #D9D3BE`
- Pill radius: 16
- Pill shadow (unlocked only): subtle, `0 2 6 rgba(50,38,15,0.07)` on
  iOS; on Android use `elevation: 1.5`. See Platform notes below.
- Glyph block: 42×42, radius 12, fill `#FBE6BA` unlocked /
  `#E5DFCB` locked. Glyph color: `#1C1C1C` unlocked / `#A39E8B` locked.
- "Lesson N": 14.5px, weight 800. Color `#1C1C1C` unlocked /
  `#A39E8B` locked.
- Theme name: 12px, color `#6A6A6A` unlocked / `#A39E8B` locked.
- Locked pill overall opacity: 0.7.
- Lock icon: 15px, color `#A39E8B`. Use the Lucide/Tabler "lock" icon
  or equivalent.
- Gap between pills: 10.
- Page padding: top 26 (after safe area), horizontal 22, bottom 32.

## Header
- Back button: 44×44 circle, bg `#EDE6CF`, icon color `#A11D2F`, back
  arrow glyph. Fires `onBack`.
- Title (`game.title`): 26px, weight 800, color `#1C1C1C`.
- Right chip: "X/8" where X = count of unlocked lessons. 12px weight
  700, color `#3B6D11`, bg `#E7F1DA`, padding 6 vertical 11 horizontal,
  radius 14.
- Tagline (`game.tagline`): 13px, weight 600, color `#BA7517` (gold).
  Sits below the header row.
- Help line (same on every game): 13px color `#6A6A6A`, line-height
  1.5, text exactly: "Tap a lesson to play. Complete lessons in the
  Lessons tab to unlock more."

## Behaviour
1. Render 8 pills, ordered by lesson number ascending.
2. Tap an UNLOCKED pill:
   - Press feedback: scale 1 → 0.985 → 1, ~160ms spring.
   - Fire `onSelectLesson(lesson)`. Parent handles navigation.
3. Tap a LOCKED pill:
   - No press feedback, no callback. The pill is disabled.
   - Optional polish (acceptable, not required): the lock icon does
     a single gentle wobble (rotate ±4deg) so the user gets a "no"
     signal without a colour or text change. If included, keep it
     under 250ms and do not pair it with sound or haptics.
4. Back button: fires `onBack`. No animation needed.

## Entrance animation (required, subtle)
- On mount, pills fade and slide up with a small stagger.
- Per pill: opacity 0 → 1, translateY 8 → 0, ~360ms, ease-out.
- Stagger: ~60ms between pills (so all 8 finish inside ~860ms).
- Use Moti `<MotiView>` with `from`/`animate`/`transition` and a
  per-index `delay`.
- Header + tagline + help line: fade in once, no slide, slightly ahead
  of the pills.

## Locked → unlocked reveal (separate spec note)
If a lesson newly unlocks WHILE the selector is mounted (e.g. user
returns from finishing it in the Lessons tab), the pill should
transition from locked → unlocked smoothly:
- Locked styles fade out, unlocked styles fade in over ~450ms.
- Glyph fades in (opacity 0 → 1) in place; do not animate position.
- No confetti, no scale burst, no sound. The reward here is the new
  capability, not the celebration.
This is OPTIONAL for v1 if parent component remounts the selector on
re-entry. If parent does NOT remount, this transition is REQUIRED so
the user sees the state change.

## Accessibility
- Each pill:
  - `accessibilityRole="button"`
  - `accessibilityLabel`: `"Lesson ${n}: ${theme}"`, append
    `", locked"` if not unlocked.
  - `accessibilityState`: `{ disabled: !unlocked }`.
- Back button: `accessibilityLabel="Go back"`.
- Chip "4/8": render as readable text (e.g. "4 of 8 lessons unlocked")
  via `accessibilityLabel`, not just "4/8".
- Tagline + help text are plain text and need no special handling.

## Platform notes (be explicit — earlier work hit a real bug class)
- Set `backgroundColor` EXPLICITLY on every pill in every state. Do
  not rely on default pressed/active surfaces. (See OppositesExercise
  spec for the full rationale — same rule applies here.)
- Shadows: on iOS use `shadowColor/Offset/Opacity/Radius`. On Android
  use `elevation`. The visual results are not identical; expect the
  Android pill to look slightly more raised. Tune `elevation` to ~1.5
  so the difference is acceptable. Do NOT try to match exactly.
- `Pressable` on Android: set `android_ripple={{ color: 'transparent' }}`
  or use a Moti-driven scale instead, to prevent the default grey
  ripple from showing inside the white pill.

## Performance
- Animate transform + opacity only. Do not animate layout properties.
- 8 pills × entrance animation is fine; do not loop any animation on
  this screen.
- The locked-wobble (if included) should run once per tap, not loop.

## Acceptance criteria
- [ ] Selector renders identically across all game keys, varying ONLY
      in `game.title` and `game.tagline`.
- [ ] Pill design, spacing, chip, help copy are byte-identical across
      games (verify by snapshotting two different games and diffing).
- [ ] Locked pills do not call `onSelectLesson` on tap.
- [ ] Unlocked pills call `onSelectLesson(lesson)` exactly once per tap.
- [ ] Chip count equals `lessons.filter(l => l.unlocked).length`,
      always — never hardcoded.
- [ ] Entrance stagger plays once on mount, never on prop changes.
- [ ] No default pressed/active background visible on Android
      (verify on a real low-end Android profile).
- [ ] Screen reader announces lesson number, theme, and locked state.
- [ ] No Reanimated/Moti console warnings; no state update after
      unmount.

## Out of scope (do not add)
- Per-lesson progress bars, stars, or mastery indicators. The selector
  shows identity and unlock state only.
- A "Start Game" CTA at the bottom. Tap-to-start is the only flow.
- Search, filter, or sort.
- Routing/navigation. Parent owns it via `onSelectLesson`.
- Sound effects, haptics, confetti.

## Where to wire it
Each game's route renders:
```tsx
<LessonSelector
  game={GAMES[gameKey]}
  lessons={useLessons()}      // hook that reads the shared model
  onSelectLesson={(l) => router.push(`/${gameKey}/${l.n}`)}
  onBack={() => router.back()}
/>
```
The `GAMES` catalog and `useLessons` hook live OUTSIDE this component
and are not part of this spec — they belong to app-level state.

## Manual test
1. Render with `game.key = "opposites"` and 4 of 8 lessons unlocked.
   Confirm: chip shows 4/8, pills 1–4 are tappable, pills 5–8 are not,
   tagline reads "Pick the opposite of each word."
2. Switch `game.key = "matching"` (same lessons array). Confirm: only
   the title and tagline change; everything else is byte-identical.
3. Tap each unlocked pill: confirm `onSelectLesson` fires with the
   correct lesson object once per tap. Tap each locked pill: confirm
   no callback fires.
4. Hot-reload with one previously-locked lesson now unlocked. Confirm
   the pill transitions to unlocked smoothly (if your parent does not
   remount). If it does remount, just confirm the entrance stagger
   re-plays cleanly.
5. Run on a low-end Android profile and confirm no grey ripple inside
   the white pill on press.

## Reference
- `LessonSelectorDemo.jsx` — working web implementation of the exact
  target layout, copy, palette and behaviour. Match it.
- `OppositesExercise.jsx` + `spec_opposites_exercise.md` — the screen
  this selector navigates INTO on tap. Same palette, same rules around
  explicit `backgroundColor` and motion-only selection signalling.
