import type { SpellingEntry, VocabEntry, KnowledgeEntry, SafetyEntry, MathEntry, HanjaEntry, EnglishEntry } from '@/types/curriculum';

// 5학년 1학기 교육과정 성취기준
export const grade5Semester1Standards = {
  math: [
    { code: "[6수01-01]", desc: "자연수의 혼합 계산에서 계산 순서를 알고 혼합 계산을 할 수 있다", unit: "자연수의 혼합 계산", difficulty: 5, weeks: [1, 3] as [number, number] },
    { code: "[6수01-02]", desc: "약수와 배수의 관계를 이해한다", unit: "약수와 배수", difficulty: 5, weeks: [4, 6] as [number, number] },
    { code: "[6수01-03]", desc: "최대공약수와 최소공배수를 구할 수 있다", unit: "약수와 배수", difficulty: 5, weeks: [4, 6] as [number, number] },
    { code: "[6수01-04]", desc: "약분과 통분을 할 수 있다", unit: "약분과 통분", difficulty: 5, weeks: [7, 9] as [number, number] },
    { code: "[6수01-05]", desc: "분모가 다른 분수의 덧셈과 뺄셈을 할 수 있다", unit: "분수의 덧셈과 뺄셈", difficulty: 5, weeks: [10, 12] as [number, number] },
    { code: "[6수02-01]", desc: "직육면체와 정육면체를 이해하고 구성 요소를 안다", unit: "직육면체", difficulty: 5, weeks: [13, 15] as [number, number] },
  ],
  korean: [
    { code: "[6국01-01]", desc: "구어 의사소통의 특성을 바탕으로 하여 듣기·말하기 활동을 한다", unit: "의사소통", difficulty: 5, weeks: [1, 3] as [number, number] },
    { code: "[6국02-01]", desc: "읽기는 배경지식과 글에 있는 정보를 활용하여 의미를 구성하는 과정임을 안다", unit: "읽기 과정", difficulty: 5, weeks: [4, 7] as [number, number] },
    { code: "[6국03-01]", desc: "쓰기는 절차에 따라 의미를 구성하고 표현하는 과정임을 이해하고 글을 쓴다", unit: "글쓰기 과정", difficulty: 5, weeks: [8, 11] as [number, number] },
    { code: "[6국04-01]", desc: "낱말이 상황에 따라 다양하게 해석됨을 탐구한다", unit: "낱말의 의미", difficulty: 5, weeks: [12, 14] as [number, number] },
  ],
  english: [
    { code: "[6영01-01]", desc: "쉽고 간단한 문장을 듣고 세부 정보를 파악할 수 있다", unit: "Listening", difficulty: 5, weeks: [1, 4] as [number, number] },
    { code: "[6영02-01]", desc: "일상생활에 관한 짧고 쉬운 글을 읽고 세부 정보를 파악할 수 있다", unit: "Reading", difficulty: 5, weeks: [5, 8] as [number, number] },
    { code: "[6영03-01]", desc: "일상생활에 관한 주제에 대해 짧고 간단하게 쓸 수 있다", unit: "Writing", difficulty: 5, weeks: [9, 12] as [number, number] },
  ],
};

