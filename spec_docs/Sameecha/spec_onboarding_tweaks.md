---
doc: SPEC_ONBOARDING_TWEAKS
status: proposed
owner: samee
last-reviewed: 2026-05-21
related:
  - ../../docs/foundation/NAVIGATION.md
  - ../../docs/foundation/STATE.md
  - ../../docs/foundation/DESIGN.md
  - ../../docs/foundation/CONTENT.md
  - ./MODALS.md
---

# Onboarding tweaks

Three additions to the existing 3-step onboarding (goal → motivation → commitment) plus a token/font cohesion pass.

## Scope

In:
- New onboarding step that collects the user's display name and persists it in `useUserStore`.
- Info-icon button on each daily-time choice that opens a centered dialog explaining what that time commitment actually unlocks.
- "Other" motivation option with an inline text input.
- Cohesion pass — fonts, colors, spacing, and radii on the 4 (now 5) onboarding screens conform to [DESIGN.md](../../docs/foundation/DESIGN.md) tokens. Replace hex literals with `Colors.*`. No new visual language.

Out:
- App-wide design audit beyond `/onboarding/*`.
- Editing the name post-onboarding (profile-edit flow stays as-is for now).
- Renaming `motivations` to a structured `{ id, label, isCustom }[]` — kept as `string[]` for compatibility.

## Flow

`[LOCKED]` New flow:

1. `/onboarding/welcome` — unchanged.
2. `/onboarding/name` — **new.** Collects display name.
3. `/onboarding/goal` — unchanged copy; relabel "Step 1 of 3" → "Step 2 of 4" (see below).
4. `/onboarding/motivation` — adds "Other" option; relabel "Step 2 of 3" → "Step 3 of 4".
5. `/onboarding/commitment` — adds info icons; relabel "Step 3 of 3" → "Step 4 of 4".

`ProgressDots total={5}` across all five screens; `current` runs 0..4.

> **Why a new step rather than folding into welcome:** the welcome screen is a hero/brand moment ("ಕನ್ನಡ ಬಾ" + tagline). Cramming a text field into it muddies that. A focused single-field step is also the only point where the user is asked to type anything during onboarding — keeping it isolated reads better.

## Screen 2 — `/onboarding/name`

`[LOCKED]`

| Property | Value |
|---|---|
| Header | "Step 1 of 4" eyebrow |
| Title | "What should we call you?" |
| Subtitle | "We'll use this throughout the app." |
| Input | Single-line `TextInput`, autocapitalize words, autocorrect off, return key "done". |
| Validation | Required, trimmed length 1–30 chars. Continue is disabled until valid. |
| Persistence | On Continue → `useUserStore.setState({ displayName: value.trim() })`. |
| Back | Mirrors goal screen: 2-button Back/Continue row at the bottom. |

The Continue button uses the same locked pattern as the other onboarding screens (`flex: 2` red CTA + `flex: 1` neutral Back, disabled state `#C8C4B0`).

The input field design:
- Background `Colors.surfaceContainerLowest` (`#ffffff`).
- Border 2pt — `#E0DDD0` default, `Colors.primaryContainer` when focused.
- Radius `moderateScale(16)` to match `OptionCard`.
- Padding `moderateScale(18)` to match `OptionCard`.
- Font `Fonts.dmSans.regular`, `moderateScale(16)`, color `Colors.onSurface`.

> **Why not use `OptionCard` directly:** `OptionCard` is `[LOCKED]` as a selectable card with checkmark — a text input is a different primitive.

## Screen 4 — `/onboarding/motivation`

`[LOCKED]` Adds 9th option `"Other"`. Selection still capped at 3.

When `"Other"` is selected, the card expands to show:
- A single-line `TextInput` inline within the same card body.
- Placeholder: "Tell us your reason…"
- Max length: 60 chars.
- The card's `selected` styling stays applied while typing.

Persistence:
- Stored in `motivations: string[]` as the literal user text (trimmed). If the field is empty when Continue is tapped, "Other" is treated as not-selected — i.e. it does not consume one of the 3 slots and is not persisted.
- The selection cap of 3 includes the "Other" entry once filled.

Why inline (not modal): keeps the multi-select feel; the user already sees the other selections in context.

## Screen 5 — `/onboarding/commitment`

`[LOCKED]`

Each of the three time choices (5/10/20) gets a 24×24 round info button placed in the right rail of its `OptionCard` (above the existing selected-checkmark slot — but the two never co-render: the checkmark replaces the info icon when `selected`).

