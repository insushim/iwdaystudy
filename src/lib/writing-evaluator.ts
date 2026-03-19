/**
 * 순수 코드 기반 글쓰기 평가 엔진 v3 (API 없음, 외부 전송 없음)
 * 초등학생 개인정보 보호 준수
 *
 * v3 변경사항:
 * - 쓰레기 텍스트(ㅋㅋ, ㅎㅎ, 자음/모음 도배, 연속 반복) 필터링
 * - 복붙 문장 감지 (유사도 기반)
 * - 의미 있는 단어 비율 측정
 * - 마무리 완성도 평가
 * - 학년별 세분화된 피드백
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
  '외롭', '답답', '후회', '감사', '고마', '미안', '속상', '든든', '편안', '불안',
];

// ── 구체적 묘사어 (색·크기·감각) ─────────────────────────────
const DESCRIPTIVE_WORDS = [
  '빨간', '파란', '노란', '초록', '흰', '검은', '분홍', '보라', '하늘색', '갈색',
  '크', '작', '넓', '좁', '높', '낮', '길', '짧', '두껍', '얇', '무거', '가볍',
  '맛있', '달콤', '쓴', '짠', '시큼', '매운', '향기', '냄새',
  '시끄럽', '조용', '부드럽', '딱딱', '차갑', '뜨겁', '따뜻', '시원', '촉촉',
  '빠르', '느리', '밝', '어둡', '깨끗', '더럽', '예쁜', '아름다', '멋진', '귀여',
  '새로', '오래된', '신선', '상쾌', '포근', '싱싱', '축축', '건조',
];

// ── 시간 표현 (서사 구조 지표) ────────────────────────────────
const TIME_EXPRESSIONS = [
  '오늘', '어제', '내일', '아침', '점심', '저녁', '밤',
  '방금', '아까', '나중에', '그때', '옛날', '지금',
  '월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일',
  '봄', '여름', '가을', '겨울', '방학', '주말',
];

// ── 장소 표현 ─────────────────────────────────────────────────
const PLACE_WORDS = [
  '학교', '집', '교실', '운동장', '도서관', '공원', '마트', '시장', '병원',
  '놀이터', '수영장', '바다', '산', '강', '숲', '마을', '거리', '길',
  '방', '부엌', '거실', '화장실', '계단', '옥상', '지하',
];

// ── 마무리 표현 (결론/끝맺음) ──────────────────────────────────
const ENDING_PATTERNS = [
  '것 같다', '것 같아', '것 같습니다',
  '좋겠다', '좋겠어', '좋겠습니다',
  '하고 싶다', '하고 싶어', '하고 싶습니다',
  '기억에 남', '잊지 못',
  '행복했', '즐거웠', '재미있었', '뿌듯했', '감사했',
  '다음에도', '앞으로', '나중에',
  '배웠다', '배웠어', '알게 되었', '알았다', '알았어',
  '노력하겠', '노력할',
  '그런 하루', '그런 날', '좋은 하루', '좋은 날',
  '끝', '이상입니다', '마칩니다',
];

// ── 도입 표현 (글 시작) ───────────────────────────────────────
const OPENING_PATTERNS = [
  '오늘은', '오늘', '어제', '내일', '나는', '저는', '우리',
  '가장', '제일', '정말', '진짜',
  '만약', '혹시', '언제',
];

// ── 쓰레기 텍스트 패턴 ────────────────────────────────────────
// 자음/모음 단독 반복 (ㅋㅋㅋ, ㅎㅎㅎ, ㅠㅠ, ㅜㅜ 등)
const JAMO_REPEAT_REGEX = /[ㄱ-ㅎㅏ-ㅣ]{2,}/g;
// 같은 글자 3번 이상 연속 (아아아, 하하하하 등)
const CHAR_REPEAT_REGEX = /(.)\1{2,}/g;
// 의미 없는 자음 나열 (ㅁㄴㅇㄹ, ㅋㅋㅋ 등)
const JAMO_ONLY_REGEX = /^[ㄱ-ㅎㅏ-ㅣ]+$/;
// 숫자만 나열
const NUMBER_ONLY_REGEX = /^\d+$/;
// 영어 알파벳만 (의미 없는 키보드 입력)
const ALPHA_GIBBERISH_REGEX = /^[a-zA-Z]{5,}$/;

// ── 헬퍼: 쓰레기 텍스트 정리 (유효 글자 수 산출용) ──────────
function cleanJunkText(text: string): string {
  let cleaned = text;
  // 자음/모음 반복 제거 (ㅋㅋㅋ → 빈 문자열)
  cleaned = cleaned.replace(JAMO_REPEAT_REGEX, '');
  // 같은 글자 3연속 이상 → 1개로 축소 (아아아아 → 아)
  cleaned = cleaned.replace(CHAR_REPEAT_REGEX, '$1');
  // 연속 공백 정리
  cleaned = cleaned.replace(/\s{2,}/g, ' ');
  return cleaned.trim();
}

// ── 헬퍼: 의미있는 단어 추출 (2자 이상, 자모 제외) ──────────
function extractWords(text: string): string[] {
  return text
    .replace(/[^\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318Fa-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2)
    .filter(w => !JAMO_ONLY_REGEX.test(w))       // 자음만인 단어 제외
    .filter(w => !NUMBER_ONLY_REGEX.test(w))      // 숫자만인 단어 제외
    .filter(w => !ALPHA_GIBBERISH_REGEX.test(w)); // 의미없는 영문 제외
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

// ── 헬퍼: 두 문장의 유사도 (0~1, 높을수록 비슷) ──────────────
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

// ── 헬퍼: 복붙/반복 문장 감지 ────────────────────────────────
function detectDuplicateSentences(sentences: string[]): number {
  if (sentences.length <= 1) return 0;
  let duplicates = 0;
  for (let i = 0; i < sentences.length; i++) {
    for (let j = i + 1; j < sentences.length; j++) {
      // 완전 동일 또는 80% 이상 유사
      if (sentences[i] === sentences[j] || sentenceSimilarity(sentences[i], sentences[j]) >= 0.8) {
        duplicates++;
      }
    }
  }
  return duplicates;
}

// ── 헬퍼: 쓰레기 비율 (전체 대비 쓰레기 문자 비율) ───────────
function junkRatio(original: string, cleaned: string): number {
  if (original.length === 0) return 0;
  const junkChars = original.length - cleaned.length;
  return junkChars / original.length;
}

// ── 헬퍼: 끝맺음 여부 체크 ───────────────────────────────────
function hasProperEnding(text: string): boolean {
  const lastPart = text.slice(-60); // 마지막 60자
  return ENDING_PATTERNS.some(p => lastPart.includes(p))
    || /[.!?]$/.test(text.trim()); // 구두점으로 끝나는 경우
}

// ── 헬퍼: 도입부 체크 ────────────────────────────────────────
function hasProperOpening(text: string): boolean {
  const firstPart = text.slice(0, 30); // 처음 30자
  return OPENING_PATTERNS.some(p => firstPart.includes(p));
}

/**
 * 글쓰기 평가 (총 10점)
 * @param text     학생이 쓴 글
 * @param minChars 최소 글자 수
 */
