import type { SpellingEntry, VocabEntry, KnowledgeEntry, SafetyEntry, MathEntry, HanjaEntry, EnglishEntry } from '@/types/curriculum';

// 6학년 1학기 교육과정 성취기준
export const grade6Semester1Standards = {
  math: [
    { code: "[6수01-08]", desc: "분수의 나눗셈을 이해하고 계산할 수 있다", unit: "분수의 나눗셈", difficulty: 6, weeks: [1, 3] as [number, number] },
    { code: "[6수01-09]", desc: "소수의 나눗셈을 이해하고 계산할 수 있다", unit: "소수의 나눗셈", difficulty: 6, weeks: [4, 6] as [number, number] },
    { code: "[6수02-04]", desc: "각기둥과 각뿔의 구성 요소와 성질을 이해한다", unit: "각기둥과 각뿔", difficulty: 6, weeks: [7, 9] as [number, number] },
    { code: "[6수01-10]", desc: "두 양의 크기를 비교하는 상황을 통해 비의 개념을 이해한다", unit: "비와 비율", difficulty: 6, weeks: [10, 12] as [number, number] },
    { code: "[6수01-11]", desc: "비율을 이해하고 백분율로 나타낼 수 있다", unit: "비와 비율", difficulty: 6, weeks: [10, 12] as [number, number] },
    { code: "[6수04-02]", desc: "비율그래프를 해석하고 그릴 수 있다", unit: "여러 가지 그래프", difficulty: 6, weeks: [13, 15] as [number, number] },
  ],
  korean: [
    { code: "[6국01-03]", desc: "절차와 규칙을 지키고 근거를 제시하며 토론한다", unit: "토론", difficulty: 6, weeks: [1, 3] as [number, number] },
    { code: "[6국02-03]", desc: "글을 읽고 글쓴이가 말하고자 하는 주장이나 주제를 파악한다", unit: "주장과 근거", difficulty: 6, weeks: [4, 7] as [number, number] },
    { code: "[6국03-03]", desc: "목적이나 대상에 따라 알맞은 형식과 자료를 사용하여 설명하는 글을 쓴다", unit: "설명하는 글", difficulty: 6, weeks: [8, 11] as [number, number] },
    { code: "[6국04-02]", desc: "관용 표현을 이해하고 적절하게 활용한다", unit: "관용 표현", difficulty: 6, weeks: [12, 14] as [number, number] },
  ],
  english: [
    { code: "[6영01-03]", desc: "일상생활에 관한 짧고 쉬운 말이나 대화를 듣고 세부 정보를 파악할 수 있다", unit: "Listening", difficulty: 6, weeks: [1, 4] as [number, number] },
    { code: "[6영02-03]", desc: "일상생활에 관한 짧고 쉬운 글을 읽고 세부 정보를 파악할 수 있다", unit: "Reading", difficulty: 6, weeks: [5, 8] as [number, number] },
    { code: "[6영03-02]", desc: "자신의 일상생활에 관해 짧은 글을 쓸 수 있다", unit: "Writing", difficulty: 6, weeks: [9, 12] as [number, number] },
    { code: "[6영04-01]", desc: "간단한 문장을 정확하게 쓸 수 있다", unit: "Writing", difficulty: 6, weeks: [13, 15] as [number, number] },
  ],
};

