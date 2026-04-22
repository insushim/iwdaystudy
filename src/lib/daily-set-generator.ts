import { getDayOfYear, getGradeGroup } from "@/lib/utils";
import {
  GRADE_SET_COMPOSITION,
  DEFAULT_READINESS_ITEMS,
  EMOTION_CATEGORIES,
} from "@/lib/constants";
import type {
  DailySet,
  Question,
  SubjectType,
  QuestionType,
} from "@/types/database";
import type { DailySetWithQuestions } from "@/types/learning";
import type {
  SpellingEntry,
  VocabEntry,
  KnowledgeEntry,
  ReadingEntry,
  SafetyEntry,
  MathEntry,
  HanjaEntry,
  EnglishEntry,
} from "@/types/curriculum";
import {
  grade1ReadingData,
  grade2ReadingData,
  grade3ReadingData,
  grade4ReadingData,
  grade5ReadingData,
  grade6ReadingData,
} from "@/lib/curriculum/korean-reading-data";
import { generateMathPool } from "@/lib/curriculum/generators/math-generator";
import {
  getAvailableMathUnits,
  getAvailableScienceUnits,
  getAvailableEnglishUnits,
  getAvailableSocialUnits,
} from "@/lib/curriculum/curriculum-sequence";
import { generateSpellingPool } from "@/lib/curriculum/generators/spelling-generator";
import {
  generateVocabPool,
  getSynonymPairs,
  getAntonymPairs,
  getIdiomEntries,
  getMultiMeaningWords,
  getWordPuzzles,
} from "@/lib/curriculum/generators/vocab-generator";
import type {
  SynonymPair,
  AntonymPair,
  IdiomEntry as VocabIdiomEntry,
  MultiMeaningWord,
  WordPuzzleEntry,
} from "@/lib/curriculum/generators/vocab-generator";
import { generateKnowledgePool } from "@/lib/curriculum/generators/knowledge-generator";
import { generateSafetyPool } from "@/lib/curriculum/generators/safety-generator";
import { generateHanjaPool } from "@/lib/curriculum/generators/hanja-generator";
import { generateEnglishPool } from "@/lib/curriculum/generators/english-generator";
import {
  generateWritingPool,
  generateCreativePool,
} from "@/lib/curriculum/generators/writing-creative-generator";
import {
  generateSciencePool,
  generateSocialPool,
} from "@/lib/curriculum/generators/science-social-generator";
import { generateReadingPool } from "@/lib/curriculum/generators/reading-generator";

import {
  grade1SpellingData,
  grade1VocabData,
  grade1MathData,
  grade1KnowledgeData,
  grade1SafetyData,
  grade1WritingPrompts,
  grade1KoreanData,
  grade1CreativeData,
} from "@/lib/curriculum/grade1";

import {
  grade2SpellingData,
  grade2VocabData,
  grade2MathData,
  grade2KnowledgeData,
  grade2SafetyData,
  grade2WritingPrompts,
  grade2KoreanData,
  grade2CreativeData,
} from "@/lib/curriculum/grade2";

import {
  grade3SpellingData,
  grade3VocabData,
  grade3MathData,
  grade3KnowledgeData,
  grade3SafetyData,
  grade3WritingPrompts,
  grade3HanjaData,
  grade3EnglishData,
  grade3CreativeData,
} from "@/lib/curriculum/grade3";
import {
  grade3KnowledgeDataExtra,
  grade3SafetyDataExtra,
} from "@/lib/curriculum/grade3_suffix";

import {
  grade4SpellingData,
  grade4VocabData,
  grade4MathData,
  grade4KnowledgeData,
  grade4SafetyData,
  grade4WritingPrompts,
  grade4HanjaData,
  grade4EnglishData,
  grade4CreativeData,
} from "@/lib/curriculum/grade4";

import {
  grade5SpellingData,
  grade5VocabData,
  grade5MathData,
  grade5KnowledgeData,
  grade5SafetyData,
  grade5WritingPrompts,
  grade5HanjaData,
  grade5EnglishData,
  grade5CreativeData,
  grade5ScienceData,
  grade5SocialData,
} from "@/lib/curriculum/grade5";

import {
  grade6SpellingData,
  grade6VocabData,
  grade6MathData,
  grade6KnowledgeData,
  grade6SafetyData,
  grade6WritingPrompts,
  grade6HanjaData,
  grade6EnglishData,
  grade6CreativeData,
  grade6ScienceData,
  grade6SocialData,
} from "@/lib/curriculum/grade6";

const NON_REPEATABLE_QUESTION_TYPES = new Set([
  "multiple_choice",
  "fill_blank",
  "short_answer",
  "true_false",
  "matching",
  "ordering",
  "drawing",
  "calculation",
  "word_puzzle",
  "dictation",
]);

// Seeded PRNG for reproducible daily sets (same seed = same set per day)
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Generate 4 choices (including the correct answer) by picking distractors
 * from the same pool of entries and shuffling them.
 */
function generateChoices<T>(
  correct: string,
  pool: T[],
  extractAnswer: (item: T) => string,
  random: () => number,
): string[] {
  const others = pool.map(extractAnswer).filter((a) => a !== correct);
  // Deduplicate
  const unique = [...new Set(others)];
  // Shuffle and pick 3
  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [unique[i], unique[j]] = [unique[j], unique[i]];
  }
  const distractors = unique.slice(0, 3);
  // If not enough distractors, pad with variations
  while (distractors.length < 3) {
    distractors.push(`${correct}(아님)`);
  }
  const choices = [correct, ...distractors];
  // Shuffle choices
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices;
}

