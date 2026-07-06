/**
 * 정적 수학 문항(gradeN.ts) 일괄 정정 codemod.
 * - 나머지가 있는 나눗셈 "17 ÷ 5" → "17 ÷ 5의 몫은?" (표기 없이 몫만 정답이던 결함)
 * - 분수식: 결과가 정수가 아니면 답 형식 주석을 달고 정답을 그 형식에 맞게 교정
 *   · ±(통분 필요 포함) → "(분자만 입력, 분모=L)" + 분자 정답
 *   · ×·÷ 포함 → "(기약분수의 분자만 입력)" + 기약 분자 정답
 * - "가장 간단한 …의 비로" → "(첫째 수 입력)" 명시
 * 실행: npx tsx scripts/fix-static-math.ts
 */
import * as fs from "fs";
import * as path from "path";

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const lcm = (a: number, b: number) => (a * b) / gcd(a, b);

interface Frac {
  n: number;
  d: number;
}
const norm = (f: Frac): Frac => {
  const g = gcd(f.n, f.d) || 1;
  return { n: f.n / g, d: f.d / g };
};
const mul = (a: Frac, b: Frac): Frac => norm({ n: a.n * b.n, d: a.d * b.d });
const div = (a: Frac, b: Frac): Frac => norm({ n: a.n * b.d, d: a.d * b.n });
const add = (a: Frac, b: Frac): Frac => norm({ n: a.n * b.d + b.n * a.d, d: a.d * b.d });
const sub = (a: Frac, b: Frac): Frac => norm({ n: a.n * b.d - b.n * a.d, d: a.d * b.d });

/** "3/5 × 2/7 ÷ 6/35" / "1/4 + 1/4" 류 분수식 파싱·평가 (좌→우, ×÷ 우선) */
function parseFracExpr(expr: string): { value: Frac; denoms: number[]; hasMulDiv: boolean } | null {
  const tokens = expr.match(/\d+\/\d+|\d+(?:\.\d+)?|[+\-×÷]/g);
  if (!tokens || tokens.join(" ") !== expr.replace(/\s+/g, " ").trim()) return null;
  if (tokens.some((t) => /^\d+\.\d+$/.test(t))) return null; // 소수식은 대상 아님
  const denoms: number[] = [];
  let hasMulDiv = false;
  const terms: Frac[] = [];
  const addOps: string[] = [];
  let cur: Frac | null = null;
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
      const f: Frac = m ? { n: Number(m[1]), d: Number(m[2]) } : { n: Number(t), d: 1 };
      if (m) denoms.push(Number(m[2]));
      if (cur == null) cur = f;
      else if (pendingOp === "×") cur = mul(cur, f);
      else if (pendingOp === "÷") cur = div(cur, f);
      else return null;
      pendingOp = null;
    }
  }
  if (cur == null) return null;
  terms.push(cur);
  let value = terms[0];
  for (let i = 0; i < addOps.length; i++)
    value = addOps[i] === "+" ? add(value, terms[i + 1]) : sub(value, terms[i + 1]);
  return { value, denoms, hasMulDiv };
}

const files = ["grade3.ts", "grade4.ts", "grade5.ts", "grade6.ts"];
const baseDir = path.join(__dirname, "../src/lib/curriculum");
let totalFixes = 0;

for (const file of files) {
  const fp = path.join(baseDir, file);
  let src = fs.readFileSync(fp, "utf8");
  let fixes = 0;

  src = src.replace(
    /expression: "([^"]+)",(\s*)answer: ([\d.]+),/g,
    (whole, expr: string, ws: string, ansStr: string) => {
      const ans = Number(ansStr);

      // 1) 나머지 있는 나눗셈 (한글 없는 "a ÷ b")
      const divM = expr.match(/^(\d+) ÷ (\d+)$/);
      if (divM) {
        const a = Number(divM[1]);
        const b = Number(divM[2]);
        if (a % b !== 0) {
          const q = Math.floor(a / b);
          fixes++;
          return `expression: "${a} ÷ ${b}의 몫은?",${ws}answer: ${q},`;
        }
        return whole;
      }

      // 2) 분수식 (한글 없는 순수 식만)
      if (/[가-힣=?]/.test(expr) || !expr.includes("/")) {
        // 3) 비 간단화 문구 보강
        if (/가장 간단한 (자연수|정수)의 비로$/.test(expr)) {
          fixes++;
          return `expression: "${expr} 나타내면? (첫째 수 입력)",${ws}answer: ${ansStr},`;
        }
        return whole;
      }
      const parsed = parseFracExpr(expr);
      if (!parsed) return whole;
      const { value, denoms, hasMulDiv } = parsed;
      if (value.d === 1) {
        // 결과가 정수 → 표기 그대로, 정답만 검증·교정
        if (ans !== value.n) fixes++;
        return `expression: "${expr}",${ws}answer: ${value.n},`;
      }
      if (hasMulDiv) {
        // 기약분수의 분자
        fixes++;
        return `expression: "${expr} = ? (기약분수의 분자만 입력)",${ws}answer: ${value.n},`;
      }
      // 덧셈/뺄셈 → 공통분모 명시, 그 분모 기준 분자
      const L = denoms.reduce((acc, d) => lcm(acc, d), 1);
      const numerAtL = value.n * (L / value.d);
      if (!Number.isInteger(numerAtL)) return whole;
      fixes++;
      return `expression: "${expr} = ? (분자만 입력, 분모=${L})",${ws}answer: ${numerAtL},`;
    },
  );

  fs.writeFileSync(fp, src);
  console.log(`${file}: ${fixes}건 수정`);
  totalFixes += fixes;
}
console.log(`총 ${totalFixes}건`);
