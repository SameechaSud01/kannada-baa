---
doc: SPEC_BEGINNERS_GUIDE
status: proposed
owner: samee
last-reviewed: 2026-06-01
amendments:
  - 2026-06-01 — layout changed from single-scroll to horizontal pager (one section per page) for readability; component list updated; rest of spec (data model, navigation, state, migration, acceptance) unchanged.
related:
  - ../../docs/foundation/NAVIGATION.md
  - ../../docs/foundation/CONTENT.md
  - ../../docs/foundation/STATE.md
  - ../../docs/foundation/DESIGN.md
  - ./spec_lesson_content_source.md
  - ./spec_text_hierarchy.md
  - ./spec_onboarding_tweaks.md
---

# Beginners' Guide to Kannada

A one-screen reference primer covering the Kannada vowel inventory (Varnamaale), retroflex-vs-dental and geminated consonant rules, a consonant chart, and the pronunciation key. Shown once during onboarding as a forced step, persisted server-side as a Lesson 0 row, re-enterable later from the Learn tab.

## Goal

Give a learner a 60-second mental model of "how Kannada sounds map to English" *before* they meet a real phrase in Lesson 1. Today, Lesson 1 (Greetings) drops the learner straight into transliterated phrases like `chennāgiddēne` without context for what `ē`, `ā`, the retroflex vs dental distinction, or the long-vowel macron actually mean. This spec fixes that gap.

This is a **reference surface, not a curriculum lesson**: no drills, no scoring, no streak contribution, no progress percentage. It is consumed once and remains available as a glossary.

## Source artifact

`kannada reference/Kannada Beginners Guide — Vowels & Consonants.pdf` (3 pages — vowels, consonant grid + rules, pronunciation key). Editor uploads the PDF to the same folder as `Kannada Reference — Lessons 1–6.pdf`; this spec is the contract, the PDF is the raw material. Treated like every other reference artifact: `verified: false` until a native speaker audits the rows.

## Decision summary

| Question | Answer | Lock |
|---|---|---|
| Where does it appear in the app flow? | New onboarding step `/onboarding/basics`, inserted between `/onboarding/commitment` and `/(tabs)`. | `[LOCKED]` |
| Forced or skippable? | Forced once during onboarding (no skip). Re-entry is voluntary. Onboarding completes only when the user taps "Continue" at the end of the screen. | `[LOCKED]` |
| Where does the content live? | Lesson 0 row in `public.lessons` (`lesson_no = 0`, `slug = 'basics'`). `content_json` carries a new optional `reference.sections` array. | `[LOCKED]` |
| Does it count toward progress / streak / completion? | No. Lesson 0 is excluded from `completedLessons`, XP, streak, and `user_overall_progress`. The lesson list on `/(tabs)/learn` continues to render slots 1–8 only. | `[LOCKED]` |
| Where does the user re-enter the guide later? | A persistent "Kannada basics" entry card pinned above the lesson list on `/(tabs)/learn`, plus a one-time dismissible toast on first home arrival after onboarding pointing to it. | `[LOCKED]` |
| Text hierarchy on this surface? | **Exception** to [spec_text_hierarchy.md](spec_text_hierarchy.md): on the guide's vowel and consonant cards, **Kannada script is primary** (large, Noto Serif Kannada), transliteration second, English example third. Rationale below. | `[LOCKED]` |

## Foundation-doc amendments required (land in same PR)

This spec cannot ship until these `[LOCKED]` rows are amended:

1. **[NAVIGATION.md](../../docs/foundation/NAVIGATION.md)** — J1 step list goes from 5 → 6 steps; route table adds `/onboarding/basics`.
2. **[CONTENT.md](../../docs/foundation/CONTENT.md)** — adds a "Lesson 0 — Basics (reference primer)" section under Curriculum overview, called out as outside the 8-slot scenario curriculum.
3. **[STATE.md](../../docs/foundation/STATE.md)** — `useUserStore` gains `hasSeenBasicsGuide` and `hasSeenBasicsHomeNudge` flags.
4. **[spec_lesson_content_source.md](spec_lesson_content_source.md)** — adds `sections?: GuideSection[]` as an optional sibling of `words[]` / `phrases[]` inside `content_json.reference`, with a note that it is used only by Lesson 0 today.

A new entry in [CONTRADICTIONS.md](../../docs/foundation/CONTRADICTIONS.md) (C11) tracks the gap between the spec landing and the code shipping.

## Scope

