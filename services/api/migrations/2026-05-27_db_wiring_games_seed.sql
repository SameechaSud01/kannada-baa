-- spec_docs/Sameecha/spec_db_wiring_games_and_overall_progress.md (PR1 of 3)
-- Companion seed migration. Run AFTER 2026-05-27_db_wiring_games_and_overall.sql.
-- Each block is idempotent — upserts on (lesson_id, sort_order) for game items
-- and on (id) for emergency_phrases.
--
-- All Kannada strings here are sourced from one of:
--   (a) constants/lessons content_json reference vocab seeded by
--       2026-05-20_lessons_content.sql (also currently marked verified=false).
--   (b) src/games/opposites/data/wordPairs.ts (existing TS data).
--   (c) data/emergency.json (existing JSON data).
--
-- NONE of this content has been audited by a native Kannada speaker.
-- The same `verified: false` caveat from content_json applies to every row here.
-- A native-speaker review pass is a prerequisite before declaring the wider
-- "DB wiring" work done; tracked in CONTRADICTIONS.md / CONTENT.md TODOs.
--
-- Lesson coverage:
--   L1 Greetings:           opposites 3,  dictation 6,  image_match 1
--   L2 Names:               opposites 5,  dictation 8,  image_match 3
--   L3 Wanting:             opposites 5,  dictation 8,  image_match 3
--   L4 Pointing:            opposites 5,  dictation 6,  image_match 5
--   L5 Easy verbs:          opposites 5,  dictation 8,  image_match 8
--   L6 Questions:           opposites 5,  dictation 8,  image_match 2
--   L7 Hard verbs:          empty   (lesson content not authored yet)
--   L8 Putting it together: empty   (lesson content not authored yet)
--
-- Where a lesson has fewer than ~4 items for a given game, PR2/PR3 runner
-- logic falls back to sampling from the union of completed-lesson items
-- to fill out a playable round.

-- ============================================================
-- Migration 5a — Opposites items
-- ============================================================
insert into public.opposites_items
  (lesson_id, sort_order, word, opposite, options_json, transliteration, meaning)