export const grade5Semester2Standards = {
  math: [
    { code: "[6수01-06]", desc: "분수의 곱셈을 할 수 있다", unit: "분수의 곱셈", difficulty: 5, weeks: [1, 3] as [number, number] },
    { code: "[6수02-02]", desc: "합동의 의미를 알고 합동인 도형의 성질을 이해한다", unit: "합동과 대칭", difficulty: 5, weeks: [4, 6] as [number, number] },
    { code: "[6수02-03]", desc: "선대칭도형과 점대칭도형을 이해한다", unit: "합동과 대칭", difficulty: 5, weeks: [4, 6] as [number, number] },
    { code: "[6수01-07]", desc: "소수의 곱셈을 할 수 있다", unit: "소수의 곱셈", difficulty: 5, weeks: [7, 9] as [number, number] },
    { code: "[6수03-01]", desc: "넓이의 단위를 알고 직사각형의 넓이를 구할 수 있다", unit: "넓이", difficulty: 5, weeks: [10, 12] as [number, number] },
    { code: "[6수04-01]", desc: "평균의 의미를 알고 구할 수 있다", unit: "평균과 가능성", difficulty: 5, weeks: [13, 15] as [number, number] },
  ],
  korean: [
    { code: "[6국01-02]", desc: "의견을 제시하고 함께 조정하며 토의한다", unit: "토의", difficulty: 5, weeks: [1, 3] as [number, number] },
    { code: "[6국02-02]", desc: "글의 구조를 고려하여 글 전체의 내용을 요약한다", unit: "요약", difficulty: 5, weeks: [4, 7] as [number, number] },
    { code: "[6국03-02]", desc: "목적이나 주제에 따라 알맞은 내용과 매체를 선정하여 글을 쓴다", unit: "목적에 맞게 쓰기", difficulty: 5, weeks: [8, 11] as [number, number] },
  ],
  english: [
    { code: "[6영01-02]", desc: "일상생활에 관한 쉽고 간단한 말이나 대화를 듣고 주제 및 요지를 파악할 수 있다", unit: "Listening", difficulty: 5, weeks: [1, 4] as [number, number] },
    { code: "[6영02-02]", desc: "짧고 쉬운 글을 읽고 주제 및 요지를 파악할 수 있다", unit: "Reading", difficulty: 5, weeks: [5, 8] as [number, number] },
  ],
};

export const grade5SpellingData: SpellingEntry[] = [
  { q1: "역할을 충실히 했다.", q2: "역활을 충실히 했다.", answer: 1, explanation: "'역할'이 올바른 표기입니다." },
  { q1: "왠지 불안하다.", q2: "웬지 불안하다.", answer: 1, explanation: "'왠지'(왜인지의 줄임)가 올바른 표기입니다." },
  { q1: "어떡해, 큰일이다.", q2: "어떻해, 큰일이다.", answer: 1, explanation: "'어떡해'(어떻게 해의 줄임)가 올바른 표기입니다." },
  { q1: "더 이상 참을 수 없다.", q2: "더이상 참을 수 없다.", answer: 1, explanation: "'더 이상'은 띄어 쓰는 것이 맞습니다." },
  { q1: "안 되겠다.", q2: "안되겠다.", answer: 1, explanation: "'안 되다'는 띄어 씁니다. '안되다'(불쌍하다)와 구분합니다." },
  { q1: "며칠째 비가 온다.", q2: "몇일째 비가 온다.", answer: 1, explanation: "'며칠'이 올바른 표기입니다." },
  { q1: "수수께끼를 풀었다.", q2: "수수깨끼를 풀었다.", answer: 1, explanation: "'수수께끼'가 올바른 표기입니다." },
  { q1: "귀띔해 주었다.", q2: "귀뜀해 주었다.", answer: 1, explanation: "'귀띔'이 올바른 표기입니다." },
  { q1: "짜장면을 먹었다.", q2: "자장면을 먹었다.", answer: 1, explanation: "'짜장면'이 현재 표준어입니다. (2011년 복수 표준어 인정)" },
  { q1: "주위 환경을 살폈다.", q2: "주위 환경을 살폈다.", answer: 1, explanation: "'살폈다'가 올바른 표기입니다." },
  { q1: "물음에 대답했다.", q2: "물읨에 대답했다.", answer: 1, explanation: "'물음'이 올바른 표기입니다." },
  { q1: "사달이 나다.", q2: "사달이 나다.", answer: 1, explanation: "'사달'이 올바른 표기입니다." },
  { q1: "한참 동안 걸었다.", q2: "한참동안 걸었다.", answer: 1, explanation: "'한참 동안'은 띄어 쓰는 것이 맞습니다." },
  { q1: "뒤처지지 않도록 노력했다.", q2: "뒤쳐지지 않도록 노력했다.", answer: 1, explanation: "'뒤처지다'가 올바른 표기입니다." },
  { q1: "들이켜다 - 물을 벌컥 들이켰다.", q2: "들이키다 - 물을 벌컥 들이켰다.", answer: 1, explanation: "'들이켜다'가 올바른 표기입니다." },
  { q1: "눈꼽이 끼었다.", q2: "눈곱이 끼었다.", answer: 2, explanation: "'눈곱'이 올바른 표기입니다." },
  { q1: "벌써 가을이다.", q2: "벌서 가을이다.", answer: 1, explanation: "'벌써'가 올바른 표기입니다." },
  { q1: "소나기가 그쳤다.", q2: "소나기가 그쳣다.", answer: 1, explanation: "'그쳤다'가 올바른 표기입니다." },
  { q1: "축구 시합에서 이겼다.", q2: "축구 시합에서 이겼따.", answer: 1, explanation: "'이겼다'가 올바른 표기입니다." },
  { q1: "맨 나중에 왔다.", q2: "맨나중에 왔다.", answer: 1, explanation: "'맨 나중'은 띄어 쓰는 것이 맞습니다." },
  { q1: "조금이나마 도움이 되었다.", q2: "조금이라마 도움이 되었다.", answer: 1, explanation: "'조금이나마'가 올바른 표기입니다." },
];

