import { MathQuestion } from '../types/game';

// Exactly 20 Question Tiles across the 100-tile galaxy board
export const QUESTION_TILES: number[] = [
  3, 6, 9, 15, 18, 22, 25, 29, 36, 44,
  48, 52, 58, 63, 68, 72, 81, 85, 91, 95,
];

export const MATH_QUESTIONS_BANK: MathQuestion[] = [
  {
    id: 1,
    question: '4 × 5 = ?',
    options: [15, 20, 25],
    correctAnswer: 20,
    category: 'PERKALIAN',
    explanation: '4 kelompok berisi 5 bintang sama dengan 20 bintang!',
  },
  {
    id: 2,
    question: '7 × 3 = ?',
    options: [21, 24, 18],
    correctAnswer: 21,
    category: 'PERKALIAN',
    explanation: '7 dikali 3 adalah 7 + 7 + 7 = 21.',
  },
  {
    id: 3,
    question: '40 ÷ 5 = ?',
    options: [6, 8, 10],
    correctAnswer: 8,
    category: 'PEMBAGIAN',
    explanation: 'Karena 8 × 5 = 40, maka 40 ÷ 5 = 8.',
  },
  {
    id: 4,
    question: '54 ÷ 6 = ?',
    options: [8, 9, 7],
    correctAnswer: 9,
    category: 'PEMBAGIAN',
    explanation: 'Karena 6 × 9 = 54, maka 54 ÷ 6 = 9.',
  },
  {
    id: 5,
    question: '6 × 8 = ?',
    options: [42, 48, 54],
    correctAnswer: 48,
    category: 'PERKALIAN',
    explanation: '6 dikali 8 menghasilkan 48 energi kosmik!',
  },
  {
    id: 6,
    question: '9 × 4 = ?',
    options: [36, 32, 40],
    correctAnswer: 36,
    category: 'PERKALIAN',
    explanation: '9 × 4 = 36. Hebat sekali kapten!',
  },
  {
    id: 7,
    question: '36 ÷ 4 = ?',
    options: [7, 8, 9],
    correctAnswer: 9,
    category: 'PEMBAGIAN',
    explanation: '36 dibagi 4 bagian sama rata menjadi 9.',
  },
  {
    id: 8,
    question: '8 × 7 = ?',
    options: [54, 56, 64],
    correctAnswer: 56,
    category: 'PERKALIAN',
    explanation: '8 × 7 = 56. Salah satu perkalian favorit antariksa!',
  },
  {
    id: 9,
    question: '45 ÷ 9 = ?',
    options: [5, 6, 4],
    correctAnswer: 5,
    category: 'PEMBAGIAN',
    explanation: 'Karena 9 × 5 = 45, maka 45 ÷ 9 = 5.',
  },
  {
    id: 10,
    question: '5 × 9 = ?',
    options: [40, 45, 50],
    correctAnswer: 45,
    category: 'PERKALIAN',
    explanation: '5 dikali 9 sama dengan 45.',
  },
  {
    id: 11,
    question: '63 ÷ 7 = ?',
    options: [8, 9, 7],
    correctAnswer: 9,
    category: 'PEMBAGIAN',
    explanation: '7 × 9 = 63, jadi 63 ÷ 7 = 9.',
  },
  {
    id: 12,
    question: '8 × 8 = ?',
    options: [64, 56, 72],
    correctAnswer: 64,
    category: 'PERKALIAN',
    explanation: '8 × 8 sama dengan 64!',
  },
  {
    id: 13,
    question: '72 ÷ 8 = ?',
    options: [8, 9, 6],
    correctAnswer: 9,
    category: 'PEMBAGIAN',
    explanation: 'Karena 8 × 9 = 72, maka 72 ÷ 8 = 9.',
  },
  {
    id: 14,
    question: '6 × 7 = ?',
    options: [42, 49, 36],
    correctAnswer: 42,
    category: 'PERKALIAN',
    explanation: '6 dikali 7 sama dengan 42.',
  },
  {
    id: 15,
    question: '32 ÷ 8 = ?',
    options: [3, 4, 6],
    correctAnswer: 4,
    category: 'PEMBAGIAN',
    explanation: '8 × 4 = 32, maka 32 ÷ 8 = 4.',
  },
  {
    id: 16,
    question: '9 × 9 = ?',
    options: [72, 81, 90],
    correctAnswer: 81,
    category: 'PERKALIAN',
    explanation: '9 dikali 9 adalah 81!',
  },
  {
    id: 17,
    question: '28 ÷ 4 = ?',
    options: [6, 7, 8],
    correctAnswer: 7,
    category: 'PEMBAGIAN',
    explanation: '4 × 7 = 28, sehingga 28 ÷ 4 = 7.',
  },
  {
    id: 18,
    question: '10 × 6 = ?',
    options: [60, 50, 70],
    correctAnswer: 60,
    category: 'PERKALIAN',
    explanation: '10 dikali 6 sama dengan 60.',
  },
  {
    id: 19,
    question: '81 ÷ 9 = ?',
    options: [7, 8, 9],
    correctAnswer: 9,
    category: 'PEMBAGIAN',
    explanation: '9 × 9 = 81, maka 81 ÷ 9 = 9.',
  },
  {
    id: 20,
    question: '7 × 7 = ?',
    options: [42, 49, 56],
    correctAnswer: 49,
    category: 'PERKALIAN',
    explanation: '7 dikali 7 menghasilkan 49 bintang!',
  },
];

export class QuestionManager {
  private remainingIds: number[] = [];

  constructor() {
    this.resetPool();
  }

  public resetPool() {
    // Shuffle the 20 questions using Fisher-Yates
    const ids = MATH_QUESTIONS_BANK.map((q) => q.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    this.remainingIds = ids;
  }

  public isQuestionTile(tileNumber: number): boolean {
    return QUESTION_TILES.includes(tileNumber);
  }

  public drawNextQuestion(): MathQuestion {
    if (this.remainingIds.length === 0) {
      this.resetPool();
    }
    const nextId = this.remainingIds.pop()!;
    const found = MATH_QUESTIONS_BANK.find((q) => q.id === nextId);
    return found || MATH_QUESTIONS_BANK[0];
  }

  public getRemainingCount(): number {
    return this.remainingIds.length;
  }
}
