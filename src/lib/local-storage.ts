'use client';

// Learning data persistence with localStorage
// Provides the same data patterns as the D1 database API, but backed by localStorage.
// Used in static export mode and for offline functionality.

import { generateId } from './utils';
import type {
  LearningRecord,
  QuestionResponse,
  DailySet,
  Question,
  Badge,
  StudentBadge,
} from '@/types/database';

// ---------- Storage Keys ----------

const RECORDS_KEY = 'araharu_learning_records';
const RESPONSES_KEY = 'araharu_question_responses';
const DAILY_SETS_KEY = 'araharu_daily_sets';
const QUESTIONS_KEY = 'araharu_questions';
const BADGES_KEY = 'araharu_student_badges';

// ---------- Generic Helpers ----------

function getList<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveList<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

// ---------- Learning Records ----------

/**
 * Save or update a learning record.
 * If a record with the same id exists, it will be replaced.
 */
export function saveLearningRecord(record: LearningRecord): void {
  if (typeof window === 'undefined') return;
  const records = getList<LearningRecord>(RECORDS_KEY);
  const idx = records.findIndex((r) => r.id === record.id);

  if (idx >= 0) {
    records[idx] = record;
  } else {
    records.push(record);
  }

  saveList(RECORDS_KEY, records);
}

/**
 * Get all learning records for a student.
 */
export function getLearningRecords(studentId: string): LearningRecord[] {
  return getList<LearningRecord>(RECORDS_KEY).filter(
    (r) => r.student_id === studentId
  );
}

/**
 * Get a specific learning record by student + daily set.
 */
export function getRecordForSet(studentId: string, setId: string): LearningRecord | null {
  return getList<LearningRecord>(RECORDS_KEY).find(
    (r) => r.student_id === studentId && r.daily_set_id === setId
  ) ?? null;
}

/**
 * Get records for a date range.
 */
export function getRecordsByDateRange(
  studentId: string,
  from: string,
  to: string
): LearningRecord[] {
  return getList<LearningRecord>(RECORDS_KEY).filter((r) => {
    if (r.student_id !== studentId) return false;
    const recordDate = (r.completed_at || r.created_at).split('T')[0];
    return recordDate >= from && recordDate <= to;
  });
}

/**
 * Create a new learning record when starting a session.
 */
export function createLearningRecord(
  studentId: string,
  dailySetId: string,
  classId?: string | null
): LearningRecord {
  const now = new Date().toISOString();
  const record: LearningRecord = {
    id: generateId(),
    student_id: studentId,
    daily_set_id: dailySetId,
    class_id: classId ?? null,
    started_at: now,
    completed_at: null,
    total_score: 0,
    max_score: 0,
    time_spent_seconds: 0,
    is_completed: false,
    emotion_before: null,
    emotion_after: null,
    readiness: null,
    created_at: now,
  };

  saveLearningRecord(record);
  return record;
}

/**
 * Complete a learning record with final results.
 */
export function completeLearningRecord(
  recordId: string,
  data: {
    totalScore: number;
    maxScore: number;
    timeSpentSeconds: number;
    emotionBefore?: unknown;
    emotionAfter?: unknown;
    readiness?: unknown;
  }
): LearningRecord | null {
  const records = getList<LearningRecord>(RECORDS_KEY);
  const idx = records.findIndex((r) => r.id === recordId);
  if (idx < 0) return null;

  records[idx] = {
    ...records[idx],
    completed_at: new Date().toISOString(),
    total_score: data.totalScore,
    max_score: data.maxScore,
    time_spent_seconds: data.timeSpentSeconds,
    is_completed: true,
    emotion_before: data.emotionBefore ?? records[idx].emotion_before,
    emotion_after: data.emotionAfter ?? records[idx].emotion_after,
    readiness: data.readiness ?? records[idx].readiness,
  };

  saveList(RECORDS_KEY, records);
  return records[idx];
}

/**
 * Get completed dates for calendar display.
 */
