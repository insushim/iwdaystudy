"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  iconColor?: string;
  iconBg?: string;
  className?: string;
}

export function StatsCard({
  icon: Icon,
  title,
  value,
  change,
  changeLabel,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  className,
}: StatsCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === undefined || change === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardContent className="flex items-center gap-4">
          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", iconBg)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground truncate">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              {change !== undefined && (
                <span
                  className={cn(
                    "flex items-center gap-0.5 text-xs font-medium",
                    isPositive && "text-emerald-600",
                    isNegative && "text-red-500",
                    isNeutral && "text-muted-foreground"
                  )}
                >
                  {isPositive && <TrendingUp className="h-3 w-3" />}
                  {isNegative && <TrendingDown className="h-3 w-3" />}
                  {isNeutral && <Minus className="h-3 w-3" />}
                  {isPositive ? "+" : ""}
                  {change}%
                  {changeLabel && (
                    <span className="text-muted-foreground ml-0.5">{changeLabel}</span>
                  )}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
