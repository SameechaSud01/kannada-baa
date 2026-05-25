---
doc: CONTENT
status: reviewed
owner: samee
last-reviewed: 2026-05-23
related:
  - SCOPE.md
  - DESIGN.md
  - INTERACTIONS.md
---

# Content

> **Decision layer.** `[LOCKED]` means decided — do not reopen, resolve, or build the opposite; changing it needs an explicit spec PR plus owner sign-off. `[OPEN]` means genuinely undecided — safe to propose, do not implement until closed. A `TODO:` is a real task only if it does not contradict a `[LOCKED]` item; a TODO that contradicts a locked decision is stale text to delete, not a task. Code-vs-spec divergences are tracked in [CONTRADICTIONS.md](CONTRADICTIONS.md).

Owns: curriculum structure, vocabulary schema, audio / asset conventions, **and** all user-facing copy strings.

## Curriculum overview

`[LOCKED]` — format and slot count.

**Format:** scenario-based lessons. Each lesson grounds Kannada in a real Bengaluru situation rather than teaching abstract vocab.

**Volume:** 8-slot curriculum defined in [plannedLessons.ts](../../constants/lessons/plannedLessons.ts). 2 lessons implemented; 6 to write.

### Lesson slots

`[LOCKED]` — slot titles, subtitles, and char placeholders match [plannedLessons.ts](../../constants/lessons/plannedLessons.ts).

| Slot | Title | Subtitle | Char | Status |
|---|---|---|---|---|
| 1 | Greetings | Hello and how are you | ನ | ✅ Implemented |
| 2 | Names | I, you, my name is | ಹ | ✅ Implemented |
| 3 | Wanting | I want, I don't want | ಬೇ | TODO |
| 4 | Pointing | This, that, here, there | ಇ | TODO |
| 5 | Easy verbs | Come, eat, laugh | ಬ | TODO |
| 6 | Questions | Who, what, where | ಯಾ | TODO |
| 7 | Hard verbs | See, do, play | ನೋ | TODO |
| 8 | Putting it together | Combining what you've learned | ಸ | TODO |

## Lesson schema

`[LOCKED]` — types in [lessons/types.ts](../../constants/lessons/types.ts). Every lesson is a `Lesson`:

```ts
type Lesson = {
  id: LessonId;
  situation: {
    title: string;
    setup: string;             // 1–2 sentence framing
    imageKey: ImageKey;
    realWorldPrompt: string;   // e.g. "Try this in your next auto"
  };
  intake: Phrase[];            // 2–4 new phrases (STRICT MAX)
  drill: DrillItem[];          // 5–8 items
  output: {
    driverLine: Phrase;
    expectedResponse: Phrase;  // may contain [name] placeholder
  };
  resurfaces: PhraseId[];      // phrases from prior lessons to interleave
};
```

### Authoring rules (spec-leads-code — content must conform)

`[LOCKED]`

- **2–4 phrases per `intake`.** More than 4 = cognitive overload. Less than 2 = not enough material.
- **5–8 items per `drill`.** Mix `listen_pick` / `translate_pick` / `fill_blank`.
- **`output.expectedResponse` must be reachable** from `intake` — no surprise vocab.
- **`resurfaces`** carries phrases forward from earlier lessons to keep them alive (spaced-repetition seed).
- **`vocabAtoms`** flags sub-words considered "new" for i+1 sequencing.

## Phrase schema

`[LOCKED]` — matches [lessons/types.ts](../../constants/lessons/types.ts). Optional `note` / `gloss` fields are `[PROPOSED]` per [MODALS](../../spec_docs/Sameecha/MODALS.md) §6.4.

```ts
type Phrase = {
  id: PhraseId;              // namespaced: 'phrase.namaskara'
  kannada: string;           // 'ನಮಸ್ಕಾರ'
  transliteration: string;   // 'Namaskāra' — display in Lora italic
  english: string;           // hint, not shown by default
  audioKey?: AudioKey;       // future: recorded audio file ref
  imageKey?: ImageKey;       // future: illustration ref
  vocabAtoms: string[];      // sub-words flagged "new"
  note?: string;             // [PROPOSED] cultural/grammar callout in PhraseDetailSheet
  gloss?: Array<{            // [PROPOSED] atom-level glosses in PhraseDetailSheet
    atom: string;
    en: string;
    transliteration?: string;
  }>;
};
```

### Phrase ID convention

`[LOCKED]`

`phrase.<kebab-name>` — globally unique across all lessons. A phrase resurfaces by ID, not by re-definition.

## UI copy

All user-facing strings live in [copy.ts](../../constants/copy.ts). Accessed via `useCopy()` ([hooks/useCopy.ts](../../hooks/useCopy.ts)).

### Voice system

