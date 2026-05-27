---
doc: SPEC_HOME_FUN_FACT
status: proposed
owner: samee
last-reviewed: 2026-05-27
related:
  - ../../docs/foundation/INTERACTIONS.md
  - ../../docs/foundation/DESIGN.md
  - ../../docs/foundation/CONTENT.md
  - ../../docs/foundation/STATE.md
---

# Home — replace "Word of the Day" with "Karnataka fun fact"

Swap the hero card on the home tab ([app/(tabs)/index.tsx](../../app/%28tabs%29/index.tsx)) from the existing **Word of the Day** (rotating Kannada phrase drawn from completed lessons, with a TTS Listen button and tap-to-open phrase sheet) to a static **Karnataka fun fact** card sourced from a new Supabase `karnataka_fun_facts` table. Also retires the scaffolded-but-unconsumed `word_of_the_day` table.

## Why

- Word of the Day relied on the user having completed lessons before it had real content; for a brand-new user it always rendered the same `STARTER_PHRASE` ("namaskara / Hello"). Low value on day 0.
- A culture/trivia card gives every user — completed-lesson count zero or not — something fresh and on-brand each day.
- DB-backed (vs. bundled JSON) means content edits don't need an app release. Mirrors the trajectory `emergency_phrases` took (resolved C10).
- Bundles the cleanup of the orphan `word_of_the_day` table while we're touching this corner of the schema, instead of leaving it more orphaned post-swap.

## Scope