select l.id, s.sort_order, s.word, s.opposite, s.options_json::jsonb, s.transliteration, s.meaning
from (values
  -- ---- L1 Greetings: registers + universal greeting Y/N
  (1, 1, 'ನೀವು',         'ನೀನು',
        '[{"kn":"ನೀನು","tr":"nīnu","en":"you (neutral)"},{"kn":"ನಾನು","tr":"nānu","en":"I"},{"kn":"ಇವರು","tr":"ivaru","en":"this person"},{"kn":"ಅವರು","tr":"avaru","en":"that person"}]',
        'nīvu', 'you (respectful)'),
  (1, 2, 'ಚೆನ್ನಾಗಿ',     'ಕೆಟ್ಟದಾಗಿ',
        '[{"kn":"ಕೆಟ್ಟದಾಗಿ","tr":"keṭṭadāgi","en":"badly"},{"kn":"ಬೇಗ","tr":"bēga","en":"fast"},{"kn":"ನಿಧಾನ","tr":"nidhāna","en":"slow"},{"kn":"ಸ್ವಲ್ಪ","tr":"svalpa","en":"a little"}]',
        'chennāgi', 'well'),
  (1, 3, 'ಹೌದು',         'ಇಲ್ಲ',
        '[{"kn":"ಇಲ್ಲ","tr":"illa","en":"no"},{"kn":"ಸರಿ","tr":"sari","en":"okay"},{"kn":"ಬೇಕು","tr":"bēku","en":"want"},{"kn":"ಹೇಗೆ","tr":"hēge","en":"how"}]',
        'haudu', 'yes'),

  -- ---- L2 Names: demonstrative + pronoun + register pairs
  (2, 1, 'ಇವರು',         'ಅವರು',
        '[{"kn":"ಅವರು","tr":"avaru","en":"that person/those people"},{"kn":"ನಾನು","tr":"nānu","en":"I"},{"kn":"ನೀವು","tr":"nīvu","en":"you (respectful)"},{"kn":"ನಿಮ್ಮ","tr":"nimma","en":"your (respectful)"}]',
        'ivaru', 'this person / these people'),
  (2, 2, 'ಇವನು',         'ಅವನು',
        '[{"kn":"ಅವನು","tr":"avanu","en":"that person (he)"},{"kn":"ನಾನು","tr":"nānu","en":"I"},{"kn":"ನೀನು","tr":"nīnu","en":"you (neutral)"},{"kn":"ಹೆಸರು","tr":"hesaru","en":"name"}]',
        'ivanu', 'this person (he)'),
  (2, 3, 'ಇವಳು',         'ಅವಳು',
        '[{"kn":"ಅವಳು","tr":"avaḷu","en":"that person (she)"},{"kn":"ನಿಮ್ಮ","tr":"nimma","en":"your (respectful)"},{"kn":"ನಿನ್ನ","tr":"ninna","en":"your (neutral)"},{"kn":"ಮನೆ","tr":"mane","en":"house"}]',
        'ivaḷu', 'this person (she)'),
  (2, 4, 'ನಾನು',         'ನೀನು',
        '[{"kn":"ನೀನು","tr":"nīnu","en":"you (neutral)"},{"kn":"ನಿಮ್ಮ","tr":"nimma","en":"your (respectful)"},{"kn":"ಇವರು","tr":"ivaru","en":"this person"},{"kn":"ಹೆಸರು","tr":"hesaru","en":"name"}]',
        'nānu', 'I'),
  (2, 5, 'ನಿನ್ನ',         'ನಿಮ್ಮ',
        '[{"kn":"ನಿಮ್ಮ","tr":"nimma","en":"your (respectful)"},{"kn":"ನಾನು","tr":"nānu","en":"I"},{"kn":"ಇವನು","tr":"ivanu","en":"this he"},{"kn":"ಅವಳು","tr":"avaḷu","en":"that she"}]',
        'ninna', 'your (neutral)'),

  -- ---- L3 Wanting: want/don't-want, yes/no, less/more, do/don't-do, new/old
  (3, 1, 'ಬೇಕು',         'ಬೇಡ',
        '[{"kn":"ಬೇಡ","tr":"bēḍa","en":"don''t want"},{"kn":"ಹೌದು","tr":"haudu","en":"yes"},{"kn":"ಇಲ್ಲ","tr":"illa","en":"no"},{"kn":"ಸರಿ","tr":"sari","en":"okay"}]',
        'bēku', 'want / need'),
  (3, 2, 'ಹೌದು',         'ಇಲ್ಲ',
        '[{"kn":"ಇಲ್ಲ","tr":"illa","en":"no"},{"kn":"ಬೇಕು","tr":"bēku","en":"want"},{"kn":"ಬೇಡ","tr":"bēḍa","en":"don''t want"},{"kn":"ಎಷ್ಟು","tr":"eṣṭu","en":"how much"}]',
        'haudu', 'yes'),
  (3, 3, 'ಕಡಿಮೆ',         'ಜಾಸ್ತಿ',
        '[{"kn":"ಜಾಸ್ತಿ","tr":"jāsti","en":"a lot / too much"},{"kn":"ಸ್ವಲ್ಪ","tr":"svalpa","en":"a little"},{"kn":"ಇಲ್ಲಿ","tr":"illi","en":"here"},{"kn":"ಇದು","tr":"idu","en":"this"}]',
        'kaḍime', 'less'),
  (3, 4, 'ಮಾಡಿ',         'ಮಾಡಬೇಡಿ',
        '[{"kn":"ಮಾಡಬೇಡಿ","tr":"māḍabēḍi","en":"please don''t do"},{"kn":"ಬೇಕು","tr":"bēku","en":"want"},{"kn":"ಹೌದು","tr":"haudu","en":"yes"},{"kn":"ದಯವಿಟ್ಟು","tr":"dayaviṭṭu","en":"please"}]',
        'māḍi', 'please do'),
  (3, 5, 'ಹೊಸ',          'ಹಳೆಯ',
        '[{"kn":"ಹಳೆಯ","tr":"haḷeya","en":"old"},{"kn":"ಚೆಂದ","tr":"ceṃda","en":"beautiful"},{"kn":"ಶ್ರೇಷ್ಠ","tr":"śrēṣṭha","en":"great"},{"kn":"ಕಷ್ಟ","tr":"kaṣṭa","en":"difficult"}]',
        'hosa', 'new'),

  -- ---- L4 Pointing: here/there, this/that, above/below, front/behind, day/night
  (4, 1, 'ಇಲ್ಲಿ',         'ಅಲ್ಲಿ',
        '[{"kn":"ಅಲ್ಲಿ","tr":"alli","en":"there"},{"kn":"ಇದು","tr":"idu","en":"this"},{"kn":"ಅದು","tr":"adu","en":"that"},{"kn":"ಎಲ್ಲಿ","tr":"elli","en":"where"}]',
        'illi', 'here'),
  (4, 2, 'ಇದು',          'ಅದು',
        '[{"kn":"ಅದು","tr":"adu","en":"that"},{"kn":"ಇಲ್ಲಿ","tr":"illi","en":"here"},{"kn":"ಅಲ್ಲಿ","tr":"alli","en":"there"},{"kn":"ಎಲ್ಲಿ","tr":"elli","en":"where"}]',
        'idu', 'this'),
  (4, 3, 'ಮೇಲೆ',         'ಕೆಳಗೆ',
        '[{"kn":"ಕೆಳಗೆ","tr":"keḷage","en":"below"},{"kn":"ಹತ್ತಿರ","tr":"hattira","en":"near"},{"kn":"ದೂರ","tr":"dūra","en":"far"},{"kn":"ಒಳಗೆ","tr":"oḷage","en":"inside"}]',
        'mēle', 'above'),
  (4, 4, 'ಮುಂದೆ',         'ಹಿಂದೆ',
        '[{"kn":"ಹಿಂದೆ","tr":"hinde","en":"behind"},{"kn":"ಪಕ್ಕ","tr":"pakka","en":"beside"},{"kn":"ಮಧ್ಯ","tr":"madhya","en":"middle"},{"kn":"ತುದಿ","tr":"tudi","en":"end"}]',
        'munde', 'in front'),
  (4, 5, 'ಹಗಲು',         'ರಾತ್ರಿ',
        '[{"kn":"ರಾತ್ರಿ","tr":"rātri","en":"night"},{"kn":"ಮಧ್ಯಾಹ್ನ","tr":"madhyāhna","en":"noon"},{"kn":"ಸಂಜೆ","tr":"saṃje","en":"evening"},{"kn":"ಬೆಳಿಗ್ಗೆ","tr":"beḷigge","en":"morning"}]',
        'hagalu', 'daytime'),

  -- ---- L5 Easy verbs: come/go, give/take, sleep/wake, sit/stand, fast/slow
  (5, 1, 'ಬಾ',           'ಹೋಗು',
        '[{"kn":"ಹೋಗು","tr":"hōgu","en":"go"},{"kn":"ತಿನ್ನು","tr":"thinnu","en":"eat"},{"kn":"ಕುಡಿ","tr":"kuḍi","en":"drink"},{"kn":"ನೋಡು","tr":"nōḍu","en":"see"}]',
        'bā', 'come'),
  (5, 2, 'ಕೊಡು',         'ತೆಗೊ',
        '[{"kn":"ತೆಗೊ","tr":"tegeduko","en":"take"},{"kn":"ನಿಲ್ಲು","tr":"nillu","en":"stand"},{"kn":"ನಡೆ","tr":"naḍe","en":"walk"},{"kn":"ಕೇಳು","tr":"kēḷu","en":"listen"}]',
        'koḍu', 'give'),
  (5, 3, 'ಮಲಗು',         'ಎದ್ದು',
        '[{"kn":"ಎದ್ದು","tr":"eddu","en":"get up"},{"kn":"ನಿಲ್ಲು","tr":"nillu","en":"stand"},{"kn":"ನಡೆ","tr":"naḍe","en":"walk"},{"kn":"ಕುಳಿತುಕೋ","tr":"kuḷituko","en":"sit"}]',
        'malagu', 'sleep'),
  (5, 4, 'ಕುಳಿತುಕೋ',     'ನಿಲ್ಲು',
        '[{"kn":"ನಿಲ್ಲು","tr":"nillu","en":"stand"},{"kn":"ಓಡು","tr":"ōḍu","en":"run"},{"kn":"ನಡೆ","tr":"naḍe","en":"walk"},{"kn":"ಎದ್ದು","tr":"eddu","en":"get up"}]',
        'kuḷituko', 'sit'),
  (5, 5, 'ಬೇಗ',          'ನಿಧಾನ',
        '[{"kn":"ನಿಧಾನ","tr":"nidhāna","en":"slow"},{"kn":"ಮೆಲ್ಲ","tr":"mella","en":"gently"},{"kn":"ತಕ್ಷಣ","tr":"takṣaṇa","en":"instant"},{"kn":"ಸ್ವಲ್ಪ","tr":"svalpa","en":"a little"}]',
        'bēga', 'fast'),

  -- ---- L6 Questions: know/don't-know, yes/no, happy/sad, good/bad, hot/cold
  (6, 1, 'ಗೊತ್ತಾ',       'ಗೊತ್ತಿಲ್ಲ',
        '[{"kn":"ಗೊತ್ತಿಲ್ಲ","tr":"gottilla","en":"don''t know"},{"kn":"ಏನು","tr":"ēnu","en":"what"},{"kn":"ಯಾರು","tr":"yāru","en":"who"},{"kn":"ಹೌದು","tr":"haudu","en":"yes"}]',
        'gottā', 'do you know? (neutral)'),
  (6, 2, 'ಹೌದು',         'ಇಲ್ಲ',
        '[{"kn":"ಇಲ್ಲ","tr":"illa","en":"no"},{"kn":"ಸರಿ","tr":"sari","en":"okay"},{"kn":"ಬೇಕು","tr":"bēku","en":"want"},{"kn":"ಗೊತ್ತಿಲ್ಲ","tr":"gottilla","en":"don''t know"}]',
        'haudu', 'yes'),
  (6, 3, 'ಸಂತೋಷ',        'ದುಃಖ',
        '[{"kn":"ದುಃಖ","tr":"duḥkha","en":"sadness"},{"kn":"ನಗು","tr":"nagu","en":"laughter"},{"kn":"ಪ್ರೀತಿ","tr":"prīti","en":"love"},{"kn":"ಭಯ","tr":"bhaya","en":"fear"}]',
        'santoṣa', 'happiness'),
  (6, 4, 'ಒಳ್ಳೆಯ',        'ಕೆಟ್ಟ',
        '[{"kn":"ಕೆಟ್ಟ","tr":"keṭṭa","en":"bad"},{"kn":"ಸುಂದರ","tr":"sundara","en":"pretty"},{"kn":"ಸರಿ","tr":"sari","en":"correct"},{"kn":"ತಪ್ಪು","tr":"tappu","en":"wrong"}]',
        'oḷḷeya', 'good'),
  (6, 5, 'ಶೀತ',          'ಬಿಸಿ',
        '[{"kn":"ಬಿಸಿ","tr":"bisi","en":"hot"},{"kn":"ಮಳೆ","tr":"maḷe","en":"rain"},{"kn":"ಗಾಳಿ","tr":"gāḷi","en":"wind"},{"kn":"ಬೆಚ್ಚ","tr":"becca","en":"warm"}]',
        'śīta', 'cold')
) as s(lesson_no, sort_order, word, opposite, options_json, transliteration, meaning)
join public.lessons l on l.lesson_no = s.lesson_no
on conflict on constraint opposites_items_lesson_sort_unique do update
  set word            = excluded.word,
      opposite        = excluded.opposite,
      options_json    = excluded.options_json,
      transliteration = excluded.transliteration,
      meaning         = excluded.meaning;

