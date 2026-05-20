---
doc: MODALS
status: proposed
owner: samee
last-reviewed: 2026-05-20
related:
  - DESIGN.md
  - NAVIGATION.md
  - CONTENT.md
  - STATE.md
---

# Modals & overlays

> **Decision layer.** `[LOCKED]` means decided — do not reopen, resolve, or build the opposite. `[OPEN]` means genuinely undecided. `[PROPOSED]` is in this doc only — pending owner sign-off; once approved, promote to `[LOCKED]`.

Owns: the full modal/overlay system — primitives, mounting strategy, and every instance. Token assignments reference `[LOCKED]` items in [DESIGN.md](DESIGN.md). Dimensions are **base values** — wrap with `moderateScale()` from `react-native-size-matters` per project convention.

Visual reference: the **Modals & overlays** section of `Kannada Baa - Design.html` in the design project. Implementation should follow this spec's token assignments, not the HTML's inline styles.

---

## 1. The four shapes

`[LOCKED]`

Every overlay in the app is one of four shapes. Pick by intent — never invent a fifth.

| Shape | Use when | Examples |
|---|---|---|
| **Centered dialog** | A blocking yes/no, an important info note, or a permission ask. | Exit lesson, Sign out, Lesson locked, Notifications permission, TTS unavailable |
| **Bottom sheet** | Tap-to-explore content that doesn't block the underlying screen. Swipe-down to dismiss. | Phrase detail, Self-rating |
| **Full-screen takeover** | Celebration that owns the whole screen. | Streak milestone |
| **Toast** | One-line system feedback — success or error. Auto-dismisses (success) or sticks (error). | "Reminder set", "Couldn't play audio" |

## 2. Mounting & state

`[PROPOSED]`

One `<ModalHost>` provider mounted at the root of [app/_layout.tsx](../../app/_layout.tsx), above all screens but below the toast layer. Exposes imperative `useModal()`:

```ts
const m = useModal();
m.show({ kind: 'dialog',   component: ExitLessonDialog,  props: { onConfirm } });
m.show({ kind: 'sheet',    component: PhraseDetailSheet, props: { phraseId } });
m.show({ kind: 'takeover', component: StreakMilestoneTakeover, props: { streak: 12 } });
m.dismiss();
```

Toasts mount via a separate `<ToastHost>` at the very top of the tree (above modals, below status bar) and use an imperative API:

```ts
Toast.show({ kind: 'success', title: 'Reminder set — 8:00 PM daily' });
Toast.show({ kind: 'error',   title: "Couldn't play audio", subtitle: 'Tap to retry · check sound is on' });
```

Rules:
- **Only one modal on screen at a time.** Showing a second one auto-dismisses the first.
- **Status bar stays visible** above the backdrop (iOS-native behavior). Do not hide it.
- **Back button on Android** dismisses non-destructive modals; destructive dialogs intercept and do nothing (user must use the explicit Cancel).
- **Focus trap**: a mounted dialog/sheet captures keyboard + a11y focus; the underlying screen is `accessibilityElementsHidden` and `importantForAccessibility="no-hide-descendants"`.

## 3. Backdrop

`[PROPOSED]`

Shared by dialogs, sheets, and the goal-complete celebration (not by takeovers — those are full-bleed).

| Property | Value |
|---|---|
| Position | Absolute fill |
| Background | `rgba(27,29,14,0.55)` — `Colors.onSurface` at 55% opacity |
| Blur | `expo-blur` `BlurView intensity={20} tint="dark"` overlaid; cap intensity at `20` to avoid Android perf cost |
| Tap | Dismisses non-destructive modals; destructive confirms ignore backdrop taps |
| Variants | `dim={0.4}` for info-only dialogs (Lesson locked); default `0.55` everywhere else |
| Animation | Fade in 200ms ease-out; fade out 150ms ease-in |

> **Why warm dark, not black:** `Colors.onSurface` is `#1b1d0e` — warm sandstone. Pure black would break the "warm, never sterile" rule (`[LOCKED]` in DESIGN.md).

## 4. Primitives

### 4.1 `Dialog` (centered) `[PROPOSED]`

