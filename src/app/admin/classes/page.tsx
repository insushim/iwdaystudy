"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  School,
  Search,
  Users,
  Copy,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dbGet } from "@/lib/db/client";

interface ClassRow {
  id: string;
  name: string;
  grade: number;
  semester: number;
  school_name: string | null;
  year: number;
  invite_code: string;
  is_active: number;
  created_at: string;
  teacher_id: string;
  teacher_name: string | null;
  teacher_email: string | null;
  student_count: number;
}

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await dbGet<{ classes: ClassRow[] }>("/admin/classes");
        if (alive) setClasses(res.classes || []);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "불러오기 실패");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return classes.filter((c) => {
      if (gradeFilter !== "all" && String(c.grade) !== gradeFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.teacher_name || "").toLowerCase().includes(q) ||
        (c.school_name || "").toLowerCase().includes(q) ||
        c.invite_code.toLowerCase().includes(q)
      );
    });
  }, [classes, query, gradeFilter]);

  const totalStudents = classes.reduce((s, c) => s + (c.student_count || 0), 0);
  const activeCount = classes.filter((c) => c.is_active).length;

  async function copyInvite(code: string, id: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">학급 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">
          전체 학급 목록과 각 학급 소속 학생 수를 확인하세요.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border shadow-sm">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">전체 학급</p>
                <p className="text-2xl font-bold mt-1">
                  {classes.length.toLocaleString()}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                <School className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">활성 학급</p>
                <p className="text-2xl font-bold mt-1">
                  {activeCount.toLocaleString()}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">소속 학생</p>
                <p className="text-2xl font-bold mt-1">
                  {totalStudents.toLocaleString()}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="학급명, 교사명, 학교, 초대코드 검색"
            className="pl-9"
          />
        </div>
        <Select value={gradeFilter} onValueChange={setGradeFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
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
      </div>

      {/* Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">학급 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              불러오는 중...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-red-500">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {classes.length === 0
                ? "등록된 학급이 없습니다."
                : "조건에 맞는 학급이 없습니다."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-3 font-medium">학급</th>
                    <th className="pb-2 pr-3 font-medium">학년/학기</th>
                    <th className="pb-2 pr-3 font-medium">담임</th>
                    <th className="pb-2 pr-3 font-medium">학교</th>
                    <th className="pb-2 pr-3 font-medium">학생</th>
                    <th className="pb-2 pr-3 font-medium">초대코드</th>
                    <th className="pb-2 pr-3 font-medium">상태</th>
                    <th className="pb-2 font-medium">생성일</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b last:border-0 hover:bg-accent/40"
                    >
                      <td className="py-3 pr-3 font-medium">{c.name}</td>
                      <td className="py-3 pr-3 text-muted-foreground">
                        {c.grade}학년 {c.semester}학기
                      </td>
                      <td className="py-3 pr-3">
                        <div className="text-sm">
                          {c.teacher_name || "—"}
                        </div>
                        {c.teacher_email && (
                          <div className="text-xs text-muted-foreground">
                            {c.teacher_email}
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-muted-foreground">
                        {c.school_name || "—"}
                      </td>
                      <td className="py-3 pr-3">
                        <Badge variant="secondary" className="gap-1">
                          <Users className="h-3 w-3" />
                          {c.student_count}
                        </Badge>
                      </td>
                      <td className="py-3 pr-3">
                        <button
                          type="button"
                          onClick={() => copyInvite(c.invite_code, c.id)}
                          className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-xs hover:bg-accent"
                        >
                          {c.invite_code}
                          {copiedId === c.id ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 pr-3">
                        {c.is_active ? (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            활성
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            비활성
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {c.created_at.split("T")[0]}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
