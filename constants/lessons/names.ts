import type { Lesson } from './types';

export const names: Lesson = {
  id: 'names',
  situation: {
    title: 'Asking someone\'s name',
    setup: "You're at a Kannadiga friend's place. A relative walks in and looks at you. Time to introduce yourself properly.",
    imageKey: 'scene/name-introduction',
    realWorldPrompt: 'Try this the next time you meet someone new in Bengaluru.',
  },
  intake: [
    {
      id: 'phrase.nimma-hesaru-enu',
      kannada: 'ನಿಮ್ಮ ಹೆಸರು ಏನು?',
      transliteration: 'Nimma hesaru ēnu?',
      english: 'What is your name? (respectful)',
      vocabAtoms: ['ನಿಮ್ಮ', 'ಹೆಸರು', 'ಏನು'],
    },
    {
      id: 'phrase.nanna-hesaru-x',
      kannada: 'ನನ್ನ ಹೆಸರು [name]',
      transliteration: 'Nanna hesaru [name]',
      english: 'My name is [name]',
      vocabAtoms: ['ನನ್ನ'],
    },
    {
      id: 'phrase.naanu-x',
      kannada: 'ನಾನು [name]',
      transliteration: 'Naanu [name]',
      english: 'I am [name]',
      vocabAtoms: ['ನಾನು'],
    },
  ],
  drill: [
    { type: 'listen_pick', phraseId: 'phrase.nimma-hesaru-enu', distractorIds: ['phrase.nanna-hesaru-x', 'phrase.naanu-x'] },
    { type: 'translate_pick', phraseId: 'phrase.nanna-hesaru-x', distractorIds: ['phrase.nimma-hesaru-enu', 'phrase.naanu-x'] },
    { type: 'listen_pick', phraseId: 'phrase.naanu-x', distractorIds: ['phrase.nimma-hesaru-enu', 'phrase.nanna-hesaru-x'] },
    { type: 'translate_pick', phraseId: 'phrase.nimma-hesaru-enu', distractorIds: ['phrase.nanna-hesaru-x', 'phrase.naanu-x'] },
    { type: 'listen_pick', phraseId: 'phrase.nanna-hesaru-x', distractorIds: ['phrase.nimma-hesaru-enu', 'phrase.naanu-x'] },
    { type: 'translate_pick', phraseId: 'phrase.naanu-x', distractorIds: ['phrase.nimma-hesaru-enu', 'phrase.nanna-hesaru-x'] },
  ],
  output: {
    driverLine: {
      id: 'phrase.nimma-hesaru-enu',
      kannada: 'ನಿಮ್ಮ ಹೆಸರು ಏನು?',
      transliteration: 'Nimma hesaru ēnu?',
      english: 'What is your name? (respectful)',
      vocabAtoms: ['ನಿಮ್ಮ', 'ಹೆಸರು', 'ಏನು'],
    },
    expectedResponse: {
      id: 'phrase.nanna-hesaru-x',
      kannada: 'ನನ್ನ ಹೆಸರು [name]',
      transliteration: 'Nanna hesaru [name]',
      english: 'My name is [name]',
      vocabAtoms: ['ನನ್ನ'],
    },
  },
  resurfaces: [],
};
