"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { format, subDays, subWeeks } from "date-fns";
import { ko } from "date-fns/locale";
import {
  FileText,
  TrendingUp,
  CalendarCheck,
  Flame,
  BarChart3,
  UserX,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { StreakCalendar } from "@/components/dashboard/StreakCalendar";
import { SubjectChart } from "@/components/dashboard/SubjectChart";
import { useAuthStore } from "@/stores/authStore";
import { localGetAllUsers } from "@/lib/local-auth";
import {
  getLearningRecords,
  getLocalReport,
  getSubjectStats,
  getCompletedDates,
  getStreakCount,
} from "@/lib/local-storage";
import type { Profile } from "@/types/database";

const SUBJECT_NAMES: Record<string, string> = {
  math: "수학",
  korean: "국어",
  spelling: "맞춤법",
  vocabulary: "어휘",
  english: "영어",
  writing: "글쓰기",
  general_knowledge: "상식",
  hanja: "한자",
  science: "과학",
  social: "사회",
};

const SUBJECT_COLORS: Record<string, string> = {
  math: "#FF6B35",
  korean: "#4ECDC4",
  spelling: "#A18CD1",
  vocabulary: "#FF8BA7",
  english: "#4169E1",
  writing: "#2ECC71",
  general_knowledge: "#F9CA24",
  hanja: "#8B4513",
  science: "#E74C3C",
  social: "#9B59B6",
};

export default function ParentReportsPage() {
  const { user } = useAuthStore();
  const [childProfiles, setChildProfiles] = useState<Profile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    const allUsers = localGetAllUsers();
    const kids = allUsers.filter(
      (u) => u.parent_id === user.id && u.role === "student",
    );
    setChildProfiles(kids);
    if (kids.length > 0) {
      setSelectedChildId(kids[0].id);
    }
    setLoaded(true);
  }, [user]);

  const selectedChild = childProfiles.find((c) => c.id === selectedChildId);

  // Compute report data for selected child
  const reportData = useMemo(() => {
    if (!selectedChildId) return null;

    const now = new Date();
    const from =
      period === "weekly"
        ? format(subWeeks(now, 12), "yyyy-MM-dd")
        : format(subDays(now, 180), "yyyy-MM-dd");
    const to = format(now, "yyyy-MM-dd");

    const report = getLocalReport(selectedChildId, from, to);
    const subjectStatsData = getSubjectStats(selectedChildId);

    // Build weekly scores (last 12 weeks)
    const weeklyScores: { week: string; score: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const weekEnd = subWeeks(now, i);
      const weekStart = subDays(weekEnd, 6);
      const wFrom = format(weekStart, "yyyy-MM-dd");
      const wTo = format(weekEnd, "yyyy-MM-dd");
      const weekRecords = report.dailyActivity.filter(
        (d) => d.date >= wFrom && d.date <= wTo,
      );
      const avgWeekScore =
        weekRecords.length > 0
          ? Math.round(
              weekRecords.reduce((s, d) => s + d.accuracy, 0) /
                weekRecords.length,
            )
          : 0;
      weeklyScores.push({
        week: format(weekEnd, "M/d"),
        score: avgWeekScore,
      });
    }

    // Build monthly scores (last 6 months)
    const monthlyScores: { month: string; score: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
      const monthRecords = report.dailyActivity.filter((d) =>
        d.date.startsWith(monthStr),
      );
      const avgMonthScore =
        monthRecords.length > 0
          ? Math.round(
              monthRecords.reduce((s, d) => s + d.accuracy, 0) /
                monthRecords.length,
            )
          : 0;
      monthlyScores.push({
        month: `${monthDate.getMonth() + 1}월`,
        score: avgMonthScore,
      });
    }

    // Subject data for chart
    const subjectData = Object.entries(subjectStatsData).map(
      ([subject, stats]) => ({
        subject,
        name: SUBJECT_NAMES[subject] || subject,
        accuracy: stats.accuracy,
        color: SUBJECT_COLORS[subject] || "#888",
      }),
    );

    // Calendar data (last 90 days)
    const records = getLearningRecords(selectedChildId);
    const completedRecords = records.filter((r) => r.is_completed);
    const calendarData: {
      date: string;
      score: number;
      completed: boolean;
    }[] = [];
    for (let i = 0; i < 90; i++) {
      const d = subDays(now, i);
      const dateStr = format(d, "yyyy-MM-dd");
      const dayRecords = completedRecords.filter(
        (r) => (r.completed_at || r.created_at).split("T")[0] === dateStr,
      );
      const completed = dayRecords.length > 0;
      const score = completed
        ? Math.round(
            dayRecords.reduce((s, r) => {
              return (
                s + (r.max_score > 0 ? (r.total_score / r.max_score) * 100 : 0)
              );
            }, 0) / dayRecords.length,
          )
        : 0;
      calendarData.push({ date: dateStr, score, completed });
    }

    // Week summary (last 7 days)
    const last7 = report.dailyActivity.filter(
      (d) => d.date >= format(subDays(now, 6), "yyyy-MM-dd"),
    );
    const daysCompleted = last7.filter((d) => d.sessions > 0).length;
    const weekAvg =
      last7.length > 0
        ? Math.round(last7.reduce((s, d) => s + d.accuracy, 0) / last7.length)
        : 0;

    // Previous week for comparison
    const prev7 = report.dailyActivity.filter(
      (d) =>
        d.date >= format(subDays(now, 13), "yyyy-MM-dd") &&
        d.date < format(subDays(now, 6), "yyyy-MM-dd"),
    );
    const prevAvg =
      prev7.length > 0
        ? Math.round(prev7.reduce((s, d) => s + d.accuracy, 0) / prev7.length)
        : 0;
    const improvement = prev7.length > 0 ? weekAvg - prevAvg : 0;

    const totalTime = last7.reduce((s, d) => {
      // Count daily sessions time from report overview if possible
      return s + d.sessions * 5; // approximate 5 min per session
    }, 0);

    return {
      weeklyScores,
      monthlyScores,
      subjectData,
      calendarData,
      weekSummary: {
        daysCompleted,
        avgScore: weekAvg,
        improvement,
        totalTime: Math.round(report.overview.totalTimeSeconds / 60),
      },
    };
  }, [selectedChildId, period]);

  // Empty state
  if (loaded && childProfiles.length === 0) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            리포트
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            자녀의 학습 성과를 자세히 확인하세요
          </p>
        </motion.div>
        <Card className="border shadow-sm border-dashed">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <UserX className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold mb-2">연결된 자녀가 없습니다</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                자녀 관리 페이지에서 자녀 계정을 연결하면 리포트를 확인할 수
                있습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData =
    reportData &&
    (period === "weekly" ? reportData.weeklyScores : reportData.monthlyScores);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          리포트
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          자녀의 학습 성과를 자세히 확인하세요
        </p>
      </motion.div>

      {/* Child Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={selectedChildId}
            onValueChange={(val) => setSelectedChildId(val)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {childProfiles.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.name} {child.grade ? `(${child.grade}학년)` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              variant={period === "weekly" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("weekly")}
            >
              주간
            </Button>
            <Button
              variant={period === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("monthly")}
            >
              월간
            </Button>
          </div>
        </div>
      </motion.div>

      {reportData && selectedChild && (
        <>
          {/* Week Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card>
                <CardContent className="pt-5 text-center">
                  <CalendarCheck className="h-5 w-5 mx-auto text-primary mb-1" />
                  <p className="text-xl font-bold">
                    {reportData.weekSummary.daysCompleted}/7일
                  </p>
                  <p className="text-xs text-muted-foreground">학습 일수</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5 text-center">
                  <BarChart3 className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                  <p className="text-xl font-bold">
                    {reportData.weekSummary.avgScore}점
                  </p>
                  <p className="text-xs text-muted-foreground">평균 점수</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5 text-center">
                  <TrendingUp className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
                  <p
                    className={`text-xl font-bold ${reportData.weekSummary.improvement >= 0 ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {reportData.weekSummary.improvement >= 0 ? "+" : ""}
                    {reportData.weekSummary.improvement}점
                  </p>
                  <p className="text-xs text-muted-foreground">지난 주 대비</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5 text-center">
                  <Flame className="h-5 w-5 mx-auto text-orange-500 mb-1" />
                  <p className="text-xl font-bold">
                    {reportData.weekSummary.totalTime}분
                  </p>
                  <p className="text-xs text-muted-foreground">총 학습 시간</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Score Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  {selectedChild.name}의 성적 추이
                </CardTitle>
                <CardDescription>
                  {period === "weekly" ? "최근 12주" : "최근 6개월"} 평균 점수
                  변화
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chartData && chartData.some((d) => d.score > 0) ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id="parentScoreGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#2ECC71"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#2ECC71"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis
                        dataKey={period === "weekly" ? "week" : "month"}
                        tick={{ fontSize: 11 }}
                        className="fill-muted-foreground"
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                        className="fill-muted-foreground"
                      />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(value: number) => [
                          `${value}점`,
                          "평균 점수",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#2ECC71"
                        fill="url(#parentScoreGrad)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-sm text-muted-foreground">
                    데이터 없음
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Subject Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {reportData.subjectData.length > 0 ? (
                <SubjectChart
                  data={reportData.subjectData}
                  title={`${selectedChild.name} 과목별 정답률`}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>과목별 정답률</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-sm text-muted-foreground">
                      데이터 없음
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* Attendance Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <StreakCalendar data={reportData.calendarData} />
            </motion.div>
          </div>

          {/* Comparison Over Time (only if >1 children) */}
          {childProfiles.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ComparisonChart childProfiles={childProfiles} period={period} />
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

// Separate component for comparison chart
function ComparisonChart({
  childProfiles,
  period,
}: {
  childProfiles: Profile[];
  period: "weekly" | "monthly";
}) {
  const colors = ["#2ECC71", "#4ECDC4", "#FF6B35", "#A18CD1", "#FF8BA7"];

  const comparisonData = useMemo(() => {
    const now = new Date();
    const weeks: { week: string; [key: string]: string | number }[] = [];

    for (let i = 11; i >= 0; i--) {
      const weekEnd = subWeeks(now, i);
      const weekStart = subDays(weekEnd, 6);
      const wFrom = format(weekStart, "yyyy-MM-dd");
      const wTo = format(weekEnd, "yyyy-MM-dd");
      const entry: { week: string; [key: string]: string | number } = {
        week: format(weekEnd, "M/d"),
      };

      childProfiles.forEach((child) => {
        const report = getLocalReport(child.id, wFrom, wTo);
        entry[child.id] =
          report.overview.completedSessions > 0
            ? report.overview.avgScorePercent
            : 0;
      });

      weeks.push(entry);
    }

    return weeks;
  }, [childProfiles, period]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          자녀 비교
        </CardTitle>
        <CardDescription>최근 12주 성적 비교</CardDescription>
      </CardHeader>
      <CardContent>
        {comparisonData.some((d) =>
          childProfiles.some((c) => (d[c.id] as number) > 0),
        ) ? (
          <>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11 }}
                  className="fill-muted-foreground"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                {childProfiles.map((child, i) => (
                  <Line
                    key={child.id}
                    type="monotone"
                    dataKey={child.id}
                    stroke={colors[i % colors.length]}
                    strokeWidth={2}
                    name={child.name}
                    dot={{ r: 2 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-3 text-sm">
              {childProfiles.map((child, i) => (
                <div key={child.id} className="flex items-center gap-2">
                  <span
                    className="h-2 w-4 rounded-full"
                    style={{ backgroundColor: colors[i % colors.length] }}
                  />
                  {child.name} {child.grade ? `(${child.grade}학년)` : ""}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-sm text-muted-foreground">
            비교할 학습 데이터가 없습니다
          </div>
        )}
      </CardContent>
    </Card>
  );
}
