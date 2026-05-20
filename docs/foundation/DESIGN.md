---
doc: DESIGN
status: reviewed
owner: samee
last-reviewed: 2026-05-19
related:
  - SCOPE.md
  - INTERACTIONS.md
  - CONTENT.md
---

# Design system

> **Decision layer.** `[LOCKED]` means decided — do not reopen, resolve, or build the opposite; changing it needs an explicit spec PR plus owner sign-off. `[OPEN]` means genuinely undecided — safe to propose, do not implement until closed. A `TODO:` is a real task only if it does not contradict a `[LOCKED]` item; a TODO that contradicts a locked decision is stale text to delete, not a task. Code-vs-spec divergences are tracked in [CONTRADICTIONS.md](CONTRADICTIONS.md).

Spec-leads-code: the tables here are the source of truth. Component code reads from [constants/](../../constants/) and must match this doc.

## Design ethos

`[LOCKED]`

- **Living Manuscript palette** — Karnataka identity (state flag green/gold, Mysore red), Material 3 tonal logic.
- **No-Line rule** — tonal separation over borders. Cards lift via shadow + surface tonal change, not strokes.
- **Warm, never sterile** — sandstone text (`#1b1d0e`, `#464646`), never pure black or grey.
- **One script per font** — Kannada in Noto Serif Kannada, transliteration in Lora italic, everything else DM Sans. Never mix.
- **No raw pixels** — every dimension wraps `moderateScale()` (or `scale()`/`verticalScale()`) from `react-native-size-matters`.

## Color tokens

`[LOCKED]` — matches [colors.ts](../../constants/colors.ts). **Never use a hex literal in a component — always `Colors.X`.**

### Surface stack
| Token | Hex | Use |
|---|---|---|
| `surface` | `#fbfbe2` | Root page background (cream). |
| `surfaceContainerLowest` | `#ffffff` | Glassmorphism only (70% opacity + blur). |
| `surfaceContainerLow` | `#f5f5dc` | Secondary content zones; tab bar. |
| `surfaceContainerHigh` | `#eaead1` | Selection chips, badge containers. |
| `surfaceContainerHighest` | `#e4e4cc` | Interactive cards. |
| `surfaceDim` | `#dbdcc3` | Backdrop for lifted cards; locked state. |

### Primary — Mysore Red
| Token | Hex | Use |
|---|---|---|
| `primary` | `#91001b` | CTA gradient start; active state; focus underline. |
| `primaryContainer` | `#be0027` | CTA gradient end; primary button fill. |
| `onPrimary` | `#ffffff` | Text on primary backgrounds. |

### Secondary — Turmeric Gold
| Token | Hex | Use |
|---|---|---|
| `secondary` | `#785900` | Mandala fill; dark gold text accents. |
| `secondaryContainer` | `#fdc003` | Secondary actions; success / encouragement. |
| `onSecondaryContainer` | `#6c5000` | Text on secondary container. |
| `secondaryFixed` | `#ffdf9e` | Selected chip background; sun-drenched accents. |

### Text — Warm Sandstone
| Token | Hex | Use |
|---|---|---|
| `onSurface` | `#1b1d0e` | Primary text on light surfaces. |
| `tertiary` | `#464646` | Captions, labels, inactive tabs. Never pure grey. |

### Outline
| Token | Hex | Use |
|---|---|---|
| `outlineVariant` | `#e5bdbb` | Subtle felt-shadow lines. **Use at 15 % opacity only.** |

**Why these tones, not Tailwind defaults:** the palette is a deliberate Karnataka identity statement (state flag colors + Mysore red + sandstone). Material 3 tonal logic expresses elevation without strokes (see No-Line rule).

## Spacing

`[LOCKED]` — matches [spacing.ts](../../constants/spacing.ts). All values are pre-wrapped in `moderateScale()`.

| Token | Base | Use |
|---|---|---|
| `xs` | 4 | Icon ↔ text gap; tight inline spacing. |
| `sm` | 8 | Default chip / button internal padding. |
| `md` | 12 | Card content padding. |
| `lg` | 16 | Section padding; screen edge gutters. |
| `xl` | 20 | Between major sections. |
| `xxl` | 24 | Hero spacing. |
| `xxxl` | 32 | Top-of-screen breathing room. |

## Radius

`[LOCKED]` — matches [spacing.ts](../../constants/spacing.ts).

| Token | Base | Use |
|---|---|---|
| `sm` | 8 | Chips; small badges. |
| `md` | 10 | Inputs; small buttons. |
| `lg` | 14 | Standard cards. |
| `xl` | 20 | Hero cards; lifted surfaces. |
| `full` | 999 | Pill buttons; circular avatars. |

## Typography

`[LOCKED]` — families and assignments. Defined in [fonts.ts](../../constants/fonts.ts). Three families, used strictly:

| Family | When |
|---|---|
| `Fonts.dmSans` | All UI chrome — buttons, labels, tabs, body text. |
| `Fonts.lora.italic` | Transliteration **only**. Never UI; never Kannada. |
| `Fonts.notoSerifKannada` | Kannada script **only**. |

**Why this split:** transliterations get a distinctive italic so they're visually parseable as a learning aid, not body copy. Kannada gets a serif to feel rooted, not generic-tech.

### Type scale

`[OPEN]`

> **TODO:** Codify a scale. Sizes are currently picked ad-hoc per component. Proposal:
>
> | Token | Size | Use |
> |---|---|---|
> | `display` | `moderateScale(28)` | Onboarding hero |
> | `title` | `moderateScale(22)` | Screen titles |
> | `headline` | `moderateScale(18)` | Card titles |
> | `body` | `moderateScale(15)` | Body |
> | `label` | `moderateScale(13)` | Captions, tab labels |
> | `kannada-display` | `moderateScale(32)` | Phrase intake hero |

