"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format, subDays, subWeeks, startOfWeek, endOfWeek } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Target,
  Flame,
  TrendingUp,
  Brain,
  Zap,
  CalendarCheck,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
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
  PieChart,
  Pie,
} from "recharts";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { SubjectChart } from "@/components/dashboard/SubjectChart";
import { WeeklyReport } from "@/components/dashboard/WeeklyReport";
import { useAuthStore } from "@/stores/authStore";
import {
  getSubjectStats,
  getStreakCount,
  getTotalPoints,
  getLearningRecords,
  getLocalReport,
} from "@/lib/local-storage";
import { getSubjectColor } from "@/lib/utils";

const SUBJECT_NAME_MAP: Record<string, string> = {
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
  safety: "안전",
  creative: "창의",
};

export default function StudentStatsPage() {
  const user = useAuthStore((s) => s.user);
  const [isLoaded, setIsLoaded] = useState(false);

  // Real data state
  const [subjectData, setSubjectData] = useState<
    { subject: string; name: string; accuracy: number; color: string }[]
  >([]);
  const [weeklyPoints, setWeeklyPoints] = useState<
    { week: string; points: number; score: number }[]
  >([]);
  const [dailyScores, setDailyScores] = useState<
    { date: string; score: number }[]
  >([]);
  const [weekComparison, setWeekComparison] = useState<
    { label: string; score: number; color: string }[]
  >([]);
  const [weakAreas, setWeakAreas] = useState<
    { subject: string; accuracy: number; suggestion: string }[]
  >([]);
  const [overallAccuracy, setOverallAccuracy] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [weeklyReportData, setWeeklyReportData] = useState<{
    daysCompleted: number;
    averageScore: number;
    bestSubject: { name: string; score: number };
    weakestSubject: { name: string; score: number };
    improvementFromLastWeek: number;
    totalPoints: number;
  } | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const studentId = user.id;
    const now = new Date();
    const today = format(now, "yyyy-MM-dd");
    const from90 = format(subDays(now, 90), "yyyy-MM-dd");

    // Subject stats
    const stats = getSubjectStats(studentId);
    const subjectArr = Object.entries(stats).map(([subject, s]) => ({
      subject,
      name: SUBJECT_NAME_MAP[subject] || subject,
      accuracy: s.accuracy,
      color: getSubjectColor(subject),
    }));
    setSubjectData(subjectArr);

    // Overall accuracy
    const totalCorrect = Object.values(stats).reduce(
      (s, v) => s + v.correct,
      0,
    );
    const totalQuestions = Object.values(stats).reduce(
      (s, v) => s + v.total,
      0,
    );
    setOverallAccuracy(
      totalQuestions > 0
        ? Math.round((totalCorrect / totalQuestions) * 100)
        : 0,
    );

    // Streak & points
    setStreakDays(getStreakCount(studentId));
    setTotalPoints(getTotalPoints(studentId));

    // Records
    const records = getLearningRecords(studentId).filter((r) => r.is_completed);
    setTotalSessions(records.length);

    // Build weeklyPoints from records grouped by week (last 12 weeks)
    const weeklyMap = new Map<
      string,
      { points: number; score: number; maxScore: number }
    >();
    for (let i = 0; i < 12; i++) {
      const weekDate = subWeeks(now, 11 - i);
      const weekLabel = format(weekDate, "M/d", { locale: ko });
      weeklyMap.set(weekLabel, { points: 0, score: 0, maxScore: 0 });
    }
    for (const r of records) {
      const completedDate = new Date(r.completed_at || r.created_at);
      // Find which week bucket this falls into
      for (let i = 0; i < 12; i++) {
        const weekDate = subWeeks(now, 11 - i);
        const wStart = startOfWeek(weekDate, { weekStartsOn: 1 });
        const wEnd = endOfWeek(weekDate, { weekStartsOn: 1 });
        if (completedDate >= wStart && completedDate <= wEnd) {
          const weekLabel = format(weekDate, "M/d", { locale: ko });
          const existing = weeklyMap.get(weekLabel) || {
            points: 0,
            score: 0,
            maxScore: 0,
          };
          existing.points += r.total_score;
          existing.score += r.total_score;
          existing.maxScore += r.max_score;
          weeklyMap.set(weekLabel, existing);
          break;
        }
      }
    }
    setWeeklyPoints(
      Array.from(weeklyMap.entries()).map(([week, d]) => ({
        week,
        points: d.points,
        score: d.maxScore > 0 ? Math.round((d.score / d.maxScore) * 100) : 0,
      })),
    );

    // Build dailyScores from records grouped by day (last 30 days)
    const dailyMap = new Map<string, { score: number; maxScore: number }>();
    for (let i = 0; i < 30; i++) {
      const d = subDays(now, 29 - i);
      dailyMap.set(format(d, "M/d"), { score: 0, maxScore: 0 });
    }
    for (const r of records) {
      const d = new Date(r.completed_at || r.created_at);
      const key = format(d, "M/d");
      if (dailyMap.has(key)) {
        const existing = dailyMap.get(key)!;
        existing.score += r.total_score;
        existing.maxScore += r.max_score;
        dailyMap.set(key, existing);
      }
    }
    setDailyScores(
      Array.from(dailyMap.entries()).map(([date, d]) => ({
        date,
        score: d.maxScore > 0 ? Math.round((d.score / d.maxScore) * 100) : 0,
      })),
    );

    // Build weekComparison from records grouped by recent 4 weeks
    const weekColors = ["#2ECC71", "#A18CD1", "#FF8BA7", "#F9CA24"];
    const weekLabels = ["이번 주", "지난 주", "2주 전", "3주 전"];
    const comparison = weekLabels.map((label, i) => {
      const weekDate = subWeeks(now, i);
      const wStart = startOfWeek(weekDate, { weekStartsOn: 1 });
      const wEnd = endOfWeek(weekDate, { weekStartsOn: 1 });
      const weekRecords = records.filter((r) => {
        const d = new Date(r.completed_at || r.created_at);
        return d >= wStart && d <= wEnd;
      });
      const totalScore = weekRecords.reduce((s, r) => s + r.total_score, 0);
      const totalMax = weekRecords.reduce((s, r) => s + r.max_score, 0);
      return {
        label,
        score: totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0,
        color: weekColors[i],
      };
    });
    setWeekComparison(comparison);

    // Build weakAreas from subjectStats sorted by accuracy (lowest first)
    const suggestions: Record<string, string> = {
      math: "계산 연습을 더 해보세요",
      korean: "독해 연습을 꾸준히 해보세요",
      spelling: "맞춤법 규칙을 다시 확인해보세요",
      vocabulary: "짝을 지어서 외우면 좋아요",
      english: "매일 5개씩 외워보세요",
      writing: "짧은 문장부터 연습해보세요",
      general_knowledge: "다양한 분야의 책을 읽어보세요",
      hanja: "획순 연습을 더 해보세요",
      science: "실험 원리를 정리해보세요",
      social: "지도와 함께 공부해보세요",
      safety: "안전 규칙을 반복해서 읽어보세요",
      creative: "자유롭게 생각을 펼쳐보세요",
    };
    const weak = Object.entries(stats)
      .filter(([, s]) => s.total >= 1)
      .sort((a, b) => a[1].accuracy - b[1].accuracy)
      .slice(0, 3)
      .map(([subject, s]) => ({
        subject: SUBJECT_NAME_MAP[subject] || subject,
        accuracy: s.accuracy,
        suggestion: suggestions[subject] || "꾸준히 연습해보세요",
      }));
    setWeakAreas(weak);

    // Weekly report data
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

    const thisWeekRecords = records.filter((r) => {
      const d = new Date(r.completed_at || r.created_at);
      return d >= thisWeekStart && d <= thisWeekEnd;
    });
    const lastWeekRecords = records.filter((r) => {
      const d = new Date(r.completed_at || r.created_at);
      return d >= lastWeekStart && d <= lastWeekEnd;
    });

    const thisWeekDays = new Set(
      thisWeekRecords.map(
        (r) => (r.completed_at || r.created_at).split("T")[0],
      ),
    ).size;
    const thisWeekScore = thisWeekRecords.reduce(
      (s, r) => s + r.total_score,
      0,
    );
    const thisWeekMax = thisWeekRecords.reduce((s, r) => s + r.max_score, 0);
    const thisWeekAvg =
      thisWeekMax > 0 ? Math.round((thisWeekScore / thisWeekMax) * 100) : 0;

    const lastWeekScore = lastWeekRecords.reduce(
      (s, r) => s + r.total_score,
      0,
    );
    const lastWeekMax = lastWeekRecords.reduce((s, r) => s + r.max_score, 0);
    const lastWeekAvg =
      lastWeekMax > 0 ? Math.round((lastWeekScore / lastWeekMax) * 100) : 0;

    // Find best & weakest from subject stats
    const sortedSubjects = Object.entries(stats).sort(
      (a, b) => b[1].accuracy - a[1].accuracy,
    );
    const best = sortedSubjects[0];
    const weakest = sortedSubjects[sortedSubjects.length - 1];

    setWeeklyReportData({
      daysCompleted: thisWeekDays,
      averageScore: thisWeekAvg,
      bestSubject: best
        ? {
            name: SUBJECT_NAME_MAP[best[0]] || best[0],
            score: best[1].accuracy,
          }
        : { name: "-", score: 0 },
      weakestSubject: weakest
        ? {
            name: SUBJECT_NAME_MAP[weakest[0]] || weakest[0],
            score: weakest[1].accuracy,
          }
        : { name: "-", score: 0 },
      improvementFromLastWeek: thisWeekAvg - lastWeekAvg,
      totalPoints: thisWeekScore,
    });

    setIsLoaded(true);
  }, [user?.id]);

  const ringData = [
    { name: "정답", value: overallAccuracy, fill: "hsl(var(--primary))" },
    {
      name: "오답",
      value: 100 - overallAccuracy,
      fill: "hsl(var(--muted))",
    },
  ];

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            학습 통계
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            나의 학습 현황을 분석해보세요
          </p>
        </motion.div>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (totalSessions === 0) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            학습 통계
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            나의 학습 현황을 분석해보세요
          </p>
        </motion.div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-lg font-medium text-muted-foreground">
              아직 학습 기록이 없습니다
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              학습을 시작하면 여기에 통계가 표시됩니다
            </p>
          </CardContent>
        </Card>
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
          <Target className="h-6 w-6 text-primary" />
          학습 통계
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          나의 학습 현황을 분석해보세요
        </p>
      </motion.div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          icon={Target}
          title="전체 정답률"
          value={`${overallAccuracy}%`}
          iconColor="text-primary"
          iconBg="bg-primary/10"
        />
        <StatsCard
          icon={Flame}
          title="연속 학습"
          value={`${streakDays}일`}
          iconColor="text-orange-500"
          iconBg="bg-orange-50 dark:bg-orange-950/30"
        />
        <StatsCard
          icon={Zap}
          title="총 포인트"
          value={totalPoints.toLocaleString()}
          iconColor="text-amber-500"
          iconBg="bg-amber-50 dark:bg-amber-950/30"
        />
        <StatsCard
          icon={CalendarCheck}
          title="총 학습 횟수"
          value={`${totalSessions}회`}
          iconColor="text-blue-500"
          iconBg="bg-blue-50 dark:bg-blue-950/30"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Overall Accuracy Ring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                전체 정답률
              </CardTitle>
              <CardDescription>전 과목 평균 정답률</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ringData}
                      cx="50%"
                      cy="50%"
                      innerRadius="70%"
                      outerRadius="90%"
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                    >
                      {ringData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{overallAccuracy}</span>
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {Math.round((totalSessions * 10 * overallAccuracy) / 100)}
                  </p>
                  <p className="text-xs text-muted-foreground">맞은 문제</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-muted-foreground">
                    {Math.round(
                      (totalSessions * 10 * (100 - overallAccuracy)) / 100,
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">틀린 문제</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subject Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SubjectChart data={subjectData} />
        </motion.div>
      </div>

      {/* Points & Score Over Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              학습 추이
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="points">
              <TabsList className="mb-4">
                <TabsTrigger value="points">포인트</TabsTrigger>
                <TabsTrigger value="scores">점수</TabsTrigger>
              </TabsList>
              <TabsContent value="points">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={weeklyPoints}>
                    <defs>
                      <linearGradient
                        id="pointsGrad"
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
                      dataKey="week"
                      tick={{ fontSize: 12 }}
                      className="fill-muted-foreground"
                    />
                    <YAxis
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
                        `${value}P`,
                        "획득 포인트",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="points"
                      stroke="#2ECC71"
                      fill="url(#pointsGrad)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="scores">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={dailyScores}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="date"
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
                        value === 0 ? "미학습" : `${value}점`,
                        "점수",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#4ECDC4"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 5 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Week Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-primary" />
                주간 비교
              </CardTitle>
              <CardDescription>최근 4주 평균 점수 비교</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weekComparison}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
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
                    formatter={(value: number) => [`${value}점`, "평균"]}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {weekComparison.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weak Areas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-amber-500" />
                보완이 필요한 영역
              </CardTitle>
              <CardDescription>
                정답률이 낮은 영역을 집중 연습해보세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {weakAreas.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  아직 과목별 데이터가 부족합니다
                </p>
              ) : (
                weakAreas.map((area, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium">
                          {area.subject}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {area.accuracy}%
                      </Badge>
                    </div>
                    <Progress value={area.accuracy} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {area.suggestion}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weekly Report */}
      {weeklyReportData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <WeeklyReport
            daysCompleted={weeklyReportData.daysCompleted}
            averageScore={weeklyReportData.averageScore}
            bestSubject={weeklyReportData.bestSubject}
            weakestSubject={weeklyReportData.weakestSubject}
            improvementFromLastWeek={weeklyReportData.improvementFromLastWeek}
            totalPoints={weeklyReportData.totalPoints}
          />
        </motion.div>
      )}
    </div>
  );
}
