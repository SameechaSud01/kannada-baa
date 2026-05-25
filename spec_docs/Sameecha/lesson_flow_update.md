# Spec: words + phrases teaching phases

**Replaces:** `intake` phase  
**Affects:** `types.ts`, `useLessonRunner.ts`, lesson data files, two new phase components  
**Does not change:** `ScenarioPhase`, `DrillPhase`, `OutputPhase`, `DoneCard`, progress store, audio service

---

## 1. Context

The current lesson flow is:

```
idle → scenario → intake → drill → output → done
```

`intake` teaches phrases only. The new content structure has two layers — individual words first, then phrases composed from those words. This spec splits `intake` into two sequential teaching phases:

```
idle → scenario → words → phrases → drill → output → done
```

The goal of both phases is **pure teaching**: expose the learner to the word or phrase, play audio, let them absorb it at their own pace, and move on. There is no scoring, no correct/wrong feedback, and no gamification here — that is what `drill` is for.

---

## 2. Type changes — `constants/lessons/types.ts`

### 2a. Add `Word` type

```ts
export interface Word {
  id: WordId;
  kannadaScript: string;   // e.g. "ನಮಸ್ಕಾರ"
  transliteration: string; // e.g. "namaskāra"
  englishGloss: string;    // e.g. "Namaskara (greeting)"
  audioKey: string;        // matches Phrase.audioKey convention; TTS fallback uses kannadaScript
}

export type WordId = string; // e.g. "w-namaskara"
```

### 2b. Update `Phrase` type

Add an optional `wordIds` field so the phrases phase can highlight which words a phrase is composed of:

```ts
export interface Phrase {
  // ... existing fields unchanged ...
  wordIds?: WordId[]; // ordered list of Word IDs that make up this phrase
}
```

### 2c. Update `Lesson` type

Replace the single `intake` field with `words` and `phrases`:

```ts
export interface Lesson {
  id: string;
  situation: Situation;
  words: Word[];        // replaces nothing — new field (was not in Lesson before)
  phrases: Phrase[];    // replaces intake: Phrase[]
  drill: DrillItem[];
  output: OutputConfig;
  resurfaces: PhraseId[];
}
```

> **Migration note:** rename `intake` → `phrases` in `meeting-someone-new.ts` and any future lesson files. The field contents are identical — just a rename.

---

## 3. State machine change — `hooks/useLessonRunner.ts`

### 3a. Phase type

```ts
export type LessonPhase =
  | 'idle'
  | 'scenario'
  | 'words'      // new
  | 'phrases'    // renamed from 'intake'
  | 'drill'
  | 'output'
  | 'done';
```

### 3b. State shape

Add `wordIndex` alongside the existing `intakeIndex` (rename `intakeIndex` → `phraseIndex` for clarity):

```ts
interface LessonRunnerState {
  phase: LessonPhase;
  wordIndex: number;   // current position in lesson.words[]
  phraseIndex: number; // current position in lesson.phrases[] (was intakeIndex)
  drillAttempts: DrillAttempt[];
}
```

### 3c. Transition logic

```
scenario  → advance()          → words      (wordIndex = 0)
words     → advance()          → words      (wordIndex++) until end of words[]
words     → advance() at end   → phrases    (phraseIndex = 0)
phrases   → advance()          → phrases    (phraseIndex++) until end of phrases[]
phrases   → advance() at end   → drill
drill     → recordDrillAttempts + advance() → output
output    → advance()          → done
```

The `advance()` function already handles index incrementing for `intake`; apply the same pattern to `words` with `wordIndex`.

---

## 4. New component — `components/lesson/WordsPhase.tsx`

### Purpose
Teach each word one at a time. Audio plays automatically when a new word appears. The learner taps "Got it" to advance.

### Props
```ts
interface WordsPhaseProps {
  words: Word[];
  wordIndex: number;
  onAdvance: () => void;
}
```

