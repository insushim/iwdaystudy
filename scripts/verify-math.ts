/**
 * 수학 문항 정답 기계검증 하네스.
 * 생성기(전 학년·학기·난이도 × 다수 시드)와 정적 gradeN 수학 데이터를
 * expression 파싱·독립 재계산으로 전수 검증한다.
 * 실행: npx tsx scripts/verify-math.ts
 */
import { generateMathProblems } from "../src/lib/curriculum/generators/math-generator";
import type { MathEntry } from "../src/types/curriculum";
import { grade1MathData } from "../src/lib/curriculum/grade1";
import { grade2MathData } from "../src/lib/curriculum/grade2";
import { grade3MathData } from "../src/lib/curriculum/grade3";
import { grade4MathData } from "../src/lib/curriculum/grade4";
import { grade5MathData } from "../src/lib/curriculum/grade5";
import { grade6MathData } from "../src/lib/curriculum/grade6";

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const lcm = (a: number, b: number) => (a * b) / gcd(a, b);

interface Defect {
  source: string;
  kind: string;
  expression: string;
  answer: unknown;
  expected: unknown;
  detail?: string;
}
const defects: Defect[] = [];
const unvalidated = new Map<string, { count: number; example: string }>();
let validatedCount = 0;

function flag(source: string, kind: string, e: MathEntry, expected: unknown, detail?: string) {
  defects.push({ source, kind, expression: e.expression ?? "", answer: e.answer, expected, detail });
}

