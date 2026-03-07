/**
 * Procedural Spelling Problem Generator
 * Generates grade-appropriate Korean spelling problems algorithmically.
 */
import type { SpellingEntry } from "@/types/curriculum";

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function pickOne<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

// Common Korean spelling mistake patterns
interface SpellingPattern {
  correct: string;
  wrong: string;
  explanation: string;
  gradeMin: number;
}

const SPELLING_PATTERNS: SpellingPattern[] = [
  // Grade 1-2: Basic patterns
  {
    correct: "되다",
    wrong: "돼다",
    explanation: "'되다'가 기본형입니다.",
    gradeMin: 1,
  },
  {
    correct: "안 돼",
    wrong: "안 되",
    explanation: "'안 돼'(안 되어)가 올바른 표현입니다.",
    gradeMin: 1,
  },
  {
    correct: "왜",
    wrong: "외",
    explanation: "'왜'가 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "개",
    wrong: "게",
    explanation: "'개'가 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "네",
    wrong: "내",
    explanation: "'네'(당신의)와 '내'(나의)를 구별합니다.",
    gradeMin: 1,
  },

  // 된소리/거센소리 혼동
  {
    correct: "깨끗하다",
    wrong: "께끗하다",
    explanation: "'깨끗하다'가 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "뚝딱",
    wrong: "뚝닥",
    explanation: "'뚝딱'이 올바른 의태어입니다.",
    gradeMin: 1,
  },
  {
    correct: "번쩍",
    wrong: "번쩍",
    explanation: "'번쩍'이 올바른 의태어입니다.",
    gradeMin: 1,
  },
  {
    correct: "반짝반짝",
    wrong: "반작반작",
    explanation: "'반짝반짝'이 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "깜짝",
    wrong: "깜작",
    explanation: "'깜짝'이 올바른 표기입니다.",
    gradeMin: 1,
  },

  // 받침 혼동
  {
    correct: "닭",
    wrong: "닥",
    explanation: "'닭'이 올바른 표기입니다. 겹받침 ㄺ.",
    gradeMin: 1,
  },
  {
    correct: "흙",
    wrong: "흑",
    explanation: "'흙'이 올바른 표기입니다. 겹받침 ㄺ.",
    gradeMin: 1,
  },
  {
    correct: "읽다",
    wrong: "익다",
    explanation: "'읽다'가 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "없다",
    wrong: "업다",
    explanation: "'없다'가 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "있다",
    wrong: "잇다",
    explanation: "'있다'가 올바른 표기입니다. 쌍시옷 받침.",
    gradeMin: 1,
  },

  // Grade 2-3: 띄어쓰기
  {
    correct: "할 수 있다",
    wrong: "할수있다",
    explanation: "'할 수 있다'처럼 의존명사는 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "할 줄 안다",
    wrong: "할줄 안다",
    explanation: "'할 줄 안다'로 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "먹을 만큼",
    wrong: "먹을만큼",
    explanation: "'만큼'은 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "올 때",
    wrong: "올때",
    explanation: "'때'는 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "갈 데가 없다",
    wrong: "갈데가 없다",
    explanation: "'데'는 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "한 개",
    wrong: "한개",
    explanation: "수 관형사와 단위명사는 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "세 살",
    wrong: "세살",
    explanation: "수 관형사와 단위명사는 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "두 마리",
    wrong: "두마리",
    explanation: "수 관형사와 단위명사는 띄어 씁니다.",
    gradeMin: 2,
  },

  // Grade 3-4: 사이시옷
  {
    correct: "나뭇잎",
    wrong: "나무잎",
    explanation: "사이시옷이 필요합니다: '나뭇잎'.",
    gradeMin: 3,
  },
  {
    correct: "잇몸",
    wrong: "이몸",
    explanation: "'잇몸'이 올바른 표기입니다.",
    gradeMin: 3,
  },
  {
    correct: "깻잎",
    wrong: "깨잎",
    explanation: "'깻잎'이 올바른 표기입니다.",
    gradeMin: 3,
  },
  {
    correct: "콧물",
    wrong: "코물",
    explanation: "'콧물'이 올바른 표기입니다.",
    gradeMin: 3,
  },
  {
    correct: "햇볕",
    wrong: "해볕",
    explanation: "'햇볕'이 올바른 표기입니다.",
    gradeMin: 3,
  },
  {
    correct: "핏줄",
    wrong: "피줄",
    explanation: "'핏줄'이 올바른 표기입니다.",
    gradeMin: 3,
  },
  {
    correct: "귓속",
    wrong: "귀속",
    explanation: "'귓속'이 올바른 표기입니다.",
    gradeMin: 3,
  },

  // Grade 3-4: 혼동하기 쉬운 표현
  {
    correct: "어떡해",
    wrong: "어떻해",
    explanation: "'어떡해'(어떻게 해)가 올바른 표현입니다.",
    gradeMin: 3,
  },
  {
    correct: "어떻게",
    wrong: "어떡게",
    explanation: "'어떻게'가 올바른 부사형입니다.",
    gradeMin: 3,
  },
  {
    correct: "가르치다",
    wrong: "가리키다",
    explanation: "'가르치다'(teach)와 '가리키다'(point)는 다릅니다.",
    gradeMin: 3,
  },
  {
    correct: "다르다",
    wrong: "틀리다",
    explanation: "'다르다'(different)와 '틀리다'(wrong)는 다릅니다.",
    gradeMin: 3,
  },
  {
    correct: "바라다",
    wrong: "바래다",
    explanation: "'바라다'(wish)가 올바른 표기입니다.",
    gradeMin: 3,
  },
  {
    correct: "며칠",
    wrong: "몇일",
    explanation: "'며칠'이 올바른 표기입니다.",
    gradeMin: 3,
  },
  {
    correct: "설거지",
    wrong: "설겆이",
    explanation: "'설거지'가 올바른 표기입니다.",
    gradeMin: 3,
  },

  // Grade 4-5: 높임/겸양
  {
    correct: "드시다",
    wrong: "먹으시다",
    explanation: "어른에게는 '드시다'가 올바른 높임말입니다.",
    gradeMin: 4,
  },
  {
    correct: "주무시다",
    wrong: "자시다",
    explanation: "'주무시다'가 올바른 높임말입니다.",
    gradeMin: 4,
  },
  {
    correct: "돌아가시다",
    wrong: "죽으시다",
    explanation: "'돌아가시다'가 올바른 높임 표현입니다.",
    gradeMin: 4,
  },
  {
    correct: "연세",
    wrong: "나이(높임)",
    explanation: "어른의 나이는 '연세'라 합니다.",
    gradeMin: 4,
  },
  {
    correct: "말씀",
    wrong: "말(높임)",
    explanation: "어른의 말은 '말씀'이라 합니다.",
    gradeMin: 4,
  },

  // Grade 5-6: 어려운 맞춤법
  {
    correct: "웬일",
    wrong: "왠일",
    explanation: "'웬일'이 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    correct: "왠지",
    wrong: "웬지",
    explanation: "'왠지'(왜인지)가 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    correct: "로서",
    wrong: "로써",
    explanation: "'로서'는 자격, '로써'는 수단입니다.",
    gradeMin: 5,
  },
  {
    correct: "든지",
    wrong: "던지",
    explanation: "'든지'는 선택, '던지'는 과거 회상입니다.",
    gradeMin: 5,
  },
  {
    correct: "데",
    wrong: "대",
    explanation: "'데'(것, 곳)와 '대'(말을 전달)를 구별합니다.",
    gradeMin: 5,
  },
  {
    correct: "안 되다",
    wrong: "않 되다",
    explanation: "'안'(부정)과 '않'(-지 않다)을 구별합니다.",
    gradeMin: 5,
  },
  {
    correct: "넓이",
    wrong: "널비",
    explanation: "'넓이'가 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    correct: "낫다",
    wrong: "낳다/났다",
    explanation: "'낫다'(better)와 '낳다'(bear)를 구별합니다.",
    gradeMin: 5,
  },
  {
    correct: "맞히다",
    wrong: "맞추다(정답)",
    explanation: "정답을 '맞히다', 서로 대조하는 것은 '맞추다'입니다.",
    gradeMin: 5,
  },
  {
    correct: "부딪히다",
    wrong: "부딪치다",
    explanation: "'부딪히다'가 표준어입니다.",
    gradeMin: 5,
  },
  {
    correct: "깨끗이",
    wrong: "깨끗히",
    explanation: "'깨끗이'가 올바른 부사형입니다.",
    gradeMin: 5,
  },
  {
    correct: "일찍이",
    wrong: "일찍히",
    explanation: "'일찍이'가 올바른 부사형입니다.",
    gradeMin: 5,
  },
];