### Layout (top → bottom)
1. **Progress bar** — thin, fills left to right as `wordIndex / words.length`. Label: "Words · {wordIndex + 1} of {words.length}".
2. **Word card** — centered, full width, contains:
   - `kannadaScript` — largest text on screen (~48px). This is the hero element.
   - `transliteration` — small, muted, below the script (~14px).
   - `englishGloss` — secondary text, below transliteration (~16px).
   - **Audio button** — circular icon button below the gloss. On mount, auto-plays audio for the current word (call `audioService.speak(word.kannadaScript)`). Button shows a play icon at rest; swaps to a pause/loading indicator while playing; returns to play when done. Label beneath: "Tap to hear again" after first play.
3. **"Got it" button** — full-width primary button at the bottom. Label: "Got it" with a right arrow. On the last word, label changes to "Start phrases →".

### Behaviour
- On `wordIndex` change (new word), re-trigger audio automatically.
- Tapping the audio button replays audio regardless of state.
- Tapping "Got it" calls `onAdvance()`. The parent (`useLessonRunner`) handles whether to increment `wordIndex` or flip phase to `phrases`.
- No "skip" option. No scoring. No feedback states.

### Audio
Use the existing `audioService` (device TTS). Pass `word.kannadaScript` as the text. The `audioKey` field is reserved for the v2 native-speaker audio swap-in — wire it up the same way `Phrase.audioKey` is currently handled.

---

## 5. New component — `components/lesson/PhrasesPhase.tsx`

### Purpose
Teach each phrase one at a time. Show the phrase broken into tappable word chips. Tapping a chip plays isolated audio for that word. A full-phrase audio button plays the whole thing.

### Props
```ts
interface PhrasesPhaseProps {
  phrases: Phrase[];
  words: Word[];        // full word list so chips can look up kannadaScript/transliteration by WordId
  phraseIndex: number;
  onAdvance: () => void;
}
```

### Layout (top → bottom)
1. **Progress bar** — same pattern as `WordsPhase`. Label: "Phrases · {phraseIndex + 1} of {phrases.length}".
2. **Word chips row** — if `phrase.wordIds` is populated, render one chip per `WordId`. Each chip shows:
   - `kannadaScript` of that word (~20px)
   - `transliteration` beneath it (~11px, muted)
   - Tapping a chip briefly highlights it (teal border/bg) and plays audio for just that word.
   - If `phrase.wordIds` is empty or undefined, skip the chips row entirely.
3. **Divider** — thin horizontal rule separating chips from full phrase.
4. **Full phrase display**:
   - `phrase.kannadaScript` (~26px)
   - `phrase.englishGloss` below (~14px, muted)
5. **Audio button** — same circular button as `WordsPhase`. Auto-plays on mount for the full phrase. Label: "Hear full phrase" → "Hear again" after first play.
6. **Hint text** — small muted label: "Tap a word above to hear it on its own" (only shown if `wordIds` is populated).
7. **"Got it" button** — full-width primary button. Last phrase: label changes to "Start drill →".

### Behaviour
- On `phraseIndex` change, re-trigger full-phrase audio automatically.
- Chip tap: plays that word's audio. Chip highlight animates on then off (~600ms). Multiple chips can be tapped freely — no state locked.
- "Got it" calls `onAdvance()`.
- No scoring. No feedback. No skip.

---

## 6. Update lesson router — `app/lesson/[id].tsx`

Add cases for the two new phases alongside the existing ones:

```tsx
case 'words':
  return (
    <WordsPhase
      words={lesson.words}
      wordIndex={runner.wordIndex}
      onAdvance={runner.advance}
    />
  );

case 'phrases':
  return (
    <PhrasesPhase
      phrases={lesson.phrases}
      words={lesson.words}
      phraseIndex={runner.phraseIndex}
      onAdvance={runner.advance}
    />
  );
```

Remove the `intake` case (or keep it as a fallback alias during migration if needed).

---

## 7. Update lesson data — `constants/lessons/meeting-someone-new.ts`

### 7a. Add `words` array

Populate from the Lesson 1 reference. Each entry maps to a `Word`:

