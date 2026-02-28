"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
  School,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  localGetTeachersByStatus,
  localApproveTeacher,
  localRejectTeacher,
} from "@/lib/local-auth";
import type { Profile } from "@/types/database";
import type { ApprovalStatus } from "@/types/database";

type TabValue = "pending" | "approved" | "rejected";

const tabs: { value: TabValue; label: string; icon: React.ElementType }[] = [
  { value: "pending", label: "대기 중", icon: Clock },
  { value: "approved", label: "승인됨", icon: CheckCircle2 },
  { value: "rejected", label: "거절됨", icon: XCircle },
];

export default function AdminApprovalsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("pending");
  const [teachers, setTeachers] = useState<Profile[]>([]);

  const loadTeachers = useCallback(() => {
    const result = localGetTeachersByStatus(activeTab as ApprovalStatus);
    setTeachers(result);
  }, [activeTab]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  function handleApprove(id: string) {
    localApproveTeacher(id);
    loadTeachers();
  }

  function handleReject(id: string) {
    localRejectTeacher(id);
    loadTeachers();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-primary" />
          승인 관리
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          학급 관리자(교사) 가입 요청을 승인하거나 거절합니다
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Teacher List */}
      <Card>
        <CardContent className="p-0">
          {teachers.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-muted-foreground">
              <UserCheck className="h-10 w-10 mb-2 opacity-40" />
              <p className="text-sm">
                {activeTab === "pending" && "대기 중인 요청이 없습니다"}
                {activeTab === "approved" && "승인된 교사가 없습니다"}
                {activeTab === "rejected" && "거절된 요청이 없습니다"}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {teachers.map((teacher, idx) => (
                <motion.div
                  key={teacher.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-4"
                >
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                        {teacher.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{teacher.name}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {teacher.email}
                          </span>
                          {teacher.school_name && (
                            <span className="flex items-center gap-1">
                              <School className="h-3 w-3" />
                              {teacher.school_name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(teacher.created_at).toLocaleDateString(
                              "ko-KR",
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-2 sm:ml-auto">
                    {activeTab === "pending" && (
                      <Badge
                        variant="secondary"
                        className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        대기 중
                      </Badge>
                    )}
                    {activeTab === "approved" && (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        승인됨
                      </Badge>
                    )}
                    {activeTab === "rejected" && (
                      <Badge
                        variant="secondary"
                        className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        거절됨
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  {activeTab === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(teacher.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        승인
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(teacher.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        거절
                      </Button>
                    </div>
                  )}
                  {activeTab === "rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApprove(teacher.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      승인으로 변경
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
