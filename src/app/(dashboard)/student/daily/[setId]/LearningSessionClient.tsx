'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Send, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useLearningStore } from '@/stores/learningStore';
import { useDailySet } from '@/hooks/useDailySet';
import { useSound } from '@/hooks/useSound';
import { saveLearningRecord, saveQuestionResponses, checkAndAwardBadges } from '@/lib/local-storage';
import { generateId } from '@/lib/utils';
import QuestionRenderer from '@/components/learning/QuestionRenderer';
import ProgressBar from '@/components/learning/ProgressBar';
import Timer from '@/components/learning/Timer';
import ResultScreen from '@/components/learning/ResultScreen';
import Mascot from '@/components/learning/Mascot';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { LearningRecord, QuestionResponse } from '@/types/database';

export default function LearningSessionClient() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { dailySet, isLoading } = useDailySet();
  const { play } = useSound();
  const {
    questions, questionStates, currentIndex, startedAt, isCompleted, totalScore, timeSpent,
    initSession, setCurrentIndex, answerQuestion, completeSession, resetSession, incrementTime,
  } = useLearningStore();

  const [isPaused, setIsPaused] = useState(false);
  const [mascotState, setMascotState] = useState<'default' | 'happy' | 'thinking' | 'correct' | 'encourage'>('default');
  const [mascotMessage, setMascotMessage] = useState('');

  // Initialize session
  useEffect(() => {
    if (dailySet && !startedAt) {
      initSession(dailySet.set, dailySet.questions);
      play('start');
    }
  }, [dailySet, startedAt, initSession, play]);

  // Timer
  useEffect(() => {
    if (!startedAt || isPaused || isCompleted) return;
    const timer = setInterval(incrementTime, 1000);
    return () => clearInterval(timer);
  }, [startedAt, isPaused, isCompleted, incrementTime]);

  const currentQuestion = questions[currentIndex];
  const currentState = questionStates[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const allAnswered = questionStates.every((q) => q.isAnswered);

  // Derived sets for ProgressBar
  const answeredIndices = useMemo(() => {
    const set = new Set<number>();
    questionStates.forEach((qs, i) => {
      if (qs.isAnswered) set.add(i);
    });
    return set;
  }, [questionStates]);

  const correctIndices = useMemo(() => {
    const set = new Set<number>();
    questionStates.forEach((qs, i) => {
      if (qs.isCorrect) set.add(i);
    });
    return set;
  }, [questionStates]);

  const maxScore = dailySet?.set.total_points || questions.reduce((acc, q) => acc + q.points, 0);

  const handleAnswer = useCallback((answer: any) => {
    if (!currentQuestion || currentState?.isAnswered) return;

    let isCorrect = false;
    let score = 0;

    const qType = currentQuestion.question_type;
    const subject = currentQuestion.subject;
    const qAnswer = currentQuestion.answer;

    // Non-graded types
    if (qType === 'emotion_check' || qType === 'readiness_check' || subject === 'writing' || subject === 'creative') {
      isCorrect = true;
      score = currentQuestion.points;
    } else {
      // Determine correct answer based on subject
      let correctVal: string = '';

      switch (subject) {
        case 'math':
          correctVal = String(qAnswer?.correct ?? qAnswer?.answer ?? qAnswer?.text ?? '');
          isCorrect = String(answer).trim() === correctVal.trim();
          break;
        case 'spelling':
          // SpellingQuestion returns 1 or 2, answer.correct is 0-based index
          correctVal = String(qAnswer?.correct ?? '');
          isCorrect = String(Number(answer) - 1) === correctVal || String(answer) === correctVal;
          break;
        case 'vocabulary':
          correctVal = String(qAnswer?.correct ?? qAnswer?.text ?? qAnswer?.answer ?? '');
          isCorrect = String(answer).trim() === correctVal.trim();
          break;
        case 'hanja':
          correctVal = String(qAnswer?.correct ?? qAnswer?.reading ?? qAnswer?.text ?? '');
          isCorrect = String(answer).trim() === correctVal.trim();
          break;
        case 'english':
          correctVal = String(qAnswer?.correct ?? qAnswer?.word ?? qAnswer?.text ?? '');
          isCorrect = String(answer).trim().toLowerCase() === correctVal.trim().toLowerCase();
          break;
        default:
          correctVal = String(qAnswer?.correct ?? qAnswer?.text ?? qAnswer?.answer ?? '');
          isCorrect = String(answer).trim() === correctVal.trim();
      }

      score = isCorrect ? currentQuestion.points : 0;
    }

    answerQuestion(currentQuestion.id, answer, isCorrect, score);

    // Mascot feedback
    const isSpecial = qType === 'emotion_check' || qType === 'readiness_check' || subject === 'writing' || subject === 'creative';
    if (isSpecial) {
      setMascotState('happy');
      setMascotMessage('잘했어요!');
    } else if (isCorrect) {
      setMascotState('correct');
      setMascotMessage('정답! 대단해요!');
      play('correct');
    } else {
      setMascotState('encourage');
      setMascotMessage('괜찮아요, 다음엔 맞출 수 있어요!');
      play('wrong');
    }

    setTimeout(() => {
      setMascotState('default');
      setMascotMessage('');
    }, 3000);
  }, [currentQuestion, currentState, answerQuestion, play]);

  const handleComplete = useCallback(() => {
    if (!user || !dailySet) return;

    const finalScore = useLearningStore.getState().totalScore;

    const recordId = generateId();
    const record: LearningRecord = {
      id: recordId,
      student_id: user.id,
      daily_set_id: dailySet.set.id,
      class_id: null,
      started_at: startedAt?.toISOString() || new Date().toISOString(),
      completed_at: new Date().toISOString(),
      total_score: finalScore,
      max_score: dailySet.set.total_points,
      time_spent_seconds: timeSpent,
      is_completed: true,
      emotion_before: null,
      emotion_after: null,
      readiness: null,
      created_at: new Date().toISOString(),
    };
    saveLearningRecord(record);

    const responses: QuestionResponse[] = questionStates.map((qs, i) => ({
      id: generateId(),
      learning_record_id: recordId,
      question_id: qs.questionId,
      student_answer: JSON.stringify(qs.answer),
      is_correct: qs.isCorrect,
      score: qs.isCorrect ? questions[i].points : 0,
      time_spent_seconds: qs.timeSpent,
      attempts: 1,
      created_at: new Date().toISOString(),
    }));
    saveQuestionResponses(responses);

    checkAndAwardBadges(user.id);
    completeSession();
    play('complete');
  }, [user, dailySet, startedAt, timeSpent, questionStates, questions, completeSession, play]);

  const handleRetry = useCallback(() => {
    if (dailySet) {
      resetSession();
      initSession(dailySet.set, dailySet.questions);
      setMascotState('default');
      setMascotMessage('다시 도전해봐요!');
      play('start');
    }
  }, [dailySet, resetSession, initSession, play]);

  const handleGoHome = useCallback(() => {
    router.push('/student/');
  }, [router]);

  const handleNavigate = useCallback((index: number) => {
    setCurrentIndex(index);
  }, [setCurrentIndex]);

  if (isLoading || !currentQuestion) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="학습을 준비하고 있어요..." />
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background py-6 px-4">
        <ResultScreen
          questions={questions}
          correctIndices={correctIndices}
          answeredIndices={answeredIndices}
          totalScore={totalScore}
          maxScore={maxScore}
          elapsedSeconds={timeSpent}
          onRetry={handleRetry}
          onGoHome={handleGoHome}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/student/')}
              className="gap-1 text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              나가기
            </Button>
            <Timer
              onTick={() => {}}
              paused={isPaused}
            />
          </div>
          <ProgressBar
            questions={questions}
            currentIndex={currentIndex}
            answeredIndices={answeredIndices}
            correctIndices={correctIndices}
            onNavigate={handleNavigate}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <QuestionRenderer
              key={currentQuestion.id}
              question={currentQuestion}
              onAnswer={handleAnswer}
              showResult={!!currentState?.isAnswered}
              isCorrect={currentState?.isCorrect ?? null}
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="sticky bottom-0 z-40 bg-background/95 backdrop-blur-sm border-t px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => handleNavigate(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="gap-1 rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
            이전
          </Button>

          {/* Mascot in center */}
          <div className="flex-shrink-0">
            <Mascot
              state={mascotState}
              message={mascotMessage}
              size={50}
            />
          </div>

          {allAnswered ? (
            <Button
              onClick={handleComplete}
              className="gap-1 rounded-xl bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4" />
              제출하기
            </Button>
          ) : isLastQuestion ? (
            <Button variant="outline" disabled className="rounded-xl">
              모든 문제를 풀어주세요
            </Button>
          ) : (
            <Button
              onClick={() => handleNavigate(currentIndex + 1)}
              className="gap-1 rounded-xl"
            >
              다음
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