In:
- **New migration** `services/api/migrations/2026-05-27d_karnataka_fun_facts.sql` — creates `public.karnataka_fun_facts`, enables RLS with `public read / no client writes`, seeds the 35 rows from `karnataka_fun_facts.csv`, and **drops `public.word_of_the_day`** in the same file.
- **New accessor** [services/api/karnataka_fun_facts.ts](../../services/api/karnataka_fun_facts.ts) — exports `fetchKarnatakaFunFacts(): Promise<FunFact[]>`. Modeled on [services/api/emergency.ts](../../services/api/emergency.ts).
- **New hook** [hooks/useKarnatakaFunFacts.ts](../../hooks/useKarnatakaFunFacts.ts) — TanStack Query wrapper, `staleTime: 24h`, modeled on [useEmergencyPhrases.ts](../../hooks/useEmergencyPhrases.ts).
- **Home screen swap** on [app/(tabs)/index.tsx](../../app/%28tabs%29/index.tsx) — replace the Word of the Day `Pressable` block with a non-interactive `View` rendering today's fun fact.
- **Removals from `index.tsx`:** `STARTER_PHRASE`, `wordOfDayIndex`, `completedPhrases` derivation, `wordOfDay`, `handleListenWordOfDay`, `Phrase` type import, `deviceTtsAudioService` import, `useModal` import, `PhraseDetailSheet` import, `Toasts` import (verify Toasts.audioFailed has no other caller on this screen before pulling).
- **STATE.md update** — delete the `word_of_the_day` row from the schema-snapshot table ([STATE.md:152](../../docs/foundation/STATE.md#L152)); add a `karnataka_fun_facts` row; remove `word_of_the_day` from the "still-scaffolded tables" TODO at [STATE.md:177](../../docs/foundation/STATE.md#L177).
- **INTERACTIONS.md update** — delete the "Home — Word of the Day 'Listen' | TTS of phrase" row at [INTERACTIONS.md:95](../../docs/foundation/INTERACTIONS.md#L95).
- **`data/karnataka_fun_facts.json`** — generated from the CSV and committed alongside the migration as a seed artifact + loading fallback (see Card visual / fallback below). Not the live data source post-launch.

Out:
- Category filtering, "next fact" tap, browsing UI. Single card, one fact per day, no controls.
- Admin UI for editing facts. Authoring happens directly in the source CSV / via SQL until proven otherwise.
- Migrating other scaffolded-but-unconsumed tables (`conversation_items/progress`, `quick_quiz_items/progress`). The STATE.md TODO at line 177 keeps those entries.
- Removing `karnataka_fun_facts.csv` / `karnataka_fun_facts.numbers` from the repo root. They stay as authoring/seed artifacts (mirrors how `data/emergency.json` continues to exist post-DB-migration).

## Decisions

`[LOCKED]` Data source: **Supabase `karnataka_fun_facts` table** (fetched via TanStack Query, `staleTime: 24h`). A bundled `data/karnataka_fun_facts.json` ships alongside as the loading fallback only — not the live data source. Confirmed 2026-05-27 (flipped from initial "JSON only" after user requested DB change in the same session).

`[LOCKED]` Card behavior: **static read-only card.** No tap handler, no modal, no Listen button, no TTS, no `accessibilityRole="button"`. Just a `View` with eyebrow + category + fact text. Confirmed 2026-05-27.

`[LOCKED]` Rotation: **once per day, deterministic by date hash.** Sum char codes of `YYYY-MM-DD` and mod by `facts.length`. Same fact for the whole calendar day; rolls over at local midnight. Helper named `factOfDayIndex`, lives inline in `index.tsx`. Confirmed 2026-05-27.

`[LOCKED]` `word_of_the_day` table: **dropped** in the same migration that creates `karnataka_fun_facts`. Verified zero code references via `grep -rn "word_of_the_day" services/ hooks/ stores/ components/ app/` (returns nothing). Only references are in [STATE.md](../../docs/foundation/STATE.md). Confirmed 2026-05-27.

## DB schema

`[LOCKED]` New table:

```sql
create table public.karnataka_fun_facts (
  id          uuid primary key default gen_random_uuid(),
  fact_no     int not null unique check (fact_no between 1 and 999),
  category    text not null check (category in ('History','Food','Cinema','Literature','Culture','Nature')),
  fact        text not null,
  created_at  timestamptz not null default now()
);

alter table public.karnataka_fun_facts enable row level security;

create policy "karnataka_fun_facts: public read"
  on public.karnataka_fun_facts for select
  to anon, authenticated
  using (true);

-- No insert/update/delete policies. Writes go through service-role only.
```

Then `insert ... on conflict (fact_no) do update set category = excluded.category, fact = excluded.fact;` for the 35 seed rows (idempotent, matches the emergency seed pattern).

Then in the same migration file:

```sql
drop table if exists public.word_of_the_day;
```

Single migration file, two concerns, but one atomic schema change to "the home-card data substrate." Keeping them together makes the rollback story explicit.

## Accessor + hook

`[LOCKED]` Shapes:

```ts
// services/api/karnataka_fun_facts.ts
export type FunFactCategory =
  | 'History' | 'Food' | 'Cinema' | 'Literature' | 'Culture' | 'Nature';

export type FunFact = {
  id: string;
  factNo: number;
  category: FunFactCategory;
  fact: string;
};

export async function fetchKarnatakaFunFacts(): Promise<FunFact[]> { /* … */ }
```

Hook:

```ts
// hooks/useKarnatakaFunFacts.ts
export function useKarnatakaFunFacts() {
  return useQuery<FunFact[]>({
    queryKey: ['karnataka-fun-facts'],
    queryFn: fetchKarnatakaFunFacts,
    staleTime: 24 * 60 * 60 * 1000,
  });
}
```

Order returned: ascending by `fact_no`. The home card hashes the date against array length, so order stability matters.

## Data shape (seed + fallback JSON)

`[LOCKED]` `data/karnataka_fun_facts.json` is a JSON array of 35 objects (same as the CSV, fact_no === CSV "No"):

```json
[
  {
    "factNo": 1,
    "category": "History",
    "fact": "Karnataka, a state in South India, was formed on November 1, 1956, and was renamed from 'Mysore State' to 'Karnataka' in 1973."
  }
]
```

This JSON serves two purposes only:
1. Reviewers can read the seeded content without running the migration.
2. The home card uses it as a synchronous **loading-state fallback** (see below) so first-render is never empty.

## Card visual + states

`[LOCKED]` Matches the existing home-card rhythm so the swap doesn't reflow the screen.

| Property | Value |
|---|---|
| Container | `backgroundColor: Colors.surfaceContainerLow`, `borderRadius: Radius.xl`, `padding: Spacing.xxl`, `marginBottom: Spacing.lg`. Plain `View`, not `Pressable`. |
| Eyebrow | "Did you know?" — `Fonts.dmSans.bold`, `fontSize: moderateScale(11)`, `letterSpacing: 2`, `color: Colors.tertiary`, `textTransform: 'uppercase'`. |
| Category chip | Category name in `Fonts.dmSans.bold`, `fontSize: moderateScale(10)`, `letterSpacing: 1.4`, `color: Colors.secondary`, `textTransform: 'uppercase'`. Rendered directly under the eyebrow with `marginTop: moderateScale(4)`. No pill/background — colored text only. |
| Fact text | `Fonts.lora.italic`, `fontSize: moderateScale(16)`, `lineHeight: moderateScale(24)`, `color: Colors.primary`, `marginTop: moderateScale(14)`. No `numberOfLines` cap; no `adjustsFontSizeToFit`. |
| `maxFontSizeMultiplier` | 1.3 on fact text, 1.4 on eyebrow/category. |

`[LOCKED]` State handling — per [CLAUDE.md](../../.claude/CLAUDE.md#data-fetching) ("every async operation handles loading, error, and empty states explicitly"):

| State | Render |
|---|---|
| Loading (no cache) | **Fall back to `data/karnataka_fun_facts.json`** — pick today's fact from the bundled JSON using the same `factOfDayIndex`. No skeleton, no flicker. Once the DB query resolves, swap to the DB result if it differs. |
| Loaded | Render today's fact from the query data. |
| Error | Same fallback as loading — render from bundled JSON. Log the error via `console.warn('[home] fun-facts fetch failed', err)`. No user-visible error banner; the card has content either way. |
| Empty (`data === []`) | Same fallback as loading. Should not happen in practice — the seed migration guarantees 35 rows. |

> **Why bundled-JSON fallback instead of a skeleton:** the card needs to be content-rich on first cold start. A skeleton on a hero card is uglier than a real fact that may briefly differ from the DB. Once the DB returns and react-query caches it (24h staleTime), subsequent renders are effectively synchronous.

## Acceptance criteria

1. On a fresh install with zero completed lessons, the home tab renders the fun fact card (DB or fallback). No "Word of the day" string appears anywhere in the app.
2. The fact rendered on calendar day N is the same across cold starts that day; the next calendar day shows a different fact.
3. Tapping the card does nothing — no press feedback, no modal, no navigation, no `accessibilityRole="button"`.
4. No TTS playback is triggered from anywhere on the home tab. `deviceTtsAudioService` is not imported in [app/(tabs)/index.tsx](../../app/%28tabs%29/index.tsx).
5. Longest fact in the dataset (No. 22, ~265 chars) renders without clipping on iPhone SE.
6. `grep -rn "Word of the day\|wordOfDay\|wordOfDayIndex\|STARTER_PHRASE\|word_of_the_day" app/ components/ services/ hooks/ stores/ docs/` returns zero hits outside the new migration file and CONTRADICTIONS.md history.
7. The new migration runs cleanly on a fresh DB (`supabase db reset`) — table created with RLS, 35 rows seeded, `word_of_the_day` table absent post-migration.
8. With network off, the home card still shows a fact (the bundled-JSON fallback path works).
9. STATE.md schema snapshot lists `karnataka_fun_facts` and does **not** list `word_of_the_day`.
10. INTERACTIONS.md sound-cues table does **not** list "Home — Word of the Day 'Listen'".

## Risks / known gaps

- **Migration ordering.** The drop of `word_of_the_day` is irreversible without a Supabase point-in-time restore. Confirmed zero code references and no PII (table is unused), so the blast radius is "the row in STATE.md and the table definition itself." Worth a manual `select count(*) from public.word_of_the_day;` against staging before running the drop, just to confirm no out-of-band content was inserted by hand.
- **`PhraseDetailSheet` / `Toasts.audioFailed` may still be used elsewhere.** Don't delete the component or the toast catalog entry — just remove the imports from `index.tsx`. Verify with grep before the cleanup PR lands.
- **CSV provenance.** Spreadsheet contents weren't fact-checked beyond a skim. If any item is later found wrong, fix in: the CSV (authoring artifact), `data/karnataka_fun_facts.json` (fallback), and a follow-up `update public.karnataka_fun_facts set fact = '…' where fact_no = N;` migration.
- **Fallback drift.** If the DB content is edited but the bundled JSON isn't updated in the next app release, users on a fresh install will briefly see the old fact before the DB query resolves. Acceptable trade-off — the JSON exists for first-paint, not as a synchronized mirror.
