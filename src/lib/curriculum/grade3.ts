import type { SpellingEntry, VocabEntry, KnowledgeEntry, SafetyEntry, MathEntry, HanjaEntry, EnglishEntry } from '@/types/curriculum';

// 3학년 1학기 교육과정 성취기준
export const grade3Semester1Standards = {
  math: [
    { code: "[2수01-14]", desc: "네 자리 이하의 수의 범위에서 덧셈과 뺄셈을 할 수 있다", unit: "덧셈과 뺄셈", difficulty: 3, weeks: [1, 4] as [number, number] },
    { code: "[2수01-15]", desc: "곱셈과 나눗셈의 관계를 이해한다", unit: "나눗셈", difficulty: 3, weeks: [5, 8] as [number, number] },
    { code: "[2수02-03]", desc: "평면도형의 이동을 이해한다", unit: "평면도형", difficulty: 3, weeks: [9, 11] as [number, number] },
    { code: "[2수03-04]", desc: "시간의 덧셈과 뺄셈을 할 수 있다", unit: "시간과 길이", difficulty: 3, weeks: [12, 14] as [number, number] },
    { code: "[2수01-16]", desc: "두 자리 수의 곱셈을 할 수 있다", unit: "곱셈", difficulty: 3, weeks: [14, 16] as [number, number] },
  ],
  korean: [
    { code: "[4국01-01]", desc: "대화의 즐거움을 알고 대화를 나눈다", unit: "대화", difficulty: 3, weeks: [1, 3] as [number, number] },
    { code: "[4국02-01]", desc: "문단과 글의 중심 생각을 파악한다", unit: "중심 생각", difficulty: 3, weeks: [4, 7] as [number, number] },
    { code: "[4국03-01]", desc: "중심 문장과 뒷받침 문장을 갖추어 글을 쓴다", unit: "문단 쓰기", difficulty: 3, weeks: [8, 11] as [number, number] },
    { code: "[4국04-01]", desc: "낱말을 분류하고 국어사전에서 찾는다", unit: "국어사전", difficulty: 3, weeks: [12, 14] as [number, number] },
  ],
  english: [
    { code: "[4영01-01]", desc: "알파벳 대소문자를 식별하고 읽을 수 있다", unit: "Alphabet", difficulty: 3, weeks: [1, 4] as [number, number] },
    { code: "[4영02-01]", desc: "쉽고 간단한 낱말이나 어구를 듣고 의미를 이해한다", unit: "Listening", difficulty: 3, weeks: [5, 8] as [number, number] },
    { code: "[4영03-01]", desc: "알파벳 대소문자를 쓸 수 있다", unit: "Writing", difficulty: 3, weeks: [9, 12] as [number, number] },
  ],
};

export const grade3Semester2Standards = {
  math: [
    { code: "[2수01-17]", desc: "분수를 이해하고 읽고 쓸 수 있다", unit: "분수와 소수", difficulty: 3, weeks: [1, 4] as [number, number] },
    { code: "[2수01-18]", desc: "단위분수의 크기를 비교할 수 있다", unit: "분수와 소수", difficulty: 3, weeks: [1, 4] as [number, number] },
    { code: "[2수02-04]", desc: "원의 구성 요소를 이해하고 원을 그릴 수 있다", unit: "원", difficulty: 3, weeks: [5, 7] as [number, number] },
    { code: "[2수03-05]", desc: "들이의 단위를 알고 어림하여 재어 볼 수 있다", unit: "들이와 무게", difficulty: 3, weeks: [8, 10] as [number, number] },
    { code: "[2수04-03]", desc: "자료를 수집하여 그림그래프로 나타내고 해석할 수 있다", unit: "자료 정리", difficulty: 3, weeks: [11, 14] as [number, number] },
  ],
  korean: [
    { code: "[4국01-02]", desc: "회의에서 의견을 적극적으로 교환한다", unit: "토의", difficulty: 3, weeks: [1, 3] as [number, number] },
    { code: "[4국02-02]", desc: "글의 유형을 고려하여 대강의 내용을 간추린다", unit: "요약하기", difficulty: 3, weeks: [4, 7] as [number, number] },
    { code: "[4국05-01]", desc: "감각적 표현에 주의하며 작품을 감상한다", unit: "문학 감상", difficulty: 3, weeks: [8, 11] as [number, number] },
  ],
  english: [
    { code: "[4영01-02]", desc: "쉽고 간단한 인사말을 듣고 이해할 수 있다", unit: "Greetings", difficulty: 3, weeks: [1, 4] as [number, number] },
    { code: "[4영02-02]", desc: "한두 문장으로 자기소개를 할 수 있다", unit: "Self Introduction", difficulty: 3, weeks: [5, 8] as [number, number] },
  ],
};