In:
- New onboarding screen `/onboarding/basics`, slotted as step 6 of 6 (`ProgressDots total={6}`, `current = 5`).
- New `/guide` route, identical content, no `ProgressDots`, used for voluntary re-entry from the Learn tab.
- New `<BasicsCard />` pinned above the lesson list on `/(tabs)/learn` (above lesson 1).
- New seed migration adding the Lesson 0 row with `content_json.reference.sections`.
- New `useUserStore.hasSeenBasicsGuide` and `useUserStore.hasSeenBasicsHomeNudge` flags, persisted via the existing `user_prefs` AsyncStorage key.
- One-time dismissible toast on home after first onboarding completion.

Out:
- TTS / audio for individual glyphs. The guide is read-only in v1. (Follow-up spec can wire device TTS for the vowel and consonant items.)
- A drill, quiz, or completion test on the guide.
- Heritage-style long-form articles on Kannada history or script evolution.
- A "guide" tab in the bottom nav.
- Deep links from individual lesson runners to specific guide sections (`/guide#vowels`). Defer to a follow-up.
- A reusable `<VocabStack />` extracted across the app. Other surfaces stay transliteration-first per [spec_text_hierarchy.md](spec_text_hierarchy.md); this is a one-surface exception.

## Content shape

`[LOCKED]` — section IDs and titles. Item content sourced from the PDF and seeded by migration.

Four sections, ordered:

| Order | Slug | Title | Subtitle | Item type |
|---|---|---|---|---|
| 1 | `vowels` | Vowels (ಸ್ವರಗಳು) | "Kannada has 13 vowels. Long vowels use a macron — `ā`, `ē`, `ī`, `ō`, `ū`." | `GlyphItem` |
| 2 | `consonant-rules` | Sounding consonants | "Three patterns to watch for: retroflex, dental, and doubled letters." | `RuleItem` |
| 3 | `consonants` | Consonant chart (ವ್ಯಂಜನಗಳು) | "The 34 consonants grouped by where they're produced in the mouth." | `GlyphItem` |
| 4 | `pronunciation-key` | Reading transliteration | "Symbols you'll see across the app." | `KeyItem` |

### Section 1 — Vowels (`vowels`)

13 `GlyphItem`s in PDF order:

| # | kannada | transliteration | example |
|---|---|---|---|
| 1 | ಅ | a | "as in *America*" |
| 2 | ಆ | ā | "as in *art*" |
| 3 | ಇ | i | "as in *igloo*" |
| 4 | ಈ | ī | "as in *seed*" |
| 5 | ಉ | u | "as in *push*" |
| 6 | ಊ | ū | "as in *moon*" |
| 7 | ಋ | ṛ | "as in *rupees*" |
| 8 | ಎ | e | "as in *cake*" |
| 9 | ಏ | ē | "as in *crane*" |
| 10 | ಐ | ai | "as in *ice*" |
| 11 | ಒ | o | "as in *opener*" |
| 12 | ಓ | ō | "as in *go*" |
| 13 | ಔ | au | "as in *owl*" |

### Section 2 — Sounding consonants (`consonant-rules`)

3 `RuleItem`s. Each has a `kind`, a one-line `rule`, and 2–4 `example` rows with `{transliteration, english}` pairs (no Kannada glyph — the rule is about how the romanisation maps to a sound).

| kind | rule | examples |
|---|---|---|
| `retroflex` | "Capital letters mean retroflex — tongue curls up and back, touching the ridge behind the teeth. Hollow, fuller sound." | `Ta` → "Top", `Da` → "Dark", `Na` → "Pranam", `La` → "haLLi" |
| `dental` | "Lowercase letters mean dental — tongue tip touches the back of the upper front teeth. Flat, soft, far forward." | `ta` → "Bharath", `da` → "the", `na` → "narrator", `la` → "large" |
| `geminated` | "Doubled letters are held slightly longer than a single one." | `appa` → "father", `amma` → "mother" |

### Section 3 — Consonant chart (`consonants`)

