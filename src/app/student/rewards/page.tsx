"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Award, Zap, Sparkles, BookOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeGrid } from "@/components/dashboard/BadgeGrid";
import { useAuthStore } from "@/stores/authStore";
import {
  getAllBadges,
  getEarnedBadges,
  getTotalPoints,
  getStreakCount,
  getLearningRecords,
  getSubjectStats,
} from "@/lib/local-storage";

const LEVEL_CONFIG = [
  { name: "씨앗", minPoints: 0, icon: "🌱", color: "text-gray-500" },
  { name: "새싹", minPoints: 500, icon: "🌿", color: "text-green-500" },
  { name: "꽃봉오리", minPoints: 1500, icon: "🌷", color: "text-pink-500" },
  { name: "나무", minPoints: 3000, icon: "🌳", color: "text-emerald-600" },
  { name: "열매", minPoints: 5000, icon: "🍎", color: "text-red-500" },
  { name: "무지개", minPoints: 8000, icon: "🌈", color: "text-purple-500" },
  { name: "별", minPoints: 12000, icon: "⭐", color: "text-amber-500" },
  { name: "태양", minPoints: 20000, icon: "🌞", color: "text-orange-500" },
];

function getLevel(points: number) {
  let current = LEVEL_CONFIG[0];
  let next: (typeof LEVEL_CONFIG)[number] | null = LEVEL_CONFIG[1];
  for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
    if (points >= LEVEL_CONFIG[i].minPoints) {
      current = LEVEL_CONFIG[i];
      next = LEVEL_CONFIG[i + 1] || null;
      break;
    }
  }
  return { current, next };
}

type Rarity = "common" | "rare" | "epic" | "legendary";

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: Rarity;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  maxProgress?: number;
}

