import type { SpellingEntry, VocabEntry, KnowledgeEntry, SafetyEntry, MathEntry } from '@/types/curriculum';

// 1학년 1학기 교육과정 성취기준
export const grade1Semester1Standards = {
  math: [
    { code: "[2수01-01]", desc: "0과 100까지의 수 개념을 이해하고 수를 세고 읽고 쓸 수 있다", unit: "9까지의 수", difficulty: 1, weeks: [1, 4] as [number, number] },
    { code: "[2수01-02]", desc: "하나의 수를 두 수로 분해하고 두 수를 하나의 수로 합성할 수 있다", unit: "9까지의 수", difficulty: 1, weeks: [1, 4] as [number, number] },
    { code: "[2수01-03]", desc: "덧셈과 뺄셈이 이루어지는 실생활 상황을 통해 덧셈과 뺄셈의 의미를 이해한다", unit: "덧셈과 뺄셈", difficulty: 1, weeks: [5, 8] as [number, number] },
    { code: "[2수01-04]", desc: "한 자리 수의 덧셈과 뺄셈을 할 수 있다", unit: "덧셈과 뺄셈", difficulty: 1, weeks: [5, 8] as [number, number] },
    { code: "[2수02-01]", desc: "교실 및 생활 주변에서 여러 가지 물건의 모양을 관찰하고 특징을 알 수 있다", unit: "여러 가지 모양", difficulty: 1, weeks: [9, 11] as [number, number] },
    { code: "[2수01-05]", desc: "50까지의 수를 세고 읽고 쓸 수 있다", unit: "50까지의 수", difficulty: 1, weeks: [12, 15] as [number, number] },
  ],
  korean: [
    { code: "[2국01-01]", desc: "상황에 어울리는 인사말을 주고받는다", unit: "인사말", difficulty: 1, weeks: [1, 3] as [number, number] },
    { code: "[2국02-01]", desc: "글자의 짜임을 알고 글자를 바르게 읽는다", unit: "글자", difficulty: 1, weeks: [4, 7] as [number, number] },
    { code: "[2국03-01]", desc: "글자를 바르게 쓴다", unit: "글쓰기", difficulty: 1, weeks: [8, 10] as [number, number] },
    { code: "[2국04-01]", desc: "한글 자모의 이름과 소릿값을 알고 정확하게 발음하고 쓴다", unit: "한글", difficulty: 1, weeks: [11, 14] as [number, number] },
  ],
};

export const grade1Semester2Standards = {
  math: [
    { code: "[2수01-06]", desc: "100까지의 수 개념을 이해하고 수를 세고 읽고 쓸 수 있다", unit: "100까지의 수", difficulty: 1, weeks: [1, 4] as [number, number] },
    { code: "[2수01-07]", desc: "덧셈과 뺄셈의 관계를 이해한다", unit: "덧셈과 뺄셈(2)", difficulty: 1, weeks: [5, 8] as [number, number] },
    { code: "[2수03-01]", desc: "시계를 보고 시각을 읽을 수 있다", unit: "시계 보기", difficulty: 1, weeks: [9, 11] as [number, number] },
    { code: "[2수02-02]", desc: "여러 가지 모양을 이용하여 물건의 모양을 꾸밀 수 있다", unit: "여러 가지 모양", difficulty: 1, weeks: [12, 14] as [number, number] },
  ],
  korean: [
    { code: "[2국01-02]", desc: "자신의 생각이나 겪은 일을 글로 쓸 수 있다", unit: "생각 쓰기", difficulty: 1, weeks: [1, 4] as [number, number] },
    { code: "[2국02-02]", desc: "인물의 모습, 행동을 상상하며 그림책, 시나 노래, 이야기를 감상한다", unit: "감상", difficulty: 1, weeks: [5, 8] as [number, number] },
  ],
};

