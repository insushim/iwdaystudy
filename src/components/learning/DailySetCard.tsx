'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, CheckCircle, Clock, BookOpen, Sparkles, Flame, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SUBJECTS } from '@/types/learning';
import type { DailySet, Question } from '@/types/database';

interface Props {
  dailySet: DailySet;
  questions?: Question[];
  isCompleted?: boolean;
  score?: number;
  streak?: number;
}

export default function DailySetCard({ dailySet, questions, isCompleted = false, score, streak = 0 }: Props) {
  const router = useRouter();

  // Collect unique subjects from questions
  const uniqueSubjects = questions
    ? Array.from(new Set(questions.map((q) => q.subject)))
        .filter((s) => !['emotion_check', 'readiness_check'].includes(s))
    : [];

  // Check if this is today's set
  const isToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return dailySet.date === today;
  }, [dailySet.date]);

  // Completion percentage ring for score
  const scorePercent = score !== undefined ? Math.min(score, 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`learning-card overflow-hidden ${isCompleted ? 'border-green-300 bg-green-50/50' : 'border-primary/20'}`}>
        {/* Top colored bar with gradient */}
        <div className={`h-1.5 ${isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-primary via-ara-blue to-ara-purple'}`} />

        <CardContent className="p-5">
          {/* Header row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">{dailySet.title}</h3>
                {streak > 0 && !isCompleted && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex items-center gap-0.5 rounded-full bg-orange-50 px-2 py-0.5 border border-orange-200"
                  >
                    <Flame className="h-3 w-3 text-orange-500" />
                    <span className="text-[10px] font-bold text-orange-600">{streak}일</span>
                  </motion.div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {dailySet.description || '오늘의 아침학습'}
              </p>
            </div>
            {isCompleted ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="flex items-center gap-1 text-green-600"
              >
                <CheckCircle className="w-6 h-6" />
              </motion.div>
            ) : isToday ? (
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Badge variant="outline" className="border-primary text-primary gap-1 bg-primary/5">
                  <Sparkles className="h-3 w-3" />
                  오늘의 학습
                </Badge>
              </motion.div>
            ) : (
              <Badge variant="outline" className="border-primary text-primary gap-1">
                <Sparkles className="h-3 w-3" />
                오늘의 학습
              </Badge>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>{dailySet.total_questions}문항</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>약 {dailySet.estimated_minutes}분</span>
            </div>
            {isCompleted && score !== undefined && (
              <div className="flex items-center gap-1.5">
                {/* Mini score ring */}
                <div className="relative w-6 h-6">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="#E5E7EB" strokeWidth="2" />
                    <circle
                      cx="12" cy="12" r="10"
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 10}`}
                      strokeDashoffset={`${2 * Math.PI * 10 * (1 - scorePercent / 100)}`}
                    />
                  </svg>
                </div>
                <span className="text-green-600 font-bold">{score}점</span>
              </div>
            )}
          </div>

          {/* Subject badges */}
          {uniqueSubjects.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {uniqueSubjects.map((subject, idx) => {
                const info = SUBJECTS[subject];
                if (!info) return null;
                return (
                  <motion.div
                    key={subject}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Badge
                      variant="outline"
                      className="text-[10px] rounded-full px-2.5 py-0.5 gap-1"
                      style={{
                        borderColor: `${info.color}40`,
                        color: info.color,
                        backgroundColor: `${info.color}08`,
                      }}
                    >
                      <span>{info.icon}</span>
                      {info.name}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Action button */}
          {isCompleted ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold text-base"
            >
              <CheckCircle className="w-5 h-5" />
              오늘 학습 완료! 내일 또 만나요
            </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                className="w-full h-12 text-base font-bold rounded-xl gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-shadow"
                size="lg"
                onClick={() => router.push(`/student/daily/${dailySet.id}/`)}
              >
                <Play className="w-4 h-4" />
                학습 시작하기
                <Zap className="w-4 h-4 ml-1 text-yellow-200" />
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