- Icon: `Icons.info` (new map entry, `IconInfoCircle` from Tabler).
- Color: `Colors.tertiary` (muted, matches caption tone).
- Tap area: 44×44 via `hitSlop`.
- `accessibilityLabel`: `"More about {label}"`.

Tap → opens `LearningTimeInfoDialog` (centered dialog) via `useModal()`:

| Time | Title | Body |
|---|---|---|
| 5 min | "5 minutes a day" | "Best for building the habit. About one short lesson or one quick game. Steady wins." |
| 10 min | "10 minutes a day" | "A solid daily rhythm. Finish a lesson and revisit one drill, or chain two short games." |
| 20 min | "20 minutes a day" | "Serious pace. A full lesson plus practice — you'll see noticeable progress week over week." |

`LearningTimeInfoDialog` lives at [components/modals/instances/LearningTimeInfoDialog.tsx](../../components/modals/instances/LearningTimeInfoDialog.tsx). Pattern mirrors `LessonLockedDialog` — `Halo` icon (clock), uppercase eyebrow, title, body, single "Got it" button. Non-destructive, backdrop-tap dismisses.

> **Why dialog over inline expand:** the explanations are short prose, not a row of facts. A dialog keeps the choices side-by-side legible at a glance — the info is on-demand, not eating vertical space. Reuses the locked dialog primitive from [MODALS.md](./MODALS.md) §4.1 instead of inventing a new tooltip.

## State changes — `useUserStore`

`[LOCKED]` Adds one field and one action. AsyncStorage key `user_prefs` unchanged (re-migration not required — new field defaults `null` for users with persisted state from before this change).

| Field | Type | Notes |
|---|---|---|
| `displayName` | `string \| null` | Trimmed name from onboarding. `null` until set. |

Action: `setDisplayName(name: string)`.

`setOnboarding(data)` now also accepts `displayName` and writes it. Existing code paths that don't pass `displayName` are unaffected (it stays whatever it was; for the in-flow case, the name screen already wrote it before commitment runs).

> **Why a separate setter and not just rely on `setOnboarding`:** keeps each screen's commit step write-only-its-own — matches the pattern `goal.tsx` already uses for `setLearningMode`.

## Name rendering across the app

`[LOCKED]`

Sites that read a name today (`app/(tabs)/index.tsx`, `app/(tabs)/profile.tsx`) prefer the onboarding name over Supabase metadata:

```ts
const rawName =
  displayName ||
  user?.user_metadata?.full_name ||
  user?.user_metadata?.name ||
  user?.email?.split('@')[0] ||
  '<fallback>';
```

`formatFirstName` already handles trimming/casing — we keep using it so a name like `"Sameecha Sud"` still becomes `"Sameecha"` on the home greeting and avatar.

## Acceptance criteria

- [x] User can complete onboarding with a name; name persists across app restarts (AsyncStorage `user_prefs`).
- [x] Home greeting `"Namaskāra, {name}"` shows the onboarding name on first launch after onboarding.
- [x] Profile avatar initial + name read from `displayName` when present.
- [x] Tapping the info icon on a time choice opens the centered dialog with the correct copy; tapping outside or "Got it" closes it.
- [x] Tapping the info icon does **not** select the underlying option (the icon's `Pressable` swallows the event).
- [x] Selecting "Other" reveals an inline text field; an empty Other field does not count toward the 3-selection limit and is not persisted.
- [x] `ProgressDots` shows 5 dots; eyebrow labels read "Step N of 4" for screens 2–5.
- [x] All new code uses tokens from `Colors`, `Spacing`, `Fonts`, `Radius` — no hex literals.
- [x] Type-check passes.

## Decisions

`[LOCKED]`

1. Name is captured in onboarding only — no profile edit flow yet.
2. Name is stored client-only for now; we do **not** push it back to Supabase `user_metadata`.
3. The info-dialog uses the centered `Dialog` primitive, not a new tooltip primitive.
4. "Other" is a single inline text input, not a multi-tag input.
5. Welcome stays unchanged (still hero, no progress label).

## Open

`[OPEN]`

- Whether to back-sync `displayName` into Supabase `user_metadata` on first-write. Out of scope here; revisit when we have a profile-edit screen.
- Whether to allow the user to edit their onboarding answers (name, motivations, daily goal) from `/profile`. Existing profile already lets them change `learningMode`; adding name + goal would mirror that, but is out of this spec.
