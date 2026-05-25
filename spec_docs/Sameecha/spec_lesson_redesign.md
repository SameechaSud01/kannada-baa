# Spec: lesson flow redesign
**Replaces:** SPEC-lesson-redesign.md (all prior lesson specs superseded)
**Scope:** Lesson flow, phase components, state machine, data types, DB data fetching
**Out of scope:** TTS / audio service upgrade (separate spec), games feature internals, progress store

---

## 1. Goal

Redesign the lesson flow around spoken Kannada comfort. The learner's goal is to speak and understand Kannada in real situations. Transliteration (romanised Kannada) is the primary text throughout. Kannada script is shown small for reference only and is never an interaction target.

---

## 2. DB schema — what exists, what to read

Table: `public.lessons`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | primary key |
| `lesson_no` | int | 1–8, use for ordering |
| `title` | text | display name |
| `situation` | text | context shown before teaching |
| `real_world_prompt` | text | call to action shown at end |
| `content_json` | jsonb | contains `reference.words[]` and `reference.phrases[]` |
| `slug` | text | url-friendly name |
| `audio_url` | text | null for now |

### content_json shape

Every lesson has this consistent shape:

```ts
content_json: {
  reference: {
    words: Array<{
      english: string        // e.g. "Hello / greetings"
      kannada: string        // e.g. "ನಮಸ್ಕಾರ"
      transliteration: string // e.g. "namaskara"
    }>
    phrases: Array<{
      english: string
      kannada: string
      transliteration: string
    }>
    verified: boolean
    source: string
  }
}
```

No IDs on words or phrases — position in the array is the sequence. Words are taught in array order.

### Fetching

Fetch all lessons ordered by `lesson_no`:

```ts
const { data } = await supabase
  .from('lessons')
  .select('id, lesson_no, title, slug, situation, real_world_prompt, content_json')
  .order('lesson_no', { ascending: true })
```

Map the result to the app's `Lesson` type (see section 4).

---

## 3. New lesson flow

### Phase sequence

```
idle
  -> situation        context: where this lesson lives in real life
  -> teach_words      each word one at a time, audio + text
  -> practice_words   each word practiced with shadowing mechanic
  -> teach_phrases    each phrase built from known words, audio + text
  -> practice_phrases each phrase practiced with shadowing mechanic
  -> summary          all words and phrases covered, reviewable
  -> real_world       specific call to action to try today
  -> done             stats + link to games
```

### What this replaces

| Old | New |
|---|---|
| `scenario` | `situation` |
| `intake` | `teach_words` + `teach_phrases` |
| `drill` | `practice_words` + `practice_phrases` |
| `output` | removed — subsumed into practice shadowing |
| `done` | split into `summary` + `real_world` + `done` |

---

## 4. Types — `constants/lessons/types.ts`

### Word

```ts
export interface Word {
  transliteration: string  // hero text — large, primary
  english: string          // secondary
  kannada: string          // small reference, never interacted with
}
```

### Phrase

```ts
export interface Phrase {
  transliteration: string
  english: string
  kannada: string
}
```

### Lesson

```ts
export interface Lesson {
  id: string
  lessonNo: number
  title: string
  slug: string
  situation: string
  realWorldPrompt: string
  words: Word[]
  phrases: Phrase[]
}
```

### DB → app mapping function

```ts
export function mapDbLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    lessonNo: row.lesson_no,
    title: row.title,
    slug: row.slug,
    situation: row.situation,
    realWorldPrompt: row.real_world_prompt,
    words: row.content_json.reference.words.map(w => ({
      transliteration: w.transliteration,
      english: w.english,
      kannada: w.kannada,
    })),
    phrases: row.content_json.reference.phrases.map(p => ({
      transliteration: p.transliteration,
      english: p.english,
      kannada: p.kannada,
    })),
  }
}
```

### LessonPhase

```ts
export type LessonPhase =
  | 'idle'
  | 'situation'
  | 'teach_words'
  | 'practice_words'
  | 'teach_phrases'
  | 'practice_phrases'
  | 'summary'
  | 'real_world'
  | 'done'
```

---

