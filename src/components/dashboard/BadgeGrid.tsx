"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Award, Lock } from "lucide-react";
import { motion } from "framer-motion";

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

interface BadgeGridProps {
  badges: BadgeItem[];
  className?: string;
  title?: string;
}

const RARITY_CONFIG: Record<
  Rarity,
  { label: string; border: string; bg: string; text: string; glow: string }
> = {
  common: {
    label: "일반",
    border: "border-gray-300 dark:border-gray-600",
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
    glow: "",
  },
  rare: {
    label: "희귀",
    border: "border-blue-400 dark:border-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-600 dark:text-blue-400",
    glow: "shadow-blue-200/50 dark:shadow-blue-800/30",
  },
  epic: {
    label: "영웅",
    border: "border-purple-400 dark:border-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-600 dark:text-purple-400",
    glow: "shadow-purple-200/50 dark:shadow-purple-800/30",
  },
  legendary: {
    label: "전설",
    border: "border-amber-400 dark:border-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-600 dark:text-amber-400",
    glow: "shadow-amber-200/50 dark:shadow-amber-800/30",
  },
};

export function BadgeGrid({
  badges,
  className,
  title = "뱃지 컬렉션",
}: BadgeGridProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);

  return (
    <>
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {badges.map((badge, index) => {
              const rarity = RARITY_CONFIG[badge.rarity];
              return (
                <motion.button
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03, duration: 0.2 }}
                  onClick={() => setSelectedBadge(badge)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all hover:scale-105",
                    badge.earned
                      ? cn(rarity.border, rarity.bg, "shadow-md", rarity.glow, "cursor-pointer")
                      : "border-muted bg-muted/30 opacity-50 cursor-pointer"
                  )}
                >
                  <div className="relative text-2xl sm:text-3xl">
                    {badge.earned ? (
                      badge.icon
                    ) : (
                      <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] sm:text-xs font-medium text-center leading-tight line-clamp-2",
                      badge.earned ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {badge.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={selectedBadge !== null}
        onOpenChange={() => setSelectedBadge(null)}
      >
        {selectedBadge && (
          <DialogContent className="sm:max-w-sm">
            <DialogHeader className="items-center">
              <div className="text-5xl mb-2">
                {selectedBadge.earned ? (
                  selectedBadge.icon
                ) : (
                  <Lock className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <DialogTitle className="text-center">{selectedBadge.name}</DialogTitle>
              <DialogDescription className="text-center">
                {selectedBadge.description}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-3">
              <Badge
                className={cn(
                  "text-xs",
                  RARITY_CONFIG[selectedBadge.rarity].text,
                  RARITY_CONFIG[selectedBadge.rarity].bg
                )}
                variant="outline"
              >
                {RARITY_CONFIG[selectedBadge.rarity].label}
              </Badge>
              {selectedBadge.earned && selectedBadge.earnedDate && (
                <p className="text-xs text-muted-foreground">
                  획득일: {selectedBadge.earnedDate}
                </p>
              )}
              {!selectedBadge.earned &&
                selectedBadge.progress !== undefined &&
                selectedBadge.maxProgress !== undefined && (
                  <div className="w-full space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>진행도</span>
                      <span>
                        {selectedBadge.progress} / {selectedBadge.maxProgress}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${(selectedBadge.progress / selectedBadge.maxProgress) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
