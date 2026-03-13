/**
 * Procedural Math Problem Generator
 * Generates grade-appropriate math problems algorithmically.
 * Combined with static data, this provides effectively unlimited math content.
 */
import type { MathEntry } from "@/types/curriculum";

// Seeded PRNG for reproducible generation
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pickOne<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function gcdCalc(a: number, b: number): number {
  return b === 0 ? a : gcdCalc(b, a % b);
}

// ============================================================
// Grade 1: 0~100, basic addition/subtraction, shapes
// ============================================================
function generateGrade1Math(rng: () => number): MathEntry {
  const type = pickOne(rng, [
    "addition",
    "addition",
    "addition",
    "subtraction",
    "subtraction",
    "counting",
    "comparison",
  ]);

  if (type === "addition") {
    const a = randInt(rng, 1, 9);
    const b = randInt(rng, 1, 9);
    return {
      type: "addition",
      expression: `${a} + ${b} = ?`,
      answer: a + b,
      steps: [`${a}와 ${b}를 더합니다`, `${a} + ${b} = ${a + b}`],
      unit: "한 자리 덧셈",
      numbers: [a, b],
      hasCarry: a + b >= 10,
    };
  } else if (type === "subtraction") {
    const b = randInt(rng, 1, 9);
    const a = randInt(rng, b, 9);
    return {
      type: "subtraction",
      expression: `${a} - ${b} = ?`,
      answer: a - b,
      steps: [`${a}에서 ${b}를 뺍니다`, `${a} - ${b} = ${a - b}`],
      unit: "한 자리 뺄셈",
      numbers: [a, b],
      hasBorrow: false,
    };
  } else if (type === "counting") {
    const start = randInt(rng, 1, 40);
    const skip = pickOne(rng, [2, 5, 10]);
    const count = randInt(rng, 3, 5);
    const answer = start + skip * count;
    return {
      type: "counting",
      expression: `${start}부터 ${skip}씩 ${count}번 뛰어 세면?`,
      answer,
      steps: Array.from({ length: count + 1 }, (_, i) => `${start + skip * i}`),
      unit: "뛰어 세기",
      numbers: [start, skip, count],
    };
  } else {
    const a = randInt(rng, 1, 50);
    const b = randInt(rng, 1, 50);
    return {
      type: "comparison",
      expression: `${a}과 ${b} 중 더 큰 수는?`,
      answer: Math.max(a, b),
      steps: [`${a}과 ${b}를 비교합니다`, `${Math.max(a, b)}이 더 큽니다`],
      unit: "수의 크기 비교",
      numbers: [a, b],
    };
  }
}

