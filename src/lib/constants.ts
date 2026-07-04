export const APP_NAME = "아라하루";
export const APP_TAGLINE = "매일 아침, 알아가는 즐거움";
export const APP_DESCRIPTION =
  "초등 1~6학년 맞춤 일일학습 프로그램. 2022 개정 교육과정 기반 매일 30분 아침학습으로 학습 습관을 키워요.";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://araharu.pages.dev";

export const GRADES = [1, 2, 3, 4, 5, 6] as const;
export const SEMESTERS = [1, 2] as const;

// 2026-07-04: 전체 문항 수를 원래(15/20/21)의 약 2배 수준으로 증량 (→ 30/39/42).
//   1차 +50% (15→23, 20→30, 21→32) 후 2차 +30% (23→30, 30→39, 32→42).
// 기분 체크·준비물 확인은 성격상 1개씩 유지하고 학습 문항만 늘렸다.
// 각 학년·학기 진도(UNIT_SEQUENCE) 범위 내 문항 풀이 수백 개라 이 문항수로 학기 경계를
// 넘거나 중복이 생기지 않는다. 각 그룹 sections count 합 == totalQuestions 를 반드시 유지할 것.
export const GRADE_SET_COMPOSITION = {
  "1-2": {
    sections: [
      { subject: "emotion_check", title: "오늘의 기분 체크", count: 1 },
      { subject: "readiness_check", title: "준비물 확인", count: 1 },
      { subject: "math", title: "오늘의 수놀이", count: 6 },
      { subject: "writing", title: "오늘의 글밥", count: 3 },
      { subject: "spelling", title: "오늘의 맞춤법", count: 4 },
      { subject: "vocabulary", title: "오늘의 한글놀이", count: 4 },
      { subject: "creative", title: "창의 퀴즈", count: 3 },
      { subject: "korean", title: "독해 퀴즈", count: 4 },
      { subject: "general_knowledge", title: "상식 퀴즈", count: 4 },
    ],
    totalQuestions: 30,
  },
  "3-4": {
    sections: [
      { subject: "emotion_check", title: "오늘의 기분 체크", count: 1 },
      { subject: "readiness_check", title: "준비물 확인", count: 1 },
      { subject: "math", title: "오늘의 수놀이", count: 6 },
      { subject: "writing", title: "오늘의 글밥", count: 3 },
      { subject: "spelling", title: "오늘의 맞춤법", count: 4 },
      { subject: "vocabulary", title: "오늘의 어휘", count: 4 },
      { subject: "hanja", title: "오늘의 한자", count: 4 },
      { subject: "english", title: "오늘의 English", count: 4 },
      { subject: "creative", title: "창의 퀴즈", count: 3 },
      { subject: "korean", title: "독해 퀴즈", count: 4 },
      { subject: "general_knowledge", title: "상식 퀴즈", count: 4 },
      { subject: "safety", title: "안전 퀴즈", count: 1 },
    ],
    totalQuestions: 39,
  },
  "5-6": {
    sections: [
      { subject: "emotion_check", title: "오늘의 기분 체크", count: 1 },
      { subject: "readiness_check", title: "준비물 확인", count: 1 },
      { subject: "math", title: "오늘의 수놀이", count: 6 },
      { subject: "writing", title: "오늘의 글밥", count: 3 },
      { subject: "spelling", title: "오늘의 맞춤법", count: 4 },
      { subject: "vocabulary", title: "오늘의 어휘", count: 4 },
      { subject: "hanja", title: "오늘의 한자", count: 3 },
      { subject: "english", title: "오늘의 English", count: 4 },
      { subject: "science", title: "오늘의 과학", count: 4 },
      { subject: "social", title: "오늘의 사회", count: 4 },
      { subject: "creative", title: "창의 퀴즈", count: 3 },
      { subject: "korean", title: "독해 퀴즈", count: 4 },
      { subject: "safety", title: "안전/건강 퀴즈", count: 1 },
    ],
    totalQuestions: 42,
  },
} as const;

export const PRICING = {
  free: {
    name: "무료",
    price: 0,
    features: ["하루 1세트 (일부 과목)", "기본 통계", "광고 표시"],
  },
  basic: {
    name: "베이직",
    price: 4900,
    features: ["하루 1세트 (전 과목)", "상세 통계", "광고 없음", "오답노트"],
  },
  premium: {
    name: "프리미엄",
    price: 9900,
    features: [
      "하루 무제한 세트",
      "AI 맞춤 추천",
      "상세 리포트",
      "학부모 리포트",
      "뱃지 시스템 전체",
    ],
  },
  school: {
    name: "학교",
    price: 39900,
    features: [
      "교사 대시보드",
      "학급 관리",
      "학생 전체 리포트",
      "과제 배정",
      "API 연동",
    ],
    perClass: true,
  },
} as const;

export const EMOTION_CATEGORIES = [
  "에너지",
  "기분",
  "건강",
  "의욕",
  "감정",
] as const;

export const DEFAULT_READINESS_ITEMS = {
  "1-2": ["교과서", "공책", "필통", "알림장", "물통", "손수건"],
  "3-4": ["교과서", "공책", "필통", "알림장", "물통", "숙제"],
  "5-6": ["교과서", "공책", "필통", "알림장", "물통", "숙제", "안내장"],
} as const;
