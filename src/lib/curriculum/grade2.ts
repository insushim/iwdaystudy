import type { SpellingEntry, VocabEntry, KnowledgeEntry, SafetyEntry, MathEntry } from '@/types/curriculum';

// 2학년 1학기 교육과정 성취기준
export const grade2Semester1Standards = {
  math: [
    { code: "[2수01-08]", desc: "세 자리 수의 자릿값과 위치적 기수법을 이해하고 읽고 쓸 수 있다", unit: "세 자리 수", difficulty: 2, weeks: [1, 4] as [number, number] },
    { code: "[2수01-09]", desc: "뛰어 세기를 할 수 있다", unit: "세 자리 수", difficulty: 2, weeks: [1, 4] as [number, number] },
    { code: "[2수01-10]", desc: "두 자리 수의 범위에서 덧셈과 뺄셈의 계산 원리를 이해하고 계산할 수 있다", unit: "덧셈과 뺄셈", difficulty: 2, weeks: [5, 8] as [number, number] },
    { code: "[2수01-11]", desc: "덧셈과 뺄셈의 관계를 이해한다", unit: "덧셈과 뺄셈", difficulty: 2, weeks: [5, 8] as [number, number] },
    { code: "[2수03-02]", desc: "시각을 읽고 시간의 흐름을 이해한다", unit: "시각과 시간", difficulty: 2, weeks: [9, 11] as [number, number] },
    { code: "[2수04-01]", desc: "분류 기준에 따라 자료를 분류하여 표로 나타낼 수 있다", unit: "분류하기", difficulty: 2, weeks: [12, 15] as [number, number] },
  ],
  korean: [
    { code: "[2국01-03]", desc: "자신의 감정을 표현하며 대화를 나눈다", unit: "감정 표현", difficulty: 2, weeks: [1, 3] as [number, number] },
    { code: "[2국02-03]", desc: "글을 읽고 주요 내용을 확인한다", unit: "읽기", difficulty: 2, weeks: [4, 7] as [number, number] },
    { code: "[2국03-02]", desc: "자신의 생각을 문장으로 표현한다", unit: "문장 쓰기", difficulty: 2, weeks: [8, 11] as [number, number] },
    { code: "[2국04-02]", desc: "소리와 표기가 다를 수 있음을 알고 낱말을 바르게 읽고 쓴다", unit: "소리와 표기", difficulty: 2, weeks: [12, 14] as [number, number] },
  ],
};

export const grade2Semester2Standards = {
  math: [
    { code: "[2수01-12]", desc: "곱셈이 이루어지는 실생활 상황을 통해 곱셈의 의미를 이해한다", unit: "곱셈구구", difficulty: 2, weeks: [1, 4] as [number, number] },
    { code: "[2수01-13]", desc: "곱셈구구를 이해하고 곱셈표를 만들 수 있다", unit: "곱셈구구", difficulty: 2, weeks: [5, 8] as [number, number] },
    { code: "[2수03-03]", desc: "길이를 나타내는 표준 단위의 필요성을 인식하고 1cm와 1m를 안다", unit: "길이 재기", difficulty: 2, weeks: [9, 11] as [number, number] },
    { code: "[2수04-02]", desc: "자료를 그래프로 나타내고 해석할 수 있다", unit: "그래프", difficulty: 2, weeks: [12, 14] as [number, number] },
  ],
  korean: [
    { code: "[2국01-04]", desc: "듣는 이를 바라보며 자신 있게 말한다", unit: "자신 있게 말하기", difficulty: 2, weeks: [1, 4] as [number, number] },
    { code: "[2국02-04]", desc: "글을 읽고 인물의 처지와 마음을 짐작한다", unit: "인물의 마음", difficulty: 2, weeks: [5, 8] as [number, number] },
    { code: "[2국03-03]", desc: "주변의 사람이나 사물에 대해 짧은 글을 쓴다", unit: "관찰 글쓰기", difficulty: 2, weeks: [9, 12] as [number, number] },
  ],
};

