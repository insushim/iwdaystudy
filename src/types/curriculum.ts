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
  unit?: string;
  // 학년대 힌트(lower=3~4, upper=5~6, both=공통). 단원(unit) 매핑 시 학년 구분에 사용.
  gradeGroup?: "lower" | "upper" | "both";
}

export interface ReadingEntry {
  passage: string;
  question: string;
  choices: string[];
  correct: string;
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
  unit?: string;
  /** 한국어 타깃 글로스(예: "모자") — 뜻→단어 문제에서 강조 표시용 */
  targetKo?: string;
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
