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
      <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden mb-3">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-ara-blue"
          animate={{ width: `${progressPercent}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />
      </div>

      {/* Question dots */}
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {questions.map((q, i) => {
          const isActive = i === currentIndex;
          const isAnswered = answeredIndices.has(i);
          const isCorrectAnswer = correctIndices.has(i);
          const subjectInfo = SUBJECTS[q.subject];
          const subjectColor = subjectInfo?.color || 'var(--primary)';

          // Special types don't have correct/incorrect
          const isSpecial = q.question_type === 'emotion_check' || q.question_type === 'readiness_check' || q.subject === 'writing' || q.subject === 'creative';

          let dotColor = 'bg-muted';
          let borderColor = 'border-transparent';

          if (isAnswered) {
            if (isSpecial) {
              dotColor = 'bg-[#4ECDC4]';
            } else if (isCorrectAnswer) {
              dotColor = 'bg-green-400';
            } else {
              dotColor = 'bg-red-400';
            }
          }

          if (isActive) {
            borderColor = 'border-foreground';
          }

          return (
            <motion.button
              key={i}
              onClick={() => onNavigate(i)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                'relative w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer',
                dotColor,
                borderColor,
                isActive && 'ring-2 ring-primary/30 shadow-sm'
              )}
              title={`${i + 1}번 문제 (${subjectInfo?.name || q.subject})`}
            >
              <span className={cn(
                'text-[10px] font-bold',
                isAnswered ? 'text-white' : 'text-muted-foreground',
                isActive && !isAnswered && 'text-foreground'
              )}>
                {i + 1}
              </span>

              {/* Active pulse */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
