import { getDayOfYear, getGradeGroup } from '@/lib/utils';
import { GRADE_SET_COMPOSITION, DEFAULT_READINESS_ITEMS, EMOTION_CATEGORIES } from '@/lib/constants';
import type { DailySet, Question, SubjectType, QuestionType } from '@/types/database';
import type { DailySetWithQuestions } from '@/types/learning';
import type { SpellingEntry, VocabEntry, KnowledgeEntry, SafetyEntry, MathEntry } from '@/types/curriculum';

import {
  grade1SpellingData, grade1VocabData, grade1MathData,
  grade1KnowledgeData, grade1SafetyData, grade1WritingPrompts,
} from '@/lib/curriculum/grade1';

import {
  grade2SpellingData, grade2VocabData, grade2MathData,
  grade2KnowledgeData, grade2SafetyData, grade2WritingPrompts,
} from '@/lib/curriculum/grade2';

// Seeded PRNG for reproducible daily sets (same seed = same set per day)
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function pickRandom<T>(arr: T[], random: () => number, count: number = 1): T[] {
  if (arr.length === 0) return [];
  const shuffled = [...arr].sort(() => random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Get curriculum data per grade
function getGradeData(grade: number) {
  switch (grade) {
    case 1:
      return {
        spelling: grade1SpellingData,
        vocab: grade1VocabData,
        math: grade1MathData,
        knowledge: grade1KnowledgeData,
        safety: grade1SafetyData,
        writing: grade1WritingPrompts,
      };
    case 2:
      return {
        spelling: grade2SpellingData,
        vocab: grade2VocabData,
        math: grade2MathData,
        knowledge: grade2KnowledgeData,
        safety: grade2SafetyData,
        writing: grade2WritingPrompts,
      };
    // Grades 3-6 fallback to grade 2 data until curriculum files are created
    // This ensures the app functions properly at all grade levels
    default:
      return {
        spelling: grade2SpellingData,
        vocab: grade2VocabData,
        math: grade2MathData,
        knowledge: grade2KnowledgeData,
        safety: grade2SafetyData,
        writing: grade2WritingPrompts,
      };
  }
}

// Build an emotion_check question
function buildEmotionQuestion(setId: string, orderIndex: number, title: string): Question {
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: 'creative' as SubjectType, // mapped internally
    question_type: 'emotion_check' as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      text: '오늘 아침 나의 기분은 어떤가요?',
      categories: [...EMOTION_CATEGORIES],
    },
    answer: { type: 'emotion_bar' },
    explanation: null,
    points: 10,
    hint: '솔직하게 표시해 주세요!',
    metadata: null,
    created_at: new Date().toISOString(),
  };
}

// Build a readiness_check question
function buildReadinessQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  gradeGroup: '1-2' | '3-4' | '5-6'
): Question {
  const items = [...DEFAULT_READINESS_ITEMS[gradeGroup]];
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: 'creative' as SubjectType,
    question_type: 'readiness_check' as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      text: '오늘 준비물을 확인해 볼까요?',
      items,
    },
    answer: { type: 'checklist' },
    explanation: null,
    points: 10,
    hint: '하나씩 확인하면서 체크해요!',
    metadata: null,
    created_at: new Date().toISOString(),
  };
}

// Build a math question from real curriculum data
function buildMathQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  entry: MathEntry
): Question {
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: 'math' as SubjectType,
    question_type: 'calculation' as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      text: '다음을 계산하세요.',
      expression: entry.expression || '',
      unit: entry.unit,
    },
    answer: {
      correct: entry.answer,
      text: String(entry.answer),
      steps: entry.steps || [],
    },
    explanation: entry.steps ? entry.steps.join(' -> ') : `정답: ${entry.answer}`,
    points: 10,
    hint: entry.unit.includes('곱셈') ? '곱셈구구를 떠올려 보세요!' :
      entry.unit.includes('뺄셈') ? '큰 수에서 작은 수를 빼세요!' :
      '차근차근 계산해 보세요!',
    metadata: { unit: entry.unit, hasCarry: entry.hasCarry, hasBorrow: entry.hasBorrow },
    created_at: new Date().toISOString(),
  };
}