```ts
words: [
  { id: 'w-namaskara',    kannadaScript: 'ನಮಸ್ಕಾರ',       transliteration: 'namaskāra',    englishGloss: 'Namaskara (greeting)',       audioKey: 'w-namaskara' },
  { id: 'w-namaste',      kannadaScript: 'ನಮಸ್ತೆ',         transliteration: 'namaste',      englishGloss: 'Namaste (greeting)',         audioKey: 'w-namaste' },
  { id: 'w-heegiddira',   kannadaScript: 'ಹೇಗಿದ್ದೀರ',      transliteration: 'hēgiddīra',    englishGloss: 'How are you? (respectful)', audioKey: 'w-heegiddira' },
  { id: 'w-heegiddiya',   kannadaScript: 'ಹೇಗಿದ್ದೀಯ',      transliteration: 'hēgiddīya',    englishGloss: 'How are you? (neutral)',    audioKey: 'w-heegiddiya' },
  { id: 'w-chennagiddeni',kannadaScript: 'ಚೆನ್ನಾಗಿದ್ದೇನಿ', transliteration: 'cennāgiddēni', englishGloss: 'I am fine',                 audioKey: 'w-chennagiddeni' },
  { id: 'w-neevu',        kannadaScript: 'ನೀವು',           transliteration: 'nīvu',         englishGloss: 'You (respectful)',           audioKey: 'w-neevu' },
  { id: 'w-neenu',        kannadaScript: 'ನೀನು',           transliteration: 'nīnu',         englishGloss: 'You (neutral)',              audioKey: 'w-neenu' },
],
```

### 7b. Rename `intake` → `phrases` and add `wordIds`

For each phrase, add a `wordIds` array referencing the word IDs above. Example:

```ts
phrases: [
  {
    id: 'p-namaste-heegiddira',
    kannadaScript: 'ನಮಸ್ತೆ ಹೇಗಿದ್ದೀರ?',
    englishGloss: 'Hi, how are you? (respectful)',
    audioKey: 'p-namaste-heegiddira',
    wordIds: ['w-namaste', 'w-heegiddira'],
  },
  {
    id: 'p-neevu-chennagiddira',
    kannadaScript: 'ನೀವು ಚೆನ್ನಾಗಿದಿರಾ?',
    englishGloss: 'Are you fine? (respectful)',
    audioKey: 'p-neevu-chennagiddira',
    wordIds: ['w-neevu'],
  },
  {
    id: 'p-naanu-chennagiddeni',
    kannadaScript: 'ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನಿ',
    englishGloss: 'I am fine',
    audioKey: 'p-naanu-chennagiddeni',
    wordIds: ['w-chennagiddeni'],
  },
  // ... remaining phrases from the reference
],
```

> The content cap from `CONTENT.md` (2–4 phrases per lesson) still applies. Words have no cap defined — use all words from the lesson's reference table.

---

## 8. Known issues this spec does not touch

These are pre-existing and tracked in `CONTRADICTIONS.md`:

- **C7** — `fill_blank` drill type is a stub. Not changed here.
- **C6** — `completeLesson` has no tests. Not changed here.

---

## 9. File change summary

| File | Change |
|---|---|
| `constants/lessons/types.ts` | Add `Word`, `WordId`; add `wordIds` to `Phrase`; replace `intake` with `words` + `phrases` on `Lesson` |
| `hooks/useLessonRunner.ts` | Add `words` and `phrases` phases; add `wordIndex`; rename `intakeIndex` → `phraseIndex` |
| `app/lesson/[id].tsx` | Add `words` and `phrases` cases; remove `intake` case |
| `components/lesson/WordsPhase.tsx` | New file |
| `components/lesson/PhrasesPhase.tsx` | New file |
| `constants/lessons/meeting-someone-new.ts` | Add `words[]`; rename `intake` → `phrases`; add `wordIds` to each phrase |
| `constants/lessons/plannedLessons.ts` | No change needed — slots 2–8 are still TODO |