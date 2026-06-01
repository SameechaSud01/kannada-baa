---
doc: spec_text_hierarchy
status: draft
owner: samee
last-reviewed: 2026-06-01
related:
  - ../../docs/foundation/DESIGN.md
  - ../../docs/foundation/CONTENT.md
  - spec_lesson_redesign.md
---

# Text hierarchy — transliteration first, English second, Kannada last

## 1. Decision

`[LOCKED]`

Wherever the UI renders a Kannada vocabulary item or phrase showing two or three of {transliteration, English meaning, Kannada script}, the visual hierarchy is:

1. **Primary** (largest, top, high contrast) — transliteration (romanised Kannada). `Fonts.lora.italic`.
2. **Secondary** (medium, below, muted) — English meaning. `Fonts.dmSans.medium` or `.regular`, `Colors.tertiary`.
3. **Tertiary** (small, below, ~70% opacity) — Kannada script. `Fonts.notoSerifKannada.regular`, `Colors.tertiary`.

**Why:** the app is for English-speaking learners of Kannada (see [SCOPE.md](../../docs/foundation/SCOPE.md)). Transliteration is what they can read aloud and recall; English is the meaning hook; Kannada script is reference. Inverting the hierarchy (Kannada-first) makes the script the cognitive load and pushes learners toward memorising the script, which contradicts "spoken comfort first."

This extends the already-locked lesson-runner hierarchy from [spec_lesson_redesign.md](spec_lesson_redesign.md) §1 ("Transliteration is the primary text throughout. Kannada script is shown small for reference only and is never an interaction target") to the rest of the app.

## 2. Scope

`[LOCKED]`

| Surface | File | Before | After |
|---|---|---|---|
| Lesson — TeachWordsPhase | [components/lesson/TeachWordsPhase.tsx](../../components/lesson/TeachWordsPhase.tsx) | ✅ aligned | unchanged |
| Lesson — PracticeWordsPhase say card | [components/lesson/PracticeWordsPhase.tsx](../../components/lesson/PracticeWordsPhase.tsx) | ✅ aligned | unchanged |
| Lesson — TeachPhrasesPhase phrase card | [components/lesson/TeachPhrasesPhase.tsx](../../components/lesson/TeachPhrasesPhase.tsx) | ✅ aligned | unchanged |
| Lesson — PracticePhrasesPhase say card | [components/lesson/PracticePhrasesPhase.tsx](../../components/lesson/PracticePhrasesPhase.tsx) | ✅ aligned | unchanged |
| Lesson — SummaryPhase rows | [components/lesson/SummaryPhase.tsx](../../components/lesson/SummaryPhase.tsx) | ✅ aligned | unchanged |
| Emergency screen rows | [app/emergency.tsx](../../app/emergency.tsx) | kn → tr·meaning | tr / en / kn |
| Opposites — QuestionCard | [src/games/opposites/components/QuestionCard.tsx](../../src/games/opposites/components/QuestionCard.tsx) | kn → tr → (meaning) | tr / meaning / kn |
| Opposites — OptionButton | [src/games/opposites/components/OptionButton.tsx](../../src/games/opposites/components/OptionButton.tsx) | kn → en | tr / en / kn |
| ImageMatch — QuestionCard (word-to-picture) | [src/games/imagematch/components/QuestionCard.tsx](../../src/games/imagematch/components/QuestionCard.tsx) | kn → tr → (hint en) | tr / en / kn |
| ImageMatch — WordOptionButton | [src/games/imagematch/components/WordOptionButton.tsx](../../src/games/imagematch/components/WordOptionButton.tsx) | kn → tr → (hint en) | tr / en / kn |
| PhraseDetailSheet header | [components/modals/instances/PhraseDetailSheet.tsx](../../components/modals/instances/PhraseDetailSheet.tsx) | kn → tr → en | tr / en / kn |
| PhraseDetailSheet gloss atoms | [components/modals/instances/PhraseDetailSheet.tsx](../../components/modals/instances/PhraseDetailSheet.tsx) | kn → tr → en (horiz) | tr / kn stacked, en right |

## 3. Acceptance criteria

`[LOCKED]`

For every surface listed in §2:
- Transliteration is the largest text, positioned first (top or leading).
- English meaning is medium, second.
- Kannada script is smallest, third, ~70% opacity.
- No surface in §2 renders Kannada script as hero text.
- If transliteration is missing from the data, English becomes the de-facto primary (the kannada-first inversion is still avoided).

## 4. Out of scope (intentionally unchanged)

`[OPEN]`

- **App-name branding "ಕನ್ನಡ ಬಾ"** on home, learn, practice, profile, login, onboarding — single-glyph decorative usage, no hierarchy to apply.
- **LessonSelector lesson-pill glyph** — single decorative Kannada glyph badge inside a lesson pill, not a vocabulary item.
- **TeachPhrasesPhase per-word chips** — 2-field (transliteration + kannada) chip row above the full-phrase card. Adding per-chip English would clutter the chip row; full phrase below already shows English in canonical order.
- **Dictation FeedbackCard reveal** — currently shows kannada-only when the correct answer is revealed; threading English through requires changes to `DictationItem` plumbing. Flagged for a follow-up; the dictation game's primary input already targets transliteration, so the reveal is consistent with the rule's spirit.

## 5. Side effect — game difficulty

`[OPEN]` — needs owner sign-off

Applying this rule to game **question cards** and **option buttons** means the English meaning becomes visible by default (currently gated behind a hint in image-match). This makes the games easier — the learner doesn't have to recall the meaning to map word → picture or word → opposite. The tradeoff is acceptable if the goal is vocabulary exposure over difficulty. If we later want to preserve the prior difficulty curve, we can:
- Keep the hierarchy rule for the question card (the word being asked about), and
- Keep options as 2-field (transliteration + kannada) without the English meaning until reveal.

This spec currently chooses "rule everywhere" (English always visible). Hint buttons become cosmetic no-ops on these surfaces; not removed in this pass to keep the edit surgical. Flagged for owner review.