// ============================================================
// Grade 2: 두 자리 +/-, 구구단 시작, 시간, 길이
// ============================================================
function generateGrade2Math(rng: () => number): MathEntry {
  const type = pickOne(rng, [
    "addition2",
    "addition2",
    "subtraction2",
    "subtraction2",
    "multiplication_intro",
    "time",
    "length",
  ]);

  if (type === "addition2") {
    const a = randInt(rng, 10, 99);
    const b = randInt(rng, 1, 99 - a);
    const hasCarry = (a % 10) + (b % 10) >= 10;
    return {
      type: "addition",
      expression: `${a} + ${b} = ?`,
      answer: a + b,
      steps: [
        `일의 자리: ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}`,
        `십의 자리: ${Math.floor(a / 10)} + ${Math.floor(b / 10)}${hasCarry ? " + 1" : ""} = ${Math.floor((a + b) / 10)}`,
        `${a} + ${b} = ${a + b}`,
      ],
      unit: "두 자리 덧셈",
      numbers: [a, b],
      hasCarry,
    };
  } else if (type === "subtraction2") {
    const a = randInt(rng, 20, 99);
    const b = randInt(rng, 1, a);
    const hasBorrow = a % 10 < b % 10;
    return {
      type: "subtraction",
      expression: `${a} - ${b} = ?`,
      answer: a - b,
      steps: [`${a}에서 ${b}를 뺍니다`, `${a} - ${b} = ${a - b}`],
      unit: "두 자리 뺄셈",
      numbers: [a, b],
      hasBorrow,
    };
  } else if (type === "multiplication_intro") {
    const a = randInt(rng, 2, 5);
    const b = randInt(rng, 2, 9);
    return {
      type: "multiplication",
      expression: `${a} × ${b} = ?`,
      answer: a * b,
      steps: [
        `${a}을(를) ${b}번 더합니다`,
        `${Array(b).fill(a).join(" + ")} = ${a * b}`,
      ],
      unit: "곱셈구구",
      numbers: [a, b],
    };
  } else if (type === "time") {
    const hour = randInt(rng, 1, 12);
    const min = pickOne(rng, [0, 15, 30, 45]);
    return {
      type: "time",
      expression: `${hour}시 ${min === 0 ? "정각" : min + "분"}에서 30분 후는?`,
      answer:
        min + 30 >= 60
          ? ((hour % 12) + 1) * 100 + (min + 30 - 60)
          : hour * 100 + min + 30,
      steps: [
        `${hour}시 ${min}분 + 30분 = ${min + 30 >= 60 ? `${(hour % 12) + 1}시 ${min + 30 - 60}분` : `${hour}시 ${min + 30}분`}`,
      ],
      unit: "시각과 시간",
      numbers: [hour, min],
    };
  } else {
    const cm = randInt(rng, 5, 30);
    const cm2 = randInt(rng, 5, 30);
    return {
      type: "addition",
      expression: `${cm}cm + ${cm2}cm = ?cm`,
      answer: cm + cm2,
      steps: [`${cm} + ${cm2} = ${cm + cm2}cm`],
      unit: "길이 재기",
      numbers: [cm, cm2],
    };
  }
}

// ============================================================
// Grade 3: 세 자리 +/-, 곱셈, 나눗셈 시작, 분수 기초
// ============================================================
function generateGrade3Math(rng: () => number): MathEntry {
  const type = pickOne(rng, [
    "addition3",
    "subtraction3",
    "multiplication",
    "multiplication",
    "division_intro",
    "fraction_intro",
  ]);

  if (type === "addition3") {
    const a = randInt(rng, 100, 999);
    const b = randInt(rng, 100, 999 - a > 0 ? 999 - a : 100);
    const sum = a + b;
    return {
      type: "addition",
      expression: `${a} + ${b} = ?`,
      answer: sum,
      steps: [`일의 자리부터 차례로 더합니다`, `${a} + ${b} = ${sum}`],
      unit: "세 자리 덧셈",
      numbers: [a, b],
      hasCarry: true,
    };
  } else if (type === "subtraction3") {
    const a = randInt(rng, 200, 999);
    const b = randInt(rng, 100, a);
    return {
      type: "subtraction",
      expression: `${a} - ${b} = ?`,
      answer: a - b,
      steps: [`${a}에서 ${b}를 뺍니다`, `${a} - ${b} = ${a - b}`],
      unit: "세 자리 뺄셈",
      numbers: [a, b],
      hasBorrow: true,
    };
  } else if (type === "multiplication") {
    const a = randInt(rng, 2, 9);
    const b = randInt(rng, 2, 9);
    return {
      type: "multiplication",
      expression: `${a} × ${b} = ?`,
      answer: a * b,
      steps: [`${a} × ${b} = ${a * b}`],
      unit: "곱셈구구",
      numbers: [a, b],
    };
  } else if (type === "division_intro") {
    const divisor = randInt(rng, 2, 9);
    const quotient = randInt(rng, 2, 9);
    const dividend = divisor * quotient;
    return {
      type: "division",
      expression: `${dividend} ÷ ${divisor} = ?`,
      answer: quotient,
      steps: [
        `${dividend} 안에 ${divisor}가 몇 번 들어가는지 생각합니다`,
        `${dividend} ÷ ${divisor} = ${quotient}`,
      ],
      unit: "나눗셈",
      dividend,
      divisor,
      quotient,
      remainder: 0,
    };
  } else {
    // fraction intro
    const denom = pickOne(rng, [2, 3, 4, 5, 6, 8]);
    const numer = randInt(rng, 1, denom - 1);
    return {
      type: "fraction",
      expression: `피자를 ${denom}조각으로 나누었습니다. ${numer}조각을 먹으면 분수로?`,
      answer: numer,
      steps: [`${numer}/${denom}`],
      unit: "분수의 기초",
      numbers: [numer, denom],
    };
  }
}