export function evaluateWriting(text: string, minChars: number): WritingEvalResult {
  const clean = text.trim();
  const cleaned = cleanJunkText(clean);
  const effectiveCharCount = cleaned.length;  // 쓰레기 제거 후 유효 글자 수
  const sentences = splitSentences(cleaned);
  const words = extractWords(cleaned);
  const uniqueWords = new Set(words);
  const jRatio = junkRatio(clean, cleaned);

  // ── A. 글자 수 (0~3점) ──────────────────────────────────────
  // 유효 글자 수 기준 (쓰레기 텍스트 제외)
  let lengthScore = 0;
  if (effectiveCharCount >= minChars)             lengthScore = 1;
  if (effectiveCharCount >= minChars * 1.6)       lengthScore = 2;
  if (effectiveCharCount >= minChars * 2.5)       lengthScore = 3;

  // 쓰레기 비율이 40% 이상이면 글자수 최대 1점
  if (jRatio >= 0.4) lengthScore = Math.min(lengthScore, 1);
  // 쓰레기 비율이 60% 이상이면 0점
  if (jRatio >= 0.6) lengthScore = 0;

  // ── B. 문장 구성 (0~2점) ────────────────────────────────────
  const validSentences = sentences.filter(s => s.length >= 5);
  const duplicateCount = detectDuplicateSentences(validSentences);
  // 유효 문장 = 전체 유효 문장 - 중복 문장
  const effectiveSentenceCount = Math.max(0, validSentences.length - duplicateCount);

  let sentenceScore = 0;
  if (effectiveSentenceCount >= 1) sentenceScore = 1;
  if (effectiveSentenceCount >= 3) sentenceScore = 2;

  // 중복 문장이 절반 이상이면 감점
  if (validSentences.length > 0 && duplicateCount >= validSentences.length / 2) {
    sentenceScore = Math.min(sentenceScore, 1);
  }
  // 거의 전부 복붙이면 0점
  if (validSentences.length > 1 && duplicateCount >= validSentences.length - 1) {
    sentenceScore = 0;
  }

  // ── C. 어휘 다양성 (0~3점) ──────────────────────────────────
  let varietyScore = 0;
  if (words.length > 0) {
    const uniqueRatio = uniqueWords.size / words.length;
    const freq = wordFrequency(words);

    // 같은 단어 3회 이상 반복 개수
    const repeatCount = Object.values(freq).filter(c => c >= 3).length;
    const hasExcessRepeat = repeatCount >= 2; // 3회 반복 단어가 2개 이상

    // 감정어·묘사어 포함 여부
    const emotionCount = EMOTION_WORDS.filter(e => cleaned.includes(e)).length;
    const descriptiveCount = DESCRIPTIVE_WORDS.filter(d => cleaned.includes(d)).length;
    const hasEmotion     = emotionCount >= 1;
    const hasDescriptive = descriptiveCount >= 1;
    const hasRichVocab   = hasEmotion || hasDescriptive;

    // 시간/장소 표현 (구체성 지표)
    const hasTimeExpr  = TIME_EXPRESSIONS.some(t => cleaned.includes(t));
    const hasPlaceExpr = PLACE_WORDS.some(p => cleaned.includes(p));

    // 기본 점수
    if (uniqueWords.size >= 5  || uniqueRatio >= 0.50) varietyScore = 1;
    if (uniqueWords.size >= 10 || uniqueRatio >= 0.60) varietyScore = 2;

    // 3점 조건: 풍부한 어휘 + 감정/묘사 + 과도 반복 없음
    if ((uniqueWords.size >= 14 || uniqueRatio >= 0.70) && hasRichVocab && !hasExcessRepeat) varietyScore = 3;
    // 어휘가 매우 풍부하면 감정어 없어도 3점
    if (uniqueWords.size >= 20 && uniqueRatio >= 0.75 && !hasExcessRepeat) varietyScore = 3;
    // 감정 + 묘사 + 시간 + 장소 모두 있으면 어휘 12개만 되어도 3점
    if (uniqueWords.size >= 12 && hasEmotion && hasDescriptive && (hasTimeExpr || hasPlaceExpr) && !hasExcessRepeat) varietyScore = 3;

    // 반복 과다 시 패널티
    if (hasExcessRepeat) varietyScore = Math.min(varietyScore, 1);
    // 3회 반복 단어가 4개 이상이면 0점
    if (repeatCount >= 4) varietyScore = 0;
  }

  // ── D. 내용 구조 (0~2점) ────────────────────────────────────
  // 접속사 종류별 그룹 수 (최대 6 그룹)
  const conjGroups = [
    CONJ_REASON, CONJ_ORDER, CONJ_CONTRAST,
    CONJ_ADD, CONJ_RESULT, CONJ_EXAMPLE,
  ].filter(group => group.some(c => cleaned.includes(c))).length;

  // 단락 수 (줄바꿈 기준, 5자 이상)
  const paragraphs = cleaned.split(/\n+/).filter(p => p.trim().length >= 5).length;

  // 마무리/도입 체크
  const hasEnding  = hasProperEnding(cleaned);
  const hasOpening = hasProperOpening(cleaned);

  let structureScore = 0;
  // 1점: 접속사 1종 이상 또는 유효 문장 3개 이상 또는 (도입+마무리 모두 있음)
  if (conjGroups >= 1 || effectiveSentenceCount >= 3 || (hasOpening && hasEnding)) structureScore = 1;
  // 2점: 접속사 2종 이상 또는 (접속사+단락구분) 또는 (접속사+마무리) 또는 (도입+접속사+마무리)
  if (
    conjGroups >= 2 ||
    (conjGroups >= 1 && paragraphs >= 2) ||
    (conjGroups >= 1 && hasEnding && effectiveSentenceCount >= 3) ||
    (hasOpening && conjGroups >= 1 && hasEnding)
  ) structureScore = 2;

  // 중복 문장이 많으면 구조 점수도 감점
  if (validSentences.length > 1 && duplicateCount >= validSentences.length / 2) {
    structureScore = Math.min(structureScore, 1);
  }

  // ── 합산 ────────────────────────────────────────────────────
  const total = Math.min(10, lengthScore + sentenceScore + varietyScore + structureScore);
  const stars = total <= 2 ? 1 : total <= 4 ? 2 : total <= 6 ? 3 : total <= 8 ? 4 : 5;

  // ── 칭찬 피드백 (점수 구간별, 더 세분화) ────────────────────
  const FEEDBACKS: [number, string][] = [
    [10, '와! 완벽한 글이에요! 작가가 될 수 있겠어요!'],
    [9,  '대단해요! 정말 잘 쓴 글이에요!'],
    [7,  '훌륭해요! 생각을 멋지게 표현했어요!'],
    [5,  '잘 썼어요! 느낌이 잘 전달돼요!'],
    [3,  '잘 시작했어요! 조금만 더 써볼까요?'],
    [1,  '좋은 시작이에요! 한 문장씩 더 써봐요!'],
    [0,  '도전했어요! 떠오르는 대로 써봐요!'],
  ];
  const feedback = FEEDBACKS.find(([min]) => total >= min)![1];

  // ── 개선 팁 (가장 점수 낮은 항목 + 구체적 안내) ─────────────
  const tips: { ratio: number; tip: string }[] = [];

  // 쓰레기 텍스트 경고
  if (jRatio >= 0.3) {
    tips.push({ ratio: -1, tip: '"ㅋㅋ"이나 같은 글자 반복 대신, 느낀 점을 문장으로 써봐요!' });
  }
  // 복붙 경고
  if (duplicateCount >= 2) {
    tips.push({ ratio: -1, tip: '같은 문장을 반복하지 말고, 새로운 내용을 써봐요!' });
  }

  // 항목별 팁
  if (lengthScore < 3) {
    const needed = Math.max(0, Math.ceil(minChars * 1.6) - effectiveCharCount);
    tips.push({
      ratio: lengthScore / 3,
      tip: needed > 0 ? `${needed}자만 더 쓰면 점수가 올라가요!` : '조금만 더 길게 써봐요!'
    });
  }
  if (sentenceScore < 2) {
    tips.push({
      ratio: sentenceScore / 2,
      tip: '마침표(.)로 문장을 나눠서 3문장 이상 써봐요!'
    });
  }
  if (varietyScore < 3) {
    const emotionUsed = EMOTION_WORDS.some(e => cleaned.includes(e));
    const descUsed = DESCRIPTIVE_WORDS.some(d => cleaned.includes(d));
    if (!emotionUsed && !descUsed) {
      tips.push({ ratio: varietyScore / 3, tip: '"기뻤다", "빨간", "따뜻한" 같은 감정·묘사 표현을 넣어봐요!' });
    } else if (!emotionUsed) {
      tips.push({ ratio: varietyScore / 3, tip: '"기쁘다", "신나다" 같은 감정 표현을 추가해봐요!' });
    } else if (!descUsed) {
      tips.push({ ratio: varietyScore / 3, tip: '색깔, 크기, 느낌 같은 묘사 단어를 써봐요!' });
    } else {
      tips.push({ ratio: varietyScore / 3, tip: '같은 단어를 줄이고 다양한 표현을 써봐요!' });
    }
  }
  if (structureScore < 2) {
    if (!hasEnding) {
      tips.push({ ratio: structureScore / 2, tip: '마지막에 "~것 같다", "~하고 싶다" 같은 마무리를 넣어봐요!' });
    } else if (conjGroups === 0) {
      tips.push({ ratio: structureScore / 2, tip: '"그래서", "왜냐하면", "하지만" 같은 연결어를 넣어봐요!' });
    } else {
      tips.push({ ratio: structureScore / 2, tip: '줄바꿈으로 단락을 나눠봐요!' });
    }
  }

  // 가장 낮은 비율 항목 선택 (쓰레기/복붙 경고 우선)
  const sorted = tips.sort((a, b) => a.ratio - b.ratio);
  const tip = sorted.length > 0
    ? sorted[0].tip
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
