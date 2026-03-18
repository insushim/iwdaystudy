/**
 * 순수 코드 기반 글쓰기 평가 엔진 v2 (API 없음, 외부 전송 없음)
 * 초등학생 개인정보 보호 준수
 */

export interface WritingEvalResult {
  score: number;      // 0~10
  stars: number;      // 1~5
  feedback: string;   // 칭찬 한 마디
  tip: string;        // 개선 제안
  details: {
    length: number;    // 0~3
    sentences: number; // 0~2
    variety: number;   // 0~3
    structure: number; // 0~2
  };
}

// ── 접속사/연결어 (종류별) ──────────────────────────────────────
const CONJ_REASON   = ['왜냐하면', '왜냐면', '그 이유는', '이유는', '왜냐'];
const CONJ_ORDER    = ['먼저', '처음에', '처음으로', '다음으로', '그 다음', '마지막으로', '끝으로', '그리고 나서'];
const CONJ_CONTRAST = ['하지만', '그러나', '그렇지만', '반면에', '그런데', '오히려'];
const CONJ_ADD      = ['그리고', '또한', '게다가', '더불어', '뿐만 아니라', '그뿐만'];
const CONJ_RESULT   = ['그래서', '따라서', '그러므로', '결국', '그 결과', '그러니'];
const CONJ_EXAMPLE  = ['예를 들어', '예를 들면', '특히', '특별히', '예컨대'];

const ALL_CONJUNCTIONS = [
  ...CONJ_REASON, ...CONJ_ORDER, ...CONJ_CONTRAST,
  ...CONJ_ADD, ...CONJ_RESULT, ...CONJ_EXAMPLE,
];

// ── 감정·심리 표현 ─────────────────────────────────────────────
const EMOTION_WORDS = [
  '기쁘', '슬프', '화나', '행복', '무섭', '신기', '신나', '재미있', '즐겁', '설레',
  '기분', '마음', '느낌', '감동', '놀라', '걱정', '두렵', '자랑스럽', '뿌듯', '아쉽',
  '그립', '보고싶', '사랑', '부끄럽', '당황', '실망', '흥미', '궁금', '깜짝',
];

// ── 구체적 묘사어 (색·크기·감각) ─────────────────────────────
const DESCRIPTIVE_WORDS = [
  '빨간', '파란', '노란', '초록', '흰', '검은', '분홍', '보라', '하늘색', '갈색',
  '크', '작', '넓', '좁', '높', '낮', '길', '짧', '두껍', '얇', '무거', '가볍',
  '맛있', '달콤', '쓴', '짠', '시큼', '매운', '향기', '냄새',
  '시끄럽', '조용', '부드럽', '딱딱', '차갑', '뜨겁', '따뜻', '시원', '촉촉',
];

