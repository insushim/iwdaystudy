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

// Seeded PRNG for reproducible daily sets (same seed = same set per day)
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
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

// Get curriculum data per grade
function getGradeData(grade: number): GradeData {
  switch (grade) {
    case 1:
      return {
        spelling: grade1SpellingData,
        vocab: grade1VocabData,
        math: grade1MathData,
        knowledge: grade1KnowledgeData,
        safety: grade1SafetyData,
        writing: grade1WritingPrompts,
        korean: grade1KoreanData,
        creative: grade1CreativeData,
      };
    case 2:
      return {
        spelling: grade2SpellingData,
        vocab: grade2VocabData,
        math: grade2MathData,
        knowledge: grade2KnowledgeData,
        safety: grade2SafetyData,
        writing: grade2WritingPrompts,
        korean: grade2KoreanData,
        creative: grade2CreativeData,
      };
    case 3:
      return {
        spelling: grade3SpellingData,
        vocab: grade3VocabData,
        math: grade3MathData,
        knowledge: grade3KnowledgeData,
        safety: grade3SafetyData,
        writing: grade3WritingPrompts,
        hanja: grade3HanjaData,
        english: grade3EnglishData,
        creative: grade3CreativeData,
      };
    case 4:
      return {
        spelling: grade4SpellingData,
        vocab: grade4VocabData,
        math: grade4MathData,
        knowledge: grade4KnowledgeData,
        safety: grade4SafetyData,
        writing: grade4WritingPrompts,
        hanja: grade4HanjaData,
        english: grade4EnglishData,
        creative: grade4CreativeData,
      };
    case 5:
      return {
        spelling: grade5SpellingData,
        vocab: grade5VocabData,
        math: grade5MathData,
        knowledge: grade5KnowledgeData,
        safety: grade5SafetyData,
        writing: grade5WritingPrompts,
        hanja: grade5HanjaData,
        english: grade5EnglishData,
        creative: grade5CreativeData,
        science: grade5ScienceData,
        social: grade5SocialData,
      };
    case 6:
      return {
        spelling: grade6SpellingData,
        vocab: grade6VocabData,
        math: grade6MathData,
        knowledge: grade6KnowledgeData,
        safety: grade6SafetyData,
        writing: grade6WritingPrompts,
        hanja: grade6HanjaData,
        english: grade6EnglishData,
        creative: grade6CreativeData,
        science: grade6ScienceData,
        social: grade6SocialData,
      };
    default:
      return {
        spelling: grade1SpellingData,
        vocab: grade1VocabData,
        math: grade1MathData,
        knowledge: grade1KnowledgeData,
        safety: grade1SafetyData,
        writing: grade1WritingPrompts,
        korean: grade1KoreanData,
        creative: grade1CreativeData,
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
): Question {
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "math" as SubjectType,
    question_type: "calculation" as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      text: "다음을 계산하세요.",
      expression: entry.expression || "",
      unit: entry.unit,
    },
    answer: {
      correct: entry.answer,
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
): Question {
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
      options: [entry.q1, entry.q2],
    },
    answer: {
      correct: entry.answer - 1,
      text: entry.answer === 1 ? entry.q1 : entry.q2,
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
): Question {
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "vocabulary" as SubjectType,
    question_type: "short_answer" as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      text: "다음 뜻풀이를 보고 알맞은 낱말을 쓰세요.",
      clues: entry.meanings,
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
): Question {
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "general_knowledge" as SubjectType,
    question_type: "fill_blank" as QuestionType,
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
): Question {
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "safety" as SubjectType,
    question_type: "fill_blank" as QuestionType,
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
): Question {
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "hanja" as SubjectType,
    question_type: "fill_blank" as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      text: `${entry.character}(${entry.meaning}): 이 한자의 음(소리)은 무엇일까요?`,
      character: entry.character,
      meaning: entry.meaning,
      strokes: entry.strokes,
      words: entry.words,
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
): Question {
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "english" as SubjectType,
    question_type: "fill_blank" as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      text: `다음 영어 문장을 읽고, 밑줄 친 단어의 뜻을 쓰세요.\n"${entry.sentence}"\n단어: ${entry.word} [${entry.pronunciation}]`,
      sentence: entry.sentence,
      word: entry.word,
      pronunciation: entry.pronunciation,
      practice: entry.practice,
    },
    answer: { correct: entry.translation, text: entry.translation },
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
): Question {
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject,
    question_type: "fill_blank" as QuestionType,
    order_index: orderIndex,
    title,
    content: { text: entry.text, category: entry.category },
    answer: { correct: entry.answer, text: entry.answer },
    explanation: entry.text.replace("___", entry.answer),
    points: 10,
    hint: `${hintPrefix} ${entry.category} 문제예요.`,
    metadata: { category: entry.category },
    created_at: new Date().toISOString(),
  };
}