export const grade5VocabData: VocabEntry[] = [
  { meanings: ["자기 잘못을 깨닫고 뉘우치는 것", "반성과 비슷해요"], answer: "성찰" },
  { meanings: ["처음 시작하는 것", "새로운 제도를 만드는 것"], answer: "창시" },
  { meanings: ["어떤 사실을 널리 알리는 것", "광고와 비슷해요"], answer: "홍보" },
  { meanings: ["힘을 합쳐 일하는 것", "함께 노력하는 것"], answer: "협력" },
  { meanings: ["갈등을 평화롭게 푸는 것", "합의와 비슷해요"], answer: "타협" },
  { meanings: ["새로운 것을 만들어 내는 것", "발명과 비슷해요"], answer: "창조" },
  { meanings: ["어떤 것에 마음이 끌리는 것", "호기심과 비슷해요"], answer: "관심" },
  { meanings: ["과학에서 가설을 증명하는 과정", "실험실에서 해요"], answer: "실험" },
  { meanings: ["여러 사람의 의견을 모으는 것", "투표와 관련 있어요"], answer: "여론" },
  { meanings: ["나라를 위해 목숨을 바친 사람", "독립운동가가 해당돼요"], answer: "순국" },
  { meanings: ["물체가 움직이는 빠르기", "시간 대비 거리로 구해요"], answer: "속력" },
  { meanings: ["다른 나라와 물건을 사고파는 것", "수출과 수입이 있어요"], answer: "무역" },
  { meanings: ["편견 없이 공정하게 판단하는 것", "법과 관련 있어요"], answer: "공정" },
  { meanings: ["자연 현상을 연구하는 학문", "실험과 관찰로 탐구해요"], answer: "과학" },
  { meanings: ["어떤 문제를 깊이 생각하는 것", "탐구와 비슷해요"], answer: "고찰" },
];

