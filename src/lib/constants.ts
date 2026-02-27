export const APP_NAME = '아라하루';
export const APP_TAGLINE = '매일 아침, 알아가는 즐거움';
export const APP_DESCRIPTION = '초등 1~6학년 맞춤 일일학습 프로그램. 2022 개정 교육과정 기반 매일 30분 아침학습으로 학습 습관을 키워요.';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://araharu.pages.dev';

export const GRADES = [1, 2, 3, 4, 5, 6] as const;
export const SEMESTERS = [1, 2] as const;

export const GRADE_SET_COMPOSITION = {
  '1-2': {
    sections: [
      { subject: 'emotion_check', title: '오늘의 기분 체크', count: 1 },
      { subject: 'readiness_check', title: '준비물 확인', count: 1 },
      { subject: 'math', title: '오늘의 수놀이', count: 2 },
      { subject: 'writing', title: '오늘의 글밥', count: 1 },
      { subject: 'spelling', title: '오늘의 맞춤법', count: 1 },
      { subject: 'vocabulary', title: '오늘의 한글놀이', count: 1 },
      { subject: 'creative', title: '오늘의 그리기', count: 1 },
      { subject: 'korean', title: '마음 읽기', count: 1 },
      { subject: 'general_knowledge', title: '상식 퀴즈', count: 1 },
    ],
    totalQuestions: 10,
  },
  '3-4': {
    sections: [
      { subject: 'emotion_check', title: '오늘의 기분 체크', count: 1 },
      { subject: 'readiness_check', title: '준비물 확인', count: 1 },
      { subject: 'math', title: '오늘의 수놀이', count: 2 },
      { subject: 'writing', title: '오늘의 글밥', count: 1 },
      { subject: 'spelling', title: '오늘의 맞춤법', count: 1 },
      { subject: 'vocabulary', title: '오늘의 어휘', count: 1 },
      { subject: 'hanja', title: '오늘의 한자', count: 1 },
      { subject: 'english', title: '오늘의 English', count: 1 },
      { subject: 'creative', title: '대칭 그리기', count: 1 },
      { subject: 'general_knowledge', title: '상식 퀴즈', count: 1 },
      { subject: 'safety', title: '안전 퀴즈', count: 1 },
    ],
    totalQuestions: 12,
  },
  '5-6': {
    sections: [
      { subject: 'emotion_check', title: '오늘의 기분 체크', count: 1 },
      { subject: 'readiness_check', title: '준비물 확인', count: 1 },
      { subject: 'math', title: '오늘의 수놀이', count: 2 },
      { subject: 'writing', title: '오늘의 글밥', count: 1 },
      { subject: 'spelling', title: '오늘의 맞춤법', count: 1 },
      { subject: 'vocabulary', title: '오늘의 어휘', count: 1 },
      { subject: 'hanja', title: '오늘의 한자', count: 1 },
      { subject: 'english', title: '오늘의 English', count: 1 },
      { subject: 'science', title: '오늘의 과학', count: 1 },
      { subject: 'social', title: '오늘의 사회', count: 1 },
      { subject: 'creative', title: '대칭/도형 그리기', count: 1 },
      { subject: 'safety', title: '안전/건강 퀴즈', count: 1 },
    ],
    totalQuestions: 14,
  },
} as const;

export const PRICING = {
  free: {
    name: '무료',
    price: 0,
    features: ['하루 1세트 (일부 과목)', '기본 통계', '광고 표시'],
  },
  basic: {
    name: '베이직',
    price: 4900,
    features: ['하루 1세트 (전 과목)', '상세 통계', '광고 없음', '오답노트'],
  },
  premium: {
    name: '프리미엄',
    price: 9900,
    features: ['하루 무제한 세트', 'AI 맞춤 추천', '상세 리포트', '학부모 리포트', '뱃지 시스템 전체'],
  },
  school: {
    name: '학교',
    price: 39900,
    features: ['교사 대시보드', '학급 관리', '학생 전체 리포트', '과제 배정', 'API 연동'],
    perClass: true,
  },
} as const;

export const EMOTION_CATEGORIES = ['에너지', '기분', '건강', '의욕', '감정'] as const;

export const DEFAULT_READINESS_ITEMS = {
  '1-2': ['교과서', '공책', '필통', '알림장', '물통', '손수건'],
  '3-4': ['교과서', '공책', '필통', '알림장', '물통', '숙제'],
  '5-6': ['교과서', '공책', '필통', '알림장', '물통', '숙제', '체육복'],
} as const;
