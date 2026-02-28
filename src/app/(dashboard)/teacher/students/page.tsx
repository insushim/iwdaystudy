"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Flame,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/authStore";
import { localGetAllUsers } from "@/lib/local-auth";
import { getLearningRecords, getStreakCount } from "@/lib/local-storage";

interface StudentRow {
  id: string;
  name: string;
  grade: number;
  className: string;
  streak: number;
  lastActive: string;
  lastActiveTs: number;
  avgScore: number;
  totalSessions: number;
}

type SortField = "name" | "streak" | "avgScore" | "lastActive";
type SortDirection = "asc" | "desc";

export default function TeacherStudentsPage() {
  const { user } = useAuthStore();
  const [studentRows, setStudentRows] = useState<StudentRow[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    if (!user) return;

    const allUsers = localGetAllUsers();
    const myStudents = allUsers.filter(
      (u) => u.role === "student" && u.teacher_id === user.id,
    );

    const rows: StudentRow[] = myStudents.map((student) => {
      const records = getLearningRecords(student.id);
      const completedRecords = records.filter((r) => r.is_completed);
      const streak = getStreakCount(student.id);

      // Average score
      let avgScore = 0;
      if (completedRecords.length > 0) {
        const totalPct = completedRecords.reduce((sum, r) => {
          return (
            sum + (r.max_score > 0 ? (r.total_score / r.max_score) * 100 : 0)
          );
        }, 0);
        avgScore = Math.round(totalPct / completedRecords.length);
      }

      // Last active
      let lastActive = "활동 없음";
      let lastActiveTs = 0;
      if (completedRecords.length > 0) {
        const latestRecord = completedRecords.sort(
          (a, b) =>
            new Date(b.completed_at || b.created_at).getTime() -
            new Date(a.completed_at || a.created_at).getTime(),
        )[0];
        const latestTime = new Date(
          latestRecord.completed_at || latestRecord.created_at,
        );
        lastActiveTs = latestTime.getTime();
        const diffMs = Date.now() - latestTime.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) lastActive = "오늘";
        else if (diffDays === 1) lastActive = "어제";
        else lastActive = `${diffDays}일 전`;
      }

      return {
        id: student.id,
        name: student.name,
        grade: student.grade || 0,
        className: student.class_name || "-",
        streak,
        lastActive,
        lastActiveTs,
        avgScore,
        totalSessions: completedRecords.length,
      };
    });

    setStudentRows(rows);
    setIsLoaded(true);
  }, [user]);

  const filteredStudents = useMemo(() => {
    let result = [...studentRows];

    if (search) {
      result = result.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (classFilter !== "all") {
      result = result.filter((s) => s.className === classFilter);
    }

    result.sort((a, b) => {
      let compare = 0;
      switch (sortField) {
        case "name":
          compare = a.name.localeCompare(b.name, "ko");
          break;
        case "streak":
          compare = a.streak - b.streak;
          break;
        case "avgScore":
          compare = a.avgScore - b.avgScore;
          break;
        case "lastActive":
          compare = a.lastActiveTs - b.lastActiveTs;
          break;
      }
      return sortDirection === "asc" ? compare : -compare;
    });

    return result;
  }, [search, classFilter, sortField, sortDirection, studentRows]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3" />
    );
  };

  const classes = [
    ...new Set(studentRows.map((s) => s.className).filter((c) => c !== "-")),
  ];

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
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            학생 관리
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            전체 학생 목록 ({studentRows.length}명)
          </p>
        </div>
        <Button asChild>
          <Link href="/teacher/students/bulk-create">
            <UserPlus className="h-4 w-4 mr-1" />
            학생 일괄 생성
          </Link>
        </Button>
      </motion.div>

      {studentRows.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-lg font-medium">
                등록된 학생이 없습니다
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                학생 일괄 생성으로 학생을 추가하세요.
              </p>
              <Button asChild className="mt-4">
                <Link href="/teacher/students/bulk-create">
                  <UserPlus className="h-4 w-4 mr-1" />
                  학생 일괄 생성
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="학생 이름 검색..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {classes.length > 0 && (
                    <Select value={classFilter} onValueChange={setClassFilter}>
                      <SelectTrigger className="w-[120px]">
                        <Filter className="h-3.5 w-3.5 mr-1.5" />
                        <SelectValue placeholder="반" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        {classes.map((cls) => (
                          <SelectItem key={cls} value={cls}>
                            {cls}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Students Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardContent className="p-0">
                {/* Table Header */}
                <div className="hidden sm:grid sm:grid-cols-[1fr_80px_80px_100px_80px_40px] gap-3 px-4 py-3 border-b bg-muted/30 text-xs font-medium text-muted-foreground">
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors text-left"
                    onClick={() => toggleSort("name")}
                  >
                    이름 <SortIcon field="name" />
                  </button>
                  <span>반</span>
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    onClick={() => toggleSort("streak")}
                  >
                    연속 <SortIcon field="streak" />
                  </button>
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    onClick={() => toggleSort("lastActive")}
                  >
                    최근 활동 <SortIcon field="lastActive" />
                  </button>
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    onClick={() => toggleSort("avgScore")}
                  >
                    평균 <SortIcon field="avgScore" />
                  </button>
                  <span />
                </div>

                {/* Table Body */}
                <div className="divide-y">
                  {filteredStudents.length === 0 ? (
                    <div className="flex flex-col items-center py-12">
                      <Users className="h-10 w-10 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        검색 결과가 없습니다
                      </p>
                    </div>
                  ) : (
                    filteredStudents.map((student, idx) => (
                      <Link
                        key={student.id}
                        href={`/teacher/students/${student.id}`}
                      >
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.02 * idx }}
                          className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_80px_80px_100px_80px_40px] gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer items-center group"
                        >
                          {/* Name */}
                          <div className="flex items-center gap-3">
                            <Avatar size="sm">
                              <AvatarFallback>{student.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {student.name}
                              </p>
                              <p className="text-xs text-muted-foreground sm:hidden">
                                {student.className} | {student.avgScore}점 |{" "}
                                {student.lastActive}
                              </p>
                            </div>
                          </div>

                          {/* Mobile: badges */}
                          <div className="flex items-center gap-2 sm:hidden">
                            {student.streak > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                <Flame className="h-3 w-3 text-orange-500 mr-0.5" />
                                {student.streak}
                              </Badge>
                            )}
                            <ExternalLink className="h-4 w-4 text-muted-foreground/40" />
                          </div>

                          {/* Desktop columns */}
                          <span className="hidden sm:block text-sm text-muted-foreground">
                            {student.className}
                          </span>
                          <span className="hidden sm:flex items-center gap-1 text-sm">
                            {student.streak > 0 ? (
                              <>
                                <Flame className="h-3.5 w-3.5 text-orange-500" />
                                {student.streak}일
                              </>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </span>
                          <span className="hidden sm:block text-sm text-muted-foreground">
                            {student.lastActive}
                          </span>
                          <span className="hidden sm:block text-sm font-medium">
                            {student.avgScore}점
                          </span>
                          <ExternalLink className="hidden sm:block h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors" />
                        </motion.div>
                      </Link>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
}
