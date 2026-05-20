# Claude Code Spec — Lesson 2: Names (Kannada Baa)

## Goal
Author the playable `Lesson` for slot 2 ("Names") per the locked
syllabus in [CONTENT.md §Lesson slots](../../docs/foundation/CONTENT.md).
After completing this lesson the learner can produce the name-exchange
pair: ask "what is your name?" and answer "my name is …".

## Slot

`[LOCKED]` — from [plannedLessons.ts](../../constants/lessons/plannedLessons.ts):

| Field | Value |
|---|---|
| `slot` | 2 |
| `title` | Names |
| `subtitle` | I, you, my name is |
| `charPlaceholder` | ಹ |
| `slug` (DB) | `names` |
| `id` (TS) | `names` |

## Reference vocab

From [Kannada Reference — Lessons 1–6.pdf](../../kannada%20reference/Kannada%20Reference%20—%20Lessons%201–6.pdf)
Lesson 2 + the general-phrases table on the final page (`ನನ್ನ ಹೆಸರು…`).
Mirrored in `public.lessons.content_json` for slug `names` per
[spec_lesson_content_source.md](spec_lesson_content_source.md). This
spec selects a subset; the full reference stays in the DB.

## Lesson body

`[LOCKED]` — content choices below conform to the `Lesson` schema and
the authoring rules in
[CONTENT.md §Authoring rules](../../docs/foundation/CONTENT.md#authoring-rules-spec-leads-code--content-must-conform).

### Situation
- **title:** Asking someone's name
- **setup:** "You're at a Kannadiga friend's place. A relative walks in
  and looks at you. Time to introduce yourself properly."
- **imageKey:** `scene/name-introduction`
- **realWorldPrompt:** "Try this the next time you meet someone new in
  Bengaluru."

### Intake (3 phrases — within the 2–4 STRICT MAX)

| `id` | `kannada` | `transliteration` | `english` | `vocabAtoms` |
|---|---|---|---|---|
| `phrase.nimma-hesaru-enu` | ನಿಮ್ಮ ಹೆಸರು ಏನು? | Nimma hesaru ēnu? | What is your name? (respectful) | ನಿಮ್ಮ, ಹೆಸರು, ಏನು |
| `phrase.nanna-hesaru-x` | ನನ್ನ ಹೆಸರು [name] | Nanna hesaru [name] | My name is [name] | ನನ್ನ |
| `phrase.naanu-x` | ನಾನು [name] | Naanu [name] | I am [name] | ನಾನು |

`[name]` is a literal placeholder rendered by the existing OutputPhase
substitution path. Same convention as the (now-deleted) old L1 used for
"Naanu [name]".

### Drill (6 items — within the 5–8 range)

Mix of `listen_pick` and `translate_pick` only. **No `fill_blank`** —
that drill type is a placeholder per
[CONTRADICTIONS.md C7](../../docs/foundation/CONTRADICTIONS.md).

| # | type | phraseId | distractorIds |
|---|---|---|---|
| 1 | `listen_pick` | `phrase.nimma-hesaru-enu` | `phrase.nanna-hesaru-x`, `phrase.naanu-x` |
| 2 | `translate_pick` | `phrase.nanna-hesaru-x` | `phrase.nimma-hesaru-enu`, `phrase.naanu-x` |
| 3 | `listen_pick` | `phrase.naanu-x` | `phrase.nimma-hesaru-enu`, `phrase.nanna-hesaru-x` |
| 4 | `translate_pick` | `phrase.nimma-hesaru-enu` | `phrase.nanna-hesaru-x`, `phrase.naanu-x` |
| 5 | `listen_pick` | `phrase.nanna-hesaru-x` | `phrase.nimma-hesaru-enu`, `phrase.naanu-x` |
| 6 | `translate_pick` | `phrase.naanu-x` | `phrase.nimma-hesaru-enu`, `phrase.nanna-hesaru-x` |

### Output

- **driverLine:** `phrase.nimma-hesaru-enu` (the prompt asked of the user)
- **expectedResponse:** `phrase.nanna-hesaru-x` (`ನನ್ನ ಹೆಸರು [name]`)

Reachability check: `expectedResponse` appears verbatim in intake. ✅

### Resurfaces

`[]` for now — the L1 phrases (`ನಮಸ್ಕಾರ`, `ಹೇಗಿದ್ದೀರ?`,
`ಚೆನ್ನಾಗಿದ್ದೇನೆ`) are thematically adjacent but the resurfacing
mechanism is still spaced-repetition-seed only and the screen doesn't
visually interleave resurfaces in drill today. Add real resurfaces in
the Spec that wires up the SRS loop.

## Acceptance criteria

- [ ] `constants/lessons/names.ts` exists and exports a `names: Lesson`
      const matching the body above (id, situation, intake, drill,
      output, resurfaces).
- [ ] [constants/lessons/index.ts](../../constants/lessons/index.ts)
      imports `names` and includes it in `LESSONS` and `LESSON_ORDER`.
- [ ] `LESSON_ORDER` is `[greetings.id, names.id]` in that order.
- [ ] `npx tsc --noEmit` passes after the changes.
- [ ] Opening lesson 2 in the app runs to DoneCard end-to-end (intake →
      drill → output → done) without hitting "Fill-in-the-blank / Not
      yet implemented" (verifies the `fill_blank` avoidance).
- [ ] Completing lesson 2 writes a `public.user_lesson_progress` row
      keyed to the `names` lesson_id uuid (verifies the slug → uuid
      bridge from [services/api/lessons.ts](../../services/api/lessons.ts)
      finds the seeded row).
- [ ] [CONTENT.md §Lesson slots](../../docs/foundation/CONTENT.md) flips
      L2 status from `TODO` to `✅ Implemented`.

## Out of scope

- L1 → L2 resurfacing in drill (see Resurfaces section above).
- Audio files. TTS handles `kannada` strings at runtime via the
  existing `deviceTtsAudioService`. `audioKey` stays unset on every
  phrase, same as L1.
- Images. `imageKey` is set but no asset is resolved
  ([imageAssets.ts](../../constants/lessons/imageAssets.ts) remains a
  pass-through fallback to the placeholder).
- The neutral "what is your name?" form (`ನಿನ್ನ ಹೆಸರು ಏನು?`). Lives in
  the DB reference snapshot but is not in the playable intake —
  respectful is the default per the L1 pattern, and three intake items
  is at the upper limit of i+1 sequencing.
- "Where is your house?" (`ನಿಮ್ಮ ಮನೆ ಎಲ್ಲಿ?`). PDF includes it under
  L2, but `ಎಲ್ಲಿ` is L4 vocab in the syllabus — defer.

## Reference

- [CONTENT.md](../../docs/foundation/CONTENT.md) — Lesson / Phrase
  schemas, authoring rules, slot table.
- [spec_lesson_content_source.md](spec_lesson_content_source.md) — how
  `public.lessons.content_json` relates to TS lesson content.
- [Kannada Reference — Lessons 1–6.pdf](../../kannada%20reference/Kannada%20Reference%20—%20Lessons%201–6.pdf)
  §Lesson 2 — Names and People.
- [constants/lessons/greetings.ts](../../constants/lessons/greetings.ts) —
  the L1 pattern this lesson mirrors structurally.
