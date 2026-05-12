import type { Lesson } from './index';

export const lesson01Greetings: Lesson = {
  id: 'lesson-01-greetings',
  title: 'Greetings',
  subtitle: 'Say hello like a local',
  level: 1,
  estimatedMinutes: 5,
  type: 'lesson',
  culturalNote:
    'Namaskara is used at any time of day and with anyone — young, old, stranger or friend. It shows respect and warmth simultaneously.',
  words: [
    {
      id: 'w-01-01',
      kannadaScript: 'ನಮಸ್ಕಾರ',
      transliteration: 'Namaskara',
      meaning: 'Hello / Greetings',
      audioUrl: 'lesson_01_namaskara.mp3',
    },
    {
      id: 'w-01-02',
      kannadaScript: 'ಹೇಗಿದ್ದೀರಾ?',
      transliteration: 'Hegiddira?',
      meaning: 'How are you?',
      audioUrl: 'lesson_01_hegiddira.mp3',
    },
    {
      id: 'w-01-03',
      kannadaScript: 'ಚೆನ್ನಾಗಿದ್ದೀನಿ',
      transliteration: 'Chennagiddini',
      meaning: 'I am fine',
      audioUrl: 'lesson_01_chennagiddini.mp3',
    },
    {
      id: 'w-01-04',
      kannadaScript: 'ಧನ್ಯವಾದಗಳು',
      transliteration: 'Dhanyavadagalu',
      meaning: 'Thank you',
      audioUrl: 'lesson_01_dhanyavadagalu.mp3',
    },
    {
      id: 'w-01-05',
      kannadaScript: 'ಸ್ವಲ್ಪ / ತುಂಬಾ',
      transliteration: 'Swalpa / Thumba',
      meaning: 'A little / A lot',
      audioUrl: 'lesson_01_swalpa_thumba.mp3',
    },
    {
      id: 'w-01-06',
      kannadaScript: 'ಒಡನೆ ಸಿಗೋಣ',
      transliteration: 'Odane sigona',
      meaning: 'See you soon',
      audioUrl: 'lesson_01_odane_sigona.mp3',
    },
  ],
  quiz: [
    {
      id: 'q-01-01',
      type: 'mcq',
      question: 'What does "Namaskara" mean?',
      options: ['Goodbye', 'Hello / Greetings', 'Thank you', 'How are you?'],
      correctAnswer: 'Hello / Greetings',
      explanation: 'Namaskara is the universal Kannada greeting used at any time of day.',
    },
    {
      id: 'q-01-02',
      type: 'translate',
      question: 'How do you say "How are you?" in Kannada?',
      options: ['Namaskara', 'Chennagiddini', 'Hegiddira?', 'Odane sigona'],
      correctAnswer: 'Hegiddira?',
      explanation: 'Hegiddira is the polite way to ask "How are you?" in Kannada.',
    },
    {
      id: 'q-01-03',
      type: 'mcq',
      question: 'What does "Dhanyavadagalu" mean?',
      options: ['Sorry', 'Please', 'Thank you', 'See you soon'],
      correctAnswer: 'Thank you',
      explanation: 'Dhanyavadagalu is the formal way to say thank you in Kannada.',
    },
  ],
};