export const grade2SpellingData: SpellingEntry[] = [
  { q1: "공부를 열심히 했다.", q2: "공부를 열심이 했다.", answer: 1, explanation: "'열심히'는 부사로 'ㅎ'이 들어갑니다." },
  { q1: "깨끗하게 청소했다.", q2: "깨끗히 청소했다.", answer: 1, explanation: "'깨끗하게'가 올바른 표현입니다. '-하게'로 씁니다." },
  { q1: "넓은 운동장에서 뛰었다.", q2: "널분 운동장에서 뛰었다.", answer: 1, explanation: "'넓은'이 올바른 표기입니다." },
  { q1: "나뭇잎이 떨어졌다.", q2: "나뭇닢이 떨어졌다.", answer: 1, explanation: "'나뭇잎'이 올바른 표기입니다." },
  { q1: "지붕 위에 고양이가 있다.", q2: "지붕 위에 고양이가 잇다.", answer: 1, explanation: "'있다'가 올바른 표기입니다." },
  { q1: "돌멩이를 주웠다.", q2: "돌맹이를 주웠다.", answer: 1, explanation: "'돌멩이'가 올바른 표기입니다." },
  { q1: "할아버지께서 오셨다.", q2: "할아버지께서 오셧다.", answer: 1, explanation: "'오셨다'가 올바른 표기입니다." },
  { q1: "내일 소풍을 갈 거예요.", q2: "내일 소풍을 갈 거에요.", answer: 1, explanation: "'갈 거예요'가 올바른 표기입니다." },
  { q1: "그림을 잘 그렸다.", q2: "그림을 잘 그렸따.", answer: 1, explanation: "'그렸다'가 올바른 종결입니다." },
  { q1: "무엇이든지 할 수 있다.", q2: "무엇이든지 할수 있다.", answer: 1, explanation: "'할 수'처럼 의존명사는 띄어 씁니다." },
  { q1: "오랜만에 만났다.", q2: "오랫만에 만났다.", answer: 2, explanation: "'오랫만에'가 아니라 '오랜만에'가 올바른 표기입니다. (주의: 둘 다 틀린 표현이지만, 여기서는 '오랜만에'가 더 가까운 표현)" },
  { q1: "웃어른께 인사했다.", q2: "우서른께 인사했다.", answer: 1, explanation: "'웃어른'이 올바른 표기입니다." },
  { q1: "바닷가에서 놀았다.", q2: "바다가에서 놀았다.", answer: 1, explanation: "'바닷가'가 올바른 사이시옷 표기입니다." },
  { q1: "설거지를 도왔다.", q2: "설겆이를 도왔다.", answer: 1, explanation: "'설거지'가 올바른 표기입니다." },
  { q1: "따뜻한 국을 먹었다.", q2: "따듯한 국을 먹었다.", answer: 1, explanation: "'따뜻한'이 올바른 표기입니다." },
  { q1: "숙제를 다 했어요.", q2: "숙제를 다 핬어요.", answer: 1, explanation: "'했어요'가 올바른 표기입니다." },
  { q1: "꽃잎이 예쁘다.", q2: "꼰닢이 예쁘다.", answer: 1, explanation: "'꽃잎'이 올바른 표기입니다." },
  { q1: "시험을 잘 봤으면 좋겠다.", q2: "시험을 잘 봣으면 좋겠다.", answer: 1, explanation: "'봤으면'이 올바른 표기입니다." },
  { q1: "안녕히 가세요.", q2: "안녕이 가세요.", answer: 1, explanation: "'안녕히'는 'ㅎ'이 들어갑니다." },
  { q1: "다같이 노래를 불렀다.", q2: "다 같이 노래를 불렀다.", answer: 2, explanation: "'다 같이'는 띄어 쓰는 것이 맞습니다." },
];

export const grade2VocabData: VocabEntry[] = [
  { meanings: ["종이를 자르는 도구", "두 개의 날이 있어요"], answer: "가위" },
  { meanings: ["비가 올 때 입는 옷", "물이 안 스며들어요"], answer: "우비" },
  { meanings: ["음식을 차갑게 보관해요", "부엌에 있어요"], answer: "냉장고" },
  { meanings: ["시간을 알려줘요", "벽에 걸어요"], answer: "시계" },
  { meanings: ["글을 지울 때 사용해요", "연필 위에 달려 있어요"], answer: "지우개" },
  { meanings: ["눈이 올 때 만들어요", "둥근 공 모양이에요"], answer: "눈사람" },
  { meanings: ["병원에서 일해요", "아픈 사람을 치료해요"], answer: "의사" },
  { meanings: ["편지를 넣어요", "우체통에 넣어요"], answer: "봉투" },
  { meanings: ["발을 따뜻하게 해요", "짝이 있어요"], answer: "양말" },
  { meanings: ["물건을 사는 곳", "여러 가지를 팔아요"], answer: "가게" },
  { meanings: ["밤하늘에 빛나요", "반짝반짝 빛나요"], answer: "별" },
  { meanings: ["동물이 사는 곳", "숲에 있어요"], answer: "둥지" },
  { meanings: ["씻을 때 사용해요", "거품이 나요"], answer: "비누" },
  { meanings: ["여러 사람이 타요", "정류장에서 기다려요"], answer: "버스" },
  { meanings: ["운동할 때 신어요", "끈이 있어요"], answer: "운동화" },
];

