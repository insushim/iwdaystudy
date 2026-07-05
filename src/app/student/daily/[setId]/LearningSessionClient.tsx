"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  ArrowLeft,
  RotateCcw,
  Clock,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useLearningStore } from "@/stores/learningStore";
import { useDailySet } from "@/hooks/useDailySet";
import { useSound } from "@/hooks/useSound";
import {
  saveLearningRecord,
  saveQuestionResponses,
  checkAndAwardBadges,
  getRecordForSet,
  getParentTimeSettings,
  getChildTimeToday,
  addChildTimeToday,
  type ParentTimeSettings,
} from "@/lib/local-storage";
import { generateId } from "@/lib/utils";
import { evaluateWriting } from "@/lib/writing-evaluator";
import QuestionRenderer from "@/components/learning/QuestionRenderer";
import ProgressBar from "@/components/learning/ProgressBar";
import Timer from "@/components/learning/Timer";
import ResultScreen from "@/components/learning/ResultScreen";
import Mascot from "@/components/learning/Mascot";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import type {
  LearningRecord,
  QuestionResponse,
  Question,
} from "@/types/database";

// 글쓰기 문제가 복습 큐에 들어갈 점수 기준 (10점 만점 중 이 미만이면 다시 풀게 함)
const WRITING_REVIEW_THRESHOLD = 5;

// ── Helper: evaluate a graded question answer ──
function evaluateGradedAnswer(question: Question, answer: unknown): boolean {
  const qAnswer = question.answer;
  const subject = question.subject;
  let correctVal = "";

  switch (subject) {
    case "math":
      correctVal = String(
        qAnswer?.correct ?? qAnswer?.answer ?? qAnswer?.text ?? "",
      );
      return String(answer).trim() === correctVal.trim();
    case "spelling":
      correctVal = String(qAnswer?.correct ?? qAnswer?.text ?? "");
      return String(answer).trim() === correctVal.trim();
    case "vocabulary":
      correctVal = String(
        qAnswer?.correct ?? qAnswer?.text ?? qAnswer?.answer ?? "",
      );
      return String(answer).trim() === correctVal.trim();
    case "hanja":
      correctVal = String(
        qAnswer?.correct ?? qAnswer?.reading ?? qAnswer?.text ?? "",
      );
      return String(answer).trim() === correctVal.trim();
    case "english":
      correctVal = String(
        qAnswer?.correct ?? qAnswer?.word ?? qAnswer?.text ?? "",
      );
      return (
        String(answer).trim().toLowerCase() === correctVal.trim().toLowerCase()
      );
    default:
      correctVal = String(
        qAnswer?.correct ?? qAnswer?.text ?? qAnswer?.answer ?? "",
      );
      return String(answer).trim() === correctVal.trim();
  }
}

