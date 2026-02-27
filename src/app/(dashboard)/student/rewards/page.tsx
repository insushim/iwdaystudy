"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Award, Star, Zap, Trophy, Crown, Gift, Sparkles } from "lucide-react";
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

// Mock badges data
const allBadges = [
  {
    id: "b1",
    name: "첫 걸음",
    description: "첫 번째 학습을 완료했어요!",
    icon: "🌱",
    rarity: "common" as const,
    earned: true,
    earnedDate: "2025-09-01",
  },
  {
    id: "b2",
    name: "3일 연속",
    description: "3일 연속 학습 달성!",
    icon: "🔥",
    rarity: "common" as const,
    earned: true,
    earnedDate: "2025-09-03",
  },
  {
    id: "b3",
    name: "7일 연속",
    description: "일주일 연속 학습! 대단해요!",
    icon: "⭐",
    rarity: "rare" as const,
    earned: true,
    earnedDate: "2025-09-07",
  },
  {
    id: "b4",
    name: "수학 천재",
    description: "수학 정답률 90% 이상 달성!",
    icon: "🧮",
    rarity: "rare" as const,
    earned: true,
    earnedDate: "2025-09-15",
  },
  {
    id: "b5",
    name: "국어 마스터",
    description: "국어 정답률 90% 이상 달성!",
    icon: "📖",
    rarity: "rare" as const,
    earned: true,
    earnedDate: "2025-10-01",
  },
  {
    id: "b6",
    name: "30일 연속",
    description: "한 달 연속 학습! 놀라워요!",
    icon: "🏆",
    rarity: "epic" as const,
    earned: true,
    earnedDate: "2025-10-01",
  },
  {
    id: "b7",
    name: "완벽한 하루",
    description: "하루 학습에서 100점 달성!",
    icon: "💎",
    rarity: "epic" as const,
    earned: true,
    earnedDate: "2025-10-05",
  },
  {
    id: "b8",
    name: "맞춤법 왕",
    description: "맞춤법 20문제 연속 정답!",
    icon: "✍️",
    rarity: "rare" as const,
    earned: true,
    earnedDate: "2025-10-10",
  },
  {
    id: "b9",
    name: "올라운더",
    description: "모든 과목 정답률 70% 이상!",
    icon: "🌈",
    rarity: "epic" as const,
    earned: false,
    progress: 6,
    maxProgress: 8,
  },
  {
    id: "b10",
    name: "100일 연속",
    description: "100일 연속 학습! 전설의 시작!",
    icon: "👑",
    rarity: "legendary" as const,
    earned: false,
    progress: 45,
    maxProgress: 100,
  },
  {
    id: "b11",
    name: "포인트 부자",
    description: "누적 포인트 10,000P 달성!",
    icon: "💰",
    rarity: "epic" as const,
    earned: false,
    progress: 3420,
    maxProgress: 10000,
  },
  {
    id: "b12",
    name: "전 과목 만점",
    description: "하루에 전 과목 만점 달성!",
    icon: "🎯",
    rarity: "legendary" as const,
    earned: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: "b13",
    name: "빛의 속도",
    description: "10분 이내로 전 문제 정답!",
    icon: "⚡",
    rarity: "epic" as const,
    earned: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: "b14",
    name: "한자 달인",
    description: "한자 정답률 90% 이상!",
    icon: "漢",
    rarity: "rare" as const,
    earned: false,
    progress: 55,
    maxProgress: 90,
  },
  {
    id: "b15",
    name: "영어 마스터",
    description: "영어 정답률 90% 이상!",
    icon: "🌏",
    rarity: "rare" as const,
    earned: false,
    progress: 65,
    maxProgress: 90,
  },
  {
    id: "b16",
    name: "365일 전설",
    description: "1년 연속 학습! 진정한 전설!",
    icon: "🌟",
    rarity: "legendary" as const,
    earned: false,
    progress: 45,
    maxProgress: 365,
  },
  {
    id: "b17",
    name: "50회 학습",
    description: "총 50회 학습 완료!",
    icon: "📚",
    rarity: "common" as const,
    earned: false,
    progress: 45,
    maxProgress: 50,
  },
  {
    id: "b18",
    name: "새벽형 학습러",
    description: "오전 7시 이전에 학습 완료!",
    icon: "🌅",
    rarity: "common" as const,
    earned: true,
    earnedDate: "2025-09-20",
  },
];

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
  let next = LEVEL_CONFIG[1];
  for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
    if (points >= LEVEL_CONFIG[i].minPoints) {
      current = LEVEL_CONFIG[i];
      next = LEVEL_CONFIG[i + 1] || null;
      break;
    }
  }
  return { current, next };
}

export default function StudentRewardsPage() {
  const totalPoints = 3420;
  const { current: currentLevel, next: nextLevel } = getLevel(totalPoints);

  const earnedBadges = allBadges.filter((b) => b.earned);
  const lockedBadges = allBadges.filter((b) => !b.earned);

  const rarityCount = useMemo(() => {
    const counts = { common: 0, rare: 0, epic: 0, legendary: 0 };
    earnedBadges.forEach((b) => counts[b.rarity]++);
    return counts;
  }, []);

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
            <TabsTrigger value="all">전체 ({allBadges.length})</TabsTrigger>
            <TabsTrigger value="earned">
              획득 ({earnedBadges.length})
            </TabsTrigger>
            <TabsTrigger value="locked">
              미획득 ({lockedBadges.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <BadgeGrid badges={allBadges} title="전체 뱃지" />
          </TabsContent>
          <TabsContent value="earned" className="mt-4">
            <BadgeGrid badges={earnedBadges} title="획득한 뱃지" />
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
                  b.progress / b.maxProgress > 0.5,
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
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
