/**
 * Procedural Science & Social Studies Problem Generator
 * Generates grade-appropriate knowledge entries for Korean elementary curriculum.
 */
import type { KnowledgeEntry } from '@/types/curriculum';

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── SCIENCE DATA ───────────────────────────────────────────

interface ScienceItem {
  text: string;
  answer: string;
  category: string;
  gradeGroup: 'lower' | 'upper' | 'both';
  unit?: string;
}

const SCIENCE_ITEMS: ScienceItem[] = [
  // ── 물리 (Physics) ──
  { text: '용수철에 물체를 매달면 늘어나는 힘을 ___이라 한다.', answer: '탄성력', category: '물리', gradeGroup: 'lower' },
  { text: '물체가 빠르기와 방향을 가지고 움직이는 정도를 ___라 한다.', answer: '속력', category: '물리', gradeGroup: 'lower' },
  { text: '물체의 빠르기를 재는 단위로 km/h 또는 ___를 사용한다.', answer: 'm/s', category: '물리', gradeGroup: 'upper' },
  { text: '지구가 물체를 끌어당기는 힘을 ___이라 한다.', answer: '중력', category: '물리', gradeGroup: 'both' },
  { text: '물체가 운동 방향과 반대로 받는 힘을 ___이라 한다.', answer: '마찰력', category: '물리', gradeGroup: 'upper' },
  { text: '움직이지 않는 물체는 계속 멈추려는 성질을 ___이라 한다.', answer: '관성', category: '물리', gradeGroup: 'upper' },
  { text: '작은 힘으로 무거운 물체를 들어 올리는 도구를 ___라 한다.', answer: '지레', category: '물리', gradeGroup: 'lower' },
  { text: '지레에서 받침점, 힘점, ___의 세 점이 있다.', answer: '작용점', category: '물리', gradeGroup: 'lower' },
  { text: '물체를 비탈면 위로 올리면 힘은 작아지지만 ___은 길어진다.', answer: '거리', category: '물리', gradeGroup: 'upper' },
  { text: '도르래를 사용하면 힘의 ___을 바꿀 수 있다.', answer: '방향', category: '물리', gradeGroup: 'upper' },
  { text: '움직 도르래를 사용하면 힘이 ___로 줄어든다.', answer: '반', category: '물리', gradeGroup: 'upper' },
  { text: '물체의 무게는 ___저울로 측정할 수 있다.', answer: '용수철', category: '물리', gradeGroup: 'lower' },
  { text: '무게의 단위로 g, kg, ___을 사용한다.', answer: 'N', category: '물리', gradeGroup: 'upper' },
  { text: '수평잡기에서 무거운 쪽이 ___으로 기운다.', answer: '아래', category: '물리', gradeGroup: 'lower' },
  { text: '같은 무게의 물체라도 접촉면이 넓으면 ___이 줄어든다.', answer: '압력', category: '물리', gradeGroup: 'upper' },
  { text: '물체의 운동 상태를 변화시키는 원인을 ___이라 한다.', answer: '힘', category: '물리', gradeGroup: 'lower' },

  // ── 화학 (Chemistry) ──
  { text: '물이 100도에서 끓어 기체가 되는 현상을 ___라 한다.', answer: '기화', category: '화학', gradeGroup: 'upper' },
  { text: '물질이 산소와 빠르게 반응하여 빛과 열을 내는 현상을 ___이라 한다.', answer: '연소', category: '화학', gradeGroup: 'upper' },
  { text: '연소 후 촛불에서 생기는 기체는 ___이다.', answer: '이산화탄소', category: '화학', gradeGroup: 'upper' },
  { text: '산성 용액에 리트머스 종이를 넣으면 ___색으로 변한다.', answer: '붉은', category: '화학', gradeGroup: 'upper' },
  { text: '염기성 용액에 리트머스 종이를 넣으면 ___색으로 변한다.', answer: '푸른', category: '화학', gradeGroup: 'upper' },
  { text: '식초는 ___성 용액이다.', answer: '산', category: '화학', gradeGroup: 'upper' },
  { text: '비누물은 ___성 용액이다.', answer: '염기', category: '화학', gradeGroup: 'upper' },
  { text: '소금이 물에 녹아 보이지 않게 되는 현상을 ___라 한다.', answer: '용해', category: '화학', gradeGroup: 'upper' },
  { text: '용해에서 녹이는 액체를 ___라 한다.', answer: '용매', category: '화학', gradeGroup: 'upper' },
  { text: '용해에서 녹는 물질을 ___라 한다.', answer: '용질', category: '화학', gradeGroup: 'upper' },
  { text: '용질이 용매에 녹아 만들어진 액체를 ___이라 한다.', answer: '용액', category: '화학', gradeGroup: 'upper' },
  { text: '물질의 세 가지 상태는 고체, 액체, ___이다.', answer: '기체', category: '화학', gradeGroup: 'lower' },
  { text: '고체가 열을 받아 액체로 변하는 것을 ___이라 한다.', answer: '융해', category: '화학', gradeGroup: 'upper' },
  { text: '액체가 열을 잃어 고체로 변하는 것을 ___라 한다.', answer: '응고', category: '화학', gradeGroup: 'upper' },
  { text: '기체가 차가운 면에서 액체로 변하는 것을 ___라 한다.', answer: '액화', category: '화학', gradeGroup: 'upper' },
  { text: '물질이 타고 난 뒤 남는 검은 물질을 ___라 한다.', answer: '재', category: '화학', gradeGroup: 'lower' },
  { text: '물에 설탕을 넣고 저으면 설탕이 ___된다.', answer: '용해', category: '화학', gradeGroup: 'lower' },
  { text: '철이 공기 중의 산소와 반응하여 붉게 변하는 것을 ___이라 한다.', answer: '녹', category: '화학', gradeGroup: 'upper' },

  // ── 생물 (Biology) ──
  { text: '식물이 빛을 이용하여 양분을 만드는 과정을 ___이라 한다.', answer: '광합성', category: '생물', gradeGroup: 'upper' },
  { text: '광합성에 필요한 기체는 ___이다.', answer: '이산화탄소', category: '생물', gradeGroup: 'upper' },
  { text: '광합성의 결과 만들어지는 기체는 ___이다.', answer: '산소', category: '생물', gradeGroup: 'upper' },
  { text: '식물의 잎에서 물이 수증기로 나가는 현상을 ___이라 한다.', answer: '증산작용', category: '생물', gradeGroup: 'upper' },
  { text: '뿌리에서 흡수한 물이 이동하는 관을 ___이라 한다.', answer: '물관', category: '생물', gradeGroup: 'upper' },
  { text: '잎에서 만든 양분이 이동하는 관을 ___이라 한다.', answer: '체관', category: '생물', gradeGroup: 'upper' },
  { text: '동물의 알이 깨어나 새끼가 되는 것을 ___이라 한다.', answer: '부화', category: '생물', gradeGroup: 'lower' },
  { text: '배추흰나비의 한살이 순서는 알→애벌레→번데기→___이다.', answer: '어른벌레', category: '생물', gradeGroup: 'lower' },
  { text: '개구리처럼 올챙이에서 변하는 과정을 ___이라 한다.', answer: '변태', category: '생물', gradeGroup: 'lower' },
  { text: '씨가 싹을 틔우는 것을 ___이라 한다.', answer: '발아', category: '생물', gradeGroup: 'lower' },
  { text: '꽃의 수술에서 만들어지는 가루를 ___이라 한다.', answer: '꽃가루', category: '생물', gradeGroup: 'lower' },
  { text: '꽃가루가 암술머리에 붙는 것을 ___라 한다.', answer: '수분', category: '생물', gradeGroup: 'lower' },
  { text: '수분 후 씨방이 자라서 ___이 된다.', answer: '열매', category: '생물', gradeGroup: 'lower' },
  { text: '동물이 겨울을 나기 위해 긴 잠을 자는 것을 ___이라 한다.', answer: '겨울잠', category: '생물', gradeGroup: 'lower' },
  { text: '생물이 환경에 맞게 몸의 생김새가 변하는 것을 ___이라 한다.', answer: '적응', category: '생물', gradeGroup: 'upper' },
  { text: '세포 안에서 유전 정보를 담고 있는 물질을 ___라 한다.', answer: 'DNA', category: '생물', gradeGroup: 'upper' },

  // ── 지구과학 (Earth Science) ──
  { text: '지구의 표면을 이루는 딱딱한 층을 ___이라 한다.', answer: '지각', category: '지구과학', gradeGroup: 'upper' },
  { text: '흐르는 물에 의해 바위가 깎이는 현상을 ___이라 한다.', answer: '침식', category: '지구과학', gradeGroup: 'lower' },
  { text: '깎인 돌과 흙이 다른 곳에 쌓이는 것을 ___이라 한다.', answer: '퇴적', category: '지구과학', gradeGroup: 'lower' },
  { text: '모래, 진흙 등이 쌓여 굳어진 암석을 ___암이라 한다.', answer: '퇴적', category: '지구과학', gradeGroup: 'lower' },
  { text: '마그마가 식어서 만들어진 암석을 ___암이라 한다.', answer: '화성', category: '지구과학', gradeGroup: 'upper' },
  { text: '열과 압력을 받아 성질이 변한 암석을 ___암이라 한다.', answer: '변성', category: '지구과학', gradeGroup: 'upper' },
  { text: '화산이 폭발할 때 나오는 녹은 돌을 ___라 한다.', answer: '용암', category: '지구과학', gradeGroup: 'lower' },
  { text: '땅속에서 녹아 있는 돌을 ___라 한다.', answer: '마그마', category: '지구과학', gradeGroup: 'lower' },
  { text: '땅이 갑자기 흔들리는 현상을 ___라 한다.', answer: '지진', category: '지구과학', gradeGroup: 'lower' },
  { text: '지진의 세기를 나타내는 단위를 ___라 한다.', answer: '규모', category: '지구과학', gradeGroup: 'upper' },
  { text: '지층에서 발견되는 옛날 생물의 흔적을 ___라 한다.', answer: '화석', category: '지구과학', gradeGroup: 'lower' },
  { text: '화석을 통해 과거 지구의 ___을 알 수 있다.', answer: '환경', category: '지구과학', gradeGroup: 'lower' },
  { text: '흙은 바위가 오랜 시간 ___작용을 받아 만들어진다.', answer: '풍화', category: '지구과학', gradeGroup: 'lower' },
  { text: '강 하류에서는 퇴적이 잘 일어나 ___이 만들어진다.', answer: '평야', category: '지구과학', gradeGroup: 'lower' },
  { text: '바닷물이 육지 쪽으로 들어오는 것을 ___라 한다.', answer: '밀물', category: '지구과학', gradeGroup: 'lower' },
  { text: '바닷물이 빠져나가는 것을 ___라 한다.', answer: '썰물', category: '지구과학', gradeGroup: 'lower' },

  // ── 환경 (Environment) ──
  { text: '생물과 환경이 서로 영향을 주고받는 것을 ___이라 한다.', answer: '생태계', category: '환경', gradeGroup: 'upper' },
  { text: '생태계에서 스스로 양분을 만드는 생물을 ___자라 한다.', answer: '생산', category: '환경', gradeGroup: 'upper' },
  { text: '생태계에서 다른 생물을 먹는 생물을 ___자라 한다.', answer: '소비', category: '환경', gradeGroup: 'upper' },
  { text: '죽은 생물을 분해하는 생물을 ___자라 한다.', answer: '분해', category: '환경', gradeGroup: 'upper' },
  { text: '먹이 관계가 사슬처럼 연결된 것을 ___라 한다.', answer: '먹이사슬', category: '환경', gradeGroup: 'upper' },
  { text: '먹이사슬이 복잡하게 얽힌 것을 ___이라 한다.', answer: '먹이그물', category: '환경', gradeGroup: 'upper' },
  { text: '지구의 평균 기온이 올라가는 현상을 ___라 한다.', answer: '지구온난화', category: '환경', gradeGroup: 'upper' },
  { text: '쓰레기를 다시 사용하는 것을 ___라 한다.', answer: '재활용', category: '환경', gradeGroup: 'lower' },
  { text: '자연에서 스스로 분해되는 물질을 ___성 물질이라 한다.', answer: '생분해', category: '환경', gradeGroup: 'upper' },
  { text: '대기 중 이산화탄소가 열을 가두는 효과를 ___라 한다.', answer: '온실효과', category: '환경', gradeGroup: 'upper' },
  { text: '물을 아껴 쓰고 오염을 줄이는 활동을 ___라 한다.', answer: '수질보전', category: '환경', gradeGroup: 'lower' },
  { text: '동식물이 사라져 더 이상 볼 수 없게 되는 것을 ___이라 한다.', answer: '멸종', category: '환경', gradeGroup: 'upper' },
  { text: '사라질 위기에 있는 동식물을 ___ 생물이라 한다.', answer: '멸종위기', category: '환경', gradeGroup: 'upper' },
  { text: '환경을 보호하기 위해 에너지를 아끼는 것을 ___이라 한다.', answer: '절약', category: '환경', gradeGroup: 'lower' },
  { text: '음식물 쓰레기를 발효시켜 만든 거름을 ___라 한다.', answer: '퇴비', category: '환경', gradeGroup: 'lower' },
  { text: '나무를 많이 심어 숲을 만드는 활동을 ___이라 한다.', answer: '조림', category: '환경', gradeGroup: 'upper' },

  // ── 에너지 (Energy) ──
  { text: '태양에서 오는 에너지를 ___에너지라 한다.', answer: '태양', category: '에너지', gradeGroup: 'both' },
  { text: '바람을 이용하여 전기를 만드는 것을 ___발전이라 한다.', answer: '풍력', category: '에너지', gradeGroup: 'upper' },
  { text: '물의 힘으로 전기를 만드는 것을 ___발전이라 한다.', answer: '수력', category: '에너지', gradeGroup: 'upper' },
  { text: '열에너지는 온도가 높은 곳에서 ___은 곳으로 이동한다.', answer: '낮', category: '에너지', gradeGroup: 'upper' },
  { text: '전기를 만들어내는 장치를 ___기라 한다.', answer: '발전', category: '에너지', gradeGroup: 'upper' },
  { text: '전지에서 전기 에너지로 바뀌는 에너지는 ___에너지이다.', answer: '화학', category: '에너지', gradeGroup: 'upper' },
  { text: '석탄, 석유, 천연가스를 ___연료라 한다.', answer: '화석', category: '에너지', gradeGroup: 'upper' },
  { text: '다시 사용할 수 있는 에너지를 ___에너지라 한다.', answer: '재생', category: '에너지', gradeGroup: 'upper' },
  { text: '움직이는 물체가 가지는 에너지를 ___에너지라 한다.', answer: '운동', category: '에너지', gradeGroup: 'upper' },
  { text: '높은 곳에 있는 물체가 가지는 에너지를 ___에너지라 한다.', answer: '위치', category: '에너지', gradeGroup: 'upper' },
  { text: '에너지는 형태가 바뀔 수 있는데 이를 에너지 ___이라 한다.', answer: '전환', category: '에너지', gradeGroup: 'upper' },
  { text: '전구에서 전기에너지가 ___에너지로 바뀐다.', answer: '빛', category: '에너지', gradeGroup: 'lower' },
  { text: '선풍기는 전기에너지를 ___에너지로 바꾼다.', answer: '운동', category: '에너지', gradeGroup: 'lower' },
  { text: '건전지 2개를 직렬로 연결하면 전구가 더 ___게 빛난다.', answer: '밝', category: '에너지', gradeGroup: 'lower' },
  { text: '태양열을 모아 물을 데우는 장치를 태양열 ___기라 한다.', answer: '집열', category: '에너지', gradeGroup: 'upper' },
  { text: '우리나라 전기 생산에서 가장 큰 비중을 차지하는 것은 ___발전이다.', answer: '화력', category: '에너지', gradeGroup: 'upper' },

  // ── 인체 (Human Body) ──
  { text: '음식물을 잘게 부수는 기관은 ___이다.', answer: '이(치아)', category: '인체', gradeGroup: 'lower' },
  { text: '폐에서 산소와 이산화탄소를 교환하는 것을 ___라 한다.', answer: '호흡', category: '인체', gradeGroup: 'upper' },
  { text: '심장이 혈액을 온몸으로 보내는 것을 ___라 한다.', answer: '혈액순환', category: '인체', gradeGroup: 'upper' },
  { text: '뼈와 뼈가 만나는 부분을 ___이라 한다.', answer: '관절', category: '인체', gradeGroup: 'lower' },
  { text: '소화된 영양소를 흡수하는 기관은 ___이다.', answer: '소장', category: '인체', gradeGroup: 'upper' },
  { text: '몸에서 노폐물을 걸러내는 기관은 ___이다.', answer: '콩팥', category: '인체', gradeGroup: 'upper' },
  { text: '우리 몸에서 뼈를 움직이게 하는 것은 ___이다.', answer: '근육', category: '인체', gradeGroup: 'lower' },
  { text: '뇌와 온몸을 연결하는 줄을 ___라 한다.', answer: '척수', category: '인체', gradeGroup: 'upper' },
  { text: '음식물이 위에서 잘게 분해되는 과정을 ___라 한다.', answer: '소화', category: '인체', gradeGroup: 'lower' },
  { text: '피부, 눈, 코, 귀, 혀를 ___기관이라 한다.', answer: '감각', category: '인체', gradeGroup: 'lower' },
  { text: '혈액 속에서 산소를 운반하는 세포를 ___이라 한다.', answer: '적혈구', category: '인체', gradeGroup: 'upper' },
  { text: '몸속에 들어온 세균을 물리치는 혈액 세포를 ___이라 한다.', answer: '백혈구', category: '인체', gradeGroup: 'upper' },
  { text: '사람의 체온은 보통 약 ___도이다.', answer: '36.5', category: '인체', gradeGroup: 'lower' },
  { text: '들이마신 공기가 지나가는 관을 ___라 한다.', answer: '기관', category: '인체', gradeGroup: 'upper' },
  { text: '입에서 나오는 소화액을 ___이라 한다.', answer: '침', category: '인체', gradeGroup: 'lower' },
  { text: '위에서 나오는 소화액을 ___이라 한다.', answer: '위액', category: '인체', gradeGroup: 'upper' },

  // ── 동물 (Animals) ──
  { text: '등뼈가 있는 동물을 ___동물이라 한다.', answer: '척추', category: '동물', gradeGroup: 'lower' },
  { text: '등뼈가 없는 동물을 ___동물이라 한다.', answer: '무척추', category: '동물', gradeGroup: 'lower' },
  { text: '알을 낳아 번식하는 동물을 ___동물이라 한다.', answer: '난생', category: '동물', gradeGroup: 'lower' },
  { text: '새끼를 낳아 젖을 먹이는 동물을 ___류라 한다.', answer: '포유', category: '동물', gradeGroup: 'lower' },
  { text: '물속에서 아가미로 숨을 쉬는 동물을 ___류라 한다.', answer: '어', category: '동물', gradeGroup: 'lower' },
  { text: '어릴 때는 물속, 어른이 되면 땅에서 사는 동물을 ___류라 한다.', answer: '양서', category: '동물', gradeGroup: 'lower' },
  { text: '비늘로 덮여 있고 허파로 숨을 쉬는 동물을 ___류라 한다.', answer: '파충', category: '동물', gradeGroup: 'lower' },
  { text: '곤충의 몸은 머리, 가슴, ___의 세 부분이다.', answer: '배', category: '동물', gradeGroup: 'lower' },
  { text: '곤충의 다리는 모두 ___개이다.', answer: '6', category: '동물', gradeGroup: 'lower' },
  { text: '거미의 다리는 모두 ___개이다.', answer: '8', category: '동물', gradeGroup: 'lower' },
  { text: '꿀벌처럼 여럿이 함께 모여 사는 것을 ___생활이라 한다.', answer: '사회', category: '동물', gradeGroup: 'lower' },
  { text: '새의 몸은 ___로 덮여 있다.', answer: '깃털', category: '동물', gradeGroup: 'lower' },
  { text: '고래와 박쥐는 젖을 먹이므로 ___류이다.', answer: '포유', category: '동물', gradeGroup: 'lower' },
  { text: '겨울이 오면 따뜻한 곳으로 이동하는 새를 ___새라 한다.', answer: '철', category: '동물', gradeGroup: 'lower' },
  { text: '나비의 입은 빨대처럼 생긴 ___이다.', answer: '대롱', category: '동물', gradeGroup: 'lower' },
  { text: '사마귀처럼 다른 곤충을 잡아먹는 곤충을 ___곤충이라 한다.', answer: '육식', category: '동물', gradeGroup: 'lower' },

  // ── 식물 (Plants) ──
  { text: '식물의 뿌리가 땅속으로 뻗어 물과 ___을 흡수한다.', answer: '양분', category: '식물', gradeGroup: 'lower' },
  { text: '줄기의 역할은 물과 양분을 ___하는 것이다.', answer: '운반', category: '식물', gradeGroup: 'lower' },
  { text: '잎의 초록색을 내는 물질을 ___이라 한다.', answer: '엽록소', category: '식물', gradeGroup: 'upper' },
  { text: '한 장의 잎으로 된 식물을 ___잎식물이라 한다.', answer: '외떡', category: '식물', gradeGroup: 'upper' },
  { text: '두 장의 떡잎을 가진 식물을 ___잎식물이라 한다.', answer: '쌍떡', category: '식물', gradeGroup: 'upper' },
  { text: '씨가 아닌 포자로 번식하는 식물에는 고사리와 ___가 있다.', answer: '이끼', category: '식물', gradeGroup: 'upper' },
  { text: '소나무처럼 겉씨가 드러나는 식물을 ___식물이라 한다.', answer: '겉씨', category: '식물', gradeGroup: 'upper' },
  { text: '사과나무처럼 씨가 열매 속에 있는 식물을 ___식물이라 한다.', answer: '속씨', category: '식물', gradeGroup: 'upper' },
  { text: '식물이 빛 쪽으로 자라는 성질을 ___성이라 한다.', answer: '굴광', category: '식물', gradeGroup: 'upper' },
  { text: '뿌리가 중력 방향으로 자라는 성질을 ___성이라 한다.', answer: '굴중력', category: '식물', gradeGroup: 'upper' },
  { text: '꽃에서 벌과 나비를 유인하는 부분은 ___이다.', answer: '꽃잎', category: '식물', gradeGroup: 'lower' },
  { text: '식물의 줄기에서 물이 이동하는 것을 확인하려면 ___물 실험을 한다.', answer: '색소', category: '식물', gradeGroup: 'lower' },
  { text: '선인장의 잎이 가시로 변한 이유는 ___을 줄이기 위해서이다.', answer: '증산', category: '식물', gradeGroup: 'upper' },
  { text: '연꽃처럼 물에서 사는 식물을 ___식물이라 한다.', answer: '수생', category: '식물', gradeGroup: 'lower' },
  { text: '식물의 씨앗이 퍼지는 방법에는 바람, 동물, ___이 있다.', answer: '물', category: '식물', gradeGroup: 'lower' },
  { text: '가을에 나뭇잎이 색이 변하는 것을 ___이라 한다.', answer: '단풍', category: '식물', gradeGroup: 'lower' },

  // ── 날씨 (Weather) ──
  { text: '공기 중의 수증기가 하늘에서 작은 물방울이 된 것을 ___라 한다.', answer: '구름', category: '날씨', gradeGroup: 'lower' },
  { text: '구름 속 물방울이 커져서 떨어지는 것을 ___라 한다.', answer: '비', category: '날씨', gradeGroup: 'lower' },
  { text: '겨울에 구름 속 물방울이 얼어서 내리는 것을 ___라 한다.', answer: '눈', category: '날씨', gradeGroup: 'lower' },
  { text: '공기가 이동하는 것을 ___라 한다.', answer: '바람', category: '날씨', gradeGroup: 'lower' },
  { text: '바람은 기압이 ___은 곳에서 낮은 곳으로 분다.', answer: '높', category: '날씨', gradeGroup: 'upper' },
  { text: '공기 중에 포함된 수증기의 양을 ___라 한다.', answer: '습도', category: '날씨', gradeGroup: 'lower' },
  { text: '하루 동안의 기온 변화를 나타낸 그래프를 ___라 한다.', answer: '기온그래프', category: '날씨', gradeGroup: 'lower' },
  { text: '기온을 재는 도구는 ___이다.', answer: '온도계', category: '날씨', gradeGroup: 'lower' },
  { text: '습도를 재는 도구는 ___이다.', answer: '습도계', category: '날씨', gradeGroup: 'lower' },
  { text: '바람의 세기를 재는 도구는 ___이다.', answer: '풍속계', category: '날씨', gradeGroup: 'lower' },
  { text: '바람의 방향을 알려주는 도구는 ___이다.', answer: '풍향계', category: '날씨', gradeGroup: 'lower' },
  { text: '아침에 풀잎에 맺히는 물방울을 ___라 한다.', answer: '이슬', category: '날씨', gradeGroup: 'lower' },
  { text: '지표면 가까이에 생기는 작은 물방울을 ___라 한다.', answer: '안개', category: '날씨', gradeGroup: 'lower' },
  { text: '번개가 칠 때 나는 소리를 ___이라 한다.', answer: '천둥', category: '날씨', gradeGroup: 'lower' },
  { text: '일정 지역의 오랜 기간 평균 날씨를 ___라 한다.', answer: '기후', category: '날씨', gradeGroup: 'upper' },
  { text: '태풍은 열대 바다에서 발생하는 강한 ___이다.', answer: '저기압', category: '날씨', gradeGroup: 'upper' },

  // ── 우주 (Space) ──
  { text: '태양계의 중심에 있는 별은 ___이다.', answer: '태양', category: '우주', gradeGroup: 'upper' },
  { text: '태양에서 가장 가까운 행성은 ___이다.', answer: '수성', category: '우주', gradeGroup: 'upper' },
  { text: '태양계에서 가장 큰 행성은 ___이다.', answer: '목성', category: '우주', gradeGroup: 'upper' },
  { text: '아름다운 고리를 가진 행성은 ___이다.', answer: '토성', category: '우주', gradeGroup: 'upper' },
  { text: '지구의 위성은 ___이다.', answer: '달', category: '우주', gradeGroup: 'lower' },
  { text: '달이 스스로 빛을 내지 못하고 ___빛을 반사한다.', answer: '태양', category: '우주', gradeGroup: 'lower' },
  { text: '달의 모양이 변하는 주기는 약 ___일이다.', answer: '30', category: '우주', gradeGroup: 'upper' },
  { text: '지구가 태양 주위를 도는 것을 ___이라 한다.', answer: '공전', category: '우주', gradeGroup: 'upper' },
  { text: '지구가 스스로 도는 것을 ___이라 한다.', answer: '자전', category: '우주', gradeGroup: 'upper' },
  { text: '지구의 자전 때문에 낮과 ___이 바뀐다.', answer: '밤', category: '우주', gradeGroup: 'lower' },
  { text: '지구의 공전 때문에 ___이 바뀐다.', answer: '계절', category: '우주', gradeGroup: 'upper' },
  { text: '별이 모여 이루는 모양을 ___이라 한다.', answer: '별자리', category: '우주', gradeGroup: 'lower' },
  { text: '북쪽 하늘에서 항상 같은 자리에 보이는 별은 ___이다.', answer: '북극성', category: '우주', gradeGroup: 'upper' },
  { text: '태양계 행성 중 생명체가 사는 곳은 ___이다.', answer: '지구', category: '우주', gradeGroup: 'lower' },
  { text: '태양계 행성의 수는 ___개이다.', answer: '8', category: '우주', gradeGroup: 'upper' },
  { text: '화성은 표면이 붉은색이어서 ___행성이라 불린다.', answer: '붉은', category: '우주', gradeGroup: 'upper' },

  // ── 물질 (Matter) ──
  { text: '우리 주위의 모든 것을 이루고 있는 것을 ___이라 한다.', answer: '물질', category: '물질', gradeGroup: 'lower' },
  { text: '같은 물질로 만들어도 ___에 따라 쓰임이 다르다.', answer: '모양', category: '물질', gradeGroup: 'lower' },
  { text: '나무, 쇠, 플라스틱, 유리 등은 물체를 만드는 ___이다.', answer: '재료', category: '물질', gradeGroup: 'lower' },
  { text: '자석에 붙는 물질은 ___로 만든 것이다.', answer: '철', category: '물질', gradeGroup: 'lower' },
  { text: '자석의 양 끝을 ___이라 한다.', answer: '극', category: '물질', gradeGroup: 'lower' },
  { text: '자석의 같은 극끼리는 서로 ___한다.', answer: '밀어낸다', category: '물질', gradeGroup: 'lower' },
  { text: '자석의 다른 극끼리는 서로 ___한다.', answer: '끌어당긴다', category: '물질', gradeGroup: 'lower' },
  { text: '나침반의 바늘은 항상 ___쪽을 가리킨다.', answer: '북', category: '물질', gradeGroup: 'lower' },
  { text: '고체는 모양과 부피가 ___하다.', answer: '일정', category: '물질', gradeGroup: 'lower' },
  { text: '액체는 담는 그릇에 따라 ___이 변한다.', answer: '모양', category: '물질', gradeGroup: 'lower' },
  { text: '기체는 모양과 부피가 모두 ___하지 않다.', answer: '일정', category: '물질', gradeGroup: 'lower' },
  { text: '물질을 이루는 가장 작은 단위를 ___이라 한다.', answer: '원자', category: '물질', gradeGroup: 'upper' },
  { text: '혼합물에서 각 물질을 나누는 것을 ___이라 한다.', answer: '분리', category: '물질', gradeGroup: 'upper' },
  { text: '거름 장치를 이용하여 고체와 액체를 분리하는 것을 ___라 한다.', answer: '거르기', category: '물질', gradeGroup: 'upper' },
  { text: '소금물을 증발시키면 ___만 남는다.', answer: '소금', category: '물질', gradeGroup: 'lower' },
  { text: '물질이 열에 의해 부피가 커지는 현상을 ___이라 한다.', answer: '열팽창', category: '물질', gradeGroup: 'upper' },

  // ── 전기 (Electricity) ──
  { text: '전기가 흐르는 길을 ___라 한다.', answer: '전기회로', category: '전기', gradeGroup: 'upper' },
  { text: '전기 회로에서 전기의 흐름을 ___라 한다.', answer: '전류', category: '전기', gradeGroup: 'upper' },
  { text: '전지, 전선, 전구를 연결한 것을 ___라 한다.', answer: '전기회로', category: '전기', gradeGroup: 'upper' },
  { text: '전기가 잘 통하는 물질을 ___체라 한다.', answer: '도', category: '전기', gradeGroup: 'upper' },
  { text: '전기가 통하지 않는 물질을 ___체라 한다.', answer: '부도', category: '전기', gradeGroup: 'upper' },
  { text: '전구 2개를 한 줄로 연결하는 것을 ___연결이라 한다.', answer: '직렬', category: '전기', gradeGroup: 'upper' },
  { text: '전구 2개를 나란히 연결하는 것을 ___연결이라 한다.', answer: '병렬', category: '전기', gradeGroup: 'upper' },
  { text: '전기 회로를 끊거나 연결하는 장치를 ___라 한다.', answer: '스위치', category: '전기', gradeGroup: 'upper' },
  { text: '전기를 저장하는 장치를 ___라 한다.', answer: '전지(배터리)', category: '전기', gradeGroup: 'upper' },
  { text: '전선에 전류가 흐르면 주위에 ___이 생긴다.', answer: '자기장', category: '전기', gradeGroup: 'upper' },
  { text: '전자석은 전류가 흐를 때만 ___의 성질을 갖는다.', answer: '자석', category: '전기', gradeGroup: 'upper' },
  { text: '전류의 단위는 ___이다.', answer: '암페어(A)', category: '전기', gradeGroup: 'upper' },
  { text: '전압의 단위는 ___이다.', answer: '볼트(V)', category: '전기', gradeGroup: 'upper' },
  { text: '발광 다이오드의 약자는 ___이다.', answer: 'LED', category: '전기', gradeGroup: 'upper' },
  { text: '정전기는 물체에 ___이 쌓여 생긴다.', answer: '전하', category: '전기', gradeGroup: 'upper' },
  { text: '겨울에 옷을 벗을 때 따끔한 것은 ___때문이다.', answer: '정전기', category: '전기', gradeGroup: 'lower' },

  // ── 힘과운동 (Force and Motion) ──
  { text: '물체의 위치가 시간에 따라 변하는 것을 ___이라 한다.', answer: '운동', category: '힘과운동', gradeGroup: 'lower' },
  { text: '일정한 빠르기로 움직이는 운동을 ___운동이라 한다.', answer: '등속', category: '힘과운동', gradeGroup: 'upper' },
  { text: '물체가 원 모양의 경로를 따라 도는 운동을 ___운동이라 한다.', answer: '원', category: '힘과운동', gradeGroup: 'upper' },
  { text: '물체의 빠르기가 점점 빨라지는 운동을 ___운동이라 한다.', answer: '가속', category: '힘과운동', gradeGroup: 'upper' },
  { text: '물체가 떨어질 때 점점 빨라지는 것은 ___때문이다.', answer: '중력', category: '힘과운동', gradeGroup: 'upper' },
  { text: '물속에서 물체가 뜨는 힘을 ___이라 한다.', answer: '부력', category: '힘과운동', gradeGroup: 'upper' },
  { text: '거리를 시간으로 나눈 것을 ___라 한다.', answer: '속력', category: '힘과운동', gradeGroup: 'upper' },
  { text: '같은 시간에 더 먼 거리를 간 물체가 더 ___다.', answer: '빠르', category: '힘과운동', gradeGroup: 'lower' },
  { text: '공을 던지면 포물선을 그리며 날아가는 운동을 ___운동이라 한다.', answer: '포물선', category: '힘과운동', gradeGroup: 'upper' },
  { text: '그네가 왔다 갔다 하는 운동을 ___운동이라 한다.', answer: '진자', category: '힘과운동', gradeGroup: 'upper' },
  { text: '바퀴를 사용하면 ___력을 줄일 수 있다.', answer: '마찰', category: '힘과운동', gradeGroup: 'lower' },
  { text: '경사면을 이용하면 적은 ___으로 물체를 올릴 수 있다.', answer: '힘', category: '힘과운동', gradeGroup: 'lower' },
  { text: '자동차 안전벨트는 급정지 시 ___을 막아준다.', answer: '관성', category: '힘과운동', gradeGroup: 'upper' },
  { text: '로켓이 날아가는 원리는 작용 반작용의 ___이다.', answer: '법칙', category: '힘과운동', gradeGroup: 'upper' },
  { text: '미끄럼틀에서 빠르게 내려오는 것은 ___때문이다.', answer: '중력', category: '힘과운동', gradeGroup: 'lower' },
  { text: '수영할 때 물을 뒤로 밀면 몸이 ___으로 나아간다.', answer: '앞', category: '힘과운동', gradeGroup: 'lower' },

  // ── 빛과소리 (Light and Sound) ──
  { text: '빛이 직진하는 성질 때문에 ___가 생긴다.', answer: '그림자', category: '빛과소리', gradeGroup: 'lower' },
  { text: '빛이 거울에 부딪쳐 되돌아오는 것을 ___이라 한다.', answer: '반사', category: '빛과소리', gradeGroup: 'lower' },
  { text: '빛이 물속으로 들어갈 때 꺾이는 현상을 ___이라 한다.', answer: '굴절', category: '빛과소리', gradeGroup: 'upper' },
  { text: '흰색 빛을 프리즘에 통과시키면 ___색으로 나뉜다.', answer: '무지개', category: '빛과소리', gradeGroup: 'upper' },
  { text: '소리는 물체의 ___에 의해 발생한다.', answer: '진동', category: '빛과소리', gradeGroup: 'lower' },
  { text: '소리의 높낮이는 진동의 ___에 따라 달라진다.', answer: '빠르기', category: '빛과소리', gradeGroup: 'lower' },
  { text: '소리의 크기는 진동의 ___에 따라 달라진다.', answer: '세기(폭)', category: '빛과소리', gradeGroup: 'lower' },
  { text: '소리가 벽에 부딪쳐 되돌아오는 것을 ___라 한다.', answer: '메아리', category: '빛과소리', gradeGroup: 'lower' },
  { text: '빛이 없으면 물체를 볼 수 ___다.', answer: '없', category: '빛과소리', gradeGroup: 'lower' },
  { text: '볼록 렌즈는 빛을 모아 ___을 만든다.', answer: '초점', category: '빛과소리', gradeGroup: 'upper' },
  { text: '오목 렌즈는 빛을 ___시킨다.', answer: '퍼지게(발산)', category: '빛과소리', gradeGroup: 'upper' },
  { text: '소리는 진공 속에서 전달되지 ___다.', answer: '않는', category: '빛과소리', gradeGroup: 'upper' },
  { text: '그림자의 크기는 물체와 빛 사이의 ___에 따라 달라진다.', answer: '거리', category: '빛과소리', gradeGroup: 'lower' },
  { text: '빛이 곧게 나아가는 성질을 빛의 ___이라 한다.', answer: '직진', category: '빛과소리', gradeGroup: 'lower' },
  { text: '무지개는 비온 뒤 ___에 의해 빛이 분해되어 나타난다.', answer: '물방울', category: '빛과소리', gradeGroup: 'lower' },
  { text: '실전화기는 실의 ___을 이용해 소리를 전달한다.', answer: '진동', category: '빛과소리', gradeGroup: 'lower' },
];

