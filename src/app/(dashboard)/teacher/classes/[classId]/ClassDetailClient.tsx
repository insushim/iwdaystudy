"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { format, subDays } from "date-fns";
import { ko } from "date-fns/locale";
import {
  School,
  Users,
  Copy,
  Check,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Share2,
  ClipboardList,
  ArrowLeft,
  ExternalLink,
  Target,
  BarChart3,
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
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
const classInfo = {
  id: "c1",
  name: "3학년 1반",
  grade: 3,
  semester: 1,
  school: "아라초등학교",
  inviteCode: "ARA-3A-2025",
  year: 2025,
  studentCount: 28,
  avgScore: 78,
  completionRate: 82,
};

const students = [
  {
    id: "s1",
    name: "김민준",
    streak: 15,
    todayCompleted: true,
    avgScore: 92,
    lastActive: "오늘 08:12",
  },
  {
    id: "s2",
    name: "이서연",
    streak: 12,
    todayCompleted: true,
    avgScore: 88,
    lastActive: "오늘 08:25",
  },
  {
    id: "s3",
    name: "박지호",
    streak: 3,
    todayCompleted: false,
    avgScore: 71,
    lastActive: "오늘 08:40",
  },
  {
    id: "s4",
    name: "최수아",
    streak: 8,
    todayCompleted: true,
    avgScore: 76,
    lastActive: "오늘 08:05",
  },
  {
    id: "s5",
    name: "정예준",
    streak: 0,
    todayCompleted: false,
    avgScore: 65,
    lastActive: "어제",
  },
  {
    id: "s6",
    name: "강하은",
    streak: 22,
    todayCompleted: true,
    avgScore: 95,
    lastActive: "오늘 08:18",
  },
  {
    id: "s7",
    name: "윤도윤",
    streak: 0,
    todayCompleted: false,
    avgScore: 58,
    lastActive: "3일 전",
  },
  {
    id: "s8",
    name: "임지유",
    streak: 7,
    todayCompleted: true,
    avgScore: 84,
    lastActive: "오늘 08:30",
  },
  {
    id: "s9",
    name: "한소율",
    streak: 5,
    todayCompleted: false,
    avgScore: 79,
    lastActive: "어제",
  },
  {
    id: "s10",
    name: "조서준",
    streak: 10,
    todayCompleted: true,
    avgScore: 87,
    lastActive: "오늘 07:55",
  },
];

const weeklyData = Array.from({ length: 4 }, (_, i) => ({
  week: `${4 - i}주 전`,
  completion: Math.floor(Math.random() * 15) + 75,
  avgScore: Math.floor(Math.random() * 15) + 70,
}));
weeklyData.push({
  week: "이번 주",
  completion: 82,
  avgScore: 78,
});

const subjectData = [
  { name: "수학", avg: 78, color: "#FF6B35" },
  { name: "국어", avg: 82, color: "#4ECDC4" },
  { name: "맞춤법", avg: 88, color: "#A18CD1" },
  { name: "어휘", avg: 71, color: "#FF8BA7" },
  { name: "영어", avg: 65, color: "#4169E1" },
  { name: "한자", avg: 58, color: "#8B4513" },
  { name: "상식", avg: 85, color: "#F9CA24" },
];

const assignments = [
  {
    id: "a1",
    setTitle: "3학년 1학기 25일차",
    dueDate: "2026-02-28",
    completed: 18,
    total: 28,
  },
  {
    id: "a2",
    setTitle: "3학년 1학기 24일차",
    dueDate: "2026-02-27",
    completed: 24,
    total: 28,
  },
];

export default function ClassDetailClient() {
  const params = useParams();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classInfo.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `https://araharu.pages.dev/join/${classInfo.inviteCode}`,
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const todayCompleted = students.filter((s) => s.todayCompleted).length;

  return (
    <div className="space-y-6">
      {/* Back & Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link href="/teacher/classes">
          <Button variant="ghost" size="sm" className="gap-1.5 mb-3 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            학급 목록
          </Button>
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <School className="h-6 w-6 text-primary" />
              {classInfo.name}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {classInfo.school} | {classInfo.grade}학년 {classInfo.semester}
              학기 | {classInfo.year}년
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleCopyCode}
            >
              {copiedCode ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copiedCode ? "복사됨" : classInfo.inviteCode}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleCopyLink}
            >
              <Share2 className="h-3.5 w-3.5" />
              {copiedLink ? "복사됨" : "초대 링크"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          icon={Users}
          title="학생 수"
          value={classInfo.studentCount}
          iconColor="text-blue-500"
          iconBg="bg-blue-50 dark:bg-blue-950/30"
        />
        <StatsCard
          icon={CheckCircle2}
          title="오늘 완료"
          value={`${todayCompleted}/${students.length}`}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-50 dark:bg-emerald-950/30"
        />
        <StatsCard
          icon={TrendingUp}
          title="완료율"
          value={`${classInfo.completionRate}%`}
          change={4}
          iconColor="text-primary"
          iconBg="bg-primary/10"
        />
        <StatsCard
          icon={Target}
          title="평균 점수"
          value={`${classInfo.avgScore}점`}
          change={2}
          iconColor="text-amber-500"
          iconBg="bg-amber-50 dark:bg-amber-950/30"
        />
      </div>

      {/* Student List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              학생 목록
            </CardTitle>
            <CardDescription>
              {todayCompleted}/{students.length}명 학습 완료
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {students
                  .sort((a, b) =>
                    a.todayCompleted === b.todayCompleted
                      ? b.avgScore - a.avgScore
                      : a.todayCompleted
                        ? -1
                        : 1,
                  )
                  .map((student, idx) => (
                    <Link
                      key={student.id}
                      href={`/teacher/students/${student.id}`}
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.02 * idx }}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                      >
                        <Avatar size="sm">
                          <AvatarFallback>{student.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {student.name}
                            </span>
                            {student.streak > 0 && (
                              <span className="flex items-center gap-0.5 text-[10px] text-orange-500 font-medium">
                                <Flame className="h-3 w-3" />
                                {student.streak}일
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {student.lastActive}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">
                            {student.avgScore}점
                          </span>
                          {student.todayCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground/40" />
                          )}
                          <ExternalLink className="h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors" />
                        </div>
                      </motion.div>
                    </Link>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                주간 추이
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
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
                    dataKey="completion"
                    stroke="#2ECC71"
                    strokeWidth={2}
                    name="완료율 (%)"
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgScore"
                    stroke="#4ECDC4"
                    strokeWidth={2}
                    name="평균점수"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                과목별 평균
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={subjectData} margin={{ left: -10 }}>
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
                    {subjectData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Active Assignments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                진행 중인 과제
              </CardTitle>
              <Link href="/teacher/assignments">
                <Button variant="ghost" size="sm">
                  전체 보기
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium">{assignment.setTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    마감: {assignment.dueDate}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {assignment.completed}/{assignment.total}
                    </p>
                    <p className="text-[10px] text-muted-foreground">완료</p>
                  </div>
                  <Progress
                    value={(assignment.completed / assignment.total) * 100}
                    className="w-16 h-2"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