export const grade1SpellingData: SpellingEntry[] = [
  { q1: "사과를 먹었다.", q2: "사과를 먹겄다.", answer: 1, explanation: "'먹었다'가 올바른 표현입니다." },
  { q1: "나는 학교에 가요.", q2: "나는 학교에 갸요.", answer: 1, explanation: "'가요'가 맞는 표현입니다." },
  { q1: "친구랑 놀아요.", q2: "친구랑 놀아여.", answer: 1, explanation: "'놀아요'가 올바른 해요체 표현입니다." },
  { q1: "아빠가 오셨어요.", q2: "아빠가 오셨어여.", answer: 1, explanation: "'-요'가 맞는 종결어미입니다." },
  { q1: "예쁜 꽃이 피었다.", q2: "이쁜 꽃이 피었다.", answer: 1, explanation: "'예쁜'이 표준어입니다." },
  { q1: "나는 잘할 수 있어.", q2: "나는 잘 할수 있어.", answer: 1, explanation: "'할 수'처럼 의존명사 '수'는 띄어 씁니다." },
  { q1: "물을 마셨어요.", q2: "물을 마시었어요.", answer: 1, explanation: "'마셨어요'가 자연스러운 줄임 표현입니다." },
  { q1: "엄마가 좋아요.", q2: "엄마가 조아요.", answer: 1, explanation: "'좋아요'의 'ㅎ'을 빠뜨리면 안 됩니다." },
  { q1: "동생이 울었다.", q2: "동생이 울었따.", answer: 1, explanation: "'울었다'에서 종결어미는 '-다'입니다." },
  { q1: "밥을 맛있게 먹자.", q2: "밥을 마싯게 먹자.", answer: 1, explanation: "'맛있게'가 올바른 표기입니다." },
  { q1: "우리 같이 놀자.", q2: "우리 가치 놀자.", answer: 1, explanation: "'같이'가 올바른 표기입니다." },
  { q1: "나비가 날아요.", q2: "나비가 날라요.", answer: 1, explanation: "'날아요'가 올바른 표현입니다." },
  { q1: "책을 읽었다.", q2: "책을 일겄다.", answer: 1, explanation: "'읽었다'가 올바른 표기입니다." },
  { q1: "비가 와요.", q2: "비가 왜요.", answer: 1, explanation: "'와요'가 올바른 표현입니다." },
  { q1: "신발을 신었다.", q2: "신발을 싣었다.", answer: 1, explanation: "'신었다'가 올바른 표현입니다." },
  { q1: "아이스크림을 먹고 싶다.", q2: "아이스크림을 먹고 십다.", answer: 1, explanation: "'싶다'가 올바른 표기입니다." },
  { q1: "할머니 댁에 가요.", q2: "할머니 댁에 갸요.", answer: 1, explanation: "'가요'가 올바른 표현입니다." },
  { q1: "크레파스로 색칠해요.", q2: "크래파스로 색칠해요.", answer: 1, explanation: "'크레파스'가 올바른 표기입니다." },
  { q1: "바깥에서 놀아요.", q2: "바같에서 놀아요.", answer: 1, explanation: "'바깥'이 올바른 표기입니다." },
  { q1: "수박이 맛있다.", q2: "수박이 마싯다.", answer: 1, explanation: "'맛있다'가 올바른 표기입니다." },
];

export const grade1VocabData: VocabEntry[] = [
  { meanings: ["머리에 쓰는 것", "햇빛을 막아줘요"], answer: "모자" },
  { meanings: ["글을 쓰는 도구", "깎아서 사용해요"], answer: "연필" },
  { meanings: ["비가 올 때 쓰는 것", "접었다 펼 수 있어요"], answer: "우산" },
  { meanings: ["밤에 뜨는 것", "둥글고 밝아요"], answer: "달" },
  { meanings: ["아침에 뜨는 것", "세상을 밝게 해요"], answer: "해" },
  { meanings: ["물속에 사는 동물", "지느러미가 있어요"], answer: "물고기" },
  { meanings: ["하늘을 나는 것", "날개가 있어요"], answer: "새" },
  { meanings: ["땅에서 자라요", "물을 주면 커져요"], answer: "나무" },
  { meanings: ["엄마, 아빠가 있는 곳", "내가 사는 곳"], answer: "집" },
  { meanings: ["글을 읽을 수 있어요", "종이로 만들었어요"], answer: "책" },
  { meanings: ["발에 신는 것", "걸을 때 필요해요"], answer: "신발" },
  { meanings: ["맛있는 것을 먹는 곳", "가족이 모여요"], answer: "식탁" },
  { meanings: ["숫자를 세요", "1, 2, 3이 있어요"], answer: "수" },
  { meanings: ["봄에 피어요", "예쁜 향기가 나요"], answer: "꽃" },
  { meanings: ["하늘에서 내려요", "우산이 필요해요"], answer: "비" },
];

export const grade1MathData: MathEntry[] = [
  // 한 자리 수 덧셈
  { type: "calculation", expression: "3 + 2", answer: 5, steps: ["3 + 2 = 5"], unit: "덧셈" },
  { type: "calculation", expression: "4 + 5", answer: 9, steps: ["4 + 5 = 9"], unit: "덧셈" },
  { type: "calculation", expression: "6 + 3", answer: 9, steps: ["6 + 3 = 9"], unit: "덧셈" },
  { type: "calculation", expression: "2 + 7", answer: 9, steps: ["2 + 7 = 9"], unit: "덧셈" },
  { type: "calculation", expression: "1 + 8", answer: 9, steps: ["1 + 8 = 9"], unit: "덧셈" },
  { type: "calculation", expression: "5 + 4", answer: 9, steps: ["5 + 4 = 9"], unit: "덧셈" },
  { type: "calculation", expression: "3 + 3", answer: 6, steps: ["3 + 3 = 6"], unit: "덧셈" },
  { type: "calculation", expression: "7 + 2", answer: 9, steps: ["7 + 2 = 9"], unit: "덧셈" },
  // 한 자리 수 뺄셈
  { type: "calculation", expression: "9 - 3", answer: 6, steps: ["9 - 3 = 6"], unit: "뺄셈" },
  { type: "calculation", expression: "8 - 5", answer: 3, steps: ["8 - 5 = 3"], unit: "뺄셈" },
  { type: "calculation", expression: "7 - 4", answer: 3, steps: ["7 - 4 = 3"], unit: "뺄셈" },
  { type: "calculation", expression: "6 - 2", answer: 4, steps: ["6 - 2 = 4"], unit: "뺄셈" },
  { type: "calculation", expression: "5 - 1", answer: 4, steps: ["5 - 1 = 4"], unit: "뺄셈" },
  { type: "calculation", expression: "9 - 7", answer: 2, steps: ["9 - 7 = 2"], unit: "뺄셈" },
  { type: "calculation", expression: "8 - 8", answer: 0, steps: ["8 - 8 = 0"], unit: "뺄셈" },
  // 두 수 합성/분해
  { type: "calculation", expression: "4 + 1", answer: 5, steps: ["4와 1을 합하면 5"], unit: "수의 합성" },
  { type: "calculation", expression: "2 + 3", answer: 5, steps: ["2와 3을 합하면 5"], unit: "수의 합성" },
  { type: "calculation", expression: "6 + 1", answer: 7, steps: ["6과 1을 합하면 7"], unit: "수의 합성" },
  { type: "calculation", expression: "3 + 4", answer: 7, steps: ["3과 4를 합하면 7"], unit: "수의 합성" },
  { type: "calculation", expression: "5 + 3", answer: 8, steps: ["5와 3을 합하면 8"], unit: "수의 합성" },
];

