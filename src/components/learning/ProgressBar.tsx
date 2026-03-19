'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SUBJECTS } from '@/types/learning';
import type { Question } from '@/types/database';

interface Props {
  questions: Question[];
  currentIndex: number;
  answeredIndices: Set<number>;
  correctIndices: Set<number>;
  onNavigate: (index: number) => void;
  className?: string;
}

export default function ProgressBar({
  questions,
  currentIndex,
  answeredIndices,
  correctIndices,
  onNavigate,
  className,
}: Props) {
  const total = questions.length;
  const completed = answeredIndices.size;
  const progressPercent = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className={cn('w-full', className)}>
      {/* Top bar with count */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-muted-foreground">
          {completed} / {total} 문제
        </span>
        <span className="text-xs font-bold text-primary">
          {Math.round(progressPercent)}%
        </span>
      </div>

      {/* Main progress bar */}
      <div className="relative h-3.5 w-full rounded-full bg-muted overflow-hidden mb-3">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-ara-blue relative overflow-hidden"
          animate={{ width: `${progressPercent}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
        </motion.div>

        {/* Step markers on the bar */}
        {questions.map((_, i) => {
          const position = ((i + 0.5) / total) * 100;
          return (
            <div
              key={i}
              className="absolute top-0 h-full w-px bg-white/20"
              style={{ left: `${position}%` }}
            />
          );
        })}
      </div>

      {/* Question dots */}
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {questions.map((q, i) => {
          const isActive = i === currentIndex;
          const isAnswered = answeredIndices.has(i);
          const isCorrectAnswer = correctIndices.has(i);
          const subjectInfo = SUBJECTS[q.subject];

          // Special types don't have correct/incorrect
          const isSpecial = q.question_type === 'emotion_check' || q.question_type === 'readiness_check' || q.subject === 'writing' || q.subject === 'creative';

          let dotBg = 'bg-muted';
          let borderColor = 'border-transparent';
          let textColor = 'text-muted-foreground';

          if (isAnswered) {
            if (isSpecial) {
              dotBg = 'bg-[#4ECDC4]';
              textColor = 'text-white';
            } else if (isCorrectAnswer) {
              dotBg = 'bg-green-400';
              textColor = 'text-white';
            } else {
              dotBg = 'bg-red-400';
              textColor = 'text-white';
            }
          }

          if (isActive) {
            borderColor = 'border-foreground';
          }

          return (
            <motion.button
              key={i}
              onClick={() => onNavigate(i)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                'relative w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer min-w-[28px] min-h-[28px]',
                dotBg,
                borderColor,
                isActive && 'ring-2 ring-primary/30 shadow-sm'
              )}
              title={`${i + 1}번 문제 (${subjectInfo?.name || q.subject})`}
            >
              {/* Subject icon for unanswered questions */}
              {!isAnswered && subjectInfo ? (
                <span className="text-[9px] leading-none">{subjectInfo.icon}</span>
              ) : (
                <span className={cn(
                  'text-[10px] font-bold',
                  textColor,
                  isActive && !isAnswered && 'text-foreground'
                )}>
                  {isAnswered ? (
                    isSpecial ? '\u2713' : (isCorrectAnswer ? '\u2713' : '\u2717')
                  ) : (
                    i + 1
                  )}
                </span>
              )}

              {/* Active pulse */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}

              {/* Colored bottom border indicating subject */}
              {!isAnswered && subjectInfo && (
                <div
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full"
                  style={{ backgroundColor: subjectInfo.color }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
