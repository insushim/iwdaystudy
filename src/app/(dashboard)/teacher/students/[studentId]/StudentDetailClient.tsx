"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  User,
  ArrowLeft,
  Flame,
  Award,
  BookOpen,
  Clock,
  Mail,
  School,
  MessageSquare,
  Send,
  CalendarCheck,
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
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { StreakCalendar } from "@/components/dashboard/StreakCalendar";
import { localGetAllUsers } from "@/lib/local-auth";
import {
  getLearningRecords,
  getSubjectStats,
  getStreakCount,
  getTotalPoints,
  getCompletedDates,
  getEarnedBadges,
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

const RARITY_COLORS: Record<string, string> = {
  common: "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800",
  rare: "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/40",
  epic: "border-purple-400 bg-purple-50 dark:border-purple-500 dark:bg-purple-950/40",
  legendary:
    "border-amber-400 bg-amber-50 dark:border-amber-500 dark:bg-amber-950/40",
};

interface StudentInfo {
  id: string;
  name: string;
  grade: number;
  className: string;
  school: string;
  streak: number;
  totalPoints: number;
  totalSessions: number;
  avgScore: number;
  joinedAt: string;
}

interface RecentRecord {
  date: string;
  score: number;
  timeSpent: number;
  subjects: string[];
}

interface EarnedBadge {
  icon: string;
  name: string;
  rarity: string;
}

export default function StudentDetailClient() {
  const params = useParams();
  const studentId = params.studentId as string;

  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [subjectRadar, setSubjectRadar] = useState<
    { subject: string; score: number }[]
  >([]);
  const [recentRecords, setRecentRecords] = useState<RecentRecord[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [calendarData, setCalendarData] = useState<
    { date: string; score: number; completed: boolean }[]
  >([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState<{ date: string; text: string }[]>([]);

  useEffect(() => {
    if (!studentId) return;

    const allUsers = localGetAllUsers();
    const student = allUsers.find((u) => u.id === studentId);

    if (!student) {
      setIsLoaded(true);
      return;
    }

    // Basic student info
    const records = getLearningRecords(studentId);
    const completedRecords = records.filter((r) => r.is_completed);
    const streak = getStreakCount(studentId);
    const totalPoints = getTotalPoints(studentId);

    let avgScore = 0;
    if (completedRecords.length > 0) {
      const totalPct = completedRecords.reduce((sum, r) => {
        return (
          sum + (r.max_score > 0 ? (r.total_score / r.max_score) * 100 : 0)
        );
      }, 0);
      avgScore = Math.round(totalPct / completedRecords.length);
    }

    setStudentInfo({
      id: student.id,
      name: student.name,
      grade: student.grade || 0,
      className: student.class_name || "-",
      school: student.school_name || "-",
      streak,
      totalPoints,
      totalSessions: completedRecords.length,
      avgScore,
      joinedAt: student.created_at ? student.created_at.split("T")[0] : "-",
    });

    // Subject radar chart from real stats
    const subStats = getSubjectStats(studentId);
    const radarData = Object.entries(subStats).map(([subj, data]) => ({
      subject: SUBJECT_NAMES[subj] || subj,
      score: data.accuracy,
    }));
    setSubjectRadar(radarData.length > 0 ? radarData : []);

    // Recent records (last 10 completed)
    const sortedRecords = [...completedRecords]
      .sort(
        (a, b) =>
          new Date(b.completed_at || b.created_at).getTime() -
          new Date(a.completed_at || a.created_at).getTime(),
      )
      .slice(0, 10);

    const recentList: RecentRecord[] = sortedRecords.map((r) => {
      const score =
        r.max_score > 0 ? Math.round((r.total_score / r.max_score) * 100) : 0;
      const timeSpent = Math.round(r.time_spent_seconds / 60);
      return {
        date: (r.completed_at || r.created_at).split("T")[0],
        score,
        timeSpent,
        subjects: [], // We don't have per-record subject breakdown easily
      };
    });
    setRecentRecords(recentList);

    // Earned badges
    const badges = getEarnedBadges(studentId);
    setEarnedBadges(
      badges.map((b) => ({
        icon: b.icon,
        name: b.name,
        rarity: b.rarity,
      })),
    );

    // Calendar data from completed dates
    const completedDateSet = new Set(getCompletedDates(studentId));
    const calData: { date: string; score: number; completed: boolean }[] = [];
    const today = new Date();
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const completed = completedDateSet.has(dateStr);

      // Find score for this day
      let dayScore = 0;
      if (completed) {
        const dayRecords = completedRecords.filter((r) => {
          const rd = (r.completed_at || r.created_at).split("T")[0];
          return rd === dateStr;
        });
        if (dayRecords.length > 0) {
          const totalPct = dayRecords.reduce((sum, r) => {
            return (
              sum + (r.max_score > 0 ? (r.total_score / r.max_score) * 100 : 0)
            );
          }, 0);
          dayScore = Math.round(totalPct / dayRecords.length);
        }
      }

      calData.push({ date: dateStr, score: dayScore, completed });
    }
    setCalendarData(calData);

    // Load saved notes from localStorage
    try {
      const savedNotes = localStorage.getItem(`teacher_notes_${studentId}`);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch {
      // ignore
    }

    setIsLoaded(true);
  }, [studentId]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const updated = [
      { date: format(new Date(), "yyyy-MM-dd"), text: newNote },
      ...notes,
    ];
    setNotes(updated);
    setNewNote("");
    // Persist notes to localStorage
    try {
      localStorage.setItem(
        `teacher_notes_${studentId}`,
        JSON.stringify(updated),
      );
    } catch {
      // ignore
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground">데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (!studentInfo) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href="/teacher/students">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 mb-3">
              <ArrowLeft className="h-4 w-4" />
              학생 목록
            </Button>
          </Link>
        </motion.div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <User className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-lg font-medium">
              학생을 찾을 수 없습니다
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link href="/teacher/students">
          <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 mb-3">
            <ArrowLeft className="h-4 w-4" />
            학생 목록
          </Button>
        </Link>
      </motion.div>

      {/* Student Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-6">
              <Avatar className="h-16 w-16 text-2xl">
                <AvatarFallback>{studentInfo.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-[200px]">
                <h1 className="text-2xl font-bold">{studentInfo.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <School className="h-3.5 w-3.5" />
                    {studentInfo.school}
                  </span>
                  <span>
                    {studentInfo.grade}학년 {studentInfo.className}
                  </span>
                  <span>가입: {studentInfo.joinedAt}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-center">
                <div className="px-4">
                  <div className="flex items-center justify-center gap-1 text-orange-500 mb-0.5">
                    <Flame className="h-4 w-4" />
                  </div>
                  <p className="text-xl font-bold">{studentInfo.streak}일</p>
                  <p className="text-xs text-muted-foreground">연속 학습</p>
                </div>
                <div className="px-4">
                  <p className="text-xl font-bold text-primary">
                    {studentInfo.avgScore}점
                  </p>
                  <p className="text-xs text-muted-foreground">평균 점수</p>
                </div>
                <div className="px-4">
                  <p className="text-xl font-bold">
                    {studentInfo.totalSessions}회
                  </p>
                  <p className="text-xs text-muted-foreground">총 학습</p>
                </div>
                <div className="px-4">
                  <p className="text-xl font-bold text-amber-500">
                    {studentInfo.totalPoints.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">포인트</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <StreakCalendar data={calendarData} />
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                과목별 성적
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subjectRadar.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px]">
                  <BookOpen className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    아직 과목별 데이터가 없습니다
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart
                    data={subjectRadar}
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                  >
                    <PolarGrid className="stroke-muted" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{
                        fontSize: 12,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fontSize: 10 }}
                      className="fill-muted-foreground"
                    />
                    <Radar
                      name="점수"
                      dataKey="score"
                      stroke="#2ECC71"
                      fill="#2ECC71"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Records */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-primary" />
                최근 학습 기록
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px]">
                {recentRecords.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[260px]">
                    <CalendarCheck className="h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      아직 학습 기록이 없습니다
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentRecords.map((record, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {format(new Date(record.date), "M월 d일 (E)", {
                              locale: ko,
                            })}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {record.timeSpent}분
                            </span>
                          </div>
                          {record.subjects.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {record.subjects.map((s, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-xl font-bold text-primary">
                          {record.score}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Badge Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              획득한 뱃지 ({earnedBadges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {earnedBadges.length === 0 ? (
              <div className="flex flex-col items-center py-6">
                <Award className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">
                  아직 획득한 뱃지가 없습니다
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {earnedBadges.map((badge, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 ${RARITY_COLORS[badge.rarity] || RARITY_COLORS.common}`}
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <span className="text-xs font-medium">{badge.name}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Feedback / Notes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              메모 / 피드백
            </CardTitle>
            <CardDescription>이 학생에 대한 메모를 기록하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="메모를 입력하세요..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[80px]"
              />
              <Button
                size="icon"
                className="shrink-0 self-end"
                onClick={handleAddNote}
                disabled={!newNote.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {notes.map((note, idx) => (
                <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">
                    {note.date}
                  </p>
                  <p className="text-sm">{note.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
