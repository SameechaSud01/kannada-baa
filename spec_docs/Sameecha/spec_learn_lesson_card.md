---
doc: spec_learn_lesson_card
status: draft
owner: samee
last-reviewed: 2026-06-01
related:
  - spec_lesson_redesign.md
  - ../../docs/foundation/DESIGN.md
  - ../../docs/foundation/INTERACTIONS.md
  - MODALS.md
---

# Learn-tab lesson card — simplify body, move details to info popup

## 1. Decision

`[LOCKED]`

Lesson cards on the Learn tab ([app/(tabs)/learn.tsx](../../app/(tabs)/learn.tsx)) render:

```
┌─────────────────────────────────────────────────────────┐
│ [glyph]   {N}. {title}              [ⓘ]   [state]      │
└─────────────────────────────────────────────────────────┘
```

- Kannada glyph badge (left, unchanged)
- Lesson number + title (single line)
- **Info icon button** — taps to open `LessonInfoDialog`
- Trailing state element: Start pill (active) / done check (done) / lock (locked) — unchanged

The prior 2-line subtitle (description · phrase count · estimated minutes, or "Complete X to unlock") is **removed from the card body** and surfaced via the info icon.

**Why:** the stacked title + description + counts + state element on every card read as visually cluttered (per user feedback: "messy"). Moving secondary info one tap away keeps the list scannable while preserving access to the details.

## 2. Info dialog

`[LOCKED]`

New modal at [components/modals/instances/LessonInfoDialog.tsx](../../components/modals/instances/LessonInfoDialog.tsx). Registered with the `kind: 'dialog'` modal shape from [MODALS.md](MODALS.md). Light backdrop dim (0.4) — informational, non-destructive.

Anatomy:
- `Halo` icon, glyph `info`, secondary tint.
- Eyebrow: `LESSON {N}` (small caps, tertiary).
- Title: lesson title.
- Description: the prior subtitle text (e.g. "Hello and how are you"). Always shown.
- Stat row: `{phraseCount} phrases · ~{ESTIMATED_MIN_PER_LESSON} min`. Omit phrase count when unknown (0 in data).
- Locked rows only — appended note: "Complete Lesson {N-1} · {prevTitle} to unlock."
- Dismiss CTA: "Got it" (primary).

## 3. Card mechanics

`[LOCKED]`

- Info icon: 18pt, `Icons.info`, color `Colors.tertiary`. Hit slop 12. Rendered as a standalone `Pressable` so the press does NOT bubble to the row.
- Card title: kept at `numberOfLines={1}`; truncation tolerated.
- Row tap behavior unchanged: active → lesson runner; done → lesson runner; locked → `LessonLockedDialog`.

## 4. Acceptance criteria

`[LOCKED]`

- No Learn-tab card renders the prior description/count subtitle in its body.
- Every card state (active, done, locked) shows the info icon.
- Tapping the info icon opens `LessonInfoDialog` for that lesson and does NOT trigger row navigation.
- Tapping the row elsewhere preserves prior behavior.
- `LessonInfoDialog` accessibility: focusable Got-it button; role-based labels.

## 5. Out of scope

`[OPEN]`

- Showing a preview of the actual phrases / words / vocabulary inside the info dialog. Deferred — v1 mirrors the prior subtitle content only.
- Restyling the LessonSelector (per-game) lesson pills — that screen is governed by [spec_lesson_selector.md](spec_lesson_selector.md) and uses a different card shape; this spec covers the Learn tab only.
