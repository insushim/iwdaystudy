'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import type { DailySetWithQuestions } from '@/types/learning';
import { generateDailySet } from '@/lib/daily-set-generator';
import { getLearningRecords } from '@/lib/local-storage';

export function useDailySet() {
  const { user } = useAuthStore();
  const [dailySet, setDailySet] = useState<DailySetWithQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDailySet = useCallback(async () => {
    if (!user?.grade || !user?.semester) {
      setError('학년/학기 정보가 필요합니다.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get student's completed set IDs to avoid repeats
      const records = getLearningRecords(user.id);
      const completedSetIds = new Set(
        records
          .filter((r) => r.is_completed)
          .map((r) => r.daily_set_id)
      );

      const setData = generateDailySet(user.grade, user.semester, completedSetIds);
      setDailySet(setData);
    } catch {
      setError('학습 세트를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.grade, user?.semester]);

  useEffect(() => {
    fetchDailySet();
  }, [fetchDailySet]);

  return { dailySet, isLoading, error, refetch: fetchDailySet };
}
