'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Home, RotateCcw, Star, Clock, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { SUBJECTS } from '@/types/learning';
import Mascot from './Mascot';
import type { Question } from '@/types/database';

interface SubjectScore {
  subject: string;
  correct: number;
  total: number;
}

interface Props {
  questions: Question[];
  correctIndices: Set<number>;
  answeredIndices: Set<number>;
  totalScore: number;
  maxScore: number;
  elapsedSeconds: number;
  onRetry: () => void;
  onGoHome: () => void;
}

function ConfettiPiece({ delay, x }: { delay: number; x: number }) {
  const colors = ['#2ECC71', '#F9CA24', '#FF6B35', '#4ECDC4', '#FF8BA7', '#A18CD1'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 6 + Math.random() * 6;

  return (
    <motion.div
      className="absolute top-0 pointer-events-none"
      style={{
        left: `${x}%`,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{
        y: '100vh',
        opacity: [1, 1, 0],
        rotate: 720 * (Math.random() > 0.5 ? 1 : -1),
        x: [0, (Math.random() - 0.5) * 100],
      }}
      transition={{
        duration: 2.5 + Math.random() * 1.5,
        delay,
        ease: 'easeIn',
      }}
    />
  );
}

export default function ResultScreen({
  questions,
  correctIndices,
  answeredIndices,
  totalScore,
  maxScore,
  elapsedSeconds,
  onRetry,
  onGoHome,
}: Props) {
  const [showConfetti, setShowConfetti] = useState(false);
  const scorePercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const isGoodScore = scorePercent >= 80;

  // Calculate subject scores
  const subjectScores = useMemo(() => {
    const map = new Map<string, { correct: number; total: number }>();
    questions.forEach((q, i) => {
      // Skip non-graded subjects
      if (['emotion_check', 'readiness_check', 'writing', 'creative'].includes(q.subject)) return;
      const existing = map.get(q.subject) || { correct: 0, total: 0 };
      existing.total++;
      if (correctIndices.has(i)) existing.correct++;
      map.set(q.subject, existing);
    });
    return Array.from(map.entries()).map(([subject, scores]) => ({
      subject,
      ...scores,
    }));
  }, [questions, correctIndices]);

  const totalCorrect = Array.from(correctIndices).length;
  const totalGraded = subjectScores.reduce((acc, s) => acc + s.total, 0);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  // Mascot state and message
  const mascotState = isGoodScore ? 'correct' as const : 'encourage' as const;
  const mascotMessage = isGoodScore
    ? '정말 잘했어요!'
    : '다음엔 더 잘할 수 있어요!';

  useEffect(() => {
    if (isGoodScore) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isGoodScore]);

  return (
    <div className="relative flex flex-col items-center gap-6 py-6 px-4 w-full max-w-lg mx-auto overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 40 }).map((_, i) => (
            <ConfettiPiece
              key={i}
              delay={Math.random() * 1}
              x={Math.random() * 100}
            />
          ))}
        </div>
      )}

      {/* Mascot */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
      >
        <Mascot state={mascotState} message={mascotMessage} size={80} />
      </motion.div>

      {/* Score circle */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 150, delay: 0.4 }}
        className="relative flex items-center justify-center"
      >
        <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center border-4 ${
          isGoodScore ? 'border-primary bg-primary/5' : 'border-amber-400 bg-amber-50'
        }`}>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-5xl font-black"
          >
            {scorePercent}
          </motion.span>
          <span className="text-sm font-bold text-muted-foreground">점</span>
        </div>

        {/* Star decorations for good scores */}
        {isGoodScore && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-2 -right-2"
            >
              <Star className="h-6 w-6 fill-[#F9CA24] text-[#F9CA24]" />
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute -bottom-1 -left-2"
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-3 gap-3 w-full"
      >
        <div className="flex flex-col items-center gap-1 rounded-xl bg-green-50 border border-green-100 p-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-lg font-bold text-green-700">{totalCorrect}</span>
          <span className="text-xs text-green-600">맞은 문제</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl bg-red-50 border border-red-100 p-3">
          <XCircle className="h-5 w-5 text-red-400" />
          <span className="text-lg font-bold text-red-700">{totalGraded - totalCorrect}</span>
          <span className="text-xs text-red-600">틀린 문제</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl bg-blue-50 border border-blue-100 p-3">
          <Clock className="h-5 w-5 text-blue-500" />
          <span className="text-lg font-bold text-blue-700">{minutes}:{String(seconds).padStart(2, '0')}</span>
          <span className="text-xs text-blue-600">걸린 시간</span>
        </div>
      </motion.div>

      {/* Subject breakdown */}
      {subjectScores.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full"
        >
          <Card className="border-border">
            <CardContent className="pt-4 space-y-3">
              <p className="text-sm font-bold text-muted-foreground mb-2">과목별 결과</p>
              {subjectScores.map((s) => {
                const info = SUBJECTS[s.subject];
                const percent = s.total > 0 ? (s.correct / s.total) * 100 : 0;
                return (
                  <div key={s.subject} className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="min-w-[60px] justify-center text-xs"
                      style={{
                        borderColor: info?.color || 'var(--border)',
                        color: info?.color || 'var(--foreground)',
                        backgroundColor: `${info?.color || 'var(--muted)'}10`,
                      }}
                    >
                      {info?.name || s.subject}
                    </Badge>
                    <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: info?.color || 'var(--primary)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ delay: 1, duration: 0.5 }}
                      />
                    </div>
                    <span className="text-xs font-bold min-w-[40px] text-right">
                      {s.correct}/{s.total}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Earned badges placeholder */}
      {isGoodScore && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
          className="flex items-center gap-2 rounded-full bg-[#F9CA24]/10 border border-[#F9CA24]/30 px-4 py-2"
        >
          <Trophy className="h-4 w-4 text-[#F9CA24]" />
          <span className="text-sm font-bold text-[#B8860B]">
            {scorePercent === 100 ? '완벽한 점수 뱃지 획득!' : '열심히 했어요 뱃지 획득!'}
          </span>
        </motion.div>
      )}

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="flex items-center gap-3 w-full"
      >
        <Button
          variant="outline"
          onClick={onRetry}
          className="flex-1 h-12 rounded-xl text-base font-bold gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          다시 풀기
        </Button>
        <Button
          onClick={onGoHome}
          className="flex-1 h-12 rounded-xl text-base font-bold gap-2"
        >
          <Home className="h-4 w-4" />
          홈으로
        </Button>
      </motion.div>
    </div>
  );
}