// ─── SOCIAL STUDIES DATA ────────────────────────────────────

interface SocialItem {
  text: string;
  answer: string;
  category: string;
  gradeGroup: 'lower' | 'upper' | 'both';
}

const SOCIAL_ITEMS: SocialItem[] = [
  // ── 지리 (Geography) ──
  { text: '대한민국의 수도는 ___이다.', answer: '서울', category: '지리', gradeGroup: 'both' },
  { text: '우리나라에서 가장 큰 섬은 ___도이다.', answer: '제주', category: '지리', gradeGroup: 'lower' },
  { text: '우리나라에서 가장 높은 산은 ___산이다.', answer: '한라', category: '지리', gradeGroup: 'lower' },
  { text: '우리나라에서 가장 긴 강은 ___강이다.', answer: '낙동', category: '지리', gradeGroup: 'lower' },
  { text: '서울을 가로지르는 강은 ___강이다.', answer: '한', category: '지리', gradeGroup: 'lower' },
  { text: '우리나라의 동쪽 바다를 ___해라 한다.', answer: '동', category: '지리', gradeGroup: 'lower' },
  { text: '우리나라의 서쪽 바다를 ___해라 한다.', answer: '서(황)', category: '지리', gradeGroup: 'lower' },
  { text: '우리나라의 남쪽 바다를 ___해라 한다.', answer: '남', category: '지리', gradeGroup: 'lower' },
  { text: '우리나라는 아시아 대륙의 ___쪽에 위치해 있다.', answer: '동', category: '지리', gradeGroup: 'lower' },
  { text: '우리나라의 영토에서 가장 북쪽 지역은 ___도이다.', answer: '함경북', category: '지리', gradeGroup: 'upper' },
  { text: '지도에서 높낮이를 나타내는 선을 ___선이라 한다.', answer: '등고', category: '지리', gradeGroup: 'lower' },
  { text: '지도에서 실제 거리를 줄인 비율을 ___이라 한다.', answer: '축척', category: '지리', gradeGroup: 'lower' },
  { text: '지도에서 방위를 나타내는 표시를 ___표라 한다.', answer: '방위', category: '지리', gradeGroup: 'lower' },
  { text: '백두산은 우리나라와 ___의 국경에 있다.', answer: '중국', category: '지리', gradeGroup: 'upper' },
  { text: '독도는 우리나라의 가장 ___쪽에 있는 섬이다.', answer: '동', category: '지리', gradeGroup: 'lower' },
  { text: '우리나라는 반도 국가로, 삼면이 ___로 둘러싸여 있다.', answer: '바다', category: '지리', gradeGroup: 'lower' },
  { text: '도시에 사람이 몰리는 현상을 ___화라 한다.', answer: '도시', category: '지리', gradeGroup: 'upper' },

  // ── 역사 (History) ──
  { text: '우리나라 최초의 국가는 ___이다.', answer: '고조선', category: '역사', gradeGroup: 'upper' },
  { text: '고조선을 세운 인물은 ___이다.', answer: '단군왕검', category: '역사', gradeGroup: 'upper' },
  { text: '삼국시대의 세 나라는 고구려, 백제, ___이다.', answer: '신라', category: '역사', gradeGroup: 'upper' },
  { text: '삼국을 통일한 나라는 ___이다.', answer: '신라', category: '역사', gradeGroup: 'upper' },
  { text: '고려를 세운 인물은 ___이다.', answer: '왕건', category: '역사', gradeGroup: 'upper' },
  { text: '조선을 세운 인물은 ___이다.', answer: '이성계', category: '역사', gradeGroup: 'upper' },
  { text: '한글을 만든 왕은 ___이다.', answer: '세종대왕', category: '역사', gradeGroup: 'both' },
  { text: '한글이 처음 만들어졌을 때의 이름은 ___이다.', answer: '훈민정음', category: '역사', gradeGroup: 'upper' },
  { text: '임진왜란 때 바다에서 활약한 장군은 ___이다.', answer: '이순신', category: '역사', gradeGroup: 'upper' },
  { text: '이순신 장군이 사용한 배는 ___이다.', answer: '거북선', category: '역사', gradeGroup: 'upper' },
  { text: '우리나라가 일본에게 빼앗긴 해는 ___년이다.', answer: '1910', category: '역사', gradeGroup: 'upper' },
  { text: '광복절은 ___월 15일이다.', answer: '8', category: '역사', gradeGroup: 'upper' },
  { text: '6·25 전쟁이 일어난 해는 ___년이다.', answer: '1950', category: '역사', gradeGroup: 'upper' },
  { text: '대한민국 정부가 수립된 해는 ___년이다.', answer: '1948', category: '역사', gradeGroup: 'upper' },
  { text: '고구려의 전성기를 이끈 왕은 ___왕이다.', answer: '광개토대', category: '역사', gradeGroup: 'upper' },
  { text: '백제의 수도였던 도시는 ___이다.', answer: '부여', category: '역사', gradeGroup: 'upper' },
  { text: '신라의 수도였던 도시는 ___이다.', answer: '경주', category: '역사', gradeGroup: 'upper' },

  // ── 경제 (Economy) ──
  { text: '물건을 사고파는 활동을 ___라 한다.', answer: '거래', category: '경제', gradeGroup: 'lower' },
  { text: '사람들이 원하는 것에 비해 자원이 부족한 것을 ___라 한다.', answer: '희소성', category: '경제', gradeGroup: 'upper' },
  { text: '물건을 사는 사람을 ___자라 한다.', answer: '소비', category: '경제', gradeGroup: 'lower' },
  { text: '물건을 만드는 사람을 ___자라 한다.', answer: '생산', category: '경제', gradeGroup: 'lower' },
  { text: '물건의 값을 ___라 한다.', answer: '가격', category: '경제', gradeGroup: 'lower' },
  { text: '나라와 나라 사이에 물건을 사고파는 것을 ___라 한다.', answer: '무역', category: '경제', gradeGroup: 'upper' },
  { text: '다른 나라에 물건을 파는 것을 ___이라 한다.', answer: '수출', category: '경제', gradeGroup: 'upper' },
  { text: '다른 나라에서 물건을 사 오는 것을 ___이라 한다.', answer: '수입', category: '경제', gradeGroup: 'upper' },
  { text: '은행에 돈을 맡기는 것을 ___라 한다.', answer: '저축', category: '경제', gradeGroup: 'lower' },
  { text: '물건의 가격이 계속 오르는 현상을 ___이라 한다.', answer: '인플레이션', category: '경제', gradeGroup: 'upper' },
  { text: '일한 대가로 받는 돈을 ___이라 한다.', answer: '임금', category: '경제', gradeGroup: 'lower' },
  { text: '물건을 만드는 데 드는 돈을 ___라 한다.', answer: '비용', category: '경제', gradeGroup: 'upper' },
  { text: '한정된 자원을 어디에 쓸지 결정하는 것을 경제적 ___라 한다.', answer: '선택', category: '경제', gradeGroup: 'upper' },
  { text: '시장에서 물건을 사려는 양을 ___라 한다.', answer: '수요', category: '경제', gradeGroup: 'upper' },
  { text: '시장에서 물건을 팔려는 양을 ___라 한다.', answer: '공급', category: '경제', gradeGroup: 'upper' },
  { text: '돈의 가치가 떨어지면 물건 가격이 ___한다.', answer: '상승', category: '경제', gradeGroup: 'upper' },

  // ── 정치 (Politics) ──
  { text: '대한민국의 대통령은 국민의 ___로 선출된다.', answer: '투표', category: '정치', gradeGroup: 'upper' },
  { text: '법을 만드는 국가 기관은 ___이다.', answer: '국회', category: '정치', gradeGroup: 'upper' },
  { text: '법에 따라 재판하는 국가 기관은 ___이다.', answer: '법원', category: '정치', gradeGroup: 'upper' },
  { text: '나라의 살림을 맡아 하는 기관은 ___부이다.', answer: '행정', category: '정치', gradeGroup: 'upper' },
  { text: '국가의 최고 법을 ___이라 한다.', answer: '헌법', category: '정치', gradeGroup: 'upper' },
  { text: '국회의원을 뽑는 선거를 ___선거라 한다.', answer: '총', category: '정치', gradeGroup: 'upper' },
  { text: '만 ___세 이상 국민에게 선거권이 주어진다.', answer: '18', category: '정치', gradeGroup: 'upper' },
  { text: '국민이 나라의 주인이 되는 정치를 ___주의라 한다.', answer: '민주', category: '정치', gradeGroup: 'upper' },
  { text: '지방의 일을 스스로 처리하는 제도를 ___제라 한다.', answer: '지방자치', category: '정치', gradeGroup: 'upper' },
  { text: '시·도의 대표를 ___사라 한다.', answer: '도지사(시장)', category: '정치', gradeGroup: 'upper' },
  { text: '국민의 기본적인 권리를 ___이라 한다.', answer: '기본권', category: '정치', gradeGroup: 'upper' },
  { text: '대통령의 임기는 ___년이다.', answer: '5', category: '정치', gradeGroup: 'upper' },
  { text: '나라를 다스리는 기본 원리를 ___이라 한다.', answer: '정치', category: '정치', gradeGroup: 'lower' },
  { text: '학교에서 학급 대표를 뽑는 것도 ___의 한 방법이다.', answer: '선거', category: '정치', gradeGroup: 'lower' },
  { text: '여러 사람의 의견을 모아 결정하는 것을 ___라 한다.', answer: '회의', category: '정치', gradeGroup: 'lower' },
  { text: '다수의 의견을 따르되 소수 의견도 존중하는 것을 ___라 한다.', answer: '다수결', category: '정치', gradeGroup: 'lower' },

  // ── 문화 (Culture) ──
  { text: '우리나라의 전통 의복을 ___이라 한다.', answer: '한복', category: '문화', gradeGroup: 'lower' },
  { text: '우리나라의 전통 음식을 ___이라 한다.', answer: '한식', category: '문화', gradeGroup: 'lower' },
  { text: '설날에 어른에게 하는 인사를 ___라 한다.', answer: '세배', category: '문화', gradeGroup: 'lower' },
  { text: '추석에 먹는 전통 음식은 ___이다.', answer: '송편', category: '문화', gradeGroup: 'lower' },
  { text: '우리나라 전통 집을 ___이라 한다.', answer: '한옥', category: '문화', gradeGroup: 'lower' },
  { text: '한옥의 바닥 난방 방식을 ___이라 한다.', answer: '온돌', category: '문화', gradeGroup: 'lower' },
  { text: '우리나라 전통 종이를 ___라 한다.', answer: '한지', category: '문화', gradeGroup: 'lower' },
  { text: '우리나라 전통 악기 중 현악기에는 가야금과 ___이 있다.', answer: '거문고', category: '문화', gradeGroup: 'lower' },
  { text: '탈을 쓰고 노래와 춤을 하는 전통 놀이를 ___이라 한다.', answer: '탈춤', category: '문화', gradeGroup: 'lower' },
  { text: '김치를 담그는 문화는 유네스코 ___에 등재되었다.', answer: '무형문화유산', category: '문화', gradeGroup: 'upper' },
  { text: '우리나라의 국기는 ___이다.', answer: '태극기', category: '문화', gradeGroup: 'lower' },
  { text: '우리나라의 국화는 ___이다.', answer: '무궁화', category: '문화', gradeGroup: 'lower' },
  { text: '우리나라의 국가(노래)는 ___이다.', answer: '애국가', category: '문화', gradeGroup: 'lower' },
  { text: '음력 1월 1일을 ___이라 한다.', answer: '설날', category: '문화', gradeGroup: 'lower' },
  { text: '음력 8월 15일을 ___이라 한다.', answer: '추석', category: '문화', gradeGroup: 'lower' },
  { text: '단오에 하는 전통 놀이는 ___타기이다.', answer: '그네', category: '문화', gradeGroup: 'lower' },

  // ── 법 (Law) ──
  { text: '사회 구성원이 지켜야 할 강제적 규칙을 ___이라 한다.', answer: '법', category: '법', gradeGroup: 'upper' },
  { text: '법을 어기면 받는 불이익을 ___이라 한다.', answer: '처벌', category: '법', gradeGroup: 'upper' },
  { text: '어린이를 보호하기 위한 법을 ___법이라 한다.', answer: '아동복지', category: '법', gradeGroup: 'upper' },
  { text: '교통 규칙을 정한 법을 ___법이라 한다.', answer: '도로교통', category: '법', gradeGroup: 'lower' },
  { text: '학교에서 지켜야 할 규칙을 ___라 한다.', answer: '교칙', category: '법', gradeGroup: 'lower' },
  { text: '모든 국민은 법 앞에 ___하다.', answer: '평등', category: '법', gradeGroup: 'upper' },
  { text: '다른 사람의 물건을 훔치는 것은 ___죄이다.', answer: '절도', category: '법', gradeGroup: 'upper' },
  { text: '법을 위반했는지 판단하는 사람을 ___이라 한다.', answer: '판사', category: '법', gradeGroup: 'upper' },
  { text: '피고인의 권리를 지켜주는 사람을 ___이라 한다.', answer: '변호사', category: '법', gradeGroup: 'upper' },
  { text: '범죄를 수사하는 사람을 ___이라 한다.', answer: '검사', category: '법', gradeGroup: 'upper' },
  { text: '사회 질서를 유지하기 위해 법이 ___하다.', answer: '필요', category: '법', gradeGroup: 'lower' },
  { text: '어린이는 ___세 미만의 사람을 말한다.', answer: '18', category: '법', gradeGroup: 'lower' },
  { text: '법 중에서 가장 높은 법은 ___이다.', answer: '헌법', category: '법', gradeGroup: 'upper' },
  { text: '국민의 의무에는 납세, 국방, 교육, ___의 의무가 있다.', answer: '근로', category: '법', gradeGroup: 'upper' },
  { text: '재판을 받을 수 있는 권리를 ___권이라 한다.', answer: '재판청구', category: '법', gradeGroup: 'upper' },
  { text: '환경을 보호하기 위한 법을 ___법이라 한다.', answer: '환경보전', category: '법', gradeGroup: 'upper' },

  // ── 환경 (Social Environment) ──
  { text: '사람과 자연이 어울려 사는 발전을 ___발전이라 한다.', answer: '지속가능한', category: '환경', gradeGroup: 'upper' },
  { text: '쓰레기를 줄이고 다시 쓰는 것을 ___라 한다.', answer: '재활용', category: '환경', gradeGroup: 'lower' },
  { text: '공장에서 나오는 오염 물질이 공기를 더럽히는 것을 ___이라 한다.', answer: '대기오염', category: '환경', gradeGroup: 'lower' },
  { text: '깨끗한 물을 지키기 위해 오염을 줄이는 활동을 ___보전이라 한다.', answer: '수질', category: '환경', gradeGroup: 'lower' },
  { text: '자연재해에 대비하기 위해 만든 계획을 ___계획이라 한다.', answer: '방재', category: '환경', gradeGroup: 'upper' },
  { text: '숲이 줄어드는 현상을 ___화라 한다.', answer: '사막', category: '환경', gradeGroup: 'upper' },
  { text: '에너지를 아껴 쓰는 것을 에너지 ___이라 한다.', answer: '절약', category: '환경', gradeGroup: 'lower' },
  { text: '물건을 오래 사용하는 것도 환경 ___에 도움이 된다.', answer: '보호', category: '환경', gradeGroup: 'lower' },
  { text: '탄소 배출을 줄이는 생활을 ___탄소 생활이라 한다.', answer: '저', category: '환경', gradeGroup: 'upper' },
  { text: '일회용품 사용을 줄이면 ___를 보호할 수 있다.', answer: '환경', category: '환경', gradeGroup: 'lower' },
  { text: '자연을 보호하기 위해 지정한 지역을 ___공원이라 한다.', answer: '국립', category: '환경', gradeGroup: 'lower' },
  { text: '미세먼지가 심할 때는 ___를 착용해야 한다.', answer: '마스크', category: '환경', gradeGroup: 'lower' },
  { text: '물부족 문제를 해결하기 위해 ___을 건설한다.', answer: '댐', category: '환경', gradeGroup: 'upper' },
  { text: '폐수를 깨끗하게 만드는 시설을 ___장이라 한다.', answer: '하수처리', category: '환경', gradeGroup: 'upper' },
  { text: '바다에 버려진 쓰레기를 ___쓰레기라 한다.', answer: '해양', category: '환경', gradeGroup: 'upper' },
  { text: '지구의 기온이 올라가는 현상을 ___라 한다.', answer: '지구온난화', category: '환경', gradeGroup: 'upper' },

  // ── 세계 (World) ──
  { text: '세계에서 가장 큰 대륙은 ___이다.', answer: '아시아', category: '세계', gradeGroup: 'upper' },
  { text: '세계에서 가장 큰 바다는 ___양이다.', answer: '태평', category: '세계', gradeGroup: 'upper' },
  { text: '세계에서 가장 인구가 많은 나라는 ___이다.', answer: '중국', category: '세계', gradeGroup: 'upper' },
  { text: '세계에서 면적이 가장 큰 나라는 ___이다.', answer: '러시아', category: '세계', gradeGroup: 'upper' },
  { text: '피라미드가 있는 나라는 ___이다.', answer: '이집트', category: '세계', gradeGroup: 'upper' },
  { text: '에펠탑이 있는 나라는 ___이다.', answer: '프랑스', category: '세계', gradeGroup: 'upper' },
  { text: '세계 여러 나라가 모인 국제기구를 ___이라 한다.', answer: '유엔(UN)', category: '세계', gradeGroup: 'upper' },
  { text: '지구는 ___개의 대륙으로 이루어져 있다.', answer: '6', category: '세계', gradeGroup: 'upper' },
  { text: '적도 근처의 기후는 일년 내내 ___하다.', answer: '덥다(무덥)', category: '세계', gradeGroup: 'upper' },
  { text: '세계의 시간 차이가 나는 이유는 지구가 ___하기 때문이다.', answer: '자전', category: '세계', gradeGroup: 'upper' },
  { text: '일본의 수도는 ___이다.', answer: '도쿄', category: '세계', gradeGroup: 'upper' },
  { text: '미국의 수도는 ___이다.', answer: '워싱턴 D.C.', category: '세계', gradeGroup: 'upper' },
  { text: '중국의 수도는 ___이다.', answer: '베이징', category: '세계', gradeGroup: 'upper' },
  { text: '영국의 수도는 ___이다.', answer: '런던', category: '세계', gradeGroup: 'upper' },
  { text: '지구 위의 가로선을 ___라 한다.', answer: '위도', category: '세계', gradeGroup: 'upper' },
  { text: '지구 위의 세로선을 ___라 한다.', answer: '경도', category: '세계', gradeGroup: 'upper' },

  // ── 한국사 (Korean History) ──
  { text: '고려 시대에 만든 금속 활자를 ___이라 한다.', answer: '직지심체요절', category: '한국사', gradeGroup: 'upper' },
  { text: '세계 최초의 금속 활자 인쇄본은 ___이다.', answer: '직지심체요절', category: '한국사', gradeGroup: 'upper' },
  { text: '조선 시대의 신분 제도에서 가장 높은 신분은 ___이다.', answer: '양반', category: '한국사', gradeGroup: 'upper' },
  { text: '독립운동가로 안중근 의사가 쏜 사람은 ___이다.', answer: '이토 히로부미', category: '한국사', gradeGroup: 'upper' },
  { text: '3·1 운동이 일어난 해는 ___년이다.', answer: '1919', category: '한국사', gradeGroup: 'upper' },
  { text: '대한민국 임시정부가 세워진 도시는 ___이다.', answer: '상하이', category: '한국사', gradeGroup: 'upper' },
  { text: '경복궁을 지은 왕조는 ___이다.', answer: '조선', category: '한국사', gradeGroup: 'upper' },
  { text: '고려의 수도는 ___이다.', answer: '개경(개성)', category: '한국사', gradeGroup: 'upper' },
  { text: '조선 시대 과거 시험은 ___을 뽑기 위한 것이었다.', answer: '관리', category: '한국사', gradeGroup: 'upper' },
  { text: '을사늑약으로 빼앗긴 것은 ___권이다.', answer: '외교', category: '한국사', gradeGroup: 'upper' },
  { text: '일제 강점기에 우리말을 지키려 한 단체는 ___회이다.', answer: '조선어학', category: '한국사', gradeGroup: 'upper' },
  { text: '고구려의 고분 벽화로 유명한 것은 ___총이다.', answer: '무용', category: '한국사', gradeGroup: 'upper' },
  { text: '신라의 화랑들이 지킨 다섯 가지 덕목을 ___라 한다.', answer: '세속오계', category: '한국사', gradeGroup: 'upper' },
  { text: '조선 시대 학문을 연구하던 곳을 ___이라 한다.', answer: '성균관', category: '한국사', gradeGroup: 'upper' },
  { text: '고려 시대에 몽골의 침입을 막으며 만든 것은 ___이다.', answer: '팔만대장경', category: '한국사', gradeGroup: 'upper' },
  { text: '석굴암과 불국사가 있는 도시는 ___이다.', answer: '경주', category: '한국사', gradeGroup: 'upper' },

  // ── 인권 (Human Rights) ──
  { text: '사람이 태어나면서부터 가지는 권리를 ___이라 한다.', answer: '인권', category: '인권', gradeGroup: 'upper' },
  { text: '모든 사람은 ___하게 태어났다.', answer: '평등', category: '인권', gradeGroup: 'lower' },
  { text: '어린이의 권리를 보장하는 국제 협약을 ___이라 한다.', answer: '아동권리협약', category: '인권', gradeGroup: 'upper' },
  { text: '남녀가 동등한 기회를 갖는 것을 ___평등이라 한다.', answer: '양성', category: '인권', gradeGroup: 'upper' },
  { text: '장애인이 불편 없이 생활할 수 있는 시설을 ___시설이라 한다.', answer: '편의', category: '인권', gradeGroup: 'lower' },
  { text: '다른 사람을 괴롭히는 것을 ___이라 한다.', answer: '폭력(따돌림)', category: '인권', gradeGroup: 'lower' },
  { text: '사람의 생각을 자유롭게 말할 수 있는 권리를 ___의 자유라 한다.', answer: '표현', category: '인권', gradeGroup: 'upper' },
  { text: '자신의 종교를 자유롭게 믿을 수 있는 권리를 ___의 자유라 한다.', answer: '종교', category: '인권', gradeGroup: 'upper' },
  { text: '교육을 받을 수 있는 권리를 ___권이라 한다.', answer: '교육', category: '인권', gradeGroup: 'lower' },
  { text: '건강하게 살 수 있는 권리를 ___권이라 한다.', answer: '건강', category: '인권', gradeGroup: 'upper' },
  { text: '어린이날은 ___월 5일이다.', answer: '5', category: '인권', gradeGroup: 'lower' },
  { text: '세계 인권 선언은 ___년에 발표되었다.', answer: '1948', category: '인권', gradeGroup: 'upper' },
  { text: '차별 없이 모든 사람을 존중하는 것을 ___이라 한다.', answer: '존엄', category: '인권', gradeGroup: 'upper' },
  { text: '학교에서 친구를 왕따시키는 것은 ___에 해당한다.', answer: '학교폭력', category: '인권', gradeGroup: 'lower' },
  { text: '노인을 공경하는 것을 ___라 한다.', answer: '경로효친', category: '인권', gradeGroup: 'lower' },
  { text: '이웃과 서로 돕고 사는 것을 ___라 한다.', answer: '상부상조', category: '인권', gradeGroup: 'lower' },

  // ── 민주주의 (Democracy) ──
  { text: '국민이 주인인 정치 제도를 ___주의라 한다.', answer: '민주', category: '민주주의', gradeGroup: 'upper' },
  { text: '다수결의 원칙에서도 ___의 의견을 존중해야 한다.', answer: '소수', category: '민주주의', gradeGroup: 'lower' },
  { text: '민주주의에서 가장 중요한 가치는 ___이다.', answer: '자유', category: '민주주의', gradeGroup: 'upper' },
  { text: '선거에서 한 사람이 한 표를 행사하는 원칙을 ___선거라 한다.', answer: '평등', category: '민주주의', gradeGroup: 'upper' },
  { text: '비밀투표는 자신이 누구를 뽑았는지 ___로 하는 것이다.', answer: '비밀', category: '민주주의', gradeGroup: 'lower' },
  { text: '학급 회의에서 의견을 말하는 것은 ___에 참여하는 것이다.', answer: '민주주의', category: '민주주의', gradeGroup: 'lower' },
  { text: '시위나 집회에 참여할 수 있는 권리를 ___의 자유라 한다.', answer: '집회', category: '민주주의', gradeGroup: 'upper' },
  { text: '언론이 자유롭게 보도할 수 있는 것을 ___의 자유라 한다.', answer: '언론', category: '민주주의', gradeGroup: 'upper' },
  { text: '국민이 직접 대표를 뽑는 민주주의를 ___민주주의라 한다.', answer: '대의', category: '민주주의', gradeGroup: 'upper' },
  { text: '국민이 직접 정책을 결정하는 민주주의를 ___민주주의라 한다.', answer: '직접', category: '민주주의', gradeGroup: 'upper' },
  { text: '우리나라 최초의 민주화 운동 중 하나는 4·19 ___이다.', answer: '혁명', category: '민주주의', gradeGroup: 'upper' },
  { text: '5·18 민주화 운동이 일어난 도시는 ___이다.', answer: '광주', category: '민주주의', gradeGroup: 'upper' },
  { text: '민주주의에서 권력을 나누는 것을 ___분립이라 한다.', answer: '삼권', category: '민주주의', gradeGroup: 'upper' },
  { text: '삼권분립에서 세 가지 권력은 입법, 행정, ___이다.', answer: '사법', category: '민주주의', gradeGroup: 'upper' },
  { text: '대한민국은 ___공화국이다.', answer: '민주', category: '민주주의', gradeGroup: 'upper' },
  { text: '국민의 뜻을 모아 나라를 이끄는 것을 ___이라 한다.', answer: '민주정치', category: '민주주의', gradeGroup: 'lower' },

  // ── 전통문화 (Traditional Culture) ──
  { text: '설날에 먹는 전통 음식은 ___이다.', answer: '떡국', category: '전통문화', gradeGroup: 'lower' },
  { text: '정월 대보름에 먹는 견과류를 ___이라 한다.', answer: '부럼', category: '전통문화', gradeGroup: 'lower' },
  { text: '김치를 함께 담그는 문화를 ___이라 한다.', answer: '김장', category: '전통문화', gradeGroup: 'lower' },
  { text: '우리나라 전통 무술을 ___라 한다.', answer: '태권도', category: '전통문화', gradeGroup: 'lower' },
  { text: '전통 현악기 중 12줄로 된 악기는 ___이다.', answer: '가야금', category: '전통문화', gradeGroup: 'lower' },
  { text: '우리나라 전통 놀이 중 새해에 하는 것은 ___이다.', answer: '윷놀이', category: '전통문화', gradeGroup: 'lower' },
  { text: '명절에 조상에게 드리는 의식을 ___라 한다.', answer: '차례', category: '전통문화', gradeGroup: 'lower' },
  { text: '한옥의 여름철 시원한 마루를 ___라 한다.', answer: '대청마루', category: '전통문화', gradeGroup: 'lower' },
  { text: '전통 그림에서 호랑이와 까치를 그린 그림을 ___도라 한다.', answer: '민화', category: '전통문화', gradeGroup: 'upper' },
  { text: '우리나라 전통 도자기인 푸른빛 자기를 ___라 한다.', answer: '청자', category: '전통문화', gradeGroup: 'upper' },
  { text: '조선 시대 하얀 도자기를 ___라 한다.', answer: '백자', category: '전통문화', gradeGroup: 'upper' },
  { text: '전통 혼례에서 신부가 타는 것을 ___라 한다.', answer: '가마', category: '전통문화', gradeGroup: 'lower' },
  { text: '판소리에서 노래를 부르는 사람을 ___라 한다.', answer: '소리꾼', category: '전통문화', gradeGroup: 'upper' },
  { text: '판소리에서 북을 치는 사람을 ___라 한다.', answer: '고수', category: '전통문화', gradeGroup: 'upper' },
  { text: '우리나라 전통 춤 중 부채를 사용하는 춤은 ___이다.', answer: '부채춤', category: '전통문화', gradeGroup: 'lower' },
  { text: '한복에서 여자 윗옷을 ___라 한다.', answer: '저고리', category: '전통문화', gradeGroup: 'lower' },

  // ── 사회문제 (Social Issues) ──
  { text: '태어나는 아이의 수가 줄어드는 현상을 ___화라 한다.', answer: '저출산', category: '사회문제', gradeGroup: 'upper' },
  { text: '노인 인구가 늘어나는 현상을 ___화라 한다.', answer: '고령', category: '사회문제', gradeGroup: 'upper' },
  { text: '여러 나라 사람들이 함께 어울려 사는 사회를 ___사회라 한다.', answer: '다문화', category: '사회문제', gradeGroup: 'upper' },
  { text: '일자리가 부족하여 일할 수 없는 상태를 ___이라 한다.', answer: '실업', category: '사회문제', gradeGroup: 'upper' },
  { text: '가난한 사람과 부자의 차이가 큰 것을 ___격차라 한다.', answer: '빈부', category: '사회문제', gradeGroup: 'upper' },
  { text: '인터넷에서 거짓 정보가 퍼지는 것을 ___뉴스라 한다.', answer: '가짜', category: '사회문제', gradeGroup: 'upper' },
  { text: '스마트폰을 지나치게 사용하는 것을 ___이라 한다.', answer: '중독', category: '사회문제', gradeGroup: 'lower' },
  { text: '교통사고를 줄이기 위해 ___을 지켜야 한다.', answer: '교통규칙', category: '사회문제', gradeGroup: 'lower' },
  { text: '자연재해로 인한 피해를 줄이는 활동을 ___활동이라 한다.', answer: '방재', category: '사회문제', gradeGroup: 'upper' },
  { text: '정보를 안전하게 보호하는 것을 ___보호라 한다.', answer: '개인정보', category: '사회문제', gradeGroup: 'upper' },
  { text: '사이버 공간에서의 예절을 ___이라 한다.', answer: '네티켓', category: '사회문제', gradeGroup: 'lower' },
  { text: '안전한 먹거리를 위한 관리를 ___안전이라 한다.', answer: '식품', category: '사회문제', gradeGroup: 'lower' },
  { text: '지역 간 발전 차이를 ___격차라 한다.', answer: '지역', category: '사회문제', gradeGroup: 'upper' },
  { text: '에너지를 아끼고 환경을 생각하는 생활을 ___생활이라 한다.', answer: '녹색', category: '사회문제', gradeGroup: 'upper' },
  { text: '학교 주변에서 어린이를 보호하는 구역을 ___구역이라 한다.', answer: '스쿨존(어린이보호)', category: '사회문제', gradeGroup: 'lower' },
  { text: '화재 시 대피하는 훈련을 ___훈련이라 한다.', answer: '소방(대피)', category: '사회문제', gradeGroup: 'lower' },

  // ── 직업 (Jobs) ──
  { text: '아픈 사람을 치료하는 사람을 ___라 한다.', answer: '의사', category: '직업', gradeGroup: 'lower' },
  { text: '건물을 설계하는 사람을 ___라 한다.', answer: '건축가', category: '직업', gradeGroup: 'lower' },
  { text: '비행기를 조종하는 사람을 ___라 한다.', answer: '조종사', category: '직업', gradeGroup: 'lower' },
  { text: '학생을 가르치는 사람을 ___라 한다.', answer: '교사', category: '직업', gradeGroup: 'lower' },
  { text: '불을 끄고 사람을 구하는 사람을 ___라 한다.', answer: '소방관', category: '직업', gradeGroup: 'lower' },
  { text: '나라를 지키는 사람을 ___이라 한다.', answer: '군인', category: '직업', gradeGroup: 'lower' },
  { text: '범인을 잡는 사람을 ___이라 한다.', answer: '경찰', category: '직업', gradeGroup: 'lower' },
  { text: '요리를 전문으로 하는 사람을 ___라 한다.', answer: '요리사', category: '직업', gradeGroup: 'lower' },
  { text: '농작물을 기르는 사람을 ___이라 한다.', answer: '농부', category: '직업', gradeGroup: 'lower' },
  { text: '바다에서 물고기를 잡는 사람을 ___라 한다.', answer: '어부', category: '직업', gradeGroup: 'lower' },
  { text: '컴퓨터 프로그램을 만드는 사람을 ___라 한다.', answer: '프로그래머', category: '직업', gradeGroup: 'upper' },
  { text: '새로운 것을 연구하는 사람을 ___라 한다.', answer: '과학자', category: '직업', gradeGroup: 'lower' },
  { text: '사진을 찍는 것을 직업으로 하는 사람을 ___라 한다.', answer: '사진작가', category: '직업', gradeGroup: 'lower' },
  { text: '뉴스를 전하는 사람을 ___라 한다.', answer: '기자(앵커)', category: '직업', gradeGroup: 'lower' },
  { text: '환경을 연구하고 보호하는 사람을 ___라 한다.', answer: '환경전문가', category: '직업', gradeGroup: 'upper' },
  { text: '우주를 탐험하는 사람을 ___라 한다.', answer: '우주비행사', category: '직업', gradeGroup: 'lower' },

  // ── 지역사회 (Local Community) ──
  { text: '우리 동네에서 주민을 대표하는 사람을 ___이라 한다.', answer: '이장(통장)', category: '지역사회', gradeGroup: 'lower' },
  { text: '지역의 문제를 해결하기 위해 모이는 곳을 ___이라 한다.', answer: '주민센터', category: '지역사회', gradeGroup: 'lower' },
  { text: '동네에서 책을 빌려 볼 수 있는 곳은 ___이다.', answer: '도서관', category: '지역사회', gradeGroup: 'lower' },
  { text: '아픈 사람을 치료하는 곳은 ___이다.', answer: '병원', category: '지역사회', gradeGroup: 'lower' },
  { text: '물건을 사고파는 장소를 ___라 한다.', answer: '시장', category: '지역사회', gradeGroup: 'lower' },
  { text: '우편물을 보내는 곳은 ___이다.', answer: '우체국', category: '지역사회', gradeGroup: 'lower' },
  { text: '돈을 맡기거나 빌리는 곳은 ___이다.', answer: '은행', category: '지역사회', gradeGroup: 'lower' },
  { text: '범죄를 신고하는 곳은 ___이다.', answer: '경찰서', category: '지역사회', gradeGroup: 'lower' },
  { text: '불이 났을 때 신고하는 곳은 ___이다.', answer: '소방서', category: '지역사회', gradeGroup: 'lower' },
  { text: '화재 신고 전화번호는 ___이다.', answer: '119', category: '지역사회', gradeGroup: 'lower' },
  { text: '범죄 신고 전화번호는 ___이다.', answer: '112', category: '지역사회', gradeGroup: 'lower' },
  { text: '지역의 환경을 깨끗하게 유지하는 것을 ___라 한다.', answer: '환경미화', category: '지역사회', gradeGroup: 'lower' },
  { text: '이웃끼리 서로 돕는 것을 ___이라 한다.', answer: '이웃사촌', category: '지역사회', gradeGroup: 'lower' },
  { text: '지역 축제에 참여하면 지역의 ___을 알 수 있다.', answer: '문화', category: '지역사회', gradeGroup: 'lower' },
  { text: '주민이 함께 사용하는 시설을 ___시설이라 한다.', answer: '공공', category: '지역사회', gradeGroup: 'lower' },
  { text: '도시와 농촌이 서로 도우며 교류하는 것을 ___교류라 한다.', answer: '도농', category: '지역사회', gradeGroup: 'upper' },
];

