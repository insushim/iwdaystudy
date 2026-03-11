/**
 * Procedural English Vocabulary Generator
 * Generates grade-appropriate English vocabulary entries for Korean elementary students.
 * Follows the Korean national English curriculum (grades 3-6).
 * Combined with seeded PRNG, this provides reproducible yet varied content.
 */
import type { EnglishEntry } from '@/types/curriculum';

// Seeded PRNG for reproducible generation
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

function shuffle<T>(rng: () => number, arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ============================================================
// Word Data: Grade 3-4 (Basic English)
// ============================================================

interface WordData {
  word: string;
  pronunciation: string;
  practice: string[];
}

interface SentenceTemplate {
  template: (word: string) => string;
  translationTemplate: (korean: string) => string;
}

// --- Greetings ---
const greetingWords: (WordData & { korean: string })[] = [
  { word: 'hello', pronunciation: '헬로', korean: '안녕하세요', practice: ['hi', 'hey', 'good morning'] },
  { word: 'goodbye', pronunciation: '굿바이', korean: '안녕히 가세요', practice: ['bye', 'see you', 'farewell'] },
  { word: 'thank you', pronunciation: '땡큐', korean: '감사합니다', practice: ['thanks', 'appreciate', 'grateful'] },
  { word: 'sorry', pronunciation: '쏘리', korean: '미안해요', practice: ['excuse me', 'pardon', 'forgive'] },
  { word: 'please', pronunciation: '플리즈', korean: '제발', practice: ['kindly', 'if you will'] },
  { word: 'welcome', pronunciation: '웰컴', korean: '환영해요', practice: ['greet', 'invite'] },
  { word: 'good morning', pronunciation: '굿모닝', korean: '좋은 아침이에요', practice: ['good afternoon', 'good evening', 'good night'] },
  { word: 'good night', pronunciation: '굿나잇', korean: '잘 자요', practice: ['sweet dreams', 'sleep well'] },
  { word: 'nice to meet you', pronunciation: '나이스 투 밋 유', korean: '만나서 반가워요', practice: ['glad to meet you', 'how do you do'] },
  { word: 'how are you', pronunciation: '하우 아 유', korean: '잘 지내요?', practice: ['how is it going', 'what is up'] },
];

// --- Colors ---
const colorWords: WordData[] = [
  { word: 'red', pronunciation: '레드', practice: ['pink', 'crimson', 'scarlet'] },
  { word: 'blue', pronunciation: '블루', practice: ['navy', 'sky blue', 'turquoise'] },
  { word: 'yellow', pronunciation: '옐로', practice: ['gold', 'lemon', 'amber'] },
  { word: 'green', pronunciation: '그린', practice: ['lime', 'emerald', 'olive'] },
  { word: 'orange', pronunciation: '오렌지', practice: ['peach', 'tangerine', 'coral'] },
  { word: 'purple', pronunciation: '퍼플', practice: ['violet', 'lavender', 'plum'] },
  { word: 'white', pronunciation: '화이트', practice: ['ivory', 'cream', 'snow'] },
  { word: 'black', pronunciation: '블랙', practice: ['dark', 'midnight', 'charcoal'] },
  { word: 'pink', pronunciation: '핑크', practice: ['rose', 'magenta', 'salmon'] },
  { word: 'brown', pronunciation: '브라운', practice: ['tan', 'chocolate', 'beige'] },
  { word: 'gray', pronunciation: '그레이', practice: ['silver', 'ash', 'slate'] },
  { word: 'gold', pronunciation: '골드', practice: ['golden', 'amber', 'bronze'] },
];

const colorKorean: Record<string, string> = {
  red: '빨간색', blue: '파란색', yellow: '노란색', green: '초록색',
  orange: '주황색', purple: '보라색', white: '하얀색', black: '검은색',
  pink: '분홍색', brown: '갈색', gray: '회색', gold: '금색',
};

// --- Numbers ---
const numberWords: (WordData & { korean: string })[] = [
  { word: 'one', pronunciation: '원', korean: '하나', practice: ['first', 'single'] },
  { word: 'two', pronunciation: '투', korean: '둘', practice: ['second', 'pair', 'double'] },
  { word: 'three', pronunciation: '쓰리', korean: '셋', practice: ['third', 'triple'] },
  { word: 'four', pronunciation: '포', korean: '넷', practice: ['fourth', 'quarter'] },
  { word: 'five', pronunciation: '파이브', korean: '다섯', practice: ['fifth', 'handful'] },
  { word: 'six', pronunciation: '식스', korean: '여섯', practice: ['sixth', 'half dozen'] },
  { word: 'seven', pronunciation: '세븐', korean: '일곱', practice: ['seventh', 'week'] },
  { word: 'eight', pronunciation: '에잇', korean: '여덟', practice: ['eighth', 'octagon'] },
  { word: 'nine', pronunciation: '나인', korean: '아홉', practice: ['ninth', 'baseball'] },
  { word: 'ten', pronunciation: '텐', korean: '열', practice: ['tenth', 'decade'] },
  { word: 'eleven', pronunciation: '일레븐', korean: '열하나', practice: ['twelfth', 'dozen'] },
  { word: 'twelve', pronunciation: '트웰브', korean: '열둘', practice: ['dozen', 'midnight'] },
  { word: 'twenty', pronunciation: '트웬티', korean: '스물', practice: ['score', 'twentieth'] },
  { word: 'hundred', pronunciation: '헌드레드', korean: '백', practice: ['century', 'percent'] },
];

// --- Animals ---
const animalWords: WordData[] = [
  { word: 'dog', pronunciation: '도그', practice: ['puppy', 'pet', 'bark'] },
  { word: 'cat', pronunciation: '캣', practice: ['kitten', 'meow', 'pet'] },
  { word: 'bird', pronunciation: '버드', practice: ['sparrow', 'fly', 'nest'] },
  { word: 'fish', pronunciation: '피시', practice: ['goldfish', 'swim', 'ocean'] },
  { word: 'rabbit', pronunciation: '래빗', practice: ['bunny', 'hop', 'carrot'] },
  { word: 'bear', pronunciation: '베어', practice: ['polar bear', 'forest', 'honey'] },
  { word: 'lion', pronunciation: '라이언', practice: ['tiger', 'king', 'jungle'] },
  { word: 'elephant', pronunciation: '엘리펀트', practice: ['trunk', 'big', 'zoo'] },
  { word: 'monkey', pronunciation: '멍키', practice: ['banana', 'climb', 'zoo'] },
  { word: 'tiger', pronunciation: '타이거', practice: ['stripes', 'jungle', 'fierce'] },
  { word: 'cow', pronunciation: '카우', practice: ['milk', 'farm', 'moo'] },
  { word: 'pig', pronunciation: '피그', practice: ['farm', 'oink', 'mud'] },
  { word: 'horse', pronunciation: '호스', practice: ['pony', 'ride', 'gallop'] },
  { word: 'sheep', pronunciation: '쉽', practice: ['lamb', 'wool', 'farm'] },
  { word: 'duck', pronunciation: '덕', practice: ['quack', 'pond', 'swim'] },
  { word: 'chicken', pronunciation: '치킨', practice: ['rooster', 'egg', 'farm'] },
  { word: 'frog', pronunciation: '프로그', practice: ['toad', 'jump', 'pond'] },
  { word: 'snake', pronunciation: '스네이크', practice: ['slither', 'long', 'reptile'] },
  { word: 'turtle', pronunciation: '터틀', practice: ['shell', 'slow', 'sea'] },
  { word: 'butterfly', pronunciation: '버터플라이', practice: ['caterpillar', 'wings', 'flower'] },
];

const animalKorean: Record<string, string> = {
  dog: '개', cat: '고양이', bird: '새', fish: '물고기', rabbit: '토끼',
  bear: '곰', lion: '사자', elephant: '코끼리', monkey: '원숭이', tiger: '호랑이',
  cow: '소', pig: '돼지', horse: '말', sheep: '양', duck: '오리',
  chicken: '닭', frog: '개구리', snake: '뱀', turtle: '거북이', butterfly: '나비',
};

// --- Family ---
const familyWords: WordData[] = [
  { word: 'mother', pronunciation: '마더', practice: ['mom', 'mommy', 'mama'] },
  { word: 'father', pronunciation: '파더', practice: ['dad', 'daddy', 'papa'] },
  { word: 'sister', pronunciation: '시스터', practice: ['sibling', 'girl', 'family'] },
  { word: 'brother', pronunciation: '브라더', practice: ['sibling', 'boy', 'family'] },
  { word: 'grandmother', pronunciation: '그랜드마더', practice: ['grandma', 'granny', 'nana'] },
  { word: 'grandfather', pronunciation: '그랜드파더', practice: ['grandpa', 'grandad', 'papa'] },
  { word: 'baby', pronunciation: '베이비', practice: ['infant', 'toddler', 'child'] },
  { word: 'family', pronunciation: '패밀리', practice: ['parents', 'relatives', 'home'] },
  { word: 'friend', pronunciation: '프렌드', practice: ['buddy', 'pal', 'mate'] },
  { word: 'teacher', pronunciation: '티처', practice: ['school', 'class', 'learn'] },
  { word: 'student', pronunciation: '스튜던트', practice: ['pupil', 'learner', 'school'] },
  { word: 'uncle', pronunciation: '엉클', practice: ['aunt', 'cousin', 'relative'] },
  { word: 'aunt', pronunciation: '앤트', practice: ['uncle', 'cousin', 'relative'] },
  { word: 'cousin', pronunciation: '커즌', practice: ['uncle', 'aunt', 'relative'] },
];

const familyKorean: Record<string, string> = {
  mother: '엄마', father: '아빠', sister: '자매', brother: '형제',
  grandmother: '할머니', grandfather: '할아버지', baby: '아기', family: '가족',
  friend: '친구', teacher: '선생님', student: '학생', uncle: '삼촌',
  aunt: '이모', cousin: '사촌',
};

// --- Food ---
const foodWords: WordData[] = [
  { word: 'apple', pronunciation: '애플', practice: ['banana', 'orange', 'grape'] },
  { word: 'banana', pronunciation: '바나나', practice: ['apple', 'mango', 'pear'] },
  { word: 'bread', pronunciation: '브레드', practice: ['toast', 'sandwich', 'butter'] },
  { word: 'milk', pronunciation: '밀크', practice: ['juice', 'water', 'cheese'] },
  { word: 'rice', pronunciation: '라이스', practice: ['noodle', 'soup', 'meal'] },
  { word: 'egg', pronunciation: '에그', practice: ['chicken', 'breakfast', 'cook'] },
  { word: 'water', pronunciation: '워터', practice: ['juice', 'milk', 'drink'] },
  { word: 'cake', pronunciation: '케이크', practice: ['cookie', 'pie', 'candy'] },
  { word: 'pizza', pronunciation: '피자', practice: ['pasta', 'cheese', 'tomato'] },
  { word: 'orange', pronunciation: '오렌지', practice: ['lemon', 'grape', 'melon'] },
  { word: 'grape', pronunciation: '그레이프', practice: ['cherry', 'peach', 'plum'] },
  { word: 'chicken', pronunciation: '치킨', practice: ['beef', 'pork', 'fish'] },
  { word: 'cheese', pronunciation: '치즈', practice: ['butter', 'cream', 'yogurt'] },
  { word: 'soup', pronunciation: '수프', practice: ['stew', 'broth', 'noodle'] },
  { word: 'candy', pronunciation: '캔디', practice: ['chocolate', 'cookie', 'ice cream'] },
  { word: 'ice cream', pronunciation: '아이스크림', practice: ['cake', 'candy', 'chocolate'] },
  { word: 'strawberry', pronunciation: '스트로베리', practice: ['blueberry', 'raspberry', 'cherry'] },
  { word: 'cookie', pronunciation: '쿠키', practice: ['biscuit', 'cracker', 'muffin'] },
  { word: 'sandwich', pronunciation: '샌드위치', practice: ['hamburger', 'hotdog', 'wrap'] },
  { word: 'salad', pronunciation: '샐러드', practice: ['vegetable', 'lettuce', 'tomato'] },
];

const foodKorean: Record<string, string> = {
  apple: '사과', banana: '바나나', bread: '빵', milk: '우유', rice: '밥',
  egg: '달걀', water: '물', cake: '케이크', pizza: '피자', orange: '오렌지',
  grape: '포도', chicken: '치킨', cheese: '치즈', soup: '수프', candy: '사탕',
  'ice cream': '아이스크림', strawberry: '딸기', cookie: '쿠키',
  sandwich: '샌드위치', salad: '샐러드',
};

// --- Body Parts ---
const bodyWords: WordData[] = [
  { word: 'head', pronunciation: '헤드', practice: ['face', 'hair', 'brain'] },
  { word: 'eye', pronunciation: '아이', practice: ['nose', 'ear', 'see'] },
  { word: 'nose', pronunciation: '노즈', practice: ['mouth', 'ear', 'smell'] },
  { word: 'mouth', pronunciation: '마우스', practice: ['lip', 'tongue', 'teeth'] },
  { word: 'ear', pronunciation: '이어', practice: ['eye', 'hear', 'sound'] },
  { word: 'hand', pronunciation: '핸드', practice: ['finger', 'arm', 'hold'] },
  { word: 'foot', pronunciation: '풋', practice: ['toe', 'leg', 'walk'] },
  { word: 'arm', pronunciation: '암', practice: ['hand', 'elbow', 'shoulder'] },
  { word: 'leg', pronunciation: '레그', practice: ['knee', 'foot', 'run'] },
  { word: 'hair', pronunciation: '헤어', practice: ['head', 'long', 'short'] },
  { word: 'finger', pronunciation: '핑거', practice: ['thumb', 'hand', 'point'] },
  { word: 'shoulder', pronunciation: '숄더', practice: ['arm', 'neck', 'back'] },
  { word: 'knee', pronunciation: '니', practice: ['leg', 'bend', 'joint'] },
  { word: 'tooth', pronunciation: '투스', practice: ['teeth', 'brush', 'dentist'] },
];

const bodyKorean: Record<string, string> = {
  head: '머리', eye: '눈', nose: '코', mouth: '입', ear: '귀',
  hand: '손', foot: '발', arm: '팔', leg: '다리', hair: '머리카락',
  finger: '손가락', shoulder: '어깨', knee: '무릎', tooth: '이',
};

// --- Daily Activities ---
const dailyWords: WordData[] = [
  { word: 'eat', pronunciation: '잇', practice: ['drink', 'cook', 'food'] },
  { word: 'drink', pronunciation: '드링크', practice: ['eat', 'water', 'juice'] },
  { word: 'sleep', pronunciation: '슬립', practice: ['bed', 'dream', 'night'] },
  { word: 'run', pronunciation: '런', practice: ['walk', 'jump', 'fast'] },
  { word: 'walk', pronunciation: '워크', practice: ['run', 'step', 'slow'] },
  { word: 'read', pronunciation: '리드', practice: ['book', 'write', 'study'] },
  { word: 'write', pronunciation: '라이트', practice: ['read', 'pencil', 'paper'] },
  { word: 'play', pronunciation: '플레이', practice: ['fun', 'game', 'toy'] },
  { word: 'sing', pronunciation: '싱', practice: ['song', 'music', 'dance'] },
  { word: 'dance', pronunciation: '댄스', practice: ['sing', 'music', 'move'] },
  { word: 'swim', pronunciation: '스윔', practice: ['pool', 'water', 'dive'] },
  { word: 'jump', pronunciation: '점프', practice: ['hop', 'leap', 'skip'] },
  { word: 'draw', pronunciation: '드로', practice: ['paint', 'color', 'picture'] },
  { word: 'cook', pronunciation: '쿡', practice: ['bake', 'kitchen', 'food'] },
  { word: 'wash', pronunciation: '워시', practice: ['clean', 'soap', 'water'] },
  { word: 'study', pronunciation: '스터디', practice: ['learn', 'book', 'school'] },
  { word: 'listen', pronunciation: '리슨', practice: ['hear', 'music', 'sound'] },
  { word: 'look', pronunciation: '룩', practice: ['see', 'watch', 'eye'] },
  { word: 'sit', pronunciation: '싯', practice: ['stand', 'chair', 'down'] },
  { word: 'stand', pronunciation: '스탠드', practice: ['sit', 'up', 'rise'] },
];

const dailyKorean: Record<string, string> = {
  eat: '먹다', drink: '마시다', sleep: '자다', run: '달리다', walk: '걷다',
  read: '읽다', write: '쓰다', play: '놀다', sing: '노래하다', dance: '춤추다',
  swim: '수영하다', jump: '점프하다', draw: '그리다', cook: '요리하다', wash: '씻다',
  study: '공부하다', listen: '듣다', look: '보다', sit: '앉다', stand: '서다',
};

// --- School Items ---
const schoolItemWords: WordData[] = [
  { word: 'book', pronunciation: '북', practice: ['notebook', 'read', 'library'] },
  { word: 'pencil', pronunciation: '펜슬', practice: ['pen', 'eraser', 'write'] },
  { word: 'eraser', pronunciation: '이레이저', practice: ['pencil', 'rubber', 'clean'] },
  { word: 'desk', pronunciation: '데스크', practice: ['chair', 'table', 'classroom'] },
  { word: 'chair', pronunciation: '체어', practice: ['desk', 'sit', 'seat'] },
  { word: 'bag', pronunciation: '백', practice: ['backpack', 'school', 'carry'] },
  { word: 'ruler', pronunciation: '룰러', practice: ['measure', 'line', 'pencil'] },
  { word: 'clock', pronunciation: '클락', practice: ['time', 'watch', 'hour'] },
  { word: 'door', pronunciation: '도어', practice: ['window', 'open', 'close'] },
  { word: 'window', pronunciation: '윈도우', practice: ['door', 'glass', 'open'] },
];

const schoolItemKorean: Record<string, string> = {
  book: '책', pencil: '연필', eraser: '지우개', desk: '책상', chair: '의자',
  bag: '가방', ruler: '자', clock: '시계', door: '문', window: '창문',
};

// --- Adjectives (basic) ---
const adjectiveWords: WordData[] = [
  { word: 'big', pronunciation: '빅', practice: ['large', 'huge', 'giant'] },
  { word: 'small', pronunciation: '스몰', practice: ['little', 'tiny', 'mini'] },
  { word: 'happy', pronunciation: '해피', practice: ['glad', 'joyful', 'cheerful'] },
  { word: 'sad', pronunciation: '새드', practice: ['unhappy', 'blue', 'upset'] },
  { word: 'hot', pronunciation: '핫', practice: ['warm', 'cold', 'cool'] },
  { word: 'cold', pronunciation: '콜드', practice: ['cool', 'hot', 'warm'] },
  { word: 'fast', pronunciation: '패스트', practice: ['quick', 'slow', 'speedy'] },
  { word: 'slow', pronunciation: '슬로', practice: ['fast', 'quick', 'steady'] },
  { word: 'good', pronunciation: '굿', practice: ['great', 'nice', 'fine'] },
  { word: 'bad', pronunciation: '배드', practice: ['poor', 'terrible', 'awful'] },
  { word: 'long', pronunciation: '롱', practice: ['short', 'tall', 'wide'] },
  { word: 'short', pronunciation: '숏', practice: ['long', 'tall', 'small'] },
  { word: 'new', pronunciation: '뉴', practice: ['old', 'fresh', 'recent'] },
  { word: 'old', pronunciation: '올드', practice: ['new', 'young', 'ancient'] },
  { word: 'pretty', pronunciation: '프리티', practice: ['beautiful', 'cute', 'lovely'] },
  { word: 'hungry', pronunciation: '헝그리', practice: ['thirsty', 'full', 'starving'] },
];

const adjectiveKorean: Record<string, string> = {
  big: '큰', small: '작은', happy: '행복한', sad: '슬픈',
  hot: '뜨거운', cold: '차가운', fast: '빠른', slow: '느린',
  good: '좋은', bad: '나쁜', long: '긴', short: '짧은',
  new: '새로운', old: '오래된', pretty: '예쁜', hungry: '배고픈',
};

// ============================================================
// Word Data: Grade 5-6 (Intermediate English)
// ============================================================

// --- School Subjects ---
const subjectWords: WordData[] = [
  { word: 'math', pronunciation: '매쓰', practice: ['science', 'English', 'number'] },
  { word: 'science', pronunciation: '사이언스', practice: ['experiment', 'lab', 'discover'] },
  { word: 'English', pronunciation: '잉글리시', practice: ['Korean', 'language', 'speak'] },
  { word: 'music', pronunciation: '뮤직', practice: ['art', 'sing', 'instrument'] },
  { word: 'art', pronunciation: '아트', practice: ['draw', 'paint', 'create'] },
  { word: 'history', pronunciation: '히스토리', practice: ['past', 'story', 'event'] },
  { word: 'Korean', pronunciation: '코리안', practice: ['English', 'language', 'read'] },
  { word: 'PE', pronunciation: '피이', practice: ['exercise', 'sport', 'gym'] },
  { word: 'computer', pronunciation: '컴퓨터', practice: ['keyboard', 'mouse', 'screen'] },
  { word: 'social studies', pronunciation: '소셜 스터디즈', practice: ['history', 'geography', 'society'] },
];

const subjectKorean: Record<string, string> = {
  math: '수학', science: '과학', English: '영어', music: '음악', art: '미술',
  history: '역사', Korean: '국어', PE: '체육', computer: '컴퓨터', 'social studies': '사회',
};

// --- Weather ---
const weatherWords: WordData[] = [
  { word: 'sunny', pronunciation: '서니', practice: ['bright', 'clear', 'warm'] },
  { word: 'rainy', pronunciation: '레이니', practice: ['wet', 'umbrella', 'cloud'] },
  { word: 'cloudy', pronunciation: '클라우디', practice: ['gray', 'overcast', 'dark'] },
  { word: 'snowy', pronunciation: '스노이', practice: ['cold', 'white', 'winter'] },
  { word: 'windy', pronunciation: '윈디', practice: ['breeze', 'storm', 'blow'] },
  { word: 'hot', pronunciation: '핫', practice: ['warm', 'summer', 'heat'] },
  { word: 'cold', pronunciation: '콜드', practice: ['cool', 'winter', 'freeze'] },
  { word: 'warm', pronunciation: '웜', practice: ['hot', 'spring', 'mild'] },
  { word: 'cool', pronunciation: '쿨', practice: ['cold', 'autumn', 'breeze'] },
  { word: 'stormy', pronunciation: '스토미', practice: ['thunder', 'lightning', 'rain'] },
  { word: 'foggy', pronunciation: '포기', practice: ['misty', 'hazy', 'damp'] },
  { word: 'humid', pronunciation: '휴미드', practice: ['sticky', 'moist', 'summer'] },
];

const weatherKorean: Record<string, string> = {
  sunny: '화창한', rainy: '비 오는', cloudy: '흐린', snowy: '눈 오는',
  windy: '바람 부는', hot: '더운', cold: '추운', warm: '따뜻한',
  cool: '시원한', stormy: '폭풍인', foggy: '안개 낀', humid: '습한',
};

// --- Hobbies ---
const hobbyWords: WordData[] = [
  { word: 'soccer', pronunciation: '사커', practice: ['basketball', 'baseball', 'team'] },
  { word: 'basketball', pronunciation: '바스켓볼', practice: ['soccer', 'volleyball', 'court'] },
  { word: 'swimming', pronunciation: '스위밍', practice: ['pool', 'diving', 'water'] },
  { word: 'reading', pronunciation: '리딩', practice: ['book', 'library', 'story'] },
  { word: 'cooking', pronunciation: '쿠킹', practice: ['baking', 'recipe', 'kitchen'] },
  { word: 'painting', pronunciation: '페인팅', practice: ['drawing', 'brush', 'canvas'] },
  { word: 'camping', pronunciation: '캠핑', practice: ['tent', 'hiking', 'nature'] },
  { word: 'fishing', pronunciation: '피싱', practice: ['rod', 'lake', 'catch'] },
  { word: 'cycling', pronunciation: '사이클링', practice: ['bicycle', 'ride', 'pedal'] },
  { word: 'dancing', pronunciation: '댄싱', practice: ['ballet', 'rhythm', 'move'] },
  { word: 'singing', pronunciation: '싱잉', practice: ['song', 'voice', 'chorus'] },
  { word: 'hiking', pronunciation: '하이킹', practice: ['mountain', 'trail', 'walk'] },
  { word: 'skating', pronunciation: '스케이팅', practice: ['ice', 'rink', 'glide'] },
  { word: 'gardening', pronunciation: '가드닝', practice: ['plant', 'flower', 'soil'] },
];

const hobbyKorean: Record<string, string> = {
  soccer: '축구', basketball: '농구', swimming: '수영', reading: '독서',
  cooking: '요리', painting: '그림 그리기', camping: '캠핑', fishing: '낚시',
  cycling: '자전거 타기', dancing: '춤', singing: '노래', hiking: '등산',
  skating: '스케이트', gardening: '정원 가꾸기',
};

// --- Places ---
const placeWords: WordData[] = [
  { word: 'school', pronunciation: '스쿨', practice: ['classroom', 'teacher', 'student'] },
  { word: 'hospital', pronunciation: '호스피탈', practice: ['doctor', 'nurse', 'sick'] },
  { word: 'library', pronunciation: '라이브러리', practice: ['book', 'read', 'quiet'] },
  { word: 'park', pronunciation: '파크', practice: ['playground', 'tree', 'bench'] },
  { word: 'restaurant', pronunciation: '레스토랑', practice: ['menu', 'waiter', 'food'] },
  { word: 'museum', pronunciation: '뮤지엄', practice: ['art', 'exhibit', 'history'] },
  { word: 'airport', pronunciation: '에어포트', practice: ['airplane', 'travel', 'ticket'] },
  { word: 'market', pronunciation: '마켓', practice: ['shop', 'buy', 'sell'] },
  { word: 'station', pronunciation: '스테이션', practice: ['train', 'bus', 'subway'] },
  { word: 'post office', pronunciation: '포스트 오피스', practice: ['letter', 'stamp', 'mail'] },
  { word: 'bank', pronunciation: '뱅크', practice: ['money', 'save', 'account'] },
  { word: 'zoo', pronunciation: '주', practice: ['animal', 'lion', 'elephant'] },
  { word: 'bookstore', pronunciation: '북스토어', practice: ['book', 'shop', 'buy'] },
  { word: 'beach', pronunciation: '비치', practice: ['sand', 'ocean', 'wave'] },
  { word: 'mountain', pronunciation: '마운틴', practice: ['hill', 'climb', 'peak'] },
  { word: 'church', pronunciation: '처치', practice: ['temple', 'pray', 'worship'] },
];

const placeKorean: Record<string, string> = {
  school: '학교', hospital: '병원', library: '도서관', park: '공원',
  restaurant: '식당', museum: '박물관', airport: '공항', market: '시장',
  station: '역', 'post office': '우체국', bank: '은행', zoo: '동물원',
  bookstore: '서점', beach: '해변', mountain: '산', church: '교회',
};

// --- Emotions ---
const emotionWords: WordData[] = [
  { word: 'happy', pronunciation: '해피', practice: ['glad', 'joyful', 'delighted'] },
  { word: 'sad', pronunciation: '새드', practice: ['unhappy', 'upset', 'gloomy'] },
  { word: 'angry', pronunciation: '앵그리', practice: ['mad', 'furious', 'upset'] },
  { word: 'scared', pronunciation: '스케어드', practice: ['afraid', 'frightened', 'terrified'] },
  { word: 'excited', pronunciation: '익사이티드', practice: ['thrilled', 'eager', 'enthusiastic'] },
  { word: 'tired', pronunciation: '타이어드', practice: ['sleepy', 'exhausted', 'weary'] },
  { word: 'surprised', pronunciation: '서프라이즈드', practice: ['amazed', 'shocked', 'astonished'] },
  { word: 'bored', pronunciation: '보어드', practice: ['dull', 'uninterested', 'tedious'] },
  { word: 'nervous', pronunciation: '너버스', practice: ['anxious', 'worried', 'tense'] },
  { word: 'proud', pronunciation: '프라우드', practice: ['confident', 'pleased', 'satisfied'] },
  { word: 'lonely', pronunciation: '론리', practice: ['alone', 'isolated', 'solitary'] },
  { word: 'confused', pronunciation: '컨퓨즈드', practice: ['puzzled', 'lost', 'unsure'] },
  { word: 'grateful', pronunciation: '그레이트풀', practice: ['thankful', 'appreciative', 'blessed'] },
  { word: 'jealous', pronunciation: '젤러스', practice: ['envious', 'green', 'covetous'] },
];

const emotionKorean: Record<string, string> = {
  happy: '행복한', sad: '슬픈', angry: '화난', scared: '무서운',
  excited: '신나는', tired: '피곤한', surprised: '놀란', bored: '지루한',
  nervous: '긴장한', proud: '자랑스러운', lonely: '외로운', confused: '혼란스러운',
  grateful: '감사한', jealous: '질투하는',
};

// --- Time & Days ---
const timeWords: (WordData & { korean: string })[] = [
  { word: 'Monday', pronunciation: '먼데이', korean: '월요일', practice: ['Tuesday', 'weekday'] },
  { word: 'Tuesday', pronunciation: '튜즈데이', korean: '화요일', practice: ['Wednesday', 'weekday'] },
  { word: 'Wednesday', pronunciation: '웬즈데이', korean: '수요일', practice: ['Thursday', 'weekday'] },
  { word: 'Thursday', pronunciation: '썰즈데이', korean: '목요일', practice: ['Friday', 'weekday'] },
  { word: 'Friday', pronunciation: '프라이데이', korean: '금요일', practice: ['Saturday', 'weekend'] },
  { word: 'Saturday', pronunciation: '새터데이', korean: '토요일', practice: ['Sunday', 'weekend'] },
  { word: 'Sunday', pronunciation: '선데이', korean: '일요일', practice: ['Monday', 'weekend'] },
  { word: 'morning', pronunciation: '모닝', korean: '아침', practice: ['afternoon', 'evening', 'sunrise'] },
  { word: 'afternoon', pronunciation: '애프터눈', korean: '오후', practice: ['morning', 'evening', 'lunch'] },
  { word: 'evening', pronunciation: '이브닝', korean: '저녁', practice: ['night', 'morning', 'sunset'] },
  { word: 'night', pronunciation: '나잇', korean: '밤', practice: ['day', 'dark', 'moon'] },
  { word: 'today', pronunciation: '투데이', korean: '오늘', practice: ['yesterday', 'tomorrow'] },
  { word: 'yesterday', pronunciation: '예스터데이', korean: '어제', practice: ['today', 'tomorrow', 'past'] },
  { word: 'tomorrow', pronunciation: '투머로우', korean: '내일', practice: ['today', 'yesterday', 'future'] },
];

// --- Months & Seasons ---
const seasonWords: (WordData & { korean: string })[] = [
  { word: 'spring', pronunciation: '스프링', korean: '봄', practice: ['flower', 'warm', 'April'] },
  { word: 'summer', pronunciation: '서머', korean: '여름', practice: ['hot', 'vacation', 'beach'] },
  { word: 'fall', pronunciation: '폴', korean: '가을', practice: ['leaf', 'cool', 'harvest'] },
  { word: 'winter', pronunciation: '윈터', korean: '겨울', practice: ['cold', 'snow', 'coat'] },
  { word: 'January', pronunciation: '재뉴어리', korean: '1월', practice: ['February', 'new year', 'winter'] },
  { word: 'February', pronunciation: '페브루어리', korean: '2월', practice: ['March', 'Valentine', 'short'] },
  { word: 'March', pronunciation: '마치', korean: '3월', practice: ['April', 'spring', 'wind'] },
  { word: 'April', pronunciation: '에이프릴', korean: '4월', practice: ['May', 'rain', 'flower'] },
  { word: 'May', pronunciation: '메이', korean: '5월', practice: ['June', 'family', 'warm'] },
  { word: 'June', pronunciation: '준', korean: '6월', practice: ['July', 'summer', 'hot'] },
  { word: 'July', pronunciation: '줄라이', korean: '7월', practice: ['August', 'summer', 'vacation'] },
  { word: 'August', pronunciation: '오거스트', korean: '8월', practice: ['September', 'summer', 'hot'] },
  { word: 'September', pronunciation: '셉템버', korean: '9월', practice: ['October', 'fall', 'school'] },
  { word: 'October', pronunciation: '옥토버', korean: '10월', practice: ['November', 'Halloween', 'leaf'] },
  { word: 'November', pronunciation: '노벰버', korean: '11월', practice: ['December', 'fall', 'cold'] },
  { word: 'December', pronunciation: '디셈버', korean: '12월', practice: ['January', 'Christmas', 'winter'] },
];

// --- Comparison & Intermediate Adjectives ---
const intermediateAdjectiveWords: WordData[] = [
  { word: 'taller', pronunciation: '톨러', practice: ['shorter', 'bigger', 'higher'] },
  { word: 'shorter', pronunciation: '숏터', practice: ['taller', 'smaller', 'lower'] },
  { word: 'bigger', pronunciation: '비거', practice: ['smaller', 'larger', 'greater'] },
  { word: 'smaller', pronunciation: '스몰러', practice: ['bigger', 'tinier', 'lesser'] },
  { word: 'faster', pronunciation: '패스터', practice: ['slower', 'quicker', 'speedier'] },
  { word: 'slower', pronunciation: '슬로어', practice: ['faster', 'steadier', 'calmer'] },
  { word: 'stronger', pronunciation: '스트롱거', practice: ['weaker', 'mightier', 'tougher'] },
  { word: 'smarter', pronunciation: '스마터', practice: ['wiser', 'cleverer', 'brighter'] },
  { word: 'beautiful', pronunciation: '뷰티풀', practice: ['pretty', 'gorgeous', 'lovely'] },
  { word: 'important', pronunciation: '임포턴트', practice: ['significant', 'valuable', 'essential'] },
  { word: 'different', pronunciation: '디퍼런트', practice: ['same', 'similar', 'unique'] },
  { word: 'popular', pronunciation: '파퓰러', practice: ['famous', 'well-known', 'favorite'] },
  { word: 'difficult', pronunciation: '디피컬트', practice: ['hard', 'easy', 'challenging'] },
  { word: 'delicious', pronunciation: '딜리셔스', practice: ['tasty', 'yummy', 'savory'] },
  { word: 'dangerous', pronunciation: '데인저러스', practice: ['safe', 'risky', 'harmful'] },
  { word: 'interesting', pronunciation: '인터레스팅', practice: ['boring', 'fun', 'exciting'] },
];

const intermediateAdjectiveKorean: Record<string, string> = {
  taller: '더 큰', shorter: '더 작은', bigger: '더 큰', smaller: '더 작은',
  faster: '더 빠른', slower: '더 느린', stronger: '더 강한', smarter: '더 똑똑한',
  beautiful: '아름다운', important: '중요한', different: '다른', popular: '인기 있는',
  difficult: '어려운', delicious: '맛있는', dangerous: '위험한', interesting: '재미있는',
};

// --- Past Tense Verbs ---
const pastTenseWords: (WordData & { korean: string; present: string })[] = [
  { word: 'went', pronunciation: '웬트', korean: '갔다', present: 'go', practice: ['go', 'came', 'traveled'] },
  { word: 'ate', pronunciation: '에잇', korean: '먹었다', present: 'eat', practice: ['eat', 'drank', 'cooked'] },
  { word: 'saw', pronunciation: '쏘', korean: '보았다', present: 'see', practice: ['see', 'watched', 'looked'] },
  { word: 'made', pronunciation: '메이드', korean: '만들었다', present: 'make', practice: ['make', 'built', 'created'] },
  { word: 'played', pronunciation: '플레이드', korean: '놀았다', present: 'play', practice: ['play', 'ran', 'jumped'] },
  { word: 'studied', pronunciation: '스터디드', korean: '공부했다', present: 'study', practice: ['study', 'learned', 'read'] },
  { word: 'watched', pronunciation: '워치드', korean: '봤다', present: 'watch', practice: ['watch', 'saw', 'looked'] },
  { word: 'helped', pronunciation: '헬프드', korean: '도왔다', present: 'help', practice: ['help', 'assisted', 'supported'] },
  { word: 'visited', pronunciation: '비지티드', korean: '방문했다', present: 'visit', practice: ['visit', 'went', 'traveled'] },
  { word: 'learned', pronunciation: '러닛', korean: '배웠다', present: 'learn', practice: ['learn', 'studied', 'understood'] },
  { word: 'bought', pronunciation: '보트', korean: '샀다', present: 'buy', practice: ['buy', 'sold', 'paid'] },
  { word: 'ran', pronunciation: '랜', korean: '달렸다', present: 'run', practice: ['run', 'walked', 'jogged'] },
  { word: 'read', pronunciation: '레드', korean: '읽었다', present: 'read', practice: ['read', 'wrote', 'studied'] },
  { word: 'wrote', pronunciation: '로트', korean: '썼다', present: 'write', practice: ['write', 'read', 'drew'] },
  { word: 'sang', pronunciation: '생', korean: '노래했다', present: 'sing', practice: ['sing', 'danced', 'played'] },
  { word: 'swam', pronunciation: '스왬', korean: '수영했다', present: 'swim', practice: ['swim', 'dove', 'floated'] },
];

// --- Transport ---
const transportWords: WordData[] = [
  { word: 'bus', pronunciation: '버스', practice: ['car', 'taxi', 'ride'] },
  { word: 'car', pronunciation: '카', practice: ['bus', 'truck', 'drive'] },
  { word: 'bicycle', pronunciation: '바이시클', practice: ['bike', 'ride', 'pedal'] },
  { word: 'airplane', pronunciation: '에어플레인', practice: ['fly', 'airport', 'travel'] },
  { word: 'train', pronunciation: '트레인', practice: ['station', 'track', 'ride'] },
  { word: 'ship', pronunciation: '쉽', practice: ['boat', 'sail', 'ocean'] },
  { word: 'subway', pronunciation: '서브웨이', practice: ['train', 'station', 'underground'] },
  { word: 'taxi', pronunciation: '택시', practice: ['car', 'bus', 'ride'] },
];

const transportKorean: Record<string, string> = {
  bus: '버스', car: '자동차', bicycle: '자전거', airplane: '비행기',
  train: '기차', ship: '배', subway: '지하철', taxi: '택시',
};

// --- Clothing ---
const clothingWords: WordData[] = [
  { word: 'shirt', pronunciation: '셔츠', practice: ['pants', 'jacket', 'wear'] },
  { word: 'pants', pronunciation: '팬츠', practice: ['shirt', 'shorts', 'jeans'] },
  { word: 'shoes', pronunciation: '슈즈', practice: ['boots', 'sneakers', 'socks'] },
  { word: 'hat', pronunciation: '햇', practice: ['cap', 'head', 'wear'] },
  { word: 'jacket', pronunciation: '재킷', practice: ['coat', 'sweater', 'warm'] },
  { word: 'dress', pronunciation: '드레스', practice: ['skirt', 'blouse', 'pretty'] },
  { word: 'socks', pronunciation: '삭스', practice: ['shoes', 'feet', 'warm'] },
  { word: 'gloves', pronunciation: '글러브즈', practice: ['mittens', 'hands', 'warm'] },
  { word: 'umbrella', pronunciation: '엄브렐라', practice: ['rain', 'wet', 'cover'] },
  { word: 'scarf', pronunciation: '스카프', practice: ['neck', 'warm', 'winter'] },
];

const clothingKorean: Record<string, string> = {
  shirt: '셔츠', pants: '바지', shoes: '신발', hat: '모자',
  jacket: '재킷', dress: '드레스', socks: '양말', gloves: '장갑',
  umbrella: '우산', scarf: '목도리',
};

// ============================================================
// Sentence Template Generators
// ============================================================

// Grade 3-4: Simple sentence templates
function generateGrade3_4Sentences(rng: () => number): EnglishEntry[] {
  const entries: EnglishEntry[] = [];

  // --- Greeting sentences ---
  for (const g of greetingWords) {
    entries.push({
      sentence: `${g.word.charAt(0).toUpperCase() + g.word.slice(1)}.`,
      translation: `${g.korean}.`,
      word: g.word,
      pronunciation: g.pronunciation,
      practice: g.practice,
    });
  }

  // --- Color sentences ---
  const colorTemplates = [
    { s: (w: string) => `I like ${w}.`, t: (k: string) => `나는 ${k}을 좋아해요.` },
    { s: (w: string) => `It is ${w}.`, t: (k: string) => `그것은 ${k}이에요.` },
    { s: (w: string) => `The flower is ${w}.`, t: (k: string) => `그 꽃은 ${k}이에요.` },
    { s: (w: string) => `My bag is ${w}.`, t: (k: string) => `내 가방은 ${k}이에요.` },
    { s: (w: string) => `This is a ${w} ball.`, t: (k: string) => `이것은 ${k} 공이에요.` },
  ];
  for (const c of colorWords) {
    const tmpl = pickOne(rng, colorTemplates);
    entries.push({
      sentence: tmpl.s(c.word),
      translation: tmpl.t(colorKorean[c.word]),
      word: c.word,
      pronunciation: c.pronunciation,
      practice: c.practice,
    });
  }

  // --- Number sentences ---
  for (const n of numberWords) {
    entries.push({
      sentence: `I have ${n.word} ${pickOne(rng, ['apples', 'books', 'pencils', 'friends', 'toys'])}.`,
      translation: `나는 ${n.korean} ${pickOne(rng, ['개의 사과가', '권의 책이', '개의 연필이', '명의 친구가', '개의 장난감이'])} 있어요.`,
      word: n.word,
      pronunciation: n.pronunciation,
      practice: n.practice,
    });
  }

  // --- Animal sentences ---
  const animalTemplates = [
    { s: (w: string) => `I like ${w}s.`, t: (k: string) => `나는 ${k}를 좋아해요.` },
    { s: (w: string) => `The ${w} is cute.`, t: (k: string) => `그 ${k}는 귀여워요.` },
    { s: (w: string) => `Look at the ${w}!`, t: (k: string) => `${k}를 봐요!` },
    { s: (w: string) => `This is a ${w}.`, t: (k: string) => `이것은 ${k}이에요.` },
    { s: (w: string) => `I see a ${w}.`, t: (k: string) => `나는 ${k}를 봐요.` },
    { s: (w: string) => `The ${w} is big.`, t: (k: string) => `그 ${k}는 커요.` },
    { s: (w: string) => `Do you like ${w}s?`, t: (k: string) => `${k}를 좋아해요?` },
  ];
  for (const a of animalWords) {
    const tmpl = pickOne(rng, animalTemplates);
    entries.push({
      sentence: tmpl.s(a.word),
      translation: tmpl.t(animalKorean[a.word]),
      word: a.word,
      pronunciation: a.pronunciation,
      practice: a.practice,
    });
  }

  // --- Family sentences ---
  const familyTemplates = [
    { s: (w: string) => `This is my ${w}.`, t: (k: string) => `이분은 내 ${k}이에요.` },
    { s: (w: string) => `I love my ${w}.`, t: (k: string) => `나는 내 ${k}를 사랑해요.` },
    { s: (w: string) => `My ${w} is kind.`, t: (k: string) => `내 ${k}는 친절해요.` },
    { s: (w: string) => `My ${w} is tall.`, t: (k: string) => `내 ${k}는 키가 커요.` },
    { s: (w: string) => `I have a ${w}.`, t: (k: string) => `나는 ${k}가 있어요.` },
  ];
  for (const f of familyWords) {
    const tmpl = pickOne(rng, familyTemplates);
    entries.push({
      sentence: tmpl.s(f.word),
      translation: tmpl.t(familyKorean[f.word]),
      word: f.word,
      pronunciation: f.pronunciation,
      practice: f.practice,
    });
  }

  // --- Food sentences ---
  const foodTemplates = [
    { s: (w: string) => `I like to eat ${w}.`, t: (k: string) => `나는 ${k} 먹는 것을 좋아해요.` },
    { s: (w: string) => `I want ${w}.`, t: (k: string) => `나는 ${k}를 원해요.` },
    { s: (w: string) => `This ${w} is yummy.`, t: (k: string) => `이 ${k}는 맛있어요.` },
    { s: (w: string) => `Can I have ${w}?`, t: (k: string) => `${k} 먹어도 돼요?` },
    { s: (w: string) => `Do you like ${w}?`, t: (k: string) => `${k} 좋아해요?` },
    { s: (w: string) => `I eat ${w} every day.`, t: (k: string) => `나는 매일 ${k}를 먹어요.` },
  ];
  for (const f of foodWords) {
    const tmpl = pickOne(rng, foodTemplates);
    entries.push({
      sentence: tmpl.s(f.word),
      translation: tmpl.t(foodKorean[f.word]),
      word: f.word,
      pronunciation: f.pronunciation,
      practice: f.practice,
    });
  }

  // --- Body part sentences ---
  const bodyTemplates = [
    { s: (w: string) => `This is my ${w}.`, t: (k: string) => `이것은 내 ${k}이에요.` },
    { s: (w: string) => `Touch your ${w}.`, t: (k: string) => `${k}를 만져 보세요.` },
    { s: (w: string) => `I have two ${w}s.`, t: (k: string) => `나는 ${k}가 두 개 있어요.` },
    { s: (w: string) => `My ${w} hurts.`, t: (k: string) => `내 ${k}가 아파요.` },
    { s: (w: string) => `Wash your ${w}.`, t: (k: string) => `${k}를 씻으세요.` },
  ];
  for (const b of bodyWords) {
    const tmpl = pickOne(rng, bodyTemplates);
    entries.push({
      sentence: tmpl.s(b.word),
      translation: tmpl.t(bodyKorean[b.word]),
      word: b.word,
      pronunciation: b.pronunciation,
      practice: b.practice,
    });
  }

  // --- Daily activity sentences ---
  const dailyTemplates = [
    { s: (w: string) => `I ${w} every day.`, t: (k: string) => `나는 매일 ${k}.` },
    { s: (w: string) => `Let's ${w}!`, t: (k: string) => `같이 ${k}!` },
    { s: (w: string) => `I can ${w}.`, t: (k: string) => `나는 ${k} 수 있어요.` },
    { s: (w: string) => `Do you like to ${w}?`, t: (k: string) => `${k} 것을 좋아해요?` },
    { s: (w: string) => `I like to ${w}.`, t: (k: string) => `나는 ${k} 것을 좋아해요.` },
  ];
  const dailyKoreanVerb: Record<string, Record<string, string>> = {
    'I _ every day.': {
      eat: '먹어요', drink: '마셔요', sleep: '자요', run: '달려요', walk: '걸어요',
      read: '읽어요', write: '써요', play: '놀아요', sing: '노래해요', dance: '춤춰요',
      swim: '수영해요', jump: '점프해요', draw: '그려요', cook: '요리해요', wash: '씻어요',
      study: '공부해요', listen: '들어요', look: '봐요', sit: '앉아요', stand: '서요',
    },
    "Let's _!": {
      eat: '먹자', drink: '마시자', sleep: '자자', run: '달리자', walk: '걷자',
      read: '읽자', write: '쓰자', play: '놀자', sing: '노래하자', dance: '춤추자',
      swim: '수영하자', jump: '점프하자', draw: '그리자', cook: '요리하자', wash: '씻자',
      study: '공부하자', listen: '듣자', look: '보자', sit: '앉자', stand: '서자',
    },
    'I can _.': {
      eat: '먹을', drink: '마실', sleep: '잘', run: '달릴', walk: '걸을',
      read: '읽을', write: '쓸', play: '놀', sing: '노래할', dance: '춤출',
      swim: '수영할', jump: '점프할', draw: '그릴', cook: '요리할', wash: '씻을',
      study: '공부할', listen: '들을', look: '볼', sit: '앉을', stand: '설',
    },
    'Do you like to _?': {
      eat: '먹는', drink: '마시는', sleep: '자는', run: '달리는', walk: '걷는',
      read: '읽는', write: '쓰는', play: '노는', sing: '노래하는', dance: '춤추는',
      swim: '수영하는', jump: '점프하는', draw: '그리는', cook: '요리하는', wash: '씻는',
      study: '공부하는', listen: '듣는', look: '보는', sit: '앉는', stand: '서는',
    },
    'I like to _.': {
      eat: '먹는', drink: '마시는', sleep: '자는', run: '달리는', walk: '걷는',
      read: '읽는', write: '쓰는', play: '노는', sing: '노래하는', dance: '춤추는',
      swim: '수영하는', jump: '점프하는', draw: '그리는', cook: '요리하는', wash: '씻는',
      study: '공부하는', listen: '듣는', look: '보는', sit: '앉는', stand: '서는',
    },
  };
  for (const d of dailyWords) {
    const idx = Math.floor(rng() * dailyTemplates.length);
    const tmpl = dailyTemplates[idx];
    const keys = ['I _ every day.', "Let's _!", 'I can _.', 'Do you like to _?', 'I like to _.'];
    const koreanMap = dailyKoreanVerb[keys[idx]];
    const kVerb = koreanMap[d.word] || dailyKorean[d.word];
    entries.push({
      sentence: tmpl.s(d.word),
      translation: tmpl.t(kVerb),
      word: d.word,
      pronunciation: d.pronunciation,
      practice: d.practice,
    });
  }

  // --- School items sentences ---
  const schoolTemplates = [
    { s: (w: string) => `This is a ${w}.`, t: (k: string) => `이것은 ${k}이에요.` },
    { s: (w: string) => `I have a ${w}.`, t: (k: string) => `나는 ${k}가 있어요.` },
    { s: (w: string) => `Where is my ${w}?`, t: (k: string) => `내 ${k}가 어디 있어요?` },
    { s: (w: string) => `Open your ${w}.`, t: (k: string) => `${k}를 여세요.` },
    { s: (w: string) => `I need a ${w}.`, t: (k: string) => `${k}가 필요해요.` },
  ];
  for (const s of schoolItemWords) {
    const tmpl = pickOne(rng, schoolTemplates);
    entries.push({
      sentence: tmpl.s(s.word),
      translation: tmpl.t(schoolItemKorean[s.word]),
      word: s.word,
      pronunciation: s.pronunciation,
      practice: s.practice,
    });
  }

  // --- Adjective sentences ---
  const adjTemplates = [
    { s: (w: string) => `The dog is ${w}.`, t: (k: string) => `그 개는 ${k}.` },
    { s: (w: string) => `I am ${w}.`, t: (k: string) => `나는 ${k}.` },
    { s: (w: string) => `It is ${w}.`, t: (k: string) => `그것은 ${k}.` },
    { s: (w: string) => `This is very ${w}.`, t: (k: string) => `이것은 매우 ${k}.` },
  ];
  const adjKoreanEndings: Record<string, string[]> = {
    big: ['커요', '큰 편이에요'], small: ['작아요', '작은 편이에요'],
    happy: ['행복해요', '기뻐요'], sad: ['슬퍼요', '우울해요'],
    hot: ['뜨거워요', '더워요'], cold: ['차가워요', '추워요'],
    fast: ['빨라요', '빠른 편이에요'], slow: ['느려요', '느린 편이에요'],
    good: ['좋아요', '괜찮아요'], bad: ['나빠요', '안 좋아요'],
    long: ['길어요', '긴 편이에요'], short: ['짧아요', '짧은 편이에요'],
    new: ['새로워요', '새 것이에요'], old: ['오래됐어요', '낡았어요'],
    pretty: ['예뻐요', '귀여워요'], hungry: ['배고파요', '허기져요'],
  };
  for (const a of adjectiveWords) {
    const tmpl = pickOne(rng, adjTemplates);
    const ending = pickOne(rng, adjKoreanEndings[a.word] || [adjectiveKorean[a.word]]);
    entries.push({
      sentence: tmpl.s(a.word),
      translation: tmpl.t(ending),
      word: a.word,
      pronunciation: a.pronunciation,
      practice: a.practice,
    });
  }

  // --- Clothing sentences ---
  const clothingTemplates = [
    { s: (w: string) => `I wear ${w}.`, t: (k: string) => `나는 ${k}를 입어요.` },
    { s: (w: string) => `This ${w} is nice.`, t: (k: string) => `이 ${k}는 멋져요.` },
    { s: (w: string) => `Put on your ${w}.`, t: (k: string) => `${k}를 입으세요.` },
    { s: (w: string) => `I like this ${w}.`, t: (k: string) => `나는 이 ${k}가 좋아요.` },
  ];
  for (const c of clothingWords) {
    const tmpl = pickOne(rng, clothingTemplates);
    entries.push({
      sentence: tmpl.s(c.word),
      translation: tmpl.t(clothingKorean[c.word]),
      word: c.word,
      pronunciation: c.pronunciation,
      practice: c.practice,
    });
  }

  // --- Transport sentences ---
  const transportTemplates = [
    { s: (w: string) => `I go by ${w}.`, t: (k: string) => `나는 ${k}로 가요.` },
    { s: (w: string) => `This is a ${w}.`, t: (k: string) => `이것은 ${k}이에요.` },
    { s: (w: string) => `I ride the ${w}.`, t: (k: string) => `나는 ${k}를 타요.` },
    { s: (w: string) => `The ${w} is fast.`, t: (k: string) => `${k}는 빨라요.` },
  ];
  for (const t of transportWords) {
    const tmpl = pickOne(rng, transportTemplates);
    entries.push({
      sentence: tmpl.s(t.word),
      translation: tmpl.t(transportKorean[t.word]),
      word: t.word,
      pronunciation: t.pronunciation,
      practice: t.practice,
    });
  }

  // --- Nature / Outdoor sentences ---
  const natureEntries: { word: string; pron: string; korean: string; practice: string[] }[] = [
    { word: 'tree', pron: '트리', korean: '나무', practice: ['leaf', 'forest', 'branch'] },
    { word: 'flower', pron: '플라워', korean: '꽃', practice: ['rose', 'garden', 'petal'] },
    { word: 'sun', pron: '선', korean: '태양', practice: ['moon', 'star', 'bright'] },
    { word: 'moon', pron: '문', korean: '달', practice: ['sun', 'star', 'night'] },
    { word: 'star', pron: '스타', korean: '별', practice: ['sun', 'moon', 'sky'] },
    { word: 'sky', pron: '스카이', korean: '하늘', practice: ['cloud', 'sun', 'blue'] },
    { word: 'rain', pron: '레인', korean: '비', practice: ['umbrella', 'cloud', 'wet'] },
    { word: 'snow', pron: '스노', korean: '눈', practice: ['winter', 'cold', 'white'] },
    { word: 'river', pron: '리버', korean: '강', practice: ['lake', 'ocean', 'water'] },
    { word: 'mountain', pron: '마운틴', korean: '산', practice: ['hill', 'climb', 'high'] },
    { word: 'garden', pron: '가든', korean: '정원', practice: ['flower', 'plant', 'grass'] },
    { word: 'sea', pron: '시', korean: '바다', practice: ['ocean', 'wave', 'fish'] },
  ];
  const natureTemplates = [
    { s: (w: string) => `I see the ${w}.`, t: (k: string) => `나는 ${k}를 봐요.` },
    { s: (w: string) => `The ${w} is beautiful.`, t: (k: string) => `${k}는 아름다워요.` },
    { s: (w: string) => `Look at the ${w}!`, t: (k: string) => `${k}를 봐요!` },
    { s: (w: string) => `I like the ${w}.`, t: (k: string) => `나는 ${k}를 좋아해요.` },
  ];
  for (const n of natureEntries) {
    const tmpl = pickOne(rng, natureTemplates);
    entries.push({
      sentence: tmpl.s(n.word),
      translation: tmpl.t(n.korean),
      word: n.word,
      pronunciation: n.pron,
      practice: n.practice,
    });
  }

  // --- Position / Direction sentences ---
  const positionEntries: { word: string; pron: string; sentence: string; translation: string; practice: string[] }[] = [
    { word: 'up', pron: '업', sentence: 'Look up!', translation: '위를 봐요!', practice: ['down', 'high', 'sky'] },
    { word: 'down', pron: '다운', sentence: 'Sit down, please.', translation: '앉으세요.', practice: ['up', 'low', 'under'] },
    { word: 'in', pron: '인', sentence: 'The cat is in the box.', translation: '고양이가 상자 안에 있어요.', practice: ['out', 'inside', 'box'] },
    { word: 'out', pron: '아웃', sentence: 'Go out and play.', translation: '밖에 나가서 놀아요.', practice: ['in', 'outside', 'exit'] },
    { word: 'here', pron: '히어', sentence: 'Come here!', translation: '여기로 와요!', practice: ['there', 'this', 'near'] },
    { word: 'there', pron: '데어', sentence: 'Look over there.', translation: '저기를 봐요.', practice: ['here', 'that', 'far'] },
    { word: 'left', pron: '레프트', sentence: 'Turn left.', translation: '왼쪽으로 돌아요.', practice: ['right', 'straight', 'direction'] },
    { word: 'right', pron: '라이트', sentence: 'Turn right.', translation: '오른쪽으로 돌아요.', practice: ['left', 'straight', 'direction'] },
    { word: 'next to', pron: '넥스트 투', sentence: 'I sit next to my friend.', translation: '나는 친구 옆에 앉아요.', practice: ['beside', 'near', 'close'] },
    { word: 'behind', pron: '비하인드', sentence: 'The dog is behind the house.', translation: '개가 집 뒤에 있어요.', practice: ['front', 'back', 'after'] },
    { word: 'between', pron: '비트윈', sentence: 'I am between my mom and dad.', translation: '나는 엄마와 아빠 사이에 있어요.', practice: ['middle', 'among', 'center'] },
    { word: 'under', pron: '언더', sentence: 'The ball is under the table.', translation: '공이 탁자 아래에 있어요.', practice: ['below', 'above', 'beneath'] },
    { word: 'above', pron: '어보브', sentence: 'The bird flies above the tree.', translation: '새가 나무 위를 날아요.', practice: ['over', 'below', 'high'] },
    { word: 'on', pron: '온', sentence: 'The book is on the desk.', translation: '책이 책상 위에 있어요.', practice: ['off', 'upon', 'top'] },
  ];
  for (const p of positionEntries) {
    entries.push({
      sentence: p.sentence,
      translation: p.translation,
      word: p.word,
      pronunciation: p.pron,
      practice: p.practice,
    });
  }

  // --- Classroom commands ---
  const commandEntries: { sentence: string; translation: string; word: string; pron: string; practice: string[] }[] = [
    { sentence: 'Open your book.', translation: '책을 펴세요.', word: 'open', pron: '오픈', practice: ['close', 'read', 'page'] },
    { sentence: 'Close the door.', translation: '문을 닫으세요.', word: 'close', pron: '클로즈', practice: ['open', 'shut', 'door'] },
    { sentence: 'Raise your hand.', translation: '손을 들어요.', word: 'raise', pron: '레이즈', practice: ['hand', 'up', 'lift'] },
    { sentence: 'Be quiet, please.', translation: '조용히 해 주세요.', word: 'quiet', pron: '콰이엇', practice: ['silent', 'calm', 'shh'] },
    { sentence: 'Listen carefully.', translation: '잘 들으세요.', word: 'carefully', pron: '케어풀리', practice: ['listen', 'hear', 'attention'] },
    { sentence: 'Repeat after me.', translation: '따라 하세요.', word: 'repeat', pron: '리핏', practice: ['again', 'say', 'follow'] },
    { sentence: 'Clean your desk.', translation: '책상을 정리하세요.', word: 'clean', pron: '클린', practice: ['tidy', 'organize', 'neat'] },
    { sentence: 'Share with your friend.', translation: '친구와 나누세요.', word: 'share', pron: '쉐어', practice: ['give', 'together', 'kind'] },
    { sentence: 'Line up, everyone.', translation: '모두 줄 서세요.', word: 'line up', pron: '라인 업', practice: ['queue', 'row', 'order'] },
    { sentence: 'Take out your pencil.', translation: '연필을 꺼내세요.', word: 'take out', pron: '테이크 아웃', practice: ['pencil', 'bag', 'ready'] },
  ];
  for (const c of commandEntries) {
    entries.push({
      sentence: c.sentence,
      translation: c.translation,
      word: c.word,
      pronunciation: c.pron,
      practice: c.practice,
    });
  }

  return entries;
}

// Grade 5-6: Intermediate sentence templates
function generateGrade5_6Sentences(rng: () => number): EnglishEntry[] {
  const entries: EnglishEntry[] = [];

  // --- Subject sentences ---
  const subjectTemplates = [
    { s: (w: string) => `I like ${w} class.`, t: (k: string) => `나는 ${k} 수업을 좋아해요.` },
    { s: (w: string) => `${w} is my favorite subject.`, t: (k: string) => `${k}은 내가 가장 좋아하는 과목이에요.` },
    { s: (w: string) => `We study ${w} at school.`, t: (k: string) => `우리는 학교에서 ${k}을 공부해요.` },
    { s: (w: string) => `${w} class is interesting.`, t: (k: string) => `${k} 수업은 재미있어요.` },
    { s: (w: string) => `I have ${w} on Monday.`, t: (k: string) => `월요일에 ${k} 수업이 있어요.` },
  ];
  for (const s of subjectWords) {
    const tmpl = pickOne(rng, subjectTemplates);
    entries.push({
      sentence: tmpl.s(s.word),
      translation: tmpl.t(subjectKorean[s.word]),
      word: s.word,
      pronunciation: s.pronunciation,
      practice: s.practice,
    });
  }

  // --- Weather sentences ---
  const weatherTemplates = [
    { s: (w: string) => `It is ${w} today.`, t: (k: string) => `오늘은 ${k} 날씨예요.` },
    { s: (w: string) => `The weather is ${w}.`, t: (k: string) => `날씨가 ${k}.` },
    { s: (w: string) => `It will be ${w} tomorrow.`, t: (k: string) => `내일은 ${k} 날씨일 거예요.` },
    { s: (w: string) => `I don't like ${w} weather.`, t: (k: string) => `나는 ${k} 날씨를 좋아하지 않아요.` },
    { s: (w: string) => `Is it ${w} outside?`, t: (k: string) => `밖이 ${k}?` },
  ];
  for (const w of weatherWords) {
    const tmpl = pickOne(rng, weatherTemplates);
    entries.push({
      sentence: tmpl.s(w.word),
      translation: tmpl.t(weatherKorean[w.word]),
      word: w.word,
      pronunciation: w.pronunciation,
      practice: w.practice,
    });
  }

  // --- Hobby sentences ---
  const hobbyTemplates = [
    { s: (w: string) => `My hobby is ${w}.`, t: (k: string) => `내 취미는 ${k}이에요.` },
    { s: (w: string) => `I enjoy ${w}.`, t: (k: string) => `나는 ${k}을 즐겨요.` },
    { s: (w: string) => `Do you like ${w}?`, t: (k: string) => `${k} 좋아해요?` },
    { s: (w: string) => `I go ${w} on weekends.`, t: (k: string) => `나는 주말에 ${k}을 해요.` },
    { s: (w: string) => `${w} is fun.`, t: (k: string) => `${k}은 재미있어요.` },
    { s: (w: string) => `I started ${w} last year.`, t: (k: string) => `나는 작년에 ${k}을 시작했어요.` },
  ];
  for (const h of hobbyWords) {
    const tmpl = pickOne(rng, hobbyTemplates);
    entries.push({
      sentence: tmpl.s(h.word),
      translation: tmpl.t(hobbyKorean[h.word]),
      word: h.word,
      pronunciation: h.pronunciation,
      practice: h.practice,
    });
  }

  // --- Place sentences ---
  const placeTemplates = [
    { s: (w: string) => `I went to the ${w}.`, t: (k: string) => `나는 ${k}에 갔어요.` },
    { s: (w: string) => `The ${w} is near my house.`, t: (k: string) => `${k}은 우리 집 근처에 있어요.` },
    { s: (w: string) => `Let's go to the ${w}.`, t: (k: string) => `${k}에 가자.` },
    { s: (w: string) => `Where is the ${w}?`, t: (k: string) => `${k}이 어디에 있어요?` },
    { s: (w: string) => `The ${w} is very big.`, t: (k: string) => `그 ${k}은 매우 커요.` },
    { s: (w: string) => `I like going to the ${w}.`, t: (k: string) => `나는 ${k}에 가는 것을 좋아해요.` },
  ];
  for (const p of placeWords) {
    const tmpl = pickOne(rng, placeTemplates);
    entries.push({
      sentence: tmpl.s(p.word),
      translation: tmpl.t(placeKorean[p.word]),
      word: p.word,
      pronunciation: p.pronunciation,
      practice: p.practice,
    });
  }

  // --- Emotion sentences ---
  const emotionTemplates = [
    { s: (w: string) => `I feel ${w}.`, t: (k: string) => `나는 ${k} 기분이에요.` },
    { s: (w: string) => `She looks ${w}.`, t: (k: string) => `그녀는 ${k} 보여요.` },
    { s: (w: string) => `Are you ${w}?`, t: (k: string) => `${k} 기분이에요?` },
    { s: (w: string) => `He was ${w} yesterday.`, t: (k: string) => `그는 어제 ${k} 기분이었어요.` },
    { s: (w: string) => `Don't be ${w}.`, t: (k: string) => `${k} 하지 마세요.` },
    { s: (w: string) => `I am so ${w} right now.`, t: (k: string) => `나는 지금 너무 ${k}.` },
  ];
  for (const e of emotionWords) {
    const tmpl = pickOne(rng, emotionTemplates);
    entries.push({
      sentence: tmpl.s(e.word),
      translation: tmpl.t(emotionKorean[e.word]),
      word: e.word,
      pronunciation: e.pronunciation,
      practice: e.practice,
    });
  }

  // --- Time & Day sentences ---
  const timeTemplates = [
    { s: (w: string) => `Today is ${w}.`, t: (k: string) => `오늘은 ${k}이에요.` },
    { s: (w: string) => `I like ${w}.`, t: (k: string) => `나는 ${k}를 좋아해요.` },
    { s: (w: string) => `See you on ${w}.`, t: (k: string) => `${k}에 만나요.` },
    { s: (w: string) => `What do you do on ${w}?`, t: (k: string) => `${k}에 뭐 해요?` },
  ];
  for (const t of timeWords) {
    const tmpl = pickOne(rng, timeTemplates);
    entries.push({
      sentence: tmpl.s(t.word),
      translation: tmpl.t(t.korean),
      word: t.word,
      pronunciation: t.pronunciation,
      practice: t.practice,
    });
  }

  // --- Season & Month sentences ---
  const seasonTemplates = [
    { s: (w: string) => `I like ${w}.`, t: (k: string) => `나는 ${k}을 좋아해요.` },
    { s: (w: string) => `${w} is beautiful.`, t: (k: string) => `${k}은 아름다워요.` },
    { s: (w: string) => `My birthday is in ${w}.`, t: (k: string) => `내 생일은 ${k}에 있어요.` },
    { s: (w: string) => `We have a holiday in ${w}.`, t: (k: string) => `${k}에 공휴일이 있어요.` },
  ];
  for (const s of seasonWords) {
    const tmpl = pickOne(rng, seasonTemplates);
    entries.push({
      sentence: tmpl.s(s.word),
      translation: tmpl.t(s.korean),
      word: s.word,
      pronunciation: s.pronunciation,
      practice: s.practice,
    });
  }

  // --- Comparison / Intermediate adjective sentences ---
  const compTemplates = [
    { s: (w: string) => `This is ${w} than that.`, t: (k: string) => `이것은 저것보다 ${k}.` },
    { s: (w: string) => `She is ${w}.`, t: (k: string) => `그녀는 ${k}.` },
    { s: (w: string) => `The movie was ${w}.`, t: (k: string) => `그 영화는 ${k}어요.` },
    { s: (w: string) => `This book is ${w}.`, t: (k: string) => `이 책은 ${k}.` },
    { s: (w: string) => `That building is ${w}.`, t: (k: string) => `저 건물은 ${k}.` },
    { s: (w: string) => `The test was ${w}.`, t: (k: string) => `시험은 ${k}어요.` },
  ];
  for (const a of intermediateAdjectiveWords) {
    const tmpl = pickOne(rng, compTemplates);
    entries.push({
      sentence: tmpl.s(a.word),
      translation: tmpl.t(intermediateAdjectiveKorean[a.word]),
      word: a.word,
      pronunciation: a.pronunciation,
      practice: a.practice,
    });
  }

  // --- Past tense sentences ---
  const pastTemplates = [
    { s: (w: string, p: string) => `I ${w} to school yesterday.`, t: (k: string) => `나는 어제 학교에 ${k}.` },
    { s: (w: string, p: string) => `She ${w} a book last night.`, t: (k: string) => `그녀는 어젯밤에 책을 ${k}.` },
    { s: (w: string, p: string) => `We ${w} together.`, t: (k: string) => `우리는 함께 ${k}.` },
    { s: (w: string, p: string) => `He ${w} in the park.`, t: (k: string) => `그는 공원에서 ${k}.` },
    { s: (w: string, p: string) => `They ${w} last weekend.`, t: (k: string) => `그들은 지난 주말에 ${k}.` },
  ];
  for (const p of pastTenseWords) {
    const tmpl = pickOne(rng, pastTemplates);
    entries.push({
      sentence: tmpl.s(p.word, p.present),
      translation: tmpl.t(p.korean),
      word: p.word,
      pronunciation: p.pronunciation,
      practice: p.practice,
    });
  }

  // --- Additional combinatorial sentences for grade 5-6 to reach 200+ ---
  // Combine places with activities
  const placeActivityPairs: { place: string; placeK: string; activity: string; activityK: string }[] = [
    { place: 'library', placeK: '도서관', activity: 'read books', activityK: '책을 읽었어요' },
    { place: 'park', placeK: '공원', activity: 'played soccer', activityK: '축구를 했어요' },
    { place: 'school', placeK: '학교', activity: 'studied hard', activityK: '열심히 공부했어요' },
    { place: 'restaurant', placeK: '식당', activity: 'ate lunch', activityK: '점심을 먹었어요' },
    { place: 'museum', placeK: '박물관', activity: 'saw paintings', activityK: '그림을 봤어요' },
    { place: 'zoo', placeK: '동물원', activity: 'saw animals', activityK: '동물을 봤어요' },
    { place: 'beach', placeK: '해변', activity: 'swam in the ocean', activityK: '바다에서 수영했어요' },
    { place: 'market', placeK: '시장', activity: 'bought fruits', activityK: '과일을 샀어요' },
    { place: 'hospital', placeK: '병원', activity: 'visited my grandma', activityK: '할머니를 찾아뵀어요' },
    { place: 'mountain', placeK: '산', activity: 'went hiking', activityK: '등산을 했어요' },
  ];
  for (const pair of placeActivityPairs) {
    entries.push({
      sentence: `I went to the ${pair.place} and ${pair.activity}.`,
      translation: `나는 ${pair.placeK}에 가서 ${pair.activityK}.`,
      word: pair.place,
      pronunciation: placeWords.find(p => p.word === pair.place)?.pronunciation || pair.place,
      practice: placeWords.find(p => p.word === pair.place)?.practice || [],
    });
  }

  // --- "Want to" sentences ---
  const wantToPairs: { verb: string; verbK: string; obj: string; objK: string; pron: string; prac: string[] }[] = [
    { verb: 'visit', verbK: '방문하고', obj: 'Japan', objK: '일본', pron: '비짓', prac: ['travel', 'trip', 'country'] },
    { verb: 'learn', verbK: '배우고', obj: 'English', objK: '영어', pron: '런', prac: ['study', 'practice', 'speak'] },
    { verb: 'become', verbK: '되고', obj: 'a doctor', objK: '의사', pron: '비컴', prac: ['teacher', 'scientist', 'pilot'] },
    { verb: 'try', verbK: '먹어보고', obj: 'new food', objK: '새 음식', pron: '트라이', prac: ['taste', 'eat', 'cook'] },
    { verb: 'ride', verbK: '타고', obj: 'a horse', objK: '말', pron: '라이드', prac: ['bicycle', 'boat', 'train'] },
    { verb: 'meet', verbK: '만나고', obj: 'new friends', objK: '새 친구', pron: '밋', prac: ['greet', 'talk', 'play'] },
    { verb: 'build', verbK: '만들고', obj: 'a robot', objK: '로봇', pron: '빌드', prac: ['create', 'design', 'make'] },
    { verb: 'climb', verbK: '오르고', obj: 'a mountain', objK: '산', pron: '클라임', prac: ['hike', 'walk', 'reach'] },
    { verb: 'fly', verbK: '타고', obj: 'an airplane', objK: '비행기', pron: '플라이', prac: ['travel', 'sky', 'pilot'] },
    { verb: 'win', verbK: '이기고', obj: 'the game', objK: '경기', pron: '윈', prac: ['lose', 'compete', 'play'] },
  ];
  for (const pair of wantToPairs) {
    entries.push({
      sentence: `I want to ${pair.verb} ${pair.obj}.`,
      translation: `나는 ${pair.objK}를 ${pair.verbK} 싶어요.`,
      word: pair.verb,
      pronunciation: pair.pron,
      practice: pair.prac,
    });
  }

  // --- "Can you" question sentences ---
  const canYouPairs: { action: string; actionK: string; word: string; pron: string; prac: string[] }[] = [
    { action: 'speak English', actionK: '영어를 할 수 있어요', word: 'speak', pron: '스피크', prac: ['talk', 'say', 'tell'] },
    { action: 'play the piano', actionK: '피아노를 칠 수 있어요', word: 'piano', pron: '피아노', prac: ['guitar', 'violin', 'drum'] },
    { action: 'ride a bicycle', actionK: '자전거를 탈 수 있어요', word: 'ride', pron: '라이드', prac: ['drive', 'pedal', 'balance'] },
    { action: 'cook dinner', actionK: '저녁을 만들 수 있어요', word: 'dinner', pron: '디너', prac: ['lunch', 'breakfast', 'meal'] },
    { action: 'swim in the ocean', actionK: '바다에서 수영할 수 있어요', word: 'ocean', pron: '오션', prac: ['sea', 'lake', 'river'] },
    { action: 'run fast', actionK: '빨리 달릴 수 있어요', word: 'fast', pron: '패스트', prac: ['quick', 'speed', 'race'] },
    { action: 'draw animals', actionK: '동물을 그릴 수 있어요', word: 'draw', pron: '드로', prac: ['paint', 'sketch', 'color'] },
    { action: 'sing a song', actionK: '노래를 부를 수 있어요', word: 'song', pron: '송', prac: ['music', 'melody', 'tune'] },
    { action: 'count to one hundred', actionK: '백까지 셀 수 있어요', word: 'count', pron: '카운트', prac: ['number', 'add', 'subtract'] },
    { action: 'read Korean', actionK: '한국어를 읽을 수 있어요', word: 'Korean', pron: '코리안', prac: ['English', 'language', 'alphabet'] },
  ];
  for (const pair of canYouPairs) {
    entries.push({
      sentence: `Can you ${pair.action}?`,
      translation: `${pair.actionK}?`,
      word: pair.word,
      pronunciation: pair.pron,
      practice: pair.prac,
    });
  }

  // --- "Because" reason sentences ---
  const becausePairs: { main: string; mainK: string; reason: string; reasonK: string; word: string; pron: string; prac: string[] }[] = [
    { main: 'I am happy', mainK: '나는 행복해요', reason: 'it is my birthday', reasonK: '내 생일이에요', word: 'birthday', pron: '벌스데이', prac: ['party', 'cake', 'present'] },
    { main: 'I am tired', mainK: '나는 피곤해요', reason: 'I studied all day', reasonK: '하루 종일 공부했어요', word: 'tired', pron: '타이어드', prac: ['sleepy', 'exhausted', 'rest'] },
    { main: 'She is late', mainK: '그녀는 늦었어요', reason: 'she missed the bus', reasonK: '버스를 놓쳤어요', word: 'late', pron: '레이트', prac: ['early', 'on time', 'hurry'] },
    { main: 'We are excited', mainK: '우리는 신나요', reason: 'we are going on a trip', reasonK: '여행을 가요', word: 'trip', pron: '트립', prac: ['travel', 'vacation', 'journey'] },
    { main: 'He is hungry', mainK: '그는 배고파요', reason: 'he did not eat lunch', reasonK: '점심을 안 먹었어요', word: 'hungry', pron: '헝그리', prac: ['thirsty', 'starving', 'food'] },
    { main: 'I wear a jacket', mainK: '나는 재킷을 입어요', reason: 'it is cold outside', reasonK: '밖이 추워요', word: 'jacket', pron: '재킷', prac: ['coat', 'sweater', 'warm'] },
    { main: 'I take an umbrella', mainK: '나는 우산을 가져가요', reason: 'it is rainy', reasonK: '비가 와요', word: 'umbrella', pron: '엄브렐라', prac: ['raincoat', 'boots', 'wet'] },
    { main: 'She is proud', mainK: '그녀는 자랑스러워요', reason: 'she won the contest', reasonK: '대회에서 이겼어요', word: 'proud', pron: '프라우드', prac: ['happy', 'confident', 'winner'] },
    { main: 'I like spring', mainK: '나는 봄을 좋아해요', reason: 'the flowers bloom', reasonK: '꽃이 피어요', word: 'spring', pron: '스프링', prac: ['flower', 'warm', 'green'] },
    { main: 'They are scared', mainK: '그들은 무서워요', reason: 'they heard a loud noise', reasonK: '큰 소리를 들었어요', word: 'scared', pron: '스케어드', prac: ['afraid', 'frightened', 'noise'] },
  ];
  for (const pair of becausePairs) {
    entries.push({
      sentence: `${pair.main} because ${pair.reason}.`,
      translation: `${pair.reasonK} 때문에 ${pair.mainK}.`,
      word: pair.word,
      pronunciation: pair.pron,
      practice: pair.prac,
    });
  }

  // --- "If" conditional sentences ---
  const ifPairs: { condition: string; condK: string; result: string; resultK: string; word: string; pron: string; prac: string[] }[] = [
    { condition: 'it rains', condK: '비가 오면', result: 'I will stay home', resultK: '나는 집에 있을 거예요', word: 'rain', pron: '레인', prac: ['snow', 'storm', 'cloud'] },
    { condition: 'you study hard', condK: '열심히 공부하면', result: 'you will do well', resultK: '잘할 거예요', word: 'study', pron: '스터디', prac: ['learn', 'practice', 'review'] },
    { condition: 'I have time', condK: '시간이 있으면', result: 'I will read a book', resultK: '나는 책을 읽을 거예요', word: 'time', pron: '타임', prac: ['clock', 'hour', 'minute'] },
    { condition: 'we finish early', condK: '일찍 끝나면', result: 'we can play outside', resultK: '밖에서 놀 수 있어요', word: 'finish', pron: '피니시', prac: ['complete', 'done', 'end'] },
    { condition: 'you are kind', condK: '친절하면', result: 'people will like you', resultK: '사람들이 좋아할 거예요', word: 'kind', pron: '카인드', prac: ['nice', 'gentle', 'friendly'] },
    { condition: 'it is sunny', condK: '날씨가 좋으면', result: 'we will go to the park', resultK: '우리는 공원에 갈 거예요', word: 'sunny', pron: '서니', prac: ['bright', 'clear', 'warm'] },
    { condition: 'you eat vegetables', condK: '채소를 먹으면', result: 'you will be healthy', resultK: '건강해질 거예요', word: 'healthy', pron: '헬시', prac: ['strong', 'fit', 'well'] },
    { condition: 'I save money', condK: '돈을 모으면', result: 'I can buy a new book', resultK: '새 책을 살 수 있어요', word: 'save', pron: '세이브', prac: ['spend', 'keep', 'collect'] },
  ];
  for (const pair of ifPairs) {
    entries.push({
      sentence: `If ${pair.condition}, ${pair.result}.`,
      translation: `${pair.condK} ${pair.resultK}.`,
      word: pair.word,
      pronunciation: pair.pron,
      practice: pair.prac,
    });
  }

  // --- Routine / "Every day" sentences ---
  const routinePairs: { routine: string; routineK: string; word: string; pron: string; prac: string[] }[] = [
    { routine: 'I wake up at seven', routineK: '나는 7시에 일어나요', word: 'wake up', pron: '웨이크 업', prac: ['get up', 'alarm', 'morning'] },
    { routine: 'I brush my teeth', routineK: '나는 양치해요', word: 'brush', pron: '브러시', prac: ['toothpaste', 'teeth', 'clean'] },
    { routine: 'I eat breakfast', routineK: '나는 아침을 먹어요', word: 'breakfast', pron: '브렉퍼스트', prac: ['lunch', 'dinner', 'meal'] },
    { routine: 'I go to school', routineK: '나는 학교에 가요', word: 'school', pron: '스쿨', prac: ['class', 'teacher', 'student'] },
    { routine: 'I do my homework', routineK: '나는 숙제를 해요', word: 'homework', pron: '홈워크', prac: ['assignment', 'study', 'review'] },
    { routine: 'I take a shower', routineK: '나는 샤워해요', word: 'shower', pron: '샤워', prac: ['bath', 'wash', 'water'] },
    { routine: 'I go to bed at nine', routineK: '나는 9시에 자요', word: 'bed', pron: '베드', prac: ['sleep', 'pillow', 'blanket'] },
    { routine: 'I walk to school', routineK: '나는 걸어서 학교에 가요', word: 'walk', pron: '워크', prac: ['run', 'ride', 'drive'] },
    { routine: 'I feed my pet', routineK: '나는 반려동물에게 밥을 줘요', word: 'feed', pron: '피드', prac: ['food', 'eat', 'pet'] },
    { routine: 'I practice piano', routineK: '나는 피아노를 연습해요', word: 'practice', pron: '프랙티스', prac: ['rehearse', 'play', 'learn'] },
  ];
  for (const pair of routinePairs) {
    entries.push({
      sentence: `Every day, ${pair.routine}.`,
      translation: `매일, ${pair.routineK}.`,
      word: pair.word,
      pronunciation: pair.pron,
      practice: pair.prac,
    });
  }

  // --- Opinion sentences ---
  const opinionPairs: { opinion: string; opinionK: string; word: string; pron: string; prac: string[] }[] = [
    { opinion: 'I think reading is important', opinionK: '나는 독서가 중요하다고 생각해요', word: 'important', pron: '임포턴트', prac: ['valuable', 'essential', 'necessary'] },
    { opinion: 'I believe friends are special', opinionK: '나는 친구가 특별하다고 믿어요', word: 'special', pron: '스페셜', prac: ['unique', 'important', 'wonderful'] },
    { opinion: 'I think nature is beautiful', opinionK: '나는 자연이 아름답다고 생각해요', word: 'nature', pron: '네이처', prac: ['forest', 'mountain', 'river'] },
    { opinion: 'I feel exercise is good for health', opinionK: '운동이 건강에 좋다고 느껴요', word: 'exercise', pron: '엑서사이즈', prac: ['sport', 'fitness', 'health'] },
    { opinion: 'I hope we can travel together', opinionK: '함께 여행할 수 있으면 좋겠어요', word: 'travel', pron: '트래블', prac: ['trip', 'journey', 'adventure'] },
    { opinion: 'I know sharing is caring', opinionK: '나누는 것이 배려라는 것을 알아요', word: 'sharing', pron: '쉐어링', prac: ['giving', 'helping', 'caring'] },
    { opinion: 'I wish I could fly like a bird', opinionK: '새처럼 날 수 있으면 좋겠어요', word: 'fly', pron: '플라이', prac: ['soar', 'glide', 'wing'] },
    { opinion: 'I hope tomorrow will be sunny', opinionK: '내일 날씨가 좋으면 좋겠어요', word: 'hope', pron: '호프', prac: ['wish', 'dream', 'believe'] },
  ];
  for (const pair of opinionPairs) {
    entries.push({
      sentence: `${pair.opinion}.`,
      translation: `${pair.opinionK}.`,
      word: pair.word,
      pronunciation: pair.pron,
      practice: pair.prac,
    });
  }

  // --- Frequency / Adverb sentences ---
  const adverbEntries: { sentence: string; translation: string; word: string; pron: string; practice: string[] }[] = [
    { sentence: 'I always do my homework.', translation: '나는 항상 숙제를 해요.', word: 'always', pron: '올웨이즈', practice: ['never', 'sometimes', 'usually'] },
    { sentence: 'She never eats candy.', translation: '그녀는 절대 사탕을 안 먹어요.', word: 'never', pron: '네버', practice: ['always', 'sometimes', 'rarely'] },
    { sentence: 'I sometimes play soccer.', translation: '나는 가끔 축구를 해요.', word: 'sometimes', pron: '섬타임즈', practice: ['always', 'never', 'often'] },
    { sentence: 'He usually walks to school.', translation: '그는 보통 걸어서 학교에 가요.', word: 'usually', pron: '유주얼리', practice: ['always', 'sometimes', 'often'] },
    { sentence: 'We often go to the library.', translation: '우리는 자주 도서관에 가요.', word: 'often', pron: '오픈', practice: ['rarely', 'sometimes', 'frequently'] },
    { sentence: 'They seldom eat out.', translation: '그들은 거의 외식하지 않아요.', word: 'seldom', pron: '셀덤', practice: ['rarely', 'never', 'sometimes'] },
  ];
  for (const a of adverbEntries) {
    entries.push({
      sentence: a.sentence,
      translation: a.translation,
      word: a.word,
      pronunciation: a.pron,
      practice: a.practice,
    });
  }

  // --- "Should" advice sentences ---
  const shouldEntries: { sentence: string; translation: string; word: string; pron: string; practice: string[] }[] = [
    { sentence: 'You should eat breakfast.', translation: '아침을 먹어야 해요.', word: 'should', pron: '슈드', practice: ['must', 'need', 'have to'] },
    { sentence: 'We should be kind to others.', translation: '다른 사람에게 친절해야 해요.', word: 'kind', pron: '카인드', practice: ['nice', 'gentle', 'caring'] },
    { sentence: 'You should drink more water.', translation: '물을 더 마셔야 해요.', word: 'water', pron: '워터', practice: ['juice', 'milk', 'drink'] },
    { sentence: 'She should go to bed early.', translation: '그녀는 일찍 자야 해요.', word: 'early', pron: '얼리', practice: ['late', 'soon', 'quick'] },
    { sentence: 'We should help each other.', translation: '우리는 서로 도와야 해요.', word: 'help', pron: '헬프', practice: ['support', 'assist', 'care'] },
    { sentence: 'You should wear a helmet.', translation: '헬멧을 써야 해요.', word: 'helmet', pron: '헬멧', practice: ['safety', 'protect', 'head'] },
  ];
  for (const s of shouldEntries) {
    entries.push({
      sentence: s.sentence,
      translation: s.translation,
      word: s.word,
      pronunciation: s.pron,
      practice: s.practice,
    });
  }

  return entries;
}

// ============================================================
// Main Export
// ============================================================

export function generateEnglishPool(grade: number, seed: number): EnglishEntry[] {
  // Grades 1-2 don't have English curriculum
  if (grade <= 2) {
    return [];
  }

  const rng = seededRandom(seed);

  let pool: EnglishEntry[];

  if (grade <= 4) {
    // Grade 3-4: Basic English
    pool = generateGrade3_4Sentences(rng);
  } else {
    // Grade 5-6: Intermediate English
    pool = generateGrade5_6Sentences(rng);
  }

  // Shuffle the pool with the seeded PRNG
  pool = shuffle(rng, pool);

  // Ensure we return at least 400 items by duplicating with variations if needed
  if (pool.length < 400) {
    const originalLength = pool.length;
    let idx = 0;
    while (pool.length < 400) {
      const base = pool[idx % originalLength];
      // Create a slight variation to avoid exact duplicates
      const variation: EnglishEntry = {
        ...base,
        sentence: base.sentence,
        translation: base.translation,
        word: base.word,
        pronunciation: base.pronunciation,
        practice: base.practice ? [...base.practice] : undefined,
      };
      pool.push(variation);
      idx++;
    }
    // Re-shuffle after padding
    pool = shuffle(rng, pool);
  }

  return pool.slice(0, 400);
}
