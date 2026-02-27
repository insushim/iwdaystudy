'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, CheckCircle, Clock, BookOpen, RotateCcw, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SUBJECTS } from '@/types/learning';
import type { DailySet, Question } from '@/types/database';

interface Props {
  dailySet: DailySet;
  questions?: Question[];
  isCompleted?: boolean;
  score?: number;
}

export default function DailySetCard({ dailySet, questions, isCompleted = false, score }: Props) {
  const router = useRouter();

  // Collect unique subjects from questions
  const uniqueSubjects = questions
    ? Array.from(new Set(questions.map((q) => q.subject)))
        .filter((s) => !['emotion_check', 'readiness_check'].includes(s))
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`learning-card overflow-hidden ${isCompleted ? 'border-green-300 bg-green-50/50' : 'border-primary/20'}`}>
        {/* Top colored bar */}
        <div className={`h-2 ${isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-primary to-ara-blue'}`} />

        <CardContent className="p-5">
          {/* Header row */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-foreground">{dailySet.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {dailySet.description || '오늘의 아침학습'}
              </p>
            </div>
            {isCompleted ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-6 h-6" />
              </div>
            ) : (
              <Badge variant="outline" className="border-primary text-primary gap-1">
                <Sparkles className="h-3 w-3" />
                오늘의 학습
              </Badge>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{dailySet.total_questions}문항</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>약 {dailySet.estimated_minutes}분</span>
            </div>
            {isCompleted && score !== undefined && (
              <div className="flex items-center gap-1 text-green-600 font-medium">
                <span>{score}점</span>
              </div>
            )}
          </div>

          {/* Subject badges */}
          {uniqueSubjects.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {uniqueSubjects.map((subject) => {
                const info = SUBJECTS[subject];
                if (!info) return null;
                return (
                  <Badge
                    key={subject}
                    variant="outline"
                    className="text-[10px] rounded-full px-2 py-0.5"
                    style={{
                      borderColor: `${info.color}40`,
                      color: info.color,
                      backgroundColor: `${info.color}08`,
                    }}
                  >
                    {info.icon} {info.name}
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Action button */}
          <Button
            className="w-full h-12 text-base font-bold rounded-xl"
            variant={isCompleted ? 'outline' : 'default'}
            size="lg"
            onClick={() => router.push(`/student/daily/${dailySet.id}/`)}
          >
            {isCompleted ? (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                다시 풀기
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                학습 시작하기
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