export function getCompletedDates(studentId: string): string[] {
  return getLearningRecords(studentId)
    .filter((r) => r.is_completed)
    .map((r) => {
      const d = new Date(r.completed_at || r.created_at);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
}

// ---------- Question Responses ----------

/**
 * Save question responses for a learning record.
 * Replaces any existing responses for the same learning record.
 */
export function saveQuestionResponses(responses: QuestionResponse[]): void {
  if (typeof window === 'undefined') return;
  const existing = getList<QuestionResponse>(RESPONSES_KEY);

  // Remove old responses for the same learning record(s)
  const recordIds = new Set(responses.map((r) => r.learning_record_id));
  const filtered = existing.filter((r) => !recordIds.has(r.learning_record_id));

  saveList(RESPONSES_KEY, [...filtered, ...responses]);
}

/**
 * Get all question responses for a learning record.
 */
export function getResponsesForRecord(recordId: string): QuestionResponse[] {
  return getList<QuestionResponse>(RESPONSES_KEY).filter(
    (r) => r.learning_record_id === recordId
  );
}

/**
 * Get all question responses for a student across all records.
 */
export function getAllResponsesForStudent(studentId: string): QuestionResponse[] {
  const records = getLearningRecords(studentId);
  const recordIds = new Set(records.map((r) => r.id));
  return getList<QuestionResponse>(RESPONSES_KEY).filter(
    (r) => recordIds.has(r.learning_record_id)
  );
}

// ---------- Streak & Points ----------

/**
 * Calculate current streak count for a student.
 * A streak is the number of consecutive days with at least one completed session.
 */
export function getStreakCount(studentId: string): number {
  const records = getLearningRecords(studentId)
    .filter((r) => r.is_completed && r.completed_at)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());

  if (records.length === 0) return 0;

  // Get unique dates in descending order
  const uniqueDates = Array.from(
    new Set(records.map((r) => r.completed_at!.split('T')[0]))
  ).sort((a, b) => (b > a ? 1 : -1));

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // The most recent activity must be today or yesterday
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1]);
    const currDate = new Date(uniqueDates[i]);
    const diffMs = prevDate.getTime() - currDate.getTime();
    const diffDays = Math.round(diffMs / 86400000);

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate total accumulated points for a student.
 */
export function getTotalPoints(studentId: string): number {
  return getLearningRecords(studentId)
    .filter((r) => r.is_completed)
    .reduce((sum, r) => sum + r.total_score, 0);
}

/**
 * Update streak and points in the stored user profile.
 */
