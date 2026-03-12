"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { format, addDays } from "date-fns";
import { ko } from "date-fns/locale";
import {
  ClipboardList,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Users,
  Trash2,
  Edit,
  RefreshCw,
  XCircle,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Assignment {
  id: string;
  setTitle: string;
  className: string;
  classId: string;
  assignedDate: string;
  dueDate: string;
  completed: number;
  total: number;
  status: "active" | "overdue" | "completed" | "cancelled";
}

const STATUS_CONFIG = {
  active: {
    label: "진행 중",
    variant: "default" as const,
    color: "text-blue-600",
  },
  overdue: {
    label: "기한 초과",
    variant: "destructive" as const,
    color: "text-red-600",
  },
  completed: {
    label: "완료",
    variant: "secondary" as const,
    color: "text-emerald-600",
  },
  cancelled: {
    label: "취소됨",
    variant: "outline" as const,
    color: "text-muted-foreground",
  },
};

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(
    addDays(new Date(), 1),
  );
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newDueDate, setNewDueDate] = useState<Date | undefined>();

  const handleCreate = () => {
    if (!selectedTitle || !selectedClass || !dueDate) return;

    const newAssignment: Assignment = {
      id: `a${Date.now()}`,
      setTitle: selectedTitle,
      className: selectedClass,
      classId: `c${Date.now()}`,
      assignedDate: format(new Date(), "yyyy-MM-dd"),
      dueDate: format(dueDate, "yyyy-MM-dd"),
      completed: 0,
      total: 0,
      status: "active",
    };

    setAssignments([newAssignment, ...assignments]);
    setShowCreateDialog(false);
    setSelectedTitle("");
    setSelectedClass("");
  };

  const handleCancel = (id: string) => {
    setAssignments(
      assignments.map((a) =>
        a.id === id ? { ...a, status: "cancelled" as const } : a,
      ),
    );
  };

  const handleReschedule = () => {
    if (!rescheduleId || !newDueDate) return;
    setAssignments(
      assignments.map((a) =>
        a.id === rescheduleId
          ? { ...a, dueDate: format(newDueDate, "yyyy-MM-dd") }
          : a,
      ),
    );
    setRescheduleId(null);
    setNewDueDate(undefined);
  };

  const activeAssignments = assignments.filter(
    (a) => a.status === "active" || a.status === "overdue",
  );
  const pastAssignments = assignments.filter(
    (a) => a.status === "completed" || a.status === "cancelled",
  );

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
              <ClipboardList className="h-6 w-6 text-primary" />
              과제 관리
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              학급별 과제를 배정하고 완료 현황을 확인하세요
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">과제 배정</span>
          </Button>
        </motion.div>

        {/* Active Assignments */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            진행 중인 과제 ({activeAssignments.length})
          </h2>
          {activeAssignments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  진행 중인 과제가 없습니다.
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  상단의 과제 배정 버튼으로 새 과제를 만들어보세요.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeAssignments.map((assignment, idx) => {
                const config = STATUS_CONFIG[assignment.status];
                const completionRate =
                  assignment.total > 0
                    ? Math.round(
                        (assignment.completed / assignment.total) * 100,
                      )
                    : 0;

                return (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="py-4">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {assignment.setTitle}
                              </h3>
                              <Badge
                                variant={config.variant}
                                className="text-xs"
                              >
                                {config.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {assignment.className}
                              </span>
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                마감: {assignment.dueDate}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => {
                                setRescheduleId(assignment.id);
                                setNewDueDate(new Date(assignment.dueDate));
                              }}
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon-xs">
                                  <XCircle className="h-3.5 w-3.5 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>과제 취소</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    이 과제를 취소하시겠습니까? 이미 완료한
                                    학생의 기록은 유지됩니다.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    돌아가기
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancel(assignment.id)}
                                  >
                                    취소하기
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              완료: {assignment.completed}/{assignment.total}명
                            </span>
                            <span className="font-medium">
                              {completionRate}%
                            </span>
                          </div>
                          <Progress value={completionRate} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Assignments */}
        {pastAssignments.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-muted-foreground">
              지난 과제 ({pastAssignments.length})
            </h2>
            <div className="space-y-2">
              {pastAssignments.map((assignment) => {
                const config = STATUS_CONFIG[assignment.status];
                return (
                  <Card key={assignment.id} className="opacity-70">
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {assignment.setTitle}
                            </span>
                            <Badge
                              variant={config.variant}
                              className="text-[10px]"
                            >
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {assignment.className} | {assignment.dueDate}
                          </p>
                        </div>
                        <span className="text-sm font-medium">
                          {assignment.completed}/{assignment.total}명
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Create Assignment Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>과제 배정</DialogTitle>
            <DialogDescription>
              학급에 학습 세트를 배정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>과제 제목</Label>
              <Input
                placeholder="예: 3학년 1학기 25일차"
                value={selectedTitle}
                onChange={(e) => setSelectedTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>학급</Label>
              <Input
                placeholder="예: 3학년 1반"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>마감일</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {dueDate
                      ? format(dueDate, "yyyy년 M월 d일", { locale: ko })
                      : "날짜 선택"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(d) => setDueDate(d ?? undefined)}
                  />
                </PopoverContent>
              </Popover>
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
              onClick={handleCreate}
              disabled={!selectedTitle || !selectedClass || !dueDate}
            >
              배정하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog
        open={rescheduleId !== null}
        onOpenChange={() => {
          setRescheduleId(null);
          setNewDueDate(undefined);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>마감일 변경</DialogTitle>
            <DialogDescription>새로운 마감일을 선택하세요.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={newDueDate}
              onSelect={(d) => setNewDueDate(d ?? undefined)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRescheduleId(null);
                setNewDueDate(undefined);
              }}
            >
              취소
            </Button>
            <Button onClick={handleReschedule} disabled={!newDueDate}>
              변경
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