export const grade6Semester2Standards = {
  math: [
    { code: "[6수01-12]", desc: "비례식을 알고 그 성질을 이해하며 이를 활용하여 문제를 해결할 수 있다", unit: "비례식과 비례배분", difficulty: 6, weeks: [1, 3] as [number, number] },
    { code: "[6수01-13]", desc: "비례배분을 이해하고 문제를 해결할 수 있다", unit: "비례식과 비례배분", difficulty: 6, weeks: [1, 3] as [number, number] },
    { code: "[6수02-05]", desc: "원주와 원의 넓이를 구할 수 있다", unit: "원의 넓이", difficulty: 6, weeks: [4, 6] as [number, number] },
    { code: "[6수02-06]", desc: "원기둥의 겉넓이와 부피를 구할 수 있다", unit: "원기둥, 원뿔, 구", difficulty: 6, weeks: [7, 9] as [number, number] },
    { code: "[6수03-02]", desc: "무게, 들이, 넓이의 단위 사이의 관계를 이해한다", unit: "단위 환산", difficulty: 6, weeks: [10, 12] as [number, number] },
    { code: "[6수04-03]", desc: "자료를 수집, 분류, 정리하여 목적에 맞는 그래프로 나타내고 해석할 수 있다", unit: "자료와 가능성", difficulty: 6, weeks: [13, 15] as [number, number] },
  ],
  korean: [
    { code: "[6국01-04]", desc: "자신의 의견을 뒷받침하는 자료를 제시하며 발표한다", unit: "발표", difficulty: 6, weeks: [1, 3] as [number, number] },
    { code: "[6국02-04]", desc: "글을 읽고 내용의 타당성과 표현의 적절성을 판단한다", unit: "비판적 읽기", difficulty: 6, weeks: [4, 7] as [number, number] },
    { code: "[6국05-02]", desc: "작품 속 세계와 현실 세계를 비교하며 작품을 감상한다", unit: "문학 감상", difficulty: 6, weeks: [8, 11] as [number, number] },
  ],
  english: [
    { code: "[6영01-04]", desc: "일상생활에 관한 짧고 쉬운 대화를 듣고 일이나 사건의 순서를 파악할 수 있다", unit: "Listening", difficulty: 6, weeks: [1, 4] as [number, number] },
    { code: "[6영02-04]", desc: "일상생활에 관한 짧고 쉬운 글을 읽고 일이나 사건의 순서를 파악할 수 있다", unit: "Reading", difficulty: 6, weeks: [5, 8] as [number, number] },
  ],
};

export const grade6SpellingData: SpellingEntry[] = [
  { q1: "윗사람에게 예절을 갖추다.", q2: "웃사람에게 예절을 갖추다.", answer: 1, explanation: "'윗사람'이 올바른 사이시옷 표기입니다." },
  { q1: "이따가 만나자.", q2: "있다가 만나자.", answer: 1, explanation: "'이따가'(조금 후에)가 올바른 표기입니다." },
  { q1: "삼가 조의를 표합니다.", q2: "삼가 조의를 표함니다.", answer: 1, explanation: "'표합니다'가 올바른 표기입니다." },
  { q1: "무릎을 꿇었다.", q2: "무릎을 꿀었다.", answer: 1, explanation: "'꿇었다'가 올바른 표기입니다." },
  { q1: "어떻게 해야 좋을까?", q2: "어떡게 해야 좋을까?", answer: 1, explanation: "'어떻게'가 올바른 표기입니다." },
  { q1: "아무튼 열심히 하자.", q2: "아뭏든 열심히 하자.", answer: 1, explanation: "'아무튼'이 올바른 표기입니다." },
  { q1: "건강에 해롭다.", q2: "건강에 해롭따.", answer: 1, explanation: "'해롭다'가 올바른 표기입니다." },
  { q1: "초조하게 기다렸다.", q2: "초조하께 기다렸다.", answer: 1, explanation: "'초조하게'가 올바른 표기입니다." },
  { q1: "삶의 여유를 즐기다.", q2: "삶의 여유를 즐기다.", answer: 1, explanation: "'즐기다'가 올바른 표기입니다." },
  { q1: "일이 틀어졌다.", q2: "일이 틀려졌다.", answer: 1, explanation: "'틀어지다'는 '뒤틀리다'의 뜻, '틀리다'는 '잘못되다'의 뜻입니다." },
  { q1: "곤이곤대로 받아들였다.", q2: "고니곤대로 받아들였다.", answer: 1, explanation: "'곤이곤대로'가 올바른 표기입니다." },
  { q1: "갈수록 태산이다.", q2: "갈수록 태산이다.", answer: 1, explanation: "'갈수록 태산'은 올바른 관용구입니다." },
  { q1: "그가 납득했다.", q2: "그가 납덕했다.", answer: 1, explanation: "'납득'이 올바른 표기입니다." },
  { q1: "폐허가 되었다.", q2: "페허가 되었다.", answer: 1, explanation: "'폐허'가 올바른 표기입니다." },
  { q1: "한가한 오후를 보냈다.", q2: "한가한 오후를 보낸다.", answer: 1, explanation: "'보냈다'(과거형)가 문맥에 맞습니다." },
  { q1: "수확이 풍성하다.", q2: "수확이 풍성하다.", answer: 1, explanation: "'풍성하다'가 올바른 표기입니다." },
  { q1: "깍두기를 만들었다.", q2: "깎두기를 만들었다.", answer: 1, explanation: "'깍두기'가 올바른 표기입니다." },
  { q1: "사나흘 만에 완성했다.", q2: "사나흘만에 완성했다.", answer: 1, explanation: "'사나흘 만에'처럼 '만에'는 띄어 씁니다." },
  { q1: "새해 복 많이 받으세요.", q2: "새해 복 만이 받으세요.", answer: 1, explanation: "'많이'가 올바른 표기입니다." },
  { q1: "만사가 귀찮다.", q2: "만사가 귀찬타.", answer: 1, explanation: "'귀찮다'가 올바른 표기입니다." },
  { q1: "불우 이웃을 도왔다.", q2: "불우 이웃을 도왔다.", answer: 1, explanation: "'도왔다'가 올바른 표기입니다." },
];

