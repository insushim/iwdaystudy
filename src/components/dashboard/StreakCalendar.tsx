"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Trophy,
  Target,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  subMonths,
  addMonths,
  isToday,
  isSameMonth,
  isBefore,
  differenceInDays,
} from "date-fns";
import { ko } from "date-fns/locale";

interface DayData {
  date: string;
  score: number;
  completed: boolean;
}

interface StreakCalendarProps {
  data: DayData[];
  className?: string;
}

function getScoreEmoji(score: number): string {
  if (score >= 90) return "🌟";
  if (score >= 70) return "✨";
  if (score >= 50) return "👍";
  return "📝";
}

function getScoreColor(score: number): string {
  if (score >= 90) return "bg-emerald-500 text-white";
  if (score >= 70) return "bg-emerald-400 text-white";
  if (score >= 50) return "bg-emerald-300 text-emerald-900";
  return "bg-emerald-200 text-emerald-800";
}

function getScoreBorder(score: number): string {
  if (score >= 90) return "ring-2 ring-yellow-400/50";
  if (score >= 70) return "ring-1 ring-emerald-400/30";
  return "";
}

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export function StreakCalendar({ data, className }: StreakCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const dataMap = useMemo(() => {
    const map = new Map<string, DayData>();
    data.forEach((d) => map.set(d.date, d));
    return map;
  }, [data]);

  // 통계 계산
  const stats = useMemo(() => {
    const completed = data.filter((d) => d.completed);
    const totalDays = completed.length;
    const avgScore =
      totalDays > 0
        ? Math.round(completed.reduce((s, d) => s + d.score, 0) / totalDays)
        : 0;
    const perfectDays = completed.filter((d) => d.score >= 90).length;

    // 연속 학습일 계산
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = format(d, "yyyy-MM-dd");
      const dayData = dataMap.get(dateStr);
      if (dayData?.completed) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return { totalDays, avgScore, perfectDays, streak };
  }, [data, dataMap]);

  // 이번 달 통계
  const monthStats = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const monthData = data.filter((d) => {
      const date = new Date(d.date);
      return date >= monthStart && date <= monthEnd && d.completed;
    });
    const count = monthData.length;
    const avg =
      count > 0
        ? Math.round(monthData.reduce((s, d) => s + d.score, 0) / count)
        : 0;
    return { count, avg };
  }, [data, currentMonth]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  const blanks = Array.from({ length: startDayOfWeek }, (_, i) => i);

  const selectedDayData = selectedDay ? dataMap.get(selectedDay) : null;

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* 상단 통계 바 */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 sm:px-6 sm:py-4">
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Flame className="h-3.5 w-3.5 text-yellow-200" />
              <span className="text-[10px] sm:text-xs font-medium text-emerald-100">
                연속
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">
              {stats.streak}
              <span className="text-xs font-medium text-emerald-200">일</span>
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Target className="h-3.5 w-3.5 text-emerald-200" />
              <span className="text-[10px] sm:text-xs font-medium text-emerald-100">
                총 학습
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">
              {stats.totalDays}
              <span className="text-xs font-medium text-emerald-200">일</span>
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Zap className="h-3.5 w-3.5 text-yellow-200" />
              <span className="text-[10px] sm:text-xs font-medium text-emerald-100">
                평균
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">
              {stats.avgScore}
              <span className="text-xs font-medium text-emerald-200">점</span>
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Trophy className="h-3.5 w-3.5 text-yellow-200" />
              <span className="text-[10px] sm:text-xs font-medium text-emerald-100">
                만점
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">
              {stats.perfectDays}
              <span className="text-xs font-medium text-emerald-200">일</span>
            </p>
          </motion.div>
        </div>
      </div>

      <CardContent className="p-3 sm:p-5">
        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <span className="text-base font-bold">
              {format(currentMonth, "yyyy년 M월", { locale: ko })}
            </span>
            {monthStats.count > 0 && (
              <span className="text-xs text-muted-foreground ml-2">
                ({monthStats.count}일 학습 · 평균 {monthStats.avg}점)
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            disabled={isSameMonth(currentMonth, new Date())}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAY_LABELS.map((label, i) => (
            <div
              key={label}
              className={cn(
                "text-center text-[11px] font-semibold py-1",
                i === 0
                  ? "text-red-400"
                  : i === 6
                    ? "text-blue-400"
                    : "text-muted-foreground",
              )}
            >
              {label}
            </div>
          ))}
        </div>

        {/* 달력 그리드 */}
        <div className="grid grid-cols-7 gap-1">
          {blanks.map((i) => (
            <div key={`blank-${i}`} className="aspect-square" />
          ))}
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayData = dataMap.get(dateStr);
            const score = dayData?.score ?? 0;
            const completed = dayData?.completed ?? false;
            const today = isToday(day);
            const future = !isBefore(day, new Date()) && !today;
            const dayOfWeek = getDay(day);
            const isSelected = selectedDay === dateStr;

            return (
              <motion.button
                key={dateStr}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.008 * parseInt(format(day, "d")) }}
                onClick={() =>
                  !future && setSelectedDay(isSelected ? null : dateStr)
                }
                disabled={future}
                className={cn(
                  "aspect-square rounded-lg flex flex-col items-center justify-center text-xs relative transition-all cursor-pointer",
                  future
                    ? "text-muted-foreground/25 cursor-default"
                    : completed
                      ? cn(
                          getScoreColor(score),
                          getScoreBorder(score),
                          "shadow-sm hover:shadow-md",
                        )
                      : cn(
                          "bg-muted/40 hover:bg-muted/60",
                          dayOfWeek === 0
                            ? "text-red-300"
                            : dayOfWeek === 6
                              ? "text-blue-300"
                              : "text-muted-foreground",
                        ),
                  today &&
                    !completed &&
                    "ring-2 ring-emerald-400 ring-offset-1 ring-offset-background",
                  today &&
                    completed &&
                    "ring-2 ring-yellow-300 ring-offset-1 ring-offset-background",
                  isSelected &&
                    "ring-2 ring-primary ring-offset-1 ring-offset-background scale-105",
                )}
              >
                <span
                  className={cn(
                    "font-bold",
                    completed ? "text-[11px]" : "text-[12px]",
                  )}
                >
                  {format(day, "d")}
                </span>
                {completed && (
                  <span className="text-[9px] leading-none mt-px">
                    {score}점
                  </span>
                )}
                {today && !completed && (
                  <span className="text-[8px] text-emerald-500 font-bold leading-none mt-px">
                    오늘
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* 선택된 날짜 상세 */}
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 rounded-xl border bg-muted/30 p-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold">
                {format(new Date(selectedDay), "M월 d일 (EEEE)", {
                  locale: ko,
                })}
              </p>
              {selectedDayData?.completed ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {getScoreEmoji(selectedDayData.score)}
                  </span>
                  <span className="text-xl font-black text-emerald-600">
                    {selectedDayData.score}점
                  </span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  학습 기록 없음
                </span>
              )}
            </div>
            {selectedDayData?.completed && (
              <div className="mt-2 flex items-center gap-3">
                <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedDayData.score}%` }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      "h-full rounded-full",
                      selectedDayData.score >= 90
                        ? "bg-emerald-500"
                        : selectedDayData.score >= 70
                          ? "bg-emerald-400"
                          : selectedDayData.score >= 50
                            ? "bg-yellow-400"
                            : "bg-orange-400",
                    )}
                  />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {selectedDayData.score >= 90
                    ? "완벽!"
                    : selectedDayData.score >= 70
                      ? "잘했어요"
                      : selectedDayData.score >= 50
                        ? "좋아요"
                        : "힘내요"}
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* 범례 */}
        <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-muted/50" />
            <span>미학습</span>
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-200 ml-1" />
            <span>~50</span>
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-300 ml-1" />
            <span>~70</span>
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-400 ml-1" />
            <span>~90</span>
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500 ml-1" />
            <span>90+</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
