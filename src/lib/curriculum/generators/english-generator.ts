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
// Compact Word Data Type
// ============================================================
interface W { w: string; p: string; k: string; pr: string[] }

// ============================================================
// Grade 3-4 Word Banks
// ============================================================

const G34_GREETINGS: W[] = [
  { w: 'hello', p: '헬로', k: '안녕하세요', pr: ['hi', 'hey'] },
  { w: 'goodbye', p: '굿바이', k: '안녕히 가세요', pr: ['bye', 'see you'] },
  { w: 'thank you', p: '땡큐', k: '감사합니다', pr: ['thanks', 'appreciate'] },
  { w: 'sorry', p: '쏘리', k: '미안해요', pr: ['excuse me', 'pardon'] },
  { w: 'please', p: '플리즈', k: '제발', pr: ['kindly'] },
  { w: 'welcome', p: '웰컴', k: '환영해요', pr: ['greet', 'invite'] },
  { w: 'good morning', p: '굿모닝', k: '좋은 아침이에요', pr: ['good afternoon', 'good evening'] },
  { w: 'good night', p: '굿나잇', k: '잘 자요', pr: ['sweet dreams', 'sleep well'] },
  { w: 'nice to meet you', p: '나이스 투 밋 유', k: '만나서 반가워요', pr: ['glad to meet you'] },
  { w: 'how are you', p: '하우 아 유', k: '잘 지내요?', pr: ['how is it going'] },
  { w: 'see you later', p: '시 유 레이터', k: '나중에 봐요', pr: ['bye', 'see you'] },
  { w: 'excuse me', p: '익스큐즈 미', k: '실례합니다', pr: ['pardon', 'sorry'] },
  { w: 'congratulations', p: '컨그래츄레이션즈', k: '축하해요', pr: ['celebrate', 'cheer'] },
  { w: 'happy birthday', p: '해피 벌스데이', k: '생일 축하해요', pr: ['cake', 'party'] },
  { w: 'bless you', p: '블레스 유', k: '(재채기 후) 건강하세요', pr: ['sneeze', 'health'] },
  { w: 'of course', p: '오브 코스', k: '물론이죠', pr: ['sure', 'yes'] },
  { w: 'you are welcome', p: '유 아 웰컴', k: '천만에요', pr: ['thank you', 'please'] },
  { w: 'I am sorry', p: '아이 엠 쏘리', k: '죄송해요', pr: ['forgive', 'pardon'] },
  { w: 'have a good day', p: '해브 어 굿 데이', k: '좋은 하루 보내요', pr: ['morning', 'bye'] },
  { w: 'take care', p: '테이크 케어', k: '잘 지내요', pr: ['goodbye', 'safe'] },
  { w: 'come in', p: '컴 인', k: '들어오세요', pr: ['enter', 'door'] },
  { w: 'no problem', p: '노 프라블럼', k: '괜찮아요', pr: ['okay', 'sure'] },
];

const G34_COLORS: W[] = [
  { w: 'red', p: '레드', k: '빨간색', pr: ['pink', 'crimson'] },
  { w: 'blue', p: '블루', k: '파란색', pr: ['navy', 'sky blue'] },
  { w: 'yellow', p: '옐로', k: '노란색', pr: ['gold', 'lemon'] },
  { w: 'green', p: '그린', k: '초록색', pr: ['lime', 'emerald'] },
  { w: 'orange', p: '오렌지', k: '주황색', pr: ['peach', 'tangerine'] },
  { w: 'purple', p: '퍼플', k: '보라색', pr: ['violet', 'lavender'] },
  { w: 'white', p: '화이트', k: '하얀색', pr: ['ivory', 'cream'] },
  { w: 'black', p: '블랙', k: '검은색', pr: ['dark', 'midnight'] },
  { w: 'pink', p: '핑크', k: '분홍색', pr: ['rose', 'magenta'] },
  { w: 'brown', p: '브라운', k: '갈색', pr: ['tan', 'chocolate'] },
  { w: 'gray', p: '그레이', k: '회색', pr: ['silver', 'ash'] },
  { w: 'gold', p: '골드', k: '금색', pr: ['golden', 'amber'] },
  { w: 'silver', p: '실버', k: '은색', pr: ['gray', 'shiny'] },
  { w: 'navy', p: '네이비', k: '남색', pr: ['blue', 'dark'] },
  { w: 'beige', p: '베이지', k: '베이지색', pr: ['cream', 'light'] },
  { w: 'sky blue', p: '스카이 블루', k: '하늘색', pr: ['blue', 'light'] },
  { w: 'light green', p: '라이트 그린', k: '연두색', pr: ['green', 'bright'] },
  { w: 'dark blue', p: '다크 블루', k: '진한 파란색', pr: ['navy', 'blue'] },
  { w: 'ivory', p: '아이보리', k: '아이보리색', pr: ['white', 'cream'] },
  { w: 'peach', p: '피치', k: '살구색', pr: ['pink', 'orange'] },
  { w: 'maroon', p: '머룬', k: '밤색', pr: ['brown', 'red'] },
];

const G34_NUMBERS: W[] = [
  { w: 'one', p: '원', k: '하나', pr: ['first', 'single'] },
  { w: 'two', p: '투', k: '둘', pr: ['second', 'pair'] },
  { w: 'three', p: '쓰리', k: '셋', pr: ['third', 'triple'] },
  { w: 'four', p: '포', k: '넷', pr: ['fourth', 'quarter'] },
  { w: 'five', p: '파이브', k: '다섯', pr: ['fifth'] },
  { w: 'six', p: '식스', k: '여섯', pr: ['sixth'] },
  { w: 'seven', p: '세븐', k: '일곱', pr: ['seventh'] },
  { w: 'eight', p: '에잇', k: '여덟', pr: ['eighth'] },
  { w: 'nine', p: '나인', k: '아홉', pr: ['ninth'] },
  { w: 'ten', p: '텐', k: '열', pr: ['tenth', 'decade'] },
  { w: 'eleven', p: '일레븐', k: '열하나', pr: ['twelfth'] },
  { w: 'twelve', p: '트웰브', k: '열둘', pr: ['dozen'] },
  { w: 'twenty', p: '트웬티', k: '스물', pr: ['score'] },
  { w: 'hundred', p: '헌드레드', k: '백', pr: ['century', 'percent'] },
  { w: 'thirteen', p: '써틴', k: '열셋', pr: ['fourteen', 'teen'] },
  { w: 'fourteen', p: '포틴', k: '열넷', pr: ['fifteen', 'teen'] },
  { w: 'fifteen', p: '피프틴', k: '열다섯', pr: ['sixteen', 'teen'] },
  { w: 'sixteen', p: '식스틴', k: '열여섯', pr: ['seventeen', 'teen'] },
  { w: 'seventeen', p: '세븐틴', k: '열일곱', pr: ['eighteen', 'teen'] },
  { w: 'eighteen', p: '에이틴', k: '열여덟', pr: ['nineteen', 'teen'] },
  { w: 'nineteen', p: '나인틴', k: '열아홉', pr: ['twenty', 'teen'] },
  { w: 'thirty', p: '써티', k: '서른', pr: ['forty', 'number'] },
  { w: 'forty', p: '포티', k: '마흔', pr: ['fifty', 'number'] },
  { w: 'fifty', p: '피프티', k: '쉰', pr: ['sixty', 'half'] },
  { w: 'zero', p: '지로', k: '영', pr: ['nothing', 'none'] },
  { w: 'first', p: '퍼스트', k: '첫 번째', pr: ['second', 'one'] },
];

const G34_ANIMALS: W[] = [
  { w: 'dog', p: '도그', k: '개', pr: ['puppy', 'bark'] },
  { w: 'cat', p: '캣', k: '고양이', pr: ['kitten', 'meow'] },
  { w: 'bird', p: '버드', k: '새', pr: ['sparrow', 'fly'] },
  { w: 'fish', p: '피시', k: '물고기', pr: ['goldfish', 'swim'] },
  { w: 'rabbit', p: '래빗', k: '토끼', pr: ['bunny', 'hop'] },
  { w: 'bear', p: '베어', k: '곰', pr: ['polar bear', 'honey'] },
  { w: 'lion', p: '라이언', k: '사자', pr: ['tiger', 'king'] },
  { w: 'elephant', p: '엘리펀트', k: '코끼리', pr: ['trunk', 'big'] },
  { w: 'monkey', p: '멍키', k: '원숭이', pr: ['banana', 'climb'] },
  { w: 'tiger', p: '타이거', k: '호랑이', pr: ['stripes', 'jungle'] },
  { w: 'cow', p: '카우', k: '소', pr: ['milk', 'farm'] },
  { w: 'pig', p: '피그', k: '돼지', pr: ['farm', 'oink'] },
  { w: 'horse', p: '호스', k: '말', pr: ['pony', 'ride'] },
  { w: 'sheep', p: '쉽', k: '양', pr: ['lamb', 'wool'] },
  { w: 'duck', p: '덕', k: '오리', pr: ['quack', 'pond'] },
  { w: 'chicken', p: '치킨', k: '닭', pr: ['rooster', 'egg'] },
  { w: 'frog', p: '프로그', k: '개구리', pr: ['toad', 'jump'] },
  { w: 'snake', p: '스네이크', k: '뱀', pr: ['slither', 'long'] },
  { w: 'turtle', p: '터틀', k: '거북이', pr: ['shell', 'slow'] },
  { w: 'butterfly', p: '버터플라이', k: '나비', pr: ['caterpillar', 'wings'] },
  { w: 'penguin', p: '펭귄', k: '펭귄', pr: ['ice', 'waddle'] },
  { w: 'whale', p: '웨일', k: '고래', pr: ['ocean', 'big'] },
  { w: 'dolphin', p: '돌핀', k: '돌고래', pr: ['ocean', 'smart'] },
  { w: 'ant', p: '앤트', k: '개미', pr: ['small', 'colony'] },
  { w: 'bee', p: '비', k: '벌', pr: ['honey', 'sting'] },
  { w: 'spider', p: '스파이더', k: '거미', pr: ['web', 'legs'] },
  { w: 'parrot', p: '패럿', k: '앵무새', pr: ['talk', 'colorful'] },
  { w: 'owl', p: '아울', k: '부엉이', pr: ['night', 'wise'] },
  { w: 'deer', p: '디어', k: '사슴', pr: ['antler', 'forest'] },
  { w: 'fox', p: '폭스', k: '여우', pr: ['clever', 'tail'] },
  { w: 'giraffe', p: '지래프', k: '기린', pr: ['tall', 'neck'] },
  { w: 'zebra', p: '지브라', k: '얼룩말', pr: ['stripes', 'horse'] },
  { w: 'crocodile', p: '크로커다일', k: '악어', pr: ['river', 'teeth'] },
  { w: 'hamster', p: '햄스터', k: '햄스터', pr: ['pet', 'small'] },
  { w: 'goldfish', p: '골드피시', k: '금붕어', pr: ['bowl', 'pet'] },
  { w: 'eagle', p: '이글', k: '독수리', pr: ['fly', 'sky'] },
  { w: 'hippo', p: '히포', k: '하마', pr: ['river', 'big'] },
  { w: 'koala', p: '코알라', k: '코알라', pr: ['tree', 'sleep'] },
  { w: 'panda', p: '판다', k: '판다', pr: ['bamboo', 'bear'] },
  { w: 'squirrel', p: '스쿼럴', k: '다람쥐', pr: ['nut', 'tree'] },
];

const G34_FAMILY: W[] = [
  { w: 'mother', p: '마더', k: '엄마', pr: ['mom', 'mommy'] },
  { w: 'father', p: '파더', k: '아빠', pr: ['dad', 'daddy'] },
  { w: 'sister', p: '시스터', k: '자매', pr: ['sibling', 'girl'] },
  { w: 'brother', p: '브라더', k: '형제', pr: ['sibling', 'boy'] },
  { w: 'grandmother', p: '그랜드마더', k: '할머니', pr: ['grandma', 'granny'] },
  { w: 'grandfather', p: '그랜드파더', k: '할아버지', pr: ['grandpa'] },
  { w: 'baby', p: '베이비', k: '아기', pr: ['infant', 'toddler'] },
  { w: 'family', p: '패밀리', k: '가족', pr: ['parents', 'relatives'] },
  { w: 'friend', p: '프렌드', k: '친구', pr: ['buddy', 'pal'] },
  { w: 'teacher', p: '티처', k: '선생님', pr: ['school', 'class'] },
  { w: 'student', p: '스튜던트', k: '학생', pr: ['pupil', 'learner'] },
  { w: 'uncle', p: '엉클', k: '삼촌', pr: ['aunt', 'relative'] },
  { w: 'aunt', p: '앤트', k: '이모', pr: ['uncle', 'relative'] },
  { w: 'cousin', p: '커즌', k: '사촌', pr: ['relative', 'family'] },
  { w: 'neighbor', p: '네이버', k: '이웃', pr: ['next door', 'friend'] },
  { w: 'classmate', p: '클래스메이트', k: '반 친구', pr: ['school', 'friend'] },
  { w: 'son', p: '선', k: '아들', pr: ['daughter', 'child'] },
  { w: 'daughter', p: '도터', k: '딸', pr: ['son', 'child'] },
  { w: 'parents', p: '페어런츠', k: '부모님', pr: ['mother', 'father'] },
  { w: 'twin', p: '트윈', k: '쌍둥이', pr: ['sibling', 'same'] },
  { w: 'nephew', p: '네퓨', k: '조카(남)', pr: ['niece', 'uncle'] },
  { w: 'niece', p: '니스', k: '조카(여)', pr: ['nephew', 'aunt'] },
  { w: 'pet', p: '펫', k: '반려동물', pr: ['dog', 'cat'] },
  { w: 'husband', p: '허즈밴드', k: '남편', pr: ['wife', 'marry'] },
  { w: 'wife', p: '와이프', k: '아내', pr: ['husband', 'marry'] },
  { w: 'child', p: '차일드', k: '아이', pr: ['kid', 'young'] },
];

