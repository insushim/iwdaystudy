"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { format, subDays, subWeeks } from "date-fns";
import { ko } from "date-fns/locale";
import {
  FileText,
  Download,
  Calendar as CalendarIcon,
  TrendingUp,
  Users,
  Award,
  BarChart3,
  Filter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from "recharts";

// Mock report data
const classPerformance = Array.from({ length: 8 }, (_, i) => ({
  week: `${8 - i}주 전`,
  avgScore: Math.floor(Math.random() * 15) + 70,
  completion: Math.floor(Math.random() * 15) + 75,
}));
classPerformance.push({ week: "이번 주", avgScore: 82, completion: 85 });

const subjectAnalysis = [
  { name: "수학", avg: 78, highest: 100, lowest: 35, color: "#FF6B35" },
  { name: "국어", avg: 82, highest: 100, lowest: 45, color: "#4ECDC4" },
  { name: "맞춤법", avg: 88, highest: 100, lowest: 50, color: "#A18CD1" },
  { name: "어휘", avg: 71, highest: 95, lowest: 30, color: "#FF8BA7" },
  { name: "영어", avg: 65, highest: 100, lowest: 20, color: "#4169E1" },
  { name: "한자", avg: 58, highest: 90, lowest: 15, color: "#8B4513" },
  { name: "상식", avg: 85, highest: 100, lowest: 55, color: "#F9CA24" },
];

const studentRanking = [
  { rank: 1, name: "강하은", avgScore: 95, streak: 22, change: 0 },
  { rank: 2, name: "김민준", avgScore: 92, streak: 15, change: 1 },
  { rank: 3, name: "김하린", avgScore: 91, streak: 18, change: -1 },
  { rank: 4, name: "이서연", avgScore: 88, streak: 12, change: 2 },
  { rank: 5, name: "조서준", avgScore: 87, streak: 10, change: 0 },
  { rank: 6, name: "임지유", avgScore: 84, streak: 7, change: 1 },
  { rank: 7, name: "박서윤", avgScore: 83, streak: 9, change: -2 },
  { rank: 8, name: "한소율", avgScore: 79, streak: 5, change: 0 },
  { rank: 9, name: "정시우", avgScore: 77, streak: 6, change: 3 },
  { rank: 10, name: "최수아", avgScore: 76, streak: 8, change: -1 },
];

const attendanceData = Array.from({ length: 20 }, (_, i) => ({
  date: format(subDays(new Date(), 19 - i), "M/d"),
  attended: Math.floor(Math.random() * 5) + 22,
  total: 28,
}));

export default function TeacherReportsPage() {
  const [selectedClass, setSelectedClass] = useState("all");
  const [dateStart, setDateStart] = useState<Date | undefined>();
  const [dateEnd, setDateEnd] = useState<Date | undefined>();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            리포트
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            학급 성과를 분석하고 리포트를 확인하세요
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          PDF 내보내기
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="학급 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 학급</SelectItem>
                  <SelectItem value="c1">3학년 1반</SelectItem>
                  <SelectItem value="c2">3학년 2반</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {dateStart
                      ? `${format(dateStart, "M/d")} - ${dateEnd ? format(dateEnd, "M/d") : "..."}`
                      : "기간 선택"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateStart}
                    onSelect={(d) => {
                      if (!dateStart || dateEnd) {
                        setDateStart(d ?? undefined);
                        setDateEnd(undefined);
                      } else {
                        setDateEnd(d ?? undefined);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              학급 성과 추이
            </CardTitle>
            <CardDescription>주간 평균 점수와 완료율 변화</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={classPerformance}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2ECC71" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="completionGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="avgScore"
                  stroke="#2ECC71"
                  fill="url(#scoreGrad)"
                  strokeWidth={2}
                  name="평균 점수"
                />
                <Area
                  type="monotone"
                  dataKey="completion"
                  stroke="#4ECDC4"
                  fill="url(#completionGrad)"
                  strokeWidth={2}
                  name="완료율 (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Subject Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                과목별 분석
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={subjectAnalysis} margin={{ left: -10 }}>
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
                    formatter={(value: number, name: string) => {
                      const label =
                        name === "avg"
                          ? "평균"
                          : name === "highest"
                            ? "최고"
                            : "최저";
                      return [`${value}점`, label];
                    }}
                  />
                  <Bar
                    dataKey="avg"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={36}
                    name="avg"
                  >
                    {subjectAnalysis.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {subjectAnalysis.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      <span>{s.name}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>평균 {s.avg}</span>
                      <span>최고 {s.highest}</span>
                      <span>최저 {s.lowest}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Student Ranking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                학생 순위 (평균 점수)
              </CardTitle>
              <CardDescription>참여 동의 학생만 표시됩니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {studentRanking.map((student) => (
                  <div
                    key={student.rank}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        student.rank <= 3
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {student.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{student.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">
                        {student.avgScore}점
                      </span>
                      {student.change !== 0 && (
                        <Badge
                          variant={
                            student.change > 0 ? "default" : "destructive"
                          }
                          className="text-[10px] h-5"
                        >
                          {student.change > 0
                            ? `+${student.change}`
                            : student.change}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Attendance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              학습 참여 현황
            </CardTitle>
            <CardDescription>일별 학습 참여 학생 수</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  className="fill-muted-foreground"
                />
                <YAxis
                  domain={[0, 30]}
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
                  formatter={(value: number) => [`${value}명`, "참여"]}
                />
                <Bar
                  dataKey="attended"
                  fill="#2ECC71"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