export const grade3SpellingData: SpellingEntry[] = [
  { q1: "오늘 날씨가 되게 좋다.", q2: "오늘 날씨가 되개 좋다.", answer: 1, explanation: "'되게'는 '매우'의 뜻인 부사입니다." },
  { q1: "반드시 숙제를 해야 한다.", q2: "반듯이 숙제를 해야 한다.", answer: 1, explanation: "'반드시'는 '꼭'의 뜻이고, '반듯이'는 '바르게'의 뜻입니다." },
  { q1: "노란색 꽃이 아름답다.", q2: "노란색 꽃이 아름답따.", answer: 1, explanation: "'아름답다'에서 '-다'가 올바른 종결어미입니다." },
  { q1: "가르치다와 가리키다는 다르다.", q2: "가르키다와 가르치다는 다르다.", answer: 1, explanation: "'가르치다'(teach)와 '가리키다'(point)를 구분해야 합니다." },
  { q1: "부엌에서 요리했다.", q2: "부억에서 요리했다.", answer: 1, explanation: "'부엌'이 올바른 표기입니다." },
  { q1: "문을 잠갔다.", q2: "문을 잠궜다.", answer: 1, explanation: "'잠갔다'가 올바른 표기입니다." },
  { q1: "할머니를 뵈었다.", q2: "할머니를 봬었다.", answer: 1, explanation: "'뵈었다'가 올바른 표기입니다." },
  { q1: "며칠 동안 아팠다.", q2: "몇 일 동안 아팠다.", answer: 1, explanation: "'며칠'이 맞는 표현입니다." },
  { q1: "해돋이를 보러 갔다.", q2: "해돋이를 보러 갔따.", answer: 1, explanation: "'갔다'에서 '-다'가 올바른 종결어미입니다." },
  { q1: "다르다와 틀리다는 다른 뜻이다.", q2: "다르다와 틀리다는 같은 뜻이다.", answer: 1, explanation: "'다르다'는 차이가 있다는 뜻이고, '틀리다'는 잘못되었다는 뜻입니다." },
  { q1: "어이가 없다.", q2: "어의가 없다.", answer: 1, explanation: "'어이가 없다'가 올바른 표현입니다." },
  { q1: "개수를 세어 보자.", q2: "갯수를 세어 보자.", answer: 1, explanation: "'개수'가 올바른 표기입니다. 사이시옷을 넣지 않습니다." },
  { q1: "그녀는 금세 나아졌다.", q2: "그녀는 금새 나아졌다.", answer: 1, explanation: "'금세'(금시에의 줄임)가 올바른 표기입니다." },
  { q1: "일찍이 도착했다.", q2: "일찌기 도착했다.", answer: 1, explanation: "'일찍이'가 올바른 표기입니다." },
  { q1: "목걸이가 예쁘다.", q2: "목거리가 예쁘다.", answer: 1, explanation: "'목걸이'가 올바른 표기입니다." },
  { q1: "설겆이를 도왔다.", q2: "설거지를 도왔다.", answer: 2, explanation: "'설거지'가 올바른 표기입니다." },
  { q1: "곰곰히 생각했다.", q2: "곰곰이 생각했다.", answer: 2, explanation: "'-이'가 올바른 접미사입니다. '곰곰이'가 맞습니다." },
  { q1: "정성껏 만들었다.", q2: "정성것 만들었다.", answer: 1, explanation: "'정성껏'이 올바른 표기입니다." },
  { q1: "어떻게 해야 할까?", q2: "어떡게 해야 할까?", answer: 1, explanation: "'어떻게'가 올바른 표기입니다." },
  { q1: "웬일로 일찍 왔니?", q2: "왠일로 일찍 왔니?", answer: 1, explanation: "'웬'은 '어찌된'의 뜻이고, '왠'은 '왜인'의 줄임입니다." },
  { q1: "왠지 기분이 좋다.", q2: "웬지 기분이 좋다.", answer: 1, explanation: "'왠지'(왜인지)가 올바른 표기입니다." },
];