## 5. State machine — `hooks/useLessonRunner.ts`

### State shape

```ts
interface LessonRunnerState {
  phase: LessonPhase
  wordIndex: number              // position in lesson.words[] during teach_words
  practiceWordIndex: number      // position during practice_words
  practiceWordStep: 'listen' | 'say'
  phraseIndex: number            // position in lesson.phrases[] during teach_phrases
  practicePhrasesIndex: number
  practicePhrasesStep: 'listen' | 'say'
}
```

### Transition map

```
idle                -> advance() -> situation             reset all indices to 0
situation           -> advance() -> teach_words           wordIndex = 0
teach_words         -> advance() -> teach_words           wordIndex++ while < words.length - 1
teach_words         -> advance() -> practice_words        at last word; practiceWordIndex = 0, step = listen
practice_words      -> advance() -> practice_words        step: listen -> say -> next word
practice_words      -> advance() -> teach_phrases         at last word say step; phraseIndex = 0
teach_phrases       -> advance() -> teach_phrases         phraseIndex++ while < phrases.length - 1
teach_phrases       -> advance() -> practice_phrases      at last phrase; practicePhrasesIndex = 0, step = listen
practice_phrases    -> advance() -> practice_phrases      step: listen -> say -> next phrase
practice_phrases    -> advance() -> summary               at last phrase say step
summary             -> advance() -> real_world
real_world          -> advance() -> done
```

`advance()` is the single transition function. It reads current phase + indices and determines next state. No separate named actions needed.

The `practiceWordStep` sub-steps work as follows inside `practice_words`:
- On `listen` step: user picks the correct English meaning. On correct pick, step flips to `say`.
- On `say` step: user taps "I said it". Audio plays once more. Then `advance()` is called — this increments `practiceWordIndex` and resets step to `listen`. If `practiceWordIndex` was already at the last word, phase flips to `teach_phrases`.

Same pattern for `practicePhrasesStep` inside `practice_phrases`.

---

## 6. Audio

Use the existing `audioService`. TTS text: always pass `word.transliteration` or `phrase.transliteration` — not the Kannada script. Transliteration produces better TTS output on current engines. This is intentional.

Audio plays **automatically** on every new word and phrase card. Do not wait for user interaction for the first play.

---

## 7. Component: SituationPhase

Rename `ScenarioPhase` → `SituationPhase`. Update the router case from `scenario` to `situation`. No behaviour changes.

**Props:**
```ts
interface SituationPhaseProps {
  lesson: Lesson
  onAdvance: () => void
}
```

**Displays:** `lesson.title`, `lesson.situation`. Single "Let's start" button calls `onAdvance()`.

---

## 8. Component: TeachWordsPhase — new

**File:** `components/lesson/TeachWordsPhase.tsx`

**Props:**
```ts
interface TeachWordsPhaseProps {
  words: Word[]
  wordIndex: number
  onAdvance: () => void
}
```

### Layout — top to bottom

1. Progress bar — thin, `(wordIndex + 1) / words.length`. Label: `Word {wordIndex + 1} of {words.length}`
2. Word card:
   - `transliteration` — large hero (~42px), high contrast, primary
   - `english` — medium secondary (~18px), muted
   - `kannada` — small (~13px), muted, bottom of card. No label.
3. Audio button — circular. Auto-plays on mount and on every `wordIndex` change. Replay on tap. Shows playing state.
4. "Got it" button — full width primary. Last word: label changes to "Start practising words"

### Behaviour
- Audio plays automatically on every new word.
- No skip. No scoring. No feedback.

---

## 9. Component: PracticeWordsPhase — new

**File:** `components/lesson/PracticeWordsPhase.tsx`

**Props:**
```ts
interface PracticeWordsPhaseProps {
  words: Word[]
  practiceWordIndex: number
  step: 'listen' | 'say'
  onAdvance: () => void
}
```

### Listen step layout

1. Progress: `Word {practiceWordIndex + 1} of {words.length} — Listen`
2. Audio plays automatically on arrival. Replay button available.
3. Prompt: "What does this mean?"
4. Three option chips — correct `english` + 2 distractors from other words in the array. Randomise positions.
5. Transliteration and kannada NOT visible yet.