-- ============================================================
-- Migration 5b — Dictation items
-- ============================================================
insert into public.dictation_items
  (lesson_id, sort_order, expected_answer, accepted_json, phonetic)
select l.id, s.sort_order, s.expected_answer, s.accepted_json::jsonb, s.phonetic
from (values
  -- ---- L1 Greetings
  (1, 1, 'ನಮಸ್ಕಾರ',       '["namaskara","namaskaara","namaskāra"]', 'na-mas-kā-ra'),
  (1, 2, 'ನಮಸ್ತೆ',         '["namaste","namasthe","namasthay"]', 'na-mas-te'),
  (1, 3, 'ಹೇಗಿದ್ದೀರ',     '["hegiddira","haegiddira","hegiddera"]', 'hē-gid-dī-ra'),
  (1, 4, 'ಚೆನ್ನಾಗಿದ್ದೇನೆ', '["chennagiddene","chennagidene","channagidene"]', 'chen-nā-gid-dē-ne'),
  (1, 5, 'ನೀವು',          '["nivu","neevu","neevoo"]', 'nī-vu'),
  (1, 6, 'ನೀನು',          '["ninu","neenu","neenoo"]', 'nī-nu'),

  -- ---- L2 Names
  (2, 1, 'ನಾನು',          '["nanu","naanu","naanoo"]', 'nā-nu'),
  (2, 2, 'ನೀನು',          '["ninu","neenu"]', 'nī-nu'),
  (2, 3, 'ಹೆಸರು',         '["hesaru","hesru","hesaroo"]', 'he-sa-ru'),
  (2, 4, 'ಮನೆ',          '["mane","manay","manae"]', 'ma-ne'),
  (2, 5, 'ಇವರು',          '["ivaru","evaru","ivru"]', 'i-va-ru'),
  (2, 6, 'ಅವರು',          '["avaru","avru"]', 'a-va-ru'),
  (2, 7, 'ನಿಮ್ಮ',          '["nimma","nima"]', 'nim-ma'),
  (2, 8, 'ನಿನ್ನ',          '["ninna","nina"]', 'nin-na'),

  -- ---- L3 Wanting
  (3, 1, 'ಬೇಕು',          '["beku","baeku","beku","bēku"]', 'bē-ku'),
  (3, 2, 'ಬೇಡ',           '["beda","baeda","bēḍa"]', 'bē-ḍa'),
  (3, 3, 'ಹೌದು',          '["haudu","haudhu","houdu"]', 'hau-du'),
  (3, 4, 'ಇಲ್ಲ',           '["illa","ila","illaa"]', 'il-la'),
  (3, 5, 'ಎಷ್ಟು',          '["eshtu","estu","ēṣṭu","eshtoo"]', 'eṣ-ṭu'),
  (3, 6, 'ಯಾಕೆ',          '["yake","yaake","yaakey"]', 'yā-ke'),
  (3, 7, 'ದಯವಿಟ್ಟು',      '["dayavittu","dayavittoo","dayaviṭṭu"]', 'da-ya-viṭ-ṭu'),
  (3, 8, 'ಧನ್ಯವಾದಗಳು',   '["dhanyavadagalu","dhanyavaadagalu","dhanyavādagaḷu"]', 'dha-nya-vā-da-ga-ḷu'),

  -- ---- L4 Pointing
  (4, 1, 'ಇಲ್ಲಿ',           '["illi","ili","ilee"]', 'il-li'),
  (4, 2, 'ಅಲ್ಲಿ',           '["alli","ali","alee"]', 'al-li'),
  (4, 3, 'ಇದು',           '["idu","edu","idoo"]', 'i-du'),
  (4, 4, 'ಅದು',           '["adu","adoo"]', 'a-du'),
  (4, 5, 'ಎಲ್ಲಿ',           '["elli","eli","elee"]', 'el-li'),
  (4, 6, 'ಹೇಗೆ',          '["hege","haege","heghe"]', 'hē-ge'),

  -- ---- L5 Easy verbs
  (5, 1, 'ಮಾಡು',          '["madu","maadu","māḍu"]', 'mā-ḍu'),
  (5, 2, 'ಹೋಗು',          '["hogu","hoogu","hōgu"]', 'hō-gu'),
  (5, 3, 'ಬಾ',            '["ba","baa"]', 'bā'),
  (5, 4, 'ತಿನ್ನು',         '["thinnu","tinnu","thinu"]', 'thin-nu'),
  (5, 5, 'ಕುಡಿ',          '["kudi","kuddi","kuḍi"]', 'ku-ḍi'),
  (5, 6, 'ನೋಡು',          '["nodu","noodu","nōḍu"]', 'nō-ḍu'),
  (5, 7, 'ಕೇಳು',          '["kelu","kaelu","kēḷu"]', 'kē-ḷu'),
  (5, 8, 'ಹೇಳು',          '["helu","haelu","hēḷu"]', 'hē-ḷu'),

  -- ---- L6 Questions
  (6, 1, 'ಯಾರು',          '["yaru","yaaru","yāru"]', 'yā-ru'),
  (6, 2, 'ಏನು',           '["enu","aenu","ēnu"]', 'ē-nu'),
  (6, 3, 'ಎಲ್ಲಿ',           '["elli","eli","elee"]', 'el-li'),
  (6, 4, 'ಯಾವಾಗ',        '["yavaga","yaavaaga","yāvāga"]', 'yā-vā-ga'),
  (6, 5, 'ಏಕೆ',           '["eke","aeke","ēke"]', 'ē-ke'),
  (6, 6, 'ಹೇಗೆ',          '["hege","haege","hēge"]', 'hē-ge'),
  (6, 7, 'ಯಾವದು',        '["yavadu","yaavadu","yāvadu"]', 'yā-va-du'),
  (6, 8, 'ಗೊತ್ತಿಲ್ಲ',       '["gottilla","gotilla","gōttilla"]', 'got-til-la')
) as s(lesson_no, sort_order, expected_answer, accepted_json, phonetic)
join public.lessons l on l.lesson_no = s.lesson_no
on conflict on constraint dictation_items_lesson_sort_unique do update
  set expected_answer = excluded.expected_answer,
      accepted_json   = excluded.accepted_json,
      phonetic        = excluded.phonetic;

