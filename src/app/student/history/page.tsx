"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  format,
  isWithinInterval,
  parseISO,
  subDays,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  Filter,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { StreakCalendar } from "@/components/dashboard/StreakCalendar";
import { useAuthStore } from "@/stores/authStore";
import { getLearningRecords } from "@/lib/local-storage";

type DateRange = "1week" | "1month" | "3months" | "all";

interface HistoryRecord {
  id: string;
  date: string;
  dateLabel: string;
  score: number;
  timeSpent: number;
  subjects: { name: string; score: number }[];
  completed: boolean;
}

interface CalendarDay {
  date: string;
  score: number;
  completed: boolean;
}

export default function StudentHistoryPage() {
  const user = useAuthStore((s) => s.user);
  const [isLoaded, setIsLoaded] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);

  const [dateRange, setDateRange] = useState<DateRange>("1month");
  const [customStart, setCustomStart] = useState<Date | undefined>();
  const [customEnd, setCustomEnd] = useState<Date | undefined>();
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const studentId = user.id;
    const records = getLearningRecords(studentId).filter((r) => r.is_completed);

    // Sort by completed_at descending
    records.sort(
      (a, b) =>
        new Date(b.completed_at || b.created_at).getTime() -
        new Date(a.completed_at || a.created_at).getTime(),
    );

    // Transform records to display format
    const transformed: HistoryRecord[] = records.map((r) => {
      const completedDate = new Date(r.completed_at || r.created_at);
      const scorePercent =
        r.max_score > 0 ? Math.round((r.total_score / r.max_score) * 100) : 0;
      const timeMinutes = Math.round(r.time_spent_seconds / 60);

      return {
        id: r.id,
        date: format(completedDate, "yyyy-MM-dd"),
        dateLabel: format(completedDate, "M월 d일 (E)", { locale: ko }),
        score: scorePercent,
        timeSpent: timeMinutes > 0 ? timeMinutes : 1,
        subjects: [
          {
            name: `${r.total_score}/${r.max_score}`,
            score: scorePercent,
          },
        ],
        completed: true,
      };
    });

    setHistoryRecords(transformed);

    // Build calendar data from records (last 90 days)
    const now = new Date();
    const dateScoreMap = new Map<string, { score: number; maxScore: number }>();

    for (const r of records) {
      const d = new Date(r.completed_at || r.created_at);
      const dateStr = format(d, "yyyy-MM-dd");
      const existing = dateScoreMap.get(dateStr) || {
        score: 0,
        maxScore: 0,
      };
      existing.score += r.total_score;
      existing.maxScore += r.max_score;
      dateScoreMap.set(dateStr, existing);
    }

    const calData: CalendarDay[] = [];
    for (let i = 0; i < 90; i++) {
      const d = subDays(now, i);
      const dateStr = format(d, "yyyy-MM-dd");
      const dayData = dateScoreMap.get(dateStr);
      calData.push({
        date: dateStr,
        score: dayData
          ? dayData.maxScore > 0
            ? Math.round((dayData.score / dayData.maxScore) * 100)
            : 0
          : 0,
        completed: !!dayData,
      });
    }
    setCalendarData(calData);

    setIsLoaded(true);
  }, [user?.id]);

  const filteredRecords = useMemo(() => {
    const now = new Date();
    let start: Date;
    switch (dateRange) {
      case "1week":
        start = subDays(now, 7);
        break;
      case "1month":
        start = subMonths(now, 1);
        break;
      case "3months":
        start = subMonths(now, 3);
        break;
      default:
        return historyRecords;
    }

    if (showCustom && customStart && customEnd) {
      return historyRecords.filter((r) =>
        isWithinInterval(parseISO(r.date), {
          start: customStart,
          end: customEnd,
        }),
      );
    }

    return historyRecords.filter((r) =>
      isWithinInterval(parseISO(r.date), { start, end: now }),
    );
  }, [dateRange, customStart, customEnd, showCustom, historyRecords]);

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            학습 기록
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            지금까지의 학습 여정을 돌아보세요
          </p>
        </motion.div>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          학습 기록
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          지금까지의 학습 여정을 돌아보세요
        </p>
      </motion.div>

      {/* Calendar View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <StreakCalendar data={calendarData} />
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 py-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={dateRange}
              onValueChange={(val) => {
                setDateRange(val as DateRange);
                setShowCustom(false);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1week">최근 1주</SelectItem>
                <SelectItem value="1month">최근 1개월</SelectItem>
                <SelectItem value="3months">최근 3개월</SelectItem>
                <SelectItem value="all">전체</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  직접 선택
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">시작일</p>
                    <Calendar
                      mode="single"
                      selected={customStart}
                      onSelect={(date) => {
                        setCustomStart(date ?? undefined);
                        if (date && customEnd) setShowCustom(true);
                      }}
                    />
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">종료일</p>
                    <Calendar
                      mode="single"
                      selected={customEnd}
                      onSelect={(date) => {
                        setCustomEnd(date ?? undefined);
                        if (customStart && date) setShowCustom(true);
                      }}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <span className="text-sm text-muted-foreground ml-auto">
              총 {filteredRecords.length}개의 기록
            </span>
          </CardContent>
        </Card>
      </motion.div>

      {/* Records List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                {historyRecords.length === 0
                  ? "아직 학습 기록이 없습니다. 학습을 시작해보세요!"
                  : "해당 기간에 학습 기록이 없습니다."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRecords.map((record, idx) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * Math.min(idx, 10) }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{record.dateLabel}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {record.timeSpent}분
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-primary">
                        {record.score}
                      </span>
                      <span className="text-sm text-muted-foreground">점</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {record.subjects.map((subj, i) => (
                      <Badge
                        key={i}
                        variant={subj.score >= 80 ? "default" : "outline"}
                        className="text-xs"
                      >
                        점수 {subj.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
