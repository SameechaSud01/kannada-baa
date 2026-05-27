-- spec_docs/Sameecha/spec_db_wiring_games_and_overall_progress.md (PR3 of 3)
-- Additive: adds image_match_items.transliteration so the runner can render
-- the existing VOCAB_BANK.ph hint/accessibility label after the DB cutover.
--
-- Idempotent. Safe to re-run.

alter table public.image_match_items
  add column if not exists transliteration text;

-- Backfill the 22 seeded rows from PR1 (matched by lesson_no + sort_order).
-- Values are the romanizations from src/games/imagematch/data/vocabBank.ts
-- or the closest equivalent from lessons.content_json.reference.words.

update public.image_match_items im
   set transliteration = v.tr
  from public.lessons l,
       (values
          -- L1 Greetings
          (1, 1, 'namaste'),
          -- L2 Names
          (2, 1, 'mane'),
          (2, 2, 'hesaru'),
          (2, 3, 'ivaru'),
          -- L3 Wanting
          (3, 1, 'bēku'),
          (3, 2, 'bēḍa'),
          (3, 3, 'eṣṭu'),
          -- L4 Pointing
          (4, 1, 'illi'),
          (4, 2, 'alli'),
          (4, 3, 'idu'),
          (4, 4, 'adu'),
          (4, 5, 'elli'),
          -- L5 Easy verbs
          (5, 1, 'bā'),
          (5, 2, 'hōgu'),
          (5, 3, 'thinnu'),
          (5, 4, 'kuḍi'),
          (5, 5, 'nōḍu'),
          (5, 6, 'kēḷu'),
          (5, 7, 'malagu'),
          (5, 8, 'ōḍu'),
          -- L6 Questions
          (6, 1, 'yāru'),
          (6, 2, 'elli')
       ) as v(lesson_no, sort_order, tr)
 where l.lesson_no = v.lesson_no
   and im.lesson_id = l.id
   and im.sort_order = v.sort_order;
