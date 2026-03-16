/**
 * Curriculum unit sequences by grade and semester.
 * Defines when each math unit is introduced (by school week).
 * Korean school year: Semester 1 ≈ March 2 ~ July, Semester 2 ≈ September 1 ~ February.
 */

export interface UnitSchedule {
  unit: string;     // matches MathEntry.unit from math-generator
  startWeek: number; // week when this unit starts (1-indexed)
}

/**
 * Math unit introduction schedule for all grades.
 * Unit names must match the `unit` field returned by math-generator.ts.
 */
export const MATH_UNIT_SEQUENCE: Record<number, Record<number, UnitSchedule[]>> = {
  1: {
    1: [
      { unit: "한 자리 덧셈",   startWeek: 1 },
      { unit: "한 자리 뺄셈",   startWeek: 5 },
      { unit: "뛰어 세기",      startWeek: 9 },
      { unit: "수의 크기 비교", startWeek: 12 },
    ],
    2: [
      { unit: "뛰어 세기",      startWeek: 1 },
      { unit: "한 자리 덧셈",   startWeek: 4 },
      { unit: "한 자리 뺄셈",   startWeek: 5 },
      { unit: "수의 크기 비교", startWeek: 10 },
    ],
  },
  2: {
    1: [
      { unit: "두 자리 덧셈",   startWeek: 1 },
      { unit: "두 자리 뺄셈",   startWeek: 5 },
      { unit: "곱셈구구",       startWeek: 9 },
      { unit: "시각과 시간",    startWeek: 13 },
    ],
    2: [
      { unit: "곱셈구구",       startWeek: 1 },
      { unit: "두 자리 덧셈",   startWeek: 6 },
      { unit: "두 자리 뺄셈",   startWeek: 7 },
      { unit: "시각과 시간",    startWeek: 10 },
      { unit: "길이 재기",      startWeek: 13 },
    ],
  },
  3: {
    1: [
      { unit: "세 자리 덧셈",   startWeek: 1 },
      { unit: "세 자리 뺄셈",   startWeek: 3 },
      { unit: "곱셈구구",       startWeek: 6 },
      { unit: "나눗셈",         startWeek: 9 },
      { unit: "분수의 기초",    startWeek: 13 },
    ],
    2: [
      { unit: "곱셈구구",       startWeek: 1 },
      { unit: "나눗셈",         startWeek: 3 },
      { unit: "세 자리 덧셈",   startWeek: 7 },
      { unit: "세 자리 뺄셈",   startWeek: 9 },
      { unit: "분수의 기초",    startWeek: 12 },
    ],
  },
  4: {
    1: [
      { unit: "네 자리 덧셈",             startWeek: 1 },
      { unit: "네 자리 뺄셈",             startWeek: 4 },
      { unit: "두 자리 × 한 자리 곱셈",   startWeek: 6 },
      { unit: "나머지가 있는 나눗셈",     startWeek: 9 },
      { unit: "각도",                     startWeek: 12 },
      { unit: "동분모 분수 덧셈",         startWeek: 15 },
      { unit: "동분모 분수 뺄셈",         startWeek: 15 },
    ],
    2: [
      { unit: "동분모 분수 덧셈",         startWeek: 1 },
      { unit: "동분모 분수 뺄셈",         startWeek: 1 },
      { unit: "두 자리 × 한 자리 곱셈",   startWeek: 4 },
      { unit: "나머지가 있는 나눗셈",     startWeek: 6 },
      { unit: "각도",                     startWeek: 9 },
      { unit: "네 자리 덧셈",             startWeek: 13 },
      { unit: "네 자리 뺄셈",             startWeek: 14 },
    ],
  },
  5: {
    1: [
      { unit: "혼합 계산",   startWeek: 1 },
      { unit: "약수와 배수", startWeek: 4 },
      { unit: "최대공약수",  startWeek: 5 },
      { unit: "최소공배수",  startWeek: 5 },
      { unit: "분수의 덧셈", startWeek: 7 },
      { unit: "분수의 뺄셈", startWeek: 7 },
    ],
    2: [
      { unit: "분수의 곱셈", startWeek: 1 },
      { unit: "소수의 덧셈", startWeek: 5 },
      { unit: "소수의 곱셈", startWeek: 7 },
      { unit: "넓이",        startWeek: 10 },
      { unit: "평균",        startWeek: 13 },
    ],
  },
  6: {
    1: [
      { unit: "비와 비율",       startWeek: 1 },
      { unit: "백분율",          startWeek: 3 },
      { unit: "비례식",          startWeek: 7 },
      { unit: "직육면체의 부피", startWeek: 11 },
    ],
    2: [
      { unit: "비와 비율",   startWeek: 1 },
      { unit: "백분율",      startWeek: 2 },
      { unit: "원의 넓이",   startWeek: 4 },
      { unit: "비례식",      startWeek: 8 },
      { unit: "경우의 수",   startWeek: 11 },
    ],
  },
};

