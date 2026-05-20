# Spec docs

This folder is the source of truth for **what** Kannada Baa is and **how** it should behave. Specs lead — code follows.

If a spec says "X" and the code says "Y", the spec is correct unless we agree to update it. Open a PR against the spec first; the implementation follows.

## How to read these

| Doc | When to read |
|---|---|
| [SCOPE.md](SCOPE.md) | "Why does this app exist? What's in scope?" |
| [DESIGN.md](DESIGN.md) | "What color / spacing / font should I use? How should component X look?" |
| [CONTENT.md](CONTENT.md) | "What's the lesson schema? What strings live where?" |
| [NAVIGATION.md](NAVIGATION.md) | "What's the route tree? What's the auth gate logic?" |
| [STATE.md](STATE.md) | "What stores exist? What's persisted? What's the data model?" |
| [INTERACTIONS.md](INTERACTIONS.md) | "How should this animation feel? What's the loading state?" |
| [CONTRADICTIONS.md](CONTRADICTIONS.md) | "Where does the spec disagree with the code today, and who owes a fix?" |

## Conventions

- **Frontmatter** on every doc: `doc`, `status`, `owner`, `last-reviewed`, `related`.
- **Tables** for lists of facts (tokens, routes, store shapes).
- **Prose** only for rationale — use `**Why:**` callouts.
- **TODO:** blockquotes for known gaps. Filling these in is the active work.
- **Cross-doc links** liberally — e.g. [STATE.md](STATE.md).
- **Code references** by file path only — e.g. [colors.ts](../../constants/colors.ts). No line numbers (they rot).

## Decision layer — `[LOCKED]` and `[OPEN]`

Every spec section carries a tag.

- **`[LOCKED]`** — decided. Do not reopen, resolve, or build the opposite. Changing it needs an explicit spec PR plus owner sign-off.
- **`[OPEN]`** — genuinely undecided. Safe to propose; do not implement until closed.
- **`[LOCKED: SCHEDULED FOR REMOVAL]`** / **`[LOCKED: REMOVAL IN PROGRESS]`** / **`[LOCKED: REMOVED]`** — locked decisions about deletion. Treat as immutable; cross-ref the migration in the owning spec.

A `TODO:` is a real task only if it does not contradict a `[LOCKED]` item. A TODO that contradicts a locked decision is **stale text to delete**, not a task.

Code-vs-spec divergences (a `[LOCKED]` decision that the code does not yet reflect) live in [CONTRADICTIONS.md](CONTRADICTIONS.md), not as TODOs inside the owning spec.

## Status

Each doc carries `status:` in frontmatter:
- `draft` — first pass; many `[OPEN]` sections still pending tag review.
- `reviewed` — sections tagged `[LOCKED]` / `[OPEN]`; baseline accepted.
- `living` — actively maintained as code evolves (e.g. [CONTRADICTIONS.md](CONTRADICTIONS.md)).

Six core specs are currently at `reviewed`. [CONTRADICTIONS.md](CONTRADICTIONS.md) is `living`.

## Legacy

The historical `namma-app-v1-spec.docx` (gitignored, repo root) is superseded by these docs. Stale phrasing in the repo's top-level README and `.claude/CLAUDE.md` is tracked in [CONTRADICTIONS.md](CONTRADICTIONS.md) (see C9) rather than in this index.