// ============================================================
// Grade 4: 큰 수, 곱셈/나눗셈 확장, 각도, 분수 덧뺄셈
// ============================================================
function generateGrade4Math(rng: () => number): MathEntry {
  const type = pickOne(rng, [
    "multiplication_2digit",
    "division_remainder",
    "large_addition",
    "large_subtraction",
    "angle",
    "fraction_add",
  ]);

  if (type === "multiplication_2digit") {
    const a = randInt(rng, 11, 99);
    const b = randInt(rng, 2, 9);
    return {
      type: "multiplication",
      expression: `${a} × ${b} = ?`,
      answer: a * b,
      steps: [
        `${a} × ${b}를 세로셈으로 계산합니다`,
        `일의 자리: ${a % 10} × ${b} = ${(a % 10) * b}`,
        `십의 자리: ${Math.floor(a / 10)} × ${b} = ${Math.floor(a / 10) * b}`,
        `${a} × ${b} = ${a * b}`,
      ],
      unit: "두 자리 × 한 자리 곱셈",
      numbers: [a, b],
    };
  } else if (type === "division_remainder") {
    const divisor = randInt(rng, 2, 9);
    const quotient = randInt(rng, 3, 15);
    const remainder = randInt(rng, 1, divisor - 1);
    const dividend = divisor * quotient + remainder;
    return {
      type: "division",
      expression: `${dividend} ÷ ${divisor} = ? ... ?`,
      answer: quotient,
      steps: [`${dividend} ÷ ${divisor} = ${quotient} ... ${remainder}`],
      unit: "나머지가 있는 나눗셈",
      dividend,
      divisor,
      quotient,
      remainder,
    };
  } else if (type === "large_addition") {
    const a = randInt(rng, 1000, 9999);
    const b = randInt(rng, 1000, 9999);
    return {
      type: "addition",
      expression: `${a.toLocaleString()} + ${b.toLocaleString()} = ?`,
      answer: a + b,
      steps: [`${a} + ${b} = ${a + b}`],
      unit: "네 자리 덧셈",
      numbers: [a, b],
      hasCarry: true,
    };
  } else if (type === "large_subtraction") {
    const a = randInt(rng, 5000, 9999);
    const b = randInt(rng, 1000, a);
    return {
      type: "subtraction",
      expression: `${a.toLocaleString()} - ${b.toLocaleString()} = ?`,
      answer: a - b,
      steps: [`${a} - ${b} = ${a - b}`],
      unit: "네 자리 뺄셈",
      numbers: [a, b],
      hasBorrow: true,
    };
  } else if (type === "angle") {
    const angle1 = randInt(rng, 10, 170);
    const angle2 = 180 - angle1;
    return {
      type: "angle",
      expression: `삼각형 두 각이 ${angle1}°와 ${angle2 > angle1 ? randInt(rng, 10, 180 - angle1 - 10) : 90 - angle1 > 0 ? 90 - angle1 : 30}°일 때 나머지 한 각은?`,
      answer: 180 - angle1 - (angle2 > angle1 ? angle2 : 30),
      steps: [`삼각형 세 각의 합은 180°`],
      unit: "각도",
      numbers: [angle1],
    };
  } else {
    // fraction addition (same denominator)
    const denom = pickOne(rng, [3, 4, 5, 6, 8]);
    const a = randInt(rng, 1, denom - 2);
    const b = randInt(rng, 1, denom - a);
    return {
      type: "fraction",
      expression: `${a}/${denom} + ${b}/${denom} = ?`,
      answer: a + b,
      steps: [
        `분모가 같으므로 분자끼리 더합니다`,
        `${a} + ${b} = ${a + b}`,
        `답: ${a + b}/${denom}`,
      ],
      unit: "동분모 분수 덧셈",
      numbers: [a, b, denom],
    };
  }
}

