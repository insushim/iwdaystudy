"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format, isWithinInterval, parseISO, subDays, subMonths } from "date-fns";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { StreakCalendar } from "@/components/dashboard/StreakCalendar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

// Mock data
function generateMockHistory() {
  const records = [];
  const subjects = ["수학", "국어", "맞춤법", "어휘", "한자", "영어", "글쓰기", "상식"];
  const today = new Date();

  for (let i = 0; i < 60; i++) {
    const date = subDays(today, i);
    const completed = Math.random() > 0.25;
    if (completed) {
      const score = Math.floor(Math.random() * 40) + 60;
      const timeSpent = Math.floor(Math.random() * 20) + 10;
      const subjectScores = subjects.map((s) => ({
        name: s,
        score: Math.floor(Math.random() * 40) + 60,
        correct: Math.floor(Math.random() * 3) + 1,
        total: Math.floor(Math.random() * 2) + 2,
      }));

      records.push({
        id: `record-${i}`,
        date: format(date, "yyyy-MM-dd"),
        dateLabel: format(date, "M월 d일 (E)", { locale: ko }),
        score,
        timeSpent,
        subjects: subjectScores,
        completed: true,
      });
    }
  }
  return records;
}

function generateCalendarData() {
  const data = [];
  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const date = subDays(today, i);
    const completed = Math.random() > 0.3;
    data.push({
      date: format(date, "yyyy-MM-dd"),
      score: completed ? Math.floor(Math.random() * 40) + 60 : 0,
      completed,
    });
  }
  return data;
}

const mockHistory = generateMockHistory();
const calendarData = generateCalendarData();

type DateRange = "1week" | "1month" | "3months" | "all";

export default function StudentHistoryPage() {
  const [dateRange, setDateRange] = useState<DateRange>("1month");
  const [customStart, setCustomStart] = useState<Date | undefined>();
  const [customEnd, setCustomEnd] = useState<Date | undefined>();
  const [showCustom, setShowCustom] = useState(false);

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
        return mockHistory;
    }

    if (showCustom && customStart && customEnd) {
      return mockHistory.filter((r) =>
        isWithinInterval(parseISO(r.date), { start: customStart, end: customEnd })
      );
    }

    return mockHistory.filter((r) =>
      isWithinInterval(parseISO(r.date), { start, end: now })
    );
  }, [dateRange, customStart, customEnd, showCustom]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="student" userName="김아라" />
      <main className="flex-1 pb-20 lg:pb-0">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
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
                  <p className="text-muted-foreground">해당 기간에 학습 기록이 없습니다.</p>
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
                              <span>{record.subjects.length}과목</span>
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
                        {record.subjects.map((subj) => (
                          <Badge
                            key={subj.name}
                            variant={subj.score >= 80 ? "default" : "outline"}
                            className="text-xs"
                          >
                            {subj.name} {subj.score}점
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
      </main>
      <MobileNav role="student" />
    </div>
  );
}
