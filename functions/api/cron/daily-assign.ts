// Cloudflare Pages Function: POST /api/cron/daily-assign
// Daily assignment cron job: assigns a daily set to all active classes
// Intended to be called by a Cloudflare Cron Trigger or manually by admin
// For Cloudflare Pages, this is triggered via an external cron service or admin action

import { authUserId, isCronAuthenticated } from '../../lib/ctx';
interface Env {
  DB: D1Database;
  CRON_SECRET?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    // 이 엔드포인트는 **전체 학급**에 세트를 배정한다. 인증은 두 가지뿐:
    //   (1) 미들웨어가 X-Cron-Secret 을 상수시간 비교로 통과시킨 크론 호출
    //   (2) 관리자 계정
    // 예전에는 `X-Cron-Secret` 헤더가 "있기만 하면" role 검사를 건너뛰어서,
    // CRON_SECRET 이 미설정인 환경에서는 로그인한 학생이 아무 값이나 얹어
    // 전역 배정을 실행할 수 있었다. 헤더 존재 여부가 아니라 미들웨어의
    // 검증 결과(isCronAuthenticated)만 신뢰한다.
    const userId = authUserId(context.data);
    const cronOk = isCronAuthenticated(context.data);

    if (!cronOk) {
      if (!userId) {
        return jsonResponse({ message: '인증이 필요합니다.' }, 401);
      }
      const profile = await context.env.DB.prepare(
        'SELECT role FROM profiles WHERE id = ?'
      ).bind(userId).first<{ role: string }>();

      if (!profile || profile.role !== 'admin') {
        return jsonResponse({ message: '관리자만 실행할 수 있습니다.' }, 403);
      }
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dayOfYear = getDayOfYear();

    // Get all active classes
    const classesResult = await context.env.DB.prepare(
      'SELECT * FROM classes WHERE is_active = 1'
    ).all();

    const classes = classesResult.results || [];
    let assignedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const cls of classes as any[]) {
      try {
        // Find a daily set for this class's grade and semester
        const setCountResult = await context.env.DB.prepare(
          'SELECT COUNT(*) as count FROM daily_sets WHERE grade = ? AND semester = ? AND is_published = 1'
        ).bind(cls.grade, cls.semester).first<{ count: number }>();

        const totalSets = setCountResult?.count || 0;
        if (totalSets === 0) {
          skippedCount++;
          continue;
        }

        const setNumber = ((dayOfYear - 1) % totalSets) + 1;

        const dailySet = await context.env.DB.prepare(
          'SELECT id FROM daily_sets WHERE grade = ? AND semester = ? AND set_number = ? AND is_published = 1'
        ).bind(cls.grade, cls.semester, setNumber).first<{ id: string }>();

        if (!dailySet) {
          skippedCount++;
          continue;
        }

        // Check if assignment already exists for today
        const existingAssignment = await context.env.DB.prepare(
          `SELECT id FROM daily_assignments
           WHERE class_id = ? AND daily_set_id = ? AND assigned_date = ?`
        ).bind(cls.id, dailySet.id, today).first();

        if (existingAssignment) {
          skippedCount++;
          continue;
        }

        // Create assignment for the class
        const assignmentId = crypto.randomUUID();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 1); // Due next day
        const dueDateStr = dueDate.toISOString().split('T')[0];

        await context.env.DB.prepare(
          `INSERT INTO daily_assignments (id, class_id, student_id, daily_set_id, assigned_date, due_date, is_mandatory, created_at)
           VALUES (?, ?, NULL, ?, ?, ?, 1, ?)`
        ).bind(
          assignmentId, cls.id, dailySet.id, today, dueDateStr,
          new Date().toISOString()
        ).run();

        // Also create individual assignments for each student in the class
        const membersResult = await context.env.DB.prepare(
          'SELECT student_id FROM class_members WHERE class_id = ?'
        ).bind(cls.id).all();

        const members = membersResult.results || [];
        const studentStmts = members.map((m: any) => {
          const sid = crypto.randomUUID();
          return context.env.DB.prepare(
            `INSERT OR IGNORE INTO daily_assignments (id, class_id, student_id, daily_set_id, assigned_date, due_date, is_mandatory, created_at)
             VALUES (?, ?, ?, ?, ?, ?, 1, ?)`
          ).bind(
            sid, cls.id, m.student_id, dailySet.id, today, dueDateStr,
            new Date().toISOString()
          );
        });

        if (studentStmts.length > 0) {
          await context.env.DB.batch(studentStmts);
        }

        assignedCount++;
      } catch (clsErr: any) {
        errors.push(`학급 ${cls.name} (${cls.id}): ${clsErr.message}`);
      }
    }

    return jsonResponse({
      date: today,
      totalClasses: classes.length,
      assignedCount,
      skippedCount,
      errors,
    });
  } catch {
    return jsonResponse({ message: '일일 배정 중 오류가 발생했습니다.' }, 500);
  }
};

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
