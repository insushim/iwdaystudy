"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCheck,
  UserX,
  Crown,
  GraduationCap,
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
import { localGetAllUsers, localUpdateProfile } from "@/lib/local-auth";
import type { Profile } from "@/types/database";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: "student" | "parent" | "teacher" | "admin";
  grade: number | null;
  joinedAt: string;
  status: "active" | "inactive" | "suspended";
  subscription: string;
}

function profileToUserRecord(p: Profile): UserRecord {
  // Determine status from approval_status
  let status: "active" | "inactive" | "suspended" = "active";
  if (p.approval_status === "pending") status = "inactive";
  if (p.approval_status === "rejected") status = "suspended";

  return {
    id: p.id,
    name: p.name,
    email: p.email,
    role: p.role as "student" | "parent" | "teacher" | "admin",
    grade: p.grade,
    joinedAt: p.created_at.split("T")[0],
    status,
    subscription: p.subscription_plan || "free",
  };
}

const roleLabels: Record<string, string> = {
  student: "학생",
  parent: "학부모",
  teacher: "교사",
  admin: "관리자",
};

const roleColors: Record<string, string> = {
  student: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  parent:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  teacher:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  admin: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const statusLabels: Record<string, string> = {
  active: "활성",
  inactive: "비활성",
  suspended: "정지",
};

const statusColors: Record<string, string> = {
  active:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  suspended: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const subscriptionLabels: Record<string, string> = {
  free: "무료",
  basic: "베이직",
  premium: "프리미엄",
  school: "학교",
};

const subscriptionColors: Record<string, string> = {
  free: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  basic: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  premium:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  school:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Load real users on mount
  useEffect(() => {
    const allProfiles = localGetAllUsers();
    setUsers(allProfiles.map(profileToUserRecord));
  }, []);

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    if (subscriptionFilter !== "all" && u.subscription !== subscriptionFilter)
      return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredUsers.length / perPage);
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * perPage,
    page * perPage,
  );

  function changeRole(
    userId: string,
    newRole: "student" | "parent" | "teacher" | "admin",
  ) {
    // Persist to localStorage via localUpdateProfile
    try {
      localUpdateProfile(userId, { role: newRole as any });
    } catch {
      // ignore
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
    );
  }

  function toggleStatus(userId: string) {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const nextStatus = u.status === "active" ? "suspended" : "active";
        // Persist approval_status change
        try {
          localUpdateProfile(userId, {
            approval_status: nextStatus === "active" ? "approved" : "rejected",
          });
        } catch {
          // ignore
        }
        return { ...u, status: nextStatus };
      }),
    );
  }

  const totalActive = users.filter((u) => u.status === "active").length;
  const totalStudents = users.filter((u) => u.role === "student").length;
  const totalPremium = users.filter(
    (u) => u.subscription === "premium" || u.subscription === "school",
  ).length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">사용자 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">
          등록된 사용자를 관리하고 권한을 설정하세요.
        </p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm">
          <CardContent className="pt-4 pb-4 text-center">
            <Users className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{users.length}</p>
            <p className="text-xs text-muted-foreground">전체 사용자</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="pt-4 pb-4 text-center">
            <UserCheck className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{totalActive}</p>
            <p className="text-xs text-muted-foreground">활성 사용자</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="pt-4 pb-4 text-center">
            <GraduationCap className="h-5 w-5 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{totalStudents}</p>
            <p className="text-xs text-muted-foreground">학생 수</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="pt-4 pb-4 text-center">
            <Crown className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{totalPremium}</p>
            <p className="text-xs text-muted-foreground">유료 구독</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border shadow-sm">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="이름 또는 이메일로 검색..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select
                value={roleFilter}
                onValueChange={(v) => {
                  setRoleFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-28 h-10">
                  <SelectValue placeholder="역할" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 역할</SelectItem>
                  <SelectItem value="student">학생</SelectItem>
                  <SelectItem value="parent">학부모</SelectItem>
                  <SelectItem value="teacher">교사</SelectItem>
                  <SelectItem value="admin">관리자</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-28 h-10">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태</SelectItem>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="inactive">비활성</SelectItem>
                  <SelectItem value="suspended">정지</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={subscriptionFilter}
                onValueChange={(v) => {
                  setSubscriptionFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-28 h-10">
                  <SelectValue placeholder="구독" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 구독</SelectItem>
                  <SelectItem value="free">무료</SelectItem>
                  <SelectItem value="basic">베이직</SelectItem>
                  <SelectItem value="premium">프리미엄</SelectItem>
                  <SelectItem value="school">학교</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              사용자 목록
              <Badge variant="secondary" className="text-xs">
                {filteredUsers.length}명
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[1fr_180px_80px_60px_100px_90px_90px_80px] gap-3 px-4 py-3 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
              <span>이름</span>
              <span>이메일</span>
              <span className="text-center">역할</span>
              <span className="text-center">학년</span>
              <span className="text-center">가입일</span>
              <span className="text-center">구독</span>
              <span className="text-center">상태</span>
              <span className="text-center">작업</span>
            </div>

            {paginatedUsers.length === 0 ? (
              <div className="py-12 text-center">
                <UserX className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {users.length === 0
                    ? "등록된 사용자가 없습니다."
                    : "조건에 맞는 사용자가 없습니다."}
                </p>
              </div>
            ) : (
              paginatedUsers.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_180px_80px_60px_100px_90px_90px_80px] gap-2 md:gap-3 px-4 py-3 border-b last:border-0 hover:bg-muted/30 transition-colors items-center"
                >
                  {/* Name */}
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground md:hidden">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <span className="hidden md:block text-sm text-muted-foreground truncate">
                    {user.email}
                  </span>

                  {/* Role */}
                  <div className="hidden md:flex justify-center">
                    <Badge
                      variant="secondary"
                      className={cn("text-xs", roleColors[user.role] || "")}
                    >
                      {roleLabels[user.role] || user.role}
                    </Badge>
                  </div>

                  {/* Grade */}
                  <span className="hidden md:block text-sm text-center">
                    {user.grade ? `${user.grade}` : "-"}
                  </span>

                  {/* Joined */}
                  <span className="hidden md:block text-xs text-center text-muted-foreground">
                    {user.joinedAt}
                  </span>

                  {/* Subscription */}
                  <div className="hidden md:flex justify-center">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        subscriptionColors[user.subscription] || "",
                      )}
                    >
                      {subscriptionLabels[user.subscription] ||
                        user.subscription}
                    </Badge>
                  </div>

                  {/* Status */}
                  <div className="hidden md:flex justify-center">
                    <Badge
                      variant="secondary"
                      className={cn("text-xs", statusColors[user.status])}
                    >
                      {statusLabels[user.status]}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-1">
                    <Select
                      value={user.role}
                      onValueChange={(v) =>
                        changeRole(
                          user.id,
                          v as "student" | "parent" | "teacher" | "admin",
                        )
                      }
                    >
                      <SelectTrigger className="h-7 w-16 text-xs px-2">
                        <Shield className="h-3 w-3" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">학생</SelectItem>
                        <SelectItem value="parent">학부모</SelectItem>
                        <SelectItem value="teacher">교사</SelectItem>
                        <SelectItem value="admin">관리자</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => toggleStatus(user.id)}
                      title={user.status === "active" ? "정지" : "활성화"}
                    >
                      {user.status === "active" ? (
                        <UserX className="h-3.5 w-3.5 text-red-500" />
                      ) : (
                        <UserCheck className="h-3.5 w-3.5 text-green-500" />
                      )}
                    </Button>
                  </div>

                  {/* Mobile extra info */}
                  <div className="flex flex-wrap gap-2 md:hidden">
                    <Badge
                      variant="secondary"
                      className={cn("text-xs", roleColors[user.role] || "")}
                    >
                      {roleLabels[user.role] || user.role}
                    </Badge>
                    {user.grade && (
                      <Badge variant="secondary" className="text-xs">
                        {user.grade}학년
                      </Badge>
                    )}
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        subscriptionColors[user.subscription] || "",
                      )}
                    >
                      {subscriptionLabels[user.subscription] ||
                        user.subscription}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={cn("text-xs", statusColors[user.status])}
                    >
                      {statusLabels[user.status]}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                {filteredUsers.length}명 중 {(page - 1) * perPage + 1}-
                {Math.min(page * perPage, filteredUsers.length)}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
