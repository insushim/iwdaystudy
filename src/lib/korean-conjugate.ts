/**
 * Korean verb conjugation — consonant-suffix ("안전") forms only.
 *
 * Korean verb irregularities (ㄷ·ㅂ·ㅅ·르·ㅎ·으) trigger ONLY before vowel-initial
 * endings (아/어/으...). The forms below all take consonant-initial endings
 * (는/자/고/기), so the ONLY adjustment ever needed is ㄹ-탈락 before 는
 * (만들다→만드는, 밀다→미는). Everything else is a plain stem+suffix concat.
 * This keeps procedural English-vocab translations grammatical without a full
 * (irregular-prone) conjugation engine.
 *
 * Input is the dictionary form ending in "다" (also tolerates verb phrases such
 * as "옷을 입다", "학교에 가다" — only the trailing verb is conjugated).
 */

const HANGUL_BASE = 0xac00;
const JONG_COUNT = 28;
const JONG_RIEUL = 8; // ㄹ as a final consonant (종성) index

function hasRieulFinal(ch: string): boolean {
  const code = ch.charCodeAt(0);
  if (code < HANGUL_BASE || code > 0xd7a3) return false;
  return (code - HANGUL_BASE) % JONG_COUNT === JONG_RIEUL;
}

/** Drop a trailing ㄹ 종성 from a syllable (밀→미, 만들의 들→드). */
function dropRieul(ch: string): string {
  const code = ch.charCodeAt(0);
  return String.fromCharCode(code - JONG_RIEUL);
}

/** "먹다" → "먹", "옷을 입다" → "옷을 입". Returns null if not a 다-verb. */
function verbStem(dict: string): string | null {
  if (!dict.endsWith("다")) return null;
  return dict.slice(0, -1);
}

/** 관형사형 현재: 먹다→먹는, 밀다→미는, 만들다→만드는. */
export function verbAttributive(dict: string): string {
  const stem = verbStem(dict);
  if (stem === null || stem.length === 0) return dict;
  const last = stem[stem.length - 1];
  if (hasRieulFinal(last)) {
    return stem.slice(0, -1) + dropRieul(last) + "는";
  }
  return stem + "는";
}

/** 청유형: 먹다→먹자, 밀다→밀자, 만들다→만들자. (No ㄹ-탈락 before 자.) */
export function verbPropositive(dict: string): string {
  const stem = verbStem(dict);
  if (stem === null) return dict;
  return stem + "자";
}

/** 희망 연결형: 먹다→먹고 싶어요, 밀다→밀고 싶어요. */
export function verbWantTo(dict: string): string {
  const stem = verbStem(dict);
  if (stem === null) return dict;
  return stem + "고 싶어요";
}

/** 명사형: 먹다→먹기, 밀다→밀기. */
export function verbNominal(dict: string): string {
  const stem = verbStem(dict);
  if (stem === null) return dict;
  return stem + "기";
}

export function isVerb(k: string): boolean {
  return k.endsWith("다");
}