const G34_FOOD: W[] = [
  { w: 'apple', p: '애플', k: '사과', pr: ['banana', 'orange'] },
  { w: 'banana', p: '바나나', k: '바나나', pr: ['apple', 'mango'] },
  { w: 'bread', p: '브레드', k: '빵', pr: ['toast', 'sandwich'] },
  { w: 'milk', p: '밀크', k: '우유', pr: ['juice', 'water'] },
  { w: 'rice', p: '라이스', k: '밥', pr: ['noodle', 'soup'] },
  { w: 'egg', p: '에그', k: '달걀', pr: ['chicken', 'breakfast'] },
  { w: 'water', p: '워터', k: '물', pr: ['juice', 'milk'] },
  { w: 'cake', p: '케이크', k: '케이크', pr: ['cookie', 'pie'] },
  { w: 'pizza', p: '피자', k: '피자', pr: ['pasta', 'cheese'] },
  { w: 'orange', p: '오렌지', k: '오렌지', pr: ['lemon', 'grape'] },
  { w: 'grape', p: '그레이프', k: '포도', pr: ['cherry', 'peach'] },
  { w: 'cheese', p: '치즈', k: '치즈', pr: ['butter', 'cream'] },
  { w: 'soup', p: '수프', k: '수프', pr: ['stew', 'broth'] },
  { w: 'candy', p: '캔디', k: '사탕', pr: ['chocolate', 'cookie'] },
  { w: 'ice cream', p: '아이스크림', k: '아이스크림', pr: ['cake', 'candy'] },
  { w: 'strawberry', p: '스트로베리', k: '딸기', pr: ['blueberry', 'raspberry'] },
  { w: 'cookie', p: '쿠키', k: '쿠키', pr: ['biscuit', 'cracker'] },
  { w: 'sandwich', p: '샌드위치', k: '샌드위치', pr: ['hamburger', 'hotdog'] },
  { w: 'salad', p: '샐러드', k: '샐러드', pr: ['vegetable', 'lettuce'] },
  { w: 'chicken', p: '치킨', k: '치킨', pr: ['beef', 'pork'] },
  { w: 'tomato', p: '토마토', k: '토마토', pr: ['ketchup', 'sauce'] },
  { w: 'potato', p: '포테이토', k: '감자', pr: ['fries', 'chip'] },
  { w: 'carrot', p: '캐럿', k: '당근', pr: ['vegetable', 'orange'] },
  { w: 'corn', p: '콘', k: '옥수수', pr: ['popcorn', 'farm'] },
  { w: 'melon', p: '멜론', k: '멜론', pr: ['watermelon', 'fruit'] },
  { w: 'peach', p: '피치', k: '복숭아', pr: ['plum', 'fruit'] },
  { w: 'pear', p: '페어', k: '배', pr: ['apple', 'fruit'] },
  { w: 'lemon', p: '레몬', k: '레몬', pr: ['lime', 'sour'] },
  { w: 'mango', p: '망고', k: '망고', pr: ['tropical', 'sweet'] },
  { w: 'pineapple', p: '파인애플', k: '파인애플', pr: ['tropical', 'sweet'] },
  { w: 'hamburger', p: '햄버거', k: '햄버거', pr: ['fries', 'bun'] },
  { w: 'noodle', p: '누들', k: '국수', pr: ['soup', 'bowl'] },
  { w: 'butter', p: '버터', k: '버터', pr: ['bread', 'spread'] },
  { w: 'jam', p: '잼', k: '잼', pr: ['bread', 'sweet'] },
  { w: 'cereal', p: '시리얼', k: '시리얼', pr: ['milk', 'breakfast'] },
  { w: 'sausage', p: '소시지', k: '소시지', pr: ['hotdog', 'meat'] },
  { w: 'pancake', p: '팬케이크', k: '팬케이크', pr: ['syrup', 'breakfast'] },
  { w: 'donut', p: '도넛', k: '도넛', pr: ['sweet', 'round'] },
  { w: 'popcorn', p: '팝콘', k: '팝콘', pr: ['movie', 'corn'] },
  { w: 'juice', p: '주스', k: '주스', pr: ['orange', 'drink'] },
  { w: 'onion', p: '어니언', k: '양파', pr: ['garlic', 'vegetable'] },
  { w: 'mushroom', p: '머쉬룸', k: '버섯', pr: ['vegetable', 'forest'] },
];

const G34_BODY: W[] = [
  { w: 'head', p: '헤드', k: '머리', pr: ['face', 'hair'] },
  { w: 'eye', p: '아이', k: '눈', pr: ['nose', 'see'] },
  { w: 'nose', p: '노즈', k: '코', pr: ['mouth', 'smell'] },
  { w: 'mouth', p: '마우스', k: '입', pr: ['lip', 'tongue'] },
  { w: 'ear', p: '이어', k: '귀', pr: ['hear', 'sound'] },
  { w: 'hand', p: '핸드', k: '손', pr: ['finger', 'arm'] },
  { w: 'foot', p: '풋', k: '발', pr: ['toe', 'leg'] },
  { w: 'arm', p: '암', k: '팔', pr: ['hand', 'elbow'] },
  { w: 'leg', p: '레그', k: '다리', pr: ['knee', 'foot'] },
  { w: 'hair', p: '헤어', k: '머리카락', pr: ['head', 'long'] },
  { w: 'finger', p: '핑거', k: '손가락', pr: ['thumb', 'hand'] },
  { w: 'shoulder', p: '숄더', k: '어깨', pr: ['arm', 'neck'] },
  { w: 'knee', p: '니', k: '무릎', pr: ['leg', 'bend'] },
  { w: 'tooth', p: '투스', k: '이', pr: ['teeth', 'brush'] },
  { w: 'face', p: '페이스', k: '얼굴', pr: ['eye', 'nose'] },
  { w: 'neck', p: '넥', k: '목', pr: ['head', 'shoulder'] },
  { w: 'back', p: '백', k: '등', pr: ['spine', 'behind'] },
  { w: 'stomach', p: '스터먹', k: '배', pr: ['tummy', 'belly'] },
  { w: 'tongue', p: '텅', k: '혀', pr: ['taste', 'mouth'] },
  { w: 'thumb', p: '썸', k: '엄지', pr: ['finger', 'hand'] },
  { w: 'elbow', p: '엘보', k: '팔꿈치', pr: ['arm', 'bend'] },
  { w: 'wrist', p: '리스트', k: '손목', pr: ['hand', 'watch'] },
  { w: 'ankle', p: '앵클', k: '발목', pr: ['foot', 'leg'] },
  { w: 'toe', p: '토', k: '발가락', pr: ['foot', 'finger'] },
  { w: 'lip', p: '립', k: '입술', pr: ['mouth', 'kiss'] },
  { w: 'chin', p: '친', k: '턱', pr: ['face', 'jaw'] },
  { w: 'cheek', p: '칙', k: '볼', pr: ['face', 'smile'] },
  { w: 'forehead', p: '포헤드', k: '이마', pr: ['head', 'face'] },
  { w: 'eyebrow', p: '아이브라우', k: '눈썹', pr: ['eye', 'face'] },
  { w: 'chest', p: '체스트', k: '가슴', pr: ['heart', 'body'] },
];

const G34_DAILY: W[] = [
  { w: 'eat', p: '잇', k: '먹다', pr: ['drink', 'cook'] },
  { w: 'drink', p: '드링크', k: '마시다', pr: ['eat', 'water'] },
  { w: 'sleep', p: '슬립', k: '자다', pr: ['bed', 'dream'] },
  { w: 'run', p: '런', k: '달리다', pr: ['walk', 'jump'] },
  { w: 'walk', p: '워크', k: '걷다', pr: ['run', 'step'] },
  { w: 'read', p: '리드', k: '읽다', pr: ['book', 'write'] },
  { w: 'write', p: '라이트', k: '쓰다', pr: ['read', 'pencil'] },
  { w: 'play', p: '플레이', k: '놀다', pr: ['fun', 'game'] },
  { w: 'sing', p: '싱', k: '노래하다', pr: ['song', 'music'] },
  { w: 'dance', p: '댄스', k: '춤추다', pr: ['sing', 'music'] },
  { w: 'swim', p: '스윔', k: '수영하다', pr: ['pool', 'water'] },
  { w: 'jump', p: '점프', k: '점프하다', pr: ['hop', 'leap'] },
  { w: 'draw', p: '드로', k: '그리다', pr: ['paint', 'color'] },
  { w: 'cook', p: '쿡', k: '요리하다', pr: ['bake', 'kitchen'] },
  { w: 'wash', p: '워시', k: '씻다', pr: ['clean', 'soap'] },
  { w: 'study', p: '스터디', k: '공부하다', pr: ['learn', 'book'] },
  { w: 'listen', p: '리슨', k: '듣다', pr: ['hear', 'music'] },
  { w: 'look', p: '룩', k: '보다', pr: ['see', 'watch'] },
  { w: 'sit', p: '싯', k: '앉다', pr: ['stand', 'chair'] },
  { w: 'stand', p: '스탠드', k: '서다', pr: ['sit', 'up'] },
  { w: 'open', p: '오픈', k: '열다', pr: ['close', 'door'] },
  { w: 'close', p: '클로즈', k: '닫다', pr: ['open', 'shut'] },
  { w: 'give', p: '기브', k: '주다', pr: ['take', 'share'] },
  { w: 'take', p: '테이크', k: '가져가다', pr: ['give', 'bring'] },
  { w: 'help', p: '헬프', k: '돕다', pr: ['assist', 'support'] },
  { w: 'make', p: '메이크', k: '만들다', pr: ['build', 'create'] },
  { w: 'buy', p: '바이', k: '사다', pr: ['sell', 'shop'] },
  { w: 'fly', p: '플라이', k: '날다', pr: ['bird', 'sky'] },
  { w: 'cry', p: '크라이', k: '울다', pr: ['sad', 'tear'] },
  { w: 'laugh', p: '래프', k: '웃다', pr: ['smile', 'happy'] },
  { w: 'talk', p: '토크', k: '말하다', pr: ['speak', 'chat'] },
  { w: 'think', p: '싱크', k: '생각하다', pr: ['idea', 'mind'] },
  { w: 'carry', p: '캐리', k: '나르다', pr: ['hold', 'bring'] },
  { w: 'throw', p: '쓰로', k: '던지다', pr: ['catch', 'ball'] },
  { w: 'catch', p: '캐치', k: '잡다', pr: ['throw', 'ball'] },
  { w: 'push', p: '푸시', k: '밀다', pr: ['pull', 'press'] },
  { w: 'pull', p: '풀', k: '당기다', pr: ['push', 'tug'] },
  { w: 'climb', p: '클라임', k: '오르다', pr: ['up', 'mountain'] },
  { w: 'touch', p: '터치', k: '만지다', pr: ['feel', 'hand'] },
  { w: 'smile', p: '스마일', k: '미소짓다', pr: ['laugh', 'happy'] },
  { w: 'clap', p: '클랩', k: '박수치다', pr: ['hand', 'cheer'] },
];

const G34_SCHOOL: W[] = [
  { w: 'book', p: '북', k: '책', pr: ['notebook', 'read'] },
  { w: 'pencil', p: '펜슬', k: '연필', pr: ['pen', 'eraser'] },
  { w: 'eraser', p: '이레이저', k: '지우개', pr: ['pencil', 'rubber'] },
  { w: 'desk', p: '데스크', k: '책상', pr: ['chair', 'table'] },
  { w: 'chair', p: '체어', k: '의자', pr: ['desk', 'sit'] },
  { w: 'bag', p: '백', k: '가방', pr: ['backpack', 'school'] },
  { w: 'ruler', p: '룰러', k: '자', pr: ['measure', 'line'] },
  { w: 'clock', p: '클락', k: '시계', pr: ['time', 'watch'] },
  { w: 'door', p: '도어', k: '문', pr: ['window', 'open'] },
  { w: 'window', p: '윈도우', k: '창문', pr: ['door', 'glass'] },
  { w: 'notebook', p: '노트북', k: '공책', pr: ['book', 'write'] },
  { w: 'crayon', p: '크레용', k: '크레파스', pr: ['color', 'draw'] },
  { w: 'scissors', p: '시저스', k: '가위', pr: ['cut', 'paper'] },
  { w: 'glue', p: '글루', k: '풀', pr: ['stick', 'paste'] },
  { w: 'paper', p: '페이퍼', k: '종이', pr: ['write', 'draw'] },
  { w: 'blackboard', p: '블랙보드', k: '칠판', pr: ['chalk', 'write'] },
  { w: 'pen', p: '펜', k: '펜', pr: ['pencil', 'write'] },
  { w: 'marker', p: '마커', k: '마커펜', pr: ['color', 'draw'] },
  { w: 'tape', p: '테이프', k: '테이프', pr: ['stick', 'glue'] },
  { w: 'map', p: '맵', k: '지도', pr: ['country', 'world'] },
  { w: 'calendar', p: '캘린더', k: '달력', pr: ['date', 'month'] },
  { w: 'chalk', p: '초크', k: '분필', pr: ['board', 'write'] },
  { w: 'globe', p: '글로브', k: '지구본', pr: ['world', 'map'] },
  { w: 'backpack', p: '백팩', k: '배낭', pr: ['bag', 'school'] },
  { w: 'textbook', p: '텍스트북', k: '교과서', pr: ['study', 'class'] },
  { w: 'homework', p: '홈워크', k: '숙제', pr: ['study', 'school'] },
];

const G34_ADJECTIVES: W[] = [
  { w: 'big', p: '빅', k: '큰', pr: ['large', 'huge'] },
  { w: 'small', p: '스몰', k: '작은', pr: ['little', 'tiny'] },
  { w: 'happy', p: '해피', k: '행복한', pr: ['glad', 'joyful'] },
  { w: 'sad', p: '새드', k: '슬픈', pr: ['unhappy', 'blue'] },
  { w: 'hot', p: '핫', k: '뜨거운', pr: ['warm', 'cold'] },
  { w: 'cold', p: '콜드', k: '차가운', pr: ['cool', 'hot'] },
  { w: 'fast', p: '패스트', k: '빠른', pr: ['quick', 'slow'] },
  { w: 'slow', p: '슬로', k: '느린', pr: ['fast', 'quick'] },
  { w: 'good', p: '굿', k: '좋은', pr: ['great', 'nice'] },
  { w: 'bad', p: '배드', k: '나쁜', pr: ['poor', 'terrible'] },
  { w: 'long', p: '롱', k: '긴', pr: ['short', 'tall'] },
  { w: 'short', p: '숏', k: '짧은', pr: ['long', 'tall'] },
  { w: 'new', p: '뉴', k: '새로운', pr: ['old', 'fresh'] },
  { w: 'old', p: '올드', k: '오래된', pr: ['new', 'young'] },
  { w: 'pretty', p: '프리티', k: '예쁜', pr: ['beautiful', 'cute'] },
  { w: 'hungry', p: '헝그리', k: '배고픈', pr: ['thirsty', 'full'] },
  { w: 'tall', p: '톨', k: '키가 큰', pr: ['short', 'high'] },
  { w: 'clean', p: '클린', k: '깨끗한', pr: ['dirty', 'tidy'] },
  { w: 'dirty', p: '더티', k: '더러운', pr: ['clean', 'messy'] },
  { w: 'strong', p: '스트롱', k: '강한', pr: ['weak', 'powerful'] },
  { w: 'weak', p: '위크', k: '약한', pr: ['strong', 'feeble'] },
  { w: 'kind', p: '카인드', k: '친절한', pr: ['nice', 'gentle'] },
  { w: 'brave', p: '브레이브', k: '용감한', pr: ['bold', 'fearless'] },
  { w: 'smart', p: '스마트', k: '똑똑한', pr: ['clever', 'wise'] },
  { w: 'funny', p: '퍼니', k: '재미있는', pr: ['hilarious', 'silly'] },
  { w: 'quiet', p: '콰이엇', k: '조용한', pr: ['silent', 'calm'] },
  { w: 'loud', p: '라우드', k: '시끄러운', pr: ['noisy', 'quiet'] },
  { w: 'soft', p: '소프트', k: '부드러운', pr: ['hard', 'gentle'] },
  { w: 'hard', p: '하드', k: '딱딱한', pr: ['soft', 'tough'] },
  { w: 'round', p: '라운드', k: '둥근', pr: ['circle', 'ball'] },
  { w: 'young', p: '영', k: '어린', pr: ['old', 'child'] },
  { w: 'bright', p: '브라이트', k: '밝은', pr: ['dark', 'light'] },
  { w: 'dark', p: '다크', k: '어두운', pr: ['bright', 'light'] },
  { w: 'heavy', p: '헤비', k: '무거운', pr: ['light', 'weight'] },
  { w: 'light', p: '라이트', k: '가벼운', pr: ['heavy', 'feather'] },
  { w: 'thick', p: '씩', k: '두꺼운', pr: ['thin', 'wide'] },
  { w: 'thin', p: '씬', k: '얇은', pr: ['thick', 'slim'] },
  { w: 'deep', p: '딥', k: '깊은', pr: ['shallow', 'ocean'] },
  { w: 'wide', p: '와이드', k: '넓은', pr: ['narrow', 'broad'] },
  { w: 'sharp', p: '샤프', k: '날카로운', pr: ['dull', 'point'] },
];

