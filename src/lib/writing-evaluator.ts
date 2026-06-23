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

// ── 조사 (어절 끝 분리용 - 경량 형태 전처리) ───────────────────
// 형태소 분석기 없이(오프라인·프라이버시 유지) 어절 끝 조사를 규칙으로 떼어
// 내용어 판별·주제 관련성 매칭·prose 판정에 사용한다.
const JOSA_MULTI = [
  "으로부터", "에서는", "에게서", "으로서", "으로써", "에게는", "이라고",
  "이라는", "에서", "에게", "한테", "께서", "으로", "처럼", "보다", "까지",
  "부터", "조차", "마다", "밖에", "라고", "라는", "이랑", "이나",
];
const JOSA_SINGLE = [
  "은", "는", "이", "가", "을", "를", "에", "와", "과", "의", "도", "만",
  "로", "랑",
];

// 내용 매칭용: 짧은 명사 보호(2자 이하는 단일 조사 분리 안 함)
function stripJosa(word: string): string {
  for (const j of JOSA_MULTI) {
    if (word.length > j.length && word.endsWith(j)) return word.slice(0, -j.length);
  }
  if (word.length >= 3) {
    for (const j of JOSA_SINGLE) {
      if (word.endsWith(j)) return word.slice(0, -1);
    }
  }
  return word;
}

// prose 판정용: 어절이 조사로 끝나는지(짧은 어절도 적극 인정 - 오탐은 안전한 방향)
function endsWithJosa(word: string): boolean {
  for (const j of JOSA_MULTI) {
    if (word.length > j.length && word.endsWith(j)) return true;
  }
  for (const j of JOSA_SINGLE) {
    if (word.length > j.length && word.endsWith(j)) return true;
  }
  return false;
}

// 조사 부착 비율(prose-ness): 키워드 나열(조사 없는 단어 나열) 탐지용
function josaRatio(words: string[]): number {
  if (words.length === 0) return 0;
  return words.filter(endsWithJosa).length / words.length;
}

// ── 대명사·지시어·접속부사 어간 (의미 밀도 계산용) ─────────────
const FUNCTION_STEMS = new Set([
  ...FUNCTION_WORDS,
  "그것", "이것", "저것", "여기", "거기", "저기", "그곳", "이곳", "무엇",
  "누구", "어디", "언제", "그리고", "그래서", "그러나", "하지만", "그런데",
  "그러므로", "따라서", "또한", "그러면", "그리하여",
]);

// ── 흔한 이모티콘 자모 (gibberish 오탐 방지: ㅋㅋ·ㅎㅎ·ㅠㅠ 등) ──
function stripEmoticons(text: string): string {
  return text
    .replace(/[ㅋㅎㅠㅜ]+/g, " ")
    .replace(/[ㅗㅡ]{2,}/g, " ");
}

// ── 학년대 (minChars로 추정: 20=저, 50=중, 100=고) ─────────────
type GradeBand = "low" | "mid" | "high";
function gradeBandFromMinChars(minChars: number): GradeBand {
  if (minChars <= 25) return "low";
  if (minChars <= 70) return "mid";
  return "high";
}

// ── 주제(프롬프트) 키워드 추출 + 본문 관련성 ───────────────────
const PROMPT_STOPWORDS = new Set([
  "자유", "자유롭게", "대해", "대한", "대하여", "관해", "관한", "무엇",
  "어떤", "생각", "느낀", "느낌", "오늘", "이야기", "문장", "적어",
  "적어보", "글쓰기", "주제", "써보", "보세요", "하세요", "해보", "쓰기",
  "내용", "여러분", "우리", "나의", "너의", "자신", "경험",
]);
function extractPromptKeywords(prompt: string): string[] {
  const ws = extractWords(prompt)
    .map(stripJosa)
    .filter((w) => w.length >= 2 && !PROMPT_STOPWORDS.has(w));
  return [...new Set(ws)];
}
// 본문 어간이 프롬프트 키워드를 얼마나 다루는지 (0~1 coverage)
function topicRelevance(essayStems: Set<string>, keywords: string[]): number {
  if (keywords.length < 2) return 1; // 자유주제/짧은 프롬프트 → 관련성 평가 안 함
  let hit = 0;
  for (const k of keywords) {
    for (const s of essayStems) {
      if (s === k || (s.length >= 2 && k.includes(s)) || s.includes(k)) {
        hit++;
        break;
      }
    }
  }
  return hit / keywords.length;
}