function shuffleChoices<T>(choices: T[], random: () => number): T[] {
  const next = [...choices];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function shuffleArrayInPlace<T>(arr: T[], random: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function generateMathChoices(correct: number, random: () => number): string[] {
  const distractors = new Set<string>();
  const offsets = shuffleChoices([1, 2, 5, 10], random);

  for (const offset of offsets) {
    const sign = random() > 0.5 ? 1 : -1;
    const candidate = correct + offset * sign;
    if (candidate >= 0 && candidate !== correct) {
      distractors.add(String(candidate));
    }
    if (distractors.size === 3) break;
  }

  let step = 1;
  while (distractors.size < 3) {
    const candidate = correct + step;
    if (candidate !== correct) {
      distractors.add(String(candidate));
    }
    step++;
  }

  return shuffleChoices([String(correct), ...distractors], random);
}

function generateSpellingChoices(
  entry: SpellingEntry,
  pool: SpellingEntry[],
  random: () => number,
): string[] {
  const correctSentence = entry.answer === 1 ? entry.q1 : entry.q2;
  const wrongPool = pool.flatMap((item) => {
    const wrongSentence = item.answer === 1 ? item.q2 : item.q1;
    return wrongSentence === correctSentence ? [] : [wrongSentence];
  });
  const distractors = shuffleChoices([...new Set(wrongPool)], random).slice(
    0,
    3,
  );

  while (distractors.length < 3) {
    distractors.push(`${correctSentence} (오답)`);
  }

  return shuffleChoices([correctSentence, ...distractors], random);
}

function takeExpandedPortion<T>(items: T[], ratio = 0.5): T[] {
  if (items.length === 0) return [];
  const count = Math.max(1, Math.floor(items.length * ratio));
  return items.slice(0, count);
}

// ── 적응형 난이도 (Adaptive Difficulty) ──────────────────────────
// 같은 학년 + 성취기준 내에서 쉬움/보통/어려움 3단계
// 학년을 바꾸지 않고 문제 난이도만 조정

/** 과목별 정답률에 따라 난이도 결정 (1=쉬움, 2=보통, 3=어려움) */
function getDifficultyLevel(accuracy: number | undefined): 1 | 2 | 3 {
  if (accuracy === undefined) return 2; // 데이터 없으면 보통
  if (accuracy >= 85) return 3; // 잘 맞추면 어려운 문제
  if (accuracy <= 45) return 1; // 많이 틀리면 쉬운 문제
  return 2;
}

interface GradeData {
  spelling: SpellingEntry[];
  vocab: VocabEntry[];
  math: MathEntry[];
  knowledge: KnowledgeEntry[];
  safety: SafetyEntry[];
  writing: string[];
  korean?: KnowledgeEntry[];
  koreanReading?: ReadingEntry[];
  creative?: KnowledgeEntry[];
  hanja?: HanjaEntry[];
  english?: EnglishEntry[];
  science?: KnowledgeEntry[];
  social?: KnowledgeEntry[];
  synonymPairs?: SynonymPair[];
  antonymPairs?: AntonymPair[];
  idioms?: VocabIdiomEntry[];
  multiMeaningWords?: MultiMeaningWord[];
  wordPuzzles?: WordPuzzleEntry[];
}

/**
 * Filter math items to only include units unlocked so far this semester.
 * Uses week-based curriculum sequencing for all grades.
 * Falls back to no filtering if no sequence is defined.
 */
function filterMathByProgress(
  items: MathEntry[],
  grade: number,
  semester: number,
): MathEntry[] {
  const available = getAvailableMathUnits(grade, semester);
  if (available.size === 0) return items; // no sequence defined for this grade/semester

  // Return only items matching unlocked units. Items without a unit field pass through.
  // If nothing matches after filtering, return all items to avoid empty data errors.
  const filtered = items.filter((m) => !m.unit || available.has(m.unit));
  return filtered.length > 0 ? filtered : items;
}

/**
 * Filter science items to only include units unlocked so far this semester.
 * Uses week-based curriculum sequencing for grades 3-6.
 * Returns all items for grades 1-2 (no science curriculum).
 */
function filterScienceByProgress(
  items: KnowledgeEntry[],
  grade: number,
  semester: number,
): KnowledgeEntry[] {
  const available = getAvailableScienceUnits(grade, semester);
  if (available.size === 0) return items; // grades 1-2 or no sequence defined
  const filtered = items.filter((m) => !m.unit || available.has(m.unit));
  return filtered.length > 0 ? filtered : items;
}

/**
 * Filter English items to only include units unlocked so far this semester.
 * Uses week-based curriculum sequencing for grades 3-6.
 * Returns all items for grades 1-2 (no English curriculum).
 */
function filterEnglishByProgress(
  items: EnglishEntry[],
  grade: number,
  semester: number,
): EnglishEntry[] {
  const available = getAvailableEnglishUnits(grade, semester);
  if (available.size === 0) return items; // grades 1-2 or no sequence defined
  const filtered = items.filter((m) => !m.unit || available.has(m.unit));
  return filtered.length > 0 ? filtered : items;
}

/**
 * Filter social studies items to only include units unlocked so far this semester.
 * Uses week-based curriculum sequencing for grades 5-6.
 * Returns all items for grades 1-4 (no social curriculum).
 */
function filterSocialByProgress(
  items: KnowledgeEntry[],
  grade: number,
  semester: number,
): KnowledgeEntry[] {
  const available = getAvailableSocialUnits(grade, semester);
  if (available.size === 0) return items; // grades 1-4 or no sequence defined
  const filtered = items.filter((m) => !m.unit || available.has(m.unit));
  return filtered.length > 0 ? filtered : items;
}

// ============================================================
// Static data accessors for core subjects (used for grade offset)
// ============================================================
function getStaticMathData(g: number): MathEntry[] {
  switch (g) {
    case 1:
      return grade1MathData;
    case 2:
      return grade2MathData;
    case 3:
      return grade3MathData;
    case 4:
      return grade4MathData;
    case 5:
      return grade5MathData;
    case 6:
      return grade6MathData;
    default:
      return grade1MathData;
  }
}

function getStaticEnglishData(g: number): EnglishEntry[] {
  switch (g) {
    case 3:
      return grade3EnglishData ?? [];
    case 4:
      return grade4EnglishData ?? [];
    case 5:
      return grade5EnglishData ?? [];
    case 6:
      return grade6EnglishData ?? [];
    default:
      return [];
  }
}

function getStaticScienceData(g: number): KnowledgeEntry[] {
  switch (g) {
    case 5:
      return grade5ScienceData ?? [];
    case 6:
      return grade6ScienceData ?? [];
    default:
      return [];
  }
}

function getStaticSocialData(g: number): KnowledgeEntry[] {
  switch (g) {
    case 5:
      return grade5SocialData ?? [];
    case 6:
      return grade6SocialData ?? [];
    default:
      return [];
  }
}

function getStaticKoreanData(g: number): KnowledgeEntry[] {
  switch (g) {
    case 1:
      return grade1KoreanData ?? [];
    case 2:
      return grade2KoreanData ?? [];
    default:
      return [];
  }
}

function getStaticKoreanReadingData(g: number): ReadingEntry[] {
  switch (g) {
    case 1:
      return grade1ReadingData ?? [];
    case 2:
      return grade2ReadingData ?? [];
    case 3:
      return grade3ReadingData ?? [];
    case 4:
      return grade4ReadingData ?? [];
    case 5:
      return grade5ReadingData ?? [];
    case 6:
      return grade6ReadingData ?? [];
    default:
      return [];
  }
}

// Get curriculum data per grade (merges static + procedurally generated)
// 선행학습법 준수: 주지과목(수학·국어·영어·과학)은 전 학년 내용을 제공합니다.
function getGradeData(
  grade: number,
  semester: number,
  daySeed?: number,
  subjectAccuracy?: Record<string, { accuracy: number }>,
): GradeData {
  const dayOfYear = daySeed ?? getDayOfYear();
  const expandedDayOfYear = dayOfYear + 10000;
  const expandedDayOfYearBonus = dayOfYear + 20000;

  // 적응형 난이도: 같은 학년·성취기준 내에서 난이도만 조정 (학년 변경 없음)
  const diff = (subject: string) =>
    getDifficultyLevel(subjectAccuracy?.[subject]?.accuracy);
  const mathDiff = diff("math");
  const spellingDiff = diff("spelling");
  const vocabDiff = diff("vocabulary");
  const knowledgeDiff = diff("general_knowledge");
  const safetyDiff = diff("safety");
  const hanjaDiff = diff("hanja");
  const englishDiff = diff("english");
  const scienceDiff = diff("science");
  const socialDiff = diff("social");

  // 선행학습법: 주지과목은 현재 학년 - 1의 내용 사용 (학년 변경 없음)
  const coreMathGrade = Math.max(1, grade - 1);
  const coreEnglishGrade = Math.max(3, grade - 1);
  const coreScienceGrade = Math.max(5, grade - 1);
  const coreSocialGrade = Math.max(5, grade - 1);

  // ---- 주지과목 풀 생성 (전 학년 기준 + 난이도 적용) ----
  const generatedMath = generateMathPool(
    coreMathGrade,
    dayOfYear,
    semester,
    mathDiff,
  );
  const generatedMathExtra = generateMathPool(
    coreMathGrade,
    expandedDayOfYear,
    semester,
    mathDiff,
  );
  const generatedMathBonus = takeExpandedPortion(
    generateMathPool(coreMathGrade, expandedDayOfYearBonus, semester, mathDiff),
  );
  const generatedEnglish = generateEnglishPool(
    coreEnglishGrade,
    dayOfYear,
    englishDiff,
  );
  const generatedEnglishExtra = generateEnglishPool(
    coreEnglishGrade,
    expandedDayOfYear,
    englishDiff,
  );
  const generatedEnglishBonus = takeExpandedPortion(
    generateEnglishPool(coreEnglishGrade, expandedDayOfYearBonus, englishDiff),
  );
  const generatedScience = generateSciencePool(
    coreScienceGrade,
    dayOfYear,
    scienceDiff,
  );
  const generatedScienceExtra = generateSciencePool(
    coreScienceGrade,
    expandedDayOfYear,
    scienceDiff,
  );
  const generatedScienceBonus = takeExpandedPortion(
    generateSciencePool(coreScienceGrade, expandedDayOfYearBonus, scienceDiff),
  );

  // ---- 비주지과목 풀 생성 (같은 학년 + 난이도 적용) ----
  const generatedSpelling = generateSpellingPool(
    grade,
    dayOfYear,
    spellingDiff,
  );
  const generatedSpellingExtra = generateSpellingPool(
    grade,
    expandedDayOfYear,
    spellingDiff,
  );
  const generatedSpellingBonus = takeExpandedPortion(
    generateSpellingPool(grade, expandedDayOfYearBonus, spellingDiff),
  );
  const generatedVocab = generateVocabPool(grade, dayOfYear, vocabDiff);
  const generatedVocabExtra = generateVocabPool(
    grade,
    expandedDayOfYear,
    vocabDiff,
  );
  const generatedVocabBonus = takeExpandedPortion(
    generateVocabPool(grade, expandedDayOfYearBonus, vocabDiff),
  );
  const generatedKnowledge = generateKnowledgePool(
    grade,
    dayOfYear,
    knowledgeDiff,
  );
  const generatedKnowledgeExtra = generateKnowledgePool(
    grade,
    expandedDayOfYear,
    knowledgeDiff,
  );
  const generatedKnowledgeBonus = takeExpandedPortion(
    generateKnowledgePool(grade, expandedDayOfYearBonus, knowledgeDiff),
  );
  const generatedSafety = generateSafetyPool(grade, dayOfYear, safetyDiff);
  const generatedSafetyExtra = generateSafetyPool(
    grade,
    expandedDayOfYear,
    safetyDiff,
  );
  const generatedSafetyBonus = takeExpandedPortion(
    generateSafetyPool(grade, expandedDayOfYearBonus, safetyDiff),
  );
  const generatedHanja = generateHanjaPool(grade, dayOfYear, hanjaDiff);
  const generatedHanjaExtra = generateHanjaPool(
    grade,
    expandedDayOfYear,
    hanjaDiff,
  );
  const generatedHanjaBonus = takeExpandedPortion(
    generateHanjaPool(grade, expandedDayOfYearBonus, hanjaDiff),
  );
  const generatedWriting = generateWritingPool(grade, dayOfYear);
  const generatedWritingExtra = generateWritingPool(grade, expandedDayOfYear);
  const generatedWritingBonus = takeExpandedPortion(
    generateWritingPool(grade, expandedDayOfYearBonus),
  );
  const generatedCreative = generateCreativePool(grade, dayOfYear);
  const generatedCreativeExtra = generateCreativePool(grade, expandedDayOfYear);
  const generatedCreativeBonus = takeExpandedPortion(
    generateCreativePool(grade, expandedDayOfYearBonus),
  );
  const generatedSocial = generateSocialPool(
    coreSocialGrade,
    dayOfYear,
    socialDiff,
  );
  const generatedSocialExtra = generateSocialPool(
    coreSocialGrade,
    expandedDayOfYear,
    socialDiff,
  );
  const generatedSocialBonus = takeExpandedPortion(
    generateSocialPool(coreSocialGrade, expandedDayOfYearBonus, socialDiff),
  );

  // ---- 독해(국어 지문) 풀 ----
  const generatedReading = generateReadingPool(grade, dayOfYear);
  const generatedReadingExtra = generateReadingPool(grade, expandedDayOfYear);
  const generatedReadingBonus = takeExpandedPortion(
    generateReadingPool(grade, expandedDayOfYearBonus),
  );

  // ---- 주지과목 단원 진도 필터링 (전 학년 기준) ----
  const filtMath = filterMathByProgress(
    [...generatedMath, ...generatedMathExtra, ...generatedMathBonus],
    coreMathGrade,
    semester,
  );
  const filtScience = filterScienceByProgress(
    [...generatedScience, ...generatedScienceExtra, ...generatedScienceBonus],
    coreScienceGrade,
    semester,
  );
  const filtEnglish = filterEnglishByProgress(
    [...generatedEnglish, ...generatedEnglishExtra, ...generatedEnglishBonus],
    coreEnglishGrade,
    semester,
  );
  const filtSocial = filterSocialByProgress(
    [...generatedSocial, ...generatedSocialExtra, ...generatedSocialBonus],
    coreSocialGrade,
    semester,
  );

  // ---- 주지과목 정적 데이터 (전 학년 기준) ----
  const staticMathData = getStaticMathData(coreMathGrade);
  const staticEnglishData = getStaticEnglishData(coreEnglishGrade);
  const staticScienceData = getStaticScienceData(coreScienceGrade);
  const staticSocialData = getStaticSocialData(coreSocialGrade);
  const staticKoreanData = getStaticKoreanData(coreMathGrade);
  const staticKoreanReadingData = getStaticKoreanReadingData(coreMathGrade);

  switch (grade) {
    case 1:
      return {
        spelling: [
          ...grade1SpellingData,
          ...generatedSpelling,
          ...generatedSpellingExtra,
          ...generatedSpellingBonus,
        ],
        vocab: [
          ...grade1VocabData,
          ...generatedVocab,
          ...generatedVocabExtra,
          ...generatedVocabBonus,
        ],
        math: [
          ...filterMathByProgress(staticMathData, coreMathGrade, semester),
          ...filtMath,
        ],
        knowledge: [
          ...grade1KnowledgeData,
          ...generatedKnowledge,
          ...generatedKnowledgeExtra,
          ...generatedKnowledgeBonus,
        ],
        safety: [
          ...grade1SafetyData,
          ...generatedSafety,
          ...generatedSafetyExtra,
          ...generatedSafetyBonus,
        ],
        writing: [
          ...grade1WritingPrompts,
          ...generatedWriting,
          ...generatedWritingExtra,
          ...generatedWritingBonus,
        ],
        korean: [
          ...staticKoreanData,
          ...generatedCreative,
          ...generatedCreativeExtra,
          ...generatedCreativeBonus,
        ],
        koreanReading: [
          ...staticKoreanReadingData,
          ...generatedReading,
          ...generatedReadingExtra,
          ...generatedReadingBonus,
        ],
        creative: [
          ...(grade1CreativeData || []),
          ...generatedCreative,
          ...generatedCreativeExtra,
          ...generatedCreativeBonus,
        ],
      };
    case 2:
      return {
        spelling: [
          ...grade2SpellingData,
          ...generatedSpelling,
          ...generatedSpellingExtra,
          ...generatedSpellingBonus,
        ],
        vocab: [
          ...grade2VocabData,
          ...generatedVocab,
          ...generatedVocabExtra,
          ...generatedVocabBonus,
        ],
        math: [
          ...filterMathByProgress(staticMathData, coreMathGrade, semester),
          ...filtMath,
        ],
        knowledge: [
          ...grade2KnowledgeData,
          ...generatedKnowledge,
          ...generatedKnowledgeExtra,
          ...generatedKnowledgeBonus,
        ],
        safety: [
          ...grade2SafetyData,
          ...generatedSafety,
          ...generatedSafetyExtra,
          ...generatedSafetyBonus,
        ],
        writing: [
          ...grade2WritingPrompts,
          ...generatedWriting,
          ...generatedWritingExtra,
          ...generatedWritingBonus,
        ],
        korean: [
          ...staticKoreanData,
          ...generatedCreative,
          ...generatedCreativeExtra,
          ...generatedCreativeBonus,
        ],
        koreanReading: [
          ...staticKoreanReadingData,
          ...generatedReading,
          ...generatedReadingExtra,
          ...generatedReadingBonus,
        ],
        creative: [
          ...(grade2CreativeData || []),
          ...generatedCreative,
          ...generatedCreativeExtra,
          ...generatedCreativeBonus,
        ],
      };
    case 3:
      return {
        spelling: [
          ...grade3SpellingData,
          ...generatedSpelling,
          ...generatedSpellingExtra,
          ...generatedSpellingBonus,
        ],
        vocab: [
          ...grade3VocabData,
          ...generatedVocab,
          ...generatedVocabExtra,
          ...generatedVocabBonus,
        ],
        math: [
          ...filterMathByProgress(staticMathData, coreMathGrade, semester),
          ...filtMath,
        ],
        knowledge: [
          ...grade3KnowledgeData,
          ...grade3KnowledgeDataExtra,
          ...generatedKnowledge,
          ...generatedKnowledgeExtra,
          ...generatedKnowledgeBonus,
        ],
        safety: [
          ...grade3SafetyData,
          ...grade3SafetyDataExtra,
          ...generatedSafety,
          ...generatedSafetyExtra,
          ...generatedSafetyBonus,
        ],
        writing: [
          ...grade3WritingPrompts,
          ...generatedWriting,
          ...generatedWritingExtra,
          ...generatedWritingBonus,
        ],
        hanja: [
          ...(grade3HanjaData || []),
          ...generatedHanja,
          ...generatedHanjaExtra,
          ...generatedHanjaBonus,
        ],
        english: [...staticEnglishData, ...filtEnglish],
        korean: [...staticKoreanData],
        koreanReading: [
          ...staticKoreanReadingData,
          ...generatedReading,
          ...generatedReadingExtra,
          ...generatedReadingBonus,
        ],
        creative: [
          ...(grade3CreativeData || []),
          ...generatedCreative,
          ...generatedCreativeExtra,
          ...generatedCreativeBonus,
        ],
      };
    case 4:
      return {
        spelling: [
          ...grade4SpellingData,
          ...generatedSpelling,
          ...generatedSpellingExtra,
          ...generatedSpellingBonus,
        ],
        vocab: [
          ...grade4VocabData,
          ...generatedVocab,
          ...generatedVocabExtra,
          ...generatedVocabBonus,
        ],
        math: [
          ...filterMathByProgress(staticMathData, coreMathGrade, semester),
          ...filtMath,
        ],
        knowledge: [
          ...grade4KnowledgeData,
          ...generatedKnowledge,
          ...generatedKnowledgeExtra,
          ...generatedKnowledgeBonus,
        ],
        safety: [
          ...grade4SafetyData,
          ...generatedSafety,
          ...generatedSafetyExtra,
          ...generatedSafetyBonus,
        ],
        writing: [
          ...grade4WritingPrompts,
          ...generatedWriting,
          ...generatedWritingExtra,
          ...generatedWritingBonus,
        ],
        hanja: [
          ...(grade4HanjaData || []),
          ...generatedHanja,
          ...generatedHanjaExtra,
          ...generatedHanjaBonus,
        ],
        english: [...staticEnglishData, ...filtEnglish],
        korean: [...staticKoreanData],
        koreanReading: [
          ...staticKoreanReadingData,
          ...generatedReading,
          ...generatedReadingExtra,
          ...generatedReadingBonus,
        ],
        creative: [
          ...(grade4CreativeData || []),
          ...generatedCreative,
          ...generatedCreativeExtra,
          ...generatedCreativeBonus,
        ],
      };
    case 5:
      return {
        spelling: [
          ...grade5SpellingData,
          ...generatedSpelling,
          ...generatedSpellingExtra,
          ...generatedSpellingBonus,
        ],
        vocab: [
          ...grade5VocabData,
          ...generatedVocab,
          ...generatedVocabExtra,
          ...generatedVocabBonus,
        ],
        math: [
          ...filterMathByProgress(staticMathData, coreMathGrade, semester),
          ...filtMath,
        ],
        knowledge: [
          ...grade5KnowledgeData,
          ...generatedKnowledge,
          ...generatedKnowledgeExtra,
          ...generatedKnowledgeBonus,
        ],
        safety: [
          ...grade5SafetyData,
          ...generatedSafety,
          ...generatedSafetyExtra,
          ...generatedSafetyBonus,
        ],
        writing: [
          ...grade5WritingPrompts,
          ...generatedWriting,
          ...generatedWritingExtra,
          ...generatedWritingBonus,
        ],
        hanja: [
          ...(grade5HanjaData || []),
          ...generatedHanja,
          ...generatedHanjaExtra,
          ...generatedHanjaBonus,
        ],
        english: [...staticEnglishData, ...filtEnglish],
        korean: [...staticKoreanData],
        koreanReading: [
          ...staticKoreanReadingData,
          ...generatedReading,
          ...generatedReadingExtra,
          ...generatedReadingBonus,
        ],
        creative: [
          ...(grade5CreativeData || []),
          ...generatedCreative,
          ...generatedCreativeExtra,
          ...generatedCreativeBonus,
        ],
        science: [...staticScienceData, ...filtScience],
        social: [
          ...filterSocialByProgress(
            staticSocialData,
            coreSocialGrade,
            semester,
          ),
          ...filtSocial,
        ],
      };
    case 6:
      return {
        spelling: [
          ...grade6SpellingData,
          ...generatedSpelling,
          ...generatedSpellingExtra,
          ...generatedSpellingBonus,
        ],
        vocab: [
          ...grade6VocabData,
          ...generatedVocab,
          ...generatedVocabExtra,
          ...generatedVocabBonus,
        ],
        math: [
          ...filterMathByProgress(staticMathData, coreMathGrade, semester),
          ...filtMath,
        ],
        knowledge: [
          ...grade6KnowledgeData,
          ...generatedKnowledge,
          ...generatedKnowledgeExtra,
          ...generatedKnowledgeBonus,
        ],
        safety: [
          ...grade6SafetyData,
          ...generatedSafety,
          ...generatedSafetyExtra,
          ...generatedSafetyBonus,
        ],
        writing: [
          ...grade6WritingPrompts,
          ...generatedWriting,
          ...generatedWritingExtra,
          ...generatedWritingBonus,
        ],
        hanja: [
          ...(grade6HanjaData || []),
          ...generatedHanja,
          ...generatedHanjaExtra,
          ...generatedHanjaBonus,
        ],
        english: [...staticEnglishData, ...filtEnglish],
        korean: [...staticKoreanData],
        koreanReading: [
          ...staticKoreanReadingData,
          ...generatedReading,
          ...generatedReadingExtra,
          ...generatedReadingBonus,
        ],
        creative: [
          ...(grade6CreativeData || []),
          ...generatedCreative,
          ...generatedCreativeExtra,
          ...generatedCreativeBonus,
        ],
        science: [...staticScienceData, ...filtScience],
        social: [
          ...filterSocialByProgress(
            staticSocialData,
            coreSocialGrade,
            semester,
          ),
          ...filtSocial,
        ],
      };
    default:
      return {
        spelling: [
          ...grade1SpellingData,
          ...generatedSpelling,
          ...generatedSpellingExtra,
          ...generatedSpellingBonus,
        ],
        vocab: [
          ...grade1VocabData,
          ...generatedVocab,
          ...generatedVocabExtra,
          ...generatedVocabBonus,
        ],
        math: [
          ...filterMathByProgress(staticMathData, coreMathGrade, semester),
          ...filtMath,
        ],
        knowledge: [
          ...grade1KnowledgeData,
          ...generatedKnowledge,
          ...generatedKnowledgeExtra,
          ...generatedKnowledgeBonus,
        ],
        safety: [
          ...grade1SafetyData,
          ...generatedSafety,
          ...generatedSafetyExtra,
          ...generatedSafetyBonus,
        ],
        writing: [
          ...grade1WritingPrompts,
          ...generatedWriting,
          ...generatedWritingExtra,
          ...generatedWritingBonus,
        ],
        korean: [
          ...staticKoreanData,
          ...generatedCreative,
          ...generatedCreativeExtra,
          ...generatedCreativeBonus,
        ],
        koreanReading: [
          ...staticKoreanReadingData,
          ...generatedReading,
          ...generatedReadingExtra,
          ...generatedReadingBonus,
        ],
        creative: [
          ...(grade1CreativeData || []),
          ...generatedCreative,
          ...generatedCreativeExtra,
          ...generatedCreativeBonus,
        ],
      };
  }
}

// Build an emotion_check question
function buildEmotionQuestion(
  setId: string,
  orderIndex: number,
  title: string,
): Question {
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "creative" as SubjectType,
    question_type: "emotion_check" as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      text: "오늘 아침 나의 기분은 어떤가요?",
      categories: [...EMOTION_CATEGORIES],
    },
    answer: { type: "emotion_bar" },
    explanation: null,
    points: 10,
    hint: "솔직하게 표시해 주세요!",
    metadata: null,
    created_at: new Date().toISOString(),
  };
}

