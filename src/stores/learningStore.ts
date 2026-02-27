import { create } from 'zustand';
import type { Question, DailySet } from '@/types/database';
import type { QuestionState, EmotionData, ReadinessData } from '@/types/learning';

interface LearningState {
  currentSet: DailySet | null;
  questions: Question[];
  questionStates: QuestionState[];
  currentIndex: number;
  startedAt: Date | null;
  isCompleted: boolean;
  totalScore: number;
  emotionBefore: EmotionData | null;
  emotionAfter: EmotionData | null;
  readiness: ReadinessData | null;
  timeSpent: number;

  initSession: (set: DailySet, questions: Question[]) => void;
  setCurrentIndex: (index: number) => void;
  answerQuestion: (questionId: string, answer: unknown, isCorrect: boolean, score: number) => void;
  setEmotionBefore: (data: EmotionData) => void;
  setEmotionAfter: (data: EmotionData) => void;
  setReadiness: (data: ReadinessData) => void;
  completeSession: () => void;
  resetSession: () => void;
  incrementTime: () => void;
}

export const useLearningStore = create<LearningState>((set, get) => ({
  currentSet: null,
  questions: [],
  questionStates: [],
  currentIndex: 0,
  startedAt: null,
  isCompleted: false,
  totalScore: 0,
  emotionBefore: null,
  emotionAfter: null,
  readiness: null,
  timeSpent: 0,

  initSession: (dailySet, questions) => {
    set({
      currentSet: dailySet,
      questions,
      questionStates: questions.map((q) => ({
        questionId: q.id,
        answer: null,
        isCorrect: null,
        isAnswered: false,
        timeSpent: 0,
      })),
      currentIndex: 0,
      startedAt: new Date(),
      isCompleted: false,
      totalScore: 0,
      timeSpent: 0,
    });
  },

  setCurrentIndex: (index) => set({ currentIndex: index }),

  answerQuestion: (questionId, answer, isCorrect, score) => {
    set((state) => {
      const newStates = state.questionStates.map((qs) =>
        qs.questionId === questionId
          ? { ...qs, answer, isCorrect, isAnswered: true, timeSpent: state.timeSpent }
          : qs
      );
      return {
        questionStates: newStates,
        totalScore: state.totalScore + score,
      };
    });
  },

  setEmotionBefore: (data) => set({ emotionBefore: data }),
  setEmotionAfter: (data) => set({ emotionAfter: data }),
  setReadiness: (data) => set({ readiness: data }),

  completeSession: () => set({ isCompleted: true }),

  resetSession: () =>
    set({
      currentSet: null,
      questions: [],
      questionStates: [],
      currentIndex: 0,
      startedAt: null,
      isCompleted: false,
      totalScore: 0,
      emotionBefore: null,
      emotionAfter: null,
      readiness: null,
      timeSpent: 0,
    }),

  incrementTime: () => set((state) => ({ timeSpent: state.timeSpent + 1 })),
}));