// ── 흔한 어미 패턴 (다양성 측정용) ─────────────────────────────
// 구체(긴) 패턴을 앞에 두어 일반 /다/·/요/에 의한 섀도잉을 방지한다.
const ENDING_SUFFIXES = [
  /거든요[.\s!?~]*$/,
  /잖아요[.\s!?~]*$/,
  /답니다[.\s!?~]*$/,
  /습니다[.\s!?~]*$/,
  /ㅂ니다[.\s!?~]*$/,
  /었다[.\s!?~]*$/,
  /았다[.\s!?~]*$/,
  /였다[.\s!?~]*$/,
  /했다[.\s!?~]*$/,
  /ㄴ다[.\s!?~]*$/,
  /네요[.\s!?~]*$/,
  /어요[.\s!?~]*$/,
  /아요[.\s!?~]*$/,
  /래요[.\s!?~]*$/,
  /데요[.\s!?~]*$/,
  /지요[.\s!?~]*$/,
  /세요[.\s!?~]*$/,
  /까요[.\s!?~]*$/,
  /죠[.\s!?~]*$/,
  /요[.\s!?~]*$/,
  /다[.\s!?~]*$/,
];

// ── 쓰레기 텍스트 패턴 ────────────────────────────────────────
const JAMO_REPEAT_REGEX = /[ㄱ-ㅎㅏ-ㅣ]{2,}/g;
const CHAR_REPEAT_REGEX = /(.)\1{2,}/g;
const JAMO_ONLY_REGEX = /^[ㄱ-ㅎㅏ-ㅣ]+$/;
const NUMBER_ONLY_REGEX = /^\d+$/;
const ALPHA_GIBBERISH_REGEX = /^[a-zA-Z]{5,}$/;
const JAMO_ANY_REGEX = /[ㄱ-ㅎㅏ-ㅣ]/g;
const KOREAN_SYLLABLE_REGEX = /[가-힣]/g;
const CHAR_LONG_REPEAT_REGEX = /(.)\1{4,}/;

// ── 헬퍼 함수들 ────────────────────────────────────────────────

/**
 * 하드 gibberish 감지: 명백히 장난·무의미 텍스트인지 판단
 * 걸리면 총점 0으로 강제 확정
 */
function isHardGibberish(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length === 0) return true;
  // 흔한 이모티콘(ㅋㅋ·ㅎㅎ·ㅠㅠ)은 비율 판정에서 제외 → 정상 아동글 오탐 방지
  const deEmo = stripEmoticons(trimmed);
  const chars = deEmo.replace(/\s/g, "");
  if (chars.length === 0) return true; // 이모티콘/공백만 있으면 장난

  // 1) 자모(ㄱ-ㅎ, ㅏ-ㅣ) 비율이 15% 이상이면 장난
  const jamoMatch = chars.match(JAMO_ANY_REGEX);
  const jamoCount = jamoMatch ? jamoMatch.length : 0;
  if (jamoCount / chars.length >= 0.15) return true;

  // 2) 완성형 한글이 30% 미만이면 장난
  const koreanMatch = chars.match(KOREAN_SYLLABLE_REGEX);
  const koreanCount = koreanMatch ? koreanMatch.length : 0;
  if (koreanCount / chars.length < 0.3) return true;

  // 3) 같은 글자가 5회 이상 연속 반복
  if (CHAR_LONG_REPEAT_REGEX.test(chars)) return true;

  // 4) 공백 없는 긴 덩어리 (한 단어만 15자+) — 단, 정상 한글 문장의
  //    띄어쓰기 누락은 장난이 아니므로 완성형 한글 비율이 낮을 때만 차단
  const tokens = trimmed.split(/\s+/).filter((w) => w.length >= 1);
  if (
    trimmed.length >= 15 &&
    tokens.length < 2 &&
    koreanCount / chars.length < 0.6
  ) {
    return true;
  }

  // 5) 한 토큰이 전체의 70% 이상 (오늘 오늘 오늘 …)
  if (tokens.length >= 4) {
    const freq: Record<string, number> = {};
    for (const tk of tokens) freq[tk] = (freq[tk] || 0) + 1;
    const maxFreq = Math.max(...Object.values(freq));
    if (maxFreq / tokens.length >= 0.7) return true;
  }

  return false;
}

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

