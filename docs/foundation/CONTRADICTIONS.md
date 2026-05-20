---
doc: CONTRADICTIONS
status: living
owner: samee
last-reviewed: 2026-05-19
related:
  - SCOPE.md
  - DESIGN.md
  - CONTENT.md
  - NAVIGATION.md
  - STATE.md
  - INTERACTIONS.md
---

# Contradictions

A living log of code-vs-spec divergences. Two sections: **Active** (the gap exists today) and **Resolved** (the gap was closed; entry kept as history).

Each entry: **what's wrong**, **why it matters**, **owning spec(s)**, **resolution owed**.

Numbering is monotonic and never reused. Gaps in the sequence (C2, C4, C5, C8…) are slots reserved for divergences raised but not yet documented.

## Active

### C3 — Rowdy/classic voice system still wired but locked for removal

**What's wrong:** Spec ([CONTENT.md](CONTENT.md#voice-system)) declares the two-tone (`classic` / `rowdy`) voice system as `[LOCKED: REMOVAL IN PROGRESS]`, but the code still implements it end-to-end:
- [constants/copy.ts](../../constants/copy.ts): every key carries both `classic` and `rowdy` variants.
- [hooks/useCopy.ts](../../hooks/useCopy.ts): reads `useUserStore((s) => s.mode)` and indexes `COPY[key][mode]`.
- [stores/useUserStore.ts](../../stores/useUserStore.ts): `mode: 'rowdy' | 'classic'` field, default `'classic'`, `setMode` action, persisted to AsyncStorage key `user_prefs`.

**Why it matters:** Until the migration runs, anyone editing copy will instinctively add both variants — re-entrenching the system we're killing. Anyone debugging hydration may treat the `mode` field as load-bearing.

**Owning specs:** [CONTENT.md](CONTENT.md#voice-system) (canonical migration), [STATE.md](STATE.md#useuserstore), [INTERACTIONS.md](INTERACTIONS.md#named-moments) (M6 voided).

**Resolution owed:**
1. Owner picks the single surviving voice (`[OPEN]`).
2. Execute steps 2–4 of the migration in CONTENT.md.
3. Step 5 (Profile/onboarding UI removal) is already a verified no-op — no tone UI exists.

### C7 — `fill_blank` drill type is a placeholder, not an implementation

**What's wrong:** [CONTENT.md](CONTENT.md#authoring-rules-spec-leads-code--content-must-conform) authoring rule says drills "mix `listen_pick` / `translate_pick` / `fill_blank`." The type ([constants/lessons/types.ts](../../constants/lessons/types.ts)) includes `fill_blank`. Routing in [components/lesson/drill/DrillPhase.tsx](../../components/lesson/drill/DrillPhase.tsx) sends `fill_blank` items to [components/lesson/drill/FillBlankPlaceholder.tsx](../../components/lesson/drill/FillBlankPlaceholder.tsx), which renders the literal text "Fill-in-the-blank / Not yet implemented — skipping." and a Skip button that resolves the drill as wrong. **Verified by reading both files directly.**

**Why it matters:** Lessons 2–8 (per the [CONTENT.md](CONTENT.md#lesson-slots) curriculum) will be authored against this rule. If a lesson includes `fill_blank` drills, learners will hit "Not yet implemented — skipping" and lose points on those items.

**Owning spec:** [CONTENT.md](CONTENT.md#authoring-rules-spec-leads-code--content-must-conform).

**Resolution owed:** Either (a) implement the `fill_blank` drill UI for real, or (b) remove `fill_blank` from the type union and the authoring-rules wording until it's built. Lessons 2–8 should not depend on `fill_blank` until one of those lands.

### C9 — Stale "NativeWind" text in repo README; CLAUDE.md verified clean

**What's wrong:** The repo's top-level [README.md](../../README.md) still references NativeWind in two places (lines 3 and 153). Code is clean — grep across `*.ts`/`*.tsx`/`*.js`/`*.jsx`/`*.json` for `nativewind` or `className=` returns zero hits outside `node_modules`. NativeWind was removed in commit `818e1ba` and the OppositeGame port finished in commit `01a516e` (see resolved C1). MMKV is similarly absent from both code and [.claude/CLAUDE.md](../../.claude/CLAUDE.md) — the only MMKV strings in the repo are an unrelated SHA in `package-lock.json` and the prior `docs/STATE.md` TODO line that was removed in this revision.

**Verified scope of the divergence:**
- [README.md](../../README.md) lines 3, 153 — stale NativeWind references.
- [.claude/CLAUDE.md](../../.claude/CLAUDE.md) — already clean (verified grep, zero hits for NativeWind or MMKV).

**Why it matters:** New contributors reading the README will install / configure NativeWind that the project doesn't use and that would conflict with the inline-styles + tokens rule.

**Owning spec:** [DESIGN.md](DESIGN.md#styling-rules-implicit-in-tokens) (style approach) — and the README itself.

**Resolution owed:** Edit [README.md](../../README.md) to drop NativeWind from the stack list (line 3) and from the "Styling" section (line 153), replacing with "inline styles + tokens in `constants/`". No CLAUDE.md edit needed beyond the new top-of-file session-start instruction.

## Resolved

### C6 — Lesson-completion idempotency contract now pinned by tests ✅

**What was wrong:** [STATE.md](STATE.md#streak-logic) locks the contract that `completeLesson` is idempotent, but no tests pinned it. A future refactor that removed the store's early-return would have silently re-inflated `xp` / `totalPhrasesLearned` / `totalMinutesPracticed` on every replay.

**Resolution:** [spec_progress_persistence.md](../../spec_docs/Sameecha/spec_progress_persistence.md) bundled the test fix. [__tests__/stores/progressStore.test.ts](../../__tests__/stores/progressStore.test.ts) calls `useProgressStore.completeLesson` twice with the same slug and asserts `xp`, `totalPhrasesLearned`, `totalMinutesPracticed`, `todayMinutes`, and `completedLessons.length` do not change on the second call (and that a higher score on replay does not award additional XP either).

**Owning spec:** [STATE.md](STATE.md#streak-logic).

**Status:** Closed 2026-05-20.

### C1 — OppositeGame ported off NativeWind ✅

**What was wrong:** `src/games/opposites/` was the last holdout still using NativeWind `className` props after the broader NativeWind rip-out.

**Resolution:** Commit `01a516e` ("refactor(opposites): port OppositeGame from NativeWind to inline styles + tokens") converted all 7 OppositeGame source files (`OppositeGame.tsx`, `components/FeedbackBanner.tsx`, `components/OptionButton.tsx`, and others touched in the commit) from Tailwind `className` props to inline `style={{...}}` objects backed by Colors/Spacing/Radius/Fonts tokens. Color realignment was applied (Tailwind emerald → `Colors.primary`, etc.).

**Verification (performed this session, not assumed from the commit message):**
- `git show --stat 01a516e` returns a real commit on 2026-05-19 touching `app/(games)/opposites.tsx`, `src/games/opposites/OppositeGame.tsx`, `src/games/opposites/components/FeedbackBanner.tsx`, `src/games/opposites/components/OptionButton.tsx` (and additional files truncated by `head -30`).
- `grep -rni 'nativewind\|className=' --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' --include='*.json'` across the repo (excluding `node_modules`) returns zero hits. The codebase is genuinely clean of NativeWind.

**Owning spec:** [DESIGN.md](DESIGN.md).

**Status:** Closed 2026-05-19. Stale README references survive — tracked separately as C9.
