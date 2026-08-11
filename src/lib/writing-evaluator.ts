/**
 * 순수 코드 기반 글쓰기 평가 엔진 v7 (API 없음, 외부 전송 없음)
 * 초등학생 개인정보 보호 준수
 *
 * v7 변경사항 (전부 오프라인·결정론):
 * - 음절 통계 게이트: 번들 교육과정 코퍼스(71만 음절)에서 추출한 상용 음절표로
 *   "무의미 한글 나열"(자모·반복이 아닌 진짜 아무말) 감지 — 소프트 캡 + 극단 차단
 * - 프롬프트 복붙 방어: 글감 문장을 그대로 배껴 글자수를 채우면 평가에서 제외
 * - 마침표 없는 글 문장 분리: 종결어미(+공백) 기준 보조 분리
 * - 맞춤법 흔한 오류 감지(안전한 확정 패턴만): 팁 제공 + 2개 이상이면 경미 감점
 * - 구체성 신호 보너스: 대화문(따옴표)·수량 표현·의성어/의태어·비유(처럼/마치/듯)
 * - 구간 TTR(windowed type-token ratio): 긴 글에서 같은 낱말 재활용 감지
 * - 어미 다양성 패턴 확장(군요/구나/거예요/게요/는데/니까/반말 어미)
 * - 2개 토큰 교대 반복("재밌다 좋다 재밌다 좋다 …") gibberish 차단
 *
 * v5~v6: 연속 점수, 문장 평균 길이, 어미 다양성, 주제 관련성, 의미 밀도,
 *        키워드 스터핑 게이트, 하드 gibberish 감지
 */

export interface WritingEvalResult {
  score: number; // 0~10
  stars: number; // 1~5
  feedback: string; // 칭찬 한 마디
  tip: string; // 개선 제안
  details: {
    length: number; // 0~3
    sentences: number; // 0~2
    variety: number; // 0~3
    structure: number; // 0~2
  };
}

// ── 접속사/연결어 (종류별) ──────────────────────────────────────
const CONJ_REASON = ["왜냐하면", "왜냐면", "그 이유는", "이유는", "왜냐"];
const CONJ_ORDER = [
  "먼저",
  "처음에",
  "처음으로",
  "다음으로",
  "그 다음",
  "마지막으로",
  "끝으로",
  "그리고 나서",
];
const CONJ_CONTRAST = [
  "하지만",
  "그러나",
  "그렇지만",
  "반면에",
  "그런데",
  "오히려",
];
const CONJ_ADD = [
  "그리고",
  "또한",
  "게다가",
  "더불어",
  "뿐만 아니라",
  "그뿐만",
];
const CONJ_RESULT = [
  "그래서",
  "따라서",
  "그러므로",
  "결국",
  "그 결과",
  "그러니",
];
const CONJ_EXAMPLE = ["예를 들어", "예를 들면", "특히", "특별히", "예컨대"];

// ── 감정·심리 표현 ─────────────────────────────────────────────
const EMOTION_WORDS = [
  "기쁘",
  "슬프",
  "화나",
  "행복",
  "무섭",
  "신기",
  "신나",
  "재미있",
  "즐겁",
  "설레",
  "기분",
  "마음",
  "느낌",
  "감동",
  "놀라",
  "걱정",
  "두렵",
  "자랑스럽",
  "뿌듯",
  "아쉽",
  "그립",
  "보고싶",
  "사랑",
  "부끄럽",
  "당황",
  "실망",
  "흥미",
  "궁금",
  "깜짝",
  "외롭",
  "답답",
  "후회",
  "감사",
  "고마",
  "미안",
  "속상",
  "든든",
  "편안",
  "불안",
];

// ── 구체적 묘사어 (색·크기·감각) ─────────────────────────────
const DESCRIPTIVE_WORDS = [
  "빨간",
  "파란",
  "노란",
  "초록",
  "흰",
  "검은",
  "분홍",
  "보라",
  "하늘색",
  "갈색",
  "크",
  "작",
  "넓",
  "좁",
  "높",
  "낮",
  "길",
  "짧",
  "두껍",
  "얇",
  "무거",
  "가볍",
  "맛있",
  "달콤",
  "쓴",
  "짠",
  "시큼",
  "매운",
  "향기",
  "냄새",
  "시끄럽",
  "조용",
  "부드럽",
  "딱딱",
  "차갑",
  "뜨겁",
  "따뜻",
  "시원",
  "촉촉",
  "빠르",
  "느리",
  "밝",
  "어둡",
  "깨끗",
  "더럽",
  "예쁜",
  "아름다",
  "멋진",
  "귀여",
  "새로",
  "오래된",
  "신선",
  "상쾌",
  "포근",
  "싱싱",
  "축축",
  "건조",
];

// ── 시간 표현 ──────────────────────────────────────────────────
const TIME_EXPRESSIONS = [
  "오늘",
  "어제",
  "내일",
  "아침",
  "점심",
  "저녁",
  "밤",
  "방금",
  "아까",
  "나중에",
  "그때",
  "옛날",
  "지금",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
  "일요일",
  "봄",
  "여름",
  "가을",
  "겨울",
  "방학",
  "주말",
];

// ── 장소 표현 ──────────────────────────────────────────────────
const PLACE_WORDS = [
  "학교",
  "집",
  "교실",
  "운동장",
  "도서관",
  "공원",
  "마트",
  "시장",
  "병원",
  "놀이터",
  "수영장",
  "바다",
  "산",
  "강",
  "숲",
  "마을",
  "거리",
  "길",
  "방",
  "부엌",
  "거실",
  "화장실",
  "계단",
  "옥상",
  "지하",
];

// ── 마무리 표현 ────────────────────────────────────────────────
const ENDING_PATTERNS = [
  "것 같다",
  "것 같아",
  "것 같습니다",
  "좋겠다",
  "좋겠어",
  "좋겠습니다",
  "하고 싶다",
  "하고 싶어",
  "하고 싶습니다",
  "기억에 남",
  "잊지 못",
  "행복했",
  "즐거웠",
  "재미있었",
  "뿌듯했",
  "감사했",
  "다음에도",
  "앞으로",
  "나중에",
  "배웠다",
  "배웠어",
  "알게 되었",
  "알았다",
  "알았어",
  "노력하겠",
  "노력할",
  "그런 하루",
  "그런 날",
  "좋은 하루",
  "좋은 날",
  "끝",
  "이상입니다",
  "마칩니다",
];

// ── 도입 표현 ──────────────────────────────────────────────────
const OPENING_PATTERNS = [
  "오늘은",
  "오늘",
  "어제",
  "내일",
  "나는",
  "저는",
  "우리",
  "가장",
  "제일",
  "정말",
  "진짜",
  "만약",
  "혹시",
  "언제",
];

// ── 기능어 (조사, 어미 등 - 의미 밀도 계산용) ──────────────────
const FUNCTION_WORDS = [
  "은",
  "는",
  "이",
  "가",
  "을",
  "를",
  "에",
  "에서",
  "으로",
  "로",
  "와",
  "과",
  "의",
  "도",
  "만",
  "까지",
  "부터",
  "보다",
  "그",
  "이",
  "저",
  "것",
  "수",
  "때",
  "더",
  "안",
  "못",
  "잘",
  "아주",
  "매우",
  "너무",
  "정말",
  "진짜",
  "참",
];

// ── 조사 (어절 끝 분리용 - 경량 형태 전처리) ───────────────────
// 형태소 분석기 없이(오프라인·프라이버시 유지) 어절 끝 조사를 규칙으로 떼어
// 내용어 판별·주제 관련성 매칭·prose 판정에 사용한다.
const JOSA_MULTI = [
  "으로부터", "에서는", "에게서", "으로서", "으로써", "에게는", "이라고",
  "이라는", "에서", "에게", "한테", "께서", "으로", "처럼", "보다", "까지",
  "부터", "조차", "마다", "밖에", "라고", "라는", "이랑", "이나",
];
const JOSA_SINGLE = [
  "은", "는", "이", "가", "을", "를", "에", "와", "과", "의", "도", "만",
  "로", "랑",
];

