"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  Plus,
  Sparkles,
  Eye,
  EyeOff,
  FileQuestion,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ContentSet {
  id: string;
  grade: number;
  semester: number;
  setNumber: number;
  subject: string;
  questionCount: number;
  published: boolean;
  createdAt: string;
  difficulty: string;
}

const demoSets: ContentSet[] = [
  { id: "s1", grade: 1, semester: 1, setNumber: 1, subject: "수학", questionCount: 10, published: true, createdAt: "2026-02-25", difficulty: "쉬움" },
  { id: "s2", grade: 1, semester: 1, setNumber: 2, subject: "국어", questionCount: 10, published: true, createdAt: "2026-02-25", difficulty: "쉬움" },
  { id: "s3", grade: 1, semester: 1, setNumber: 3, subject: "통합", questionCount: 10, published: false, createdAt: "2026-02-26", difficulty: "쉬움" },
  { id: "s4", grade: 2, semester: 1, setNumber: 1, subject: "수학", questionCount: 10, published: true, createdAt: "2026-02-24", difficulty: "쉬움" },
  { id: "s5", grade: 2, semester: 1, setNumber: 2, subject: "국어", questionCount: 10, published: true, createdAt: "2026-02-24", difficulty: "보통" },
  { id: "s6", grade: 3, semester: 1, setNumber: 1, subject: "수학", questionCount: 12, published: true, createdAt: "2026-02-23", difficulty: "보통" },
  { id: "s7", grade: 3, semester: 1, setNumber: 2, subject: "영어", questionCount: 12, published: true, createdAt: "2026-02-23", difficulty: "보통" },
  { id: "s8", grade: 3, semester: 2, setNumber: 1, subject: "수학", questionCount: 12, published: false, createdAt: "2026-02-26", difficulty: "보통" },
  { id: "s9", grade: 4, semester: 1, setNumber: 1, subject: "수학", questionCount: 12, published: true, createdAt: "2026-02-22", difficulty: "보통" },
  { id: "s10", grade: 4, semester: 1, setNumber: 2, subject: "과학", questionCount: 12, published: true, createdAt: "2026-02-22", difficulty: "어려움" },
  { id: "s11", grade: 5, semester: 1, setNumber: 1, subject: "수학", questionCount: 14, published: true, createdAt: "2026-02-21", difficulty: "보통" },
  { id: "s12", grade: 5, semester: 1, setNumber: 2, subject: "사회", questionCount: 14, published: true, createdAt: "2026-02-21", difficulty: "어려움" },
  { id: "s13", grade: 6, semester: 1, setNumber: 1, subject: "수학", questionCount: 14, published: true, createdAt: "2026-02-20", difficulty: "어려움" },
  { id: "s14", grade: 6, semester: 2, setNumber: 1, subject: "영어", questionCount: 14, published: false, createdAt: "2026-02-26", difficulty: "보통" },
];

const gradeStats = [
  { grade: 1, sets: 320, questions: 3200 },
  { grade: 2, sets: 340, questions: 3400 },
  { grade: 3, sets: 380, questions: 4560 },
  { grade: 4, sets: 370, questions: 4440 },
  { grade: 5, sets: 360, questions: 5040 },
  { grade: 6, sets: 386, questions: 5404 },
];

const gradeColors: Record<number, string> = {
  1: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400",
  2: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  3: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400",
  4: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  5: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  6: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
};

