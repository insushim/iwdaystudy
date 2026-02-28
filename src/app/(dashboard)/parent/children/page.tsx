"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Plus,
  Flame,
  TrendingUp,
  BookOpen,
  Star,
  UserPlus,
  UserX,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuthStore } from "@/stores/authStore";
import { localGetAllUsers } from "@/lib/local-auth";
import {
  getLearningRecords,
  getStreakCount,
  getTotalPoints,
  getSubjectStats,
} from "@/lib/local-storage";

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

interface ChildData {
  id: string;
  name: string;
  grade: number | null;
  className: string | null;
  school: string | null;
  streak: number;
  avgScore: number;
  totalSessions: number;
  totalPoints: number;
  weeklyTrend: { day: string; score: number }[];
  bestSubject: string;
  weakSubject: string;
  lastActive: string;
}

function buildChildData(childProfile: {
  id: string;
  name: string;
  grade: number | null;
  class_name: string | null;
  school_name: string | null;
}): ChildData {
  const records = getLearningRecords(childProfile.id);
  const completedRecords = records.filter((r) => r.is_completed);
  const streak = getStreakCount(childProfile.id);
  const totalPoints = getTotalPoints(childProfile.id);
  const subjectStatsData = getSubjectStats(childProfile.id);

  const avgScore =
    completedRecords.length > 0
      ? Math.round(
          completedRecords.reduce((sum, r) => {
            return (
              sum + (r.max_score > 0 ? (r.total_score / r.max_score) * 100 : 0)
            );
          }, 0) / completedRecords.length,
        )
      : 0;

  // Weekly trend: last 7 days
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const weeklyTrend: { day: string; score: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayRecords = completedRecords.filter(
      (r) => (r.completed_at || r.created_at).split("T")[0] === dateStr,
    );
    const dayScore =
      dayRecords.length > 0
        ? Math.round(
            dayRecords.reduce((sum, r) => {
              return (
                sum +
                (r.max_score > 0 ? (r.total_score / r.max_score) * 100 : 0)
              );
            }, 0) / dayRecords.length,
          )
        : 0;
    weeklyTrend.push({ day: dayNames[d.getDay()], score: dayScore });
  }

  // Best and weak subjects
  const subjectEntries = Object.entries(subjectStatsData).filter(
    ([, s]) => s.total >= 1,
  );
  let bestSubject = "-";
  let weakSubject = "-";
  if (subjectEntries.length > 0) {
    subjectEntries.sort((a, b) => b[1].accuracy - a[1].accuracy);
    bestSubject = SUBJECT_NAMES[subjectEntries[0][0]] || subjectEntries[0][0];
    weakSubject =
      SUBJECT_NAMES[subjectEntries[subjectEntries.length - 1][0]] ||
      subjectEntries[subjectEntries.length - 1][0];
  }

  // Last active
  let lastActive = "기록 없음";
  if (completedRecords.length > 0) {
    const sorted = [...completedRecords].sort(
      (a, b) =>
        new Date(b.completed_at || b.created_at).getTime() -
        new Date(a.completed_at || a.created_at).getTime(),
    );
    const lastDate = new Date(sorted[0].completed_at || sorted[0].created_at);
    const today = new Date();
    const diffDays = Math.floor(
      (today.getTime() - lastDate.getTime()) / 86400000,
    );
    if (diffDays === 0) {
      lastActive = `오늘 ${String(lastDate.getHours()).padStart(2, "0")}:${String(lastDate.getMinutes()).padStart(2, "0")}`;
    } else if (diffDays === 1) {
      lastActive = "어제";
    } else {
      lastActive = `${diffDays}일 전`;
    }
  }

  return {
    id: childProfile.id,
    name: childProfile.name,
    grade: childProfile.grade,
    className: childProfile.class_name,
    school: childProfile.school_name,
    streak,
    avgScore,
    totalSessions: completedRecords.length,
    totalPoints,
    weeklyTrend,
    bestSubject,
    weakSubject,
    lastActive,
  };
}

