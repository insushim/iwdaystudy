'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock, Pause, Play, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  /** If set, countdown mode (in seconds). Otherwise count up. */
  countdownSeconds?: number;
  onTimeUp?: () => void;
  className?: string;
  /** External control: pause when true */
  paused?: boolean;
  /** Expose elapsed time in seconds to parent */
  onTick?: (elapsedSeconds: number) => void;
}

export default function Timer({ countdownSeconds, onTimeUp, className, paused: externalPaused, onTick }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isCountdown = countdownSeconds != null && countdownSeconds > 0;

  const effectivePaused = isPaused || externalPaused;

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        onTick?.(next);

        if (isCountdown && next >= countdownSeconds!) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onTimeUp?.();
        }
        return next;
      });
    }, 1000);
  }, [isCountdown, countdownSeconds, onTimeUp, onTick]);

  useEffect(() => {
    if (!effectivePaused) {
      startTimer();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [effectivePaused, startTimer]);

  const displaySeconds = isCountdown
    ? Math.max(countdownSeconds! - elapsed, 0)
    : elapsed;

  const minutes = Math.floor(displaySeconds / 60);
  const seconds = displaySeconds % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Warning when less than 5 minutes remain in countdown
  const isWarning = isCountdown && (countdownSeconds! - elapsed) <= 300 && (countdownSeconds! - elapsed) > 0;
  const isCritical = isCountdown && (countdownSeconds! - elapsed) <= 60 && (countdownSeconds! - elapsed) > 0;
  const isTimeUp = isCountdown && elapsed >= countdownSeconds!;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <motion.div
        animate={isCritical ? { scale: [1, 1.05, 1] } : undefined}
        transition={isCritical ? { duration: 1, repeat: Infinity } : undefined}
        className={cn(
          'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold transition-colors',
          isTimeUp
            ? 'bg-red-100 text-red-700 border border-red-200'
            : isCritical
            ? 'bg-red-50 text-red-600 border border-red-200'
            : isWarning
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : 'bg-muted text-foreground border border-border'
        )}
      >
        {isWarning || isCritical ? (
          <AlertTriangle className="h-3.5 w-3.5" />
        ) : (
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        <span className="font-mono tracking-wider">{formatted}</span>
      </motion.div>

      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => setIsPaused(!isPaused)}
        className="rounded-full"
        title={isPaused ? '계속하기' : '일시정지'}
      >
        {isPaused ? (
          <Play className="h-3.5 w-3.5" />
        ) : (
          <Pause className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