// Build a spelling question from real curriculum data
function buildSpellingQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  entry: SpellingEntry
): Question {
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: 'spelling' as SubjectType,
    question_type: 'multiple_choice' as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      text: '다음 중 맞춤법이 올바른 문장을 고르세요.',
      options: [entry.q1, entry.q2],
    },
    answer: {
      correct: entry.answer - 1, // Convert 1-based to 0-based index
      text: entry.answer === 1 ? entry.q1 : entry.q2,
    },
    explanation: entry.explanation,
    points: 10,
    hint: '소리 내어 읽어보면 구별이 쉬워요!',
    metadata: null,
    created_at: new Date().toISOString(),
  };
}

// Build a vocabulary question from real curriculum data
function buildVocabQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  entry: VocabEntry
): Question {
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: 'vocabulary' as SubjectType,
    question_type: 'short_answer' as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      text: '다음 뜻풀이를 보고 알맞은 낱말을 쓰세요.',
      clues: entry.meanings,
    },
    answer: {
      correct: entry.answer,
      text: entry.answer,
    },
    explanation: `정답은 "${entry.answer}"입니다. ${entry.meanings.join(', ')}`,
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
  entry: KnowledgeEntry
): Question {
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: 'general_knowledge' as SubjectType,
    question_type: 'fill_blank' as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      text: entry.text,
      category: entry.category,
    },
    answer: {
      correct: entry.answer,
      text: entry.answer,
    },
    explanation: `${entry.text.replace('___', entry.answer)}`,
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
  entry: SafetyEntry
): Question {
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: 'safety' as SubjectType,
    question_type: 'fill_blank' as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      text: entry.text,
      category: entry.category,
    },
    answer: {
      correct: entry.answer,
      text: entry.answer,
    },
    explanation: `${entry.text.replace('___', entry.answer)}`,
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
  grade: number
): Question {
  const minChars = grade <= 2 ? 20 : grade <= 4 ? 50 : 100;
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: 'writing' as SubjectType,
    question_type: 'writing_prompt' as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      prompt,
      min_chars: minChars,
    },
    answer: { type: 'free_text' },
    explanation: null,
    points: 10,
    hint: '떠오르는 생각을 자유롭게 써 보세요!',
    metadata: { minChars },
    created_at: new Date().toISOString(),
  };
}

// Build a generic subject question (for subjects like korean, english, hanja, science, social, creative)
function buildGenericQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  subject: string,
  knowledgeEntry: KnowledgeEntry | null,
  random: () => number,
  grade: number
): Question {
  // For subjects without dedicated data yet, generate contextual fill-blank questions
  const subjectQuestions: Record<string, { text: string; answer: string; hint: string }[]> = {
    korean: [
      { text: '동화 속에서 주인공이 느낀 감정을 쓰세요: "기쁨, 슬픔, ___"', answer: '화남', hint: '감정을 떠올려 보세요.' },
      { text: '문장의 끝에 오는 것을 ___이라고 합니다.', answer: '마침표', hint: '문장부호를 생각해 보세요.' },
      { text: '"나는 학교에 갑니다"에서 "학교"는 ___입니다.', answer: '명사', hint: '사물의 이름을 나타내는 말이에요.' },
    ],
    english: [
      { text: 'Hello! How are you? - I am ___.', answer: 'fine', hint: '기분이 좋다는 영어 표현이에요.' },
      { text: 'What color is the sky? - It is ___.', answer: 'blue', hint: '하늘의 색깔을 영어로 말해 보세요.' },
      { text: 'A, B, C, D, ___', answer: 'E', hint: '알파벳 순서를 떠올려 보세요.' },
    ],
    hanja: [
      { text: '山(___): 뫼 산', answer: '산', hint: '높이 솟은 땅을 말해요.' },
      { text: '水(___): 물 수', answer: '물', hint: '우리가 마시는 것이에요.' },
      { text: '火(___): 불 화', answer: '불', hint: '뜨겁고 밝은 것이에요.' },
    ],
    science: [
      { text: '물이 100도에서 끓으면 ___가 됩니다.', answer: '수증기', hint: '기체 상태의 물이에요.' },
      { text: '식물의 뿌리는 땅속에서 ___를 흡수합니다.', answer: '물', hint: '식물이 자라려면 필요한 것이에요.' },
      { text: '지구가 태양 주위를 도는 것을 ___이라 합니다.', answer: '공전', hint: '1년에 한 바퀴 돌아요.' },
    ],
    social: [
      { text: '우리나라의 국화는 ___입니다.', answer: '무궁화', hint: '우리나라를 상징하는 꽃이에요.' },
      { text: '대한민국의 대통령이 일하는 곳은 ___입니다.', answer: '대통령실', hint: '나라의 지도자가 일하는 곳이에요.' },
      { text: '지도에서 위쪽은 ___을 가리킵니다.', answer: '북쪽', hint: '나침반의 방향을 떠올려 보세요.' },
    ],
    creative: [
      { text: '빨간색과 파란색을 섞으면 ___ 색이 됩니다.', answer: '보라', hint: '색을 섞으면 새로운 색이 나와요.' },
      { text: '도화지를 반으로 접으면 ___ 모양이 됩니다.', answer: '대칭', hint: '양쪽이 똑같아요.' },
      { text: '음악에서 빠르기를 나타내는 말: 빠르게, 보통, ___', answer: '느리게', hint: '속도를 나타내는 말이에요.' },
    ],
  };

  const questions = subjectQuestions[subject] || subjectQuestions['korean'];
  const idx = Math.floor(random() * questions.length);
  const q = questions[idx];

  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: subject as SubjectType,
    question_type: 'fill_blank' as QuestionType,
    order_index: orderIndex,
    title,
    content: { text: q.text },
    answer: { correct: q.answer, text: q.answer },
    explanation: q.text.replace('___', q.answer),
    points: 10,
    hint: q.hint,
    metadata: null,
    created_at: new Date().toISOString(),
  };
}

