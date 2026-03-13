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
  SafetyEntry,
  MathEntry,
  HanjaEntry,
  EnglishEntry,
} from "@/types/curriculum";
import { generateMathPool } from "@/lib/curriculum/generators/math-generator";
import { getAvailableMathUnits, getAvailableScienceUnits, getAvailableEnglishUnits } from "@/lib/curriculum/curriculum-sequence";
import { generateSpellingPool } from "@/lib/curriculum/generators/spelling-generator";
import { generateVocabPool } from "@/lib/curriculum/generators/vocab-generator";
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
  const others = pool
    .map(extractAnswer)
    .filter((a) => a !== correct);
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
  const wrongPool = pool
    .flatMap((item) => {
      const wrongSentence = item.answer === 1 ? item.q2 : item.q1;
      return wrongSentence === correctSentence ? [] : [wrongSentence];
    });
  const distractors = shuffleChoices([...new Set(wrongPool)], random).slice(0, 3);

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

interface GradeData {
  spelling: SpellingEntry[];
  vocab: VocabEntry[];
  math: MathEntry[];
  knowledge: KnowledgeEntry[];
  safety: SafetyEntry[];
  writing: string[];
  korean?: KnowledgeEntry[];
  creative?: KnowledgeEntry[];
  hanja?: HanjaEntry[];
  english?: EnglishEntry[];
  science?: KnowledgeEntry[];
  social?: KnowledgeEntry[];
}

/**
 * Filter math items to only include units unlocked so far this semester.
 * Uses week-based curriculum sequencing for all grades.
 * Falls back to no filtering if no sequence is defined.
 */
function filterMathByProgress(items: MathEntry[], grade: number, semester: number): MathEntry[] {
  const available = getAvailableMathUnits(grade, semester);
  if (available.size === 0) return items; // no sequence defined for this grade/semester

  // Return only items matching unlocked units. Items without a unit field pass through.
  // If nothing matches, return [] — the generated math pool handles coverage.
  return items.filter(m => !m.unit || available.has(m.unit));
}

/**
 * Filter science items to only include units unlocked so far this semester.
 * Uses week-based curriculum sequencing for grades 3-6.
 * Returns all items for grades 1-2 (no science curriculum).
 */
function filterScienceByProgress(items: KnowledgeEntry[], grade: number, semester: number): KnowledgeEntry[] {
  const available = getAvailableScienceUnits(grade, semester);
  if (available.size === 0) return items; // grades 1-2 or no sequence defined
  return items.filter(m => !m.unit || available.has(m.unit));
}

/**
 * Filter English items to only include units unlocked so far this semester.
 * Uses week-based curriculum sequencing for grades 3-6.
 * Returns all items for grades 1-2 (no English curriculum).
 */
function filterEnglishByProgress(items: EnglishEntry[], grade: number, semester: number): EnglishEntry[] {
  const available = getAvailableEnglishUnits(grade, semester);
  if (available.size === 0) return items; // grades 1-2 or no sequence defined
  return items.filter(m => !m.unit || available.has(m.unit));
}

