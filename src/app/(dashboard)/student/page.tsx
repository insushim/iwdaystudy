'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Star, Trophy, BookOpen, TrendingUp, Clock } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useDailySet } from '@/hooks/useDailySet';
import { getStreakCount, getTotalPoints, getCompletedDates, getRecordForSet, getEarnedBadges } from '@/lib/local-storage';
import DailySetCard from '@/components/learning/DailySetCard';
import Mascot from '@/components/learning/Mascot';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { dailySet, isLoading } = useDailySet();
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [todayScore, setTodayScore] = useState<number | undefined>();
  const [completedDays, setCompletedDays] = useState(0);

  useEffect(() => {
    if (!user) return;
    setStreak(getStreakCount(user.id));
    setPoints(getTotalPoints(user.id));
    setBadgeCount(getEarnedBadges(user.id).length);
    setCompletedDays(getCompletedDates(user.id).length);

    if (dailySet) {
      const record = getRecordForSet(user.id, dailySet.set.id);
      if (record?.is_completed) {
        setTodayCompleted(true);
        setTodayScore(record.total_score);
      }
    }
  }, [user, dailySet]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="학습 세트 준비 중..." />
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12
    ? '좋은 아침이에요'
    : hour < 18
    ? '열심히 공부하고 있네요'
    : '오늘 하루도 수고했어요';

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {greeting},{' '}
            <span className="text-primary">{user?.name || '학생'}</span>님!
          </h1>
          <p className="text-muted-foreground mt-1">
            {user?.grade ? `${user.grade}학년 ${user.semester || 1}학기` : ''} | 오늘도 알찬 하루를 시작해볼까요?
          </p>
        </div>
        <Mascot state={todayCompleted ? 'happy' : 'default'} size={60} />
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="text-center py-4 px-3">
            <CardContent className="p-0">
              <Flame className="w-6 h-6 mx-auto mb-1 text-orange-500" />
              <div className="text-2xl font-black text-orange-500">{streak}</div>
              <div className="text-xs text-muted-foreground">연속 학습</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="text-center py-4 px-3">
            <CardContent className="p-0">
              <Star className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
              <div className="text-2xl font-black text-yellow-500">{points.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">총 포인트</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="text-center py-4 px-3">
            <CardContent className="p-0">
              <Trophy className="w-6 h-6 mx-auto mb-1 text-purple-500" />
              <div className="text-2xl font-black text-purple-500">{badgeCount}</div>
              <div className="text-xs text-muted-foreground">획득 뱃지</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Today's learning */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          오늘의 학습
        </h2>
        {dailySet ? (
          <DailySetCard
            dailySet={dailySet.set}
            questions={dailySet.questions}
            isCompleted={todayCompleted}
            score={todayScore}
          />
        ) : (
          <Card className="py-8">
            <CardContent className="text-center text-muted-foreground">
              <p>학년과 학기를 설정해주세요.</p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Completion message */}
      {todayCompleted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-green-700">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">오늘 학습을 완료했어요! 대단해요!</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick stats summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <Card>
          <CardContent className="py-4">
            <h3 className="text-sm font-bold text-muted-foreground mb-3">학습 요약</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">총 학습일</p>
                  <p className="text-lg font-bold">{completedDays}일</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">최고 연속</p>
                  <p className="text-lg font-bold">{streak}일</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
