"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format, subDays } from "date-fns";
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { useAuthStore } from "@/stores/authStore";
import { localGetAllUsers } from "@/lib/local-auth";
import {
  getLearningRecords,
  getSubjectStats,
  getStreakCount,
} from "@/lib/local-storage";
import type { Profile } from "@/types/database";

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

interface SubjectAnalysisItem {
  name: string;
  avg: number;
  highest: number;
  lowest: number;
  color: string;
}

interface StudentRankItem {
  rank: number;
  name: string;
  avgScore: number;
  streak: number;
}

export default function TeacherReportsPage() {
  const { user } = useAuthStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const [dateStart, setDateStart] = useState<Date | undefined>();
  const [dateEnd, setDateEnd] = useState<Date | undefined>();

  // Computed data
  const [classPerformance, setClassPerformance] = useState<
    { week: string; avgScore: number; completion: number }[]
  >([]);
  const [subjectAnalysis, setSubjectAnalysis] = useState<SubjectAnalysisItem[]>(
    [],
  );
  const [studentRanking, setStudentRanking] = useState<StudentRankItem[]>([]);
  const [attendanceData, setAttendanceData] = useState<
    { date: string; attended: number; total: number }[]
  >([]);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (!user) return;

    const allUsers = localGetAllUsers();
    const myStudents = allUsers.filter(
      (u) =>
        u.role === "student" &&
        (u.teacher_id === user.id ||
          (user.school_name && u.school_name === user.school_name)),
    );

    if (myStudents.length === 0) {
      setIsLoaded(true);
      return;
    }

    let anyData = false;

    // --- Weekly performance trend (last 8 weeks + this week) ---
    const weeklyPerf: {
      week: string;
      scores: number[];
      completions: number;
    }[] = [];
    for (let w = 8; w >= 0; w--) {
      const weekEnd = subDays(new Date(), w * 7);
      const weekStart = subDays(weekEnd, 6);
      const weekLabel = w === 0 ? "이번 주" : `${w}주 전`;

      let weekScores: number[] = [];
      let weekCompletions = 0;

      for (const student of myStudents) {
        const records = getLearningRecords(student.id);
        const completedInWeek = records.filter((r) => {
          if (!r.is_completed) return false;
          const d = new Date(r.completed_at || r.created_at);
          return d >= weekStart && d <= weekEnd;
        });

        if (completedInWeek.length > 0) {
          weekCompletions++;
          for (const r of completedInWeek) {
            if (r.max_score > 0) {
              weekScores.push(Math.round((r.total_score / r.max_score) * 100));
            }
          }
        }
      }

      if (weekScores.length > 0) anyData = true;

      weeklyPerf.push({
        week: weekLabel,
        scores: weekScores,
        completions: weekCompletions,
      });
    }

    setClassPerformance(
      weeklyPerf.map((wp) => ({
        week: wp.week,
        avgScore:
          wp.scores.length > 0
            ? Math.round(
                wp.scores.reduce((a, b) => a + b, 0) / wp.scores.length,
              )
            : 0,
        completion:
          myStudents.length > 0
            ? Math.round((wp.completions / myStudents.length) * 100)
            : 0,
      })),
    );

    // --- Subject analysis (aggregated across all students) ---
    const subjectAgg: Record<string, { scores: number[] }> = {};
    for (const student of myStudents) {
      const stats = getSubjectStats(student.id);
      for (const [subj, data] of Object.entries(stats)) {
        if (!subjectAgg[subj]) subjectAgg[subj] = { scores: [] };
        subjectAgg[subj].scores.push(data.accuracy);
      }
    }

    const subjAnalysisList: SubjectAnalysisItem[] = Object.entries(subjectAgg)
      .map(([subj, data]) => {
        const scores = data.scores;
        if (scores.length > 0) anyData = true;
        return {
          name: SUBJECT_NAMES[subj] || subj,
          avg:
            scores.length > 0
              ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
              : 0,
          highest: scores.length > 0 ? Math.max(...scores) : 0,
          lowest: scores.length > 0 ? Math.min(...scores) : 0,
          color: SUBJECT_COLORS[subj] || "#888",
        };
      })
      .sort((a, b) => b.avg - a.avg);
    setSubjectAnalysis(subjAnalysisList);

    // --- Student ranking by average score ---
    const rankings: { name: string; avgScore: number; streak: number }[] = [];
    for (const student of myStudents) {
      const records = getLearningRecords(student.id);
      const completed = records.filter((r) => r.is_completed);
      if (completed.length === 0) continue;

      const totalPct = completed.reduce((sum, r) => {
        return (
          sum + (r.max_score > 0 ? (r.total_score / r.max_score) * 100 : 0)
        );
      }, 0);
      const avg = Math.round(totalPct / completed.length);
      const streak = getStreakCount(student.id);

      rankings.push({ name: student.name, avgScore: avg, streak });
    }

    rankings.sort((a, b) => b.avgScore - a.avgScore);
    if (rankings.length > 0) anyData = true;
    setStudentRanking(
      rankings.slice(0, 10).map((r, i) => ({ ...r, rank: i + 1 })),
    );

    // --- Attendance data (last 20 days) ---
    const attData: { date: string; attended: number; total: number }[] = [];
    for (let i = 19; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, "yyyy-MM-dd");
      const displayDate = format(d, "M/d");

      let attended = 0;
      for (const student of myStudents) {
        const records = getLearningRecords(student.id);
        const hasRecord = records.some((r) => {
          if (!r.is_completed) return false;
          const rd = (r.completed_at || r.created_at).split("T")[0];
          return rd === dateStr;
        });
        if (hasRecord) attended++;
      }

      attData.push({ date: displayDate, attended, total: myStudents.length });
    }
    setAttendanceData(attData);

    setHasData(anyData);
    setIsLoaded(true);
  }, [user]);

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

      {!hasData ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-lg font-medium">
                아직 리포트 데이터가 없습니다
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                학생들이 학습을 시작하면 여기에 분석 결과가 표시됩니다
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
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
                      <linearGradient
                        id="scoreGrad"
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
                      <linearGradient
                        id="completionGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#4ECDC4"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#4ECDC4"
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
                  {subjectAnalysis.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[280px]">
                      <BarChart3 className="h-8 w-8 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        과목별 데이터가 없습니다
                      </p>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
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
                </CardHeader>
                <CardContent>
                  {studentRanking.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[280px]">
                      <Award className="h-8 w-8 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        순위 데이터가 없습니다
                      </p>
                    </div>
                  ) : (
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
                            <p className="text-sm font-medium">
                              {student.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold">
                              {student.avgScore}점
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      className="fill-muted-foreground"
                    />
                    <YAxis
                      domain={[
                        0,
                        Math.max(10, ...attendanceData.map((d) => d.total)),
                      ]}
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
        </>
      )}
    </div>
  );
}
