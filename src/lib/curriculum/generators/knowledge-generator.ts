import type { KnowledgeEntry } from "@/types/curriculum";

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

const BASE_12: KnowledgeEntry[] = [
  { text: '우리 몸에서 피를 온몸으로 보내는 기관은 ___이다.', answer: '심장', category: '인체' },
  { text: '식물이 자라려면 물, 햇빛, ___이 필요하다.', answer: '공기', category: '식물' },
  { text: '무지개는 ___가지 색으로 이루어져 있다.', answer: '일곱', category: '자연' },
  { text: '지구에서 가장 큰 바다는 ___이다.', answer: '태평양', category: '지리' },
  { text: '1년은 ___개월이다.', answer: '12', category: '수학상식' },
  { text: '물이 얼면 ___가 된다.', answer: '얼음', category: '과학' },
  { text: '우리나라의 국기는 ___이다.', answer: '태극기', category: '나라' },
  { text: '봄에 피는 대표적인 꽃은 ___이다.', answer: '벚꽃', category: '자연' },
  { text: '개구리는 ___에서 자란 뒤 물 밖으로 나온다.', answer: '물', category: '동물' },
  { text: '지구에서 가장 높은 산은 ___이다.', answer: '에베레스트', category: '지리' },
  { text: '코끼리의 긴 코를 ___라고 한다.', answer: '코', category: '동물' },
  { text: '하루는 ___시간이다.', answer: '24', category: '수학상식' },
  { text: '사람의 뼈는 약 ___개이다.', answer: '206', category: '인체' },
  { text: '비가 온 뒤 하늘에 뜨는 것은 ___이다.', answer: '무지개', category: '자연' },
  { text: '1주일은 ___일이다.', answer: '7', category: '수학상식' },
  { text: '귀로 하는 것은 ___이다.', answer: '듣기', category: '인체' },
  { text: '여름에 즐기는 과일로 초록색 껍질의 ___이 있다.', answer: '수박', category: '식물' },
  { text: '날씨가 추우면 물이 얼어 ___이 된다.', answer: '눈', category: '날씨' },
  { text: '태양은 ___쪽에서 뜬다.', answer: '동', category: '자연' },
  { text: '달은 약 ___일마다 모양이 바뀐다.', answer: '30', category: '우주' },
  { text: '식물의 뿌리는 ___에서 물을 흡수한다.', answer: '땅', category: '식물' },
  { text: '나비는 원래 ___였다가 변한다.', answer: '애벌레', category: '동물' },
  { text: '겨울에 내리는 하얀 것은 ___이다.', answer: '눈', category: '날씨' },
  { text: '우리나라의 수도는 ___이다.', answer: '서울', category: '지리' },
  { text: '사과는 ___색이다.', answer: '빨간', category: '식물' },
  { text: '밤에 하늘에서 빛나는 것은 ___이다.', answer: '별', category: '우주' },
  { text: '사람의 눈은 ___개이다.', answer: '2', category: '인체' },
  { text: '물고기는 ___로 숨을 쉰다.', answer: '아가미', category: '동물' },
  { text: '꿀을 만드는 곤충은 ___이다.', answer: '벌', category: '동물' },
  { text: '봄 다음에 오는 계절은 ___이다.', answer: '여름', category: '자연' },
  { text: '우유는 ___에서 나온다.', answer: '소', category: '동물' },
  { text: '태양계에서 지구는 ___번째 행성이다.', answer: '세', category: '우주' },
  { text: '혀로 느끼는 맛은 단맛, 짠맛, 신맛, ___이다.', answer: '쓴맛', category: '인체' },
  { text: '새는 ___을 이용해 날 수 있다.', answer: '날개', category: '동물' },
  { text: '바다의 물은 ___맛이 난다.', answer: '짠', category: '자연' },
  { text: '식물의 씨앗이 자라면 먼저 ___가 나온다.', answer: '싹', category: '식물' },
  { text: '한 해의 마지막 달은 ___월이다.', answer: '12', category: '수학상식' },
  { text: '비 올 때 쓰는 것은 ___이다.', answer: '우산', category: '생활상식' },
  { text: '추울 때 우리 몸을 따뜻하게 하는 것은 ___이다.', answer: '옷', category: '생활상식' },
  { text: '소리가 벽에 부딪혀 되돌아오는 것을 ___라고 한다.', answer: '메아리', category: '과학' },
  { text: '사과나무는 ___에 열매가 열린다.', answer: '가을', category: '식물' },
  { text: '닭이 낳는 것은 ___이다.', answer: '달걀', category: '동물' },
  { text: '식물이 햇빛을 받아 양분을 만드는 것을 ___이라 한다.', answer: '광합성', category: '과학' },
  { text: '화산에서 나오는 뜨거운 액체를 ___라고 한다.', answer: '용암', category: '지구과학' },
  { text: '공룡은 약 ___년 전에 살았다.', answer: '6500만', category: '과학' },
];