// Build a readiness_check question
function buildReadinessQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  gradeGroup: "1-2" | "3-4" | "5-6",
): Question {
  const items = [...DEFAULT_READINESS_ITEMS[gradeGroup]];
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "creative" as SubjectType,
    question_type: "readiness_check" as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      text: "오늘 준비물을 확인해 볼까요?",
      items,
    },
    answer: { type: "checklist" },
    explanation: null,
    points: 10,
    hint: "하나씩 확인하면서 체크해요!",
    metadata: null,
    created_at: new Date().toISOString(),
  };
}

// Build a math question from real curriculum data
function buildMathQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  entry: MathEntry,
  choices: string[],
  variant: "choice" | "input" | "reverse" = "choice",
): Question {
  const expr = entry.expression || "";
  const firstOperand = expr.match(/^\s*(\d+)/)?.[1] || "";
  const isReverse = variant === "reverse" && firstOperand;
  const reverseExpression = isReverse ? expr.replace(/^\s*\d+/, "?") : expr;

  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "math" as SubjectType,
    question_type: (variant === "input"
      ? "short_answer"
      : "multiple_choice") as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      text:
        variant === "reverse"
          ? "빈칸에 들어갈 수를 구하세요."
          : "다음을 계산하세요.",
      expression: isReverse ? reverseExpression : expr,
      unit: entry.unit,
      choices: variant === "input" ? [] : choices,
      variant,
      ...(isReverse ? { result: entry.answer } : {}),
    },
    answer: {
      correct: isReverse ? firstOperand : String(entry.answer),
      text: isReverse ? firstOperand : String(entry.answer),
      steps: entry.steps || [],
    },
    explanation: entry.steps
      ? entry.steps.join(" -> ")
      : `정답: ${isReverse ? firstOperand : entry.answer}`,
    points: 10,
    hint: entry.unit.includes("곱셈")
      ? "곱셈구구를 떠올려 보세요!"
      : entry.unit.includes("뺄셈")
        ? "큰 수에서 작은 수를 빼세요!"
        : "차근차근 계산해 보세요!",
    metadata: {
      unit: entry.unit,
      hasCarry: entry.hasCarry,
      hasBorrow: entry.hasBorrow,
    },
    created_at: new Date().toISOString(),
  };
}

