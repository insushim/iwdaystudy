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
      pool.push({ text: item.text, answer: item.answer, category: item.category });
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

export function generateSciencePool(grade: number, seed: number): KnowledgeEntry[] {
  return buildPool(SCIENCE_ITEMS, grade, seed, 400);
}

export function generateSocialPool(grade: number, seed: number): KnowledgeEntry[] {
  return buildPool(SOCIAL_ITEMS, grade, seed, 400);
}