-- ============================================================
-- Migration 5c — Image Match items
-- ============================================================
-- Emojis used as visual fallback. image_url stays null for now; runner
-- prefers image_url when present, falls back to emoji.
insert into public.image_match_items
  (lesson_id, sort_order, kannada, meaning, emoji)
select l.id, s.sort_order, s.kannada, s.meaning, s.emoji
from (values
  -- ---- L1 Greetings: sparse (most greeting vocab is abstract)
  (1, 1, 'ನಮಸ್ತೆ',   'hello (greeting)',         '🙏'),

  -- ---- L2 Names: concrete nouns from name vocab
  (2, 1, 'ಮನೆ',     'house',                     '🏠'),
  (2, 2, 'ಹೆಸರು',   'name',                      '✍️'),
  (2, 3, 'ಇವರು',    'this person / these people','👥'),

  -- ---- L3 Wanting: gestures / commerce concepts
  (3, 1, 'ಬೇಕು',    'want',                      '🙌'),
  (3, 2, 'ಬೇಡ',     'don''t want',               '🙅'),
  (3, 3, 'ಎಷ್ಟು',    'how much',                  '💰'),

  -- ---- L4 Pointing: directional pointing
  (4, 1, 'ಇಲ್ಲಿ',    'here',                      '📍'),
  (4, 2, 'ಅಲ್ಲಿ',    'there',                     '🏞️'),
  (4, 3, 'ಇದು',     'this',                      '👇'),
  (4, 4, 'ಅದು',     'that',                      '👉'),
  (4, 5, 'ಎಲ್ಲಿ',    'where',                     '❓'),

  -- ---- L5 Easy verbs: action emojis map naturally
  (5, 1, 'ಬಾ',      'come',                      '👋'),
  (5, 2, 'ಹೋಗು',    'go / walk',                 '🚶'),
  (5, 3, 'ತಿನ್ನು',   'eat',                       '🍽️'),
  (5, 4, 'ಕುಡಿ',    'drink',                     '🥤'),
  (5, 5, 'ನೋಡು',    'see',                       '👀'),
  (5, 6, 'ಕೇಳು',    'listen',                    '👂'),
  (5, 7, 'ಮಲಗು',    'sleep',                     '😴'),
  (5, 8, 'ಓಡು',     'run',                       '🏃'),

  -- ---- L6 Questions: question words mostly abstract
  (6, 1, 'ಯಾರು',    'who',                       '🤷'),
  (6, 2, 'ಎಲ್ಲಿ',    'where',                     '🗺️')
) as s(lesson_no, sort_order, kannada, meaning, emoji)
join public.lessons l on l.lesson_no = s.lesson_no
on conflict on constraint image_match_items_lesson_sort_unique do update
  set kannada = excluded.kannada,
      meaning = excluded.meaning,
      emoji   = excluded.emoji;

