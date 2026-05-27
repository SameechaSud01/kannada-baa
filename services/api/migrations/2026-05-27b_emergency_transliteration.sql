-- spec_docs/Sameecha/spec_db_wiring_games_and_overall_progress.md (PR2 of 3)
-- Additive migration: adds emergency_phrases.transliteration so the screen
-- can render the "Illi nillisi" line below the Kannada text (preserving
-- the UX shipped by data/emergency.json).
--
-- Idempotent. Safe to re-run.

alter table public.emergency_phrases
  add column if not exists transliteration text;

-- Backfill the 9 seeded rows from PR1 (deterministic UUIDs).
-- Values lifted verbatim from data/emergency.json[].roman.

update public.emergency_phrases set transliteration = 'Illi nillisi'
  where id = 'e1111111-0001-4001-8001-000000000001'::uuid;
update public.emergency_phrases set transliteration = 'Meter haaki'
  where id = 'e1111111-0001-4001-8001-000000000002'::uuid;
update public.emergency_phrases set transliteration = 'Eshtu?'
  where id = 'e1111111-0001-4001-8001-000000000003'::uuid;
update public.emergency_phrases set transliteration = 'Dayavittu sahaaya maadi'
  where id = 'e1111111-0002-4001-8001-000000000001'::uuid;
update public.emergency_phrases set transliteration = 'Nanage Kannada baralla'
  where id = 'e1111111-0002-4001-8001-000000000002'::uuid;
update public.emergency_phrases set transliteration = 'Swalpa nidhanavagi'
  where id = 'e1111111-0002-4001-8001-000000000003'::uuid;
update public.emergency_phrases set transliteration = 'Elli?'
  where id = 'e1111111-0003-4001-8001-000000000001'::uuid;
update public.emergency_phrases set transliteration = 'Beda'
  where id = 'e1111111-0003-4001-8001-000000000002'::uuid;
update public.emergency_phrases set transliteration = 'Paravagilla'
  where id = 'e1111111-0003-4001-8001-000000000003'::uuid;