export function updateStreakAndPoints(studentId: string): { streak: number; totalPoints: number } {
  const streak = getStreakCount(studentId);
  const totalPoints = getTotalPoints(studentId);

  // Update the profile in localStorage
  const USERS_KEY = 'araharu_users';
  try {
    const usersData = localStorage.getItem(USERS_KEY);
    if (usersData) {
      const users = JSON.parse(usersData);
      const idx = users.findIndex((u: any) => u.id === studentId);
      if (idx >= 0) {
        users[idx].streak_count = streak;
        users[idx].total_points = totalPoints;
        users[idx].updated_at = new Date().toISOString();
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
    }
  } catch {
    // Non-critical: profile update failed silently
  }

  return { streak, totalPoints };
}

// ---------- Subject Stats ----------

/**
 * Get per-subject accuracy stats for a student.
 * Returns { [subject]: { correct, total, accuracy, avgTime } }
 */
export function getSubjectStats(
  studentId: string
): Record<string, { correct: number; total: number; accuracy: number; avgTime: number }> {
  const allResponses = getAllResponsesForStudent(studentId);

  // We need question data to know subjects
  const questions = getList<Question>(QUESTIONS_KEY);
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  const stats: Record<string, { correct: number; total: number; totalTime: number }> = {};

  for (const resp of allResponses) {
    const question = questionMap.get(resp.question_id);
    if (!question) continue;

    const subj = question.subject;
    if (subj === 'emotion_check' || subj === 'readiness_check') continue;

    if (!stats[subj]) {
      stats[subj] = { correct: 0, total: 0, totalTime: 0 };
    }

    stats[subj].total++;
    stats[subj].totalTime += resp.time_spent_seconds;

    if (resp.is_correct === true) {
      stats[subj].correct++;
    }
  }

  const result: Record<string, { correct: number; total: number; accuracy: number; avgTime: number }> = {};
  for (const [subject, data] of Object.entries(stats)) {
    result[subject] = {
      correct: data.correct,
      total: data.total,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      avgTime: data.total > 0 ? Math.round(data.totalTime / data.total) : 0,
    };
  }

  return result;
}

// ---------- Badges ----------

// Default badges matching the DB seed data
const DEFAULT_BADGES: Badge[] = [
  { id: 'b001', name: '첫 발걸음', description: '첫 학습을 완료했어요!', icon: '🌱', condition_type: 'first_complete', condition_value: 1, rarity: 'common', created_at: '' },
  { id: 'b002', name: '삼일 새싹', description: '3일 연속 학습!', icon: '🌿', condition_type: 'streak_3', condition_value: 3, rarity: 'common', created_at: '' },
  { id: 'b003', name: '일주일 나무', description: '7일 연속 학습!', icon: '🌳', condition_type: 'streak_7', condition_value: 7, rarity: 'rare', created_at: '' },
  { id: 'b004', name: '한 달 숲', description: '30일 연속 학습!', icon: '🏔️', condition_type: 'streak_30', condition_value: 30, rarity: 'epic', created_at: '' },
  { id: 'b005', name: '백일장', description: '100일 연속 학습!', icon: '👑', condition_type: 'streak_100', condition_value: 100, rarity: 'legendary', created_at: '' },
  { id: 'b006', name: '완벽한 하루', description: '일일 학습 만점!', icon: '⭐', condition_type: 'perfect_score', condition_value: 1, rarity: 'rare', created_at: '' },
  { id: 'b007', name: '수학 도사', description: '수학 10회 연속 정답!', icon: '🔢', condition_type: 'math_streak_10', condition_value: 10, rarity: 'rare', created_at: '' },
  { id: 'b008', name: '맞춤법 왕', description: '맞춤법 20회 연속 정답!', icon: '📝', condition_type: 'spelling_streak_20', condition_value: 20, rarity: 'epic', created_at: '' },
  { id: 'b009', name: '한자 박사', description: '한자 50개 마스터!', icon: '📜', condition_type: 'hanja_50', condition_value: 50, rarity: 'epic', created_at: '' },
  { id: 'b010', name: '영어 달인', description: '영어 30회 연속 정답!', icon: '🌏', condition_type: 'english_streak_30', condition_value: 30, rarity: 'epic', created_at: '' },
  { id: 'b011', name: '천 점 돌파', description: '누적 1,000점 달성!', icon: '🎯', condition_type: 'points_1000', condition_value: 1000, rarity: 'common', created_at: '' },
  { id: 'b012', name: '만 점 고수', description: '누적 10,000점 달성!', icon: '🏆', condition_type: 'points_10000', condition_value: 10000, rarity: 'rare', created_at: '' },
  { id: 'b013', name: '새벽 학습자', description: '오전 7시 이전 학습 완료!', icon: '🌅', condition_type: 'early_bird', condition_value: 1, rarity: 'rare', created_at: '' },
  { id: 'b014', name: '주말 전사', description: '주말에도 학습 완료!', icon: '💪', condition_type: 'weekend_learner', condition_value: 1, rarity: 'common', created_at: '' },
  { id: 'b015', name: '전 과목 마스터', description: '모든 과목 정답률 90% 이상!', icon: '🎓', condition_type: 'all_subject_90', condition_value: 90, rarity: 'legendary', created_at: '' },
];

/**
 * Get all available badges (definitions).
 */
export function getAllBadges(): Badge[] {
  return DEFAULT_BADGES;
}

/**
 * Get all badges the student has earned.
 */
export function getEarnedBadges(studentId: string): (Badge & { earned_at: string })[] {
  const studentBadges = getList<StudentBadge>(BADGES_KEY).filter(
    (sb) => sb.student_id === studentId
  );

  return studentBadges.map((sb) => {
    const badge = DEFAULT_BADGES.find((b) => b.id === sb.badge_id);
    return badge
      ? { ...badge, earned_at: sb.earned_at }
      : {
          id: sb.badge_id,
          name: '알 수 없는 뱃지',
          description: '',
          icon: '?',
          condition_type: '',
          condition_value: null,
          rarity: 'common' as const,
          created_at: '',
          earned_at: sb.earned_at,
        };
  });
}

/**
 * Get earned badge IDs as a simple string array (for backward compatibility).
 */
export function getEarnedBadgeIds(studentId: string): string[] {
  return getList<StudentBadge>(BADGES_KEY)
    .filter((sb) => sb.student_id === studentId)
    .map((sb) => sb.badge_id);
}

/**
 * Award a specific badge to a student.
 */
export function awardBadge(studentId: string, badgeId: string): void {
  const existing = getList<StudentBadge>(BADGES_KEY);
  const alreadyHas = existing.some(
    (sb) => sb.student_id === studentId && sb.badge_id === badgeId
  );
  if (alreadyHas) return;

  existing.push({
    id: generateId(),
    student_id: studentId,
    badge_id: badgeId,
    earned_at: new Date().toISOString(),
  });
  saveList(BADGES_KEY, existing);
}

/**
 * Check badge conditions after completing a learning session.
 * Returns newly earned badges.
 */
export function checkAndAwardBadges(
  studentId: string,
  sessionData?: {
    totalScore: number;
    maxScore: number;
  }
): Badge[] {
  const earnedIds = new Set(getEarnedBadgeIds(studentId));

  const streak = getStreakCount(studentId);
  const totalPoints = getTotalPoints(studentId);
  const completedRecords = getLearningRecords(studentId).filter((r) => r.is_completed);
  const subjectStats = getSubjectStats(studentId);

  const now = new Date();
  const currentHour = now.getHours();
  const dayOfWeek = now.getDay(); // 0=Sun, 6=Sat

  const newBadges: Badge[] = [];

  for (const badge of DEFAULT_BADGES) {
    if (earnedIds.has(badge.id)) continue;

    let isEarned = false;

    switch (badge.condition_type) {
      case 'first_complete':
        isEarned = completedRecords.length >= 1;
        break;
      case 'streak_3':
        isEarned = streak >= 3;
        break;
      case 'streak_7':
        isEarned = streak >= 7;
        break;
      case 'streak_30':
        isEarned = streak >= 30;
        break;
      case 'streak_100':
        isEarned = streak >= 100;
        break;
      case 'perfect_score':
        isEarned = sessionData
          ? sessionData.totalScore >= sessionData.maxScore && sessionData.maxScore > 0
          : completedRecords.some((r) => r.total_score >= r.max_score && r.max_score > 0);
        break;
      case 'points_1000':
        isEarned = totalPoints >= 1000;
        break;
      case 'points_10000':
        isEarned = totalPoints >= 10000;
        break;
      case 'early_bird':
        isEarned = currentHour < 7;
        break;
      case 'weekend_learner':
        isEarned = dayOfWeek === 0 || dayOfWeek === 6;
        break;
      case 'math_streak_10': {
        const math = subjectStats['math'];
        isEarned = !!math && math.correct >= 10;
        break;
      }
      case 'spelling_streak_20': {
        const spelling = subjectStats['spelling'];
        isEarned = !!spelling && spelling.correct >= 20;
        break;
      }
      case 'hanja_50': {
        const hanja = subjectStats['hanja'];
        isEarned = !!hanja && hanja.correct >= 50;
        break;
      }
      case 'english_streak_30': {
        const english = subjectStats['english'];
        isEarned = !!english && english.correct >= 30;
        break;
      }
      case 'all_subject_90': {
        const subjects = Object.values(subjectStats).filter((s) => s.total >= 3);
        isEarned = subjects.length >= 5 && subjects.every((s) => s.accuracy >= 90);
        break;
      }
    }

    if (isEarned) {
      awardBadge(studentId, badge.id);
      newBadges.push(badge);
    }
  }

  return newBadges;
}

// ---------- Daily Sets (Local Cache) ----------

/**
 * Store a generated daily set and its questions locally.
 */
export function storeDailySet(set: DailySet, questions: Question[]): void {
  const sets = getList<DailySet>(DAILY_SETS_KEY);
  const existingIdx = sets.findIndex((s) => s.id === set.id);
  if (existingIdx >= 0) {
    sets[existingIdx] = set;
  } else {
    sets.push(set);
  }
  saveList(DAILY_SETS_KEY, sets);

  // Store questions (merge with existing, replace if same ID)
  const existingQuestions = getList<Question>(QUESTIONS_KEY);
  const existingIds = new Set(existingQuestions.map((q) => q.id));
  const keptQuestions = existingQuestions.filter(
    (q) => q.daily_set_id !== set.id
  );
  saveList(QUESTIONS_KEY, [...keptQuestions, ...questions]);
}

/**
 * Get a stored daily set by ID.
 */
export function getStoredDailySet(setId: string): { set: DailySet; questions: Question[] } | null {
  const sets = getList<DailySet>(DAILY_SETS_KEY);
  const set = sets.find((s) => s.id === setId);
  if (!set) return null;

  const questions = getList<Question>(QUESTIONS_KEY)
    .filter((q) => q.daily_set_id === setId)
    .sort((a, b) => a.order_index - b.order_index);

  return { set, questions };
}

/**
 * Find a daily set by grade, semester, and optional set number.
 */
export function findDailySet(
  grade: number,
  semester: number,
  setNumber?: number
): { set: DailySet; questions: Question[] } | null {
  const sets = getList<DailySet>(DAILY_SETS_KEY).filter(
    (s) => s.grade === grade && s.semester === semester && s.is_published
  );

  if (sets.length === 0) return null;

  const targetSet = setNumber
    ? sets.find((s) => s.set_number === setNumber) || sets[0]
    : sets[0];

  const questions = getList<Question>(QUESTIONS_KEY)
    .filter((q) => q.daily_set_id === targetSet.id)
    .sort((a, b) => a.order_index - b.order_index);

  return { set: targetSet, questions };
}

// ---------- Report Data Aggregation ----------

/**
 * Get a full report object similar to what the /api/reports endpoint returns.
 */
export function getLocalReport(
  studentId: string,
  from: string,
  to: string
): {
  overview: {
    totalSessions: number;
    completedSessions: number;
    totalScore: number;
    totalMaxScore: number;
    avgScorePercent: number;
    totalTimeSeconds: number;
    streak: number;
    totalPoints: number;
  };
  subjectStats: Record<string, { correct: number; total: number; accuracy: number; avgTime: number }>;
  dailyActivity: Array<{ date: string; sessions: number; score: number; maxScore: number; accuracy: number }>;
  badges: (Badge & { earned_at: string })[];
  weakSubjects: Array<{ subject: string; correct: number; total: number; accuracy: number; avgTime: number }>;
} {
  const records = getRecordsByDateRange(studentId, from, to);
  const completed = records.filter((r) => r.is_completed);

  const totalScore = completed.reduce((s, r) => s + r.total_score, 0);
  const totalMaxScore = completed.reduce((s, r) => s + r.max_score, 0);
  const totalTime = completed.reduce((s, r) => s + r.time_spent_seconds, 0);
  const avgPercent = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

  // Daily activity
  const dailyMap = new Map<string, { sessions: number; score: number; maxScore: number }>();
  for (const r of completed) {
    const day = (r.completed_at || r.created_at).split('T')[0];
    const existing = dailyMap.get(day) || { sessions: 0, score: 0, maxScore: 0 };
    existing.sessions++;
    existing.score += r.total_score;
    existing.maxScore += r.max_score;
    dailyMap.set(day, existing);
  }

  const dailyActivity = Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      sessions: data.sessions,
      score: data.score,
      maxScore: data.maxScore,
      accuracy: data.maxScore > 0 ? Math.round((data.score / data.maxScore) * 100) : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const subjectStats = getSubjectStats(studentId);
  const badges = getEarnedBadges(studentId);

  const weakSubjects = Object.entries(subjectStats)
    .filter(([, s]) => s.total >= 3)
    .sort((a, b) => a[1].accuracy - b[1].accuracy)
    .slice(0, 3)
    .map(([subject, stats]) => ({ subject, ...stats }));

  return {
    overview: {
      totalSessions: records.length,
      completedSessions: completed.length,
      totalScore,
      totalMaxScore,
      avgScorePercent: avgPercent,
      totalTimeSeconds: totalTime,
      streak: getStreakCount(studentId),
      totalPoints: getTotalPoints(studentId),
    },
    subjectStats,
    dailyActivity,
    badges,
    weakSubjects,
  };
}

// ---------- Data Reset (Dev/Debug) ----------

/**
 * Clear all local learning data. Use for debugging only.
 */
export function clearAllLocalData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RECORDS_KEY);
  localStorage.removeItem(RESPONSES_KEY);
  localStorage.removeItem(DAILY_SETS_KEY);
  localStorage.removeItem(QUESTIONS_KEY);
  localStorage.removeItem(BADGES_KEY);
}