// Sentence templates that incorporate the patterns
interface SentenceTemplate {
  template: string; // {word} placeholder
  gradeMin: number;
}

const SENTENCE_TEMPLATES: SentenceTemplate[] = [
  { template: "오늘 {word} 좋겠다.", gradeMin: 1 },
  { template: "엄마가 {word}.", gradeMin: 1 },
  { template: "아빠와 {word}.", gradeMin: 1 },
  { template: "친구가 {word}.", gradeMin: 1 },
  { template: "강아지가 {word}.", gradeMin: 1 },
  { template: "학교에서 {word}.", gradeMin: 1 },
  { template: "놀이터에서 {word}.", gradeMin: 1 },
  { template: "선생님이 {word}.", gradeMin: 2 },
  { template: "동생과 함께 {word}.", gradeMin: 2 },
  { template: "주말에 가족과 {word}.", gradeMin: 2 },
  { template: "도서관에서 {word}.", gradeMin: 3 },
  { template: "방학 동안 {word}.", gradeMin: 3 },
  { template: "우리 반에서 {word}.", gradeMin: 3 },
  { template: "과학 시간에 {word}.", gradeMin: 4 },
  { template: "사회 수업에서 {word}.", gradeMin: 4 },
  { template: "발표할 때 {word}.", gradeMin: 5 },
  { template: "보고서를 쓸 때 {word}.", gradeMin: 5 },
  { template: "토론에서 {word}.", gradeMin: 6 },
];

export function generateSpellingProblems(
  grade: number,
  count: number,
  seed: number,
): SpellingEntry[] {
  const rng = seededRandom(seed);
  const eligible = SPELLING_PATTERNS.filter((p) => p.gradeMin <= grade);
  const templates = SENTENCE_TEMPLATES.filter((t) => t.gradeMin <= grade);
  const results: SpellingEntry[] = [];

  for (let i = 0; i < count; i++) {
    const pattern = pickOne(rng, eligible);
    const template = pickOne(rng, templates);
    const answerIsFirst = rng() > 0.4; // 60% chance correct is first

    const q1 = template.template.replace(
      "{word}",
      answerIsFirst ? pattern.correct : pattern.wrong,
    );
    const q2 = template.template.replace(
      "{word}",
      answerIsFirst ? pattern.wrong : pattern.correct,
    );

    results.push({
      q1,
      q2,
      answer: answerIsFirst ? 1 : 2,
      explanation: pattern.explanation,
    });
  }

  return results;
}

export function generateSpellingPool(
  grade: number,
  dayOfYear: number,
): SpellingEntry[] {
  return generateSpellingProblems(
    grade,
    300,
    dayOfYear * 1000 + grade * 100 + 77,
  );
}