// ─── GENERATOR FUNCTIONS ────────────────────────────────────

function filterByGrade(items: readonly (ScienceItem | SocialItem)[], grade: number): (ScienceItem | SocialItem)[] {
  const isLower = grade <= 4;
  return items.filter(item => {
    if (item.gradeGroup === 'both') return true;
    if (isLower && item.gradeGroup === 'lower') return true;
    if (!isLower && item.gradeGroup === 'upper') return true;
    // For upper grades, also include lower grade items at reduced weight handled by duplication below
    if (!isLower && item.gradeGroup === 'lower') return true;
    return false;
  });
}

function buildPool(
  items: readonly (ScienceItem | SocialItem)[],
  grade: number,
  seed: number,
  targetSize: number,
): KnowledgeEntry[] {
  const rng = seededRandom(seed);
  const eligible = filterByGrade(items, grade);

  // Weight: for grades 5-6, duplicate upper-grade items to bias toward them
  const weighted: (ScienceItem | SocialItem)[] = [];
  for (const item of eligible) {
    if (grade >= 5 && item.gradeGroup === 'upper') {
      weighted.push(item, item, item); // 3x weight for advanced content
    } else if (grade >= 5 && item.gradeGroup === 'both') {
      weighted.push(item, item);
    } else {
      weighted.push(item);
    }
  }

  // Expand to target size by cycling through shuffled pool
  const shuffled = shuffle(weighted, rng);
  const pool: KnowledgeEntry[] = [];
  const seen = new Set<string>();

  // First pass: add all unique items
  for (const item of shuffled) {
    const key = item.text + '|' + item.answer;
    if (!seen.has(key)) {
      seen.add(key);
      const entry: KnowledgeEntry = { text: item.text, answer: item.answer, category: item.category };
      if ((item as ScienceItem).unit) entry.unit = (item as ScienceItem).unit;
      pool.push(entry);
    }
  }

  // If we still need more, create variation entries by combining with grade context
  let round = 0;
  while (pool.length < targetSize) {
    round++;
    const extraRng = seededRandom(seed + round * 9999);
    const reshuffled = shuffle([...pool], extraRng);
    for (const entry of reshuffled) {
      if (pool.length >= targetSize) break;
      pool.push({ ...entry });
    }
  }

  // Final shuffle and trim
  const finalPool = shuffle(pool, seededRandom(seed + 7777));
  return finalPool.slice(0, targetSize);
}

