import type { SpellingEntry, VocabEntry, KnowledgeEntry, SafetyEntry, MathEntry, HanjaEntry, EnglishEntry } from '@/types/curriculum';

// 4학년 1학기 교육과정 성취기준
export const grade4Semester1Standards = {
  math: [
    { code: "[4수01-01]", desc: "큰 수의 자릿값과 위치적 기수법을 이해하고 수를 읽고 쓸 수 있다", unit: "큰 수", difficulty: 4, weeks: [1, 3] as [number, number] },
    { code: "[4수01-02]", desc: "곱셈과 나눗셈의 계산 원리를 이해하고 그 계산을 할 수 있다", unit: "곱셈과 나눗셈", difficulty: 4, weeks: [4, 7] as [number, number] },
    { code: "[4수01-03]", desc: "분모가 같은 분수의 크기를 비교할 수 있다", unit: "분수의 덧셈과 뺄셈", difficulty: 4, weeks: [8, 10] as [number, number] },
    { code: "[4수02-01]", desc: "각의 크기의 단위를 알고 각도를 측정할 수 있다", unit: "각도", difficulty: 4, weeks: [11, 13] as [number, number] },
    { code: "[4수02-02]", desc: "삼각형의 세 각의 크기의 합이 180°임을 안다", unit: "삼각형", difficulty: 4, weeks: [14, 16] as [number, number] },
  ],
  korean: [
    { code: "[4국01-03]", desc: "원인과 결과의 관계를 고려하며 듣고 말한다", unit: "원인과 결과", difficulty: 4, weeks: [1, 3] as [number, number] },
    { code: "[4국02-03]", desc: "글을 읽고 중심 생각과 뒷받침하는 내용을 파악한다", unit: "중심 생각", difficulty: 4, weeks: [4, 7] as [number, number] },
    { code: "[4국03-02]", desc: "읽는 이를 고려하며 자신의 마음을 표현하는 글을 쓴다", unit: "마음 표현", difficulty: 4, weeks: [8, 11] as [number, number] },
    { code: "[4국04-02]", desc: "높임법을 알고 언어 예절에 맞게 사용한다", unit: "높임법", difficulty: 4, weeks: [12, 14] as [number, number] },
  ],
  english: [
    { code: "[4영01-03]", desc: "쉽고 간단한 문장을 강세, 리듬, 억양에 맞게 소리 내어 읽을 수 있다", unit: "Reading Aloud", difficulty: 4, weeks: [1, 4] as [number, number] },
    { code: "[4영02-03]", desc: "일상생활에 관한 쉽고 간단한 말이나 대화를 듣고 세부 정보를 파악할 수 있다", unit: "Listening", difficulty: 4, weeks: [5, 8] as [number, number] },
    { code: "[4영03-02]", desc: "실물이나 그림을 보고 쉽고 간단한 문장으로 표현할 수 있다", unit: "Speaking", difficulty: 4, weeks: [9, 12] as [number, number] },
  ],
};

export const grade4Semester2Standards = {
  math: [
    { code: "[4수01-04]", desc: "소수의 크기를 비교할 수 있다", unit: "소수", difficulty: 4, weeks: [1, 3] as [number, number] },
    { code: "[4수01-05]", desc: "분모가 같은 분수의 덧셈과 뺄셈을 할 수 있다", unit: "분수의 덧셈과 뺄셈", difficulty: 4, weeks: [4, 7] as [number, number] },
    { code: "[4수02-03]", desc: "다각형의 성질을 이해하고 그릴 수 있다", unit: "다각형", difficulty: 4, weeks: [8, 10] as [number, number] },
    { code: "[4수04-01]", desc: "실생활 자료를 수집하여 막대그래프나 꺾은선그래프로 나타내고 해석할 수 있다", unit: "꺾은선그래프", difficulty: 4, weeks: [11, 13] as [number, number] },
    { code: "[4수03-01]", desc: "어림하기를 통해 실생활 문제를 해결할 수 있다", unit: "어림하기", difficulty: 4, weeks: [14, 16] as [number, number] },
  ],
  korean: [
    { code: "[4국01-04]", desc: "적절한 표정, 몸짓, 말투로 말한다", unit: "표현하기", difficulty: 4, weeks: [1, 3] as [number, number] },
    { code: "[4국02-04]", desc: "글을 읽고 사실과 의견을 구별한다", unit: "사실과 의견", difficulty: 4, weeks: [4, 7] as [number, number] },
    { code: "[4국03-03]", desc: "관심 있는 주제에 대해 자신의 의견이 드러나게 글을 쓴다", unit: "의견 글쓰기", difficulty: 4, weeks: [8, 11] as [number, number] },
  ],
  english: [
    { code: "[4영01-04]", desc: "쉽고 간단한 낱말이나 어구, 문장을 따라 쓸 수 있다", unit: "Writing", difficulty: 4, weeks: [1, 4] as [number, number] },
    { code: "[4영02-04]", desc: "일상생활에 관한 쉽고 간단한 대화에 참여할 수 있다", unit: "Conversation", difficulty: 4, weeks: [5, 8] as [number, number] },
  ],
};