export const grade3VocabData: VocabEntry[] = [
  { meanings: ["나라를 다스리는 사람", "왕이라고도 해요"], answer: "임금" },
  { meanings: ["불을 끄는 사람", "빨간 차를 타요"], answer: "소방관" },
  { meanings: ["땅이 흔들리는 것", "건물이 무너질 수 있어요"], answer: "지진" },
  { meanings: ["물이 얼어서 된 것", "겨울에 볼 수 있어요"], answer: "고드름" },
  { meanings: ["높은 곳에서 물이 떨어지는 것", "자연 경관이에요"], answer: "폭포" },
  { meanings: ["하늘에서 빛이 번쩍이는 것", "천둥과 함께 와요"], answer: "번개" },
  { meanings: ["옛날이야기에 나오는 상상의 동물", "하늘을 날아요"], answer: "용" },
  { meanings: ["사물을 비추는 것", "내 모습이 보여요"], answer: "거울" },
  { meanings: ["지구를 작게 만든 모형", "둥근 모양이에요"], answer: "지구본" },
  { meanings: ["긴 줄 위를 걷는 것", "서커스에서 볼 수 있어요"], answer: "줄타기" },
  { meanings: ["나무로 만든 배", "물에 떠요"], answer: "뗏목" },
  { meanings: ["여러 사람이 함께 부르는 노래", "합창이라고도 해요"], answer: "합창" },
  { meanings: ["맛을 느끼는 기관", "입안에 있어요"], answer: "혀" },
  { meanings: ["하루 중 해가 가장 높이 뜨는 때", "12시쯤이에요"], answer: "정오" },
  { meanings: ["물건의 무거운 정도", "저울로 재요"], answer: "무게" },
];

