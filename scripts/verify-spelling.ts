/**
 * 맞춤법 문항 결정론 게이트.
 * (1) 패턴 데이터를 직접 검사해 빈칸 뒤 조사가 정답·오답 양쪽에 맞는지 본다.
 * (2) 생성 가능한 모든 문항을 뽑아 비문·판정불가 문항을 잡는다.
 * 0결함이 아니면 exit 1.
 *
 * 실행: npx tsx scripts/verify-spelling.ts
 */
import {
  generateSpellingProblems,
  SPELLING_PATTERNS,
  DICTATION_PATTERNS,
  SPELLING_RULE_PATTERNS,
} from "../src/lib/curriculum/generators/spelling-generator";
import { hasBatchim } from "../src/lib/korean-josa";

const defects: string[] = [];

// ── 1. 패턴 데이터 검사 ──────────────────────────────────────
// fillBlankWithJosa가 보정해 주는 조사. 이 밖의 조사가 빈칸 뒤에 오는데
// 정답·오답의 받침 유무가 다르면 한쪽 문장이 반드시 비문이 된다.
const AUTO_FIXED = /^[이가을를은는와과]/;
const BATCHIM_SENSITIVE = /^(으로|로|이다|이라|이야|아|어)/;

const allPatterns = [
  ...SPELLING_PATTERNS.map((p) => ({ ...p, kind: "맞춤법" })),
  ...DICTATION_PATTERNS.map((p) => ({ ...p, kind: "받아쓰기" })),
  ...SPELLING_RULE_PATTERNS.map((p) => ({ ...p, kind: "규칙" })),
];

for (const p of allPatterns) {
  const tpl = (p.sentence ?? "").replace("{word}", "___");
  if (!tpl.includes("___")) {
    defects.push(`[${p.kind}] 예문에 빈칸이 없음: "${p.sentence}" (${p.correct})`);
    continue;
  }
  const after = tpl.slice(tpl.indexOf("___") + 3);
  const cBat = hasBatchim(p.correct.slice(-1));
  const wBat = hasBatchim(p.wrong.slice(-1));
  if (cBat === wBat) continue;
  if (AUTO_FIXED.test(after)) continue; // 조사가 자동 교정됨
  if (BATCHIM_SENSITIVE.test(after)) {
    defects.push(
      `[${p.kind}] 받침 불일치('${p.correct}'/'${p.wrong}') + 교정 안 되는 조사 "${after.slice(0, 3)}" — 한쪽이 비문\n    ${tpl}`,
    );
  }
}

// ── 2. 생성 문항 전수 검사 ───────────────────────────────────
interface Entry {
  q1: string;
  q2: string;
  answer: number;
  explanation: string;
}
const seen = new Map<string, Entry>();
for (const grade of [1, 2, 3, 4, 5, 6]) {
  for (const diff of [1, 2, 3] as const) {
    for (let seed = 1; seed <= 120; seed++) {
      for (const p of generateSpellingProblems(
        grade,
        200,
        seed * 7919 + grade,
        diff,
      )) {
        seen.set(`${p.q1}|||${p.q2}`, p);
      }
    }
  }
}

const flag = (e: Entry, why: string) =>
  defects.push(`${why}\n    ①${e.q1}\n    ②${e.q2}\n    ${e.explanation}`);

for (const e of seen.values()) {
  const correct = e.answer === 1 ? e.q1 : e.q2;
  if (/\{word\}|___/.test(e.q1 + e.q2)) flag(e, "플레이스홀더 미치환");
  if (e.q1 === e.q2) flag(e, "정답과 오답이 동일");
  if (/\.\.|\.\?|\s{2,}|\s[.,?!]/.test(e.q1 + e.q2))
    flag(e, "문장부호·공백 오류");
  // 목록형(준비물: …)은 종결 부호가 없는 것이 정상
  if (!/[.?!"'”’]$/.test(correct) && !correct.includes(":"))
    flag(e, "정답 문장이 종결되지 않음");
}

console.log(
  `패턴 ${allPatterns.length}개 / 생성 유니크 문항 ${seen.size}개 검사`,
);
if (defects.length === 0) {
  console.log("✅ 결함 0");
} else {
  console.log(`❌ 결함 ${defects.length}건\n`);
  for (const d of defects) console.log(`  - ${d}\n`);
  process.exit(1);
}