// Get curriculum data per grade (merges static + procedurally generated)
function getGradeData(grade: number, semester: number, daySeed?: number): GradeData {
  const dayOfYear = daySeed ?? getDayOfYear();
  const expandedDayOfYear = dayOfYear + 10000;
  const expandedDayOfYearBonus = dayOfYear + 20000;
  const generatedMath = generateMathPool(grade, dayOfYear, semester);
  const generatedMathExtra = generateMathPool(grade, expandedDayOfYear, semester);
  const generatedMathBonus = takeExpandedPortion(
    generateMathPool(grade, expandedDayOfYearBonus, semester),
  );
  const generatedSpelling = generateSpellingPool(grade, dayOfYear);
  const generatedSpellingExtra = generateSpellingPool(grade, expandedDayOfYear);
  const generatedSpellingBonus = takeExpandedPortion(
    generateSpellingPool(grade, expandedDayOfYearBonus),
  );
  const generatedVocab = generateVocabPool(grade, dayOfYear);
  const generatedVocabExtra = generateVocabPool(grade, expandedDayOfYear);
  const generatedVocabBonus = takeExpandedPortion(
    generateVocabPool(grade, expandedDayOfYearBonus),
  );
  const generatedKnowledge = generateKnowledgePool(grade, dayOfYear);
  const generatedKnowledgeExtra = generateKnowledgePool(grade, expandedDayOfYear);
  const generatedKnowledgeBonus = takeExpandedPortion(
    generateKnowledgePool(grade, expandedDayOfYearBonus),
  );
  const generatedSafety = generateSafetyPool(grade, dayOfYear);
  const generatedSafetyExtra = generateSafetyPool(grade, expandedDayOfYear);
  const generatedSafetyBonus = takeExpandedPortion(
    generateSafetyPool(grade, expandedDayOfYearBonus),
  );
  const generatedHanja = generateHanjaPool(grade, dayOfYear);
  const generatedHanjaExtra = generateHanjaPool(grade, expandedDayOfYear);
  const generatedHanjaBonus = takeExpandedPortion(
    generateHanjaPool(grade, expandedDayOfYearBonus),
  );
  const generatedEnglish = generateEnglishPool(grade, dayOfYear);
  const generatedEnglishExtra = generateEnglishPool(grade, expandedDayOfYear);
  const generatedEnglishBonus = takeExpandedPortion(
    generateEnglishPool(grade, expandedDayOfYearBonus),
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
  const generatedScience = generateSciencePool(grade, dayOfYear);
  const generatedScienceExtra = generateSciencePool(grade, expandedDayOfYear);
  const generatedScienceBonus = takeExpandedPortion(
    generateSciencePool(grade, expandedDayOfYearBonus),
  );
  const generatedSocial = generateSocialPool(grade, dayOfYear);
  const generatedSocialExtra = generateSocialPool(grade, expandedDayOfYear);
  const generatedSocialBonus = takeExpandedPortion(
    generateSocialPool(grade, expandedDayOfYearBonus),
  );

  // Pre-filter generated math by curriculum progress (week-based unit sequencing)
  const filtMath = filterMathByProgress([...generatedMath, ...generatedMathExtra, ...generatedMathBonus], grade, semester);

  // Pre-filter science and English by curriculum progress (week-based unit sequencing)
  const filtScience = filterScienceByProgress([...generatedScience, ...generatedScienceExtra, ...generatedScienceBonus], grade, semester);
  const filtEnglish = filterEnglishByProgress([...generatedEnglish, ...generatedEnglishExtra, ...generatedEnglishBonus], grade, semester);

  switch (grade) {
    case 1:
      return {
        spelling: [...grade1SpellingData, ...generatedSpelling, ...generatedSpellingExtra, ...generatedSpellingBonus],
        vocab: [...grade1VocabData, ...generatedVocab, ...generatedVocabExtra, ...generatedVocabBonus],
        math: [...filterMathByProgress(grade1MathData, grade, semester), ...filtMath],
        knowledge: [...grade1KnowledgeData, ...generatedKnowledge, ...generatedKnowledgeExtra, ...generatedKnowledgeBonus],
        safety: [...grade1SafetyData, ...generatedSafety, ...generatedSafetyExtra, ...generatedSafetyBonus],
        writing: [...grade1WritingPrompts, ...generatedWriting, ...generatedWritingExtra, ...generatedWritingBonus],
        korean: [...(grade1KoreanData || []), ...generatedCreative, ...generatedCreativeExtra, ...generatedCreativeBonus],
        creative: [...(grade1CreativeData || []), ...generatedCreative, ...generatedCreativeExtra, ...generatedCreativeBonus],
      };
    case 2:
      return {
        spelling: [...grade2SpellingData, ...generatedSpelling, ...generatedSpellingExtra, ...generatedSpellingBonus],
        vocab: [...grade2VocabData, ...generatedVocab, ...generatedVocabExtra, ...generatedVocabBonus],
        math: [...filterMathByProgress(grade2MathData, grade, semester), ...filtMath],
        knowledge: [...grade2KnowledgeData, ...generatedKnowledge, ...generatedKnowledgeExtra, ...generatedKnowledgeBonus],
        safety: [...grade2SafetyData, ...generatedSafety, ...generatedSafetyExtra, ...generatedSafetyBonus],
        writing: [...grade2WritingPrompts, ...generatedWriting, ...generatedWritingExtra, ...generatedWritingBonus],
        korean: [...(grade2KoreanData || []), ...generatedCreative, ...generatedCreativeExtra, ...generatedCreativeBonus],
        creative: [...(grade2CreativeData || []), ...generatedCreative, ...generatedCreativeExtra, ...generatedCreativeBonus],
      };
    case 3:
      return {
        spelling: [...grade3SpellingData, ...generatedSpelling, ...generatedSpellingExtra, ...generatedSpellingBonus],
        vocab: [...grade3VocabData, ...generatedVocab, ...generatedVocabExtra, ...generatedVocabBonus],
        math: [...filterMathByProgress(grade3MathData, grade, semester), ...filtMath],
        knowledge: [...grade3KnowledgeData, ...grade3KnowledgeDataExtra, ...generatedKnowledge, ...generatedKnowledgeExtra, ...generatedKnowledgeBonus],
        safety: [...grade3SafetyData, ...grade3SafetyDataExtra, ...generatedSafety, ...generatedSafetyExtra, ...generatedSafetyBonus],
        writing: [...grade3WritingPrompts, ...generatedWriting, ...generatedWritingExtra, ...generatedWritingBonus],
        hanja: [...(grade3HanjaData || []), ...generatedHanja, ...generatedHanjaExtra, ...generatedHanjaBonus],
        english: [...(grade3EnglishData || []), ...filtEnglish],
        creative: [...(grade3CreativeData || []), ...generatedCreative, ...generatedCreativeExtra, ...generatedCreativeBonus],
      };
    case 4:
      return {
        spelling: [...grade4SpellingData, ...generatedSpelling, ...generatedSpellingExtra, ...generatedSpellingBonus],
        vocab: [...grade4VocabData, ...generatedVocab, ...generatedVocabExtra, ...generatedVocabBonus],
        math: [...filterMathByProgress(grade4MathData, grade, semester), ...filtMath],
        knowledge: [...grade4KnowledgeData, ...generatedKnowledge, ...generatedKnowledgeExtra, ...generatedKnowledgeBonus],
        safety: [...grade4SafetyData, ...generatedSafety, ...generatedSafetyExtra, ...generatedSafetyBonus],
        writing: [...grade4WritingPrompts, ...generatedWriting, ...generatedWritingExtra, ...generatedWritingBonus],
        hanja: [...(grade4HanjaData || []), ...generatedHanja, ...generatedHanjaExtra, ...generatedHanjaBonus],
        english: [...(grade4EnglishData || []), ...filtEnglish],
        creative: [...(grade4CreativeData || []), ...generatedCreative, ...generatedCreativeExtra, ...generatedCreativeBonus],
      };
    case 5:
      return {
        spelling: [...grade5SpellingData, ...generatedSpelling, ...generatedSpellingExtra, ...generatedSpellingBonus],
        vocab: [...grade5VocabData, ...generatedVocab, ...generatedVocabExtra, ...generatedVocabBonus],
        math: [...filterMathByProgress(grade5MathData, grade, semester), ...filtMath],
        knowledge: [...grade5KnowledgeData, ...generatedKnowledge, ...generatedKnowledgeExtra, ...generatedKnowledgeBonus],
        safety: [...grade5SafetyData, ...generatedSafety, ...generatedSafetyExtra, ...generatedSafetyBonus],
        writing: [...grade5WritingPrompts, ...generatedWriting, ...generatedWritingExtra, ...generatedWritingBonus],
        hanja: [...(grade5HanjaData || []), ...generatedHanja, ...generatedHanjaExtra, ...generatedHanjaBonus],
        english: [...(grade5EnglishData || []), ...filtEnglish],
        creative: [...(grade5CreativeData || []), ...generatedCreative, ...generatedCreativeExtra, ...generatedCreativeBonus],
        science: [...(grade5ScienceData || []), ...filtScience],
        social: [...(grade5SocialData || []), ...generatedSocial, ...generatedSocialExtra, ...generatedSocialBonus],
      };
    case 6:
      return {
        spelling: [...grade6SpellingData, ...generatedSpelling, ...generatedSpellingExtra, ...generatedSpellingBonus],
        vocab: [...grade6VocabData, ...generatedVocab, ...generatedVocabExtra, ...generatedVocabBonus],
        math: [...filterMathByProgress(grade6MathData, grade, semester), ...filtMath],
        knowledge: [...grade6KnowledgeData, ...generatedKnowledge, ...generatedKnowledgeExtra, ...generatedKnowledgeBonus],
        safety: [...grade6SafetyData, ...generatedSafety, ...generatedSafetyExtra, ...generatedSafetyBonus],
        writing: [...grade6WritingPrompts, ...generatedWriting, ...generatedWritingExtra, ...generatedWritingBonus],
        hanja: [...(grade6HanjaData || []), ...generatedHanja, ...generatedHanjaExtra, ...generatedHanjaBonus],
        english: [...(grade6EnglishData || []), ...filtEnglish],
        creative: [...(grade6CreativeData || []), ...generatedCreative, ...generatedCreativeExtra, ...generatedCreativeBonus],
        science: [...(grade6ScienceData || []), ...filtScience],
        social: [...(grade6SocialData || []), ...generatedSocial, ...generatedSocialExtra, ...generatedSocialBonus],
      };
    default:
      return {
        spelling: [...grade1SpellingData, ...generatedSpelling, ...generatedSpellingExtra, ...generatedSpellingBonus],
        vocab: [...grade1VocabData, ...generatedVocab, ...generatedVocabExtra, ...generatedVocabBonus],
        math: [...filterMathByProgress(grade1MathData, grade, semester), ...filtMath],
        knowledge: [...grade1KnowledgeData, ...generatedKnowledge, ...generatedKnowledgeExtra, ...generatedKnowledgeBonus],
        safety: [...grade1SafetyData, ...generatedSafety, ...generatedSafetyExtra, ...generatedSafetyBonus],
        writing: [...grade1WritingPrompts, ...generatedWriting, ...generatedWritingExtra, ...generatedWritingBonus],
        korean: [...(grade1KoreanData || []), ...generatedCreative, ...generatedCreativeExtra, ...generatedCreativeBonus],
        creative: [...(grade1CreativeData || []), ...generatedCreative, ...generatedCreativeExtra, ...generatedCreativeBonus],
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
): Question {
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "math" as SubjectType,
    question_type: "multiple_choice" as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      text: "다음을 계산하세요.",
      expression: entry.expression || "",
      unit: entry.unit,
      choices,
    },
    answer: {
      correct: String(entry.answer),
      text: String(entry.answer),
      steps: entry.steps || [],
    },
    explanation: entry.steps
      ? entry.steps.join(" -> ")
      : `정답: ${entry.answer}`,
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
): Question {
  const correctSentence = entry.answer === 1 ? entry.q1 : entry.q2;
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "spelling" as SubjectType,
    question_type: "multiple_choice" as QuestionType,
    order_index: orderIndex,
    title,
    content: {
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
): Question {
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "vocabulary" as SubjectType,
    question_type: "multiple_choice" as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      text: "다음 뜻풀이를 보고 알맞은 낱말을 고르세요.",
      clues: entry.meanings,
      choices,
    },
    answer: {
      correct: entry.answer,
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
): Question {
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "general_knowledge" as SubjectType,
    question_type: "multiple_choice" as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      text: entry.text,
      category: entry.category,
      choices,
    },
    answer: {
      correct: entry.answer,
      text: entry.answer,
    },
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
): Question {
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "safety" as SubjectType,
    question_type: "multiple_choice" as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      text: entry.text,
      category: entry.category,
      choices,
    },
    answer: {
      correct: entry.answer,
      text: entry.answer,
    },
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

// Build a hanja question from HanjaEntry data
function buildHanjaQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  entry: HanjaEntry,
  choices: string[],
): Question {
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "hanja" as SubjectType,
    question_type: "multiple_choice" as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      text: `${entry.character}(${entry.meaning}): 이 한자의 음(소리)은 무엇일까요?`,
      character: entry.character,
      meaning: entry.meaning,
      strokes: entry.strokes,
      words: entry.words,
      choices,
    },
    answer: { correct: entry.reading, text: entry.reading },
    explanation: `${entry.character}는 '${entry.meaning}'으로, '${entry.reading}'이라 읽습니다. 예: ${entry.words.join(", ")}`,
    points: 10,
    hint: `'${entry.meaning}'에서 힌트를 찾아보세요.`,
    metadata: { strokes: entry.strokes, sentence: entry.sentence },
    created_at: new Date().toISOString(),
  };
}