export const grade3MathData: MathEntry[] = [
  // 세 자리 수 덧셈
  { type: "calculation", expression: "234 + 152", answer: 386, steps: ["4 + 2 = 6 (일의 자리)", "3 + 5 = 8 (십의 자리)", "2 + 1 = 3 (백의 자리)", "답: 386"], unit: "세 자리 수 덧셈" },
  { type: "calculation", expression: "367 + 245", answer: 612, steps: ["7 + 5 = 12, 일의 자리 2, 받아올림 1", "6 + 4 + 1 = 11, 십의 자리 1, 받아올림 1", "3 + 2 + 1 = 6 (백의 자리)", "답: 612"], unit: "세 자리 수 덧셈", hasCarry: true },
  { type: "calculation", expression: "589 + 327", answer: 916, steps: ["9 + 7 = 16, 일의 자리 6, 받아올림 1", "8 + 2 + 1 = 11, 십의 자리 1, 받아올림 1", "5 + 3 + 1 = 9 (백의 자리)", "답: 916"], unit: "세 자리 수 덧셈", hasCarry: true },
  // 세 자리 수 뺄셈
  { type: "calculation", expression: "745 - 312", answer: 433, steps: ["5 - 2 = 3 (일의 자리)", "4 - 1 = 3 (십의 자리)", "7 - 3 = 4 (백의 자리)", "답: 433"], unit: "세 자리 수 뺄셈" },
  { type: "calculation", expression: "623 - 158", answer: 465, steps: ["3에서 8을 뺄 수 없으므로 받아내림", "13 - 8 = 5 (일의 자리)", "1에서 5를 뺄 수 없으므로 받아내림", "11 - 5 = 6 (십의 자리)", "5 - 1 = 4 (백의 자리)", "답: 465"], unit: "세 자리 수 뺄셈", hasBorrow: true },
  // 두 자리 × 한 자리 곱셈
  { type: "calculation", expression: "23 × 4", answer: 92, steps: ["3 × 4 = 12, 일의 자리 2, 받아올림 1", "2 × 4 = 8, 8 + 1 = 9 (십의 자리)", "답: 92"], unit: "곱셈" },
  { type: "calculation", expression: "15 × 6", answer: 90, steps: ["5 × 6 = 30, 일의 자리 0, 받아올림 3", "1 × 6 = 6, 6 + 3 = 9 (십의 자리)", "답: 90"], unit: "곱셈" },
  { type: "calculation", expression: "34 × 7", answer: 238, steps: ["4 × 7 = 28, 일의 자리 8, 받아올림 2", "3 × 7 = 21, 21 + 2 = 23", "답: 238"], unit: "곱셈" },
  // 나눗셈
  { type: "calculation", expression: "12 ÷ 3", answer: 4, steps: ["12 안에 3이 4번 들어감", "3 × 4 = 12"], unit: "나눗셈", dividend: 12, divisor: 3, quotient: 4, remainder: 0 },
  { type: "calculation", expression: "20 ÷ 5", answer: 4, steps: ["20 안에 5가 4번 들어감", "5 × 4 = 20"], unit: "나눗셈", dividend: 20, divisor: 5, quotient: 4, remainder: 0 },
  { type: "calculation", expression: "35 ÷ 7", answer: 5, steps: ["35 안에 7이 5번 들어감", "7 × 5 = 35"], unit: "나눗셈", dividend: 35, divisor: 7, quotient: 5, remainder: 0 },
  { type: "calculation", expression: "17 ÷ 5", answer: 3, steps: ["17 안에 5가 3번 들어가고 2가 남음", "5 × 3 = 15, 나머지 2"], unit: "나머지가 있는 나눗셈", dividend: 17, divisor: 5, quotient: 3, remainder: 2 },
  { type: "calculation", expression: "23 ÷ 4", answer: 5, steps: ["23 안에 4가 5번 들어가고 3이 남음", "4 × 5 = 20, 나머지 3"], unit: "나머지가 있는 나눗셈", dividend: 23, divisor: 4, quotient: 5, remainder: 3 },
  // 분수
  { type: "calculation", expression: "1/4 + 1/4", answer: 2, steps: ["분모가 같으므로 분자끼리 더합니다", "1 + 1 = 2", "답: 2/4"], unit: "분수 덧셈", numbers: [1, 4, 1, 4] },
  { type: "calculation", expression: "3/5 - 1/5", answer: 2, steps: ["분모가 같으므로 분자끼리 뺍니다", "3 - 1 = 2", "답: 2/5"], unit: "분수 뺄셈", numbers: [3, 5, 1, 5] },
  // 시간 계산
  { type: "calculation", expression: "2시간 30분 + 1시간 40분", answer: 4, steps: ["30분 + 40분 = 70분 = 1시간 10분", "2시간 + 1시간 + 1시간 = 4시간", "답: 4시간 10분"], unit: "시간 계산" },
  { type: "calculation", expression: "3시간 20분 - 1시간 50분", answer: 1, steps: ["20분에서 50분을 뺄 수 없으므로 1시간을 빌려옴", "80분 - 50분 = 30분", "2시간 - 1시간 = 1시간", "답: 1시간 30분"], unit: "시간 계산" },
  { type: "calculation", expression: "48 ÷ 6", answer: 8, steps: ["48 안에 6이 8번 들어감", "6 × 8 = 48"], unit: "나눗셈", dividend: 48, divisor: 6, quotient: 8, remainder: 0 },
  { type: "calculation", expression: "56 ÷ 8", answer: 7, steps: ["56 안에 8이 7번 들어감", "8 × 7 = 56"], unit: "나눗셈", dividend: 56, divisor: 8, quotient: 7, remainder: 0 },
  { type: "calculation", expression: "42 × 3", answer: 126, steps: ["2 × 3 = 6 (일의 자리)", "4 × 3 = 12 (십의 자리)", "답: 126"], unit: "곱셈" },
];

export const grade3KnowledgeData: KnowledgeEntry[] = [
  { text: "우리나라의 국화는 ___이다.", answer: "무궁화", category: "사회" },
  { text: "태양계에는 ___개의 행성이 있다.", answer: "8", category: "과학" },
  { text: "식물의 뿌리가 하는 일은 물과 ___을 흡수하는 것이다.", answer: "양분", category: "과학" },
  { text: "우리 몸에서 음식을 소화하는 기관은 ___이다.", answer: "위", category: "과학" },
  { text: "나침반의 빨간 바늘은 항상 ___쪽을 가리킨다.", answer: "북", category: "과학" },
  { text: "세종대왕이 만든 우리나라의 글자는 ___이다.", answer: "한글", category: "역사" },
  { text: "지도에서 높은 곳은 ___색으로 표시한다.", answer: "갈", category: "사회" },
  { text: "물의 세 가지 상태는 고체, 액체, ___이다.", answer: "기체", category: "과학" },
  { text: "곤충의 몸은 머리, 가슴, ___로 나뉜다.", answer: "배", category: "과학" },
  { text: "우리나라의 전통 악기 중 줄이 있는 것은 ___이다.", answer: "가야금", category: "문화" },
  { text: "1L는 ___mL이다.", answer: "1000", category: "수학" },
  { text: "1kg은 ___g이다.", answer: "1000", category: "수학" },
  { text: "동서남북 중 해가 지는 방향은 ___쪽이다.", answer: "서", category: "과학" },
  { text: "올챙이가 자라면 ___가 된다.", answer: "개구리", category: "과학" },
  { text: "고구려, 백제, ___을 삼국이라 한다.", answer: "신라", category: "역사" },
];

