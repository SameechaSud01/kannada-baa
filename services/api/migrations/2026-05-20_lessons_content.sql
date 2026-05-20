-- Populate public.lessons.content_json with PDF reference vocab.
--
-- Source: kannada reference/Kannada Reference — Lessons 1–6.pdf
-- All idempotent: every block is a slug-keyed UPDATE.
--
-- Shape (provisional — formalize in spec_lesson_content_source.md):
--   {
--     "reference": {
--       "source":   "kannada-reference-lessons-1-6.pdf",
--       "verified": false,                     -- needs native-speaker audit
--       "words":    [ { kannada, transliteration, english, respectful?, notes? } ],
--       "phrases":  [ { kannada, transliteration, english, notes? } ]
--     }
--   }
--
-- TS constants in constants/lessons/*.ts remain canonical for the playable
-- Lesson object. content_json holds the raw reference vocab only.
--
-- L7 (Hard verbs) and L8 (Putting it together) intentionally untouched —
-- no PDF source. Author populates when those lessons are written.

-- ============================================================
-- Lesson 1 — Greetings
-- ============================================================
update public.lessons
set content_json = $json$
{
  "reference": {
    "source": "kannada-reference-lessons-1-6.pdf",
    "verified": false,
    "words": [
      {"kannada": "ನಮಸ್ಕಾರ", "transliteration": "namaskāra", "english": "Hello / greetings"},
      {"kannada": "ನಮಸ್ತೆ", "transliteration": "namaste", "english": "Hello"},
      {"kannada": "ಹೇಗಿದ್ದೀರ?", "transliteration": "hēgiddīra?", "english": "How are you? (respectful)"},
      {"kannada": "ಹೇಗಿದ್ದೀಯ?", "transliteration": "hēgiddīya?", "english": "How are you? (neutral)"},
      {"kannada": "ಚೆನ್ನಾಗಿದ್ದೇನೆ", "transliteration": "chennāgiddēne", "english": "I am fine"},
      {"kannada": "ಚೆನ್ನಾಗಿದ್ದೇವೆ", "transliteration": "chennāgiddēve", "english": "We are fine"},
      {"kannada": "ನೀವು", "transliteration": "nīvu", "english": "You (respectful/plural)"},
      {"kannada": "ನೀನು", "transliteration": "nīnu", "english": "You (neutral/singular)"}
    ],
    "phrases": [
      {"kannada": "ನಮಸ್ತೆ, ಹೇಗಿದ್ದೀರ?", "transliteration": "namaste, hēgiddīra?", "english": "Hello, how are you? (respectful)"},
      {"kannada": "ನಮಸ್ತೆ, ಹೇಗಿದ್ದೀಯ?", "transliteration": "namaste, hēgiddīya?", "english": "Hello, how are you? (neutral)"},
      {"kannada": "ನೀವು ಚೆನ್ನಾಗಿದ್ದೀರಾ?", "transliteration": "nīvu chennāgiddīrā?", "english": "Are you fine? (respectful)"},
      {"kannada": "ನೀನು ಚೆನ್ನಾಗಿದ್ದೀಯಾ?", "transliteration": "nīnu chennāgiddīyā?", "english": "Are you fine? (neutral)"},
      {"kannada": "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ", "transliteration": "nānu chennāgiddēne", "english": "I am fine"},
      {"kannada": "ನಾವು ಚೆನ್ನಾಗಿದ್ದೇವೆ", "transliteration": "nāvu chennāgiddēve", "english": "We are fine"}
    ]
  }
}
$json$::jsonb
where slug = 'greetings';

-- ============================================================
-- Lesson 2 — Names and People
-- ============================================================
update public.lessons
set content_json = $json$
{
  "reference": {
    "source": "kannada-reference-lessons-1-6.pdf",
    "verified": false,
    "words": [
      {"kannada": "ನಾನು", "transliteration": "nānu", "english": "I"},
      {"kannada": "ನೀನು", "transliteration": "nīnu", "english": "You (neutral)"},
      {"kannada": "ನೀವು", "transliteration": "nīvu", "english": "You (respectful)"},
      {"kannada": "ನಿನ್ನ", "transliteration": "ninna", "english": "Your (neutral)"},
      {"kannada": "ನಿಮ್ಮ", "transliteration": "nimma", "english": "Your (respectful)"},
      {"kannada": "ಇವರು", "transliteration": "ivaru", "english": "This person / these people"},
      {"kannada": "ಇವನು", "transliteration": "ivanu", "english": "This person (he)"},
      {"kannada": "ಇವಳು", "transliteration": "ivaḷu", "english": "This person (she)"},
      {"kannada": "ಅವರು", "transliteration": "avaru", "english": "That person / those people"},
      {"kannada": "ಅವನು", "transliteration": "avanu", "english": "That person (he)"},
      {"kannada": "ಅವಳು", "transliteration": "avaḷu", "english": "That person (she)"},
      {"kannada": "ಹೆಸರು", "transliteration": "hesaru", "english": "Name"},
      {"kannada": "ಮನೆ", "transliteration": "mane", "english": "House / home"}
    ],
    "phrases": [
      {"kannada": "ನಿಮ್ಮ ಹೆಸರು ಏನು?", "transliteration": "nimma hesaru ēnu?", "english": "What is your name? (respectful)"},
      {"kannada": "ನಿನ್ನ ಹೆಸರು ಏನು?", "transliteration": "ninna hesaru ēnu?", "english": "What is your name? (neutral)"},
      {"kannada": "ನಾನು ಪ್ರಿಯಾ", "transliteration": "nānu priyā", "english": "I am Priya"},
      {"kannada": "ನಿಮ್ಮ ಮನೆ ಎಲ್ಲಿ?", "transliteration": "nimma mane elli?", "english": "Where is your house?"}
    ]
  }
}
$json$::jsonb
where slug = 'names';

-- ============================================================
-- Lesson 3 — Shopping and Bargaining (Wanting)
-- ============================================================
update public.lessons
set content_json = $json$
{
  "reference": {
    "source": "kannada-reference-lessons-1-6.pdf",
    "verified": false,
    "words": [
      {"kannada": "ನನಗೆ", "transliteration": "nanage", "english": "For me / to me"},
      {"kannada": "ನಮಗೆ", "transliteration": "namage", "english": "For us / to us"},
      {"kannada": "ನಿನಗೆ", "transliteration": "ninage", "english": "For you (neutral)"},
      {"kannada": "ನಿಮಗೆ", "transliteration": "nimage", "english": "For you (respectful)"},
      {"kannada": "ಬೇಕು", "transliteration": "bēku", "english": "Want / need"},
      {"kannada": "ಬೇಡ", "transliteration": "bēḍa", "english": "Don't want"},
      {"kannada": "ಹೌದು", "transliteration": "haudu", "english": "Yes"},
      {"kannada": "ಇಲ್ಲ", "transliteration": "illa", "english": "No"},
      {"kannada": "ಇಲ್ಲಿ", "transliteration": "illi", "english": "Here"},
      {"kannada": "ಎಷ್ಟು", "transliteration": "eṣṭu", "english": "How much"},
      {"kannada": "ಯಾಕೆ", "transliteration": "yāke", "english": "Why"},
      {"kannada": "ಕಡಿಮೆ", "transliteration": "kaḍime", "english": "Less"},
      {"kannada": "ಸ್ವಲ್ಪ", "transliteration": "svalpa", "english": "A little"},
      {"kannada": "ಜಾಸ್ತಿ", "transliteration": "jāsti", "english": "A lot / too much"},
      {"kannada": "ಮಾಡಿ", "transliteration": "māḍi", "english": "Please do"},
      {"kannada": "ಮಾಡಬೇಡಿ", "transliteration": "māḍabēḍi", "english": "Please don't do"},
      {"kannada": "ದಯವಿಟ್ಟು", "transliteration": "dayaviṭṭu", "english": "Please"},
      {"kannada": "ಧನ್ಯವಾದಗಳು", "transliteration": "dhanyavādagaḷu", "english": "Thank you"}
    ],
    "phrases": [
      {"kannada": "ನನಗೆ ಇದು ಬೇಕು", "transliteration": "nanage idu bēku", "english": "I want this"},
      {"kannada": "ನಮಗೆ ಅದು ಬೇಕು", "transliteration": "namage adu bēku", "english": "We want that"},
      {"kannada": "ನಿನಗೆ ಬೇಕಾ?", "transliteration": "ninage bēkā?", "english": "Do you want? (neutral)"},
      {"kannada": "ನಿಮಗೆ ಬೇಕಾ?", "transliteration": "nimage bēkā?", "english": "Do you want? (respectful)"},
      {"kannada": "ಹೌದು, ಬೇಕು", "transliteration": "haudu, bēku", "english": "Yes, I want"},
      {"kannada": "ಇಲ್ಲ, ನನಗೆ ಬೇಡ", "transliteration": "illa, nanage bēḍa", "english": "No, I don't want"},
      {"kannada": "ಇದು ಎಷ್ಟು?", "transliteration": "idu eṣṭu?", "english": "How much is this?"},
      {"kannada": "ಯಾಕೆ?", "transliteration": "yāke?", "english": "Why?"},
      {"kannada": "ಇದು ಕಮ್ಮಿ ಮಾಡಿ", "transliteration": "idu kammi māḍi", "english": "Please reduce the price"},
      {"kannada": "ಇದು ಜಾಸ್ತಿ", "transliteration": "idu jāsti", "english": "This is too much"},
      {"kannada": "ಸ್ವಲ್ಪ", "transliteration": "svalpa", "english": "A little"},
      {"kannada": "ದಯವಿಟ್ಟು ಮಾಡಿ", "transliteration": "dayaviṭṭu māḍi", "english": "Please do"},
      {"kannada": "ದಯವಿಟ್ಟು ಮಾಡಬೇಡಿ", "transliteration": "dayaviṭṭu māḍabēḍi", "english": "Please don't"}
    ]
  }
}
$json$::jsonb
where slug = 'wanting';

-- ============================================================
-- Lesson 4 — Here, There, Where, How (Pointing)
-- ============================================================
update public.lessons
set content_json = $json$
{
  "reference": {
    "source": "kannada-reference-lessons-1-6.pdf",
    "verified": false,
    "words": [
      {"kannada": "ಇಲ್ಲಿ", "transliteration": "illi", "english": "Here"},
      {"kannada": "ಇದು", "transliteration": "idu", "english": "This"},
      {"kannada": "ಅಲ್ಲಿ", "transliteration": "alli", "english": "There"},
      {"kannada": "ಅದು", "transliteration": "adu", "english": "That"},
      {"kannada": "ಎಲ್ಲಿ", "transliteration": "elli", "english": "Where"},
      {"kannada": "ಹೇಗೆ", "transliteration": "hēge", "english": "How"}
    ],
    "phrases": [
      {"kannada": "ಅದು ಎಲ್ಲಿ?", "transliteration": "adu elli?", "english": "Where is that?"},
      {"kannada": "ಇದು ಎಲ್ಲಿ?", "transliteration": "idu elli?", "english": "Where is this?"},
      {"kannada": "ನಿಮ್ಮ ಮನೆ ಎಲ್ಲಿ?", "transliteration": "nimma mane elli?", "english": "Where is your house?"}
    ]
  }
}
$json$::jsonb
where slug = 'pointing';

-- ============================================================
-- Lesson 5 — Easy verbs (from PDF L5)
-- ============================================================
-- Note: PDF L5 has 17 verbs; new syllabus splits easy vs hard (L5 vs L7).
-- All 17 dropped here for now; reassign half to L7 when that lesson is authored.
update public.lessons
set content_json = $json$
{
  "reference": {
    "source": "kannada-reference-lessons-1-6.pdf",
    "verified": false,
    "notes": "PDF lists 17 verbs together; new syllabus splits into easy (L5) and hard (L7). Reassign half to L7 when authored.",
    "words": [
      {"kannada": "ಮಾಡು", "transliteration": "māḍu", "english": "Do / make", "respectful": {"kannada": "ಮಾಡಿ", "transliteration": "māḍi"}},
      {"kannada": "ಹೋಗು", "transliteration": "hōgu", "english": "Go", "respectful": {"kannada": "ಹೋಗಿ", "transliteration": "hōgi"}},
      {"kannada": "ಬಾ", "transliteration": "bā", "english": "Come", "respectful": {"kannada": "ಬನ್ನಿ", "transliteration": "banni"}},
      {"kannada": "ತಿನ್ನು", "transliteration": "thinnu", "english": "Eat", "respectful": {"kannada": "ತಿನ್ನಿ", "transliteration": "tinni"}},
      {"kannada": "ಕುಡಿ", "transliteration": "kuḍi", "english": "Drink", "respectful": {"kannada": "ಕುಡಿಯಿರಿ", "transliteration": "kuḍiyiri"}},
      {"kannada": "ನೋಡು", "transliteration": "nōḍu", "english": "See / watch", "respectful": {"kannada": "ನೋಡಿ", "transliteration": "nōḍi"}},
      {"kannada": "ಕೇಳು", "transliteration": "kēḷu", "english": "Ask / listen", "respectful": {"kannada": "ಕೇಳಿ", "transliteration": "kēḷi"}},
      {"kannada": "ಹೇಳು", "transliteration": "hēḷu", "english": "Say / tell", "respectful": {"kannada": "ಹೇಳಿ", "transliteration": "hēḷi"}},
      {"kannada": "ಕೊಡು", "transliteration": "koḍu", "english": "Give", "respectful": {"kannada": "ಕೊಡಿ", "transliteration": "koḍi"}},
      {"kannada": "ತೆಗೊ", "transliteration": "tegeduko", "english": "Take", "respectful": {"kannada": "ತೆಗೊಳಿ", "transliteration": "tegedukoḷḷi"}},
      {"kannada": "ಕುಳಿತುಕೋ", "transliteration": "kuḷituko", "english": "Sit", "respectful": {"kannada": "ಕುಳಿತುಕೊಳ್ಳಿ", "transliteration": "kuḷitukoḷḷi"}},
      {"kannada": "ನಿಲ್ಲು", "transliteration": "nillu", "english": "Stand / stop", "respectful": {"kannada": "ನಿಲ್ಲಿ", "transliteration": "nilli"}},
      {"kannada": "ಮಲಗು", "transliteration": "malagu", "english": "Sleep", "respectful": {"kannada": "ಮಲಗಿ", "transliteration": "malagi"}},
      {"kannada": "ಎದ್ದು", "transliteration": "eddu", "english": "Get up", "respectful": {"kannada": "ಎದ್ದೇಳಿ", "transliteration": "eddēḷi"}},
      {"kannada": "ಓಡು", "transliteration": "ōḍu", "english": "Run", "respectful": {"kannada": "ಓಡಿ", "transliteration": "ōḍi"}},
      {"kannada": "ನಡೆ", "transliteration": "naḍe", "english": "Walk", "respectful": {"kannada": "ನಡೆಯಿರಿ", "transliteration": "naḍeyiri"}},
      {"kannada": "ಮುಚ್ಚು", "transliteration": "mucchu", "english": "Close", "respectful": {"kannada": "ಮುಚ್ಚಿ", "transliteration": "mucchi"}}
    ],
    "phrases": []
  }
}
$json$::jsonb
where slug = 'easy-verbs';

-- ============================================================
-- Lesson 6 — Questions (Who, What, Where)
-- ============================================================
update public.lessons
set content_json = $json$
{
  "reference": {
    "source": "kannada-reference-lessons-1-6.pdf",
    "verified": false,
    "words": [
      {"kannada": "ಯಾರು", "transliteration": "yāru", "english": "Who"},
      {"kannada": "ಏನು", "transliteration": "ēnu", "english": "What"},
      {"kannada": "ಎಲ್ಲಿ", "transliteration": "elli", "english": "Where"},
      {"kannada": "ಯಾವಾಗ", "transliteration": "yāvāga", "english": "When"},
      {"kannada": "ಏಕೆ", "transliteration": "ēke", "english": "Why"},
      {"kannada": "ಹೇಗೆ", "transliteration": "hēge", "english": "How"},
      {"kannada": "ಯಾವದು", "transliteration": "yāvadu", "english": "Which"},
      {"kannada": "ಎಷ್ಟು", "transliteration": "eṣṭu", "english": "How much / many"},
      {"kannada": "ಯಾರದು", "transliteration": "yāradu", "english": "Whose"},
      {"kannada": "ಯಾರಿಗೆ", "transliteration": "yārige", "english": "To whom"},
      {"kannada": "ಇಲ್ಲಿ", "transliteration": "illi", "english": "Here"},
      {"kannada": "ಅಲ್ಲಿ", "transliteration": "alli", "english": "There"},
      {"kannada": "ಎಲ್ಲಿಗೆ", "transliteration": "ellige", "english": "To where"},
      {"kannada": "ಈಗ", "transliteration": "īga", "english": "Now"},
      {"kannada": "ಹೌದು", "transliteration": "haudu", "english": "Yes"},
      {"kannada": "ಇಲ್ಲ", "transliteration": "illa", "english": "No / not"},
      {"kannada": "ಸರಿ", "transliteration": "sari", "english": "Okay"},
      {"kannada": "ಬೇಕು", "transliteration": "bēku", "english": "Want / need"},
      {"kannada": "ಬೇಡ", "transliteration": "bēḍa", "english": "Don't want / no need"},
      {"kannada": "ಗೊತ್ತಾ?", "transliteration": "gottā?", "english": "Do you know? (neutral)", "respectful": {"kannada": "ಗೊತ್ತೇ?", "transliteration": "gottē?"}},
      {"kannada": "ಗೊತ್ತಿಲ್ಲ", "transliteration": "gottilla", "english": "Don't know"},
      {"kannada": "ಯಾಕೆ ಇಲ್ಲ?", "transliteration": "yāke illa?", "english": "Why not?"}
    ],
    "phrases": [
      {"kannada": "ಹೇಗಿದ್ದೀರಾ?", "transliteration": "hēgiddīrā?", "english": "How are you? (respectful)"},
      {"kannada": "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ", "transliteration": "nānu chennāgiddēne", "english": "I am fine"},
      {"kannada": "ನಿಮ್ಮ ಹೆಸರು ಏನು?", "transliteration": "nimma hesaru ēnu?", "english": "What is your name?"},
      {"kannada": "ನನ್ನ ಹೆಸರು…", "transliteration": "nanna hesaru…", "english": "My name is…"},
      {"kannada": "ಊಟ ಆಯಿತಾ?", "transliteration": "ūṭa āyitā?", "english": "Have you eaten?"},
      {"kannada": "ನನಗೆ ಗೊತ್ತಿಲ್ಲ", "transliteration": "nanage gottilla", "english": "I don't know"}
    ]
  }
}
$json$::jsonb
where slug = 'questions';