export function generateDailySet(grade: number, semester: number): DailySetWithQuestions {
  const dayOfYear = getDayOfYear();
  const seed = dayOfYear * 1000 + grade * 100 + semester;
  const random = seededRandom(seed);
  const gradeGroup = getGradeGroup(grade);
  const composition = GRADE_SET_COMPOSITION[gradeGroup];
  const data = getGradeData(grade);

  const setId = `set-${grade}-${semester}-${dayOfYear}`;
  const setNumber = (dayOfYear % 400) + 1;

  const dailySet: DailySet = {
    id: setId,
    grade,
    semester,
    set_number: setNumber,
    title: `${grade}학년 ${semester}학기 #${setNumber}`,
    description: '오늘의 아침학습',
    estimated_minutes: 30,
    total_questions: composition.totalQuestions,
    total_points: composition.totalQuestions * 10,
    is_published: true,
    created_at: new Date().toISOString(),
  };

  const questions: Question[] = [];
  let orderIndex = 0;

  // Track which items have been used so we don't pick duplicates within a set
  const usedMath = new Set<number>();
  const usedSpelling = new Set<number>();
  const usedVocab = new Set<number>();
  const usedKnowledge = new Set<number>();
  const usedSafety = new Set<number>();
  const usedWriting = new Set<number>();

  function pickUnused<T>(arr: T[], used: Set<number>): T {
    const available = arr.map((item, i) => ({ item, i })).filter(({ i }) => !used.has(i));
    if (available.length === 0) {
      // All used, pick any
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

      if (subject === 'emotion_check') {
        questions.push(buildEmotionQuestion(setId, orderIndex, section.title));
      } else if (subject === 'readiness_check') {
        questions.push(buildReadinessQuestion(setId, orderIndex, section.title, gradeGroup));
      } else if (subject === 'math') {
        const entry = pickUnused(data.math, usedMath);
        questions.push(buildMathQuestion(setId, orderIndex, section.title, entry));
      } else if (subject === 'spelling') {
        const entry = pickUnused(data.spelling, usedSpelling);
        questions.push(buildSpellingQuestion(setId, orderIndex, section.title, entry));
      } else if (subject === 'vocabulary') {
        const entry = pickUnused(data.vocab, usedVocab);
        questions.push(buildVocabQuestion(setId, orderIndex, section.title, entry));
      } else if (subject === 'general_knowledge') {
        const entry = pickUnused(data.knowledge, usedKnowledge);
        questions.push(buildKnowledgeQuestion(setId, orderIndex, section.title, entry));
      } else if (subject === 'safety') {
        const entry = pickUnused(data.safety, usedSafety);
        questions.push(buildSafetyQuestion(setId, orderIndex, section.title, entry));
      } else if (subject === 'writing') {
        const prompt = pickUnused(data.writing, usedWriting);
        questions.push(buildWritingQuestion(setId, orderIndex, section.title, prompt, grade));
      } else {
        // korean, english, hanja, science, social, creative
        questions.push(
          buildGenericQuestion(setId, orderIndex, section.title, subject, null, random, grade)
        );
      }

      orderIndex++;
    }
  }

  return { set: dailySet, questions };
}