export const grade2MathData: MathEntry[] = [
  // 두 자리 수 덧셈 (받아올림 없음)
  { type: "calculation", expression: "23 + 15", answer: 38, steps: ["20 + 10 = 30", "3 + 5 = 8", "30 + 8 = 38"], unit: "두 자리 수 덧셈" },
  { type: "calculation", expression: "34 + 21", answer: 55, steps: ["30 + 20 = 50", "4 + 1 = 5", "50 + 5 = 55"], unit: "두 자리 수 덧셈" },
  { type: "calculation", expression: "42 + 36", answer: 78, steps: ["40 + 30 = 70", "2 + 6 = 8", "70 + 8 = 78"], unit: "두 자리 수 덧셈" },
  // 두 자리 수 덧셈 (받아올림 있음)
  { type: "calculation", expression: "27 + 15", answer: 42, steps: ["7 + 5 = 12, 일의 자리 2, 받아올림 1", "2 + 1 + 1 = 4 (십의 자리)", "답: 42"], unit: "두 자리 수 덧셈", hasCarry: true },
  { type: "calculation", expression: "38 + 24", answer: 62, steps: ["8 + 4 = 12, 일의 자리 2, 받아올림 1", "3 + 2 + 1 = 6 (십의 자리)", "답: 62"], unit: "두 자리 수 덧셈", hasCarry: true },
  { type: "calculation", expression: "46 + 37", answer: 83, steps: ["6 + 7 = 13, 일의 자리 3, 받아올림 1", "4 + 3 + 1 = 8 (십의 자리)", "답: 83"], unit: "두 자리 수 덧셈", hasCarry: true },
  // 두 자리 수 뺄셈
  { type: "calculation", expression: "58 - 23", answer: 35, steps: ["50 - 20 = 30", "8 - 3 = 5", "30 + 5 = 35"], unit: "두 자리 수 뺄셈" },
  { type: "calculation", expression: "67 - 34", answer: 33, steps: ["60 - 30 = 30", "7 - 4 = 3", "30 + 3 = 33"], unit: "두 자리 수 뺄셈" },
  { type: "calculation", expression: "45 - 18", answer: 27, steps: ["5에서 8을 뺄 수 없으므로 받아내림", "15 - 8 = 7 (일의 자리)", "3 - 1 = 2 (십의 자리)", "답: 27"], unit: "두 자리 수 뺄셈", hasBorrow: true },
  { type: "calculation", expression: "73 - 29", answer: 44, steps: ["3에서 9를 뺄 수 없으므로 받아내림", "13 - 9 = 4 (일의 자리)", "6 - 2 = 4 (십의 자리)", "답: 44"], unit: "두 자리 수 뺄셈", hasBorrow: true },
  // 곱셈구구
  { type: "calculation", expression: "2 × 3", answer: 6, steps: ["2를 3번 더하면: 2 + 2 + 2 = 6"], unit: "곱셈구구 2단" },
  { type: "calculation", expression: "2 × 7", answer: 14, steps: ["2를 7번 더하면: 14"], unit: "곱셈구구 2단" },
  { type: "calculation", expression: "3 × 4", answer: 12, steps: ["3을 4번 더하면: 3 + 3 + 3 + 3 = 12"], unit: "곱셈구구 3단" },
  { type: "calculation", expression: "4 × 5", answer: 20, steps: ["4를 5번 더하면: 4 + 4 + 4 + 4 + 4 = 20"], unit: "곱셈구구 4단" },
  { type: "calculation", expression: "5 × 6", answer: 30, steps: ["5를 6번 더하면: 30"], unit: "곱셈구구 5단" },
  { type: "calculation", expression: "6 × 3", answer: 18, steps: ["6을 3번 더하면: 6 + 6 + 6 = 18"], unit: "곱셈구구 6단" },
  { type: "calculation", expression: "7 × 4", answer: 28, steps: ["7을 4번 더하면: 7 + 7 + 7 + 7 = 28"], unit: "곱셈구구 7단" },
  { type: "calculation", expression: "8 × 3", answer: 24, steps: ["8을 3번 더하면: 8 + 8 + 8 = 24"], unit: "곱셈구구 8단" },
  { type: "calculation", expression: "9 × 2", answer: 18, steps: ["9를 2번 더하면: 9 + 9 = 18"], unit: "곱셈구구 9단" },
  { type: "calculation", expression: "5 × 5", answer: 25, steps: ["5를 5번 더하면: 25"], unit: "곱셈구구 5단" },
];

