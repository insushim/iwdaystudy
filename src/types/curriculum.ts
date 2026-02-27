export interface CurriculumEntry {
  code: string;
  desc: string;
  unit: string;
  difficulty: number;
  weeks: [number, number];
}

export interface GradeCurriculum {
  math: CurriculumEntry[];
  korean: CurriculumEntry[];
  english?: CurriculumEntry[];
  science?: CurriculumEntry[];
  social?: CurriculumEntry[];
}

export interface SpellingEntry {
  q1: string;
  q2: string;
  answer: 1 | 2;
  explanation: string;
}

export interface VocabEntry {
  meanings: string[];
  answer: string;
}

export interface HanjaEntry {
  character: string;
  reading: string;
  meaning: string;
  strokes: number;
  words: string[];
  sentence: string;
}

export interface KnowledgeEntry {
  text: string;
  answer: string;
  category: string;
}

export interface SafetyEntry {
  text: string;
  answer: string;
  category: string;
}

export interface EnglishEntry {
  sentence: string;
  translation: string;
  word: string;
  pronunciation: string;
  practice?: string[];
}

export interface MathEntry {
  type: string;
  expression?: string;
  answer: number;
  steps?: string[];
  unit: string;
  numbers?: number[];
  hasCarry?: boolean;
  hasBorrow?: boolean;
  dividend?: number;
  divisor?: number;
  quotient?: number;
  remainder?: number;
}
