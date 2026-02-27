// Cloudflare Pages Function: POST /api/cron/daily-assign
// Daily assignment cron job: assigns a daily set to all active classes
// Intended to be called by a Cloudflare Cron Trigger or manually by admin
// For Cloudflare Pages, this is triggered via an external cron service or admin action

interface Env {
  DB: D1Database;
  CRON_SECRET?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    // Verify this is an authorized call (either admin user or cron secret)
    const userId = (context as any).userId;
    const cronSecret = context.request.headers.get('X-Cron-Secret');

    if (!userId && !cronSecret) {
      return jsonResponse({ message: '인증이 필요합니다.' }, 401);
    }

    // If using cron secret, validate it
    if (cronSecret && context.env.CRON_SECRET && cronSecret !== context.env.CRON_SECRET) {
      return jsonResponse({ message: '잘못된 크론 시크릿입니다.' }, 403);
    }

    // If user-initiated, verify admin or teacher role
    if (userId && !cronSecret) {
      const profile = await context.env.DB.prepare(
        'SELECT role FROM profiles WHERE id = ?'
      ).bind(userId).first<{ role: string }>();

      if (!profile || (profile.role !== 'admin' && profile.role !== 'teacher')) {
        return jsonResponse({ message: '관리자 또는 교사만 실행할 수 있습니다.' }, 403);
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
  } catch (err: any) {
    return jsonResponse({ message: err.message || '일일 배정 중 오류가 발생했습니다.' }, 500);
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
