/**
 * Curriculum unit sequences by grade and semester.
 * Defines when each math unit is introduced (by school week).
 * Korean school year: Semester 1 ≈ March 2 ~ July, Semester 2 ≈ September 1 ~ February.
 */

export interface UnitSchedule {
  unit: string; // matches MathEntry.unit from math-generator
  startWeek: number; // week when this unit starts (1-indexed)
}

/**
 * Math unit introduction schedule for all grades.
 * Unit names must match the `unit` field returned by math-generator.ts.
 */
export const MATH_UNIT_SEQUENCE: Record<
  number,
  Record<number, UnitSchedule[]>
> = {
  1: {
    1: [
      { unit: "한 자리 덧셈", startWeek: 1 },
      { unit: "한 자리 뺄셈", startWeek: 5 },
      { unit: "뛰어 세기", startWeek: 9 },
      { unit: "수의 크기 비교", startWeek: 12 },
    ],
    2: [
      { unit: "뛰어 세기", startWeek: 1 },
      { unit: "한 자리 덧셈", startWeek: 4 },
      { unit: "한 자리 뺄셈", startWeek: 5 },
      { unit: "수의 크기 비교", startWeek: 10 },
    ],
  },
  2: {
    1: [
      { unit: "두 자리 덧셈", startWeek: 1 },
      { unit: "두 자리 뺄셈", startWeek: 5 },
      { unit: "곱셈구구", startWeek: 9 },
      { unit: "시각과 시간", startWeek: 13 },
    ],
    2: [
      { unit: "곱셈구구", startWeek: 1 },
      { unit: "두 자리 덧셈", startWeek: 6 },
      { unit: "두 자리 뺄셈", startWeek: 7 },
      { unit: "시각과 시간", startWeek: 10 },
      { unit: "길이 재기", startWeek: 13 },
    ],
  },
  // 2022 개정 3학년: 3-1=덧셈과 뺄셈·평면도형·나눗셈·곱셈·길이와 시간·분수와 소수 /
  //   3-2=곱셈·나눗셈·원·분수·들이와 무게·자료의 정리.
  //   (혼합 계산은 5학년 단원이라 3학년 SEQUENCE에서 제외)
  3: {
    1: [
      { unit: "세 자리 덧셈", startWeek: 1 },
      { unit: "세 자리 뺄셈", startWeek: 3 },
      { unit: "도형", startWeek: 5 },
      { unit: "나눗셈", startWeek: 7 },
      { unit: "곱셈", startWeek: 9 },
      { unit: "길이 계산", startWeek: 12 },
      { unit: "시간 계산", startWeek: 12 },
      { unit: "분수의 기초", startWeek: 15 },
      { unit: "분수 크기 비교", startWeek: 15 },
    ],
    2: [
      { unit: "곱셈", startWeek: 1 },
      { unit: "곱셈 응용", startWeek: 3 },
      { unit: "나눗셈", startWeek: 5 },
      { unit: "들이 계산", startWeek: 9 },
      { unit: "무게 계산", startWeek: 10 },
      { unit: "자료 정리", startWeek: 13 },
    ],
  },
  // 2022 개정 4학년: 4-1=큰 수·각도·곱셈과 나눗셈·평면도형의 이동·막대그래프·규칙 찾기 /
  //   4-2=분수의 덧셈과 뺄셈·삼각형·소수의 덧셈과 뺄셈·사각형·꺾은선그래프·다각형.
  //   (혼합 계산은 5학년 단원이라 4학년 SEQUENCE에서 제외 → 4학년 세트에 노출 안 됨)
  4: {
    1: [
      { unit: "네 자리 덧셈", startWeek: 1 },
      { unit: "네 자리 뺄셈", startWeek: 3 },
      { unit: "각도", startWeek: 6 },
      { unit: "곱셈", startWeek: 9 },
      { unit: "나눗셈", startWeek: 12 },
      { unit: "나머지가 있는 나눗셈", startWeek: 14 },
    ],
    2: [
      { unit: "동분모 분수 덧셈", startWeek: 1 },
      { unit: "동분모 분수 뺄셈", startWeek: 2 },
      { unit: "소수 덧셈", startWeek: 6 },
      { unit: "소수 뺄셈", startWeek: 7 },
    ],
  },
  // 2022 개정 5학년: 5-1=자연수의 혼합 계산·약수와 배수·규칙과 대응·약분과 통분·
  //   분수의 덧셈과 뺄셈·다각형의 둘레와 넓이 / 5-2=수의 범위와 어림하기·분수의 곱셈·
  //   합동과 대칭·소수의 곱셈·직육면체·평균과 가능성.
  //   (기존엔 '넓이'가 5-2에 있었으나 다각형의 둘레와 넓이는 5-1, '약분과 통분' 5-1 누락)
  5: {
    1: [
      { unit: "혼합 계산", startWeek: 1 },
      { unit: "약수와 배수", startWeek: 3 },
      { unit: "최대공약수", startWeek: 4 },
      { unit: "최소공배수", startWeek: 4 },
      { unit: "약분과 통분", startWeek: 7 },
      { unit: "분수의 덧셈", startWeek: 9 },
      { unit: "분수의 뺄셈", startWeek: 9 },
      { unit: "넓이", startWeek: 13 },
    ],
    2: [
      { unit: "분수의 곱셈", startWeek: 1 },
      { unit: "합동과 대칭", startWeek: 5 },
      { unit: "소수의 곱셈", startWeek: 8 },
      { unit: "평균", startWeek: 13 },
    ],
  },
  // 2026-07-04: 2022 개정 교육과정에 맞게 재배치.
  //   6-1: 분수의 나눗셈·각기둥과 각뿔·소수의 나눗셈·비와 비율·여러 가지 그래프·직육면체의 부피와 겉넓이
  //   6-2: 분수의 나눗셈·소수의 나눗셈·공간과 입체·비례식과 비례배분·원의 둘레와 넓이·원기둥·원뿔·구
  //   (기존엔 비례식[6-2]이 6-1에 있어 학기 초과, 분수의 나눗셈[6-1 핵심]이 누락됐음)
  //   unit 명칭은 문제 데이터(grade6MathData)의 값과 일치시켜야 필터가 동작한다.
  6: {
    1: [
      { unit: "분수의 나눗셈", startWeek: 1 },
      { unit: "소수의 나눗셈", startWeek: 5 },
      { unit: "비와 비율", startWeek: 9 },
      { unit: "백분율", startWeek: 11 },
      { unit: "직육면체의 부피", startWeek: 14 },
    ],
    2: [
      { unit: "분수의 나눗셈", startWeek: 1 },
      { unit: "소수의 나눗셈", startWeek: 3 },
      { unit: "비례식", startWeek: 6 },
      { unit: "원의 넓이", startWeek: 9 },
      // '넓이'(사다리꼴·삼각형·마름모)는 5-1 '다각형의 둘레와 넓이' 내용이라
      // 6학년 세트에서 제외한다. 해당 문제데이터는 grade6MathData에 잘못 들어가 있음(내용검증 대상).
    ],
  },
};

