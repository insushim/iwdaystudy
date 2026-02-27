"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, TrendingUp, TrendingDown, Star, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface WeeklyReportProps {
  daysCompleted: number;
  totalDays?: number;
  averageScore: number;
  bestSubject: { name: string; score: number };
  weakestSubject: { name: string; score: number };
  improvementFromLastWeek: number;
  totalPoints: number;
  className?: string;
}

export function WeeklyReport({
  daysCompleted,
  totalDays = 7,
  averageScore,
  bestSubject,
  weakestSubject,
  improvementFromLastWeek,
  totalPoints,
  className,
}: WeeklyReportProps) {
  const completionRate = Math.round((daysCompleted / totalDays) * 100);
  const isImproved = improvementFromLastWeek > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            주간 리포트
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Completion */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">완료 일수</span>
              <span className="text-sm font-semibold">
                {daysCompleted} / {totalDays}일
              </span>
            </div>
            <Progress value={completionRate} className="h-3" />
          </div>

          {/* Average Score */}
          <div className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">평균 점수</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">{averageScore}점</span>
              <Badge
                variant={isImproved ? "default" : "destructive"}
                className="text-xs"
              >
                {isImproved ? (
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-0.5" />
                )}
                {isImproved ? "+" : ""}
                {improvementFromLastWeek}점
              </Badge>
            </div>
          </div>

          {/* Best & Weakest */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
              <div className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400">
                <Star className="h-3 w-3" />
                최고 과목
              </div>
              <p className="text-sm font-semibold">{bestSubject.name}</p>
              <p className="text-xs text-muted-foreground">{bestSubject.score}점</p>
            </div>
            <div className="flex flex-col gap-1 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
              <div className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-3 w-3" />
                보완 과목
              </div>
              <p className="text-sm font-semibold">{weakestSubject.name}</p>
              <p className="text-xs text-muted-foreground">{weakestSubject.score}점</p>
            </div>
          </div>

          {/* Points */}
          <div className="flex items-center justify-between pt-3 border-t">
            <span className="text-sm text-muted-foreground">이번 주 획득 포인트</span>
            <span className="text-sm font-bold text-primary">+{totalPoints}P</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
