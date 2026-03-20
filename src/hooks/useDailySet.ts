'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import type { DailySetWithQuestions } from '@/types/learning';
import { generateDailySetWithoutRepeats } from '@/lib/daily-set-generator';
import { getLearningRecords, getSeenQuestionSignatures, storeDailySet, getStoredDailySet, getSubjectStats } from '@/lib/local-storage';

const TODAY_SET_PREFIX = 'araharu_today_set_';

function getTodayKey(userId: string): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${TODAY_SET_PREFIX}${userId}_${y}-${m}-${d}`;
}

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

      // Return the same set for the whole day (one session per day)
      if (typeof window !== 'undefined') {
        const todaySetId = localStorage.getItem(getTodayKey(user.id));
        if (todaySetId) {
          const stored = getStoredDailySet(todaySetId);
          if (stored) {
            setDailySet(stored);
            setIsLoading(false);
            return;
          }
        }
      }

      // Generate a new set for today
      const records = getLearningRecords(user.id);
      const completedSetIds = new Set(
        records
          .filter((r) => r.is_completed)
          .map((r) => r.daily_set_id)
      );
      const usedQuestionSignatures = getSeenQuestionSignatures(user.id);

      // 적응형 난이도: 과목별 정답률 기반으로 난이도 조정
      const subjectAccuracy = getSubjectStats(user.id);

      const setData = generateDailySetWithoutRepeats(
        user.grade,
        user.semester,
        completedSetIds,
        usedQuestionSignatures,
        200,
        subjectAccuracy,
      );
      storeDailySet(setData.set, setData.questions);

      if (typeof window !== 'undefined') {
        localStorage.setItem(getTodayKey(user.id), setData.set.id);
      }

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