export const grade2KnowledgeData: KnowledgeEntry[] = [
  { text: "우리나라의 수도는 ___이다.", answer: "서울", category: "사회" },
  { text: "지구에서 가장 큰 바다는 ___양이다.", answer: "태평", category: "지리" },
  { text: "식물이 자라려면 물, 햇빛, ___이 필요하다.", answer: "흙", category: "과학" },
  { text: "자석은 ___을 끌어당긴다.", answer: "철", category: "과학" },
  { text: "우리 몸에서 피를 온몸에 보내주는 장기는 ___이다.", answer: "심장", category: "과학" },
  { text: "한글을 만든 사람은 ___이다.", answer: "세종대왕", category: "역사" },
  { text: "1m는 ___cm이다.", answer: "100", category: "수학" },
  { text: "공룡은 ___에 살았다.", answer: "옛날", category: "과학" },
  { text: "곤충의 다리는 ___개이다.", answer: "6", category: "과학" },
  { text: "지구는 ___ 모양이다.", answer: "둥근", category: "과학" },
  { text: "우리나라 돈의 단위는 ___이다.", answer: "원", category: "사회" },
  { text: "비가 오기 전에 하늘에 ___이 끼낀다.", answer: "구름", category: "자연" },
  { text: "초록색 잎에서 햇빛으로 양분을 만드는 것을 ___이라 한다.", answer: "광합성", category: "과학" },
  { text: "사람의 뼈는 약 ___개이다.", answer: "206", category: "과학" },
  { text: "물이 끓으면 ___가 된다.", answer: "수증기", category: "과학" },
];

export const grade2SafetyData: SafetyEntry[] = [
  { text: "지진이 나면 ___아래로 들어간다.", answer: "책상", category: "재난안전" },
  { text: "물놀이할 때는 반드시 ___를 입어야 한다.", answer: "구명조끼", category: "물놀이안전" },
  { text: "엘리베이터에 갇히면 ___를 누른다.", answer: "비상벨", category: "생활안전" },
  { text: "교통사고가 나면 ___번에 전화한다.", answer: "112", category: "교통안전" },
  { text: "음식을 먹기 전에 ___를 확인한다.", answer: "유통기한", category: "건강안전" },
  { text: "자전거를 탈 때는 ___을 꼭 쓴다.", answer: "헬멧", category: "교통안전" },
  { text: "전기 콘센트에 ___를 넣으면 안 된다.", answer: "손", category: "전기안전" },
  { text: "눈이 오면 길이 ___해서 조심해야 한다.", answer: "미끄러워", category: "생활안전" },
  { text: "약은 ___의 허락 없이 먹으면 안 된다.", answer: "어른", category: "건강안전" },
  { text: "화재 시 ___를 막고 낮은 자세로 이동한다.", answer: "코와 입", category: "화재안전" },
];

export const grade2WritingPrompts: string[] = [
  "주말에 가족과 함께 한 일을 써 보세요.",
  "내가 키우는 (키우고 싶은) 동물에 대해 써 보세요.",
  "가장 재미있었던 수업 시간을 써 보세요.",
  "친구와 함께 놀았던 일을 써 보세요.",
  "내가 좋아하는 책 이야기를 해 보세요.",
  "봄(여름/가을/겨울)에 하고 싶은 일을 써 보세요.",
  "우리 동네를 소개해 보세요.",
  "내가 만약 거인이 된다면 무엇을 할까요?",
  "가장 감사한 사람에게 편지를 써 보세요.",
  "내가 잘하는 것에 대해 써 보세요.",
  "학교에서 있었던 재미있는 일을 써 보세요.",
  "내가 만든 음식(요리)에 대해 써 보세요.",
  "소풍에서 있었던 일을 써 보세요.",
  "나의 꿈에 대해 써 보세요.",
  "일기 쓰기: 오늘 하루를 돌아보세요.",
  "내가 가장 좋아하는 장소는 어디인가요?",
  "엄마(아빠)에게 하고 싶은 말을 써 보세요.",
  "비가 오는 날의 이야기를 만들어 보세요.",
  "내가 만약 투명인간이 된다면?",
  "동생(형, 누나, 언니, 오빠)에게 하고 싶은 말을 써 보세요.",
];