const BASE_34: KnowledgeEntry[] = [
  { text: '지구는 태양 주위를 도는데 이것을 ___이라 한다.', answer: '공전', category: '우주' },
  { text: '지구가 스스로 도는 것을 ___이라 한다.', answer: '자전', category: '우주' },
  { text: '물의 끓는점은 ___도이다.', answer: '100', category: '과학' },
  { text: '한반도의 가장 높은 산은 ___이다.', answer: '백두산', category: '지리' },
  { text: '우리나라 최초의 금속활자 인쇄물은 ___이다.', answer: '직지심체요절', category: '역사' },
  { text: '자석에는 N극과 ___극이 있다.', answer: 'S', category: '과학' },
  { text: '한글을 만든 왕은 ___이다.', answer: '세종대왕', category: '역사' },
  { text: '빛의 삼원색은 빨강, 초록, ___이다.', answer: '파랑', category: '과학' },
  { text: '우리나라의 국화는 ___이다.', answer: '무궁화', category: '나라' },
  { text: '물이 수증기로 변하는 것을 ___이라 한다.', answer: '증발', category: '과학' },
  { text: '수증기가 물방울로 변하는 것을 ___이라 한다.', answer: '응결', category: '과학' },
  { text: '식물이 물을 흡수하는 부분은 ___이다.', answer: '뿌리', category: '식물' },
  { text: '대한민국의 대통령이 사는 곳은 ___이다.', answer: '용산', category: '나라' },
  { text: '고구려, 백제, 신라를 합쳐 ___라고 부른다.', answer: '삼국', category: '역사' },
  { text: '지도에서 위쪽은 ___을 나타낸다.', answer: '북쪽', category: '지리' },
  { text: '우리 몸에서 음식을 소화하는 기관은 ___이다.', answer: '위', category: '인체' },
  { text: '빛이 물체에 가로막혀 생기는 것은 ___이다.', answer: '그림자', category: '과학' },
  { text: '지구의 자연위성은 ___이다.', answer: '달', category: '우주' },
  { text: '한반도를 가로지르는 큰 강은 한강과 ___이다.', answer: '낙동강', category: '지리' },
  { text: '독도는 ___에 있는 우리나라 영토이다.', answer: '동해', category: '지리' },
  { text: '소금을 물에 녹이면 ___이 된다.', answer: '소금물', category: '과학' },
  { text: '전구에 불이 켜지려면 ___가 흘러야 한다.', answer: '전기', category: '과학' },
  { text: '식물의 잎이 하는 가장 중요한 일은 ___이다.', answer: '광합성', category: '식물' },
  { text: '지진이 바다에서 일어나면 ___가 발생할 수 있다.', answer: '해일', category: '지구과학' },
  { text: '화성은 ___색으로 보여서 붉은 행성이라 불린다.', answer: '붉은', category: '우주' },
  { text: '임진왜란 때 바다에서 싸운 장군은 ___이다.', answer: '이순신', category: '역사' },
  { text: '거북선을 만든 사람은 ___이다.', answer: '이순신', category: '역사' },
  { text: '온도를 재는 도구는 ___이다.', answer: '온도계', category: '과학' },
  { text: '비가 되기 전 하늘에 모인 것은 ___이다.', answer: '구름', category: '날씨' },
  { text: '태양에서 지구까지 빛이 도달하는 데 약 ___분 걸린다.', answer: '8', category: '우주' },
  { text: '나침반의 바늘은 항상 ___을 가리킨다.', answer: '북쪽', category: '과학' },
  { text: '곤충의 몸은 머리, 가슴, ___으로 나뉜다.', answer: '배', category: '동물' },
  { text: '양서류는 물과 ___에서 모두 살 수 있다.', answer: '육지', category: '동물' },
  { text: '밀물과 썰물을 일으키는 것은 ___의 인력이다.', answer: '달', category: '지구과학' },
  { text: '철은 ___에 붙는 성질이 있다.', answer: '자석', category: '과학' },
];