const G34_CLOTHING: W[] = [
  { w: 'shirt', p: '셔츠', k: '셔츠', pr: ['pants', 'jacket'] },
  { w: 'pants', p: '팬츠', k: '바지', pr: ['shirt', 'shorts'] },
  { w: 'shoes', p: '슈즈', k: '신발', pr: ['boots', 'sneakers'] },
  { w: 'hat', p: '햇', k: '모자', pr: ['cap', 'head'] },
  { w: 'jacket', p: '재킷', k: '재킷', pr: ['coat', 'sweater'] },
  { w: 'dress', p: '드레스', k: '드레스', pr: ['skirt', 'blouse'] },
  { w: 'socks', p: '삭스', k: '양말', pr: ['shoes', 'feet'] },
  { w: 'gloves', p: '글러브즈', k: '장갑', pr: ['mittens', 'hands'] },
  { w: 'umbrella', p: '엄브렐라', k: '우산', pr: ['rain', 'wet'] },
  { w: 'scarf', p: '스카프', k: '목도리', pr: ['neck', 'warm'] },
  { w: 'boots', p: '부츠', k: '부츠', pr: ['shoes', 'rain'] },
  { w: 'sweater', p: '스웨터', k: '스웨터', pr: ['warm', 'winter'] },
  { w: 'coat', p: '코트', k: '코트', pr: ['jacket', 'warm'] },
  { w: 'skirt', p: '스커트', k: '치마', pr: ['dress', 'blouse'] },
  { w: 'shorts', p: '숏츠', k: '반바지', pr: ['pants', 'summer'] },
  { w: 'uniform', p: '유니폼', k: '교복', pr: ['school', 'wear'] },
  { w: 'cap', p: '캡', k: '모자', pr: ['hat', 'head'] },
  { w: 'pajamas', p: '파자마즈', k: '잠옷', pr: ['sleep', 'night'] },
  { w: 'sneakers', p: '스니커즈', k: '운동화', pr: ['shoes', 'run'] },
  { w: 'belt', p: '벨트', k: '벨트', pr: ['pants', 'waist'] },
  { w: 'raincoat', p: '레인코트', k: '비옷', pr: ['rain', 'wet'] },
  { w: 'vest', p: '베스트', k: '조끼', pr: ['jacket', 'shirt'] },
  { w: 'tie', p: '타이', k: '넥타이', pr: ['shirt', 'formal'] },
  { w: 'blouse', p: '블라우스', k: '블라우스', pr: ['shirt', 'dress'] },
  { w: 'sandals', p: '샌들즈', k: '샌들', pr: ['shoes', 'summer'] },
  { w: 'hoodie', p: '후디', k: '후드티', pr: ['sweater', 'warm'] },
];

const G34_TRANSPORT: W[] = [
  { w: 'bus', p: '버스', k: '버스', pr: ['car', 'taxi'] },
  { w: 'car', p: '카', k: '자동차', pr: ['bus', 'truck'] },
  { w: 'bicycle', p: '바이시클', k: '자전거', pr: ['bike', 'ride'] },
  { w: 'airplane', p: '에어플레인', k: '비행기', pr: ['fly', 'airport'] },
  { w: 'train', p: '트레인', k: '기차', pr: ['station', 'track'] },
  { w: 'ship', p: '쉽', k: '배', pr: ['boat', 'sail'] },
  { w: 'subway', p: '서브웨이', k: '지하철', pr: ['train', 'station'] },
  { w: 'taxi', p: '택시', k: '택시', pr: ['car', 'bus'] },
  { w: 'truck', p: '트럭', k: '트럭', pr: ['car', 'van'] },
  { w: 'helicopter', p: '헬리콥터', k: '헬리콥터', pr: ['fly', 'sky'] },
  { w: 'motorcycle', p: '모터사이클', k: '오토바이', pr: ['bike', 'ride'] },
  { w: 'ambulance', p: '앰뷸런스', k: '구급차', pr: ['hospital', 'emergency'] },
  { w: 'scooter', p: '스쿠터', k: '스쿠터', pr: ['ride', 'wheel'] },
  { w: 'boat', p: '보트', k: '보트', pr: ['ship', 'sail'] },
  { w: 'fire truck', p: '파이어 트럭', k: '소방차', pr: ['fire', 'rescue'] },
  { w: 'police car', p: '폴리스 카', k: '경찰차', pr: ['police', 'siren'] },
  { w: 'van', p: '밴', k: '밴', pr: ['truck', 'car'] },
  { w: 'rocket', p: '로켓', k: '로켓', pr: ['space', 'fly'] },
  { w: 'ferry', p: '페리', k: '여객선', pr: ['boat', 'ship'] },
  { w: 'tractor', p: '트랙터', k: '트랙터', pr: ['farm', 'field'] },
  { w: 'cable car', p: '케이블 카', k: '케이블카', pr: ['mountain', 'ride'] },
];

const G34_NATURE: W[] = [
  { w: 'tree', p: '트리', k: '나무', pr: ['leaf', 'forest'] },
  { w: 'flower', p: '플라워', k: '꽃', pr: ['rose', 'garden'] },
  { w: 'sun', p: '선', k: '태양', pr: ['moon', 'star'] },
  { w: 'moon', p: '문', k: '달', pr: ['sun', 'star'] },
  { w: 'star', p: '스타', k: '별', pr: ['sun', 'moon'] },
  { w: 'sky', p: '스카이', k: '하늘', pr: ['cloud', 'sun'] },
  { w: 'rain', p: '레인', k: '비', pr: ['umbrella', 'cloud'] },
  { w: 'snow', p: '스노', k: '눈', pr: ['winter', 'cold'] },
  { w: 'river', p: '리버', k: '강', pr: ['lake', 'ocean'] },
  { w: 'mountain', p: '마운틴', k: '산', pr: ['hill', 'climb'] },
  { w: 'garden', p: '가든', k: '정원', pr: ['flower', 'plant'] },
  { w: 'sea', p: '시', k: '바다', pr: ['ocean', 'wave'] },
  { w: 'cloud', p: '클라우드', k: '구름', pr: ['sky', 'rain'] },
  { w: 'wind', p: '윈드', k: '바람', pr: ['blow', 'breeze'] },
  { w: 'lake', p: '레이크', k: '호수', pr: ['river', 'pond'] },
  { w: 'forest', p: '포레스트', k: '숲', pr: ['tree', 'nature'] },
  { w: 'grass', p: '그래스', k: '풀', pr: ['green', 'lawn'] },
  { w: 'sand', p: '샌드', k: '모래', pr: ['beach', 'desert'] },
  { w: 'rock', p: '록', k: '바위', pr: ['stone', 'hard'] },
  { w: 'island', p: '아일랜드', k: '섬', pr: ['ocean', 'beach'] },
  { w: 'rainbow', p: '레인보', k: '무지개', pr: ['rain', 'color'] },
  { w: 'waterfall', p: '워터폴', k: '폭포', pr: ['river', 'water'] },
  { w: 'leaf', p: '리프', k: '잎', pr: ['tree', 'green'] },
  { w: 'rose', p: '로즈', k: '장미', pr: ['flower', 'red'] },
  { w: 'pond', p: '폰드', k: '연못', pr: ['lake', 'frog'] },
  { w: 'cave', p: '케이브', k: '동굴', pr: ['dark', 'rock'] },
  { w: 'desert', p: '데저트', k: '사막', pr: ['sand', 'hot'] },
  { w: 'hill', p: '힐', k: '언덕', pr: ['mountain', 'climb'] },
  { w: 'volcano', p: '볼케이노', k: '화산', pr: ['fire', 'mountain'] },
  { w: 'field', p: '필드', k: '들판', pr: ['grass', 'farm'] },
];

const G34_POSITIONS: W[] = [
  { w: 'up', p: '업', k: '위로', pr: ['down', 'high'] },
  { w: 'down', p: '다운', k: '아래로', pr: ['up', 'low'] },
  { w: 'in', p: '인', k: '안에', pr: ['out', 'inside'] },
  { w: 'out', p: '아웃', k: '밖에', pr: ['in', 'outside'] },
  { w: 'here', p: '히어', k: '여기', pr: ['there', 'this'] },
  { w: 'there', p: '데어', k: '저기', pr: ['here', 'that'] },
  { w: 'left', p: '레프트', k: '왼쪽', pr: ['right', 'direction'] },
  { w: 'right', p: '라이트', k: '오른쪽', pr: ['left', 'direction'] },
  { w: 'next to', p: '넥스트 투', k: '옆에', pr: ['beside', 'near'] },
  { w: 'behind', p: '비하인드', k: '뒤에', pr: ['front', 'back'] },
  { w: 'between', p: '비트윈', k: '사이에', pr: ['middle', 'among'] },
  { w: 'under', p: '언더', k: '아래에', pr: ['below', 'above'] },
  { w: 'above', p: '어보브', k: '위에', pr: ['over', 'below'] },
  { w: 'on', p: '온', k: '위에', pr: ['off', 'upon'] },
  { w: 'front', p: '프런트', k: '앞에', pr: ['back', 'behind'] },
  { w: 'near', p: '니어', k: '가까이', pr: ['far', 'close'] },
  { w: 'far', p: '파', k: '멀리', pr: ['near', 'distant'] },
  { w: 'inside', p: '인사이드', k: '안쪽', pr: ['outside', 'in'] },
  { w: 'outside', p: '아웃사이드', k: '바깥쪽', pr: ['inside', 'out'] },
  { w: 'beside', p: '비사이드', k: '옆에', pr: ['next to', 'near'] },
  { w: 'around', p: '어라운드', k: '주위에', pr: ['circle', 'near'] },
  { w: 'across', p: '어크로스', k: '건너편에', pr: ['over', 'cross'] },
  { w: 'toward', p: '토워드', k: '~쪽으로', pr: ['away', 'direction'] },
  { w: 'center', p: '센터', k: '가운데', pr: ['middle', 'core'] },
  { w: 'corner', p: '코너', k: '모퉁이', pr: ['edge', 'side'] },
];

const G34_HOUSE: W[] = [
  { w: 'house', p: '하우스', k: '집', pr: ['home', 'building'] },
  { w: 'room', p: '룸', k: '방', pr: ['bedroom', 'space'] },
  { w: 'kitchen', p: '키친', k: '부엌', pr: ['cook', 'food'] },
  { w: 'bathroom', p: '배스룸', k: '화장실', pr: ['shower', 'wash'] },
  { w: 'bedroom', p: '베드룸', k: '침실', pr: ['bed', 'sleep'] },
  { w: 'living room', p: '리빙 룸', k: '거실', pr: ['sofa', 'TV'] },
  { w: 'table', p: '테이블', k: '탁자', pr: ['chair', 'desk'] },
  { w: 'bed', p: '베드', k: '침대', pr: ['sleep', 'pillow'] },
  { w: 'sofa', p: '소파', k: '소파', pr: ['sit', 'living room'] },
  { w: 'TV', p: '티비', k: '텔레비전', pr: ['watch', 'screen'] },
  { w: 'lamp', p: '램프', k: '램프', pr: ['light', 'bright'] },
  { w: 'mirror', p: '미러', k: '거울', pr: ['reflect', 'face'] },
  { w: 'cup', p: '컵', k: '컵', pr: ['glass', 'drink'] },
  { w: 'plate', p: '플레이트', k: '접시', pr: ['dish', 'food'] },
  { w: 'spoon', p: '스푼', k: '숟가락', pr: ['fork', 'knife'] },
  { w: 'fork', p: '포크', k: '포크', pr: ['spoon', 'knife'] },
  { w: 'knife', p: '나이프', k: '칼', pr: ['fork', 'cut'] },
  { w: 'refrigerator', p: '리프리저레이터', k: '냉장고', pr: ['cold', 'food'] },
  { w: 'oven', p: '오븐', k: '오븐', pr: ['bake', 'cook'] },
  { w: 'blanket', p: '블랭킷', k: '이불', pr: ['bed', 'warm'] },
  { w: 'pillow', p: '필로', k: '베개', pr: ['bed', 'sleep'] },
  { w: 'towel', p: '타월', k: '수건', pr: ['bath', 'dry'] },
  { w: 'closet', p: '클로짓', k: '옷장', pr: ['clothes', 'room'] },
  { w: 'stairs', p: '스테어즈', k: '계단', pr: ['up', 'floor'] },
  { w: 'roof', p: '루프', k: '지붕', pr: ['house', 'top'] },
  { w: 'garden', p: '가든', k: '정원', pr: ['flower', 'yard'] },
];

// ============================================================
// Grade 5-6 Word Banks (additional)
// ============================================================

const G56_SUBJECTS: W[] = [
  { w: 'math', p: '매쓰', k: '수학', pr: ['science', 'number'] },
  { w: 'science', p: '사이언스', k: '과학', pr: ['experiment', 'lab'] },
  { w: 'English', p: '잉글리시', k: '영어', pr: ['Korean', 'language'] },
  { w: 'music', p: '뮤직', k: '음악', pr: ['art', 'sing'] },
  { w: 'art', p: '아트', k: '미술', pr: ['draw', 'paint'] },
  { w: 'history', p: '히스토리', k: '역사', pr: ['past', 'event'] },
  { w: 'Korean', p: '코리안', k: '국어', pr: ['English', 'language'] },
  { w: 'PE', p: '피이', k: '체육', pr: ['exercise', 'sport'] },
  { w: 'computer', p: '컴퓨터', k: '컴퓨터', pr: ['keyboard', 'mouse'] },
  { w: 'social studies', p: '소셜 스터디즈', k: '사회', pr: ['history', 'geography'] },
  { w: 'geography', p: '지오그래피', k: '지리', pr: ['map', 'country'] },
  { w: 'ethics', p: '에식스', k: '도덕', pr: ['moral', 'right'] },
  { w: 'biology', p: '바이올로지', k: '생물', pr: ['life', 'nature'] },
  { w: 'literature', p: '리터러처', k: '문학', pr: ['novel', 'poem'] },
  { w: 'economics', p: '이코노믹스', k: '경제', pr: ['money', 'trade'] },
  { w: 'philosophy', p: '필로소피', k: '철학', pr: ['think', 'wisdom'] },
  { w: 'astronomy', p: '어스트로노미', k: '천문학', pr: ['star', 'planet'] },
  { w: 'chemistry', p: '케미스트리', k: '화학', pr: ['lab', 'element'] },
  { w: 'drama', p: '드라마', k: '연극', pr: ['stage', 'act'] },
  { w: 'technology', p: '테크놀로지', k: '기술', pr: ['computer', 'science'] },
  { w: 'calligraphy', p: '캘리그래피', k: '서예', pr: ['brush', 'write'] },
];