// ── 헬퍼: 의미있는 단어 추출 (2자 이상) ─────────────────────
function extractWords(text: string): string[] {
  return text
    .replace(/[^\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318Fa-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2);
}

// ── 헬퍼: 문장 분리 (구두점 + 줄바꿈 모두 인식) ─────────────
function splitSentences(text: string): string[] {
  return text
    .split(/[.!?~]+|\n+/)
    .map(s => s.trim())
    .filter(s => s.length >= 3);
}

// ── 헬퍼: 단어 빈도 맵 ───────────────────────────────────────
function wordFrequency(words: string[]): Record<string, number> {
  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  return freq;
}

/**
 * 글쓰기 평가 (총 10점)
 * @param text     학생이 쓴 글
 * @param minChars 최소 글자 수
 */
export function evaluateWriting(text: string, minChars: number): WritingEvalResult {
  const clean = text.trim();
  const charCount = clean.length;
  const sentences = splitSentences(clean);
  const words = extractWords(clean);
  const uniqueWords = new Set(words);

  // ── A. 글자 수 (0~3점) ──────────────────────────────────────
  let lengthScore = 0;
  if (charCount >= minChars)             lengthScore = 1;
  if (charCount >= minChars * 1.6)       lengthScore = 2;
  if (charCount >= minChars * 2.5)       lengthScore = 3;

  // ── B. 문장 구성 (0~2점) ────────────────────────────────────
  // 줄바꿈 포함 문장 수 + 5자 이상 문장 비율
  const validSentences = sentences.filter(s => s.length >= 5);
  let sentenceScore = 0;
  if (validSentences.length >= 1) sentenceScore = 1;
  if (validSentences.length >= 3) sentenceScore = 2;

  // ── C. 어휘 다양성 (0~3점) ──────────────────────────────────
  let varietyScore = 0;
  if (words.length > 0) {
    const uniqueRatio = uniqueWords.size / words.length;
    const freq = wordFrequency(words);

    // 같은 단어 4회 이상 반복 시 패널티
    const hasExcessRepeat = Object.values(freq).some(c => c >= 4);

    // 감정어·묘사어 포함 여부
    const hasEmotion     = EMOTION_WORDS.some(e => clean.includes(e));
    const hasDescriptive = DESCRIPTIVE_WORDS.some(d => clean.includes(d));
    const hasRichVocab   = hasEmotion || hasDescriptive;

    if (uniqueWords.size >= 5  || uniqueRatio >= 0.55) varietyScore = 1;
    if (uniqueWords.size >= 10 || uniqueRatio >= 0.65) varietyScore = 2;
    if ((uniqueWords.size >= 14 || uniqueRatio >= 0.75) && hasRichVocab && !hasExcessRepeat) varietyScore = 3;
    // 어휘가 매우 풍부하면 감정어 없어도 3점
    if (uniqueWords.size >= 20 && uniqueRatio >= 0.80 && !hasExcessRepeat) varietyScore = 3;
    // 반복 과다 시 최대 1점
    if (hasExcessRepeat) varietyScore = Math.min(varietyScore, 1);
  }

  // ── D. 내용 구조 (0~2점) ────────────────────────────────────
  // 접속사 종류별 그룹 수 (최대 6 그룹)
  const conjGroups = [
    CONJ_REASON, CONJ_ORDER, CONJ_CONTRAST,
    CONJ_ADD, CONJ_RESULT, CONJ_EXAMPLE,
  ].filter(group => group.some(c => clean.includes(c))).length;

  // 단락 수 (줄바꿈 기준, 5자 이상)
  const paragraphs = clean.split(/\n+/).filter(p => p.trim().length >= 5).length;

  let structureScore = 0;
  if (conjGroups >= 1 || validSentences.length >= 3) structureScore = 1;
  if (conjGroups >= 2 || (conjGroups >= 1 && (paragraphs >= 2 || validSentences.length >= 4))) structureScore = 2;

  // ── 합산 ────────────────────────────────────────────────────
  const total = Math.min(10, lengthScore + sentenceScore + varietyScore + structureScore);
  const stars = total <= 2 ? 1 : total <= 4 ? 2 : total <= 6 ? 3 : total <= 8 ? 4 : 5;

  // ── 칭찬 피드백 (점수 구간별) ───────────────────────────────
  const FEEDBACKS: [number, string][] = [
    [9, '완벽해요! 진짜 작가 같아요!'],
    [7, '훌륭해요! 생각을 멋지게 표현했어요!'],
    [5, '잘 썼어요! 느낌이 잘 전달돼요!'],
    [3, '잘 시작했어요! 이야기를 더 늘려볼까요?'],
    [0, '도전했어요! 한 문장씩 더 써봐요!'],
  ];
  const feedback = FEEDBACKS.find(([min]) => total >= min)![1];

  // ── 개선 팁 (가장 점수 낮은 항목 기준) ─────────────────────
  const ratios = [
    { ratio: lengthScore / 3,    tip: `${Math.ceil(minChars * 1.6) - charCount}자만 더 쓰면 점수가 올라가요!` },
    { ratio: sentenceScore / 2,  tip: '마침표(.)로 문장을 나눠서 2~3문장 이상 써봐요!' },
    { ratio: varietyScore / 3,   tip: '색깔, 감정 표현 같은 다양한 단어를 써봐요!' },
    { ratio: structureScore / 2, tip: '"그래서", "왜냐하면" 같은 연결어를 넣어봐요!' },
  ];
  // 이미 만점인 항목은 제외, 가장 낮은 비율 항목 선택
  const notFull = ratios.filter((_, i) => [lengthScore < 3, sentenceScore < 2, varietyScore < 3, structureScore < 2][i]);
  const worst = notFull.sort((a, b) => a.ratio - b.ratio)[0];
  const tip = worst
    ? worst.tip
    : '이 실력이면 다음엔 더 멋진 글을 쓸 수 있어요!';

  return {
    score: total,
    stars,
    feedback,
    tip,
    details: {
      length: lengthScore,
      sentences: sentenceScore,
      variety: varietyScore,
      structure: structureScore,
    },
  };
}