> **`[LOCKED: REMOVAL IN PROGRESS]`** — the two-tone (`classic` / `rowdy`) voice system is decided-for-removal. Do not add new `rowdy`/`classic` variants. Do not propose, re-debate, or build the opposite. Cross-ref [STATE.md](STATE.md#useuserstore) and [INTERACTIONS.md](INTERACTIONS.md#named-moments) and [CONTRADICTIONS.md](CONTRADICTIONS.md) C3.

#### Migration sequence

1. **`[OPEN]`** — Owner picks the single surviving voice. **Do not infer it from existing copy.** Until decided, do not start steps 2–4.
2. Collapse [constants/copy.ts](../../constants/copy.ts) to single-voice values: replace each `{ classic, rowdy }` object with the chosen string; delete the variant branching. **Not started** — verified against [copy.ts](../../constants/copy.ts): every entry still ships both variants.
3. Remove tone resolution from [hooks/useCopy.ts](../../hooks/useCopy.ts): the hook should return `COPY[key]` directly, not `COPY[key][mode]`. **Not started** — verified: `useCopy()` still reads `useUserStore((s) => s.mode)` and indexes `COPY[key][mode]`.
4. Remove `mode` from [stores/useUserStore.ts](../../stores/useUserStore.ts) (field, default, `setMode` action). Persisted-state migration: AsyncStorage key `user_prefs` — drop the `mode` field on rehydrate so old stored values don't crash. **Not started** — verified: `mode: 'rowdy' | 'classic'` is still in `UserState`, default `'classic'`, persisted.

> **No UI step required.** There is no tone-UI surface to remove. Verified by grepping every `useUserStore` consumer in `app/` and `components/`: the only consumer of `useUserStore.mode` is [hooks/useCopy.ts](../../hooks/useCopy.ts) itself (handled by step 3). No screen reads or writes `mode`; no component calls `setMode` on `useUserStore`. The lone `setMode` identifier elsewhere in the codebase is `OutputPhase`'s unrelated local `'type' | 'speak'` response-mode state, which is not part of this system.

#### Authoring rule going forward

`[LOCKED]` — all new copy is single-voice. No new `classic`/`rowdy` pairs. Existing pairs remain in `copy.ts` only until step 2 of the migration is executed.

> **TODO:** Coverage audit — does every screen render via `useCopy()`, or are some strings still inline? Run a grep.

## Emergency content

`[LOCKED]` — schema; content `[OPEN]` pending verification. **Source-of-truth divergence:** Supabase has an `emergency_phrases` table that no app code reads — see [CONTRADICTIONS.md](CONTRADICTIONS.md) C10 for the JSON-vs-DB decision still owed.

File: [data/emergency.json](../../data/emergency.json). Offline-first phrase guide, 3 groups (`auto`, `trouble`, `basics`), 3 items each.

Schema:
```json
{
  "groups": [{
    "id": "...",
    "label": "...",
    "items": [{ "kn": "...", "roman": "...", "en": "...", "audio": "..." }]
  }]
}
```

> **TODO:** `[Unverified]` flag — audit pending from a native Kannada speaker. Track who reviewed and when.

## Heritage content

`[OPEN]`

> **TODO:** Schema undefined. Routing exists ([app/heritage/[id].tsx](../../app/heritage/%5Bid%5D.tsx)) but no content shape yet.
> Decisions needed:
> - Long-form articles or short cards?
> - Anchored to lessons (per-lesson cultural note) or standalone topics?
> - Storage: JSON like emergency, MDX-style, or Supabase-backed?

## Game content

### Dictation — [src/games/dictation/](../../src/games/dictation/)

`[LOCKED]` — describes the live game.

Consumes phrases from completed lessons. User listens (TTS) and types what they hear. Score via fuzzy match ([fuzzyScore.ts](../../src/games/dictation/fuzzyScore.ts)).

### Opposites — [src/games/opposites/](../../src/games/opposites/)

`[LOCKED]` — describes the live game.

Consumes word-pair data from [wordPairs.ts](../../src/games/opposites/wordPairs.ts). Multiple-choice opposite matching.

> **TODO:** word-pair list — current count? source language verification?

### Planned games (not yet implemented)

`[OPEN]`

- Quick quiz
- Image match
- Conversations

## Asset conventions

### Audio

`[LOCKED]` — MVP path. Post-MVP `[OPEN]`.

- **MVP:** device TTS via [deviceTtsAudioService.ts](../../services/audio/deviceTtsAudioService.ts) (`Speech.speak`, `kn-IN`, rate 0.9).
- **Post-MVP:** recorded native-speaker audio referenced by `audioKey` in `Phrase`.
- **Audio key naming convention:** TODO — propose `audio/<lesson-id>/<phrase-id>.mp3`.

### Images

`[LOCKED]` — MVP path. Post-MVP `[OPEN]`.

- **MVP:** placeholder cards with `charPlaceholder` (a Kannada character) per slot.
- **Post-MVP:** illustrations per `Phrase.imageKey` and `Situation.imageKey`.
- **Image key naming convention:** TODO — propose `scene/<lesson-id>` and `phrase/<phrase-id>`.

## Open questions

`[OPEN]`

- Heritage content shape (see TODO above).
- When does a `phrase` get retired from `resurfaces` rotation — never, after N exposures, or via `SelfRating: "easy"` threshold?
