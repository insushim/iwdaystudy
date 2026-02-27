"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Bell,
  School,
  Volume2,
  Palette,
  Save,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export default function TeacherSettingsPage() {
  const [profile, setProfile] = useState({
    name: "김선생",
    email: "kim.teacher@school.edu",
    school: "아라초등학교",
    phone: "010-1234-5678",
  });

  const [notifications, setNotifications] = useState({
    studentComplete: true,
    dailyReport: true,
    weeklyReport: true,
    badgeEarned: false,
    lowEngagement: true,
    emailNotify: false,
  });

  const [classSettings, setClassSettings] = useState({
    autoAssign: true,
    showRanking: false,
    allowRetry: true,
    maxRetries: "3",
  });

  const [appearance, setAppearance] = useState({
    sound: true,
    theme: "system",
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="teacher" userName="김선생" />
      <main className="flex-1 pb-20 lg:pb-0">
        <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                설정
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                프로필 및 환경을 설정하세요
              </p>
            </div>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              {saved ? "저장됨" : "저장"}
            </Button>
          </motion.div>

          {/* Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  프로필
                </CardTitle>
                <CardDescription>기본 정보를 수정하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school">학교</Label>
                    <Input
                      id="school"
                      value={profile.school}
                      onChange={(e) => setProfile({ ...profile, school: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">연락처</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  알림 설정
                </CardTitle>
                <CardDescription>알림을 받을 항목을 선택하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">학생 학습 완료</p>
                    <p className="text-xs text-muted-foreground">학생이 오늘의 학습을 완료할 때</p>
                  </div>
                  <Switch
                    checked={notifications.studentComplete}
                    onCheckedChange={(val) =>
                      setNotifications({ ...notifications, studentComplete: val })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">일일 리포트</p>
                    <p className="text-xs text-muted-foreground">매일 저녁 학급 현황 요약</p>
                  </div>
                  <Switch
                    checked={notifications.dailyReport}
                    onCheckedChange={(val) =>
                      setNotifications({ ...notifications, dailyReport: val })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">주간 리포트</p>
                    <p className="text-xs text-muted-foreground">매주 금요일 주간 성과 리포트</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReport}
                    onCheckedChange={(val) =>
                      setNotifications({ ...notifications, weeklyReport: val })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">뱃지 획득</p>
                    <p className="text-xs text-muted-foreground">학생이 새 뱃지를 획득할 때</p>
                  </div>
                  <Switch
                    checked={notifications.badgeEarned}
                    onCheckedChange={(val) =>
                      setNotifications({ ...notifications, badgeEarned: val })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">참여도 저하 경고</p>
                    <p className="text-xs text-muted-foreground">학생이 3일 이상 미접속할 때</p>
                  </div>
                  <Switch
                    checked={notifications.lowEngagement}
                    onCheckedChange={(val) =>
                      setNotifications({ ...notifications, lowEngagement: val })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      이메일 알림
                    </p>
                    <p className="text-xs text-muted-foreground">알림을 이메일로도 받기</p>
                  </div>
                  <Switch
                    checked={notifications.emailNotify}
                    onCheckedChange={(val) =>
                      setNotifications({ ...notifications, emailNotify: val })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Class Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5 text-primary" />
                  학급 설정
                </CardTitle>
                <CardDescription>학급 운영 기본 설정</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">자동 과제 배정</p>
                    <p className="text-xs text-muted-foreground">매일 자동으로 새 세트 배정</p>
                  </div>
                  <Switch
                    checked={classSettings.autoAssign}
                    onCheckedChange={(val) =>
                      setClassSettings({ ...classSettings, autoAssign: val })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">순위 공개</p>
                    <p className="text-xs text-muted-foreground">학생들에게 학급 내 순위 공개</p>
                  </div>
                  <Switch
                    checked={classSettings.showRanking}
                    onCheckedChange={(val) =>
                      setClassSettings({ ...classSettings, showRanking: val })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">재도전 허용</p>
                    <p className="text-xs text-muted-foreground">학습 세트 재도전 허용</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={classSettings.allowRetry}
                      onCheckedChange={(val) =>
                        setClassSettings({ ...classSettings, allowRetry: val })
                      }
                    />
                    {classSettings.allowRetry && (
                      <Select
                        value={classSettings.maxRetries}
                        onValueChange={(val) =>
                          setClassSettings({ ...classSettings, maxRetries: val })
                        }
                      >
                        <SelectTrigger className="w-[80px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1회</SelectItem>
                          <SelectItem value="2">2회</SelectItem>
                          <SelectItem value="3">3회</SelectItem>
                          <SelectItem value="99">무제한</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  화면/소리
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <Volume2 className="h-3.5 w-3.5" />
                      효과음
                    </p>
                    <p className="text-xs text-muted-foreground">알림 효과음 사용</p>
                  </div>
                  <Switch
                    checked={appearance.sound}
                    onCheckedChange={(val) =>
                      setAppearance({ ...appearance, sound: val })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">테마</p>
                    <p className="text-xs text-muted-foreground">화면 테마 설정</p>
                  </div>
                  <Select
                    value={appearance.theme}
                    onValueChange={(val) =>
                      setAppearance({ ...appearance, theme: val })
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">시스템 설정</SelectItem>
                      <SelectItem value="light">라이트</SelectItem>
                      <SelectItem value="dark">다크</SelectItem>
                    </SelectContent>
                  </Select>
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
