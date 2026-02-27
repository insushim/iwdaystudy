"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  LayoutDashboard,
  Flame,
  CheckCircle2,
  Clock,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

// Mock data
const children = [
  {
    id: "child1",
    name: "김아라",
    grade: 3,
    className: "1반",
    streak: 15,
    todayCompleted: true,
    todayScore: 92,
    todayTimeSpent: 22,
    avgScore: 85,
    totalPoints: 3420,
    recentScores: [88, 92, 85, 90, 95],
  },
  {
    id: "child2",
    name: "김하루",
    grade: 1,
    className: "2반",
    streak: 5,
    todayCompleted: false,
    todayScore: 0,
    todayTimeSpent: 0,
    avgScore: 78,
    totalPoints: 1250,
    recentScores: [75, 80, 72, 78, 82],
  },
];

export default function ParentDashboardPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="parent" userName="김학부모" />
      <main className="flex-1 pb-20 lg:pb-0">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-primary" />
              학부모 대시보드
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {format(new Date(), "yyyy년 M월 d일 (E)", { locale: ko })} | 자녀 학습 현황
            </p>
          </motion.div>

          {/* Children Cards */}
          <div className="space-y-6">
            {children.map((child, idx) => (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="overflow-hidden">
                  {/* Child Header */}
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 text-xl">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {child.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-xl">{child.name}</CardTitle>
                        <CardDescription>
                          {child.grade}학년 {child.className}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1.5 text-orange-500">
                        <Flame className="h-5 w-5" />
                        <span className="text-lg font-bold">{child.streak}일</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Today's Status */}
                    <div className={`p-4 rounded-xl ${
                      child.todayCompleted
                        ? "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800"
                        : "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800"
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {child.todayCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-amber-600" />
                          )}
                          <span className={`text-sm font-medium ${
                            child.todayCompleted ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
                          }`}>
                            {child.todayCompleted ? "오늘의 학습 완료!" : "아직 학습을 시작하지 않았어요"}
                          </span>
                        </div>
                        {child.todayCompleted && (
                          <div className="text-right">
                            <span className="text-2xl font-bold text-emerald-600">
                              {child.todayScore}
                            </span>
                            <span className="text-sm text-emerald-600">점</span>
                          </div>
                        )}
                      </div>
                      {child.todayCompleted && (
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {child.todayTimeSpent}분 소요
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-xl font-bold text-primary">{child.avgScore}점</p>
                        <p className="text-xs text-muted-foreground">평균 점수</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-xl font-bold text-amber-500">{child.totalPoints.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">포인트</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-xl font-bold text-orange-500">{child.streak}일</p>
                        <p className="text-xs text-muted-foreground">연속 학습</p>
                      </div>
                    </div>

                    {/* Recent Scores */}
                    <div>
                      <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        최근 5일 점수
                      </p>
                      <div className="flex items-end gap-2 h-16">
                        {child.recentScores.map((score, i) => {
                          const height = (score / 100) * 100;
                          const isLast = i === child.recentScores.length - 1;
                          return (
                            <div
                              key={i}
                              className="flex-1 flex flex-col items-center gap-1"
                            >
                              <span className="text-[10px] text-muted-foreground">{score}</span>
                              <div
                                className={`w-full rounded-t-md transition-all ${
                                  isLast ? "bg-primary" : "bg-primary/30"
                                }`}
                                style={{ height: `${height}%` }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <MobileNav role="parent" />
    </div>
  );
}