## Icons

`[LOCKED]` — all from `@tabler/icons-react-native` (outline weight). Mapped in [icons.ts](../../constants/icons.ts) — **never import Tabler directly in a component.**

### Rules

`[LOCKED]`

1. **One library** — `@tabler/icons-react-native`, outline weight, pinned in `package.json`. No alternate icon libraries.
2. **Never reach into the library directly from a component.** Every icon flows through the [icons.ts](../../constants/icons.ts) map so swaps stay one-line.
3. **No emoji glyphs in UI.** This covers pictographs (🔥 🎉 😊 📚 🎯), emoticons (😐 😔 😅), and dingbats used as standalone visual elements (✓ ✗). Replace with the corresponding entry from the icon map (e.g. `Icons.streak`, `Icons.ratingEasy`, `Icons.correct`, `Icons.wrong`). Plain typographical arrows inside CTA text (`←`, `→`, `▸`) are allowed as text decoration and are not subject to this rule.
4. **No hand-drawn inline SVGs for iconography.** Illustrations and brand marks are not icons and sit outside this rule.

**Why:** the icon system is the only path through which visual symbols enter the UI. Bypassing it (via emoji or one-off SVG) re-fragments the symbol vocabulary, breaks the size cap below, and makes future swaps a search-and-replace across components instead of a one-line change.

### Sizes
| Where | Size |
|---|---|
| Tab bar | 19 pt |
| Inline / list / chip | 16–21 pt |
| Decorative max | 24 pt |
| Minimum allowed | 11 pt |

The decorative cap applies to icons that replaced ex-emoji hero glyphs (e.g. end-of-game result screens) — they render smaller than the emoji they replaced. That's intentional.

### Icon map
See [icons.ts](../../constants/icons.ts) for the full map. Categories: tab bar, global, practice games, emergency, settings, lesson runner.

## Shadow / elevation

`[OPEN]`

> **TODO:** No shadow tokens exist yet. Shadow values are inlined per component (e.g. `shadowOpacity: 0.6, shadowRadius: 6`). Proposal:
>
> | Token | Shadow config |
> |---|---|
> | `e0` | None |
> | `e1` | `{ color: outlineVariant, opacity: 0.15, radius: 4, offset: { 0, 1 } }` |
> | `e2` | `{ color: outlineVariant, opacity: 0.6, radius: 6, offset: { 0, 2 } }` |
> | `e3` | Hero lift — TBD |

## Components

Anatomy + props + tokens used. Every reusable component lives here.

### `TabBar`

`[LOCKED]` — matches [components/ui/TabBar.tsx](../../components/ui/TabBar.tsx). Custom Expo Router tab bar (replaces default).

| Property | Value |
|---|---|
| Background | `surfaceContainerLow` |
| Active icon color | `primaryContainer` |
| Inactive icon color | `tertiary` |
| Icon size | 19 pt |
| Border | None (No-Line rule) |

### `ProgressDots`

`[LOCKED]` — matches [components/onboarding/ProgressDots.tsx](../../components/onboarding/ProgressDots.tsx). Migration TODOs inside the table are `[OPEN]`.

| Property | Value |
|---|---|
| Current dot | 28 × 8 |
| Other dots | 8 × 8 |
| Gap | `Spacing.sm` |
| Current color | `primaryContainer` |
| Other color | `#E0DDD0` ← **TODO:** move to token |
| Radius | 4 |

### `OptionCard`

`[LOCKED]` — matches [components/onboarding/OptionCard.tsx](../../components/onboarding/OptionCard.tsx). Migration TODOs inside the table are `[OPEN]`.

| Property | Value |
|---|---|
| Radius | 16 ← TODO: align with `Radius.xl` (20) |
| Padding | 18 ← TODO: align with `Spacing.lg` / `xl` |
| Selected bg | `#FFF5F5` ← **TODO:** move to token (e.g. `primaryContainerLow`) |
| Unselected bg | `#FFFFFF` |
| Selected border | `primaryContainer`, 2 pt |
| Unselected border | `#E0DDD0`, 2 pt ← **TODO:** move to token |
| Pressed scale | 0.97 |
| Selection mark | Inline SVG checkmark, white 3 pt stroke |

### Lesson runner components

`[OPEN]`

> **TODO:** spec each. Visual anatomy, tokens used, animation cross-ref to [INTERACTIONS.md](INTERACTIONS.md).
> - `ScenarioPhase`
> - `IntakePhase` + `PhraseDisplay`, `AudioControls`, `SayItControl`, `IntakeFooter`
> - `DrillPhase` + `ListenPickItem`, `TranslatePickItem`, `FillBlankItem`
> - `OutputPhase` + `SpokenResponse`, `TypedResponse`
> - `DoneCard`

### Game components

`[OPEN]`

> **TODO:** spec each game UI as it gets wired.
> - `DictationGame` ([src/games/dictation/](../../src/games/dictation/))
> - `OppositeGame` ([src/games/opposites/](../../src/games/opposites/))

## Open questions / drift

`[OPEN]`

- README and [.claude/CLAUDE.md](../.claude/CLAUDE.md) still mention "NativeWind". NativeWind was ripped out (commit `818e1ba`); we now use inline styles + tokens. Update both.
- `OptionCard` and `ProgressDots` use hex literals — migrate to tokens.
- Type scale not codified — see TODO above.
- Shadow tokens not codified — see TODO above.