export function generateDailySet(
  grade: number,
  semester: number,
): DailySetWithQuestions {
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
        questions.push(
          buildMathQuestion(setId, orderIndex, section.title, entry),
        );
      } else if (subject === "spelling") {
        const entry = pickUnused(data.spelling, "spelling");
        questions.push(
          buildSpellingQuestion(setId, orderIndex, section.title, entry),
        );
      } else if (subject === "vocabulary") {
        const entry = pickUnused(data.vocab, "vocab");
        questions.push(
          buildVocabQuestion(setId, orderIndex, section.title, entry),
        );
      } else if (subject === "general_knowledge") {
        const entry = pickUnused(data.knowledge, "knowledge");
        questions.push(
          buildKnowledgeQuestion(setId, orderIndex, section.title, entry),
        );
      } else if (subject === "safety") {
        const entry = pickUnused(data.safety, "safety");
        questions.push(
          buildSafetyQuestion(setId, orderIndex, section.title, entry),
        );
      } else if (subject === "writing") {
        const prompt = pickUnused(data.writing, "writing");
        questions.push(
          buildWritingQuestion(setId, orderIndex, section.title, prompt, grade),
        );
      } else if (subject === "hanja" && data.hanja && data.hanja.length > 0) {
        const entry = pickUnused(data.hanja, "hanja");
        questions.push(
          buildHanjaQuestion(setId, orderIndex, section.title, entry),
        );
      } else if (
        subject === "english" &&
        data.english &&
        data.english.length > 0
      ) {
        const entry = pickUnused(data.english, "english");
        questions.push(
          buildEnglishQuestion(setId, orderIndex, section.title, entry),
        );
      } else if (
        subject === "korean" &&
        data.korean &&
        data.korean.length > 0
      ) {
        const entry = pickUnused(data.korean, "korean");
        questions.push(
          buildSubjectQuestion(
            setId,
            orderIndex,
            section.title,
            "korean" as SubjectType,
            entry,
            "국어",
          ),
        );
      } else if (
        subject === "creative" &&
        data.creative &&
        data.creative.length > 0
      ) {
        const entry = pickUnused(data.creative, "creative");
        questions.push(
          buildSubjectQuestion(
            setId,
            orderIndex,
            section.title,
            "creative" as SubjectType,
            entry,
            "창의",
          ),
        );
      } else if (
        subject === "science" &&
        data.science &&
        data.science.length > 0
      ) {
        const entry = pickUnused(data.science, "science");
        questions.push(
          buildSubjectQuestion(
            setId,
            orderIndex,
            section.title,
            "science" as SubjectType,
            entry,
            "과학",
          ),
        );
      } else if (
        subject === "social" &&
        data.social &&
        data.social.length > 0
      ) {
        const entry = pickUnused(data.social, "social");
        questions.push(
          buildSubjectQuestion(
            setId,
            orderIndex,
            section.title,
            "social" as SubjectType,
            entry,
            "사회",
          ),
        );
      } else {
        // Fallback: use knowledge data as generic question
        const entry = pickUnused(data.knowledge, "knowledge_fallback");
        questions.push(
          buildSubjectQuestion(
            setId,
            orderIndex,
            section.title,
            (subject as SubjectType) || ("general_knowledge" as SubjectType),
            entry,
            "",
          ),
        );
      }

      orderIndex++;
    }
  }

  return { set: dailySet, questions };
}