// Build a spelling question from real curriculum data
function buildSpellingQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  entry: SpellingEntry,
  choices: string[],
  variant: "sentence" | "word" | "correct" = "sentence",
  pool?: SpellingEntry[],
  random?: () => number,
): Question {
  const correctSentence = entry.answer === 1 ? entry.q1 : entry.q2;
  const wrongSentence = entry.answer === 1 ? entry.q2 : entry.q1;

  if (variant === "word") {
    // Find differing words between correct and wrong sentences
    const correctWords = correctSentence.split(/\s+/);
    const wrongWords = wrongSentence.split(/\s+/);
    let diffIndex = 0;
    for (let i = 0; i < wrongWords.length; i++) {
      if (i >= correctWords.length || wrongWords[i] !== correctWords[i]) {
        diffIndex = i;
        break;
      }
    }
    const wrongPart = wrongWords[diffIndex] || wrongWords[0];
    const correctPart = correctWords[diffIndex] || correctWords[0];

    // Build word-level choices: the wrong part + 3 other parts from the sentence
    const otherParts = wrongWords
      .filter((_, i) => i !== diffIndex && _.length > 1)
      .slice(0, 3);
    while (otherParts.length < 3) {
      otherParts.push(correctPart);
    }
    const wordChoices = random
      ? shuffleChoices([wrongPart, ...otherParts.slice(0, 3)], random)
      : [wrongPart, ...otherParts.slice(0, 3)];

    return {
      id: `q-${setId}-${orderIndex}`,
      daily_set_id: setId,
      curriculum_standard_id: null,
      subject: "spelling" as SubjectType,
      question_type: "multiple_choice" as QuestionType,
      order_index: orderIndex,
      title,
      content: {
        variant: "word",
        text: "다음 문장에서 맞춤법이 틀린 부분을 찾으세요.",
        wrongSentence,
        correctPart,
        options: wordChoices,
      },
      answer: {
        correct: wrongPart,
        text: wrongPart,
      },
      explanation: entry.explanation,
      points: 10,
      hint: `"${correctPart}"이(가) 올바른 표현이에요.`,
      metadata: null,
      created_at: new Date().toISOString(),
    };
  }

  if (variant === "correct") {
    // Show wrong sentence, pick correct sentence as answer, distractors from other correct sentences
    const rng = random || Math.random;
    const otherCorrects = (pool || [])
      .filter((item) => item !== entry)
      .map((item) => (item.answer === 1 ? item.q1 : item.q2))
      .filter((s) => s !== correctSentence);
    const distractors = shuffleChoices([...new Set(otherCorrects)], rng).slice(
      0,
      3,
    );
    while (distractors.length < 3) {
      distractors.push(wrongSentence);
    }
    const correctChoices = shuffleChoices(
      [correctSentence, ...distractors],
      rng,
    );

    return {
      id: `q-${setId}-${orderIndex}`,
      daily_set_id: setId,
      curriculum_standard_id: null,
      subject: "spelling" as SubjectType,
      question_type: "multiple_choice" as QuestionType,
      order_index: orderIndex,
      title,
      content: {
        variant: "correct",
        text: "다음 문장을 올바르게 고치면?",
        wrongSentence,
        options: correctChoices,
      },
      answer: {
        correct: correctSentence,
        text: correctSentence,
      },
      explanation: entry.explanation,
      points: 10,
      hint: "소리 내어 읽어보면 구별이 쉬워요!",
      metadata: null,
      created_at: new Date().toISOString(),
    };
  }

  // Default: 'sentence' variant (existing behavior)
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "spelling" as SubjectType,
    question_type: "multiple_choice" as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      variant: "sentence",
      text: "다음 중 맞춤법이 올바른 문장을 고르세요.",
      options: choices,
    },
    answer: {
      correct: correctSentence,
      text: correctSentence,
    },
    explanation: entry.explanation,
    points: 10,
    hint: "소리 내어 읽어보면 구별이 쉬워요!",
    metadata: null,
    created_at: new Date().toISOString(),
  };
}

