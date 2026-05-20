---
doc: INTERACTIONS
status: reviewed
owner: samee
last-reviewed: 2026-05-19
related:
  - DESIGN.md
  - CONTENT.md
  - NAVIGATION.md
---

# Interactions

> **Decision layer.** `[LOCKED]` means decided — do not reopen, resolve, or build the opposite; changing it needs an explicit spec PR plus owner sign-off. `[OPEN]` means genuinely undecided — safe to propose, do not implement until closed. A `TODO:` is a real task only if it does not contradict a `[LOCKED]` item; a TODO that contradicts a locked decision is stale text to delete, not a task. Code-vs-spec divergences are tracked in [CONTRADICTIONS.md](CONTRADICTIONS.md).

Owns: animation vocabulary, gestures, haptics, sound cues, and the canonical loading / error / empty / success state designs.

## Animation library

`[OPEN]` — library choice.

Current: **React Native `Animated`** (built-in). `react-native-reanimated` v4 is installed but unused.

> **TODO:** Decide — stay on `Animated` for simplicity, or adopt Reanimated for richer interactions (shared element transitions, gesture-driven scrubbing). Pick before games are built (currently the bulk of interaction work).

## Animation vocabulary

Standard animations used across the app. **If you need a new motion, add it here first.**

### Screen entry — fade + slide-up

`[LOCKED]` — matches all four tab screens.

- Pattern: opacity 0→1 in 220 ms, `translateY` 4→0 in 220 ms, parallel.
- Used in all four tab screens ([home](../../app/%28tabs%29/index.tsx), [learn](../../app/%28tabs%29/learn.tsx), [practice](../../app/%28tabs%29/practice.tsx), [profile](../../app/%28tabs%29/profile.tsx)).
- **Why:** subtle "settle in" cue; doesn't compete with content.

### Phrase advance — fade in

`[LOCKED]`

- Pattern: opacity 0→1 in 240 ms.
- Used in [IntakePhase.tsx](../../components/lesson/IntakePhase.tsx) when phrase index changes.

### Wrong answer — shake

`[LOCKED]`

- Pattern: `translateX` sequence `6 → -6 → 4 → 0`, each step 50 ms (total 200 ms).
- Used in [ListenPickItem.tsx](../../components/lesson/drill/ListenPickItem.tsx).
- **Why:** corporeal "no" — clearer than red flash; doesn't pre-empt the user reading their mistake.

### Pressed state — scale

`[LOCKED]`

- Pattern: `scale: 0.97` on press, returns to `1.0` on release.
- Used in [OptionCard.tsx](../../components/onboarding/OptionCard.tsx).

> **TODO:** Page transitions between routes — currently Expo Router defaults. Onboarding uses `slide_from_right`. Document whether lesson runner uses modal-style up-slide or push.

## Gestures

`[LOCKED]` — current state. Future drill drag is `[OPEN]`.

- Swipe-to-go-back: Expo Router default (iOS).
- No custom `PanGesture` / `TapGesture` (Reanimated / GH) usage.

> **TODO:** Drill UIs may want drag (drag-to-match in opposites, drag-to-arrange in fill-blank). Spec when implemented.

## Haptics

`[OPEN]`

**Not implemented.** `expo-haptics` is not installed.

> **TODO:** Decide whether to ship haptics in MVP. Proposal:
>
> | Moment | Haptic | Why |
> |---|---|---|
> | Correct answer | `selection` (light) | confirms input registered |
> | Wrong answer | `notification.error` (medium) | corporeal "no" pairs with shake |
> | Lesson complete | `notification.success` (heavy) | satisfying capstone |
> | Streak milestone | `notification.success` + custom | celebrate |
> | Button press (CTAs only) | `selection` | tap feedback |

## Sound cues

`[LOCKED]` — current content-audio usage. UI SFX `[OPEN]`.

Current usage is **content audio only** — TTS playback of Kannada phrases via [deviceTtsAudioService.ts](../../services/audio/deviceTtsAudioService.ts). No UI sound effects (correct/wrong dings, button taps, etc.).