export const grade6VocabData: VocabEntry[] = [
  { meanings: ["국가 간의 약속", "나라와 나라가 맺는 것"], answer: "조약" },
  { meanings: ["사회에서 지켜야 할 행동 기준", "법과 비슷하지만 강제성이 약해요"], answer: "규범" },
  { meanings: ["옳고 그름을 판단하는 능력", "선과 악을 구별해요"], answer: "양심" },
  { meanings: ["생물이 환경에 맞게 변하는 것", "다윈이 연구했어요"], answer: "진화" },
  { meanings: ["한 나라의 주요 산업", "국가 경제의 기둥이에요"], answer: "기간산업" },
  { meanings: ["국민이 나라에 내는 돈", "소득세, 부가세 등이 있어요"], answer: "세금" },
  { meanings: ["다른 나라로 물건을 파는 것", "반대말은 수입이에요"], answer: "수출" },
  { meanings: ["권리를 지키기 위해 대표를 뽑는 것", "민주주의의 기본이에요"], answer: "선거" },
  { meanings: ["자연을 있는 그대로 지키는 것", "동식물을 보호해요"], answer: "보전" },
  { meanings: ["원래 있던 사람", "그 지역에 처음부터 살던 사람들"], answer: "원주민" },
  { meanings: ["의견이 달라 부딪치는 것", "화해가 필요해요"], answer: "갈등" },
  { meanings: ["말이나 글의 앞뒤 관계", "문맥이라고도 해요"], answer: "맥락" },
  { meanings: ["개인의 자유와 권리를 보장하는 원리", "국가 운영의 기본 원리"], answer: "민주주의" },
  { meanings: ["생각이나 주장을 뒷받침하는 사실", "논증에 필요해요"], answer: "근거" },
  { meanings: ["서로 돕고 함께 발전하는 것", "윈윈이라고도 해요"], answer: "상생" },
];

