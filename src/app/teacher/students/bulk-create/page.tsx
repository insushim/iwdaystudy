"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Upload,
  Download,
  ArrowLeft,
  CheckCircle2,
  Copy,
  School,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/authStore";
import {
  localBulkCreateStudents,
  type BulkCreateResult,
} from "@/lib/local-auth";
import Link from "next/link";

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

function loadClasses(): ClassData[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CLASSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function BulkCreateStudentsPage() {
  const { user } = useAuthStore();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [studentCount, setStudentCount] = useState("");
  const [prefix, setPrefix] = useState("ara");
  const [results, setResults] = useState<BulkCreateResult[] | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const allClasses = loadClasses();
    setClasses(allClasses.filter((c) => c.isActive));
  }, []);

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  function handleCreate() {
    setError("");

    if (!selectedClassId) {
      setError("학급을 선택해주세요. 학급이 없다면 먼저 학급 관리에서 생성해주세요.");
      return;
    }

    const count = Number(studentCount);
    if (!count || count < 1 || count > 99) {
      setError("학생 수를 1~99 사이로 입력해주세요.");
      return;
    }

    if (!prefix.trim()) {
      setError("접두어를 입력해주세요.");
      return;
    }

    if (!user || !selectedClass) return;

    const pfx = prefix.trim().toLowerCase();
    const created = localBulkCreateStudents(count, {
      prefix: pfx,
      grade: selectedClass.grade,
      semester: selectedClass.semester,
      class_name: selectedClass.name,
      class_id: selectedClass.id,
      teacher_id: user.id,
    });

    if (created.length === 0) {
      setError("이미 존재하는 계정입니다. 다른 접두어를 사용해주세요.");
      return;
    }

    // D1 API에도 저장 (다른 기기에서 로그인 가능하도록)
    try {
      const students = created.map((r, i) => ({
        email: `${r.loginId}@class.local`,
        name: r.nickname,
        password: r.password,
        grade: selectedClass.grade,
        semester: selectedClass.semester,
        class_name: selectedClass.name,
        teacher_id: user.id,
        student_number: i + 1,
      }));
      const token = localStorage.getItem("auth_token");
      fetch("/api/auth/bulk-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ students }),
      }).catch(() => {}); // 실패해도 로컬은 이미 생성됨
    } catch { /* ignore */ }

    setResults(created);
  }

  function downloadCSV() {
    if (!results) return;
    const header = "닉네임,아이디,비밀번호\n";
    const rows = results
      .map((r) => `${r.nickname},${r.loginId},${r.password}`)
      .join("\n");
    const csv = header + rows;
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `학생계정_${selectedClass?.name || "학급"}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyToClipboard() {
    if (!results) return;
    const text = results
      .map((r) => `${r.nickname}\t${r.loginId}\t${r.password}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Preview IDs
  const count = Number(studentCount) || 0;
  const previewPrefix = prefix.trim().toLowerCase() || "ara";
  const previewItems =
    count > 0
      ? Array.from({ length: Math.min(count, 5) }, (_, i) => {
          const num = String(i + 1).padStart(2, "0");
          return `${previewPrefix}${num}`;
        })
      : [];

  // Already created → show results
  if (results) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/teacher/students">
              <ArrowLeft className="h-4 w-4 mr-1" />
              학생 관리
            </Link>
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <CardTitle className="text-lg">
                  {results.length}명의 학생 계정이 생성되었습니다
                </CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">{selectedClass?.name}</span>에
                자동 배정되었습니다. 아래 정보를 학생들에게 배포해주세요.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Action buttons */}
              <div className="flex gap-2">
                <Button onClick={downloadCSV} size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  CSV 다운로드
                </Button>
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-1" />
                  {copied ? "복사됨!" : "클립보드 복사"}
                </Button>
              </div>

              {/* Results table */}
              <div className="rounded-lg border overflow-hidden">
                <div className="grid grid-cols-3 gap-3 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground">
                  <span>닉네임</span>
                  <span>아이디</span>
                  <span>비밀번호</span>
                </div>
                <div className="divide-y max-h-96 overflow-y-auto">
                  {results.map((r, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-3 gap-3 px-4 py-2.5 text-sm"
                    >
                      <span className="font-medium">{r.nickname}</span>
                      <span className="font-mono text-xs">{r.loginId}</span>
                      <span className="font-mono text-xs">{r.password}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`/teacher/classes/${selectedClassId}`}>
                    <School className="h-4 w-4 mr-1" />
                    학급 상세 보기
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setResults(null);
                    setStudentCount("");
                  }}
                >
                  추가 생성하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/teacher/students">
            <ArrowLeft className="h-4 w-4 mr-1" />
            학생 관리
          </Link>
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Upload className="h-6 w-6 text-primary" />
          학생 일괄 생성
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          학급을 선택하고 인원수를 입력하면 자동으로 계정이 생성 및 배정됩니다
        </p>
      </motion.div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Class Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <School className="h-4 w-4" />
              학급 선택
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {classes.length === 0 ? (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    등록된 학급이 없습니다
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                    먼저 학급을 만들어주세요.
                  </p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/teacher/classes">학급 만들기</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>배정할 학급</Label>
                <Select
                  value={selectedClassId}
                  onValueChange={setSelectedClassId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="학급을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} ({cls.grade}학년 {cls.semester}학기) -{" "}
                        {cls.studentCount}명
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedClass && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded-lg">
                    <span>
                      {selectedClass.grade}학년 {selectedClass.semester}학기
                    </span>
                    <span>현재 {selectedClass.studentCount}명</span>
                    <span className="font-mono">
                      초대코드: {selectedClass.inviteCode}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              계정 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>접두어</Label>
                <Input
                  placeholder="ara"
                  value={prefix}
                  onChange={(e) =>
                    setPrefix(e.target.value.replace(/[^a-zA-Z]/g, ""))
                  }
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground">
                  영문만 입력 가능
                </p>
              </div>
              <div className="space-y-2">
                <Label>학생 수</Label>
                <Input
                  type="number"
                  placeholder="예: 30"
                  min={1}
                  max={99}
                  value={studentCount}
                  onChange={(e) => setStudentCount(e.target.value)}
                />
              </div>
            </div>

            {/* Preview */}
            {previewItems.length > 0 && (
              <div className="rounded-lg bg-muted/50 border p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  미리보기
                </p>
                <div className="flex flex-wrap gap-2">
                  {previewItems.map((id) => (
                    <span
                      key={id}
                      className="inline-flex items-center rounded-md bg-background border px-2.5 py-1 text-xs font-mono"
                    >
                      {id}
                    </span>
                  ))}
                  {count > 5 && (
                    <span className="text-xs text-muted-foreground self-center">
                      ... 총 {count}명
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  아이디와 비밀번호가 동일하게 생성됩니다
                </p>
              </div>
            )}

            <div className="flex items-center justify-end">
              <Button
                onClick={handleCreate}
                disabled={!studentCount || !selectedClassId}
              >
                <Upload className="h-4 w-4 mr-1" />
                일괄 생성 및 학급 배정
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