const G56_WEATHER: W[] = [
  { w: 'sunny', p: '서니', k: '화창한', pr: ['bright', 'clear'] },
  { w: 'rainy', p: '레이니', k: '비 오는', pr: ['wet', 'umbrella'] },
  { w: 'cloudy', p: '클라우디', k: '흐린', pr: ['gray', 'overcast'] },
  { w: 'snowy', p: '스노이', k: '눈 오는', pr: ['cold', 'white'] },
  { w: 'windy', p: '윈디', k: '바람 부는', pr: ['breeze', 'storm'] },
  { w: 'warm', p: '웜', k: '따뜻한', pr: ['hot', 'spring'] },
  { w: 'cool', p: '쿨', k: '시원한', pr: ['cold', 'autumn'] },
  { w: 'stormy', p: '스토미', k: '폭풍인', pr: ['thunder', 'lightning'] },
  { w: 'foggy', p: '포기', k: '안개 낀', pr: ['misty', 'hazy'] },
  { w: 'humid', p: '휴미드', k: '습한', pr: ['sticky', 'moist'] },
  { w: 'dry', p: '드라이', k: '건조한', pr: ['wet', 'arid'] },
  { w: 'freezing', p: '프리징', k: '얼어붙는', pr: ['cold', 'ice'] },
  { w: 'chilly', p: '칠리', k: '쌀쌀한', pr: ['cold', 'cool'] },
  { w: 'boiling', p: '보일링', k: '끓는 듯 더운', pr: ['hot', 'summer'] },
  { w: 'breezy', p: '브리지', k: '산들바람 부는', pr: ['wind', 'gentle'] },
  { w: 'overcast', p: '오버캐스트', k: '구름 낀', pr: ['cloudy', 'gray'] },
  { w: 'icy', p: '아이시', k: '얼음처럼 찬', pr: ['cold', 'slippery'] },
  { w: 'clear', p: '클리어', k: '맑은', pr: ['sunny', 'bright'] },
  { w: 'thunder', p: '썬더', k: '천둥', pr: ['lightning', 'storm'] },
  { w: 'lightning', p: '라이트닝', k: '번개', pr: ['thunder', 'flash'] },
  { w: 'drizzle', p: '드리즐', k: '이슬비', pr: ['rain', 'light'] },
];

const G56_HOBBIES: W[] = [
  { w: 'soccer', p: '사커', k: '축구', pr: ['basketball', 'team'] },
  { w: 'basketball', p: '바스켓볼', k: '농구', pr: ['soccer', 'court'] },
  { w: 'swimming', p: '스위밍', k: '수영', pr: ['pool', 'diving'] },
  { w: 'reading', p: '리딩', k: '독서', pr: ['book', 'library'] },
  { w: 'cooking', p: '쿠킹', k: '요리', pr: ['baking', 'recipe'] },
  { w: 'painting', p: '페인팅', k: '그림 그리기', pr: ['drawing', 'brush'] },
  { w: 'camping', p: '캠핑', k: '캠핑', pr: ['tent', 'hiking'] },
  { w: 'fishing', p: '피싱', k: '낚시', pr: ['rod', 'lake'] },
  { w: 'cycling', p: '사이클링', k: '자전거 타기', pr: ['bicycle', 'ride'] },
  { w: 'dancing', p: '댄싱', k: '춤', pr: ['ballet', 'rhythm'] },
  { w: 'singing', p: '싱잉', k: '노래', pr: ['song', 'voice'] },
  { w: 'hiking', p: '하이킹', k: '등산', pr: ['mountain', 'trail'] },
  { w: 'skating', p: '스케이팅', k: '스케이트', pr: ['ice', 'rink'] },
  { w: 'gardening', p: '가드닝', k: '정원 가꾸기', pr: ['plant', 'flower'] },
  { w: 'baseball', p: '베이스볼', k: '야구', pr: ['bat', 'ball'] },
  { w: 'tennis', p: '테니스', k: '테니스', pr: ['racket', 'court'] },
  { w: 'badminton', p: '배드민턴', k: '배드민턴', pr: ['shuttle', 'racket'] },
  { w: 'photography', p: '포토그래피', k: '사진', pr: ['camera', 'picture'] },
  { w: 'yoga', p: '요가', k: '요가', pr: ['stretch', 'relax'] },
  { w: 'chess', p: '체스', k: '체스', pr: ['board', 'strategy'] },
  { w: 'volleyball', p: '발리볼', k: '배구', pr: ['net', 'team'] },
  { w: 'table tennis', p: '테이블 테니스', k: '탁구', pr: ['paddle', 'ball'] },
  { w: 'taekwondo', p: '태권도', k: '태권도', pr: ['kick', 'martial arts'] },
  { w: 'surfing', p: '서핑', k: '서핑', pr: ['wave', 'ocean'] },
  { w: 'climbing', p: '클라이밍', k: '클라이밍', pr: ['rock', 'wall'] },
  { w: 'knitting', p: '니팅', k: '뜨개질', pr: ['yarn', 'needle'] },
  { w: 'origami', p: '오리가미', k: '종이접기', pr: ['paper', 'fold'] },
  { w: 'magic', p: '매직', k: '마술', pr: ['trick', 'show'] },
  { w: 'archery', p: '아처리', k: '양궁', pr: ['arrow', 'bow'] },
  { w: 'bowling', p: '볼링', k: '볼링', pr: ['pin', 'ball'] },
];

const G56_PLACES: W[] = [
  { w: 'school', p: '스쿨', k: '학교', pr: ['classroom', 'teacher'] },
  { w: 'hospital', p: '호스피탈', k: '병원', pr: ['doctor', 'nurse'] },
  { w: 'library', p: '라이브러리', k: '도서관', pr: ['book', 'read'] },
  { w: 'park', p: '파크', k: '공원', pr: ['playground', 'tree'] },
  { w: 'restaurant', p: '레스토랑', k: '식당', pr: ['menu', 'food'] },
  { w: 'museum', p: '뮤지엄', k: '박물관', pr: ['art', 'exhibit'] },
  { w: 'airport', p: '에어포트', k: '공항', pr: ['airplane', 'travel'] },
  { w: 'market', p: '마켓', k: '시장', pr: ['shop', 'buy'] },
  { w: 'station', p: '스테이션', k: '역', pr: ['train', 'bus'] },
  { w: 'post office', p: '포스트 오피스', k: '우체국', pr: ['letter', 'stamp'] },
  { w: 'bank', p: '뱅크', k: '은행', pr: ['money', 'save'] },
  { w: 'zoo', p: '주', k: '동물원', pr: ['animal', 'lion'] },
  { w: 'bookstore', p: '북스토어', k: '서점', pr: ['book', 'shop'] },
  { w: 'beach', p: '비치', k: '해변', pr: ['sand', 'ocean'] },
  { w: 'church', p: '처치', k: '교회', pr: ['temple', 'pray'] },
  { w: 'cinema', p: '시네마', k: '영화관', pr: ['movie', 'watch'] },
  { w: 'gym', p: '짐', k: '체육관', pr: ['exercise', 'sport'] },
  { w: 'bakery', p: '베이커리', k: '빵집', pr: ['bread', 'cake'] },
  { w: 'pharmacy', p: '파머시', k: '약국', pr: ['medicine', 'health'] },
  { w: 'stadium', p: '스테디엄', k: '경기장', pr: ['sport', 'game'] },
  { w: 'police station', p: '폴리스 스테이션', k: '경찰서', pr: ['police', 'officer'] },
  { w: 'fire station', p: '파이어 스테이션', k: '소방서', pr: ['firefighter', 'truck'] },
  { w: 'aquarium', p: '아쿠아리움', k: '수족관', pr: ['fish', 'ocean'] },
  { w: 'amusement park', p: '어뮤즈먼트 파크', k: '놀이공원', pr: ['ride', 'fun'] },
  { w: 'temple', p: '템플', k: '절', pr: ['pray', 'mountain'] },
  { w: 'castle', p: '캐슬', k: '성', pr: ['king', 'queen'] },
  { w: 'harbor', p: '하버', k: '항구', pr: ['ship', 'ocean'] },
  { w: 'farm', p: '팜', k: '농장', pr: ['animal', 'crop'] },
  { w: 'factory', p: '팩토리', k: '공장', pr: ['make', 'machine'] },
  { w: 'gallery', p: '갤러리', k: '갤러리', pr: ['art', 'painting'] },
];

const G56_EMOTIONS: W[] = [
  { w: 'happy', p: '해피', k: '행복한', pr: ['glad', 'joyful'] },
  { w: 'sad', p: '새드', k: '슬픈', pr: ['unhappy', 'upset'] },
  { w: 'angry', p: '앵그리', k: '화난', pr: ['mad', 'furious'] },
  { w: 'scared', p: '스케어드', k: '무서운', pr: ['afraid', 'frightened'] },
  { w: 'excited', p: '익사이티드', k: '신나는', pr: ['thrilled', 'eager'] },
  { w: 'tired', p: '타이어드', k: '피곤한', pr: ['sleepy', 'exhausted'] },
  { w: 'surprised', p: '서프라이즈드', k: '놀란', pr: ['amazed', 'shocked'] },
  { w: 'bored', p: '보어드', k: '지루한', pr: ['dull', 'uninterested'] },
  { w: 'nervous', p: '너버스', k: '긴장한', pr: ['anxious', 'worried'] },
  { w: 'proud', p: '프라우드', k: '자랑스러운', pr: ['confident', 'pleased'] },
  { w: 'lonely', p: '론리', k: '외로운', pr: ['alone', 'isolated'] },
  { w: 'confused', p: '컨퓨즈드', k: '혼란스러운', pr: ['puzzled', 'lost'] },
  { w: 'grateful', p: '그레이트풀', k: '감사한', pr: ['thankful', 'blessed'] },
  { w: 'jealous', p: '젤러스', k: '질투하는', pr: ['envious', 'green'] },
  { w: 'curious', p: '큐리어스', k: '궁금한', pr: ['wonder', 'interested'] },
  { w: 'disappointed', p: '디스어포인티드', k: '실망한', pr: ['let down', 'upset'] },
  { w: 'embarrassed', p: '임배러스드', k: '부끄러운', pr: ['shy', 'ashamed'] },
  { w: 'worried', p: '워리드', k: '걱정되는', pr: ['anxious', 'nervous'] },
  { w: 'hopeful', p: '호프풀', k: '희망찬', pr: ['positive', 'bright'] },
  { w: 'cheerful', p: '치어풀', k: '쾌활한', pr: ['happy', 'bright'] },
  { w: 'calm', p: '캄', k: '차분한', pr: ['peaceful', 'quiet'] },
  { w: 'shy', p: '샤이', k: '수줍은', pr: ['timid', 'quiet'] },
  { w: 'amazed', p: '어메이즈드', k: '깜짝 놀란', pr: ['surprised', 'wow'] },
  { w: 'relieved', p: '릴리브드', k: '안도한', pr: ['safe', 'calm'] },
  { w: 'frustrated', p: '프러스트레이티드', k: '좌절한', pr: ['angry', 'upset'] },
  { w: 'peaceful', p: '피스풀', k: '평화로운', pr: ['calm', 'quiet'] },
  { w: 'annoyed', p: '어노이드', k: '짜증난', pr: ['angry', 'upset'] },
  { w: 'determined', p: '디터민드', k: '결심한', pr: ['strong', 'will'] },
];

const G56_TIME: W[] = [
  { w: 'Monday', p: '먼데이', k: '월요일', pr: ['Tuesday', 'weekday'] },
  { w: 'Tuesday', p: '튜즈데이', k: '화요일', pr: ['Wednesday', 'weekday'] },
  { w: 'Wednesday', p: '웬즈데이', k: '수요일', pr: ['Thursday', 'weekday'] },
  { w: 'Thursday', p: '썰즈데이', k: '목요일', pr: ['Friday', 'weekday'] },
  { w: 'Friday', p: '프라이데이', k: '금요일', pr: ['Saturday', 'weekend'] },
  { w: 'Saturday', p: '새터데이', k: '토요일', pr: ['Sunday', 'weekend'] },
  { w: 'Sunday', p: '선데이', k: '일요일', pr: ['Monday', 'weekend'] },
  { w: 'morning', p: '모닝', k: '아침', pr: ['afternoon', 'evening'] },
  { w: 'afternoon', p: '애프터눈', k: '오후', pr: ['morning', 'evening'] },
  { w: 'evening', p: '이브닝', k: '저녁', pr: ['night', 'morning'] },
  { w: 'night', p: '나잇', k: '밤', pr: ['day', 'dark'] },
  { w: 'today', p: '투데이', k: '오늘', pr: ['yesterday', 'tomorrow'] },
  { w: 'yesterday', p: '예스터데이', k: '어제', pr: ['today', 'tomorrow'] },
  { w: 'tomorrow', p: '투머로우', k: '내일', pr: ['today', 'yesterday'] },
  { w: 'noon', p: '눈', k: '정오', pr: ['midday', 'twelve'] },
  { w: 'midnight', p: '미드나잇', k: '자정', pr: ['night', 'twelve'] },
  { w: 'weekend', p: '위켄드', k: '주말', pr: ['Saturday', 'Sunday'] },
  { w: 'weekday', p: '위크데이', k: '평일', pr: ['Monday', 'work'] },
  { w: 'dawn', p: '돈', k: '새벽', pr: ['early', 'sunrise'] },
  { w: 'sunset', p: '선셋', k: '일몰', pr: ['evening', 'sky'] },
  { w: 'sunrise', p: '선라이즈', k: '일출', pr: ['morning', 'dawn'] },
  { w: 'hour', p: '아워', k: '시간', pr: ['minute', 'clock'] },
  { w: 'minute', p: '미닛', k: '분', pr: ['second', 'hour'] },
  { w: 'second', p: '세컨드', k: '초', pr: ['minute', 'quick'] },
];

const G56_SEASONS: W[] = [
  { w: 'spring', p: '스프링', k: '봄', pr: ['flower', 'warm'] },
  { w: 'summer', p: '서머', k: '여름', pr: ['hot', 'vacation'] },
  { w: 'fall', p: '폴', k: '가을', pr: ['leaf', 'cool'] },
  { w: 'winter', p: '윈터', k: '겨울', pr: ['cold', 'snow'] },
  { w: 'January', p: '재뉴어리', k: '1월', pr: ['February', 'new year'] },
  { w: 'February', p: '페브루어리', k: '2월', pr: ['March', 'Valentine'] },
  { w: 'March', p: '마치', k: '3월', pr: ['April', 'spring'] },
  { w: 'April', p: '에이프릴', k: '4월', pr: ['May', 'rain'] },
  { w: 'May', p: '메이', k: '5월', pr: ['June', 'family'] },
  { w: 'June', p: '준', k: '6월', pr: ['July', 'summer'] },
  { w: 'July', p: '줄라이', k: '7월', pr: ['August', 'vacation'] },
  { w: 'August', p: '오거스트', k: '8월', pr: ['September', 'hot'] },
  { w: 'September', p: '셉템버', k: '9월', pr: ['October', 'fall'] },
  { w: 'October', p: '옥토버', k: '10월', pr: ['November', 'Halloween'] },
  { w: 'November', p: '노벰버', k: '11월', pr: ['December', 'fall'] },
  { w: 'December', p: '디셈버', k: '12월', pr: ['January', 'Christmas'] },
  { w: 'season', p: '시즌', k: '계절', pr: ['spring', 'winter'] },
  { w: 'harvest', p: '하비스트', k: '수확', pr: ['fall', 'crop'] },
  { w: 'blossom', p: '블라썸', k: '꽃이 피다', pr: ['spring', 'flower'] },
  { w: 'snowflake', p: '스노플레이크', k: '눈송이', pr: ['winter', 'snow'] },
  { w: 'sunlight', p: '선라이트', k: '햇빛', pr: ['summer', 'bright'] },
  { w: 'breeze', p: '브리즈', k: '산들바람', pr: ['spring', 'wind'] },
  { w: 'frost', p: '프로스트', k: '서리', pr: ['winter', 'cold'] },
  { w: 'pollen', p: '폴렌', k: '꽃가루', pr: ['spring', 'allergy'] },
  { w: 'heatwave', p: '히트웨이브', k: '폭염', pr: ['summer', 'hot'] },
];