// ─── EXTRA SCIENCE (compact tuples) ──────────────────────────
const SCI_X: [string,string,string,'lower'|'upper'|'both'][] = [
  ['개구리의 성장 과정에서 올챙이가 변하는 것을 ___이라 한다.','변태','생물','lower'],
  ['식물의 꽃에서 꿀을 만드는 부분을 ___이라 한다.','꿀샘','생물','lower'],
  ['동물의 몸 온도가 주변에 따라 변하면 ___동물이라 한다.','변온','생물','both'],
  ['포유류는 새끼에게 ___를 먹여 키운다.','젖','생물','lower'],
  ['거미는 곤충이 아닌 ___류에 속한다.','거미','생물','lower'],
  ['곤충의 다리는 ___개이다.','6','생물','lower'],
  ['거미의 다리는 ___개이다.','8','생물','lower'],
  ['상어는 뼈가 ___로 되어 있다.','연골','생물','upper'],
  ['조류의 몸은 ___으로 덮여 있다.','깃털','생물','lower'],
  ['파충류의 몸은 ___으로 덮여 있다.','비늘','생물','lower'],
  ['양서류는 어릴 때 ___로 숨을 쉰다.','아가미','생물','lower'],
  ['식물의 광합성은 ___에서 일어난다.','잎','생물','both'],
  ['식물의 잎이 초록색인 이유는 ___소 때문이다.','엽록','생물','upper'],
  ['뿌리가 물을 빨아들이는 것을 ___작용이라 한다.','삼투','생물','upper'],
  ['식물의 꽃가루가 암술에 닿는 것을 ___이라 한다.','수분','생물','lower'],
  ['열매 안에 들어있는 것을 ___라 한다.','씨앗','생물','lower'],
  ['지구의 표면은 여러 개의 ___으로 나뉘어 있다.','판','지구','upper'],
  ['지진의 세기를 나타내는 단위를 ___라 한다.','규모','지구','upper'],
  ['화산이 폭발할 때 나오는 가스를 ___라 한다.','화산가스','지구','upper'],
  ['퇴적암 중 모래가 굳어진 것을 ___암이라 한다.','사','지구','upper'],
  ['변성암은 열과 ___을 받아 변한 암석이다.','압력','지구','upper'],
  ['달의 바다라 불리는 어두운 부분은 사실 ___이다.','평원','우주','upper'],
  ['별자리 중 북쪽 하늘의 국자 모양은 ___자리이다.','북두칠성','우주','lower'],
  ['태양은 스스로 빛을 내는 ___이다.','항성','우주','upper'],
  ['달처럼 행성 주위를 도는 천체를 ___이라 한다.','위성','우주','lower'],
  ['혜성의 꼬리는 ___방향으로 생긴다.','태양 반대','우주','upper'],
  ['날씨를 예보하는 기관을 ___이라 한다.','기상청','날씨','lower'],
  ['습도가 높으면 빨래가 ___마른다.','천천히','날씨','lower'],
  ['안개는 지표면 가까이에 생긴 ___이다.','구름','날씨','lower'],
  ['이슬은 수증기가 ___되어 생긴다.','응결','날씨','lower'],
  ['서리는 수증기가 ___되어 생긴다.','승화','날씨','upper'],
  ['전기 회로에서 전류가 흐르려면 회로가 ___되어야 한다.','연결','물리','lower'],
  ['전선이 끊어지면 ___회로라 한다.','개방','물리','lower'],
  ['전구 두 개를 나란히 연결하면 ___연결이라 한다.','병렬','물리','upper'],
  ['전구 두 개를 이어서 연결하면 ___연결이라 한다.','직렬','물리','upper'],
  ['건전지에 저장된 에너지는 ___에너지이다.','화학','물리','upper'],
  ['떨어지는 물체는 ___에너지가 증가한다.','운동','물리','upper'],
  ['높은 곳에 있는 물체는 ___에너지가 크다.','위치','물리','upper'],
  ['소리가 벽에 부딪혀 되돌아오는 것을 ___라 한다.','메아리','물리','lower'],
  ['소리의 높낮이는 ___에 따라 달라진다.','진동수','물리','upper'],
  ['렌즈로 빛을 모으면 ___이 높아진다.','온도','물리','lower'],
  ['무지개의 색 순서는 빨주노초파남___이다.','보','물리','lower'],
  ['프리즘으로 햇빛을 분리하면 ___가지 색이 나온다.','7','물리','lower'],
  ['볼록렌즈는 빛을 한 곳으로 ___시킨다.','모음','물리','upper'],
  ['오목렌즈는 빛을 ___시킨다.','퍼지게','물리','upper'],
  ['물속에서 동전이 실제보다 ___보이는 것은 굴절 때문이다.','가깝게','물리','upper'],
  ['체온계의 원리는 물질의 ___팽창이다.','열','물리','lower'],
  ['음식물이 상하는 것을 ___이라 한다.','부패','생물','lower'],
  ['우유를 높은 온도로 가열하는 것을 ___이라 한다.','살균','화학','upper'],
  ['탄산음료에 들어있는 기체는 ___이다.','이산화탄소','화학','upper'],
  // ── 물리 추가 ──
  ['물체가 빠르게 움직일수록 ___에너지가 크다.','운동','물리','lower'],
  ['시소에서 무거운 사람이 받침점에 ___이 앉으면 균형이 맞는다.','가까','물리','lower'],
  ['물체를 밀거나 당기는 것을 ___이라 한다.','힘','물리','lower'],
  ['두 물체가 접촉하면 운동을 방해하는 ___이 생긴다.','마찰력','물리','upper'],
  ['물 위에 동전이 뜨는 것은 ___장력 때문이다.','표면','물리','upper'],
  ['빛이 다른 물질로 들어갈 때 방향이 바뀌는 것을 ___이라 한다.','굴절','물리','upper'],
  ['물체가 진동하면 ___가 발생한다.','소리','물리','lower'],
  ['진동이 빠를수록 소리가 ___아진다.','높','물리','lower'],
  ['진공 속에서 소리가 전달되지 ___는다.','않','물리','upper'],
  ['열은 온도가 높은 곳에서 ___은 곳으로 이동한다.','낮','물리','upper'],
  ['열이 물질 속에서 전달되는 것을 ___이라 한다.','전도','물리','upper'],
  ['물이 끓을 때 열이 위아래로 이동하는 것을 ___이라 한다.','대류','물리','upper'],
  ['태양열이 지구에 전달되는 것은 ___을 통해서이다.','복사','물리','upper'],
  ['깃털과 돌을 진공에서 떨어뜨리면 동시에 ___한다.','도착','물리','upper'],
  ['스프링의 늘어난 길이는 매단 물체의 ___에 비례한다.','무게','물리','lower'],
  ['물체의 무게를 측정하는 단위는 ___이다.','N(뉴턴)','물리','upper'],
  ['같은 무게라도 접촉 면적이 작으면 ___이 커진다.','압력','물리','upper'],
  ['고무줄을 늘렸다 놓으면 원래대로 돌아오는 힘을 ___이라 한다.','탄성력','물리','lower'],
  ['전지에서 +극에서 -극으로 전기가 흐르는 것을 ___라 한다.','전류','물리','upper'],
  ['물풍선이 터지면 물이 사방으로 퍼지는 것은 ___때문이다.','압력','물리','lower'],
  ['소리는 고체, 액체, 기체 중 ___에서 가장 빠르다.','고체','물리','upper'],
  ['빛의 삼원색은 빨강, 초록, ___이다.','파랑','물리','upper'],
  ['색의 삼원색은 빨강, 노랑, ___이다.','파랑','물리','lower'],
  ['물체에 작용하는 힘이 클수록 물체의 ___이 커진다.','가속도','물리','upper'],
  ['정지해 있는 물체는 힘을 가하지 않으면 계속 ___해 있다.','정지','물리','lower'],
  // ── 화학 추가 ──
  ['물이 0도에서 얼어 고체가 되는 현상을 ___라 한다.','응고','화학','lower'],
  ['드라이아이스가 바로 기체가 되는 현상을 ___라 한다.','승화','화학','upper'],
  ['물을 전기분해하면 수소와 ___가 나온다.','산소','화학','upper'],
  ['레몬즙은 ___맛이 나는 산성 물질이다.','신','화학','lower'],
  ['베이킹소다는 ___성 물질이다.','염기','화학','upper'],
  ['산과 염기가 만나면 ___반응이 일어난다.','중화','화학','upper'],
  ['설탕을 가열하면 갈색으로 변하는 것을 ___라 한다.','캐러멜화','화학','lower'],
  ['달걀을 삶으면 단백질이 ___되어 굳는다.','변성','화학','upper'],
  ['알코올 온도계에서 빨간 액체가 올라가는 것은 ___때문이다.','열팽창','화학','lower'],
  ['물은 4도에서 부피가 가장 ___다.','작','화학','upper'],
  ['얼음이 물에 뜨는 이유는 부피가 ___기 때문이다.','커지','화학','lower'],
  ['철에 녹이 스는 것은 철과 ___가 반응하기 때문이다.','산소','화학','upper'],
  ['불이 타려면 연료, 산소, ___의 세 가지가 필요하다.','점화온도','화학','upper'],
  ['소화기는 산소를 차단하여 불을 ___는 도구이다.','끄','화학','lower'],
  ['식초와 베이킹소다를 섞으면 ___가 발생한다.','이산화탄소','화학','lower'],
  ['소금물을 증발시키면 ___이 남는다.','소금','화학','lower'],
  ['기름과 물을 섞으면 서로 ___지 않는다.','섞이','화학','lower'],
  ['세제를 넣으면 기름과 물이 ___게 된다.','섞이','화학','lower'],
  ['물에 잉크를 떨어뜨리면 퍼지는 현상을 ___이라 한다.','확산','화학','upper'],
  ['원소 기호 O는 ___를 나타낸다.','산소','화학','upper'],
  ['원소 기호 H는 ___를 나타낸다.','수소','화학','upper'],
  ['원소 기호 C는 ___를 나타낸다.','탄소','화학','upper'],
  ['원소 기호 Fe는 ___를 나타낸다.','철','화학','upper'],
  ['물의 화학식은 ___이다.','H₂O','화학','upper'],
  ['순물질 한 가지로만 이루어진 것을 ___물질이라 한다.','순','화학','upper'],
  // ── 생물 추가 ──
  ['사람의 뼈는 약 ___개이다.','206','생물','upper'],
  ['사람의 이(치아)는 영구치 기준 ___개이다.','32','생물','upper'],
  ['식물의 뿌리 끝에서 물을 흡수하는 것을 ___라 한다.','뿌리털','생물','lower'],
  ['콩과 식물의 뿌리에 있는 ___균은 질소를 고정한다.','뿌리혹','생물','upper'],
  ['곰팡이와 버섯은 ___류에 속한다.','균','생물','upper'],
  ['세포에서 에너지를 만드는 기관을 ___라 한다.','미토콘드리아','생물','upper'],
  ['세포 안의 유전 물질이 모여 있는 곳을 ___이라 한다.','핵','생물','upper'],
  ['혈액이 흐르는 관을 ___이라 한다.','혈관','생물','lower'],
  ['코로 들이마신 공기는 ___를 통해 폐로 간다.','기관지','생물','upper'],
  ['소화기관에서 영양분을 흡수하는 곳은 ___이다.','소장','생물','upper'],
  ['대장의 역할은 수분을 ___하는 것이다.','흡수','생물','upper'],
  ['눈의 검은 부분을 ___이라 한다.','동공','생물','lower'],
  ['귀 안쪽에서 소리를 감지하는 부분을 ___이라 한다.','달팽이관','생물','upper'],
  ['식물이 계절에 따라 잎을 떨어뜨리는 것을 ___이라 한다.','낙엽','생물','lower'],
  ['민들레 씨앗은 ___을 이용해 퍼진다.','바람','생물','lower'],
  ['도꼬마리 씨앗은 ___의 몸에 붙어 퍼진다.','동물','생물','lower'],
  ['고구마는 ___로 번식할 수 있다.','줄기','생물','lower'],
  ['감자의 먹는 부분은 ___이 변한 것이다.','줄기','생물','lower'],
  ['당근의 먹는 부분은 ___이 변한 것이다.','뿌리','생물','lower'],
  ['미생물 중에서 유산균은 ___을 만드는 데 쓰인다.','요구르트','생물','lower'],
  ['사람의 혈액형은 A형, B형, AB형, ___형이 있다.','O','생물','upper'],
  ['심장은 1분에 약 ___번 뛴다.','70','생물','upper'],
  ['포유류의 새끼는 어미의 ___속에서 자란다.','자궁','생물','upper'],
  ['꿀벌이 꽃가루를 옮기는 것을 ___이라 한다.','화분매개','생물','both'],
  ['낙타의 혹에는 ___이 저장되어 있다.','지방','생물','lower'],
  ['카멜레온은 주변 환경에 맞게 ___을 바꾼다.','색','생물','lower'],
  // ── 지구 추가 ──
  ['지구의 중심부를 ___이라 한다.','핵','지구','upper'],
  ['지각 아래에 있는 두꺼운 층을 ___이라 한다.','맨틀','지구','upper'],
  ['지구의 나이는 약 ___억 년이다.','46','지구','upper'],
  ['지층은 ___에서 위로 순서대로 쌓인다.','아래','지구','lower'],
  ['석회암 동굴에서 천장에 매달린 것을 ___이라 한다.','종유석','지구','upper'],
  ['석회암 동굴에서 바닥에서 자란 것을 ___이라 한다.','석순','지구','upper'],
  ['바닷물이 증발하면 ___이 남는다.','소금','지구','lower'],
  ['강 상류에서는 바위가 깎여 V자 모양의 ___이 만들어진다.','계곡','지구','lower'],
  ['강 중류에서는 ___지형이 발달한다.','하안단구','지구','upper'],
  ['해안에서 파도에 의해 깎인 절벽을 ___이라 한다.','해식절벽','지구','upper'],
  ['화석 연료가 만들어지는 데는 수___만 년이 걸린다.','백','지구','upper'],
  ['화산에서 분출되는 작은 돌 조각을 ___이라 한다.','화산재','지구','lower'],
  ['지진이 발생한 지점을 ___이라 한다.','진원','지구','upper'],
  ['지진이 발생한 바로 위 지표를 ___이라 한다.','진앙','지구','upper'],
  ['지층이 휘어진 것을 ___이라 한다.','습곡','지구','upper'],
  ['지층이 끊어져 어긋난 것을 ___이라 한다.','단층','지구','upper'],
  ['지구의 자기장을 만드는 것은 ___핵이다.','외','지구','upper'],
  ['토양은 바위가 ___작용을 받아 잘게 부서진 것이다.','풍화','지구','lower'],
  // ── 날씨 추가 ──
  ['기압이 낮은 곳에서는 날씨가 ___다.','흐리','날씨','upper'],
  ['기압이 높은 곳에서는 날씨가 ___다.','맑','날씨','upper'],
  ['따뜻한 공기가 찬 공기 위로 올라가면 ___이 만들어진다.','구름','날씨','lower'],
  ['우박은 구름 속에서 물방울이 ___된 것이다.','얼음','날씨','lower'],
  ['황사는 중국과 몽골의 ___에서 날아온다.','사막','날씨','both'],
  ['장마는 ___에 비가 오랫동안 내리는 현상이다.','여름','날씨','lower'],
  ['태풍의 중심을 ___이라 한다.','눈','날씨','upper'],
  ['기온이 0도 이하로 내려가면 ___가 내린다.','눈','날씨','lower'],
  ['해풍은 낮에 ___에서 육지로 부는 바람이다.','바다','날씨','upper'],
  ['육풍은 밤에 ___에서 바다로 부는 바람이다.','육지','날씨','upper'],
  ['하루 중 기온이 가장 높은 때는 오후 ___시경이다.','2','날씨','lower'],
  ['하루 중 기온이 가장 낮은 때는 해 뜨기 ___이다.','직전','날씨','lower'],
  ['구름의 종류에는 적운, 층운, ___운이 있다.','권','날씨','upper'],
  ['비의 양을 재는 기구를 ___라 한다.','우량계','날씨','lower'],
  ['천둥 번개가 칠 때는 높은 곳에 ___으면 안 된다.','서','날씨','lower'],
  ['무지개는 비가 온 후 ___빛이 물방울에 굴절되어 나타난다.','햇','날씨','lower'],
  ['봄에 부는 건조한 바람을 ___이라 한다.','꽃샘추위','날씨','lower'],
  ['눈이 많이 내린 것을 ___라 한다.','폭설','날씨','lower'],
  ['비가 매우 많이 오는 것을 ___라 한다.','폭우','날씨','lower'],
  ['겨울철 한파가 오면 수도관이 ___할 수 있다.','동파','날씨','both'],
  // ── 우주 추가 ──
  ['태양계에서 두 번째로 큰 행성은 ___이다.','토성','우주','upper'],
  ['태양에서 가장 먼 행성은 ___이다.','해왕성','우주','upper'],
  ['지구와 화성 사이에 있는 행성은 ___이다.','없다(소행성대)','우주','upper'],
  ['금성은 ___의 여신 이름에서 따온 별이다.','사랑(비너스)','우주','lower'],
  ['화성의 표면이 붉은 이유는 ___가 많기 때문이다.','산화철','우주','upper'],
  ['태양계에서 가장 뜨거운 행성은 ___이다.','금성','우주','upper'],
  ['태양계에서 지구 바로 안쪽 행성은 ___이다.','금성','우주','upper'],
  ['태양계에서 지구 바로 바깥 행성은 ___이다.','화성','우주','upper'],
  ['우리 은하의 이름은 ___이다.','은하수','우주','lower'],
  ['달의 표면에 있는 큰 구덩이를 ___라 한다.','크레이터','우주','upper'],
  ['인류 최초로 달에 간 사람은 ___이다.','닐 암스트롱','우주','upper'],
  ['별이 반짝이는 이유는 ___의 흔들림 때문이다.','대기','우주','upper'],
  ['태양은 주로 ___로 이루어져 있다.','수소','우주','upper'],
  ['일식은 달이 ___을 가릴 때 일어난다.','태양','우주','both'],
  ['월식은 지구가 ___의 빛을 가릴 때 일어난다.','달','우주','both'],
  ['북극성은 ___자리에 속해 있다.','작은곰','우주','upper'],
  ['유성이 대기에서 타며 빛을 내는 것을 ___이라 한다.','별똥별','우주','lower'],
  ['소행성은 주로 화성과 ___사이에 있다.','목성','우주','upper'],
  ['태양의 흑점 수가 많으면 태양 활동이 ___하다.','활발','우주','upper'],
  ['국제우주정거장의 약자는 ___이다.','ISS','우주','upper'],
  ['밤하늘에서 가장 밝은 별은 ___이다.','시리우스','우주','upper'],
  ['천왕성은 ___으로 누워서 공전한다.','옆','우주','upper'],
  ['수성에는 ___가 거의 없어 기온차가 매우 크다.','대기','우주','upper'],
  ['목성의 큰 빨간 점은 거대한 ___이다.','폭풍','우주','upper'],
  // ── 추가 물리/화학/생물/지구/날씨/우주 ──
  ['빗방울이 떨어지는 것은 ___때문이다.','중력','물리','lower'],
  ['엘리베이터가 올라갈 때 몸이 무겁게 느껴지는 것은 ___때문이다.','관성','물리','upper'],
  ['자전거 바퀴에 공기를 넣으면 ___이 높아진다.','기압','물리','lower'],
  ['물을 가열하면 수증기가 되는 것은 ___변화이다.','상태','화학','lower'],
  ['구리와 주석을 섞으면 ___가 된다.','청동','화학','upper'],
  ['물에 소금을 넣으면 끓는점이 ___아진다.','높','화학','upper'],
  ['나방은 밤에 활동하는 ___성 곤충이다.','야행','생물','lower'],
  ['식물의 줄기가 위로 자라는 것은 ___성 때문이다.','굴중력','생물','upper'],
  ['겨울에 곰이 긴 잠을 자는 것을 ___이라 한다.','동면','생물','lower'],
  ['바닷물의 약 ___퍼센트가 소금이다.','3.5','지구','upper'],
  ['지구에서 물이 가장 많은 곳은 ___이다.','바다','지구','lower'],
  ['사계절이 생기는 이유는 지구의 ___이 기울어져 있기 때문이다.','자전축','우주','upper'],
  ['보름달에서 다음 보름달까지의 기간은 약 ___일이다.','29.5','우주','upper'],
];
const SCIENCE_EXTRA: ScienceItem[] = SCI_X.map(([text,answer,category,gradeGroup]) => ({text,answer,category,gradeGroup}));

