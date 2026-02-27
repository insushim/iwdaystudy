"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format, subDays, subWeeks } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Target,
  Flame,
  TrendingUp,
  Brain,
  Zap,
  CalendarCheck,
  AlertTriangle,
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

// Mock data generators
const subjectData = [
  { subject: "math", name: "수학", accuracy: 85, color: "#FF6B35" },
  { subject: "korean", name: "국어", accuracy: 78, color: "#4ECDC4" },
  { subject: "spelling", name: "맞춤법", accuracy: 92, color: "#A18CD1" },
  { subject: "vocabulary", name: "어휘", accuracy: 70, color: "#FF8BA7" },
  { subject: "english", name: "영어", accuracy: 65, color: "#4169E1" },
  { subject: "writing", name: "글쓰기", accuracy: 82, color: "#2ECC71" },
  {
    subject: "general_knowledge",
    name: "상식",
    accuracy: 88,
    color: "#F9CA24",
  },
  { subject: "hanja", name: "한자", accuracy: 55, color: "#8B4513" },
];

const weeklyPoints = Array.from({ length: 12 }, (_, i) => {
  const date = subWeeks(new Date(), 11 - i);
  return {
    week: format(date, "M/d", { locale: ko }),
    points: Math.floor(Math.random() * 200) + 100,
    score: Math.floor(Math.random() * 30) + 65,
  };
});

const dailyScores = Array.from({ length: 30 }, (_, i) => {
  const date = subDays(new Date(), 29 - i);
  return {
    date: format(date, "M/d"),
    score: Math.random() > 0.2 ? Math.floor(Math.random() * 30) + 65 : 0,
  };
});

const weekComparison = [
  { label: "이번 주", score: 82, color: "#2ECC71" },
  { label: "지난 주", score: 76, color: "#A18CD1" },
  { label: "2주 전", score: 71, color: "#FF8BA7" },
  { label: "3주 전", score: 68, color: "#F9CA24" },
];

const weakAreas = [
  {
    subject: "한자",
    topic: "4학년 한자 읽기",
    accuracy: 45,
    suggestion: "획순 연습을 더 해보세요",
  },
  {
    subject: "영어",
    topic: "기초 단어",
    accuracy: 55,
    suggestion: "매일 5개씩 외워보세요",
  },
  {
    subject: "어휘",
    topic: "반의어",
    accuracy: 60,
    suggestion: "짝을 지어서 외우면 좋아요",
  },
];

export default function StudentStatsPage() {
  const overallAccuracy = 79;
  const streakDays = 12;
  const totalPoints = 3420;
  const totalSessions = 45;

  const ringData = [
    { name: "정답", value: overallAccuracy, fill: "hsl(var(--primary))" },
    { name: "오답", value: 100 - overallAccuracy, fill: "hsl(var(--muted))" },
  ];

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
          change={3}
          iconColor="text-primary"
          iconBg="bg-primary/10"
        />
        <StatsCard
          icon={Flame}
          title="연속 학습"
          value={`${streakDays}일`}
          change={2}
          changeLabel="일 증가"
          iconColor="text-orange-500"
          iconBg="bg-orange-50 dark:bg-orange-950/30"
        />
        <StatsCard
          icon={Zap}
          title="총 포인트"
          value={totalPoints.toLocaleString()}
          change={12}
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
              {weakAreas.map((area, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium">
                        {area.subject} - {area.topic}
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
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weekly Report */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <WeeklyReport
          daysCompleted={5}
          averageScore={82}
          bestSubject={{ name: "맞춤법", score: 95 }}
          weakestSubject={{ name: "한자", score: 55 }}
          improvementFromLastWeek={6}
          totalPoints={320}
        />
      </motion.div>
    </div>
  );
}
