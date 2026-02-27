"use client";

import { motion } from "framer-motion";
import {
  Users,
  CreditCard,
  Activity,
  BookOpen,
  FileQuestion,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  BarChart3,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const overviewCards = [
  {
    title: "총 사용자",
    value: "12,438",
    change: "+284",
    changePercent: "+2.3%",
    trend: "up" as const,
    icon: Users,
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  },
  {
    title: "활성 구독",
    value: "3,847",
    change: "+127",
    changePercent: "+3.4%",
    trend: "up" as const,
    icon: CreditCard,
    color: "text-green-600 bg-green-100 dark:bg-green-900/30",
  },
  {
    title: "일일 활성 사용자",
    value: "6,234",
    change: "-89",
    changePercent: "-1.4%",
    trend: "down" as const,
    icon: Activity,
    color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
  },
  {
    title: "총 학습 세트",
    value: "2,156",
    change: "+45",
    changePercent: "+2.1%",
    trend: "up" as const,
    icon: BookOpen,
    color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
  },
];

const dailyActiveData = [
  { day: "월", users: 5800 },
  { day: "화", users: 6200 },
  { day: "수", users: 6500 },
  { day: "목", users: 6100 },
  { day: "금", users: 5900 },
  { day: "토", users: 3200 },
  { day: "일", users: 2800 },
];

const recentActivities = [
  { action: "새 사용자 가입", detail: "김○○ (3학년)", time: "5분 전" },
  { action: "프리미엄 구독", detail: "박○○ (학부모)", time: "12분 전" },
  { action: "학습 세트 완료", detail: "2학년 1학기 - 수학 #142", time: "18분 전" },
  { action: "학교 플랜 문의", detail: "서울 ○○초등학교", time: "32분 전" },
  { action: "AI 콘텐츠 생성", detail: "4학년 2학기 세트 15개", time: "1시간 전" },
];

const quickActions = [
  {
    label: "콘텐츠 생성",
    href: "/admin/content/generate",
    icon: Sparkles,
    color: "text-primary",
  },
  {
    label: "사용자 관리",
    href: "/admin/users",
    icon: Users,
    color: "text-blue-500",
  },
  {
    label: "분석 보기",
    href: "/admin/analytics",
    icon: BarChart3,
    color: "text-purple-500",
  },
  {
    label: "콘텐츠 관리",
    href: "/admin/content",
    icon: BookOpen,
    color: "text-orange-500",
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

export default function AdminDashboard() {
  const maxUsers = Math.max(...dailyActiveData.map((d) => d.users));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">관리자 대시보드</h1>
          <p className="text-sm text-muted-foreground mt-1">
            아라하루 서비스 현황을 한눈에 확인하세요.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/content/generate">
            <Plus className="h-4 w-4 mr-2" />
            콘텐츠 생성
          </Link>
        </Button>
      </div>

      {/* Overview cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {overviewCards.map((card) => (
          <motion.div key={card.title} variants={itemVariants}>
            <Card className="border shadow-sm">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}>
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
                    {card.changePercent}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    지난 주 대비
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DAU Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">이번 주 일일 활성 사용자</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  주간
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-48 mt-4">
                {dailyActiveData.map((d) => (
                  <div
                    key={d.day}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <span className="text-xs text-muted-foreground font-medium">
                      {d.users.toLocaleString()}
                    </span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary/60 transition-all duration-500"
                      style={{
                        height: `${(d.users / maxUsers) * 140}px`,
                      }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {d.day}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">빠른 작업</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-accent transition-colors"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <action.icon className={`h-4 w-4 ${action.color}`} />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Content stats + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">콘텐츠 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "1학년", sets: 320, questions: 3200, color: "bg-pink-400" },
                  { label: "2학년", sets: 340, questions: 3400, color: "bg-yellow-400" },
                  { label: "3학년", sets: 380, questions: 4560, color: "bg-cyan-400" },
                  { label: "4학년", sets: 370, questions: 4440, color: "bg-blue-500" },
                  { label: "5학년", sets: 360, questions: 5040, color: "bg-purple-400" },
                  { label: "6학년", sets: 386, questions: 5404, color: "bg-green-500" },
                ].map((grade) => (
                  <div key={grade.label} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-16">{grade.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${grade.color}`}
                        style={{
                          width: `${(grade.sets / 400) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-24 text-right">
                      {grade.sets}세트 / {grade.questions.toLocaleString()}문제
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  총 2,156세트 / 26,044문제
                </span>
                <FileQuestion className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">최근 활동</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.detail}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