// 내용 매칭용: 짧은 명사 보호(2자 이하는 단일 조사 분리 안 함)
function stripJosa(word: string): string {
  for (const j of JOSA_MULTI) {
    if (word.length > j.length && word.endsWith(j)) return word.slice(0, -j.length);
  }
  if (word.length >= 3) {
    for (const j of JOSA_SINGLE) {
      if (word.endsWith(j)) return word.slice(0, -1);
    }
  }
  return word;
}

// prose 판정용: 어절이 조사로 끝나는지(짧은 어절도 적극 인정 - 오탐은 안전한 방향)
function endsWithJosa(word: string): boolean {
  for (const j of JOSA_MULTI) {
    if (word.length > j.length && word.endsWith(j)) return true;
  }
  for (const j of JOSA_SINGLE) {
    if (word.length > j.length && word.endsWith(j)) return true;
  }
  return false;
}

// 조사 부착 비율(prose-ness): 키워드 나열(조사 없는 단어 나열) 탐지용
function josaRatio(words: string[]): number {
  if (words.length === 0) return 0;
  return words.filter(endsWithJosa).length / words.length;
}

// ── 대명사·지시어·접속부사 어간 (의미 밀도 계산용) ─────────────
const FUNCTION_STEMS = new Set([
  ...FUNCTION_WORDS,
  "그것", "이것", "저것", "여기", "거기", "저기", "그곳", "이곳", "무엇",
  "누구", "어디", "언제", "그리고", "그래서", "그러나", "하지만", "그런데",
  "그러므로", "따라서", "또한", "그러면", "그리하여",
]);

// ── 상용 음절표 (v7) ───────────────────────────────────────────
// 앱에 번들된 1~6학년 교육과정 코퍼스(총 713,921음절)에서 3회 이상 등장한
// 음절 1,268개. 초등 어휘의 99%+를 커버한다. 이 표에 없는 음절이 비정상적으로
// 많으면 "아무 글자나 조합한 한글 나열"로 판단한다. (고유명사·게임 이름 등이
// 일부 섞이는 정상 글은 임계값 아래에 안전하게 머문다 — 소프트 신호로만 사용)
const COMMON_SYLLABLES: Set<string> = new Set("이다는요에을가어의은기하해한지를서사리고수로전물나자있것아라인도과면시안보학으문대구동화주세니장소정상만생식바게일우무비스교야성위명설제개들부유모내용여운국적거음계와람미때원입분할산공연그중오경재었방려른예마표간관글통력선양독올약체신했치발르날반조강건진말실호알되역달드추두래터단먹활러차태심놀회피레색법감등험좋작불속된써민울배각형름행습많결합질트점현년없술더않늘맞영환종변타받줄파온노금절셈새품곳열히권친져매크복직저쓰악림았란폭워빛집엇난루필평까논처초씨살번석겨남따높후너확판목책린존길백같든토뜻디편록눈잘돌천데끼키버프당류함근큰육네별견쪽능향임포빠침업코담북머손꽃순풍극움읽증께본출랑누몸님충월준빨외청며돼특답벌걸곱넓갔료느급얼족삼론규창던광왕접넣풀못넷카플싶렸긴힘격칙투축찰참병탄먼잡맛막밤잠최깨균뜨철떤갈메떨밀항졌채징폐베효농탈염언엄박암볼잎옷뛰녀립돈쟁슬커땅럼혼낮락율줘검므뺄패응액켜밥붙깊콤황덧웠귀쳐뒤앞왔익칠봄숨둥혁굴될군퍼뉴즈착김릴찬셨끗흐털떡찾허량례짓끄갑런죽브테꼭씁덕망념닌궁쓴승녹쥐였택꿀꾸싸났팔련흡눗넘뿌티끝혀봉즐십억옛쓸깔탕둘골애쉬꿈짜턴탐럽측밖떻씩틀곤벽짝놓협숲령웃페옥블째낙압앗쁜씻완혈짧믿봐섬빈띄섯뼈떠곡괴취밝뇌춘핵몇총범칭득얻햇꺼헌슴닥쌓콘빌획롭흙찍홍잃춤숙틱낸슷센송끌촌콩희컴클밭좌훈윤렌칼또듯션튼케흔듣혜랐퓨빵닷곰왜멈릿냄앉겠죄슨욕톤층빗뭇겼얀섞빼옳맺뻐킨팽엽삶폰멸흘벼헤멀꾼쳤픈탑엔츠뀌횡젖껴멍붕맥뽑낌륙녁벗흥맑텐푸듬릅첫흑밑딱끓쇠쁘됩겉숫껍퇴닫똑객잔앙썼솔척엘숭빙뚜휘겁볶닭벨냉덜큼널끈쉽늬휴닦끊랫엉셔왼탁픽낳맡쾌헬짐냈낼쌀켓퀴쇄렀싹꼬핑핀옮덩냥켰졸낀잇뱀춰섭혹값힌멋돕닐즘삭컵펼칸됐랜펜봇팀씀률웨캐빅룡찌펴깃납닿딪묶릇즉흰챙몽뢰촉뿐몰맨웅뻤윗옆덮딸꿔픔렇귄콜캠뒷펭깥킹템갖묘걱링렁갯램곧낫귤겹융깜녕컨싱폴뷰팥늑캔멧긍겸햄랍넉삐봅롱댁킬윷뀐꺾틴쿠첨깎꽂뿔뜬몬눌묵릉좁걷봤굳젊끔팬둔묻눕렵줍쏘쌍릎낭뉘얗셋엌늦뭄홀붓돋랙슈굽쁨텃잤텔깡젠녘낄렬빔뿜싫뭉팅갓셀벤붉맹깍싼룬튜컬혔캥옴겪멜뱅샀잊낱얇닝덟홉샤썰딜뭐덤궐솜꼼땀짹롤튕줬웰웬앵윈폼잉딧밸넌짤갛뉜뺍팠엣큐걀밍딩튀댓랗킵볍렷뚱톡꼴룩샘벚옹밟짭찮썹촛덥앱왠껏맵럭뱃쿨렛뮤펠탔쉴둠둡쿄꽥짱뚝뚤풋팩젤솟엿낯얽쏟촬뾰팡빚갇뻔쫓찡훌륭굿럿럴룸핫힐셜셰섰괄눠큽킥빡갱쭉챔짠븐펫샌홈렉릭젓좀땠냇렴씹슘둑꽹댐콕녔쭈펑넛킷렐낚펄흩떼긋틈쪼띠춥톱칫델껑찜쇼땡쉰턱룰톨캡틸앨뻗볕략굵첩뚫듭뽀뵙쉼엠괜즌팝콥숟랭믹칩탱횟랄뱉뜯몫썩쩍닮됬꽉됨꼈펀밴싯텍씬헨왓닛켈짙댔꿨즙끽컹킁얘꿇쪄꿋셧쾅쯤첼떴퉁펌옵삽냐뭘뫼늙꿰뜰틔멩꼽늄싣탭궜갉훨쫄밋넥벅깐갤퓰벳닉윙탬롯륨쁠폈갚읍콧튤긁륜닙뤄짚찢쏠욱흉씌찻맴뜩륵밌맣쩔꽁쫀괭냅겔헉쿤캣샐잼핸텅댄헝콰엑젝궤핏깝짖깼췄찔똥믐뛴넬둬혐엎뜀솥옇핥컸쌩솝셴뒀윔쿡캘숏딥탉캄덴팟퀘돗텀슐펙곽귈쌈땄멘괘뀔툼얕훼딤멕겆맙룻굣띔쿵푹꿩놈눔깁롬랏랬듦쬐벙볏궂앤썸탠랩웜켄툴쉐톰툰겐쟀쌌뜸쑥뇽컷잰웹넨씽헹딘뼉귓옫넋툇엾헷섣쭙뺨렘펐랴엮및겄썻벘젔닢핬쏴낡봣넜얹쳇찧");

