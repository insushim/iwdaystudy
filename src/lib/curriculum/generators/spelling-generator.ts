/**
 * Procedural Spelling Problem Generator
 * Generates grade-appropriate Korean spelling problems algorithmically.
 */
import type { SpellingEntry } from "@/types/curriculum";

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

// Common Korean spelling mistake patterns
interface SpellingPattern {
  correct: string;
  wrong: string;
  explanation: string;
  gradeMin: number;
  sentence?: string; // 전용 문장 템플릿 (있으면 범용 템플릿 대신 사용, {word} 플레이스홀더)
}

const SPELLING_PATTERNS: SpellingPattern[] = [
  // Grade 1-2: Basic patterns
  {
    correct: "되다",
    wrong: "돼다",
    explanation: "'되다'가 기본형입니다.",
    gradeMin: 1,
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
  },
  {
    correct: "개",
    wrong: "게",
    explanation: "강아지 한 '개'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "강아지 한 {word}가 있어요.",
  },
  {
    correct: "네",
    wrong: "내",
    explanation: "'네'(당신의)와 '내'(나의)를 구별합니다.",
    gradeMin: 1,
    sentence: "{word} 가방이 예뻐요.",
  },

  // 된소리/거센소리 혼동
  {
    correct: "깨끗하다",
    wrong: "께끗하다",
    explanation: "'깨끗하다'가 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "뚝딱",
    wrong: "뚝닥",
    explanation: "'뚝딱'이 올바른 의태어입니다.",
    gradeMin: 1,
  },
  {
    correct: "번쩍",
    wrong: "번적",
    explanation: "'번쩍'이 올바른 의태어입니다.",
    gradeMin: 1,
  },
  {
    correct: "반짝반짝",
    wrong: "반작반작",
    explanation: "'반짝반짝'이 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "깜짝",
    wrong: "깜작",
    explanation: "'깜짝'이 올바른 표기입니다.",
    gradeMin: 1,
  },

  // 받침 혼동
  {
    correct: "닭",
    wrong: "닥",
    explanation: "'닭'이 올바른 표기입니다. 겹받침 ㄺ.",
    gradeMin: 1,
  },
  {
    correct: "흙",
    wrong: "흑",
    explanation: "'흙'이 올바른 표기입니다. 겹받침 ㄺ.",
    gradeMin: 1,
  },
  {
    correct: "읽다",
    wrong: "익다",
    explanation: "'읽다'가 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "책을 {word}.",
  },
  {
    correct: "없다",
    wrong: "업다",
    explanation: "'없다'가 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "있다",
    wrong: "잇다",
    explanation: "'있다'가 올바른 표기입니다. 쌍시옷 받침.",
    gradeMin: 1,
  },

  // Grade 2-3: 띄어쓰기
  {
    correct: "할 수 있다",
    wrong: "할수있다",
    explanation: "'할 수 있다'처럼 의존명사는 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "할 줄 안다",
    wrong: "할줄 안다",
    explanation: "'할 줄 안다'로 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "먹을 만큼",
    wrong: "먹을만큼",
    explanation: "'만큼'은 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "올 때",
    wrong: "올때",
    explanation: "'때'는 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "갈 데가 없다",
    wrong: "갈데가 없다",
    explanation: "'데'는 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "한 개",
    wrong: "한개",
    explanation: "수 관형사와 단위명사는 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "세 살",
    wrong: "세살",
    explanation: "수 관형사와 단위명사는 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "두 마리",
    wrong: "두마리",
    explanation: "수 관형사와 단위명사는 띄어 씁니다.",
    gradeMin: 2,
  },

  // Grade 3-4: 사이시옷
  {
    correct: "나뭇잎",
    wrong: "나무잎",
    explanation: "사이시옷이 필요합니다: '나뭇잎'.",
    gradeMin: 3,
  },
  {
    correct: "잇몸",
    wrong: "이몸",
    explanation: "'잇몸'이 올바른 표기입니다.",
    gradeMin: 3,
  },
  {
    correct: "깻잎",
    wrong: "깨잎",
    explanation: "'깻잎'이 올바른 표기입니다.",
    gradeMin: 3,
  },
  {
    correct: "콧물",
    wrong: "코물",
    explanation: "'콧물'이 올바른 표기입니다.",
    gradeMin: 3,
  },
  {
    correct: "햇볕",
    wrong: "해볕",
    explanation: "'햇볕'이 올바른 표기입니다.",
    gradeMin: 3,
  },
  {
    correct: "핏줄",
    wrong: "피줄",
    explanation: "'핏줄'이 올바른 표기입니다.",
    gradeMin: 3,
  },
  {
    correct: "귓속",
    wrong: "귀속",
    explanation: "'귓속'이 올바른 표기입니다.",
    gradeMin: 3,
  },

  // Grade 3-4: 혼동하기 쉬운 표현
  {
    correct: "어떡해",
    wrong: "어떻해",
    explanation: "'어떡해'(어떻게 해)가 올바른 표현입니다.",
    gradeMin: 3,
  },
  {
    correct: "어떻게",
    wrong: "어떡게",
    explanation: "'어떻게'가 올바른 부사형입니다.",
    gradeMin: 3,
  },
  {
    correct: "가르치다",
    wrong: "가리키다",
    explanation: "'가르치다'(teach)와 '가리키다'(point)는 다릅니다.",
    gradeMin: 3,
  },
  {
    correct: "다르다",
    wrong: "틀리다",
    explanation: "'다르다'(different)와 '틀리다'(wrong)는 다릅니다.",
    gradeMin: 3,
  },
  {
    correct: "바라다",
    wrong: "바래다",
    explanation: "'바라다'(wish)가 올바른 표기입니다.",
    gradeMin: 3,
  },
  {
    correct: "며칠",
    wrong: "몇일",
    explanation: "'며칠'이 올바른 표기입니다.",
    gradeMin: 3,
  },
  {
    correct: "설거지",
    wrong: "설겆이",
    explanation: "'설거지'가 올바른 표기입니다.",
    gradeMin: 3,
  },

  // Grade 4-5: 높임/겸양
  {
    correct: "드시다",
    wrong: "먹으시다",
    explanation: "어른에게는 '드시다'가 올바른 높임말입니다.",
    gradeMin: 4,
  },
  {
    correct: "주무시다",
    wrong: "자시다",
    explanation: "'주무시다'가 올바른 높임말입니다.",
    gradeMin: 4,
  },
  {
    correct: "돌아가시다",
    wrong: "죽으시다",
    explanation: "'돌아가시다'가 올바른 높임 표현입니다.",
    gradeMin: 4,
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
  },
  {
    correct: "왠지",
    wrong: "웬지",
    explanation: "'왠지'(왜인지)가 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    correct: "로서",
    wrong: "로써",
    explanation: "'로서'는 자격, '로써'는 수단입니다.",
    gradeMin: 5,
  },
  {
    correct: "든지",
    wrong: "던지",
    explanation: "'든지'는 선택, '던지'는 과거 회상입니다.",
    gradeMin: 5,
  },
  {
    correct: "데",
    wrong: "대",
    explanation: "'데'(것, 곳)와 '대'(말을 전달)를 구별합니다.",
    gradeMin: 5,
  },
  {
    correct: "안 되다",
    wrong: "않 되다",
    explanation: "'안'(부정)과 '않'(-지 않다)을 구별합니다.",
    gradeMin: 5,
  },
  {
    correct: "넓이",
    wrong: "널비",
    explanation: "'넓이'가 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    correct: "낫다",
    wrong: "낳다",
    explanation: "'낫다'(better)와 '낳다'(bear)를 구별합니다.",
    gradeMin: 5,
    sentence: "이것이 저것보다 {word}.",
  },
  {
    correct: "맞히다",
    wrong: "맞추다",
    explanation: "정답을 '맞히다', 서로 대조하는 것은 '맞추다'입니다.",
    gradeMin: 5,
    sentence: "정답을 {word}.",
  },
  {
    correct: "부딪히다",
    wrong: "부딪치다",
    explanation: "'부딪히다'가 표준어입니다.",
    gradeMin: 5,
  },
  {
    correct: "깨끗이",
    wrong: "깨끗히",
    explanation: "'깨끗이'가 올바른 부사형입니다.",
    gradeMin: 5,
  },
  {
    correct: "일찍이",
    wrong: "일찍히",
    explanation: "'일찍이'가 올바른 부사형입니다.",
    gradeMin: 5,
  },

  // ──── 추가: Grade 1-2 기초 맞춤법 ────
  {
    correct: "예쁘다",
    wrong: "이쁘다",
    explanation: "'예쁘다'가 표준어입니다.",
    gradeMin: 1,
  },
  {
    correct: "아니요",
    wrong: "아니오",
    explanation: "'아니요'가 올바른 대답 표현입니다.",
    gradeMin: 1,
  },
  {
    correct: "됐다",
    wrong: "됬다",
    explanation: "'됐다'(되었다)가 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "갖다",
    wrong: "갗다",
    explanation: "'갖다'가 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "짧다",
    wrong: "짦다",
    explanation: "'짧다'가 올바른 표기입니다. 겹받침 ㄼ.",
    gradeMin: 1,
  },
  {
    correct: "넓다",
    wrong: "널다",
    explanation: "'넓다'가 올바른 표기입니다. 겹받침 ㄼ.",
    gradeMin: 1,
  },
  {
    correct: "삶다",
    wrong: "삼다",
    explanation: "'삶다'가 올바른 표기입니다. 겹받침 ㄻ.",
    gradeMin: 1,
  },
  {
    correct: "앉다",
    wrong: "안다",
    explanation: "'앉다'가 올바른 표기입니다. 겹받침 ㄵ.",
    gradeMin: 1,
  },
  {
    correct: "값",
    wrong: "갑",
    explanation: "'값'이 올바른 표기입니다. 겹받침 ㄿ.",
    gradeMin: 1,
  },

  // ──── 추가: Grade 2-3 띄어쓰기·의존명사 ────
  {
    correct: "할 것",
    wrong: "할것",
    explanation: "'것'은 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "될 수 있다",
    wrong: "될수있다",
    explanation: "'수'는 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "갈 곳",
    wrong: "갈곳",
    explanation: "관형사형 뒤 명사는 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "한 번",
    wrong: "한번",
    explanation: "횟수를 나타낼 때 '번'은 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "열 개",
    wrong: "열개",
    explanation: "수 관형사와 단위명사는 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "다섯 명",
    wrong: "다섯명",
    explanation: "수 관형사와 단위명사는 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "네 시",
    wrong: "네시",
    explanation: "수 관형사와 단위명사는 띄어 씁니다.",
    gradeMin: 2,
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
  },
  {
    correct: "뒷문",
    wrong: "뒤문",
    explanation: "'뒷문'이 올바른 표기입니다.",
    gradeMin: 3,
  },
  {
    correct: "윗옷",
    wrong: "위옷",
    explanation: "'윗옷'이 올바른 표기입니다.",
    gradeMin: 3,
  },
  {
    correct: "아랫사람",
    wrong: "아래사람",
    explanation: "'아랫사람'이 올바른 표기입니다.",
    gradeMin: 3,
  },
  {
    correct: "찻잔",
    wrong: "차잔",
    explanation: "'찻잔'이 올바른 표기입니다.",
    gradeMin: 3,
  },
  {
    correct: "뱃사람",
    wrong: "배사람",
    explanation: "'뱃사람'이 올바른 표기입니다.",
    gradeMin: 3,
  },
  {
    correct: "곰곰이",
    wrong: "곰곰히",
    explanation: "'곰곰이'가 올바른 부사형입니다.",
    gradeMin: 3,
  },
  {
    correct: "일일이",
    wrong: "일일히",
    explanation: "'일일이'가 올바른 부사형입니다.",
    gradeMin: 3,
  },

  // ──── 추가: Grade 3-4 혼동 표현 ────
  {
    correct: "벌이다",
    wrong: "벌리다",
    explanation: "'벌이다'(일을 시작하다)와 '벌리다'(넓게 펴다)는 다릅니다.",
    gradeMin: 3,
  },
  {
    correct: "잠그다",
    wrong: "잠구다",
    explanation: "'잠그다'가 올바른 표기입니다.",
    gradeMin: 3,
  },
  {
    correct: "담그다",
    wrong: "담구다",
    explanation: "'담그다'가 올바른 표기입니다.",
    gradeMin: 3,
  },
  {
    correct: "시키다",
    wrong: "식히다",
    explanation: "주문하다의 뜻일 때 '시키다'가 올바릅니다.",
    gradeMin: 3,
    sentence: "음식을 {word}.",
  },

  // ──── 추가: Grade 4-5 높임·겸양 ────
  {
    correct: "여쭈다",
    wrong: "여쭤보다",
    explanation: "'여쭈다'가 올바른 높임말입니다.",
    gradeMin: 4,
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
  },
  {
    correct: "금세",
    wrong: "금새",
    explanation: "'금세'(금시에)가 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    correct: "어이없다",
    wrong: "어의없다",
    explanation: "'어이없다'가 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    correct: "오랜만",
    wrong: "오랫만",
    explanation: "'오랜만'이 아니라 '오랜만에'가 올바릅니다.",
    gradeMin: 5,
  },
  {
    correct: "뒤치다꺼리",
    wrong: "뒷치닥거리",
    explanation: "'뒤치다꺼리'가 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    correct: "윗어른",
    wrong: "위어른",
    explanation: "'윗어른'이 올바른 표기입니다.",
    gradeMin: 5,
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
  },
  {
    correct: "알맞은",
    wrong: "알맞는",
    explanation: "'알맞은'이 올바른 관형형입니다.",
    gradeMin: 5,
  },
  {
    correct: "역할",
    wrong: "역활",
    explanation: "'역할'이 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    correct: "되레",
    wrong: "도리어",
    explanation: "'되레'와 '도리어' 모두 표준어이나, '되려'는 비표준입니다.",
    gradeMin: 5,
  },
  {
    correct: "거칠다",
    wrong: "거치르다",
    explanation: "'거칠다'가 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    correct: "삼가다",
    wrong: "삼가하다",
    explanation: "'삼가다'가 올바른 표기입니다.",
    gradeMin: 5,
  },

  // ──── 추가 확장: Grade 1-2 받침 혼동 ────
  {
    correct: "꽃",
    wrong: "꼳",
    explanation: "'꽃'이 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "옷",
    wrong: "옫",
    explanation: "'옷'이 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "낮",
    wrong: "낫",
    explanation: "시간을 뜻할 때 '낮'이 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "{word}에 해가 밝다.",
  },
  {
    correct: "솥",
    wrong: "솓",
    explanation: "'솥'이 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "밭",
    wrong: "받",
    explanation: "'밭'이 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "숲",
    wrong: "숩",
    explanation: "'숲'이 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "부엌",
    wrong: "부억",
    explanation: "'부엌'이 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "젖다",
    wrong: "젇다",
    explanation: "'젖다'가 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "볶다",
    wrong: "복다",
    explanation: "'볶다'가 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "삶",
    wrong: "삼",
    explanation: "생활을 뜻할 때 '삶'이 올바른 표기입니다.",
    gradeMin: 1,
    sentence: "행복한 {word}을 살다.",
  },
  {
    correct: "넋",
    wrong: "넉",
    explanation: "'넋'이 올바른 표기입니다. 겹받침 ㄳ.",
    gradeMin: 1,
  },
  {
    correct: "핥다",
    wrong: "할다",
    explanation: "'핥다'가 올바른 표기입니다.",
    gradeMin: 1,
  },

  // ──── 추가 확장: Grade 1-2 된소리·거센소리 ────
  {
    correct: "싸우다",
    wrong: "사우다",
    explanation: "'싸우다'가 올바른 표기입니다. 된소리.",
    gradeMin: 1,
  },
  {
    correct: "빠르다",
    wrong: "바르다",
    explanation: "속도가 빠를 때 '빠르다'가 올바릅니다.",
    gradeMin: 1,
    sentence: "토끼는 달리기가 {word}.",
  },
  {
    correct: "쓰다",
    wrong: "스다",
    explanation: "글을 쓸 때 '쓰다'가 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "오빠",
    wrong: "오바",
    explanation: "'오빠'가 올바른 표기입니다. 된소리.",
    gradeMin: 1,
  },
  {
    correct: "아빠",
    wrong: "아바",
    explanation: "'아빠'가 올바른 표기입니다. 된소리.",
    gradeMin: 1,
  },
  {
    correct: "토끼",
    wrong: "토기",
    explanation: "'토끼'가 올바른 표기입니다. 된소리.",
    gradeMin: 1,
  },
  {
    correct: "꼬리",
    wrong: "코리",
    explanation: "'꼬리'가 올바른 표기입니다. 된소리.",
    gradeMin: 1,
  },
  {
    correct: "까치",
    wrong: "카치",
    explanation: "'까치'가 올바른 표기입니다. 된소리.",
    gradeMin: 1,
  },
  {
    correct: "뽀뽀",
    wrong: "보보",
    explanation: "'뽀뽀'가 올바른 표기입니다. 된소리.",
    gradeMin: 1,
  },
  {
    correct: "쏘다",
    wrong: "소다",
    explanation: "동작을 뜻할 때 '쏘다'가 올바릅니다.",
    gradeMin: 1,
    sentence: "활을 {word}.",
  },

  // ──── 추가 확장: Grade 1-2 기초 맞춤법 ────
  {
    correct: "안녕하세요",
    wrong: "안녕하새요",
    explanation: "'안녕하세요'가 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "고맙습니다",
    wrong: "고맙슴니다",
    explanation: "'고맙습니다'가 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "감사합니다",
    wrong: "감사함니다",
    explanation: "'감사합니다'가 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "그렇습니다",
    wrong: "그렇슴니다",
    explanation: "'그렇습니다'가 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "괜찮다",
    wrong: "괜챦다",
    explanation: "'괜찮다'가 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "어른",
    wrong: "얼은",
    explanation: "'어른'이 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "다섯",
    wrong: "다선",
    explanation: "'다섯'이 올바른 표기입니다.",
    gradeMin: 1,
  },
  {
    correct: "여섯",
    wrong: "여선",
    explanation: "'여섯'이 올바른 표기입니다.",
    gradeMin: 1,
  },

  // ──── 추가 확장: Grade 2-3 띄어쓰기 ────
  {
    correct: "볼 만하다",
    wrong: "볼만하다",
    explanation: "'만하다' 앞의 관형사형은 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "먹을 뿐",
    wrong: "먹을뿐",
    explanation: "'뿐'은 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "할 뻔했다",
    wrong: "할뻔했다",
    explanation: "'뻔'은 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "갈 적에",
    wrong: "갈적에",
    explanation: "'적'은 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "먹은 지",
    wrong: "먹은지",
    explanation: "'지'(시간 경과)는 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "올 듯하다",
    wrong: "올듯하다",
    explanation: "'듯'은 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "갈 바를",
    wrong: "갈바를",
    explanation: "'바'는 의존명사이므로 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "세 장",
    wrong: "세장",
    explanation: "수 관형사와 단위명사는 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "일곱 송이",
    wrong: "일곱송이",
    explanation: "수 관형사와 단위명사는 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "여덟 그루",
    wrong: "여덟그루",
    explanation: "수 관형사와 단위명사는 띄어 씁니다.",
    gradeMin: 2,
  },
  {
    correct: "나도 모르게",
    wrong: "나도모르게",
    explanation: "조사 '도'는 붙여 쓰고 나머지는 띄어 씁니다.",
    gradeMin: 2,
  },

  // ──── 추가 확장: Grade 3-4 사잇시옷 ────
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
  },
  {
    correct: "햇빛",
    wrong: "해빛",
    explanation: "'햇빛'이 올바른 표기입니다.",
    gradeMin: 3,
  },
  {
    correct: "뒷산",
    wrong: "뒤산",
    explanation: "'뒷산'이 올바른 표기입니다.",
    gradeMin: 3,
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
  },
  {
    correct: "곳곳",
    wrong: "곧곧",
    explanation: "'곳곳'이 올바른 표기입니다.",
    gradeMin: 3,
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
    correct: "부치다",
    wrong: "붙이다",
    explanation: "편지를 보낼 때 '부치다'가 올바릅니다.",
    gradeMin: 3,
    sentence: "편지를 {word}.",
  },
  {
    correct: "붙이다",
    wrong: "부치다",
    explanation: "풀로 붙일 때 '붙이다'가 올바릅니다.",
    gradeMin: 3,
    sentence: "풀로 종이를 {word}.",
  },
  {
    correct: "맞추다",
    wrong: "맞히다",
    explanation: "서로 비교할 때 '맞추다'가 올바릅니다.",
    gradeMin: 3,
    sentence: "답을 서로 {word}.",
  },
  {
    correct: "바치다",
    wrong: "받치다",
    explanation: "나라에 헌신할 때 '바치다'가 올바릅니다.",
    gradeMin: 3,
    sentence: "나라에 목숨을 {word}.",
  },
  {
    correct: "받치다",
    wrong: "바치다",
    explanation: "아래에서 받쳐 줄 때 '받치다'가 올바릅니다.",
    gradeMin: 3,
    sentence: "손으로 턱을 {word}.",
  },
  {
    correct: "늘이다",
    wrong: "늘리다",
    explanation: "길이를 길게 할 때 '늘이다'가 올바릅니다.",
    gradeMin: 3,
    sentence: "고무줄을 {word}.",
  },
  {
    correct: "늘리다",
    wrong: "늘이다",
    explanation: "양이나 수를 많게 할 때 '늘리다'가 올바릅니다.",
    gradeMin: 3,
    sentence: "인원을 {word}.",
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
    sentence: "아는 {word}를 하다.",
  },
  {
    correct: "켜다",
    wrong: "키다",
    explanation: "불을 켤 때 '켜다'가 올바릅니다.",
    gradeMin: 3,
    sentence: "불을 {word}.",
  },
  {
    correct: "끄다",
    wrong: "꺼다",
    explanation: "'끄다'가 올바른 표기입니다.",
    gradeMin: 3,
    sentence: "불을 {word}.",
  },
  {
    correct: "잃다",
    wrong: "잊다",
    explanation: "물건을 잃어버릴 때 '잃다'가 올바릅니다.",
    gradeMin: 3,
    sentence: "물건을 {word}.",
  },
  {
    correct: "잊다",
    wrong: "잃다",
    explanation: "기억을 잊을 때 '잊다'가 올바릅니다.",
    gradeMin: 3,
    sentence: "약속을 {word}.",
  },

  // ──── 추가 확장: Grade 3-4 부사형 ────
  {
    correct: "가까이",
    wrong: "가까히",
    explanation: "'가까이'가 올바른 부사형입니다.",
    gradeMin: 3,
  },
  {
    correct: "반듯이",
    wrong: "반듯히",
    explanation: "'반듯이'(반듯하게)가 올바른 부사형입니다.",
    gradeMin: 3,
  },
  {
    correct: "반드시",
    wrong: "반듯이",
    explanation: "'꼭'의 뜻일 때 '반드시'가 올바릅니다.",
    gradeMin: 3,
    sentence: "약속은 {word} 지켜야 한다.",
  },
  {
    correct: "깨끗이",
    wrong: "깨끗히",
    explanation: "받침이 ㅅ인 경우 '-이'를 씁니다.",
    gradeMin: 3,
  },
  {
    correct: "따뜻이",
    wrong: "따뜻히",
    explanation: "'따뜻이'가 올바른 부사형입니다.",
    gradeMin: 3,
  },
  {
    correct: "가만히",
    wrong: "가만이",
    explanation: "'가만히'가 올바른 부사형입니다.",
    gradeMin: 3,
  },
  {
    correct: "조용히",
    wrong: "조용이",
    explanation: "'조용히'가 올바른 부사형입니다.",
    gradeMin: 3,
  },
  {
    correct: "솔직히",
    wrong: "솔직이",
    explanation: "'솔직히'가 올바른 부사형입니다.",
    gradeMin: 3,
  },

  // ──── 추가 확장: Grade 4-5 높임·겸양 ────
  {
    correct: "계시다",
    wrong: "있으시다",
    explanation: "어른이 계실 때 '계시다'가 올바른 높임말입니다.",
    gradeMin: 4,
  },
  {
    correct: "잡수시다",
    wrong: "먹으시다",
    explanation: "'잡수시다'는 '드시다'와 같은 높임말입니다.",
    gradeMin: 4,
  },
  {
    correct: "모시다",
    wrong: "데리다",
    explanation: "어른을 동반할 때 '모시다'가 올바릅니다.",
    gradeMin: 4,
    sentence: "할머니를 {word}.",
  },
  {
    correct: "데리다",
    wrong: "모시다",
    explanation: "아이를 동반할 때 '데리다'가 올바릅니다.",
    gradeMin: 4,
    sentence: "동생을 {word}.",
  },
  {
    correct: "여쭈다",
    wrong: "물어보다",
    explanation: "어른에게 물을 때 '여쭈다'가 올바른 높임말입니다.",
    gradeMin: 4,
    sentence: "선생님께 {word}.",
  },
  {
    correct: "드리다",
    wrong: "주다",
    explanation: "어른에게 줄 때 '드리다'가 올바른 높임말입니다.",
    gradeMin: 4,
    sentence: "할아버지께 {word}.",
  },
  {
    correct: "말씀드리다",
    wrong: "말하다",
    explanation: "어른에게 말할 때 '말씀드리다'가 올바릅니다.",
    gradeMin: 4,
    sentence: "부모님께 {word}.",
  },
  {
    correct: "뵙다",
    wrong: "보다",
    explanation: "어른을 만날 때 '뵙다'가 올바른 높임말입니다.",
    gradeMin: 4,
    sentence: "선생님을 {word}.",
  },
  {
    correct: "편찮으시다",
    wrong: "아프시다",
    explanation: "어른이 아프실 때 '편찮으시다'가 올바른 높임말입니다.",
    gradeMin: 4,
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
  },
  {
    correct: "안 돼요",
    wrong: "안 되요",
    explanation: "'안 돼요'가 올바른 표현입니다. '되어요'의 줄임.",
    gradeMin: 5,
  },
  {
    correct: "돼지",
    wrong: "되지",
    explanation: "동물을 뜻할 때 '돼지'가 올바릅니다.",
    gradeMin: 5,
    sentence: "{word}가 꿀꿀 울었다.",
  },
  {
    correct: "되돌아가다",
    wrong: "돼돌아가다",
    explanation: "'되돌아가다'가 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    correct: "다 됐다",
    wrong: "다 됬다",
    explanation: "'됐다'(되었다)가 올바른 줄임입니다.",
    gradeMin: 5,
  },

  // ──── 추가 확장: Grade 5-6 데/대 구별 ────
  {
    correct: "나도 그런 데가 있어",
    wrong: "나도 그런 대가 있어",
    explanation: "'데'(곳, 경우)는 의존명사, '대'는 전달 표현입니다.",
    gradeMin: 5,
  },
  {
    correct: "학교에 갔다고 하는 대요",
    wrong: "학교에 갔다고 하는 데요",
    explanation: "남의 말을 전할 때 '대'가 올바릅니다.",
    gradeMin: 5,
  },

  // ──── 추가 확장: Grade 5-6 로서/로써 구별 ────
  {
    correct: "학생으로서 해야 할 일",
    wrong: "학생으로써 해야 할 일",
    explanation: "자격을 나타낼 때 '로서'가 올바릅니다.",
    gradeMin: 5,
  },
  {
    correct: "연필로써 그림을 그렸다",
    wrong: "연필로서 그림을 그렸다",
    explanation: "수단·도구를 나타낼 때 '로써'가 올바릅니다.",
    gradeMin: 5,
  },

  // ──── 추가 확장: Grade 5-6 혼동 맞춤법 ────
  {
    correct: "곧이곧대로",
    wrong: "고지곧대로",
    explanation: "'곧이곧대로'가 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    correct: "설레다",
    wrong: "설래다",
    explanation: "'설레다'가 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    correct: "아지랑이",
    wrong: "아지랭이",
    explanation: "'아지랑이'가 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    correct: "구렛나루",
    wrong: "구레나룻",
    explanation: "'구렛나루'가 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    correct: "남사스럽다",
    wrong: "남우세스럽다",
    explanation: "'남사스럽다'가 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    correct: "거뜬하다",
    wrong: "거뜬히다",
    explanation: "'거뜬하다'가 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    correct: "일찍이",
    wrong: "일찌기",
    explanation: "'일찍이'가 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    correct: "바라다",
    wrong: "바래다",
    explanation: "소원을 빌 때 '바라다'가 올바릅니다.",
    gradeMin: 5,
    sentence: "행복을 {word}.",
  },
  {
    correct: "바래다",
    wrong: "바라다",
    explanation: "색이 변할 때 '바래다'가 올바릅니다.",
    gradeMin: 5,
    sentence: "옷 색이 {word}.",
  },
  {
    correct: "낫다",
    wrong: "났다",
    explanation: "'더 낫다'가 올바른 표기입니다.",
    gradeMin: 5,
    sentence: "이것이 더 {word}.",
  },
  {
    correct: "낳다",
    wrong: "낫다",
    explanation: "아이를 낳을 때 '낳다'가 올바릅니다.",
    gradeMin: 5,
    sentence: "아이를 {word}.",
  },
  {
    correct: "째째하다",
    wrong: "쨰쨰하다",
    explanation: "'째째하다'가 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    correct: "느긋하다",
    wrong: "느긋타다",
    explanation: "'느긋하다'가 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    correct: "뒤집다",
    wrong: "뒷집다",
    explanation: "'뒤집다'가 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    correct: "예스럽다",
    wrong: "옛스럽다",
    explanation: "'예스럽다'가 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    correct: "삐지다",
    wrong: "삐치다",
    explanation: "'삐지다'(토라지다)가 올바릅니다.",
    gradeMin: 5,
  },
  {
    correct: "요컨대",
    wrong: "요컨데",
    explanation: "'요컨대'가 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    correct: "일컫다",
    wrong: "일컸다",
    explanation: "'일컫다'가 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    correct: "넉넉히",
    wrong: "넉넉이",
    explanation: "'넉넉히'가 올바른 부사형입니다.",
    gradeMin: 5,
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
  },
  {
    correct: "오랜만에",
    wrong: "오랫만에",
    explanation: "'오랜만에'가 올바른 표기입니다.",
    gradeMin: 5,
  },
  {
    correct: "내로라하다",
    wrong: "내노라하다",
    explanation: "'내로라하다'가 올바른 표기입니다.",
    gradeMin: 5,
  },
];

