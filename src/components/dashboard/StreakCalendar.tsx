"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
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
} from "date-fns";
import { ko } from "date-fns/locale";

interface DayData {
  date: string; // YYYY-MM-DD
  score: number; // 0-100
  completed: boolean;
}

interface StreakCalendarProps {
  data: DayData[];
  className?: string;
}

function getColorIntensity(score: number): string {
  if (score === 0) return "bg-muted";
  if (score < 40) return "bg-emerald-200 dark:bg-emerald-900";
  if (score < 60) return "bg-emerald-300 dark:bg-emerald-700";
  if (score < 80) return "bg-emerald-400 dark:bg-emerald-600";
  return "bg-emerald-500 dark:bg-emerald-500";
}

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export function StreakCalendar({ data, className }: StreakCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const dataMap = useMemo(() => {
    const map = new Map<string, DayData>();
    data.forEach((d) => map.set(d.date, d));
    return map;
  }, [data]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const blanks = Array.from({ length: startDayOfWeek }, (_, i) => i);

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          학습 달력
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[100px] text-center">
            {format(currentMonth, "yyyy년 M월", { locale: ko })}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            disabled={isSameMonth(currentMonth, new Date())}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="text-center text-xs font-medium text-muted-foreground py-1"
            >
              {label}
            </div>
          ))}
        </div>
        <TooltipProvider>
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

              return (
                <Tooltip key={dateStr}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.01 * parseInt(format(day, "d")) }}
                      className={cn(
                        "aspect-square rounded-md flex items-center justify-center text-xs font-medium cursor-default relative transition-colors",
                        future
                          ? "bg-transparent text-muted-foreground/40"
                          : completed
                            ? getColorIntensity(score)
                            : "bg-muted/50",
                        today && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                        completed && score > 0 && "text-white"
                      )}
                    >
                      {format(day, "d")}
                      {completed && (
                        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 border border-background" />
                      )}
                    </motion.div>
                  </TooltipTrigger>
                  {!future && (
                    <TooltipContent>
                      <p className="font-medium">{format(day, "M월 d일 (E)", { locale: ko })}</p>
                      {completed ? (
                        <p className="text-xs">점수: {score}점</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">학습 기록 없음</p>
                      )}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
          <span>적음</span>
          <div className="flex gap-1">
            {["bg-muted", "bg-emerald-200 dark:bg-emerald-900", "bg-emerald-300 dark:bg-emerald-700", "bg-emerald-400 dark:bg-emerald-600", "bg-emerald-500 dark:bg-emerald-500"].map(
              (color, i) => (
                <div key={i} className={cn("h-3 w-3 rounded-sm", color)} />
              )
            )}
          </div>
          <span>많음</span>
        </div>
      </CardContent>
    </Card>
  );
}