export const grade4SpellingData: SpellingEntry[] = [
  { q1: "가르치다 - 선생님이 학생을 가르친다.", q2: "가리키다 - 선생님이 학생을 가리킨다.", answer: 1, explanation: "'가르치다'는 지식을 알려주는 것, '가리키다'는 방향을 보여주는 것입니다." },
  { q1: "부치다 - 편지를 부쳤다.", q2: "붙이다 - 편지를 붙였다.", answer: 1, explanation: "'부치다'는 보내는 것이고, '붙이다'는 달라붙게 하는 것입니다." },
  { q1: "바치다 - 나라에 목숨을 바쳤다.", q2: "받치다 - 나라에 목숨을 받쳤다.", answer: 1, explanation: "'바치다'는 드리는 것이고, '받치다'는 밑에 대는 것입니다." },
  { q1: "낫다 - 감기가 나았다.", q2: "낳다 - 감기가 낳았다.", answer: 1, explanation: "'낫다'는 회복되는 것이고, '낳다'는 출산하는 것입니다." },
  { q1: "맞히다 - 정답을 맞혔다.", q2: "맞추다 - 정답을 맞쳤다.", answer: 1, explanation: "'맞히다'는 적중시키는 것이고, '맞추다'는 비교하는 것입니다." },
  { q1: "그러므로 열심히 해야 한다.", q2: "그럼으로 열심히 해야 한다.", answer: 1, explanation: "'그러므로'는 '그래서'의 뜻인 접속부사입니다." },
  { q1: "일찍이 깨달았다.", q2: "일찌기 깨달았다.", answer: 1, explanation: "'일찍이'가 올바른 표기입니다." },
  { q1: "오랫동안 기다렸다.", q2: "오래동안 기다렸다.", answer: 1, explanation: "'오랫동안'이 올바른 사이시옷 표기입니다." },
  { q1: "서슴지 않고 도왔다.", q2: "서슴치 않고 도왔다.", answer: 1, explanation: "'서슴지'가 올바른 표기입니다." },
  { q1: "형편없이 망했다.", q2: "형편업이 망했다.", answer: 1, explanation: "'형편없이'가 올바른 표기입니다." },
  { q1: "널찍한 운동장에서 놀았다.", q2: "널직한 운동장에서 놀았다.", answer: 1, explanation: "'널찍한'이 올바른 표기입니다." },
  { q1: "그 사실을 깨닫다.", q2: "그 사실을 깨닿다.", answer: 1, explanation: "'깨닫다'가 올바른 표기입니다." },
  { q1: "연기가 자욱하다.", q2: "연기가 자육하다.", answer: 1, explanation: "'자욱하다'가 올바른 표기입니다." },
  { q1: "숙맥이다.", q2: "숙맹이다.", answer: 1, explanation: "'숙맥'이 올바른 표기입니다." },
  { q1: "미루나무가 길가에 있다.", q2: "미류나무가 길가에 있다.", answer: 1, explanation: "'미루나무'가 올바른 표기입니다." },
  { q1: "삼가 조의를 표합니다.", q2: "삼가 조의를 표함니다.", answer: 1, explanation: "'표합니다'가 올바른 표기입니다." },
  { q1: "답변이 궁색하다.", q2: "답변이 궁섹하다.", answer: 1, explanation: "'궁색하다'가 올바른 표기입니다." },
  { q1: "어른을 뵙다.", q2: "어른을 봽다.", answer: 1, explanation: "'뵙다'가 올바른 표기입니다." },
  { q1: "풋사과가 시다.", q2: "풋사과가 씨다.", answer: 1, explanation: "'시다'가 올바른 표기입니다." },
  { q1: "얼마큼 왔을까?", q2: "얼마만큼 왔을까?", answer: 2, explanation: "'얼마만큼'이 올바른 표기입니다." },
];