const G56_INTERMEDIATE_ADJ: W[] = [
  { w: 'taller', p: '톨러', k: '더 큰', pr: ['shorter', 'bigger'] },
  { w: 'shorter', p: '숏터', k: '더 작은', pr: ['taller', 'smaller'] },
  { w: 'bigger', p: '비거', k: '더 큰', pr: ['smaller', 'larger'] },
  { w: 'smaller', p: '스몰러', k: '더 작은', pr: ['bigger', 'tinier'] },
  { w: 'faster', p: '패스터', k: '더 빠른', pr: ['slower', 'quicker'] },
  { w: 'slower', p: '슬로어', k: '더 느린', pr: ['faster', 'steadier'] },
  { w: 'stronger', p: '스트롱거', k: '더 강한', pr: ['weaker', 'mightier'] },
  { w: 'smarter', p: '스마터', k: '더 똑똑한', pr: ['wiser', 'cleverer'] },
  { w: 'beautiful', p: '뷰티풀', k: '아름다운', pr: ['pretty', 'gorgeous'] },
  { w: 'important', p: '임포턴트', k: '중요한', pr: ['significant', 'valuable'] },
  { w: 'different', p: '디퍼런트', k: '다른', pr: ['same', 'similar'] },
  { w: 'popular', p: '파퓰러', k: '인기 있는', pr: ['famous', 'well-known'] },
  { w: 'difficult', p: '디피컬트', k: '어려운', pr: ['hard', 'easy'] },
  { w: 'delicious', p: '딜리셔스', k: '맛있는', pr: ['tasty', 'yummy'] },
  { w: 'dangerous', p: '데인저러스', k: '위험한', pr: ['safe', 'risky'] },
  { w: 'interesting', p: '인터레스팅', k: '재미있는', pr: ['boring', 'fun'] },
  { w: 'wonderful', p: '원더풀', k: '멋진', pr: ['amazing', 'great'] },
  { w: 'terrible', p: '테리블', k: '끔찍한', pr: ['awful', 'horrible'] },
  { w: 'expensive', p: '익스펜시브', k: '비싼', pr: ['cheap', 'costly'] },
  { w: 'cheap', p: '칩', k: '싼', pr: ['expensive', 'affordable'] },
  { w: 'famous', p: '페이머스', k: '유명한', pr: ['well-known', 'popular'] },
  { w: 'comfortable', p: '컴포터블', k: '편안한', pr: ['cozy', 'snug'] },
  { w: 'necessary', p: '네세서리', k: '필요한', pr: ['essential', 'required'] },
  { w: 'possible', p: '파서블', k: '가능한', pr: ['impossible', 'able'] },
  { w: 'heavier', p: '헤비어', k: '더 무거운', pr: ['lighter', 'weight'] },
  { w: 'lighter', p: '라이터', k: '더 가벼운', pr: ['heavier', 'feather'] },
  { w: 'deeper', p: '디퍼', k: '더 깊은', pr: ['shallower', 'ocean'] },
  { w: 'wider', p: '와이더', k: '더 넓은', pr: ['narrower', 'broad'] },
  { w: 'excellent', p: '엑설런트', k: '훌륭한', pr: ['great', 'superb'] },
  { w: 'horrible', p: '호러블', k: '끔찍한', pr: ['terrible', 'awful'] },
  { w: 'enormous', p: '이노머스', k: '거대한', pr: ['huge', 'tiny'] },
  { w: 'tiny', p: '타이니', k: '아주 작은', pr: ['small', 'little'] },
  { w: 'ancient', p: '에인션트', k: '고대의', pr: ['old', 'modern'] },
  { w: 'modern', p: '모던', k: '현대의', pr: ['ancient', 'new'] },
  { w: 'colorful', p: '컬러풀', k: '다채로운', pr: ['bright', 'vivid'] },
];

const G56_PAST_TENSE: W[] = [
  { w: 'went', p: '웬트', k: '갔다', pr: ['go', 'came'] },
  { w: 'ate', p: '에잇', k: '먹었다', pr: ['eat', 'drank'] },
  { w: 'saw', p: '쏘', k: '보았다', pr: ['see', 'watched'] },
  { w: 'made', p: '메이드', k: '만들었다', pr: ['make', 'built'] },
  { w: 'played', p: '플레이드', k: '놀았다', pr: ['play', 'ran'] },
  { w: 'studied', p: '스터디드', k: '공부했다', pr: ['study', 'learned'] },
  { w: 'watched', p: '워치드', k: '봤다', pr: ['watch', 'saw'] },
  { w: 'helped', p: '헬프드', k: '도왔다', pr: ['help', 'assisted'] },
  { w: 'visited', p: '비지티드', k: '방문했다', pr: ['visit', 'went'] },
  { w: 'learned', p: '러닛', k: '배웠다', pr: ['learn', 'studied'] },
  { w: 'bought', p: '보트', k: '샀다', pr: ['buy', 'sold'] },
  { w: 'ran', p: '랜', k: '달렸다', pr: ['run', 'walked'] },
  { w: 'wrote', p: '로트', k: '썼다', pr: ['write', 'read'] },
  { w: 'sang', p: '생', k: '노래했다', pr: ['sing', 'danced'] },
  { w: 'swam', p: '스왬', k: '수영했다', pr: ['swim', 'dove'] },
  { w: 'found', p: '파운드', k: '찾았다', pr: ['find', 'lost'] },
  { w: 'gave', p: '게이브', k: '주었다', pr: ['give', 'took'] },
  { w: 'told', p: '톨드', k: '말했다', pr: ['tell', 'said'] },
  { w: 'caught', p: '코트', k: '잡았다', pr: ['catch', 'threw'] },
  { w: 'forgot', p: '포갓', k: '잊었다', pr: ['forget', 'remembered'] },
  { w: 'drew', p: '드루', k: '그렸다', pr: ['draw', 'painted'] },
  { w: 'spoke', p: '스포크', k: '말했다', pr: ['speak', 'talked'] },
  { w: 'heard', p: '허드', k: '들었다', pr: ['hear', 'listened'] },
  { w: 'felt', p: '펠트', k: '느꼈다', pr: ['feel', 'touched'] },
  { w: 'brought', p: '브로트', k: '가져왔다', pr: ['bring', 'carried'] },
  { w: 'built', p: '빌트', k: '지었다', pr: ['build', 'created'] },
  { w: 'chose', p: '초즈', k: '골랐다', pr: ['choose', 'picked'] },
  { w: 'grew', p: '그루', k: '자랐다', pr: ['grow', 'bigger'] },
  { w: 'knew', p: '뉴', k: '알았다', pr: ['know', 'understood'] },
  { w: 'thought', p: '쏘트', k: '생각했다', pr: ['think', 'believed'] },
];

const G56_JOBS: W[] = [
  { w: 'doctor', p: '닥터', k: '의사', pr: ['nurse', 'hospital'] },
  { w: 'nurse', p: '너스', k: '간호사', pr: ['doctor', 'hospital'] },
  { w: 'police officer', p: '폴리스 오피서', k: '경찰관', pr: ['law', 'safety'] },
  { w: 'firefighter', p: '파이어파이터', k: '소방관', pr: ['fire', 'rescue'] },
  { w: 'pilot', p: '파일럿', k: '조종사', pr: ['airplane', 'fly'] },
  { w: 'chef', p: '셰프', k: '요리사', pr: ['cook', 'kitchen'] },
  { w: 'scientist', p: '사이언티스트', k: '과학자', pr: ['lab', 'experiment'] },
  { w: 'farmer', p: '파머', k: '농부', pr: ['farm', 'crop'] },
  { w: 'artist', p: '아티스트', k: '예술가', pr: ['paint', 'draw'] },
  { w: 'singer', p: '싱어', k: '가수', pr: ['song', 'concert'] },
  { w: 'dentist', p: '덴티스트', k: '치과의사', pr: ['tooth', 'clinic'] },
  { w: 'engineer', p: '엔지니어', k: '공학자', pr: ['build', 'design'] },
  { w: 'lawyer', p: '로이어', k: '변호사', pr: ['court', 'law'] },
  { w: 'astronaut', p: '애스트로넛', k: '우주비행사', pr: ['space', 'rocket'] },
  { w: 'vet', p: '벳', k: '수의사', pr: ['animal', 'pet'] },
  { w: 'programmer', p: '프로그래머', k: '프로그래머', pr: ['code', 'computer'] },
  { w: 'architect', p: '아키텍트', k: '건축가', pr: ['building', 'design'] },
  { w: 'journalist', p: '저널리스트', k: '기자', pr: ['news', 'write'] },
  { w: 'athlete', p: '애슬릿', k: '운동선수', pr: ['sport', 'compete'] },
  { w: 'mechanic', p: '메캐닉', k: '정비사', pr: ['car', 'fix'] },
  { w: 'baker', p: '베이커', k: '제빵사', pr: ['bread', 'cake'] },
  { w: 'librarian', p: '라이브레리언', k: '사서', pr: ['book', 'library'] },
  { w: 'photographer', p: '포토그래퍼', k: '사진작가', pr: ['camera', 'picture'] },
  { w: 'translator', p: '트랜슬레이터', k: '번역가', pr: ['language', 'word'] },
  { w: 'designer', p: '디자이너', k: '디자이너', pr: ['art', 'create'] },
];

const G56_TECHNOLOGY: W[] = [
  { w: 'computer', p: '컴퓨터', k: '컴퓨터', pr: ['keyboard', 'mouse'] },
  { w: 'phone', p: '폰', k: '전화기', pr: ['call', 'text'] },
  { w: 'internet', p: '인터넷', k: '인터넷', pr: ['website', 'online'] },
  { w: 'robot', p: '로봇', k: '로봇', pr: ['machine', 'AI'] },
  { w: 'camera', p: '카메라', k: '카메라', pr: ['photo', 'picture'] },
  { w: 'keyboard', p: '키보드', k: '키보드', pr: ['type', 'computer'] },
  { w: 'mouse', p: '마우스', k: '마우스', pr: ['click', 'computer'] },
  { w: 'screen', p: '스크린', k: '화면', pr: ['monitor', 'display'] },
  { w: 'printer', p: '프린터', k: '프린터', pr: ['print', 'paper'] },
  { w: 'tablet', p: '태블릿', k: '태블릿', pr: ['screen', 'touch'] },
  { w: 'battery', p: '배터리', k: '배터리', pr: ['charge', 'power'] },
  { w: 'headphone', p: '헤드폰', k: '헤드폰', pr: ['listen', 'music'] },
  { w: 'laptop', p: '랩탑', k: '노트북 컴퓨터', pr: ['computer', 'portable'] },
  { w: 'smartphone', p: '스마트폰', k: '스마트폰', pr: ['phone', 'app'] },
  { w: 'speaker', p: '스피커', k: '스피커', pr: ['sound', 'music'] },
  { w: 'charger', p: '차저', k: '충전기', pr: ['battery', 'plug'] },
  { w: 'Wi-Fi', p: '와이파이', k: '와이파이', pr: ['internet', 'connect'] },
  { w: 'USB', p: '유에스비', k: '유에스비', pr: ['cable', 'connect'] },
  { w: 'microphone', p: '마이크로폰', k: '마이크', pr: ['voice', 'record'] },
  { w: 'drone', p: '드론', k: '드론', pr: ['fly', 'camera'] },
  { w: 'GPS', p: '지피에스', k: '지피에스', pr: ['map', 'location'] },
  { w: 'software', p: '소프트웨어', k: '소프트웨어', pr: ['program', 'app'] },
];

const G56_HEALTH: W[] = [
  { w: 'healthy', p: '헬시', k: '건강한', pr: ['strong', 'fit'] },
  { w: 'sick', p: '식', k: '아픈', pr: ['ill', 'unwell'] },
  { w: 'fever', p: '피버', k: '열', pr: ['cold', 'flu'] },
  { w: 'cough', p: '코프', k: '기침', pr: ['sneeze', 'cold'] },
  { w: 'headache', p: '헤데이크', k: '두통', pr: ['pain', 'medicine'] },
  { w: 'medicine', p: '메디슨', k: '약', pr: ['pill', 'doctor'] },
  { w: 'exercise', p: '엑서사이즈', k: '운동', pr: ['sport', 'fitness'] },
  { w: 'vitamin', p: '비타민', k: '비타민', pr: ['health', 'fruit'] },
  { w: 'toothache', p: '투세이크', k: '치통', pr: ['dentist', 'pain'] },
  { w: 'stomachache', p: '스터머케이크', k: '복통', pr: ['pain', 'sick'] },
  { w: 'bandage', p: '밴디지', k: '붕대', pr: ['wound', 'wrap'] },
  { w: 'allergy', p: '앨러지', k: '알레르기', pr: ['sneeze', 'rash'] },
  { w: 'injury', p: '인저리', k: '부상', pr: ['hurt', 'wound'] },
  { w: 'hospital', p: '호스피탈', k: '병원', pr: ['doctor', 'nurse'] },
  { w: 'rest', p: '레스트', k: '쉬다', pr: ['sleep', 'relax'] },
  { w: 'sneeze', p: '스니즈', k: '재채기', pr: ['cold', 'cough'] },
  { w: 'temperature', p: '템퍼러처', k: '체온', pr: ['fever', 'check'] },
  { w: 'diet', p: '다이어트', k: '식단', pr: ['food', 'health'] },
  { w: 'stretch', p: '스트레치', k: '스트레칭', pr: ['exercise', 'body'] },
  { w: 'vaccine', p: '백신', k: '백신', pr: ['shot', 'protect'] },
];

// ============================================================
// Sentence Templates
// ============================================================

interface Tmpl {
  s: (w: string) => string;
  t: (k: string) => string;
}

