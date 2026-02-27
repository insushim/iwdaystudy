'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useDailySet } from '@/hooks/useDailySet';
import { getRecordForSet } from '@/lib/local-storage';
import DailySetCard from '@/components/learning/DailySetCard';
import Mascot from '@/components/learning/Mascot';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';

export default function DailyPage() {
  const { user } = useAuthStore();
  const { dailySet, isLoading, error } = useDailySet();
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState<number | undefined>();

  useEffect(() => {
    if (user && dailySet) {
      const record = getRecordForSet(user.id, dailySet.set.id);
      if (record?.is_completed) {
        setIsCompleted(true);
        setScore(record.total_score);
      }
    }
  }, [user, dailySet]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="오늘의 학습을 준비하고 있어요..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto space-y-6 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <Mascot state="thinking" message={error} size={80} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const today = new Date();
  const dateString = today.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">오늘의 학습</h1>
        </div>
        <p className="text-muted-foreground text-sm">{dateString}</p>
      </motion.div>

      {/* Daily set card */}
      {dailySet && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <DailySetCard
            dailySet={dailySet.set}
            questions={dailySet.questions}
            isCompleted={isCompleted}
            score={score}
          />
        </motion.div>
      )}

      {/* Mascot encouragement */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center"
      >
        <Mascot
          state={isCompleted ? 'happy' : 'default'}
          message={isCompleted ? '오늘 학습을 완료했어요! 정말 잘했어요!' : '오늘도 열심히 해볼까요?'}
          size={80}
        />
      </motion.div>
    </div>
  );
}
