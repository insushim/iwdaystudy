// GET /api/teacher/students - list own students
// DELETE /api/teacher/students - bulk delete (requires body.student_ids)

import { logAudit, clientIp } from '../../lib/audit';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const userId = (context as any).userId as string | undefined;
  if (!userId) return jsonResponse({ message: '인증이 필요합니다.' }, 401);

  const caller = await context.env.DB.prepare(
    'SELECT role FROM profiles WHERE id = ?',
  ).bind(userId).first<{ role: string }>();
  if (!caller || (caller.role !== 'teacher' && caller.role !== 'admin')) {
    return jsonResponse({ message: '교사 또는 관리자 권한이 필요합니다.' }, 403);
  }

  // Admin gets all students; teacher gets their own
  const sql = caller.role === 'admin'
    ? `SELECT id, email, name, grade, semester, class_name, student_number, streak_count, total_points, created_at
       FROM profiles WHERE role = 'student' ORDER BY created_at DESC LIMIT 1000`
    : `SELECT id, email, name, grade, semester, class_name, student_number, streak_count, total_points, created_at
       FROM profiles WHERE role = 'student' AND teacher_id = ? ORDER BY created_at DESC LIMIT 1000`;

  const stmt = caller.role === 'admin'
    ? context.env.DB.prepare(sql)
    : context.env.DB.prepare(sql).bind(userId);

  const result = await stmt.all();
  return jsonResponse({ students: result.results || [] });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const userId = (context as any).userId as string | undefined;
  if (!userId) return jsonResponse({ message: '인증이 필요합니다.' }, 401);

  const caller = await context.env.DB.prepare(
    'SELECT role FROM profiles WHERE id = ?',
  ).bind(userId).first<{ role: string }>();
  if (!caller || (caller.role !== 'teacher' && caller.role !== 'admin')) {
    return jsonResponse({ message: '교사 또는 관리자 권한이 필요합니다.' }, 403);
  }

  const body = (await context.request.json()) as { student_ids?: string[] };
  const ids = body.student_ids;
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 200) {
    return jsonResponse({ message: 'student_ids가 올바르지 않습니다. (1~200)' }, 400);
  }
  for (const id of ids) {
    if (typeof id !== 'string' || id.length > 64) {
      return jsonResponse({ message: 'student_ids 형식이 올바르지 않습니다.' }, 400);
    }
  }

  const placeholders = ids.map(() => '?').join(',');
  const whereTeacher = caller.role === 'admin' ? '' : ' AND teacher_id = ?';
  const binds = caller.role === 'admin' ? ids : [...ids, userId];

  const result = await context.env.DB
    .prepare(`DELETE FROM profiles WHERE role = 'student' AND id IN (${placeholders})${whereTeacher}`)
    .bind(...binds)
    .run();

  const deleted = result.meta?.changes ?? 0;

  await logAudit(context.env.DB, {
    actorId: userId,
    actorRole: caller.role,
    action: 'bulk_delete_students',
    targetType: 'students',
    ip: clientIp(context.request),
    metadata: { requested: ids.length, deleted },
  });

  return jsonResponse({ deleted });
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