export default function ContentManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [publishFilter, setPublishFilter] = useState("all");
  const [sets, setSets] = useState(demoSets);

  const filteredSets = sets.filter((s) => {
    if (gradeFilter !== "all" && s.grade !== Number(gradeFilter)) return false;
    if (semesterFilter !== "all" && s.semester !== Number(semesterFilter)) return false;
    if (publishFilter === "published" && !s.published) return false;
    if (publishFilter === "unpublished" && s.published) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.subject.toLowerCase().includes(q) ||
        `${s.grade}학년`.includes(q) ||
        `${s.semester}학기`.includes(q)
      );
    }
    return true;
  });

  function togglePublish(id: string) {
    setSets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, published: !s.published } : s))
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">콘텐츠 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            학습 세트를 관리하고 새로운 콘텐츠를 생성하세요.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/content/generate">
            <Sparkles className="h-4 w-4 mr-2" />
            AI로 생성하기
          </Link>
        </Button>
      </div>

      {/* Grade overview cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        {gradeStats.map((g) => (
          <Card
            key={g.grade}
            className={cn(
              "cursor-pointer border shadow-sm transition-all hover:shadow-md",
              gradeFilter === String(g.grade) && "ring-2 ring-primary"
            )}
            onClick={() =>
              setGradeFilter(
                gradeFilter === String(g.grade) ? "all" : String(g.grade)
              )
            }
          >
            <CardContent className="pt-4 pb-4 text-center">
              <div
                className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${
                  gradeColors[g.grade]
                }`}
              >
                {g.grade}
              </div>
              <p className="text-xs font-medium">{g.grade}학년</p>
              <p className="text-xs text-muted-foreground mt-1">
                {g.sets}세트 / {g.questions.toLocaleString()}문제
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Filters */}
      <Card className="border shadow-sm">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="과목, 학년으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="w-28 h-10">
                  <SelectValue placeholder="학년" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 학년</SelectItem>
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <SelectItem key={g} value={String(g)}>
                      {g}학년
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                <SelectTrigger className="w-28 h-10">
                  <SelectValue placeholder="학기" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 학기</SelectItem>
                  <SelectItem value="1">1학기</SelectItem>
                  <SelectItem value="2">2학기</SelectItem>
                </SelectContent>
              </Select>
              <Select value={publishFilter} onValueChange={setPublishFilter}>
                <SelectTrigger className="w-28 h-10">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="published">게시됨</SelectItem>
                  <SelectItem value="unpublished">미게시</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              학습 세트
              <Badge variant="secondary" className="text-xs">
                {filteredSets.length}개
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-[1fr_80px_80px_100px_80px_80px_100px] gap-4 px-4 py-3 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
              <span>세트</span>
              <span className="text-center">학년</span>
              <span className="text-center">학기</span>
              <span className="text-center">과목</span>
              <span className="text-center">문제 수</span>
              <span className="text-center">난이도</span>
              <span className="text-center">상태</span>
            </div>

            {/* Table rows */}
            {filteredSets.length === 0 ? (
              <div className="py-12 text-center">
                <FileQuestion className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  조건에 맞는 세트가 없습니다.
                </p>
              </div>
            ) : (
              filteredSets.map((set) => (
                <div
                  key={set.id}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_80px_80px_100px_80px_80px_100px] gap-2 sm:gap-4 px-4 py-3 border-b last:border-0 hover:bg-muted/30 transition-colors items-center"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        gradeColors[set.grade]
                      }`}
                    >
                      {set.grade}-{set.setNumber}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        세트 #{set.setNumber}
                      </p>
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {set.grade}학년 {set.semester}학기 - {set.subject}
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:block text-sm text-center">
                    {set.grade}학년
                  </span>
                  <span className="hidden sm:block text-sm text-center">
                    {set.semester}학기
                  </span>
                  <span className="hidden sm:block text-sm text-center">
                    {set.subject}
                  </span>
                  <span className="hidden sm:block text-sm text-center">
                    {set.questionCount}
                  </span>
                  <span className="hidden sm:block text-sm text-center">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        set.difficulty === "쉬움" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                        set.difficulty === "보통" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                        set.difficulty === "어려움" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      )}
                    >
                      {set.difficulty}
                    </Badge>
                  </span>
                  <div className="flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 text-xs gap-1",
                        set.published
                          ? "text-green-600 hover:text-green-700"
                          : "text-muted-foreground"
                      )}
                      onClick={() => togglePublish(set.id)}
                    >
                      {set.published ? (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">게시됨</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">미게시</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