// 상용 음절표 밖 음절 비율 (10음절 미만이면 판정 보류 = 0)
function rareSyllableRatio(text: string): number {
  const syl = text.match(/[가-힣]/g);
  if (!syl || syl.length < 10) return 0;
  let rare = 0;
  for (const s of syl) {
    if (!COMMON_SYLLABLES.has(s)) rare++;
  }
  return rare / syl.length;
}

// ── 의성어·의태어 (구체성 보너스용) ────────────────────────────
const ONOMATOPOEIA = [
  "깡충깡충", "반짝반짝", "살금살금", "두근두근", "콩닥콩닥", "데굴데굴",
  "빙글빙글", "씽씽", "쌩쌩", "펄쩍", "폴짝", "살랑살랑", "솔솔",
  "주룩주룩", "쨍쨍", "후다닥", "허겁지겁", "룰루랄라", "방긋", "활짝",
  "깔깔", "엉엉", "훌쩍", "꼬르륵", "꿀꺽", "냠냠", "아삭아삭",
  "바삭바삭", "몽글몽글", "보들보들", "푹신푹신", "미끌미끌", "첨벙첨벙",
  "찰랑찰랑", "뭉게뭉게", "터벅터벅", "성큼성큼", "살며시", "슬금슬금",
  "우당탕", "쿵쾅쿵쾅", "부릉부릉", "딩동", "똑딱", "짹짹", "멍멍",
  "야옹", "꽥꽥", "삐약", "꿀꿀", "덜덜", "덜컹", "출렁", "파닥",
  "번쩍", "휙", "쓱쓱", "슥슥", "졸졸", "보글보글", "부글부글",
];

// ── 맞춤법 흔한 오류 (안전한 확정 패턴만 — 문맥 무관하게 항상 틀린 표기) ──
const SPELLING_ERRORS: [wrong: string, right: string][] = [
  ["됬", "됐"],
  ["되요", "돼요"],
  ["되서", "돼서"],
  ["몇일", "며칠"],
  ["웬지", "왠지"],
  ["왠만", "웬만"],
  ["할께", "할게"],
  ["갈께", "갈게"],
  ["줄께", "줄게"],
  ["할꺼", "할 거"],
  ["어떻해", "어떡해"],
  ["오랫만", "오랜만"],
  ["곰곰히", "곰곰이"],
  ["희안", "희한"],
  ["역활", "역할"],
  ["설레임", "설렘"],
  ["않되", "안 되"],
  ["않돼", "안 돼"],
  ["않했", "안 했"],
];

// 어절 시작에서만 매칭해야 하는 패턴 (복합어 경계 오탐 방지: "지역활동"의 "역활" 등)
const SPELLING_WORD_START = new Set(["역활", "희안"]);

function findSpellingErrors(text: string): [string, string][] {
  const found: [string, string][] = [];
  const tokens = text.split(/\s+/);
  for (const [wrong, right] of SPELLING_ERRORS) {
    const hit = SPELLING_WORD_START.has(wrong)
      ? tokens.some((t) => t.startsWith(wrong))
      : text.includes(wrong);
    if (hit) found.push([wrong, right]);
  }
  return found;
}

// ── 구체성 신호 (대화문·수량·비유) ─────────────────────────────
const DIALOGUE_REGEX = /["'“‘][^"'“”‘’\n]{2,30}["'”’]/;
const NUMBER_UNIT_REGEX =
  /(\d+|[한두세네]|다섯|여섯|일곱|여덟|아홉|열)\s?(개|명|번|살|분|마리|권|송이|그루|켤레|판|장|병|잔|조각|층|배|시간|바퀴)/;
const SIMILE_REGEX = /(처럼|마치\s|듯이|듯한|듯했)/;

// ── 흔한 이모티콘 자모 (gibberish 오탐 방지: ㅋㅋ·ㅎㅎ·ㅠㅠ 등) ──
function stripEmoticons(text: string): string {
  return text
    .replace(/[ㅋㅎㅠㅜ]+/g, " ")
    .replace(/[ㅗㅡ]{2,}/g, " ");
}

// ── 학년대 (minChars로 추정: 20=저, 50=중, 100=고) ─────────────
type GradeBand = "low" | "mid" | "high";
function gradeBandFromMinChars(minChars: number): GradeBand {
  if (minChars <= 25) return "low";
  if (minChars <= 70) return "mid";
  return "high";
}

// ── 주제(프롬프트) 키워드 추출 + 본문 관련성 ───────────────────
const PROMPT_STOPWORDS = new Set([
  "자유", "자유롭게", "대해", "대한", "대하여", "관해", "관한", "무엇",
  "어떤", "생각", "느낀", "느낌", "오늘", "이야기", "문장", "적어",
  "적어보", "글쓰기", "주제", "써보", "보세요", "하세요", "해보", "쓰기",
  "내용", "여러분", "우리", "나의", "너의", "자신", "경험",
  // (v7) 글감의 뼈대일 뿐 본문에 그대로 안 나와도 되는 범용어 확장
  "가장", "제일", "이유", "소개", "함께", "하루", "최근", "요즘",
  "어떻게", "어디", "누구", "언제", "무슨", "기억", "인상", "특별",
  "있었던", "겪었던", "내가", "제가",
]);
// (v7) 명령형·청유형 어미로 끝나는 어절은 글감 지시어라 키워드가 아님
const PROMPT_VERB_ENDING =
  /(세요|보세요|주세요|봅시다|볼까요|할까요|인가요|일까요|나요|까요|해요|어요|아요)$/;
// 프롬프트 키워드 추출: 명령형 어미 어절 제외 + 조사 분리(2글자 명사 보호 —
// "가을"→"가" 같은 주제어 소실 방지. 분리 못 한 범용어가 남아도 coverage
// 임계 0.2가 낮아 정상 글에 벌점을 주지 않는다)
function extractPromptKeywords(prompt: string): string[] {
  const ws = extractWords(prompt)
    .filter((w) => !PROMPT_VERB_ENDING.test(w))
    .map(stripJosa)
    .filter((w) => w.length >= 2 && !PROMPT_STOPWORDS.has(w));
  return [...new Set(ws)];
}
// (v7) 어형 변화 허용 매칭: "속상했던"↔"속상했다", "재미있었던"↔"재미있었다"처럼
// 같은 어간의 다른 활용형을 인정한다 — 공통 접두가 2자 이상이고
// 짧은 쪽 길이-1 이상이면 같은 낱말로 본다 (학교/학원처럼 1자 공통은 불인정).
function stemsMatch(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  let shared = 0;
  const n = Math.min(a.length, b.length);
  while (shared < n && a[shared] === b[shared]) shared++;
  return shared >= Math.max(2, n - 1);
}
// 본문 어간이 프롬프트 키워드를 얼마나 다루는지 (0~1 coverage)
function topicRelevance(essayStems: Set<string>, keywords: string[]): number {
  if (keywords.length < 2) return 1; // 자유주제/짧은 프롬프트 → 관련성 평가 안 함
  let hit = 0;
  for (const k of keywords) {
    for (const s of essayStems) {
      if (s.length >= 2 && stemsMatch(s, k)) {
        hit++;
        break;
      }
    }
  }
  return hit / keywords.length;
}