| Property | Value |
|---|---|
| Width | `min(88%, 360pt)` |
| Background | `Colors.surfaceContainerLow` |
| Radius | `Radius.xl` (20) |
| Padding | `22` |
| Shadow | `0 24px 60px rgba(0,0,0,0.22)` + `inset 0 1px 0 rgba(255,255,255,0.6)` — promote to **`shadows.modal`** token |
| Children gap | `14` (flex column, gap) |
| Enter animation | 200ms fade + `scale(0.96 → 1)` |
| Exit animation | 150ms fade + `scale(1 → 0.98)` |

### 4.2 `BottomSheet` `[PROPOSED]`

Implement via `@gorhom/bottom-sheet` (add dependency). Configure to match:

| Property | Value |
|---|---|
| Width | `100%` |
| Background | `Colors.surfaceContainerLow` |
| Radius | `20pt 20pt 0 0` (top corners only) |
| Padding | `10pt / 20pt / 36pt / 20pt` (extra bottom clears home indicator) |
| Drag handle | `38 × 5`, radius `3`, `Colors.surfaceDim`, centered, `marginBottom: 8` |
| Snap points | One snap by default — sized to content (use `enableDynamicSizing`) |
| Animation | Slide up 250ms ease-out, slide down 200ms ease-in |
| Dismiss | Swipe down on handle area, or tap backdrop |

### 4.3 `Takeover` (full-screen) `[PROPOSED]`

Not a wrapped primitive — just a regular screen mounted by `<ModalHost>` over everything else. Same dimensions and `SafeAreaView` rules as a normal screen, but with no tab bar and a top-right close button.

| Property | Value |
|---|---|
| Background | `Colors.surfaceContainerLow` (varies by instance; see §6.6) |
| Close button | `RoundIconButton variant="ghost" icon="x"` at `top: insets.top + Spacing.xl`, `right: Spacing.lg` |
| Enter animation | Slide up 350ms ease-out from below |
| Exit animation | Slide down 280ms ease-in |

### 4.4 `Toast` `[PROPOSED]`

Two variants — success (top, pill) and error (bottom, card).

| Property | Top success | Bottom error |
|---|---|---|
| Background | `Colors.onSurface` | `Colors.surfaceContainerLow` |
| Text color | `Colors.surface` | `Colors.onSurface` |
| Radius | `Radius.full` (pill) | `Radius.lg` (rounded card) |
| Padding | `12 / 16 / 12 / 12` | `12 / 14` |
| Shadow | `0 10px 30px rgba(0,0,0,0.30)` | `0 10px 30px rgba(0,0,0,0.18)` |
| Position | `top: insets.top + Spacing.xl`, centered horizontally, `maxWidth: 85%` | `bottom: insets.bottom + Spacing.xxxl`, full width minus `Spacing.lg` gutters |
| Status icon | `22 × 22` circle, `Colors.secondaryContainer` bg + check `Colors.onSecondaryContainer` | `22 × 22` circle, `Colors.errorContainerLow` bg + x `Colors.primary` |
| Auto-dismiss | 3 s | sticky — requires user tap to dismiss |
| Title font | `Type.body` (14, weight 600) | `Type.body` (13, weight 600) |
| Subtitle | none | `11pt`, weight 500, `Colors.tertiary`, marginTop `1` |
| Action | none | optional right-chevron + onPress (retry) |
| Enter animation | Slide-from-top 200ms | Slide-from-bottom 200ms |

## 5. Token additions

`[PROPOSED]`

Add to existing token files before implementing modals.

| File | Token | Value | Reason |
|---|---|---|---|
| `constants/colors.ts` | `errorContainerLow` | `#f3dada` | Pale Mysore red — error-state card bg and toast icon bg |
| `constants/shadows.ts` (NEW) | `modal` | `{ color: '#000', opacity: 0.22, radius: 60, offset: { 0, 24 } }` | Dialog & sheet drop shadow |
| `constants/shadows.ts` | `toastDark` | `{ color: '#000', opacity: 0.30, radius: 30, offset: { 0, 10 } }` | Success-top toast |
| `constants/shadows.ts` | `toastSoft` | `{ color: '#000', opacity: 0.18, radius: 30, offset: { 0, 10 } }` | Error-bottom toast |
| `constants/shadows.ts` | `medallion` | `{ color: secondary, opacity: 0.20, radius: 22, offset: { 0, 16 } }` | Hero medallions (streak takeover) |