export default function ParentChildrenPage() {
  const { user } = useAuthStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [email, setEmail] = useState("");
  const [children, setChildren] = useState<ChildData[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    const allUsers = localGetAllUsers();
    const childProfiles = allUsers.filter(
      (u) => u.parent_id === user.id && u.role === "student",
    );
    const childData = childProfiles.map((c) => buildChildData(c));
    setChildren(childData);
    setLoaded(true);
  }, [user]);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              자녀 관리
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              자녀의 학습 현황을 한눈에 확인하세요
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">자녀 추가</span>
          </Button>
        </motion.div>

        {/* Empty state */}
        {loaded && children.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border shadow-sm border-dashed">
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <UserX className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">
                    연결된 자녀가 없습니다
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    &ldquo;자녀 추가&rdquo; 버튼을 눌러 자녀 계정을 연결해
                    주세요.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Children List */}
        <div className="space-y-6">
          {children.map((child, idx) => (
            <motion.div
              key={child.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 text-lg">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {child.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle>{child.name}</CardTitle>
                      <CardDescription>
                        {child.school || ""}{" "}
                        {child.school && (child.grade || child.className)
                          ? "| "
                          : ""}
                        {child.grade ? `${child.grade}학년` : ""}{" "}
                        {child.className || ""} | 마지막 활동:{" "}
                        {child.lastActive}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1.5 text-orange-500">
                      <Flame className="h-5 w-5" />
                      <span className="font-bold">{child.streak}일</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-lg font-bold text-primary">
                        {child.avgScore}점
                      </p>
                      <p className="text-xs text-muted-foreground">평균 점수</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-lg font-bold">
                        {child.totalSessions}회
                      </p>
                      <p className="text-xs text-muted-foreground">총 학습</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-lg font-bold text-amber-500">
                        {child.totalPoints.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">포인트</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-lg font-bold text-orange-500">
                        {child.streak}일
                      </p>
                      <p className="text-xs text-muted-foreground">연속 학습</p>
                    </div>
                  </div>

                  {/* Best/Weak Subjects */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                      <Star className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400">
                          최고 과목
                        </p>
                        <p className="text-sm font-semibold">
                          {child.bestSubject}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                      <BookOpen className="h-4 w-4 text-amber-600" />
                      <div>
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                          보완 과목
                        </p>
                        <p className="text-sm font-semibold">
                          {child.weakSubject}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Trend */}
                  {child.weeklyTrend.some((d) => d.score > 0) ? (
                    <div>
                      <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        이번 주 성적
                      </p>
                      <ResponsiveContainer width="100%" height={150}>
                        <LineChart data={child.weeklyTrend}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-muted"
                          />
                          <XAxis
                            dataKey="day"
                            tick={{ fontSize: 11 }}
                            className="fill-muted-foreground"
                          />
                          <YAxis
                            domain={[0, 100]}
                            tick={{ fontSize: 11 }}
                            className="fill-muted-foreground"
                          />
                          <Tooltip
                            contentStyle={{
                              background: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                            formatter={(value: number) => [
                              value === 0 ? "미학습" : `${value}점`,
                              "점수",
                            ]}
                          />
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#2ECC71"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            connectNulls
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      이번 주 학습 기록이 없습니다
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Child Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              자녀 추가
            </DialogTitle>
            <DialogDescription>자녀의 계정을 연결하세요</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="code">
            <TabsList className="w-full">
              <TabsTrigger value="code" className="flex-1">
                초대 코드
              </TabsTrigger>
              <TabsTrigger value="email" className="flex-1">
                이메일
              </TabsTrigger>
            </TabsList>
            <TabsContent value="code" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="inviteCode">초대 코드</Label>
                <Input
                  id="inviteCode"
                  placeholder="자녀의 초대 코드를 입력하세요"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  자녀의 학생 계정에서 초대 코드를 확인할 수 있습니다.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="email" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="childEmail">자녀 이메일</Label>
                <Input
                  id="childEmail"
                  type="email"
                  placeholder="자녀의 계정 이메일을 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  자녀에게 연결 요청이 전송됩니다.
                </p>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              취소
            </Button>
            <Button
              onClick={() => setShowAddDialog(false)}
              disabled={!inviteCode.trim() && !email.trim()}
            >
              연결하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
