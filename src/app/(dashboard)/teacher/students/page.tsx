"use client";

import { useState, useMemo } from "react";
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
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

interface StudentRow {
  id: string;
  name: string;
  grade: number;
  className: string;
  streak: number;
  lastActive: string;
  avgScore: number;
  totalSessions: number;
}

const mockStudents: StudentRow[] = [
  { id: "s1", name: "김민준", grade: 3, className: "1반", streak: 15, lastActive: "오늘", avgScore: 92, totalSessions: 42 },
  { id: "s2", name: "이서연", grade: 3, className: "1반", streak: 12, lastActive: "오늘", avgScore: 88, totalSessions: 38 },
  { id: "s3", name: "박지호", grade: 3, className: "1반", streak: 3, lastActive: "오늘", avgScore: 71, totalSessions: 30 },
  { id: "s4", name: "최수아", grade: 3, className: "1반", streak: 8, lastActive: "오늘", avgScore: 76, totalSessions: 35 },
  { id: "s5", name: "정예준", grade: 3, className: "1반", streak: 0, lastActive: "어제", avgScore: 65, totalSessions: 25 },
  { id: "s6", name: "강하은", grade: 3, className: "1반", streak: 22, lastActive: "오늘", avgScore: 95, totalSessions: 45 },
  { id: "s7", name: "윤도윤", grade: 3, className: "1반", streak: 0, lastActive: "3일 전", avgScore: 58, totalSessions: 18 },
  { id: "s8", name: "임지유", grade: 3, className: "1반", streak: 7, lastActive: "오늘", avgScore: 84, totalSessions: 37 },
  { id: "s9", name: "한소율", grade: 3, className: "2반", streak: 5, lastActive: "어제", avgScore: 79, totalSessions: 32 },
  { id: "s10", name: "조서준", grade: 3, className: "2반", streak: 10, lastActive: "오늘", avgScore: 87, totalSessions: 40 },
  { id: "s11", name: "김하린", grade: 3, className: "2반", streak: 18, lastActive: "오늘", avgScore: 91, totalSessions: 43 },
  { id: "s12", name: "이도현", grade: 3, className: "2반", streak: 2, lastActive: "오늘", avgScore: 68, totalSessions: 28 },
  { id: "s13", name: "박서윤", grade: 3, className: "2반", streak: 9, lastActive: "오늘", avgScore: 83, totalSessions: 36 },
  { id: "s14", name: "최지안", grade: 3, className: "2반", streak: 0, lastActive: "4일 전", avgScore: 55, totalSessions: 15 },
  { id: "s15", name: "정시우", grade: 3, className: "2반", streak: 6, lastActive: "어제", avgScore: 77, totalSessions: 33 },
];

type SortField = "name" | "streak" | "avgScore" | "lastActive";
type SortDirection = "asc" | "desc";

export default function TeacherStudentsPage() {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const filteredStudents = useMemo(() => {
    let result = [...mockStudents];

    if (search) {
      result = result.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
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
          const order = { "오늘": 0, "어제": 1, "3일 전": 2, "4일 전": 3 };
          compare = (order[a.lastActive as keyof typeof order] ?? 99) - (order[b.lastActive as keyof typeof order] ?? 99);
          break;
      }
      return sortDirection === "asc" ? compare : -compare;
    });

    return result;
  }, [search, classFilter, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3" />
    );
  };

  const classes = [...new Set(mockStudents.map((s) => s.className))];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="teacher" userName="김선생" />
      <main className="flex-1 pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              학생 관리
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              전체 학생 목록 ({mockStudents.length}명)
            </p>
          </motion.div>

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
                      <p className="text-sm text-muted-foreground">검색 결과가 없습니다</p>
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
                              <p className="text-sm font-medium">{student.name}</p>
                              <p className="text-xs text-muted-foreground sm:hidden">
                                {student.className} | {student.avgScore}점 | {student.lastActive}
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
        </div>
      </main>
      <MobileNav role="teacher" />
    </div>
  );
}
