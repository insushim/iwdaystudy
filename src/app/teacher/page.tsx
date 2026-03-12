"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { format, subDays } from "date-fns";
import { ko } from "date-fns/locale";
import {
  LayoutDashboard,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  BookOpen,
  Activity,
  Award,
  Star,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Cell,
} from "recharts";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useAuthStore } from "@/stores/authStore";
import { localGetAllUsers } from "@/lib/local-auth";
import {
  getLearningRecords,
  getSubjectStats,
  getStreakCount,
} from "@/lib/local-storage";
import type { Profile, LearningRecord } from "@/types/database";

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
  hanja: "#8B4513",
  general_knowledge: "#F9CA24",
  writing: "#2ECC71",
  science: "#E74C3C",
  social: "#9B59B6",
};

const STATUS_CONFIG = {
  completed: {
    label: "완료",
    color: "bg-emerald-500",
    badge: "default" as const,
  },
  not_started: {
    label: "미시작",
    color: "bg-gray-300",
    badge: "outline" as const,
  },
};

interface TodayStudent {
  id: string;
  name: string;
  status: "completed" | "not_started";
  score: number;
  time: string;
}

interface ActivityItem {
  id: string;
  text: string;
  time: string;
  type: "complete" | "badge" | "milestone" | "perfect" | "start";
}