export default function LearningSessionClient() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { dailySet, isLoading } = useDailySet();
  const { play } = useSound();
  const {
    questions,
    questionStates,
    currentIndex,
    startedAt,
    isCompleted,
    totalScore,
    timeSpent,
    initSession,
    setCurrentIndex,
    answerQuestion,
    completeSession,
    resetSession,
    incrementTime,
    // Review state
    isReviewMode,
    showReviewIntro,
    reviewQueue,
    reviewIndex,
    reviewCorrected,
    startReview,
    dismissReviewIntro,
    advanceReview,
    skipReview,
  } = useLearningStore();

  const [isPaused, setIsPaused] = useState(false);
  const [mascotState, setMascotState] = useState<
    "default" | "happy" | "thinking" | "correct" | "encourage"
  >("default");
  const [mascotMessage, setMascotMessage] = useState("");
  const [alreadyDoneToday, setAlreadyDoneToday] = useState(false);

  // Time management state
  const [timeSettings, setTimeSettings] = useState<ParentTimeSettings | null>(
    null,
  );
  const [outsideAllowedHours, setOutsideAllowedHours] = useState(false);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [timeWarning, setTimeWarning] = useState(false);
  const [timeRemainingMin, setTimeRemainingMin] = useState<number | null>(null);

  // Load parent time settings
  useEffect(() => {
    if (user?.parent_id) {
      const settings = getParentTimeSettings(user.parent_id);
      // Only apply if parent has actually configured limits (non-default)
      if (
        settings.daily_time_limit_minutes > 0 ||
        settings.allowed_start_hour !== 6 ||
        settings.allowed_end_hour !== 22
      ) {
        setTimeSettings(settings);
      }
    }
  }, [user]);

  // Check time constraints
  useEffect(() => {
    if (!timeSettings || !user) return;

    const checkTime = () => {
      const now = new Date();
      const hour = now.getHours();

      // Check allowed hours
      if (
        hour < timeSettings.allowed_start_hour ||
        hour >= timeSettings.allowed_end_hour
      ) {
        setOutsideAllowedHours(true);
      } else {
        setOutsideAllowedHours(false);
      }

      // Check daily limit
      if (timeSettings.daily_time_limit_minutes > 0) {
        const usedMinutes = getChildTimeToday(user.id);
        const remaining = timeSettings.daily_time_limit_minutes - usedMinutes;
        setTimeRemainingMin(Math.max(0, Math.round(remaining)));

        if (remaining <= 0) {
          setDailyLimitReached(true);
          setTimeWarning(false);
        } else if (remaining <= timeSettings.warning_before_minutes) {
          setTimeWarning(true);
          setDailyLimitReached(false);
        } else {
          setTimeWarning(false);
          setDailyLimitReached(false);
        }
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 30000); // check every 30s
    return () => clearInterval(interval);
  }, [timeSettings, user]);

  // Review phase local state
  const [reviewAnswered, setReviewAnswered] = useState(false);
  const [reviewIsCorrect, setReviewIsCorrect] = useState(false);

  // Reset review answer state when review question changes
  useEffect(() => {
    setReviewAnswered(false);
    setReviewIsCorrect(false);
  }, [reviewIndex]);

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
      play("start");
    }
  }, [dailySet, startedAt, alreadyDoneToday, initSession, play]);

  // Timer
  useEffect(() => {
    if (!startedAt || isPaused || isCompleted) return;
    const timer = setInterval(incrementTime, 1000);
    return () => clearInterval(timer);
  }, [startedAt, isPaused, isCompleted, incrementTime]);

  // 웨일북 등 터치 기기에서 오른쪽 스와이프 → 브라우저 뒤로가기 방지
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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

  const maxScore =
    dailySet?.set.total_points ||
    questions.reduce((acc, q) => acc + q.points, 0);

  const handleAnswer = useCallback(
    (answer: unknown, evalScore?: number) => {
      if (!currentQuestion || currentState?.isAnswered) return;

      let isCorrect = false;
      let score = 0;

      const qType = currentQuestion.question_type;
      const subject = currentQuestion.subject;

      // Non-graded types
      if (
        qType === "emotion_check" ||
        qType === "readiness_check" ||
        subject === "creative"
      ) {
        isCorrect = true;
        score = currentQuestion.points;
      } else if (subject === "writing") {
        // 코드 기반 글쓰기 평가 (API 없음, 외부 전송 없음)
        // WritingPrompt가 화면에 보여준 최종 점수(monotonic 보정 포함)를 우선 사용
        // — 여기서 재평가하면 보정 이력이 사라져 표시 점수와 저장 점수가 어긋난다.
        const minChars =
          currentQuestion.content?.min_chars ||
          currentQuestion.content?.minChars ||
          20;
        const evalResult = evaluateWriting(String(answer), minChars, {
          prompt:
            currentQuestion.content?.prompt || currentQuestion.content?.text,
        });
        isCorrect = true;
        score = typeof evalScore === "number" ? evalScore : evalResult.score;
        // 마스코트 메시지에 별점 반영 (저장 점수 기준)
        const mascotStars =
          score <= 2 ? 1 : score <= 4 ? 2 : score <= 6 ? 3 : score <= 8 ? 4 : 5;
        setMascotState(
          mascotStars >= 4 ? "correct" : mascotStars >= 3 ? "happy" : "encourage",
        );
        setMascotMessage(evalResult.feedback);
        setTimeout(() => {
          setMascotState("default");
          setMascotMessage("");
        }, 3500);
        answerQuestion(currentQuestion.id, answer, true, score);
        return;
      } else {
        // Evaluate graded question
        isCorrect = evaluateGradedAnswer(currentQuestion, answer);
        score = isCorrect ? currentQuestion.points : 0;
      }

      answerQuestion(currentQuestion.id, answer, isCorrect, score);

      // Mascot feedback
      const isSpecial =
        qType === "emotion_check" ||
        qType === "readiness_check" ||
        subject === "writing" ||
        subject === "creative";
      if (isSpecial) {
        setMascotState("happy");
        setMascotMessage("잘했어요!");
      } else if (isCorrect) {
        setMascotState("correct");
        setMascotMessage("정답! 대단해요!");
        play("correct");
      } else {
        setMascotState("encourage");
        setMascotMessage("괜찮아요, 다음엔 맞출 수 있어요!");
        play("wrong");
      }

      setTimeout(() => {
        setMascotState("default");
        setMascotMessage("");
      }, 3000);
    },
    [currentQuestion, currentState, answerQuestion, play],
  );

  // ── Review answer handler ──
  const handleReviewAnswer = useCallback(
    (answer: unknown, evalScore?: number) => {
      if (reviewAnswered) return;

      const originalIndex = reviewQueue[reviewIndex];
      const question = questions[originalIndex];

      let isCorrect = false;
      if (question.subject === "writing") {
        // 글쓰기는 WritingPrompt가 보여준 최종 점수(monotonic 보정 포함) 우선 사용
        const minChars =
          question.content?.min_chars || question.content?.minChars || 20;
        const score =
          typeof evalScore === "number"
            ? evalScore
            : evaluateWriting(String(answer), minChars, {
                prompt: question.content?.prompt || question.content?.text,
              }).score;
        isCorrect = score >= WRITING_REVIEW_THRESHOLD;
        // 재시도에서 기존 점수보다 높으면 갱신
        const prevScore = questionStates[originalIndex]?.score ?? 0;
        if (score > prevScore) {
          answerQuestion(question.id, answer, true, score);
        }
      } else {
        isCorrect = evaluateGradedAnswer(question, answer);
      }

      setReviewAnswered(true);
      setReviewIsCorrect(isCorrect);

      if (isCorrect) {
        play("correct");
        setMascotState("correct");
        setMascotMessage("맞았어요! 복습 효과 만점!");
      } else {
        play("wrong");
        setMascotState("encourage");
        setMascotMessage(
          question.subject === "writing"
            ? "조금 더 길고 자세하게 써봐요!"
            : "정답을 잘 기억해둬요!",
        );
      }

      setTimeout(() => {
        setMascotState("default");
        setMascotMessage("");
      }, 3000);
    },
    [
      reviewAnswered,
      reviewQueue,
      reviewIndex,
      questions,
      questionStates,
      answerQuestion,
      play,
    ],
  );

  // Advance to next review question
  const handleReviewAdvance = useCallback(() => {
    advanceReview(reviewIsCorrect);
    // Play complete sound when review finishes
    if (reviewIndex + 1 >= reviewQueue.length) {
      play("complete");
    }
  }, [advanceReview, reviewIsCorrect, reviewIndex, reviewQueue.length, play]);

  const handleComplete = useCallback(() => {
    if (!user || !dailySet) return;

    const finalScore = useLearningStore.getState().totalScore;
    const states = useLearningStore.getState().questionStates;

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

    const responses: QuestionResponse[] = states.map((qs) => ({
      id: generateId(),
      learning_record_id: recordId,
      question_id: qs.questionId,
      student_answer: JSON.stringify(qs.answer),
      is_correct: qs.isCorrect,
      score: qs.score,
      time_spent_seconds: qs.timeSpent,
      attempts: 1,
      created_at: new Date().toISOString(),
    }));
    saveQuestionResponses(responses);
    checkAndAwardBadges(user.id);

    // Track time spent for parental controls
    if (timeSettings && timeSettings.daily_time_limit_minutes > 0) {
      addChildTimeToday(user.id, Math.ceil(timeSpent / 60));
    }

    // Collect wrong answer indices
    // - 채점형(math, spelling, vocab, hanja, english): isCorrect=false
    // - 글쓰기(writing): score < WRITING_REVIEW_THRESHOLD 이면 재시도
    const wrongIndices = questions
      .map((q, i) => ({ q, i, qs: states[i] }))
      .filter(({ q, qs }) => {
        if (["emotion_check", "readiness_check"].includes(q.question_type))
          return false;
        if (q.subject === "creative") return false;
        if (!qs?.isAnswered) return false;

        if (q.subject === "writing") {
          return (qs.score ?? 0) < WRITING_REVIEW_THRESHOLD;
        }
        return !qs.isCorrect;
      })
      .map(({ i }) => i);

    if (wrongIndices.length > 0) {
      // Enter review phase (Duolingo-style)
      startReview(wrongIndices);
    } else {
      completeSession();
      play("complete");
    }
  }, [
    user,
    dailySet,
    startedAt,
    timeSpent,
    questions,
    completeSession,
    startReview,
    play,
  ]);

  const handleRetry = useCallback(() => {
    if (dailySet) {
      resetSession();
      initSession(dailySet.set, dailySet.questions);
      setMascotState("default");
      setMascotMessage("다시 도전해봐요!");
      play("start");
    }
  }, [dailySet, resetSession, initSession, play]);

  const handleGoHome = useCallback(() => {
    router.push("/student/");
  }, [router]);

  const handleNavigate = useCallback(
    (index: number) => {
      setCurrentIndex(index);
    },
    [setCurrentIndex],
  );

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
          <p className="text-muted-foreground mb-6">
            내일 새로운 학습이 기다리고 있어요.
          </p>
          <Button
            onClick={() => router.push("/student/")}
            className="rounded-xl px-8"
          >
            홈으로
          </Button>
        </div>
      </div>
    );
  }

  // Time-based blocking screens
  if (outsideAllowedHours && timeSettings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <Mascot state="default" message="아직은 쉬는 시간이에요" size={100} />
          <h2 className="text-2xl font-bold mt-4 mb-2">
            지금은 학습 시간이 아니에요
          </h2>
          <p className="text-muted-foreground mb-6">
            학습 가능 시간:{" "}
            {String(timeSettings.allowed_start_hour).padStart(2, "0")}:00 ~{" "}
            {String(timeSettings.allowed_end_hour).padStart(2, "0")}:00
          </p>
          <Button
            onClick={() => router.push("/student/")}
            className="rounded-xl px-8"
          >
            홈으로
          </Button>
        </div>
      </div>
    );
  }

  if (dailyLimitReached && timeSettings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <Mascot state="happy" message="오늘도 열심히 했어요!" size={100} />
          <h2 className="text-2xl font-bold mt-4 mb-2">
            오늘의 학습 시간을 다 사용했어요
          </h2>
          <p className="text-muted-foreground mb-6">
            오늘 {timeSettings.daily_time_limit_minutes}분 학습을 완료했어요.
            내일 다시 만나요!
          </p>
          <Button
            onClick={() => router.push("/student/")}
            className="rounded-xl px-8"
          >
            홈으로
          </Button>
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

  // ── Review intro screen (Duolingo-style) ──────────────────────
  if (showReviewIntro) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm flex flex-col items-center gap-6"
        >
          <Mascot state="thinking" message="복습할 시간이에요!" size={100} />

          <div>
            <h2 className="text-2xl font-bold mb-2">
              {reviewQueue.length}문제를 틀렸어요!
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              틀린 문제를 다시 풀어보면
              <br />
              기억에 오래 남아요.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Button
              onClick={dismissReviewIntro}
              className="h-12 rounded-xl font-bold text-base bg-[#2ECC71] hover:bg-[#2ECC71]/90 gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              복습 시작하기
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              모든 문제를 맞출 때까지 반복해요!
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Review mode (re-present wrong questions) ──────────────────
  if (isReviewMode) {
    const reviewOriginalIndex = reviewQueue[reviewIndex];
    const reviewQuestion = questions[reviewOriginalIndex];

    return (
      <div
        className="min-h-screen bg-background flex flex-col"
        style={{ overscrollBehavior: "none" }}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 text-xs font-bold">
                <RotateCcw className="h-3 w-3" />
                복습 모드
              </span>
              <span className="text-sm font-bold text-muted-foreground">
                {reviewIndex + 1} / {reviewQueue.length}
              </span>
            </div>
            {/* Review progress bar */}
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-amber-400"
                animate={{
                  width: `${((reviewIndex + (reviewAnswered ? 1 : 0)) / reviewQueue.length) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 py-4 px-4 pb-24 lg:pb-8">
          <div className="max-w-5xl mx-auto">
            {/* Review hint banner */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <span className="text-amber-700 text-sm font-medium">
                이 문제를 틀렸어요. 다시 풀어보세요!
              </span>
            </motion.div>

            <AnimatePresence mode="wait">
              <QuestionRenderer
                key={`review-${reviewIndex}-${reviewOriginalIndex}`}
                question={reviewQuestion}
                onAnswer={handleReviewAnswer}
                showResult={reviewAnswered}
                isCorrect={reviewIsCorrect}
              />
            </AnimatePresence>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center justify-end mt-6 gap-3">
              <Mascot state={mascotState} message={mascotMessage} size={50} />
              {reviewAnswered ? (
                <Button
                  onClick={handleReviewAdvance}
                  className="gap-1 rounded-xl bg-[#2ECC71] hover:bg-[#2ECC71]/90 font-bold"
                >
                  {reviewIndex + 1 >= reviewQueue.length
                    ? "복습 완료"
                    : "다음 문제"}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  disabled
                  className="rounded-xl text-muted-foreground"
                >
                  문제를 풀어주세요
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile bottom navigation */}
        <div className="lg:hidden sticky bottom-0 z-40 bg-background/95 backdrop-blur-sm border-t px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex-shrink-0">
              <Mascot state={mascotState} message={mascotMessage} size={50} />
            </div>

            {reviewAnswered ? (
              <Button
                onClick={handleReviewAdvance}
                className="gap-1 rounded-xl bg-[#2ECC71] hover:bg-[#2ECC71]/90 font-bold"
              >
                {reviewIndex + 1 >= reviewQueue.length
                  ? "복습 완료"
                  : "다음 문제"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                disabled
                className="rounded-xl text-muted-foreground"
              >
                문제를 풀어주세요
              </Button>
            )}
          </div>
        </div>
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
          reviewCorrected={reviewCorrected}
          reviewTotal={reviewQueue.length}
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
      ) : currentState?.isAnswered ? (
        <Button
          onClick={() => handleNavigate(currentIndex + 1)}
          className="gap-1 rounded-xl"
        >
          다음
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="outline"
          disabled
          className="rounded-xl text-muted-foreground"
        >
          문제를 풀어주세요
        </Button>
      )}
    </>
  );

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      style={{ overscrollBehavior: "none" }}
    >
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/student/")}
              className="gap-1 text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              나가기
            </Button>
            <div className="flex items-center gap-2">
              {timeRemainingMin !== null &&
                timeSettings &&
                timeSettings.daily_time_limit_minutes > 0 && (
                  <span className="text-xs font-medium text-muted-foreground px-2 py-1 rounded-full bg-muted">
                    {timeRemainingMin}분 남음
                  </span>
                )}
              <Timer onTick={() => {}} paused={isPaused} />
            </div>
          </div>
          {timeWarning && (
            <div className="mb-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <span className="text-amber-700 text-sm font-medium">
                학습 시간이 곧 끝나요! {timeRemainingMin}분 남았어요.
              </span>
            </div>
          )}
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
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <QuestionRenderer
              key={currentQuestion.id}
              question={currentQuestion}
              onAnswer={handleAnswer}
              showResult={!!currentState?.isAnswered}
              isCorrect={currentState?.isCorrect ?? null}
              hideCorrectAnswer={true}
            />
          </AnimatePresence>

          {/* Desktop inline navigation */}
          <div className="hidden lg:flex items-center justify-between mt-6">
            <NavButtons />
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation (fixed: 해설이 길어져도 다음 버튼이 항상 보이도록) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <NavButtons showMascot />
        </div>
      </div>
    </div>
  );
}
