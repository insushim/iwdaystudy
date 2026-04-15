// GET /api/admin/analytics - aggregated analytics from D1 (admin only)

import { verifyToken } from "../../lib/crypto";

interface Env {
  DB: D1Database;
  AUTH_SECRET: string;
}

interface Row {
  [k: string]: unknown;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const authHeader = context.request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const tokenData = token ? await verifyToken(token, context.env.AUTH_SECRET) : null;
  if (!tokenData) return jsonResponse({ message: "인증이 필요합니다." }, 401);
  const userId = tokenData.id;

  const caller = await context.env.DB.prepare(
    "SELECT role FROM profiles WHERE id = ?",
  ).bind(userId).first<{ role: string }>();
  if (!caller || caller.role !== "admin") {
    return jsonResponse({ message: "관리자 권한이 필요합니다." }, 403);
  }

  const db = context.env.DB;

  // KPI 1: monthly active users (distinct students with learning_records in last 30 days)
  const mauRow = await db.prepare(
    `SELECT COUNT(DISTINCT student_id) as cnt FROM learning_records
     WHERE date(created_at) >= date('now', '-30 days')`,
  ).first<{ cnt: number }>();
  const mau = mauRow?.cnt || 0;

  const mauPrevRow = await db.prepare(
    `SELECT COUNT(DISTINCT student_id) as cnt FROM learning_records
     WHERE date(created_at) >= date('now', '-60 days')
       AND date(created_at) < date('now', '-30 days')`,
  ).first<{ cnt: number }>();
  const mauPrev = mauPrevRow?.cnt || 0;

  // KPI 2: daily average completions (last 30 days)
  const dailyAvgRow = await db.prepare(
    `SELECT COUNT(*) as cnt FROM learning_records
     WHERE is_completed = 1 AND date(completed_at) >= date('now', '-30 days')`,
  ).first<{ cnt: number }>();
  const dailyAvg = Math.round((dailyAvgRow?.cnt || 0) / 30);

  const dailyAvgPrevRow = await db.prepare(
    `SELECT COUNT(*) as cnt FROM learning_records
     WHERE is_completed = 1
       AND date(completed_at) >= date('now', '-60 days')
       AND date(completed_at) < date('now', '-30 days')`,
  ).first<{ cnt: number }>();
  const dailyAvgPrev = Math.round((dailyAvgPrevRow?.cnt || 0) / 30);

  // KPI 3: completion rate (completed / started) last 30 days
  const rateRow = await db.prepare(
    `SELECT
       SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as done,
       COUNT(*) as total
     FROM learning_records
     WHERE date(created_at) >= date('now', '-30 days')`,
  ).first<{ done: number; total: number }>();
  const completionRate =
    rateRow && rateRow.total > 0
      ? Math.round((rateRow.done / rateRow.total) * 1000) / 10
      : 0;

  const ratePrevRow = await db.prepare(
    `SELECT
       SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as done,
       COUNT(*) as total
     FROM learning_records
     WHERE date(created_at) >= date('now', '-60 days')
       AND date(created_at) < date('now', '-30 days')`,
  ).first<{ done: number; total: number }>();
  const completionRatePrev =
    ratePrevRow && ratePrevRow.total > 0
      ? Math.round((ratePrevRow.done / ratePrevRow.total) * 1000) / 10
      : 0;

  // KPI 4: monthly revenue (sum of subscriptions.price where starts_at this month)
  const revMonthRow = await db.prepare(
    `SELECT COALESCE(SUM(price), 0) as sum FROM subscriptions
     WHERE date(starts_at) >= date('now', 'start of month')`,
  ).first<{ sum: number }>();
  const monthlyRevenue = revMonthRow?.sum || 0;

  const revPrevMonthRow = await db.prepare(
    `SELECT COALESCE(SUM(price), 0) as sum FROM subscriptions
     WHERE date(starts_at) >= date('now', 'start of month', '-1 month')
       AND date(starts_at) < date('now', 'start of month')`,
  ).first<{ sum: number }>();
  const monthlyRevenuePrev = revPrevMonthRow?.sum || 0;

  // Chart: user growth — cumulative profile count by month for last 6 months
  const userGrowthRes = await db.prepare(
    `WITH RECURSIVE months(ym, idx) AS (
       SELECT strftime('%Y-%m', date('now', 'start of month', '-5 months')), 0
       UNION ALL
       SELECT strftime('%Y-%m', date(ym || '-01', '+1 month')), idx + 1
         FROM months WHERE idx < 5
     )
     SELECT m.ym,
       (SELECT COUNT(*) FROM profiles p
          WHERE strftime('%Y-%m', p.created_at) <= m.ym) as users
     FROM months m ORDER BY m.ym`,
  ).all();
  const userGrowth = ((userGrowthRes.results || []) as Row[]).map((r) => ({
    month: formatMonthLabel(String(r.ym)),
    users: Number(r.users) || 0,
  }));

