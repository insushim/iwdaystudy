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
