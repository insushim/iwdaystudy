'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useLearningStore } from '@/stores/learningStore';

export function useTimer(isActive: boolean) {
  const { timeSpent, incrementTime } = useLearningStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        incrementTime();
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, incrementTime]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  return { timeSpent, formattedTime: formatTime(timeSpent) };
}
