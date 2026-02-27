"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { format, subDays } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Heart,
  Plus,
  Flame,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Star,
  UserPlus,
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

interface Child {
  id: string;
  name: string;
  grade: number;
  className: string;
  school: string;
  streak: number;
  avgScore: number;
  totalSessions: number;
  totalPoints: number;
  weeklyTrend: { day: string; score: number }[];
  bestSubject: string;
  weakSubject: string;
  lastActive: string;
}

const mockChildren: Child[] = [
  {
    id: "child1",
    name: "김아라",
    grade: 3,
    className: "1반",
    school: "아라초등학교",
    streak: 15,
    avgScore: 85,
    totalSessions: 42,
    totalPoints: 3420,
    weeklyTrend: [
      { day: "월", score: 88 },
      { day: "화", score: 92 },
      { day: "수", score: 85 },
      { day: "목", score: 90 },
      { day: "금", score: 95 },
      { day: "토", score: 0 },
      { day: "일", score: 0 },
    ],
    bestSubject: "맞춤법",
    weakSubject: "한자",
    lastActive: "오늘 08:12",
  },
  {
    id: "child2",
    name: "김하루",
    grade: 1,
    className: "2반",
    school: "아라초등학교",
    streak: 5,
    avgScore: 78,
    totalSessions: 28,
    totalPoints: 1250,
    weeklyTrend: [
      { day: "월", score: 75 },
      { day: "화", score: 80 },
      { day: "수", score: 72 },
      { day: "목", score: 78 },
      { day: "금", score: 82 },
      { day: "토", score: 0 },
      { day: "일", score: 0 },
    ],
    bestSubject: "국어",
    weakSubject: "수학",
    lastActive: "어제",
  },
];

export default function ParentChildrenPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [email, setEmail] = useState("");

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

        {/* Children List */}
        <div className="space-y-6">
          {mockChildren.map((child, idx) => (
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
                        {child.school} | {child.grade}학년 {child.className} |
                        마지막 활동: {child.lastActive}
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