export const grade5MathData: MathEntry[] = [
  // 약수와 배수
  { type: "calculation", expression: "24의 약수", answer: 8, steps: ["1, 2, 3, 4, 6, 8, 12, 24", "약수의 개수: 8개"], unit: "약수와 배수" },
  { type: "calculation", expression: "12와 18의 최대공약수", answer: 6, steps: ["12의 약수: 1, 2, 3, 4, 6, 12", "18의 약수: 1, 2, 3, 6, 9, 18", "공약수: 1, 2, 3, 6", "최대공약수: 6"], unit: "최대공약수" },
  { type: "calculation", expression: "4와 6의 최소공배수", answer: 12, steps: ["4의 배수: 4, 8, 12, 16, ...", "6의 배수: 6, 12, 18, ...", "최소공배수: 12"], unit: "최소공배수" },
  { type: "calculation", expression: "15와 20의 최대공약수", answer: 5, steps: ["15 = 3 × 5", "20 = 2 × 2 × 5", "공통 소인수: 5", "최대공약수: 5"], unit: "최대공약수" },
  { type: "calculation", expression: "8과 12의 최소공배수", answer: 24, steps: ["8 = 2 × 2 × 2", "12 = 2 × 2 × 3", "최소공배수: 2 × 2 × 2 × 3 = 24"], unit: "최소공배수" },
  // 분모가 다른 분수 덧셈/뺄셈
  { type: "calculation", expression: "1/3 + 1/4", answer: 7, steps: ["통분: 4/12 + 3/12", "분자끼리 더하기: 4 + 3 = 7", "답: 7/12"], unit: "분수 덧셈", numbers: [1, 3, 1, 4] },
  { type: "calculation", expression: "2/5 + 1/3", answer: 11, steps: ["통분: 6/15 + 5/15", "분자끼리 더하기: 6 + 5 = 11", "답: 11/15"], unit: "분수 덧셈", numbers: [2, 5, 1, 3] },
  { type: "calculation", expression: "3/4 - 1/6", answer: 7, steps: ["통분: 9/12 - 2/12", "분자끼리 빼기: 9 - 2 = 7", "답: 7/12"], unit: "분수 뺄셈", numbers: [3, 4, 1, 6] },
  { type: "calculation", expression: "5/6 - 2/9", answer: 11, steps: ["통분: 15/18 - 4/18", "분자끼리 빼기: 15 - 4 = 11", "답: 11/18"], unit: "분수 뺄셈", numbers: [5, 6, 2, 9] },
  // 분수의 곱셈
  { type: "calculation", expression: "2/3 × 3/4", answer: 6, steps: ["분자끼리 곱하기: 2 × 3 = 6", "분모끼리 곱하기: 3 × 4 = 12", "6/12 = 1/2", "약분한 답: 1/2"], unit: "분수의 곱셈", numbers: [2, 3, 3, 4] },
  { type: "calculation", expression: "4/5 × 5/8", answer: 20, steps: ["분자끼리 곱하기: 4 × 5 = 20", "분모끼리 곱하기: 5 × 8 = 40", "20/40 = 1/2"], unit: "분수의 곱셈", numbers: [4, 5, 5, 8] },
  { type: "calculation", expression: "3 × 2/5", answer: 6, steps: ["3/1 × 2/5", "분자끼리 곱하기: 3 × 2 = 6", "분모: 5", "답: 6/5 = 1과 1/5"], unit: "분수의 곱셈", numbers: [3, 1, 2, 5] },
  // 소수의 곱셈
  { type: "calculation", expression: "2.4 × 3", answer: 7.2, steps: ["24 × 3 = 72", "소수점 한 자리이므로", "답: 7.2"], unit: "소수의 곱셈" },
  { type: "calculation", expression: "1.5 × 2.4", answer: 3.6, steps: ["15 × 24 = 360", "소수점 아래 자릿수의 합: 2자리", "답: 3.60 = 3.6"], unit: "소수의 곱셈" },
  { type: "calculation", expression: "0.7 × 0.8", answer: 0.56, steps: ["7 × 8 = 56", "소수점 아래 자릿수의 합: 2자리", "답: 0.56"], unit: "소수의 곱셈" },
  // 넓이
  { type: "calculation", expression: "가로 8cm, 세로 5cm 직사각형의 넓이", answer: 40, steps: ["직사각형의 넓이 = 가로 × 세로", "8 × 5 = 40", "답: 40cm²"], unit: "넓이" },
  { type: "calculation", expression: "밑변 10cm, 높이 6cm 삼각형의 넓이", answer: 30, steps: ["삼각형의 넓이 = 밑변 × 높이 ÷ 2", "10 × 6 ÷ 2 = 30", "답: 30cm²"], unit: "넓이" },
  { type: "calculation", expression: "밑변 12cm, 높이 8cm 평행사변형의 넓이", answer: 96, steps: ["평행사변형의 넓이 = 밑변 × 높이", "12 × 8 = 96", "답: 96cm²"], unit: "넓이" },
  // 평균
  { type: "calculation", expression: "85, 90, 75, 80, 70의 평균", answer: 80, steps: ["합계: 85 + 90 + 75 + 80 + 70 = 400", "개수: 5개", "평균: 400 ÷ 5 = 80"], unit: "평균" },
  { type: "calculation", expression: "92, 88, 76, 84의 평균", answer: 85, steps: ["합계: 92 + 88 + 76 + 84 = 340", "개수: 4개", "평균: 340 ÷ 4 = 85"], unit: "평균" },
];

