'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Send, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useLearningStore } from '@/stores/learningStore';
import { useDailySet } from '@/hooks/useDailySet';
import { useSound } from '@/hooks/useSound';
import { saveLearningRecord, saveQuestionResponses, checkAndAwardBadges, getRecordForSet } from '@/lib/local-storage';
import { generateId } from '@/lib/utils';
import { evaluateWriting } from '@/lib/writing-evaluator';
import QuestionRenderer from '@/components/learning/QuestionRenderer';
import ProgressBar from '@/components/learning/ProgressBar';
import Timer from '@/components/learning/Timer';
import ResultScreen from '@/components/learning/ResultScreen';
import Mascot from '@/components/learning/Mascot';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { LearningRecord, QuestionResponse } from '@/types/database';

export default function LearningSessionClient() {
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
  const [alreadyDoneToday, setAlreadyDoneToday] = useState(false);

  // Check if already completed today
  useEffect(() => {
    if (user && dailySet) {
      const record = getRecordForSet(user.id, dailySet.set.id);
      if (record?.is_completed) {
        setAlreadyDoneToday(true);
      }
    }
  }, [user, dailySet]);

  // Initialize session
  useEffect(() => {
    if (dailySet && !startedAt && !alreadyDoneToday) {
      initSession(dailySet.set, dailySet.questions);
      play('start');
    }
  }, [dailySet, startedAt, alreadyDoneToday, initSession, play]);

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

  const handleAnswer = useCallback((answer: unknown) => {
    if (!currentQuestion || currentState?.isAnswered) return;

    let isCorrect = false;
    let score = 0;

    const qType = currentQuestion.question_type;
    const subject = currentQuestion.subject;
    const qAnswer = currentQuestion.answer;

    // Non-graded types
    if (qType === 'emotion_check' || qType === 'readiness_check' || subject === 'creative') {
      isCorrect = true;
      score = currentQuestion.points;
    } else if (subject === 'writing') {
      // 코드 기반 글쓰기 평가 (API 없음, 외부 전송 없음)
      const minChars = currentQuestion.content?.min_chars || currentQuestion.content?.minChars || 20;
      const evalResult = evaluateWriting(String(answer), minChars);
      isCorrect = true;
      score = evalResult.score;
      // 마스코트 메시지에 별점 반영
      setMascotState(evalResult.stars >= 4 ? 'correct' : evalResult.stars >= 3 ? 'happy' : 'encourage');
      setMascotMessage(evalResult.feedback);
      setTimeout(() => { setMascotState('default'); setMascotMessage(''); }, 3500);
      answerQuestion(currentQuestion.id, answer, true, score);
      return;
    } else {
      // Determine correct answer based on subject
      let correctVal: string = '';

      switch (subject) {
        case 'math':
          correctVal = String(qAnswer?.correct ?? qAnswer?.answer ?? qAnswer?.text ?? '');
          isCorrect = String(answer).trim() === correctVal.trim();
          break;
        case 'spelling':
          correctVal = String(qAnswer?.correct ?? qAnswer?.text ?? '');
          isCorrect = String(answer).trim() === correctVal.trim();
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

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="학습을 준비하고 있어요..." />
      </div>
    );
  }

  if (alreadyDoneToday) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <Mascot state="happy" message="오늘도 최고야!" size={100} />
          <h2 className="text-2xl font-bold mt-4 mb-2">오늘 학습 완료!</h2>
          <p className="text-muted-foreground mb-6">내일 새로운 학습이 기다리고 있어요.</p>
          <Button onClick={() => router.push('/student/')} className="rounded-xl px-8">홈으로</Button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
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

  const NavButtons = ({ showMascot = false }: { showMascot?: boolean }) => (
    <>
      <Button
        variant="outline"
        onClick={() => handleNavigate(currentIndex - 1)}
        disabled={currentIndex === 0}
        className="gap-1 rounded-xl"
      >
        <ChevronLeft className="h-4 w-4" />
        이전
      </Button>

      {showMascot && (
        <div className="flex-shrink-0">
          <Mascot state={mascotState} message={mascotMessage} size={50} />
        </div>
      )}

      {allAnswered ? (
        <Button onClick={handleComplete} className="gap-1 rounded-xl bg-green-600 hover:bg-green-700">
          <Send className="h-4 w-4" />
          제출하기
        </Button>
      ) : isLastQuestion ? (
        <Button variant="outline" disabled className="rounded-xl">
          모든 문제를 풀어주세요
        </Button>
      ) : currentState?.isAnswered ? (
        <Button onClick={() => handleNavigate(currentIndex + 1)} className="gap-1 rounded-xl">
          다음
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <Button variant="outline" disabled className="rounded-xl text-muted-foreground">
          문제를 풀어주세요
        </Button>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="max-w-7xl mx-auto">
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
            <Timer onTick={() => {}} paused={isPaused} />
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
      <div className="flex-1 py-4 px-4 pb-24 lg:pb-8">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <QuestionRenderer
              key={currentQuestion.id}
              question={currentQuestion}
              onAnswer={handleAnswer}
              showResult={!!currentState?.isAnswered}
              isCorrect={currentState?.isCorrect ?? null}
            />
          </AnimatePresence>

          {/* Desktop inline navigation */}
          <div className="hidden lg:flex items-center justify-between mt-6">
            <NavButtons />
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <div className="lg:hidden sticky bottom-0 z-40 bg-background/95 backdrop-blur-sm border-t px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <NavButtons showMascot />
        </div>
      </div>
    </div>
  );
}