export const grade6MathData: MathEntry[] = [
  // 분수의 나눗셈
  { type: "calculation", expression: "3/4 ÷ 1/2", answer: 3, steps: ["나누는 분수를 뒤집어 곱합니다", "3/4 × 2/1 = 6/4", "약분: 6/4 = 3/2 = 1과 1/2"], unit: "분수의 나눗셈", numbers: [3, 4, 1, 2] },
  { type: "calculation", expression: "2/3 ÷ 4/9", answer: 3, steps: ["나누는 분수를 뒤집어 곱합니다", "2/3 × 9/4 = 18/12", "약분: 18/12 = 3/2 = 1과 1/2"], unit: "분수의 나눗셈", numbers: [2, 3, 4, 9] },
  { type: "calculation", expression: "5/6 ÷ 2/3", answer: 5, steps: ["나누는 분수를 뒤집어 곱합니다", "5/6 × 3/2 = 15/12", "약분: 15/12 = 5/4 = 1과 1/4"], unit: "분수의 나눗셈", numbers: [5, 6, 2, 3] },
  // 소수의 나눗셈
  { type: "calculation", expression: "7.2 ÷ 0.8", answer: 9, steps: ["소수점을 오른쪽으로 한 칸 이동", "72 ÷ 8 = 9"], unit: "소수의 나눗셈" },
  { type: "calculation", expression: "4.56 ÷ 1.2", answer: 3.8, steps: ["소수점을 오른쪽으로 한 칸 이동", "45.6 ÷ 12 = 3.8"], unit: "소수의 나눗셈" },
  { type: "calculation", expression: "6.25 ÷ 2.5", answer: 2.5, steps: ["소수점을 오른쪽으로 한 칸 이동", "62.5 ÷ 25 = 2.5"], unit: "소수의 나눗셈" },
  // 비와 비율
  { type: "calculation", expression: "12 : 16의 가장 간단한 비", answer: 3, steps: ["12와 16의 최대공약수: 4", "12 ÷ 4 = 3, 16 ÷ 4 = 4", "가장 간단한 비: 3 : 4"], unit: "비와 비율" },
  { type: "calculation", expression: "25는 50의 몇 %?", answer: 50, steps: ["비율 = 25 ÷ 50 = 0.5", "백분율 = 0.5 × 100 = 50%"], unit: "백분율" },
  { type: "calculation", expression: "80의 30%", answer: 24, steps: ["80 × 30/100", "80 × 0.3 = 24"], unit: "백분율" },
  { type: "calculation", expression: "할인 전 10000원, 20% 할인 후 가격", answer: 8000, steps: ["할인 금액: 10000 × 20/100 = 2000원", "할인 후: 10000 - 2000 = 8000원"], unit: "백분율 활용" },
  // 비례식
  { type: "calculation", expression: "3 : 5 = 9 : x에서 x", answer: 15, steps: ["외항의 곱 = 내항의 곱", "3 × x = 5 × 9", "3x = 45", "x = 15"], unit: "비례식" },
  { type: "calculation", expression: "4 : x = 8 : 12에서 x", answer: 6, steps: ["외항의 곱 = 내항의 곱", "4 × 12 = x × 8", "48 = 8x", "x = 6"], unit: "비례식" },
  // 비례배분
  { type: "calculation", expression: "120을 3:5로 비례배분 (작은 쪽)", answer: 45, steps: ["전체 비: 3 + 5 = 8", "작은 쪽: 120 × 3/8 = 45", "큰 쪽: 120 × 5/8 = 75"], unit: "비례배분" },
  // 원의 넓이
  { type: "calculation", expression: "반지름 5cm인 원의 넓이 (π=3.14)", answer: 78.5, steps: ["원의 넓이 = π × r²", "3.14 × 5 × 5 = 3.14 × 25", "답: 78.5cm²"], unit: "원의 넓이" },
  { type: "calculation", expression: "지름 10cm인 원의 원주 (π=3.14)", answer: 31.4, steps: ["원주 = π × 지름", "3.14 × 10 = 31.4", "답: 31.4cm"], unit: "원주" },
  // 원기둥의 부피
  { type: "calculation", expression: "밑면 반지름 3cm, 높이 10cm 원기둥의 부피 (π=3.14)", answer: 282.6, steps: ["원기둥의 부피 = π × r² × 높이", "3.14 × 9 × 10", "답: 282.6cm³"], unit: "원기둥의 부피" },
  // 복합 문제
  { type: "calculation", expression: "3/5 × 2/7 ÷ 6/35", answer: 1, steps: ["먼저 곱셈: 3/5 × 2/7 = 6/35", "다음 나눗셈: 6/35 ÷ 6/35 = 1", "답: 1"], unit: "분수 혼합 계산", numbers: [3, 5, 2, 7] },
  { type: "calculation", expression: "15 : 20을 가장 간단한 정수의 비로", answer: 3, steps: ["15와 20의 최대공약수: 5", "15 ÷ 5 = 3, 20 ÷ 5 = 4", "가장 간단한 비: 3 : 4"], unit: "비와 비율" },
  { type: "calculation", expression: "200의 15%에서 200의 10%를 빼면", answer: 10, steps: ["200 × 0.15 = 30", "200 × 0.10 = 20", "30 - 20 = 10"], unit: "백분율" },
  { type: "calculation", expression: "윗변 5cm, 아랫변 9cm, 높이 6cm 사다리꼴의 넓이", answer: 42, steps: ["사다리꼴의 넓이 = (윗변 + 아랫변) × 높이 ÷ 2", "(5 + 9) × 6 ÷ 2 = 14 × 6 ÷ 2", "84 ÷ 2 = 42", "답: 42cm²"], unit: "넓이" },
];

