'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, TrendingUp, Star } from 'lucide-react';

interface Props {
  totalPoints: number;
  todayPoints?: number;
  className?: string;
}

// XP thresholds for each level
const LEVEL_THRESHOLDS = [
  0, 50, 150, 300, 500, 750, 1050, 1400, 1800, 2250,
  2750, 3300, 3900, 4550, 5250, 6000, 6800, 7650, 8550, 9500,
  10500,
];

const LEVEL_TITLES = [
  '새싹', '꽃봉오리', '민들레', '해바라기', '작은 나무',
  '열매 나무', '큰 나무', '숲의 친구', '숲의 수호자', '나무 박사',
  '별의 학생', '별의 탐험가', '달의 학자', '달의 마법사', '태양의 전사',
  '태양의 현자', '우주 탐험가', '은하의 수호자', '별빛의 마스터', '전설의 학자',
  '궁극의 지식인',
];

function getLevel(xp: number) {
  let level = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  const currentThreshold = LEVEL_THRESHOLDS[level] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level + 1] || currentThreshold + 1000;
  const progress = ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return {
    level: level + 1,
    title: LEVEL_TITLES[level] || '전설',
    currentXP: xp - currentThreshold,
    neededXP: nextThreshold - currentThreshold,
    progress: Math.min(progress, 100),
  };
}

export default function XPLevelDisplay({ totalPoints, todayPoints = 0, className }: Props) {
  const levelData = useMemo(() => getLevel(totalPoints), [totalPoints]);

  return (
    <Card className={className}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-yellow-200 shadow-sm">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">레벨 {levelData.level}</p>
              <p className="text-sm font-bold">{levelData.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
            <Zap className="h-3.5 w-3.5" />
            {totalPoints.toLocaleString()} XP
          </div>
        </div>

        {/* XP Progress bar */}
        <div className="relative h-4 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 relative overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${levelData.progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
            />
          </motion.div>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-muted-foreground">
            {levelData.currentXP} / {levelData.neededXP} XP
          </span>
          <span className="text-[10px] text-muted-foreground">
            다음 레벨까지 {levelData.neededXP - levelData.currentXP} XP
          </span>
        </div>

        {/* Today's XP */}
        {todayPoints > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 px-3 py-2"
          >
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-xs font-bold text-green-700 dark:text-green-400">
              오늘 +{todayPoints} XP 획득!
            </span>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
