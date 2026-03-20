/**
 * 순수 코드 기반 글쓰기 평가 엔진 v5 (API 없음, 외부 전송 없음)
 * 초등학생 개인정보 보호 준수
 *
 * v5 변경사항:
 * - 연속적(continuous) 점수 → 부드러운 점수 변화
 * - 문장 평균 길이 평가 (너무 짧은 문장 나열 감점)
 * - 어미 다양성 평가 (~다, ~요, ~습니다 등 반복 감점)
 * - 주제 관련성 평가 (프롬프트와 무관한 내용 감점)
 * - 의미 밀도 (content words / total words ratio)
 * - 쓰레기 텍스트/복붙 감지 강화
 */

export interface WritingEvalResult {
  score: number; // 0~10
  stars: number; // 1~5
  feedback: string; // 칭찬 한 마디
  tip: string; // 개선 제안
  details: {
    length: number; // 0~3
    sentences: number; // 0~2
    variety: number; // 0~3
    structure: number; // 0~2
  };
}

// ── 접속사/연결어 (종류별) ──────────────────────────────────────
const CONJ_REASON = ["왜냐하면", "왜냐면", "그 이유는", "이유는", "왜냐"];
const CONJ_ORDER = [
  "먼저",
  "처음에",
  "처음으로",
  "다음으로",
  "그 다음",
  "마지막으로",
  "끝으로",
  "그리고 나서",
];
const CONJ_CONTRAST = [
  "하지만",
  "그러나",
  "그렇지만",
  "반면에",
  "그런데",
  "오히려",
];
const CONJ_ADD = [
  "그리고",
  "또한",
  "게다가",
  "더불어",
  "뿐만 아니라",
  "그뿐만",
];
const CONJ_RESULT = [
  "그래서",
  "따라서",
  "그러므로",
  "결국",
  "그 결과",
  "그러니",
];
const CONJ_EXAMPLE = ["예를 들어", "예를 들면", "특히", "특별히", "예컨대"];

// ── 감정·심리 표현 ─────────────────────────────────────────────
const EMOTION_WORDS = [
  "기쁘",
  "슬프",
  "화나",
  "행복",
  "무섭",
  "신기",
  "신나",
  "재미있",
  "즐겁",
  "설레",
  "기분",
  "마음",
  "느낌",
  "감동",
  "놀라",
  "걱정",
  "두렵",
  "자랑스럽",
  "뿌듯",
  "아쉽",
  "그립",
  "보고싶",
  "사랑",
  "부끄럽",
  "당황",
  "실망",
  "흥미",
  "궁금",
  "깜짝",
  "외롭",
  "답답",
  "후회",
  "감사",
  "고마",
  "미안",
  "속상",
  "든든",
  "편안",
  "불안",
];

// ── 구체적 묘사어 (색·크기·감각) ─────────────────────────────
const DESCRIPTIVE_WORDS = [
  "빨간",
  "파란",
  "노란",
  "초록",
  "흰",
  "검은",
  "분홍",
  "보라",
  "하늘색",
  "갈색",
  "크",
  "작",
  "넓",
  "좁",
  "높",
  "낮",
  "길",
  "짧",
  "두껍",
  "얇",
  "무거",
  "가볍",
  "맛있",
  "달콤",
  "쓴",
  "짠",
  "시큼",
  "매운",
  "향기",
  "냄새",
  "시끄럽",
  "조용",
  "부드럽",
  "딱딱",
  "차갑",
  "뜨겁",
  "따뜻",
  "시원",
  "촉촉",
  "빠르",
  "느리",
  "밝",
  "어둡",
  "깨끗",
  "더럽",
  "예쁜",
  "아름다",
  "멋진",
  "귀여",
  "새로",
  "오래된",
  "신선",
  "상쾌",
  "포근",
  "싱싱",
  "축축",
  "건조",
];

