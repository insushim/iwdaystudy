'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Trophy } from 'lucide-react';

interface Props {
  currentStreak: number;
  completedDates: string[];
  className?: string;
}

const STREAK_MILESTONES = [
  { days: 7, label: '1주일', color: '#F9CA24' },
  { days: 30, label: '1개월', color: '#FF6B35' },
  { days: 100, label: '100일', color: '#E74C3C' },
  { days: 365, label: '1년', color: '#A18CD1' },
];

export default function StreakDisplay({ currentStreak, completedDates, className }: Props) {
  // Generate last 28 days calendar
  const calendarDays = useMemo(() => {
    const days: { date: string; completed: boolean; isToday: boolean }[] = [];
    const today = new Date();
    const completedSet = new Set(completedDates);

    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        completed: completedSet.has(dateStr),
        isToday: i === 0,
      });
    }
    return days;
  }, [completedDates]);

  // Next milestone
  const nextMilestone = useMemo(() => {
    return STREAK_MILESTONES.find(m => m.days > currentStreak);
  }, [currentStreak]);

  // Achieved milestones
  const achievedMilestones = useMemo(() => {
    return STREAK_MILESTONES.filter(m => currentStreak >= m.days);
  }, [currentStreak]);

  // Day labels
  const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];

  return (
    <Card className={className}>
      <CardContent className="py-4">
        {/* Streak header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              animate={currentStreak > 0 ? {
                scale: [1, 1.1, 1],
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                currentStreak > 0
                  ? 'bg-gradient-to-br from-orange-100 to-red-100'
                  : 'bg-muted'
              }`}
            >
              <Flame className={`h-6 w-6 ${currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
            </motion.div>
            <div>
              <p className="text-xs text-muted-foreground">연속 학습</p>
              <p className="text-lg font-black text-orange-500">
                {currentStreak}일
              </p>
            </div>
          </div>

          {/* Next milestone */}
          {nextMilestone && (
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">다음 목표</p>
              <p className="text-sm font-bold" style={{ color: nextMilestone.color }}>
                {nextMilestone.label} ({nextMilestone.days - currentStreak}일 남음)
              </p>
            </div>
          )}
        </div>

        {/* Calendar grid - 4 weeks x 7 days */}
        <div className="mb-3">
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayLabels.map(d => (
              <span key={d} className="text-[9px] text-center text-muted-foreground font-medium">
                {d}
              </span>
            ))}
          </div>
          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => (
              <motion.div
                key={day.date}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.01 }}
                className={`aspect-square rounded-md flex items-center justify-center text-[9px] font-medium transition-colors ${
                  day.isToday
                    ? day.completed
                      ? 'bg-green-500 text-white ring-2 ring-green-300'
                      : 'bg-primary/10 text-primary ring-2 ring-primary/30'
                    : day.completed
                    ? 'bg-green-400 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
                title={day.date}
              >
                {new Date(day.date).getDate()}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Streak milestones */}
        {achievedMilestones.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
            {achievedMilestones.map(m => (
              <motion.div
                key={m.days}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
                style={{
                  backgroundColor: `${m.color}15`,
                  color: m.color,
                  borderWidth: 1,
                  borderColor: `${m.color}30`,
                }}
              >
                <Trophy className="h-3 w-3" />
                {m.label}
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
