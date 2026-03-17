/**
 * 순수 코드 기반 글쓰기 평가 엔진 (API 없음, 외부 전송 없음)
 * 초등학생 개인정보 보호 준수
 */

export interface WritingEvalResult {
  score: number;      // 0~10 (question.points에 반영)
  stars: number;      // 1~5 (UI 표시용)
  feedback: string;   // 한 줄 피드백
  details: {
    length: number;    // 글자 수 점수 (0~3)
    sentences: number; // 문장 구성 점수 (0~2)
    variety: number;   // 어휘 다양성 점수 (0~3)
    structure: number; // 내용 구조 점수 (0~2)
  };
}

const CONJUNCTIONS = [
  '그리고', '그런데', '그래서', '하지만', '그러나', '왜냐하면',
  '따라서', '또한', '게다가', '하지만', '그러므로', '그렇지만',
  '먼저', '다음으로', '마지막으로', '결국', '예를 들어', '특히',
];

// 의미있는 단어 추출 (2자 이상, 숫자/공백/기호 제외)
function extractWords(text: string): string[] {
  return text
    .replace(/[^\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318Fa-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2);
}

// 문장 분리 (. ! ? 기준)
function splitSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * 글쓰기 평가 (총 10점)
 * @param text    학생이 쓴 글
 * @param minChars 최소 글자 수 (학년별: 20/50/100)
 */
export function evaluateWriting(text: string, minChars: number): WritingEvalResult {
  const clean = text.trim();
  const charCount = clean.length;

  // ── A. 글자 수 (0~3점) ──────────────────────────────────────
  let lengthScore = 0;
  if (charCount >= minChars) lengthScore = 1;
  if (charCount >= minChars * 1.5) lengthScore = 2;
  if (charCount >= minChars * 2.5) lengthScore = 3;

  // ── B. 문장 구성 (0~2점) ────────────────────────────────────
  const hasPunctuation = /[.!?]/.test(clean);
  const sentences = splitSentences(clean);
  let sentenceScore = 0;
  if (hasPunctuation) sentenceScore = 1;
  if (sentences.length >= 2) sentenceScore = 2;

  // ── C. 어휘 다양성 (0~3점) ──────────────────────────────────
  const words = extractWords(clean);
  let varietyScore = 0;
  if (words.length > 0) {
    const uniqueRatio = new Set(words).size / words.length;
    if (uniqueRatio >= 0.7) varietyScore = 3;
    else if (uniqueRatio >= 0.5) varietyScore = 2;
    else if (uniqueRatio >= 0.3) varietyScore = 1;
  }

  // ── D. 내용 구조 (0~2점) ────────────────────────────────────
  const hasConjunction = CONJUNCTIONS.some(c => clean.includes(c));
  const avgSentenceLen = sentences.length > 0
    ? sentences.reduce((a, s) => a + s.length, 0) / sentences.length
    : 0;
  let structureScore = 0;
  if (hasConjunction) structureScore += 1;
  if (avgSentenceLen >= 10 || sentences.length >= 3) structureScore += 1;

  // ── 합산 ────────────────────────────────────────────────────
  const total = Math.min(10, lengthScore + sentenceScore + varietyScore + structureScore);
  const stars = total <= 2 ? 1 : total <= 4 ? 2 : total <= 6 ? 3 : total <= 8 ? 4 : 5;

  // ── 피드백 ──────────────────────────────────────────────────
  const FEEDBACKS: [number, string][] = [
    [9, '정말 훌륭해요! 멋진 이야기꾼이에요!'],
    [7, '잘 썼어요! 다양한 표현을 잘 활용했네요!'],
    [5, '좋아요! 조금 더 길게, 다양하게 써봐요.'],
    [3, '잘 시작했어요! 더 많이 써보면 훨씬 좋을 거예요.'],
    [0, '도전했어요! 다음엔 더 긴 이야기를 써봐요.'],
  ];
  const feedback = FEEDBACKS.find(([min]) => total >= min)![1];

  return {
    score: total,
    stars,
    feedback,
    details: {
      length: lengthScore,
      sentences: sentenceScore,
      variety: varietyScore,
      structure: structureScore,
    },
  };
}
