import type { Lesson } from './types';

export const greetings: Lesson = {
  id: 'greetings',
  situation: {
    title: 'Returning a greeting',
    setup: "You walk into a friend's home. Their parents look up from the sofa and smile at you. Time to greet them back properly.",
    imageKey: 'scene/living-room-greeting',
    realWorldPrompt: 'Try this the next time a Kannadiga elder greets you.',
  },
  intake: [
    {
      id: 'phrase.namaskara',
      kannada: 'ನಮಸ್ಕಾರ',
      transliteration: 'Namaskāra',
      english: 'Hello / Greetings',
      imageKey: 'phrase/namaskara',
      vocabAtoms: ['ನಮಸ್ಕಾರ'],
    },
    {
      id: 'phrase.hegiddira',
      kannada: 'ಹೇಗಿದ್ದೀರ?',
      transliteration: 'Hēgiddīra?',
      english: 'How are you? (respectful)',
      vocabAtoms: ['ಹೇಗಿದ್ದೀರ'],
    },
    {
      id: 'phrase.chennagiddene',
      kannada: 'ಚೆನ್ನಾಗಿದ್ದೇನೆ',
      transliteration: 'Chennāgiddēne',
      english: 'I am fine',
      vocabAtoms: ['ಚೆನ್ನಾಗಿದ್ದೇನೆ'],
    },
  ],
  drill: [
    { type: 'listen_pick', phraseId: 'phrase.namaskara', distractorIds: ['phrase.hegiddira', 'phrase.chennagiddene'] },
    { type: 'translate_pick', phraseId: 'phrase.hegiddira', distractorIds: ['phrase.namaskara', 'phrase.chennagiddene'] },
    { type: 'listen_pick', phraseId: 'phrase.chennagiddene', distractorIds: ['phrase.namaskara', 'phrase.hegiddira'] },
    { type: 'translate_pick', phraseId: 'phrase.namaskara', distractorIds: ['phrase.hegiddira', 'phrase.chennagiddene'] },
    { type: 'listen_pick', phraseId: 'phrase.hegiddira', distractorIds: ['phrase.namaskara', 'phrase.chennagiddene'] },
    { type: 'translate_pick', phraseId: 'phrase.chennagiddene', distractorIds: ['phrase.namaskara', 'phrase.hegiddira'] },
  ],
  output: {
    driverLine: {
      id: 'phrase.hegiddira',
      kannada: 'ಹೇಗಿದ್ದೀರ?',
      transliteration: 'Hēgiddīra?',
      english: 'How are you? (respectful)',
      vocabAtoms: ['ಹೇಗಿದ್ದೀರ'],
    },
    expectedResponse: {
      id: 'phrase.chennagiddene',
      kannada: 'ಚೆನ್ನಾಗಿದ್ದೇನೆ',
      transliteration: 'Chennāgiddēne',
      english: 'I am fine',
      vocabAtoms: ['ಚೆನ್ನಾಗಿದ್ದೇನೆ'],
    },
  },
  resurfaces: [],
};