export const grade4VocabData: VocabEntry[] = [
  { meanings: ["나라를 지키는 사람", "군복을 입어요"], answer: "군인" },
  { meanings: ["옛날 물건을 보관하는 곳", "역사를 배울 수 있어요"], answer: "박물관" },
  { meanings: ["전기로 움직이는 기계", "시원한 바람을 만들어요"], answer: "선풍기" },
  { meanings: ["말이나 글의 뜻", "사전에서 찾아볼 수 있어요"], answer: "의미" },
  { meanings: ["다른 사람의 입장에서 생각하는 것", "마음을 이해하는 것"], answer: "공감" },
  { meanings: ["서로 의견을 나누는 것", "결론을 내리기 위해 해요"], answer: "토론" },
  { meanings: ["땅속에서 나오는 뜨거운 물", "몸을 담그면 건강에 좋아요"], answer: "온천" },
  { meanings: ["어떤 일이 일어난 까닭", "왜 그런지 알려주는 것"], answer: "원인" },
  { meanings: ["원인 때문에 생긴 일", "원인 다음에 나타나는 것"], answer: "결과" },
  { meanings: ["눈에 쓰는 도구", "시력이 나쁠 때 써요"], answer: "안경" },
  { meanings: ["나라를 다스리는 기본 법", "가장 높은 법이에요"], answer: "헌법" },
  { meanings: ["비행기가 뜨고 내리는 곳", "여행할 때 가요"], answer: "공항" },
  { meanings: ["나라와 나라 사이의 관계", "외교라고도 해요"], answer: "국제" },
  { meanings: ["정해진 규칙이나 법", "지켜야 하는 것"], answer: "규칙" },
  { meanings: ["물질이 타서 빛과 열을 내는 현상", "불이라고도 해요"], answer: "연소" },
];

