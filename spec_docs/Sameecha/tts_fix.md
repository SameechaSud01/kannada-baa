# Spec: TTS quick fix
**Scope:** Two changes only — TTS input and rate
**File count:** 1 service file + all lesson phase components that call audio.play()

---

## 1. Rate change — `services/audio/deviceTtsAudioService.ts`

Line 33. Change rate from 0.9 to 0.7:

```ts
// before
Speech.speak(text, { language: 'kn-IN', rate: 0.9 })

// after
Speech.speak(text, { language: 'kn-IN', rate: 0.7 })
```

---

## 2. TTS input change — all lesson phase components

Anywhere `audio.play()` is called with a transliteration string, switch to the Kannada script field.

The `kn-IN` voice reads Kannada script correctly. Transliteration is Roman text and gets mispronounced by the engine.

```ts
// before
audio.play(word.transliteration)
audio.play(phrase.transliteration)

// after
audio.play(word.kannada)
audio.play(phrase.kannada)
```

Files to update:
- `components/lesson/TeachWordsPhase.tsx`
- `components/lesson/TeachPhrasesPhase.tsx` — including word chip tap handlers
- `components/lesson/PracticeWordsPhase.tsx` — both listen and say steps
- `components/lesson/PracticePhrasesPhase.tsx` — both listen and say steps
- `components/lesson/SummaryPhase.tsx` — per-row audio buttons

---

## 3. Nothing else changes

- `AudioService` interface — no change
- `TTSUnavailableDialog` — no change
- Lesson data or DB — no change
- All other components — no change