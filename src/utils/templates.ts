import { QuestionType, QuizQuestion } from '../types/quiz';
import { generateId } from './parser';

export interface QuizTemplate {
  id: string;
  name: string;
  type: QuestionType | 'mixed';
  description: string;
  rawText: string;
  questions: QuizQuestion[];
}

export const QUIZ_TEMPLATES: QuizTemplate[] = [
  {
    id: 'mcq-science',
    name: 'Science & Cosmos (MCQ)',
    type: 'mcq',
    description: '5 multiple choice questions covering astronomy, biology, and physics',
    rawText: `1. What is the powerhouse of the cell?
A) Nucleus
B) Mitochondria *
C) Ribosome
D) Endoplasmic Reticulum
Explanation: Mitochondria generate most of the chemical energy needed to power the cell's biochemical reactions.

2. Which planet has the most moons in our solar system?
A) Jupiter
B) Saturn *
C) Uranus
D) Neptune
Explanation: Saturn currently holds the record with 146 confirmed moons.

3. At what temperature Celsius does water achieve its maximum density?
A) 0°C
B) 4°C *
C) 100°C
D) -4°C
Explanation: Water expands as it freezes, reaching its peak density at approximately 3.98°C.

4. What is the closest star system to Earth after our Sun?
A) Sirius
B) Alpha Centauri *
C) Betelgeuse
D) Polaris
Explanation: Alpha Centauri is located roughly 4.37 light-years away from Earth.

5. Which particle carries a negative electric charge?
A) Proton
B) Neutron
C) Electron *
D) Photon
Explanation: Electrons have an elementary negative charge (-1e).`,
    questions: [
      {
        id: generateId(),
        type: 'mcq',
        title: 'What is the powerhouse of the cell?',
        options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Endoplasmic Reticulum'],
        correctIndex: 1,
        explanation: "Mitochondria generate most of the chemical energy needed to power the cell's biochemical reactions.",
        points: 1,
      },
      {
        id: generateId(),
        type: 'mcq',
        title: 'Which planet has the most moons in our solar system?',
        options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'],
        correctIndex: 1,
        explanation: 'Saturn currently holds the record with 146 confirmed moons.',
        points: 1,
      },
      {
        id: generateId(),
        type: 'mcq',
        title: 'At what temperature Celsius does water achieve its maximum density?',
        options: ['0°C', '4°C', '100°C', '-4°C'],
        correctIndex: 1,
        explanation: 'Water expands as it freezes, reaching its peak density at approximately 3.98°C.',
        points: 1,
      },
      {
        id: generateId(),
        type: 'mcq',
        title: 'What is the closest star system to Earth after our Sun?',
        options: ['Sirius', 'Alpha Centauri', 'Betelgeuse', 'Polaris'],
        correctIndex: 1,
        explanation: 'Alpha Centauri is located roughly 4.37 light-years away from Earth.',
        points: 1,
      },
      {
        id: generateId(),
        type: 'mcq',
        title: 'Which particle carries a negative electric charge?',
        options: ['Proton', 'Neutron', 'Electron', 'Photon'],
        correctIndex: 2,
        explanation: 'Electrons have an elementary negative charge (-1e).',
        points: 1,
      },
    ],
  },
  {
    id: 'tf-history',
    name: 'History & Myths (True/False)',
    type: 'true-false',
    description: '5 true or false statements on historical events and common misconceptions',
    rawText: `1. The Great Wall of China is visible from the Moon with the naked eye. (False)
Explanation: Astronauts and NASA confirm the Great Wall is not visible from the Moon without magnification.

2. Napoleon Bonaparte was significantly below average height for his time. (False)
Explanation: At 5 feet 6 inches, Napoleon was of average or slightly above-average height for an 18th-century French male.

3. The Eiffel Tower can grow over 15 cm taller during hot summer days. (True)
Explanation: Thermal expansion causes the iron structure of the Eiffel Tower to expand and rise in extreme heat.

4. Oxford University is older than the Aztec Empire. (True)
Explanation: Oxford began teaching around 1096 CE, while the Aztec Empire formed circa 1428 CE.

5. Goldfish have a memory span of only 3 seconds. (False)
Explanation: Scientific experiments prove goldfish can remember behaviors and obstacles for months.`,
    questions: [
      {
        id: generateId(),
        type: 'true-false',
        title: 'The Great Wall of China is visible from the Moon with the naked eye.',
        correctAnswer: false,
        explanation: 'Astronauts and NASA confirm the Great Wall is not visible from the Moon without magnification.',
        points: 1,
      },
      {
        id: generateId(),
        type: 'true-false',
        title: 'Napoleon Bonaparte was significantly below average height for his time.',
        correctAnswer: false,
        explanation: 'At 5 feet 6 inches, Napoleon was of average or slightly above-average height for an 18th-century French male.',
        points: 1,
      },
      {
        id: generateId(),
        type: 'true-false',
        title: 'The Eiffel Tower can grow over 15 cm taller during hot summer days.',
        correctAnswer: true,
        explanation: 'Thermal expansion causes the iron structure of the Eiffel Tower to expand and rise in extreme heat.',
        points: 1,
      },
      {
        id: generateId(),
        type: 'true-false',
        title: 'Oxford University is older than the Aztec Empire.',
        correctAnswer: true,
        explanation: 'Oxford began teaching around 1096 CE, while the Aztec Empire formed circa 1428 CE.',
        points: 1,
      },
      {
        id: generateId(),
        type: 'true-false',
        title: 'Goldfish have a memory span of only 3 seconds.',
        correctAnswer: false,
        explanation: 'Scientific experiments prove goldfish can remember behaviors and obstacles for months.',
        points: 1,
      },
    ],
  },
  {
    id: 'fib-geography',
    name: 'World Knowledge (Fill in Blanks)',
    type: 'fill-blank',
    description: '4 fill-in-the-blank questions testing geography and landmarks',
    rawText: `1. The capital city of Australia is [Canberra].
Explanation: Canberra was selected as a compromise between Sydney and Melbourne in 1908.

2. The longest river in the world by traditional consensus is the [Nile/Nile River].
Explanation: The Nile stretches over 6,650 km through northeastern Africa.

3. Mount Everest lies on the international border between Nepal and [China/Tibet].
Explanation: Everest's summit ridge marks the official international frontier.

4. The deepest ocean trench on Earth is called the [Mariana Trench/Mariana].
Explanation: Located in the western Pacific Ocean, reaching roughly 11,000 meters depth.`,
    questions: [
      {
        id: generateId(),
        type: 'fill-blank',
        title: 'The capital city of Australia is ______.',
        correctAnswer: 'Canberra',
        acceptedAnswers: ['canberra'],
        explanation: 'Canberra was selected as a compromise between Sydney and Melbourne in 1908.',
        points: 1,
      },
      {
        id: generateId(),
        type: 'fill-blank',
        title: 'The longest river in the world by traditional consensus is the ______.',
        correctAnswer: 'Nile',
        acceptedAnswers: ['Nile River', 'the nile', 'nile'],
        explanation: 'The Nile stretches over 6,650 km through northeastern Africa.',
        points: 1,
      },
      {
        id: generateId(),
        type: 'fill-blank',
        title: 'Mount Everest lies on the international border between Nepal and ______.',
        correctAnswer: 'China',
        acceptedAnswers: ['Tibet', 'PRC'],
        explanation: "Everest's summit ridge marks the official international frontier.",
        points: 1,
      },
      {
        id: generateId(),
        type: 'fill-blank',
        title: 'The deepest ocean trench on Earth is called the ______ Trench.',
        correctAnswer: 'Mariana',
        acceptedAnswers: ['Marianas', 'mariana'],
        explanation: 'Located in the western Pacific Ocean, reaching roughly 11,000 meters depth.',
        points: 1,
      },
    ],
  },
  {
    id: 'match-innovators',
    name: 'Tech Pioneers (Matching)',
    type: 'matching',
    description: 'Interactive matching pairs connecting inventors with their famous innovations',
    rawText: `Match each pioneer with their revolutionary breakthrough:
Alan Turing - Modern Computer Science & Enigma
Ada Lovelace - First Computer Algorithm
Tim Berners-Lee - World Wide Web (WWW)
Grace Hopper - First Compiler & COBOL
Linus Torvalds - Linux Kernel & Git`,
    questions: [
      {
        id: generateId(),
        type: 'matching',
        title: 'Match each tech pioneer with their revolutionary breakthrough:',
        pairs: [
          { id: generateId(), left: 'Alan Turing', right: 'Modern Computer Science' },
          { id: generateId(), left: 'Ada Lovelace', right: 'First Computer Algorithm' },
          { id: generateId(), left: 'Tim Berners-Lee', right: 'World Wide Web (WWW)' },
          { id: generateId(), left: 'Grace Hopper', right: 'First Compiler & COBOL' },
          { id: generateId(), left: 'Linus Torvalds', right: 'Linux Kernel & Git' },
        ],
        explanation: 'Foundational computing figures who built the pillars of the digital age.',
        points: 5,
      },
    ],
  },
  {
    id: 'mixed-mastery',
    name: 'Mixed Formats Variety Pack',
    type: 'mixed',
    description: 'An engaging quiz combining MCQ, True/False, Fill in Blank, and Matching',
    rawText: `1. Which chemical element has the symbol 'Au'?
A) Silver
B) Gold *
C) Copper
D) Argon

2. Sound travels faster in water than it does in air. (True)

3. The atmospheric layer closest to the Earth's surface is the [troposphere].

Match each language with its primary paradigm:
JavaScript - Event-driven & Prototype-based
Haskell - Pure Functional
SQL - Declarative Query Language`,
    questions: [
      {
        id: generateId(),
        type: 'mcq',
        title: "Which chemical element has the symbol 'Au'?",
        options: ['Silver', 'Gold', 'Copper', 'Argon'],
        correctIndex: 1,
        explanation: "Au comes from 'Aurum', the Latin word for gold.",
        points: 1,
      },
      {
        id: generateId(),
        type: 'true-false',
        title: 'Sound travels faster through water than through air.',
        correctAnswer: true,
        explanation: 'Because water particles are much closer together than air molecules, sound waves travel approximately 4 times faster in water.',
        points: 1,
      },
      {
        id: generateId(),
        type: 'fill-blank',
        title: "The atmospheric layer closest to the Earth's surface is the ______.",
        correctAnswer: 'troposphere',
        acceptedAnswers: ['Troposphere'],
        explanation: 'The troposphere contains roughly 75% of the atmosphere mass and almost all water vapor.',
        points: 1,
      },
      {
        id: generateId(),
        type: 'matching',
        title: 'Match each programming language with its primary paradigm:',
        pairs: [
          { id: generateId(), left: 'JavaScript', right: 'Event-driven & Prototypal' },
          { id: generateId(), left: 'Haskell', right: 'Pure Functional' },
          { id: generateId(), left: 'SQL', right: 'Declarative Query Language' },
        ],
        explanation: 'Paradigms define the architectural style and philosophy of programming.',
        points: 3,
      },
    ],
  },
];