export const grade4MathData: MathEntry[] = [
  // 큰 수
  { type: "calculation", expression: "23456 + 34521", answer: 57977, steps: ["일의 자리부터 차례로 더합니다", "6+1=7, 5+2=7, 4+5=9, 3+4=7, 2+3=5", "답: 57977"], unit: "큰 수 덧셈" },
  // 세 자리 × 두 자리 곱셈
  { type: "calculation", expression: "234 × 12", answer: 2808, steps: ["234 × 2 = 468", "234 × 10 = 2340", "468 + 2340 = 2808"], unit: "곱셈" },
  { type: "calculation", expression: "156 × 23", answer: 3588, steps: ["156 × 3 = 468", "156 × 20 = 3120", "468 + 3120 = 3588"], unit: "곱셈" },
  { type: "calculation", expression: "345 × 15", answer: 5175, steps: ["345 × 5 = 1725", "345 × 10 = 3450", "1725 + 3450 = 5175"], unit: "곱셈" },
  // 두 자리 나눗셈
  { type: "calculation", expression: "96 ÷ 12", answer: 8, steps: ["12 × 8 = 96", "96 ÷ 12 = 8"], unit: "나눗셈", dividend: 96, divisor: 12, quotient: 8, remainder: 0 },
  { type: "calculation", expression: "75 ÷ 15", answer: 5, steps: ["15 × 5 = 75", "75 ÷ 15 = 5"], unit: "나눗셈", dividend: 75, divisor: 15, quotient: 5, remainder: 0 },
  { type: "calculation", expression: "156 ÷ 12", answer: 13, steps: ["12 × 13 = 156", "156 ÷ 12 = 13"], unit: "나눗셈", dividend: 156, divisor: 12, quotient: 13, remainder: 0 },
  { type: "calculation", expression: "89 ÷ 7", answer: 12, steps: ["7 × 12 = 84", "89 - 84 = 5", "89 ÷ 7 = 12 나머지 5"], unit: "나머지가 있는 나눗셈", dividend: 89, divisor: 7, quotient: 12, remainder: 5 },
  // 분모가 같은 분수 덧셈/뺄셈
  { type: "calculation", expression: "3/8 + 2/8", answer: 5, steps: ["분모가 같으므로 분자끼리 더합니다", "3 + 2 = 5", "답: 5/8"], unit: "분수 덧셈", numbers: [3, 8, 2, 8] },
  { type: "calculation", expression: "5/6 - 2/6", answer: 3, steps: ["분모가 같으므로 분자끼리 뺍니다", "5 - 2 = 3", "답: 3/6 = 1/2"], unit: "분수 뺄셈", numbers: [5, 6, 2, 6] },
  { type: "calculation", expression: "7/10 + 4/10", answer: 11, steps: ["분모가 같으므로 분자끼리 더합니다", "7 + 4 = 11", "답: 11/10 = 1과 1/10"], unit: "분수 덧셈", numbers: [7, 10, 4, 10] },
  // 소수
  { type: "calculation", expression: "2.5 + 1.3", answer: 3.8, steps: ["소수점을 맞춰 더합니다", "5 + 3 = 8 (소수 첫째 자리)", "2 + 1 = 3 (일의 자리)", "답: 3.8"], unit: "소수 덧셈" },
  { type: "calculation", expression: "4.7 - 2.3", answer: 2.4, steps: ["소수점을 맞춰 뺍니다", "7 - 3 = 4 (소수 첫째 자리)", "4 - 2 = 2 (일의 자리)", "답: 2.4"], unit: "소수 뺄셈" },
  // 각도
  { type: "calculation", expression: "180 - 60 - 70", answer: 50, steps: ["삼각형의 세 각의 합은 180°", "180 - 60 - 70 = 50", "나머지 한 각은 50°"], unit: "각도" },
  { type: "calculation", expression: "360 - 90 - 90 - 90", answer: 90, steps: ["사각형의 네 각의 합은 360°", "360 - 90 - 90 - 90 = 90", "나머지 한 각은 90°"], unit: "각도" },
  // 혼합 계산
  { type: "calculation", expression: "24 + 36 × 2", answer: 96, steps: ["곱셈을 먼저 계산합니다", "36 × 2 = 72", "24 + 72 = 96"], unit: "혼합 계산" },
  { type: "calculation", expression: "(15 + 25) × 3", answer: 120, steps: ["괄호 안을 먼저 계산합니다", "15 + 25 = 40", "40 × 3 = 120"], unit: "혼합 계산" },
  { type: "calculation", expression: "100 - 48 ÷ 6", answer: 92, steps: ["나눗셈을 먼저 계산합니다", "48 ÷ 6 = 8", "100 - 8 = 92"], unit: "혼합 계산" },
  { type: "calculation", expression: "3.6 + 2.8", answer: 6.4, steps: ["6 + 8 = 14, 소수 첫째 자리 4, 받아올림 1", "3 + 2 + 1 = 6 (일의 자리)", "답: 6.4"], unit: "소수 덧셈" },
  { type: "calculation", expression: "5.2 - 1.7", answer: 3.5, steps: ["2에서 7을 뺄 수 없으므로 받아내림", "12 - 7 = 5 (소수 첫째 자리)", "4 - 1 = 3 (일의 자리)", "답: 3.5"], unit: "소수 뺄셈" },
];

export const grade4KnowledgeData: KnowledgeEntry[] = [
  { text: "우리나라 최초의 금속활자 인쇄본은 ___이다.", answer: "직지심체요절", category: "역사" },
  { text: "한반도의 가장 높은 산은 ___이다.", answer: "백두산", category: "지리" },
  { text: "식물의 꽃가루를 옮기는 역할을 하는 곤충은 ___이다.", answer: "벌", category: "과학" },
  { text: "지구가 태양을 한 바퀴 도는 데 걸리는 시간은 약 ___일이다.", answer: "365", category: "과학" },
  { text: "우리나라 행정구역 중 특별시는 ___이다.", answer: "서울", category: "사회" },
  { text: "삼각형의 세 각의 합은 ___도이다.", answer: "180", category: "수학" },
  { text: "혈액 속에서 산소를 운반하는 것은 ___이다.", answer: "적혈구", category: "과학" },
  { text: "임진왜란 때 거북선을 만든 사람은 ___이다.", answer: "이순신", category: "역사" },
  { text: "자전은 지구가 ___을 중심으로 도는 것이다.", answer: "자전축", category: "과학" },
  { text: "사각형의 네 각의 합은 ___도이다.", answer: "360", category: "수학" },
  { text: "물이 증발하여 하늘로 올라가 만들어지는 것은 ___이다.", answer: "구름", category: "과학" },
  { text: "우리나라의 전통 집을 ___이라 한다.", answer: "한옥", category: "문화" },
  { text: "뼈와 뼈가 만나는 곳을 ___이라 한다.", answer: "관절", category: "과학" },
  { text: "조선을 세운 사람은 ___이다.", answer: "이성계", category: "역사" },
  { text: "소리의 빠르기를 ___이라 한다.", answer: "음속", category: "과학" },
];

