// Claude API wrapper for AI question generation
// Used both in Cloudflare Functions and for reference in local dev

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  id: string;
  content: Array<{
    type: 'text';
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface GeneratedQuestion {
  subject: string;
  question_type: string;
  title: string;
  content: Record<string, unknown>;
  answer: Record<string, unknown>;
  explanation: string;
  points: number;
  hint?: string;
  curriculum_standard_id?: string;
  metadata?: Record<string, unknown>;
}

// Subject-specific prompt templates
const SUBJECT_PROMPTS: Record<string, (grade: number, semester: number) => string> = {
  math: (grade, semester) => {
    const topics: Record<string, string> = {
      '1-1': '9까지의 수, 한 자리 수 덧셈과 뺄셈, 50까지의 수, 여러 가지 모양',
      '1-2': '100까지의 수, 덧셈과 뺄셈(2), 시계 보기, 여러 가지 모양(2)',
      '2-1': '세 자리 수, 두 자리 수 덧셈과 뺄셈, 시각과 시간, 분류하기',
      '2-2': '곱셈구구, 길이 재기, 그래프, 규칙 찾기',
      '3-1': '덧셈과 뺄셈(세 자리), 평면도형, 나눗셈, 곱셈, 길이와 시간',
      '3-2': '곱셈(두 자리), 나눗셈(두 자리), 원, 분수, 들이와 무게',
      '4-1': '큰 수, 각도, 곱셈과 나눗셈, 평면도형의 이동, 막대그래프',
      '4-2': '분수의 덧셈과 뺄셈, 삼각형, 소수의 덧셈과 뺄셈, 사각형, 꺾은선그래프',
      '5-1': '자연수의 혼합 계산, 약수와 배수, 규칙과 대응, 약분과 통분, 분수의 덧셈과 뺄셈',
      '5-2': '수의 범위와 어림, 분수의 곱셈, 합동과 대칭, 소수의 곱셈, 직육면체',
      '6-1': '분수의 나눗셈, 각기둥과 각뿔, 소수의 나눗셈, 비와 비율, 여러 가지 그래프',
      '6-2': '분수의 나눗셈(2), 소수의 나눗셈(2), 공간과 입체, 비례식과 비례배분, 원의 넓이',
    };
    const key = `${grade}-${semester}`;
    return `${grade}학년 ${semester}학기 수학: ${topics[key] || '교과 범위 내 문제'}
- 계산 문제 또는 서술형 문제
- 단계별 풀이 과정 포함
- 학년 수준에 적합한 난이도`;
  },

  spelling: (grade) => {
    if (grade <= 2) {
      return `맞춤법 (${grade}학년):
- 기본적인 받침 표기, 띄어쓰기
- 예: "먹었다" vs "먹겄다", "좋아요" vs "조아요"
- 두 문장 중 올바른 것을 선택`;
    }
    if (grade <= 4) {
      return `맞춤법 (${grade}학년):
- 사이시옷, 두음법칙, 받침 규칙
- 예: "나뭇잎" vs "나뭇닢", "열심히" vs "열심이"
- 헷갈리기 쉬운 맞춤법`;
    }
    return `맞춤법 (${grade}학년):
- 높임법, 피동/사동, 복잡한 띄어쓰기
- 관용어, 준말, 외래어 표기
- 실생활에서 자주 틀리는 표현`;
  },

  vocabulary: (grade) => {
    if (grade <= 2) {
      return `어휘 (${grade}학년):
- 일상생활 기본 낱말
- 뜻풀이 2개를 보고 낱말 맞추기
- 쉬운 힌트 제공`;
    }
    if (grade <= 4) {
      return `어휘 (${grade}학년):
- 교과서 필수 어휘
- 유의어, 반의어 활용
- 사자성어, 속담 포함 가능`;
    }
    return `어휘 (${grade}학년):
- 학술적 어휘, 교과 전문 용어
- 한자어 기반 어휘
- 문맥 속 어휘 추론`;
  },

  hanja: (grade) => {
    const levels: Record<string, string> = {
      '3': '기초 한자 50자: 大, 小, 人, 山, 水, 火, 木, 金, 土, 日, 月, 年 등',
      '4': '기초 한자 100자 확장: 학교, 가족, 자연 관련 한자',
      '5': '중급 한자 150자: 사회, 과학 관련 한자어',
      '6': '중급 한자 200자: 추상적 개념 한자어, 고사성어',
    };
    return `한자 (${grade}학년):
- ${levels[String(grade)] || '기초 한자'}
- 한자의 음과 뜻, 구성 원리
- 일상생활 한자어 활용`;
  },

  english: (grade) => {
    if (grade <= 4) {
      return `영어 (${grade}학년):
- 기초 인사, 자기소개
- 알파벳, 기본 단어 (동물, 색깔, 숫자, 과일)
- 간단한 문장 패턴: "I like ~", "This is ~"`;
    }
    return `영어 (${grade}학년):
- 일상 대화 표현
- 기초 문법 (be동사, 일반동사, 의문문)
- 간단한 읽기 지문`;
  },

  writing: (grade) => {
    if (grade <= 2) {
      return `글쓰기 (${grade}학년):
- 2~3문장 짧은 글쓰기
- 일기, 편지, 관찰 글
- 친숙한 주제 (가족, 동물, 음식, 놀이)`;
    }
    if (grade <= 4) {
      return `글쓰기 (${grade}학년):
- 5~7문장 글쓰기
- 설명문, 감상문, 경험담
- 문단 구성 연습`;
    }
    return `글쓰기 (${grade}학년):
- 한 문단 이상 글쓰기
- 논설문, 보고서, 창작
- 근거 제시와 논리적 구성`;
  },

  general_knowledge: (grade) => {
    if (grade <= 2) {
      return `상식 (${grade}학년):
- 기초 과학 (동물, 식물, 날씨, 계절)
- 기초 사회 (우리나라, 가족, 마을)
- 숫자/단위 상식 (1년=12개월, 1주일=7일)`;
    }
    if (grade <= 4) {
      return `상식 (${grade}학년):
- 과학 상식 (태양계, 생태계, 물질의 상태)
- 사회 상식 (지리, 역사 기초, 문화)
- 시사 상식 (환경, 건강)`;
    }
    return `상식 (${grade}학년):
- 심화 과학/사회 상식
- 세계 지리, 역사
- 시사, 경제, 환경 이슈`;
  },

  safety: (grade) => {
    if (grade <= 2) {
      return `안전 (${grade}학년):
- 교통안전 (신호등, 횡단보도)
- 생활안전 (불, 물, 전기)
- 학교안전 (계단, 교실)`;
    }
    if (grade <= 4) {
      return `안전 (${grade}학년):
- 재난안전 (지진, 화재 대피)
- 식품안전 (유통기한, 식중독)
- 인터넷 안전 (개인정보, 사이버 폭력)`;
    }
    return `안전 (${grade}학년):
- 응급처치 기초 (심폐소생술, 하임리히)
- 재난 대응 (태풍, 홍수, 지진)
- 디지털 리터러시 (가짜뉴스, 저작권)`;
  },

  science: (grade) => {
    const topics: Record<string, string> = {
      '5-1': '온도와 열, 태양계와 별, 용해와 용액, 다양한 생물과 우리 생활',
      '5-2': '생물과 환경, 날씨와 우리 생활, 물체의 운동, 산과 염기',
      '6-1': '지구와 달의 운동, 여러 가지 기체, 식물의 구조와 기능, 빛과 렌즈',
      '6-2': '전기의 이용, 계절의 변화, 연소와 소화, 우리 몸의 구조와 기능',
    };
    const key = `${grade}-${1}`;
    return `과학 (${grade}학년): ${topics[key] || '교과 범위 내 과학 문제'}
- 2022 개정 교육과정 기반
- 실험/관찰 기반 문제`;
  },

  social: (grade) => {
    const topics: Record<string, string> = {
      '5-1': '국토와 우리 생활, 인권 존중과 정의로운 사회',
      '5-2': '우리 경제의 성장과 발전, 우리 사회의 과제와 문화의 발전',
      '6-1': '우리나라의 정치 발전, 우리나라의 경제 발전',
      '6-2': '세계의 여러 나라들, 통일 한국의 미래와 지구촌의 평화',
    };
    const key = `${grade}-${1}`;
    return `사회 (${grade}학년): ${topics[key] || '교과 범위 내 사회 문제'}
- 2022 개정 교육과정 기반
- 지리, 역사, 일반 사회`;
  },
};

/**
 * Build a complete AI prompt for generating a daily set of questions.
 */
export function buildGenerationPrompt(
  grade: number,
  semester: number,
  sections: Array<{ subject: string; title: string; count: number }>
): string {
  const gradeGroup = grade <= 2 ? '1-2' : grade <= 4 ? '3-4' : '5-6';

  // Filter out non-AI sections
  const aiSections = sections.filter(
    (s) => s.subject !== 'emotion_check' && s.subject !== 'readiness_check'
  );

  const subjectDetails = aiSections.map((s) => {
    const promptFn = SUBJECT_PROMPTS[s.subject];
    const detail = promptFn ? promptFn(grade, semester) : `${s.subject}: 교과 수준에 적합한 문제`;
    return `### ${s.title} (${s.subject}) - ${s.count}문제\n${detail}`;
  }).join('\n\n');

  return `당신은 초등학교 ${grade}학년 ${semester}학기 (${gradeGroup}학년군) 학생을 위한 일일 학습 문제를 만드는 전문 교육 콘텐츠 생성자입니다.

2022 개정 교육과정에 기반하여 아래 과목별 가이드에 따라 문제를 생성해주세요.

## 과목별 문제 가이드

${subjectDetails}

## JSON 출력 형식
각 문제를 아래 형식의 JSON 객체로, 전체를 JSON 배열로 감싸서 출력하세요:

\`\`\`json
[
  {
    "subject": "과목코드",
    "question_type": "문제유형",
    "title": "문제 제목 (짧게)",
    "content": {
      "text": "문제 본문",
      "options": ["선택1", "선택2", ...],  // multiple_choice일 때
      "expression": "수식",               // calculation일 때
      "hints": ["힌트1"],                 // short_answer일 때
      "minLength": 20                     // writing_prompt일 때
    },
    "answer": {
      "value": "정답 (숫자/문자열/null)",
      "explanation": "해설"
    },
    "explanation": "전체 해설",
    "points": 10,
    "hint": "힌트 텍스트"
  }
]
\`\`\`

### question_type 목록:
- calculation: 계산 문제 (수학)
- multiple_choice: 객관식
- fill_blank: 빈칸 채우기
- short_answer: 단답형
- true_false: O/X 문제
- writing_prompt: 글쓰기
- drawing: 그리기/창의 과제
- dictation: 받아쓰기

### 주의사항:
1. ${grade}학년 ${semester}학기 수준에 정확히 맞출 것
2. 한국 2022 개정 교육과정 준수
3. 모든 텍스트는 한국어 (영어 과목 제외)
4. 문제마다 친절한 해설 포함
5. JSON 배열만 출력. 다른 텍스트 불필요
6. 위 과목 순서대로 출력`;
}

/**
 * Parse the AI response text into an array of generated questions.
 */
export function parseGeneratedQuestions(responseText: string): GeneratedQuestion[] {
  // Try to extract JSON from potential markdown code blocks
  const jsonMatch =
    responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
    responseText.match(/```\s*([\s\S]*?)\s*```/) ||
    responseText.match(/(\[[\s\S]*\])/);

  const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;

  const parsed = JSON.parse(jsonStr.trim());

  if (!Array.isArray(parsed)) {
    throw new Error('AI 응답이 JSON 배열이 아닙니다.');
  }

  // Validate and normalize each question
  return parsed.map((q: any, idx: number) => ({
    subject: q.subject || 'general_knowledge',
    question_type: q.question_type || 'multiple_choice',
    title: q.title || `문제 ${idx + 1}`,
    content: typeof q.content === 'object' ? q.content : { text: String(q.content) },
    answer: typeof q.answer === 'object' ? q.answer : { value: q.answer },
    explanation: q.explanation || '',
    points: q.points || 10,
    hint: q.hint || undefined,
    curriculum_standard_id: q.curriculum_standard_id || undefined,
    metadata: q.metadata || undefined,
  }));
}