/**
 * Science unit introduction schedule for grades 3-6.
 * Unit names must match the `unit` field set in science-social-generator.ts.
 */
export const SCIENCE_UNIT_SEQUENCE: Record<number, Record<number, UnitSchedule[]>> = {
  3: {
    1: [
      { unit: "물질의 성질",   startWeek: 1  },
      { unit: "동물의 한살이", startWeek: 5  },
      { unit: "자석의 이용",   startWeek: 10 },
      { unit: "지구의 모습",   startWeek: 14 },
    ],
    2: [
      { unit: "지구의 흙",         startWeek: 1  },
      { unit: "식물의 생활",       startWeek: 5  },
      { unit: "물과 우리 생활",    startWeek: 9  },
      { unit: "소리의 성질",       startWeek: 13 },
    ],
  },
  4: {
    1: [
      { unit: "지층과 화석",     startWeek: 1  },
      { unit: "식물의 한살이",   startWeek: 5  },
      { unit: "물체의 무게",     startWeek: 9  },
      { unit: "혼합물의 분리",   startWeek: 13 },
    ],
    2: [
      { unit: "식물의 생활",       startWeek: 1  },
      { unit: "물의 상태 변화",    startWeek: 5  },
      { unit: "그림자와 거울",     startWeek: 9  },
      { unit: "화산과 지진",       startWeek: 13 },
    ],
  },
  5: {
    1: [
      { unit: "온도와 열",              startWeek: 1  },
      { unit: "태양계와 별",            startWeek: 5  },
      { unit: "용해와 용액",            startWeek: 9  },
      { unit: "다양한 생물과 우리 생활", startWeek: 13 },
    ],
    2: [
      { unit: "생물과 환경",       startWeek: 1  },
      { unit: "날씨와 우리 생활", startWeek: 5  },
      { unit: "물체의 운동",       startWeek: 9  },
      { unit: "산과 염기",         startWeek: 13 },
    ],
  },
  6: {
    1: [
      { unit: "지구와 달의 운동",     startWeek: 1  },
      { unit: "여러 가지 기체",       startWeek: 5  },
      { unit: "식물의 구조와 기능",   startWeek: 9  },
      { unit: "빛과 렌즈",           startWeek: 13 },
    ],
    2: [
      { unit: "전기의 작용",         startWeek: 1  },
      { unit: "계절의 변화",         startWeek: 5  },
      { unit: "연소와 소화",         startWeek: 9  },
      { unit: "우리 몸의 구조와 기능", startWeek: 13 },
    ],
  },
};

/**
 * Social Studies unit introduction schedule for grades 5-6.
 * Unit names must match the `unit` field set in science-social-generator.ts.
 */
