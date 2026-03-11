/**
 * Procedural Safety Education Generator
 * Generates grade-appropriate Korean safety education fill-in-the-blank problems.
 * 15 categories, 500+ unique entries per call using seeded PRNG.
 */
import type { SafetyEntry } from "@/types/curriculum";

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function shuffle<T>(rng: () => number, arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type GradeGroup = "1-2" | "3-4" | "5-6";

interface SafetyTemplate {
  text: string;
  answer: string;
  category: string;
  gradeGroup: GradeGroup;
}

// ─────────────────────────────────────────────
// 1. 교통안전
// ─────────────────────────────────────────────
const TRAFFIC_SAFETY: SafetyTemplate[] = [
  // Grade 1-2
  { text: "횡단보도를 건널 때는 ___을 확인해야 한다.", answer: "신호등", category: "교통안전", gradeGroup: "1-2" },
  { text: "횡단보도에서는 초록불이 켜졌을 때 ___를 확인하고 건넌다.", answer: "좌우", category: "교통안전", gradeGroup: "1-2" },
  { text: "길을 건널 때는 ___을 들어 운전자에게 보여 준다.", answer: "손", category: "교통안전", gradeGroup: "1-2" },
  { text: "차도가 아닌 ___로 걸어야 안전하다.", answer: "인도", category: "교통안전", gradeGroup: "1-2" },
  { text: "빨간 신호등이 켜지면 ___해야 한다.", answer: "멈춤", category: "교통안전", gradeGroup: "1-2" },
  { text: "차에서 내릴 때는 ___이 오는지 확인해야 한다.", answer: "차", category: "교통안전", gradeGroup: "1-2" },
  { text: "버스를 탈 때는 ___에 줄을 서서 기다린다.", answer: "정류장", category: "교통안전", gradeGroup: "1-2" },
  { text: "자동차에 탈 때는 반드시 ___를 매야 한다.", answer: "안전벨트", category: "교통안전", gradeGroup: "1-2" },
  { text: "비 오는 날에는 밝은 색 ___을 입어 운전자가 잘 볼 수 있게 한다.", answer: "옷", category: "교통안전", gradeGroup: "1-2" },
  { text: "도로에서 ___를 하면 위험하다.", answer: "놀이", category: "교통안전", gradeGroup: "1-2" },
  { text: "보호자 없이 큰 ___를 혼자 건너면 안 된다.", answer: "도로", category: "교통안전", gradeGroup: "1-2" },
  { text: "어린이 통학버스에서 내릴 때는 버스가 완전히 ___한 후 내린다.", answer: "정차", category: "교통안전", gradeGroup: "1-2" },
  { text: "골목길에서 나올 때는 ___을 먼저 멈추고 살핀다.", answer: "발걸음", category: "교통안전", gradeGroup: "1-2" },
  { text: "횡단보도에서는 ___으로 빠르게 건너야 한다.", answer: "뛰지 않고 걸어서", category: "교통안전", gradeGroup: "1-2" },
  { text: "차가 다니는 곳에서는 ___을 쓰면 위험하다.", answer: "이어폰", category: "교통안전", gradeGroup: "1-2" },
  { text: "신호등이 없는 횡단보도에서는 차가 완전히 ___한 후 건넌다.", answer: "멈춤", category: "교통안전", gradeGroup: "1-2" },
  { text: "횡단보도에서는 ___쪽을 먼저 보고 건넌다.", answer: "왼", category: "교통안전", gradeGroup: "1-2" },
  { text: "학교 앞 ___구역에서는 차가 천천히 다녀야 한다.", answer: "어린이 보호", category: "교통안전", gradeGroup: "1-2" },
  { text: "차 뒤에서 ___를 하면 운전자가 볼 수 없어 위험하다.", answer: "숨바꼭질", category: "교통안전", gradeGroup: "1-2" },
  { text: "밤에 길을 걸을 때는 ___이 있는 옷을 입으면 안전하다.", answer: "반사", category: "교통안전", gradeGroup: "1-2" },
  { text: "어린이 보호구역의 제한 속도는 시속 ___km이다.", answer: "30", category: "교통안전", gradeGroup: "1-2" },
  // Grade 3-4
  { text: "자전거를 탈 때는 반드시 ___를 착용해야 한다.", answer: "헬멧", category: "교통안전", gradeGroup: "3-4" },
  { text: "자전거는 도로의 ___쪽으로 통행해야 한다.", answer: "오른", category: "교통안전", gradeGroup: "3-4" },
  { text: "교통사고가 발생하면 ___번으로 신고해야 한다.", answer: "112", category: "교통안전", gradeGroup: "3-4" },
  { text: "야간에 자전거를 탈 때는 ___등을 켜야 한다.", answer: "전조", category: "교통안전", gradeGroup: "3-4" },
  { text: "킥보드를 탈 때도 ___을 착용해야 한다.", answer: "보호장구", category: "교통안전", gradeGroup: "3-4" },
  { text: "교차로에서는 ___을 준수해야 한다.", answer: "교통신호", category: "교통안전", gradeGroup: "3-4" },
  { text: "자전거 타기 전에 ___와 체인을 점검해야 한다.", answer: "브레이크", category: "교통안전", gradeGroup: "3-4" },
  { text: "도로에서 인라인스케이트를 타면 ___하다.", answer: "위험", category: "교통안전", gradeGroup: "3-4" },
  { text: "자전거를 탈 때 ___을 사용하면 안 된다.", answer: "휴대전화", category: "교통안전", gradeGroup: "3-4" },
  { text: "교통표지판 중 ___표지판은 빨간색 원 안에 표시된다.", answer: "금지", category: "교통안전", gradeGroup: "3-4" },
  { text: "자전거 전용도로는 ___색으로 표시되어 있다.", answer: "파란", category: "교통안전", gradeGroup: "3-4" },
  { text: "비 오는 날 자전거를 탈 때 ___거리가 길어지므로 주의한다.", answer: "제동", category: "교통안전", gradeGroup: "3-4" },
  { text: "횡단보도가 없는 곳에서는 ___를 이용해 길을 건넌다.", answer: "육교", category: "교통안전", gradeGroup: "3-4" },
  { text: "자전거를 탈 때 ___명이 함께 타면 안 된다.", answer: "두", category: "교통안전", gradeGroup: "3-4" },
  { text: "자전거 탈 때 야간에는 ___색 옷을 입으면 안전하다.", answer: "밝은", category: "교통안전", gradeGroup: "3-4" },
  { text: "통학로에서는 지정된 ___원의 안내를 따른다.", answer: "교통안전지도", category: "교통안전", gradeGroup: "3-4" },
  { text: "자전거를 탄 후에는 안전한 곳에 ___을 채워 보관한다.", answer: "잠금장치", category: "교통안전", gradeGroup: "3-4" },
  { text: "보행 중 ___을 보면서 걸으면 사고 위험이 높다.", answer: "스마트폰", category: "교통안전", gradeGroup: "3-4" },
  { text: "교통사고 목격 시 ___을 기억하고 신고한다.", answer: "차량 번호", category: "교통안전", gradeGroup: "3-4" },
  { text: "자전거 헬멧은 머리 ___에 맞게 조절해서 쓴다.", answer: "크기", category: "교통안전", gradeGroup: "3-4" },
  // Grade 5-6
  { text: "도로교통법에 따르면 만 ___세 미만은 보호자 동반 없이 도로에서 자전거를 탈 수 없다.", answer: "13", category: "교통안전", gradeGroup: "5-6" },
  { text: "전동킥보드는 만 ___세 이상부터 이용할 수 있다.", answer: "16", category: "교통안전", gradeGroup: "5-6" },
  { text: "음주운전은 ___에 의해 처벌받는 범죄 행위이다.", answer: "법률", category: "교통안전", gradeGroup: "5-6" },
  { text: "보행자 사고 시 가해 차량의 ___번호를 기억해야 한다.", answer: "번호판", category: "교통안전", gradeGroup: "5-6" },
  { text: "교통사고 현장에서는 2차 사고를 방지하기 위해 ___를 설치한다.", answer: "삼각대", category: "교통안전", gradeGroup: "5-6" },
  { text: "자전거 이용 시 ___로 방향 전환 신호를 보내야 한다.", answer: "수신호", category: "교통안전", gradeGroup: "5-6" },
  { text: "교통안전 표지 중 노란색 다이아몬드는 ___표지이다.", answer: "주의", category: "교통안전", gradeGroup: "5-6" },
  { text: "교통사고 발생 시 부상자를 함부로 ___이면 2차 부상 위험이 있다.", answer: "움직", category: "교통안전", gradeGroup: "5-6" },
  { text: "횡단보도 사고 시 운전자는 ___의무를 진다.", answer: "구호", category: "교통안전", gradeGroup: "5-6" },
  { text: "어린이 통학버스 옆을 지날 때 다른 차는 일시 ___해야 한다.", answer: "정지", category: "교통안전", gradeGroup: "5-6" },
  { text: "보행자 전용도로에서는 ___이 통행할 수 없다.", answer: "자동차", category: "교통안전", gradeGroup: "5-6" },
  { text: "교통사고 시 보험사에 ___를 신고해야 한다.", answer: "사고 접수", category: "교통안전", gradeGroup: "5-6" },
  { text: "야간 보행 시 ___를 사용하면 운전자가 보행자를 잘 볼 수 있다.", answer: "반사 팔찌", category: "교통안전", gradeGroup: "5-6" },
  { text: "무단횡단은 ___법 위반으로 과태료가 부과될 수 있다.", answer: "도로교통", category: "교통안전", gradeGroup: "5-6" },
  { text: "자전거도 도로교통법상 ___에 해당한다.", answer: "차", category: "교통안전", gradeGroup: "5-6" },
  { text: "교통사고 목격자는 ___진술을 통해 사고 해결에 도움을 줄 수 있다.", answer: "증인", category: "교통안전", gradeGroup: "5-6" },
  { text: "스쿨존에서 사고를 내면 일반 도로보다 ___이 가중된다.", answer: "처벌", category: "교통안전", gradeGroup: "5-6" },
  { text: "대중교통을 이용하면 교통사고 위험과 ___오염을 줄일 수 있다.", answer: "환경", category: "교통안전", gradeGroup: "5-6" },
  { text: "고속도로에서 고장 시 갓길에 정차하고 ___m 뒤에 삼각대를 놓는다.", answer: "100", category: "교통안전", gradeGroup: "5-6" },
];

// ─────────────────────────────────────────────
// 2. 화재안전
// ─────────────────────────────────────────────
const FIRE_SAFETY: SafetyTemplate[] = [
  // Grade 1-2
  { text: "불이 났을 때는 ___번에 신고해야 한다.", answer: "119", category: "화재안전", gradeGroup: "1-2" },
  { text: "화재 시 엘리베이터 대신 ___를 이용해야 한다.", answer: "계단", category: "화재안전", gradeGroup: "1-2" },
  { text: "불이 나면 젖은 ___으로 코와 입을 막는다.", answer: "수건", category: "화재안전", gradeGroup: "1-2" },
  { text: "화재 시에는 ___을 낮추고 대피한다.", answer: "자세", category: "화재안전", gradeGroup: "1-2" },
  { text: "화재 경보가 울리면 즉시 밖으로 ___해야 한다.", answer: "대피", category: "화재안전", gradeGroup: "1-2" },
  { text: "성냥이나 ___는 어린이가 만지면 안 된다.", answer: "라이터", category: "화재안전", gradeGroup: "1-2" },
  { text: "화재 대피 훈련은 ___적으로 해야 한다.", answer: "정기", category: "화재안전", gradeGroup: "1-2" },
  { text: "집에서 불이 나면 ___부터 나가야 한다.", answer: "먼저 대피", category: "화재안전", gradeGroup: "1-2" },
  { text: "화재 시 연기가 많으면 ___로 기어서 이동한다.", answer: "바닥", category: "화재안전", gradeGroup: "1-2" },
  { text: "불이 난 곳에서 나오면 절대 다시 ___하면 안 된다.", answer: "들어가", category: "화재안전", gradeGroup: "1-2" },
  { text: "옷에 불이 붙으면 멈추고 ___서 불을 끈다.", answer: "굴러", category: "화재안전", gradeGroup: "1-2" },
  { text: "화재가 발생하면 큰 소리로 '___야!'라고 외친다.", answer: "불이", category: "화재안전", gradeGroup: "1-2" },
  { text: "가스레인지 근처에서 ___를 하면 안 된다.", answer: "장난", category: "화재안전", gradeGroup: "1-2" },
  { text: "콘센트에 ___를 너무 많이 꽂으면 화재가 날 수 있다.", answer: "플러그", category: "화재안전", gradeGroup: "1-2" },
  { text: "화재 대피 시 문을 열기 전에 문의 ___를 확인한다.", answer: "온도", category: "화재안전", gradeGroup: "1-2" },
  { text: "화재 시 대피할 수 없으면 ___에서 구조를 기다린다.", answer: "베란다", category: "화재안전", gradeGroup: "1-2" },
  { text: "촛불은 잠자기 전에 반드시 ___야 한다.", answer: "꺼", category: "화재안전", gradeGroup: "1-2" },
  { text: "난로나 히터 가까이에 ___을 놓으면 화재 위험이 있다.", answer: "빨래", category: "화재안전", gradeGroup: "1-2" },
  { text: "화재 시 ___으로 코와 입을 막으면 연기를 덜 마실 수 있다.", answer: "옷소매", category: "화재안전", gradeGroup: "1-2" },
  { text: "대피 경로에는 ___을 두지 않아야 한다.", answer: "물건", category: "화재안전", gradeGroup: "1-2" },
  { text: "집에서 화재 발생 시 가족과 만날 ___을 미리 정해 둔다.", answer: "장소", category: "화재안전", gradeGroup: "1-2" },
  // Grade 3-4
  { text: "소화기를 사용할 때 먼저 ___을 뽑아야 한다.", answer: "안전핀", category: "화재안전", gradeGroup: "3-4" },
  { text: "소화기 사용 시 바람을 ___에 두고 분사한다.", answer: "등", category: "화재안전", gradeGroup: "3-4" },
  { text: "화재 시 방문을 닫으면 불과 ___의 확산을 막을 수 있다.", answer: "연기", category: "화재안전", gradeGroup: "3-4" },
  { text: "가정에서 화재감지기인 ___를 설치하면 안전하다.", answer: "화재경보기", category: "화재안전", gradeGroup: "3-4" },
  { text: "전기 화재 시에는 ___로 끄면 안 된다.", answer: "물", category: "화재안전", gradeGroup: "3-4" },
  { text: "소화기의 사용 순서는 안전핀 뽑기, 호스 잡기, ___을 누르기이다.", answer: "손잡이", category: "화재안전", gradeGroup: "3-4" },
  { text: "기름에 불이 붙으면 ___으로 덮어 산소를 차단한다.", answer: "뚜껑", category: "화재안전", gradeGroup: "3-4" },
  { text: "아파트 화재 시 ___칸 완강기를 이용할 수 있다.", answer: "피난", category: "화재안전", gradeGroup: "3-4" },
  { text: "건물마다 비치된 ___도를 미리 확인해 두어야 한다.", answer: "대피경로", category: "화재안전", gradeGroup: "3-4" },
  { text: "화재의 3요소는 열, 산소, ___이다.", answer: "연료", category: "화재안전", gradeGroup: "3-4" },
  { text: "소화기는 불의 ___부분을 향해 분사한다.", answer: "아래", category: "화재안전", gradeGroup: "3-4" },
  { text: "가스 냄새가 나면 ___을 열어 환기시킨다.", answer: "창문", category: "화재안전", gradeGroup: "3-4" },
  { text: "가스 누출 시 ___스위치를 만지면 안 된다.", answer: "전기", category: "화재안전", gradeGroup: "3-4" },
  { text: "소화기의 유효기간은 보통 ___년이다.", answer: "10", category: "화재안전", gradeGroup: "3-4" },
  { text: "산불을 발견하면 ___에 신고한다.", answer: "산림청", category: "화재안전", gradeGroup: "3-4" },
  { text: "소화전은 건물 벽에 설치된 ___소화 장비이다.", answer: "옥내", category: "화재안전", gradeGroup: "3-4" },
  { text: "화재 시 비상구 위치를 알려 주는 ___등은 초록색이다.", answer: "유도", category: "화재안전", gradeGroup: "3-4" },
  { text: "캠핑장에서 화기 사용 후 ___을 완전히 끄고 자리를 뜬다.", answer: "불씨", category: "화재안전", gradeGroup: "3-4" },
  { text: "담뱃불이 완전히 꺼지지 않으면 ___가 날 수 있다.", answer: "화재", category: "화재안전", gradeGroup: "3-4" },
  { text: "소화기의 압력 게이지가 ___색이면 정상이다.", answer: "초록", category: "화재안전", gradeGroup: "3-4" },
  // Grade 5-6
  { text: "화재 발생 시 신고할 때 ___와 상황을 정확히 알려야 한다.", answer: "주소", category: "화재안전", gradeGroup: "5-6" },
  { text: "화재의 종류 중 A급 화재는 ___화재이다.", answer: "일반", category: "화재안전", gradeGroup: "5-6" },
  { text: "화재의 종류 중 B급 화재는 ___화재이다.", answer: "유류", category: "화재안전", gradeGroup: "5-6" },
  { text: "화재의 종류 중 C급 화재는 ___화재이다.", answer: "전기", category: "화재안전", gradeGroup: "5-6" },
  { text: "고층 건물 화재 시 옥상으로 대피할 때 ___의 도움을 받는다.", answer: "헬기", category: "화재안전", gradeGroup: "5-6" },
  { text: "화상을 입으면 즉시 ___로 15분 이상 식힌다.", answer: "흐르는 찬물", category: "화재안전", gradeGroup: "5-6" },
  { text: "스프링클러는 일정 온도에 도달하면 자동으로 ___를 뿌린다.", answer: "물", category: "화재안전", gradeGroup: "5-6" },
  { text: "화재 진압 후에도 ___이 남아 재발화할 수 있다.", answer: "잔불", category: "화재안전", gradeGroup: "5-6" },
  { text: "연기 흡입은 화재 사망의 주요 원인이므로 ___확보가 중요하다.", answer: "호흡", category: "화재안전", gradeGroup: "5-6" },
  { text: "소방차 진입로를 막는 불법 ___는 화재 진압을 방해한다.", answer: "주차", category: "화재안전", gradeGroup: "5-6" },
  { text: "D급 화재는 ___화재로 특수 소화약제가 필요하다.", answer: "금속", category: "화재안전", gradeGroup: "5-6" },
  { text: "방화는 고의로 불을 지르는 ___행위이다.", answer: "범죄", category: "화재안전", gradeGroup: "5-6" },
  { text: "공동주택에서는 소방 ___훈련에 반드시 참여해야 한다.", answer: "대피", category: "화재안전", gradeGroup: "5-6" },
  { text: "완강기는 고층에서 ___를 타고 내려오는 피난 기구이다.", answer: "줄", category: "화재안전", gradeGroup: "5-6" },
  { text: "화재 현장에서 소방관의 ___에 따라야 한다.", answer: "지시", category: "화재안전", gradeGroup: "5-6" },
  { text: "소방시설법에 따라 다중이용시설에는 ___를 반드시 비치해야 한다.", answer: "소화기", category: "화재안전", gradeGroup: "5-6" },
  { text: "밀폐 공간에서 화재 시 ___가 빠르게 소진된다.", answer: "산소", category: "화재안전", gradeGroup: "5-6" },
  { text: "화재 보험에 가입하면 화재 ___를 보상받을 수 있다.", answer: "피해", category: "화재안전", gradeGroup: "5-6" },
  { text: "자동화재탐지설비는 ___를 감지하여 경보를 울린다.", answer: "열과 연기", category: "화재안전", gradeGroup: "5-6" },
  { text: "피난 사다리는 아파트 ___에 설치되어 있다.", answer: "베란다", category: "화재안전", gradeGroup: "5-6" },
];

// ─────────────────────────────────────────────
// 3. 인터넷안전
// ─────────────────────────────────────────────
const INTERNET_SAFETY: SafetyTemplate[] = [
  // Grade 1-2
  { text: "인터넷을 할 때는 부모님의 ___을 받아야 한다.", answer: "허락", category: "인터넷안전", gradeGroup: "1-2" },
  { text: "모르는 사람의 ___를 클릭하면 안 된다.", answer: "링크", category: "인터넷안전", gradeGroup: "1-2" },
  { text: "인터넷에서 나의 ___과 주소를 알려 주면 안 된다.", answer: "이름", category: "인터넷안전", gradeGroup: "1-2" },
  { text: "컴퓨터를 너무 오래 하면 ___이 나빠진다.", answer: "눈", category: "인터넷안전", gradeGroup: "1-2" },
  { text: "인터넷에서 무서운 내용을 보면 ___에게 알려야 한다.", answer: "부모님", category: "인터넷안전", gradeGroup: "1-2" },
  { text: "인터넷으로 ___를 하면 건강에 좋지 않다.", answer: "밤샘", category: "인터넷안전", gradeGroup: "1-2" },
  { text: "스마트폰 사용 시간은 하루 ___시간 이내가 좋다.", answer: "1", category: "인터넷안전", gradeGroup: "1-2" },
  { text: "게임을 할 때는 정해진 ___을 지켜야 한다.", answer: "시간", category: "인터넷안전", gradeGroup: "1-2" },
  { text: "인터넷에서 친구에게 ___을 하면 안 된다.", answer: "욕", category: "인터넷안전", gradeGroup: "1-2" },
  { text: "모르는 사람이 보낸 ___을 열어 보면 안 된다.", answer: "메시지", category: "인터넷안전", gradeGroup: "1-2" },
  { text: "유튜브를 볼 때는 어린이용 ___를 사용한다.", answer: "모드", category: "인터넷안전", gradeGroup: "1-2" },
  { text: "온라인에서 다른 사람의 ___을 함부로 퍼뜨리면 안 된다.", answer: "사진", category: "인터넷안전", gradeGroup: "1-2" },
  { text: "태블릿을 사용할 때는 ___를 바르게 하고 사용한다.", answer: "자세", category: "인터넷안전", gradeGroup: "1-2" },
  { text: "인터넷에서 본 내용이 모두 ___인 것은 아니다.", answer: "사실", category: "인터넷안전", gradeGroup: "1-2" },
  { text: "온라인에서 나쁜 말을 들으면 ___을 끄고 어른에게 말한다.", answer: "화면", category: "인터넷안전", gradeGroup: "1-2" },
  { text: "게임에서 이기지 못해도 ___를 부리면 안 된다.", answer: "화", category: "인터넷안전", gradeGroup: "1-2" },
  { text: "인터넷 사용 후에는 ___을 하며 몸을 움직인다.", answer: "스트레칭", category: "인터넷안전", gradeGroup: "1-2" },
  { text: "부모님이 설정한 인터넷 사용 ___을 지켜야 한다.", answer: "규칙", category: "인터넷안전", gradeGroup: "1-2" },
  { text: "스마트폰을 가까이서 보면 ___이 나빠질 수 있다.", answer: "시력", category: "인터넷안전", gradeGroup: "1-2" },
  { text: "온라인에서 선물을 준다는 말에 ___하면 안 된다.", answer: "속", category: "인터넷안전", gradeGroup: "1-2" },
  // Grade 3-4
  { text: "비밀번호는 다른 사람에게 ___하면 안 된다.", answer: "공유", category: "인터넷안전", gradeGroup: "3-4" },
  { text: "인터넷 게시물에 ___을 쓰는 것은 사이버 폭력이다.", answer: "악플", category: "인터넷안전", gradeGroup: "3-4" },
  { text: "비밀번호는 영문, 숫자, ___를 섞어 만든다.", answer: "특수문자", category: "인터넷안전", gradeGroup: "3-4" },
  { text: "인터넷에서 만난 사람을 실제로 ___하면 위험하다.", answer: "만나", category: "인터넷안전", gradeGroup: "3-4" },
  { text: "다른 사람의 ___을 함부로 복사하면 저작권 침해이다.", answer: "글", category: "인터넷안전", gradeGroup: "3-4" },
  { text: "게임에서 ___결제를 함부로 하면 안 된다.", answer: "유료", category: "인터넷안전", gradeGroup: "3-4" },
  { text: "불법 ___을 다운받으면 법에 위반된다.", answer: "파일", category: "인터넷안전", gradeGroup: "3-4" },
  { text: "인터넷에서 모르는 프로그램을 ___하면 바이러스에 감염될 수 있다.", answer: "설치", category: "인터넷안전", gradeGroup: "3-4" },
  { text: "SNS에 자신의 위치를 실시간으로 ___하면 위험하다.", answer: "공개", category: "인터넷안전", gradeGroup: "3-4" },
  { text: "스마트폰 사용 후에는 ___를 쉬어야 한다.", answer: "눈", category: "인터넷안전", gradeGroup: "3-4" },
  { text: "사이버 폭력을 당하면 ___을 캡처해서 증거를 남긴다.", answer: "화면", category: "인터넷안전", gradeGroup: "3-4" },
  { text: "와이파이 비밀번호 없는 공개 ___은 해킹 위험이 있다.", answer: "네트워크", category: "인터넷안전", gradeGroup: "3-4" },
  // Grade 5-6
  { text: "온라인에서 타인을 지속적으로 괴롭히는 것을 ___라고 한다.", answer: "사이버 불링", category: "인터넷안전", gradeGroup: "5-6" },
  { text: "피싱 메일은 개인정보를 ___하기 위한 사기이다.", answer: "탈취", category: "인터넷안전", gradeGroup: "5-6" },
  { text: "SNS에 올린 정보는 완전히 ___할 수 없으므로 신중해야 한다.", answer: "삭제", category: "인터넷안전", gradeGroup: "5-6" },
  { text: "온라인 게임에서 현금 ___는 사기 피해를 당할 수 있다.", answer: "거래", category: "인터넷안전", gradeGroup: "5-6" },
  { text: "2단계 ___을 설정하면 계정 보안이 강화된다.", answer: "인증", category: "인터넷안전", gradeGroup: "5-6" },
  { text: "저작권이 있는 콘텐츠를 무단으로 사용하면 ___적 책임을 질 수 있다.", answer: "법", category: "인터넷안전", gradeGroup: "5-6" },
  { text: "디지털 ___은 한번 남으면 지우기 어려우므로 신중하게 행동한다.", answer: "발자국", category: "인터넷안전", gradeGroup: "5-6" },
  { text: "딥페이크는 ___를 조작하여 만든 가짜 영상이다.", answer: "얼굴", category: "인터넷안전", gradeGroup: "5-6" },
];

// ─────────────────────────────────────────────
// 4. 학교안전
// ─────────────────────────────────────────────
const SCHOOL_SAFETY: SafetyTemplate[] = [
  // Grade 1-2
  { text: "복도에서는 ___지 않고 걸어야 한다.", answer: "뛰", category: "학교안전", gradeGroup: "1-2" },
  { text: "계단에서는 ___을 잡고 올라간다.", answer: "난간", category: "학교안전", gradeGroup: "1-2" },
  { text: "교실에서 가위를 전달할 때는 ___부분을 잡고 건넨다.", answer: "날", category: "학교안전", gradeGroup: "1-2" },
  { text: "학교에서 다치면 ___실로 간다.", answer: "보건", category: "학교안전", gradeGroup: "1-2" },
  { text: "창문에 ___을 걸터앉으면 위험하다.", answer: "몸", category: "학교안전", gradeGroup: "1-2" },
  { text: "쉬는 시간에 교실에서 ___를 던지면 안 된다.", answer: "물건", category: "학교안전", gradeGroup: "1-2" },
  { text: "빗자루로 친구를 ___면 안 된다.", answer: "때리", category: "학교안전", gradeGroup: "1-2" },
  { text: "급식실에서는 ___면서 먹으면 안 된다.", answer: "뛰", category: "학교안전", gradeGroup: "1-2" },
  { text: "학교에서 모르는 사람이 부르면 따라가지 말고 ___에게 알린다.", answer: "선생님", category: "학교안전", gradeGroup: "1-2" },
  { text: "복도에서는 ___쪽으로 걸어야 한다.", answer: "오른", category: "학교안전", gradeGroup: "1-2" },
  { text: "교실 문을 세게 ___으면 손이 끼일 수 있다.", answer: "닫", category: "학교안전", gradeGroup: "1-2" },
  { text: "학용품인 ___로 장난치면 다칠 수 있다.", answer: "칼", category: "학교안전", gradeGroup: "1-2" },
  { text: "계단에서 친구를 ___면 큰 사고가 날 수 있다.", answer: "밀", category: "학교안전", gradeGroup: "1-2" },
  { text: "학교 놀이터 기구를 사용할 때는 ___를 지켜야 한다.", answer: "차례", category: "학교안전", gradeGroup: "1-2" },
  { text: "바닥이 젖어 있으면 ___질 수 있으므로 조심한다.", answer: "미끄러", category: "학교안전", gradeGroup: "1-2" },
  { text: "화장실 바닥이 젖어 있으면 ___이 있다.", answer: "위험", category: "학교안전", gradeGroup: "1-2" },
  { text: "급식 때 뜨거운 국을 받을 때는 ___히 걸어야 한다.", answer: "천천", category: "학교안전", gradeGroup: "1-2" },
  { text: "책상 모서리에 ___를 부딪히지 않도록 조심한다.", answer: "머리", category: "학교안전", gradeGroup: "1-2" },
  { text: "실험 도구는 선생님의 ___에 따라 사용한다.", answer: "지시", category: "학교안전", gradeGroup: "1-2" },
  { text: "체육 시간에는 운동에 적합한 ___를 신어야 한다.", answer: "운동화", category: "학교안전", gradeGroup: "1-2" },
  { text: "화재 대피 시 교실에서 ___에 줄을 서서 이동한다.", answer: "질서 있게", category: "학교안전", gradeGroup: "1-2" },
  // Grade 3-4
  { text: "과학 실험 시 ___를 착용하여 눈을 보호한다.", answer: "보안경", category: "학교안전", gradeGroup: "3-4" },
  { text: "실험실에서 화학 약품을 만질 때는 ___를 끼어야 한다.", answer: "장갑", category: "학교안전", gradeGroup: "3-4" },
  { text: "실습 중 사고가 발생하면 즉시 ___에게 보고한다.", answer: "선생님", category: "학교안전", gradeGroup: "3-4" },
  { text: "체육 시간에 준비 ___을 충분히 해야 부상을 예방할 수 있다.", answer: "운동", category: "학교안전", gradeGroup: "3-4" },
  { text: "미술 시간에 날카로운 도구를 사용할 때는 ___에 주의한다.", answer: "안전", category: "학교안전", gradeGroup: "3-4" },
  { text: "무거운 물건을 들 때는 ___를 굽혀서 든다.", answer: "무릎", category: "학교안전", gradeGroup: "3-4" },
  { text: "학교 운동장에서 야구를 할 때는 ___를 쓰고 한다.", answer: "헬멧", category: "학교안전", gradeGroup: "3-4" },
  // Grade 5-6
  { text: "학교 안전사고 발생 시 ___조치를 먼저 취한다.", answer: "응급", category: "학교안전", gradeGroup: "5-6" },
  { text: "체육 시간에 과격한 운동 중 ___가 나면 즉시 중단한다.", answer: "통증", category: "학교안전", gradeGroup: "5-6" },
  { text: "학교에서 지진 대피 훈련 시 책상 아래로 들어가 ___를 보호한다.", answer: "머리", category: "학교안전", gradeGroup: "5-6" },
  { text: "과학실에서 알코올램프 사용 후 ___으로 덮어 끈다.", answer: "뚜껑", category: "학교안전", gradeGroup: "5-6" },
  { text: "실험 중 유리가 깨지면 맨손이 아닌 ___를 사용해 정리한다.", answer: "빗자루", category: "학교안전", gradeGroup: "5-6" },
  { text: "체육관에서 운동 시 ___을 충분히 갖추어야 한다.", answer: "보호장비", category: "학교안전", gradeGroup: "5-6" },
  { text: "실험실에서는 반드시 ___를 확인 후 약품을 사용한다.", answer: "라벨", category: "학교안전", gradeGroup: "5-6" },
];

// ─────────────────────────────────────────────
// 5. 놀이안전
// ─────────────────────────────────────────────
const PLAY_SAFETY: SafetyTemplate[] = [
  // Grade 1-2
  { text: "그네를 탈 때는 ___을 꼭 잡아야 한다.", answer: "줄", category: "놀이안전", gradeGroup: "1-2" },
  { text: "미끄럼틀을 거꾸로 ___면 위험하다.", answer: "올라가", category: "놀이안전", gradeGroup: "1-2" },
  { text: "놀이터에서 ___를 밀면 안 된다.", answer: "친구", category: "놀이안전", gradeGroup: "1-2" },
  { text: "시소를 탈 때 갑자기 ___면 상대방이 다칠 수 있다.", answer: "내리", category: "놀이안전", gradeGroup: "1-2" },
  { text: "놀이터 바닥이 젖었을 때는 ___질 수 있으므로 조심한다.", answer: "미끄러", category: "놀이안전", gradeGroup: "1-2" },
  { text: "철봉에서 놀 때는 ___이 미끄러지지 않도록 한다.", answer: "손", category: "놀이안전", gradeGroup: "1-2" },
  { text: "놀이기구가 ___져 있으면 사용하지 않는다.", answer: "고장나", category: "놀이안전", gradeGroup: "1-2" },
  { text: "놀이기구 위에서 ___를 던지면 안 된다.", answer: "물건", category: "놀이안전", gradeGroup: "1-2" },
  { text: "그네가 움직일 때 앞으로 ___가면 위험하다.", answer: "다가", category: "놀이안전", gradeGroup: "1-2" },
  { text: "높은 곳에서 ___면 크게 다칠 수 있다.", answer: "뛰어내리", category: "놀이안전", gradeGroup: "1-2" },
  { text: "놀이터에서 놀 때 ___끈이 달린 옷은 놀이기구에 걸릴 수 있다.", answer: "목", category: "놀이안전", gradeGroup: "1-2" },
  { text: "장난감 총의 ___을 사람에게 겨누면 안 된다.", answer: "총구", category: "놀이안전", gradeGroup: "1-2" },
  { text: "볼풀장에서 다른 친구의 ___를 밟지 않도록 주의한다.", answer: "몸", category: "놀이안전", gradeGroup: "1-2" },
  { text: "인라인스케이트를 탈 때는 ___와 무릎보호대를 착용한다.", answer: "헬멧", category: "놀이안전", gradeGroup: "1-2" },
  { text: "공놀이는 ___가 없는 넓은 곳에서 한다.", answer: "차", category: "놀이안전", gradeGroup: "1-2" },
  { text: "놀이터 모래를 ___에 넣으면 안 된다.", answer: "입", category: "놀이안전", gradeGroup: "1-2" },
  { text: "놀이기구를 탈 때는 ___를 기다려야 한다.", answer: "차례", category: "놀이안전", gradeGroup: "1-2" },
  { text: "밖에서 놀다 다치면 바로 ___에게 알려야 한다.", answer: "어른", category: "놀이안전", gradeGroup: "1-2" },
  { text: "비 온 뒤 놀이기구는 ___워서 미끄러울 수 있다.", answer: "젖", category: "놀이안전", gradeGroup: "1-2" },
  { text: "날카로운 ___을 가지고 놀면 다칠 수 있다.", answer: "물건", category: "놀이안전", gradeGroup: "1-2" },
  { text: "놀이터에서 놀고 난 후에는 반드시 ___을 씻어야 한다.", answer: "손", category: "놀이안전", gradeGroup: "1-2" },
  // Grade 3-4
  { text: "자전거를 탈 때는 ___와 팔꿈치 보호대를 착용한다.", answer: "무릎", category: "놀이안전", gradeGroup: "3-4" },
  { text: "트램펄린을 탈 때는 한 번에 ___명만 사용해야 한다.", answer: "한", category: "놀이안전", gradeGroup: "3-4" },
  { text: "야외 활동 시 ___에 쏘이지 않도록 주의한다.", answer: "벌", category: "놀이안전", gradeGroup: "3-4" },
  { text: "연을 날릴 때 ___선 근처에서 하면 안 된다.", answer: "전", category: "놀이안전", gradeGroup: "3-4" },
  { text: "산에서 놀 때는 ___길을 벗어나지 않는다.", answer: "등산", category: "놀이안전", gradeGroup: "3-4" },
  { text: "캠핑 시 ___에 가까이 가지 않는다.", answer: "불", category: "놀이안전", gradeGroup: "3-4" },
  { text: "야외 놀이 후에는 ___에 물려 있는지 확인한다.", answer: "진드기", category: "놀이안전", gradeGroup: "3-4" },
  // Grade 5-6
  { text: "익스트림 스포츠를 할 때는 전문 ___의 지도 아래 해야 한다.", answer: "강사", category: "놀이안전", gradeGroup: "5-6" },
  { text: "야외 활동 시 ___예보를 미리 확인한다.", answer: "날씨", category: "놀이안전", gradeGroup: "5-6" },
  { text: "겨울에 ___판 위에서 놀 때 두께를 확인해야 한다.", answer: "얼음", category: "놀이안전", gradeGroup: "5-6" },
  { text: "승마 체험 시 반드시 ___을 착용한다.", answer: "안전모", category: "놀이안전", gradeGroup: "5-6" },
  { text: "레프팅을 할 때는 ___를 반드시 입어야 한다.", answer: "구명조끼", category: "놀이안전", gradeGroup: "5-6" },
  { text: "스키를 탈 때는 자기 ___에 맞는 코스를 선택한다.", answer: "수준", category: "놀이안전", gradeGroup: "5-6" },
  { text: "암벽 등반 시 ___장비를 반드시 점검한다.", answer: "안전", category: "놀이안전", gradeGroup: "5-6" },
];

// ─────────────────────────────────────────────
// 6. 식품안전
// ─────────────────────────────────────────────
const FOOD_SAFETY: SafetyTemplate[] = [
  // Grade 1-2
  { text: "음식을 먹기 전에는 반드시 ___을 씻어야 한다.", answer: "손", category: "식품안전", gradeGroup: "1-2" },
  { text: "유통기한이 ___난 음식은 먹으면 안 된다.", answer: "지", category: "식품안전", gradeGroup: "1-2" },
  { text: "길에서 파는 음식은 ___하지 않을 수 있다.", answer: "위생적", category: "식품안전", gradeGroup: "1-2" },
  { text: "음식을 먹다 배가 아프면 ___에게 말해야 한다.", answer: "어른", category: "식품안전", gradeGroup: "1-2" },
  { text: "날것의 고기나 ___는 익혀서 먹어야 한다.", answer: "생선", category: "식품안전", gradeGroup: "1-2" },
  { text: "냉장고에서 꺼낸 음식은 ___를 확인한다.", answer: "냄새", category: "식품안전", gradeGroup: "1-2" },
  { text: "과일을 먹기 전에 깨끗이 ___야 한다.", answer: "씻어", category: "식품안전", gradeGroup: "1-2" },
  { text: "밥을 먹을 때 ___으면서 먹으면 체할 수 있다.", answer: "급하게 뛰", category: "식품안전", gradeGroup: "1-2" },
  { text: "뜨거운 음식을 먹을 때는 ___서 먹는다.", answer: "식혀", category: "식품안전", gradeGroup: "1-2" },
  { text: "떨어진 음식은 ___에 넣으면 안 된다.", answer: "입", category: "식품안전", gradeGroup: "1-2" },
  { text: "물은 끓인 물이나 정수된 ___을 마셔야 한다.", answer: "물", category: "식품안전", gradeGroup: "1-2" },
  { text: "급식을 받을 때 ___을 하고 먹는다.", answer: "손 씻기", category: "식품안전", gradeGroup: "1-2" },
  // Grade 3-4
  { text: "식중독을 예방하려면 음식을 ___도 이상에서 충분히 익혀야 한다.", answer: "75", category: "식품안전", gradeGroup: "3-4" },
  { text: "여름철에는 음식이 쉽게 ___하므로 주의해야 한다.", answer: "상", category: "식품안전", gradeGroup: "3-4" },
  { text: "알레르기가 있는 음식의 ___를 미리 확인해야 한다.", answer: "성분", category: "식품안전", gradeGroup: "3-4" },
  { text: "도마와 칼은 육류용과 ___용을 구분해서 사용한다.", answer: "채소", category: "식품안전", gradeGroup: "3-4" },
  { text: "손에 ___가 있을 때 음식을 만지면 세균이 옮겨질 수 있다.", answer: "상처", category: "식품안전", gradeGroup: "3-4" },
  { text: "식품 포장에 있는 ___표시를 확인하고 구매한다.", answer: "인증", category: "식품안전", gradeGroup: "3-4" },
  { text: "냉동 식품을 해동할 때는 ___에서 천천히 녹인다.", answer: "냉장고", category: "식품안전", gradeGroup: "3-4" },
  { text: "음식을 조리한 후 ___시간 이내에 먹는 것이 안전하다.", answer: "2", category: "식품안전", gradeGroup: "3-4" },
  { text: "계란을 만진 후에는 반드시 손을 ___야 한다.", answer: "씻어", category: "식품안전", gradeGroup: "3-4" },
  { text: "식중독의 3대 예방 원칙은 손 씻기, 익혀 먹기, ___보관하기이다.", answer: "냉장", category: "식품안전", gradeGroup: "3-4" },
  // Grade 5-6
  { text: "식중독을 일으키는 대표적 세균으로 ___균이 있다.", answer: "살모넬라", category: "식품안전", gradeGroup: "5-6" },
  { text: "식품 첨가물 중 ___제는 식품의 색을 내기 위해 사용된다.", answer: "착색", category: "식품안전", gradeGroup: "5-6" },
  { text: "HACCP 마크는 식품의 ___관리가 인증된 표시이다.", answer: "위생", category: "식품안전", gradeGroup: "5-6" },
  { text: "교차 오염을 방지하려면 조리 기구를 ___별로 구분 사용한다.", answer: "식재료", category: "식품안전", gradeGroup: "5-6" },
  { text: "구토와 설사 증상이 나타나면 ___을 의심해 볼 수 있다.", answer: "식중독", category: "식품안전", gradeGroup: "5-6" },
  { text: "가공식품의 ___표를 확인하면 영양소 정보를 알 수 있다.", answer: "영양성분", category: "식품안전", gradeGroup: "5-6" },
  { text: "식중독 예방을 위해 조리 시 ___을 착용한다.", answer: "위생장갑", category: "식품안전", gradeGroup: "5-6" },
];

// ─────────────────────────────────────────────
// 7. 자연재해
// ─────────────────────────────────────────────
const NATURAL_DISASTER: SafetyTemplate[] = [
  // Grade 1-2
  { text: "지진이 나면 ___아래로 들어가 몸을 보호한다.", answer: "책상", category: "자연재해", gradeGroup: "1-2" },
  { text: "천둥 번개가 칠 때는 ___아래로 피하지 않는다.", answer: "나무", category: "자연재해", gradeGroup: "1-2" },
  { text: "태풍이 오면 ___을 닫고 집 안에 있어야 한다.", answer: "창문", category: "자연재해", gradeGroup: "1-2" },
  { text: "홍수가 나면 높은 ___으로 대피해야 한다.", answer: "곳", category: "자연재해", gradeGroup: "1-2" },
  { text: "비가 많이 올 때 ___에 가까이 가면 위험하다.", answer: "하천", category: "자연재해", gradeGroup: "1-2" },
  { text: "지진이 나면 ___로 머리를 보호한다.", answer: "방석", category: "자연재해", gradeGroup: "1-2" },
  { text: "태풍이 오면 밖에 있는 ___을 안으로 들여놓는다.", answer: "물건", category: "자연재해", gradeGroup: "1-2" },
  { text: "폭설이 내리면 미끄러지지 않도록 ___을 조심해서 걷는다.", answer: "길", category: "자연재해", gradeGroup: "1-2" },
  { text: "황사가 심한 날에는 ___을 쓰고 외출한다.", answer: "마스크", category: "자연재해", gradeGroup: "1-2" },
  { text: "지진이 멈추면 ___를 이용해 밖으로 나간다.", answer: "계단", category: "자연재해", gradeGroup: "1-2" },
  { text: "번개가 칠 때 물에 들어가면 ___을 당할 수 있다.", answer: "감전", category: "자연재해", gradeGroup: "1-2" },
  { text: "비가 많이 오는 날 ___이 있는 곳은 위험하다.", answer: "웅덩이", category: "자연재해", gradeGroup: "1-2" },
  // Grade 3-4
  { text: "지진 발생 시 흔들림이 멈추면 ___로 대피한다.", answer: "운동장", category: "자연재해", gradeGroup: "3-4" },
  { text: "태풍 시 강풍으로 날아오는 ___에 주의해야 한다.", answer: "간판", category: "자연재해", gradeGroup: "3-4" },
  { text: "지진의 세기를 나타내는 단위는 ___이다.", answer: "규모", category: "자연재해", gradeGroup: "3-4" },
  { text: "쓰나미가 발생하면 해안에서 ___로 빠르게 대피한다.", answer: "고지대", category: "자연재해", gradeGroup: "3-4" },
  { text: "폭염 시 외출을 자제하고 충분한 ___을 섭취해야 한다.", answer: "수분", category: "자연재해", gradeGroup: "3-4" },
  { text: "미세먼지가 심한 날에는 외출 후 반드시 ___을 씻는다.", answer: "손", category: "자연재해", gradeGroup: "3-4" },
  { text: "재난 발생 시 ___방송을 통해 정보를 얻는다.", answer: "재난", category: "자연재해", gradeGroup: "3-4" },
  { text: "호우 경보가 발령되면 지하 ___는 침수될 수 있으므로 대피한다.", answer: "주차장", category: "자연재해", gradeGroup: "3-4" },
  { text: "산사태 위험 지역에서는 큰 비가 올 때 ___해야 한다.", answer: "대피", category: "자연재해", gradeGroup: "3-4" },
  { text: "가뭄이 심할 때는 ___을 아껴 써야 한다.", answer: "물", category: "자연재해", gradeGroup: "3-4" },
  { text: "자연재해를 대비하여 ___가방을 미리 준비해 둔다.", answer: "비상", category: "자연재해", gradeGroup: "3-4" },
  { text: "비상 가방에는 물, 손전등, ___을 넣어 둔다.", answer: "비상식량", category: "자연재해", gradeGroup: "3-4" },
  // Grade 5-6
  { text: "한국의 지진 관측은 ___청에서 담당한다.", answer: "기상", category: "자연재해", gradeGroup: "5-6" },
  { text: "긴급 재난 문자는 ___를 통해 전송된다.", answer: "휴대전화", category: "자연재해", gradeGroup: "5-6" },
  { text: "지진 대피 시 3가지 행동 수칙은 엎드려, 잡아, ___이다.", answer: "기다려", category: "자연재해", gradeGroup: "5-6" },
  { text: "태풍의 눈에서는 일시적으로 바람이 ___지만 곧 다시 강해진다.", answer: "약해", category: "자연재해", gradeGroup: "5-6" },
  { text: "폭염 시 열사병 환자가 발생하면 ___한 곳으로 옮기고 체온을 낮춘다.", answer: "시원", category: "자연재해", gradeGroup: "5-6" },
  { text: "재난 시 가족과 만날 ___을 미리 정해 둔다.", answer: "장소", category: "자연재해", gradeGroup: "5-6" },
  { text: "지진 시 ___가 차단될 수 있으므로 손전등을 준비한다.", answer: "전기", category: "자연재해", gradeGroup: "5-6" },
  { text: "화산 폭발 시 ___재가 내리면 마스크와 고글을 착용한다.", answer: "화산", category: "자연재해", gradeGroup: "5-6" },
];

// ─────────────────────────────────────────────
// 8. 생활안전
// ─────────────────────────────────────────────
const DAILY_SAFETY: SafetyTemplate[] = [
  // Grade 1-2
  { text: "낯선 사람이 따라오면 큰 소리로 ___를 외치고 도망간다.", answer: "도와주세요", category: "생활안전", gradeGroup: "1-2" },
  { text: "모르는 사람이 사탕을 주면 ___하고 가야 한다.", answer: "거절", category: "생활안전", gradeGroup: "1-2" },
  { text: "집에 혼자 있을 때 낯선 사람이 문을 두드리면 ___을 열면 안 된다.", answer: "문", category: "생활안전", gradeGroup: "1-2" },
  { text: "밖에서 놀다 어두워지면 빨리 ___으로 돌아와야 한다.", answer: "집", category: "생활안전", gradeGroup: "1-2" },
  { text: "위험한 상황에서는 ___번으로 전화해야 한다.", answer: "112", category: "생활안전", gradeGroup: "1-2" },
  { text: "혼자 엘리베이터를 탈 때 모르는 사람과 같이 타면 ___해야 한다.", answer: "주의", category: "생활안전", gradeGroup: "1-2" },
  { text: "집 비밀번호는 다른 사람에게 ___하면 안 된다.", answer: "알려주", category: "생활안전", gradeGroup: "1-2" },
  { text: "길을 잃었을 때는 가까운 ___에 도움을 요청한다.", answer: "가게", category: "생활안전", gradeGroup: "1-2" },
  { text: "화장실에서 바닥이 젖으면 ___질 수 있으니 조심한다.", answer: "미끄러", category: "생활안전", gradeGroup: "1-2" },
  { text: "에스컬레이터에서는 ___을 잡고 서 있어야 한다.", answer: "손잡이", category: "생활안전", gradeGroup: "1-2" },
  { text: "모르는 차에 ___면 안 된다.", answer: "타", category: "생활안전", gradeGroup: "1-2" },
  { text: "밤에 외출할 때는 밝은 ___을 입는다.", answer: "옷", category: "생활안전", gradeGroup: "1-2" },
  { text: "위급할 때는 방범용 ___를 눌러 도움을 요청한다.", answer: "비상벨", category: "생활안전", gradeGroup: "1-2" },
  { text: "부모님의 ___를 외워 두면 긴급 시 연락할 수 있다.", answer: "전화번호", category: "생활안전", gradeGroup: "1-2" },
  { text: "아이들만 있는 곳에 모르는 ___이 오면 바로 자리를 피한다.", answer: "어른", category: "생활안전", gradeGroup: "1-2" },
  { text: "엘리베이터가 멈추면 ___버튼을 누른다.", answer: "비상", category: "생활안전", gradeGroup: "1-2" },
  { text: "집 주소와 부모님 이름을 ___고 있어야 한다.", answer: "알", category: "생활안전", gradeGroup: "1-2" },
  { text: "회전문에 손이나 옷이 ___지 않도록 주의한다.", answer: "끼", category: "생활안전", gradeGroup: "1-2" },
  { text: "에스컬레이터에서 ___면 위험하다.", answer: "뛰", category: "생활안전", gradeGroup: "1-2" },
  { text: "주차장에서는 차가 갑자기 움직일 수 있으므로 ___을 살핀다.", answer: "주위", category: "생활안전", gradeGroup: "1-2" },
  { text: "공사 현장 근처에서 ___를 하면 안 된다.", answer: "놀이", category: "생활안전", gradeGroup: "1-2" },
  // Grade 3-4
  { text: "긴급 상황 시 자신의 위치를 정확하게 ___할 수 있어야 한다.", answer: "설명", category: "생활안전", gradeGroup: "3-4" },
  { text: "승강기 안에 갇히면 ___버튼을 누르고 구조를 기다린다.", answer: "비상호출", category: "생활안전", gradeGroup: "3-4" },
  { text: "지하철에서 비상시 ___를 열어 탈출할 수 있다.", answer: "비상문", category: "생활안전", gradeGroup: "3-4" },
  { text: "미아 방지를 위해 외출 시 부모님과 ___장소를 정한다.", answer: "만남", category: "생활안전", gradeGroup: "3-4" },
  { text: "야외 활동 시 ___크림을 발라 피부를 보호한다.", answer: "자외선 차단", category: "생활안전", gradeGroup: "3-4" },
  { text: "대형 마트에서 길을 잃으면 ___에게 도움을 요청한다.", answer: "직원", category: "생활안전", gradeGroup: "3-4" },
  { text: "재난 시 행동 요령을 담은 앱은 ___이다.", answer: "안전디딤돌", category: "생활안전", gradeGroup: "3-4" },
  // Grade 5-6
  { text: "응급 상황에서는 ___조치를 시행하고 119에 신고한다.", answer: "응급", category: "생활안전", gradeGroup: "5-6" },
  { text: "심장이 멈춘 사람에게는 ___를 시행해야 한다.", answer: "심폐소생술", category: "생활안전", gradeGroup: "5-6" },
  { text: "코피가 나면 고개를 ___으로 숙이고 코를 누른다.", answer: "앞", category: "생활안전", gradeGroup: "5-6" },
  { text: "출혈이 심할 때는 깨끗한 천으로 상처를 ___해야 한다.", answer: "압박", category: "생활안전", gradeGroup: "5-6" },
  { text: "자동심장충격기(AED)는 공공장소에 비치된 ___장비이다.", answer: "응급", category: "생활안전", gradeGroup: "5-6" },
  { text: "골절이 의심되면 부상 부위를 ___시키고 병원에 간다.", answer: "고정", category: "생활안전", gradeGroup: "5-6" },
  { text: "열사병 환자는 체온이 ___도 이상으로 올라간 상태이다.", answer: "40", category: "생활안전", gradeGroup: "5-6" },
];

// ─────────────────────────────────────────────
// 9. 전기안전
// ─────────────────────────────────────────────
const ELECTRICAL_SAFETY: SafetyTemplate[] = [
  // Grade 1-2
  { text: "젖은 ___으로 콘센트를 만지면 안 된다.", answer: "손", category: "전기안전", gradeGroup: "1-2" },
  { text: "콘센트에 ___이나 젓가락을 넣으면 안 된다.", answer: "손가락", category: "전기안전", gradeGroup: "1-2" },
  { text: "전기 제품 ___가 벗겨져 있으면 사용하면 안 된다.", answer: "코드", category: "전기안전", gradeGroup: "1-2" },
  { text: "사용하지 않는 전기 제품의 ___를 뽑아야 한다.", answer: "플러그", category: "전기안전", gradeGroup: "1-2" },
  { text: "콘센트에 물이 ___으면 감전될 수 있다.", answer: "닿", category: "전기안전", gradeGroup: "1-2" },
  { text: "전기줄을 ___지 않도록 잘 정리해야 한다.", answer: "밟", category: "전기안전", gradeGroup: "1-2" },
  { text: "플러그를 뽑을 때는 ___를 잡고 빼야 한다.", answer: "플러그 머리", category: "전기안전", gradeGroup: "1-2" },
  { text: "어린이용 콘센트 ___를 사용하면 안전하다.", answer: "덮개", category: "전기안전", gradeGroup: "1-2" },
  { text: "전기장판을 접어서 사용하면 ___가 날 수 있다.", answer: "화재", category: "전기안전", gradeGroup: "1-2" },
  { text: "번개가 칠 때 전자기기의 ___를 뽑아야 한다.", answer: "플러그", category: "전기안전", gradeGroup: "1-2" },
  { text: "전선 위의 ___을 절대 잡으면 안 된다.", answer: "연", category: "전기안전", gradeGroup: "1-2" },
  { text: "고압 ___근처에서 놀면 감전 위험이 있다.", answer: "전선", category: "전기안전", gradeGroup: "1-2" },
  // Grade 3-4
  { text: "문어발식 ___사용은 과열로 화재가 날 수 있다.", answer: "콘센트", category: "전기안전", gradeGroup: "3-4" },
  { text: "전기가 통하는 물체를 ___체라고 한다.", answer: "도", category: "전기안전", gradeGroup: "3-4" },
  { text: "감전 사고 시에는 먼저 ___를 차단해야 한다.", answer: "전원", category: "전기안전", gradeGroup: "3-4" },
  { text: "물 근처에서 ___기를 사용하면 감전 위험이 있다.", answer: "전기", category: "전기안전", gradeGroup: "3-4" },
  { text: "멀티탭에 허용 전력 이상을 사용하면 ___이 발생할 수 있다.", answer: "과부하", category: "전기안전", gradeGroup: "3-4" },
  { text: "전기 안전 마크인 ___마크가 있는 제품을 사용한다.", answer: "KC", category: "전기안전", gradeGroup: "3-4" },
  { text: "욕실에서 ___기를 사용할 때는 특히 조심해야 한다.", answer: "드라이", category: "전기안전", gradeGroup: "3-4" },
  { text: "누전 차단기는 전기 ___을 방지하는 장치이다.", answer: "사고", category: "전기안전", gradeGroup: "3-4" },
  { text: "전기 합선은 ___를 일으킬 수 있는 위험한 현상이다.", answer: "화재", category: "전기안전", gradeGroup: "3-4" },
  { text: "정전 시 ___를 사용하고 양초는 화재 위험이 있다.", answer: "손전등", category: "전기안전", gradeGroup: "3-4" },
  // Grade 5-6
  { text: "인체에 흐르는 전류가 ___mA 이상이면 생명이 위험하다.", answer: "50", category: "전기안전", gradeGroup: "5-6" },
  { text: "접지는 전기가 ___으로 흘러가게 하여 감전을 방지한다.", answer: "땅", category: "전기안전", gradeGroup: "5-6" },
  { text: "가정용 전압은 ___볼트이다.", answer: "220", category: "전기안전", gradeGroup: "5-6" },
  { text: "감전된 사람을 구할 때 ___이 통하지 않는 물건으로 분리한다.", answer: "전기", category: "전기안전", gradeGroup: "5-6" },
  { text: "절연 처리란 전기가 ___하지 못하게 막는 것이다.", answer: "통", category: "전기안전", gradeGroup: "5-6" },
  { text: "전기 사고를 예방하기 위해 정기적으로 ___검사를 받아야 한다.", answer: "전기안전", category: "전기안전", gradeGroup: "5-6" },
  { text: "번개는 구름과 땅 사이의 ___방전 현상이다.", answer: "전기", category: "전기안전", gradeGroup: "5-6" },
];

// ─────────────────────────────────────────────
// 10. 물놀이안전
// ─────────────────────────────────────────────
const WATER_SAFETY: SafetyTemplate[] = [
  // Grade 1-2
  { text: "물놀이할 때는 반드시 ___를 입어야 한다.", answer: "구명조끼", category: "물놀이안전", gradeGroup: "1-2" },
  { text: "수영장에 들어가기 전에 ___운동을 해야 한다.", answer: "준비", category: "물놀이안전", gradeGroup: "1-2" },
  { text: "물이 깊은 곳에서는 ___없이 들어가면 안 된다.", answer: "어른", category: "물놀이안전", gradeGroup: "1-2" },
  { text: "물에 빠진 사람을 보면 직접 들어가지 말고 ___에게 알린다.", answer: "어른", category: "물놀이안전", gradeGroup: "1-2" },
  { text: "밥을 먹은 직후 물에 들어가면 ___가 날 수 있다.", answer: "경련", category: "물놀이안전", gradeGroup: "1-2" },
  { text: "계곡에서 놀 때 ___가 미끄러우므로 조심한다.", answer: "바위", category: "물놀이안전", gradeGroup: "1-2" },
  { text: "바다에서 놀 때 ___이 빠지면 옆으로 헤엄쳐 나와야 한다.", answer: "물살", category: "물놀이안전", gradeGroup: "1-2" },
  { text: "물놀이 중 ___이 나면 즉시 물에서 나와야 한다.", answer: "오한", category: "물놀이안전", gradeGroup: "1-2" },
  { text: "물놀이 전에 심장에서 먼 부위부터 ___을 적셔야 한다.", answer: "물", category: "물놀이안전", gradeGroup: "1-2" },
  { text: "수영장에서 ___는 것은 위험하다.", answer: "뛰", category: "물놀이안전", gradeGroup: "1-2" },
  { text: "물놀이를 할 때는 ___이 있는 곳에서 해야 한다.", answer: "안전요원", category: "물놀이안전", gradeGroup: "1-2" },
  { text: "수영을 못하는 사람은 ___에서만 물놀이한다.", answer: "얕은 곳", category: "물놀이안전", gradeGroup: "1-2" },
  { text: "물놀이 시 친구를 ___면 안 된다.", answer: "물속에 밀", category: "물놀이안전", gradeGroup: "1-2" },
  { text: "튜브가 ___져 있으면 사용하면 안 된다.", answer: "찢어", category: "물놀이안전", gradeGroup: "1-2" },
  // Grade 3-4
  { text: "이안류에 빠지면 해안과 ___방향으로 헤엄쳐야 한다.", answer: "평행한", category: "물놀이안전", gradeGroup: "3-4" },
  { text: "낚시터 근처의 ___선에 감전될 수 있으므로 주의한다.", answer: "전", category: "물놀이안전", gradeGroup: "3-4" },
  { text: "물에 빠진 사람에게 ___이나 긴 막대를 던져 준다.", answer: "줄", category: "물놀이안전", gradeGroup: "3-4" },
  { text: "하천에서 물놀이 시 갑작스러운 ___으로 수위가 오를 수 있다.", answer: "비", category: "물놀이안전", gradeGroup: "3-4" },
  { text: "수영 실력이 좋아도 ___에서 혼자 수영하면 안 된다.", answer: "바다", category: "물놀이안전", gradeGroup: "3-4" },
  { text: "물놀이 시 체온이 떨어지면 ___이 올 수 있다.", answer: "저체온증", category: "물놀이안전", gradeGroup: "3-4" },
  { text: "해수욕장의 ___깃발은 수영 금지 신호이다.", answer: "빨간", category: "물놀이안전", gradeGroup: "3-4" },
  { text: "물에 빠졌을 때 옷을 입고 있으면 ___처럼 부풀려 뜨는 방법이 있다.", answer: "풍선", category: "물놀이안전", gradeGroup: "3-4" },
  // Grade 5-6
  { text: "익수자 발견 시 직접 구조보다 ___에 신고하는 것이 우선이다.", answer: "119", category: "물놀이안전", gradeGroup: "5-6" },
  { text: "인공호흡 시 환자의 ___를 젖혀 기도를 확보한다.", answer: "턱", category: "물놀이안전", gradeGroup: "5-6" },
  { text: "물에 빠진 사람을 구조할 때 ___을 잡히면 함께 빠질 수 있다.", answer: "손", category: "물놀이안전", gradeGroup: "5-6" },
  { text: "잠수를 오래 하면 ___부족으로 의식을 잃을 수 있다.", answer: "산소", category: "물놀이안전", gradeGroup: "5-6" },
  { text: "수상 안전사고 예방을 위해 ___자격증을 취득하면 좋다.", answer: "수영", category: "물놀이안전", gradeGroup: "5-6" },
  { text: "급류에서는 발을 ___방향으로 향하게 하고 떠내려간다.", answer: "하류", category: "물놀이안전", gradeGroup: "5-6" },
  { text: "물놀이 안전수칙을 지키지 않으면 ___사고로 이어질 수 있다.", answer: "익사", category: "물놀이안전", gradeGroup: "5-6" },
];

// ─────────────────────────────────────────────
// 11. 가정안전
// ─────────────────────────────────────────────
const HOME_SAFETY: SafetyTemplate[] = [
  // Grade 1-2
  { text: "부엌의 ___한 것은 어린이가 만지면 안 된다.", answer: "날카로운", category: "가정안전", gradeGroup: "1-2" },
  { text: "뜨거운 ___을 만지면 화상을 입을 수 있다.", answer: "냄비", category: "가정안전", gradeGroup: "1-2" },
  { text: "세제나 ___를 먹으면 안 된다.", answer: "약", category: "가정안전", gradeGroup: "1-2" },
  { text: "욕실 바닥이 미끄러우므로 ___매트를 깔아야 한다.", answer: "미끄럼 방지", category: "가정안전", gradeGroup: "1-2" },
  { text: "창문 밖으로 ___을 내밀면 위험하다.", answer: "몸", category: "가정안전", gradeGroup: "1-2" },
  { text: "가스레인지를 어린이가 ___면 안 된다.", answer: "켜", category: "가정안전", gradeGroup: "1-2" },
  { text: "높은 곳의 물건을 꺼낼 때 ___을 안정적으로 놓고 올라간다.", answer: "의자", category: "가정안전", gradeGroup: "1-2" },
  { text: "집 안에서 ___를 신으면 미끄러질 수 있다.", answer: "양말", category: "가정안전", gradeGroup: "1-2" },
  { text: "서랍장이나 책장이 ___질 수 있으므로 올라타면 안 된다.", answer: "넘어", category: "가정안전", gradeGroup: "1-2" },
  { text: "다리미를 사용한 후에는 ___를 뽑아야 한다.", answer: "코드", category: "가정안전", gradeGroup: "1-2" },
  { text: "목욕할 때 뜨거운 ___에 화상을 입지 않도록 조심한다.", answer: "물", category: "가정안전", gradeGroup: "1-2" },
  { text: "작은 물건이나 ___를 입에 넣으면 목에 걸릴 수 있다.", answer: "장난감", category: "가정안전", gradeGroup: "1-2" },
  { text: "베란다에서 ___를 던지면 아래 사람이 다칠 수 있다.", answer: "물건", category: "가정안전", gradeGroup: "1-2" },
  { text: "가정에서 ___감지기를 설치하면 화재를 조기에 발견할 수 있다.", answer: "연기", category: "가정안전", gradeGroup: "1-2" },
  // Grade 3-4
  { text: "가스 밸브는 외출 시 반드시 ___야 한다.", answer: "잠가", category: "가정안전", gradeGroup: "3-4" },
  { text: "가정에서 사용하는 소화기의 위치를 ___고 있어야 한다.", answer: "알", category: "가정안전", gradeGroup: "3-4" },
  { text: "가전제품 위에 ___을 올려놓으면 안 된다.", answer: "물컵", category: "가정안전", gradeGroup: "3-4" },
  { text: "환기를 위해 정기적으로 ___을 열어야 한다.", answer: "창문", category: "가정안전", gradeGroup: "3-4" },
  { text: "가정 내 ___경보기는 일산화탄소 중독을 예방한다.", answer: "가스", category: "가정안전", gradeGroup: "3-4" },
  { text: "욕실에서 ___가 켜진 채로 잠들면 위험하다.", answer: "온수기", category: "가정안전", gradeGroup: "3-4" },
  { text: "가구를 벽에 ___으로 고정하면 전도 사고를 예방할 수 있다.", answer: "L자 금구", category: "가정안전", gradeGroup: "3-4" },
  // Grade 5-6
  { text: "일산화탄소는 무색무취의 ___한 기체이다.", answer: "유독", category: "가정안전", gradeGroup: "5-6" },
  { text: "겨울철 보일러 사용 시 ___가스 중독에 주의해야 한다.", answer: "일산화탄소", category: "가정안전", gradeGroup: "5-6" },
  { text: "가정 내 응급 처치 ___를 비치해 두면 좋다.", answer: "키트", category: "가정안전", gradeGroup: "5-6" },
  { text: "화재 시 대피 ___를 가족과 함께 미리 계획한다.", answer: "경로", category: "가정안전", gradeGroup: "5-6" },
  { text: "아파트 화재 시 현관문을 닫고 ___으로 대피하면 연기 유입을 줄일 수 있다.", answer: "베란다", category: "가정안전", gradeGroup: "5-6" },
  { text: "실내 ___를 정기적으로 측정하면 건강을 지킬 수 있다.", answer: "공기질", category: "가정안전", gradeGroup: "5-6" },
  { text: "가정에서 소화기를 비치할 때는 접근이 ___한 곳에 둔다.", answer: "쉬운", category: "가정안전", gradeGroup: "5-6" },
];

// ─────────────────────────────────────────────
// 12. 약물안전
// ─────────────────────────────────────────────
const DRUG_SAFETY: SafetyTemplate[] = [
  // Grade 1-2
  { text: "약은 반드시 ___의 허락 아래 먹어야 한다.", answer: "어른", category: "약물안전", gradeGroup: "1-2" },
  { text: "약을 사탕이라고 생각하고 많이 먹으면 ___하다.", answer: "위험", category: "약물안전", gradeGroup: "1-2" },
  { text: "세제나 표백제는 음식이 아니므로 ___면 안 된다.", answer: "먹", category: "약물안전", gradeGroup: "1-2" },
  { text: "모르는 액체를 ___에 넣으면 안 된다.", answer: "입", category: "약물안전", gradeGroup: "1-2" },
  { text: "약은 어린이 손이 닿지 않는 ___에 보관한다.", answer: "곳", category: "약물안전", gradeGroup: "1-2" },
  { text: "친구가 준 약을 함부로 먹으면 ___할 수 있다.", answer: "위험", category: "약물안전", gradeGroup: "1-2" },
  { text: "약을 먹고 몸이 이상하면 바로 ___에게 알린다.", answer: "부모님", category: "약물안전", gradeGroup: "1-2" },
  { text: "세제 용기에 다른 ___을 담으면 혼동할 수 있어 위험하다.", answer: "액체", category: "약물안전", gradeGroup: "1-2" },
  { text: "약은 정해진 ___만큼만 먹어야 한다.", answer: "양", category: "약물안전", gradeGroup: "1-2" },
  { text: "알록달록한 세제를 ___로 착각하면 안 된다.", answer: "음료수", category: "약물안전", gradeGroup: "1-2" },
  { text: "집에 있는 ___류는 어린이가 열 수 없는 곳에 보관한다.", answer: "화학제품", category: "약물안전", gradeGroup: "1-2" },
  { text: "약을 먹을 때는 ___과 함께 먹는다.", answer: "물", category: "약물안전", gradeGroup: "1-2" },
  // Grade 3-4
  { text: "약국에서 처방전 없이 살 수 있는 약을 ___약이라고 한다.", answer: "일반", category: "약물안전", gradeGroup: "3-4" },
  { text: "약을 먹을 때 ___기한을 확인해야 한다.", answer: "유효", category: "약물안전", gradeGroup: "3-4" },
  { text: "남의 ___약을 먹으면 부작용이 생길 수 있다.", answer: "처방", category: "약물안전", gradeGroup: "3-4" },
  { text: "약 부작용이 나타나면 즉시 ___사에게 알려야 한다.", answer: "의", category: "약물안전", gradeGroup: "3-4" },
  { text: "항생제는 의사의 지시대로 끝까지 ___해야 한다.", answer: "복용", category: "약물안전", gradeGroup: "3-4" },
  { text: "약을 보관할 때 직사광선을 ___해야 한다.", answer: "피", category: "약물안전", gradeGroup: "3-4" },
  { text: "약의 ___서를 읽고 용법과 용량을 확인한다.", answer: "설명", category: "약물안전", gradeGroup: "3-4" },
  { text: "먹다 남은 약은 약국의 ___수거함에 반납한다.", answer: "폐의약품", category: "약물안전", gradeGroup: "3-4" },
  // Grade 5-6
  { text: "담배에 포함된 ___은 강한 중독성이 있는 물질이다.", answer: "니코틴", category: "약물안전", gradeGroup: "5-6" },
  { text: "청소년 음주는 뇌 ___에 심각한 영향을 미친다.", answer: "발달", category: "약물안전", gradeGroup: "5-6" },
  { text: "본드나 가스를 흡입하는 것은 ___흡입이라 하며 불법이다.", answer: "환각물질", category: "약물안전", gradeGroup: "5-6" },
  { text: "마약류는 법으로 엄격히 ___되어 있다.", answer: "금지", category: "약물안전", gradeGroup: "5-6" },
  { text: "약물 오남용 상담 전화번호는 ___번이다.", answer: "1393", category: "약물안전", gradeGroup: "5-6" },
  { text: "카페인을 과다 섭취하면 ___장이 빨리 뛰는 증상이 나타난다.", answer: "심", category: "약물안전", gradeGroup: "5-6" },
  { text: "에너지 음료의 과다 섭취는 청소년 ___에 해롭다.", answer: "건강", category: "약물안전", gradeGroup: "5-6" },
  { text: "전자담배도 일반 담배와 마찬가지로 ___에 해롭다.", answer: "건강", category: "약물안전", gradeGroup: "5-6" },
];

// ─────────────────────────────────────────────
// 13. 개인정보보호
// ─────────────────────────────────────────────
const PRIVACY_SAFETY: SafetyTemplate[] = [
  // Grade 1-2
  { text: "나의 이름, 나이, ___를 모르는 사람에게 알려 주면 안 된다.", answer: "주소", category: "개인정보보호", gradeGroup: "1-2" },
  { text: "인터넷에 나의 ___를 올리면 안 된다.", answer: "사진", category: "개인정보보호", gradeGroup: "1-2" },
  { text: "전화로 개인정보를 물어보는 사람에게 ___하면 안 된다.", answer: "대답", category: "개인정보보호", gradeGroup: "1-2" },
  { text: "우리 집 ___번호는 비밀로 해야 한다.", answer: "현관", category: "개인정보보호", gradeGroup: "1-2" },
  { text: "학교에서 나의 ___를 친구에게 함부로 보여 주면 안 된다.", answer: "시험지", category: "개인정보보호", gradeGroup: "1-2" },
  { text: "다른 사람의 ___을 허락 없이 찍으면 안 된다.", answer: "사진", category: "개인정보보호", gradeGroup: "1-2" },
  { text: "인터넷 회원가입 시 부모님의 ___을 받아야 한다.", answer: "동의", category: "개인정보보호", gradeGroup: "1-2" },
  { text: "내 이름표를 ___에게 보여 주면 안 된다.", answer: "모르는 사람", category: "개인정보보호", gradeGroup: "1-2" },
  { text: "SNS에 가족의 ___를 올리기 전에 허락을 받아야 한다.", answer: "사진", category: "개인정보보호", gradeGroup: "1-2" },
  { text: "친구의 ___를 다른 친구에게 함부로 알려 주면 안 된다.", answer: "비밀", category: "개인정보보호", gradeGroup: "1-2" },
  { text: "택배 상자에 적힌 ___를 폐기 전에 지워야 한다.", answer: "주소", category: "개인정보보호", gradeGroup: "1-2" },
  { text: "학교에서 받은 가정통신문의 ___를 함부로 버리면 안 된다.", answer: "개인정보", category: "개인정보보호", gradeGroup: "1-2" },
  // Grade 3-4
  { text: "인터넷 사이트마다 다른 ___를 사용하면 안전하다.", answer: "비밀번호", category: "개인정보보호", gradeGroup: "3-4" },
  { text: "공공 컴퓨터에서 사용 후 반드시 ___아웃해야 한다.", answer: "로그", category: "개인정보보호", gradeGroup: "3-4" },
  { text: "온라인 게임에서 개인정보를 물어보면 ___이다.", answer: "사기", category: "개인정보보호", gradeGroup: "3-4" },
  { text: "앱 설치 시 불필요한 ___권한 요청은 거부한다.", answer: "접근", category: "개인정보보호", gradeGroup: "3-4" },
  { text: "개인정보가 유출되면 ___를 즉시 변경해야 한다.", answer: "비밀번호", category: "개인정보보호", gradeGroup: "3-4" },
  { text: "스마트폰에 ___잠금을 설정하면 개인정보를 보호할 수 있다.", answer: "화면", category: "개인정보보호", gradeGroup: "3-4" },
  { text: "무료 와이파이에서 개인정보를 입력하면 ___될 수 있다.", answer: "유출", category: "개인정보보호", gradeGroup: "3-4" },
  { text: "이메일에 첨부된 의심스러운 ___을 열면 안 된다.", answer: "파일", category: "개인정보보호", gradeGroup: "3-4" },
  // Grade 5-6
  { text: "개인정보보호법은 개인의 ___를 보호하기 위한 법률이다.", answer: "정보", category: "개인정보보호", gradeGroup: "5-6" },
  { text: "만 ___세 미만 아동의 개인정보 수집 시 법정대리인 동의가 필요하다.", answer: "14", category: "개인정보보호", gradeGroup: "5-6" },
  { text: "개인정보 유출 시 ___위원회에 신고할 수 있다.", answer: "개인정보보호", category: "개인정보보호", gradeGroup: "5-6" },
  { text: "보이스피싱은 ___를 이용한 금융 사기이다.", answer: "전화", category: "개인정보보호", gradeGroup: "5-6" },
  { text: "스미싱은 문자 ___에 포함된 링크로 개인정보를 탈취한다.", answer: "메시지", category: "개인정보보호", gradeGroup: "5-6" },
  { text: "개인정보를 안전하게 삭제하려면 ___를 완전 소거해야 한다.", answer: "데이터", category: "개인정보보호", gradeGroup: "5-6" },
  { text: "주민등록번호는 가장 중요한 ___이므로 절대 공개하면 안 된다.", answer: "개인정보", category: "개인정보보호", gradeGroup: "5-6" },
  { text: "쿠키 수집 ___를 읽고 동의 여부를 결정해야 한다.", answer: "정책", category: "개인정보보호", gradeGroup: "5-6" },
];

// ─────────────────────────────────────────────
// 14. 성폭력예방
// ─────────────────────────────────────────────
const SEXUAL_VIOLENCE_PREVENTION: SafetyTemplate[] = [
  // Grade 1-2
  { text: "내 몸은 ___가 소중하므로 함부로 만지게 하면 안 된다.", answer: "나", category: "성폭력예방", gradeGroup: "1-2" },
  { text: "누군가 싫은 ___을 하면 '싫어요!'라고 말해야 한다.", answer: "접촉", category: "성폭력예방", gradeGroup: "1-2" },
  { text: "수영복으로 가려지는 부위는 다른 사람이 만지면 ___된다.", answer: "안", category: "성폭력예방", gradeGroup: "1-2" },
  { text: "불편한 일이 있으면 믿을 수 있는 ___에게 이야기해야 한다.", answer: "어른", category: "성폭력예방", gradeGroup: "1-2" },
  { text: "좋은 접촉과 나쁜 접촉을 ___할 수 있어야 한다.", answer: "구별", category: "성폭력예방", gradeGroup: "1-2" },
  { text: "어른이 비밀을 지키라고 해도 불편하면 ___에게 알려야 한다.", answer: "부모님", category: "성폭력예방", gradeGroup: "1-2" },
  { text: "나쁜 접촉을 당하면 내 ___이 아니다.", answer: "잘못", category: "성폭력예방", gradeGroup: "1-2" },
  { text: "혼자 있을 때 모르는 어른이 접근하면 ___져야 한다.", answer: "떨어", category: "성폭력예방", gradeGroup: "1-2" },
  { text: "내 몸의 ___은 나만 결정할 수 있다.", answer: "경계", category: "성폭력예방", gradeGroup: "1-2" },
  { text: "친구의 몸도 ___하게 대해야 한다.", answer: "소중", category: "성폭력예방", gradeGroup: "1-2" },
  { text: "나쁜 접촉을 경험하면 ___번에 전화한다.", answer: "117", category: "성폭력예방", gradeGroup: "1-2" },
  { text: "다른 사람을 만질 때도 상대방의 ___을 받아야 한다.", answer: "동의", category: "성폭력예방", gradeGroup: "1-2" },
  // Grade 3-4
  { text: "성폭력 피해 상담 전화번호는 ___번이다.", answer: "117", category: "성폭력예방", gradeGroup: "3-4" },
  { text: "온라인에서 성적인 사진을 보내달라는 요구는 ___해야 한다.", answer: "거절", category: "성폭력예방", gradeGroup: "3-4" },
  { text: "성폭력은 피해자의 ___이 절대 아니다.", answer: "잘못", category: "성폭력예방", gradeGroup: "3-4" },
  { text: "아는 사람이라도 ___한 접촉을 하면 성폭력이다.", answer: "원치 않는", category: "성폭력예방", gradeGroup: "3-4" },
  { text: "성적 수치심을 주는 ___도 성폭력에 해당한다.", answer: "말", category: "성폭력예방", gradeGroup: "3-4" },
  { text: "불편한 상황에서는 '안 돼요, ___요, 도와주세요'를 외친다.", answer: "싫어", category: "성폭력예방", gradeGroup: "3-4" },
  { text: "밤길을 혼자 걸을 때는 ___이 밝은 곳으로 다닌다.", answer: "불빛", category: "성폭력예방", gradeGroup: "3-4" },
  { text: "SNS에서 모르는 사람의 ___요청을 함부로 수락하면 안 된다.", answer: "친구", category: "성폭력예방", gradeGroup: "3-4" },
  // Grade 5-6
  { text: "동의 없이 타인의 신체를 촬영하는 것은 ___이다.", answer: "불법촬영", category: "성폭력예방", gradeGroup: "5-6" },
  { text: "디지털 성범죄의 피해 영상을 유포하면 ___적 처벌을 받는다.", answer: "법", category: "성폭력예방", gradeGroup: "5-6" },
  { text: "성범죄 신고 시 증거를 ___하는 것이 중요하다.", answer: "보존", category: "성폭력예방", gradeGroup: "5-6" },
  { text: "그루밍은 가해자가 피해자의 ___을 얻어 범죄를 저지르는 수법이다.", answer: "신뢰", category: "성폭력예방", gradeGroup: "5-6" },
  { text: "성평등 의식을 갖는 것은 성폭력 ___에 중요하다.", answer: "예방", category: "성폭력예방", gradeGroup: "5-6" },
  { text: "불법 촬영물을 발견하면 ___에 신고한다.", answer: "경찰", category: "성폭력예방", gradeGroup: "5-6" },
  { text: "또래 사이에서도 성적 ___은 성폭력에 해당할 수 있다.", answer: "괴롭힘", category: "성폭력예방", gradeGroup: "5-6" },
  { text: "온라인에서 성적 대화를 유도하는 것을 온라인 ___이라 한다.", answer: "그루밍", category: "성폭력예방", gradeGroup: "5-6" },
];

// ─────────────────────────────────────────────
// 15. 학교폭력예방
// ─────────────────────────────────────────────
const SCHOOL_VIOLENCE_PREVENTION: SafetyTemplate[] = [
  // Grade 1-2
  { text: "친구를 때리거나 ___는 것은 폭력이다.", answer: "밀", category: "학교폭력예방", gradeGroup: "1-2" },
  { text: "친구에게 ___을 하면 마음의 상처를 준다.", answer: "욕", category: "학교폭력예방", gradeGroup: "1-2" },
  { text: "친구의 물건을 빼앗는 것은 ___이다.", answer: "폭력", category: "학교폭력예방", gradeGroup: "1-2" },
  { text: "괴롭힘을 당하면 참지 말고 ___에게 알려야 한다.", answer: "선생님", category: "학교폭력예방", gradeGroup: "1-2" },
  { text: "친구를 일부러 ___시키면 안 된다.", answer: "따돌림", category: "학교폭력예방", gradeGroup: "1-2" },
  { text: "학교폭력을 목격하면 ___에게 알린다.", answer: "어른", category: "학교폭력예방", gradeGroup: "1-2" },
  { text: "친구와 다투었을 때는 ___으로 해결해야 한다.", answer: "대화", category: "학교폭력예방", gradeGroup: "1-2" },
  { text: "나보다 약한 친구를 ___하면 안 된다.", answer: "괴롭힘", category: "학교폭력예방", gradeGroup: "1-2" },
  { text: "다른 친구의 ___를 놀리면 안 된다.", answer: "외모", category: "학교폭력예방", gradeGroup: "1-2" },
  { text: "폭력을 당하면 부끄러워하지 말고 ___을 요청한다.", answer: "도움", category: "학교폭력예방", gradeGroup: "1-2" },
  { text: "말로 하는 폭력도 ___를 줄 수 있다.", answer: "상처", category: "학교폭력예방", gradeGroup: "1-2" },
  { text: "친구의 물건을 ___로 숨기면 안 된다.", answer: "장난", category: "학교폭력예방", gradeGroup: "1-2" },
  // Grade 3-4
  { text: "학교폭력 신고 전화번호는 ___번이다.", answer: "117", category: "학교폭력예방", gradeGroup: "3-4" },
  { text: "사이버 폭력은 ___상에서 일어나는 폭력이다.", answer: "인터넷", category: "학교폭력예방", gradeGroup: "3-4" },
  { text: "친구 사이에 ___을 강요하는 것도 폭력이다.", answer: "심부름", category: "학교폭력예방", gradeGroup: "3-4" },
  { text: "학교폭력 피해자를 도와주는 사람을 ___라고 한다.", answer: "방관자가 아닌 지지자", category: "학교폭력예방", gradeGroup: "3-4" },
  { text: "학교폭력 사안이 발생하면 학교 ___위원회가 열린다.", answer: "폭력대책", category: "학교폭력예방", gradeGroup: "3-4" },
  { text: "카카오톡 등에서 특정 친구를 ___방에서 내보내는 것도 폭력이다.", answer: "단체 대화", category: "학교폭력예방", gradeGroup: "3-4" },
  { text: "학교폭력을 신고하면 ___가 보장된다.", answer: "비밀", category: "학교폭력예방", gradeGroup: "3-4" },
  { text: "친구에게 ___적으로 돈을 요구하는 것은 금품갈취이다.", answer: "강제", category: "학교폭력예방", gradeGroup: "3-4" },
  { text: "학교폭력 피해를 당하면 ___에 기록해 두면 좋다.", answer: "일기", category: "학교폭력예방", gradeGroup: "3-4" },
  { text: "학교폭력 예방교육은 매 ___기마다 실시한다.", answer: "학", category: "학교폭력예방", gradeGroup: "3-4" },
  // Grade 5-6
  { text: "학교폭력예방법에 따라 학교폭력은 ___적으로 처벌받을 수 있다.", answer: "법", category: "학교폭력예방", gradeGroup: "5-6" },
  { text: "학교폭력의 유형에는 신체, 언어, 사이버, ___폭력 등이 있다.", answer: "정서", category: "학교폭력예방", gradeGroup: "5-6" },
  { text: "따돌림은 집단으로 특정인을 ___하는 행위이다.", answer: "배제", category: "학교폭력예방", gradeGroup: "5-6" },
  { text: "학교폭력 가해자에게는 출석정지, 전학 등의 ___가 내려질 수 있다.", answer: "조치", category: "학교폭력예방", gradeGroup: "5-6" },
  { text: "피해 학생은 ___센터에서 전문 상담을 받을 수 있다.", answer: "Wee", category: "학교폭력예방", gradeGroup: "5-6" },
  { text: "방관자가 피해자를 돕지 않으면 폭력이 ___될 수 있다.", answer: "지속", category: "학교폭력예방", gradeGroup: "5-6" },
  { text: "온라인에서 허위 사실을 유포하는 것은 ___훼손에 해당한다.", answer: "명예", category: "학교폭력예방", gradeGroup: "5-6" },
  { text: "학교폭력 피해 학생에게는 심리 ___이 제공된다.", answer: "치료", category: "학교폭력예방", gradeGroup: "5-6" },
];

// ─────────────────────────────────────────────
// All templates combined
// ─────────────────────────────────────────────
const ALL_TEMPLATES: SafetyTemplate[] = [
  ...TRAFFIC_SAFETY,
  ...FIRE_SAFETY,
  ...INTERNET_SAFETY,
  ...SCHOOL_SAFETY,
  ...PLAY_SAFETY,
  ...FOOD_SAFETY,
  ...NATURAL_DISASTER,
  ...DAILY_SAFETY,
  ...ELECTRICAL_SAFETY,
  ...WATER_SAFETY,
  ...HOME_SAFETY,
  ...DRUG_SAFETY,
  ...PRIVACY_SAFETY,
  ...SEXUAL_VIOLENCE_PREVENTION,
  ...SCHOOL_VIOLENCE_PREVENTION,
];

function getGradeGroup(grade: number): GradeGroup {
  if (grade <= 2) return "1-2";
  if (grade <= 4) return "3-4";
  return "5-6";
}

function getEligibleTemplates(grade: number): SafetyTemplate[] {
  const gradeGroup = getGradeGroup(grade);
  const eligibleGroups: GradeGroup[] = [];

  if (gradeGroup === "1-2") {
    eligibleGroups.push("1-2");
  } else if (gradeGroup === "3-4") {
    eligibleGroups.push("1-2", "3-4");
  } else {
    eligibleGroups.push("1-2", "3-4", "5-6");
  }

  return ALL_TEMPLATES.filter((t) => eligibleGroups.includes(t.gradeGroup));
}

export function generateSafetyPool(
  grade: number,
  seed: number,
): SafetyEntry[] {
  const rng = seededRandom(seed);
  const eligible = getEligibleTemplates(grade);

  // Shuffle and select 500 items
  const shuffled = shuffle(rng, eligible);

  // If we have fewer than 500, cycle through to fill
  const result: SafetyEntry[] = [];
  const targetCount = 500;

  for (let i = 0; i < targetCount; i++) {
    const template = shuffled[i % shuffled.length];
    result.push({
      text: template.text,
      answer: template.answer,
      category: template.category,
    });
  }

  // Final shuffle to mix duplicates throughout
  return shuffle(rng, result);
}