export const grade3SafetyData: SafetyEntry[] = [
  { text: "인터넷에서 개인정보를 ___하면 안 된다.", answer: "공개", category: "정보안전" },
  { text: "친구가 다치면 ___에게 알린다.", answer: "선생님", category: "학교안전" },
  { text: "태풍이 오면 ___에 머문다.", answer: "실내", category: "재난안전" },
  { text: "모르는 사람의 차에 ___면 안 된다.", answer: "타", category: "생활안전" },
  { text: "가스 냄새가 나면 ___을 열고 대피한다.", answer: "창문", category: "화재안전" },
  { text: "놀이터에서 줄을 서서 ___를 지킨다.", answer: "차례", category: "학교안전" },
  { text: "음식물 알레르기가 있으면 ___에게 미리 알린다.", answer: "선생님", category: "건강안전" },
  { text: "무거운 물건은 ___를 굽혀 들어올린다.", answer: "무릎", category: "생활안전" },
  { text: "비상구 위치를 미리 ___해 둔다.", answer: "확인", category: "화재안전" },
  { text: "장마철에는 ___이 날 수 있으니 하천 근처에 가지 않는다.", answer: "홍수", category: "재난안전" },
];

export const grade3HanjaData: HanjaEntry[] = [
  { character: "山", reading: "산", meaning: "뫼 산", strokes: 3, words: ["산맥", "등산", "화산"], sentence: "높은 山에 올라갔다." },
  { character: "水", reading: "수", meaning: "물 수", strokes: 4, words: ["수영", "홍수", "수도"], sentence: "깨끗한 水를 마셨다." },
  { character: "火", reading: "화", meaning: "불 화", strokes: 4, words: ["화재", "불꽃", "소화기"], sentence: "火가 나면 119에 전화한다." },
  { character: "木", reading: "목", meaning: "나무 목", strokes: 4, words: ["나무", "목재", "목요일"], sentence: "木이 높이 자랐다." },
  { character: "土", reading: "토", meaning: "흙 토", strokes: 3, words: ["토양", "토요일", "국토"], sentence: "土에 씨앗을 심었다." },
  { character: "日", reading: "일", meaning: "날 일", strokes: 4, words: ["일요일", "생일", "매일"], sentence: "오늘은 좋은 日이다." },
  { character: "月", reading: "월", meaning: "달 월", strokes: 4, words: ["월요일", "정월", "매월"], sentence: "밤하늘에 月이 떴다." },
  { character: "人", reading: "인", meaning: "사람 인", strokes: 2, words: ["인간", "가인", "인구"], sentence: "모든 人은 소중하다." },
  { character: "大", reading: "대", meaning: "큰 대", strokes: 3, words: ["대문", "거대", "최대"], sentence: "大한민국 만세!" },
  { character: "小", reading: "소", meaning: "작을 소", strokes: 3, words: ["소인", "소문", "최소"], sentence: "小한 것도 소중하다." },
  { character: "上", reading: "상", meaning: "위 상", strokes: 3, words: ["상자", "이상", "상의"], sentence: "책상 上에 책이 있다." },
  { character: "下", reading: "하", meaning: "아래 하", strokes: 3, words: ["하늘", "지하", "하의"], sentence: "나무 下에서 쉬었다." },
  { character: "中", reading: "중", meaning: "가운데 중", strokes: 4, words: ["중심", "집중", "중요"], sentence: "교실 中에 모였다." },
  { character: "天", reading: "천", meaning: "하늘 천", strokes: 4, words: ["천국", "천재", "천둥"], sentence: "天이 맑고 푸르다." },
  { character: "地", reading: "지", meaning: "땅 지", strokes: 6, words: ["지구", "토지", "지도"], sentence: "地에 꽃이 피었다." },
];