// Build an english question from EnglishEntry data
function buildEnglishQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  entry: EnglishEntry,
  choices: string[],
): Question {
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "english" as SubjectType,
    question_type: "multiple_choice" as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      text: `다음 영어 문장을 읽고, 밑줄 친 단어의 뜻을 쓰세요.\n"${entry.sentence}"\n단어: ${entry.word} [${entry.pronunciation}]`,
      sentence: entry.sentence,
      word: entry.word,
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

// Generic builder for subject-specific KnowledgeEntry data (korean, creative, science, social)
function buildSubjectQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  subject: SubjectType,
  entry: KnowledgeEntry,
  hintPrefix: string,
  choices: string[],
): Question {
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject,
    question_type: "multiple_choice" as QuestionType,
    order_index: orderIndex,
    title,
    content: { text: entry.text, category: entry.category, choices },
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
  const data = getGradeData(grade, semester, finalSeed);

  const setNumber = (finalSeed % 10000) + 1;

  const dailySet: DailySet = {
    id: setId,
    grade,
    semester,
    set_number: setNumber,
    title: `${grade}학년 ${semester}학기 #${setNumber}`,
    description: "오늘의 아침학습",
    estimated_minutes: 30,
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
        const choices = generateMathChoices(Number(entry.answer), random);
        questions.push(
          buildMathQuestion(setId, orderIndex, section.title, entry, choices),
        );
      } else if (subject === "spelling") {
        const entry = pickUnused(data.spelling, "spelling");
        const choices = generateSpellingChoices(entry, data.spelling, random);
        questions.push(
          buildSpellingQuestion(setId, orderIndex, section.title, entry, choices),
        );
      } else if (subject === "vocabulary") {
        const entry = pickUnused(data.vocab, "vocab");
        const choices = generateChoices(entry.answer, data.vocab, (v) => v.answer, random);
        questions.push(
          buildVocabQuestion(setId, orderIndex, section.title, entry, choices),
        );
      } else if (subject === "general_knowledge") {
        const entry = pickUnused(data.knowledge, "knowledge");
        const choices = generateChoices(entry.answer, data.knowledge, (k) => k.answer, random);
        questions.push(
          buildKnowledgeQuestion(setId, orderIndex, section.title, entry, choices),
        );
      } else if (subject === "safety") {
        const entry = pickUnused(data.safety, "safety");
        const choices = generateChoices(entry.answer, data.safety, (s) => s.answer, random);
        questions.push(
          buildSafetyQuestion(setId, orderIndex, section.title, entry, choices),
        );
      } else if (subject === "writing") {
        const prompt = pickUnused(data.writing, "writing");
        questions.push(
          buildWritingQuestion(setId, orderIndex, section.title, prompt, grade),
        );
      } else if (subject === "hanja" && data.hanja && data.hanja.length > 0) {
        const entry = pickUnused(data.hanja, "hanja");
        const choices = generateChoices(entry.reading, data.hanja, (h) => h.reading, random);
        questions.push(
          buildHanjaQuestion(setId, orderIndex, section.title, entry, choices),
        );
      } else if (
        subject === "english" &&
        data.english &&
        data.english.length > 0
      ) {
        const entry = pickUnused(data.english, "english");
        const choices = generateChoices(entry.word, data.english, (e) => e.word, random);
        questions.push(
          buildEnglishQuestion(setId, orderIndex, section.title, entry, choices),
        );
      } else if (
        subject === "korean" &&
        data.korean &&
        data.korean.length > 0
      ) {
        const entry = pickUnused(data.korean, "korean");
        const pool = data.korean!;
        const choices = generateChoices(entry.answer, pool, (k) => k.answer, random);
        questions.push(
          buildSubjectQuestion(setId, orderIndex, section.title, "korean" as SubjectType, entry, "국어", choices),
        );
      } else if (
        subject === "creative" &&
        data.creative &&
        data.creative.length > 0
      ) {
        const entry = pickUnused(data.creative, "creative");
        const pool = data.creative!;
        const choices = generateChoices(entry.answer, pool, (k) => k.answer, random);
        questions.push(
          buildSubjectQuestion(setId, orderIndex, section.title, "creative" as SubjectType, entry, "창의", choices),
        );
      } else if (
        subject === "science" &&
        data.science &&
        data.science.length > 0
      ) {
        const entry = pickUnused(data.science, "science");
        const pool = data.science!;
        const choices = generateChoices(entry.answer, pool, (k) => k.answer, random);
        questions.push(
          buildSubjectQuestion(setId, orderIndex, section.title, "science" as SubjectType, entry, "과학", choices),
        );
      } else if (
        subject === "social" &&
        data.social &&
        data.social.length > 0
      ) {
        const entry = pickUnused(data.social, "social");
        const pool = data.social!;
        const choices = generateChoices(entry.answer, pool, (k) => k.answer, random);
        questions.push(
          buildSubjectQuestion(setId, orderIndex, section.title, "social" as SubjectType, entry, "사회", choices),
        );
      } else {
        // Fallback: use knowledge data as generic question
        const entry = pickUnused(data.knowledge, "knowledge_fallback");
        const choices = generateChoices(entry.answer, data.knowledge, (k) => k.answer, random);
        questions.push(
          buildSubjectQuestion(setId, orderIndex, section.title, (subject as SubjectType) || ("general_knowledge" as SubjectType), entry, "", choices),
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
): DailySetWithQuestions {
  if (!usedQuestionSignatures || usedQuestionSignatures.size === 0) {
    return generateDailySet(grade, semester, completedSetIds);
  }

  const triedSetIds = new Set(completedSetIds ?? []);
  let bestCandidate: DailySetWithQuestions | null = null;
  let bestRepeatCount = Number.POSITIVE_INFINITY;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = generateDailySet(grade, semester, triedSetIds);
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

  return bestCandidate ?? generateDailySet(grade, semester, completedSetIds);
}