// ── 프롬프트 복붙 방어 (v7) ────────────────────────────────────
// 글감 문장을 통째로 배껴 글자수를 채우는 꼼수 차단: 본문에서 프롬프트
// 전체 문자열(끝 구두점 차이 허용)을 제거한 뒤 평가한다.
// 프롬프트 일부 표현을 자연스럽게 빌려 쓰는 것은 그대로 인정된다.
function stripPromptEcho(text: string, prompt?: string): string {
  if (!prompt) return text;
  const p = prompt.trim();
  if (p.length < 8) return text;
  let out = text.split(p).join(" ");
  const pCore = p.replace(/[?.!~\s]+$/g, "");
  if (pCore.length >= 8) out = out.split(pCore).join(" ");
  return out.replace(/\s{2,}/g, " ").trim();
}

// ── 흔한 어미 패턴 (다양성 측정용) ─────────────────────────────
// 구체(긴) 패턴을 앞에 두어 일반 /다/·/요/에 의한 섀도잉을 방지한다.
const ENDING_SUFFIXES = [
  /거든요[.\s!?~]*$/,
  /잖아요[.\s!?~]*$/,
  /답니다[.\s!?~]*$/,
  /습니다[.\s!?~]*$/,
  /ㅂ니다[.\s!?~]*$/,
  /거예요[.\s!?~]*$/,
  /게요[.\s!?~]*$/,
  /군요[.\s!?~]*$/,
  /구나[.\s!?~]*$/,
  /는데[.\s!?~]*$/,
  /니까[.\s!?~]*$/,
  /었다[.\s!?~]*$/,
  /았다[.\s!?~]*$/,
  /였다[.\s!?~]*$/,
  /했다[.\s!?~]*$/,
  /ㄴ다[.\s!?~]*$/,
  /네요[.\s!?~]*$/,
  /어요[.\s!?~]*$/,
  /아요[.\s!?~]*$/,
  /래요[.\s!?~]*$/,
  /데요[.\s!?~]*$/,
  /지요[.\s!?~]*$/,
  /세요[.\s!?~]*$/,
  /까요[.\s!?~]*$/,
  /죠[.\s!?~]*$/,
  /했어[.\s!?~]*$/,
  /었어[.\s!?~]*$/,
  /았어[.\s!?~]*$/,
  /지[.\s!?~]*$/,
  /야[.\s!?~]*$/,
  /해[.\s!?~]*$/,
  /요[.\s!?~]*$/,
  /다[.\s!?~]*$/,
];

// ── 쓰레기 텍스트 패턴 ────────────────────────────────────────
const JAMO_REPEAT_REGEX = /[ㄱ-ㅎㅏ-ㅣ]{2,}/g;
const CHAR_REPEAT_REGEX = /(.)\1{2,}/g;
const JAMO_ONLY_REGEX = /^[ㄱ-ㅎㅏ-ㅣ]+$/;
const NUMBER_ONLY_REGEX = /^\d+$/;
const ALPHA_GIBBERISH_REGEX = /^[a-zA-Z]{5,}$/;
const JAMO_ANY_REGEX = /[ㄱ-ㅎㅏ-ㅣ]/g;
const KOREAN_SYLLABLE_REGEX = /[가-힣]/g;
const CHAR_LONG_REPEAT_REGEX = /(.)\1{4,}/;

/**
 * 공백을 무시한 최장 저주기 반복 블록 길이.
 * "아라아라아라…"처럼 짧은 음절 뭉치를 공백 없이 반복해 분량만 채우는 장난은
 * 토큰이 1개라 어절 기반 검사(패턴 반복·토큰 빈도·어간 집중)를 전부 우회한다.
 * 문자 수준에서 주기 1~6의 연속 반복 구간 최대 길이를 재 그 사각지대를 막는다.
 * (period 1 = "ㅋㅋㅋ"류지만 그건 CHAR_LONG_REPEAT가 이미 잡음 — 여기선 2~6이 핵심)
 */
function maxLowPeriodRun(chars: string): number {
  let best = 0;
  for (let p = 1; p <= 6; p++) {
    let matches = 0;
    for (let i = p; i < chars.length; i++) {
      if (chars[i] === chars[i - p]) {
        matches++;
        if (matches + p > best) best = matches + p;
      } else {
        matches = 0;
      }
    }
  }
  return best;
}

// ── 헬퍼 함수들 ────────────────────────────────────────────────

/**
 * 하드 gibberish 감지: 명백히 장난·무의미 텍스트인지 판단
 * 걸리면 총점 0으로 강제 확정
 * (v7) export: UI(WritingPrompt)의 제출 차단도 같은 판정을 쓰도록 단일화 —
 * 두 파일에 사본을 두면 한쪽만 업데이트되는 드리프트가 생긴다.
 */
export function isHardGibberish(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length === 0) return true;
  // 흔한 이모티콘(ㅋㅋ·ㅎㅎ·ㅠㅠ)은 비율 판정에서 제외 → 정상 아동글 오탐 방지
  const deEmo = stripEmoticons(trimmed);
  const chars = deEmo.replace(/\s/g, "");
  if (chars.length === 0) return true; // 이모티콘/공백만 있으면 장난

  // 1) 자모(ㄱ-ㅎ, ㅏ-ㅣ) 비율이 15% 이상이면 장난
  const jamoMatch = chars.match(JAMO_ANY_REGEX);
  const jamoCount = jamoMatch ? jamoMatch.length : 0;
  if (jamoCount / chars.length >= 0.15) return true;

  // 2) 완성형 한글이 30% 미만이면 장난
  const koreanMatch = chars.match(KOREAN_SYLLABLE_REGEX);
  const koreanCount = koreanMatch ? koreanMatch.length : 0;
  if (koreanCount / chars.length < 0.3) return true;

  // 3) 같은 글자가 5회 이상 연속 반복
  if (CHAR_LONG_REPEAT_REGEX.test(chars)) return true;

  // 3-b) 공백 없는 짧은 음절 뭉치 반복 ("아라아라아라…"로 분량 채우기).
  //      주기 2~6의 반복 블록이 14자 이상이면(예: "아라"×7) 장난으로 본다.
  //      정상 글에 저주기 14자 연속 반복은 사실상 없어 오탐이 나지 않는다.
  if (maxLowPeriodRun(chars) >= 14) return true;

  // 4) 공백 없는 긴 덩어리 (한 단어만 15자+) — 단, 정상 한글 문장의
  //    띄어쓰기 누락은 장난이 아니므로 완성형 한글 비율이 낮을 때만 차단
  const tokens = trimmed.split(/\s+/).filter((w) => w.length >= 1);
  if (
    trimmed.length >= 15 &&
    tokens.length < 2 &&
    koreanCount / chars.length < 0.6
  ) {
    return true;
  }

  // 5) 한 토큰이 전체의 70% 이상 (오늘 오늘 오늘 …)
  if (tokens.length >= 4) {
    const freq: Record<string, number> = {};
    for (const tk of tokens) freq[tk] = (freq[tk] || 0) + 1;
    const maxFreq = Math.max(...Object.values(freq));
    if (maxFreq / tokens.length >= 0.7) return true;
  }

  // 6) (v7) 토큰 6개 이상인데 고유 토큰이 2개 이하 (두 단어 교대 반복)
  if (tokens.length >= 6 && new Set(tokens).size <= 2) return true;

  // 7) (v7) 상용 음절표 밖 음절이 55% 이상 (아무 글자 조합 한글 나열)
  if (rareSyllableRatio(chars) >= 0.55) return true;

  return false;
}

function cleanJunkText(text: string): string {
  let cleaned = text;
  cleaned = cleaned.replace(JAMO_REPEAT_REGEX, "");
  cleaned = cleaned.replace(CHAR_REPEAT_REGEX, "$1");
  cleaned = cleaned.replace(/\s{2,}/g, " ");
  return cleaned.trim();
}