// ─── EXTRA SOCIAL (compact tuples) ──────────────────────────
const SOC_X: [string,string,string,'lower'|'upper'|'both'][] = [
  ['우리나라 국보 1호였던 건물은 ___이다.','숭례문','문화','lower'],
  ['한반도의 동쪽 끝 섬은 ___이다.','독도','지리','both'],
  ['우리나라에서 가장 긴 강은 ___이다.','낙동강','지리','lower'],
  ['한라산은 ___도에 있다.','제주','지리','lower'],
  ['설악산은 ___도에 있다.','강원','지리','lower'],
  ['지리산은 전라도와 ___도에 걸쳐 있다.','경상','지리','lower'],
  ['우리나라의 행정 구역은 ___개의 광역시도로 나뉜다.','17','지리','upper'],
  ['조선 시대 과거 시험에서 장원은 ___등을 뜻한다.','1','역사','lower'],
  ['고려 시대에 발명된 인쇄술은 ___활자이다.','금속','역사','lower'],
  ['삼국 통일을 이룬 나라는 ___이다.','신라','역사','lower'],
  ['백제의 마지막 왕은 ___이다.','의자왕','역사','upper'],
  ['고구려를 세운 사람은 ___이다.','주몽','역사','lower'],
  ['신라의 수도는 ___이었다.','경주','역사','lower'],
  ['고려의 수도는 ___이었다.','개경','역사','lower'],
  ['조선 시대 양반의 집을 ___라 했다.','한옥','문화','lower'],
  ['우리나라 전통 무예인 ___는 올림픽 정식 종목이다.','태권도','문화','both'],
  ['판소리는 ___와 고수 두 사람이 하는 공연이다.','소리꾼','문화','lower'],
  ['한식은 유네스코 ___유산으로 등재되었다.','무형문화','문화','upper'],
  ['김치의 주재료는 ___이다.','배추','문화','lower'],
  ['설날에 먹는 대표 음식은 ___이다.','떡국','문화','lower'],
  ['정월대보름에 먹는 음식은 ___이다.','오곡밥','문화','lower'],
  ['국회의원은 ___을 만드는 일을 한다.','법','정치','upper'],
  ['대법원은 ___권에 속한다.','사법','정치','upper'],
  ['헌법재판소는 ___을 위반한 법률을 심판한다.','헌법','정치','upper'],
  ['선거에서 투표할 수 있는 나이는 만 ___세이다.','18','정치','upper'],
  ['민주주의에서 소수의 의견도 ___해야 한다.','존중','정치','both'],
  ['시장에서 물건의 가격이 정해지는 것을 ___의 법칙이라 한다.','수요와 공급','경제','upper'],
  ['은행에 돈을 맡기면 받는 것을 ___라 한다.','이자','경제','lower'],
  ['물건을 외국에 파는 것을 ___이라 한다.','수출','경제','upper'],
  ['물건을 외국에서 사오는 것을 ___이라 한다.','수입','경제','upper'],
  ['나라의 살림을 기록한 것을 ___라 한다.','예산','경제','upper'],
  ['세금으로 운영되는 학교를 ___학교라 한다.','공립','경제','lower'],
  ['유엔(UN)은 세계 ___을 위해 만들어졌다.','평화','세계','both'],
  ['올림픽의 오륜기는 ___개 대륙을 상징한다.','5','세계','lower'],
  ['세계 4대 문명 중 메소포타미아는 ___강 유역에서 발생했다.','티그리스·유프라테스','역사','upper'],
  ['프랑스 혁명의 3대 이념은 자유, 평등, ___이다.','박애','역사','upper'],
  ['제2차 세계대전이 끝난 해는 ___년이다.','1945','역사','upper'],
  ['간디는 ___의 독립을 이끈 지도자이다.','인도','세계','upper'],
  ['만리장성을 세운 나라는 ___이다.','중국','세계','lower'],
  ['이집트의 유명한 건축물은 ___이다.','피라미드','세계','lower'],
  ['자유의 여신상은 ___에 있다.','미국','세계','lower'],
  ['환경 오염을 줄이기 위해 ___에너지를 사용한다.','재생','환경','upper'],
  ['지구 온난화로 ___이 녹고 있다.','빙하','환경','upper'],
  ['미세먼지를 줄이려면 대중___을 이용해야 한다.','교통','환경','both'],
  ['쓰레기를 줄이는 3R은 줄이기, 재사용, ___이다.','재활용','환경','both'],
  ['플라스틱이 분해되는 데 약 ___년이 걸린다.','500','환경','upper'],
  ['멸종 위기 동물을 보호하는 곳을 ___라 한다.','보호구역','환경','lower'],
  ['비무장지대(DMZ)는 남한과 ___사이에 있다.','북한','정치','both'],
  ['이산가족은 남북 ___으로 헤어진 가족이다.','분단','정치','upper'],
  ['평화통일을 위한 남북 정상회담이 처음 열린 해는 ___년이다.','2000','역사','upper'],
  // ── 지리 추가 ──
  ['우리나라의 남쪽 끝 섬은 ___도이다.','마라','지리','lower'],
  ['태백산맥은 우리나라의 ___쪽에 있다.','동','지리','lower'],
  ['금강은 ___도에서 시작하여 서해로 흐른다.','충청','지리','lower'],
  ['영산강은 ___도를 흐르는 강이다.','전라','지리','lower'],
  ['우리나라에서 두 번째로 큰 섬은 ___도이다.','거제','지리','lower'],
  ['부산은 우리나라의 ___쪽에 있는 도시이다.','남동','지리','lower'],
  ['인천은 우리나라의 ___쪽에 있는 도시이다.','서','지리','lower'],
  ['울릉도는 ___해에 있는 섬이다.','동','지리','lower'],
  ['백두산의 꼭대기에 있는 호수를 ___라 한다.','천지','지리','both'],
  ['갯벌은 ___해안에 발달한다.','서','지리','lower'],
  ['우리나라의 동해안은 해안선이 ___하다.','단조','지리','upper'],
  ['우리나라의 서해안은 해안선이 ___하다.','복잡','지리','upper'],
  ['리아스식 해안은 ___해안에서 볼 수 있다.','서','지리','upper'],
  ['평야가 넓은 곳은 주로 ___를 많이 짓는다.','논농사','지리','lower'],
  // ── 역사 추가 ──
  ['세종대왕이 만든 비 오는 양을 재는 기구는 ___이다.','측우기','역사','both'],
  ['세종대왕이 만든 해시계는 ___이다.','앙부일구','역사','upper'],
  ['조선 시대 여성 화가로 유명한 사람은 ___이다.','신사임당','역사','both'],
  ['고려 시대 왕실의 도자기는 ___자이다.','청','역사','lower'],
  ['불국사와 석굴암은 ___시대에 만들어졌다.','신라','역사','lower'],
  ['첨성대는 별을 관측하던 ___이다.','천문대','역사','lower'],
  ['조선의 마지막 왕은 ___이다.','순종','역사','upper'],
  ['을사늑약이 체결된 해는 ___년이다.','1905','역사','upper'],
  ['안창호가 세운 독립운동 단체는 ___회이다.','흥사단','역사','upper'],
  ['유관순 열사가 만세 운동을 한 곳은 ___이다.','아우내장터','역사','upper'],
  ['발해를 세운 사람은 ___이다.','대조영','역사','upper'],
  ['발해는 고구려를 이은 나라로 ___국이라 불렸다.','해동성','역사','upper'],
  ['고려의 문벌 귀족 사회를 무너뜨린 무신정변은 ___년이다.','1170','역사','upper'],
  ['한산도 대첩에서 사용된 전술은 ___진이다.','학익','역사','upper'],
  // ── 문화 추가 ──
  ['우리나라 전통 놀이 중 줄을 당기는 놀이는 ___이다.','줄다리기','문화','lower'],
  ['우리나라 전통 놀이 중 돌을 쌓는 놀이는 ___이다.','돌탑쌓기','문화','lower'],
  ['한복에서 남자가 입는 바지를 ___라 한다.','바지','문화','lower'],
  ['한복에서 여자가 입는 치마를 ___라 한다.','치마','문화','lower'],
  ['우리나라 전통 타악기인 큰 북을 ___라 한다.','장구','문화','lower'],
  ['사물놀이에 사용되는 네 가지 악기는 꽹과리, 장구, 북, ___이다.','징','문화','both'],
  ['우리나라의 유네스코 세계유산으로 ___이 있다.','수원화성','문화','upper'],
  ['비빔밥의 뜻은 여러 재료를 ___는 밥이다.','섞','문화','lower'],
  ['떡볶이의 주재료는 ___이다.','떡','문화','lower'],
  ['대한민국의 화폐 단위는 ___이다.','원','문화','lower'],
  ['태극기의 가운데 무늬를 ___이라 한다.','태극','문화','lower'],
  ['태극기의 네 모서리에 있는 무늬를 ___라 한다.','건곤감리','문화','upper'],
  // ── 정치 추가 ──
  ['대통령이 법률안에 거부하는 것을 ___라 한다.','거부권','정치','upper'],
  ['국무총리는 ___이 임명한다.','대통령','정치','upper'],
  ['감사원은 국가의 ___를 감사한다.','회계','정치','upper'],
  ['지방자치단체의 의회를 ___의회라 한다.','지방','정치','upper'],
  ['조례는 ___자치단체에서 만든 규칙이다.','지방','정치','upper'],
  ['주민투표는 지역 주민이 직접 ___하는 것이다.','결정','정치','both'],
  ['국민이 법률안을 제안하는 것을 ___이라 한다.','국민발안','정치','upper'],
  ['정당은 정치적 뜻이 같은 사람들의 ___이다.','모임','정치','upper'],
  // ── 경제 추가 ──
  ['나라에서 거두는 돈을 ___라 한다.','세금','경제','lower'],
  ['부가가치세는 물건을 살 때 내는 ___이다.','세금','경제','upper'],
  ['월급에서 떼는 세금을 ___세라 한다.','소득','경제','upper'],
  ['돈의 가치가 떨어지면 물가가 ___한다.','상승','경제','upper'],
  ['환율은 다른 나라 돈과 우리나라 돈의 ___비율이다.','교환','경제','upper'],
  ['기업이 물건을 만들어 이익을 남기는 것을 ___라 한다.','이윤','경제','upper'],
  ['물건의 품질이 좋으면 ___가 높아진다.','수요','경제','upper'],
  ['경쟁이 치열하면 물건의 ___가 내려간다.','가격','경제','upper'],
  ['국내에서 생산된 모든 재화의 가치를 ___라 한다.','GDP','경제','upper'],
  ['시장에서 판매자끼리 경쟁하는 것을 ___경쟁이라 한다.','가격','경제','upper'],
  ['아이들이 용돈을 모아 쓰는 것을 ___관리라 한다.','용돈','경제','lower'],
  ['필요한 것과 원하는 것을 구분하는 것을 합리적 ___라 한다.','소비','경제','lower'],
  // ── 세계 추가 ──
  ['세계에서 가장 높은 산은 ___이다.','에베레스트','세계','upper'],
  ['세계에서 가장 긴 강은 ___강이다.','나일','세계','upper'],
  ['아프리카에서 가장 큰 사막은 ___사막이다.','사하라','세계','upper'],
  ['호주의 수도는 ___이다.','캔버라','세계','upper'],
  ['이탈리아의 수도는 ___이다.','로마','세계','upper'],
  ['독일의 수도는 ___이다.','베를린','세계','upper'],
  ['브라질의 수도는 ___이다.','브라질리아','세계','upper'],
  ['인도의 수도는 ___이다.','뉴델리','세계','upper'],
  ['캐나다의 수도는 ___이다.','오타와','세계','upper'],
  ['올림픽은 ___년마다 열린다.','4','세계','lower'],
  ['세계에서 가장 작은 나라는 ___이다.','바티칸','세계','upper'],
  ['콜로세움이 있는 나라는 ___이다.','이탈리아','세계','lower'],
  ['만리장성이 있는 나라는 ___이다.','중국','세계','lower'],
  ['타지마할이 있는 나라는 ___이다.','인도','세계','lower'],
  ['아마존 열대우림은 ___대륙에 있다.','남아메리카','세계','upper'],
  ['남극에 사는 대표적인 동물은 ___이다.','펭귄','세계','lower'],
  ['북극에 사는 대표적인 동물은 ___이다.','북극곰','세계','lower'],
  // ── 환경 추가 ──
  ['오존층은 태양의 ___선을 막아준다.','자외','환경','upper'],
  ['산성비는 대기 오염 물질이 ___에 녹아 내리는 비이다.','빗물','환경','upper'],
  ['열대우림이 사라지는 것을 ___파괴라 한다.','산림','환경','upper'],
  ['바다에 기름이 유출되면 ___오염이 발생한다.','해양','환경','upper'],
  ['음식물 쓰레기를 줄이면 ___을 보호할 수 있다.','환경','환경','lower'],
  ['탄소 발자국은 개인이 배출하는 ___의 양이다.','이산화탄소','환경','upper'],
  ['전기를 아끼면 ___배출을 줄일 수 있다.','탄소','환경','both'],
  ['자전거는 ___가 없는 친환경 교통수단이다.','배기가스','환경','lower'],
  ['생태계에서 한 종이 사라지면 다른 종에도 ___을 준다.','영향','환경','both'],
  ['물이 부족한 지역에서는 ___을 절약해야 한다.','물','환경','lower'],
  ['습지는 많은 ___의 서식지이다.','생물','환경','both'],
  ['태양광 발전은 ___을 이용해 전기를 만든다.','햇빛','환경','both'],
  // ── 추가 지리/역사/문화/정치/경제/세계/환경 ──
  ['우리나라에서 가장 넓은 평야는 ___평야이다.','호남','지리','lower'],
  ['경기도의 도청 소재지는 ___이다.','수원','지리','lower'],
  ['지도에서 땅의 이용 상태를 나타낸 것을 ___도라 한다.','토지이용','지리','upper'],
  ['조선 시대 세계 지도인 ___은 혼일강리역대국도지도이다.','혼일강리역대국도지도','역사','upper'],
  ['정조가 지은 성은 ___이다.','수원화성','역사','upper'],
  ['병인양요 때 프랑스가 약탈한 것은 ___도서이다.','외규장각','역사','upper'],
  ['우리나라 전통 음료인 ___은 쌀로 만든다.','식혜','문화','lower'],
  ['전통 떡 중 무지개 색의 떡을 ___이라 한다.','무지개떡','문화','lower'],
  ['국민의 의무에는 국방, 납세, 교육, ___이 있다.','근로','정치','upper'],
  ['대한민국 국회는 ___원제이다.','단','정치','upper'],
  ['기회비용은 하나를 선택할 때 포기하는 것의 ___이다.','가치','경제','upper'],
  ['용돈 기입장을 쓰면 돈을 ___있게 쓸 수 있다.','계획','경제','lower'],
  ['적도 부근의 기후를 ___기후라 한다.','열대','세계','upper'],
  ['유럽 연합의 약자는 ___이다.','EU','세계','upper'],
  ['분리수거를 하면 ___를 줄일 수 있다.','쓰레기','환경','lower'],
];
const SOCIAL_EXTRA: ScienceItem[] = SOC_X.map(([text,answer,category,gradeGroup]) => ({text,answer,category,gradeGroup}));