const BASIC_TEMPLATES: Tmpl[] = [
  { s: w => `I like ${w}.`, t: k => `나는 ${k}을(를) 좋아해요.` },
  { s: w => `This is a ${w}.`, t: k => `이것은 ${k}이에요.` },
  { s: w => `I see a ${w}.`, t: k => `나는 ${k}을(를) 봐요.` },
  { s: w => `Do you like ${w}?`, t: k => `${k}을(를) 좋아해요?` },
  { s: w => `It is ${w}.`, t: k => `그것은 ${k}이에요.` },
  { s: w => `I have a ${w}.`, t: k => `나는 ${k}이(가) 있어요.` },
  { s: w => `The ${w} is nice.`, t: k => `그 ${k}은(는) 좋아요.` },
  { s: w => `Look at the ${w}!`, t: k => `${k}을(를) 봐요!` },
  { s: w => `I want a ${w}.`, t: k => `나는 ${k}을(를) 원해요.` },
  { s: w => `Where is the ${w}?`, t: k => `${k}이(가) 어디에 있어요?` },
];

const FAMILY_TEMPLATES: Tmpl[] = [
  { s: w => `This is my ${w}.`, t: k => `이분은 내 ${k}이에요.` },
  { s: w => `I love my ${w}.`, t: k => `나는 내 ${k}을(를) 사랑해요.` },
  { s: w => `My ${w} is kind.`, t: k => `내 ${k}은(는) 친절해요.` },
  { s: w => `My ${w} is tall.`, t: k => `내 ${k}은(는) 키가 커요.` },
  { s: w => `I have a ${w}.`, t: k => `나는 ${k}이(가) 있어요.` },
  { s: w => `My ${w} is the best.`, t: k => `내 ${k}은(는) 최고예요.` },
];

const ACTION_TEMPLATES: Tmpl[] = [
  { s: w => `I ${w} every day.`, t: k => `나는 매일 ${k}.` },
  { s: w => `Let's ${w}!`, t: k => `같이 ${k}!` },
  { s: w => `I can ${w}.`, t: k => `나는 ${k} 수 있어요.` },
  { s: w => `Do you like to ${w}?`, t: k => `${k} 것을 좋아해요?` },
  { s: w => `I like to ${w}.`, t: k => `나는 ${k} 것을 좋아해요.` },
  { s: w => `She can ${w} well.`, t: k => `그녀는 잘 ${k}.` },
  { s: w => `We ${w} together.`, t: k => `우리는 함께 ${k}.` },
];

const INTERMEDIATE_TEMPLATES: Tmpl[] = [
  { s: w => `I went to the ${w}.`, t: k => `나는 ${k}에 갔어요.` },
  { s: w => `The ${w} is near my house.`, t: k => `${k}은(는) 우리 집 근처에 있어요.` },
  { s: w => `Let's go to the ${w}.`, t: k => `${k}에 가자.` },
  { s: w => `Where is the ${w}?`, t: k => `${k}이(가) 어디에 있어요?` },
  { s: w => `I like going to the ${w}.`, t: k => `나는 ${k}에 가는 것을 좋아해요.` },
  { s: w => `We visited the ${w} yesterday.`, t: k => `우리는 어제 ${k}에 갔어요.` },
  { s: w => `The ${w} is very big.`, t: k => `그 ${k}은(는) 매우 커요.` },
  { s: w => `Have you been to the ${w}?`, t: k => `${k}에 가 본 적 있어요?` },
];

const EMOTION_TEMPLATES: Tmpl[] = [
  { s: w => `I feel ${w}.`, t: k => `나는 ${k} 기분이에요.` },
  { s: w => `She looks ${w}.`, t: k => `그녀는 ${k} 보여요.` },
  { s: w => `Are you ${w}?`, t: k => `${k} 기분이에요?` },
  { s: w => `He was ${w} yesterday.`, t: k => `그는 어제 ${k} 기분이었어요.` },
  { s: w => `Don't be ${w}.`, t: k => `${k} 하지 마세요.` },
  { s: w => `I am so ${w} right now.`, t: k => `나는 지금 너무 ${k}.` },
  { s: w => `Why are you ${w}?`, t: k => `왜 ${k} 기분이에요?` },
];

const HOBBY_TEMPLATES: Tmpl[] = [
  { s: w => `My hobby is ${w}.`, t: k => `내 취미는 ${k}이에요.` },
  { s: w => `I enjoy ${w}.`, t: k => `나는 ${k}을(를) 즐겨요.` },
  { s: w => `Do you like ${w}?`, t: k => `${k} 좋아해요?` },
  { s: w => `I go ${w} on weekends.`, t: k => `나는 주말에 ${k}을(를) 해요.` },
  { s: w => `${w} is fun.`, t: k => `${k}은(는) 재미있어요.` },
  { s: w => `I started ${w} last year.`, t: k => `나는 작년에 ${k}을(를) 시작했어요.` },
];

const WEATHER_TEMPLATES: Tmpl[] = [
  { s: w => `It is ${w} today.`, t: k => `오늘은 ${k} 날씨예요.` },
  { s: w => `The weather is ${w}.`, t: k => `날씨가 ${k}.` },
  { s: w => `It will be ${w} tomorrow.`, t: k => `내일은 ${k} 날씨일 거예요.` },
  { s: w => `I don't like ${w} weather.`, t: k => `나는 ${k} 날씨를 좋아하지 않아요.` },
  { s: w => `Is it ${w} outside?`, t: k => `밖이 ${k}?` },
];

const JOB_TEMPLATES: Tmpl[] = [
  { s: w => `I want to be a ${w}.`, t: k => `나는 ${k}이(가) 되고 싶어요.` },
  { s: w => `My mom is a ${w}.`, t: k => `우리 엄마는 ${k}이에요.` },
  { s: w => `A ${w} helps people.`, t: k => `${k}은(는) 사람들을 도와요.` },
  { s: w => `The ${w} works hard.`, t: k => `그 ${k}은(는) 열심히 일해요.` },
  { s: w => `Do you want to be a ${w}?`, t: k => `${k}이(가) 되고 싶어요?` },
];

const COMPARISON_TEMPLATES: Tmpl[] = [
  { s: w => `This is ${w} than that.`, t: k => `이것은 저것보다 ${k}.` },
  { s: w => `She is ${w}.`, t: k => `그녀는 ${k}.` },
  { s: w => `The movie was ${w}.`, t: k => `그 영화는 ${k}어요.` },
  { s: w => `This book is ${w}.`, t: k => `이 책은 ${k}.` },
  { s: w => `That building is ${w}.`, t: k => `저 건물은 ${k}.` },
  { s: w => `The test was ${w}.`, t: k => `시험은 ${k}어요.` },
];

// ============================================================
// Fixed sentence collections
// ============================================================

const FIXED_COMMANDS: EnglishEntry[] = [
  { sentence: 'Open your book.', translation: '책을 펴세요.', word: 'open', pronunciation: '오픈', practice: ['close', 'read', 'page'] },
  { sentence: 'Close the door.', translation: '문을 닫으세요.', word: 'close', pronunciation: '클로즈', practice: ['open', 'shut', 'door'] },
  { sentence: 'Raise your hand.', translation: '손을 들어요.', word: 'raise', pronunciation: '레이즈', practice: ['hand', 'up', 'lift'] },
  { sentence: 'Be quiet, please.', translation: '조용히 해 주세요.', word: 'quiet', pronunciation: '콰이엇', practice: ['silent', 'calm'] },
  { sentence: 'Listen carefully.', translation: '잘 들으세요.', word: 'carefully', pronunciation: '케어풀리', practice: ['listen', 'hear'] },
  { sentence: 'Repeat after me.', translation: '따라 하세요.', word: 'repeat', pronunciation: '리핏', practice: ['again', 'say'] },
  { sentence: 'Clean your desk.', translation: '책상을 정리하세요.', word: 'clean', pronunciation: '클린', practice: ['tidy', 'organize'] },
  { sentence: 'Share with your friend.', translation: '친구와 나누세요.', word: 'share', pronunciation: '쉐어', practice: ['give', 'together'] },
  { sentence: 'Line up, everyone.', translation: '모두 줄 서세요.', word: 'line up', pronunciation: '라인 업', practice: ['queue', 'row'] },
  { sentence: 'Take out your pencil.', translation: '연필을 꺼내세요.', word: 'take out', pronunciation: '테이크 아웃', practice: ['pencil', 'bag'] },
  { sentence: 'Sit down, please.', translation: '앉으세요.', word: 'sit', pronunciation: '싯', practice: ['stand', 'chair'] },
  { sentence: 'Stand up, please.', translation: '일어나세요.', word: 'stand', pronunciation: '스탠드', practice: ['sit', 'up'] },
  { sentence: 'Turn to page ten.', translation: '10쪽을 펴세요.', word: 'turn', pronunciation: '턴', practice: ['page', 'book'] },
  { sentence: 'Come to the front.', translation: '앞으로 나오세요.', word: 'front', pronunciation: '프런트', practice: ['back', 'come'] },
  { sentence: 'Work in pairs.', translation: '짝과 함께 하세요.', word: 'pairs', pronunciation: '페어스', practice: ['two', 'together'] },
  { sentence: 'Raise your hand if you know.', translation: '알면 손을 드세요.', word: 'know', pronunciation: '노', practice: ['answer', 'hand'] },
  { sentence: 'Put away your phone.', translation: '전화기를 치우세요.', word: 'put away', pronunciation: '풋 어웨이', practice: ['keep', 'store'] },
  { sentence: 'Pay attention.', translation: '집중하세요.', word: 'attention', pronunciation: '어텐션', practice: ['focus', 'listen'] },
  { sentence: 'Hurry up, please.', translation: '서두르세요.', word: 'hurry', pronunciation: '허리', practice: ['quick', 'fast'] },
  { sentence: 'Wait your turn.', translation: '차례를 기다리세요.', word: 'wait', pronunciation: '웨이트', practice: ['turn', 'patience'] },
  { sentence: 'Try again.', translation: '다시 해 보세요.', word: 'again', pronunciation: '어겐', practice: ['once more', 'retry'] },
  { sentence: 'Do not run in the hallway.', translation: '복도에서 뛰지 마세요.', word: 'hallway', pronunciation: '홀웨이', practice: ['walk', 'corridor'] },
  { sentence: 'Pick up your trash.', translation: '쓰레기를 주우세요.', word: 'trash', pronunciation: '트래시', practice: ['garbage', 'clean'] },
  { sentence: 'Be careful.', translation: '조심하세요.', word: 'careful', pronunciation: '케어풀', practice: ['watch', 'safe'] },
];

const FIXED_BECAUSE: EnglishEntry[] = [
  { sentence: 'I am happy because it is my birthday.', translation: '내 생일이어서 행복해요.', word: 'birthday', pronunciation: '벌스데이', practice: ['party', 'cake'] },
  { sentence: 'I am tired because I studied all day.', translation: '하루 종일 공부해서 피곤해요.', word: 'tired', pronunciation: '타이어드', practice: ['sleepy', 'rest'] },
  { sentence: 'She is late because she missed the bus.', translation: '버스를 놓쳐서 늦었어요.', word: 'late', pronunciation: '레이트', practice: ['early', 'hurry'] },
  { sentence: 'We are excited because we are going on a trip.', translation: '여행을 가서 신나요.', word: 'trip', pronunciation: '트립', practice: ['travel', 'vacation'] },
  { sentence: 'He is hungry because he did not eat lunch.', translation: '점심을 안 먹어서 배고파요.', word: 'hungry', pronunciation: '헝그리', practice: ['thirsty', 'food'] },
  { sentence: 'I wear a jacket because it is cold outside.', translation: '밖이 추워서 재킷을 입어요.', word: 'jacket', pronunciation: '재킷', practice: ['coat', 'warm'] },
  { sentence: 'I take an umbrella because it is rainy.', translation: '비가 와서 우산을 가져가요.', word: 'umbrella', pronunciation: '엄브렐라', practice: ['raincoat', 'wet'] },
  { sentence: 'She is proud because she won the contest.', translation: '대회에서 이겨서 자랑스러워요.', word: 'proud', pronunciation: '프라우드', practice: ['happy', 'winner'] },
  { sentence: 'I like spring because the flowers bloom.', translation: '꽃이 피어서 봄을 좋아해요.', word: 'spring', pronunciation: '스프링', practice: ['flower', 'warm'] },
  { sentence: 'They are scared because they heard a loud noise.', translation: '큰 소리를 들어서 무서워요.', word: 'scared', pronunciation: '스케어드', practice: ['afraid', 'noise'] },
  { sentence: 'I am sleepy because I stayed up late.', translation: '늦게까지 안 자서 졸려요.', word: 'sleepy', pronunciation: '슬리피', practice: ['tired', 'yawn'] },
  { sentence: 'He is smiling because he got a gift.', translation: '선물을 받아서 웃고 있어요.', word: 'gift', pronunciation: '기프트', practice: ['present', 'surprise'] },
  { sentence: 'I am thirsty because I ran a lot.', translation: '많이 뛰어서 목이 말라요.', word: 'thirsty', pronunciation: '써스티', practice: ['drink', 'water'] },
  { sentence: 'She is crying because she lost her toy.', translation: '장난감을 잃어버려서 울고 있어요.', word: 'lost', pronunciation: '로스트', practice: ['find', 'gone'] },
  { sentence: 'We are laughing because the movie is funny.', translation: '영화가 재미있어서 웃고 있어요.', word: 'funny', pronunciation: '퍼니', practice: ['hilarious', 'comedy'] },
  { sentence: 'I am nervous because I have a test today.', translation: '오늘 시험이 있어서 긴장돼요.', word: 'test', pronunciation: '테스트', practice: ['exam', 'quiz'] },
  { sentence: 'He is cold because he forgot his jacket.', translation: '재킷을 잊어서 추워요.', word: 'forgot', pronunciation: '포갓', practice: ['remember', 'lost'] },
  { sentence: 'I am full because I ate too much.', translation: '너무 많이 먹어서 배불러요.', word: 'full', pronunciation: '풀', practice: ['hungry', 'stomach'] },
  { sentence: 'She is excited because her friend is visiting.', translation: '친구가 놀러 와서 신나요.', word: 'visiting', pronunciation: '비지팅', practice: ['coming', 'guest'] },
];