export const grade5KnowledgeData: KnowledgeEntry[] = [
  { text: "한반도의 기후는 대체로 ___대 기후에 속한다.", answer: "온", category: "지리" },
  { text: "우리나라 최초의 헌법은 ___년에 제정되었다.", answer: "1948", category: "역사" },
  { text: "세포에서 에너지를 만드는 기관은 ___이다.", answer: "미토콘드리아", category: "과학" },
  { text: "지구의 자전 방향은 ___에서 동이다.", answer: "서", category: "과학" },
  { text: "삼국을 통일한 나라는 ___이다.", answer: "신라", category: "역사" },
  { text: "물질의 가장 작은 단위를 ___이라 한다.", answer: "원자", category: "과학" },
  { text: "국회에서 법을 만드는 것을 ___이라 한다.", answer: "입법", category: "사회" },
  { text: "조선 시대의 신분 제도는 양반, 중인, 상민, ___이 있다.", answer: "천민", category: "역사" },
  { text: "식물의 기공에서는 ___와 산소를 교환한다.", answer: "이산화탄소", category: "과학" },
  { text: "대한민국의 3권 분립은 입법, 행정, ___이다.", answer: "사법", category: "사회" },
  { text: "속력의 단위는 ___이다.", answer: "km/h", category: "과학" },
  { text: "소수점 아래 첫째 자리 숫자를 ___의 자리라 한다.", answer: "소수 첫째", category: "수학" },
  { text: "6·25 전쟁은 ___년에 시작되었다.", answer: "1950", category: "역사" },
  { text: "혈액을 온몸으로 보내는 기관을 ___이라 한다.", answer: "심장", category: "과학" },
  { text: "우리나라의 경제 체제는 ___경제이다.", answer: "시장", category: "사회" },
];

export const grade5SafetyData: SafetyEntry[] = [
  { text: "개인정보를 요구하는 이메일은 ___일 수 있다.", answer: "피싱", category: "정보안전" },
  { text: "SNS에 위치 정보를 올리면 ___의 위험이 있다.", answer: "사생활 침해", category: "정보안전" },
  { text: "실험 중 화학 약품이 피부에 닿으면 즉시 ___로 씻는다.", answer: "흐르는 물", category: "실험안전" },
  { text: "황사가 심한 날에는 ___을 착용하고 외출한다.", answer: "마스크", category: "건강안전" },
  { text: "응급 상황 시 ___을 실시하면 생명을 구할 수 있다.", answer: "심폐소생술", category: "응급안전" },
  { text: "산에서 길을 잃으면 ___으로 이동하지 말고 제자리에서 구조를 기다린다.", answer: "아래", category: "생활안전" },
  { text: "음식물에 의한 기도 폐쇄 시 ___법을 실시한다.", answer: "하임리히", category: "응급안전" },
  { text: "폭염 시 야외 활동을 ___하고 시원한 곳에 머문다.", answer: "자제", category: "건강안전" },
  { text: "낯선 사람의 택배를 대신 ___하면 안 된다.", answer: "수령", category: "생활안전" },
  { text: "가정 내 비상 약품함에는 ___가 비치되어 있어야 한다.", answer: "소독약", category: "건강안전" },
];