export const grade6KnowledgeData: KnowledgeEntry[] = [
  { text: "대한민국 임시정부가 세워진 도시는 ___이다.", answer: "상하이", category: "역사" },
  { text: "UN의 한국어 명칭은 ___이다.", answer: "국제연합", category: "사회" },
  { text: "광합성에서 빛에너지를 흡수하는 색소는 ___이다.", answer: "엽록소", category: "과학" },
  { text: "지구 대기의 약 78%를 차지하는 기체는 ___이다.", answer: "질소", category: "과학" },
  { text: "대한민국 헌법 제1조 1항: 대한민국은 ___이다.", answer: "민주공화국", category: "사회" },
  { text: "DNA는 ___의 약자이다.", answer: "디옥시리보핵산", category: "과학" },
  { text: "우리나라 최초의 한글 소설은 ___이다.", answer: "홍길동전", category: "문학" },
  { text: "3·1 운동이 일어난 해는 ___년이다.", answer: "1919", category: "역사" },
  { text: "지구의 자전축은 ___도 기울어져 있다.", answer: "23.5", category: "과학" },
  { text: "경제에서 수요와 ___의 법칙이 시장 가격을 결정한다.", answer: "공급", category: "사회" },
  { text: "산성 용액의 pH는 ___보다 작다.", answer: "7", category: "과학" },
  { text: "조선 시대에 천체를 관측하던 기구를 ___이라 한다.", answer: "혼천의", category: "역사" },
  { text: "원주율(π)의 소수점 아래 두 자리까지의 값은 ___이다.", answer: "3.14", category: "수학" },
  { text: "빛의 세 원색은 빨강, 초록, ___이다.", answer: "파랑", category: "과학" },
  { text: "세계 인권 선언이 채택된 해는 ___년이다.", answer: "1948", category: "사회" },
];

export const grade6SafetyData: SafetyEntry[] = [
  { text: "딥페이크 영상은 ___으로 만들어진 가짜 영상이다.", answer: "인공지능", category: "정보안전" },
  { text: "저작권이 있는 자료를 무단으로 사용하면 ___에 해당한다.", answer: "저작권 침해", category: "정보안전" },
  { text: "CCTV에 찍힌 영상을 함부로 퍼뜨리면 ___을 침해할 수 있다.", answer: "초상권", category: "정보안전" },
  { text: "학교 폭력을 목격하면 ___에 신고한다.", answer: "117", category: "학교안전" },
  { text: "화학 물질에 의한 화상은 즉시 ___로 15분 이상 씻는다.", answer: "흐르는 물", category: "실험안전" },
  { text: "미세먼지 '매우 나쁨' 단계에서는 ___활동을 하지 않는다.", answer: "실외", category: "건강안전" },
  { text: "지진 대피 시 머리를 ___으로 보호한다.", answer: "방석이나 가방", category: "재난안전" },
  { text: "성폭력 피해를 입으면 즉시 ___에 도움을 요청한다.", answer: "경찰 또는 상담센터", category: "생활안전" },
  { text: "감염병 예방을 위해 기침할 때는 ___으로 입과 코를 가린다.", answer: "옷소매", category: "건강안전" },
  { text: "화재 시 대피할 때 엘리베이터 대신 ___를 이용한다.", answer: "비상계단", category: "화재안전" },
];

