export interface DailySetWithQuestions {
  set: import('./database').DailySet;
  questions: import('./database').Question[];
  record?: import('./database').LearningRecord | null;
}

export interface QuestionState {
  questionId: string;
  answer: any;
  isCorrect: boolean | null;
  isAnswered: boolean;
  score: number;
  timeSpent: number;
}

export interface LearningSessionState {
  setId: string;
  currentQuestionIndex: number;
  questions: QuestionState[];
  startedAt: Date;
  isCompleted: boolean;
  totalScore: number;
  emotionBefore: EmotionData | null;
  emotionAfter: EmotionData | null;
  readiness: ReadinessData | null;
}

export interface EmotionData {
  energy: number; // 0-100
  mood: number;
  health: number;
  motivation: number;
  feeling: number;
}

export interface ReadinessData {
  items: { name: string; checked: boolean }[];
}

export interface SubjectInfo {
  key: string;
  name: string;
  icon: string;
  color: string;
}

export const SUBJECTS: Record<string, SubjectInfo> = {
  math: { key: 'math', name: '수학', icon: '🔢', color: 'var(--color-subject-math)' },
  korean: { key: 'korean', name: '국어', icon: '📖', color: 'var(--color-subject-korean)' },
  spelling: { key: 'spelling', name: '맞춤법', icon: '✍️', color: 'var(--color-subject-spelling)' },
  vocabulary: { key: 'vocabulary', name: '어휘', icon: '📚', color: 'var(--color-subject-vocab)' },
  hanja: { key: 'hanja', name: '한자', icon: '漢', color: 'var(--color-subject-hanja)' },
  english: { key: 'english', name: '영어', icon: '🌏', color: 'var(--color-subject-english)' },
  writing: { key: 'writing', name: '글쓰기', icon: '✏️', color: 'var(--color-subject-writing)' },
  general_knowledge: { key: 'general_knowledge', name: '상식', icon: '💡', color: 'var(--color-subject-knowledge)' },
  safety: { key: 'safety', name: '안전', icon: '🛡️', color: 'var(--color-subject-safety)' },
  creative: { key: 'creative', name: '창의', icon: '🎨', color: 'var(--color-subject-creative)' },
  emotion_check: { key: 'emotion_check', name: '감정 체크', icon: '😊', color: '#FF8BA7' },
  readiness_check: { key: 'readiness_check', name: '준비물 확인', icon: '✅', color: '#4ECDC4' },
};

export const GRADE_COLORS: Record<number, string> = {
  1: 'var(--color-grade1)',
  2: 'var(--color-grade2)',
  3: 'var(--color-grade3)',
  4: 'var(--color-grade4)',
  5: 'var(--color-grade5)',
  6: 'var(--color-grade6)',
};

export const GRADE_NAMES: Record<number, string> = {
  1: '1학년', 2: '2학년', 3: '3학년',
  4: '4학년', 5: '5학년', 6: '6학년',
};
