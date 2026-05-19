---
doc: SCOPE
status: reviewed
owner: samee
last-reviewed: 2026-05-19
related:
  - DESIGN.md
  - CONTENT.md
  - NAVIGATION.md
  - STATE.md
  - INTERACTIONS.md
---

# Scope

> **Decision layer.** `[LOCKED]` means decided — do not reopen, resolve, or build the opposite; changing it needs an explicit spec PR plus owner sign-off. `[OPEN]` means genuinely undecided — safe to propose, do not implement until closed. A `TODO:` is a real task only if it does not contradict a `[LOCKED]` item; a TODO that contradicts a locked decision is stale text to delete, not a task. Code-vs-spec divergences are tracked in [CONTRADICTIONS.md](CONTRADICTIONS.md).

The top-of-stack doc. Every other spec answers "how"; this one answers "what" and "why."

## Vision

`[OPEN]`

> **TODO:** One-paragraph vision statement to confirm or rewrite.
> Draft inferred from README + tone of [copy.ts](../../constants/copy.ts):
> *Kannada Baa is a conversational Kannada learning app for non-Kannadiga adults in Bengaluru who want to belong — not pass a test. It is warm, forgiving, and culturally proud, with a Karnataka identity baked into every pixel.*

## Target users

### Primary persona

`[OPEN]`

> **TODO:** Name, age range, situation, goals, frustrations.
> Inferred from copy + onboarding: 20–35 yr-old transplant to Bengaluru; lives or works in the city; reads English fluently; has zero/minimal Kannada; embarrassed about it; wants to engage with locals (auto drivers, shopkeepers, in-laws). Confirm or rewrite.

### Secondary personas

`[OPEN]`

> **TODO:** Anyone else worth designing for?
> - Heritage learners (Kannadiga diaspora kids relearning)?
> - Short-term travellers / business visitors?
> - Bengaluru-resident parents of school-age kids?

## What we're building (MVP)

`[LOCKED]` — pillars; row-level status notes match code.

| Pillar | Description | Status |
|---|---|---|
| Conversational lessons | 8-slot curriculum, scenario → intake → drill → output → done | 1/8 implemented |
| Practice games | 5 game types, replay from completed lessons | 2/5 partial (dictation, opposites); routing not wired |
| Streak + XP | Daily streak, score-based XP, weekly activity | Implemented; some metrics not surfaced |
| Emergency phrase guide | Offline JSON, 3 categories, TTS playback | Implemented (audio unverified) |
| Heritage section | Cultural notes per topic | Routing exists; content TBD |
| Auth | Supabase email/password | Implemented |
| Two-tone copy | `classic` vs `rowdy` voice modes | `[LOCKED: SCHEDULED FOR REMOVAL]` — see [CONTENT.md](CONTENT.md#ui-copy) and [CONTRADICTIONS.md](CONTRADICTIONS.md) C3 |

## Non-goals

`[LOCKED]`

| Out of scope | Why |
|---|---|
| Test / exam prep | Goal is conversation, not credentialing. |
| Streak shaming, leaderboard pressure | "Warm and forgiving" is a core principle (per README). |
| Dark mode | Explicitly disabled in `app.json` (`userInterfaceStyle: "light"`). |
| Web parity | iOS + Android only. Web target is dev convenience. |
| Other Indian languages | Kannada-specific identity is the point. |
| Recorded native-speaker audio (MVP) | Device TTS is acceptable for v1; recorded audio is post-MVP. |

> **TODO:** Confirm or expand.

## Roadmap

`[LOCKED]` — milestone structure. Dates and owners `[OPEN]`.

| Milestone | Scope | Target |
|---|---|---|
| M1 | Spec 01: scope, navigation, state, design (✅ done) | — |
| M2 | Spec 02: lesson content (lessons 2–8) | TODO |
| M3 | Spec 03: game runners (5 game UIs wired) | TODO |
| M4 | Spec 04: spaced repetition (Leitner SRS using `SelfRating`) | TODO |
| M5 | Spec 05: recorded audio + illustrations | TODO |
| M6 | Spec 06: heritage content | TODO |

> **TODO:** Owners and target dates per milestone.

## Success metrics

`[OPEN]`

> **TODO:** How do we know it's working? Pick 2–3 to commit to.
> Candidates:
> - D7 retention
> - Median streak length
> - % users who complete lesson 1
> - % users who reach lesson 4 (curriculum midpoint)
> - Daily goal completion rate
> - Self-report: "Did you actually use Kannada this week?"

## Open questions

`[OPEN]`

> Maintain as a running list. Move resolved items into the relevant spec doc.
> - Heritage content — long-form articles, or short cultural notes anchored to lessons?
> - When does a lesson "unlock"? Current: linear. Should adaptive paths exist?
> - Monetisation model — free, freemium, paid?
> - Account-recovery flow for forgotten passwords (Supabase ships one — adopt or replace?)

## Where this doc lives

This is the source of truth. The legacy `namma-app-v1-spec.docx` (gitignored) is historical; this doc supersedes it. Other docs ([DESIGN.md](DESIGN.md), [CONTENT.md](CONTENT.md), [NAVIGATION.md](NAVIGATION.md), [STATE.md](STATE.md), [INTERACTIONS.md](INTERACTIONS.md)) point back here for "why" decisions.