export const grade3EnglishData: EnglishEntry[] = [
  { sentence: "Hello, my name is Minho.", translation: "안녕, 내 이름은 민호야.", word: "name", pronunciation: "네임", practice: ["My name is ___.", "What is your name?"] },
  { sentence: "I like apples.", translation: "나는 사과를 좋아해.", word: "like", pronunciation: "라이크", practice: ["I like ___.", "Do you like bananas?"] },
  { sentence: "How are you?", translation: "잘 지내니?", word: "how", pronunciation: "하우", practice: ["How are you?", "I am fine."] },
  { sentence: "This is my dog.", translation: "이것은 내 강아지야.", word: "dog", pronunciation: "도그", practice: ["This is my ___.", "I have a dog."] },
  { sentence: "I am happy.", translation: "나는 행복해.", word: "happy", pronunciation: "해피", practice: ["I am ___.", "Are you happy?"] },
  { sentence: "Thank you very much.", translation: "정말 고마워.", word: "thank", pronunciation: "땡크", practice: ["Thank you.", "Thank you for the gift."] },
  { sentence: "What is this?", translation: "이것은 무엇이니?", word: "what", pronunciation: "왓", practice: ["What is this?", "What is that?"] },
  { sentence: "I can run fast.", translation: "나는 빨리 달릴 수 있어.", word: "run", pronunciation: "런", practice: ["I can ___.", "Can you run?"] },
  { sentence: "It is sunny today.", translation: "오늘은 화창해.", word: "sunny", pronunciation: "써니", practice: ["It is ___ today.", "Is it rainy?"] },
  { sentence: "I have two brothers.", translation: "나는 남자 형제가 둘 있어.", word: "brother", pronunciation: "브라더", practice: ["I have ___ brothers.", "Do you have a sister?"] },
  { sentence: "She is my friend.", translation: "그녀는 내 친구야.", word: "friend", pronunciation: "프렌드", practice: ["She is my ___.", "He is my friend."] },
  { sentence: "I go to school.", translation: "나는 학교에 가.", word: "school", pronunciation: "스쿨", practice: ["I go to ___.", "Where do you go?"] },
  { sentence: "The cat is cute.", translation: "그 고양이는 귀여워.", word: "cute", pronunciation: "큐트", practice: ["The ___ is cute.", "Is it cute?"] },
  { sentence: "Good morning!", translation: "좋은 아침!", word: "morning", pronunciation: "모닝", practice: ["Good ___!", "Good night!"] },
  { sentence: "I eat breakfast.", translation: "나는 아침을 먹어.", word: "breakfast", pronunciation: "브렉퍼스트", practice: ["I eat ___.", "Do you eat lunch?"] },
];

export const grade3WritingPrompts: string[] = [
  "우리 학교를 자세히 소개하는 글을 써 보세요.",
  "내가 가장 좋아하는 과목과 그 이유를 설명해 보세요.",
  "가족 여행에서 있었던 일을 순서대로 써 보세요.",
  "내가 존경하는 사람에 대해 써 보세요.",
  "우리 마을(동네)의 좋은 점을 소개해 보세요.",
  "내가 읽은 책에서 가장 기억에 남는 장면을 써 보세요.",
  "만약 내가 대통령이 된다면 무엇을 할까요?",
  "반려동물을 키워 본 경험(또는 키우고 싶은 이유)을 써 보세요.",
  "운동회에서 있었던 재미있는 일을 써 보세요.",
  "내가 만약 시간 여행을 할 수 있다면 어디로 갈까요?",
  "친구와 다투었다가 화해한 경험을 써 보세요.",
  "내가 직접 요리해 본 경험을 써 보세요.",
  "자연에서 가장 신기한 것은 무엇인지 써 보세요.",
  "내가 가고 싶은 나라와 그 이유를 써 보세요.",
  "생일에 받고 싶은 선물과 그 이유를 써 보세요.",
  "우리 반 친구들에게 하고 싶은 말을 편지로 써 보세요.",
  "감사한 마음을 전하는 글을 써 보세요.",
  "사계절 중 가장 좋아하는 계절과 그 이유를 써 보세요.",
  "내가 발명하고 싶은 물건은 무엇인지 상상해서 써 보세요.",
  "환경을 보호하기 위해 내가 할 수 있는 일을 써 보세요.",
];