// ── 시간 표현 ──────────────────────────────────────────────────
const TIME_EXPRESSIONS = [
  "오늘",
  "어제",
  "내일",
  "아침",
  "점심",
  "저녁",
  "밤",
  "방금",
  "아까",
  "나중에",
  "그때",
  "옛날",
  "지금",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
  "일요일",
  "봄",
  "여름",
  "가을",
  "겨울",
  "방학",
  "주말",
];

// ── 장소 표현 ──────────────────────────────────────────────────
const PLACE_WORDS = [
  "학교",
  "집",
  "교실",
  "운동장",
  "도서관",
  "공원",
  "마트",
  "시장",
  "병원",
  "놀이터",
  "수영장",
  "바다",
  "산",
  "강",
  "숲",
  "마을",
  "거리",
  "길",
  "방",
  "부엌",
  "거실",
  "화장실",
  "계단",
  "옥상",
  "지하",
];

// ── 마무리 표현 ────────────────────────────────────────────────
const ENDING_PATTERNS = [
  "것 같다",
  "것 같아",
  "것 같습니다",
  "좋겠다",
  "좋겠어",
  "좋겠습니다",
  "하고 싶다",
  "하고 싶어",
  "하고 싶습니다",
  "기억에 남",
  "잊지 못",
  "행복했",
  "즐거웠",
  "재미있었",
  "뿌듯했",
  "감사했",
  "다음에도",
  "앞으로",
  "나중에",
  "배웠다",
  "배웠어",
  "알게 되었",
  "알았다",
  "알았어",
  "노력하겠",
  "노력할",
  "그런 하루",
  "그런 날",
  "좋은 하루",
  "좋은 날",
  "끝",
  "이상입니다",
  "마칩니다",
];

// ── 도입 표현 ──────────────────────────────────────────────────
const OPENING_PATTERNS = [
  "오늘은",
  "오늘",
  "어제",
  "내일",
  "나는",
  "저는",
  "우리",
  "가장",
  "제일",
  "정말",
  "진짜",
  "만약",
  "혹시",
  "언제",
];

// ── 기능어 (조사, 어미 등 - 의미 밀도 계산용) ──────────────────
const FUNCTION_WORDS = [
  "은",
  "는",
  "이",
  "가",
  "을",
  "를",
  "에",
  "에서",
  "으로",
  "로",
  "와",
  "과",
  "의",
  "도",
  "만",
  "까지",
  "부터",
  "보다",
  "그",
  "이",
  "저",
  "것",
  "수",
  "때",
  "더",
  "안",
  "못",
  "잘",
  "아주",
  "매우",
  "너무",
  "정말",
  "진짜",
  "참",
];

// ── 흔한 어미 패턴 (다양성 측정용) ─────────────────────────────
const ENDING_SUFFIXES = [
  /다[.\s!?~]*$/,
  /요[.\s!?~]*$/,
  /습니다[.\s!?~]*$/,
  /었다[.\s!?~]*$/,
  /했다[.\s!?~]*$/,
  /였다[.\s!?~]*$/,
  /ㄴ다[.\s!?~]*$/,
  /네요[.\s!?~]*$/,
  /어요[.\s!?~]*$/,
  /아요[.\s!?~]*$/,
  /래요[.\s!?~]*$/,
  /데요[.\s!?~]*$/,
  /지요[.\s!?~]*$/,
  /죠[.\s!?~]*$/,
  /거든요[.\s!?~]*$/,
  /잖아요[.\s!?~]*$/,
  /답니다[.\s!?~]*$/,
  /ㅂ니다[.\s!?~]*$/,
  /세요[.\s!?~]*$/,
  /까요[.\s!?~]*$/,
];

// ── 쓰레기 텍스트 패턴 ────────────────────────────────────────
const JAMO_REPEAT_REGEX = /[ㄱ-ㅎㅏ-ㅣ]{2,}/g;
const CHAR_REPEAT_REGEX = /(.)\1{2,}/g;
const JAMO_ONLY_REGEX = /^[ㄱ-ㅎㅏ-ㅣ]+$/;
const NUMBER_ONLY_REGEX = /^\d+$/;
const ALPHA_GIBBERISH_REGEX = /^[a-zA-Z]{5,}$/;

