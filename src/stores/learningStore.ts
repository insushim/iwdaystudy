import { create } from "zustand";
import type { Question, DailySet } from "@/types/database";
import type {
  QuestionState,
  EmotionData,
  ReadinessData,
} from "@/types/learning";

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

  // Review phase (Duolingo-style wrong answer review)
  isReviewMode: boolean;
  showReviewIntro: boolean;
  reviewQueue: number[];
  reviewIndex: number;
  reviewCorrected: number[];

  initSession: (set: DailySet, questions: Question[]) => void;
  setCurrentIndex: (index: number) => void;
  answerQuestion: (
    questionId: string,
    answer: unknown,
    isCorrect: boolean,
    score: number,
  ) => void;
  setEmotionBefore: (data: EmotionData) => void;
  setEmotionAfter: (data: EmotionData) => void;
  setReadiness: (data: ReadinessData) => void;
  completeSession: () => void;
  resetSession: () => void;
  incrementTime: () => void;

  startReview: (wrongIndices: number[]) => void;
  dismissReviewIntro: () => void;
  advanceReview: (isCorrect: boolean) => void;
  skipReview: () => void;
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

  isReviewMode: false,
  showReviewIntro: false,
  reviewQueue: [],
  reviewIndex: 0,
  reviewCorrected: [],

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
      isReviewMode: false,
      showReviewIntro: false,
      reviewQueue: [],
      reviewIndex: 0,
      reviewCorrected: [],
    });
  },

  setCurrentIndex: (index) => set({ currentIndex: index }),

  answerQuestion: (questionId, answer, isCorrect, score) => {
    set((state) => {
      const newStates = state.questionStates.map((qs) =>
        qs.questionId === questionId
          ? {
              ...qs,
              answer,
              isCorrect,
              isAnswered: true,
              timeSpent: state.timeSpent,
            }
          : qs,
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
      isReviewMode: false,
      showReviewIntro: false,
      reviewQueue: [],
      reviewIndex: 0,
      reviewCorrected: [],
    }),

  incrementTime: () => set((state) => ({ timeSpent: state.timeSpent + 1 })),

  // ── Review actions ──
  startReview: (wrongIndices) =>
    set({
      showReviewIntro: true,
      isReviewMode: false,
      reviewQueue: wrongIndices,
      reviewIndex: 0,
      reviewCorrected: [],
    }),

  dismissReviewIntro: () =>
    set({
      showReviewIntro: false,
      isReviewMode: true,
    }),

  advanceReview: (isCorrect) => {
    const state = get();
    const originalIndex = state.reviewQueue[state.reviewIndex];
    const newCorrected = isCorrect
      ? [...state.reviewCorrected, originalIndex]
      : state.reviewCorrected;

    const nextIndex = state.reviewIndex + 1;

    if (nextIndex >= state.reviewQueue.length) {
      // 아직 틀린 문제가 남아있으면 다시 반복
      const stillWrong = state.reviewQueue.filter(
        (idx) => !newCorrected.includes(idx),
      );
      if (stillWrong.length > 0) {
        // 틀린 문제만 다시 큐에 넣어서 반복
        set({
          reviewCorrected: newCorrected,
          reviewQueue: stillWrong,
          reviewIndex: 0,
        });
      } else {
        // 전부 맞춤 → 복습 완료
        set({
          reviewCorrected: newCorrected,
          reviewIndex: nextIndex,
          isReviewMode: false,
          isCompleted: true,
        });
      }
    } else {
      set({
        reviewCorrected: newCorrected,
        reviewIndex: nextIndex,
      });
    }
  },

  skipReview: () =>
    set({
      showReviewIntro: false,
      isReviewMode: false,
      isCompleted: true,
    }),
}));