export const grade5HanjaData: HanjaEntry[] = [
  { character: "文", reading: "문", meaning: "글월 문", strokes: 4, words: ["문학", "문화", "작문"], sentence: "文學 작품을 감상했다." },
  { character: "字", reading: "자", meaning: "글자 자", strokes: 6, words: ["한자", "문자", "활자"], sentence: "한글 字를 바르게 쓰자." },
  { character: "書", reading: "서", meaning: "글 서", strokes: 10, words: ["서적", "도서", "서예"], sentence: "圖書관에서 책을 읽었다." },
  { character: "數", reading: "수", meaning: "셈 수", strokes: 15, words: ["수학", "숫자", "다수"], sentence: "數學 문제를 풀었다." },
  { character: "理", reading: "리", meaning: "다스릴 리", strokes: 11, words: ["이치", "관리", "도리"], sentence: "道理에 맞게 행동하자." },
  { character: "科", reading: "과", meaning: "과목 과", strokes: 9, words: ["과학", "교과", "과목"], sentence: "科學 실험을 했다." },
  { character: "東", reading: "동", meaning: "동녘 동", strokes: 8, words: ["동쪽", "동양", "극동"], sentence: "해가 東쪽에서 뜬다." },
  { character: "西", reading: "서", meaning: "서녘 서", strokes: 6, words: ["서쪽", "서양", "서울"], sentence: "해가 西쪽으로 진다." },
  { character: "南", reading: "남", meaning: "남녘 남", strokes: 9, words: ["남쪽", "남방", "남극"], sentence: "南쪽으로 여행을 갔다." },
  { character: "北", reading: "북", meaning: "북녘 북", strokes: 5, words: ["북쪽", "북극", "북한"], sentence: "나침반은 北쪽을 가리킨다." },
  { character: "白", reading: "백", meaning: "흰 백", strokes: 5, words: ["백색", "고백", "공백"], sentence: "白雪이 온 세상을 덮었다." },
  { character: "靑", reading: "청", meaning: "푸를 청", strokes: 8, words: ["청소년", "청춘", "청색"], sentence: "靑春은 아름답다." },
  { character: "年", reading: "년", meaning: "해 년", strokes: 6, words: ["연도", "내년", "올해"], sentence: "새 年이 밝았다." },
  { character: "時", reading: "시", meaning: "때 시", strokes: 10, words: ["시간", "시대", "시기"], sentence: "時間을 아껴 쓰자." },
  { character: "力", reading: "력", meaning: "힘 력", strokes: 2, words: ["노력", "체력", "힘"], sentence: "努力하면 꿈을 이룰 수 있다." },
  { character: "心", reading: "심", meaning: "마음 심", strokes: 4, words: ["마음", "양심", "관심"], sentence: "善한 心을 가지자." },
];