export const grade4SafetyData: SafetyEntry[] = [
  { text: "인터넷에서 모르는 사람이 만나자고 하면 ___해야 한다.", answer: "거절", category: "정보안전" },
  { text: "사이버 폭력을 당하면 ___을 남기고 신고한다.", answer: "증거", category: "정보안전" },
  { text: "실험할 때는 반드시 ___을 착용한다.", answer: "보안경", category: "실험안전" },
  { text: "비상시 학교에서는 ___에 따라 대피한다.", answer: "대피 경로", category: "재난안전" },
  { text: "전기 제품이 물에 젖으면 ___가 날 수 있다.", answer: "감전 사고", category: "전기안전" },
  { text: "여름철 무더위에는 ___을 충분히 마셔야 한다.", answer: "물", category: "건강안전" },
  { text: "가정에서 ___기를 사용하면 화재를 조기에 발견할 수 있다.", answer: "화재 감지", category: "화재안전" },
  { text: "자전거를 탈 때 야간에는 ___을 켜야 한다.", answer: "전조등", category: "교통안전" },
  { text: "식중독을 예방하려면 음식을 충분히 ___해서 먹는다.", answer: "익혀", category: "건강안전" },
  { text: "지진 시 엘리베이터 대신 ___를 이용한다.", answer: "계단", category: "재난안전" },
];

export const grade4HanjaData: HanjaEntry[] = [
  { character: "學", reading: "학", meaning: "배울 학", strokes: 16, words: ["학교", "학생", "학습"], sentence: "學問에 힘쓰자." },
  { character: "校", reading: "교", meaning: "학교 교", strokes: 10, words: ["학교", "교실", "교장"], sentence: "學校에 매일 간다." },
  { character: "先", reading: "선", meaning: "먼저 선", strokes: 6, words: ["선생", "선배", "우선"], sentence: "先生님께 인사했다." },
  { character: "生", reading: "생", meaning: "날 생", strokes: 5, words: ["생일", "학생", "생활"], sentence: "生日 축하합니다." },
  { character: "父", reading: "부", meaning: "아버지 부", strokes: 4, words: ["부모", "조부", "부친"], sentence: "父母님의 은혜에 감사한다." },
  { character: "母", reading: "모", meaning: "어머니 모", strokes: 5, words: ["모친", "부모", "조모"], sentence: "母의 사랑은 바다와 같다." },
  { character: "王", reading: "왕", meaning: "임금 왕", strokes: 4, words: ["왕국", "국왕", "여왕"], sentence: "세종대王은 한글을 만들었다." },
  { character: "國", reading: "국", meaning: "나라 국", strokes: 11, words: ["국가", "한국", "국기"], sentence: "대한민國 만세!" },
  { character: "民", reading: "민", meaning: "백성 민", strokes: 5, words: ["국민", "시민", "민주"], sentence: "國民의 의무를 다하자." },
  { character: "花", reading: "화", meaning: "꽃 화", strokes: 8, words: ["꽃", "화분", "개화"], sentence: "봄에 花가 피었다." },
  { character: "草", reading: "초", meaning: "풀 초", strokes: 10, words: ["풀밭", "초원", "잡초"], sentence: "草원에서 뛰어놀았다." },
  { character: "春", reading: "춘", meaning: "봄 춘", strokes: 9, words: ["춘분", "입춘", "청춘"], sentence: "春이 되면 꽃이 핀다." },
  { character: "夏", reading: "하", meaning: "여름 하", strokes: 10, words: ["하계", "초여름", "하절기"], sentence: "夏에는 바다에 간다." },
  { character: "秋", reading: "추", meaning: "가을 추", strokes: 9, words: ["추분", "만추", "추석"], sentence: "秋에는 단풍이 아름답다." },
  { character: "冬", reading: "동", meaning: "겨울 동", strokes: 5, words: ["동계", "동지", "동절기"], sentence: "冬에는 눈이 온다." },
];