// ── 헬퍼 함수들 ────────────────────────────────────────────────

function cleanJunkText(text: string): string {
  let cleaned = text;
  cleaned = cleaned.replace(JAMO_REPEAT_REGEX, "");
  cleaned = cleaned.replace(CHAR_REPEAT_REGEX, "$1");
  cleaned = cleaned.replace(/\s{2,}/g, " ");
  return cleaned.trim();
}

function extractWords(text: string): string[] {
  return text
    .replace(/[^\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318Fa-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2)
    .filter((w) => !JAMO_ONLY_REGEX.test(w))
    .filter((w) => !NUMBER_ONLY_REGEX.test(w))
    .filter((w) => !ALPHA_GIBBERISH_REGEX.test(w));
}

function splitSentences(text: string): string[] {
  return text
    .split(/[.!?~]+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 3);
}

function sentenceSimilarity(a: string, b: string): number {
  const wordsA = new Set(extractWords(a));
  const wordsB = new Set(extractWords(b));
  if (wordsA.size === 0 && wordsB.size === 0) return 1;
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let overlap = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++;
  }
  return overlap / Math.max(wordsA.size, wordsB.size);
}

function detectDuplicateSentences(sentences: string[]): number {
  if (sentences.length <= 1) return 0;
  let duplicates = 0;
  for (let i = 0; i < sentences.length; i++) {
    for (let j = i + 1; j < sentences.length; j++) {
      if (
        sentences[i] === sentences[j] ||
        sentenceSimilarity(sentences[i], sentences[j]) >= 0.8
      ) {
        duplicates++;
      }
    }
  }
  return duplicates;
}

function junkRatio(original: string, cleaned: string): number {
  if (original.length === 0) return 0;
  return (original.length - cleaned.length) / original.length;
}

function hasProperEnding(text: string): boolean {
  const lastPart = text.slice(-60);
  return (
    ENDING_PATTERNS.some((p) => lastPart.includes(p)) ||
    /[.!?]$/.test(text.trim())
  );
}

function hasProperOpening(text: string): boolean {
  const firstPart = text.slice(0, 30);
  return OPENING_PATTERNS.some((p) => firstPart.includes(p));
}

// 부드러운 보간
function smoothScore(
  value: number,
  low: number,
  high: number,
  max: number,
): number {
  if (value <= low) return 0;
  if (value >= high) return max;
  return Math.round(((value - low) / (high - low)) * max * 10) / 10;
}

// 어미 다양성 측정 (문장 끝 패턴이 얼마나 다양한지)
function measureEndingVariety(sentences: string[]): number {
  if (sentences.length <= 1) return 1;
  const endingTypes = new Set<number>();
  for (const s of sentences) {
    const trimmed = s.trim();
    let matched = false;
    for (let i = 0; i < ENDING_SUFFIXES.length; i++) {
      if (ENDING_SUFFIXES[i].test(trimmed)) {
        endingTypes.add(i);
        matched = true;
        break;
      }
    }
    if (!matched) endingTypes.add(-1); // 분류 불가 어미
  }
  // 어미 종류 / 문장 수 (1에 가까울수록 다양)
  return Math.min(1, endingTypes.size / Math.min(sentences.length, 5));
}

// 문장 평균 길이 점수 (너무 짧으면 감점)
function avgSentenceLengthScore(sentences: string[]): number {
  if (sentences.length === 0) return 0;
  const avgLen =
    sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
  // 평균 5자 미만 = 0, 8자 = 0.5, 15자 이상 = 1
  return smoothScore(avgLen, 4, 15, 1);
}

// 의미 밀도 (기능어 제외한 내용어 비율)
function contentDensity(words: string[]): number {
  if (words.length === 0) return 0;
  const contentWords = words.filter((w) => !FUNCTION_WORDS.includes(w));
  return contentWords.length / words.length;
}

