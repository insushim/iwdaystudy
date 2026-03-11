"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  School,
  Users,
  Copy,
  Check,
  Flame,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Share2,
  ArrowLeft,
  ExternalLink,
  Target,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { localGetClassStudents } from "@/lib/local-auth";
import { getLearningRecords } from "@/lib/local-storage";
import type { Profile } from "@/types/database";

interface ClassData {
  id: string;
  name: string;
  grade: number;
  semester: number;
  studentCount: number;
  inviteCode: string;
  isActive: boolean;
  completionRate: number;
  avgScore: number;
  createdAt: string;
}

const CLASSES_KEY = "araharu-classes";

function loadClassById(id: string): ClassData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CLASSES_KEY);
    const classes: ClassData[] = raw ? JSON.parse(raw) : [];
    return classes.find((c) => c.id === id) || null;
  } catch {
    return null;
  }
}

interface StudentWithStats {
  id: string;
  name: string;
  studentNumber: number | null;
  streak: number;
  totalPoints: number;
  todayCompleted: boolean;
  avgScore: number;
  lastActive: string;
}

function buildStudentStats(students: Profile[]): StudentWithStats[] {
  const today = new Date().toISOString().split("T")[0];

  return students.map((s) => {
    const records = getLearningRecords(s.id);
    const completedRecords = records.filter((r) => r.is_completed);

    const todayCompleted = completedRecords.some(
      (r) => (r.completed_at || r.created_at).split("T")[0] === today,
    );

    const avgScore =
      completedRecords.length > 0
        ? Math.round(
            completedRecords.reduce(
              (sum, r) =>
                sum +
                (r.max_score > 0 ? (r.total_score / r.max_score) * 100 : 0),
              0,
            ) / completedRecords.length,
          )
        : 0;

    let lastActive = "활동 없음";
    if (completedRecords.length > 0) {
      const latest = completedRecords.sort(
        (a, b) =>
          new Date(b.completed_at || b.created_at).getTime() -
          new Date(a.completed_at || a.created_at).getTime(),
      )[0];
      const latestDate = (latest.completed_at || latest.created_at).split(
        "T",
      )[0];
      if (latestDate === today) {
        lastActive = "오늘";
      } else {
        const diff = Math.floor(
          (new Date().getTime() - new Date(latestDate).getTime()) / 86400000,
        );
        lastActive = diff === 1 ? "어제" : `${diff}일 전`;
      }
    }

    return {
      id: s.id,
      name: s.name,
      studentNumber: s.student_number,
      streak: s.streak_count,
      totalPoints: s.total_points,
      todayCompleted,
      avgScore,
      lastActive,
    };
  });
}

export default function ClassDetailClient() {
  const params = useParams();
  const classId = params.classId as string;

  const [classInfo, setClassInfo] = useState<ClassData | null>(null);
  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const cls = loadClassById(classId);
    setClassInfo(cls);

    if (cls) {
      const classStudents = localGetClassStudents(classId);
      setStudents(buildStudentStats(classStudents));
    }
  }, [classId]);

  if (!classInfo) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <School className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">학급을 찾을 수 없습니다.</p>
        <Link href="/teacher/classes">
          <Button variant="outline" className="mt-4">
            학급 목록으로
          </Button>
        </Link>
      </div>
    );
  }

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
  const classAvgScore =
    students.length > 0
      ? Math.round(
          students.reduce((sum, s) => sum + s.avgScore, 0) / students.length,
        )
      : 0;
  const completionRate =
    students.length > 0
      ? Math.round((todayCompleted / students.length) * 100)
      : 0;

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
              {classInfo.grade}학년 {classInfo.semester}학기
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
          value={students.length}
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
          value={`${completionRate}%`}
          iconColor="text-primary"
          iconBg="bg-primary/10"
        />
        <StatsCard
          icon={Target}
          title="평균 점수"
          value={`${classAvgScore}점`}
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  학생 목록
                </CardTitle>
                <CardDescription>
                  {students.length > 0
                    ? `${todayCompleted}/${students.length}명 학습 완료`
                    : "배정된 학생이 없습니다"}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/teacher/students/bulk-create">
                  <UserPlus className="h-4 w-4 mr-1" />
                  학생 추가
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground mb-1">
                  아직 학생이 없습니다
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  학생 일괄 생성으로 이 학급에 학생을 추가하세요
                </p>
                <Button size="sm" asChild>
                  <Link href="/teacher/students/bulk-create">
                    <UserPlus className="h-4 w-4 mr-1" />
                    학생 일괄 생성
                  </Link>
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {students
                    .sort((a, b) => {
                      if (a.todayCompleted !== b.todayCompleted)
                        return a.todayCompleted ? -1 : 1;
                      return (a.studentNumber || 0) - (b.studentNumber || 0);
                    })
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
                            <AvatarFallback>
                              {student.studentNumber || student.name[0]}
                            </AvatarFallback>
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
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