export default function TeacherDashboardPage() {
  const { user } = useAuthStore();
  const [students, setStudents] = useState<Profile[]>([]);
  const [todayStudents, setTodayStudents] = useState<TodayStudent[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<
    { day: string; completion: number }[]
  >([]);
  const [subjectPerformance, setSubjectPerformance] = useState<
    { name: string; avg: number; color: string }[]
  >([]);
  const [avgScore, setAvgScore] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;

    const allUsers = localGetAllUsers();
    const myStudents = allUsers.filter(
      (u) =>
        u.role === "student" &&
        (u.teacher_id === user.id ||
          (user.school_name && u.school_name === user.school_name)),
    );
    setStudents(myStudents);

    if (myStudents.length === 0) {
      setIsLoaded(true);
      return;
    }

    const todayStr = format(new Date(), "yyyy-MM-dd");

    // Build today's student status
    const todayList: TodayStudent[] = [];
    const allActivities: ActivityItem[] = [];
    let totalAvg = 0;
    let avgCount = 0;

    // Aggregate subject stats across all students
    const aggregatedSubjects: Record<
      string,
      { totalAccuracy: number; count: number }
    > = {};

    // Weekly completion tracking
    const weeklyData: {
      day: string;
      date: string;
      completed: number;
      total: number;
    }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      weeklyData.push({
        day: format(d, "E", { locale: ko }),
        date: format(d, "yyyy-MM-dd"),
        completed: 0,
        total: myStudents.length,
      });
    }

    for (const student of myStudents) {
      const records = getLearningRecords(student.id);
      const completedRecords = records.filter((r) => r.is_completed);

      // Today's status
      const todayRecords = completedRecords.filter((r) => {
        const d = (r.completed_at || r.created_at).split("T")[0];
        return d === todayStr;
      });

      if (todayRecords.length > 0) {
        const latestToday = todayRecords.sort(
          (a, b) =>
            new Date(b.completed_at || b.created_at).getTime() -
            new Date(a.completed_at || a.created_at).getTime(),
        )[0];
        const score =
          latestToday.max_score > 0
            ? Math.round(
                (latestToday.total_score / latestToday.max_score) * 100,
              )
            : 0;
        const time = format(
          new Date(latestToday.completed_at || latestToday.created_at),
          "HH:mm",
        );
        todayList.push({
          id: student.id,
          name: student.name,
          status: "completed",
          score,
          time,
        });
      } else {
        todayList.push({
          id: student.id,
          name: student.name,
          status: "not_started",
          score: 0,
          time: "",
        });
      }

      // Average score
      if (completedRecords.length > 0) {
        const studentAvg =
          completedRecords.reduce((sum, r) => {
            return (
              sum + (r.max_score > 0 ? (r.total_score / r.max_score) * 100 : 0)
            );
          }, 0) / completedRecords.length;
        totalAvg += studentAvg;
        avgCount++;
      }

      // Subject stats
      const subStats = getSubjectStats(student.id);
      for (const [subj, data] of Object.entries(subStats)) {
        if (!aggregatedSubjects[subj]) {
          aggregatedSubjects[subj] = { totalAccuracy: 0, count: 0 };
        }
        aggregatedSubjects[subj].totalAccuracy += data.accuracy;
        aggregatedSubjects[subj].count++;
      }

      // Weekly completion
      for (const wd of weeklyData) {
        const hasCompletion = completedRecords.some((r) => {
          const d = (r.completed_at || r.created_at).split("T")[0];
          return d === wd.date;
        });
        if (hasCompletion) wd.completed++;
      }

      // Recent activity from latest records
      const sortedRecords = [...completedRecords]
        .sort(
          (a, b) =>
            new Date(b.completed_at || b.created_at).getTime() -
            new Date(a.completed_at || a.created_at).getTime(),
        )
        .slice(0, 3);

      for (const record of sortedRecords) {
        const recordTime = new Date(record.completed_at || record.created_at);
        const diffMs = Date.now() - recordTime.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        let timeStr: string;
        if (diffMin < 1) timeStr = "방금 전";
        else if (diffMin < 60) timeStr = `${diffMin}분 전`;
        else if (diffMin < 1440) timeStr = `${Math.floor(diffMin / 60)}시간 전`;
        else timeStr = `${Math.floor(diffMin / 1440)}일 전`;

        const score =
          record.max_score > 0
            ? Math.round((record.total_score / record.max_score) * 100)
            : 0;

        const isPerfect =
          record.total_score >= record.max_score && record.max_score > 0;

        allActivities.push({
          id: `${record.id}`,
          text: isPerfect
            ? `${student.name} 학생이 만점을 받았습니다!`
            : `${student.name} 학생이 학습을 완료했습니다. (${score}점)`,
          time: timeStr,
          type: isPerfect ? "perfect" : "complete",
        });
      }
    }

    // Sort activities by time (most recent first) and take top 10
    allActivities.sort((a, b) => {
      const parseTime = (t: string) => {
        if (t === "방금 전") return 0;
        const match = t.match(/(\d+)/);
        if (!match) return 999999;
        const num = parseInt(match[1]);
        if (t.includes("분")) return num;
        if (t.includes("시간")) return num * 60;
        if (t.includes("일")) return num * 1440;
        return 999999;
      };
      return parseTime(a.time) - parseTime(b.time);
    });

    setTodayStudents(
      todayList.sort((a, b) => {
        if (a.status === "completed" && b.status !== "completed") return -1;
        if (a.status !== "completed" && b.status === "completed") return 1;
        return 0;
      }),
    );
    setRecentActivity(allActivities.slice(0, 10));
    setAvgScore(avgCount > 0 ? Math.round(totalAvg / avgCount) : 0);

    // Weekly trend
    setWeeklyTrend(
      weeklyData.map((wd) => ({
        day: wd.day,
        completion:
          wd.total > 0 ? Math.round((wd.completed / wd.total) * 100) : 0,
      })),
    );

    // Subject performance
    const subjPerf = Object.entries(aggregatedSubjects)
      .map(([subj, data]) => ({
        name: SUBJECT_NAMES[subj] || subj,
        avg: data.count > 0 ? Math.round(data.totalAccuracy / data.count) : 0,
        color: SUBJECT_COLORS[subj] || "#888",
      }))
      .sort((a, b) => b.avg - a.avg);
    setSubjectPerformance(subjPerf);

    setIsLoaded(true);
  }, [user]);

  const totalStudents = students.length;
  const todayCompleted = todayStudents.filter(
    (s) => s.status === "completed",
  ).length;
  const avgCompletion =
    todayStudents.length > 0
      ? Math.round((todayCompleted / todayStudents.length) * 100)
      : 0;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground">데이터를 불러오는 중...</p>
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
          <LayoutDashboard className="h-6 w-6 text-primary" />
          교사 대시보드
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {format(new Date(), "yyyy년 M월 d일 (E)", { locale: ko })} 현황
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          icon={Users}
          title="전체 학생"
          value={totalStudents}
          iconColor="text-blue-500"
          iconBg="bg-blue-50 dark:bg-blue-950/30"
        />
        <StatsCard
          icon={CheckCircle2}
          title="오늘 완료"
          value={`${todayCompleted}/${totalStudents}`}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-50 dark:bg-emerald-950/30"
        />
        <StatsCard
          icon={TrendingUp}
          title="완료율"
          value={`${avgCompletion}%`}
          iconColor="text-primary"
          iconBg="bg-primary/10"
        />
        <StatsCard
          icon={BookOpen}
          title="평균 점수"
          value={`${avgScore}점`}
          iconColor="text-amber-500"
          iconBg="bg-amber-50 dark:bg-amber-950/30"
        />
      </div>

      {totalStudents === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-lg font-medium">
                아직 등록된 학생이 없습니다
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                학생 관리에서 학생을 추가해주세요
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Today's Learning Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    오늘의 학습 현황
                  </CardTitle>
                  <CardDescription>실시간 학생 학습 상태</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[320px]">
                    <div className="space-y-3">
                      {todayStudents.map((student) => {
                        const config =
                          STATUS_CONFIG[
                            student.status as keyof typeof STATUS_CONFIG
                          ];
                        return (
                          <div
                            key={student.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <Avatar size="sm">
                              <AvatarFallback>{student.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {student.name}
                              </p>
                              {student.time && (
                                <p className="text-xs text-muted-foreground">
                                  {student.time}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {student.status === "completed" && (
                                <span className="text-sm font-semibold text-primary">
                                  {student.score}점
                                </span>
                              )}
                              <Badge variant={config.badge} className="text-xs">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${config.color} mr-1`}
                                />
                                {config.label}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    최근 활동
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[320px]">
                    <div className="space-y-4">
                      {recentActivity.length === 0 ? (
                        <div className="flex flex-col items-center py-8">
                          <Clock className="h-8 w-8 text-muted-foreground/40 mb-2" />
                          <p className="text-sm text-muted-foreground">
                            아직 학습 활동이 없습니다
                          </p>
                        </div>
                      ) : (
                        recentActivity.map((activity) => (
                          <div key={activity.id} className="flex gap-3">
                            <div className="mt-0.5">
                              {activity.type === "complete" && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              )}
                              {activity.type === "badge" && (
                                <Award className="h-4 w-4 text-amber-500" />
                              )}
                              {activity.type === "milestone" && (
                                <TrendingUp className="h-4 w-4 text-blue-500" />
                              )}
                              {activity.type === "perfect" && (
                                <Star className="h-4 w-4 text-purple-500" />
                              )}
                              {activity.type === "start" && (
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">{activity.text}</p>
                              <p className="text-xs text-muted-foreground">
                                {activity.time}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Weekly Completion Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    주간 완료율 추이
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={weeklyTrend}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis
                        dataKey="day"
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
                        formatter={(value: number) => [`${value}%`, "완료율"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="completion"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "hsl(var(--primary))" }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Subject Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    과목별 평균 성적
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {subjectPerformance.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[250px]">
                      <BookOpen className="h-8 w-8 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        아직 과목별 데이터가 없습니다
                      </p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart
                        data={subjectPerformance}
                        margin={{ left: -10 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis
                          dataKey="name"
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
                          formatter={(value: number) => [`${value}점`, "평균"]}
                        />
                        <Bar
                          dataKey="avg"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={36}
                        >
                          {subjectPerformance.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
