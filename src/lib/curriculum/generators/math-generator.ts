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
function generateGrade1Math(
  rng: () => number,
  difficulty: 1 | 2 | 3 = 2,
): MathEntry {
  const type = pickOne(rng, [
    "addition",
    "addition",
    "addition",
    "subtraction",
    "subtraction",
    "counting",
    "counting3",
    "comparison",
    "comparison_symbol",
  ]);

  // Difficulty-based ranges for Grade 1
  const addMax = difficulty === 1 ? 5 : difficulty === 3 ? 18 : 9;
  const compMax = difficulty === 1 ? 20 : difficulty === 3 ? 99 : 50;
  const countMax = difficulty === 1 ? 15 : difficulty === 3 ? 80 : 40;

  if (type === "addition") {
    const a = randInt(rng, 1, addMax);
    const b = randInt(rng, 1, difficulty === 3 ? 18 - a : addMax);
    const bClamped = Math.max(1, b);
    if (difficulty === 3) {
      // Hard: word problem with carry situations
      const items = pickOne(rng, ["사과", "구슬", "연필", "딸기", "공"]);
      return {
        type: "addition",
        expression: `${items}가 ${a}개 있었는데 ${bClamped}개를 더 받았습니다. 모두 몇 개?`,
        answer: a + bClamped,
        steps: [
          `${a}와 ${bClamped}를 더합니다`,
          `${a} + ${bClamped} = ${a + bClamped}`,
        ],
        unit: "한 자리 덧셈",
        numbers: [a, bClamped],
        hasCarry: a + bClamped >= 10,
      };
    }
    return {
      type: "addition",
      expression: `${a} + ${bClamped} = ?`,
      answer: a + bClamped,
      steps: [
        `${a}와 ${bClamped}를 더합니다`,
        `${a} + ${bClamped} = ${a + bClamped}`,
      ],
      unit: "한 자리 덧셈",
      numbers: [a, bClamped],
      hasCarry: a + bClamped >= 10,
    };
  } else if (type === "subtraction") {
    const maxVal = difficulty === 1 ? 5 : difficulty === 3 ? 18 : 9;
    const b = randInt(rng, 1, maxVal);
    const a = randInt(rng, b, maxVal);
    if (difficulty === 3) {
      const items = pickOne(rng, ["사과", "구슬", "연필", "딸기", "공"]);
      return {
        type: "subtraction",
        expression: `${items}가 ${a}개 있었는데 ${b}개를 먹었습니다. 남은 것은?`,
        answer: a - b,
        steps: [`${a}에서 ${b}를 뺍니다`, `${a} - ${b} = ${a - b}`],
        unit: "한 자리 뺄셈",
        numbers: [a, b],
        hasBorrow: a >= 10 && a % 10 < b % 10,
      };
    }
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
    const start = randInt(rng, 1, countMax);
    const skip =
      difficulty === 1 ? pickOne(rng, [2, 5]) : pickOne(rng, [2, 5, 10]);
    const count =
      difficulty === 1
        ? randInt(rng, 2, 3)
        : difficulty === 3
          ? randInt(rng, 4, 7)
          : randInt(rng, 3, 5);
    const answer = start + skip * count;
    return {
      type: "counting",
      expression: `${start}부터 ${skip}씩 ${count}번 뛰어 세면?`,
      answer,
      steps: Array.from({ length: count + 1 }, (_, i) => `${start + skip * i}`),
      unit: "뛰어 세기",
      numbers: [start, skip, count],
    };
  } else if (type === "counting3") {
    // 3씩 뛰어세기
    const start = randInt(
      rng,
      1,
      difficulty === 1 ? 10 : difficulty === 3 ? 50 : 30,
    );
    const count =
      difficulty === 1
        ? randInt(rng, 2, 3)
        : difficulty === 3
          ? randInt(rng, 5, 8)
          : randInt(rng, 3, 6);
    const answer = start + 3 * count;
    return {
      type: "counting",
      expression: `${start}부터 3씩 ${count}번 뛰어 세면?`,
      answer,
      steps: Array.from({ length: count + 1 }, (_, i) => `${start + 3 * i}`),
      unit: "뛰어 세기",
      numbers: [start, 3, count],
    };
  } else if (type === "comparison_symbol") {
    // 수 비교 (>, <, =) with visual descriptions
    const a = randInt(rng, 1, compMax);
    const b = randInt(rng, 1, compMax);
    const symbol = a > b ? ">" : a < b ? "<" : "=";
    const answerNum = a > b ? 1 : a < b ? 2 : 0;
    const items = pickOne(rng, ["사과", "구슬", "연필", "딸기", "공"]);
    return {
      type: "comparison",
      expression: `${items}가 ${a}개, 귤이 ${b}개 있습니다. 더 많은 것은? (1: ${items}, 2: 귤, 0: 같음)`,
      answer: answerNum,
      steps: [
        `${a} ${symbol} ${b}`,
        answerNum === 1
          ? `${items}가 더 많습니다`
          : answerNum === 2
            ? `귤이 더 많습니다`
            : `같습니다`,
      ],
      unit: "수의 크기 비교",
      numbers: [a, b],
    };
  } else {
    const a = randInt(rng, 1, compMax);
    const b = randInt(rng, 1, compMax);
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
function generateGrade2Math(
  rng: () => number,
  difficulty: 1 | 2 | 3 = 2,
): MathEntry {
  const type = pickOne(rng, [
    "addition2",
    "addition2",
    "subtraction2",
    "subtraction2",
    "multiplication_intro",
    "time",
    "length",
    "length_compare",
    "weight_compare",
    "clock_read",
  ]);

  // Difficulty-based ranges for Grade 2
  const addMin = difficulty === 1 ? 10 : difficulty === 3 ? 100 : 10;
  const addMax = difficulty === 1 ? 30 : difficulty === 3 ? 999 : 99;
  const subMax = difficulty === 1 ? 30 : difficulty === 3 ? 999 : 99;
  const mulMax = difficulty === 1 ? 4 : difficulty === 3 ? 9 : 5;

  if (type === "addition2") {
    const a = randInt(rng, addMin, addMax);
    const bMax = Math.max(1, (difficulty === 3 ? 999 : addMax) - a);
    const b = randInt(rng, 1, bMax);
    const hasCarry = (a % 10) + (b % 10) >= 10;
    const unitLabel = difficulty === 3 ? "두 자리 덧셈" : "두 자리 덧셈";
    if (difficulty === 3) {
      const context = pickOne(rng, [
        "문구점에서 연필",
        "과일가게에서 사과",
        "도서관에서 책",
      ]);
      return {
        type: "addition",
        expression: `${context} ${a}개와 ${b}개를 합하면 모두 몇 개?`,
        answer: a + b,
        steps: [`일의 자리부터 차례로 더합니다`, `${a} + ${b} = ${a + b}`],
        unit: "두 자리 덧셈",
        numbers: [a, b],
        hasCarry,
      };
    }
    return {
      type: "addition",
      expression: `${a} + ${b} = ?`,
      answer: a + b,
      steps: [
        `일의 자리: ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}`,
        `십의 자리: ${Math.floor(a / 10)} + ${Math.floor(b / 10)}${hasCarry ? " + 1" : ""} = ${Math.floor((a + b) / 10)}`,
        `${a} + ${b} = ${a + b}`,
      ],
      unit: unitLabel,
      numbers: [a, b],
      hasCarry,
    };
  } else if (type === "subtraction2") {
    const a = randInt(
      rng,
      difficulty === 1 ? 15 : difficulty === 3 ? 200 : 20,
      subMax,
    );
    const b = randInt(rng, 1, a);
    const hasBorrow = a % 10 < b % 10;
    if (difficulty === 3) {
      const context = pickOne(rng, [
        "학교에 학생이",
        "바구니에 귤이",
        "연못에 물고기가",
      ]);
      return {
        type: "subtraction",
        expression: `${context} ${a}개 있었는데 ${b}개가 없어졌습니다. 남은 것은?`,
        answer: a - b,
        steps: [`${a}에서 ${b}를 뺍니다`, `${a} - ${b} = ${a - b}`],
        unit: "두 자리 뺄셈",
        numbers: [a, b],
        hasBorrow,
      };
    }
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
    const a = randInt(rng, 2, mulMax);
    const b = randInt(rng, 2, difficulty === 1 ? 5 : 9);
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
    const min =
      difficulty === 1 ? pickOne(rng, [0, 30]) : pickOne(rng, [0, 15, 30, 45]);
    const addMin =
      difficulty === 1
        ? 30
        : difficulty === 3
          ? pickOne(rng, [30, 45, 60, 90])
          : 30;
    if (difficulty === 3) {
      const totalMin = hour * 60 + min + addMin;
      const newHour = Math.floor(totalMin / 60) % 12 || 12;
      const newMin = totalMin % 60;
      return {
        type: "time",
        expression: `${hour}시 ${min === 0 ? "정각" : min + "분"}에서 ${addMin}분 후는 몇 시 몇 분?`,
        answer: newHour * 100 + newMin,
        steps: [`${hour}시 ${min}분 + ${addMin}분 = ${newHour}시 ${newMin}분`],
        unit: "시각과 시간",
        numbers: [hour, min],
      };
    }
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
  } else if (type === "length_compare") {
    const lenMax = difficulty === 1 ? 30 : difficulty === 3 ? 200 : 99;
    const cm1 = randInt(rng, 10, lenMax);
    const cm2 = randInt(rng, 10, lenMax);
    const diff = Math.abs(cm1 - cm2);
    return {
      type: "subtraction",
      expression: `연필 길이가 ${cm1}cm, 지우개 길이가 ${cm2}cm입니다. 몇 cm 차이?`,
      answer: diff,
      steps: [
        cm1 > cm2
          ? `${cm1} - ${cm2} = ${diff}cm`
          : `${cm2} - ${cm1} = ${diff}cm`,
      ],
      unit: "길이 재기",
      numbers: [cm1, cm2],
    };
  } else if (type === "weight_compare") {
    const wMax = difficulty === 1 ? 10 : difficulty === 3 ? 50 : 20;
    const kg1 = randInt(rng, 1, wMax);
    const kg2 = randInt(rng, 1, wMax);
    return {
      type: "comparison",
      expression: `수박 ${kg1}kg, 참외 ${kg2}kg 중 더 무거운 것의 무게는?`,
      answer: Math.max(kg1, kg2),
      steps: [
        `${kg1}과 ${kg2}를 비교합니다`,
        `${Math.max(kg1, kg2)}kg이 더 무겁습니다`,
      ],
      unit: "무게 재기",
      numbers: [kg1, kg2],
    };
  } else if (type === "clock_read") {
    const hour = randInt(rng, 1, 12);
    const min =
      difficulty === 1
        ? pickOne(rng, [0, 15, 30, 45])
        : pickOne(rng, [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
    const addMin =
      difficulty === 1
        ? pickOne(rng, [15, 30])
        : difficulty === 3
          ? pickOne(rng, [25, 35, 45, 55, 75, 90])
          : pickOne(rng, [15, 20, 25, 30, 45, 60]);
    const totalMin = hour * 60 + min + addMin;
    const newHour = Math.floor(totalMin / 60) % 12 || 12;
    const newMin = totalMin % 60;
    return {
      type: "time",
      expression: `${hour}시 ${min === 0 ? "정각" : min + "분"}에서 ${addMin}분 후는 몇 시 몇 분?`,
      answer: newHour * 100 + newMin,
      steps: [`${hour}시 ${min}분 + ${addMin}분 = ${newHour}시 ${newMin}분`],
      unit: "시각과 시간",
      numbers: [hour, min],
    };
  } else {
    const lenMax = difficulty === 1 ? 15 : difficulty === 3 ? 60 : 30;
    const cm = randInt(rng, 5, lenMax);
    const cm2 = randInt(rng, 5, lenMax);
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
function generateGrade3Math(
  rng: () => number,
  difficulty: 1 | 2 | 3 = 2,
): MathEntry {
  const type = pickOne(rng, [
    "addition3",
    "subtraction3",
    "multiplication",
    "multiplication",
    "division_intro",
    "division_remainder",
    "fraction_intro",
    "fraction_compare",
  ]);

  // Difficulty-based ranges for Grade 3
  const mulMaxA = difficulty === 1 ? 5 : difficulty === 3 ? 12 : 9;
  const mulMaxB = difficulty === 1 ? 5 : difficulty === 3 ? 12 : 9;
  const divMaxQ = difficulty === 1 ? 5 : difficulty === 3 ? 12 : 9;

  if (type === "addition3") {
    const aMin = difficulty === 1 ? 100 : difficulty === 3 ? 500 : 100;
    const aMax = difficulty === 1 ? 400 : difficulty === 3 ? 9999 : 999;
    const a = randInt(rng, aMin, aMax);
    const bMax = Math.max(100, (difficulty === 3 ? 9999 : 999) - a);
    const b = randInt(rng, difficulty === 1 ? 50 : 100, bMax);
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
    const aMin = difficulty === 1 ? 200 : difficulty === 3 ? 1000 : 200;
    const aMax = difficulty === 1 ? 500 : difficulty === 3 ? 9999 : 999;
    const a = randInt(rng, aMin, aMax);
    const b = randInt(rng, difficulty === 1 ? 50 : 100, a);
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
    const a = randInt(rng, 2, mulMaxA);
    const b = randInt(rng, 2, mulMaxB);
    if (difficulty === 3) {
      return {
        type: "multiplication",
        expression: `한 상자에 ${a}개씩 ${b}상자가 있습니다. 전체 개수는?`,
        answer: a * b,
        steps: [`${a} × ${b} = ${a * b}`],
        unit: "곱셈구구",
        numbers: [a, b],
      };
    }
    return {
      type: "multiplication",
      expression: `${a} × ${b} = ?`,
      answer: a * b,
      steps: [`${a} × ${b} = ${a * b}`],
      unit: "곱셈구구",
      numbers: [a, b],
    };
  } else if (type === "division_intro") {
    const divisor = randInt(rng, 2, difficulty === 1 ? 5 : 9);
    const quotient = randInt(rng, 2, divMaxQ);
    const dividend = divisor * quotient;
    if (difficulty === 3) {
      return {
        type: "division",
        expression: `${dividend}개의 사탕을 ${divisor}명에게 똑같이 나누면 한 명에게 몇 개?`,
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
    }
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
  } else if (type === "division_remainder") {
    const divisor = randInt(rng, 2, difficulty === 1 ? 5 : 9);
    const quotient = randInt(
      rng,
      2,
      difficulty === 1 ? 5 : difficulty === 3 ? 12 : 9,
    );
    const remainder = randInt(rng, 1, divisor - 1);
    const dividend = divisor * quotient + remainder;
    return {
      type: "division",
      expression: `${dividend} ÷ ${divisor}의 몫은?`,
      answer: quotient,
      steps: [
        `${dividend} 안에 ${divisor}가 ${quotient}번 들어갑니다`,
        `${dividend} ÷ ${divisor} = ${quotient} ... ${remainder}`,
      ],
      unit: "나눗셈",
      dividend,
      divisor,
      quotient,
      remainder,
    };
  } else if (type === "fraction_compare") {
    const denom =
      difficulty === 1
        ? pickOne(rng, [2, 3, 4])
        : difficulty === 3
          ? pickOne(rng, [4, 5, 6, 8, 10, 12])
          : pickOne(rng, [3, 4, 5, 6, 8]);
    const n1 = randInt(rng, 1, denom - 1);
    let n2 = randInt(rng, 1, denom - 1);
    if (n2 === n1) n2 = n1 > 1 ? n1 - 1 : n1 + 1;
    const bigger = Math.max(n1, n2);
    return {
      type: "fraction",
      expression: `${n1}/${denom}과 ${n2}/${denom} 중 더 큰 분수의 분자는?`,
      answer: bigger,
      steps: [
        `분모가 같으면 분자가 큰 것이 더 큽니다`,
        `${bigger}/${denom}이 더 큽니다`,
      ],
      unit: "분수의 기초",
      numbers: [n1, n2, denom],
    };
  } else {
    // fraction intro
    const denom =
      difficulty === 1
        ? pickOne(rng, [2, 3, 4])
        : difficulty === 3
          ? pickOne(rng, [3, 4, 5, 6, 8, 10, 12])
          : pickOne(rng, [2, 3, 4, 5, 6, 8]);
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
function generateGrade4Math(
  rng: () => number,
  difficulty: 1 | 2 | 3 = 2,
): MathEntry {
  const type = pickOne(rng, [
    "multiplication_2digit",
    "division_remainder",
    "large_addition",
    "large_subtraction",
    "angle",
    "angle_calc",
    "fraction_add",
    "graph_read",
  ]);

  if (type === "multiplication_2digit") {
    const aMin = difficulty === 1 ? 11 : difficulty === 3 ? 20 : 11;
    const aMax = difficulty === 1 ? 30 : difficulty === 3 ? 99 : 99;
    const bMax = difficulty === 1 ? 5 : difficulty === 3 ? 15 : 9;
    const a = randInt(rng, aMin, aMax);
    const b = randInt(rng, 2, bMax);
    if (difficulty === 3) {
      return {
        type: "multiplication",
        expression: `한 줄에 ${a}명씩 ${b}줄이 있습니다. 전체 인원은?`,
        answer: a * b,
        steps: [
          `${a} × ${b}를 세로셈으로 계산합니다`,
          `${a} × ${b} = ${a * b}`,
        ],
        unit: "두 자리 × 한 자리 곱셈",
        numbers: [a, b],
      };
    }
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
    const divisor = randInt(rng, 2, difficulty === 1 ? 5 : 9);
    const qMax = difficulty === 1 ? 8 : difficulty === 3 ? 25 : 15;
    const quotient = randInt(rng, 3, qMax);
    const remainder = randInt(rng, 1, divisor - 1);
    const dividend = divisor * quotient + remainder;
    return {
      type: "division",
      expression: `${dividend} ÷ ${divisor}의 몫은?`,
      answer: quotient,
      steps: [`${dividend} ÷ ${divisor} = ${quotient} ... ${remainder}`],
      unit: "나머지가 있는 나눗셈",
      dividend,
      divisor,
      quotient,
      remainder,
    };
  } else if (type === "large_addition") {
    const aMin = difficulty === 1 ? 100 : difficulty === 3 ? 10000 : 1000;
    const aMax = difficulty === 1 ? 999 : difficulty === 3 ? 99999 : 9999;
    const a = randInt(rng, aMin, aMax);
    const b = randInt(rng, aMin, Math.min(aMax, aMax * 2 - a));
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
    const aMin = difficulty === 1 ? 500 : difficulty === 3 ? 10000 : 5000;
    const aMax = difficulty === 1 ? 999 : difficulty === 3 ? 99999 : 9999;
    const a = randInt(rng, aMin, aMax);
    const b = randInt(
      rng,
      difficulty === 1 ? 100 : difficulty === 3 ? 1000 : 1000,
      a,
    );
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
    if (difficulty === 1) {
      // Simpler: just find missing angle in a right triangle or straight line
      const angle1 = randInt(rng, 30, 80);
      const angle2 = 90 - angle1;
      return {
        type: "angle",
        expression: `직각삼각형의 한 각이 ${angle1}°일 때 나머지 한 각은?`,
        answer: angle2,
        steps: [`직각삼각형: 90° + ${angle1}° + ? = 180°`, `? = ${angle2}°`],
        unit: "각도",
        numbers: [angle1],
      };
    } else if (difficulty === 3) {
      // Multi-step: quadrilateral angles
      const a1 = randInt(rng, 50, 120);
      const a2 = randInt(rng, 40, 100);
      const a3 = randInt(rng, 30, 360 - a1 - a2 - 10);
      const a4 = 360 - a1 - a2 - a3;
      return {
        type: "angle",
        expression: `사각형의 세 각이 ${a1}°, ${a2}°, ${a3}°일 때 나머지 한 각은?`,
        answer: a4,
        steps: [
          `사각형 네 각의 합은 360°`,
          `360° - ${a1}° - ${a2}° - ${a3}° = ${a4}°`,
        ],
        unit: "각도",
        numbers: [a1, a2, a3],
      };
    }
    const angle1 = randInt(rng, 20, 100);
    const angle2 = randInt(rng, 20, Math.max(21, 180 - angle1 - 10));
    const angle3 = 180 - angle1 - angle2;
    return {
      type: "angle",
      expression: `삼각형 두 각이 ${angle1}°와 ${angle2}°일 때 나머지 한 각은?`,
      answer: angle3,
      steps: [
        `삼각형 세 각의 합은 180°`,
        `180° - ${angle1}° - ${angle2}° = ${angle3}°`,
      ],
      unit: "각도",
      numbers: [angle1, angle2],
    };
  } else if (type === "angle_calc") {
    const a1Max = difficulty === 1 ? 60 : difficulty === 3 ? 150 : 120;
    const a2Max = difficulty === 1 ? 30 : difficulty === 3 ? 90 : 60;
    const a1 = randInt(rng, 20, a1Max);
    const a2 = randInt(rng, 10, a2Max);
    const isAdd = rng() > 0.5;
    if (difficulty === 3) {
      // Multi-step: add two angles then subtract from 180
      const sum = a1 + a2;
      return {
        type: "angle",
        expression: `두 각 ${a1}°와 ${a2}°의 합을 180°에서 빼면 몇 도?`,
        answer: 180 - sum,
        steps: [`${a1}° + ${a2}° = ${sum}°`, `180° - ${sum}° = ${180 - sum}°`],
        unit: "각도",
        numbers: [a1, a2],
      };
    }
    if (isAdd) {
      return {
        type: "angle",
        expression: `${a1}°와 ${a2}°를 더하면 몇 도?`,
        answer: a1 + a2,
        steps: [`${a1}° + ${a2}° = ${a1 + a2}°`],
        unit: "각도",
        numbers: [a1, a2],
      };
    } else {
      const big = Math.max(a1, a2);
      const small = Math.min(a1, a2);
      return {
        type: "angle",
        expression: `${big}°에서 ${small}°를 빼면 몇 도?`,
        answer: big - small,
        steps: [`${big}° - ${small}° = ${big - small}°`],
        unit: "각도",
        numbers: [big, small],
      };
    }
  } else if (type === "graph_read") {
    const monthCount = difficulty === 1 ? 3 : difficulty === 3 ? 7 : 5;
    const months = ["1월", "2월", "3월", "4월", "5월", "6월", "7월"].slice(
      0,
      monthCount,
    );
    const valMax = difficulty === 1 ? 15 : difficulty === 3 ? 50 : 30;
    const values = Array.from({ length: monthCount }, () =>
      randInt(rng, 5, valMax),
    );
    const maxVal = Math.max(...values);
    const maxIdx = values.indexOf(maxVal);
    const minVal = Math.min(...values);
    if (difficulty === 3) {
      return {
        type: "comparison",
        expression: `기온 그래프: ${months.map((m, i) => `${m}=${values[i]}°C`).join(", ")}. 가장 높은 달과 낮은 달의 기온 차이는?`,
        answer: maxVal - minVal,
        steps: [
          `최고: ${months[maxIdx]} ${maxVal}°C, 최저: ${minVal}°C`,
          `차이: ${maxVal} - ${minVal} = ${maxVal - minVal}°C`,
        ],
        unit: "네 자리 덧셈",
        numbers: values,
      };
    }
    return {
      type: "comparison",
      expression: `기온 그래프: ${months.map((m, i) => `${m}=${values[i]}°C`).join(", ")}. 가장 높은 달의 기온은?`,
      answer: maxVal,
      steps: [`${months[maxIdx]}의 기온이 ${maxVal}°C로 가장 높습니다`],
      unit: "네 자리 덧셈",
      numbers: values,
    };
  } else {
    // fraction addition (same denominator)
    const denom =
      difficulty === 1
        ? pickOne(rng, [2, 3, 4])
        : difficulty === 3
          ? pickOne(rng, [4, 5, 6, 8, 10, 12])
          : pickOne(rng, [3, 4, 5, 6, 8]);
    const a = randInt(rng, 1, denom - 2);
    const b = randInt(rng, 1, denom - a);
    if (difficulty === 3) {
      // Addition then subtraction
      const c = randInt(rng, 1, Math.max(1, a + b - 1));
      const result = a + b - c;
      return {
        type: "fraction",
        expression: `${a}/${denom} + ${b}/${denom} - ${c}/${denom} = ? (분자만 입력)`,
        answer: result,
        steps: [
          `분모가 같으므로 분자끼리 계산합니다`,
          `${a} + ${b} - ${c} = ${result}`,
          `답: ${result}/${denom}`,
        ],
        unit: "동분모 분수 덧셈",
        numbers: [a, b, c, denom],
      };
    }
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
function generateGrade5Math(
  rng: () => number,
  semester = 1,
  difficulty: 1 | 2 | 3 = 2,
): MathEntry {
  const sem1Types = [
    "mixed_ops",
    "factor",
    "lcm_gcd",
    "fraction_sub",
    "fraction_sub",
    "simplify_fraction",
  ];
  const sem2Types = [
    "decimal_multiply",
    "decimal_add",
    "decimal_multiply2",
    "area",
    "fraction_multiply",
  ];
  const type = pickOne(rng, semester === 1 ? sem1Types : sem2Types);

  // Difficulty-based: denominators for fractions
  const fracDenomMax = difficulty === 1 ? 6 : difficulty === 3 ? 15 : 10;

  if (type === "mixed_ops") {
    const aMax = difficulty === 1 ? 10 : difficulty === 3 ? 30 : 20;
    const bMax = difficulty === 1 ? 5 : difficulty === 3 ? 15 : 10;
    const cMax = difficulty === 1 ? 5 : difficulty === 3 ? 20 : 10;
    const a = randInt(rng, 2, aMax);
    const b = randInt(rng, 2, bMax);
    const ops = pickOne(rng, ["+", "-"]);
    const c =
      ops === "-"
        ? randInt(rng, 1, Math.min(cMax, a * b - 1))
        : randInt(rng, 1, cMax);
    const answer = ops === "+" ? a * b + c : a * b - c;
    if (difficulty === 3) {
      // Multi-step: add parentheses
      const d = randInt(rng, 2, 5);
      const answer3 = (a + c) * b - d;
      return {
        type: "mixed",
        expression: `(${a} + ${c}) × ${b} - ${d} = ?`,
        answer: answer3,
        steps: [
          `먼저 괄호: ${a} + ${c} = ${a + c}`,
          `곱셈: ${a + c} × ${b} = ${(a + c) * b}`,
          `뺄셈: ${(a + c) * b} - ${d} = ${answer3}`,
        ],
        unit: "혼합 계산",
        numbers: [a, b, c, d],
      };
    }
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
    if (difficulty === 3) {
      // Two-decimal-place addition
      const a = randInt(rng, 100, 999) / 100;
      const b = randInt(rng, 100, 999) / 100;
      const answer = Math.round((a + b) * 100) / 100;
      return {
        type: "decimal",
        expression: `${a} + ${b} = ?`,
        answer,
        steps: [`소수점을 맞추어 더합니다`, `${a} + ${b} = ${answer}`],
        unit: "소수의 덧셈",
        numbers: [Math.round(a * 100), Math.round(b * 100)],
      };
    }
    const aMax = difficulty === 1 ? 50 : 99;
    const a = randInt(rng, 10, aMax) / 10;
    const b = randInt(rng, 10, aMax) / 10;
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
    const aMax = difficulty === 1 ? 5 : difficulty === 3 ? 15 : 9;
    const a = randInt(rng, 2, aMax);
    const b = randInt(rng, 1, 9) / 10;
    const answer = Math.round(a * b * 10) / 10;
    if (difficulty === 3) {
      // Decimal × decimal
      const a2 = randInt(rng, 11, 99) / 10;
      const b2 = randInt(rng, 2, 9) / 10;
      const ans2 = Math.round(a2 * b2 * 100) / 100;
      return {
        type: "decimal",
        expression: `${a2} × ${b2} = ?`,
        answer: ans2,
        steps: [
          `소수 × 소수: 소수점 자리수를 더합니다`,
          `${a2} × ${b2} = ${ans2}`,
        ],
        unit: "소수의 곱셈",
        numbers: [Math.round(a2 * 10), Math.round(b2 * 10)],
      };
    }
    return {
      type: "decimal",
      expression: `${a} × ${b} = ?`,
      answer,
      steps: [`${a} × ${b} = ${answer}`],
      unit: "소수의 곱셈",
      numbers: [a, b * 10],
    };
  } else if (type === "factor") {
    const easyNums = [6, 8, 10, 12, 15];
    const normalNums = [12, 18, 24, 30, 36, 42, 48, 56, 60, 72];
    const hardNums = [36, 48, 60, 72, 84, 90, 96, 100, 120];
    const n = pickOne(
      rng,
      difficulty === 1 ? easyNums : difficulty === 3 ? hardNums : normalNums,
    );
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
    const easyDenoms: [number, number][] = [
      [2, 4],
      [2, 6],
      [3, 6],
    ];
    const normalDenoms: [number, number][] = [
      [2, 3],
      [2, 4],
      [2, 5],
      [3, 4],
      [3, 6],
      [4, 6],
      [2, 6],
      [3, 5],
    ];
    const hardDenoms: [number, number][] = [
      [3, 5],
      [4, 5],
      [3, 7],
      [5, 6],
      [4, 7],
      [5, 8],
      [3, 8],
      [6, 7],
    ];
    const [d1, d2] = pickOne(
      rng,
      difficulty === 1
        ? easyDenoms
        : difficulty === 3
          ? hardDenoms
          : normalDenoms,
    );
    const lcm = (d1 * d2) / gcdCalc(d1, d2);
    const n1 = randInt(rng, 1, d1 - 1);
    const n2 = randInt(rng, 1, d2 - 1);
    const isAdd = rng() > 0.4;
    const n1c = n1 * (lcm / d1);
    const n2c = n2 * (lcm / d2);

    // For subtraction, ensure first fraction is larger than second
    let resultNum: number;
    let op: string;
    let finalN1: number, finalN2: number, finalD1: number, finalD2: number;

    if (isAdd) {
      resultNum = n1c + n2c;
      op = "+";
      finalN1 = n1;
      finalN2 = n2;
      finalD1 = d1;
      finalD2 = d2;
    } else {
      // For subtraction, make sure we don't get negative results
      if (n1c >= n2c) {
        resultNum = n1c - n2c;
        finalN1 = n1;
        finalN2 = n2;
        finalD1 = d1;
        finalD2 = d2;
      } else {
        resultNum = n2c - n1c;
        finalN1 = n2;
        finalN2 = n1;
        finalD1 = d2;
        finalD2 = d1;
      }
      op = "-";
    }
    if (difficulty === 3) {
      // Mixed operation: add then subtract a third fraction
      const n3 = randInt(
        rng,
        1,
        Math.max(1, Math.min(finalD1 - 1, resultNum - 1)),
      );
      const n3c = n3 * (lcm / finalD1);
      const finalResult = Math.max(0, resultNum - n3c); // Ensure non-negative
      return {
        type: "fraction",
        expression: `${finalN1}/${finalD1} ${op} ${finalN2}/${finalD2} - ${n3}/${finalD1} = ? (분자만 입력, 분모=${lcm})`,
        answer: finalResult,
        steps: [
          `공통분모: ${lcm}`,
          `${n1c}/${lcm} ${op} ${n2c}/${lcm} = ${resultNum}/${lcm}`,
          `${resultNum}/${lcm} - ${n3c}/${lcm} = ${finalResult}/${lcm}`,
        ],
        unit: "분수의 덧셈",
        numbers: [finalN1, finalD1, finalN2, finalD2, n3],
      };
    }
    return {
      type: "fraction",
      expression: `${finalN1}/${finalD1} ${op} ${finalN2}/${finalD2} = ? (분자만 입력)`,
      answer: resultNum,
      steps: [
        `공통분모: ${lcm}`,
        `${finalN1 * (lcm / finalD1)}/${lcm} ${op} ${finalN2 * (lcm / finalD2)}/${lcm} = ${resultNum}/${lcm}`,
      ],
      unit: isAdd ? "분수의 덧셈" : "분수의 뺄셈",
      numbers: [finalN1, finalD1, finalN2, finalD2],
    };
  } else if (type === "fraction_multiply") {
    const nMax = difficulty === 1 ? 3 : difficulty === 3 ? 8 : 5;
    const dMax = difficulty === 1 ? 6 : difficulty === 3 ? 12 : 8;
    const n1 = randInt(rng, 1, nMax);
    const d1 = randInt(rng, 2, dMax);
    const n2 = randInt(rng, 1, nMax);
    const d2 = randInt(rng, 2, dMax);
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
  } else if (type === "simplify_fraction") {
    const factor =
      difficulty === 1
        ? pickOne(rng, [2, 3])
        : difficulty === 3
          ? pickOne(rng, [3, 4, 5, 6, 7, 8])
          : pickOne(rng, [2, 3, 4, 5, 6]);
    const n = randInt(rng, 1, difficulty === 1 ? 3 : 5);
    const d = randInt(
      rng,
      n + 1,
      difficulty === 1 ? 5 : difficulty === 3 ? 12 : 8,
    );
    const numer = n * factor;
    const denom = d * factor;
    return {
      type: "fraction",
      expression: `${numer}/${denom}을 약분하면? (분자만 입력)`,
      answer: n,
      steps: [
        `${numer}과 ${denom}의 공약수 ${factor}로 나눕니다`,
        `${numer}/${denom} = ${n}/${d}`,
      ],
      unit: "약수와 배수",
      numbers: [numer, denom],
    };
  } else if (type === "decimal_multiply2") {
    const a = randInt(rng, 1, difficulty === 1 ? 5 : 9) / 10;
    const b = randInt(rng, 2, difficulty === 1 ? 5 : difficulty === 3 ? 15 : 9);
    const answer = Math.round(a * b * 10) / 10;
    return {
      type: "decimal",
      expression: `${a} × ${b} = ?`,
      answer,
      steps: [`소수점 위치에 주의합니다`, `${a} × ${b} = ${answer}`],
      unit: "소수의 곱셈",
      numbers: [a * 10, b],
    };
  } else if (type === "area") {
    const wMax = difficulty === 1 ? 8 : difficulty === 3 ? 25 : 15;
    const w = randInt(rng, 3, wMax);
    const h = randInt(rng, 3, wMax);
    if (difficulty === 3) {
      // Complex shape: L-shaped area
      const w2 = randInt(rng, 1, w - 1);
      const h2 = randInt(rng, 1, h - 1);
      const area = w * h - w2 * h2;
      return {
        type: "area",
        expression: `큰 직사각형 가로 ${w}cm, 세로 ${h}cm에서 가로 ${w2}cm, 세로 ${h2}cm를 잘라냈을 때 넓이는?`,
        answer: area,
        steps: [
          `전체 넓이: ${w} × ${h} = ${w * h}cm²`,
          `잘라낸 넓이: ${w2} × ${h2} = ${w2 * h2}cm²`,
          `${w * h} - ${w2 * h2} = ${area}cm²`,
        ],
        unit: "넓이",
        numbers: [w, h, w2, h2],
      };
    }
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
    const easyNums = [4, 6, 8, 10, 12];
    const normalNums = [4, 6, 8, 9, 10, 12, 15, 18, 20];
    const hardNums = [12, 15, 18, 20, 24, 28, 30, 36, 42, 48];
    const pool =
      difficulty === 1 ? easyNums : difficulty === 3 ? hardNums : normalNums;
    const a = pickOne(rng, pool);
    const b = pickOne(
      rng,
      pool.filter((x) => x !== a),
    );
    const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
    const g = gcd(a, b);
    if (difficulty === 3) {
      // Ask for both GCD and LCM
      const l = (a * b) / g;
      return {
        type: "gcd",
        expression: `${a}과 ${b}의 최소공배수는?`,
        answer: l,
        steps: [`최대공약수: ${g}`, `최소공배수: ${a} × ${b} ÷ ${g} = ${l}`],
        unit: "최소공배수",
        numbers: [a, b],
      };
    }
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
function generateGrade6Math(
  rng: () => number,
  difficulty: 1 | 2 | 3 = 2,
): MathEntry {
  const type = pickOne(rng, [
    "ratio",
    "percentage",
    "circle_area",
    "circle_circumference",
    "proportion",
    "proportion_word",
    "probability",
    "volume",
  ]);

  if (type === "ratio") {
    const aMax = difficulty === 1 ? 6 : difficulty === 3 ? 24 : 12;
    const a = randInt(rng, 2, aMax);
    const b = randInt(rng, 2, aMax);
    const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
    const g = gcd(a, b);
    if (difficulty === 3) {
      // Three-way ratio simplification
      const c = randInt(rng, 2, aMax);
      const g3 = gcd(gcd(a, b), c);
      return {
        type: "ratio",
        expression: `${a} : ${b} : ${c}를 가장 간단한 자연수의 비로 나타내면? (첫째 수 입력)`,
        answer: a / g3,
        steps: [
          `최대공약수 ${g3}로 나눕니다`,
          `${a / g3} : ${b / g3} : ${c / g3}`,
        ],
        unit: "비와 비율",
        numbers: [a, b, c],
      };
    }
    return {
      type: "ratio",
      expression: `${a} : ${b}를 가장 간단한 자연수의 비로 나타내면?`,
      answer: a / g,
      steps: [`최대공약수 ${g}로 나눕니다`, `${a / g} : ${b / g}`],
      unit: "비와 비율",
      numbers: [a, b],
    };
  } else if (type === "percentage") {
    const easyTotals = [10, 20, 50, 100];
    const normalTotals = [20, 25, 40, 50, 100, 200];
    const hardTotals = [30, 60, 75, 80, 120, 150, 250, 300];
    const total = pickOne(
      rng,
      difficulty === 1
        ? easyTotals
        : difficulty === 3
          ? hardTotals
          : normalTotals,
    );
    const part = randInt(rng, 1, total);
    const pct = Math.round((part / total) * 100);
    if (difficulty === 3) {
      // Multi-step: find percentage then calculate amount
      const total2 = pickOne(rng, [200, 300, 500, 800]);
      const pctKnown = pickOne(rng, [10, 15, 20, 25, 30, 40]);
      const answer = (total2 * pctKnown) / 100;
      return {
        type: "percentage",
        expression: `${total2}원의 ${pctKnown}%는 얼마?`,
        answer,
        steps: [`${total2} × ${pctKnown}/100 = ${answer}원`],
        unit: "백분율",
        numbers: [total2, pctKnown],
      };
    }
    return {
      type: "percentage",
      expression: `${total}명 중 ${part}명은 전체의 몇 %?`,
      answer: pct,
      steps: [`${part}/${total} × 100 = ${pct}%`],
      unit: "백분율",
      numbers: [part, total],
    };
  } else if (type === "circle_area") {
    const rMax = difficulty === 1 ? 5 : difficulty === 3 ? 20 : 10;
    const r = randInt(rng, 2, rMax);
    const area = Math.round(r * r * 3.14 * 100) / 100;
    if (difficulty === 3) {
      // Find area of ring (annulus)
      const r2 = randInt(rng, 1, r - 1);
      const outerArea = Math.round(r * r * 3.14 * 100) / 100;
      const innerArea = Math.round(r2 * r2 * 3.14 * 100) / 100;
      const ringArea = Math.round((outerArea - innerArea) * 100) / 100;
      return {
        type: "area",
        expression: `바깥 반지름 ${r}cm, 안쪽 반지름 ${r2}cm인 고리 모양의 넓이는? (원주율 3.14)`,
        answer: ringArea,
        steps: [
          `바깥 원: ${r}² × 3.14 = ${outerArea}cm²`,
          `안쪽 원: ${r2}² × 3.14 = ${innerArea}cm²`,
          `고리 넓이: ${outerArea} - ${innerArea} = ${ringArea}cm²`,
        ],
        unit: "원의 넓이",
        numbers: [r, r2],
      };
    }
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
  } else if (type === "circle_circumference") {
    const rMax = difficulty === 1 ? 5 : difficulty === 3 ? 20 : 10;
    const r = randInt(rng, 2, rMax);
    const circumference = Math.round(2 * r * 3.14 * 100) / 100;
    return {
      type: "area",
      expression: `반지름 ${r}cm인 원의 둘레는? (원주율 3.14)`,
      answer: circumference,
      steps: [
        `원의 둘레 = 2 × 반지름 × 3.14`,
        `2 × ${r} × 3.14 = ${circumference}cm`,
      ],
      unit: "원의 넓이",
      numbers: [r],
    };
  } else if (type === "proportion_word") {
    const aMax = difficulty === 1 ? 4 : difficulty === 3 ? 10 : 6;
    const mulMax = difficulty === 1 ? 3 : difficulty === 3 ? 8 : 5;
    const a = randInt(rng, 2, aMax);
    const b = randInt(rng, 2, aMax);
    const multiplier = randInt(rng, 2, mulMax);
    if (difficulty === 3) {
      // Multi-step word problem
      const pricePerItem = b * 10;
      const totalItems = a * multiplier;
      const discount = pickOne(rng, [10, 15, 20, 25]);
      const totalPrice = pricePerItem * multiplier;
      const discounted = Math.round((totalPrice * (100 - discount)) / 100);
      return {
        type: "proportion",
        expression: `사탕 ${a}개에 ${pricePerItem}원입니다. ${totalItems}개를 사고 ${discount}% 할인 받으면 얼마?`,
        answer: discounted,
        steps: [
          `${totalItems}개 가격: ${pricePerItem} × ${multiplier} = ${totalPrice}원`,
          `${discount}% 할인: ${totalPrice} × ${100 - discount}/100 = ${discounted}원`,
        ],
        unit: "비례식",
        numbers: [a, pricePerItem, multiplier, discount],
      };
    }
    return {
      type: "proportion",
      expression: `사탕 ${a}개에 ${b * 10}원이면, 사탕 ${a * multiplier}개는 얼마?`,
      answer: b * 10 * multiplier,
      steps: [
        `${a}개 : ${b * 10}원 = ${a * multiplier}개 : ?원`,
        `? = ${b * 10} × ${multiplier} = ${b * 10 * multiplier}원`,
      ],
      unit: "비례식",
      numbers: [a, b * 10, multiplier],
    };
  } else if (type === "proportion") {
    const propMax = difficulty === 1 ? 5 : difficulty === 3 ? 15 : 8;
    const a = randInt(rng, 2, propMax);
    const b = randInt(rng, 2, propMax);
    const c = randInt(rng, 2, propMax);
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
    const itemsMin = difficulty === 1 ? 3 : difficulty === 3 ? 5 : 3;
    const itemsMax = difficulty === 1 ? 4 : difficulty === 3 ? 8 : 6;
    const items = randInt(rng, itemsMin, itemsMax);
    const chooseMax = difficulty === 1 ? 2 : difficulty === 3 ? 4 : 3;
    const choose = randInt(rng, 1, Math.min(items - 1, chooseMax));
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
    const vMax = difficulty === 1 ? 5 : difficulty === 3 ? 20 : 10;
    const w = randInt(rng, 2, vMax);
    const h = randInt(rng, 2, vMax);
    const d = randInt(rng, 2, vMax);
    if (difficulty === 3) {
      // Complex: volume with missing dimension
      const volume = w * h * d;
      return {
        type: "volume",
        expression: `직육면체의 부피가 ${volume}cm³이고 가로 ${w}cm, 세로 ${h}cm일 때 높이는?`,
        answer: d,
        steps: [
          `높이 = 부피 ÷ (가로 × 세로)`,
          `${volume} ÷ (${w} × ${h}) = ${volume} ÷ ${w * h} = ${d}cm`,
        ],
        unit: "직육면체의 부피",
        numbers: [w, h, d],
      };
    }
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
  difficulty: 1 | 2 | 3 = 2,
): MathEntry[] {
  const rng = seededRandom(seed);
  const problems: MathEntry[] = [];

  const gen = (r: () => number): MathEntry => {
    switch (grade) {
      case 1:
        return generateGrade1Math(r, difficulty);
      case 2:
        return generateGrade2Math(r, difficulty);
      case 3:
        return generateGrade3Math(r, difficulty);
      case 4:
        return generateGrade4Math(r, difficulty);
      case 5:
        return generateGrade5Math(r, semester, difficulty);
      case 6:
        return generateGrade6Math(r, difficulty);
      default:
        return generateGrade1Math(r, difficulty);
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
  difficulty: 1 | 2 | 3 = 2,
): MathEntry[] {
  return generateMathProblems(
    grade,
    800,
    dayOfYear * 1000 + grade,
    semester,
    difficulty,
  );
}