// 문장 평균 길이 점수 (너무 짧으면 감점, 학년대별 기준)
function avgSentenceLengthScore(
  sentences: string[],
  band: GradeBand,
): number {
  if (sentences.length === 0) return 0;
  const avgLen =
    sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
  // 저학년은 짧은 문장에 관대, 고학년은 더 긴 문장 기대
  const [lo, hi] =
    band === "low" ? [3, 9] : band === "mid" ? [4, 13] : [5, 16];
  return smoothScore(avgLen, lo, hi, 1);
}

// 의미 밀도 (기능어·조사·지시어·접속부사 제외한 내용어 비율)
function contentDensity(words: string[]): number {
  if (words.length === 0) return 0;
  const contentWords = words.filter((w) => {
    const stem = stripJosa(w);
    return (
      stem.length >= 1 &&
      !FUNCTION_WORDS.includes(w) &&
      !FUNCTION_STEMS.has(stem)
    );
  });
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
 * 글쓰기 평가 (총 10점) - v6 정교한 평가 + 하드 gibberish 감지
 */
export function evaluateWriting(
  text: string,
  minChars: number,
  options?: { prompt?: string },
): WritingEvalResult {
  const clean = text.trim();

  // 하드 gibberish 체크: 장난 텍스트는 즉시 0점 확정
  if (isHardGibberish(clean)) {
    return {
      score: 0,
      stars: 1,
      feedback: "의미 있는 글을 써야 점수를 받을 수 있어요!",
      tip: "한글로 완성된 문장을 써봐요. 예: \"오늘은 학교에서 친구랑 놀았다.\"",
      details: { length: 0, sentences: 0, variety: 0, structure: 0 },
    };
  }

  const cleaned = cleanJunkText(clean);
  const effectiveCharCount = cleaned.length;
  const sentences = splitSentences(cleaned);
  const words = extractWords(cleaned);
  const uniqueWords = new Set(words);
  const jRatio = junkRatio(clean, cleaned);

  // 학년대(저/중/고) — minChars로 추정
  const band = gradeBandFromMinChars(minChars);

  // 키워드 스터핑 게이트: 조사 없는 단어 나열(prose-ness 낮음) 탐지.
  // 단, 구두점/줄바꿈이 있는 글(시·구어체 포함)은 제외해 오탐 방지.
  const prose = josaRatio(words);
  const punctCount = (cleaned.match(/[.!?\n]/g) || []).length;
  const isWordList = words.length >= 8 && prose < 0.15 && punctCount < 2;

  // 주제 관련성: 프롬프트가 구체적(키워드 2개+)일 때만 평가
  const promptKeywords = options?.prompt
    ? extractPromptKeywords(options.prompt)
    : [];
  const essayStems = new Set(
    words.map(stripJosa).filter((w) => w.length >= 2),
  );
  const relevanceCoverage =
    promptKeywords.length >= 2 ? topicRelevance(essayStems, promptKeywords) : 1;

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

  // 문장 평균 길이 보정 (너무 짧은 문장 나열 시 감점, 학년대 반영)
  const avgLenFactor = avgSentenceLengthScore(validSentences, band);
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

    // 기본 점수: 고유 단어 수 기반 (학년대별 — 저학년은 적은 어휘에 관대)
    const varietyCap = band === "low" ? 11 : band === "mid" ? 15 : 18;
    varietyScore = smoothScore(uniqueWords.size, 3, varietyCap, 3);

    // 보너스: 감정어, 묘사어, 시간/장소 (최대 +0.6)
    let bonus = 0;
    if (emotionCount >= 1) bonus += 0.15;
    if (emotionCount >= 2) bonus += 0.1;
    if (descriptiveCount >= 1) bonus += 0.15;
    if (descriptiveCount >= 2) bonus += 0.1;
    if (hasTimeExpr) bonus += 0.05;
    if (hasPlaceExpr) bonus += 0.05;
    // 스터핑 방어: 키워드 보너스는 실제 문장에 담겼을 때만(문장 수 비례) 인정,
    // 조사 없는 단어 나열(word-list)이면 보너스 0
    bonus = Math.min(bonus, effectiveSentenceCount * 0.2);
    if (isWordList) bonus = 0;
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

  // ── 하드 캡 (의미 빈약한 글은 고점 차단) ───────────────────
  let rawTotal = lengthScore + sentenceScore + varietyScore + structureScore;

  // 0) 키워드 나열(조사 없는 단어 나열)이면 최대 2점 — 스터핑 차단
  if (isWordList) {
    rawTotal = Math.min(rawTotal, 2);
  }

  // 1) 유효 단어 3개 미만이면 최대 2점 (내용 빈약)
  if (uniqueWords.size < 3) {
    rawTotal = Math.min(rawTotal, 2);
  }

  // 2) 쓰레기 비율 20% 이상이면 최대 3점
  if (jRatio >= 0.2) {
    rawTotal = Math.min(rawTotal, 3);
  }

  // 3) 의미 밀도 30% 미만이면 최대 3점 (기능어·조사만 가득)
  const finalDensity = contentDensity(words);
  if (words.length >= 5 && finalDensity < 0.3) {
    rawTotal = Math.min(rawTotal, 3);
  }

  // 4) 한 토큰이 전체의 50% 이상 반복이면 최대 3점
  if (words.length >= 5) {
    const tokenFreq: Record<string, number> = {};
    for (const w of words) tokenFreq[w] = (tokenFreq[w] || 0) + 1;
    const maxTokenFreq = Math.max(...Object.values(tokenFreq));
    if (maxTokenFreq / words.length >= 0.5) {
      rawTotal = Math.min(rawTotal, 3);
    }
  }

  // 5) 강한 패턴 반복(3회+)이면 최대 4점
  const strongPatternRep = detectPatternRepetition(cleaned);
  if (strongPatternRep >= 3) {
    rawTotal = Math.min(rawTotal, 4);
  }

  // 6) 최소 글자 수 절반 미만이면 최대 3점
  if (effectiveCharCount < minChars * 0.5) {
    rawTotal = Math.min(rawTotal, 3);
  }

  // 주제 이탈 완만 감점 (구체 프롬프트일 때만, coverage 0→×0.75 / ≥0.2→×1.0)
  if (promptKeywords.length >= 2 && words.length >= 6) {
    const relevanceFactor =
      relevanceCoverage >= 0.2 ? 1 : 0.75 + relevanceCoverage;
    rawTotal = rawTotal * relevanceFactor;
  }

  // ── 합산 ────────────────────────────────────────────────────
  const total = Math.max(0, Math.min(10, rawTotal));
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

  // 단어 나열·주제 이탈 경고 최우선
  if (isWordList) {
    tips.push({
      ratio: -3,
      tip: "낱말만 늘어놓지 말고, 문장으로 이어서 써봐요!",
    });
  }
  if (promptKeywords.length >= 2 && words.length >= 6 && relevanceCoverage < 0.2) {
    tips.push({
      ratio: -2.5,
      tip: "글감(주제)에 어울리는 내용을 더 써봐요!",
    });
  }

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

  // 문장 길이 경고 (학년대별 기준 — 저학년은 짧은 문장 허용)
  if (validSentences.length >= 2) {
    const avgLen =
      validSentences.reduce((s, sent) => s + sent.length, 0) /
      validSentences.length;
    const shortThreshold = band === "low" ? 6 : band === "mid" ? 8 : 10;
    if (avgLen < shortThreshold) {
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