export const grade6HanjaData: HanjaEntry[] = [
  { character: "政", reading: "정", meaning: "정사 정", strokes: 9, words: ["정치", "정부", "행정"], sentence: "政治에 관심을 가지자." },
  { character: "經", reading: "경", meaning: "경영할 경", strokes: 13, words: ["경제", "경험", "경영"], sentence: "經濟를 배우면 세상을 이해할 수 있다." },
  { character: "社", reading: "사", meaning: "모일 사", strokes: 8, words: ["사회", "회사", "사원"], sentence: "社會에 기여하는 사람이 되자." },
  { character: "會", reading: "회", meaning: "모일 회", strokes: 13, words: ["사회", "회의", "기회"], sentence: "會議에서 의견을 나누었다." },
  { character: "法", reading: "법", meaning: "법 법", strokes: 9, words: ["법률", "방법", "헌법"], sentence: "法을 지키는 시민이 되자." },
  { character: "正", reading: "정", meaning: "바를 정", strokes: 5, words: ["정의", "정직", "공정"], sentence: "正義로운 사회를 만들자." },
  { character: "義", reading: "의", meaning: "옳을 의", strokes: 13, words: ["의미", "정의", "주의"], sentence: "民主主義를 수호하자." },
  { character: "自", reading: "자", meaning: "스스로 자", strokes: 6, words: ["자유", "자연", "자기"], sentence: "自由는 소중한 권리이다." },
  { character: "由", reading: "유", meaning: "말미암을 유", strokes: 5, words: ["자유", "이유", "유래"], sentence: "自由를 위해 싸운 선조들을 기억하자." },
  { character: "平", reading: "평", meaning: "평평할 평", strokes: 5, words: ["평화", "평등", "평균"], sentence: "平和로운 세상을 꿈꾼다." },
  { character: "和", reading: "화", meaning: "화할 화", strokes: 8, words: ["평화", "화합", "조화"], sentence: "和合하여 발전하자." },
  { character: "世", reading: "세", meaning: "인간 세", strokes: 5, words: ["세계", "세대", "세기"], sentence: "世界 평화를 위해 노력하자." },
  { character: "界", reading: "계", meaning: "지경 계", strokes: 9, words: ["세계", "한계", "경계"], sentence: "世界는 넓고 할 일은 많다." },
  { character: "歷", reading: "역", meaning: "지날 역", strokes: 16, words: ["역사", "경력", "이력"], sentence: "歷史를 잊은 민족에게 미래는 없다." },
  { character: "史", reading: "사", meaning: "역사 사", strokes: 5, words: ["역사", "사학", "사관"], sentence: "歷史에서 교훈을 얻자." },
  { character: "敎", reading: "교", meaning: "가르칠 교", strokes: 11, words: ["교육", "교사", "종교"], sentence: "敎育은 백년지대계이다." },
];

