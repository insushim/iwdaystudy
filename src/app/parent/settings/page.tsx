"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import {
  getParentTimeSettings,
  saveParentTimeSettings,
  type ParentTimeSettings,
} from "@/lib/local-storage";

const TIME_LIMIT_OPTIONS = [
  { value: 0, label: "무제한" },
  { value: 30, label: "30분" },
  { value: 60, label: "60분" },
  { value: 90, label: "90분" },
  { value: 120, label: "120분" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function ParentSettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<ParentTimeSettings>({
    daily_time_limit_minutes: 0,
    warning_before_minutes: 5,
    allowed_start_hour: 6,
    allowed_end_hour: 22,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setSettings(getParentTimeSettings(user.id));
    }
  }, [user]);

  const handleSave = () => {
    if (!user) return;
    saveParentTimeSettings(user.id, settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/parent/")}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          돌아가기
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          학습 시간 관리
        </h1>
        <p className="text-muted-foreground mt-1">
          자녀의 학습 시간을 설정하고 관리할 수 있습니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>일일 학습 시간 제한</CardTitle>
          <CardDescription>
            하루에 학습할 수 있는 최대 시간을 설정합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TIME_LIMIT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  setSettings((s) => ({
                    ...s,
                    daily_time_limit_minutes: opt.value,
                  }))
                }
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  settings.daily_time_limit_minutes === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted border-border"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>학습 허용 시간대</CardTitle>
          <CardDescription>
            학습을 시작할 수 있는 시간 범위를 설정합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">시작</label>
              <select
                value={settings.allowed_start_hour}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    allowed_start_hour: Number(e.target.value),
                  }))
                }
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </div>
            <span className="text-muted-foreground">~</span>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">종료</label>
              <select
                value={settings.allowed_end_hour}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    allowed_end_hour: Number(e.target.value),
                  }))
                }
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            설정한 시간대 밖에서는 학습 시작 시 안내 메시지가 표시됩니다.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>종료 전 알림</CardTitle>
          <CardDescription>
            학습 시간이 다 되기 전에 미리 알려줍니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">종료</label>
            <select
              value={settings.warning_before_minutes}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  warning_before_minutes: Number(e.target.value),
                }))
              }
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {[3, 5, 10, 15].map((m) => (
                <option key={m} value={m}>
                  {m}분
                </option>
              ))}
            </select>
            <span className="text-sm text-muted-foreground">전에 알림</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2 rounded-xl px-6">
          <Save className="h-4 w-4" />
          {saved ? "저장 완료!" : "저장하기"}
        </Button>
      </div>
    </div>
  );
}
