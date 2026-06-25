"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import type { DailySetWithQuestions } from "@/types/learning";
import { generateDailySetWithoutRepeats } from "@/lib/daily-set-generator";
import {
  getLearningRecords,
  getSeenQuestionSignatures,
  storeDailySet,
  getStoredDailySet,
  getSubjectStats,
} from "@/lib/local-storage";

// Bump this version when daily set structure changes to invalidate cached sets
// v3: 4-way 콘텐츠 감사(한자 예문·영어 품사·과학) + 조사 교정 반영 → 기존 캐시 세트 무효화
// v4: 문제 품질 전면 재설계(distractor 범주매칭·답노출 차단·OX·고대힌트·맞춤법·학년초과 제거·지문 2배·TTS·레이아웃)
// v5: distractor 2차 강화(맞춤법 sentence 동일문장변형·숫자 스케일/콤마·길이근접 랭킹·뱅크7종 추가·vocab 특수variant 랭킹·0오답 가드)
// v6: 수학 reverse 정답무결성 — 첫 수가 결과로 유일 복원되는 식만 reverse 허용(몫/나머지·소수·문장형 폴백), 정답이 보기에 없거나 오답이 정답으로 표기되던 결함 제거
// v7: 수학 UX — 시각 보기 'H시 M분' 라벨(인코딩 300 비표시), 번호범례→실제 라벨 보기(무의미 3·4 제거), 분수 분수꼴 렌더, 이름 조사(연필이) 교정
const SET_VERSION = 7;
const TODAY_SET_PREFIX = "araharu_today_set_";

function getTodayKey(userId: string): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${TODAY_SET_PREFIX}v${SET_VERSION}_${userId}_${y}-${m}-${d}`;
}

export function useDailySet() {
  const { user } = useAuthStore();
  const [dailySet, setDailySet] = useState<DailySetWithQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDailySet = useCallback(async () => {
    if (!user?.grade || !user?.semester) {
      setError("학년/학기 정보가 필요합니다.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Return the same set for the whole day (one session per day)
      if (typeof window !== "undefined") {
        const todayKey = getTodayKey(user.id);
        const todaySetId = localStorage.getItem(todayKey);
        if (todaySetId) {
          const stored = getStoredDailySet(todaySetId);
          if (stored && stored.questions && stored.questions.length > 0) {
            setDailySet(stored);
            setIsLoading(false);
            return;
          }
          // Invalid/corrupted stored set - clear it and regenerate
          localStorage.removeItem(todayKey);
        }
      }

      // Generate a new set for today
      const records = getLearningRecords(user.id);
      const completedSetIds = new Set(
        records.filter((r) => r.is_completed).map((r) => r.daily_set_id),
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

      if (typeof window !== "undefined") {
        localStorage.setItem(getTodayKey(user.id), setData.set.id);
      }

      setDailySet(setData);
    } catch (err) {
      console.error("Daily set generation error:", err);
      // Clear corrupted today set so next refresh can retry
      if (typeof window !== "undefined") {
        localStorage.removeItem(getTodayKey(user.id));
      }
      setError(
        `학습 세트를 불러올 수 없습니다: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.grade, user?.semester]);

  useEffect(() => {
    fetchDailySet();
  }, [fetchDailySet]);

  return { dailySet, isLoading, error, refetch: fetchDailySet };
}