-- ============================================================
-- Migration 6 — Seed emergency_phrases from data/emergency.json (resolves C10)
-- ============================================================
-- Schema (per STATE.md scaffolded inventory):
--   emergency_phrases(id PK, category, kannada, meaning, audio_url null, sort_order)
--
-- The id values below are deterministic UUIDs so the upsert is stable across
-- re-runs. category mirrors the JSON group.id (auto / trouble / basics).
-- audio_url stays null — runtime TTS via deviceTtsAudioService handles audio.
--
-- After this lands, data/emergency.json becomes a seed artifact only;
-- app/emergency.tsx wires to fetchEmergencyPhrases() in PR2.

insert into public.emergency_phrases (id, category, kannada, meaning, audio_url, sort_order)
values
  -- Group: Auto / cab — matches data/emergency.json auto.items
  ('e1111111-0001-4001-8001-000000000001'::uuid, 'auto',    'ಇಲ್ಲಿ ನಿಲ್ಲಿಸಿ',            'Stop here',                       null, 1),
  ('e1111111-0001-4001-8001-000000000002'::uuid, 'auto',    'ಮೀಟರ್ ಹಾಕಿ',              'Please put the meter on',         null, 2),
  ('e1111111-0001-4001-8001-000000000003'::uuid, 'auto',    'ಎಷ್ಟು?',                   'How much is it?',                 null, 3),
  -- Group: Trouble — matches data/emergency.json trouble.items
  ('e1111111-0002-4001-8001-000000000001'::uuid, 'trouble', 'ದಯವಿಟ್ಟು ಸಹಾಯ ಮಾಡಿ',   'Please help',                     null, 1),
  ('e1111111-0002-4001-8001-000000000002'::uuid, 'trouble', 'ನನಗೆ ಕನ್ನಡ ಬರಲ್ಲ',         'I don''t know Kannada',          null, 2),
  ('e1111111-0002-4001-8001-000000000003'::uuid, 'trouble', 'ಸ್ವಲ್ಪ ನಿಧಾನವಾಗಿ',         'Slowly, please',                  null, 3),
  -- Group: Basics — matches data/emergency.json basics.items
  ('e1111111-0003-4001-8001-000000000001'::uuid, 'basics',  'ಎಲ್ಲಿ?',                   'Where?',                          null, 1),
  ('e1111111-0003-4001-8001-000000000002'::uuid, 'basics',  'ಬೇಡ',                      'No, don''t want',                null, 2),
  ('e1111111-0003-4001-8001-000000000003'::uuid, 'basics',  'ಪರವಾಗಿಲ್ಲ',                'It''s okay',                     null, 3)
on conflict (id) do update
  set category   = excluded.category,
      kannada    = excluded.kannada,
      meaning    = excluded.meaning,
      audio_url  = excluded.audio_url,
      sort_order = excluded.sort_order;