export const grade1KnowledgeData: KnowledgeEntry[] = [
  { text: "우리나라 국기의 이름은 ___이다.", answer: "태극기", category: "상식" },
  { text: "1년은 ___개월이다.", answer: "12", category: "수학" },
  { text: "무지개는 ___가지 색깔이다.", answer: "7", category: "과학" },
  { text: "일주일은 ___일이다.", answer: "7", category: "수학" },
  { text: "우리가 숨 쉬는 기체는 ___이다.", answer: "공기", category: "과학" },
  { text: "해가 뜨는 방향은 ___쪽이다.", answer: "동", category: "과학" },
  { text: "물을 얼리면 ___이 된다.", answer: "얼음", category: "과학" },
  { text: "바나나의 색깔은 ___색이다.", answer: "노란", category: "상식" },
  { text: "눈은 ___색이다.", answer: "하얀", category: "자연" },
  { text: "강아지의 새끼를 ___라고 한다.", answer: "강아지", category: "동물" },
  { text: "고양이는 '___'하고 울어요.", answer: "야옹", category: "동물" },
  { text: "개구리는 '___'하고 울어요.", answer: "개굴", category: "동물" },
  { text: "하루는 ___시간이다.", answer: "24", category: "수학" },
  { text: "사과의 색깔은 ___색이다.", answer: "빨간", category: "상식" },
  { text: "봄 다음에 오는 계절은 ___이다.", answer: "여름", category: "자연" },
];

export const grade1SafetyData: SafetyEntry[] = [
  { text: "횡단보도에서는 ___ 신호에 건넌다.", answer: "초록", category: "교통안전" },
  { text: "모르는 사람을 따라가면 ___.", answer: "안 돼요", category: "생활안전" },
  { text: "계단에서는 ___지 않는다.", answer: "뛰", category: "학교안전" },
  { text: "불이 나면 ___번에 전화한다.", answer: "119", category: "화재안전" },
  { text: "길을 건널 때는 좌우를 ___.", answer: "살핀다", category: "교통안전" },
  { text: "교실에서는 ___지 않는다.", answer: "뛰", category: "학교안전" },
  { text: "가위는 ___을 잡고 건넨다.", answer: "날", category: "생활안전" },
  { text: "손을 자주 ___으면 병에 안 걸려요.", answer: "씻", category: "건강안전" },
  { text: "밥을 먹기 전에 ___를 씻어요.", answer: "손", category: "건강안전" },
  { text: "차가 오면 ___에서 기다려요.", answer: "인도", category: "교통안전" },
];

export const grade1WritingPrompts: string[] = [
  "내가 좋아하는 동물은 무엇인가요? 왜 좋아하나요?",
  "오늘 아침에 무엇을 먹었나요?",
  "가장 좋아하는 놀이는 무엇인가요?",
  "우리 가족을 소개해 보세요.",
  "좋아하는 색깔과 그 이유를 써 보세요.",
  "비 오는 날 무엇을 하고 싶은가요?",
  "내가 만약 하늘을 날 수 있다면?",
  "가장 좋아하는 음식은 무엇인가요?",
  "학교에서 가장 재미있는 시간은 언제인가요?",
  "나의 보물은 무엇인가요?",
  "동물원에 가면 무엇을 보고 싶은가요?",
  "내가 만약 마법사라면 무엇을 할까요?",
  "가장 기억에 남는 일은 무엇인가요?",
  "친구에게 편지를 써 보세요.",
  "내가 좋아하는 계절은 무엇인가요?",
  "어른이 되면 무엇이 되고 싶은가요?",
  "제일 좋아하는 과일은 무엇인가요?",
  "학교 가는 길에 무엇을 봤나요?",
  "내가 키우고 싶은 동물은?",
  "잠자기 전에 무엇을 하나요?",
];