const FIXED_IF: EnglishEntry[] = [
  { sentence: 'If it rains, I will stay home.', translation: '비가 오면 나는 집에 있을 거예요.', word: 'rain', pronunciation: '레인', practice: ['snow', 'storm'] },
  { sentence: 'If you study hard, you will do well.', translation: '열심히 공부하면 잘할 거예요.', word: 'study', pronunciation: '스터디', practice: ['learn', 'practice'] },
  { sentence: 'If I have time, I will read a book.', translation: '시간이 있으면 책을 읽을 거예요.', word: 'time', pronunciation: '타임', practice: ['clock', 'hour'] },
  { sentence: 'If we finish early, we can play outside.', translation: '일찍 끝나면 밖에서 놀 수 있어요.', word: 'finish', pronunciation: '피니시', practice: ['complete', 'done'] },
  { sentence: 'If you are kind, people will like you.', translation: '친절하면 사람들이 좋아할 거예요.', word: 'kind', pronunciation: '카인드', practice: ['nice', 'gentle'] },
  { sentence: 'If it is sunny, we will go to the park.', translation: '날씨가 좋으면 공원에 갈 거예요.', word: 'sunny', pronunciation: '서니', practice: ['bright', 'clear'] },
  { sentence: 'If you eat vegetables, you will be healthy.', translation: '채소를 먹으면 건강해질 거예요.', word: 'healthy', pronunciation: '헬시', practice: ['strong', 'fit'] },
  { sentence: 'If I save money, I can buy a new book.', translation: '돈을 모으면 새 책을 살 수 있어요.', word: 'save', pronunciation: '세이브', practice: ['spend', 'keep'] },
  { sentence: 'If you help others, they will help you too.', translation: '다른 사람을 도우면 그들도 너를 도와줄 거예요.', word: 'others', pronunciation: '아더스', practice: ['people', 'friends'] },
  { sentence: 'If I practice every day, I will get better.', translation: '매일 연습하면 더 잘할 수 있을 거예요.', word: 'practice', pronunciation: '프랙티스', practice: ['train', 'improve'] },
  { sentence: 'If it snows, we will build a snowman.', translation: '눈이 오면 눈사람을 만들 거예요.', word: 'snowman', pronunciation: '스노맨', practice: ['snow', 'winter'] },
  { sentence: 'If you are tired, you should rest.', translation: '피곤하면 쉬어야 해요.', word: 'rest', pronunciation: '레스트', practice: ['sleep', 'relax'] },
  { sentence: 'If we hurry, we will catch the bus.', translation: '서두르면 버스를 탈 수 있을 거예요.', word: 'hurry', pronunciation: '허리', practice: ['fast', 'rush'] },
  { sentence: 'If you read every day, you will learn many words.', translation: '매일 읽으면 단어를 많이 배울 거예요.', word: 'words', pronunciation: '워즈', practice: ['vocabulary', 'language'] },
  { sentence: 'If she comes early, we can play together.', translation: '그녀가 일찍 오면 같이 놀 수 있어요.', word: 'early', pronunciation: '얼리', practice: ['late', 'soon'] },
];

const FIXED_ROUTINE: EnglishEntry[] = [
  { sentence: 'Every day, I wake up at seven.', translation: '매일, 나는 7시에 일어나요.', word: 'wake up', pronunciation: '웨이크 업', practice: ['get up', 'alarm'] },
  { sentence: 'Every day, I brush my teeth.', translation: '매일, 나는 양치해요.', word: 'brush', pronunciation: '브러시', practice: ['toothpaste', 'teeth'] },
  { sentence: 'Every day, I eat breakfast.', translation: '매일, 나는 아침을 먹어요.', word: 'breakfast', pronunciation: '브렉퍼스트', practice: ['lunch', 'dinner'] },
  { sentence: 'Every day, I go to school.', translation: '매일, 나는 학교에 가요.', word: 'school', pronunciation: '스쿨', practice: ['class', 'teacher'] },
  { sentence: 'Every day, I do my homework.', translation: '매일, 나는 숙제를 해요.', word: 'homework', pronunciation: '홈워크', practice: ['assignment', 'study'] },
  { sentence: 'Every day, I take a shower.', translation: '매일, 나는 샤워해요.', word: 'shower', pronunciation: '샤워', practice: ['bath', 'wash'] },
  { sentence: 'Every day, I go to bed at nine.', translation: '매일, 나는 9시에 자요.', word: 'bed', pronunciation: '베드', practice: ['sleep', 'pillow'] },
  { sentence: 'Every day, I walk to school.', translation: '매일, 나는 걸어서 학교에 가요.', word: 'walk', pronunciation: '워크', practice: ['run', 'ride'] },
  { sentence: 'Every day, I feed my pet.', translation: '매일, 나는 반려동물에게 밥을 줘요.', word: 'feed', pronunciation: '피드', practice: ['food', 'eat'] },
  { sentence: 'Every day, I practice piano.', translation: '매일, 나는 피아노를 연습해요.', word: 'practice', pronunciation: '프랙티스', practice: ['rehearse', 'play'] },
  { sentence: 'Every day, I read before bed.', translation: '매일, 나는 자기 전에 책을 읽어요.', word: 'read', pronunciation: '리드', practice: ['book', 'story'] },
  { sentence: 'Every day, I drink water.', translation: '매일, 나는 물을 마셔요.', word: 'water', pronunciation: '워터', practice: ['drink', 'healthy'] },
  { sentence: 'Every day, I clean my room.', translation: '매일, 나는 방을 정리해요.', word: 'room', pronunciation: '룸', practice: ['clean', 'tidy'] },
  { sentence: 'Every day, I say hello to my friends.', translation: '매일, 나는 친구들에게 인사해요.', word: 'hello', pronunciation: '헬로', practice: ['greet', 'hi'] },
  { sentence: 'Every day, I wear my uniform.', translation: '매일, 나는 교복을 입어요.', word: 'uniform', pronunciation: '유니폼', practice: ['school', 'clothes'] },
  { sentence: 'Every day, I pack my bag.', translation: '매일, 나는 가방을 싸요.', word: 'pack', pronunciation: '팩', practice: ['bag', 'prepare'] },
  { sentence: 'Every day, I help my parents.', translation: '매일, 나는 부모님을 도와요.', word: 'parents', pronunciation: '페어런츠', practice: ['family', 'help'] },
  { sentence: 'Every day, I exercise after school.', translation: '매일, 나는 방과 후에 운동해요.', word: 'exercise', pronunciation: '엑서사이즈', practice: ['sport', 'run'] },
  { sentence: 'Every day, I eat vegetables.', translation: '매일, 나는 채소를 먹어요.', word: 'vegetables', pronunciation: '베지터블즈', practice: ['fruit', 'healthy'] },
];

const FIXED_SHOULD: EnglishEntry[] = [
  { sentence: 'You should eat breakfast.', translation: '아침을 먹어야 해요.', word: 'should', pronunciation: '슈드', practice: ['must', 'need'] },
  { sentence: 'We should be kind to others.', translation: '다른 사람에게 친절해야 해요.', word: 'kind', pronunciation: '카인드', practice: ['nice', 'gentle'] },
  { sentence: 'You should drink more water.', translation: '물을 더 마셔야 해요.', word: 'water', pronunciation: '워터', practice: ['juice', 'milk'] },
  { sentence: 'She should go to bed early.', translation: '그녀는 일찍 자야 해요.', word: 'early', pronunciation: '얼리', practice: ['late', 'soon'] },
  { sentence: 'We should help each other.', translation: '우리는 서로 도와야 해요.', word: 'help', pronunciation: '헬프', practice: ['support', 'assist'] },
  { sentence: 'You should wear a helmet.', translation: '헬멧을 써야 해요.', word: 'helmet', pronunciation: '헬멧', practice: ['safety', 'protect'] },
  { sentence: 'You should brush your teeth.', translation: '양치를 해야 해요.', word: 'brush', pronunciation: '브러시', practice: ['teeth', 'clean'] },
  { sentence: 'We should save energy.', translation: '에너지를 절약해야 해요.', word: 'energy', pronunciation: '에너지', practice: ['power', 'save'] },
  { sentence: 'You should say thank you.', translation: '감사하다고 말해야 해요.', word: 'thank', pronunciation: '땡크', practice: ['grateful', 'polite'] },
  { sentence: 'We should respect our teachers.', translation: '선생님을 존경해야 해요.', word: 'respect', pronunciation: '리스펙트', practice: ['honor', 'polite'] },
  { sentence: 'You should listen to your parents.', translation: '부모님 말씀을 들어야 해요.', word: 'listen', pronunciation: '리슨', practice: ['hear', 'obey'] },
  { sentence: 'She should study for the test.', translation: '그녀는 시험 공부를 해야 해요.', word: 'test', pronunciation: '테스트', practice: ['exam', 'quiz'] },
  { sentence: 'We should recycle paper.', translation: '종이를 재활용해야 해요.', word: 'recycle', pronunciation: '리사이클', practice: ['reuse', 'environment'] },
  { sentence: 'You should wash your hands often.', translation: '손을 자주 씻어야 해요.', word: 'wash', pronunciation: '워시', practice: ['clean', 'soap'] },
  { sentence: 'We should protect animals.', translation: '동물을 보호해야 해요.', word: 'protect', pronunciation: '프로텍트', practice: ['save', 'guard'] },
  { sentence: 'You should read more books.', translation: '책을 더 많이 읽어야 해요.', word: 'more', pronunciation: '모어', practice: ['less', 'many'] },
];

const FIXED_WANT: EnglishEntry[] = [
  { sentence: 'I want to visit Japan.', translation: '나는 일본을 방문하고 싶어요.', word: 'visit', pronunciation: '비짓', practice: ['travel', 'trip'] },
  { sentence: 'I want to learn English.', translation: '나는 영어를 배우고 싶어요.', word: 'learn', pronunciation: '런', practice: ['study', 'practice'] },
  { sentence: 'I want to become a doctor.', translation: '나는 의사가 되고 싶어요.', word: 'become', pronunciation: '비컴', practice: ['teacher', 'scientist'] },
  { sentence: 'I want to try new food.', translation: '나는 새 음식을 먹어보고 싶어요.', word: 'try', pronunciation: '트라이', practice: ['taste', 'eat'] },
  { sentence: 'I want to ride a horse.', translation: '나는 말을 타고 싶어요.', word: 'ride', pronunciation: '라이드', practice: ['bicycle', 'boat'] },
  { sentence: 'I want to meet new friends.', translation: '나는 새 친구를 만나고 싶어요.', word: 'meet', pronunciation: '밋', practice: ['greet', 'talk'] },
  { sentence: 'I want to build a robot.', translation: '나는 로봇을 만들고 싶어요.', word: 'build', pronunciation: '빌드', practice: ['create', 'design'] },
  { sentence: 'I want to climb a mountain.', translation: '나는 산에 오르고 싶어요.', word: 'climb', pronunciation: '클라임', practice: ['hike', 'walk'] },
  { sentence: 'I want to fly an airplane.', translation: '나는 비행기를 타고 싶어요.', word: 'fly', pronunciation: '플라이', practice: ['travel', 'sky'] },
  { sentence: 'I want to win the game.', translation: '나는 경기에서 이기고 싶어요.', word: 'win', pronunciation: '윈', practice: ['lose', 'compete'] },
  { sentence: 'I want to travel around the world.', translation: '나는 세계 여행을 하고 싶어요.', word: 'travel', pronunciation: '트래블', practice: ['trip', 'journey'] },
  { sentence: 'I want to speak many languages.', translation: '나는 여러 언어를 말하고 싶어요.', word: 'language', pronunciation: '랭귀지', practice: ['speak', 'learn'] },
  { sentence: 'I want to plant a tree.', translation: '나는 나무를 심고 싶어요.', word: 'plant', pronunciation: '플랜트', practice: ['tree', 'grow'] },
  { sentence: 'I want to write a story.', translation: '나는 이야기를 쓰고 싶어요.', word: 'story', pronunciation: '스토리', practice: ['tale', 'book'] },
  { sentence: 'I want to help animals.', translation: '나는 동물들을 돕고 싶어요.', word: 'animal', pronunciation: '애니멀', practice: ['pet', 'protect'] },
  { sentence: 'I want to make a cake.', translation: '나는 케이크를 만들고 싶어요.', word: 'cake', pronunciation: '케이크', practice: ['bake', 'sweet'] },
  { sentence: 'I want to see the ocean.', translation: '나는 바다를 보고 싶어요.', word: 'ocean', pronunciation: '오션', practice: ['sea', 'beach'] },
  { sentence: 'I want to learn to dance.', translation: '나는 춤을 배우고 싶어요.', word: 'dance', pronunciation: '댄스', practice: ['move', 'music'] },
  { sentence: 'I want to explore the jungle.', translation: '나는 정글을 탐험하고 싶어요.', word: 'explore', pronunciation: '익스플로어', practice: ['discover', 'adventure'] },
  { sentence: 'I want to catch a butterfly.', translation: '나는 나비를 잡고 싶어요.', word: 'butterfly', pronunciation: '버터플라이', practice: ['insect', 'net'] },
];

const FIXED_OPINION: EnglishEntry[] = [
  { sentence: 'I think reading is important.', translation: '나는 독서가 중요하다고 생각해요.', word: 'important', pronunciation: '임포턴트', practice: ['valuable', 'essential'] },
  { sentence: 'I believe friends are special.', translation: '나는 친구가 특별하다고 믿어요.', word: 'special', pronunciation: '스페셜', practice: ['unique', 'important'] },
  { sentence: 'I think nature is beautiful.', translation: '나는 자연이 아름답다고 생각해요.', word: 'nature', pronunciation: '네이처', practice: ['forest', 'mountain'] },
  { sentence: 'I feel exercise is good for health.', translation: '운동이 건강에 좋다고 느껴요.', word: 'exercise', pronunciation: '엑서사이즈', practice: ['sport', 'fitness'] },
  { sentence: 'I hope we can travel together.', translation: '함께 여행할 수 있으면 좋겠어요.', word: 'travel', pronunciation: '트래블', practice: ['trip', 'journey'] },
  { sentence: 'I know sharing is caring.', translation: '나누는 것이 배려라는 것을 알아요.', word: 'sharing', pronunciation: '쉐어링', practice: ['giving', 'helping'] },
  { sentence: 'I wish I could fly like a bird.', translation: '새처럼 날 수 있으면 좋겠어요.', word: 'fly', pronunciation: '플라이', practice: ['soar', 'wing'] },
  { sentence: 'I hope tomorrow will be sunny.', translation: '내일 날씨가 좋으면 좋겠어요.', word: 'hope', pronunciation: '호프', practice: ['wish', 'dream'] },
  { sentence: 'I think teamwork is important.', translation: '나는 팀워크가 중요하다고 생각해요.', word: 'teamwork', pronunciation: '팀워크', practice: ['together', 'cooperate'] },
  { sentence: 'I believe everyone is equal.', translation: '나는 모든 사람이 평등하다고 믿어요.', word: 'equal', pronunciation: '이퀄', practice: ['same', 'fair'] },
  { sentence: 'I think learning is fun.', translation: '나는 배우는 것이 재미있다고 생각해요.', word: 'learning', pronunciation: '러닝', practice: ['studying', 'growing'] },
  { sentence: 'I feel music makes me happy.', translation: '음악이 나를 행복하게 한다고 느껴요.', word: 'music', pronunciation: '뮤직', practice: ['song', 'rhythm'] },
  { sentence: 'I believe hard work pays off.', translation: '나는 노력은 보답된다고 믿어요.', word: 'effort', pronunciation: '에포트', practice: ['work', 'try'] },
  { sentence: 'I think animals deserve love.', translation: '나는 동물도 사랑받을 자격이 있다고 생각해요.', word: 'deserve', pronunciation: '디저브', practice: ['earn', 'worthy'] },
  { sentence: 'I hope the world becomes cleaner.', translation: '세상이 더 깨끗해지면 좋겠어요.', word: 'cleaner', pronunciation: '클리너', practice: ['clean', 'fresh'] },
  { sentence: 'I think patience is important.', translation: '나는 인내가 중요하다고 생각해요.', word: 'patience', pronunciation: '페이션스', practice: ['wait', 'calm'] },
  { sentence: 'I believe kindness changes the world.', translation: '나는 친절이 세상을 바꾼다고 믿어요.', word: 'kindness', pronunciation: '카인드니스', practice: ['nice', 'generous'] },
];