export default function StudentRewardsPage() {
  const user = useAuthStore((s) => s.user);
  const [isLoaded, setIsLoaded] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [allBadgeItems, setAllBadgeItems] = useState<BadgeItem[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    const studentId = user.id;

    // Get real data
    const points = getTotalPoints(studentId);
    setTotalPoints(points);

    const badgeDefs = getAllBadges();
    const earnedBadges = getEarnedBadges(studentId);
    const earnedIds = new Set(earnedBadges.map((b) => b.id));

    // Get data for progress calculation
    const streak = getStreakCount(studentId);
    const records = getLearningRecords(studentId).filter((r) => r.is_completed);
    const subjectStats = getSubjectStats(studentId);

    // Build badge list combining definitions with earned status
    const badges: BadgeItem[] = badgeDefs.map((def) => {
      const earned = earnedBadges.find((e) => e.id === def.id);

      if (earned) {
        return {
          id: def.id,
          name: def.name,
          description: def.description,
          icon: def.icon,
          rarity: def.rarity as Rarity,
          earned: true,
          earnedDate: earned.earned_at
            ? new Date(earned.earned_at).toLocaleDateString("ko-KR")
            : undefined,
        };
      }

      // Calculate progress for unearned badges
      let progress = 0;
      let maxProgress = 1;

      switch (def.condition_type) {
        case "first_complete":
          progress = records.length >= 1 ? 1 : 0;
          maxProgress = 1;
          break;
        case "streak_3":
          progress = Math.min(streak, 3);
          maxProgress = 3;
          break;
        case "streak_7":
          progress = Math.min(streak, 7);
          maxProgress = 7;
          break;
        case "streak_30":
          progress = Math.min(streak, 30);
          maxProgress = 30;
          break;
        case "streak_100":
          progress = Math.min(streak, 100);
          maxProgress = 100;
          break;
        case "perfect_score":
          progress = records.some(
            (r) => r.total_score >= r.max_score && r.max_score > 0,
          )
            ? 1
            : 0;
          maxProgress = 1;
          break;
        case "points_1000":
          progress = Math.min(points, 1000);
          maxProgress = 1000;
          break;
        case "points_10000":
          progress = Math.min(points, 10000);
          maxProgress = 10000;
          break;
        case "early_bird":
          progress = 0;
          maxProgress = 1;
          break;
        case "weekend_learner":
          progress = 0;
          maxProgress = 1;
          break;
        case "math_streak_10": {
          const math = subjectStats["math"];
          progress = math ? Math.min(math.correct, 10) : 0;
          maxProgress = 10;
          break;
        }
        case "spelling_streak_20": {
          const spelling = subjectStats["spelling"];
          progress = spelling ? Math.min(spelling.correct, 20) : 0;
          maxProgress = 20;
          break;
        }
        case "hanja_50": {
          const hanja = subjectStats["hanja"];
          progress = hanja ? Math.min(hanja.correct, 50) : 0;
          maxProgress = 50;
          break;
        }
        case "english_streak_30": {
          const english = subjectStats["english"];
          progress = english ? Math.min(english.correct, 30) : 0;
          maxProgress = 30;
          break;
        }
        case "all_subject_90": {
          const subjects = Object.values(subjectStats).filter(
            (s) => s.total >= 3,
          );
          const over90 = subjects.filter((s) => s.accuracy >= 90).length;
          progress = over90;
          maxProgress = Math.max(5, subjects.length);
          break;
        }
        default:
          progress = 0;
          maxProgress =
            typeof def.condition_value === "number" ? def.condition_value : 1;
      }

      return {
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        rarity: def.rarity as Rarity,
        earned: false,
        progress,
        maxProgress,
      };
    });

    setAllBadgeItems(badges);
    setIsLoaded(true);
  }, [user?.id]);

  const { current: currentLevel, next: nextLevel } = getLevel(totalPoints);

  const earnedBadges = useMemo(
    () => allBadgeItems.filter((b) => b.earned),
    [allBadgeItems],
  );
  const lockedBadges = useMemo(
    () => allBadgeItems.filter((b) => !b.earned),
    [allBadgeItems],
  );

  const rarityCount = useMemo(() => {
    const counts = { common: 0, rare: 0, epic: 0, legendary: 0 };
    earnedBadges.forEach((b) => counts[b.rarity]++);
    return counts;
  }, [earnedBadges]);

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            뱃지 / 보상
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            열심히 모은 뱃지와 포인트를 확인해보세요
          </p>
        </motion.div>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Award className="h-6 w-6 text-primary" />
          뱃지 / 보상
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          열심히 모은 뱃지와 포인트를 확인해보세요
        </p>
      </motion.div>

      {/* Level & Points */}
      <div className="grid sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{currentLevel.icon}</div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">현재 등급</p>
                  <p className={`text-2xl font-bold ${currentLevel.color}`}>
                    {currentLevel.name}
                  </p>
                  {nextLevel && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          다음 등급: {nextLevel.icon} {nextLevel.name}
                        </span>
                        <span>
                          {totalPoints} / {nextLevel.minPoints}P
                        </span>
                      </div>
                      <Progress
                        value={
                          ((totalPoints - currentLevel.minPoints) /
                            (nextLevel.minPoints - currentLevel.minPoints)) *
                          100
                        }
                        className="h-2"
                      />
                    </div>
                  )}
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
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/30">
                  <Zap className="h-7 w-7 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">총 포인트</p>
                  <p className="text-3xl font-bold">
                    {totalPoints.toLocaleString()}
                    <span className="text-lg text-muted-foreground ml-1">
                      P
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="h-2 w-2 rounded-full bg-gray-400" />
                  일반 {rarityCount.common}
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  희귀 {rarityCount.rare}
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="h-2 w-2 rounded-full bg-purple-400" />
                  영웅 {rarityCount.epic}
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  전설 {rarityCount.legendary}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Badge Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">전체 ({allBadgeItems.length})</TabsTrigger>
            <TabsTrigger value="earned">
              획득 ({earnedBadges.length})
            </TabsTrigger>
            <TabsTrigger value="locked">
              미획득 ({lockedBadges.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <BadgeGrid badges={allBadgeItems} title="전체 뱃지" />
          </TabsContent>
          <TabsContent value="earned" className="mt-4">
            {earnedBadges.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">
                    아직 획득한 뱃지가 없습니다. 학습을 시작해보세요!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <BadgeGrid badges={earnedBadges} title="획득한 뱃지" />
            )}
          </TabsContent>
          <TabsContent value="locked" className="mt-4">
            <BadgeGrid badges={lockedBadges} title="도전 중인 뱃지" />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Next Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />곧 획득할 수 있는
              뱃지
            </CardTitle>
            <CardDescription>
              조금만 더 노력하면 얻을 수 있어요!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lockedBadges
              .filter(
                (b) =>
                  b.progress !== undefined &&
                  b.maxProgress !== undefined &&
                  b.maxProgress > 0 &&
                  b.progress / b.maxProgress > 0.3,
              )
              .sort(
                (a, b) =>
                  b.progress! / b.maxProgress! - a.progress! / a.maxProgress!,
              )
              .slice(0, 4)
              .map((badge) => (
                <div key={badge.id} className="flex items-center gap-4">
                  <div className="text-2xl shrink-0">{badge.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {badge.name}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {badge.rarity === "common" && "일반"}
                        {badge.rarity === "rare" && "희귀"}
                        {badge.rarity === "epic" && "영웅"}
                        {badge.rarity === "legendary" && "전설"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {badge.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress
                        value={(badge.progress! / badge.maxProgress!) * 100}
                        className="h-1.5 flex-1"
                      />
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {badge.progress} / {badge.maxProgress}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            {lockedBadges.filter(
              (b) =>
                b.progress !== undefined &&
                b.maxProgress !== undefined &&
                b.maxProgress > 0 &&
                b.progress / b.maxProgress > 0.3,
            ).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                학습을 계속하면 곧 뱃지를 획득할 수 있어요!
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