export const grade6EnglishData: EnglishEntry[] = [
  { sentence: "I have been studying English for three years.", translation: "나는 3년 동안 영어를 공부해 왔어.", word: "studying", pronunciation: "스터디잉", practice: ["I have been ___ for ___.", "How long have you been studying?"] },
  { sentence: "If it rains tomorrow, we will stay home.", translation: "내일 비가 오면 우리는 집에 있을 거야.", word: "if", pronunciation: "이프", practice: ["If ___, we will ___.", "What will you do if it snows?"] },
  { sentence: "The book was written by a famous author.", translation: "그 책은 유명한 작가가 썼어.", word: "written", pronunciation: "리튼", practice: ["The ___ was ___ by ___.", "Who wrote this book?"] },
  { sentence: "I think recycling is very important.", translation: "나는 재활용이 매우 중요하다고 생각해.", word: "recycling", pronunciation: "리사이클링", practice: ["I think ___ is important.", "Why is recycling important?"] },
  { sentence: "Could you tell me how to get to the station?", translation: "역까지 어떻게 가는지 알려주시겠어요?", word: "station", pronunciation: "스테이션", practice: ["Could you tell me how to ___?", "How do I get to the library?"] },
  { sentence: "She is not only smart but also kind.", translation: "그녀는 똑똑할 뿐만 아니라 친절하기도 해.", word: "not only", pronunciation: "낫 온리", practice: ["He is not only ___ but also ___.", "She is both smart and kind."] },
  { sentence: "We should respect different cultures.", translation: "우리는 다양한 문화를 존중해야 해.", word: "respect", pronunciation: "리스펙트", practice: ["We should respect ___.", "It is important to respect others."] },
  { sentence: "The population of Korea is about 50 million.", translation: "한국의 인구는 약 5천만 명이야.", word: "population", pronunciation: "파퓰레이션", practice: ["The population of ___ is ___.", "What is the population of Seoul?"] },
  { sentence: "I am interested in science.", translation: "나는 과학에 관심이 있어.", word: "interested", pronunciation: "인터레스티드", practice: ["I am interested in ___.", "What are you interested in?"] },
  { sentence: "It is necessary to save energy.", translation: "에너지를 절약하는 것은 필요해.", word: "necessary", pronunciation: "네서세리", practice: ["It is necessary to ___.", "Is it necessary to study?"] },
  { sentence: "I would like to visit many countries in the future.", translation: "나는 미래에 많은 나라를 방문하고 싶어.", word: "future", pronunciation: "퓨처", practice: ["In the future, I want to ___.", "What is your plan for the future?"] },
  { sentence: "The festival was held last weekend.", translation: "그 축제는 지난 주말에 열렸어.", word: "festival", pronunciation: "페스티벌", practice: ["The ___ was held ___.", "When was the festival?"] },
  { sentence: "You should apologize to your friend.", translation: "너는 친구에게 사과해야 해.", word: "apologize", pronunciation: "어팔러자이즈", practice: ["You should apologize to ___.", "I am sorry for my mistake."] },
  { sentence: "Global warming is a serious problem.", translation: "지구 온난화는 심각한 문제야.", word: "global", pronunciation: "글로벌", practice: ["___ is a serious problem.", "What can we do about global warming?"] },
  { sentence: "I prefer reading to watching TV.", translation: "나는 TV 보는 것보다 독서를 더 좋아해.", word: "prefer", pronunciation: "프리퍼", practice: ["I prefer ___ to ___.", "Do you prefer tea or coffee?"] },
];

export const grade6WritingPrompts: string[] = [
  "민주주의의 의미와 우리 생활에서의 실천 방안에 대해 논술하세요.",
  "과학 기술의 발전이 가져올 미래 사회를 예측하는 글을 쓰세요.",
  "환경 문제(기후 변화, 미세먼지 등)에 대한 자신의 견해를 논리적으로 서술하세요.",
  "역사 속 중요한 사건 하나를 골라 그 의의를 설명하는 글을 쓰세요.",
  "좋은 리더에게 필요한 자질에 대해 자신의 생각을 쓰세요.",
  "인공지능 시대에 인간이 갖추어야 할 능력은 무엇인지 논하세요.",
  "다문화 사회에서 서로 다른 문화를 이해하는 방법에 대해 쓰세요.",
  "나의 꿈과 그것을 이루기 위한 구체적인 계획을 써 보세요.",
  "독서의 가치에 대해 설득력 있는 글을 쓰세요.",
  "학교 폭력의 원인과 해결 방안에 대해 논하세요.",
  "우리 사회에서 평등이 왜 중요한지 자신의 생각을 쓰세요.",
  "소셜 미디어가 청소년에게 미치는 영향을 분석하는 글을 쓰세요.",
  "통일의 필요성과 방법에 대한 자신의 견해를 밝히세요.",
  "졸업을 앞두고 초등학교 생활을 돌아보는 에세이를 쓰세요.",
  "존경하는 역사적 인물의 업적을 소개하고 현대 사회에 주는 교훈을 쓰세요.",
  "'책임'이란 무엇인지 구체적인 예를 들어 설명하세요.",
  "지속 가능한 발전이란 무엇이며, 우리가 할 수 있는 일은 무엇인지 쓰세요.",
  "세계 시민으로서 갖추어야 할 태도에 대해 논술하세요.",
  "나에게 가장 큰 영향을 준 책과 그 이유를 쓰세요.",
  "미래의 후배들에게 전하고 싶은 메시지를 편지로 쓰세요.",
];