/**
 * Science unit introduction schedule for grades 3-6.
 * Unit names must match the `unit` field set in science-social-generator.ts.
 */
export const SCIENCE_UNIT_SEQUENCE: Record<
  number,
  Record<number, UnitSchedule[]>
> = {
  3: {
    1: [
      { unit: "물질의 성질", startWeek: 1 },
      { unit: "동물의 한살이", startWeek: 5 },
      { unit: "자석의 이용", startWeek: 10 },
      { unit: "지구의 모습", startWeek: 14 },
    ],
    2: [
      { unit: "지구의 흙", startWeek: 1 },
      { unit: "식물의 생활", startWeek: 5 },
      { unit: "물과 우리 생활", startWeek: 9 },
      { unit: "소리의 성질", startWeek: 13 },
    ],
  },
  4: {
    1: [
      { unit: "지층과 화석", startWeek: 1 },
      { unit: "식물의 한살이", startWeek: 5 },
      { unit: "물체의 무게", startWeek: 9 },
      { unit: "혼합물의 분리", startWeek: 13 },
    ],
    2: [
      { unit: "식물의 생활", startWeek: 1 },
      { unit: "물의 상태 변화", startWeek: 5 },
      { unit: "그림자와 거울", startWeek: 9 },
      { unit: "화산과 지진", startWeek: 13 },
    ],
  },
  5: {
    1: [
      { unit: "온도와 열", startWeek: 1 },
      { unit: "태양계와 별", startWeek: 5 },
      { unit: "용해와 용액", startWeek: 9 },
      { unit: "다양한 생물과 우리 생활", startWeek: 13 },
    ],
    2: [
      { unit: "생물과 환경", startWeek: 1 },
      { unit: "날씨와 우리 생활", startWeek: 5 },
      { unit: "물체의 운동", startWeek: 9 },
      { unit: "산과 염기", startWeek: 13 },
    ],
  },
  6: {
    1: [
      { unit: "지구와 달의 운동", startWeek: 1 },
      { unit: "여러 가지 기체", startWeek: 5 },
      { unit: "식물의 구조와 기능", startWeek: 9 },
      { unit: "빛과 렌즈", startWeek: 13 },
    ],
    2: [
      { unit: "전기의 작용", startWeek: 1 },
      { unit: "계절의 변화", startWeek: 5 },
      { unit: "연소와 소화", startWeek: 9 },
      { unit: "우리 몸의 구조와 기능", startWeek: 13 },
    ],
  },
};

