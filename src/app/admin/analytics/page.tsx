"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const userGrowthData = [
  { month: "9월", users: 2100 },
  { month: "10월", users: 3400 },
  { month: "11월", users: 5200 },
  { month: "12월", users: 7100 },
  { month: "1월", users: 9800 },
  { month: "2월", users: 12400 },
];

const dailyActiveData = [
  { date: "2/21", dau: 5600 },
  { date: "2/22", dau: 5800 },
  { date: "2/23", dau: 6100 },
  { date: "2/24", dau: 6300 },
  { date: "2/25", dau: 5900 },
  { date: "2/26", dau: 3200 },
  { date: "2/27", dau: 2800 },
];

const subjectPopularityData = [
  { subject: "수학", value: 32, color: "#FF6B35" },
  { subject: "국어", value: 22, color: "#4ECDC4" },
  { subject: "영어", value: 16, color: "#4169E1" },
  { subject: "맞춤법", value: 10, color: "#A18CD1" },
  { subject: "한자", value: 8, color: "#8B4513" },
  { subject: "과학", value: 7, color: "#00BCD4" },
  { subject: "기타", value: 5, color: "#9CA3AF" },
];

const completionByGrade = [
  { grade: "1학년", rate: 96 },
  { grade: "2학년", rate: 94 },
  { grade: "3학년", rate: 91 },
  { grade: "4학년", rate: 88 },
  { grade: "5학년", rate: 85 },
  { grade: "6학년", rate: 82 },
];

const revenueData = [
  { month: "9월", revenue: 1200 },
  { month: "10월", revenue: 2100 },
  { month: "11월", revenue: 3500 },
  { month: "12월", revenue: 4800 },
  { month: "1월", revenue: 6200 },
  { month: "2월", revenue: 7400 },
];

const kpiCards = [
  {
    title: "월간 활성 사용자",
    value: "12,400",
    change: "+18.2%",
    trend: "up" as const,
    icon: Users,
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  },
  {
    title: "일평균 학습 완료",
    value: "8,420",
    change: "+12.5%",
    trend: "up" as const,
    icon: BookOpen,
    color: "text-green-600 bg-green-100 dark:bg-green-900/30",
  },
  {
    title: "평균 완료율",
    value: "89.3%",
    change: "+2.1%",
    trend: "up" as const,
    icon: TrendingUp,
    color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
  },
  {
    title: "월간 매출",
    value: "7,400만원",
    change: "+19.4%",
    trend: "up" as const,
    icon: DollarSign,
    color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("6m");

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">분석 대시보드</h1>
          <p className="text-sm text-muted-foreground mt-1">
            아라하루 서비스의 주요 지표를 확인하세요.
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-36 h-10">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">최근 1개월</SelectItem>
            <SelectItem value="3m">최근 3개월</SelectItem>
            <SelectItem value="6m">최근 6개월</SelectItem>
            <SelectItem value="1y">최근 1년</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {kpiCards.map((card) => (
          <motion.div key={card.title} variants={itemVariants}>
            <Card className="border shadow-sm">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}
                  >
                    <card.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  {card.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      card.trend === "up" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {card.change}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    전월 대비
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">사용자 성장 추이</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +490%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value) => [
                        `${Number(value).toLocaleString()}명`,
                        "사용자",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#2ECC71"
                      strokeWidth={3}
                      dot={{ fill: "#2ECC71", strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Active Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">일일 활성 사용자 (DAU)</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  이번 주
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyActiveData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value) => [
                        `${Number(value).toLocaleString()}명`,
                        "DAU",
                      ]}
                    />
                    <Bar
                      dataKey="dau"
                      fill="#4ECDC4"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Popularity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">과목별 인기도</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectPopularityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {subjectPopularityData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value) => [`${value}%`, "비율"]}
                    />
                    <Legend
                      formatter={(value) => (
                        <span style={{ fontSize: "12px" }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Completion by Grade */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">학년별 완료율</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completionByGrade} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      dataKey="grade"
                      type="category"
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                      width={50}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value) => [`${value}%`, "완료율"]}
                    />
                    <Bar
                      dataKey="rate"
                      fill="#A18CD1"
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">매출 추이</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  만원
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value) => [
                        `${Number(value).toLocaleString()}만원`,
                        "매출",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#F9CA24"
                      strokeWidth={3}
                      dot={{ fill: "#F9CA24", strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border shadow-sm bg-primary/5">
          <CardContent className="pt-5 pb-5">
            <h3 className="text-sm font-semibold mb-2">평균 학습 시간</h3>
            <p className="text-3xl font-black text-primary">24.3분</p>
            <p className="text-xs text-muted-foreground mt-1">
              세트당 평균 소요 시간
            </p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm bg-blue-500/5">
          <CardContent className="pt-5 pb-5">
            <h3 className="text-sm font-semibold mb-2">연속 학습 기록</h3>
            <p className="text-3xl font-black text-blue-500">47일</p>
            <p className="text-xs text-muted-foreground mt-1">
              최고 연속 학습 일수
            </p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm bg-purple-500/5">
          <CardContent className="pt-5 pb-5">
            <h3 className="text-sm font-semibold mb-2">평균 정답률</h3>
            <p className="text-3xl font-black text-purple-500">78.6%</p>
            <p className="text-xs text-muted-foreground mt-1">
              전체 사용자 평균
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
