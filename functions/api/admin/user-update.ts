// POST /api/admin/user-update { user_id, role?, approval_status?, subscription_plan? }

import { authUserId } from '../../lib/ctx';
import { logAudit, clientIp } from '../../lib/audit';

interface Env {
  DB: D1Database;
}

interface Body {
  user_id: string;
  role?: 'student' | 'teacher' | 'parent' | 'admin';
  approval_status?: 'pending' | 'approved' | 'rejected';
  subscription_plan?: string;
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
  if (!body.user_id || typeof body.user_id !== 'string' || body.user_id.length > 64) {
    return jsonResponse({ message: 'user_id가 올바르지 않습니다.' }, 400);
  }

  const target = await context.env.DB.prepare(
    'SELECT id, role FROM profiles WHERE id = ?',
  ).bind(body.user_id).first<{ id: string; role: string }>();
  if (!target) return jsonResponse({ message: '사용자를 찾을 수 없습니다.' }, 404);

  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.role !== undefined) {
    if (!['student', 'teacher', 'parent', 'admin'].includes(body.role)) {
      return jsonResponse({ message: '올바르지 않은 역할입니다.' }, 400);
    }
    // Admins cannot demote themselves (safety rail)
    if (body.user_id === userId && body.role !== 'admin') {
      return jsonResponse({ message: '본인의 관리자 권한은 해제할 수 없습니다.' }, 400);
    }
    updates.push('role = ?');
    values.push(body.role);
  }
  if (body.approval_status !== undefined) {
    if (!['pending', 'approved', 'rejected'].includes(body.approval_status)) {
      return jsonResponse({ message: '올바르지 않은 승인 상태입니다.' }, 400);
    }
    updates.push('approval_status = ?');
    values.push(body.approval_status);
  }
  if (body.subscription_plan !== undefined) {
    if (typeof body.subscription_plan !== 'string' || body.subscription_plan.length > 20) {
      return jsonResponse({ message: '구독 플랜이 올바르지 않습니다.' }, 400);
    }
    updates.push('subscription_plan = ?');
    values.push(body.subscription_plan);
  }

  if (updates.length === 0) {
    return jsonResponse({ message: '변경할 항목이 없습니다.' }, 400);
  }

  updates.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(body.user_id);

  await context.env.DB
    .prepare(`UPDATE profiles SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();

  await logAudit(context.env.DB, {
    actorId: userId,
    actorRole: 'admin',
    action: 'admin_user_update',
    targetType: 'user',
    targetId: body.user_id,
    ip: clientIp(context.request),
    metadata: {
      role: body.role,
      approval_status: body.approval_status,
      subscription_plan: body.subscription_plan,
    },
  });

  return jsonResponse({ ok: true });
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