const BASE_56: KnowledgeEntry[] = [
  { text: '원자를 이루는 양성자, 중성자, ___이 있다.', answer: '전자', category: '과학' },
  { text: '식물 세포에만 있는 것으로 ___이 있다.', answer: '세포벽', category: '생물' },
  { text: '산소와 수소가 결합하면 ___이 된다.', answer: '물', category: '화학' },
  { text: '지구의 자전축은 약 ___도 기울어져 있다.', answer: '23.5', category: '지구과학' },
  { text: '소리의 빠르기를 ___라고 한다.', answer: '음속', category: '물리' },
  { text: '인체에서 가장 큰 장기는 ___이다.', answer: '간', category: '인체' },
  { text: '태양계에서 가장 큰 행성은 ___이다.', answer: '목성', category: '우주' },
  { text: '화석연료를 태우면 ___가 배출된다.', answer: '이산화탄소', category: '환경' },
  { text: '전기가 잘 통하는 물질을 ___라 한다.', answer: '도체', category: '물리' },
  { text: '전기가 통하지 않는 물질을 ___라 한다.', answer: '부도체', category: '물리' },
  { text: '빛이 렌즈를 지날 때 꺾이는 현상을 ___이라 한다.', answer: '굴절', category: '물리' },
  { text: 'DNA는 ___의 유전 정보를 담고 있다.', answer: '생물', category: '생물' },
  { text: '먹이사슬의 가장 아래에는 ___이 있다.', answer: '식물', category: '생태' },
  { text: '적혈구가 하는 일은 ___을 운반하는 것이다.', answer: '산소', category: '인체' },
  { text: '달이 지구 그림자에 가려지는 것을 ___이라 한다.', answer: '월식', category: '우주' },
  { text: '해가 달에 가려지는 현상을 ___이라 한다.', answer: '일식', category: '우주' },
  { text: '암석이 풍화되어 만들어지는 것은 ___이다.', answer: '흙', category: '지구과학' },
  { text: '화산 활동으로 생긴 바위를 ___암이라 한다.', answer: '화성', category: '지구과학' },
  { text: '물체의 빠르기를 나타내는 것을 ___라 한다.', answer: '속력', category: '물리' },
  { text: '힘의 크기를 재는 단위는 ___이다.', answer: '뉴턴', category: '물리' },
  { text: '산성과 염기성의 중간을 ___이라 한다.', answer: '중성', category: '화학' },
  { text: '리트머스 종이가 파란색에서 빨간색으로 변하면 ___이다.', answer: '산성', category: '화학' },
  { text: '백혈구는 우리 몸에서 ___을 막는 역할을 한다.', answer: '병균', category: '인체' },
  { text: '지구의 내부 구조는 지각, 맨틀, ___으로 나뉜다.', answer: '핵', category: '지구과학' },
  { text: '태양의 표면 온도는 약 ___도이다.', answer: '6000', category: '우주' },
  { text: '광합성에서 식물이 내보내는 기체는 ___이다.', answer: '산소', category: '생물' },
  { text: '호흡에서 사람이 내보내는 기체는 ___이다.', answer: '이산화탄소', category: '인체' },
  { text: '온도가 높아지면 물질의 부피가 ___한다.', answer: '팽창', category: '물리' },
  { text: '지구 대기의 약 78%를 차지하는 기체는 ___이다.', answer: '질소', category: '지구과학' },
  { text: '오존층은 태양의 ___를 차단한다.', answer: '자외선', category: '환경' },
  { text: '전자석은 ___가 흐를 때만 자석이 된다.', answer: '전기', category: '물리' },
  { text: '혈액형은 A형, B형, O형, ___형이 있다.', answer: 'AB', category: '인체' },
  { text: '공기 중 산소의 비율은 약 ___퍼센트이다.', answer: '21', category: '지구과학' },
  { text: '소리는 ___을 통해 전달된다.', answer: '매질', category: '물리' },
  { text: '진공에서는 소리가 전달되지 ___는다.', answer: '않', category: '물리' },
];

function shuffle<T>(arr: T[], random: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateKnowledgePool(grade: number, seed: number): KnowledgeEntry[] {
  const random = seededRandom(seed * 13 + grade * 47);
  let pool: KnowledgeEntry[];
  if (grade <= 2) pool = BASE_12;
  else if (grade <= 4) pool = [...BASE_12, ...BASE_34];
  else pool = [...BASE_34, ...BASE_56];
  return shuffle(pool, random);
}
