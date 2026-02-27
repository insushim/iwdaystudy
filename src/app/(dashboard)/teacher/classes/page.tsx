"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  School,
  Plus,
  Copy,
  Check,
  Users,
  BarChart3,
  MoreVertical,
  Edit,
  Power,
  ExternalLink,
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
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const mockClasses: ClassData[] = [
  {
    id: "c1",
    name: "3학년 1반",
    grade: 3,
    semester: 1,
    studentCount: 28,
    inviteCode: "ARA-3A-2025",
    isActive: true,
    completionRate: 82,
    avgScore: 78,
    createdAt: "2025-03-01",
  },
  {
    id: "c2",
    name: "3학년 2반",
    grade: 3,
    semester: 1,
    studentCount: 26,
    inviteCode: "ARA-3B-2025",
    isActive: true,
    completionRate: 75,
    avgScore: 81,
    createdAt: "2025-03-01",
  },
  {
    id: "c3",
    name: "2학년 1반 (2024)",
    grade: 2,
    semester: 2,
    studentCount: 25,
    inviteCode: "ARA-2A-2024",
    isActive: false,
    completionRate: 90,
    avgScore: 85,
    createdAt: "2024-03-01",
  },
];

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState(mockClasses);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [newClass, setNewClass] = useState({
    name: "",
    grade: "3",
    semester: "1",
  });
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateClass = () => {
    const created: ClassData = {
      id: `c${Date.now()}`,
      name: newClass.name,
      grade: parseInt(newClass.grade),
      semester: parseInt(newClass.semester),
      studentCount: 0,
      inviteCode: `ARA-${newClass.grade}${String.fromCharCode(65 + classes.length)}-${new Date().getFullYear()}`,
      isActive: true,
      completionRate: 0,
      avgScore: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setClasses([...classes, created]);
    setShowCreateDialog(false);
    setNewClass({ name: "", grade: "3", semester: "1" });
  };

  const toggleActive = (id: string) => {
    setClasses(
      classes.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)),
    );
  };

  const activeClasses = classes.filter((c) => c.isActive);
  const inactiveClasses = classes.filter((c) => !c.isActive);

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
              <School className="h-6 w-6 text-primary" />
              학급 관리
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              학급을 만들고 학생을 초대하세요
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">새 학급</span>
          </Button>
        </motion.div>

        {/* Active Classes */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">활성 학급</h2>
          {activeClasses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <School className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">활성 학급이 없습니다.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowCreateDialog(true)}
                >
                  학급 만들기
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {activeClasses.map((cls, idx) => (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{cls.name}</CardTitle>
                          <CardDescription>
                            {cls.grade}학년 {cls.semester}학기
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-xs">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setEditingClass(cls)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleActive(cls.id)}
                            >
                              <Power className="h-4 w-4 mr-2" />
                              비활성화
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{cls.studentCount}명</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          <span>평균 {cls.avgScore}점</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>완료율</span>
                          <span>{cls.completionRate}%</span>
                        </div>
                        <Progress
                          value={cls.completionRate}
                          className="h-1.5"
                        />
                      </div>

                      {/* Invite Code */}
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                        <span className="text-xs text-muted-foreground">
                          초대코드:
                        </span>
                        <code className="text-xs font-mono font-semibold flex-1">
                          {cls.inviteCode}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleCopyCode(cls.inviteCode)}
                        >
                          {copiedCode === cls.inviteCode ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>

                      <Link href={`/teacher/classes/${cls.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-1.5"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          상세 보기
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Inactive Classes */}
        {inactiveClasses.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-muted-foreground">
              비활성 학급
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {inactiveClasses.map((cls) => (
                <Card key={cls.id} className="opacity-60">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold">{cls.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {cls.grade}학년 {cls.semester}학기 |{" "}
                          {cls.studentCount}명
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(cls.id)}
                      >
                        활성화
                      </Button>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>완료율 {cls.completionRate}%</span>
                      <span>평균 {cls.avgScore}점</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Class Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 학급 만들기</DialogTitle>
            <DialogDescription>학급 정보를 입력해주세요.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="className">학급 이름</Label>
              <Input
                id="className"
                placeholder="예: 3학년 1반"
                value={newClass.name}
                onChange={(e) =>
                  setNewClass({ ...newClass, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>학년</Label>
                <Select
                  value={newClass.grade}
                  onValueChange={(val) =>
                    setNewClass({ ...newClass, grade: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((g) => (
                      <SelectItem key={g} value={String(g)}>
                        {g}학년
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>학기</Label>
                <Select
                  value={newClass.semester}
                  onValueChange={(val) =>
                    setNewClass({ ...newClass, semester: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1학기</SelectItem>
                    <SelectItem value="2">2학기</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              취소
            </Button>
            <Button
              onClick={handleCreateClass}
              disabled={!newClass.name.trim()}
            >
              만들기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog
        open={editingClass !== null}
        onOpenChange={() => setEditingClass(null)}
      >
        {editingClass && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>학급 수정</DialogTitle>
              <DialogDescription>
                {editingClass.name} 정보를 수정합니다.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>학급 이름</Label>
                <Input defaultValue={editingClass.name} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>학년</Label>
                  <Select defaultValue={String(editingClass.grade)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((g) => (
                        <SelectItem key={g} value={String(g)}>
                          {g}학년
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>학기</Label>
                  <Select defaultValue={String(editingClass.semester)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1학기</SelectItem>
                      <SelectItem value="2">2학기</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingClass(null)}>
                취소
              </Button>
              <Button onClick={() => setEditingClass(null)}>저장</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