function extractWords(text: string): string[] {
  return (
    text
      .replace(/[^가-힣ᄀ-ᇿ㄰-㆏a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 2)
      .filter((w) => !JAMO_ONLY_REGEX.test(w))
      .filter((w) => !NUMBER_ONLY_REGEX.test(w))
      .filter((w) => !ALPHA_GIBBERISH_REGEX.test(w))
      // (v7.1) 숫자 제거 정규화: "가가0은/가가1은"처럼 숫자만 바꿔 고유 단어를
      // 불리는 우회 차단. "3개"→"개"(1자)는 탈락하지만 수량 보너스는
      // NUMBER_UNIT_REGEX가 원문에서 따로 인정하므로 손실 없음.
      .map((w) => w.replace(/\d+/g, ""))
      .filter((w) => w.length >= 2)
  );
}

// (v7) 마침표 없이 이어 쓴 글 보조 분리: 확실한 종결어미 + 공백 + 한글 시작.
// lookbehind는 구형 브라우저 파싱 오류 위험이 있어 lookahead + 마커 삽입 방식 사용.
const SOFT_SENTENCE_END =
  /(습니다|었다|았다|였다|했다|네요|지요|세요|어요|아요|거든요|답니다|군요|는다)\s+(?=[가-힣"'“‘])/g;

function splitSentences(text: string): string[] {
  const hard = text.split(/[.!?~]+|\n+/);
  const out: string[] = [];
  for (const piece of hard) {
    const t = piece.trim();
    if (t.length === 0) continue;
    if (t.length >= 25) {
      // 긴 덩어리만 보조 분리 (짧은 문장은 오분리 위험 > 이득)
      out.push(...t.replace(SOFT_SENTENCE_END, "$1\u0000").split("\u0000"));
    } else {
      out.push(t);
    }
  }
  return out.map((s) => s.trim()).filter((s) => s.length >= 3);
}

function setOverlapRatio(wordsA: Set<string>, wordsB: Set<string>): number {
  if (wordsA.size === 0 && wordsB.size === 0) return 1;
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let overlap = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++;
  }
  return overlap / Math.max(wordsA.size, wordsB.size);
}

// (v7.1) 성능: 문장별 단어 집합을 1회만 추출해 쌍별 재파싱 제거(기존 O(s²)회
// extractWords → O(s)회). 비교 문장 수도 상한(120)으로 캡.
const DUP_CHECK_MAX_SENTENCES = 120;
function detectDuplicateSentences(sentences: string[]): number {
  if (sentences.length <= 1) return 0;
  const capped = sentences.slice(0, DUP_CHECK_MAX_SENTENCES);
  const sets = capped.map((s) => new Set(extractWords(s)));
  let duplicates = 0;
  for (let i = 0; i < capped.length; i++) {
    for (let j = i + 1; j < capped.length; j++) {
      if (capped[i] === capped[j] || setOverlapRatio(sets[i], sets[j]) >= 0.8) {
        duplicates++;
      }
    }
  }
  return duplicates;
}

function junkRatio(original: string, cleaned: string): number {
  if (original.length === 0) return 0;
  return (original.length - cleaned.length) / original.length;
}

function hasProperEnding(text: string): boolean {
  const lastPart = text.slice(-60);
  return (
    ENDING_PATTERNS.some((p) => lastPart.includes(p)) ||
    /[.!?]$/.test(text.trim())
  );
}

function hasProperOpening(text: string): boolean {
  const firstPart = text.slice(0, 30);
  return OPENING_PATTERNS.some((p) => firstPart.includes(p));
}

// 부드러운 보간
function smoothScore(
  value: number,
  low: number,
  high: number,
  max: number,
): number {
  if (value <= low) return 0;
  if (value >= high) return max;
  return Math.round(((value - low) / (high - low)) * max * 10) / 10;
}

// 어미 다양성 측정 (문장 끝 패턴이 얼마나 다양한지)
function measureEndingVariety(sentences: string[]): number {
  if (sentences.length <= 1) return 1;
  const endingTypes = new Set<number>();
  for (const s of sentences) {
    const trimmed = s.trim();
    let matched = false;
    for (let i = 0; i < ENDING_SUFFIXES.length; i++) {
      if (ENDING_SUFFIXES[i].test(trimmed)) {
        endingTypes.add(i);
        matched = true;
        break;
      }
    }
    if (!matched) endingTypes.add(-1); // 분류 불가 어미
  }
  // 어미 종류 / 문장 수 (1에 가까울수록 다양)
  return Math.min(1, endingTypes.size / Math.min(sentences.length, 5));
}

// 문장 평균 길이 점수 (너무 짧으면 감점, 학년대별 기준)
function avgSentenceLengthScore(
  sentences: string[],
  band: GradeBand,
): number {
  if (sentences.length === 0) return 0;
  const avgLen =
    sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
  // 저학년은 짧은 문장에 관대, 고학년은 더 긴 문장 기대
  const [lo, hi] =
    band === "low" ? [3, 9] : band === "mid" ? [4, 13] : [5, 16];
  return smoothScore(avgLen, lo, hi, 1);
}

// 의미 밀도 (기능어·조사·지시어·접속부사 제외한 내용어 비율)
function contentDensity(words: string[]): number {
  if (words.length === 0) return 0;
  const contentWords = words.filter((w) => {
    const stem = stripJosa(w);
    return (
      stem.length >= 1 &&
      !FUNCTION_WORDS.includes(w) &&
      !FUNCTION_STEMS.has(stem)
    );
  });
  return contentWords.length / words.length;
}

// (v7) 구간 TTR: 10어절 창을 5어절씩 밀며 창 안 고유 어간 비율 평균.
// 긴 글에서 같은 낱말을 재활용해 길이만 늘리는 패턴을 잡는다 (25어절+만 적용).
function windowedTTR(stems: string[]): number {
  const W = 10;
  if (stems.length < 25) return 1;
  let sum = 0;
  let n = 0;
  for (let i = 0; i + W <= stems.length; i += 5) {
    const win = stems.slice(i, i + W);
    sum += new Set(win).size / W;
    n++;
  }
  return n > 0 ? sum / n : 1;
}

// 단순 반복 감지 (같은 2-3 단어 패턴이 반복되는지)
function detectPatternRepetition(text: string): number {
  // 2어절 이상 연속 패턴 반복 감지 (v7.1: O(n²)류라 검사 어절 상한 400)
  const words = text.split(/\s+/).slice(0, 400);
  if (words.length < 6) return 0;
  let repeats = 0;
  for (let len = 2; len <= 4; len++) {
    for (let i = 0; i <= words.length - len * 2; i++) {
      const pattern = words.slice(i, i + len).join(" ");
      const rest = words.slice(i + len).join(" ");
      const count = rest.split(pattern).length - 1;
      if (count >= 2) repeats++;
    }
  }
  return Math.min(repeats, 5); // cap at 5
}

/**
 * 글쓰기 평가 (총 10점) - v7 정교한 평가 + 하드 gibberish 감지
 */
export function evaluateWriting(
  text: string,
  minChars: number,
  options?: { prompt?: string },
): WritingEvalResult {
  // (v7.1) 평가 입력 상한 4000자: 초등 채점에 충분하고, 그 이상은 반복 검사
  // 성능(저사양 크롬북 UI 프리즈)만 해친다. 복붙 장문 방어 겸용.
  const clean = text.trim().slice(0, 4000);

  // 하드 gibberish 체크: 장난 텍스트는 즉시 0점 확정
  if (isHardGibberish(clean)) {
    return {
      score: 0,
      stars: 1,
      feedback: "의미 있는 글을 써야 점수를 받을 수 있어요!",
      tip: "한글로 완성된 문장을 써봐요. 예: \"오늘은 학교에서 친구랑 놀았다.\"",
      details: { length: 0, sentences: 0, variety: 0, structure: 0 },
    };
  }

  // 장난 문자 제거 → junk 비율은 프롬프트 복붙 제거 "전" 기준으로 계산
  // (복붙 제거분까지 junk로 치면 이중 감점이라 분리)
  const cleanedJunk = cleanJunkText(clean);
  const jRatio = junkRatio(clean, cleanedJunk);

  // (v7) 프롬프트 복붙 제거 → 이후 모든 지표는 "자기 글"만으로 계산
  const cleaned = stripPromptEcho(cleanedJunk, options?.prompt);
  const effectiveCharCount = cleaned.length;
  const sentences = splitSentences(cleaned);
  const words = extractWords(cleaned);
  const uniqueWords = new Set(words);

  // 학년대(저/중/고) — minChars로 추정
  const band = gradeBandFromMinChars(minChars);

  // 키워드 스터핑 게이트: 조사 없는 단어 나열(prose-ness 낮음) 탐지.
  // 단, 구두점/줄바꿈이 있는 글(시·구어체 포함)은 제외해 오탐 방지.
  const prose = josaRatio(words);
  const punctCount = (cleaned.match(/[.!?\n]/g) || []).length;
  // (v7.1) 서술어(~다/~요/~해 등)로 끝나는 어절이 하나도 없으면 "사과는 바다는
  // 학교는…"처럼 조사만 붙인 낱말 나열 — 문장이 아니므로 word-list로 취급
  // (v7.2) 위 판정을 "전체 토큰 중 서술어 종결 0개"로만 걸면, 마침표로 문장처럼
  // 끊은 무의미 명사 나열에 "의자"처럼 우연히 종결어미 글자(자/다/요 등)로 끝나는
  // 명사가 하나만 섞여도 게이트 전체가 무력화된다(실측: 4~6개 문장짜리 무의미
  // 명사 나열이 정직하게 쓴 짧은 글보다 높은 점수를 받음). 토큰 전체가 아니라
  // "문장" 단위로 서술어 종결 비율을 재서, 대부분의 문장에 진짜 서술어가
  // 없으면(2/3 미만) 명사 나열로 판정한다 — 정상 글은 문장마다 서술어로
  // 끝나는 게 한국어 문법상 기본이라 비율이 항상 1에 가까워 오탐이 없다.
  const PREDICATE_ENDING_REGEX =
    /(다|요|죠|자|네|까|어|해|함|음|지)[.!?~"'”’]*$/;
  const predicateSentenceCount = sentences.filter((s) =>
    PREDICATE_ENDING_REGEX.test(s.trim()),
  ).length;
  const predicateSentenceRatio =
    sentences.length > 0 ? predicateSentenceCount / sentences.length : 1;
  const isWordList =
    words.length >= 8 &&
    ((prose < 0.15 && punctCount < 2) || predicateSentenceRatio < 0.34);

  // 주제 관련성: 프롬프트가 구체적(키워드 2개+)일 때만 평가
  const promptKeywords = options?.prompt
    ? extractPromptKeywords(options.prompt)
    : [];
  const stemsSeq = words.map(stripJosa).filter((w) => w.length >= 2);
  const essayStems = new Set(stemsSeq);
  const relevanceCoverage =
    promptKeywords.length >= 2 ? topicRelevance(essayStems, promptKeywords) : 1;

  // (v7) 새 신호들 — 구체성·맞춤법·음절 통계·구간 TTR
  const spellingFound = findSpellingErrors(cleaned);
  const hasDialogue = DIALOGUE_REGEX.test(cleaned);
  const hasNumberUnit = NUMBER_UNIT_REGEX.test(cleaned);
  const onomatopoeiaCount = ONOMATOPOEIA.filter((o) =>
    cleaned.includes(o),
  ).length;
  const hasSimile = SIMILE_REGEX.test(cleaned);
  const rareRatio = rareSyllableRatio(cleaned);
  const ttr = windowedTTR(stemsSeq);
  const patternRep = detectPatternRepetition(cleaned); // 1회 계산 재사용

  // ── A. 글자 수 (0~3점) ────────────────────────────────────────
  let lengthScore: number;
  if (effectiveCharCount < minChars) {
    lengthScore = smoothScore(effectiveCharCount, 0, minChars, 0.5);
  } else {
    const ratio = effectiveCharCount / minChars;
    if (ratio < 2.0) {
      lengthScore = 1 + smoothScore(ratio, 1.0, 2.0, 1);
    } else {
      lengthScore = 2 + smoothScore(ratio, 2.0, 3.5, 1);
    }
  }

  // 쓰레기 비율 패널티
  if (jRatio >= 0.3) {
    const penalty = Math.min(1, (jRatio - 0.3) / 0.3);
    lengthScore = lengthScore * (1 - penalty * 0.8);
  }

  // 유효 단어 부족 시 제한
  if (words.length < 4) lengthScore = Math.min(lengthScore, 1);

  // 의미 밀도가 너무 낮으면 (기능어만 나열) 감점
  const density = contentDensity(words);
  if (density < 0.3 && words.length >= 4) {
    lengthScore = lengthScore * 0.7;
  }

  lengthScore = Math.round(Math.min(3, Math.max(0, lengthScore)));

  // ── B. 문장 구성 (0~2점) ──────────────────────────────────────
  const validSentences = sentences.filter((s) => s.length >= 5);
  const duplicateCount = detectDuplicateSentences(validSentences);
  const effectiveSentenceCount = Math.max(
    0,
    validSentences.length - duplicateCount,
  );

  let sentenceScore = smoothScore(effectiveSentenceCount, 0, 4, 2);

  // 문장 평균 길이 보정 (너무 짧은 문장 나열 시 감점, 학년대 반영)
  const avgLenFactor = avgSentenceLengthScore(validSentences, band);
  sentenceScore = sentenceScore * (0.5 + avgLenFactor * 0.5);

  // 어미 다양성 보정 (같은 어미만 반복 시 감점)
  if (validSentences.length >= 3) {
    const endingVar = measureEndingVariety(validSentences);
    if (endingVar < 0.4) {
      sentenceScore = sentenceScore * 0.7; // 어미가 매우 단조로움
    }
  }

  // 중복 비율 감점
  if (validSentences.length > 1) {
    const dupRatio = duplicateCount / validSentences.length;
    if (dupRatio >= 0.3) {
      sentenceScore = sentenceScore * (1 - Math.min(1, (dupRatio - 0.3) / 0.5));
    }
  }

  sentenceScore = Math.round(Math.min(2, Math.max(0, sentenceScore)));

  // ── C. 어휘 다양성 (0~3점) ────────────────────────────────────
  let varietyScore = 0;
  if (words.length > 0) {
    const freq: Record<string, number> = {};
    for (const w of words) freq[w] = (freq[w] || 0) + 1;

    const repeatCount = Object.values(freq).filter((c) => c >= 3).length;

    const emotionCount = EMOTION_WORDS.filter((e) =>
      cleaned.includes(e),
    ).length;
    const descriptiveCount = DESCRIPTIVE_WORDS.filter((d) =>
      cleaned.includes(d),
    ).length;
    const hasTimeExpr = TIME_EXPRESSIONS.some((t) => cleaned.includes(t));
    const hasPlaceExpr = PLACE_WORDS.some((p) => cleaned.includes(p));

    // 기본 점수: 고유 단어 수 기반 (학년대별 — 저학년은 적은 어휘에 관대)
    const varietyCap = band === "low" ? 11 : band === "mid" ? 15 : 18;
    varietyScore = smoothScore(uniqueWords.size, 3, varietyCap, 3);

    // 보너스: 감정어, 묘사어, 시간/장소 + (v7) 의성어·의태어, 수량, 비유
    let bonus = 0;
    if (emotionCount >= 1) bonus += 0.15;
    if (emotionCount >= 2) bonus += 0.1;
    if (descriptiveCount >= 1) bonus += 0.15;
    if (descriptiveCount >= 2) bonus += 0.1;
    if (hasTimeExpr) bonus += 0.05;
    if (hasPlaceExpr) bonus += 0.05;
    if (onomatopoeiaCount >= 1) bonus += 0.15;
    if (onomatopoeiaCount >= 2) bonus += 0.1;
    if (hasNumberUnit) bonus += 0.1;
    if (hasSimile) bonus += 0.15;
    // 스터핑 방어: 키워드 보너스는 실제 문장에 담겼을 때만(문장 수 비례) 인정,
    // 조사 없는 단어 나열(word-list)이면 보너스 0
    bonus = Math.min(bonus, effectiveSentenceCount * 0.2);
    if (isWordList) bonus = 0;
    varietyScore = Math.min(3, varietyScore + bonus);

    // 과도 반복 패널티
    if (repeatCount >= 2) {
      varietyScore = varietyScore * Math.max(0.3, 1 - (repeatCount - 1) * 0.2);
    }

    // 패턴 반복 감지 (같은 구절이 반복)
    if (patternRep >= 2) {
      varietyScore = varietyScore * Math.max(0.4, 1 - patternRep * 0.15);
    }

    // (v7) 구간 TTR 낮음 = 같은 낱말 재활용으로 길이 불리기
    if (stemsSeq.length >= 25 && ttr < 0.55) {
      varietyScore = varietyScore * 0.7;
    }
  }

  varietyScore = Math.round(Math.min(3, Math.max(0, varietyScore)));

  // ── D. 내용 구조 (0~2점) ──────────────────────────────────────
  const conjGroups = [
    CONJ_REASON,
    CONJ_ORDER,
    CONJ_CONTRAST,
    CONJ_ADD,
    CONJ_RESULT,
    CONJ_EXAMPLE,
  ].filter((group) => group.some((c) => cleaned.includes(c))).length;

  const paragraphs = cleaned
    .split(/\n+/)
    .filter((p) => p.trim().length >= 5).length;
  const hasEnding = hasProperEnding(cleaned);
  const hasOpening = hasProperOpening(cleaned);

  // 누적 방식
  let structureRaw = 0;
  if (hasOpening) structureRaw += 0.3;
  if (hasEnding) structureRaw += 0.4;
  if (conjGroups >= 1) structureRaw += 0.4;
  if (conjGroups >= 2) structureRaw += 0.4;
  if (conjGroups >= 3) structureRaw += 0.2;
  if (paragraphs >= 2) structureRaw += 0.2;
  if (effectiveSentenceCount >= 3) structureRaw += 0.3;
  if (effectiveSentenceCount >= 5) structureRaw += 0.2;
  if (hasDialogue) structureRaw += 0.3; // (v7) 대화문 = 장면을 살리는 구조 신호

  // 중복 문장이 많으면 구조 감점
  if (
    validSentences.length > 1 &&
    duplicateCount >= validSentences.length / 2
  ) {
    structureRaw *= 0.6;
  }

  const structureScore = Math.round(Math.min(2, Math.max(0, structureRaw)));

  // ── 하드 캡 (의미 빈약한 글은 고점 차단) ───────────────────
  let rawTotal = lengthScore + sentenceScore + varietyScore + structureScore;

  // 0) 키워드 나열(조사 없는 단어 나열)이면 최대 2점 — 스터핑 차단
  if (isWordList) {
    rawTotal = Math.min(rawTotal, 2);
  }

  // 1) 유효 단어 3개 미만이면 최대 2점 (내용 빈약)
  if (uniqueWords.size < 3) {
    rawTotal = Math.min(rawTotal, 2);
  }

  // 2) 쓰레기 비율 20% 이상이면 최대 3점
  if (jRatio >= 0.2) {
    rawTotal = Math.min(rawTotal, 3);
  }

  // 3) 의미 밀도 30% 미만이면 최대 3점 (기능어·조사만 가득)
  if (words.length >= 5 && density < 0.3) {
    rawTotal = Math.min(rawTotal, 3);
  }

  // 4) 한 토큰이 전체의 50% 이상 반복이면 최대 3점
  if (words.length >= 5) {
    const tokenFreq: Record<string, number> = {};
    for (const w of words) tokenFreq[w] = (tokenFreq[w] || 0) + 1;
    const maxTokenFreq = Math.max(...Object.values(tokenFreq));
    if (maxTokenFreq / words.length >= 0.5) {
      rawTotal = Math.min(rawTotal, 3);
    }
  }

  // 5) 강한 패턴 반복(3회+)이면 최대 4점
  if (patternRep >= 3) {
    rawTotal = Math.min(rawTotal, 4);
  }

  // 6) 최소 글자 수 절반 미만이면 최대 3점
  if (effectiveCharCount < minChars * 0.5) {
    rawTotal = Math.min(rawTotal, 3);
  }

  // 7) (v7) 상용 음절표 밖 음절 30%+ = 아무 글자 조합 의심 → 최대 4점
  //    (게임 이름·고유명사 몇 개가 섞인 정상 글은 30%에 한참 못 미친다)
  if (rareRatio >= 0.3) {
    rawTotal = Math.min(rawTotal, 4);
  }

  // 8) (v7.1) 프롬프트 트라이그램 반복 = 변형 복붙(문장부호·띄어쓰기 삽입으로
  //    stripPromptEcho의 정확 매칭을 피한 경우) → 최대 2점.
  //    본문 한글 3글자 연쇄의 60%+가 프롬프트에서 온 것이면 자기 글이 아니다.
  //    (정상 글은 프롬프트 표현을 일부 빌려도 자기 문장이 대부분이라 60%에 못 미침)
  if (options?.prompt) {
    const pH = (options.prompt.match(/[가-힣]/g) || []).join("");
    const eH = (cleanedJunk.match(/[가-힣]/g) || []).join("");
    if (pH.length >= 8 && eH.length >= 20) {
      const promptTrigrams = new Set<string>();
      for (let i = 0; i + 3 <= pH.length; i++) {
        promptTrigrams.add(pH.slice(i, i + 3));
      }
      let echoHits = 0;
      for (let i = 0; i + 3 <= eH.length; i++) {
        if (promptTrigrams.has(eH.slice(i, i + 3))) echoHits++;
      }
      if (echoHits / (eH.length - 2) >= 0.6) {
        rawTotal = Math.min(rawTotal, 2);
      }
    }
  }

  // 9) (v7) 상위 2개 어간이 전체의 55%+ = 같은 낱말 재활용 길이 불리기 → 최대 5점
  if (stemsSeq.length >= 12) {
    const stemFreq: Record<string, number> = {};
    for (const s of stemsSeq) stemFreq[s] = (stemFreq[s] || 0) + 1;
    const top2 = Object.values(stemFreq)
      .sort((a, b) => b - a)
      .slice(0, 2)
      .reduce((a, b) => a + b, 0);
    if (top2 / stemsSeq.length >= 0.55) {
      rawTotal = Math.min(rawTotal, 5);
    }
  }

  // (v7) 맞춤법 확정 오류 감점: 1개=팁만, 2개=-1, 3개+=-1.5
  // (반올림에 소실되지 않으면서 처벌보다 학습 신호가 되는 수준)
  if (spellingFound.length >= 2) {
    rawTotal = Math.max(0, rawTotal - Math.min(1.5, 0.5 * spellingFound.length));
  }

  // 주제 이탈 완만 감점 (구체 프롬프트일 때만, coverage 0→×0.85 / ≥0.2→×1.0)
  // (v7) 벌점 완화 0.75→0.85: 키워드 매칭은 어형 변화까지만 알고 의미(여름=계절,
  // "학교에서 있었던 일"=과학실험 이야기)는 모르므로, 정상 글 오탐 피해를
  // 통과선(8점)이 안 흔들리는 수준으로 제한. 9점급(rawTotal≥9) 글은 구조·어휘가
  // 이미 탄탄한 진짜 글이라 블라인드 키워드 체크로 깎지 않는다.
  if (promptKeywords.length >= 2 && words.length >= 6 && rawTotal < 9) {
    const relevanceFactor =
      relevanceCoverage >= 0.2 ? 1 : 0.85 + relevanceCoverage * 0.75;
    rawTotal = rawTotal * relevanceFactor;
  }

  // ── 합산 (v7: 정수 반올림 — 소수점 점수 표시 방지) ───────────
  const total = Math.max(0, Math.min(10, Math.round(rawTotal)));
  const stars =
    total <= 2 ? 1 : total <= 4 ? 2 : total <= 6 ? 3 : total <= 8 ? 4 : 5;

  // ── 피드백 ────────────────────────────────────────────────────
  const FEEDBACKS: [number, string][] = [
    [10, "와! 완벽한 글이에요! 작가가 될 수 있겠어요!"],
    [9, "대단해요! 정말 잘 쓴 글이에요!"],
    [7, "훌륭해요! 생각을 멋지게 표현했어요!"],
    [5, "잘 썼어요! 느낌이 잘 전달돼요!"],
    [3, "잘 시작했어요! 조금만 더 써볼까요?"],
    [1, "좋은 시작이에요! 한 문장씩 더 써봐요!"],
    [0, "도전했어요! 떠오르는 대로 써봐요!"],
  ];
  const feedback = FEEDBACKS.find(([min]) => total >= min)![1];

  // ── 개선 팁 ──────────────────────────────────────────────────
  const tips: { ratio: number; tip: string }[] = [];

  // (v7) 아무 글자 조합 의심 경고 최우선
  if (rareRatio >= 0.3) {
    tips.push({
      ratio: -3.5,
      tip: "뜻이 통하는 낱말로 문장을 만들어봐요!",
    });
  }

  // (v7) 프롬프트 복붙이 상당량 제거됐으면 이유를 설명 (UI 글자수와 다른 이유)
  if (cleanedJunk.length - cleaned.length >= minChars * 0.3) {
    tips.push({
      ratio: -2.2,
      tip: "글감 문장을 그대로 옮긴 부분은 글자 수에 들어가지 않아요. 내 생각을 내 말로 써봐요!",
    });
  }

  // 단어 나열·주제 이탈 경고 최우선
  if (isWordList) {
    tips.push({
      ratio: -3,
      tip: "낱말만 늘어놓지 말고, 문장으로 이어서 써봐요!",
    });
  }
  // 관련성 팁은 점수가 낮을 때만 (우수 글에 "주제 어긋남" 잔소리 방지 — 키워드
  // 매칭은 의미를 모르므로 고득점 글에서는 오탐 확률이 더 높다)
  if (
    promptKeywords.length >= 2 &&
    words.length >= 6 &&
    relevanceCoverage < 0.2 &&
    total < 8
  ) {
    tips.push({
      ratio: -2.5,
      tip: "글감(주제)에 어울리는 내용을 더 써봐요!",
    });
  }

  // 쓰레기/복붙 경고 최우선
  if (jRatio >= 0.3) {
    tips.push({
      ratio: -2,
      tip: '"ㅋㅋ"이나 같은 글자 반복 대신, 느낀 점을 문장으로 써봐요!',
    });
  }
  if (duplicateCount >= 2) {
    tips.push({
      ratio: -2,
      tip: "같은 문장을 반복하지 말고, 새로운 내용을 써봐요!",
    });
  }

  // 패턴 반복 경고
  if (patternRep >= 2) {
    tips.push({
      ratio: -1.5,
      tip: "같은 표현이 계속 반복돼요. 다른 방식으로 써봐요!",
    });
  }

  // (v7) 맞춤법 팁 — 찾은 오류 중 첫 번째를 구체적으로 알려줌
  if (spellingFound.length >= 1) {
    const [wrong, right] = spellingFound[0];
    tips.push({
      ratio: -1.2,
      tip: `맞춤법을 확인해봐요: "${wrong}" → "${right}"가 바른 표기예요!`,
    });
  }

  // 어미 단조로움 경고
  if (validSentences.length >= 3) {
    const endingVar = measureEndingVariety(validSentences);
    if (endingVar < 0.4) {
      tips.push({
        ratio: -1,
        tip: '문장 끝이 비슷해요. "~았다", "~해요", "~습니다" 등 다양한 어미를 섞어봐요!',
      });
    }
  }

  // 문장 길이 경고 (학년대별 기준 — 저학년은 짧은 문장 허용)
  if (validSentences.length >= 2) {
    const avgLen =
      validSentences.reduce((s, sent) => s + sent.length, 0) /
      validSentences.length;
    const shortThreshold = band === "low" ? 6 : band === "mid" ? 8 : 10;
    if (avgLen < shortThreshold) {
      tips.push({
        ratio: -0.5,
        tip: '문장이 너무 짧아요. 하나의 문장에 "누가, 무엇을, 어떻게" 넣어봐요!',
      });
    }
  }

  // 항목별 팁
  if (lengthScore < 3) {
    const needed = Math.max(0, Math.ceil(minChars * 1.6) - effectiveCharCount);
    tips.push({
      ratio: lengthScore / 3,
      tip:
        needed > 0
          ? `${needed}자만 더 쓰면 점수가 올라가요!`
          : "조금만 더 길게 써봐요!",
    });
  }
  if (sentenceScore < 2) {
    tips.push({
      ratio: sentenceScore / 2,
      tip: "마침표(.)로 문장을 나눠서 3문장 이상 써봐요!",
    });
  }
  if (varietyScore < 3) {
    const emotionUsed = EMOTION_WORDS.some((e) => cleaned.includes(e));
    const descUsed = DESCRIPTIVE_WORDS.some((d) => cleaned.includes(d));
    if (!emotionUsed && !descUsed) {
      tips.push({
        ratio: varietyScore / 3,
        tip: '"기뻤다", "빨간", "따뜻한" 같은 감정·묘사 표현을 넣어봐요!',
      });
    } else if (!emotionUsed) {
      tips.push({
        ratio: varietyScore / 3,
        tip: '"기쁘다", "신나다" 같은 감정 표현을 추가해봐요!',
      });
    } else if (!descUsed) {
      tips.push({
        ratio: varietyScore / 3,
        tip: "색깔, 크기, 느낌 같은 묘사 단어를 써봐요!",
      });
    } else if (onomatopoeiaCount === 0 && band !== "low") {
      tips.push({
        ratio: varietyScore / 3,
        tip: '"반짝반짝", "두근두근" 같은 흉내 내는 말을 넣으면 생생해져요!',
      });
    } else {
      tips.push({
        ratio: varietyScore / 3,
        tip: "같은 단어를 줄이고 다양한 표현을 써봐요!",
      });
    }
  }
  if (structureScore < 2) {
    if (!hasEnding) {
      tips.push({
        ratio: structureScore / 2,
        tip: '마지막에 "~것 같다", "~하고 싶다" 같은 마무리를 넣어봐요!',
      });
    } else if (conjGroups === 0) {
      tips.push({
        ratio: structureScore / 2,
        tip: '"그래서", "왜냐하면", "하지만" 같은 연결어를 넣어봐요!',
      });
    } else if (!hasDialogue && band !== "low") {
      tips.push({
        ratio: structureScore / 2,
        tip: "따옴표로 대화나 생각을 넣어보면 글이 생생해져요!",
      });
    } else {
      tips.push({
        ratio: structureScore / 2,
        tip: "줄바꿈으로 단락을 나눠봐요!",
      });
    }
  }

  const sorted = tips.sort((a, b) => a.ratio - b.ratio);
  const tip =
    sorted.length > 0
      ? sorted[0].tip
      : "이 실력이면 다음엔 더 멋진 글을 쓸 수 있어요!";

  return {
    score: total,
    stars,
    feedback,
    tip,
    details: {
      length: lengthScore,
      sentences: sentenceScore,
      variety: varietyScore,
      structure: structureScore,
    },
  };
}
