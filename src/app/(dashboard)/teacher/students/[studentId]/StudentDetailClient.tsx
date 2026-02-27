"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { format, subDays } from "date-fns";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

// Mock student data
const studentInfo = {
  id: "s1",
  name: "김민준",
  grade: 3,
  className: "1반",
  school: "아라초등학교",
  streak: 15,
  totalPoints: 2450,
  totalSessions: 42,
  avgScore: 92,
  joinedAt: "2025-03-05",
};

const subjectRadar = [
  { subject: "수학", score: 88 },
  { subject: "국어", score: 82 },
  { subject: "맞춤법", score: 95 },
  { subject: "어휘", score: 78 },
  { subject: "영어", score: 72 },
  { subject: "한자", score: 60 },
  { subject: "상식", score: 90 },
  { subject: "글쓰기", score: 85 },
];

const recentRecords = [
  { date: "2026-02-27", score: 95, timeSpent: 22, subjects: ["수학 100", "국어 85", "맞춤법 100"] },
  { date: "2026-02-26", score: 88, timeSpent: 25, subjects: ["수학 90", "국어 80", "영어 95"] },
  { date: "2026-02-25", score: 92, timeSpent: 20, subjects: ["수학 95", "한자 80", "상식 100"] },
  { date: "2026-02-24", score: 85, timeSpent: 28, subjects: ["수학 80", "어휘 75", "글쓰기 100"] },
  { date: "2026-02-23", score: 90, timeSpent: 18, subjects: ["수학 90", "국어 90", "맞춤법 90"] },
];

const earnedBadges = [
  { icon: "🌱", name: "첫 걸음", rarity: "common" },
  { icon: "🔥", name: "3일 연속", rarity: "common" },
  { icon: "⭐", name: "7일 연속", rarity: "rare" },
  { icon: "🧮", name: "수학 천재", rarity: "rare" },
  { icon: "🏆", name: "30일 연속", rarity: "epic" },
  { icon: "✍️", name: "맞춤법 왕", rarity: "rare" },
];

const feedbackNotes = [
  { date: "2026-02-20", text: "한자 영역에서 어려움을 보이고 있습니다. 가정에서 한자 카드 연습을 권장합니다." },
  { date: "2026-02-10", text: "수학 성적이 크게 향상되었습니다. 칭찬해주세요!" },
];

// Calendar mock data
function generateCalendarData() {
  const data = [];
  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const date = subDays(today, i);
    const completed = Math.random() > 0.15;
    data.push({
      date: format(date, "yyyy-MM-dd"),
      score: completed ? Math.floor(Math.random() * 20) + 80 : 0,
      completed,
    });
  }
  return data;
}

const calendarData = generateCalendarData();

const RARITY_COLORS: Record<string, string> = {
  common: "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800",
  rare: "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/40",
  epic: "border-purple-400 bg-purple-50 dark:border-purple-500 dark:bg-purple-950/40",
  legendary: "border-amber-400 bg-amber-50 dark:border-amber-500 dark:bg-amber-950/40",
};

export default function StudentDetailClient() {
  const params = useParams();
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState(feedbackNotes);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotes([
      { date: format(new Date(), "yyyy-MM-dd"), text: newNote },
      ...notes,
    ]);
    setNewNote("");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="teacher" userName="김선생" />
      <main className="flex-1 pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
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
                      <span>{studentInfo.grade}학년 {studentInfo.className}</span>
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
                      <p className="text-xl font-bold text-primary">{studentInfo.avgScore}점</p>
                      <p className="text-xs text-muted-foreground">평균 점수</p>
                    </div>
                    <div className="px-4">
                      <p className="text-xl font-bold">{studentInfo.totalSessions}회</p>
                      <p className="text-xs text-muted-foreground">총 학습</p>
                    </div>
                    <div className="px-4">
                      <p className="text-xl font-bold text-amber-500">{studentInfo.totalPoints.toLocaleString()}</p>
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
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={subjectRadar} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid className="stroke-muted" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
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
                    <div className="space-y-3">
                      {recentRecords.map((record, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between p-3 bg-muted/30 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {format(new Date(record.date), "M월 d일 (E)", { locale: ko })}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{record.timeSpent}분</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {record.subjects.map((s, i) => (
                                <Badge key={i} variant="outline" className="text-[10px]">
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <span className="text-xl font-bold text-primary">{record.score}</span>
                        </div>
                      ))}
                    </div>
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
                <div className="flex flex-wrap gap-3">
                  {earnedBadges.map((badge, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 ${RARITY_COLORS[badge.rarity]}`}
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <span className="text-xs font-medium">{badge.name}</span>
                    </div>
                  ))}
                </div>
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
                      <p className="text-xs text-muted-foreground mb-1">{note.date}</p>
                      <p className="text-sm">{note.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <MobileNav role="teacher" />
    </div>
  );
}
