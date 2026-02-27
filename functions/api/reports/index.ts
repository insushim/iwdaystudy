// Cloudflare Pages Function: GET /api/reports
// Returns learning reports/statistics for a student
// Query params: ?student_id=xxx&period=week|month|all&from=YYYY-MM-DD&to=YYYY-MM-DD

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const userId = (context as any).userId;
    if (!userId) {
      return jsonResponse({ message: '인증이 필요합니다.' }, 401);
    }

    const url = new URL(context.request.url);
    const targetStudentId = url.searchParams.get('student_id') || userId;
    const period = url.searchParams.get('period') || 'week';
    const fromDate = url.searchParams.get('from');
    const toDate = url.searchParams.get('to');

    // Verify access: user can view their own reports, or teacher/parent can view their students
    if (targetStudentId !== userId) {
      const requester = await context.env.DB.prepare(
        'SELECT role FROM profiles WHERE id = ?'
      ).bind(userId).first<{ role: string }>();

      if (!requester || (requester.role !== 'teacher' && requester.role !== 'parent' && requester.role !== 'admin')) {
        return jsonResponse({ message: '해당 학생의 리포트를 볼 수 있는 권한이 없습니다.' }, 403);
      }

      // For teacher, check if student is in their class
      if (requester.role === 'teacher') {
        const isMember = await context.env.DB.prepare(
          `SELECT cm.id FROM class_members cm
           JOIN classes c ON cm.class_id = c.id
           WHERE c.teacher_id = ? AND cm.student_id = ?`
        ).bind(userId, targetStudentId).first();

        if (!isMember) {
          return jsonResponse({ message: '해당 학생은 선생님의 학급에 속하지 않습니다.' }, 403);
        }
      }

      // For parent, check parent_id
      if (requester.role === 'parent') {
        const child = await context.env.DB.prepare(
          'SELECT id FROM profiles WHERE id = ? AND parent_id = ?'
        ).bind(targetStudentId, userId).first();

        if (!child) {
          return jsonResponse({ message: '해당 학생은 학부모님의 자녀가 아닙니다.' }, 403);
        }
      }
    }

    // Calculate date range
    let dateFrom: string;
    let dateTo: string;

    if (fromDate && toDate) {
      dateFrom = fromDate;
      dateTo = toDate;
    } else {
      const now = new Date();
      dateTo = now.toISOString().split('T')[0];

      if (period === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setDate(monthAgo.getDate() - 30);
        dateFrom = monthAgo.toISOString().split('T')[0];
      } else if (period === 'all') {
        dateFrom = '2020-01-01';
      } else {
        // default: week
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateFrom = weekAgo.toISOString().split('T')[0];
      }
    }

    // Fetch profile
    const profile = await context.env.DB.prepare(
      'SELECT id, name, grade, semester, streak_count, total_points, avatar_url FROM profiles WHERE id = ?'
    ).bind(targetStudentId).first();

    if (!profile) {
      return jsonResponse({ message: '학생 정보를 찾을 수 없습니다.' }, 404);
    }

    // Overall stats for the period
    const overallStats = await context.env.DB.prepare(
      `SELECT
        COUNT(*) as total_sessions,
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed_sessions,
        SUM(total_score) as total_score,
        SUM(max_score) as total_max_score,
        SUM(time_spent_seconds) as total_time_seconds,
        AVG(CASE WHEN is_completed = 1 THEN CAST(total_score AS FLOAT) / NULLIF(max_score, 0) * 100 END) as avg_score_percent
      FROM learning_records
      WHERE student_id = ? AND date(created_at) >= ? AND date(created_at) <= ?`
    ).bind(targetStudentId, dateFrom, dateTo).first();

    // Per-subject accuracy
    const subjectStatsResult = await context.env.DB.prepare(
      `SELECT
        q.subject,
        SUM(CASE WHEN qr.is_correct = 1 THEN 1 ELSE 0 END) as correct,
        COUNT(*) as total,
        AVG(qr.time_spent_seconds) as avg_time
      FROM question_responses qr
      JOIN questions q ON qr.question_id = q.id
      JOIN learning_records lr ON qr.learning_record_id = lr.id
      WHERE lr.student_id = ? AND date(lr.created_at) >= ? AND date(lr.created_at) <= ?
        AND q.subject NOT IN ('emotion_check', 'readiness_check')
      GROUP BY q.subject`
    ).bind(targetStudentId, dateFrom, dateTo).all();

    const subjectStats: Record<string, { correct: number; total: number; accuracy: number; avgTime: number }> = {};
    for (const row of (subjectStatsResult.results || []) as any[]) {
      subjectStats[row.subject] = {
        correct: row.correct,
        total: row.total,
        accuracy: row.total > 0 ? Math.round((row.correct / row.total) * 100) : 0,
        avgTime: Math.round(row.avg_time || 0),
      };
    }

    // Daily activity (number of sessions and scores per day)
    const dailyActivityResult = await context.env.DB.prepare(
      `SELECT
        date(completed_at) as day,
        COUNT(*) as sessions,
        SUM(total_score) as score,
        SUM(max_score) as max_score
      FROM learning_records
      WHERE student_id = ? AND is_completed = 1 AND date(created_at) >= ? AND date(created_at) <= ?
      GROUP BY date(completed_at)
      ORDER BY day ASC`
    ).bind(targetStudentId, dateFrom, dateTo).all();

    const dailyActivity = (dailyActivityResult.results || []).map((row: any) => ({
      date: row.day,
      sessions: row.sessions,
      score: row.score,
      maxScore: row.max_score,
      accuracy: row.max_score > 0 ? Math.round((row.score / row.max_score) * 100) : 0,
    }));

    // Emotion trends (average emotion values over the period)
    const emotionResult = await context.env.DB.prepare(
      `SELECT emotion_before, emotion_after, date(completed_at) as day
       FROM learning_records
       WHERE student_id = ? AND is_completed = 1
         AND emotion_before IS NOT NULL AND emotion_after IS NOT NULL
         AND date(created_at) >= ? AND date(created_at) <= ?
       ORDER BY day ASC`
    ).bind(targetStudentId, dateFrom, dateTo).all();

    const emotionTrends = (emotionResult.results || []).map((row: any) => {
      let before, after;
      try { before = JSON.parse(row.emotion_before); } catch { before = null; }
      try { after = JSON.parse(row.emotion_after); } catch { after = null; }
      return { date: row.day, before, after };
    });

    // Earned badges
    const badgesResult = await context.env.DB.prepare(
      `SELECT b.id, b.name, b.description, b.icon, b.rarity, sb.earned_at
       FROM student_badges sb
       JOIN badges b ON sb.badge_id = b.id
       WHERE sb.student_id = ?
       ORDER BY sb.earned_at DESC`
    ).bind(targetStudentId).all();

    const badges = badgesResult.results || [];

    // Weak subjects (lowest accuracy)
    const weakSubjects = Object.entries(subjectStats)
      .filter(([, stats]) => stats.total >= 3) // Only subjects with enough data
      .sort((a, b) => a[1].accuracy - b[1].accuracy)
      .slice(0, 3)
      .map(([subject, stats]) => ({ subject, ...stats }));

    return jsonResponse({
      profile,
      period: { from: dateFrom, to: dateTo },
      overview: {
        totalSessions: overallStats?.total_sessions || 0,
        completedSessions: overallStats?.completed_sessions || 0,
        totalScore: overallStats?.total_score || 0,
        totalMaxScore: overallStats?.total_max_score || 0,
        avgScorePercent: Math.round(overallStats?.avg_score_percent as number || 0),
        totalTimeSeconds: overallStats?.total_time_seconds || 0,
        streak: (profile as any).streak_count || 0,
        totalPoints: (profile as any).total_points || 0,
      },
      subjectStats,
      dailyActivity,
      emotionTrends,
      badges,
      weakSubjects,
    });
  } catch (err: any) {
    return jsonResponse({ message: err.message || '리포트 조회 중 오류가 발생했습니다.' }, 500);
  }
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
