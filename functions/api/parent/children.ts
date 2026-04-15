// GET /api/parent/children - list children linked to the parent
// POST /api/parent/children { student_id } - link a child to the parent

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
  if (!caller || caller.role !== 'parent') {
    return jsonResponse({ message: '학부모 권한이 필요합니다.' }, 403);
  }

  const result = await context.env.DB.prepare(
    `SELECT id, email, name, grade, semester, school_name, class_name, student_number, streak_count, total_points
     FROM profiles WHERE role = 'student' AND parent_id = ?`,
  ).bind(userId).all();

  return jsonResponse({ children: result.results || [] });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const userId = (context as any).userId as string | undefined;
  if (!userId) return jsonResponse({ message: '인증이 필요합니다.' }, 401);

  const caller = await context.env.DB.prepare(
    'SELECT role FROM profiles WHERE id = ?',
  ).bind(userId).first<{ role: string }>();
  if (!caller || caller.role !== 'parent') {
    return jsonResponse({ message: '학부모 권한이 필요합니다.' }, 403);
  }

  const body = (await context.request.json()) as { student_id: string };
  if (!body.student_id || typeof body.student_id !== 'string' || body.student_id.length > 64) {
    return jsonResponse({ message: 'student_id가 올바르지 않습니다.' }, 400);
  }

  const student = await context.env.DB.prepare(
    'SELECT id, role, parent_id FROM profiles WHERE id = ?',
  ).bind(body.student_id).first<{ id: string; role: string; parent_id: string | null }>();

  if (!student || student.role !== 'student') {
    return jsonResponse({ message: '학생을 찾을 수 없습니다.' }, 404);
  }
  if (student.parent_id && student.parent_id !== userId) {
    return jsonResponse({ message: '이미 다른 학부모와 연결된 학생입니다.' }, 409);
  }

  await context.env.DB.prepare(
    'UPDATE profiles SET parent_id = ?, updated_at = ? WHERE id = ?',
  ).bind(userId, new Date().toISOString(), body.student_id).run();

  await logAudit(context.env.DB, {
    actorId: userId,
    actorRole: 'parent',
    action: 'parent_child_link',
    targetType: 'user',
    targetId: body.student_id,
    ip: clientIp(context.request),
  });

  return jsonResponse({ ok: true });
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