/**
 * Maps a science KnowledgeEntry to a curriculum unit string based on its category and content.
 * Only assigns units for specific textbook units; general items get no unit (always show).
 */
function assignScienceUnit(entry: KnowledgeEntry): string | undefined {
  const text = entry.text;
  const cat = entry.category;

  // 지구과학 mappings
  if (cat === '지구과학' || cat === '지구') {
    if (text.includes('지층') || text.includes('화석') || text.includes('퇴적암') || text.includes('암석')) return '지층과 화석';
    if (text.includes('화산') || text.includes('지진') || text.includes('마그마') || text.includes('용암')) return '화산과 지진';
    if (text.includes('태양계') || text.includes('행성') || text.includes('별자리') || text.includes('북극성')) return '태양계와 별';
    if (text.includes('날씨') || text.includes('기압') || text.includes('태풍') || text.includes('계절') && text.includes('기후')) return '날씨와 우리 생활';
    if (text.includes('지구') && (text.includes('달') || text.includes('공전') || text.includes('자전'))) return '지구와 달의 운동';
    if (text.includes('계절') && !text.includes('날씨')) return '계절의 변화';
    if (text.includes('지구의 모습') || text.includes('지각') || text.includes('침식') || text.includes('퇴적') && !text.includes('암')) return '지구의 모습';
  }

  // 물리 mappings
  if (cat === '물리') {
    if (text.includes('무게') || text.includes('수평') || text.includes('용수철 저울')) return '물체의 무게';
    if (text.includes('열') && (text.includes('온도') || text.includes('전도') || text.includes('대류') || text.includes('복사'))) return '온도와 열';
    if (text.includes('속력') || text.includes('운동') && (text.includes('등속') || text.includes('가속') || text.includes('빠르기'))) return '물체의 운동';
    if (text.includes('소리') || text.includes('진동') || text.includes('메아리')) return '소리의 성질';
    if (text.includes('그림자') || text.includes('렌즈') || text.includes('빛') && (text.includes('굴절') || text.includes('반사'))) return '그림자와 거울';
    if (text.includes('렌즈') || (text.includes('빛') && text.includes('렌즈'))) return '빛과 렌즈';
  }

  // 화학 mappings
  if (cat === '화학') {
    if (text.includes('혼합물') || text.includes('분리') || text.includes('거르기')) return '혼합물의 분리';
    if (text.includes('상태') || (text.includes('물') && (text.includes('얼음') || text.includes('수증기') || text.includes('끓')))) return '물의 상태 변화';
    if (text.includes('용해') || text.includes('용액') || text.includes('용매') || text.includes('용질')) return '용해와 용액';
    if (text.includes('산') && text.includes('염기') || text.includes('리트머스') || text.includes('중화')) return '산과 염기';
    if (text.includes('기체') && (text.includes('산소') || text.includes('이산화탄소') || text.includes('수소'))) return '여러 가지 기체';
    if (text.includes('연소') || text.includes('소화') || text.includes('불') && (text.includes('산소') || text.includes('탈'))) return '연소와 소화';
  }

  // 생물 mappings
  if (cat === '생물' || cat === '동물' || cat === '식물') {
    if (text.includes('한살이') && (text.includes('나비') || text.includes('개구리') || text.includes('알') || text.includes('번데기'))) return '동물의 한살이';
    if (text.includes('한살이') && (text.includes('씨') || text.includes('싹') || text.includes('꽃') || text.includes('열매'))) return '식물의 한살이';
    if (text.includes('다양한 생물') || text.includes('균류') || text.includes('미생물') || text.includes('곰팡이') || text.includes('세균')) return '다양한 생물과 우리 생활';
    if (text.includes('생물과 환경') || text.includes('생태계') || text.includes('먹이사슬') || text.includes('먹이그물')) return '생물과 환경';
    if (text.includes('식물의 구조') || text.includes('광합성') || text.includes('증산') || text.includes('물관') || text.includes('체관') || text.includes('엽록')) return '식물의 구조와 기능';
    if (text.includes('우리 몸') || text.includes('심장') || text.includes('혈액순환') || text.includes('소화기관') || text.includes('폐') || text.includes('뼈') && text.includes('근육')) return '우리 몸의 구조와 기능';
  }

  // 인체 mappings
  if (cat === '인체') {
    return '우리 몸의 구조와 기능';
  }

  return undefined;
}

export function generateSciencePool(grade: number, seed: number): KnowledgeEntry[] {
  const pool = buildPool([...SCIENCE_ITEMS, ...SCIENCE_EXTRA], grade, seed, 500);
  // Assign curriculum units to items based on content
  return pool.map(entry => {
    const unit = assignScienceUnit(entry);
    if (unit) return { ...entry, unit };
    return entry;
  });
}

export function generateSocialPool(grade: number, seed: number): KnowledgeEntry[] {
  return buildPool([...SOCIAL_ITEMS, ...SOCIAL_EXTRA], grade, seed, 500);
}