/**
 * Social Studies unit introduction schedule for grades 5-6.
 * Unit names must match the `unit` field set in science-social-generator.ts.
 */
export const SOCIAL_UNIT_SEQUENCE: Record<
  number,
  Record<number, UnitSchedule[]>
> = {
  // 2026-07-04: 현행 교과서 편제에 맞게 정정.
  //   5-1=국토와 우리 생활·인권 존중 / 5-2=옛사람들의 삶과 문화·사회 변화
  //   6-1=우리나라의 정치 발전·경제 발전 / 6-2=세계 여러 나라·통일 한국의 미래
  //   (기존엔 세계[6-2]가 6-1에, 정치·경제[6-1]가 6-2에 중복돼 학기 초과. 경제생활은
  //    초등 5학년 단원이 아니므로 5학년에서 제외 — 경제는 6학년.)
  5: {
    1: [
      { unit: "국토와 자연환경", startWeek: 1 },
      { unit: "민주주의와 인권", startWeek: 8 },
    ],
    2: [
      { unit: "옛사람들의 삶과 문화", startWeek: 1 },
      { unit: "사회 변화와 문화 다양성", startWeek: 9 },
    ],
  },
  6: {
    1: [
      { unit: "우리나라의 정치 발전", startWeek: 1 },
      { unit: "우리나라의 경제 발전", startWeek: 9 },
    ],
    2: [
      { unit: "세계 여러 나라의 자연과 문화", startWeek: 1 },
      { unit: "통일과 한반도의 미래", startWeek: 9 },
    ],
  },
};

/**
 * English topic unit introduction schedule for grades 3-6.
 * Unit names must match the `unit` field set in english-generator.ts.
 */
export const ENGLISH_UNIT_SEQUENCE: Record<
  number,
  Record<number, UnitSchedule[]>
> = {
  3: {
    1: [
      { unit: "인사와 소개", startWeek: 1 },
      { unit: "숫자와 색깔", startWeek: 4 },
      { unit: "학교생활", startWeek: 7 },
      { unit: "가족과 신체", startWeek: 11 },
    ],
    2: [
      { unit: "음식과 맛", startWeek: 1 },
      { unit: "동물과 자연", startWeek: 4 },
      { unit: "날씨와 계절", startWeek: 8 },
      { unit: "감정표현", startWeek: 12 },
    ],
  },
  4: {
    1: [
      { unit: "일상표현", startWeek: 1 },
      { unit: "학교생활", startWeek: 4 },
      { unit: "음식과 맛", startWeek: 8 },
      { unit: "위치와 장소", startWeek: 12 },
    ],
    2: [
      { unit: "시간과 날짜", startWeek: 1 },
      { unit: "진로와 직업", startWeek: 5 },
      { unit: "교통과 이동", startWeek: 9 },
      { unit: "쇼핑과 돈", startWeek: 13 },
    ],
  },
  5: {
    1: [
      { unit: "일상과 취미", startWeek: 1 },
      { unit: "비교와 묘사", startWeek: 5 },
      { unit: "날씨와 자연", startWeek: 9 },
      { unit: "학교와 직업", startWeek: 12 },
    ],
    2: [
      { unit: "과거경험", startWeek: 1 },
      { unit: "여행과 세계", startWeek: 5 },
      { unit: "건강과 운동", startWeek: 9 },
      { unit: "환경과 지구", startWeek: 13 },
    ],
  },
  6: {
    1: [
      { unit: "사회와 공동체", startWeek: 1 },
      { unit: "감정과 상태", startWeek: 5 },
      { unit: "과거경험", startWeek: 9 },
      { unit: "진로와 직업", startWeek: 12 },
    ],
    2: [
      { unit: "우주와 과학", startWeek: 1 },
      { unit: "사회와 공동체", startWeek: 5 },
      { unit: "환경과 지구", startWeek: 9 },
      { unit: "과학과 기술", startWeek: 13 },
    ],
  },
};

