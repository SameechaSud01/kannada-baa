# Claude Code Spec — Lesson Content Source (Kannada Baa)

## Goal
Lock the contract for **where lesson content lives** and **what
`public.lessons.content_json` is for**. The previous spec
([spec_progress_persistence.md](spec_progress_persistence.md))
deliberately left this `[OPEN]`; this spec closes it.

Scope is the source-of-truth question only: nothing here changes the
runtime read path, no new tables, no new app code beyond what already
exists.

## Context
- App reads lesson content from
  [constants/lessons/](../../constants/lessons/) at runtime (statically
  imported, no network).
- The `public.lessons` row exists per lesson; today it is the FK anchor
  for `public.user_lesson_progress` and nothing more.
- `content_json` is populated by
  [services/api/migrations/2026-05-20_lessons_content.sql](../../services/api/migrations/2026-05-20_lessons_content.sql)
  with PDF reference vocab pulled from
  `kannada reference/Kannada Reference — Lessons 1–6.pdf`.
- The PDF is unaudited by a native speaker; the JSON snapshot carries
  `"verified": false` to signal that.

## Decision

**`[LOCKED]` TypeScript constants are canonical for the playable
lesson. `content_json` is a reference snapshot only.**

| Artifact | Source of truth for | Read by | Write path |
|---|---|---|---|
| [constants/lessons/*.ts](../../constants/lessons/) | The playable `Lesson` (situation / intake / drill / output / resurfaces) | App runtime ([LESSONS](../../constants/lessons/index.ts)) | PR to TS file |
| `public.lessons.content_json` | Raw reference vocab from the PDF | Nobody at runtime — humans only, for now | Idempotent SQL migration |

The two are deliberately **not synced**. The TS lesson is an authored
curriculum decision; the reference snapshot is the raw material it was
authored from. A `Lesson` may legitimately use only a subset of the
reference rows, or rearrange them, or include phrases that are not in
the reference at all.

### `[OPEN]` — flipping to DB-canonical
This spec does not foreclose a later migration to DB-canonical lesson
content (server-fetched, cached, hot-updateable). When that work is
real, a follow-up spec opens it; this spec is the current state, not a
permanent verdict.

## `content_json` schema

**`[LOCKED]`** — the shape every lesson row's `content_json` conforms
to, today and on every future SQL update.

```json
{
  "reference": {
    "source":   "kannada-reference-lessons-1-6.pdf",
    "verified": false,
    "notes":    "optional — free-text editor note",
    "words":    [ <ReferenceWord> ],
    "phrases":  [ <ReferencePhrase> ]
  }
}
```

```ts
type ReferenceWord = {
  kannada: string;              // 'ನಮಸ್ಕಾರ'
  transliteration: string;      // 'namaskāra'
  english: string;              // gloss
  respectful?: {                // optional casual/respectful pair (L5, L6)
    kannada: string;
    transliteration: string;
  };
  notes?: string;
};

type ReferencePhrase = {
  kannada: string;
  transliteration: string;
  english: string;
  notes?: string;
};
```

**Rules:**
1. Every authored lesson row carries `content_json.reference.source`
   pointing to the artifact the vocab came from. Multiple sources are
   not allowed in one row — copy into a second lesson if needed.
2. `verified: false` is the default. Flip to `true` only after a native
   Kannada speaker has audited the rows; record the auditor and date in
   a `notes` field on the same object.
3. Empty references are represented as `{}` (not as a `reference` with
   empty arrays). Lessons L7 and L8 are `{}` today because no PDF
   covers them.
4. Word and phrase ordering inside the arrays mirrors the source PDF's
   table order. Do not re-sort.

## Non-goals (do not add)
- A runtime read of `content_json` from the app. The reference snapshot
  is an offline artifact today. Wiring it into a screen requires its
  own spec.
- A sync job between TS constants and `content_json`. Drift is allowed
  by design — the two carry different shapes.
- Per-phrase or per-drill server rows. The phrase model in
  [types.ts](../../constants/lessons/types.ts) stays TS-only.
- Versioning columns on `lessons`. If the PDF gets a v3, the SQL
  migration is re-run and overwrites in place; commit history is the
  version log.

## Acceptance criteria
- [ ] [services/api/migrations/2026-05-20_lessons_content.sql](../../services/api/migrations/2026-05-20_lessons_content.sql)
      compiles every populated row's `content_json` to the schema
      above. Verify by `select jsonb_object_keys(content_json) from
      public.lessons where content_json != '{}'::jsonb`; result is
      `reference` for every row.
- [ ] No app code path reads `public.lessons.content_json`. Verify by
      grep across `app/`, `components/`, `hooks/`, `stores/`,
      `services/` for the string `content_json` outside `migrations/`.
- [ ] L7 (`hard-verbs`) and L8 (`putting-it-together`) rows carry
      `content_json = '{}'::jsonb`. Verify by `select slug,
      content_json from public.lessons where lesson_no in (7, 8)`.
- [ ] [docs/foundation/STATE.md](../../docs/foundation/STATE.md) §Server
      state — Supabase has a row under "Tables" pointing here for the
      `lessons.content_json` contract.

## Risks / open questions
- `[OPEN]` — when L7 / L8 content is authored, where does the reference
  vocab come from? PDF v3 with two new sections, or scattered sources?
  Decide before authoring those lessons; until then, `{}` is honest.
- `[OPEN]` — fields not in the current schema (audio file refs, image
  refs, glosses per atom) may want to live in the reference snapshot
  later. Add as optional fields; do not break the existing shape.
- `[OPEN]` — divergence risk between TS lessons and the reference is
  intentional and not currently surfaced. If it becomes a content-bug
  source ("the lesson teaches ಊಟ but the PDF says ಊಟಾ"), revisit
  whether a sync check is worth building.

## Reference
- [docs/foundation/CONTENT.md](../../docs/foundation/CONTENT.md) — locks
  the `Lesson` and `Phrase` schemas the TS canonical layer conforms to.
- [docs/foundation/STATE.md](../../docs/foundation/STATE.md) — Supabase
  table list; this spec adds the `lessons.content_json` contract row.
- [spec_progress_persistence.md](spec_progress_persistence.md) — left
  this question `[OPEN]`; this spec closes it.
- `kannada reference/Kannada Reference — Lessons 1–6.pdf` — current
  reference artifact for lessons 1–6.