> No font additions are needed for the modal system — uses existing `Fonts.dmSans`, `Fonts.lora.italic`, and `Fonts.notoSerifKannada`.

---

## 6. Instances

Each instance below is a self-contained component under `components/modals/instances/`. The host screen calls `useModal().show({...})` with the component reference and any props.

### 6.1 `ExitLessonDialog` — destructive confirm `[PROPOSED]`

**Trigger.** [NAVIGATION.md back behavior](NAVIGATION.md#back-behavior) — fired by `ExitBackButton` during `/lesson/[id]` phases `scenario`, `intake`, `drill`, `output`. Same component also covers `/(games)/dictation` and `/(games)/opposites` mid-game with different copy (see Variants below).

**Props.** `{ onConfirm: () => void; onCancel?: () => void; }`

**Anatomy (top → bottom).**

| Element | Token / content |
|---|---|
| Halo | `72 × 72` circle, radius `Radius.full`. Background radial gradient `Colors.secondaryFixed` → `Colors.surfaceContainerHigh` (origin `30% 30%`). Inside: `Icons.x` 28pt stroke `2.4`, `Colors.primary`. Centered. |
| Title | "Exit lesson?" `Type.headline` (20/bold), `letterSpacing: -0.3`, `Colors.onSurface`, centered. |
| Body | "You'll lose your progress on this lesson. The phrases you've already met are safe." `14pt`/regular, `Colors.tertiary`, `lineHeight: 1.45`, centered. |
| Button row | Flex row, gap `10`. Both buttons flex 1. **Cancel** = `Button variant="ghost"`. **Exit** = `Button variant="primary"` (Mysore red). |

**Variants.**

| Trigger | Title | Body | Confirm label |
|---|---|---|---|
| `lesson` (scenario / intake / drill / output) | Exit lesson? | "You'll lose your progress on this lesson. The phrases you've already met are safe." | Exit |
| `game` (dictation / opposites mid-game) | Exit this game? | "You'll lose this round. Your XP for already-completed rounds is safe." | Exit |

**Behavior.**
- Tapping backdrop = `onCancel` (does **not** confirm — destructive confirms ignore "accidental" dismissal patterns that involve no thought).
- Tapping Cancel = `onCancel`.
- Tapping Exit = `onConfirm`. Caller then `router.back()`.
- Android hardware back = `onCancel`.

**Accessibility.** `accessibilityRole="alert"`. The `Exit` button announces "Exit lesson, button. Destructive. Loses your progress."

---

### 6.2 `SignOutDialog` — destructive confirm `[PROPOSED]`

**Trigger.** Profile screen → settings list → "Sign out" row.

**Props.** `{ onConfirm: () => void; onCancel?: () => void; }`

**Anatomy.** No halo (less ceremony than mid-flow exit).

| Element | Token / content |
|---|---|
| Title | "Sign out of Kannada Baa?" `Type.headline` (20/bold), centered. |
| Body | "Your streak, lessons and phrases are saved to your account. Sign back in anytime." `14pt`/regular, `Colors.tertiary`. |
| Button stack | Flex **column**, gap `8`. Top: **Sign out** `Button variant="primary"`. Bottom: **Stay signed in** `Button variant="ghost"`. |

**Stacked, not row.** When the destructive action is the path the user came here on purpose to take (not a recovery from an accidental tap), stack vertically with primary on top — adds a half-second of friction without feeling adversarial.

**Behavior.** `onConfirm` calls `supabase.auth.signOut()`, then `AppGate` in `_layout.tsx` reroutes to `/(auth)/login`. Show a brief success toast after sign-out completes: *"Signed out. See you soon."*

---

### 6.3 `LessonLockedDialog` — info `[PROPOSED]`

**Trigger.** Tap a locked lesson row on `/(tabs)/learn`.

**Props.** `{ lessonId: LessonId; prevLessonId: LessonId; onGoToPrev: () => void; onDismiss: () => void; }`

**Backdrop.** Dim `0.4` (info, not destructive).

**Anatomy.**

| Element | Token / content |
|---|---|
| Halo | `72 × 72`, radial gradient `Colors.secondaryFixed` → `Colors.surfaceContainerHigh`. `Icons.lock` 26pt stroke `2`, `Colors.secondary`. |
| Eyebrow | "Lesson {n}" `11pt`/bold/`Colors.secondary`/`letterSpacing: 1.4`/uppercase, centered. |
| Title | "{lesson.title} — coming up next" `Type.headline` (20/bold), `letterSpacing: -0.3`, centered. |
| Body | "Finish **Lesson {prev_n} · {prev_title}** to open this one. We unlock as you go — no shortcuts, no shaming." `14pt`/regular/`Colors.tertiary`. Bold spans use `Colors.onSurface`. |
| Primary action | `Button variant="secondary"` "Continue Lesson {prev_n}" with chevron icon. |
| Dismiss | Centered text "Not now" `13pt`/bold/`Colors.tertiary`. Tappable, `hitSlop: 12`. |

**Why secondary (gold) not primary (red):** locked is *not* destructive or negative — it's a quiet redirect. Gold says "the path is there, just one stop earlier."

---

### 6.4 `PhraseDetailSheet` — bottom sheet `[PROPOSED]`

**Trigger.**
- Tap the Kannada hero on Intake (`/lesson/[id]` intake phase).
- Tap a resurfacing-phrase chip on `/(tabs)/index`.
- Long-press an option card during drill (post-MVP).

**Props.** `{ phraseId: PhraseId; }` — pulls everything else from the phrase store.

**Anatomy (top → bottom).**

| Element | Token / content |
|---|---|
| Drag handle | `38 × 5`, radius `3`, `Colors.surfaceDim`, centered, `marginBottom: 8`. |
| Header row | Flex row, gap `16`. Left (flex 1): Kannada `36pt`/medium/`Fonts.notoSerifKannada`/`Colors.onSurface`/lineHeight `1.15`, then translit `18pt`/medium-italic/`Fonts.lora.italic`/`Colors.secondary` (marginTop `4`), then English `13pt`/`Colors.tertiary` (marginTop `2`). Right: `RoundIconButton variant="primary" icon="play" size={48}`. |
| Divider | `GoldRule label="Break it down"` (the dotted divider from DESIGN.md proposal). |
| Atom rows | For each entry in `phrase.vocabAtoms`: card `Colors.surfaceContainerHighest`, radius `Radius.lg`, padding `12`, row flex, gap `10`. Kannada `18pt`/medium + translit italic `13pt`/`Colors.secondary` + flex spacer + gloss `12pt`/`Colors.tertiary` right-aligned. |
| Note callout (optional) | If `phrase.note` exists: bg `Colors.secondaryFixed`, radius `Radius.lg`, padding `12`. `Icons.sparkle` 16pt + body `12pt`/medium/`Colors.onSecondaryContainer`/`lineHeight: 1.4`. |
| Footer | Flex row, gap `10`. **Save** `Button variant="ghost"` with `Icons.flame` (favorite, soon). **Got it** `Button variant="primary"`. Each flex 1. |

> **TODO:** Add optional `note?: string` and `gloss?: { atom: string; en: string }[]` to [`Phrase`](../../constants/lessons/types.ts) type. The MVP can render without these (skip note callout, skip atom rows) and still meet spec.

**Behavior.** Audio button plays via `services/audio/deviceTtsAudioService.ts`. Save button is a no-op stub for MVP (favorite feature is post-MVP — flag it `disabled` with `accessibilityHint="Coming soon"`).

---

### 6.5 `SelfRatingSheet` — bottom sheet `[PROPOSED]`

**Status.** Gated behind milestone **M4 (SRS)** in [SCOPE.md](SCOPE.md#roadmap). Component implementable now; do not wire into the lesson runner until M4 ships.

**Trigger.** After each intake phrase reveal, before advancing.

**Props.** `{ phraseId: PhraseId; onRate: (rating: SelfRating) => void; }`. `SelfRating` type already exists in `useLessonRunner.ts` — re-export from there.

**Anatomy.**

| Element | Token / content |
|---|---|
| Drag handle | same as 6.4 |
| Eyebrow | "{kannada} · {translit}" centered, `11pt`/bold/`Colors.tertiary`/uppercase. Kannada in `Fonts.notoSerifKannada` 13pt inline, translit in `Fonts.lora.italic`. |
| Title | "How was that one?" `22pt`/bold/`Colors.onSurface`, centered. |
| Subtitle | "Be honest — it tunes when you'll see it again." `Fonts.lora.italic` 13pt/`Colors.tertiary`, centered. |
| Rating row × 3 | See table below. |

**Rating rows (lock these).** Each row is a `Pressable` `Colors.{bg}`, radius `Radius.lg`, padding `14`, row flex, gap `14`. Internal: glyph square `44 × 44` radius `Radius.lg` `Colors.surface` bg + Kannada `20pt`/medium/`Colors.{fg}`; middle (flex 1) title `15pt`/bold/`Colors.{fg}` + sub `12pt`/`Colors.tertiary`; right translit `12pt`/italic/`Colors.tertiary`.

| Rating value | bg | fg | Kannada | Translit | Title | Sub |
|---|---|---|---|---|---|---|
| `easy`   | `secondaryFixed`     | `secondary`   | ಸುಲಭ | sulabha | Easy   | See it again in a week. |
| `medium` | `surfaceContainerHighest` | `onSurface` | ಸರಿ  | sari    | Got it | See it again in three days. |
| `hard`   | `errorContainerLow`  | `primary`     | ಕಷ್ಟ  | kashta  | Tricky | See it again tomorrow. |

**Behavior.** Tapping any row immediately calls `onRate(rating)` and dismisses. No "Confirm" step.

---

### 6.6 `StreakMilestoneTakeover` — full-screen `[PROPOSED]`

**Trigger.** After lesson `done` completes (via `useLessonRunner`'s `onComplete` callback) **if** the resulting `progressStore.streak` is one of the milestone values.

**Milestones (lock these).** `3, 7, 12, 30, 60, 100, 365`. After 100, only the 365th day triggers; daily celebration past that uses the lighter `GoalCompleteDialog` (6.7).

**Props.** `{ streak: number; nWordsLearned: number; onContinue: () => void; onShare?: () => void; }`

**Background.** `Colors.surfaceContainerLow` full-bleed. No backdrop (this *is* the screen).

**Close button.** Top-right, `RoundIconButton variant="ghost" icon="x"` at `top: insets.top + Spacing.xl`, `right: Spacing.lg`.

**Confetti.** Nine absolute-positioned dots scattered in the top 60% of the screen, sizes `4-7`, mix of `Colors.secondaryContainer` and `Colors.primaryContainer`, opacity `0.7`. Optional: subtle 1.5s drift-down loop using `react-native-reanimated` — first-pass implementation can be static.

**Centered column.**

| Element | Token / content |
|---|---|
| Eyebrow | "Streak · Day {streak_word}" — `11pt`/extrabold/`Colors.secondary`/`letterSpacing: 1.8`/uppercase. Use spelled-out word: "twelve", "thirty", "one hundred". |
| Medallion | `240 × 240` circle, radial gradient `Colors.secondaryFixed` → `Colors.surface` (70% origin). Shadow `shadows.medallion`. Inner ring: `position absolute, inset: 14`, radius `full`, `2pt dotted Colors.secondaryContainer`, opacity `0.5`. |
| Number | Streak number inside medallion at `132pt`/extrabold (requires `DMSans_800ExtraBold`)/`Colors.primary`/`letterSpacing: -6`/lineHeight `1`. Pad-bottom `6` for optical centering. |
| Title | "{Streak_word_capitalized} days in." `32pt`/extrabold/`Colors.onSurface`/`letterSpacing: -0.6`/lineHeight `1.1`, centered. |
| Body | Per-milestone Lora italic copy (see Copy table below). `17pt`/italic/`Colors.tertiary`/lineHeight `1.5`/`maxWidth: 280`/centered. |

**Footer (pinned to bottom).** `Button variant="primary"` "Keep going" with chevron + below it text-only "Share with a friend" `13pt`/bold/`Colors.tertiary`/centered (only render if `onShare` passed).

**Copy table.** Add to [copy.ts](../../constants/copy.ts) as `streakMilestone.{n}`:

| Milestone | Title | Body |
|---|---|---|
| 3   | Three days. | "A start. Most apps never see a Day 3 — quietly, you're already past that." |
| 7   | Seven days in. | "A full week. Sixteen-ish phrases are starting to feel like yours." |
| 12  | Twelve days in. | "Quietly impressive. You've met **{nWordsLearned}** phrases — most of which are starting to feel like yours." |
| 30  | A month with us. | "Thirty days is when habits start to feel less like rules. Eat some thindi, you've earned it." |
| 60  | Two months strong. | "You're past the part where it gets hard. Now it just compounds." |
| 100 | One hundred days. | "Sakkath. Most people don't keep a promise for a hundred days. You did." |
| 365 | A whole year. | "Ondhu varsha. From here, it's not learning — it's living in it." |

> Body copy supports `{nWordsLearned}` interpolation. The 12-day variant is the only one currently using it; others may add the variable later.

---

### 6.7 `GoalCompleteDialog` — celebration `[PROPOSED]`

**Trigger.** The session crosses the user's daily-minutes goal (`useProgressStore.todayMinutes >= user.dailyGoalMinutes`) **for the first time today**. Show once per calendar day per user.

**Props.** `{ goalMinutes: number; streakDays: number; onOneMore: () => void; onDone: () => void; }`

**Anatomy.**

| Element | Token / content |
|---|---|
| Ring | `96 × 96` SVG (`react-native-svg`). Background stroke `Colors.surfaceContainerHigh` 8pt. Foreground stroke `Colors.secondaryContainer` 8pt, full circle, `strokeLinecap: round`, rotated `-90deg`. Center: `Icons.check` 36pt stroke `3`, `Colors.secondary`. |
| Eyebrow | "Today's {goalMinutes} minutes" `11pt`/bold/`Colors.secondary`/`letterSpacing: 1.4`/uppercase, centered. |
| Title | "Done for today." `22pt`/extrabold/`Colors.onSurface`/`letterSpacing: -0.4`, centered. |
| Body | "Proud of you — go eat some thindi." `Fonts.lora.italic` 14pt/`Colors.tertiary`, `lineHeight: 1.45`, centered. |
| Streak strip | `Colors.secondaryFixed`, radius `Radius.lg`, padding `10`, row flex, gap `10`. `Icons.flame` 16pt stroke `2`, `Colors.secondary`. Label "{streakDays}-day streak still alive" `Type.label` (12)/bold/`Colors.onSecondaryContainer`. |
| Buttons | Flex row, gap `10`. **I'm done** `Button variant="ghost"`. **One more** `Button variant="secondary"` with chevron. Each flex 1. |

**Behavior.** Persist `lastGoalCelebrationDate` (ISO date string) in `useProgressStore` so it doesn't re-fire later the same day. "One more" calls `router.push('/(tabs)/learn')`.

---

### 6.8 `PermissionDialog` — pre-system explainer `[PROPOSED]`

**Trigger.** Before calling `Notifications.requestPermissionsAsync()` or `Audio.requestPermissionsAsync()`. Required per README rule "Request permission with an in-app explanation before triggering the system prompt."

Same component, two variants — `notifications` and `mic`.

**Props.** `{ kind: 'notifications' | 'mic'; onAllow: () => void; onDeny: () => void; }`

**Anatomy.**

| Element | Token / content |
|---|---|
| Halo | `72 × 72` circle, radial gradient `Colors.secondaryFixed` → `Colors.surfaceContainerHigh`. Icon 28pt stroke `2`, `Colors.secondary`. Icon per variant: `Icons.bell` (notifications) / `Icons.mic` (mic). |
| Title | See Variants. `20pt`/bold/`Colors.onSurface`/`letterSpacing: -0.3`, centered. |
| Body | See Variants. `14pt`/regular/`Colors.tertiary`/`lineHeight: 1.5`, centered. |
| Preview row (notifications only) | `Colors.surfaceContainerHighest`, radius `Radius.lg`, padding `12`, row flex, gap `10`. Avatar `32 × 32` radius `8`, `Colors.primary` bg, `ಬಾ` `17pt`/medium/`Colors.onPrimary` inside. Right column: "Kannada Baa" `12pt`/bold + sample body `11pt`/`Colors.tertiary` marginTop `1`. Trailing "now" `10pt`/`Colors.tertiary`. |
| Buttons | Flex **column**, gap `8`. **Allow {x}** `Button variant="primary"`. **Not now** `Button variant="ghost"`. |

**Variants.**

| kind | Title | Body | Preview body | Allow label |
|---|---|---|---|---|
| `notifications` | A gentle nudge each day? | "We'll ping you once a day at the time you set — never to shame you for missing one. Off by default." | "Swalpa Kannada? Five minutes is plenty." | Allow notifications |
| `mic` | Hear how you say it? | "We listen on-device while you speak the answer, then forget the recording. Nothing leaves your phone." | (no preview) | Allow microphone |

**Behavior.**
- `onAllow` triggers the actual system prompt.
- `onDeny` records the denial in `useUserStore` so we don't ask again this session; re-ask at most once per week.

---

### 6.9 `TTSUnavailableDialog` — warning + action `[PROPOSED]`

**Trigger.** Boot-time TTS probe in [_layout.tsx](../../app/_layout.tsx) detects no Kannada voice (`Speech.getAvailableVoicesAsync()` returns no `kn-IN`). Show **once per install** — persist `hasSeenTtsWarning: boolean` in `useUserStore`.

**Props.** `{ onOpenSettings: () => void; onDismiss: () => void; }`

**Anatomy.**

| Element | Token / content |
|---|---|
| Halo | `72 × 72`, radial gradient `Colors.secondaryFixed` → `Colors.surfaceContainerHigh`. `Icons.headphones` 26pt stroke `2`, `Colors.primary`. |
| Title | "Kannada voice not installed" `20pt`/bold, centered. |
| Body | "Your phone doesn't have a Kannada text-to-speech voice yet. We can guide you — it's a one-time download in system settings." `14pt`/`Colors.tertiary`/`lineHeight: 1.5`. |
| Path card | `Colors.surfaceContainerHigh`, radius `Radius.lg`, padding `10`. Body `12pt`/`Colors.tertiary`/`lineHeight: 1.5`. Content: "**Settings → Languages → Text-to-speech →** install Kannada (kn-IN)." Bold spans `Colors.onSurface`. |
| Buttons | Flex row, gap `10`. **Maybe later** `Button variant="ghost"` + **Open settings** `Button variant="primary"` with chevron. Each flex 1. |

**Behavior.** Primary button calls `Linking.openSettings()`. Both buttons set `hasSeenTtsWarning = true`.

---

### 6.10 Toast instances `[PROPOSED]`

Standardized triggers. Add corresponding entries to [copy.ts](../../constants/copy.ts) (under `toast.*` keys) so they're translatable.

| id | kind | Trigger | Title | Subtitle | Action |
|---|---|---|---|---|---|
| `reminder.set` | success | Profile → daily-reminder picker confirm | "Reminder set — {time} daily" | — | — |
| `lesson.savedOffline` | success | Lesson completion while offline | "Saved — we'll sync when you're back online" | — | — |
| `mode.updated` | success | Future feature-flag change | "App style updated" | — | — |
| `signedOut` | success | Successful sign-out | "Signed out. See you soon." | — | — |
| `audio.failed` | error | TTS playback throws | "Couldn't play audio" | "Tap to retry · check sound is on" | onTap = retry |
| `signIn.failed` | error | Supabase auth error | "Couldn't sign you in" | "Check your password and try again" | — |
| `network.offline` | error | Network down during a Supabase call | "You're offline" | "We'll keep your work safe until you're back" | — |
| `permission.notifDenied` | error (soft) | User denied notifications + tried to use a reminder feature | "Notifications are off" | "Tap to open settings" | onTap = `Linking.openSettings()` |

---

## 7. Implementation notes

### 7.1 Suggested file layout

```
components/modals/
  ModalHost.tsx                — root provider; manages mounting + animations
  Backdrop.tsx                 — §3
  Dialog.tsx                   — §4.1 — generic centered shell
  BottomSheet.tsx              — §4.2 — wraps @gorhom/bottom-sheet
  Takeover.tsx                 — §4.3 — generic full-screen shell
  ToastHost.tsx                — §4.4 — root toast provider
  Toast.tsx                    — §4.4 — single toast component
  instances/
    ExitLessonDialog.tsx       — §6.1
    SignOutDialog.tsx          — §6.2
    LessonLockedDialog.tsx     — §6.3
    PhraseDetailSheet.tsx      — §6.4
    SelfRatingSheet.tsx        — §6.5 (gated behind M4)
    StreakMilestoneTakeover.tsx — §6.6
    GoalCompleteDialog.tsx     — §6.7
    PermissionDialog.tsx       — §6.8
    TTSUnavailableDialog.tsx   — §6.9
hooks/
  useModal.ts                  — imperative API on ModalHost
constants/
  shadows.ts                   — NEW; tokens from §5
```

### 7.2 New dependencies

- `@gorhom/bottom-sheet` — bottom sheets (§4.2)
- `expo-blur` — backdrop blur (§3)
- `react-native-svg` — progress ring (§6.7), confetti dots can use plain `<View>` so SVG is optional there
- `react-native-reanimated` — modal enter/exit + confetti drift (already a transitive dep of `@gorhom/bottom-sheet`)

### 7.3 Accessibility floor `[LOCKED]`

Same rules as the rest of the app (per README), plus modal-specifics:

- Every modal traps focus while open. Underlying screen sets `accessibilityElementsHidden={true}` and `importantForAccessibility="no-hide-descendants"`.
- Destructive dialogs: `accessibilityRole="alert"`; destructive button announces "Destructive" in its `accessibilityHint`.
- Info dialogs: `accessibilityViewIsModal={true}`; backdrop is dismissible.
- Bottom sheets: drag handle has `accessibilityLabel="Dismiss sheet"` and `accessibilityRole="adjustable"`.
- Toasts: `accessibilityLiveRegion="polite"` on success, `"assertive"` on error.
- Minimum 44×44 hit area on every modal button. Stacked-button dialogs (§6.2, §6.8) leave `Spacing.sm` between buttons so a stray drag doesn't hit the wrong one.

### 7.4 Animation fallbacks

If a device reports reduced-motion (`AccessibilityInfo.isReduceMotionEnabled()`), drop all enter/exit animations to a 100ms fade. No slide, no scale.

### 7.5 Migration order

Recommend implementing in this order — each step leaves the app launch-able + typecheck-clean.

1. **§5 token additions** (colors, shadows). Tests: tokens importable, no usage yet.
2. **§4 primitives** (Backdrop, Dialog, BottomSheet, Takeover, Toast, Host components) + **§7.1 hooks**. Tests: render each in a dev-only screen.
3. **§6.1 ExitLessonDialog + §6.2 SignOutDialog** — wire into existing `ExitBackButton` confirm flow and Profile screen. Tests: full lesson + sign-out flows.
4. **§6.3 LessonLockedDialog** — wire into Learn screen.
5. **§6.10 Toasts** — wire into existing error paths (Supabase failures, TTS errors). Replace any current inline error UIs.
6. **§6.4 PhraseDetailSheet** — wire into Intake + Home resurfacing chips.
7. **§6.7 GoalCompleteDialog** — wire into progress store crossing.
8. **§6.6 StreakMilestoneTakeover** — wire into lesson-done.
9. **§6.8 PermissionDialog + §6.9 TTSUnavailableDialog** — wire into permission requests and boot probe.
10. **§6.5 SelfRatingSheet** — implement now, but **gate behind M4 feature flag**. Do not surface in production until SRS ships.

---

## 8. Open questions

`[OPEN]`

- **Streak milestones.** §6.6 picks `3, 7, 12, 30, 60, 100, 365`. Confirm or adjust — also: should we celebrate `Day 1` for first-completion? Currently no.
- **Goal-complete repeat behavior.** §6.7 fires once per calendar day. Should "One more" then re-arm it for the next goal multiple (e.g. 20 min)?
- **Lesson-locked dialog vs. silent ignore.** §6.3 always shows when tapping locked. Alternative: silently animate the lock icon. Default: show dialog.
- **Self-rating placement.** §6.5 sits *after intake*. Should it also fire after correct drill answers? After wrong ones?
- **Toast queue.** §4.4 doesn't define what happens if two toasts fire at once. Proposal: stack (top toast pushes down earlier one) for 1 + 1; replace for 1 + 1 of same id.
- **Reduced motion = no animation** (§7.4) — is fade-only enough, or should we drop the backdrop dim too?

---

## 9. Where the design lives

The reference HTML prototype is `Kannada Baa - Design.html` in the design project. The **Modals & overlays** section there renders all 10 instances over realistic parent-screen stubs. Treat it as a visual cross-check — this spec is the source of truth for tokens and behavior.