/**
 * Returns the current week number within the given semester (1–20).
 * Semester 1 starts March 2; Semester 2 starts September 1.
 */
export function getCurrentSemesterWeek(semester: number): number {
  const now = new Date();
  const year = now.getFullYear();

  const sem1Start = new Date(year, 2, 2); // March 2
  const sem2Start = new Date(year, 8, 1); // September 1

  let startDate: Date;
  if (semester === 1) {
    startDate = now >= sem1Start ? sem1Start : new Date(year - 1, 2, 2);
  } else {
    startDate = now >= sem2Start ? sem2Start : new Date(year - 1, 8, 1);
  }

  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const week =
    Math.floor((now.getTime() - startDate.getTime()) / msPerWeek) + 1;
  return Math.max(1, Math.min(20, week));
}

/**
 * Returns the set of math unit names unlocked so far.
 * Always includes at least the first unit in the sequence.
 * Returns empty Set when no sequence is defined (no filtering applied).
 */
export function getAvailableMathUnits(
  grade: number,
  semester: number,
  currentWeek?: number,
): Set<string> {
  const sequence = MATH_UNIT_SEQUENCE[grade]?.[semester];
  if (!sequence || sequence.length === 0) return new Set();

  const week = currentWeek ?? getCurrentSemesterWeek(semester);
  const unlocked = sequence
    .filter((u) => u.startWeek <= week)
    .map((u) => u.unit);

  // Always include at least the first unit (beginning of semester)
  if (unlocked.length === 0) {
    unlocked.push(sequence[0].unit);
  }

  return new Set(unlocked);
}

/**
 * Returns the set of science unit names unlocked so far.
 * Returns empty Set for grades 1-2 (no science) or when no sequence is defined.
 * Always includes at least the first unit in the sequence.
 */
export function getAvailableScienceUnits(
  grade: number,
  semester: number,
  currentWeek?: number,
): Set<string> {
  if (grade < 3) return new Set();
  const sequence = SCIENCE_UNIT_SEQUENCE[grade]?.[semester];
  if (!sequence || sequence.length === 0) return new Set();

  const week = currentWeek ?? getCurrentSemesterWeek(semester);
  const unlocked = sequence
    .filter((u) => u.startWeek <= week)
    .map((u) => u.unit);

  if (unlocked.length === 0) {
    unlocked.push(sequence[0].unit);
  }

  return new Set(unlocked);
}

/**
 * Returns the set of social studies unit names unlocked so far.
 * Returns empty Set for grades 1-4 (no social in this app) or when no sequence is defined.
 * Always includes at least the first unit in the sequence.
 */
export function getAvailableSocialUnits(
  grade: number,
  semester: number,
  currentWeek?: number,
): Set<string> {
  if (grade < 5) return new Set();
  const sequence = SOCIAL_UNIT_SEQUENCE[grade]?.[semester];
  if (!sequence || sequence.length === 0) return new Set();

  const week = currentWeek ?? getCurrentSemesterWeek(semester);
  const unlocked = sequence
    .filter((u) => u.startWeek <= week)
    .map((u) => u.unit);

  if (unlocked.length === 0) {
    unlocked.push(sequence[0].unit);
  }

  return new Set(unlocked);
}

/**
 * Returns the set of English topic unit names unlocked so far.
 * Returns empty Set for grades 1-2 (no English) or when no sequence is defined.
 * Always includes at least the first unit in the sequence.
 */
export function getAvailableEnglishUnits(
  grade: number,
  semester: number,
  currentWeek?: number,
): Set<string> {
  if (grade < 3) return new Set();
  const sequence = ENGLISH_UNIT_SEQUENCE[grade]?.[semester];
  if (!sequence || sequence.length === 0) return new Set();

  const week = currentWeek ?? getCurrentSemesterWeek(semester);
  const unlocked = sequence
    .filter((u) => u.startWeek <= week)
    .map((u) => u.unit);

  if (unlocked.length === 0) {
    unlocked.push(sequence[0].unit);
  }

  return new Set(unlocked);
}
