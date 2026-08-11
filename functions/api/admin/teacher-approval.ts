// POST /api/admin/teacher-approval { teacher_id, action: "approve" | "reject" }

import { authUserId } from '../../lib/ctx';
import { logAudit, clientIp } from '../../lib/audit';

interface Env {
  DB: D1Database;
}

interface Body {
  teacher_id: string;
  action: 'approve' | 'reject';
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const userId = authUserId(context.data) as string | undefined;
  if (!userId) return jsonResponse({ message: '인증이 필요합니다.' }, 401);

  const caller = await context.env.DB.prepare(
    'SELECT role FROM profiles WHERE id = ?',
  ).bind(userId).first<{ role: string }>();
  if (!caller || caller.role !== 'admin') {
    return jsonResponse({ message: '관리자 권한이 필요합니다.' }, 403);
  }

  const body = (await context.request.json()) as Body;
  if (!body.teacher_id || typeof body.teacher_id !== 'string' || body.teacher_id.length > 64) {
    return jsonResponse({ message: 'teacher_id가 올바르지 않습니다.' }, 400);
  }
  if (body.action !== 'approve' && body.action !== 'reject') {
    return jsonResponse({ message: 'action은 approve 또는 reject여야 합니다.' }, 400);
  }

  const target = await context.env.DB.prepare(
    'SELECT id, role FROM profiles WHERE id = ?',
  ).bind(body.teacher_id).first<{ id: string; role: string }>();

  if (!target || target.role !== 'teacher') {
    return jsonResponse({ message: '해당 교사를 찾을 수 없습니다.' }, 404);
  }

  const newStatus = body.action === 'approve' ? 'approved' : 'rejected';
  await context.env.DB.prepare(
    'UPDATE profiles SET approval_status = ?, updated_at = ? WHERE id = ?',
  ).bind(newStatus, new Date().toISOString(), body.teacher_id).run();

  await logAudit(context.env.DB, {
    actorId: userId,
    actorRole: 'admin',
    action: `teacher_${body.action}`,
    targetType: 'user',
    targetId: body.teacher_id,
    ip: clientIp(context.request),
  });

  return jsonResponse({ teacher_id: body.teacher_id, approval_status: newStatus });
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