// ============================================================
// Grade 5: 약수/배수, 소수 연산, 넓이, 대칭, 혼합계산
// 1학기: 혼합계산, 약수와 배수, 최대공약수/최소공배수, 분수의 덧셈/뺄셈
// 2학기: 분수의 곱셈, 소수의 곱셈, 소수의 덧셈, 넓이
// ============================================================
function generateGrade5Math(rng: () => number, semester = 1): MathEntry {
  const sem1Types = ["mixed_ops", "factor", "lcm_gcd", "fraction_sub", "fraction_sub"];
  const sem2Types = ["decimal_multiply", "decimal_add", "area", "fraction_multiply"];
  const type = pickOne(rng, semester === 1 ? sem1Types : sem2Types);

  if (type === "mixed_ops") {
    const a = randInt(rng, 2, 20);
    const b = randInt(rng, 2, 10);
    const c = randInt(rng, 1, 10);
    const ops = pickOne(rng, ["+", "-"]);
    const answer = ops === "+" ? a * b + c : a * b - c;
    return {
      type: "mixed",
      expression: `${a} × ${b} ${ops} ${c} = ?`,
      answer,
      steps: [
        `먼저 곱셈: ${a} × ${b} = ${a * b}`,
        `그 다음 ${ops === "+" ? "덧셈" : "뺄셈"}: ${a * b} ${ops} ${c} = ${answer}`,
      ],
      unit: "혼합 계산",
      numbers: [a, b, c],
    };
  } else if (type === "decimal_add") {
    const a = randInt(rng, 10, 99) / 10;
    const b = randInt(rng, 10, 99) / 10;
    const answer = Math.round((a + b) * 10) / 10;
    return {
      type: "decimal",
      expression: `${a} + ${b} = ?`,
      answer,
      steps: [`소수점을 맞추어 더합니다`, `${a} + ${b} = ${answer}`],
      unit: "소수의 덧셈",
      numbers: [a * 10, b * 10],
    };
  } else if (type === "decimal_multiply") {
    const a = randInt(rng, 2, 9);
    const b = randInt(rng, 1, 9) / 10;
    const answer = Math.round(a * b * 10) / 10;
    return {
      type: "decimal",
      expression: `${a} × ${b} = ?`,
      answer,
      steps: [`${a} × ${b} = ${answer}`],
      unit: "소수의 곱셈",
      numbers: [a, b * 10],
    };
  } else if (type === "factor") {
    const n = pickOne(rng, [12, 18, 24, 30, 36, 42, 48, 56, 60, 72]);
    const factors: number[] = [];
    for (let i = 1; i <= n; i++) {
      if (n % i === 0) factors.push(i);
    }
    return {
      type: "factor",
      expression: `${n}의 약수의 개수는?`,
      answer: factors.length,
      steps: [`${n}의 약수: ${factors.join(", ")}`, `총 ${factors.length}개`],
      unit: "약수와 배수",
      numbers: [n],
    };
  } else if (type === "fraction_sub") {
    // 통분 후 분수 덧셈/뺄셈 (5학년 1학기)
    const denoms: [number, number][] = [[2,3],[2,4],[2,5],[3,4],[3,6],[4,6],[2,6],[3,5]];
    const [d1, d2] = pickOne(rng, denoms);
    const lcm = (d1 * d2) / gcdCalc(d1, d2);
    const n1 = randInt(rng, 1, d1 - 1);
    const n2 = randInt(rng, 1, d2 - 1);
    const isAdd = rng() > 0.4;
    const n1c = n1 * (lcm / d1);
    const n2c = n2 * (lcm / d2);
    const resultNum = isAdd ? n1c + n2c : Math.abs(n1c - n2c);
    const op = isAdd ? "+" : "-";
    return {
      type: "fraction",
      expression: `${n1}/${d1} ${op} ${n2}/${d2} = ? (분자만 입력)`,
      answer: resultNum,
      steps: [
        `공통분모: ${lcm}`,
        `${n1c}/${lcm} ${op} ${n2c}/${lcm} = ${resultNum}/${lcm}`,
      ],
      unit: isAdd ? "분수의 덧셈" : "분수의 뺄셈",
      numbers: [n1, d1, n2, d2],
    };
  } else if (type === "fraction_multiply") {
    // 분수의 곱셈 (5학년 2학기)
    const n1 = randInt(rng, 1, 5);
    const d1 = randInt(rng, 2, 8);
    const n2 = randInt(rng, 1, 5);
    const d2 = randInt(rng, 2, 8);
    const gcdN = gcdCalc(n1 * n2, d1 * d2);
    const resultN = (n1 * n2) / gcdN;
    const resultD = (d1 * d2) / gcdN;
    return {
      type: "fraction",
      expression: `${n1}/${d1} × ${n2}/${d2} = ? (분자만 입력)`,
      answer: resultN,
      steps: [
        `분자끼리: ${n1} × ${n2} = ${n1 * n2}`,
        `분모끼리: ${d1} × ${d2} = ${d1 * d2}`,
        `약분하면: ${resultN}/${resultD}`,
      ],
      unit: "분수의 곱셈",
      numbers: [n1, d1, n2, d2],
    };
  } else if (type === "area") {
    const w = randInt(rng, 3, 15);
    const h = randInt(rng, 3, 15);
    return {
      type: "area",
      expression: `가로 ${w}cm, 세로 ${h}cm 직사각형의 넓이는?`,
      answer: w * h,
      steps: [`넓이 = 가로 × 세로`, `${w} × ${h} = ${w * h}cm²`],
      unit: "넓이",
      numbers: [w, h],
    };
  } else {
    // LCM/GCD
    const a = pickOne(rng, [4, 6, 8, 9, 10, 12, 15, 18, 20]);
    const b = pickOne(
      rng,
      [4, 6, 8, 9, 10, 12, 15, 18, 20].filter((x) => x !== a),
    );
    const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
    const g = gcd(a, b);
    return {
      type: "gcd",
      expression: `${a}과 ${b}의 최대공약수는?`,
      answer: g,
      steps: [
        `${a}의 약수와 ${b}의 약수 중 공통된 가장 큰 수`,
        `최대공약수: ${g}`,
      ],
      unit: "최대공약수",
      numbers: [a, b],
    };
  }
}

