"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Upload,
  Download,
  ArrowLeft,
  CheckCircle2,
  Copy,
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
import { GRADES, SEMESTERS } from "@/lib/constants";
import Link from "next/link";

export default function BulkCreateStudentsPage() {
  const { user } = useAuthStore();
  const [studentCount, setStudentCount] = useState("");
  const [prefix, setPrefix] = useState("ara");
  const [grade, setGrade] = useState("");
  const [semester, setSemester] = useState("");
  const [className, setClassName] = useState("");
  const [results, setResults] = useState<BulkCreateResult[] | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function handleCreate() {
    setError("");

    if (!grade || !semester || !className.trim()) {
      setError("학년, 학기, 반을 모두 입력해주세요.");
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

    if (!user) return;

    const created = localBulkCreateStudents(count, {
      prefix: prefix.trim().toLowerCase(),
      grade: Number(grade),
      semester: Number(semester),
      class_name: className.trim(),
      teacher_id: user.id,
    });

    if (created.length === 0) {
      setError("이미 존재하는 계정입니다. 다른 접두어를 사용해주세요.");
      return;
    }

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
    a.download = `학생계정_${className}_${new Date().toISOString().slice(0, 10)}.csv`;
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
                아래 정보를 학생들에게 배포해주세요. 아이디와 비밀번호가
                동일합니다.
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

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setResults(null);
                  setStudentCount("");
                }}
              >
                추가 생성하기
              </Button>
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
          인원수를 입력하면 자동으로 계정이 생성됩니다 (아이디 = 비밀번호)
        </p>
      </motion.div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">학급 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>학년</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="학년" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map((g) => (
                      <SelectItem key={g} value={String(g)}>
                        {g}학년
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>학기</Label>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger>
                    <SelectValue placeholder="학기" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTERS.map((s) => (
                      <SelectItem key={s} value={String(s)}>
                        {s}학기
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>반</Label>
                <Input
                  placeholder="예: 1반"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

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
              <Button onClick={handleCreate} disabled={!studentCount}>
                <Upload className="h-4 w-4 mr-1" />
                일괄 생성
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