// Build a vocabulary question from real curriculum data
function buildVocabQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  entry: VocabEntry,
  choices: string[],
  variant: string = "clue",
): Question {
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "vocabulary" as SubjectType,
    question_type:
      variant === "input"
        ? ("short_answer" as QuestionType)
        : ("multiple_choice" as QuestionType),
    order_index: orderIndex,
    title,
    content: {
      variant,
      text:
        variant === "reverse"
          ? "낱말을 보고 알맞은 뜻을 고르세요."
          : variant === "input"
            ? "다음 뜻풀이를 보고 알맞은 낱말을 입력하세요."
            : variant === "synonym"
              ? "다음 낱말과 뜻이 비슷한 말(유의어)을 고르세요."
              : variant === "antonym"
                ? "다음 낱말과 반대되는 말(반의어)을 고르세요."
                : variant === "idiom"
                  ? "다음 관용어/속담의 뜻을 고르세요."
                  : variant === "multi_meaning"
                    ? "다음 뜻풀이와 예문에 해당하는 다의어를 고르세요."
                    : variant === "word_puzzle"
                      ? "힌트를 보고 알맞은 낱말을 고르세요."
                      : "다음 뜻풀이를 보고 알맞은 낱말을 고르세요.",
      clues: entry.meanings,
      meanings: entry.meanings,
      choices,
    },
    answer: {
      correct: variant === "reverse" ? entry.meanings[0] : entry.answer,
      text: entry.answer,
    },
    explanation: `정답은 "${entry.answer}"입니다. ${entry.meanings.join(", ")}`,
    points: 10,
    hint: `${entry.meanings[0]}`,
    metadata: null,
    created_at: new Date().toISOString(),
  };
}

// Build a knowledge question from real curriculum data
function buildKnowledgeQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  entry: KnowledgeEntry,
  choices: string[],
  variant: string = "fill",
  random?: () => number,
): Question {
  const rng = random || Math.random;
  if (variant === "tf") {
    const isCorrectStatement = rng() > 0.5;
    const filledText = entry.text.replace("___", entry.answer);
    let displayText = filledText;
    if (!isCorrectStatement) {
      const wrongChoices = choices.filter((c) => c !== entry.answer);
      const wrongAnswer =
        wrongChoices.length > 0
          ? wrongChoices[Math.floor(rng() * wrongChoices.length)]
          : entry.answer;
      displayText = entry.text.replace("___", wrongAnswer);
    }
    return {
      id: `q-${setId}-${orderIndex}`,
      daily_set_id: setId,
      curriculum_standard_id: null,
      subject: "general_knowledge" as SubjectType,
      question_type: "true_false" as QuestionType,
      order_index: orderIndex,
      title,
      content: {
        variant: "tf",
        text: displayText,
        category: entry.category,
        choices: [],
      },
      answer: { correct: isCorrectStatement ? "O" : "X", text: entry.answer },
      explanation: filledText,
      points: 10,
      hint: `${entry.category} 분야의 문제예요.`,
      metadata: { category: entry.category },
      created_at: new Date().toISOString(),
    };
  }
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "general_knowledge" as SubjectType,
    question_type:
      variant === "input"
        ? ("short_answer" as QuestionType)
        : ("multiple_choice" as QuestionType),
    order_index: orderIndex,
    title,
    content: { variant, text: entry.text, category: entry.category, choices },
    answer: { correct: entry.answer, text: entry.answer },
    explanation: `${entry.text.replace("___", entry.answer)}`,
    points: 10,
    hint: `${entry.category} 분야의 문제예요.`,
    metadata: { category: entry.category },
    created_at: new Date().toISOString(),
  };
}

// Build a safety question from real curriculum data
function buildSafetyQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  entry: SafetyEntry,
  choices: string[],
  variant: string = "fill",
  random?: () => number,
): Question {
  const rng = random || Math.random;
  if (variant === "tf") {
    const isCorrectStatement = rng() > 0.5;
    const filledText = entry.text.replace("___", entry.answer);
    let displayText = filledText;
    if (!isCorrectStatement) {
      const wrongChoices = choices.filter((c) => c !== entry.answer);
      const wrongAnswer =
        wrongChoices.length > 0
          ? wrongChoices[Math.floor(rng() * wrongChoices.length)]
          : entry.answer;
      displayText = entry.text.replace("___", wrongAnswer);
    }
    return {
      id: `q-${setId}-${orderIndex}`,
      daily_set_id: setId,
      curriculum_standard_id: null,
      subject: "safety" as SubjectType,
      question_type: "true_false" as QuestionType,
      order_index: orderIndex,
      title,
      content: {
        variant: "tf",
        text: displayText,
        category: entry.category,
        choices: [],
      },
      answer: { correct: isCorrectStatement ? "O" : "X", text: entry.answer },
      explanation: filledText,
      points: 10,
      hint: `${entry.category}에 관한 문제예요. 안전이 최우선!`,
      metadata: { category: entry.category },
      created_at: new Date().toISOString(),
    };
  }
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "safety" as SubjectType,
    question_type:
      variant === "input"
        ? ("short_answer" as QuestionType)
        : ("multiple_choice" as QuestionType),
    order_index: orderIndex,
    title,
    content: { variant, text: entry.text, category: entry.category, choices },
    answer: { correct: entry.answer, text: entry.answer },
    explanation: `${entry.text.replace("___", entry.answer)}`,
    points: 10,
    hint: `${entry.category}에 관한 문제예요. 안전이 최우선!`,
    metadata: { category: entry.category },
    created_at: new Date().toISOString(),
  };
}

// Build a writing prompt question
function buildWritingQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  prompt: string,
  grade: number,
): Question {
  const minChars = grade <= 2 ? 20 : grade <= 4 ? 50 : 100;
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "writing" as SubjectType,
    question_type: "writing_prompt" as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      prompt,
      min_chars: minChars,
    },
    answer: { type: "free_text" },
    explanation: null,
    points: 10,
    hint: "떠오르는 생각을 자유롭게 써 보세요!",
    metadata: { minChars },
    created_at: new Date().toISOString(),
  };
}

// Build a hanja question with variant types
type HanjaVariant = "reading" | "meaning" | "character" | "word" | "writing";

function buildHanjaQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  entry: HanjaEntry,
  choices: string[],
  variant: HanjaVariant = "reading",
): Question {
  const base = {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "hanja" as SubjectType,
    order_index: orderIndex,
    title,
    points: 10,
    metadata: { strokes: entry.strokes, sentence: entry.sentence, variant },
    created_at: new Date().toISOString(),
  };

  const explanation = `${entry.character}는 '${entry.meaning}'으로, '${entry.reading}'이라 읽습니다. 예: ${entry.words.join(", ")}`;

  switch (variant) {
    case "reading": // 음 맞추기 (4지선다)
      return {
        ...base,
        question_type: "multiple_choice" as QuestionType,
        content: {
          variant: "reading",
          text: `${entry.character}(${entry.meaning}): 이 한자의 음(소리)은?`,
          character: entry.character,
          meaning: entry.meaning,
          reading: entry.reading,
          strokes: entry.strokes,
          words: entry.words,
          sentence: entry.sentence,
          choices,
        },
        answer: { correct: entry.reading, text: entry.reading },
        explanation,
        hint: `'${entry.meaning}'에서 힌트를 찾아보세요.`,
      };

    case "meaning": // 뜻 맞추기 (4지선다)
      return {
        ...base,
        question_type: "multiple_choice" as QuestionType,
        content: {
          variant: "meaning",
          text: `${entry.character}(${entry.reading}): 이 한자의 뜻(훈)은?`,
          character: entry.character,
          meaning: entry.meaning,
          reading: entry.reading,
          strokes: entry.strokes,
          words: entry.words,
          choices,
        },
        answer: { correct: entry.meaning, text: entry.meaning },
        explanation,
        hint: `${entry.words[0]}에서 힌트를 찾아보세요.`,
      };

    case "character": // 한자 맞추기 (4지선다)
      return {
        ...base,
        question_type: "multiple_choice" as QuestionType,
        content: {
          variant: "character",
          text: `'${entry.meaning}' = '${entry.reading}': 맞는 한자는?`,
          character: entry.character,
          meaning: entry.meaning,
          reading: entry.reading,
          strokes: entry.strokes,
          words: entry.words,
          choices,
        },
        answer: { correct: entry.character, text: entry.character },
        explanation,
        hint: `획수가 ${entry.strokes}획인 글자예요.`,
      };

    case "word": // 단어 맞추기 (4지선다)
      return {
        ...base,
        question_type: "multiple_choice" as QuestionType,
        content: {
          variant: "word",
          text: `${entry.character}(${entry.meaning}/${entry.reading})가 들어간 단어는?`,
          character: entry.character,
          meaning: entry.meaning,
          reading: entry.reading,
          strokes: entry.strokes,
          words: entry.words,
          choices,
        },
        answer: {
          correct:
            choices.find((c) => entry.words.includes(c)) || entry.words[0],
          text: entry.words[0],
        },
        explanation: `${entry.character}(${entry.reading})가 들어간 단어: ${entry.words.join(", ")}`,
        hint: `'${entry.reading}'이 들어간 단어를 찾아보세요.`,
      };

    case "writing": // 따라쓰기 (직접 입력)
      return {
        ...base,
        question_type: "short_answer" as QuestionType,
        content: {
          variant: "writing",
          text: `${entry.character}(${entry.meaning}): 음을 직접 써보세요`,
          character: entry.character,
          meaning: entry.meaning,
          reading: entry.reading,
          strokes: entry.strokes,
          words: entry.words,
          sentence: entry.sentence,
          choices: [],
        },
        answer: { correct: entry.reading, text: entry.reading },
        explanation,
        hint: `${entry.words[0]}에서 '${entry.reading}'을 찾아보세요.`,
      };
  }
}

// Build an english question from EnglishEntry data
function buildEnglishQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  entry: EnglishEntry,
  choices: string[],
  variant: string = "word",
): Question {
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "english" as SubjectType,
    question_type:
      variant === "input"
        ? ("short_answer" as QuestionType)
        : ("multiple_choice" as QuestionType),
    order_index: orderIndex,
    title,
    content: {
      variant,
      text:
        variant === "meaning"
          ? `다음 뜻에 해당하는 영단어를 고르세요.`
          : variant === "input"
            ? `다음 문장의 빈칸에 알맞은 영단어를 입력하세요.\n"${entry.sentence}"`
            : `다음 영어 문장을 읽고, 밑줄 친 단어의 뜻을 쓰세요.\n"${entry.sentence}"\n단어: ${entry.word} [${entry.pronunciation}]`,
      sentence: entry.sentence,
      word: entry.word,
      translation: entry.translation,
      pronunciation: entry.pronunciation,
      practice: entry.practice,
      choices,
    },
    answer: { correct: entry.word, text: entry.word },
    explanation: `"${entry.sentence}" → ${entry.translation}`,
    points: 10,
    hint: `[${entry.pronunciation}]로 발음해요.`,
    metadata: { word: entry.word },
    created_at: new Date().toISOString(),
  };
}

function buildReadingQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  subject: SubjectType,
  entry: ReadingEntry,
  random?: () => number,
): Question {
  const rng = random || Math.random;
  const shuffled = [...entry.choices].sort(() => rng() - 0.5);
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject,
    question_type: "multiple_choice" as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      variant: "reading",
      passage: entry.passage,
      text: entry.question,
      category: entry.category,
      choices: shuffled,
    },
    answer: { correct: entry.correct, text: entry.correct },
    explanation: `지문: ${entry.passage.substring(0, 50)}...`,
    points: 10,
    hint: `지문을 다시 한번 읽어보세요!`,
    metadata: { category: entry.category },
    created_at: new Date().toISOString(),
  };
}

// Generic builder for subject-specific KnowledgeEntry data (korean, creative, science, social)
function buildSubjectQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  subject: SubjectType,
  entry: KnowledgeEntry,
  hintPrefix: string,
  choices: string[],
  variant: string = "fill",
  random?: () => number,
): Question {
  const rng = random || Math.random;
  if (variant === "tf") {
    const isCorrectStatement = rng() > 0.5;
    const filledText = entry.text.replace("___", entry.answer);
    let displayText = filledText;
    if (!isCorrectStatement) {
      const wrongChoices = choices.filter((c) => c !== entry.answer);
      const wrongAnswer =
        wrongChoices.length > 0
          ? wrongChoices[Math.floor(rng() * wrongChoices.length)]
          : entry.answer;
      displayText = entry.text.replace("___", wrongAnswer);
    }
    return {
      id: `q-${setId}-${orderIndex}`,
      daily_set_id: setId,
      curriculum_standard_id: null,
      subject,
      question_type: "true_false" as QuestionType,
      order_index: orderIndex,
      title,
      content: {
        variant: "tf",
        text: displayText,
        category: entry.category,
        choices: [],
      },
      answer: { correct: isCorrectStatement ? "O" : "X", text: entry.answer },
      explanation: filledText,
      points: 10,
      hint: `${hintPrefix} ${entry.category} 문제예요.`,
      metadata: { category: entry.category },
      created_at: new Date().toISOString(),
    };
  }
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject,
    question_type:
      variant === "input"
        ? ("short_answer" as QuestionType)
        : ("multiple_choice" as QuestionType),
    order_index: orderIndex,
    title,
    content: { variant, text: entry.text, category: entry.category, choices },
    answer: { correct: entry.answer, text: entry.answer },
    explanation: entry.text.replace("___", entry.answer),
    points: 10,
    hint: `${hintPrefix} ${entry.category} 문제예요.`,
    metadata: { category: entry.category },
    created_at: new Date().toISOString(),
  };
}

export function getQuestionSignature(question: Question): string | null {
  if (!NON_REPEATABLE_QUESTION_TYPES.has(question.question_type)) {
    return null;
  }

  return JSON.stringify({
    subject: question.subject,
    question_type: question.question_type,
    content: question.content,
    answer: question.answer,
  });
}

function countRepeatedQuestions(
  questions: Question[],
  usedQuestionSignatures?: Set<string>,
): number {
  if (!usedQuestionSignatures || usedQuestionSignatures.size === 0) {
    return 0;
  }

  return questions.reduce((count, question) => {
    const signature = getQuestionSignature(question);
    if (!signature || !usedQuestionSignatures.has(signature)) {
      return count;
    }
    return count + 1;
  }, 0);
}

/**
 * Generate a daily set that the student has NOT completed yet.
 * @param completedSetIds - set IDs the student already completed (from learning records)
 */