On correct tap:
- Chip highlights green
- Audio plays again automatically
- After ~800ms, step advances to `say`

On wrong tap:
- Tapped chip highlights red
- Correct chip highlights green
- Audio plays
- After ~1s, step advances to `say` anyway. No retry. Correction is the feedback.

Distractors: pick 2 randomly from `words` excluding the current word. If fewer than 3 words total, repeat one distractor.

### Say step layout

1. Progress: `Word {practiceWordIndex + 1} of {words.length} — Say it`
2. Word card: `transliteration` (large) + `english` (medium) + `kannada` (small)
3. Audio replay button
4. Prompt: "Say it out loud"
5. "I said it" button — full width primary

On "I said it" tap:
- Audio plays one final time (shadowing post-play)
- After ~800ms, `onAdvance()` called

---

## 10. Component: TeachPhrasesPhase — new

**File:** `components/lesson/TeachPhrasesPhase.tsx`

**Props:**
```ts
interface TeachPhrasesPhaseProps {
  phrases: Phrase[]
  words: Word[]
  phraseIndex: number
  onAdvance: () => void
}
```

### Layout — top to bottom

1. Progress bar — `(phraseIndex + 1) / phrases.length`. Label: `Phrase {phraseIndex + 1} of {phrases.length}`
2. Word chips row — split `phrase.transliteration` by spaces to produce chips. Each chip:
   - Chip text: the transliteration segment
   - Look up matching word from `words` by comparing chip text against `word.transliteration`. If match found, show `word.kannada` small beneath.
   - Tap: plays audio for just that word's transliteration + brief teal highlight (~600ms)
3. Full phrase display:
   - `transliteration` — large hero (~28px)
   - `english` — medium secondary (~15px)
   - `kannada` — small muted (~12px)
4. Audio button — auto-plays full phrase on mount and on `phraseIndex` change.
5. Hint text (small muted): "Tap a word to hear it on its own"
6. "Got it" button — full width. Last phrase: "Start practising phrases"

### Behaviour
- TTS: pass `phrase.transliteration` for full phrase audio.
- Chip audio: pass the chip's transliteration segment.
- No scoring. No feedback.

---

## 11. Component: PracticePhrasesPhase — new

**File:** `components/lesson/PracticePhrasesPhase.tsx`

**Props:**
```ts
interface PracticePhrasesPhaseProps {
  phrases: Phrase[]
  practicePhrasesIndex: number
  step: 'listen' | 'say'
  onAdvance: () => void
}
```

Same two-step shadowing loop as `PracticeWordsPhase` but at phrase level.

### Listen step
1. Audio plays automatically
2. Prompt: "What does this mean?"
3. Three options — correct `english` + 2 distractors from other phrases
4. Correct: audio replays, advance to say after ~800ms
5. Wrong: highlight, reveal correct, audio plays, advance to say after ~1s

### Say step
1. Prompt: "How do you say this?" with `english` shown as the cue
2. `transliteration` shown (the answer — learner checks themselves)
3. `kannada` small beneath
4. Audio replay button
5. "I said it" button — full width
6. Tap: audio plays final time, `onAdvance()` after ~800ms

---

## 12. Component: SummaryPhase — new

**File:** `components/lesson/SummaryPhase.tsx`

**Props:**
```ts
interface SummaryPhaseProps {
  words: Word[]
  phrases: Phrase[]
  onAdvance: () => void
}
```

### Layout
1. Heading: "What you learned"
2. Words section — labelled "Words". Each word as a row:
   - `transliteration` left, medium
   - `english` right, muted
   - `kannada` small beneath `transliteration`
   - Audio button per row — tap to hear
3. Phrases section — same row pattern
4. "Continue" button — full width, calls `onAdvance()`

---

## 13. Component: RealWorldPhase — new

**File:** `components/lesson/RealWorldPhase.tsx`

**Props:**
```ts
interface RealWorldPhaseProps {
  prompt: string
  title: string
  onAdvance: () => void
}
```