| Where | What plays |
|---|---|
| Home — Word of the Day "Listen" | TTS of phrase |
| Lesson intake | Auto-play TTS on phrase mount; "Replay" button |
| Lesson drill (`listen_pick`) | Auto-play TTS on item mount; "Replay" button |
| Emergency phrase | TTS on tap |
| Dictation game | TTS on round start |

> **TODO:** Decide whether to ship UI SFX in MVP.
> Risk: cliché edu-app feel ("ding!"). Reward: warmth, instant feedback. Proposal: skip UI SFX in v1; revisit post-MVP if user research signals it.

## UI states — canonical designs

Every screen renders four possible states. The defaults below are the contract.

### Loading

`[LOCKED]` — current pattern.

- **Default:** disable interactive controls; opacity 0.7; replace primary CTA label with status text ("Please wait...", "Saving...").
- **Used in:** [login.tsx](../../app/%28auth%29/login.tsx) submission flow.
- **TODO:** Spinner inside CTA (per [.claude/CLAUDE.md](../.claude/CLAUDE.md) rules) is mandated but not consistently implemented. Audit.

### Error

`[LOCKED]` — current pattern. Toast/snackbar `[OPEN]`.

- **Default:** `Alert.alert()` for hard errors (auth failure, network).
- **Console-only:** audio playback failures (`console.warn('[audio] ...')`).
- **No toast / snackbar pattern yet.**

> **TODO:** Decide on a non-blocking error pattern (toast / inline) so audio glitches don't silently swallow.

### Empty

`[LOCKED]` — matches current screens.

| Screen | Empty state |
|---|---|
| `/practice/[id]` | Card: "No lessons completed yet." |
| `/(tabs)/learn` | All future lessons rendered locked; "Finish a lesson to unlock the next one." |
| `/(tabs)/practice` | Game cards dimmed (opacity 0.5); banner: "Finish Lesson 1 to load content." |

### Success

`[OPEN]`

> **TODO:** No standardised success state today. `DoneCard` is the current lesson-complete moment but isn't reused.

## Named moments

Catalogued moments — each has its full animation + audio + haptic + copy spec.

### M1: Lesson complete (`DoneCard`)

`[LOCKED]` — copy hook. Visual/audio/haptic `[OPEN]`.

- **Visual:** TODO spec (currently a card with score breakdown).
- **Audio:** none (TODO consider).
- **Haptic:** none (TODO: `notification.success` if haptics ship).
- **Copy:** `useCopy('lessonComplete')`.

### M2: Wrong answer (drill)

`[LOCKED]` — shake animation + copy hook. Haptic `[OPEN]`.

- **Visual:** shake 200 ms ([ListenPickItem.tsx](../../components/lesson/drill/ListenPickItem.tsx)).
- **Audio:** none.
- **Haptic:** none (TODO: `notification.error`).
- **Copy:** `useCopy('wrongAnswer')`.

### M3: Correct answer (drill)

`[OPEN]`

> **TODO:** Spec — currently no special treatment beyond advancing. Should there be a small celebration?

### M4: Streak milestone (1, 3, 7, 30, 100 days)

`[OPEN]`

> **TODO:** Not implemented. Spec when added.

### M5: First lesson unlock

`[OPEN]`

> **TODO:** Not implemented. Spec when added.

### M6: Mode change (rowdy ↔ classic)

> **`[LOCKED: REMOVED]`** — no mode-change moment exists to spec. The two-tone (`classic` / `rowdy`) voice system itself is scheduled for deletion. Do not spec, prototype, or build a tone-shift cue. Cross-ref [CONTENT.md](CONTENT.md#voice-system) and [CONTRADICTIONS.md](CONTRADICTIONS.md) C3.

## Open questions

`[OPEN]`

- Reanimated or `Animated`? (Decision blocks game work.)
- Haptics in MVP — yes or no?
- UI SFX in MVP — yes or no?
- Toast / inline error pattern needed before MVP ships?