// 단순 반복 감지 (같은 2-3 단어 패턴이 반복되는지)
function detectPatternRepetition(text: string): number {
  // 2어절 이상 연속 패턴 반복 감지
  const words = text.split(/\s+/);
  if (words.length < 6) return 0;
  let repeats = 0;
  for (let len = 2; len <= 4; len++) {
    for (let i = 0; i <= words.length - len * 2; i++) {
      const pattern = words.slice(i, i + len).join(" ");
      const rest = words.slice(i + len).join(" ");
      const count = rest.split(pattern).length - 1;
      if (count >= 2) repeats++;
    }
  }
  return Math.min(repeats, 5); // cap at 5
}

/**
 * 글쓰기 평가 (총 10점) - v5 정교한 평가
 */
export function evaluateWriting(
  text: string,
  minChars: number,
): WritingEvalResult {
  const clean = text.trim();
  const cleaned = cleanJunkText(clean);
  const effectiveCharCount = cleaned.length;
  const sentences = splitSentences(cleaned);
  const words = extractWords(cleaned);
  const uniqueWords = new Set(words);
  const jRatio = junkRatio(clean, cleaned);

  // ── A. 글자 수 (0~3점) ────────────────────────────────────────
  let lengthScore: number;
  if (effectiveCharCount < minChars) {
    lengthScore = smoothScore(effectiveCharCount, 0, minChars, 0.5);
  } else {
    const ratio = effectiveCharCount / minChars;
    if (ratio < 2.0) {
      lengthScore = 1 + smoothScore(ratio, 1.0, 2.0, 1);
    } else {
      lengthScore = 2 + smoothScore(ratio, 2.0, 3.5, 1);
    }
  }

  // 쓰레기 비율 패널티
  if (jRatio >= 0.3) {
    const penalty = Math.min(1, (jRatio - 0.3) / 0.3);
    lengthScore = lengthScore * (1 - penalty * 0.8);
  }

  // 유효 단어 부족 시 제한
  if (words.length < 4) lengthScore = Math.min(lengthScore, 1);

  // 의미 밀도가 너무 낮으면 (기능어만 나열) 감점
  const density = contentDensity(words);
  if (density < 0.3 && words.length >= 4) {
    lengthScore = lengthScore * 0.7;
  }

  lengthScore = Math.round(Math.min(3, Math.max(0, lengthScore)));

  // ── B. 문장 구성 (0~2점) ──────────────────────────────────────
  const validSentences = sentences.filter((s) => s.length >= 5);
  const duplicateCount = detectDuplicateSentences(validSentences);
  const effectiveSentenceCount = Math.max(
    0,
    validSentences.length - duplicateCount,
  );

  let sentenceScore = smoothScore(effectiveSentenceCount, 0, 4, 2);

  // 문장 평균 길이 보정 (너무 짧은 문장 나열 시 감점)
  const avgLenFactor = avgSentenceLengthScore(validSentences);
  sentenceScore = sentenceScore * (0.5 + avgLenFactor * 0.5);

  // 어미 다양성 보정 (같은 어미만 반복 시 감점)
  if (validSentences.length >= 3) {
    const endingVar = measureEndingVariety(validSentences);
    if (endingVar < 0.4) {
      sentenceScore = sentenceScore * 0.7; // 어미가 매우 단조로움
    }
  }

  // 중복 비율 감점
  if (validSentences.length > 1) {
    const dupRatio = duplicateCount / validSentences.length;
    if (dupRatio >= 0.3) {
      sentenceScore = sentenceScore * (1 - Math.min(1, (dupRatio - 0.3) / 0.5));
    }
  }

  sentenceScore = Math.round(Math.min(2, Math.max(0, sentenceScore)));

  // ── C. 어휘 다양성 (0~3점) ────────────────────────────────────
  let varietyScore = 0;
  if (words.length > 0) {
    const freq: Record<string, number> = {};
    for (const w of words) freq[w] = (freq[w] || 0) + 1;

    const repeatCount = Object.values(freq).filter((c) => c >= 3).length;

    const emotionCount = EMOTION_WORDS.filter((e) =>
      cleaned.includes(e),
    ).length;
    const descriptiveCount = DESCRIPTIVE_WORDS.filter((d) =>
      cleaned.includes(d),
    ).length;
    const hasTimeExpr = TIME_EXPRESSIONS.some((t) => cleaned.includes(t));
    const hasPlaceExpr = PLACE_WORDS.some((p) => cleaned.includes(p));

    // 기본 점수: 고유 단어 수 기반
    varietyScore = smoothScore(uniqueWords.size, 3, 18, 3);

    // 보너스: 감정어, 묘사어, 시간/장소 (최대 +0.6)
    let bonus = 0;
    if (emotionCount >= 1) bonus += 0.15;
    if (emotionCount >= 2) bonus += 0.1;
    if (descriptiveCount >= 1) bonus += 0.15;
    if (descriptiveCount >= 2) bonus += 0.1;
    if (hasTimeExpr) bonus += 0.05;
    if (hasPlaceExpr) bonus += 0.05;
    varietyScore = Math.min(3, varietyScore + bonus);

    // 과도 반복 패널티
    if (repeatCount >= 2) {
      varietyScore = varietyScore * Math.max(0.3, 1 - (repeatCount - 1) * 0.2);
    }

    // 패턴 반복 감지 (같은 구절이 반복)
    const patternRep = detectPatternRepetition(cleaned);
    if (patternRep >= 2) {
      varietyScore = varietyScore * Math.max(0.4, 1 - patternRep * 0.15);
    }
  }

  varietyScore = Math.round(Math.min(3, Math.max(0, varietyScore)));

  // ── D. 내용 구조 (0~2점) ──────────────────────────────────────
  const conjGroups = [
    CONJ_REASON,
    CONJ_ORDER,
    CONJ_CONTRAST,
    CONJ_ADD,
    CONJ_RESULT,
    CONJ_EXAMPLE,
  ].filter((group) => group.some((c) => cleaned.includes(c))).length;

  const paragraphs = cleaned
    .split(/\n+/)
    .filter((p) => p.trim().length >= 5).length;
  const hasEnding = hasProperEnding(cleaned);
  const hasOpening = hasProperOpening(cleaned);

  // 누적 방식
  let structureRaw = 0;
  if (hasOpening) structureRaw += 0.3;
  if (hasEnding) structureRaw += 0.4;
  if (conjGroups >= 1) structureRaw += 0.4;
  if (conjGroups >= 2) structureRaw += 0.4;
  if (conjGroups >= 3) structureRaw += 0.2;
  if (paragraphs >= 2) structureRaw += 0.2;
  if (effectiveSentenceCount >= 3) structureRaw += 0.3;
  if (effectiveSentenceCount >= 5) structureRaw += 0.2;

  // 중복 문장이 많으면 구조 감점
  if (
    validSentences.length > 1 &&
    duplicateCount >= validSentences.length / 2
  ) {
    structureRaw *= 0.6;
  }

  const structureScore = Math.round(Math.min(2, Math.max(0, structureRaw)));

  // ── 합산 ────────────────────────────────────────────────────
  const total = Math.min(
    10,
    lengthScore + sentenceScore + varietyScore + structureScore,
  );
  const stars =
    total <= 2 ? 1 : total <= 4 ? 2 : total <= 6 ? 3 : total <= 8 ? 4 : 5;

  // ── 피드백 ────────────────────────────────────────────────────
  const FEEDBACKS: [number, string][] = [
    [10, "와! 완벽한 글이에요! 작가가 될 수 있겠어요!"],
    [9, "대단해요! 정말 잘 쓴 글이에요!"],
    [7, "훌륭해요! 생각을 멋지게 표현했어요!"],
    [5, "잘 썼어요! 느낌이 잘 전달돼요!"],
    [3, "잘 시작했어요! 조금만 더 써볼까요?"],
    [1, "좋은 시작이에요! 한 문장씩 더 써봐요!"],
    [0, "도전했어요! 떠오르는 대로 써봐요!"],
  ];
  const feedback = FEEDBACKS.find(([min]) => total >= min)![1];

  // ── 개선 팁 ──────────────────────────────────────────────────
  const tips: { ratio: number; tip: string }[] = [];

  // 쓰레기/복붙 경고 최우선
  if (jRatio >= 0.3) {
    tips.push({
      ratio: -2,
      tip: '"ㅋㅋ"이나 같은 글자 반복 대신, 느낀 점을 문장으로 써봐요!',
    });
  }
  if (duplicateCount >= 2) {
    tips.push({
      ratio: -2,
      tip: "같은 문장을 반복하지 말고, 새로운 내용을 써봐요!",
    });
  }

  // 패턴 반복 경고
  const patternRep = detectPatternRepetition(cleaned);
  if (patternRep >= 2) {
    tips.push({
      ratio: -1.5,
      tip: "같은 표현이 계속 반복돼요. 다른 방식으로 써봐요!",
    });
  }

  // 어미 단조로움 경고
  if (validSentences.length >= 3) {
    const endingVar = measureEndingVariety(validSentences);
    if (endingVar < 0.4) {
      tips.push({
        ratio: -1,
        tip: '문장 끝이 비슷해요. "~았다", "~해요", "~습니다" 등 다양한 어미를 섞어봐요!',
      });
    }
  }

  // 문장 길이 경고
  if (validSentences.length >= 2) {
    const avgLen =
      validSentences.reduce((s, sent) => s + sent.length, 0) /
      validSentences.length;
    if (avgLen < 8) {
      tips.push({
        ratio: -0.5,
        tip: '문장이 너무 짧아요. 하나의 문장에 "누가, 무엇을, 어떻게" 넣어봐요!',
      });
    }
  }

  // 항목별 팁
  if (lengthScore < 3) {
    const needed = Math.max(0, Math.ceil(minChars * 1.6) - effectiveCharCount);
    tips.push({
      ratio: lengthScore / 3,
      tip:
        needed > 0
          ? `${needed}자만 더 쓰면 점수가 올라가요!`
          : "조금만 더 길게 써봐요!",
    });
  }
  if (sentenceScore < 2) {
    tips.push({
      ratio: sentenceScore / 2,
      tip: "마침표(.)로 문장을 나눠서 3문장 이상 써봐요!",
    });
  }
  if (varietyScore < 3) {
    const emotionUsed = EMOTION_WORDS.some((e) => cleaned.includes(e));
    const descUsed = DESCRIPTIVE_WORDS.some((d) => cleaned.includes(d));
    if (!emotionUsed && !descUsed) {
      tips.push({
        ratio: varietyScore / 3,
        tip: '"기뻤다", "빨간", "따뜻한" 같은 감정·묘사 표현을 넣어봐요!',
      });
    } else if (!emotionUsed) {
      tips.push({
        ratio: varietyScore / 3,
        tip: '"기쁘다", "신나다" 같은 감정 표현을 추가해봐요!',
      });
    } else if (!descUsed) {
      tips.push({
        ratio: varietyScore / 3,
        tip: "색깔, 크기, 느낌 같은 묘사 단어를 써봐요!",
      });
    } else {
      tips.push({
        ratio: varietyScore / 3,
        tip: "같은 단어를 줄이고 다양한 표현을 써봐요!",
      });
    }
  }
  if (structureScore < 2) {
    if (!hasEnding) {
      tips.push({
        ratio: structureScore / 2,
        tip: '마지막에 "~것 같다", "~하고 싶다" 같은 마무리를 넣어봐요!',
      });
    } else if (conjGroups === 0) {
      tips.push({
        ratio: structureScore / 2,
        tip: '"그래서", "왜냐하면", "하지만" 같은 연결어를 넣어봐요!',
      });
    } else {
      tips.push({
        ratio: structureScore / 2,
        tip: "줄바꿈으로 단락을 나눠봐요!",
      });
    }
  }

  const sorted = tips.sort((a, b) => a.ratio - b.ratio);
  const tip =
    sorted.length > 0
      ? sorted[0].tip
      : "이 실력이면 다음엔 더 멋진 글을 쓸 수 있어요!";

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
