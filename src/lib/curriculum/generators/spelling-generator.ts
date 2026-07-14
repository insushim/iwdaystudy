/**
 * Procedural Spelling Problem Generator
 * Generates grade-appropriate Korean spelling problems algorithmically.
 * Supports multiple variant types: 맞춤법, 받아쓰기, 띄어쓰기교정, 문장부호, 존댓말/반말, 맞춤법규칙
 */
import type { SpellingEntry } from "@/types/curriculum";
import { hasBatchim } from "@/lib/korean-josa";

// 템플릿 빈칸(___)에 단어를 넣되, 빈칸 바로 뒤 조사(이/가·을/를·은/는·와/과)를
// 삽입 단어의 받침에 맞춰 교정. "오늘 ___이 좋아요." + "날씨" → "오늘 날씨가 좋아요."
const JOSA_PAIRS: Record<string, [string, string]> = {
  // [받침 있을 때, 받침 없을 때]
  이: ["이", "가"],
  가: ["이", "가"],
  을: ["을", "를"],
  를: ["을", "를"],
  은: ["은", "는"],
  는: ["은", "는"],
  와: ["과", "와"],
  과: ["과", "와"],
};
function fillBlankWithJosa(template: string, word: string): string {
  const idx = template.indexOf("___");
  if (idx < 0) return template.replace("___", word);
  const prefix = template.slice(0, idx);
  let after = template.slice(idx + 3);
  const first = after[0];
  // 조사는 한 단어를 끝맺으므로 뒤에 공백이나 문장부호가 온다. "___는다"의 '는'은
  // 어미의 일부이므로 교정 대상이 아니다 ("하지 않" + "는다" → "않은다"가 되면 안 됨).
  const nextIsBoundary = after.length < 2 || /[\s.,!?"'”’)\]]/.test(after[1]);
  if (first && JOSA_PAIRS[first] && nextIsBoundary) {
    const bat = hasBatchim(word.slice(-1));
    after = (bat ? JOSA_PAIRS[first][0] : JOSA_PAIRS[first][1]) + after.slice(1);
  }
  return prefix + word + after;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function pickOne<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function shuffleArray<T>(rng: () => number, arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Common Korean spelling mistake patterns
interface SpellingPattern {
  correct: string;
  wrong: string;
  explanation: string;
  gradeMin: number;
  // 패턴 전용 예문 ({word} 플레이스홀더). 범용 템플릿에 낱말을 꽂으면
  // "강아지가 돌아가시다." 같은 비문이 나오므로 패턴마다 예문을 반드시 둔다.
  sentence: string;
}

export const SPELLING_PATTERNS: SpellingPattern[] = [
  // Grade 1-2: Basic patterns
  {
    correct: "되다",
    wrong: "돼다",
    explanation: "'되다'가 기본형입니다.",
    gradeMin: 1,
    sentence: "'{word}'가 이 말의 기본형이다.",
  },
  {
    correct: "안 돼",
    wrong: "안 되",
    explanation: "'안 돼'(안 되어)가 올바른 표현입니다.",
    gradeMin: 1,
    sentence: "그건 {word}요.",
  },
  {
    correct: "왜",
    wrong: "외",
    explanation: "'왜'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "너는 {word} 그렇게 생각하니?",
  },
  {
    correct: "개",
    wrong: "게",
    explanation: "물건을 세는 단위는 '개'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "사탕이 한 {word} 남았어요.",
  },
  {
    correct: "네",
    wrong: "내",
    explanation: "'네'(당신의)와 '내'(나의)를 구별합니다.",
    gradeMin: 1,
    sentence: "{word} 이름은 무엇이니?",
  },

  // 된소리/거센소리 혼동
  {
    correct: "깨끗하다",
    wrong: "께끗하다",
    explanation: "'깨끗하다'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "손을 씻고 나니 아주 {word}.",
  },
  {
    correct: "뚝딱",
    wrong: "뚝닥",
    explanation: "'뚝딱'이 올바른 의태어입니다.",
    gradeMin: 1,
    sentence: "목수 아저씨가 의자를 {word} 만들었다.",
  },
  {
    correct: "번쩍",
    wrong: "번적",
    explanation: "'번쩍'이 올바른 의태어입니다.",
    gradeMin: 1,
    sentence: "하늘에서 번개가 {word} 빛났다.",
  },
  {
    correct: "반짝반짝",
    wrong: "반작반작",
    explanation: "'반짝반짝'이 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "밤하늘의 별이 {word} 빛난다.",
  },
  {
    correct: "깜짝",
    wrong: "깜작",
    explanation: "'깜짝'이 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "갑작스러운 소리에 {word} 놀랐다.",
  },

  // 받침 혼동
  {
    correct: "닭",
    wrong: "닥",
    explanation: "'닭'이 올바른 표기입니다. 겹받침 ㄺ.",
    gradeMin: 1,
    sentence: "농장에서 {word}이 알을 낳았다.",
  },
  {
    correct: "흙",
    wrong: "흑",
    explanation: "'흙'이 올바른 표기입니다. 겹받침 ㄺ.",
    gradeMin: 1,
    sentence: "화분에 {word}을 담았다.",
  },
  {
    correct: "읽었다",
    wrong: "익었다",
    explanation: "'읽다'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "잠자기 전에 책을 {word}.",
  },
  {
    correct: "없다",
    wrong: "업다",
    explanation: "'없다'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "지갑에 돈이 한 푼도 {word}.",
  },
  {
    correct: "있다",
    wrong: "잇다",
    explanation: "'있다'가 올바른 표기입니다. 쌍시옷 받침.",
    gradeMin: 1,
    sentence: "책상 위에 책이 {word}.",
  },

  // Grade 2-3: 띄어쓰기
  {
    correct: "할 수 있다",
    wrong: "할수있다",
    explanation: "'할 수 있다'처럼 의존명사는 띄어 씁니다.",
    gradeMin: 2,
    sentence: "나는 혼자서도 {word}.",
  },
  {
    correct: "할 줄 안다",
    wrong: "할줄 안다",
    explanation: "'할 줄 안다'로 띄어 씁니다.",
    gradeMin: 2,
    sentence: "나는 수영을 {word}.",
  },
  {
    correct: "먹을 만큼",
    wrong: "먹을만큼",
    explanation: "'만큼'은 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
    sentence: "{word}만 덜어서 담자.",
  },
  {
    correct: "올 때",
    wrong: "올때",
    explanation: "'때'는 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
    sentence: "친구가 {word} 마중을 나갔다.",
  },
  {
    correct: "갈 데가 없다",
    wrong: "갈데가 없다",
    explanation: "'데'는 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
    sentence: "우리는 이제 {word}.",
  },
  {
    correct: "한 개",
    wrong: "한개",
    explanation: "수 관형사와 단위명사는 띄어 씁니다.",
    gradeMin: 2,
    sentence: "사과를 {word} 먹었다.",
  },
  {
    correct: "세 살",
    wrong: "세살",
    explanation: "수 관형사와 단위명사는 띄어 씁니다.",
    gradeMin: 2,
    sentence: "동생은 이제 {word}이다.",
  },
  {
    correct: "두 마리",
    wrong: "두마리",
    explanation: "수 관형사와 단위명사는 띄어 씁니다.",
    gradeMin: 2,
    sentence: "우리 집에 강아지 {word}가 있다.",
  },

  // Grade 3-4: 사이시옷
  {
    correct: "나뭇잎",
    wrong: "나무잎",
    explanation: "사이시옷이 필요합니다: '나뭇잎'.",
    gradeMin: 3,
    sentence: "가을이라 {word}이 노랗게 물들었다.",
  },
  {
    correct: "잇몸",
    wrong: "이몸",
    explanation: "'잇몸'이 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "이를 닦을 때 {word}도 함께 닦는다.",
  },
  {
    correct: "깻잎",
    wrong: "깨잎",
    explanation: "'깻잎'이 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "쌈으로 {word}을 먹었다.",
  },
  {
    correct: "콧물",
    wrong: "코물",
    explanation: "'콧물'이 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "감기에 걸려 {word}이 난다.",
  },
  {
    correct: "햇볕",
    wrong: "해볕",
    explanation: "'햇볕'이 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "따뜻한 {word}이 내리쬔다.",
  },
  {
    correct: "핏줄",
    wrong: "피줄",
    explanation: "'핏줄'이 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "손등에 {word}이 파랗게 비친다.",
  },
  {
    correct: "귓속",
    wrong: "귀속",
    explanation: "'귓속'이 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "{word}이 간지러워 면봉으로 닦았다.",
  },

  // Grade 3-4: 혼동하기 쉬운 표현
  {
    correct: "어떡해",
    wrong: "어떻해",
    explanation: "'어떡해'(어떻게 해)가 올바른 표현입니다.",
    gradeMin: 3,
    sentence: "지갑을 잃어버렸는데 이제 {word}?",
  },
  {
    correct: "어떻게",
    wrong: "어떡게",
    explanation: "'어떻게'가 올바른 부사형입니다.",
    gradeMin: 3,
    sentence: "이 문제를 {word} 풀어야 할까?",
  },
  {
    correct: "가르쳐",
    wrong: "가리켜",
    explanation: "'가르치다'(teach)와 '가리키다'(point)는 다릅니다.",
    gradeMin: 3,
    sentence: "선생님께서 우리에게 한글을 {word} 주셨다.",
  },
  {
    correct: "다르다",
    wrong: "틀리다",
    explanation: "'다르다'(different)와 '틀리다'(wrong)는 다릅니다.",
    gradeMin: 3,
    sentence: "쌍둥이지만 성격은 서로 {word}.",
  },
  {
    correct: "바란다",
    wrong: "바랜다",
    explanation: "'바라다'(wish)가 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "네가 건강하기를 {word}.",
  },
  {
    correct: "며칠",
    wrong: "몇일",
    explanation: "'며칠'이 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "오늘이 {word}이니?",
  },
  {
    correct: "설거지",
    wrong: "설겆이",
    explanation: "'설거지'가 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "밥을 먹고 {word}를 했다.",
  },

  // Grade 4-5: 높임/겸양
  {
    correct: "드신다",
    wrong: "먹으신다",
    explanation: "어른에게는 '드시다'가 올바른 높임말입니다.",
    gradeMin: 4,
    sentence: "할아버지께서 진지를 {word}.",
  },
  {
    correct: "주무신다",
    wrong: "자신다",
    explanation: "'주무시다'가 올바른 높임말입니다.",
    gradeMin: 4,
    sentence: "할머니께서는 일찍 {word}.",
  },
  {
    correct: "돌아가셨다",
    wrong: "죽으셨다",
    explanation: "'돌아가시다'가 올바른 높임 표현입니다.",
    gradeMin: 4,
    sentence: "증조할아버지께서 지난해에 {word}.",
  },
  {
    correct: "연세",
    wrong: "나이",
    explanation: "어른의 나이는 '연세'라 합니다.",
    gradeMin: 4,
    sentence: "할아버지의 {word}가 어떻게 되세요?",
  },
  {
    correct: "말씀",
    wrong: "말",
    explanation: "어른의 말은 '말씀'이라 합니다.",
    gradeMin: 4,
    sentence: "선생님의 {word}을 잘 들어라.",
  },

  // Grade 5-6: 어려운 맞춤법
  {
    correct: "웬일",
    wrong: "왠일",
    explanation: "'웬일'이 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "네가 여기까지 오다니 {word}이니?",
  },
  {
    correct: "왠지",
    wrong: "웬지",
    explanation: "'왠지'(왜인지)가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "오늘은 {word} 기분이 좋다.",
  },
  {
    correct: "반장으로서",
    wrong: "반장으로써",
    explanation: "'로서'는 자격, '로써'는 수단입니다.",
    gradeMin: 5,
    sentence: "{word} 회의를 이끌었다.",
  },
  {
    correct: "가든지",
    wrong: "가던지",
    explanation: "'든지'는 선택, '던지'는 과거 회상입니다.",
    gradeMin: 5,
    sentence: "네가 {word} 말든지 나는 상관없다.",
  },
  {
    correct: "아픈 데",
    wrong: "아픈 대",
    explanation: "'데'(것, 곳)와 '대'(말을 전달)를 구별합니다.",
    gradeMin: 5,
    sentence: "몸에 {word}가 있으면 말해라.",
  },
  {
    correct: "안 된다",
    wrong: "않 된다",
    explanation: "'안'(부정)과 '않'(-지 않다)을 구별합니다.",
    gradeMin: 5,
    sentence: "거짓말을 하면 {word}.",
  },
  {
    correct: "넓이",
    wrong: "널비",
    explanation: "'넓이'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "직사각형의 {word}를 구해 보자.",
  },
  {
    correct: "낫다",
    wrong: "낳다",
    explanation: "'낫다'(better)와 '낳다'(bear)를 구별합니다.",
    gradeMin: 5,
    sentence: "이것이 저것보다 {word}.",
  },
  {
    correct: "맞혔다",
    wrong: "맞췄다",
    explanation: "정답을 '맞히다', 서로 대조하는 것은 '맞추다'입니다.",
    gradeMin: 5,
    sentence: "퀴즈에서 정답을 {word}.",
  },
  {
    correct: "부딪혔다",
    wrong: "부딛혔다",
    explanation: "다른 것에 의해 부딪게 될 때 '부딪히다'가 올바릅니다.",
    gradeMin: 5,
    sentence: "자전거가 벽에 {word}.",
  },
  {
    correct: "깨끗이",
    wrong: "깨끗히",
    explanation: "'깨끗이'가 올바른 부사형입니다.",
    gradeMin: 5,
    sentence: "방을 {word} 치웠다.",
  },
  {
    correct: "일찍이",
    wrong: "일찍히",
    explanation: "'일찍이'가 올바른 부사형입니다.",
    gradeMin: 5,
    sentence: "그는 {word} 고향을 떠나 도시로 갔다.",
  },
  {
    correct: "아니요",
    wrong: "아니오",
    explanation: "'아니요'가 올바른 대답 표현입니다.",
    gradeMin: 1,
    sentence: "선생님 물음에 \"{word}\"라고 대답했다.",
  },
  {
    correct: "됐다",
    wrong: "됬다",
    explanation: "'됐다'(되었다)가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "이제 준비가 다 {word}.",
  },
  {
    correct: "갖고",
    wrong: "갗고",
    explanation: "'갖다'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "연필을 {word} 왔다.",
  },
  {
    correct: "짧다",
    wrong: "짦다",
    explanation: "'짧다'가 올바른 표기입니다. 겹받침 ㄼ.",
    gradeMin: 1,
    sentence: "이 연필은 너무 {word}.",
  },
  {
    correct: "넓다",
    wrong: "널다",
    explanation: "'넓다'가 올바른 표기입니다. 겹받침 ㄼ.",
    gradeMin: 1,
    sentence: "우리 학교 운동장은 아주 {word}.",
  },
  {
    correct: "삶았다",
    wrong: "삼았다",
    explanation: "'삶다'가 올바른 표기입니다. 겹받침 ㄻ.",
    gradeMin: 1,
    sentence: "달걀을 냄비에 {word}.",
  },
  {
    correct: "앉았다",
    wrong: "안았다",
    explanation: "'앉다'가 올바른 표기입니다. 겹받침 ㄵ.",
    gradeMin: 1,
    sentence: "의자에 바르게 {word}.",
  },
  {
    correct: "값",
    wrong: "갑",
    explanation: "'값'이 올바른 표기입니다. 겹받침 ㅄ(ㅂ+ㅅ).",
    gradeMin: 1,
    sentence: "이 연필의 {word}은 오백 원이다.",
  },

  // ──── 추가: Grade 2-3 띄어쓰기·의존명사 ────
  {
    correct: "할 것",
    wrong: "할것",
    explanation: "'것'은 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
    sentence: "오늘 {word}을 미리 적어 두자.",
  },
  {
    correct: "될 수 있다",
    wrong: "될수있다",
    explanation: "'수'는 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
    sentence: "노력하면 무엇이든 {word}.",
  },
  {
    correct: "갈 곳",
    wrong: "갈곳",
    explanation: "관형사형 뒤 명사는 띄어 씁니다.",
    gradeMin: 2,
    sentence: "비가 와서 {word}이 마땅치 않다.",
  },
  {
    correct: "한 번",
    wrong: "한번",
    explanation: "횟수를 나타낼 때 '번'은 띄어 씁니다.",
    gradeMin: 2,
    sentence: "이 책은 {word}밖에 읽지 않았다.",
  },
  {
    correct: "열 개",
    wrong: "열개",
    explanation: "수 관형사와 단위명사는 띄어 씁니다.",
    gradeMin: 2,
    sentence: "사탕을 {word} 샀다.",
  },
  {
    correct: "다섯 명",
    wrong: "다섯명",
    explanation: "수 관형사와 단위명사는 띄어 씁니다.",
    gradeMin: 2,
    sentence: "우리 모둠은 {word}이다.",
  },
  {
    correct: "네 시",
    wrong: "네시",
    explanation: "수 관형사와 단위명사는 띄어 씁니다.",
    gradeMin: 2,
    sentence: "학교가 {word}에 끝난다.",
  },
  {
    correct: "나만큼",
    wrong: "나 만큼",
    explanation: "조사 '만큼'은 앞말에 붙여 씁니다.",
    gradeMin: 2,
    sentence: "{word} 잘하는 사람이 없다.",
  },

  // ──── 추가: Grade 3-4 사이시옷·된소리 ────
  {
    correct: "머릿속",
    wrong: "머리속",
    explanation: "'머릿속'이 올바른 표기입니다. 사이시옷 규칙.",
    gradeMin: 3,
    sentence: "{word}이 복잡해 잠이 오지 않는다.",
  },
  {
    correct: "뒷문",
    wrong: "뒤문",
    explanation: "'뒷문'이 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "교실 {word}으로 나갔다.",
  },
  {
    correct: "윗옷",
    wrong: "위옷",
    explanation: "'윗옷'이 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "날이 추워 {word}을 껴입었다.",
  },
  {
    correct: "아랫사람",
    wrong: "아래사람",
    explanation: "'아랫사람'이 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "{word}에게도 예의를 지켜야 한다.",
  },
  {
    correct: "찻잔",
    wrong: "차잔",
    explanation: "'찻잔'이 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "따뜻한 {word}을 두 손으로 감쌌다.",
  },
  {
    correct: "뱃사람",
    wrong: "배사람",
    explanation: "'뱃사람'이 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "{word}들이 그물을 걷어 올렸다.",
  },
  {
    correct: "곰곰이",
    wrong: "곰곰히",
    explanation: "'곰곰이'가 올바른 부사형입니다.",
    gradeMin: 3,
    sentence: "나는 {word} 생각해 보았다.",
  },
  {
    correct: "일일이",
    wrong: "일일히",
    explanation: "'일일이'가 올바른 부사형입니다.",
    gradeMin: 3,
    sentence: "선생님이 {word} 확인해 주셨다.",
  },

  // ──── 추가: Grade 3-4 혼동 표현 ────
  {
    correct: "벌였다",
    wrong: "벌렸다",
    explanation: "'벌이다'(일을 시작하다)와 '벌리다'(넓게 펴다)는 다릅니다.",
    gradeMin: 3,
    sentence: "친구들과 잔치를 {word}.",
  },
  {
    correct: "잠갔다",
    wrong: "잠궜다",
    explanation: "'잠그다'가 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "나갈 때 문을 꼭 {word}.",
  },
  {
    correct: "담갔다",
    wrong: "담궜다",
    explanation: "'담그다'가 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "어머니께서 김치를 {word}.",
  },
  {
    correct: "시켰다",
    wrong: "식혔다",
    explanation: "주문하다의 뜻일 때 '시키다'가 올바릅니다.",
    gradeMin: 3,
    sentence: "식당에서 음식을 {word}.",
  },
  {
    correct: "진지",
    wrong: "밥",
    explanation: "어른의 식사는 '진지'라 합니다.",
    gradeMin: 4,
    sentence: "할머니, {word} 드세요.",
  },
  {
    correct: "댁",
    wrong: "집",
    explanation: "어른의 집은 '댁'이라 합니다.",
    gradeMin: 4,
    sentence: "선생님 {word}에 방문했다.",
  },
  {
    correct: "성함",
    wrong: "이름",
    explanation: "어른의 이름은 '성함'이라 합니다.",
    gradeMin: 4,
    sentence: "할아버지의 {word}이 무엇인가요?",
  },
  {
    correct: "생신",
    wrong: "생일",
    explanation: "어른의 생일은 '생신'이라 합니다.",
    gradeMin: 4,
    sentence: "할머니 {word}을 축하드립니다.",
  },

  // ──── 추가: Grade 5-6 어려운 맞춤법 ────
  {
    correct: "오랫동안",
    wrong: "오랫 동안",
    explanation: "'오랫동안'은 한 단어로 붙여 씁니다.",
    gradeMin: 5,
    sentence: "{word} 기다리던 소식이 왔다.",
  },
  {
    correct: "금세",
    wrong: "금새",
    explanation: "'금세'(금시에)가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "약을 먹으니 {word} 나았다.",
  },
  {
    correct: "어이없다",
    wrong: "어의없다",
    explanation: "'어이없다'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "그 말을 듣고 나는 {word}.",
  },
  {
    correct: "오랜만에",
    wrong: "오랫만에",
    explanation: "'오랜만에'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "{word} 친구를 만났다.",
  },
  {
    correct: "뒤치다꺼리",
    wrong: "뒷치닥거리",
    explanation: "'뒤치다꺼리'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "동생 {word}를 하느라 바빴다.",
  },
  {
    correct: "웃어른",
    wrong: "윗어른",
    explanation: "'웃어른'이 올바른 표기입니다. 아래위 대립이 없을 때는 '웃-'을 씁니다.",
    gradeMin: 5,
    sentence: "{word}께는 인사를 잘해야 한다.",
  },
  {
    correct: "째",
    wrong: "채",
    explanation: "순서를 나타낼 때 '째'가 올바릅니다.",
    gradeMin: 5,
    sentence: "세 번{word} 도전이다.",
  },
  {
    correct: "이따가",
    wrong: "있다가",
    explanation: "'이따가'(잠시 후에)가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "{word} 다시 전화할게.",
  },
  {
    correct: "알맞은",
    wrong: "알맞는",
    explanation: "'알맞은'이 올바른 관형형입니다.",
    gradeMin: 5,
    sentence: "빈칸에 {word} 말을 넣어 보자.",
  },
  {
    correct: "역할",
    wrong: "역활",
    explanation: "'역할'이 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "연극에서 내 {word}은 사자이다.",
  },
  {
    correct: "도리어",
    wrong: "되려",
    explanation: "'도리어'가 올바른 표기입니다. '되려'는 비표준어입니다.",
    gradeMin: 5,
    sentence: "미안하다고 했더니 {word} 화를 냈다.",
  },
  {
    correct: "거칠다",
    wrong: "거치르다",
    explanation: "'거칠다'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "오늘은 바닷바람이 {word}.",
  },
  {
    correct: "삼가야",
    wrong: "삼가해야",
    explanation: "'삼가다'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "도서관에서는 큰 소리를 {word} 한다.",
  },

  // ──── 추가 확장: Grade 1-2 받침 혼동 ────
  {
    correct: "꽃",
    wrong: "꼳",
    explanation: "'꽃'이 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "화단에 {word}이 활짝 피었다.",
  },
  {
    correct: "옷",
    wrong: "옫",
    explanation: "'옷'이 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "새 {word}을 입었다.",
  },
  {
    correct: "낮",
    wrong: "낫",
    explanation: "시간을 뜻할 때 '낮'이 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "{word}에는 해가 높이 떠 있다.",
  },
  {
    correct: "솥",
    wrong: "솓",
    explanation: "'솥'이 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "{word}에 밥을 지었다.",
  },
  {
    correct: "밭",
    wrong: "받",
    explanation: "'밭'이 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "할아버지께서 {word}에 씨를 뿌리셨다.",
  },
  {
    correct: "숲",
    wrong: "숩",
    explanation: "'숲'이 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "{word}에서 새소리가 들린다.",
  },
  {
    correct: "부엌",
    wrong: "부억",
    explanation: "'부엌'이 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "{word}에서 맛있는 냄새가 난다.",
  },
  {
    correct: "젖었다",
    wrong: "젇었다",
    explanation: "'젖다'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "비를 맞아 옷이 다 {word}.",
  },
  {
    correct: "볶았다",
    wrong: "복았다",
    explanation: "'볶다'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "멸치를 프라이팬에 {word}.",
  },
  {
    correct: "삶",
    wrong: "삼",
    explanation: "생활을 뜻할 때 '삶'이 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "할머니께서는 행복한 {word}을 사셨다.",
  },
  {
    correct: "넋",
    wrong: "넉",
    explanation: "'넋'이 올바른 표기입니다. 겹받침 ㄳ.",
    gradeMin: 1,
    sentence: "{word}을 잃고 한참을 서 있었다.",
  },
  {
    correct: "핥았다",
    wrong: "할았다",
    explanation: "'핥다'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "강아지가 내 손을 {word}.",
  },

  // ──── 추가 확장: Grade 1-2 된소리·거센소리 ────
  {
    correct: "싸웠다",
    wrong: "사웠다",
    explanation: "'싸우다'가 올바른 표기입니다. 된소리.",
    gradeMin: 1,
    sentence: "형과 장난감 때문에 {word}.",
  },
  {
    correct: "빠르다",
    wrong: "바르다",
    explanation: "속도가 빠를 때 '빠르다'가 올바릅니다.",
    gradeMin: 1,
    sentence: "토끼는 달리기가 {word}.",
  },
  {
    correct: "쓴다",
    wrong: "슨다",
    explanation: "글을 쓸 때 '쓰다'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "나는 매일 일기를 {word}.",
  },
  {
    correct: "오빠",
    wrong: "오바",
    explanation: "'오빠'가 올바른 표기입니다. 된소리.",
    gradeMin: 1,
    sentence: "우리 {word}는 중학생이다.",
  },
  {
    correct: "아빠",
    wrong: "아바",
    explanation: "'아빠'가 올바른 표기입니다. 된소리.",
    gradeMin: 1,
    sentence: "{word}와 함께 공원에 갔다.",
  },
  {
    correct: "토끼",
    wrong: "토기",
    explanation: "'토끼'가 올바른 표기입니다. 된소리.",
    gradeMin: 1,
    sentence: "{word}가 깡충깡충 뛴다.",
  },
  {
    correct: "꼬리",
    wrong: "코리",
    explanation: "'꼬리'가 올바른 표기입니다. 된소리.",
    gradeMin: 1,
    sentence: "강아지가 {word}를 흔든다.",
  },
  {
    correct: "까치",
    wrong: "카치",
    explanation: "'까치'가 올바른 표기입니다. 된소리.",
    gradeMin: 1,
    sentence: "감나무에 {word}가 앉았다.",
  },
  {
    correct: "뽀뽀",
    wrong: "보보",
    explanation: "'뽀뽀'가 올바른 표기입니다. 된소리.",
    gradeMin: 1,
    sentence: "아기에게 {word}를 해 주었다.",
  },
  {
    correct: "쏘았다",
    wrong: "소았다",
    explanation: "동작을 뜻할 때 '쏘다'가 올바릅니다.",
    gradeMin: 1,
    sentence: "화살을 과녁에 {word}.",
  },

  // ──── 추가 확장: Grade 1-2 기초 맞춤법 ────
  {
    correct: "안녕하세요",
    wrong: "안녕하새요",
    explanation: "'안녕하세요'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "선생님께 \"{word}\" 하고 인사했다.",
  },
  {
    correct: "고맙습니다",
    wrong: "고맙슴니다",
    explanation: "'고맙습니다'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "도와주셔서 {word}.",
  },
  {
    correct: "감사합니다",
    wrong: "감사함니다",
    explanation: "'감사합니다'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "선물을 주셔서 {word}.",
  },
  {
    correct: "그렇습니다",
    wrong: "그렇슴니다",
    explanation: "'그렇습니다'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "네, 제 생각도 {word}.",
  },
  {
    correct: "괜찮다",
    wrong: "괜챦다",
    explanation: "'괜찮다'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "조금 넘어졌지만 나는 {word}.",
  },
  {
    correct: "어른",
    wrong: "얼은",
    explanation: "'어른'이 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "{word}을 보면 인사를 한다.",
  },
  {
    correct: "다섯",
    wrong: "다선",
    explanation: "'다섯'이 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "사과가 {word} 개 있다.",
  },
  {
    correct: "여섯",
    wrong: "여선",
    explanation: "'여섯'이 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "우리 반은 {word} 모둠으로 나뉘었다.",
  },

  // ──── 추가 확장: Grade 2-3 띄어쓰기 ────
  {
    correct: "볼 만하다",
    wrong: "볼만하다",
    explanation: "'만하다' 앞의 관형사형은 띄어 씁니다.",
    gradeMin: 2,
    sentence: "그 영화는 정말 {word}.",
  },
  {
    correct: "먹을 뿐",
    wrong: "먹을뿐",
    explanation: "'뿐'은 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
    sentence: "나는 밥을 {word}이다.",
  },
  {
    correct: "할 뻔했다",
    wrong: "할뻔했다",
    explanation: "'뻔'은 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
    sentence: "하마터면 지각을 {word}.",
  },
  {
    correct: "갈 적에",
    wrong: "갈적에",
    explanation: "'적'은 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
    sentence: "학교에 {word} 우산을 챙겼다.",
  },
  {
    correct: "먹은 지",
    wrong: "먹은지",
    explanation: "'지'(시간 경과)는 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
    sentence: "밥을 {word} 한 시간이 지났다.",
  },
  {
    correct: "올 듯하다",
    wrong: "올듯하다",
    explanation: "'듯'은 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
    sentence: "하늘을 보니 비가 {word}.",
  },
  {
    correct: "갈 바를",
    wrong: "갈바를",
    explanation: "'바'는 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
    sentence: "어디로 {word} 몰라 망설였다.",
  },
  {
    correct: "세 장",
    wrong: "세장",
    explanation: "수 관형사와 단위명사는 띄어 씁니다.",
    gradeMin: 2,
    sentence: "색종이를 {word} 준비했다.",
  },
  {
    correct: "일곱 송이",
    wrong: "일곱송이",
    explanation: "수 관형사와 단위명사는 띄어 씁니다.",
    gradeMin: 2,
    sentence: "장미 {word}를 샀다.",
  },
  {
    correct: "여덟 그루",
    wrong: "여덟그루",
    explanation: "수 관형사와 단위명사는 띄어 씁니다.",
    gradeMin: 2,
    sentence: "운동장에 나무 {word}를 심었다.",
  },
  {
    correct: "나도 모르게",
    wrong: "나도모르게",
    explanation: "조사 '도'는 붙여 쓰고 나머지는 띄어 씁니다.",
    gradeMin: 2,
    sentence: "{word} 눈물이 흘렀다.",
  },

  // ──── 추가 확장: Grade 3-4 사이시옷 ────
  {
    correct: "봇물",
    wrong: "보물",
    explanation: "'봇물'(둑이 터져 흐르는 물)이 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "{word}이 터지듯 쏟아졌다.",
  },
  {
    correct: "뱃길",
    wrong: "배길",
    explanation: "'뱃길'이 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "{word}로 섬에 들어갔다.",
  },
  {
    correct: "햇빛",
    wrong: "해빛",
    explanation: "'햇빛'이 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "{word}이 눈부시게 밝다.",
  },
  {
    correct: "뒷산",
    wrong: "뒤산",
    explanation: "'뒷산'이 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "{word}에 올라 단풍을 보았다.",
  },
  {
    correct: "냇가",
    wrong: "내가",
    explanation: "시냇가를 뜻할 때 '냇가'가 올바릅니다.",
    gradeMin: 3,
    sentence: "{word}에서 물고기를 잡았다.",
  },
  {
    correct: "숫자",
    wrong: "수자",
    explanation: "'숫자'가 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "칠판에 {word}를 크게 썼다.",
  },
  {
    correct: "횟수",
    wrong: "회수",
    explanation: "번 수를 뜻할 때 '횟수'가 올바릅니다.",
    gradeMin: 3,
    sentence: "{word}를 세어 보자.",
  },
  {
    correct: "셋집",
    wrong: "세집",
    explanation: "'셋집'이 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "우리는 {word}에서 살고 있다.",
  },
  {
    correct: "곳곳",
    wrong: "곧곧",
    explanation: "'곳곳'이 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "공원 {word}에 꽃이 피었다.",
  },
  {
    correct: "핏기",
    wrong: "피기",
    explanation: "얼굴에 피가 도는 것은 '핏기'입니다.",
    gradeMin: 3,
    sentence: "얼굴에 {word}가 돌았다.",
  },

  // ──── 추가 확장: Grade 3-4 혼동 표현 ────
  {
    correct: "부쳤다",
    wrong: "붙였다",
    explanation: "편지를 보낼 때 '부치다'가 올바릅니다.",
    gradeMin: 3,
    sentence: "우체국에서 편지를 {word}.",
  },
  {
    correct: "붙였다",
    wrong: "부쳤다",
    explanation: "풀로 붙일 때 '붙이다'가 올바릅니다.",
    gradeMin: 3,
    sentence: "풀로 종이를 {word}.",
  },
  {
    correct: "맞췄다",
    wrong: "맞혔다",
    explanation: "서로 비교할 때 '맞추다'가 올바릅니다.",
    gradeMin: 3,
    sentence: "친구와 답을 서로 {word}.",
  },
  {
    correct: "바쳤다",
    wrong: "받쳤다",
    explanation: "나라에 헌신할 때 '바치다'가 올바릅니다.",
    gradeMin: 3,
    sentence: "나라에 목숨을 {word}.",
  },
  {
    correct: "받쳤다",
    wrong: "바쳤다",
    explanation: "아래에서 받쳐 줄 때 '받치다'가 올바릅니다.",
    gradeMin: 3,
    sentence: "손으로 턱을 {word}.",
  },
  {
    correct: "늘였다",
    wrong: "늘렸다",
    explanation: "길이를 길게 할 때 '늘이다'가 올바릅니다.",
    gradeMin: 3,
    sentence: "고무줄을 길게 {word}.",
  },
  {
    correct: "늘렸다",
    wrong: "늘였다",
    explanation: "양이나 수를 많게 할 때 '늘리다'가 올바릅니다.",
    gradeMin: 3,
    sentence: "동아리 회원 수를 {word}.",
  },
  {
    correct: "채",
    wrong: "체",
    explanation: "상태 그대로를 뜻할 때 '채'가 올바릅니다.",
    gradeMin: 3,
    sentence: "신발을 신은 {word}로 들어왔다.",
  },
  {
    correct: "체",
    wrong: "채",
    explanation: "아는 척할 때 '체'가 올바릅니다.",
    gradeMin: 3,
    sentence: "그는 모르면서 아는 {word}를 했다.",
  },
  {
    correct: "켠다",
    wrong: "킨다",
    explanation: "불을 켤 때 '켜다'가 올바릅니다.",
    gradeMin: 3,
    sentence: "어두우면 형이 불을 {word}.",
  },
  {
    correct: "끈다",
    wrong: "껀다",
    explanation: "'끄다'가 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "잘 때는 불을 {word}.",
  },
  {
    correct: "잃었다",
    wrong: "잊었다",
    explanation: "물건을 잃어버릴 때 '잃다'가 올바릅니다.",
    gradeMin: 3,
    sentence: "길에서 지갑을 {word}.",
  },
  {
    correct: "잊었다",
    wrong: "잃었다",
    explanation: "기억을 잊을 때 '잊다'가 올바릅니다.",
    gradeMin: 3,
    sentence: "그만 친구와의 약속을 {word}.",
  },

  // ──── 추가 확장: Grade 3-4 부사형 ────
  {
    correct: "가까이",
    wrong: "가까히",
    explanation: "'가까이'가 올바른 부사형입니다.",
    gradeMin: 3,
    sentence: "불에 너무 {word} 가지 마라.",
  },
  {
    correct: "반듯이",
    wrong: "반듯히",
    explanation: "'반듯이'(반듯하게)가 올바른 부사형입니다.",
    gradeMin: 3,
    sentence: "허리를 {word} 펴고 앉자.",
  },
  {
    correct: "반드시",
    wrong: "반듯이",
    explanation: "'꼭'의 뜻일 때 '반드시'가 올바릅니다.",
    gradeMin: 3,
    sentence: "약속은 {word} 지켜야 한다.",
  },
  {
    correct: "따뜻이",
    wrong: "따뜻히",
    explanation: "'따뜻이'가 올바른 부사형입니다.",
    gradeMin: 3,
    sentence: "이웃을 {word} 대하자.",
  },
  {
    correct: "가만히",
    wrong: "가만이",
    explanation: "'가만히'가 올바른 부사형입니다.",
    gradeMin: 3,
    sentence: "잠시 {word} 있어 보렴.",
  },
  {
    correct: "조용히",
    wrong: "조용이",
    explanation: "'조용히'가 올바른 부사형입니다.",
    gradeMin: 3,
    sentence: "도서관에서는 {word} 해야 한다.",
  },
  {
    correct: "솔직히",
    wrong: "솔직이",
    explanation: "'솔직히'가 올바른 부사형입니다.",
    gradeMin: 3,
    sentence: "{word} 말하면 나도 잘 모른다.",
  },

  // ──── 추가 확장: Grade 4-5 높임·겸양 ────
  {
    correct: "계신다",
    wrong: "있으신다",
    explanation: "어른이 계실 때 '계시다'가 올바른 높임말입니다.",
    gradeMin: 4,
    sentence: "할아버지께서 방에 {word}.",
  },
  {
    correct: "잡수신다",
    wrong: "먹으신다",
    explanation: "'잡수시다'는 '드시다'와 같은 높임말입니다.",
    gradeMin: 4,
    sentence: "할머니께서 진지를 {word}.",
  },
  {
    correct: "모시고",
    wrong: "데리고",
    explanation: "어른을 동반할 때 '모시다'가 올바릅니다.",
    gradeMin: 4,
    sentence: "할머니를 {word} 병원에 갔다.",
  },
  {
    correct: "데리고",
    wrong: "모시고",
    explanation: "아이를 동반할 때 '데리다'가 올바릅니다.",
    gradeMin: 4,
    sentence: "동생을 {word} 놀이터에 갔다.",
  },
  {
    correct: "여쭈었다",
    wrong: "물어보았다",
    explanation: "어른에게 물을 때 '여쭈다'가 올바른 높임말입니다.",
    gradeMin: 4,
    sentence: "선생님께 궁금한 것을 {word}.",
  },
  {
    correct: "드렸다",
    wrong: "줬다",
    explanation: "어른에게 줄 때 '드리다'가 올바른 높임말입니다.",
    gradeMin: 4,
    sentence: "할아버지께 선물을 {word}.",
  },
  {
    correct: "말씀드렸다",
    wrong: "말했다",
    explanation: "어른에게 말할 때 '말씀드리다'가 올바릅니다.",
    gradeMin: 4,
    sentence: "부모님께 사실대로 {word}.",
  },
  {
    correct: "뵈었다",
    wrong: "보았다",
    explanation: "어른을 만날 때 '뵙다'가 올바른 높임말입니다.",
    gradeMin: 4,
    sentence: "오랜만에 선생님을 {word}.",
  },
  {
    correct: "편찮으시다",
    wrong: "아프시다",
    explanation: "어른이 아프실 때 '편찮으시다'가 올바른 높임말입니다.",
    gradeMin: 4,
    sentence: "할머니께서 요즘 {word}.",
  },
  {
    correct: "치아",
    wrong: "이",
    explanation: "이를 전문적으로 이를 때 '치아'라 합니다.",
    gradeMin: 4,
    sentence: "{word} 건강을 지키자.",
  },

  // ──── 추가 확장: Grade 5-6 되/돼 구별 ────
  {
    correct: "되었다",
    wrong: "됬다",
    explanation: "'되었다'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "드디어 봄이 {word}.",
  },
  {
    correct: "안 돼요",
    wrong: "안 되요",
    explanation: "'안 돼요'가 올바른 표현입니다. '되어요'의 줄임.",
    gradeMin: 5,
    sentence: "여기서 뛰면 {word}.",
  },
  {
    correct: "돼지",
    wrong: "되지",
    explanation: "동물을 뜻할 때 '돼지'가 올바릅니다.",
    gradeMin: 5,
    sentence: "{word}가 꿀꿀 울었다.",
  },
  {
    correct: "되돌아갔다",
    wrong: "돼돌아갔다",
    explanation: "'되돌아가다'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "길을 잘못 들어 {word}.",
  },
  {
    correct: "다 됐다",
    wrong: "다 됬다",
    explanation: "'됐다'(되었다)가 올바른 줄임입니다.",
    gradeMin: 5,
    sentence: "이제 준비가 {word}.",
  },

  // ──── 추가 확장: Grade 5-6 데/대 구별 ────
  {
    correct: "나도 그런 데가 있어",
    wrong: "나도 그런 대가 있어",
    explanation: "'데'(곳, 경우)는 의존명사, '대'는 전달 표현입니다.",
    gradeMin: 5,
    sentence: "{word}.",
  },
  {
    correct: "학교에 갔대요",
    wrong: "학교에 갔데요",
    explanation: "남의 말을 전할 때 '대'가 올바릅니다.",
    gradeMin: 5,
    sentence: "형은 벌써 {word}.",
  },

  // ──── 추가 확장: Grade 5-6 로서/로써 구별 ────
  {
    correct: "학생으로서 해야 할 일",
    wrong: "학생으로써 해야 할 일",
    explanation: "자격을 나타낼 때 '로서'가 올바릅니다.",
    gradeMin: 5,
    sentence: "{word}을 다하자.",
  },
  {
    correct: "연필로써 그림을 그렸다",
    wrong: "연필로서 그림을 그렸다",
    explanation: "수단·도구를 나타낼 때 '로써'가 올바릅니다.",
    gradeMin: 5,
    sentence: "{word}.",
  },

  // ──── 추가 확장: Grade 5-6 혼동 맞춤법 ────
  {
    correct: "곧이곧대로",
    wrong: "고지곧대로",
    explanation: "'곧이곧대로'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "그는 들은 말을 {word} 전했다.",
  },
  {
    correct: "설렌다",
    wrong: "설랜다",
    explanation: "'설레다'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "소풍 갈 생각에 마음이 {word}.",
  },
  {
    correct: "아지랑이",
    wrong: "아지랭이",
    explanation: "'아지랑이'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "봄날 들판에 {word}가 피어오른다.",
  },
  {
    correct: "구레나룻",
    wrong: "구렛나루",
    explanation: "'구레나룻'이 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "삼촌은 {word}을 길렀다.",
  },
  {
    correct: "거뜬하다",
    wrong: "거뜬히다",
    explanation: "'거뜬하다'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "푹 자고 나니 몸이 {word}.",
  },
  {
    correct: "일찍이",
    wrong: "일찌기",
    explanation: "'일찍이'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "그는 {word} 재능을 인정받았다.",
  },
  {
    correct: "바란다",
    wrong: "바랜다",
    explanation: "소원을 빌 때 '바라다'가 올바릅니다.",
    gradeMin: 5,
    sentence: "우리는 세계 평화를 {word}.",
  },
  {
    correct: "바랬다",
    wrong: "바랐다",
    explanation: "색이 변할 때 '바래다'가 올바릅니다.",
    gradeMin: 5,
    sentence: "오래되어 옷의 색이 {word}.",
  },
  {
    correct: "낫다",
    wrong: "났다",
    explanation: "'더 낫다'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "이것이 더 {word}.",
  },
  {
    correct: "낳았다",
    wrong: "나았다",
    explanation: "아이를 낳을 때 '낳다'가 올바릅니다.",
    gradeMin: 5,
    sentence: "고모가 예쁜 아이를 {word}.",
  },
  {
    correct: "쩨쩨하다",
    wrong: "째째하다",
    explanation: "'쩨쩨하다'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "그런 일로 화를 내다니 참 {word}.",
  },
  {
    correct: "느긋하다",
    wrong: "느긋타다",
    explanation: "'느긋하다'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "그는 성격이 {word}.",
  },
  {
    correct: "뒤집었다",
    wrong: "뒷집었다",
    explanation: "'뒤집다'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "부침개를 {word}.",
  },
  {
    correct: "예스럽다",
    wrong: "옛스럽다",
    explanation: "'예스럽다'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "이 마을은 분위기가 {word}.",
  },
  {
    correct: "요컨대",
    wrong: "요컨데",
    explanation: "'요컨대'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "{word}, 노력이 가장 중요하다.",
  },
  {
    correct: "일컫는다",
    wrong: "일컸는다",
    explanation: "'일컫다'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "사람들은 그를 영웅이라 {word}.",
  },
  {
    correct: "넉넉히",
    wrong: "넉넉이",
    explanation: "'넉넉히'가 올바른 부사형입니다.",
    gradeMin: 5,
    sentence: "시간이 {word} 남았다.",
  },
  {
    correct: "특히",
    wrong: "특이",
    explanation: "부사로 쓸 때 '특히'가 올바릅니다.",
    gradeMin: 5,
    sentence: "{word} 수학을 잘한다.",
  },
  {
    correct: "족히",
    wrong: "족이",
    explanation: "'족히'가 올바른 부사형입니다.",
    gradeMin: 5,
    sentence: "여기서 학교까지 {word} 삼십 분은 걸린다.",
  },
  {
    correct: "내로라하는",
    wrong: "내노라하는",
    explanation: "'내로라하다'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "{word} 선수들이 모두 모였다.",
  },

  // ════════════════════════════════════════════════════════════
  // ══ NEW: 대량 추가 패턴 (콘텐츠 2배 확장) ══
  // ════════════════════════════════════════════════════════════

  // ──── NEW: Grade 1-2 기초 받침·모음 ────
  {
    correct: "무릎",
    wrong: "무릅",
    explanation: "'무릎'이 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "{word}을 꿇었다.",
  },
  {
    correct: "칼",
    wrong: "캃",
    explanation: "'칼'이 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "{word}로 과일을 깎았다.",
  },
  {
    correct: "학교",
    wrong: "학꾜",
    explanation: "'학교'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "나는 아침 일찍 {word}에 간다.",
  },
  {
    correct: "선생님",
    wrong: "선생임",
    explanation: "'선생님'이 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "{word}께서 칭찬해 주셨다.",
  },
  {
    correct: "색깔",
    wrong: "색갈",
    explanation: "'색깔'이 올바른 표기입니다. 된소리.",
    gradeMin: 1,
    sentence: "무지개는 일곱 가지 {word}이다.",
  },
  {
    correct: "연필",
    wrong: "연삘",
    explanation: "'연필'이 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "필통에서 {word}을 꺼냈다.",
  },
  {
    correct: "잠자리",
    wrong: "잠짜리",
    explanation: "곤충 '잠자리'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "연못 위로 {word}가 날아다닌다.",
  },
  {
    correct: "나비",
    wrong: "나삐",
    explanation: "'나비'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "꽃밭에 {word}가 날아왔다.",
  },
  {
    correct: "바지",
    wrong: "빠지",
    explanation: "옷 '바지'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "새 {word}를 입었다.",
  },
  {
    correct: "가위",
    wrong: "까위",
    explanation: "'가위'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "{word}로 색종이를 잘랐다.",
  },
  {
    correct: "거북이",
    wrong: "거부기",
    explanation: "'거북이'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "{word}가 느릿느릿 기어간다.",
  },
  {
    correct: "사탕",
    wrong: "사당",
    explanation: "먹는 것은 '사탕'이 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "{word}을 먹었다.",
  },
  {
    correct: "수박",
    wrong: "수밖",
    explanation: "'수박'이 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "여름에는 시원한 {word}이 최고다.",
  },
  {
    correct: "냄비",
    wrong: "남비",
    explanation: "'냄비'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "{word}에 물을 끓였다.",
  },
  {
    correct: "모기",
    wrong: "모끼",
    explanation: "'모기'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "{word}에 물려 팔이 가렵다.",
  },
  {
    correct: "고양이",
    wrong: "고냥이",
    explanation: "'고양이'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "담장 위에 {word}가 앉아 있다.",
  },
  {
    correct: "뱀",
    wrong: "밸",
    explanation: "'뱀'이 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "풀숲에서 {word}을 보고 깜짝 놀랐다.",
  },
  {
    correct: "엄마",
    wrong: "엄맘",
    explanation: "'엄마'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "{word}, 학교 다녀오겠습니다.",
  },
  {
    correct: "누나",
    wrong: "눈아",
    explanation: "'누나'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "{word}가 숙제를 도와주었다.",
  },
  {
    correct: "동생",
    wrong: "동셍",
    explanation: "'동생'이 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "{word}과 함께 놀이터에 갔다.",
  },
  {
    correct: "할머니",
    wrong: "할먼이",
    explanation: "'할머니'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "{word}께서 옛날이야기를 들려주셨다.",
  },
  {
    correct: "할아버지",
    wrong: "할아벌지",
    explanation: "'할아버지'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "{word}와 함께 공원을 산책했다.",
  },
  {
    correct: "잘못",
    wrong: "잘몯",
    explanation: "'잘못'이 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "내 {word}을 솔직히 인정했다.",
  },
  {
    correct: "뜨겁다",
    wrong: "뜨겁따",
    explanation: "'뜨겁다'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "물이 {word}.",
  },
  {
    correct: "차갑다",
    wrong: "차갑따",
    explanation: "'차갑다'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "얼음이 {word}.",
  },
  {
    correct: "높다",
    wrong: "놉다",
    explanation: "'높다'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "산이 {word}.",
  },
  {
    correct: "좁다",
    wrong: "좁따",
    explanation: "'좁다'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "이 길은 너무 {word}.",
  },
  {
    correct: "맑다",
    wrong: "막다",
    explanation: "'맑다'가 올바른 표기입니다. 겹받침 ㄺ.",
    gradeMin: 1,
    sentence: "하늘이 {word}.",
  },
  {
    correct: "젊다",
    wrong: "점다",
    explanation: "'젊다'가 올바른 표기입니다. 겹받침 ㄻ.",
    gradeMin: 1,
    sentence: "우리 삼촌은 아직 {word}.",
  },
  {
    correct: "굵다",
    wrong: "국다",
    explanation: "'굵다'가 올바른 표기입니다. 겹받침 ㄺ.",
    gradeMin: 1,
    sentence: "이 나무는 줄기가 아주 {word}.",
  },

  // ──── NEW: Grade 2-3 추가 띄어쓰기·조사 ────
  {
    correct: "먹을 리가 없다",
    wrong: "먹을리가 없다",
    explanation: "'리'는 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
    sentence: "동생이 그 매운 음식을 {word}.",
  },
  {
    correct: "갈 테니",
    wrong: "갈테니",
    explanation: "'테'는 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
    sentence: "내가 먼저 {word} 거기서 기다려라.",
  },
  {
    correct: "끝낼 양으로",
    wrong: "끝낼양으로",
    explanation: "'양'은 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
    sentence: "그는 일을 빨리 {word} 서둘렀다.",
  },
  {
    correct: "먹을 법하다",
    wrong: "먹을법하다",
    explanation: "'법'은 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
    sentence: "이 정도 매운맛이면 아이도 {word}.",
  },
  {
    correct: "갈 셈이다",
    wrong: "갈셈이다",
    explanation: "'셈'은 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
    sentence: "나는 내일 도서관에 {word}.",
  },
  {
    correct: "더할 나위 없다",
    wrong: "더할나위 없다",
    explanation: "'나위'는 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
    sentence: "오늘 날씨는 소풍 가기에 {word}.",
  },
  {
    correct: "아홉 개",
    wrong: "아홉개",
    explanation: "수 관형사와 단위명사는 띄어 씁니다.",
    gradeMin: 2,
    sentence: "구슬을 {word} 모았다.",
  },
  {
    correct: "백 원",
    wrong: "백원",
    explanation: "수 관형사와 단위명사는 띄어 씁니다.",
    gradeMin: 2,
    sentence: "사탕 하나에 {word}이다.",
  },
  {
    correct: "첫 번째",
    wrong: "첫번째",
    explanation: "관형사와 명사는 띄어 씁니다.",
    gradeMin: 2,
    sentence: "{word}로 발표할 사람은 누구니?",
  },
  {
    correct: "두 번째",
    wrong: "두번째",
    explanation: "수 관형사와 명사는 띄어 씁니다.",
    gradeMin: 2,
    sentence: "{word} 문제가 가장 어려웠다.",
  },
  {
    correct: "좀 더",
    wrong: "좀더",
    explanation: "부사 '좀'과 '더'는 띄어 씁니다.",
    gradeMin: 2,
    sentence: "{word} 노력해 보자.",
  },
  {
    correct: "그때그때",
    wrong: "그 때 그 때",
    explanation: "'그때그때'는 한 단어로 붙여 씁니다.",
    gradeMin: 2,
    sentence: "숙제는 {word} 해 두는 것이 좋다.",
  },
  {
    correct: "이것저것",
    wrong: "이 것 저 것",
    explanation: "'이것저것'은 한 단어로 붙여 씁니다.",
    gradeMin: 2,
    sentence: "{word} 사느라 용돈을 다 썼다.",
  },
  {
    correct: "그러므로",
    wrong: "그럼으로",
    explanation: "이유를 나타낼 때 '그러므로'가 올바릅니다.",
    gradeMin: 2,
    sentence: "그는 열심히 공부했다. {word} 좋은 결과를 얻었다.",
  },

  // ──── NEW: Grade 2-3 기초 혼동 ────
  {
    correct: "아기",
    wrong: "애기",
    explanation: "'아기'가 표준어입니다.",
    gradeMin: 2,
    sentence: "{word}가 웃었다.",
  },
  {
    correct: "어떤",
    wrong: "어뗀",
    explanation: "'어떤'이 올바른 표기입니다.",
    gradeMin: 2,
    sentence: "너는 {word} 색을 좋아하니?",
  },
  {
    correct: "그래서",
    wrong: "그레서",
    explanation: "'그래서'가 올바른 표기입니다.",
    gradeMin: 2,
    sentence: "비가 왔다. {word} 우산을 썼다.",
  },
  {
    correct: "하나씩",
    wrong: "하나식",
    explanation: "'하나씩'이 올바른 표기입니다.",
    gradeMin: 2,
    sentence: "차례대로 {word} 나누어 주었다.",
  },
  {
    correct: "뭐",
    wrong: "머",
    explanation: "'뭐'가 올바른 표기입니다.",
    gradeMin: 2,
    sentence: "지금 {word} 하고 있니?",
  },
  {
    correct: "뭘",
    wrong: "멀",
    explanation: "'뭘'(무엇을)이 올바른 표기입니다.",
    gradeMin: 2,
    sentence: "{word} 그렇게 열심히 보고 있니?",
  },
  {
    correct: "며느리",
    wrong: "메느리",
    explanation: "'며느리'가 올바른 표기입니다.",
    gradeMin: 2,
    sentence: "할머니께서 {word}를 반갑게 맞으셨다.",
  },

  // ──── NEW: Grade 3-4 추가 사이시옷 ────
  {
    correct: "등굣길",
    wrong: "등교길",
    explanation: "'등굣길'이 올바른 표기입니다. 사이시옷.",
    gradeMin: 3,
    sentence: "{word}에 친구를 만났다.",
  },
  {
    correct: "하굣길",
    wrong: "하교길",
    explanation: "'하굣길'이 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "{word}에 친구를 만났다.",
  },
  {
    correct: "전셋집",
    wrong: "전세집",
    explanation: "'전셋집'이 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "우리 가족은 {word}으로 이사했다.",
  },
  {
    correct: "초점",
    wrong: "촛점",
    explanation: "'초점'은 한자어이므로 사이시옷을 넣지 않습니다.",
    gradeMin: 3,
    sentence: "사진의 {word}이 흐리다.",
  },
  {
    correct: "개수",
    wrong: "갯수",
    explanation: "'개수'는 한자어이므로 사이시옷을 넣지 않습니다.",
    gradeMin: 3,
    sentence: "사탕의 {word}를 세어 보자.",
  },
  {
    correct: "대가",
    wrong: "댓가",
    explanation: "'대가'는 한자어이므로 사이시옷을 넣지 않습니다.",
    gradeMin: 3,
    sentence: "노력한 {word}를 얻었다.",
  },
  {
    correct: "소수",
    wrong: "솟수",
    explanation: "'소수'는 한자어이므로 사이시옷을 넣지 않습니다.",
    gradeMin: 3,
    sentence: "1보다 작은 수를 {word}로 나타낸다.",
  },
  {
    correct: "찻간",
    wrong: "차간",
    explanation: "'찻간'이 올바른 표기입니다. 사이시옷.",
    gradeMin: 3,
    sentence: "기차 {word}에 자리를 잡았다.",
  },
  {
    correct: "툇마루",
    wrong: "퇴마루",
    explanation: "'툇마루'가 올바른 표기입니다. 사이시옷.",
    gradeMin: 3,
    sentence: "한옥 {word}에 걸터앉았다.",
  },
  {
    correct: "뒷마당",
    wrong: "뒤마당",
    explanation: "'뒷마당'이 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "{word}에 감나무가 서 있다.",
  },

  // ──── NEW: Grade 3-4 추가 혼동 표현 ────
  {
    correct: "가리켰다",
    wrong: "가르켰다",
    explanation: "손가락으로 '가리키다'가 올바릅니다.",
    gradeMin: 3,
    sentence: "손가락으로 북쪽을 {word}.",
  },
  {
    correct: "목걸이",
    wrong: "목거리",
    explanation: "'목걸이'가 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "생일 선물로 {word}를 받았다.",
  },
  {
    correct: "귀걸이",
    wrong: "귀거리",
    explanation: "'귀걸이'가 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "언니가 {word}를 하고 나왔다.",
  },
  {
    correct: "계발",
    wrong: "개발",
    explanation: "능력을 키울 때 '계발'이 올바릅니다.",
    gradeMin: 3,
    sentence: "숨은 잠재력을 {word}했다.",
  },
  {
    correct: "개발",
    wrong: "계발",
    explanation: "토지나 기술을 만들 때 '개발'이 올바릅니다.",
    gradeMin: 3,
    sentence: "회사가 신기술을 {word}했다.",
  },
  {
    correct: "식혔다",
    wrong: "시켰다",
    explanation: "온도를 낮출 때 '식히다'가 올바릅니다.",
    gradeMin: 3,
    sentence: "뜨거운 국을 후후 불어 {word}.",
  },
  {
    correct: "넘어졌다",
    wrong: "넘어 졌다",
    explanation: "'넘어지다'는 한 단어로 붙여 씁니다.",
    gradeMin: 3,
    sentence: "달리다가 돌에 걸려 {word}.",
  },
  {
    correct: "떨어졌다",
    wrong: "떨어 졌다",
    explanation: "'떨어지다'는 한 단어로 붙여 씁니다.",
    gradeMin: 3,
    sentence: "나뭇잎이 바닥에 {word}.",
  },
  {
    correct: "빌렸다",
    wrong: "빌였다",
    explanation: "'빌리다'가 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "도서관에서 책을 {word}.",
  },
  {
    correct: "벌렸다",
    wrong: "벌였다",
    explanation: "다리를 넓게 펼 때 '벌리다'가 올바릅니다.",
    gradeMin: 3,
    sentence: "다리를 어깨너비로 {word}.",
  },

  // ──── NEW: Grade 4-5 추가 높임·겸양·한자어 ────
  {
    correct: "약주",
    wrong: "술",
    explanation: "어른이 드시는 술은 '약주'라 합니다.",
    gradeMin: 4,
    sentence: "아버지께서 {word}를 드신다.",
  },
  {
    correct: "수라",
    wrong: "밥",
    explanation: "임금님의 식사는 '수라'라 합니다.",
    gradeMin: 4,
    sentence: "임금님께서 {word}를 드셨다.",
  },
  {
    correct: "춘추",
    wrong: "나이",
    explanation: "임금님의 나이는 '춘추'라 합니다.",
    gradeMin: 4,
    sentence: "임금님의 {word}가 어떻게 되십니까?",
  },
  {
    correct: "기지개",
    wrong: "기지게",
    explanation: "'기지개'가 올바른 표기입니다.",
    gradeMin: 4,
    sentence: "아침에 일어나 {word}를 켰다.",
  },
  {
    correct: "개구쟁이",
    wrong: "개구장이",
    explanation: "'개구쟁이'가 올바른 표기입니다.",
    gradeMin: 4,
    sentence: "내 동생은 소문난 {word}다.",
  },
  {
    correct: "겁쟁이",
    wrong: "겁장이",
    explanation: "'겁쟁이'가 올바른 표기입니다.",
    gradeMin: 4,
    sentence: "나는 어둠을 무서워하는 {word}였다.",
  },
  {
    correct: "심술쟁이",
    wrong: "심술장이",
    explanation: "'심술쟁이'가 올바른 표기입니다.",
    gradeMin: 4,
    sentence: "그 아이는 소문난 {word}다.",
  },
  {
    correct: "미장이",
    wrong: "미쟁이",
    explanation: "기술자를 뜻할 때는 '-장이'를 씁니다. (예: 미장이, 대장장이)",
    gradeMin: 4,
    sentence: "{word} 아저씨가 벽을 곱게 발랐다.",
  },
  {
    correct: "오뚝이",
    wrong: "오뚜기",
    explanation: "'오뚝이'가 올바른 표기입니다.",
    gradeMin: 4,
    sentence: "넘어져도 {word}처럼 다시 일어섰다.",
  },
  {
    correct: "귀띔",
    wrong: "귀뜸",
    explanation: "'귀띔'이 올바른 표기입니다.",
    gradeMin: 4,
    sentence: "친구가 답을 살짝 {word}해 주었다.",
  },
  {
    correct: "눈곱",
    wrong: "눈꼽",
    explanation: "'눈곱'이 올바른 표기입니다.",
    gradeMin: 4,
    sentence: "아침에 일어나 {word}을 떼었다.",
  },
  {
    correct: "주꾸미",
    wrong: "쭈꾸미",
    explanation: "'주꾸미'가 올바른 표기입니다.",
    gradeMin: 4,
    sentence: "{word} 볶음을 맛있게 먹었다.",
  },
  {
    correct: "깍두기",
    wrong: "깍뚜기",
    explanation: "'깍두기'가 올바른 표기입니다.",
    gradeMin: 4,
    sentence: "설렁탕에 {word}를 곁들였다.",
  },
  {
    correct: "뒤꿈치",
    wrong: "뒤꿈지",
    explanation: "'뒤꿈치'가 올바른 표기입니다.",
    gradeMin: 4,
    sentence: "신발이 작아 {word}가 아프다.",
  },
  {
    correct: "발뒤꿈치",
    wrong: "발뒤꿈지",
    explanation: "'발뒤꿈치'가 올바른 표기입니다.",
    gradeMin: 4,
    sentence: "{word}를 들고 살금살금 걸었다.",
  },

  // ──── NEW: Grade 4-5 추가 혼동 동사 ────
  {
    correct: "다쳤다",
    wrong: "다혔다",
    explanation: "'다치다'(부상당하다)가 올바릅니다.",
    gradeMin: 4,
    sentence: "계단에서 굴러 팔을 {word}.",
  },
  {
    correct: "다쳤다",
    wrong: "닫쳤다",
    explanation: "'다치다'(부상당하다)가 올바릅니다.",
    gradeMin: 4,
    sentence: "넘어져서 무릎을 {word}.",
  },
  {
    correct: "닫혔다",
    wrong: "다쳤다",
    explanation: "문이 닫힐 때 '닫히다'가 올바릅니다.",
    gradeMin: 4,
    sentence: "바람에 문이 저절로 {word}.",
  },
  {
    correct: "갈렸다",
    wrong: "갈였다",
    explanation: "'갈리다'(갈다의 피동)가 올바릅니다.",
    gradeMin: 4,
    sentence: "의견이 둘로 {word}.",
  },
  {
    correct: "걸렸다",
    wrong: "걸였다",
    explanation: "'걸리다'(걸다의 피동)가 올바릅니다.",
    gradeMin: 4,
    sentence: "동생이 감기에 {word}.",
  },
  {
    correct: "시달렸다",
    wrong: "시달였다",
    explanation: "'시달리다'가 올바른 표기입니다.",
    gradeMin: 4,
    sentence: "밤새 모기에 {word}.",
  },
  {
    correct: "부딪쳤다",
    wrong: "부딪혔다",
    explanation: "스스로 부딪칠 때 '부딪치다'가 올바릅니다.",
    gradeMin: 4,
    sentence: "달리다가 기둥에 {word}.",
  },

  // ──── NEW: Grade 5-6 추가 어려운 맞춤법 ────
  {
    correct: "하마터면",
    wrong: "하마트면",
    explanation: "'하마터면'이 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "{word} 지각할 뻔했다.",
  },
  {
    correct: "어렴풋이",
    wrong: "어렴풋히",
    explanation: "'어렴풋이'가 올바른 부사형입니다.",
    gradeMin: 5,
    sentence: "어릴 적 일이 {word} 떠오른다.",
  },
  {
    correct: "나머지",
    wrong: "나먼지",
    explanation: "'나머지'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "{word} 문제는 내일 풀자.",
  },
  {
    correct: "개구리",
    wrong: "개굴이",
    explanation: "'개구리'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "논에서 {word}가 운다.",
  },
  {
    correct: "통째로",
    wrong: "통채로",
    explanation: "'통째로'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "수박을 {word} 먹었다.",
  },
  {
    correct: "온갖",
    wrong: "온갓",
    explanation: "'온갖'이 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "꽃밭에 {word} 꽃이 피었다.",
  },
  {
    correct: "별의별",
    wrong: "벼릐별",
    explanation: "'별의별'이 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "{word} 일이 다 있구나.",
  },
  {
    correct: "대로",
    wrong: "데로",
    explanation: "방법을 나타낼 때 '대로'가 올바릅니다.",
    gradeMin: 5,
    sentence: "하고 싶은 {word} 해라.",
  },
  {
    correct: "만큼",
    wrong: "만컴",
    explanation: "'만큼'이 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "노력한 {word} 좋은 결과를 얻었다.",
  },
  {
    correct: "그리로",
    wrong: "그리러",
    explanation: "'그리로'(그곳으로)가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "{word} 가면 도서관이 나온다.",
  },
  {
    correct: "여태껏",
    wrong: "여태것",
    explanation: "'여태껏'이 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "{word} 이런 일은 처음이다.",
  },
  {
    correct: "오랫동안",
    wrong: "오래동안",
    explanation: "'오랫동안'이 올바른 표기입니다. 사이시옷.",
    gradeMin: 5,
    sentence: "{word} 소식이 없어 걱정했다.",
  },
  {
    correct: "갈팡질팡",
    wrong: "갈팡질방",
    explanation: "'갈팡질팡'이 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "어디로 갈지 몰라 {word} 헤맸다.",
  },
  {
    correct: "허둥지둥",
    wrong: "허둥지동",
    explanation: "'허둥지둥'이 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "늦잠을 자서 {word} 집을 나섰다.",
  },
  {
    correct: "안절부절못했다",
    wrong: "안절부절 못했다",
    explanation: "'안절부절못하다'는 한 단어입니다.",
    gradeMin: 5,
    sentence: "결과를 기다리며 {word}.",
  },
  {
    correct: "우두커니",
    wrong: "우두커이",
    explanation: "'우두커니'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "그는 창밖을 {word} 바라보았다.",
  },
  {
    correct: "무난하다",
    wrong: "문안하다",
    explanation: "'무난하다'(어렵지 않다)가 올바릅니다.",
    gradeMin: 5,
    sentence: "이번 시험은 어렵지 않고 {word}.",
  },
  {
    correct: "어중간하다",
    wrong: "어중간 하다",
    explanation: "'어중간하다'는 한 단어로 붙여 씁니다.",
    gradeMin: 5,
    sentence: "옷의 크기가 크지도 작지도 않고 {word}.",
  },
  {
    correct: "한바탕",
    wrong: "한 바탕",
    explanation: "'한바탕'은 한 단어로 붙여 씁니다.",
    gradeMin: 5,
    sentence: "교실에 {word} 웃음이 터졌다.",
  },
  {
    correct: "그러잖아도",
    wrong: "그러자나도",
    explanation: "'그러잖아도'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "{word} 연락하려던 참이었다.",
  },
  {
    correct: "어쨌든",
    wrong: "어쨋든",
    explanation: "'어쨌든'이 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "{word} 결과를 지켜보자.",
  },
  {
    correct: "됐든",
    wrong: "됬든",
    explanation: "'됐든'이 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "무엇이 {word} 최선을 다하자.",
  },

  // ──── NEW: Grade 5-6 -ㅂ니까/-습니까 혼동 ────
  {
    correct: "합니까",
    wrong: "함니까",
    explanation: "'합니까'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "숙제를 다 {word}?",
  },
  {
    correct: "갑니까",
    wrong: "감니까",
    explanation: "'갑니까'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "지금 어디로 {word}?",
  },
  {
    correct: "입니까",
    wrong: "임니까",
    explanation: "'입니까'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "이름이 무엇{word}?",
  },

  // ──── NEW: Grade 5-6 헷갈리는 한자어 ────
  {
    correct: "결재",
    wrong: "결제",
    explanation: "상관의 허가를 받을 때 '결재'가 올바릅니다.",
    gradeMin: 5,
    sentence: "부장님의 {word}를 받다.",
  },
  {
    correct: "결제",
    wrong: "결재",
    explanation: "돈을 지불할 때 '결제'가 올바릅니다.",
    gradeMin: 5,
    sentence: "카드로 물건값을 {word}했다.",
  },
  {
    correct: "수집",
    wrong: "수칩",
    explanation: "'수집'이 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "우표 {word}이 내 취미이다.",
  },
  {
    correct: "연구",
    wrong: "연귀",
    explanation: "'연구'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "과학자들이 새로운 {word}를 시작했다.",
  },
  {
    correct: "필수",
    wrong: "필쑤",
    explanation: "'필수'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "체육 시간에는 준비 운동이 {word}이다.",
  },

  // ──── NEW: Grade 6 고급 맞춤법 ────
  {
    correct: "사글세",
    wrong: "삭월세",
    explanation: "'사글세'가 올바른 표기입니다.",
    gradeMin: 6,
    sentence: "그는 {word} 방에서 살았다.",
  },
  {
    correct: "고지식하다",
    wrong: "고지식 하다",
    explanation: "'고지식하다'는 융통성이 없다는 뜻으로, 붙여 씁니다.",
    gradeMin: 6,
    sentence: "그는 융통성이 없고 {word}.",
  },
  {
    correct: "어처구니없다",
    wrong: "어의없다",
    explanation: "'어처구니없다'가 올바른 표기입니다.",
    gradeMin: 6,
    sentence: "그 말을 듣고 나는 {word}.",
  },
  {
    correct: "풋사과",
    wrong: "풋 사과",
    explanation: "'풋사과'는 한 단어로 붙여 씁니다.",
    gradeMin: 6,
    sentence: "{word}는 시고 떫다.",
  },
  {
    correct: "시나브로",
    wrong: "시나부로",
    explanation: "'시나브로'(모르는 사이에 조금씩)가 올바릅니다.",
    gradeMin: 6,
    sentence: "눈이 {word} 쌓였다.",
  },
  {
    correct: "우레",
    wrong: "울레",
    explanation: "'우레'(천둥소리)가 올바른 표기입니다.",
    gradeMin: 6,
    sentence: "{word}와 같은 박수가 쏟아졌다.",
  },
  {
    correct: "아름드리",
    wrong: "아름다리",
    explanation: "'아름드리'가 올바른 표기입니다.",
    gradeMin: 6,
    sentence: "마을 앞에 {word} 나무가 서 있다.",
  },
  {
    correct: "오지랖",
    wrong: "오지랍",
    explanation: "'오지랖'이 올바른 표기입니다.",
    gradeMin: 6,
    sentence: "그는 {word}이 넓어 남의 일에 잘 나선다.",
  },
  {
    correct: "갈수록",
    wrong: "갈 수록",
    explanation: "'갈수록'은 한 단어로 붙여 씁니다.",
    gradeMin: 6,
    sentence: "{word} 실력이 늘고 있다.",
  },
  {
    correct: "함부로",
    wrong: "함부러",
    explanation: "'함부로'가 올바른 표기입니다.",
    gradeMin: 6,
    sentence: "물건을 {word} 다루면 안 된다.",
  },
  {
    correct: "섣불리",
    wrong: "섣부리",
    explanation: "'섣불리'가 올바른 표기입니다.",
    gradeMin: 6,
    sentence: "{word} 판단하지 말자.",
  },
  {
    correct: "생뚱맞다",
    wrong: "쌩뚱맞다",
    explanation: "'생뚱맞다'가 올바른 표기입니다.",
    gradeMin: 6,
    sentence: "그의 말은 상황에 맞지 않고 {word}.",
  },
  {
    correct: "뜬금없다",
    wrong: "뜬금 없다",
    explanation: "'뜬금없다'는 한 단어로 붙여 씁니다.",
    gradeMin: 6,
    sentence: "그 질문은 정말 {word}.",
  },
];

// ════════════════════════════════════════════════════════════
// ══ 띄어쓰기교정 (Spacing Correction) 패턴 ══
// ════════════════════════════════════════════════════════════
interface SpacingPattern {
  correct: string;
  wrong: string;
  explanation: string;
  gradeMin: number;
}

const SPACING_PATTERNS: SpacingPattern[] = [
  // Grade 2
  {
    correct: "나는 학교에 간다.",
    wrong: "나는학교에 간다.",
    explanation: "주어 뒤 조사는 붙이고, 다른 단어는 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "사과를 먹고 싶다.",
    wrong: "사과를먹고싶다.",
    explanation: "각 단어는 띄어 써야 합니다.",
    gradeMin: 2,
  },
  {
    correct: "오늘은 날씨가 좋다.",
    wrong: "오늘은날씨가좋다.",
    explanation: "단어와 단어 사이는 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "엄마와 아빠가 오셨다.",
    wrong: "엄마와아빠가 오셨다.",
    explanation: "조사는 앞말에 붙이지만, 다른 단어는 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "밥을 다 먹었다.",
    wrong: "밥을다먹었다.",
    explanation: "부사 '다'와 동사 '먹었다'는 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "집에 가고 싶다.",
    wrong: "집에가고싶다.",
    explanation: "각 단어는 띄어 써야 합니다.",
    gradeMin: 2,
  },
  {
    correct: "비가 많이 온다.",
    wrong: "비가많이온다.",
    explanation: "부사 '많이'도 띄어 씁니다.",
    gradeMin: 2,
  },

  // Grade 3
  {
    correct: "그는 학생이 아니다.",
    wrong: "그는 학생이아니다.",
    explanation: "'아니다'는 독립된 단어이므로 띄어 씁니다.",
    gradeMin: 3,
  },
  {
    correct: "여기에서 만나기로 했다.",
    wrong: "여기에서만나기로 했다.",
    explanation: "부사어와 동사는 띄어 씁니다.",
    gradeMin: 3,
  },
  {
    correct: "나는 잘할 수 있다.",
    wrong: "나는 잘 할수 있다.",
    explanation:
      "'잘하다'는 한 단어라 붙여 쓰고, 의존명사 '수'는 띄어 씁니다.",
    gradeMin: 3,
  },
  {
    correct: "아버지가 방에 들어가신다.",
    wrong: "아버지가방에 들어가신다.",
    explanation: "'아버지가'와 '방에'는 띄어 써야 합니다.",
    gradeMin: 3,
  },

  // Grade 4
  {
    correct: "그럼에도 불구하고 갔다.",
    wrong: "그럼에도불구하고 갔다.",
    explanation: "'불구하고'는 독립된 표현으로 띄어 씁니다.",
    gradeMin: 4,
  },
  {
    correct: "결코 포기할 수 없다.",
    wrong: "결코포기할수없다.",
    explanation: "부사와 의존명사는 모두 띄어 씁니다.",
    gradeMin: 4,
  },
  {
    correct: "일주일 만에 만났다.",
    wrong: "일주일만에 만났다.",
    explanation: "의존명사 '만'은 띄어 씁니다.",
    gradeMin: 4,
  },

  // Grade 5-6
  {
    correct: "그가 온다는 것을 알았다.",
    wrong: "그가 온다는것을 알았다.",
    explanation: "의존명사 '것'은 띄어 씁니다.",
    gradeMin: 5,
  },
  {
    correct: "나는 네가 좋은 줄 안다.",
    wrong: "나는 네가좋은줄 안다.",
    explanation: "의존명사 '줄'은 띄어 씁니다.",
    gradeMin: 5,
  },
  {
    correct: "가는 데 시간이 걸린다.",
    wrong: "가는데 시간이 걸린다.",
    explanation: "의존명사 '데'는 띄어 씁니다.",
    gradeMin: 5,
  },
  {
    correct: "일한 지 한 달이 됐다.",
    wrong: "일한지 한달이 됐다.",
    explanation: "'지'와 '달' 모두 의존명사이므로 띄어 씁니다.",
    gradeMin: 5,
  },
];

// ════════════════════════════════════════════════════════════
// ══ 문장부호 (Punctuation) 패턴 ══
// ════════════════════════════════════════════════════════════
interface PunctuationPattern {
  correct: string;
  wrong: string;
  explanation: string;
  gradeMin: number;
}

const PUNCTUATION_PATTERNS: PunctuationPattern[] = [
  // Grade 1-2
  {
    correct: "안녕하세요?",
    wrong: "안녕하세요.",
    explanation: "물어보는 문장에는 물음표(?)를 씁니다.",
    gradeMin: 1,
  },
  {
    correct: "와, 예쁘다!",
    wrong: "와 예쁘다.",
    explanation: "감탄문에는 느낌표(!)를, 부름말 뒤에는 쉼표(,)를 씁니다.",
    gradeMin: 1,
  },
  {
    correct: "사과, 배, 포도를 샀다.",
    wrong: "사과 배 포도를 샀다.",
    explanation: "나열할 때 쉼표(,)로 구분합니다.",
    gradeMin: 1,
  },
  {
    correct: "엄마, 저 왔어요!",
    wrong: "엄마 저 왔어요.",
    explanation: "부르는 말 뒤에는 쉼표(,)를 씁니다.",
    gradeMin: 1,
  },
  {
    correct: "뭐 하고 있니?",
    wrong: "뭐 하고 있니.",
    explanation: "물어보는 문장에는 물음표(?)를 씁니다.",
    gradeMin: 1,
  },
  {
    correct: "아야!",
    wrong: "아야.",
    explanation: "아픔을 나타내는 감탄사 뒤에는 느낌표(!)를 씁니다.",
    gradeMin: 1,
  },

  // Grade 2-3
  {
    correct: '"잘 가!" 하고 인사했다.',
    wrong: "잘 가 하고 인사했다.",
    explanation: '남의 말을 그대로 옮길 때 큰따옴표("")를 씁니다.',
    gradeMin: 2,
  },
  {
    correct: '선생님께서 "조용히 해라." 하고 말씀하셨다.',
    wrong: "선생님께서 조용히 해라 하고 말씀하셨다.",
    explanation: '직접 인용할 때 큰따옴표("")를 씁니다.',
    gradeMin: 2,
  },
  {
    correct: "첫째, 손을 씻는다. 둘째, 밥을 먹는다.",
    wrong: "첫째 손을 씻는다. 둘째 밥을 먹는다.",
    explanation: "순서를 매길 때 쉼표(,)를 씁니다.",
    gradeMin: 2,
  },

  // Grade 3-4
  {
    correct: "나는 생각했다. '과연 그럴까?'",
    wrong: "나는 생각했다. 과연 그럴까",
    explanation: "속으로 한 말에는 작은따옴표('')를 씁니다.",
    gradeMin: 3,
  },
  {
    correct: "한국의 수도는 서울(Seoul)이다.",
    wrong: "한국의 수도는 서울 Seoul 이다.",
    explanation: "보충 설명은 괄호(()) 안에 넣습니다.",
    gradeMin: 3,
  },
  {
    correct: "준비물: 연필, 지우개, 공책",
    wrong: "준비물 연필 지우개 공책",
    explanation: "목록 앞에는 쌍점(:)을, 나열에는 쉼표(,)를 씁니다.",
    gradeMin: 3,
  },

  // Grade 4-5
  {
    correct: '그는 말했다. "내일 오겠습니다."',
    wrong: "그는 말했다 내일 오겠습니다",
    explanation: '직접 인용문에는 큰따옴표("")를 씁니다.',
    gradeMin: 4,
  },
  {
    correct: "사과·배·감을 수확했다.",
    wrong: "사과.배.감을 수확했다.",
    explanation:
      "같은 부류를 묶어 나열할 때는 마침표가 아니라 가운뎃점(·)을 씁니다.",
    gradeMin: 4,
  },

  // Grade 5-6
  {
    correct: "그는 '민주주의'의 의미를 설명했다.",
    wrong: '그는 "민주주의"의 의미를 설명했다.',
    explanation:
      "강조하는 말에는 작은따옴표('')를 씁니다. 큰따옴표(\"\")는 남의 말을 그대로 옮길 때 씁니다.",
    gradeMin: 5,
  },
  {
    correct: "문제는 이것이다 ― 시간이 부족하다.",
    wrong: "문제는 이것이다 시간이 부족하다.",
    explanation:
      "앞말을 부연 설명할 때는 줄표(―)로 이어 줍니다. 부호 없이 이으면 두 문장이 뒤엉킵니다.",
    gradeMin: 5,
  },
  {
    correct: "우리는 자유·평등·박애를 소중히 여긴다.",
    wrong: "우리는 자유 평등 박애를 소중히 여긴다.",
    explanation: "같은 부류 나열에 가운뎃점(·)을 씁니다.",
    gradeMin: 5,
  },
];

// ════════════════════════════════════════════════════════════
// ══ 존댓말/반말 변환 (Honorific Conversion) 패턴 ══
// ════════════════════════════════════════════════════════════
interface HonorificPattern {
  honorific: string;
  casual: string;
  context: string; // "어른에게" or "친구에게"
  explanation: string;
  gradeMin: number;
}

const HONORIFIC_PATTERNS: HonorificPattern[] = [
  // Grade 1-2 기초 존댓말
  {
    honorific: "안녕하세요.",
    casual: "안녕.",
    context: "어른에게",
    explanation: "어른에게는 '안녕하세요'라고 인사합니다.",
    gradeMin: 1,
  },
  {
    honorific: "감사합니다.",
    casual: "고마워.",
    context: "어른에게",
    explanation: "어른에게는 '감사합니다'라고 말합니다.",
    gradeMin: 1,
  },
  {
    honorific: "죄송합니다.",
    casual: "미안해.",
    context: "어른에게",
    explanation: "어른에게는 '죄송합니다'라고 말합니다.",
    gradeMin: 1,
  },
  {
    honorific: "네, 알겠습니다.",
    casual: "응, 알았어.",
    context: "어른에게",
    explanation: "어른에게는 '네, 알겠습니다'라고 대답합니다.",
    gradeMin: 1,
  },
  {
    honorific: "주세요.",
    casual: "줘.",
    context: "어른에게",
    explanation: "어른에게 부탁할 때 '주세요'라고 말합니다.",
    gradeMin: 1,
  },
  {
    honorific: "있으세요?",
    casual: "있어?",
    context: "어른에게",
    explanation: "어른에게 물을 때 '있으세요?'라고 말합니다.",
    gradeMin: 1,
  },
  {
    honorific: "먹을게요.",
    casual: "먹을게.",
    context: "어른에게",
    explanation: "어른 앞에서는 '먹을게요'라고 말합니다.",
    gradeMin: 1,
  },
  {
    honorific: "다녀오겠습니다.",
    casual: "다녀올게.",
    context: "어른에게",
    explanation: "어른에게는 '다녀오겠습니다'라고 인사합니다.",
    gradeMin: 1,
  },

  // Grade 2-3
  {
    honorific: "잘 주무셨어요?",
    casual: "잘 잤어?",
    context: "어른에게",
    explanation: "어른에게는 '주무시다'를 씁니다.",
    gradeMin: 2,
  },
  {
    honorific: "진지 드셨어요?",
    casual: "밥 먹었어?",
    context: "어른에게",
    explanation: "어른의 식사는 '진지', '먹다'는 '드시다'입니다.",
    gradeMin: 2,
  },
  {
    honorific: "어디 가세요?",
    casual: "어디 가?",
    context: "어른에게",
    explanation: "어른에게는 '-세요'를 붙입니다.",
    gradeMin: 2,
  },
  {
    honorific: "말씀해 주세요.",
    casual: "말해 줘.",
    context: "어른에게",
    explanation: "어른에게는 '말씀'이라고 합니다.",
    gradeMin: 2,
  },

  // Grade 3-4
  {
    honorific: "선생님, 여쭤볼 것이 있습니다.",
    casual: "선생님, 물어볼 게 있어요.",
    context: "어른에게",
    explanation: "어른에게 물을 때 '여쭈다'가 올바릅니다.",
    gradeMin: 3,
  },
  {
    honorific: "할머니를 모시고 갔습니다.",
    casual: "할머니를 데리고 갔어요.",
    context: "어른에게",
    explanation: "어른을 동반할 때 '모시다'를 씁니다.",
    gradeMin: 3,
  },
  {
    honorific: "할아버지께서 댁에 계십니다.",
    casual: "할아버지가 집에 있어요.",
    context: "어른에게",
    explanation: "어른에게는 '께서', '댁', '계시다'를 씁니다.",
    gradeMin: 3,
  },
  {
    honorific: "아버지께서 주무십니다.",
    casual: "아빠가 자고 있어.",
    context: "어른에게",
    explanation: "어른의 수면은 '주무시다'로 표현합니다.",
    gradeMin: 3,
  },

  // Grade 4-5
  {
    honorific: "선생님의 성함이 어떻게 되십니까?",
    casual: "선생님 이름이 뭐예요?",
    context: "어른에게",
    explanation:
      "어른의 이름은 '성함', '무엇'은 '어떻게 되십니까'로 표현합니다.",
    gradeMin: 4,
  },
  {
    honorific: "할머니 생신을 축하드립니다.",
    casual: "할머니 생일 축하해요.",
    context: "어른에게",
    explanation: "어른의 생일은 '생신', 축하는 '축하드리다'입니다.",
    gradeMin: 4,
  },
  {
    honorific: "선생님을 뵙게 되어 영광입니다.",
    casual: "선생님을 보게 되어 기뻐요.",
    context: "어른에게",
    explanation: "어른을 만날 때 '뵙다'가 올바릅니다.",
    gradeMin: 4,
  },
  {
    honorific: "어머니께서 편찮으십니다.",
    casual: "엄마가 아파요.",
    context: "어른에게",
    explanation: "어른의 아픔은 '편찮으시다'로 표현합니다.",
    gradeMin: 4,
  },

  // Grade 5-6
  {
    honorific: "선생님께서 말씀하신 대로 하겠습니다.",
    casual: "선생님이 말한 대로 할게요.",
    context: "어른에게",
    explanation: "'께서', '말씀', '-하신'을 사용하여 높임을 표현합니다.",
    gradeMin: 5,
  },
  {
    honorific: "부모님의 은혜에 감사드립니다.",
    casual: "엄마 아빠 고마워요.",
    context: "어른에게",
    explanation: "'부모님', '은혜', '감사드리다'를 사용합니다.",
    gradeMin: 5,
  },
  {
    honorific: "사장님께서 승인해 주셨습니다.",
    casual: "사장님이 허락해 줬어요.",
    context: "어른에게",
    explanation: "'께서', '-해 주시다'를 사용하여 높임을 표현합니다.",
    gradeMin: 5,
  },
  {
    honorific: "교수님의 고견을 여쭙고 싶습니다.",
    casual: "교수님 의견을 물어보고 싶어요.",
    context: "어른에게",
    explanation: "'고견', '여쭙다'를 사용합니다.",
    gradeMin: 5,
  },
];

// ════════════════════════════════════════════════════════════
// ══ 맞춤법 규칙 식별 (Rule Identification) 패턴 ══
// ════════════════════════════════════════════════════════════
interface SpellingRulePattern {
  sentence: string;
  correct: string;
  wrong: string;
  rule: string;
  explanation: string;
  gradeMin: number;
}

export const SPELLING_RULE_PATTERNS: SpellingRulePattern[] = [
  // 사이시옷 규칙
  {
    sentence: "우리 집 ___에 나무가 있다.",
    correct: "뒷마당",
    wrong: "뒤마당",
    rule: "사이시옷 규칙",
    explanation:
      "순우리말 합성어에서 뒷소리가 된소리로 나면 사이시옷을 넣습니다.",
    gradeMin: 3,
  },
  {
    sentence: "___이 아름답다.",
    correct: "햇빛",
    wrong: "해빛",
    rule: "사이시옷 규칙",
    explanation: "순우리말 합성어에서 사이시옷이 필요합니다.",
    gradeMin: 3,
  },
  {
    sentence: "___를 정확히 세어 보자.",
    correct: "횟수",
    wrong: "회수",
    rule: "사이시옷 규칙 (예외)",
    explanation:
      "한자어 중 '곳간, 셋방, 숫자, 찻간, 횟수, 툇마루'에는 사이시옷을 넣습니다.",
    gradeMin: 4,
  },

  // 된소리 규칙
  {
    sentence: "별이 ___인다.",
    correct: "반짝",
    wrong: "반작",
    rule: "된소리 표기",
    explanation: "의성어·의태어에서는 된소리를 정확히 표기합니다.",
    gradeMin: 2,
  },

  // 겹받침 규칙
  {
    sentence: "이 연필의 ___이 비싸다.",
    correct: "값",
    wrong: "갑",
    rule: "겹받침 표기",
    explanation: "'값'은 겹받침 ㅄ(ㅂ+ㅅ)이 있는 단어입니다.",
    gradeMin: 2,
  },
  {
    sentence: "마당이 ___다.",
    correct: "넓",
    wrong: "널",
    rule: "겹받침 표기",
    explanation: "'넓다'는 겹받침 ㄼ(ㄹ+ㅂ)이 있는 단어입니다.",
    gradeMin: 2,
  },

  // 부사형 -이/-히 규칙
  {
    sentence: "방을 ___ 정리해라.",
    correct: "깨끗이",
    wrong: "깨끗히",
    rule: "부사형 '-이/-히' 구별",
    explanation: "받침이 ㅅ인 형용사는 '-이'를 붙입니다.",
    gradeMin: 3,
  },
  {
    sentence: "___ 말해 주세요.",
    correct: "솔직히",
    wrong: "솔직이",
    rule: "부사형 '-이/-히' 구별",
    explanation: "받침이 ㄱ인 형용사는 '-히'를 붙입니다.",
    gradeMin: 3,
  },
  {
    sentence: "___ 앉아 있어라.",
    correct: "가만히",
    wrong: "가만이",
    rule: "부사형 '-이/-히' 구별",
    explanation: "받침이 ㄴ인 형용사는 '-히'를 붙입니다.",
    gradeMin: 3,
  },
  {
    sentence: "___ 기다려라.",
    correct: "조용히",
    wrong: "조용이",
    rule: "부사형 '-이/-히' 구별",
    explanation: "받침이 ㅇ인 형용사는 '-히'를 붙입니다.",
    gradeMin: 3,
  },

  // 의존명사 띄어쓰기 규칙
  {
    sentence: "나는 ___ 있다.",
    correct: "할 수",
    wrong: "할수",
    rule: "의존명사 띄어쓰기",
    explanation: "의존명사(수, 것, 데, 줄, 만큼 등)는 앞말과 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    sentence: "하늘을 보니 비가 ___.",
    correct: "올 듯하다",
    wrong: "올듯하다",
    rule: "의존명사 띄어쓰기",
    explanation:
      "'듯'은 의존명사이므로 앞말과 띄어 쓰고, 보조용언 '듯하다'는 붙여 씁니다.",
    gradeMin: 3,
  },

  // 되/돼 규칙
  {
    sentence: "그렇게 하면 안 ___.",
    correct: "돼",
    wrong: "되",
    rule: "되/돼 구별",
    explanation:
      "'하여'로 바꿔 자연스러우면 '돼', '하다'로 바꿔 자연스러우면 '되'입니다.",
    gradeMin: 4,
  },
  {
    sentence: "선생님이 ___면 좋겠다.",
    correct: "되",
    wrong: "돼",
    rule: "되/돼 구별",
    explanation: "'하다'로 바꿔 '선생님이 하면'이 자연스러우므로 '되'입니다.",
    gradeMin: 4,
  },

  // 로서/로써 규칙
  {
    sentence: "대통령___의 책임이 있다.",
    correct: "으로서",
    wrong: "으로써",
    rule: "로서/로써 구별",
    explanation: "자격·지위를 나타낼 때 '로서'를 씁니다.",
    gradeMin: 5,
  },
  {
    sentence: "노력___만 성공할 수 있다.",
    correct: "으로써",
    wrong: "으로서",
    rule: "로서/로써 구별",
    explanation: "수단·방법을 나타낼 때 '로써'를 씁니다.",
    gradeMin: 5,
  },

  // 안/않 규칙
  {
    sentence: "나는 거짓말을 ___ 한다.",
    correct: "안",
    wrong: "않",
    rule: "안/않 구별",
    explanation:
      "'안'은 '아니'의 준말로 동사/형용사 앞에, '않'은 '-지 않다'에 씁니다.",
    gradeMin: 4,
  },
  {
    sentence: "그는 거짓말을 하지 ___는다.",
    correct: "않",
    wrong: "안",
    rule: "안/않 구별",
    explanation: "'-지 않다' 구조에서는 '않'을 씁니다.",
    gradeMin: 4,
  },
];

// ════════════════════════════════════════════════════════════
// ══ 받아쓰기 (Dictation) 문장 ══
// ════════════════════════════════════════════════════════════
interface DictationPattern {
  sentence: string;
  correct: string;
  wrong: string;
  explanation: string;
  gradeMin: number;
}

export const DICTATION_PATTERNS: DictationPattern[] = [
  // Grade 1
  {
    sentence: "나는 ___를 좋아해요.",
    correct: "꽃",
    wrong: "꼳",
    explanation: "'꽃'이 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    sentence: "오늘 ___이 좋아요.",
    correct: "날씨",
    wrong: "날시",
    explanation: "'날씨'가 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    sentence: "방이 아주 ___해요.",
    correct: "깨끗",
    wrong: "께끗",
    explanation: "'깨끗'이 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    sentence: "___이 있어요.",
    correct: "토끼",
    wrong: "토기",
    explanation: "'토끼'가 올바른 표기입니다. 된소리.",
    gradeMin: 1,
  },
  {
    sentence: "별이 ___ 빛나요.",
    correct: "반짝반짝",
    wrong: "반작반작",
    explanation: "'반짝반짝'이 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    sentence: "___을 입었어요.",
    correct: "옷",
    wrong: "옫",
    explanation: "'옷'이 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    sentence: "책을 ___어요.",
    correct: "읽",
    wrong: "익",
    explanation: "'읽다'가 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    sentence: "___에서 요리해요.",
    correct: "부엌",
    wrong: "부억",
    explanation: "'부엌'이 올바른 표기입니다.",
    gradeMin: 1,
  },

  // Grade 2
  {
    sentence: "나는 수영을 ___ 있다.",
    correct: "할 수",
    wrong: "할수",
    explanation: "의존명사 '수'는 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    sentence: "___이 지나갔다.",
    correct: "며칠",
    wrong: "몇일",
    explanation: "'며칠'이 올바른 표기입니다.",
    gradeMin: 2,
  },
  {
    sentence: "사과 ___를 먹었다.",
    correct: "한 개",
    wrong: "한개",
    explanation: "수 관형사와 단위명사는 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    sentence: "___에 도착했다.",
    correct: "학교",
    wrong: "학꾜",
    explanation: "'학교'가 올바른 표기입니다.",
    gradeMin: 2,
  },

  // Grade 3
  {
    sentence: "___이 떨어졌다.",
    correct: "나뭇잎",
    wrong: "나무잎",
    explanation: "사이시옷이 필요합니다: '나뭇잎'.",
    gradeMin: 3,
  },
  {
    sentence: "이 문제를 ___ 풀어야 할까?",
    correct: "어떻게",
    wrong: "어떡게",
    explanation: "'어떻게'가 올바른 부사형입니다.",
    gradeMin: 3,
  },
  {
    sentence: "문을 ___다.",
    correct: "잠그",
    wrong: "잠구",
    explanation: "'잠그다'가 올바른 표기입니다.",
    gradeMin: 3,
  },
  {
    sentence: "연필을 ___다.",
    correct: "깎",
    wrong: "깍",
    explanation: "'깎다'가 올바른 표기입니다.",
    gradeMin: 3,
  },

  // Grade 4
  {
    sentence: "할아버지의 ___가 어떻게 되세요?",
    correct: "연세",
    wrong: "나이",
    explanation: "어른의 나이는 '연세'라 합니다.",
    gradeMin: 4,
  },
  {
    sentence: "선생님을 ___겠습니다.",
    correct: "뵙",
    wrong: "봅",
    explanation: "'뵙다'가 올바른 높임말입니다.",
    gradeMin: 4,
  },

  // Grade 5-6
  {
    sentence: "네가 여기까지 오다니 ___이니?",
    correct: "웬일",
    wrong: "왠일",
    explanation: "'웬일'이 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    sentence: "일이 ___ 끝났다.",
    correct: "금세",
    wrong: "금새",
    explanation: "'금세'(금시에)가 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    sentence: "반장___의 책임을 다하겠다.",
    correct: "으로서",
    wrong: "으로써",
    explanation: "자격을 나타낼 때 '로서'가 올바릅니다.",
    gradeMin: 5,
  },
  {
    sentence: "가위___ 종이를 잘랐다.",
    correct: "로써",
    wrong: "로서",
    explanation: "수단·도구를 나타낼 때 '로써'가 올바릅니다.",
    gradeMin: 5,
  },
  {
    sentence: "마음이 ___다.",
    correct: "설레",
    wrong: "설래",
    explanation: "'설레다'가 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    sentence: "___가 피어올랐다.",
    correct: "아지랑이",
    wrong: "아지랭이",
    explanation: "'아지랑이'가 올바른 표기입니다.",
    gradeMin: 5,
  },
];

// ════════════════════════════════════════════════════════════
// ══ Generation Functions ══
// ════════════════════════════════════════════════════════════

type VariantType =
  | "spelling" // 기본 맞춤법 (q1 vs q2)
  | "dictation" // 받아쓰기
  | "spacing" // 띄어쓰기교정
  | "punctuation" // 문장부호
  | "honorific" // 존댓말/반말 변환
  | "rule"; // 맞춤법규칙

// Variant weights by grade (higher grades get more diverse question types)
function getVariantWeights(
  grade: number,
): { type: VariantType; weight: number }[] {
  if (grade <= 2) {
    return [
      { type: "spelling", weight: 50 },
      { type: "dictation", weight: 20 },
      { type: "spacing", weight: 10 },
      { type: "punctuation", weight: 10 },
      { type: "honorific", weight: 10 },
    ];
  }
  if (grade <= 4) {
    return [
      { type: "spelling", weight: 35 },
      { type: "dictation", weight: 15 },
      { type: "spacing", weight: 15 },
      { type: "punctuation", weight: 10 },
      { type: "honorific", weight: 15 },
      { type: "rule", weight: 10 },
    ];
  }
  // Grade 5-6
  return [
    { type: "spelling", weight: 30 },
    { type: "dictation", weight: 10 },
    { type: "spacing", weight: 15 },
    { type: "punctuation", weight: 10 },
    { type: "honorific", weight: 15 },
    { type: "rule", weight: 20 },
  ];
}

function pickVariant(
  rng: () => number,
  weights: { type: VariantType; weight: number }[],
): VariantType {
  const total = weights.reduce((s, w) => s + w.weight, 0);
  let r = rng() * total;
  for (const w of weights) {
    r -= w.weight;
    if (r <= 0) return w.type;
  }
  return weights[weights.length - 1].type;
}

function generateSpellingEntry(
  rng: () => number,
  grade: number,
  difficulty: 1 | 2 | 3,
  eligible: SpellingPattern[],
): SpellingEntry {
  const pattern = pickOne(rng, eligible);
  const answerThreshold = difficulty === 3 ? 0.5 : difficulty === 1 ? 0.3 : 0.4;
  const answerIsFirst = rng() > answerThreshold;

  // 정답과 오답의 받침 유무가 다르면(수라/밥, 구레나룻/구렛나루) 뒤따르는 조사가
  // 한쪽에서 깨져 정답이 그대로 드러난다. 삽입 낱말에 맞춰 조사를 교정한다.
  const sentenceTemplate = pattern.sentence.replace("{word}", "___");
  const q1 = fillBlankWithJosa(
    sentenceTemplate,
    answerIsFirst ? pattern.correct : pattern.wrong,
  );
  const q2 = fillBlankWithJosa(
    sentenceTemplate,
    answerIsFirst ? pattern.wrong : pattern.correct,
  );

  return {
    q1,
    q2,
    answer: answerIsFirst ? 1 : 2,
    explanation: pattern.explanation,
  };
}

function generateDictationEntry(
  rng: () => number,
  grade: number,
): SpellingEntry | null {
  const eligible = DICTATION_PATTERNS.filter((p) => p.gradeMin <= grade);
  if (eligible.length === 0) return null;
  const pattern = pickOne(rng, eligible);
  const answerIsFirst = rng() > 0.5;

  const q1 = fillBlankWithJosa(
    pattern.sentence,
    answerIsFirst ? pattern.correct : pattern.wrong,
  );
  const q2 = fillBlankWithJosa(
    pattern.sentence,
    answerIsFirst ? pattern.wrong : pattern.correct,
  );

  return {
    q1,
    q2,
    answer: answerIsFirst ? 1 : 2,
    explanation: `[받아쓰기] ${pattern.explanation}`,
  };
}

function generateSpacingEntry(
  rng: () => number,
  grade: number,
): SpellingEntry | null {
  const eligible = SPACING_PATTERNS.filter((p) => p.gradeMin <= grade);
  if (eligible.length === 0) return null;
  const pattern = pickOne(rng, eligible);
  const answerIsFirst = rng() > 0.5;

  return {
    q1: answerIsFirst ? pattern.correct : pattern.wrong,
    q2: answerIsFirst ? pattern.wrong : pattern.correct,
    answer: answerIsFirst ? 1 : 2,
    explanation: `[띄어쓰기] ${pattern.explanation}`,
  };
}

function generatePunctuationEntry(
  rng: () => number,
  grade: number,
): SpellingEntry | null {
  const eligible = PUNCTUATION_PATTERNS.filter((p) => p.gradeMin <= grade);
  if (eligible.length === 0) return null;
  const pattern = pickOne(rng, eligible);
  const answerIsFirst = rng() > 0.5;

  return {
    q1: answerIsFirst ? pattern.correct : pattern.wrong,
    q2: answerIsFirst ? pattern.wrong : pattern.correct,
    answer: answerIsFirst ? 1 : 2,
    explanation: `[문장부호] ${pattern.explanation}`,
  };
}

function generateHonorificEntry(
  rng: () => number,
  grade: number,
): SpellingEntry | null {
  const eligible = HONORIFIC_PATTERNS.filter((p) => p.gradeMin <= grade);
  if (eligible.length === 0) return null;
  const pattern = pickOne(rng, eligible);
  const answerIsFirst = rng() > 0.5;

  // 어른에게 말할 때: honorific이 정답
  const correct = pattern.honorific;
  const wrong = pattern.casual;

  return {
    q1: answerIsFirst ? correct : wrong,
    q2: answerIsFirst ? wrong : correct,
    answer: answerIsFirst ? 1 : 2,
    explanation: `[존댓말] ${pattern.explanation}`,
  };
}

function generateRuleEntry(
  rng: () => number,
  grade: number,
): SpellingEntry | null {
  const eligible = SPELLING_RULE_PATTERNS.filter((p) => p.gradeMin <= grade);
  if (eligible.length === 0) return null;
  const pattern = pickOne(rng, eligible);
  const answerIsFirst = rng() > 0.5;

  const q1 = fillBlankWithJosa(
    pattern.sentence,
    answerIsFirst ? pattern.correct : pattern.wrong,
  );
  const q2 = fillBlankWithJosa(
    pattern.sentence,
    answerIsFirst ? pattern.wrong : pattern.correct,
  );

  return {
    q1,
    q2,
    answer: answerIsFirst ? 1 : 2,
    explanation: `[${pattern.rule}] ${pattern.explanation}`,
  };
}

export function generateSpellingProblems(
  grade: number,
  count: number,
  seed: number,
  difficulty: 1 | 2 | 3 = 2,
): SpellingEntry[] {
  const rng = seededRandom(seed);
  let eligible = SPELLING_PATTERNS.filter((p) => p.gradeMin <= grade);

  // Apply difficulty filtering on the eligible patterns
  if (difficulty !== 2 && eligible.length > 5) {
    const cutoff40 = Math.ceil(eligible.length * 0.4);
    if (difficulty === 1) {
      // Easy: first 40% (common/simple patterns)
      eligible = eligible.slice(0, cutoff40);
    } else {
      // Hard: last 40% (tricky edge cases)
      eligible = eligible.slice(eligible.length - cutoff40);
    }
  }

  const variantWeights = getVariantWeights(grade);
  const results: SpellingEntry[] = [];

  for (let i = 0; i < count; i++) {
    const variant = pickVariant(rng, variantWeights);
    let entry: SpellingEntry | null = null;

    switch (variant) {
      case "dictation":
        entry = generateDictationEntry(rng, grade);
        break;
      case "spacing":
        entry = generateSpacingEntry(rng, grade);
        break;
      case "punctuation":
        entry = generatePunctuationEntry(rng, grade);
        break;
      case "honorific":
        entry = generateHonorificEntry(rng, grade);
        break;
      case "rule":
        entry = generateRuleEntry(rng, grade);
        break;
    }

    // Fallback to basic spelling if variant has no eligible content
    if (!entry) {
      entry = generateSpellingEntry(rng, grade, difficulty, eligible);
    }

    results.push(entry);
  }

  return results;
}

export function generateSpellingPool(
  grade: number,
  dayOfYear: number,
  difficulty: 1 | 2 | 3 = 2,
): SpellingEntry[] {
  return generateSpellingProblems(
    grade,
    300,
    dayOfYear * 1000 + grade * 100 + 77,
    difficulty,
  );
}