export const grade4EnglishData: EnglishEntry[] = [
  { sentence: "What time is it?", translation: "몇 시예요?", word: "time", pronunciation: "타임", practice: ["What time is it?", "It is 3 o'clock."] },
  { sentence: "I want some water.", translation: "물 좀 주세요.", word: "water", pronunciation: "워터", practice: ["I want some ___.", "Can I have water?"] },
  { sentence: "Where is the library?", translation: "도서관이 어디에 있나요?", word: "library", pronunciation: "라이브러리", practice: ["Where is the ___?", "The library is over there."] },
  { sentence: "How much is this?", translation: "이것은 얼마예요?", word: "much", pronunciation: "머치", practice: ["How much is this?", "It is five dollars."] },
  { sentence: "I like to play soccer.", translation: "나는 축구하는 것을 좋아해.", word: "play", pronunciation: "플레이", practice: ["I like to play ___.", "Do you like to play?"] },
  { sentence: "My favorite color is blue.", translation: "내가 가장 좋아하는 색은 파란색이야.", word: "favorite", pronunciation: "페이버릿", practice: ["My favorite ___ is ___.", "What is your favorite color?"] },
  { sentence: "Can you help me?", translation: "도와줄 수 있어?", word: "help", pronunciation: "헬프", practice: ["Can you ___?", "Yes, I can help you."] },
  { sentence: "I am in the fourth grade.", translation: "나는 4학년이야.", word: "grade", pronunciation: "그레이드", practice: ["I am in the ___ grade.", "What grade are you in?"] },
  { sentence: "Let's go to the park.", translation: "공원에 가자.", word: "park", pronunciation: "파크", practice: ["Let's go to the ___.", "Do you want to go?"] },
  { sentence: "She is wearing a red hat.", translation: "그녀는 빨간 모자를 쓰고 있어.", word: "wearing", pronunciation: "웨어링", practice: ["She is wearing ___.", "He is wearing a blue shirt."] },
  { sentence: "How old are you?", translation: "너는 몇 살이니?", word: "old", pronunciation: "올드", practice: ["How old are you?", "I am ten years old."] },
  { sentence: "I have a big family.", translation: "나는 대가족이야.", word: "family", pronunciation: "패밀리", practice: ["I have a ___ family.", "How many people are in your family?"] },
  { sentence: "It is raining outside.", translation: "밖에 비가 오고 있어.", word: "raining", pronunciation: "레이닝", practice: ["It is ___ outside.", "Is it snowing?"] },
  { sentence: "Please open your book.", translation: "책을 펴 주세요.", word: "open", pronunciation: "오픈", practice: ["Please ___ your book.", "Close the window."] },
  { sentence: "I study math every day.", translation: "나는 매일 수학을 공부해.", word: "study", pronunciation: "스터디", practice: ["I study ___ every day.", "Do you study English?"] },
];

export const grade4WritingPrompts: string[] = [
  "내가 존경하는 인물과 그 이유를 설명하는 글을 써 보세요.",
  "우리 지역의 문화유산을 소개하는 글을 써 보세요.",
  "좋은 친구란 어떤 친구인지 자신의 생각을 써 보세요.",
  "내가 경험한 가장 어려웠던 일과 극복 과정을 써 보세요.",
  "환경 보호를 위해 우리가 할 수 있는 일을 제안하는 글을 써 보세요.",
  "내가 읽은 책을 친구에게 추천하는 글을 써 보세요.",
  "우리 학교의 급식에 대해 의견을 써 보세요.",
  "스마트폰 사용에 대한 나의 생각을 써 보세요.",
  "내가 만약 100년 전으로 시간 여행을 한다면?",
  "학급 회의에서 발표할 안건을 작성해 보세요.",
  "가장 기억에 남는 선물과 그 이유를 써 보세요.",
  "내가 잘못한 일을 반성하는 글을 써 보세요.",
  "우리 반의 좋은 전통을 만들자는 제안 글을 써 보세요.",
  "내가 가장 감동받은 이야기를 소개해 보세요.",
  "만약 동물과 대화할 수 있다면 누구와 무슨 이야기를 할까요?",
  "내가 생각하는 행복이란 무엇인지 써 보세요.",
  "편지 형식으로 감사의 마음을 전해 보세요.",
  "나만의 발명품을 설명하는 글을 써 보세요.",
  "우리 마을을 더 좋게 만들기 위한 방법을 제안해 보세요.",
  "10년 후의 나에게 편지를 써 보세요.",
];