const FIXED_ADVERBS: EnglishEntry[] = [
  { sentence: 'I always do my homework.', translation: '나는 항상 숙제를 해요.', word: 'always', pronunciation: '올웨이즈', practice: ['never', 'sometimes'] },
  { sentence: 'She never eats candy.', translation: '그녀는 절대 사탕을 안 먹어요.', word: 'never', pronunciation: '네버', practice: ['always', 'sometimes'] },
  { sentence: 'I sometimes play soccer.', translation: '나는 가끔 축구를 해요.', word: 'sometimes', pronunciation: '섬타임즈', practice: ['always', 'never'] },
  { sentence: 'He usually walks to school.', translation: '그는 보통 걸어서 학교에 가요.', word: 'usually', pronunciation: '유주얼리', practice: ['always', 'sometimes'] },
  { sentence: 'We often go to the library.', translation: '우리는 자주 도서관에 가요.', word: 'often', pronunciation: '오픈', practice: ['rarely', 'sometimes'] },
  { sentence: 'They seldom eat out.', translation: '그들은 거의 외식하지 않아요.', word: 'seldom', pronunciation: '셀덤', practice: ['rarely', 'never'] },
  { sentence: 'I already finished my work.', translation: '나는 이미 일을 끝냈어요.', word: 'already', pronunciation: '올레디', practice: ['yet', 'still'] },
  { sentence: 'She quickly ran to school.', translation: '그녀는 빨리 학교로 달렸어요.', word: 'quickly', pronunciation: '퀵리', practice: ['slowly', 'fast'] },
  { sentence: 'He carefully wrote his name.', translation: '그는 조심히 이름을 썼어요.', word: 'carefully', pronunciation: '케어풀리', practice: ['gently', 'slowly'] },
  { sentence: 'They happily played together.', translation: '그들은 행복하게 함께 놀았어요.', word: 'happily', pronunciation: '해필리', practice: ['gladly', 'joyfully'] },
  { sentence: 'I finally finished my homework.', translation: '나는 드디어 숙제를 끝냈어요.', word: 'finally', pronunciation: '파이널리', practice: ['at last', 'eventually'] },
  { sentence: 'She quietly read her book.', translation: '그녀는 조용히 책을 읽었어요.', word: 'quietly', pronunciation: '콰이엇리', practice: ['silently', 'softly'] },
  { sentence: 'We really enjoyed the trip.', translation: '우리는 정말 여행을 즐겼어요.', word: 'really', pronunciation: '리얼리', practice: ['truly', 'very'] },
  { sentence: 'He slowly walked home.', translation: '그는 천천히 집으로 걸었어요.', word: 'slowly', pronunciation: '슬로리', practice: ['quickly', 'gently'] },
  { sentence: 'I accidentally dropped my cup.', translation: '나는 실수로 컵을 떨어뜨렸어요.', word: 'accidentally', pronunciation: '액시덴털리', practice: ['mistake', 'oops'] },
];

const FIXED_CAN: EnglishEntry[] = [
  { sentence: 'Can you speak English?', translation: '영어를 할 수 있어요?', word: 'speak', pronunciation: '스피크', practice: ['talk', 'say'] },
  { sentence: 'Can you play the piano?', translation: '피아노를 칠 수 있어요?', word: 'piano', pronunciation: '피아노', practice: ['guitar', 'violin'] },
  { sentence: 'Can you ride a bicycle?', translation: '자전거를 탈 수 있어요?', word: 'ride', pronunciation: '라이드', practice: ['drive', 'pedal'] },
  { sentence: 'Can you cook dinner?', translation: '저녁을 만들 수 있어요?', word: 'dinner', pronunciation: '디너', practice: ['lunch', 'meal'] },
  { sentence: 'Can you swim in the ocean?', translation: '바다에서 수영할 수 있어요?', word: 'ocean', pronunciation: '오션', practice: ['sea', 'lake'] },
  { sentence: 'Can you run fast?', translation: '빨리 달릴 수 있어요?', word: 'fast', pronunciation: '패스트', practice: ['quick', 'speed'] },
  { sentence: 'Can you draw animals?', translation: '동물을 그릴 수 있어요?', word: 'draw', pronunciation: '드로', practice: ['paint', 'sketch'] },
  { sentence: 'Can you sing a song?', translation: '노래를 부를 수 있어요?', word: 'song', pronunciation: '송', practice: ['music', 'melody'] },
  { sentence: 'Can you count to one hundred?', translation: '백까지 셀 수 있어요?', word: 'count', pronunciation: '카운트', practice: ['number', 'add'] },
  { sentence: 'Can you read Korean?', translation: '한국어를 읽을 수 있어요?', word: 'Korean', pronunciation: '코리안', practice: ['English', 'language'] },
  { sentence: 'Can you jump high?', translation: '높이 점프할 수 있어요?', word: 'jump', pronunciation: '점프', practice: ['hop', 'leap'] },
  { sentence: 'Can you bake cookies?', translation: '쿠키를 구울 수 있어요?', word: 'bake', pronunciation: '베이크', practice: ['cook', 'oven'] },
  { sentence: 'Can you solve this puzzle?', translation: '이 퍼즐을 풀 수 있어요?', word: 'puzzle', pronunciation: '퍼즐', practice: ['solve', 'riddle'] },
  { sentence: 'Can you whistle?', translation: '휘파람을 불 수 있어요?', word: 'whistle', pronunciation: '위슬', practice: ['blow', 'sound'] },
  { sentence: 'Can you climb a tree?', translation: '나무에 오를 수 있어요?', word: 'climb', pronunciation: '클라임', practice: ['up', 'tree'] },
  { sentence: 'Can you fly a kite?', translation: '연을 날릴 수 있어요?', word: 'kite', pronunciation: '카이트', practice: ['wind', 'string'] },
  { sentence: 'Can you make a paper airplane?', translation: '종이비행기를 만들 수 있어요?', word: 'airplane', pronunciation: '에어플레인', practice: ['paper', 'fold'] },
  { sentence: 'Can you skip rope?', translation: '줄넘기할 수 있어요?', word: 'skip', pronunciation: '스킵', practice: ['jump', 'rope'] },
];

// ============================================================
// Generator Functions
// ============================================================

function makeEntry(word: W, tmpl: Tmpl): EnglishEntry {
  return {
    sentence: tmpl.s(word.w),
    translation: tmpl.t(word.k),
    word: word.w,
    pronunciation: word.p,
    practice: word.pr,
  };
}

function generateFromBank(rng: () => number, words: W[], templates: Tmpl[], entriesPerWord: number = 2): EnglishEntry[] {
  const entries: EnglishEntry[] = [];
  for (const word of words) {
    const used = new Set<number>();
    for (let i = 0; i < entriesPerWord && i < templates.length; i++) {
      let idx: number;
      do { idx = Math.floor(rng() * templates.length); } while (used.has(idx) && used.size < templates.length);
      used.add(idx);
      entries.push(makeEntry(word, templates[idx]));
    }
  }
  return entries;
}

function generateGrade3_4Entries(rng: () => number): EnglishEntry[] {
  const entries: EnglishEntry[] = [];

  // Greetings (direct sentences)
  for (const g of G34_GREETINGS) {
    entries.push({
      sentence: `${g.w.charAt(0).toUpperCase() + g.w.slice(1)}.`,
      translation: `${g.k}.`,
      word: g.w, pronunciation: g.p, practice: g.pr,
    });
  }

  // Colors - 2 templates each
  entries.push(...generateFromBank(rng, G34_COLORS, BASIC_TEMPLATES, 2));
  // Numbers
  for (const n of G34_NUMBERS) {
    const items = ['apples', 'books', 'pencils', 'friends', 'toys', 'balls', 'cats', 'dogs'];
    const itemsK = ['개의 사과가', '권의 책이', '개의 연필이', '명의 친구가', '개의 장난감이', '개의 공이', '마리의 고양이가', '마리의 강아지가'];
    const idx = Math.floor(rng() * items.length);
    entries.push({
      sentence: `I have ${n.w} ${items[idx]}.`,
      translation: `나는 ${n.k} ${itemsK[idx]} 있어요.`,
      word: n.w, pronunciation: n.p, practice: n.pr,
    });
  }

  // Animals - 2 templates
  entries.push(...generateFromBank(rng, G34_ANIMALS, BASIC_TEMPLATES, 2));
  // Family - 2 templates
  entries.push(...generateFromBank(rng, G34_FAMILY, FAMILY_TEMPLATES, 2));
  // Food - 2 templates
  entries.push(...generateFromBank(rng, G34_FOOD, BASIC_TEMPLATES, 2));
  // Body - 2 templates
  entries.push(...generateFromBank(rng, G34_BODY, BASIC_TEMPLATES, 2));
  // Daily actions - 2 templates
  entries.push(...generateFromBank(rng, G34_DAILY, ACTION_TEMPLATES, 2));
  // School items - 2 templates
  entries.push(...generateFromBank(rng, G34_SCHOOL, BASIC_TEMPLATES, 2));
  // Adjectives - 2 templates
  entries.push(...generateFromBank(rng, G34_ADJECTIVES, BASIC_TEMPLATES, 2));
  // Clothing - 2 templates
  const clothingTmpls: Tmpl[] = [
    { s: w => `I wear ${w}.`, t: k => `나는 ${k}을(를) 입어요.` },
    { s: w => `This ${w} is nice.`, t: k => `이 ${k}은(는) 멋져요.` },
    { s: w => `Put on your ${w}.`, t: k => `${k}을(를) 입으세요.` },
    { s: w => `I like this ${w}.`, t: k => `나는 이 ${k}이(가) 좋아요.` },
    { s: w => `Where are my ${w}?`, t: k => `내 ${k}이(가) 어디 있어요?` },
  ];
  entries.push(...generateFromBank(rng, G34_CLOTHING, clothingTmpls, 2));
  // Transport
  const transportTmpls: Tmpl[] = [
    { s: w => `I go by ${w}.`, t: k => `나는 ${k}로 가요.` },
    { s: w => `This is a ${w}.`, t: k => `이것은 ${k}이에요.` },
    { s: w => `I ride the ${w}.`, t: k => `나는 ${k}을(를) 타요.` },
    { s: w => `The ${w} is fast.`, t: k => `${k}은(는) 빨라요.` },
  ];
  entries.push(...generateFromBank(rng, G34_TRANSPORT, transportTmpls, 2));
  // Nature
  const natureTmpls: Tmpl[] = [
    { s: w => `I see the ${w}.`, t: k => `나는 ${k}을(를) 봐요.` },
    { s: w => `The ${w} is beautiful.`, t: k => `${k}은(는) 아름다워요.` },
    { s: w => `Look at the ${w}!`, t: k => `${k}을(를) 봐요!` },
    { s: w => `I like the ${w}.`, t: k => `나는 ${k}을(를) 좋아해요.` },
  ];
  entries.push(...generateFromBank(rng, G34_NATURE, natureTmpls, 2));
  // Positions (direct)
  for (const pos of G34_POSITIONS) {
    entries.push(makeEntry(pos, pickOne(rng, BASIC_TEMPLATES)));
  }
  // House items
  entries.push(...generateFromBank(rng, G34_HOUSE, BASIC_TEMPLATES, 2));
  // Commands
  entries.push(...FIXED_COMMANDS);

  return entries;
}

function generateGrade5_6Entries(rng: () => number): EnglishEntry[] {
  const entries: EnglishEntry[] = [];

  // Subjects - 2 templates
  const subjectTmpls: Tmpl[] = [
    { s: w => `I like ${w} class.`, t: k => `나는 ${k} 수업을 좋아해요.` },
    { s: w => `${w} is my favorite subject.`, t: k => `${k}은(는) 내가 가장 좋아하는 과목이에요.` },
    { s: w => `We study ${w} at school.`, t: k => `우리는 학교에서 ${k}을(를) 공부해요.` },
    { s: w => `${w} class is interesting.`, t: k => `${k} 수업은 재미있어요.` },
    { s: w => `I have ${w} on Monday.`, t: k => `월요일에 ${k} 수업이 있어요.` },
  ];
  entries.push(...generateFromBank(rng, G56_SUBJECTS, subjectTmpls, 2));
  // Weather
  entries.push(...generateFromBank(rng, G56_WEATHER, WEATHER_TEMPLATES, 2));
  // Hobbies
  entries.push(...generateFromBank(rng, G56_HOBBIES, HOBBY_TEMPLATES, 2));
  // Places
  entries.push(...generateFromBank(rng, G56_PLACES, INTERMEDIATE_TEMPLATES, 2));
  // Emotions
  entries.push(...generateFromBank(rng, G56_EMOTIONS, EMOTION_TEMPLATES, 2));
  // Time & Days
  const timeTmpls: Tmpl[] = [
    { s: w => `Today is ${w}.`, t: k => `오늘은 ${k}이에요.` },
    { s: w => `I like ${w}.`, t: k => `나는 ${k}을(를) 좋아해요.` },
    { s: w => `See you on ${w}.`, t: k => `${k}에 만나요.` },
    { s: w => `What do you do on ${w}?`, t: k => `${k}에 뭐 해요?` },
  ];
  entries.push(...generateFromBank(rng, G56_TIME, timeTmpls, 2));
  // Seasons & Months
  const seasonTmpls: Tmpl[] = [
    { s: w => `I like ${w}.`, t: k => `나는 ${k}을(를) 좋아해요.` },
    { s: w => `${w} is beautiful.`, t: k => `${k}은(는) 아름다워요.` },
    { s: w => `My birthday is in ${w}.`, t: k => `내 생일은 ${k}에 있어요.` },
    { s: w => `We have a holiday in ${w}.`, t: k => `${k}에 공휴일이 있어요.` },
  ];
  entries.push(...generateFromBank(rng, G56_SEASONS, seasonTmpls, 2));
  // Intermediate adjectives
  entries.push(...generateFromBank(rng, G56_INTERMEDIATE_ADJ, COMPARISON_TEMPLATES, 2));
  // Past tense
  const pastTmpls: Tmpl[] = [
    { s: w => `I ${w} yesterday.`, t: k => `나는 어제 ${k}.` },
    { s: w => `She ${w} last night.`, t: k => `그녀는 어젯밤에 ${k}.` },
    { s: w => `We ${w} together.`, t: k => `우리는 함께 ${k}.` },
    { s: w => `He ${w} in the park.`, t: k => `그는 공원에서 ${k}.` },
    { s: w => `They ${w} last weekend.`, t: k => `그들은 지난 주말에 ${k}.` },
  ];
  entries.push(...generateFromBank(rng, G56_PAST_TENSE, pastTmpls, 2));
  // Jobs
  entries.push(...generateFromBank(rng, G56_JOBS, JOB_TEMPLATES, 2));
  // Technology
  entries.push(...generateFromBank(rng, G56_TECHNOLOGY, BASIC_TEMPLATES, 2));
  // Health
  entries.push(...generateFromBank(rng, G56_HEALTH, BASIC_TEMPLATES, 2));

  // Fixed sentence collections
  entries.push(...FIXED_BECAUSE);
  entries.push(...FIXED_IF);
  entries.push(...FIXED_ROUTINE);
  entries.push(...FIXED_SHOULD);
  entries.push(...FIXED_WANT);
  entries.push(...FIXED_OPINION);
  entries.push(...FIXED_ADVERBS);
  entries.push(...FIXED_CAN);

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
    pool = generateGrade3_4Entries(rng);
  } else {
    pool = generateGrade5_6Entries(rng);
  }

  // Shuffle the pool
  pool = shuffle(rng, pool);

  return pool;
}