export function generateDailySet(
  grade: number,
  semester: number,
  completedSetIds?: Set<string>,
  subjectAccuracy?: Record<string, { accuracy: number }>,
): DailySetWithQuestions {
  const dayOfYear = getDayOfYear();

  // Try current day's seed first, then increment to find an unused set
  let attempt = 0;
  const baseSeed = dayOfYear;
  let setId = "";

  // Try up to 1000 different seeds to find a set the student hasn't done
  while (attempt < 1000) {
    const candidateSeed = baseSeed + attempt;
    setId = `set-${grade}-${semester}-${candidateSeed}`;
    if (!completedSetIds || !completedSetIds.has(setId)) {
      break;
    }
    attempt++;
  }

  const finalSeed = baseSeed + attempt;
  const seed = finalSeed * 1000 + grade * 100 + semester;
  const random = seededRandom(seed);
  const gradeGroup = getGradeGroup(grade);
  const composition = GRADE_SET_COMPOSITION[gradeGroup];
  const data = getGradeData(grade, semester, finalSeed, subjectAccuracy);

  // Attach new vocab variant pools
  data.synonymPairs = getSynonymPairs(grade, finalSeed);
  data.antonymPairs = getAntonymPairs(grade, finalSeed);
  data.idioms = getIdiomEntries(grade, finalSeed);
  data.multiMeaningWords = getMultiMeaningWords(grade, finalSeed);
  data.wordPuzzles = getWordPuzzles(grade, finalSeed);

  const setNumber = (finalSeed % 10000) + 1;

  const dailySet: DailySet = {
    id: setId,
    grade,
    semester,
    set_number: setNumber,
    title: `${grade}학년 ${semester}학기 #${setNumber}`,
    description: "오늘의 아침학습",
    estimated_minutes: Math.round(composition.totalQuestions * 2),
    total_questions: composition.totalQuestions,
    total_points: composition.totalQuestions * 10,
    is_published: true,
    created_at: new Date().toISOString(),
  };

  const questions: Question[] = [];
  let orderIndex = 0;

  // Track which items have been used so we don't pick duplicates within a set
  const usedIndices: Record<string, Set<number>> = {};

  function pickUnused<T>(arr: T[], key: string): T {
    if (!arr || arr.length === 0) {
      throw new Error(`No data available for ${key}`);
    }
    if (!usedIndices[key]) usedIndices[key] = new Set();
    const used = usedIndices[key];
    const available = arr
      .map((item, i) => ({ item, i }))
      .filter(({ i }) => !used.has(i));
    if (available.length === 0) {
      const idx = Math.floor(random() * arr.length);
      return arr[idx];
    }
    const pick = available[Math.floor(random() * available.length)];
    used.add(pick.i);
    return pick.item;
  }

  for (const section of composition.sections) {
    for (let i = 0; i < section.count; i++) {
      const subject = section.subject;

      if (subject === "emotion_check") {
        questions.push(buildEmotionQuestion(setId, orderIndex, section.title));
      } else if (subject === "readiness_check") {
        questions.push(
          buildReadinessQuestion(setId, orderIndex, section.title, gradeGroup),
        );
      } else if (subject === "math") {
        const entry = pickUnused(data.math, "math");
        const mathVariants: Array<"choice" | "choice" | "input" | "reverse"> = [
          "choice",
          "choice",
          "input",
          "reverse",
        ];
        const mv = mathVariants[Math.floor(random() * mathVariants.length)];
        // For reverse variant, choices are based on the first operand instead of the answer
        const expr = entry.expression || "";
        const firstOp = expr.match(/^\s*(\d+)/)?.[1] || "";
        const choiceBase =
          mv === "reverse" && firstOp ? Number(firstOp) : Number(entry.answer);
        const choices =
          mv === "input" ? [] : generateMathChoices(choiceBase, random);
        questions.push(
          buildMathQuestion(
            setId,
            orderIndex,
            section.title,
            entry,
            choices,
            mv,
          ),
        );
      } else if (subject === "spelling") {
        const entry = pickUnused(data.spelling, "spelling");
        const spellingVariants: Array<"sentence" | "word" | "correct"> = [
          "sentence",
          "sentence",
          "word",
          "correct",
        ];
        const variant =
          spellingVariants[Math.floor(random() * spellingVariants.length)];
        const choices = generateSpellingChoices(entry, data.spelling, random);
        questions.push(
          buildSpellingQuestion(
            setId,
            orderIndex,
            section.title,
            entry,
            choices,
            variant,
            data.spelling,
            random,
          ),
        );
      } else if (subject === "vocabulary") {
        // Expanded variant pool with new question types
        const vvariants = [
          "clue",
          "clue",
          "reverse",
          "input",
          "synonym",
          "antonym",
          "idiom",
          "multi_meaning",
          "word_puzzle",
        ];
        const vv = vvariants[Math.floor(random() * vvariants.length)];

        // Handle new variant types
        if (
          vv === "synonym" &&
          data.synonymPairs &&
          data.synonymPairs.length > 0
        ) {
          const idx = Math.floor(random() * data.synonymPairs.length);
          const pair = data.synonymPairs[idx];
          const askWord1 = random() > 0.5;
          const questionWord = askWord1 ? pair.word1 : pair.word2;
          const answerWord = askWord1 ? pair.word2 : pair.word1;
          // Generate wrong choices from other synonym pairs
          const wrongChoices = data.synonymPairs
            .filter((_, i) => i !== idx)
            .map((p) => (random() > 0.5 ? p.word1 : p.word2))
            .filter((w) => w !== answerWord);
          shuffleArrayInPlace(wrongChoices, random);
          const choices = [answerWord, ...wrongChoices.slice(0, 3)];
          shuffleArrayInPlace(choices, random);
          questions.push(
            buildVocabQuestion(
              setId,
              orderIndex,
              section.title,
              {
                meanings: [
                  pair.meaning,
                  `"${questionWord}"과(와) 뜻이 비슷한 말`,
                ],
                answer: answerWord,
              },
              choices,
              "synonym",
            ),
          );
        } else if (
          vv === "antonym" &&
          data.antonymPairs &&
          data.antonymPairs.length > 0
        ) {
          const idx = Math.floor(random() * data.antonymPairs.length);
          const pair = data.antonymPairs[idx];
          const askWord1 = random() > 0.5;
          const questionWord = askWord1 ? pair.word1 : pair.word2;
          const answerWord = askWord1 ? pair.word2 : pair.word1;
          const wrongChoices = data.antonymPairs
            .filter((_, i) => i !== idx)
            .map((p) => (random() > 0.5 ? p.word1 : p.word2))
            .filter((w) => w !== answerWord);
          shuffleArrayInPlace(wrongChoices, random);
          const choices = [answerWord, ...wrongChoices.slice(0, 3)];
          shuffleArrayInPlace(choices, random);
          questions.push(
            buildVocabQuestion(
              setId,
              orderIndex,
              section.title,
              {
                meanings: [
                  askWord1 ? pair.meaning1 : pair.meaning2,
                  `"${questionWord}"의 반대말`,
                ],
                answer: answerWord,
              },
              choices,
              "antonym",
            ),
          );
        } else if (vv === "idiom" && data.idioms && data.idioms.length > 0) {
          const idx = Math.floor(random() * data.idioms.length);
          const idiom = data.idioms[idx];
          const wrongChoices = data.idioms
            .filter((_, i) => i !== idx)
            .map((id) => id.meaning);
          shuffleArrayInPlace(wrongChoices, random);
          const choices = [idiom.meaning, ...wrongChoices.slice(0, 3)];
          shuffleArrayInPlace(choices, random);
          questions.push(
            buildVocabQuestion(
              setId,
              orderIndex,
              section.title,
              {
                meanings: [idiom.expression, idiom.example],
                answer: idiom.meaning,
              },
              choices,
              "idiom",
            ),
          );
        } else if (
          vv === "multi_meaning" &&
          data.multiMeaningWords &&
          data.multiMeaningWords.length > 0
        ) {
          const idx = Math.floor(random() * data.multiMeaningWords.length);
          const mmw = data.multiMeaningWords[idx];
          // Pick one meaning and ask which word has this meaning
          const mIdx = Math.floor(random() * mmw.meanings.length);
          const correctMeaning = mmw.meanings[mIdx];
          const wrongChoices = data.vocab
            .map((v) => v.answer)
            .filter((w) => w !== mmw.word);
          shuffleArrayInPlace(wrongChoices, random);
          const choices = [mmw.word, ...wrongChoices.slice(0, 3)];
          shuffleArrayInPlace(choices, random);
          questions.push(
            buildVocabQuestion(
              setId,
              orderIndex,
              section.title,
              {
                meanings: [
                  correctMeaning.meaning,
                  `예문: ${correctMeaning.example}`,
                ],
                answer: mmw.word,
              },
              choices,
              "multi_meaning",
            ),
          );
        } else if (
          vv === "word_puzzle" &&
          data.wordPuzzles &&
          data.wordPuzzles.length > 0
        ) {
          const idx = Math.floor(random() * data.wordPuzzles.length);
          const puzzle = data.wordPuzzles[idx];
          const wrongChoices = data.vocab
            .map((v) => v.answer)
            .filter((w) => w !== puzzle.word);
          shuffleArrayInPlace(wrongChoices, random);
          const choices = [puzzle.word, ...wrongChoices.slice(0, 3)];
          shuffleArrayInPlace(choices, random);
          questions.push(
            buildVocabQuestion(
              setId,
              orderIndex,
              section.title,
              {
                meanings: [
                  puzzle.meaning,
                  `${puzzle.letterCount}글자, 첫 글자: ${puzzle.firstLetter}, 끝 글자: ${puzzle.lastLetter}`,
                ],
                answer: puzzle.word,
              },
              choices,
              "word_puzzle",
            ),
          );
        } else {
          // Fallback to existing variants
          const fallbackVv = ["clue", "reverse", "input"][
            Math.floor(random() * 3)
          ];
          const entry = pickUnused(data.vocab, "vocab");
          let choices: string[];
          if (fallbackVv === "reverse") {
            choices = generateChoices(
              entry.meanings[0],
              data.vocab,
              (v) => v.meanings[0],
              random,
            );
          } else if (fallbackVv === "input") {
            choices = [];
          } else {
            choices = generateChoices(
              entry.answer,
              data.vocab,
              (v) => v.answer,
              random,
            );
          }
          questions.push(
            buildVocabQuestion(
              setId,
              orderIndex,
              section.title,
              entry,
              choices,
              fallbackVv,
            ),
          );
        }
      } else if (subject === "general_knowledge") {
        const entry = pickUnused(data.knowledge, "knowledge");
        const kvariants = ["fill", "fill", "tf", "input"];
        const kv = kvariants[Math.floor(random() * kvariants.length)];
        const choices =
          kv === "input"
            ? []
            : generateChoices(
                entry.answer,
                data.knowledge,
                (k) => k.answer,
                random,
              );
        questions.push(
          buildKnowledgeQuestion(
            setId,
            orderIndex,
            section.title,
            entry,
            choices,
            kv,
            random,
          ),
        );
      } else if (subject === "safety") {
        const entry = pickUnused(data.safety, "safety");
        const svariants = ["fill", "fill", "tf", "input"];
        const sv = svariants[Math.floor(random() * svariants.length)];
        const choices =
          sv === "input"
            ? []
            : generateChoices(
                entry.answer,
                data.safety,
                (s) => s.answer,
                random,
              );
        questions.push(
          buildSafetyQuestion(
            setId,
            orderIndex,
            section.title,
            entry,
            choices,
            sv,
            random,
          ),
        );
      } else if (subject === "writing") {
        const prompt = pickUnused(data.writing, "writing");
        questions.push(
          buildWritingQuestion(setId, orderIndex, section.title, prompt, grade),
        );
      } else if (subject === "hanja" && data.hanja && data.hanja.length > 0) {
        const entry = pickUnused(data.hanja, "hanja");
        const hvariants: HanjaVariant[] = [
          "reading",
          "meaning",
          "character",
          "word",
          "writing",
        ];
        const hvariant = hvariants[Math.floor(random() * hvariants.length)];
        let hchoices: string[];
        if (hvariant === "meaning") {
          hchoices = generateChoices(
            entry.meaning,
            data.hanja,
            (h) => h.meaning,
            random,
          );
        } else if (hvariant === "character") {
          hchoices = generateChoices(
            entry.character,
            data.hanja,
            (h) => h.character,
            random,
          );
        } else if (hvariant === "word") {
          const cw = entry.words[Math.floor(random() * entry.words.length)];
          const ow = [
            ...new Set(
              data.hanja
                .filter((h) => h.character !== entry.character)
                .flatMap((h) => h.words)
                .filter((w) => !entry.words.includes(w)),
            ),
          ];
          for (let i = ow.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [ow[i], ow[j]] = [ow[j], ow[i]];
          }
          const ds = ow.slice(0, 3);
          while (ds.length < 3) ds.push(`${cw}(아님)`);
          hchoices = [cw, ...ds];
          for (let i = hchoices.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [hchoices[i], hchoices[j]] = [hchoices[j], hchoices[i]];
          }
        } else if (hvariant === "writing") {
          hchoices = [];
        } else {
          hchoices = generateChoices(
            entry.reading,
            data.hanja,
            (h) => h.reading,
            random,
          );
        }
        questions.push(
          buildHanjaQuestion(
            setId,
            orderIndex,
            section.title,
            entry,
            hchoices,
            hvariant,
          ),
        );
      } else if (
        subject === "english" &&
        data.english &&
        data.english.length > 0
      ) {
        const entry = pickUnused(data.english, "english");
        const evariants = ["word", "word", "meaning", "input"];
        const ev = evariants[Math.floor(random() * evariants.length)];
        let choices: string[];
        if (ev === "meaning") {
          choices = generateChoices(
            entry.word,
            data.english,
            (e) => e.word,
            random,
          );
        } else if (ev === "input") {
          choices = [];
        } else {
          choices = generateChoices(
            entry.word,
            data.english,
            (e) => e.word,
            random,
          );
        }
        questions.push(
          buildEnglishQuestion(
            setId,
            orderIndex,
            section.title,
            entry,
            choices,
            ev,
          ),
        );
      } else if (subject === "korean") {
        // 독해(reading) variant: 지문 읽고 4지선다
        const hasKorean = data.korean && data.korean.length > 0;
        const hasReading = data.koreanReading && data.koreanReading.length > 0;

        if (!hasKorean && !hasReading) {
          throw new Error(`No korean data available for grade ${grade}`);
        }

        const skv = hasKorean
          ? ["fill", "fill", "tf", "input", "reading", "reading"]
          : ["reading"];
        const skvar = skv[Math.floor(random() * skv.length)];

        if (skvar === "reading" && hasReading) {
          const readingEntry = pickUnused(data.koreanReading!, "koreanReading");
          questions.push(
            buildReadingQuestion(
              setId,
              orderIndex,
              section.title,
              "korean" as SubjectType,
              readingEntry,
              random,
            ),
          );
        } else if (hasKorean) {
          const entry = pickUnused(data.korean!, "korean");
          const pool = data.korean!;
          const fallbackVar = ["fill", "fill", "tf", "input"];
          const fv = fallbackVar[Math.floor(random() * fallbackVar.length)];
          const choices =
            fv === "input"
              ? []
              : generateChoices(entry.answer, pool, (k) => k.answer, random);
          questions.push(
            buildSubjectQuestion(
              setId,
              orderIndex,
              section.title,
              "korean" as SubjectType,
              entry,
              "국어",
              choices,
              fv,
              random,
            ),
          );
        } else if (hasReading) {
          const readingEntry = pickUnused(data.koreanReading!, "koreanReading");
          questions.push(
            buildReadingQuestion(
              setId,
              orderIndex,
              section.title,
              "korean" as SubjectType,
              readingEntry,
              random,
            ),
          );
        } else {
          // 이 분기는 위의 early return으로 인해 도달할 수 없지만 안전장치로 유지
          throw new Error(
            `Unable to generate korean question for grade ${grade}`,
          );
        }
      } else if (
        subject === "creative" &&
        data.creative &&
        data.creative.length > 0
      ) {
        const entry = pickUnused(data.creative, "creative");
        const pool = data.creative!;
        const skv = ["fill", "fill", "tf", "input"];
        const skvar = skv[Math.floor(random() * skv.length)];
        const choices =
          skvar === "input"
            ? []
            : generateChoices(entry.answer, pool, (k) => k.answer, random);
        questions.push(
          buildSubjectQuestion(
            setId,
            orderIndex,
            section.title,
            "creative" as SubjectType,
            entry,
            "창의",
            choices,
            skvar,
            random,
          ),
        );
      } else if (
        subject === "science" &&
        data.science &&
        data.science.length > 0
      ) {
        const entry = pickUnused(data.science, "science");
        const pool = data.science!;
        const skv = ["fill", "fill", "tf", "input"];
        const skvar = skv[Math.floor(random() * skv.length)];
        const choices =
          skvar === "input"
            ? []
            : generateChoices(entry.answer, pool, (k) => k.answer, random);
        questions.push(
          buildSubjectQuestion(
            setId,
            orderIndex,
            section.title,
            "science" as SubjectType,
            entry,
            "과학",
            choices,
            skvar,
            random,
          ),
        );
      } else if (
        subject === "social" &&
        data.social &&
        data.social.length > 0
      ) {
        const entry = pickUnused(data.social, "social");
        const pool = data.social!;
        const skv = ["fill", "fill", "tf", "input"];
        const skvar = skv[Math.floor(random() * skv.length)];
        const choices =
          skvar === "input"
            ? []
            : generateChoices(entry.answer, pool, (k) => k.answer, random);
        questions.push(
          buildSubjectQuestion(
            setId,
            orderIndex,
            section.title,
            "social" as SubjectType,
            entry,
            "사회",
            choices,
            skvar,
            random,
          ),
        );
      } else {
        // Fallback: use knowledge data as generic question
        const entry = pickUnused(data.knowledge, "knowledge_fallback");
        const skv = ["fill", "fill", "tf", "input"];
        const skvar = skv[Math.floor(random() * skv.length)];
        const choices =
          skvar === "input"
            ? []
            : generateChoices(
                entry.answer,
                data.knowledge,
                (k) => k.answer,
                random,
              );
        questions.push(
          buildSubjectQuestion(
            setId,
            orderIndex,
            section.title,
            (subject as SubjectType) || ("general_knowledge" as SubjectType),
            entry,
            "",
            choices,
            skvar,
            random,
          ),
        );
      }

      orderIndex++;
    }
  }

  return { set: dailySet, questions };
}

export function generateDailySetWithoutRepeats(
  grade: number,
  semester: number,
  completedSetIds?: Set<string>,
  usedQuestionSignatures?: Set<string>,
  maxAttempts = 200,
  subjectAccuracy?: Record<string, { accuracy: number }>,
): DailySetWithQuestions {
  if (!usedQuestionSignatures || usedQuestionSignatures.size === 0) {
    return generateDailySet(grade, semester, completedSetIds, subjectAccuracy);
  }

  const triedSetIds = new Set(completedSetIds ?? []);
  let bestCandidate: DailySetWithQuestions | null = null;
  let bestRepeatCount = Number.POSITIVE_INFINITY;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = generateDailySet(
      grade,
      semester,
      triedSetIds,
      subjectAccuracy,
    );
    triedSetIds.add(candidate.set.id);

    const repeatCount = countRepeatedQuestions(
      candidate.questions,
      usedQuestionSignatures,
    );

    if (repeatCount < bestRepeatCount) {
      bestCandidate = candidate;
      bestRepeatCount = repeatCount;
    }

    if (repeatCount === 0) {
      return candidate;
    }
  }

  return (
    bestCandidate ??
    generateDailySet(grade, semester, completedSetIds, subjectAccuracy)
  );
}