  // Chart: daily active users for last 7 days
  const dauRes = await db.prepare(
    `WITH RECURSIVE days(d, idx) AS (
       SELECT date('now', '-6 days'), 0
       UNION ALL
       SELECT date(d, '+1 day'), idx + 1 FROM days WHERE idx < 6
     )
     SELECT days.d,
       COALESCE(
         (SELECT COUNT(DISTINCT student_id) FROM learning_records
            WHERE date(created_at) = days.d), 0
       ) as dau
     FROM days ORDER BY days.d`,
  ).all();
  const dau = ((dauRes.results || []) as Row[]).map((r) => ({
    date: formatDayLabel(String(r.d)),
    dau: Number(r.dau) || 0,
  }));

  // Chart: subject popularity (last 30 days, completed question_responses)
  const subjRes = await db.prepare(
    `SELECT q.subject, COUNT(*) as cnt
     FROM question_responses qr
     JOIN questions q ON qr.question_id = q.id
     JOIN learning_records lr ON qr.learning_record_id = lr.id
     WHERE date(lr.created_at) >= date('now', '-30 days')
     GROUP BY q.subject
     ORDER BY cnt DESC`,
  ).all();
  const subjRows = (subjRes.results || []) as Row[];
  const subjTotal =
    subjRows.reduce((s, r) => s + (Number(r.cnt) || 0), 0) || 1;
  const subjectPopularity = subjRows.map((r) => ({
    subject: String(r.subject),
    value: Math.round((Number(r.cnt) / subjTotal) * 1000) / 10,
  }));

  // Chart: completion rate by grade (last 90 days)
  const gradeRes = await db.prepare(
    `SELECT p.grade,
       SUM(CASE WHEN lr.is_completed = 1 THEN 1 ELSE 0 END) as done,
       COUNT(*) as total
     FROM learning_records lr
     JOIN profiles p ON lr.student_id = p.id
     WHERE p.grade IS NOT NULL
       AND date(lr.created_at) >= date('now', '-90 days')
     GROUP BY p.grade
     ORDER BY p.grade`,
  ).all();
  const completionByGrade = ((gradeRes.results || []) as Row[]).map((r) => ({
    grade: `${r.grade}학년`,
    rate:
      Number(r.total) > 0
        ? Math.round((Number(r.done) / Number(r.total)) * 100)
        : 0,
  }));

  // Chart: revenue last 6 months
  const revRes = await db.prepare(
    `WITH RECURSIVE months(ym, idx) AS (
       SELECT strftime('%Y-%m', date('now', 'start of month', '-5 months')), 0
       UNION ALL
       SELECT strftime('%Y-%m', date(ym || '-01', '+1 month')), idx + 1
         FROM months WHERE idx < 5
     )
     SELECT m.ym,
       COALESCE(
         (SELECT SUM(price) FROM subscriptions
            WHERE strftime('%Y-%m', starts_at) = m.ym), 0
       ) as revenue
     FROM months m ORDER BY m.ym`,
  ).all();
  const revenue = ((revRes.results || []) as Row[]).map((r) => ({
    month: formatMonthLabel(String(r.ym)),
    revenue: Math.round((Number(r.revenue) || 0) / 10000),
  }));

  // Summary stats
  const avgTimeRow = await db.prepare(
    `SELECT COALESCE(AVG(time_spent_seconds), 0) as avg FROM learning_records
     WHERE is_completed = 1 AND time_spent_seconds > 0
       AND date(completed_at) >= date('now', '-30 days')`,
  ).first<{ avg: number }>();
  const avgStudyMinutes = Math.round(((avgTimeRow?.avg || 0) / 60) * 10) / 10;

  const streakRow = await db.prepare(
    `SELECT COALESCE(MAX(streak_count), 0) as best FROM profiles`,
  ).first<{ best: number }>();
  const bestStreak = streakRow?.best || 0;

  const correctRow = await db.prepare(
    `SELECT
       SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct,
       COUNT(*) as total
     FROM question_responses qr
     JOIN learning_records lr ON qr.learning_record_id = lr.id
     WHERE date(lr.created_at) >= date('now', '-30 days')`,
  ).first<{ correct: number; total: number }>();
  const avgCorrectRate =
    correctRow && correctRow.total > 0
      ? Math.round((correctRow.correct / correctRow.total) * 1000) / 10
      : 0;

  return jsonResponse({
    kpis: {
      mau,
      mauChange: pctChange(mau, mauPrev),
      dailyAvg,
      dailyAvgChange: pctChange(dailyAvg, dailyAvgPrev),
      completionRate,
      completionRateChange: diffChange(completionRate, completionRatePrev),
      monthlyRevenue,
      monthlyRevenueChange: pctChange(monthlyRevenue, monthlyRevenuePrev),
    },
    userGrowth,
    dau,
    subjectPopularity,
    completionByGrade,
    revenue,
    summary: {
      avgStudyMinutes,
      bestStreak,
      avgCorrectRate,
    },
  });
};

function pctChange(now: number, prev: number): number {
  if (prev <= 0) return now > 0 ? 100 : 0;
  return Math.round(((now - prev) / prev) * 1000) / 10;
}

function diffChange(now: number, prev: number): number {
  return Math.round((now - prev) * 10) / 10;
}

function formatMonthLabel(ym: string): string {
  const m = ym.slice(5);
  return `${parseInt(m, 10)}월`;
}

function formatDayLabel(d: string): string {
  const parts = d.split("-");
  if (parts.length !== 3) return d;
  return `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}`;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