// ============================================================
// Grade 6: 비와 비율, 원의 넓이, 비례식, 경우의 수
// ============================================================
function generateGrade6Math(rng: () => number): MathEntry {
  const type = pickOne(rng, [
    "ratio",
    "percentage",
    "circle_area",
    "proportion",
    "probability",
    "volume",
  ]);

  if (type === "ratio") {
    const a = randInt(rng, 2, 12);
    const b = randInt(rng, 2, 12);
    const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
    const g = gcd(a, b);
    return {
      type: "ratio",
      expression: `${a} : ${b}를 가장 간단한 자연수의 비로 나타내면?`,
      answer: a / g,
      steps: [`최대공약수 ${g}로 나눕니다`, `${a / g} : ${b / g}`],
      unit: "비와 비율",
      numbers: [a, b],
    };
  } else if (type === "percentage") {
    const total = pickOne(rng, [20, 25, 40, 50, 100, 200]);
    const part = randInt(rng, 1, total);
    const pct = Math.round((part / total) * 100);
    return {
      type: "percentage",
      expression: `${total}명 중 ${part}명은 전체의 몇 %?`,
      answer: pct,
      steps: [`${part}/${total} × 100 = ${pct}%`],
      unit: "백분율",
      numbers: [part, total],
    };
  } else if (type === "circle_area") {
    const r = randInt(rng, 2, 10);
    const area = Math.round(r * r * 3.14 * 100) / 100;
    return {
      type: "area",
      expression: `반지름 ${r}cm인 원의 넓이는? (원주율 3.14)`,
      answer: area,
      steps: [
        `원의 넓이 = 반지름 × 반지름 × 3.14`,
        `${r} × ${r} × 3.14 = ${area}cm²`,
      ],
      unit: "원의 넓이",
      numbers: [r],
    };
  } else if (type === "proportion") {
    const a = randInt(rng, 2, 8);
    const b = randInt(rng, 2, 8);
    const c = randInt(rng, 2, 8);
    const d = (b * c) / a;
    if (Number.isInteger(d) && d > 0) {
      return {
        type: "proportion",
        expression: `${a} : ${b} = ${c} : ?`,
        answer: d,
        steps: [
          `비례식에서 외항의 곱 = 내항의 곱`,
          `${a} × ? = ${b} × ${c}`,
          `? = ${d}`,
        ],
        unit: "비례식",
        numbers: [a, b, c],
      };
    }
    // fallback
    return {
      type: "proportion",
      expression: `${a} : ${b} = ${a * 2} : ?`,
      answer: b * 2,
      steps: [`${a} × 2 = ${a * 2}이므로 ${b} × 2 = ${b * 2}`],
      unit: "비례식",
      numbers: [a, b],
    };
  } else if (type === "probability") {
    const items = randInt(rng, 3, 6);
    const choose = randInt(rng, 1, Math.min(items - 1, 3));
    const factorial = (n: number): number =>
      n <= 1 ? 1 : n * factorial(n - 1);
    const comb =
      factorial(items) / (factorial(choose) * factorial(items - choose));
    return {
      type: "combination",
      expression: `${items}가지 중 ${choose}가지를 고르는 경우의 수는?`,
      answer: comb,
      steps: [`${items}C${choose} = ${comb}`],
      unit: "경우의 수",
      numbers: [items, choose],
    };
  } else {
    // volume
    const w = randInt(rng, 2, 10);
    const h = randInt(rng, 2, 10);
    const d = randInt(rng, 2, 10);
    return {
      type: "volume",
      expression: `가로 ${w}cm, 세로 ${h}cm, 높이 ${d}cm 직육면체의 부피는?`,
      answer: w * h * d,
      steps: [
        `부피 = 가로 × 세로 × 높이`,
        `${w} × ${h} × ${d} = ${w * h * d}cm³`,
      ],
      unit: "직육면체의 부피",
      numbers: [w, h, d],
    };
  }
}

// ============================================================
// Public API: Generate N math problems for a given grade
// ============================================================
export function generateMathProblems(
  grade: number,
  count: number,
  seed: number,
  semester = 1,
): MathEntry[] {
  const rng = seededRandom(seed);
  const problems: MathEntry[] = [];

  const gen = (r: () => number): MathEntry => {
    switch (grade) {
      case 1: return generateGrade1Math(r);
      case 2: return generateGrade2Math(r);
      case 3: return generateGrade3Math(r);
      case 4: return generateGrade4Math(r);
      case 5: return generateGrade5Math(r, semester);
      case 6: return generateGrade6Math(r);
      default: return generateGrade1Math(r);
    }
  };

  for (let i = 0; i < count; i++) {
    problems.push(gen(rng));
  }

  return problems;
}

/**
 * Generate a large pool of math problems for a grade + semester.
 * Used to supplement static data, giving 10x+ content.
 */
export function generateMathPool(
  grade: number,
  dayOfYear: number,
  semester = 1,
): MathEntry[] {
  return generateMathProblems(grade, 500, dayOfYear * 1000 + grade, semester);
}
