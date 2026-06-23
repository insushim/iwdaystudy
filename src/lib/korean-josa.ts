/**
 * 한국어 조사·계사 받침 규칙 자동 보정 유틸.
 *
 * 제너레이터 템플릿이 `을(를)`, `은(는)`, `이(가)`, `와(과)`, `으로(로)` 같은
 * 리터럴 플레이스홀더를 그대로 내보내던 버그(학생 화면에 "정원을(를)" 노출)를
 * 받침 유무 기준으로 올바른 조사 하나로 치환한다. 한글 음절과 숫자(한국어 읽기) 모두 처리.
 */

/** 한글 음절의 받침(종성) 유무. 한글 음절이 아니면 false. */
export function hasBatchim(ch: string): boolean {
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false; // 완성형 한글 음절만
  return (code - 0xac00) % 28 !== 0;
}

/** 한글 음절의 받침이 ㄹ인지 (으로/로 선택용). */
export function isRieul(ch: string): boolean {
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 === 8; // 종성 인덱스 8 = ㄹ
}

/**
 * 정수의 한국어 읽기 마지막 음절 받침 유무.
 * 1일ㄹ 3삼ㅁ 6육ㄱ 7칠ㄹ 8팔ㄹ → 받침 / 2이 4사 5오 9구 0영 → 없음.
 * 끝자리 0이면 십·백·천·만·억 단위 음절이 모두 받침을 가지므로 true.
 */
export function numberHasBatchim(n: number): boolean {
  const v = Math.abs(Math.trunc(n));
  if (v === 0) return false; // 영
  const last = v % 10;
  if (last === 0) return true; // 십(ㅂ)·백(ㄱ)·천(ㄴ)·만(ㄴ)·억(ㄱ)
  return last === 1 || last === 3 || last === 6 || last === 7 || last === 8;
}

function pick(anchor: string, withB: string, withoutB: string): string {
  if (/^\d+$/.test(anchor)) {
    return numberHasBatchim(parseInt(anchor, 10)) ? withB : withoutB;
  }
  return hasBatchim(anchor.slice(-1)) ? withB : withoutB;
}

// 앵커(한글/숫자) + 선택적 괄호 음철표기(예: "암탉 (h-e-n)") + 조사 플레이스홀더.
const JOSA_PAIRS: Array<[RegExp, string, string]> = [
  [/([가-힣]|\d+)(\s*\([^)]*\))?을\(를\)/g, "을", "를"],
  [/([가-힣]|\d+)(\s*\([^)]*\))?를\(을\)/g, "을", "를"],
  [/([가-힣]|\d+)(\s*\([^)]*\))?은\(는\)/g, "은", "는"],
  [/([가-힣]|\d+)(\s*\([^)]*\))?는\(은\)/g, "은", "는"],
  [/([가-힣]|\d+)(\s*\([^)]*\))?이\(가\)/g, "이", "가"],
  [/([가-힣]|\d+)(\s*\([^)]*\))?가\(이\)/g, "이", "가"],
  [/([가-힣]|\d+)(\s*\([^)]*\))?과\(와\)/g, "과", "와"],
  [/([가-힣]|\d+)(\s*\([^)]*\))?와\(과\)/g, "과", "와"],
];

/**
 * 문자열 내 조사/계사 플레이스홀더를 받침 규칙으로 보정한다.
 * 플레이스홀더가 없으면 입력을 그대로 반환(no-op).
 */
export function naturalizeKorean(text: string): string {
  if (!text) return text;
  for (const [re, withB, withoutB] of JOSA_PAIRS) {
    text = text.replace(re, (_m, anchor: string, paren?: string) => {
      return anchor + (paren || "") + pick(anchor, withB, withoutB);
    });
  }
  // 으로(로) / 로(으로): 받침 있고 ㄹ 아니면 '으로', 그 외 '로'
  text = text.replace(
    /([가-힣])으로\(로\)|([가-힣])로\(으로\)/g,
    (_m, a: string, b: string) => {
      const c = a || b;
      return c + (hasBatchim(c) && !isRieul(c) ? "으로" : "로");
    },
  );
  // 계사 보정: 모음으로 끝나는 명사 + '이에요' → '예요' (예: 고양이이에요 → 고양이예요)
  text = text.replace(/([가-힣])이에요/g, (m, c: string) =>
    hasBatchim(c) ? m : c + "예요",
  );
  return text;
}