/** "3 × 4 + 2 = ?" 류 순수 산술식 평가 */
function evalArithmetic(exprPart: string): number | null {
  if (exprPart.includes("/")) return null; // 분수식은 evalFracExpr 전담
  const s = exprPart.replace(/×/g, "*").replace(/÷/g, "/").replace(/,/g, "");
  if (!/^[\d\s+\-*/().]+$/.test(s) || !/\d/.test(s)) return null;
  try {
    const v = Function(`"use strict"; return (${s});`)();
    return typeof v === "number" && isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/** 분수 토큰 "a/b" 파싱 (공백 허용) */
const FRAC = "(\\d+)\\s*/\\s*(\\d+)";

// ── 정밀 유리수 평가기: "3/5 × 2/7 ÷ 6/35", "1/4 + 1/4", "6 ÷ 3/4" 등 ──
interface Q {
  n: number;
  d: number;
}
const qnorm = (f: Q): Q => {
  const g = gcd(f.n, f.d) || 1;
  return { n: f.n / g, d: f.d / g };
};
function evalFracExpr(expr: string): { value: Q; denoms: number[]; hasMulDiv: boolean; addSubOnly: boolean } | null {
  const tokens = expr.match(/\d+\/\d+|\d+(?:\.\d+)?|[+\-×÷]/g);
  if (!tokens || tokens.join(" ") !== expr.replace(/\s+/g, " ").trim()) return null;
  if (tokens.some((t) => /^\d+\.\d+$/.test(t))) return null;
  if (!tokens.some((t) => t.includes("/"))) return null; // 분수 없는 식은 대상 아님
  const denoms: number[] = [];
  let hasMulDiv = false;
  const terms: Q[] = [];
  const addOps: string[] = [];
  let cur: Q | null = null;
  let pendingOp: string | null = null;
  for (const t of tokens) {
    if (t === "+" || t === "-") {
      if (cur == null) return null;
      terms.push(cur);
      addOps.push(t);
      cur = null;
      pendingOp = null;
    } else if (t === "×" || t === "÷") {
      hasMulDiv = true;
      pendingOp = t;
    } else {
      const m = t.match(/^(\d+)\/(\d+)$/);
      const f: Q = m ? { n: Number(m[1]), d: Number(m[2]) } : { n: Number(t), d: 1 };
      if (m) denoms.push(Number(m[2]));
      if (cur == null) cur = f;
      else if (pendingOp === "×") cur = qnorm({ n: cur.n * f.n, d: cur.d * f.d });
      else if (pendingOp === "÷") cur = qnorm({ n: cur.n * f.d, d: cur.d * f.n });
      else return null;
      pendingOp = null;
    }
  }
  if (cur == null) return null;
  terms.push(cur);
  let value = terms[0];
  for (let i = 0; i < addOps.length; i++) {
    const b = terms[i + 1];
    value = qnorm(
      addOps[i] === "+"
        ? { n: value.n * b.d + b.n * value.d, d: value.d * b.d }
        : { n: value.n * b.d - b.n * value.d, d: value.d * b.d },
    );
  }
  return { value, denoms, hasMulDiv, addSubOnly: !hasMulDiv };
}

function checkEntry(source: string, e: MathEntry) {
  const expr = (e.expression ?? "").trim();
  const ans = Number(e.answer);
  let m: RegExpMatchArray | null;

  // 0) 역산(?로 시작)·보기범례 등 검증 제외 대상
  if (expr.startsWith("?")) return skip(source, e, "reverse");

  // 0.5) 일반 분수식 — 주석(분모=K / 기약분수) 규약대로 정답 검증
  {
    let core = expr;
    let annot = "";
    const am = expr.match(/^(.*?)\s*=\s*\?\s*\(([^()]*)\)\s*$/);
    const am2 = !am && expr.match(/^(.*?)\s*=\s*\?\s*$/);
    if (am) {
      core = am[1].trim();
      annot = am[2];
    } else if (am2) {
      core = am2[1].trim();
    }
    if (!/[가-힣?=]/.test(core) && core.includes("/")) {
      const fe = evalFracExpr(core);
      if (fe) {
        const { value } = fe;
        if (value.n < 0) flag(source, "negative-result", e, `${value.n}/${value.d}`, "초등 범위 밖 음수 결과");
        const dm = annot.match(/분모\s*=\s*(\d+)/);
        if (dm) {
          const K = Number(dm[1]);
          const expected = (value.n * K) / value.d;
          if (!Number.isInteger(expected) || ans !== expected)
            flag(source, "fraction-annot-denom-wrong", e, expected);
        } else if (/기약/.test(annot)) {
          if (ans !== value.n) flag(source, "fraction-annot-reduced-wrong", e, value.n);
        } else if (/분자만/.test(annot)) {
          flag(source, "fraction-annot-ambiguous", e, value.n, "분자만 입력인데 기준 분모 명시 없음");
        } else if (value.d === 1) {
          if (ans !== value.n) flag(source, "fraction-int-wrong", e, value.n);
        } else {
          flag(source, "fraction-no-format", e, `${value.n}/${value.d}`, "결과가 분수인데 답 형식 안내 없음");
        }
        validatedCount++;
        return;
      }
    }
  }

  // 1) 분수 덧셈/뺄셈 (분자만 입력, 분모=K 명시 여부 구분)
  m = expr.match(new RegExp(`^${FRAC}\\s*([+\\-])\\s*${FRAC}(?:\\s*([+\\-])\\s*${FRAC})?\\s*=\\s*\\?\\s*\\((.*분자만.*)\\)$`));
  if (m) {
    const [, n1, d1, op1, n2, d2, op2, n3, d3, paren] = m;
    let num = Number(n1) * lcm2([Number(d1), Number(d2), d3 ? Number(d3) : 1]) / Number(d1);
    const L = lcm2([Number(d1), Number(d2), d3 ? Number(d3) : 1]);
    num = Number(n1) * (L / Number(d1));
    num = op1 === "+" ? num + Number(n2) * (L / Number(d2)) : num - Number(n2) * (L / Number(d2));
    if (op2 && n3 && d3) num = op2 === "+" ? num + Number(n3) * (L / Number(d3)) : num - Number(n3) * (L / Number(d3));
    if (num < 0) flag(source, "negative-result", e, `${num}/${L}`, "초등 범위 밖 음수 결과");
    const denomStated = paren.match(/분모\s*=\s*(\d+)/);
    if (denomStated) {
      const K = Number(denomStated[1]);
      const expected = (num * K) / L;
      if (!Number.isInteger(expected) || ans !== expected)
        flag(source, "fraction-addsub-wrong", e, expected);
    } else {
      const g = gcd(num, L);
      const reducedN = num / g;
      if (ans !== reducedN) {
        if (ans === num && g > 1) flag(source, "fraction-not-reduced-ambiguous", e, reducedN, `표기답 ${ans}/${L}는 기약 아님(기약=${reducedN}/${L / g})`);
        else flag(source, "fraction-addsub-wrong", e, reducedN);
      }
    }
    validatedCount++;
    return;
  }

  // 2) 분수 곱셈/나눗셈 (분자만 입력)
  m = expr.match(new RegExp(`^${FRAC}\\s*([×÷])\\s*${FRAC}\\s*=\\s*\\?\\s*\\((.*분자만.*)\\)$`));
  if (m) {
    const [, n1, d1, op, n2, d2] = m;
    const rn = op === "×" ? Number(n1) * Number(n2) : Number(n1) * Number(d2);
    const rd = op === "×" ? Number(d1) * Number(d2) : Number(d1) * Number(n2);
    const g = gcd(rn, rd);
    if (ans !== rn / g) flag(source, "fraction-muldiv-wrong", e, rn / g);
    validatedCount++;
    return;
  }

  // 3) 약분: "N/M을 약분하면(기약분수로 나타내면)? / …분자는?"
  m = expr.match(new RegExp(`^${FRAC}\\s*[을를]?\\s*(약분하면|기약분수로 나타내면)`));
  if (m) {
    const [, n, d] = m;
    const g = gcd(Number(n), Number(d));
    const expected = Number(n) / g;
    if (ans !== expected) flag(source, "simplify-wrong", e, expected, `${n}/${d} 기약 분자=${expected}`);
    if (g === 1) flag(source, "simplify-trivial", e, expected, "이미 기약인 분수를 약분하라고 물음");
    validatedCount++;
    return;
  }

  // 4) 통분 공통분모
  m = expr.match(new RegExp(`^${FRAC}[과와]\\s*${FRAC}의 통분`));
  if (m) {
    const [, , d1, , d2] = m;
    if (ans !== lcm(Number(d1), Number(d2))) flag(source, "common-denom-wrong", e, lcm(Number(d1), Number(d2)));
    validatedCount++;
    return;
  }

  // 5) 분수→소수
  m = expr.match(new RegExp(`^${FRAC}\\s*[을를]?\\s*소수로 나타내면`));
  if (m) {
    const [, n, d] = m;
    const exact = Number(n) / Number(d);
    if (Math.abs(ans - exact) > 1e-9) flag(source, "frac-to-decimal-wrong", e, exact);
    validatedCount++;
    return;
  }

  // 6) 백분율: "N명 중 M명은 전체의 몇 %?" / "N원의 P%는 얼마?"
  m = expr.match(/^(\d+)[^\d]*중 (\d+)[^\d]*몇\s*%/);
  if (m) {
    const exact = (Number(m[2]) / Number(m[1])) * 100;
    if (Math.abs(ans - exact) > 1e-9)
      flag(source, "percent-wrong", e, exact, Number.isInteger(exact) ? undefined : "정수 아닌 백분율을 반올림해 출제");
    validatedCount++;
    return;
  }
  m = expr.match(/^(\d+)원의 (\d+)%는/);
  if (m) {
    const exact = (Number(m[1]) * Number(m[2])) / 100;
    if (Math.abs(ans - exact) > 1e-9) flag(source, "percent-of-wrong", e, exact);
    validatedCount++;
    return;
  }

  // 7) 몫/나머지
  m = expr.match(/^(\d+)\s*÷\s*(\d+)\s*=\s*\?(.*)$/);
  if (m) {
    const a = Number(m[1]), b = Number(m[2]), tail = m[3];
    if (/나머지/.test(tail) && !/몫/.test(tail)) {
      if (ans !== a % b) flag(source, "remainder-wrong", e, a % b);
    } else if (/몫/.test(tail)) {
      if (ans !== Math.floor(a / b)) flag(source, "quotient-wrong", e, Math.floor(a / b));
    } else {
      if (a % b === 0 ? ans !== a / b : Math.abs(ans - a / b) > 1e-9)
        flag(source, "division-wrong", e, a / b, a % b !== 0 ? "나누어떨어지지 않는 ÷를 단답 출제" : undefined);
    }
    validatedCount++;
    return;
  }

  // 8) 순수 산술 "... = ?"
  m = expr.match(/^(.+?)=\s*\?/);
  if (m && !/[가-힣?]/.test(m[1])) {
    const v = evalArithmetic(m[1]);
    if (v != null) {
      if (Math.abs(ans - v) > 1e-9) flag(source, "arithmetic-wrong", e, v);
      validatedCount++;
      return;
    }
  }
  // 8b) 산술식이 = ? 없이 그대로 온 경우 ("100 - 3 × (8 + 12)")
  if (!/[가-힣]/.test(expr)) {
    const v = evalArithmetic(expr.replace(/=.*$/, ""));
    if (v != null) {
      if (Math.abs(ans - v) > 1e-9) flag(source, "arithmetic-wrong", e, v);
      validatedCount++;
      return;
    }
  }

  // 9) N의 약수의 개수
  m = expr.match(/^(\d+)의 약수의 개수/);
  if (m) {
    const n = Number(m[1]);
    let c = 0;
    for (let i = 1; i <= n; i++) if (n % i === 0) c++;
    if (ans !== c) flag(source, "factor-count-wrong", e, c);
    validatedCount++;
    return;
  }

  // 10) 최대공약수/최소공배수
  m = expr.match(/^(\d+)[과와]\s*(\d+)의 (최대공약수|최소공배수)/);
  if (m) {
    const expected = m[3] === "최대공약수" ? gcd(Number(m[1]), Number(m[2])) : lcm(Number(m[1]), Number(m[2]));
    if (ans !== expected) flag(source, "gcd-lcm-wrong", e, expected);
    validatedCount++;
    return;
  }

  // 11) 간단한 자연수의 비
  m = expr.match(/^(\d+)\s*:\s*(\d+)(?:\s*:\s*(\d+))?[를을]? 가장 간단한/);
  if (m) {
    const a = Number(m[1]), b = Number(m[2]), c = m[3] ? Number(m[3]) : null;
    const g = c == null ? gcd(a, b) : gcd(gcd(a, b), c);
    if (ans !== a / g) flag(source, "ratio-simplify-wrong", e, a / g);
    if (!/입력|첫째/.test(expr)) flag(source, "ratio-ambiguous-format", e, a / g, "무엇을 입력할지 명시 없음");
    validatedCount++;
    return;
  }

  // 12) 비례식 a : b = c : ?
  m = expr.match(/^(\d+)\s*:\s*(\d+)\s*=\s*(\d+)\s*:\s*\?/);
  if (m) {
    const expected = (Number(m[2]) * Number(m[3])) / Number(m[1]);
    if (Math.abs(ans - expected) > 1e-9)
      flag(source, "proportion-wrong", e, expected, Number.isInteger(expected) ? undefined : "정수 아닌 비례항");
    validatedCount++;
    return;
  }

  // 13) 같은 분모 분수 비교/순서 ("...중 더 큰 분수의 분자는?" / "...가장 작은 분수의 분자는?")
  const fracList = [...expr.matchAll(new RegExp(FRAC, "g"))].map((f) => [Number(f[1]), Number(f[2])]);
  if (fracList.length >= 2 && /(더 큰|가장 큰|가장 작은|더 작은) 분수의 분자/.test(expr)) {
    const vals = fracList.map(([n, d]) => n / d);
    const target = /(더 큰|가장 큰)/.test(expr) ? Math.max(...vals) : Math.min(...vals);
    const idx = vals.indexOf(target);
    if (ans !== fracList[idx][0]) flag(source, "fraction-compare-wrong", e, fracList[idx][0]);
    validatedCount++;
    return;
  }
  // 13b) 다른 분모 비교 (1: x, 2: y, 0: 같음)
  if (fracList.length === 2 && /중 더 큰 분수는\?/.test(expr)) {
    const [a, b] = fracList.map(([n, d]) => n / d);
    const expected = a > b ? 1 : a < b ? 2 : 0;
    if (ans !== expected) flag(source, "fraction-compare2-wrong", e, expected);
    validatedCount++;
    return;
  }

  // 14) 넓이/부피/둘레/겉넓이 정형 템플릿
  m = expr.match(/^가로 (\d+(?:\.\d+)?)cm, 세로 (\d+(?:\.\d+)?)cm 직사각형의 넓이/);
  if (m) { const v = Number(m[1]) * Number(m[2]); if (ans !== v) flag(source, "rect-area-wrong", e, v); validatedCount++; return; }
  m = expr.match(/^가로 (\d+)cm, 세로 (\d+)cm, 높이 (\d+)cm 직육면체의 부피/);
  if (m) { const v = Number(m[1]) * Number(m[2]) * Number(m[3]); if (ans !== v) flag(source, "volume-wrong", e, v); validatedCount++; return; }
  m = expr.match(/^가로 (\d+)cm, 세로 (\d+)cm, 높이 (\d+)cm 직육면체의 겉넓이/);
  if (m) {
    const [w, h, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const v = 2 * (w * h + h * d + w * d);
    if (ans !== v) flag(source, "surface-wrong", e, v);
    validatedCount++;
    return;
  }
  m = expr.match(/^반지름 (\d+)cm인 원의 (넓이|둘레)는\? \(원주율 3.14\)/);
  if (m) {
    const r = Number(m[1]);
    const v = m[2] === "넓이" ? Math.round(r * r * 3.14 * 100) / 100 : Math.round(2 * r * 3.14 * 100) / 100;
    if (Math.abs(ans - v) > 1e-9) flag(source, "circle-wrong", e, v);
    validatedCount++;
    return;
  }
  m = expr.match(/^밑면 반지름 (\d+)cm, 높이 (\d+)cm인 원기둥의 부피/);
  if (m) {
    const v = Math.round(Number(m[1]) ** 2 * 3.14 * Number(m[2]) * 100) / 100;
    if (Math.abs(ans - v) > 1e-9) flag(source, "cylinder-wrong", e, v);
    validatedCount++;
    return;
  }

  // 15) 평균
  m = expr.match(/^시험 점수가 ([\d, ]+)점일 때 평균/);
  if (m) {
    const vals = m[1].split(",").map((s) => Number(s.trim()));
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    if (Math.abs(ans - avg) > 1e-9) flag(source, "average-wrong", e, avg, Number.isInteger(avg) ? undefined : "정수 아닌 평균");
    validatedCount++;
    return;
  }

  // 16) 서술형 분수 덧셈 "…의 a/b을 먹고, c/b을 더 먹었습니다"
  m = expr.match(new RegExp(`${FRAC}[을를] 먹고,?\\s*${FRAC}[을를] 더 먹었습니다.*분자만`));
  if (m) {
    const [, n1, d1, n2, d2] = m;
    if (d1 !== d2) flag(source, "wordfrac-denom-mismatch", e, null);
    else if (ans !== Number(n1) + Number(n2)) flag(source, "wordfrac-wrong", e, Number(n1) + Number(n2));
    validatedCount++;
    return;
  }

  // 17) 몫은? (등호 없는 형태)
  m = expr.match(/^(\d+) ÷ (\d+)의 몫은\?$/);
  if (m) {
    const q = Math.floor(Number(m[1]) / Number(m[2]));
    if (ans !== q) flag(source, "quotient-wrong", e, q);
    validatedCount++;
    return;
  }

  // 18) 문장형 덧셈/뺄셈/곱셈 템플릿
  m = expr.match(/(\d+)개 있었는데 (\d+)개를 더 받았습니다/);
  if (m) { const v = Number(m[1]) + Number(m[2]); if (ans !== v) flag(source, "word-add-wrong", e, v); validatedCount++; return; }
  m = expr.match(/(\d+)개 있었는데 (\d+)개를 먹었습니다/);
  if (m) { const v = Number(m[1]) - Number(m[2]); if (ans !== v) flag(source, "word-sub-wrong", e, v); validatedCount++; return; }
  m = expr.match(/(\d+)(?:개|명|마리) 있었는데 (\d+)(?:개|명|마리)[가이] (?:없어졌습니다|전학을 갔습니다)/);
  if (m) { const v = Number(m[1]) - Number(m[2]); if (ans !== v) flag(source, "word-sub-wrong", e, v); validatedCount++; return; }
  m = expr.match(/^한 상자에 (\d+)개씩 (\d+)상자/);
  if (m) { const v = Number(m[1]) * Number(m[2]); if (ans !== v) flag(source, "word-mul-wrong", e, v); validatedCount++; return; }
  m = expr.match(/사과 (\d+)개와 (\d+)개를 합하면/);
  if (m) { const v = Number(m[1]) + Number(m[2]); if (ans !== v) flag(source, "word-add-wrong", e, v); validatedCount++; return; }
  m = expr.match(/^(\d+)개의 사탕을 (\d+)명에게 똑같이 나누면/);
  if (m) {
    const v = Number(m[1]) / Number(m[2]);
    if (!Number.isInteger(v) || ans !== v) flag(source, "word-div-wrong", e, v);
    validatedCount++;
    return;
  }

  // 19) 각도
  m = expr.match(/^두 각 (\d+)°와 (\d+)°의 합을 180°에서 빼면/);
  if (m) { const v = 180 - Number(m[1]) - Number(m[2]); if (ans !== v) flag(source, "angle-wrong", e, v); validatedCount++; return; }
  m = expr.match(/^(\d+)°에서 (\d+)°를 빼면/);
  if (m) { const v = Number(m[1]) - Number(m[2]); if (ans !== v) flag(source, "angle-wrong", e, v); validatedCount++; return; }
  m = expr.match(/^두 각이 (\d+)°와 (\d+)°일 때 합은|^(\d+)°와 (\d+)°의 합/);
  if (m) {
    const a = Number(m[1] ?? m[3]);
    const b = Number(m[2] ?? m[4]);
    if (ans !== a + b) flag(source, "angle-wrong", e, a + b);
    validatedCount++;
    return;
  }

  // 20) 수 크기 비교 범례형 "X이 a개, Y이 b개 … (1: X, 2: Y, 0: 같음)"
  m = expr.match(/(\d+)개, .*?(\d+)개 있습니다. 더 많은 것은\? \(1: .*2: .*0: 같음\)/);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    const v = a > b ? 1 : a < b ? 2 : 0;
    if (ans !== v) flag(source, "compare-legend-wrong", e, v);
    validatedCount++;
    return;
  }

  // 21) 뛰어 세기
  m = expr.match(/^(\d+)부터 (\d+)씩 (\d+)번 뛰어 세면/);
  if (m) {
    const v = Number(m[1]) + Number(m[2]) * Number(m[3]);
    if (ans !== v) flag(source, "skip-count-wrong", e, v);
    validatedCount++;
    return;
  }

  // 22) 길이
  m = expr.match(/길이가 (\d+)cm, .*?(\d+)cm입니다. 몇 cm 차이/);
  if (m) { const v = Math.abs(Number(m[1]) - Number(m[2])); if (ans !== v) flag(source, "length-diff-wrong", e, v); validatedCount++; return; }
  m = expr.match(/^(\d+)cm \+ (\d+)cm = \?cm$/);
  if (m) { const v = Number(m[1]) + Number(m[2]); if (ans !== v) flag(source, "length-add-wrong", e, v); validatedCount++; return; }

  // 23) 사다리꼴/평행사변형/삼각형 넓이
  m = expr.match(/^윗변 (\d+)cm, 아랫변 (\d+)cm, 높이 (\d+)cm인 사다리꼴의 넓이/);
  if (m) {
    const v = ((Number(m[1]) + Number(m[2])) * Number(m[3])) / 2;
    if (ans !== v) flag(source, "trapezoid-wrong", e, v);
    validatedCount++;
    return;
  }
  m = expr.match(/^밑변 (\d+)cm, 높이 (\d+)cm인 평행사변형의 넓이/);
  if (m) { const v = Number(m[1]) * Number(m[2]); if (ans !== v) flag(source, "parallelogram-wrong", e, v); validatedCount++; return; }
  m = expr.match(/^밑변 (\d+)cm, 높이 (\d+)cm인 삼각형의 넓이/);
  if (m) {
    const v = (Number(m[1]) * Number(m[2])) / 2;
    if (ans !== v) flag(source, "triangle-wrong", e, v);
    validatedCount++;
    return;
  }

  // 24) 수열 규칙 (등차/등비/피보나치 자동 판별)
  m = expr.match(/^([\d, ]+), \? 에서 \?에 알맞은 수는\?/);
  if (m) {
    const seq = m[1].split(",").map((s) => Number(s.trim()));
    if (seq.length >= 3) {
      const d0 = seq[1] - seq[0];
      const isArith = seq.every((v, i) => i === 0 || v - seq[i - 1] === d0);
      const r0 = seq[1] / seq[0];
      const isGeom = seq.every((v, i) => i === 0 || v / seq[i - 1] === r0);
      const isFib = seq.length >= 3 && seq.every((v, i) => i < 2 || v === seq[i - 1] + seq[i - 2]);
      let v: number | null = null;
      if (isArith) v = seq[seq.length - 1] + d0;
      else if (isGeom) v = seq[seq.length - 1] * r0;
      else if (isFib) v = seq[seq.length - 1] + seq[seq.length - 2];
      if (v != null) {
        if (ans !== v) flag(source, "sequence-wrong", e, v, "수열 규칙과 정답 불일치");
        validatedCount++;
        return;
      }
    }
    return skip(source, e, "sequence-unknown-rule");
  }

  // 25) 서술형 소수 (단가 × 개수)
  m = expr.match(/한 개에 (\d+(?:\.\d+)?)L입니다. (\d+)개면/);
  if (m) {
    const v = Math.round(Number(m[1]) * Number(m[2]) * 100) / 100;
    if (Math.abs(ans - v) > 1e-9) flag(source, "decimal-word-wrong", e, v);
    validatedCount++;
    return;
  }

  // 26) 단위변환
  m = expr.match(/= (\d+)m²는 몇 cm²/);
  if (m) { const v = Number(m[1]) * 10000; if (ans !== v) flag(source, "area-convert-wrong", e, v); validatedCount++; return; }
  m = expr.match(/^시속 (\d+)km는 분속 몇 m/);
  if (m) {
    const v = (Number(m[1]) * 1000) / 60;
    if (!Number.isInteger(v) || ans !== v) flag(source, "speed-convert-wrong", e, v);
    validatedCount++;
    return;
  }

  // 27) 배수 판별
  m = expr.match(/^(\d+)[은는]\(?는?\)? ?(\d+)의 배수인가요\? \(1: 예, 2: 아니오\)/);
  if (m) {
    const v = Number(m[1]) % Number(m[2]) === 0 ? 1 : 2;
    if (ans !== v) flag(source, "multiple-check-wrong", e, v);
    validatedCount++;
    return;
  }

  // 28) 시각 (H*100+M 인코딩)
  m = expr.match(/^(\d+)시 (?:정각|(\d+)분)에서 (\d+)분 후는/);
  if (m) {
    const total = Number(m[1]) * 60 + Number(m[2] ?? 0) + Number(m[3]);
    const expH = Math.floor(total / 60) % 12 || 12;
    const expected = expH * 100 + (total % 60);
    if (ans !== expected) flag(source, "time-wrong", e, expected);
    validatedCount++;
    return;
  }

  // 29) 단위변환: cm↔m, m↔km, g↔kg, mL↔L, 넓이 cm²↔m²
  m = expr.match(/^(\d+)cm는 몇 m\?$/);
  if (m) { const v = Number(m[1]) / 100; if (Math.abs(ans - v) > 1e-9) flag(source, "unit-convert-wrong", e, v); validatedCount++; return; }
  m = expr.match(/^(\d+)cm는 몇 m 몇 cm\? \(m 부분의 수만 입력\)$/);
  if (m) { const v = Math.floor(Number(m[1]) / 100); if (ans !== v) flag(source, "unit-convert-wrong", e, v); validatedCount++; return; }
  m = expr.match(/^(\d+)m (\d+)cm는 모두 몇 cm\?$/);
  if (m) { const v = Number(m[1]) * 100 + Number(m[2]); if (ans !== v) flag(source, "unit-convert-wrong", e, v); validatedCount++; return; }
  m = expr.match(/^(\d+)m는 몇 km\?$/);
  if (m) { const v = Number(m[1]) / 1000; if (Math.abs(ans - v) > 1e-9) flag(source, "unit-convert-wrong", e, v); validatedCount++; return; }
  m = expr.match(/^(\d+)m는 몇 km 몇 m\? \(km 부분의 수만 입력\)$/);
  if (m) { const v = Math.floor(Number(m[1]) / 1000); if (ans !== v) flag(source, "unit-convert-wrong", e, v); validatedCount++; return; }
  m = expr.match(/^(\d+)km (\d+)m는 모두 몇 m\?$/);
  if (m) { const v = Number(m[1]) * 1000 + Number(m[2]); if (ans !== v) flag(source, "unit-convert-wrong", e, v); validatedCount++; return; }
  m = expr.match(/^(\d+)g은 몇 kg\?$/);
  if (m) { const v = Number(m[1]) / 1000; if (Math.abs(ans - v) > 1e-9) flag(source, "unit-convert-wrong", e, v); validatedCount++; return; }
  m = expr.match(/^(\d+)g은 몇 kg 몇 g\? \(kg 부분의 수만 입력\)$/);
  if (m) { const v = Math.floor(Number(m[1]) / 1000); if (ans !== v) flag(source, "unit-convert-wrong", e, v); validatedCount++; return; }
  m = expr.match(/^(\d+)kg (\d+)g은 모두 몇 g\?$/);
  if (m) { const v = Number(m[1]) * 1000 + Number(m[2]); if (ans !== v) flag(source, "unit-convert-wrong", e, v); validatedCount++; return; }
  m = expr.match(/^(\d+)mL는 몇 L\?$/);
  if (m) { const v = Number(m[1]) / 1000; if (Math.abs(ans - v) > 1e-9) flag(source, "unit-convert-wrong", e, v); validatedCount++; return; }
  m = expr.match(/^(\d+)mL는 몇 L 몇 mL\? \(L 부분의 수만 입력\)$/);
  if (m) { const v = Math.floor(Number(m[1]) / 1000); if (ans !== v) flag(source, "unit-convert-wrong", e, v); validatedCount++; return; }
  m = expr.match(/^(\d+)m × (\d+)m = \d+m²는 몇 cm²\?$/);
  if (m) { const v = Number(m[1]) * Number(m[2]) * 10000; if (ans !== v) flag(source, "unit-convert-wrong", e, v); validatedCount++; return; }

  // 30) 각도: 직각삼각형/삼각형/사각형 나머지 각
  m = expr.match(/^직각삼각형의 한 각이 (\d+)°일 때 나머지 한 각은\?$/);
  if (m) { const v = 90 - Number(m[1]); if (ans !== v) flag(source, "angle-wrong", e, v); validatedCount++; return; }
  m = expr.match(/^삼각형 두 각이 (\d+)°와 (\d+)°일 때 나머지 한 각은\?$/);
  if (m) { const v = 180 - Number(m[1]) - Number(m[2]); if (ans !== v) flag(source, "angle-wrong", e, v); validatedCount++; return; }
  m = expr.match(/^사각형의 세 각이 (\d+)°, (\d+)°, (\d+)°일 때 나머지 한 각은\?$/);
  if (m) { const v = 360 - Number(m[1]) - Number(m[2]) - Number(m[3]); if (ans !== v) flag(source, "angle-wrong", e, v); validatedCount++; return; }

  // 31) 넓이: 서술형 직사각형 / 복합도형(잘라낸 넓이)
  m = expr.match(/가로가 (\d+)m, 세로가 (\d+)m입니다\. 넓이는 몇 m²\?$/);
  if (m) { const v = Number(m[1]) * Number(m[2]); if (ans !== v) flag(source, "word-area-wrong", e, v); validatedCount++; return; }
  m = expr.match(/^큰 직사각형 가로 (\d+)cm, 세로 (\d+)cm에서 가로 (\d+)cm, 세로 (\d+)cm를 잘라냈을 때 넓이는\?$/);
  if (m) {
    const v = Number(m[1]) * Number(m[2]) - Number(m[3]) * Number(m[4]);
    if (ans !== v) flag(source, "composite-area-wrong", e, v);
    validatedCount++;
    return;
  }

  // 32) 경우의 수 (조합 nCr)
  m = expr.match(/^(\d+)가지 중 (\d+)가지를 고르는 경우의 수는\?$/);
  if (m) {
    const fact = (x: number): number => (x <= 1 ? 1 : x * fact(x - 1));
    const n = Number(m[1]), r = Number(m[2]);
    const v = fact(n) / (fact(r) * fact(n - r));
    if (ans !== v) flag(source, "combination-wrong", e, v);
    validatedCount++;
    return;
  }

  // 33) 어림하기 (반올림)
  m = expr.match(/^(\d+)을 반올림하여 (십|백|천)의 자리까지 나타내면\?$/);
  if (m) {
    const place = m[2] === "십" ? 10 : m[2] === "백" ? 100 : 1000;
    const v = Math.round(Number(m[1]) / place) * place;
    if (ans !== v) flag(source, "rounding-wrong", e, v);
    validatedCount++;
    return;
  }

  // 34) 크기비교(분수): "A/B과 C/D 중 더 큰 분수는? (1: A/B, 2: C/D, 0: 같음)"
  {
    const qIdx = expr.indexOf("중 더 큰 분수는?");
    if (qIdx !== -1) {
      const prefix = expr.slice(0, qIdx);
      const pFracs = [...prefix.matchAll(new RegExp(FRAC, "g"))].map((f) => [Number(f[1]), Number(f[2])]);
      if (pFracs.length === 2) {
        const [a, b] = pFracs.map(([n, d]) => n / d);
        const expected = a > b ? 1 : a < b ? 2 : 0;
        if (ans !== expected) flag(source, "fraction-compare2-wrong", e, expected);
        validatedCount++;
        return;
      }
    }
  }

  // 35) 순서배열 (정수/소수 나열 — 첫/두 번째, 가장 작은/큰)
  m = expr.match(/^([\d.,\s]+)(?:을|를) (작은|큰) 수부터 나열하면\? \(첫 번째 수는\?\)$/);
  if (m) {
    const nums = m[1].split(",").map((s) => Number(s.trim()));
    const sorted = [...nums].sort((a, b) => a - b);
    const expected = m[2] === "작은" ? sorted[0] : sorted[sorted.length - 1];
    if (ans !== expected) flag(source, "ordering-wrong", e, expected);
    validatedCount++;
    return;
  }
  m = expr.match(/^([\d.,\s]+)(?:을|를) (작은|큰) 수부터 나열할 때 두 번째 수는\?$/);
  if (m) {
    const nums = m[1].split(",").map((s) => Number(s.trim()));
    const sorted = [...nums].sort((a, b) => a - b);
    const ordered = m[2] === "작은" ? sorted : [...sorted].reverse();
    const expected = ordered[1];
    if (ans !== expected) flag(source, "ordering-wrong", e, expected);
    validatedCount++;
    return;
  }
  m = expr.match(/^([\d.,\s]+)(?:을|를) 작은 수부터 나열할 때 가장 (작은|큰) 수는\?$/);
  if (m) {
    const nums = m[1].split(",").map((s) => Number(s.trim()));
    const expected = m[2] === "작은" ? Math.min(...nums) : Math.max(...nums);
    if (Math.abs(ans - expected) > 1e-9) flag(source, "ordering-wrong", e, expected);
    validatedCount++;
    return;
  }

  // 36) 도형: 변/꼭짓점/대칭축 개수
  {
    const SIDE_MAP: Record<string, number> = { 삼각형: 3, 사각형: 4, 오각형: 5, 육각형: 6 };
    const AXIS_MAP: Record<string, number> = { 정삼각형: 3, 정사각형: 4, 정오각형: 5, 정육각형: 6 };
    let mm = expr.match(/^(삼각형|사각형|오각형|육각형)의 (변|꼭짓점)은 몇 개\?$/);
    if (mm) {
      const expected = SIDE_MAP[mm[1]];
      if (ans !== expected) flag(source, "shape-count-wrong", e, expected);
      validatedCount++;
      return;
    }
    mm = expr.match(/^(정삼각형|정사각형|정오각형|정육각형)의 대칭축은 몇 개\?$/);
    if (mm) {
      const expected = AXIS_MAP[mm[1]];
      if (ans !== expected) flag(source, "symmetry-axis-wrong", e, expected);
      validatedCount++;
      return;
    }
  }

  // 37) 서술형: 거스름돈 / 나눗셈(장·개·자루 나누기) / 혼합(두 품목 가격) / 비교(개수 차이)
  m = expr.match(/^(\d+)원짜리 .+?을 (\d+)개 사고 (\d+)원을 냈습니다\. 거스름돈은\?$/);
  if (m) {
    const v = Number(m[3]) - Number(m[1]) * Number(m[2]);
    if (ans !== v) flag(source, "word-change-wrong", e, v);
    validatedCount++;
    return;
  }
  m = expr.match(/(\d+)(?:장|개|자루)[을를] .+?(\d+)(?:명|개)(?:에게|에) 똑같이 (?:나누어 주려고|담으려고|넣으려고) 합니다\./);
  if (m) {
    const dividend = Number(m[1]), divisor = Number(m[2]);
    const v = dividend / divisor;
    if (!Number.isInteger(v) || ans !== v) flag(source, "word-div-wrong", e, v);
    validatedCount++;
    return;
  }
  m = expr.match(/^.+? (\d+)개\(개당 (\d+)원\)와 .+? (\d+)개\(개당 (\d+)원\)의 총 가격은\?$/);
  if (m) {
    const v = Number(m[1]) * Number(m[2]) + Number(m[3]) * Number(m[4]);
    if (ans !== v) flag(source, "word-mixed-wrong", e, v);
    validatedCount++;
    return;
  }
  m = expr.match(/(\d+)개, [^\d]*?(\d+)개 가지고 있습니다\. 누가 몇 개 더 많나요/);
  if (m) {
    const v = Math.abs(Number(m[1]) - Number(m[2]));
    if (ans !== v) flag(source, "word-compare-wrong", e, v);
    validatedCount++;
    return;
  }

  return skip(source, e);
}

function lcm2(nums: number[]) {
  return nums.reduce((a, b) => lcm(a, b), 1);
}

function skip(source: string, e: MathEntry, why = "no-validator") {
  const key = `${source}|${e.unit ?? "?"}|${why}`;
  const cur = unvalidated.get(key);
  if (cur) cur.count++;
  else unvalidated.set(key, { count: 1, example: `${e.expression} => ${e.answer}` });
}

// ── 실행 ──────────────────────────────────────────────
// 생성기: 학년×학기×난이도×시드
for (let grade = 1; grade <= 6; grade++) {
  for (const semester of [1, 2]) {
    for (const difficulty of [1, 2, 3] as const) {
      for (let seed = 1; seed <= 40; seed++) {
        const problems = generateMathProblems(grade, 60, seed * 7919, semester, difficulty);
        for (const p of problems) checkEntry(`gen-g${grade}s${semester}d${difficulty}`, p);
      }
    }
  }
}
// 정적 데이터
const staticData: [string, MathEntry[]][] = [
  ["static-g1", grade1MathData],
  ["static-g2", grade2MathData],
  ["static-g3", grade3MathData],
  ["static-g4", grade4MathData],
  ["static-g5", grade5MathData],
  ["static-g6", grade6MathData],
];
for (const [src, arr] of staticData) for (const e of arr) checkEntry(src, e);

// ── 리포트 ────────────────────────────────────────────
console.log(`\n검증 통과 문항: ${validatedCount}`);
console.log(`결함: ${defects.length}건`);
const byKind = new Map<string, Defect[]>();
for (const d of defects) {
  if (!byKind.has(d.kind)) byKind.set(d.kind, []);
  byKind.get(d.kind)!.push(d);
}
for (const [kind, list] of byKind) {
  console.log(`\n[${kind}] ${list.length}건`);
  const bySource = new Map<string, number>();
  for (const d of list) bySource.set(d.source, (bySource.get(d.source) ?? 0) + 1);
  console.log("  출처:", [...bySource.entries()].map(([s, c]) => `${s}×${c}`).join(", "));
  for (const d of list.slice(0, 5))
    console.log(`  예: "${d.expression}" 표기답=${d.answer} 참답=${d.expected}${d.detail ? ` (${d.detail})` : ""}`);
}
console.log(`\n─ 정적 데이터 결함 전체:`);
for (const d of defects.filter((d) => d.source.startsWith("static")))
  console.log(`  [${d.source}|${d.kind}] "${d.expression}" 표기답=${d.answer} 참답=${d.expected}${d.detail ? ` (${d.detail})` : ""}`);

console.log(`\n─ 미검증(검증기 없음) 유형: ${unvalidated.size}종`);
const sorted = [...unvalidated.entries()].sort((a, b) => b[1].count - a[1].count);
for (const [key, v] of sorted.slice(0, 60)) console.log(`  ${key} ×${v.count} | ${v.example.slice(0, 90)}`);
