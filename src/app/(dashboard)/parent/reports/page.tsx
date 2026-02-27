"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { format, subDays, subWeeks } from "date-fns";
import { ko } from "date-fns/locale";
import {
  FileText,
  TrendingUp,
  CalendarCheck,
  Flame,
  BarChart3,
  ChevronDown,
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

// Mock data for two children
const childrenData = {
  child1: {
    name: "김아라",
    grade: 3,
    weeklyScores: Array.from({ length: 12 }, (_, i) => ({
      week: format(subWeeks(new Date(), 11 - i), "M/d"),
      score: Math.floor(Math.random() * 20) + 75,
    })),
    monthlyScores: Array.from({ length: 6 }, (_, i) => ({
      month: `${6 - i}개월 전`,
      score: Math.floor(Math.random() * 15) + 75,
    })),
    subjectData: [
      { subject: "math", name: "수학", accuracy: 88, color: "#FF6B35" },
      { subject: "korean", name: "국어", accuracy: 82, color: "#4ECDC4" },
      { subject: "spelling", name: "맞춤법", accuracy: 95, color: "#A18CD1" },
      { subject: "vocabulary", name: "어휘", accuracy: 78, color: "#FF8BA7" },
      { subject: "english", name: "영어", accuracy: 72, color: "#4169E1" },
      { subject: "hanja", name: "한자", accuracy: 55, color: "#8B4513" },
      {
        subject: "general_knowledge",
        name: "상식",
        accuracy: 90,
        color: "#F9CA24",
      },
    ],
    calendarData: Array.from({ length: 90 }, (_, i) => {
      const date = subDays(new Date(), i);
      const completed = Math.random() > 0.2;
      return {
        date: format(date, "yyyy-MM-dd"),
        score: completed ? Math.floor(Math.random() * 20) + 80 : 0,
        completed,
      };
    }),
    weekSummary: {
      daysCompleted: 5,
      avgScore: 89,
      improvement: 4,
      totalTime: 115,
    },
  },
  child2: {
    name: "김하루",
    grade: 1,
    weeklyScores: Array.from({ length: 12 }, (_, i) => ({
      week: format(subWeeks(new Date(), 11 - i), "M/d"),
      score: Math.floor(Math.random() * 25) + 65,
    })),
    monthlyScores: Array.from({ length: 6 }, (_, i) => ({
      month: `${6 - i}개월 전`,
      score: Math.floor(Math.random() * 20) + 65,
    })),
    subjectData: [
      { subject: "math", name: "수학", accuracy: 70, color: "#FF6B35" },
      { subject: "korean", name: "국어", accuracy: 85, color: "#4ECDC4" },
      { subject: "spelling", name: "맞춤법", accuracy: 80, color: "#A18CD1" },
      { subject: "vocabulary", name: "어휘", accuracy: 75, color: "#FF8BA7" },
      { subject: "writing", name: "글쓰기", accuracy: 82, color: "#2ECC71" },
      {
        subject: "general_knowledge",
        name: "상식",
        accuracy: 78,
        color: "#F9CA24",
      },
    ],
    calendarData: Array.from({ length: 90 }, (_, i) => {
      const date = subDays(new Date(), i);
      const completed = Math.random() > 0.35;
      return {
        date: format(date, "yyyy-MM-dd"),
        score: completed ? Math.floor(Math.random() * 25) + 70 : 0,
        completed,
      };
    }),
    weekSummary: {
      daysCompleted: 4,
      avgScore: 78,
      improvement: -2,
      totalTime: 98,
    },
  },
};

type ChildKey = keyof typeof childrenData;

export default function ParentReportsPage() {
  const [selectedChild, setSelectedChild] = useState<ChildKey>("child1");
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");

  const child = childrenData[selectedChild];
  const chartData =
    period === "weekly" ? child.weeklyScores : child.monthlyScores;

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
            value={selectedChild}
            onValueChange={(val) => setSelectedChild(val as ChildKey)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="child1">김아라 (3학년)</SelectItem>
              <SelectItem value="child2">김하루 (1학년)</SelectItem>
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
                {child.weekSummary.daysCompleted}/7일
              </p>
              <p className="text-xs text-muted-foreground">학습 일수</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 text-center">
              <BarChart3 className="h-5 w-5 mx-auto text-blue-500 mb-1" />
              <p className="text-xl font-bold">
                {child.weekSummary.avgScore}점
              </p>
              <p className="text-xs text-muted-foreground">평균 점수</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 text-center">
              <TrendingUp className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
              <p
                className={`text-xl font-bold ${child.weekSummary.improvement >= 0 ? "text-emerald-600" : "text-red-500"}`}
              >
                {child.weekSummary.improvement >= 0 ? "+" : ""}
                {child.weekSummary.improvement}점
              </p>
              <p className="text-xs text-muted-foreground">지난 주 대비</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 text-center">
              <Flame className="h-5 w-5 mx-auto text-orange-500 mb-1" />
              <p className="text-xl font-bold">
                {child.weekSummary.totalTime}분
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
              {child.name}의 성적 추이
            </CardTitle>
            <CardDescription>
              {period === "weekly" ? "최근 12주" : "최근 6개월"} 평균 점수 변화
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                    <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2ECC71" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
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
                  formatter={(value: number) => [`${value}점`, "평균 점수"]}
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
          <SubjectChart
            data={child.subjectData}
            title={`${child.name} 과목별 정답률`}
          />
        </motion.div>

        {/* Attendance Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <StreakCalendar data={child.calendarData} />
        </motion.div>
      </div>

      {/* Comparison Over Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              자녀 비교
            </CardTitle>
            <CardDescription>최근 12주 성적 비교</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={childrenData.child1.weeklyScores.map((item, idx) => ({
                  week: item.week,
                  child1: item.score,
                  child2: childrenData.child2.weeklyScores[idx]?.score ?? 0,
                }))}
              >
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
                <Line
                  type="monotone"
                  dataKey="child1"
                  stroke="#2ECC71"
                  strokeWidth={2}
                  name="김아라"
                  dot={{ r: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="child2"
                  stroke="#4ECDC4"
                  strokeWidth={2}
                  name="김하루"
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2 w-4 rounded-full bg-[#2ECC71]" />
                김아라 (3학년)
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-4 rounded-full bg-[#4ECDC4]" />
                김하루 (1학년)
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