### Layout
1. Small label at top: lesson title
2. Prompt text — large, prominent. The specific call to action from `lesson.realWorldPrompt`.
3. "I'll try this" button — primary full width
4. "Skip for now" — secondary, smaller

Both buttons call `onAdvance()`.

---

## 14. Component: DoneCard — update existing

Add a "Keep practising" section after the existing stats. Shows available game modes with name, description, and a Play button. Game list passed as a prop or read from a games registry — do not hardcode in DoneCard.

No other changes to DoneCard behaviour or progress store calls.

---

## 15. Lesson router — `app/lesson/[id].tsx`

```tsx
switch (runner.phase) {
  case 'situation':
    return <SituationPhase lesson={lesson} onAdvance={runner.advance} />

  case 'teach_words':
    return (
      <TeachWordsPhase
        words={lesson.words}
        wordIndex={runner.wordIndex}
        onAdvance={runner.advance}
      />
    )

  case 'practice_words':
    return (
      <PracticeWordsPhase
        words={lesson.words}
        practiceWordIndex={runner.practiceWordIndex}
        step={runner.practiceWordStep}
        onAdvance={runner.advance}
      />
    )

  case 'teach_phrases':
    return (
      <TeachPhrasesPhase
        phrases={lesson.phrases}
        words={lesson.words}
        phraseIndex={runner.phraseIndex}
        onAdvance={runner.advance}
      />
    )

  case 'practice_phrases':
    return (
      <PracticePhrasesPhase
        phrases={lesson.phrases}
        practicePhrasesIndex={runner.practicePhrasesIndex}
        step={runner.practicePhrasesStep}
        onAdvance={runner.advance}
      />
    )

  case 'summary':
    return (
      <SummaryPhase
        words={lesson.words}
        phrases={lesson.phrases}
        onAdvance={runner.advance}
      />
    )

  case 'real_world':
    return (
      <RealWorldPhase
        prompt={lesson.realWorldPrompt}
        title={lesson.title}
        onAdvance={runner.advance}
      />
    )

  case 'done':
    return <DoneCard lesson={lesson} runner={runner} />
}
```

---

## 16. Files to delete

These are fully superseded:

- `components/lesson/IntakePhase.tsx`
- `components/lesson/ScenarioPhase.tsx` — replaced by `SituationPhase`
- `components/lesson/DrillPhase.tsx` and all sub-components (`ListenPickItem`, `TranslatePickItem`, `FillBlankPlaceholder`)
- `components/lesson/output/OutputPhase.tsx`
- `constants/lessons/meeting-someone-new.ts` — data now comes from DB
- Any static lesson data files in `constants/lessons/` — all lesson data is DB-sourced

---

## 17. Files not in scope

- `services/audio/deviceTtsAudioService.ts` — TTS upgrade is a separate spec
- `useProgressStore` — no changes
- Games components — DoneCard gets a section for them but games themselves are not specced here
- `CONTRADICTIONS.md` items C6 and C7 — pre-existing, not changed here

---

## 18. File change summary

| File | Action |
|---|---|
| `constants/lessons/types.ts` | Rewrite: Word, Phrase, Lesson, LessonPhase, mapDbLesson |
| `hooks/useLessonRunner.ts` | Rewrite: full state machine |
| `app/lesson/[id].tsx` | Replace all phase cases |
| `components/lesson/SituationPhase.tsx` | Rename from ScenarioPhase |
| `components/lesson/TeachWordsPhase.tsx` | New |
| `components/lesson/PracticeWordsPhase.tsx` | New |
| `components/lesson/TeachPhrasesPhase.tsx` | New |
| `components/lesson/PracticePhrasesPhase.tsx` | New |
| `components/lesson/SummaryPhase.tsx` | New |
| `components/lesson/RealWorldPhase.tsx` | New |
| `components/lesson/DoneCard.tsx` | Add games section |
| `components/lesson/IntakePhase.tsx` | Delete |
| `components/lesson/ScenarioPhase.tsx` | Delete |
| `components/lesson/DrillPhase.tsx` + sub-components | Delete |
| `components/lesson/output/OutputPhase.tsx` | Delete |
| `constants/lessons/meeting-someone-new.ts` | Delete |