34 `GlyphItem`s in PDF grid order. Split into two visual groups in the migration but rendered as one ordered list. See [§Migration](#migration) for the full row list.

### Section 4 — Reading transliteration (`pronunciation-key`)

8 `KeyItem`s — each is a `{symbol, example}` pair, no Kannada glyph.

| symbol | example |
|---|---|
| `Ta` | "Top" |
| `ta` | "Bharath" |
| `Da` | "Dark" |
| `da` | "the" |
| `Na` | "Pranam" |
| `na` | "narrator" |
| `La` | "haLLi" |
| `la` | "large" |

## Data model

### `content_json.reference.sections` schema

`[LOCKED]` — extends [spec_lesson_content_source.md](spec_lesson_content_source.md). Optional field, used by Lesson 0 today; other lessons leave it absent.

```ts
type GuideSection = {
  slug: 'vowels' | 'consonant-rules' | 'consonants' | 'pronunciation-key';
  title: string;
  subtitle: string;
  order: number;                 // 1-indexed
  items: GuideItem[];
};

type GuideItem = GlyphItem | RuleItem | KeyItem;

type GlyphItem = {
  kind: 'glyph';
  kannada: string;
  transliteration: string;
  example: string;               // "as in America" — already includes 'as in' prefix
};

type RuleItem = {
  kind: 'rule';
  ruleKind: 'retroflex' | 'dental' | 'geminated';
  title: string;                 // e.g. 'Retroflex (capital letters)'
  description: string;           // the one-line rule
  examples: Array<{ transliteration: string; english: string }>;
};

type KeyItem = {
  kind: 'key';
  symbol: string;
  example: string;
};
```

### Lesson 0 row

`[LOCKED]`

```jsonc
{
  "lesson_no": 0,
  "title": "Kannada basics",
  "slug": "basics",
  "situation": null,                      // not a scenario lesson
  "real_world_prompt": null,
  "audio_url": null,
  "content_json": {
    "reference": {
      "source": "kannada-beginners-guide.pdf",
      "verified": false,
      "words": [],
      "phrases": [],
      "sections": [ /* see §Migration */ ]
    }
  }
}
```

**Why `words` / `phrases` are empty arrays, not omitted:** keeps [spec_lesson_content_source.md](spec_lesson_content_source.md) rule 3 ("Empty references are represented as `{}`, not as a `reference` with empty arrays") *not violated* — because this reference is not empty: it carries `sections`. The empty `words[]` and `phrases[]` exist for shape consistency so a future audit script can still iterate them without a key-existence check.

> **Tradeoff acknowledged:** rule 3 was written before `sections` existed. Strict reading says "either reference is `{}` or it has words/phrases." We're picking a third path: reference can also carry `sections` instead. The spec_lesson_content_source.md amendment makes this explicit.

### TypeScript canonical layer

`[LOCKED]` — mirrors the lesson 1–8 pattern. The guide content has both a runtime canonical TS file *and* a DB snapshot:

| Artifact | Source of truth for | Read by |
|---|---|---|
| `constants/guide.ts` | The rendered guide | App runtime — the `/onboarding/basics` and `/guide` screens import directly |
| `public.lessons` row, `slug = 'basics'`, `content_json.reference` | The reference vocab from the PDF | Nobody at runtime today — humans only |

Same as lessons: the two are not synced. The TS file is the curriculum decision (what to render, in what order, with what subtitles); the DB row is the raw material. Drift is allowed by design.

## Navigation

### J1 (first-time sign-up) — amended flow

`[LOCKED]` — amends [NAVIGATION.md J1](../../docs/foundation/NAVIGATION.md#j1-first-time-sign-up).

1. App launch → `AppGate` → no session → `/(auth)/login`
2. User signs up → not onboarded → `/onboarding/welcome`
3. Welcome → Name → Goal → Motivation → Commitment → **Basics** → `setOnboarding()` → `/(tabs)`

`ProgressDots total={6}` across screens 2–6; `current` runs 0..5.

`setOnboarding()` now sets both `hasCompletedOnboarding: true` and `hasSeenBasicsGuide: true` (Continue on Basics is the trigger). `hasSeenBasicsHomeNudge` stays `false` so the home toast fires once.

### Route table — amended row

`[LOCKED]` — amends [NAVIGATION.md route table](../../docs/foundation/NAVIGATION.md#route-table).

| Path | File | Group layout | Header | Notes |
|---|---|---|---|---|
| `/onboarding/basics` | `app/onboarding/basics.tsx` | Stack, `slide_from_right`, `headerShown: false` | none | Beginners' Guide (step 5/5, Step 6 of 6) |
| `/guide` | `app/guide.tsx` | root stack, screen-owned back chip | Screen-owned back chip + title | Voluntary re-entry from Learn tab. Identical content; no `ProgressDots`. |

### Back behavior

`[LOCKED]` — amends [NAVIGATION.md back-behavior table](../../docs/foundation/NAVIGATION.md#back-behavior).

| Flow | Back affordance | Behavior on tap |
|---|---|---|
| `/onboarding/basics` | inline Back/Continue pair (matches other onboarding screens) | `router.back()` to `/onboarding/commitment`. No confirm — selections are already committed. |
| `/guide` | screen-owned back chip | Plain `router.back()`. |

## Screen — `/onboarding/basics` and `/guide`

`[LOCKED]` — same component, two route entry points.

| Property | Value |
|---|---|
| Layout | **Horizontal pager — one section per page.** Each section is a full-width page rendered inside a horizontal `ScrollView` with `pagingEnabled` and `snapToInterval`. Each page is itself a vertical `ScrollView` so long sections (vowels: 13 items; consonants: 34 items) still scroll within their own page. No global vertical scroll across sections. |
| Header (onboarding only) | "Step 5 of 5" eyebrow (per ProgressDots total=6, but the spoken "Step N of 5" label excludes welcome — matching the existing eyebrow rule from [spec_onboarding_tweaks.md](spec_onboarding_tweaks.md)). |
| Title (onboarding only, page 1) | "Before you start" |
| Subtitle (onboarding only, page 1) | "A quick guide to how Kannada sounds. You can revisit this anytime from the Learn tab." |
| Sections | One section per pager page, in `order`. Each page renders the section's title + subtitle + items inline (no `<GuideSection />` outer wrapper — the page IS the section). |
| Item rendering | `<GlyphCard />` for `glyph`, `<RuleCard />` for `rule`, `<KeyRow />` for `key`. See [§Components](#components). |
| Page-dot indicator | Below the pager, above the CTA. Four dots, the active dot is `Colors.primary` and 1.5× width; inactive dots are `Colors.surfaceContainerHighest`. Decorative only — not tappable (gesture-only navigation, matches "Swipe to continue" affordance). |
| Sticky CTA (onboarding only) | Two-state button: "Next" on pages 1–3 (advances pager one page), "Continue" on page 4. Always enabled (`hasReachedLastPage` is tracked but does not gate — see below). On last page, tap → `setOnboarding({ ..., hasSeenBasicsGuide: true })` → router replaces to `/(tabs)`. |
| Last-page gating (onboarding only) | The "Continue" label and the onboarding-complete behavior only appear after the user has reached page 4 at least once. Before that, the button reads "Next" and advances the pager. Returning to an earlier page after reaching the last keeps the button as "Continue" (the user has seen everything; they can finish whenever). |
| Sticky CTA (`/guide` re-entry) | Hidden. Back chip handles exit. The user can swipe freely across pages with no completion requirement. |
| Back chip (`/guide` only) | 40×40 `ExitBackButton` per [NAVIGATION.md back-behavior](../../docs/foundation/NAVIGATION.md#back-behavior). |

### Components

`[LOCKED]` — all live under `components/guide/` (one component per file). All consume tokens from [constants/colors.ts](../../constants/colors.ts), [constants/spacing.ts](../../constants/spacing.ts), [constants/fonts.ts](../../constants/fonts.ts).

| Component | Renders | Hierarchy |
|---|---|---|
| `<GuidePager onPageChange?  width />` | The horizontal `ScrollView` with `pagingEnabled` that hosts one `<GuidePage />` per section. Owns the active-page index and reports it via `onPageChange`. Exposes an imperative `goToPage(idx)` via ref for the parent's "Next" button. | n/a |
| `<GuidePage section width />` | A single full-page render: title (large), subtitle (small), then the items list inside a vertical `ScrollView` (handles tall sections). One per section in the pager. | n/a |
| `<GuideDots total current />` | Page-position indicator. `total` dots; the `current` dot is wider (1.5×) and uses `Colors.primary`; inactive dots use `Colors.surfaceContainerHighest`. | n/a |
| `<GlyphCard kannada transliteration example />` | A row: **Kannada glyph (primary, large)** / transliteration (secondary, medium italic) / example (tertiary, small). | **Kannada-first exception.** See §Text-hierarchy exception below. |
| `<RuleCard title description examples />` | Rule heading, description paragraph, then a small table of `transliteration → english` example rows. No Kannada glyphs (the rule is about romanisation). | n/a — rule is prose, not a vocab item. |
| `<KeyRow symbol example />` | A single-line row: monospace `symbol` left, en-dash, `example` right. | n/a — symbol is romanisation, not Kannada script. |

> **The previous `<GuideSection />` and `<GuideContent />` components are removed** — pages now own their own header. `<GuidePage />` replaces both. `<GlyphCard />`, `<RuleCard />`, `<KeyRow />` are unchanged.

### Text-hierarchy exception

`[LOCKED]` — narrowly scoped.

[spec_text_hierarchy.md](spec_text_hierarchy.md) locks **transliteration as primary** for every Kannada vocabulary surface. The Beginners' Guide intentionally inverts this for `<GlyphCard />` only:

```
┌─────────────────────────────────────┐
│                                     │
│           ಆ                          │  ← Kannada, ~64pt, Noto Serif Kannada, Colors.onSurface
│                                     │
│             ā                        │  ← transliteration, ~24pt, Lora italic, Colors.onSurfaceVariant
│        as in art                    │  ← example, ~14pt, DM Sans, Colors.tertiary
│                                     │
└─────────────────────────────────────┘
```

**Why this is consistent with the rule's intent, not a violation:**

The locked rule exists because the *learner cannot read Kannada script yet* — putting it first makes the script the cognitive load and slows recall. That's true for *vocabulary surfaces*, where the learner is trying to remember a word's meaning or pronunciation from the script alone.

The Beginners' Guide is a different surface: the user is *learning to recognise* the script itself. The Kannada glyph IS the subject of the row, not a reference label next to a more important romanisation. Inverting the hierarchy here is the only honest rendering — putting transliteration first would tell the learner "memorise the romanised name `ā`, and here's a small reference glyph next to it," which is the opposite of what this screen is for.

**Scope of the exception:** the `<GlyphCard />` component only. `<RuleCard />` and `<KeyRow />` don't render Kannada script at all, so the rule does not apply. Every other surface in the app remains under the locked transliteration-first hierarchy.

This exception is documented at the rule itself: [spec_text_hierarchy.md §4 Out of scope](spec_text_hierarchy.md#4-out-of-scope-intentionally-unchanged) gets a new bullet pointing here.

### Re-entry — Learn tab card

`[LOCKED]`

A `<BasicsCard />` pinned above the lesson list on [app/(tabs)/learn.tsx](../../app/%28tabs%29/learn.tsx), above lesson 1's pill. Visual:

```
┌──────────────────────────────────────────────────┐
│  📖   Kannada basics                              │
│       Vowels, consonants, how to read it          │
└──────────────────────────────────────────────────┘
```

- Card uses `Colors.surfaceContainerLow`, no border (No-Line rule), `Radius.lg`.
- Icon: `Icons.book` (new map entry, `IconBook2` from Tabler).
- Title font `Fonts.dmSans.semibold`, size `moderateScale(16)`, `Colors.onSurface`.
- Subtitle font `Fonts.dmSans.regular`, size `moderateScale(13)`, `Colors.tertiary`.
- Tap target full-row, min height `moderateScale(64)`.
- Tap → `router.push('/guide')`.

### Re-entry — first home toast

`[LOCKED]`

On first arrival at `/(tabs)/` after onboarding completion (`hasSeenBasicsGuide === true && hasSeenBasicsHomeNudge === false`), fire a one-time toast via `ToastHost`:

> Tap "Kannada basics" on the Learn tab anytime to revisit the primer.

On dismiss (or auto-dismiss after 5s), set `hasSeenBasicsHomeNudge = true`. Never fires again, even across reinstalls (the flag is persisted in `user_prefs`).

## State changes — `useUserStore`

`[LOCKED]` — adds two fields and updates `setOnboarding`. AsyncStorage key `user_prefs` unchanged; both fields default `false` for users with persisted state from before this change.

| Field | Type | Notes |
|---|---|---|
| `hasSeenBasicsGuide` | `boolean` | True once the user reaches the end of `/onboarding/basics` and taps Continue, **or** sets it true if they open `/guide` voluntarily later. Default `false`. |
| `hasSeenBasicsHomeNudge` | `boolean` | True after the one-time home toast dismisses. Default `false`. Install-scoped (kept by `resetForUser`). |

Actions:
- `setHasSeenBasicsGuide(seen: boolean)` — new.
- `setHasSeenBasicsHomeNudge(seen: boolean)` — new.
- `setOnboarding(data)` extended: also writes `hasSeenBasicsGuide: true`.

`resetForUser(userId)`: keep `hasSeenBasicsHomeNudge` (install-scoped, like `hasSeenTtsWarning`); clear `hasSeenBasicsGuide` (per-user — a new sign-up on the same install should see the guide).

## Migration

`[LOCKED]` — file path and idempotency pattern.

New migration: `services/api/migrations/2026-06-XX_lesson_0_basics_seed.sql`.

Pattern mirrors [2026-05-20_lessons_content.sql](../../services/api/migrations/2026-05-20_lessons_content.sql) — idempotent UPSERT keyed by slug. Two statements:

```sql
-- 1. Insert the row if it doesn't exist; do nothing if it does (slug is unique).
insert into public.lessons (lesson_no, title, slug, situation, real_world_prompt, content_json, audio_url)
values (0, 'Kannada basics', 'basics', null, null, '{}'::jsonb, null)
on conflict (slug) do nothing;

-- 2. Overwrite content_json idempotently — the spec leads, the migration follows.
update public.lessons
set content_json = $json$
{
  "reference": {
    "source": "kannada-beginners-guide.pdf",
    "verified": false,
    "words": [],
    "phrases": [],
    "sections": [
      {
        "slug": "vowels", "order": 1,
        "title": "Vowels (ಸ್ವರಗಳು)",
        "subtitle": "Kannada has 13 vowels. Long vowels use a macron — ā, ē, ī, ō, ū.",
        "items": [
          {"kind":"glyph","kannada":"ಅ","transliteration":"a","example":"as in America"},
          {"kind":"glyph","kannada":"ಆ","transliteration":"ā","example":"as in art"},
          {"kind":"glyph","kannada":"ಇ","transliteration":"i","example":"as in igloo"},
          {"kind":"glyph","kannada":"ಈ","transliteration":"ī","example":"as in seed"},
          {"kind":"glyph","kannada":"ಉ","transliteration":"u","example":"as in push"},
          {"kind":"glyph","kannada":"ಊ","transliteration":"ū","example":"as in moon"},
          {"kind":"glyph","kannada":"ಋ","transliteration":"ṛ","example":"as in rupees"},
          {"kind":"glyph","kannada":"ಎ","transliteration":"e","example":"as in cake"},
          {"kind":"glyph","kannada":"ಏ","transliteration":"ē","example":"as in crane"},
          {"kind":"glyph","kannada":"ಐ","transliteration":"ai","example":"as in ice"},
          {"kind":"glyph","kannada":"ಒ","transliteration":"o","example":"as in opener"},
          {"kind":"glyph","kannada":"ಓ","transliteration":"ō","example":"as in go"},
          {"kind":"glyph","kannada":"ಔ","transliteration":"au","example":"as in owl"}
        ]
      },
      {
        "slug": "consonant-rules", "order": 2,
        "title": "Sounding consonants",
        "subtitle": "Three patterns to watch for: retroflex, dental, and doubled letters.",
        "items": [
          {
            "kind":"rule","ruleKind":"retroflex",
            "title":"Retroflex (capital letters)",
            "description":"Tongue curls up and back, touching the ridge behind the teeth. Hollow, fuller sound.",
            "examples":[
              {"transliteration":"Ta","english":"as in Top"},
              {"transliteration":"Da","english":"as in Dark"},
              {"transliteration":"Na","english":"as in Pranam"},
              {"transliteration":"La","english":"as in haLLi"}
            ]
          },
          {
            "kind":"rule","ruleKind":"dental",
            "title":"Dental (lowercase letters)",
            "description":"Tongue tip touches the back of the upper front teeth. Flat, soft, far forward.",
            "examples":[
              {"transliteration":"ta","english":"as in Bharath"},
              {"transliteration":"da","english":"as in the"},
              {"transliteration":"na","english":"as in narrator"},
              {"transliteration":"la","english":"as in large"}
            ]
          },
          {
            "kind":"rule","ruleKind":"geminated",
            "title":"Doubled letters",
            "description":"The consonant is held slightly longer than a single one.",
            "examples":[
              {"transliteration":"appa","english":"father"},
              {"transliteration":"amma","english":"mother"}
            ]
          }
        ]
      },
      {
        "slug": "consonants", "order": 3,
        "title": "Consonant chart (ವ್ಯಂಜನಗಳು)",
        "subtitle": "The 34 consonants grouped by where they're produced in the mouth.",
        "items": [
          {"kind":"glyph","kannada":"ಕ","transliteration":"ka","example":"as in cup"},
          {"kind":"glyph","kannada":"ಖ","transliteration":"kha","example":"as in khadi"},
          {"kind":"glyph","kannada":"ಗ","transliteration":"ga","example":"as in gun"},
          {"kind":"glyph","kannada":"ಘ","transliteration":"gha","example":"as in ghat"},
          {"kind":"glyph","kannada":"ಙ","transliteration":"gna","example":"as in gnome"},
          {"kind":"glyph","kannada":"ಚ","transliteration":"cha","example":"as in chair"},
          {"kind":"glyph","kannada":"ಛ","transliteration":"chha","example":"as in church"},
          {"kind":"glyph","kannada":"ಜ","transliteration":"ja","example":"as in jug"},
          {"kind":"glyph","kannada":"ಝ","transliteration":"jha","example":"as in badge"},
          {"kind":"glyph","kannada":"ಞ","transliteration":"nja","example":"rare in English"},
          {"kind":"glyph","kannada":"ಟ","transliteration":"Ta","example":"as in Top"},
          {"kind":"glyph","kannada":"ಠ","transliteration":"Tha","example":"as in Cut"},
          {"kind":"glyph","kannada":"ಡ","transliteration":"Da","example":"as in Dark"},
          {"kind":"glyph","kannada":"ಢ","transliteration":"Ddha","example":"as in Board"},
          {"kind":"glyph","kannada":"ಣ","transliteration":"Nha","example":"rare in English"},
          {"kind":"glyph","kannada":"ತ","transliteration":"ta","example":"as in Bharath"},
          {"kind":"glyph","kannada":"ಥ","transliteration":"tha","example":"as in thumb"},
          {"kind":"glyph","kannada":"ದ","transliteration":"da","example":"as in the"},
          {"kind":"glyph","kannada":"ಧ","transliteration":"dha","example":"as in dhal"},
          {"kind":"glyph","kannada":"ನ","transliteration":"na","example":"as in can"},
          {"kind":"glyph","kannada":"ಪ","transliteration":"pa","example":"as in papaya"},
          {"kind":"glyph","kannada":"ಫ","transliteration":"pha","example":"as in orphan"},
          {"kind":"glyph","kannada":"ಬ","transliteration":"ba","example":"as in balloon"},
          {"kind":"glyph","kannada":"ಭ","transliteration":"bha","example":"as in Bharath"},
          {"kind":"glyph","kannada":"ಮ","transliteration":"ma","example":"as in man"},
          {"kind":"glyph","kannada":"ಯ","transliteration":"ya","example":"as in yak"},
          {"kind":"glyph","kannada":"ರ","transliteration":"ra","example":"as in rat"},
          {"kind":"glyph","kannada":"ಲ","transliteration":"la","example":"as in lamp"},
          {"kind":"glyph","kannada":"ವ","transliteration":"va","example":"as in water"},
          {"kind":"glyph","kannada":"ಶ","transliteration":"sha","example":"as in ash"},
          {"kind":"glyph","kannada":"ಷ","transliteration":"sshha","example":"as in shut"},
          {"kind":"glyph","kannada":"ಸ","transliteration":"sa","example":"as in sun"},
          {"kind":"glyph","kannada":"ಹ","transliteration":"ha","example":"as in hump"},
          {"kind":"glyph","kannada":"ಳ","transliteration":"lla","example":"as in Clitella"}
        ]
      },
      {
        "slug": "pronunciation-key", "order": 4,
        "title": "Reading transliteration",
        "subtitle": "Symbols you'll see across the app.",
        "items": [
          {"kind":"key","symbol":"Ta","example":"Top"},
          {"kind":"key","symbol":"ta","example":"Bharath"},
          {"kind":"key","symbol":"Da","example":"Dark"},
          {"kind":"key","symbol":"da","example":"the"},
          {"kind":"key","symbol":"Na","example":"Pranam"},
          {"kind":"key","symbol":"na","example":"narrator"},
          {"kind":"key","symbol":"La","example":"haLLi"},
          {"kind":"key","symbol":"la","example":"large"}
        ]
      }
    ]
  }
}
$json$::jsonb
where slug = 'basics';
```

Re-running the migration is safe: `insert ... on conflict do nothing` skips when the row exists; the `update ... where slug = 'basics'` overwrites in place. The pattern is identical to the existing lesson 1–6 migration.

> **Why not bundle into the existing `2026-05-20_lessons_content.sql`:** that file is dated and named for lessons 1–6. Editing it after the fact would muddy the commit-history-as-version-log convention from [spec_lesson_content_source.md](spec_lesson_content_source.md). A new file is more honest.

## Exclusion from progress / completion

`[LOCKED]` — none of these touch Lesson 0.

| Surface | Behavior |
|---|---|
| `useProgressStore.completedLessons` | Never receives `'basics'` (the guide screen does not call `useCompleteLessonMutation`). |
| `useProgressStore.xp` / `streak` / `totalPhrasesLearned` | Unchanged by the guide. |
| `user_lesson_progress` table | No row inserted for `lesson_id` of the basics row. The `record_lesson_completion` RPC is never called with the basics lesson id. |
| `user_overall_progress` (% complete) | The `recompute_overall_progress` trigger function counts lessons via `where lesson_no between 1 and 8`. Adding `lesson_no = 0` outside that range is invisible to the formula. **Verify** the existing query before merging — if it's `where lesson_no > 0` or `where slug != 'basics'`, no change needed. If it's an unbounded `count(*)`, the trigger function needs a `where lesson_no > 0` filter added. |
| `/(tabs)/learn` lesson list | Renders slots 1–8 only (`PLANNED_LESSON_SLOTS` already excludes 0). The basics card is rendered separately above the list. |

> **TODO during implementation:** read [services/api/migrations/2026-05-27_db_wiring_games_and_overall.sql](../../services/api/migrations/2026-05-27_db_wiring_games_and_overall.sql) and confirm the lesson-count predicate in `recompute_overall_progress`. If it counts all `lessons` rows, add a `where lesson_no > 0` filter in the same PR as this spec.

## Acceptance criteria

- [ ] [docs/foundation/NAVIGATION.md](../../docs/foundation/NAVIGATION.md) J1 step list and route table reflect the 6-step flow and the `/onboarding/basics` + `/guide` routes.
- [ ] [docs/foundation/CONTENT.md](../../docs/foundation/CONTENT.md) curriculum overview acknowledges Lesson 0 as a reference primer outside the 8-slot scenario curriculum.
- [ ] [docs/foundation/STATE.md](../../docs/foundation/STATE.md) `useUserStore` table lists `hasSeenBasicsGuide` and `hasSeenBasicsHomeNudge` with the right reset semantics.
- [ ] [spec_lesson_content_source.md](spec_lesson_content_source.md) acknowledges the optional `sections?: GuideSection[]` field inside `content_json.reference`.
- [ ] [docs/foundation/CONTRADICTIONS.md](../../docs/foundation/CONTRADICTIONS.md) has an active entry (C11) tracking the spec-vs-code gap until shipped.
- [ ] Migration `2026-06-XX_lesson_0_basics_seed.sql` inserts the row and populates `content_json` per the schema above. Verify by `select content_json -> 'reference' -> 'sections' from public.lessons where slug = 'basics'`.
- [ ] `recompute_overall_progress` predicate verified to exclude `lesson_no = 0` (or amended in this PR).
- [ ] First-time sign-up flow visits `/onboarding/basics` between commitment and home; verified end-to-end on iPhone SE (375×667) and iPhone 15 Pro Max.
- [ ] Tap-through Continue on basics → home → toast fires once → revisit Learn tab → "Kannada basics" card visible → tap → `/guide` opens.
- [ ] Second app launch: no toast, no forced revisit; basics card still on Learn tab.
- [ ] All new components use tokens from `Colors`, `Spacing`, `Fonts`, `Radius` — no hex literals, no raw pixels.
- [ ] Type-check passes; existing tests pass; no new test required for the static guide screen but the new `useUserStore` setters get unit tests if any consumer reads them.

## Decisions

`[LOCKED]`

1. Placement is a forced onboarding step (not a modal, not a lesson, not an optional card).
2. DB shape is a Lesson 0 row with `content_json.reference.sections` — reuses the existing table.
3. Text hierarchy on `<GlyphCard />` inverts to Kannada-first. Documented exception, not a general rule change.
4. Lesson 0 is excluded from progress, streak, XP, and the overall % computation.
5. Re-entry surfaces are the persistent Learn-tab card and the one-time home toast — no global "?" button, no profile-screen entry.
6. No audio in v1. Reading-only.
7. The TS file at `constants/guide.ts` is canonical for the rendered screen; the DB row is a reference snapshot. Same drift-allowed contract as the lessons.

## Open

`[OPEN]`

- **Audio (v2):** wire device TTS on each `<GlyphCard />` tap to speak the Kannada character. Would also need a play button on `<RuleCard />` examples. Defer until lesson-level audio polish lands.
- **Per-lesson deep links into the guide:** e.g. a "What does the macron mean?" info icon next to a long vowel in Lesson 1 that opens `/guide#vowels`. Out of v1 — re-entry via the Learn tab is sufficient.
- **Long-vowel macron callout copy:** the subtitle on the vowels section says "Long vowels use a macron — ā, ē, ī, ō, ū." Confirm with a native speaker that this captures the distinction usefully for an English-speaking learner. `verified: false` until audited.
- **Verification of the consonant grid:** several rows on page 2 of the PDF have minor ambiguities — `ddha` for ಢ (is it `Dha` or `Ddha`?), `Nha` for ಣ (vs `Na`), `sshha` for ಷ (vs `ṣha`). Held against `verified: false`; native-speaker audit closes them in a follow-up commit, not a re-spec.
- **Should Lesson 0 visually surface anywhere in the profile screen?** Possibly under "Resources." Out of v1.

## Reference

- [docs/foundation/CONTENT.md](../../docs/foundation/CONTENT.md) — curriculum overview gains a Lesson 0 row.
- [docs/foundation/NAVIGATION.md](../../docs/foundation/NAVIGATION.md) — J1 + route table amendments.
- [docs/foundation/STATE.md](../../docs/foundation/STATE.md) — `useUserStore` flag additions.
- [docs/foundation/CONTRADICTIONS.md](../../docs/foundation/CONTRADICTIONS.md) — C11 tracks spec-vs-code gap.
- [spec_lesson_content_source.md](spec_lesson_content_source.md) — `content_json.reference.sections` addendum.
- [spec_text_hierarchy.md](spec_text_hierarchy.md) — out-of-scope bullet pointing to the Kannada-first exception here.
- [spec_onboarding_tweaks.md](spec_onboarding_tweaks.md) — the 4→5 step precedent for amending the locked onboarding flow.
- `kannada reference/Kannada Beginners Guide — Vowels & Consonants.pdf` — raw artifact for this spec.