export const grade5EnglishData: EnglishEntry[] = [
  { sentence: "What do you want to be when you grow up?", translation: "커서 무엇이 되고 싶니?", word: "grow up", pronunciation: "그로우 업", practice: ["When I grow up, I want to be a ___.", "What do you want to be?"] },
  { sentence: "I usually wake up at 7 o'clock.", translation: "나는 보통 7시에 일어나.", word: "usually", pronunciation: "유주얼리", practice: ["I usually ___ at ___.", "What do you usually do?"] },
  { sentence: "My hobby is reading books.", translation: "내 취미는 독서야.", word: "hobby", pronunciation: "하비", practice: ["My hobby is ___.", "What is your hobby?"] },
  { sentence: "Could you say that again, please?", translation: "다시 말씀해 주시겠어요?", word: "again", pronunciation: "어겐", practice: ["Could you ___ again?", "Please say that again."] },
  { sentence: "I have been to Jeju Island.", translation: "나는 제주도에 가 본 적이 있어.", word: "been", pronunciation: "빈", practice: ["I have been to ___.", "Have you been to Seoul?"] },
  { sentence: "There are many flowers in the garden.", translation: "정원에 많은 꽃이 있어.", word: "garden", pronunciation: "가든", practice: ["There are ___ in the ___.", "How many flowers?"] },
  { sentence: "She is taller than me.", translation: "그녀는 나보다 키가 커.", word: "taller", pronunciation: "톨러", practice: ["___ is taller than ___.", "Who is the tallest?"] },
  { sentence: "I need to finish my homework.", translation: "나는 숙제를 끝내야 해.", word: "finish", pronunciation: "피니쉬", practice: ["I need to finish ___.", "Did you finish your homework?"] },
  { sentence: "What subject do you like the most?", translation: "어떤 과목을 가장 좋아하니?", word: "subject", pronunciation: "서브젝트", practice: ["I like ___ the most.", "What subject is easy?"] },
  { sentence: "We should protect the environment.", translation: "우리는 환경을 보호해야 해.", word: "environment", pronunciation: "인바이런먼트", practice: ["We should protect ___.", "The environment is important."] },
  { sentence: "I am looking forward to the field trip.", translation: "나는 현장학습이 기대돼.", word: "forward", pronunciation: "포워드", practice: ["I am looking forward to ___.", "Are you excited?"] },
  { sentence: "Please turn off the lights.", translation: "불을 꺼 주세요.", word: "turn off", pronunciation: "턴 오프", practice: ["Please turn off the ___.", "Turn on the TV."] },
  { sentence: "He is good at playing the piano.", translation: "그는 피아노 연주를 잘해.", word: "good at", pronunciation: "굿 앳", practice: ["I am good at ___.", "What are you good at?"] },
  { sentence: "How was your weekend?", translation: "주말 어땠어?", word: "weekend", pronunciation: "위켄드", practice: ["How was your ___?", "My weekend was great."] },
  { sentence: "I agree with your opinion.", translation: "나는 네 의견에 동의해.", word: "agree", pronunciation: "어그리", practice: ["I agree with ___.", "Do you agree?"] },
];

export const grade5WritingPrompts: string[] = [
  "우리 사회의 문제점 하나를 선택하여 해결 방안을 제시하는 글을 써 보세요.",
  "존경하는 위인에게 편지를 써 보세요.",
  "내가 생각하는 좋은 리더의 조건에 대해 논술해 보세요.",
  "과학 기술의 발전이 우리 생활에 미치는 영향을 써 보세요.",
  "독서의 중요성에 대해 설득하는 글을 써 보세요.",
  "인터넷 사용의 장단점에 대해 의견을 써 보세요.",
  "역사 속 인물 한 명을 인터뷰한다면 어떤 질문을 할까요?",
  "환경 오염의 원인과 해결책에 대해 써 보세요.",
  "우정이란 무엇인지 자신의 경험을 바탕으로 써 보세요.",
  "내가 만약 다른 나라에서 태어났다면 어떤 삶을 살았을까요?",
  "학교에서 배운 것 중 가장 유익한 내용과 그 이유를 써 보세요.",
  "나의 강점과 약점을 분석하고 발전 계획을 써 보세요.",
  "가족의 의미에 대해 에세이를 써 보세요.",
  "내가 만약 1일 대통령이 된다면 무엇을 할까요?",
  "시(詩) 한 편을 읽고 감상문을 써 보세요.",
  "내가 살고 싶은 미래 도시를 상상하여 묘사해 보세요.",
  "봉사 활동의 경험과 느낀 점을 써 보세요.",
  "전통 문화를 보존해야 하는 이유를 설명하는 글을 써 보세요.",
  "동화 속 주인공에게 조언하는 편지를 써 보세요.",
  "나만의 시간 관리 방법을 소개하는 글을 써 보세요.",
];