// Sentence templates that incorporate the patterns
interface SentenceTemplate {
  template: string; // {word} placeholder
  gradeMin: number;
}

const SENTENCE_TEMPLATES: SentenceTemplate[] = [
  { template: "오늘 {word} 좋겠다.", gradeMin: 1 },
  { template: "엄마가 {word}.", gradeMin: 1 },
  { template: "아빠와 {word}.", gradeMin: 1 },
  { template: "친구가 {word}.", gradeMin: 1 },
  { template: "강아지가 {word}.", gradeMin: 1 },
  { template: "학교에서 {word}.", gradeMin: 1 },
  { template: "놀이터에서 {word}.", gradeMin: 1 },
  { template: "선생님이 {word}.", gradeMin: 2 },
  { template: "동생과 함께 {word}.", gradeMin: 2 },
  { template: "주말에 가족과 {word}.", gradeMin: 2 },
  { template: "도서관에서 {word}.", gradeMin: 3 },
  { template: "방학 동안 {word}.", gradeMin: 3 },
  { template: "우리 반에서 {word}.", gradeMin: 3 },
  { template: "과학 시간에 {word}.", gradeMin: 4 },
  { template: "사회 수업에서 {word}.", gradeMin: 4 },
  { template: "발표할 때 {word}.", gradeMin: 5 },
  { template: "보고서를 쓸 때 {word}.", gradeMin: 5 },
  { template: "토론에서 {word}.", gradeMin: 6 },

  // ──── 추가 문장 템플릿 ────
  { template: "집에서 {word}.", gradeMin: 1 },
  { template: "아침에 {word}.", gradeMin: 1 },
  { template: "저녁에 {word}.", gradeMin: 1 },
  { template: "동물원에서 {word}.", gradeMin: 1 },
  { template: "가게에서 {word}.", gradeMin: 1 },
  { template: "할머니 댁에서 {word}.", gradeMin: 2 },
  { template: "공원에서 {word}.", gradeMin: 2 },
  { template: "수업 시간에 {word}.", gradeMin: 2 },
  { template: "점심시간에 {word}.", gradeMin: 2 },
  { template: "체험학습에서 {word}.", gradeMin: 3 },
  { template: "미술 시간에 {word}.", gradeMin: 3 },
  { template: "음악 시간에 {word}.", gradeMin: 3 },
  { template: "체육 시간에 {word}.", gradeMin: 3 },
  { template: "시험 볼 때 {word}.", gradeMin: 4 },
  { template: "편지를 쓸 때 {word}.", gradeMin: 4 },
  { template: "일기를 쓸 때 {word}.", gradeMin: 4 },
  { template: "독후감에서 {word}.", gradeMin: 5 },
  { template: "논설문에서 {word}.", gradeMin: 6 },
];

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

  let templates = SENTENCE_TEMPLATES.filter((t) => t.gradeMin <= grade);

  // Hard mode: use more complex sentence templates (higher gradeMin)
  if (difficulty === 3 && templates.length > 5) {
    const cutoff40 = Math.ceil(templates.length * 0.4);
    templates = templates.slice(templates.length - cutoff40);
  }

  const results: SpellingEntry[] = [];

  for (let i = 0; i < count; i++) {
    const pattern = pickOne(rng, eligible);
    const template = pickOne(rng, templates);
    // Hard: more balanced (50/50), Easy: answer is first more often (70%)
    const answerThreshold =
      difficulty === 3 ? 0.5 : difficulty === 1 ? 0.3 : 0.4;
    const answerIsFirst = rng() > answerThreshold;

    // 패턴에 전용 문장이 있으면 우선 사용 (문맥 호환성 보장)
    const sentenceTemplate = pattern.sentence || template.template;
    const q1 = sentenceTemplate.replace(
      "{word}",
      answerIsFirst ? pattern.correct : pattern.wrong,
    );
    const q2 = sentenceTemplate.replace(
      "{word}",
      answerIsFirst ? pattern.wrong : pattern.correct,
    );

    results.push({
      q1,
      q2,
      answer: answerIsFirst ? 1 : 2,
      explanation: pattern.explanation,
    });
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
