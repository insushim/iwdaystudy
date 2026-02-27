"use client";

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

// Mock data
const classOverview = [
  {
    id: "c1",
    name: "3학년 1반",
    students: 28,
    completionRate: 82,
    avgScore: 78,
  },
  {
    id: "c2",
    name: "3학년 2반",
    students: 26,
    completionRate: 75,
    avgScore: 81,
  },
];

const todayStudents = [
  { id: "s1", name: "김민준", status: "completed", score: 95, time: "08:12" },
  { id: "s2", name: "이서연", status: "completed", score: 88, time: "08:25" },
  { id: "s3", name: "박지호", status: "in_progress", score: 0, time: "08:40" },
  { id: "s4", name: "최수아", status: "completed", score: 72, time: "08:05" },
  { id: "s5", name: "정예준", status: "not_started", score: 0, time: "" },
  { id: "s6", name: "강하은", status: "completed", score: 91, time: "08:18" },
  { id: "s7", name: "윤도윤", status: "not_started", score: 0, time: "" },
  { id: "s8", name: "임지유", status: "completed", score: 85, time: "08:30" },
];

const recentActivity = [
  {
    id: "a1",
    text: "김민준 학생이 오늘의 학습을 완료했습니다. (95점)",
    time: "5분 전",
    type: "complete",
  },
  {
    id: "a2",
    text: "이서연 학생이 7일 연속 뱃지를 획득했습니다!",
    time: "12분 전",
    type: "badge",
  },
  {
    id: "a3",
    text: "3학년 1반 주간 완료율이 80%를 넘었습니다.",
    time: "30분 전",
    type: "milestone",
  },
  {
    id: "a4",
    text: "강하은 학생이 수학에서 만점을 받았습니다!",
    time: "45분 전",
    type: "perfect",
  },
  {
    id: "a5",
    text: "박지호 학생이 학습을 시작했습니다.",
    time: "1시간 전",
    type: "start",
  },
];

const weeklyTrend = Array.from({ length: 7 }, (_, i) => ({
  day: format(subDays(new Date(), 6 - i), "E", { locale: ko }),
  completion: Math.floor(Math.random() * 20) + 70,
}));

const subjectPerformance = [
  { name: "수학", avg: 78, color: "#FF6B35" },
  { name: "국어", avg: 82, color: "#4ECDC4" },
  { name: "맞춤법", avg: 88, color: "#A18CD1" },
  { name: "어휘", avg: 71, color: "#FF8BA7" },
  { name: "영어", avg: 65, color: "#4169E1" },
  { name: "한자", avg: 58, color: "#8B4513" },
  { name: "상식", avg: 85, color: "#F9CA24" },
];

const STATUS_CONFIG = {
  completed: {
    label: "완료",
    color: "bg-emerald-500",
    badge: "default" as const,
  },
  in_progress: {
    label: "진행 중",
    color: "bg-amber-500",
    badge: "secondary" as const,
  },
  not_started: {
    label: "미시작",
    color: "bg-gray-300",
    badge: "outline" as const,
  },
};

export default function TeacherDashboardPage() {
  const totalStudents = classOverview.reduce((sum, c) => sum + c.students, 0);
  const todayCompleted = todayStudents.filter(
    (s) => s.status === "completed",
  ).length;
  const avgCompletion = Math.round(
    classOverview.reduce((sum, c) => sum + c.completionRate, 0) /
      classOverview.length,
  );
  const avgScore = Math.round(
    classOverview.reduce((sum, c) => sum + c.avgScore, 0) /
      classOverview.length,
  );

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
          value={`${todayCompleted}/${todayStudents.length}`}
          change={5}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-50 dark:bg-emerald-950/30"
        />
        <StatsCard
          icon={TrendingUp}
          title="완료율"
          value={`${avgCompletion}%`}
          change={3}
          iconColor="text-primary"
          iconBg="bg-primary/10"
        />
        <StatsCard
          icon={BookOpen}
          title="평균 점수"
          value={`${avgScore}점`}
          change={2}
          iconColor="text-amber-500"
          iconBg="bg-amber-50 dark:bg-amber-950/30"
        />
      </div>

      {/* Class Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          {classOverview.map((cls) => (
            <Card
              key={cls.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{cls.name}</h3>
                  <Badge variant="secondary">{cls.students}명</Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">완료율</span>
                      <span className="font-medium">{cls.completionRate}%</span>
                    </div>
                    <Progress value={cls.completionRate} className="h-2" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">평균 점수</span>
                    <span className="font-semibold text-primary">
                      {cls.avgScore}점
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

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
                  {recentActivity.map((activity) => (
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
                  ))}
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
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={subjectPerformance} margin={{ left: -10 }}>
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
                  <Bar dataKey="avg" radius={[4, 4, 0, 0]} maxBarSize={36}>
                    {subjectPerformance.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// Additional icons for recent activity
import { Award, Star } from "lucide-react";