export const SOCIAL_UNIT_SEQUENCE: Record<number, Record<number, UnitSchedule[]>> = {
  5: {
    1: [
      { unit: '국토와 자연환경',         startWeek: 1  },
      { unit: '민주주의와 인권',          startWeek: 6  },
      { unit: '경제생활과 합리적 선택',   startWeek: 12 },
    ],
    2: [
      { unit: '옛사람들의 삶과 문화',     startWeek: 1  },
      { unit: '사회 변화와 문화 다양성',  startWeek: 7  },
      { unit: '경제생활과 합리적 선택',   startWeek: 12 },
    ],
  },
  6: {
    1: [
      { unit: '우리나라의 정치 발전',          startWeek: 1  },
      { unit: '우리나라의 경제 발전',          startWeek: 7  },
      { unit: '세계 여러 나라의 자연과 문화',  startWeek: 12 },
    ],
    2: [
      { unit: '세계 여러 나라의 자연과 문화',  startWeek: 1  },
      { unit: '통일과 한반도의 미래',          startWeek: 7  },
      { unit: '우리나라의 정치 발전',          startWeek: 10 },
      { unit: '우리나라의 경제 발전',          startWeek: 13 },
    ],
  },
};

/**
 * English topic unit introduction schedule for grades 3-6.
 * Unit names must match the `unit` field set in english-generator.ts.
 */
export const ENGLISH_UNIT_SEQUENCE: Record<number, Record<number, UnitSchedule[]>> = {
  3: {
    1: [
      { unit: "인사와 소개", startWeek: 1  },
      { unit: "숫자와 색깔", startWeek: 4  },
      { unit: "학교생활",    startWeek: 7  },
      { unit: "가족과 신체", startWeek: 11 },
    ],
    2: [
      { unit: "음식과 맛",   startWeek: 1  },
      { unit: "동물과 자연", startWeek: 4  },
      { unit: "날씨와 계절", startWeek: 8  },
      { unit: "감정과 취미", startWeek: 12 },
    ],
  },
  4: {
    1: [
      { unit: "일상표현",   startWeek: 1  },
      { unit: "학교와 교실", startWeek: 4  },
      { unit: "음식과 건강", startWeek: 8  },
      { unit: "위치와 장소", startWeek: 12 },
    ],
    2: [
      { unit: "시간과 날짜", startWeek: 1  },
      { unit: "직업과 꿈",   startWeek: 5  },
      { unit: "교통과 이동", startWeek: 9  },
      { unit: "쇼핑과 가격", startWeek: 13 },
    ],
  },
  5: {
    1: [
      { unit: "일상과 취미", startWeek: 1  },
      { unit: "비교와 묘사", startWeek: 5  },
      { unit: "날씨와 자연", startWeek: 9  },
      { unit: "학교와 직업", startWeek: 12 },
    ],
    2: [
      { unit: "과거경험",   startWeek: 1  },
      { unit: "여행과 교통", startWeek: 5  },
      { unit: "건강과 운동", startWeek: 9  },
      { unit: "환경과 과학", startWeek: 13 },
    ],
  },
  6: {
    1: [
      { unit: "의무와 규칙", startWeek: 1  },
      { unit: "감정과 상태", startWeek: 5  },
      { unit: "경험과 계획", startWeek: 9  },
      { unit: "진로와 직업", startWeek: 12 },
    ],
    2: [
      { unit: "미래와 꿈",   startWeek: 1  },
      { unit: "사회와 문화", startWeek: 5  },
      { unit: "환경보호",    startWeek: 9  },
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

  const sem1Start = new Date(year, 2, 2);  // March 2
  const sem2Start = new Date(year, 8, 1);  // September 1

  let startDate: Date;
  if (semester === 1) {
    startDate = now >= sem1Start ? sem1Start : new Date(year - 1, 2, 2);
  } else {
    startDate = now >= sem2Start ? sem2Start : new Date(year - 1, 8, 1);
  }

  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const week = Math.floor((now.getTime() - startDate.getTime()) / msPerWeek) + 1;
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
    .filter(u => u.startWeek <= week)
    .map(u => u.unit);

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
    .filter(u => u.startWeek <= week)
    .map(u => u.unit);

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
    .filter(u => u.startWeek <= week)
    .map(u => u.unit);

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
    .filter(u => u.startWeek <= week)
    .map(u => u.unit);

  if (unlocked.length === 0) {
    unlocked.push(sequence[0].unit);
  }

  return new Set(unlocked);
}
