// GET /api/parent/children - list children linked to the parent
// POST /api/parent/children { student_id } - link a child to the parent

import { authUserId } from '../../lib/ctx';
import { logAudit, clientIp } from '../../lib/audit';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const userId = authUserId(context.data) as string | undefined;
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
  const userId = authUserId(context.data) as string | undefined;
  if (!userId) return jsonResponse({ message: '인증이 필요합니다.' }, 401);

  const caller = await context.env.DB.prepare(
    'SELECT role FROM profiles WHERE id = ?',
  ).bind(userId).first<{ role: string }>();
  if (!caller || caller.role !== 'parent') {
    return jsonResponse({ message: '학부모 권한이 필요합니다.' }, 403);
  }

  const body = (await context.request.json()) as {
    student_id?: string;
    student_email?: string;
    student_name?: string;
  };

  // 예전에는 student_id(UUID) 하나만 있으면 아무 학생이나 자기 자녀로 연결됐다.
  // 아동 개인정보(이름·학교·성적·정서기록)에 접근하는 연결이므로, 학부모가
  // 실제로 아는 정보(아이디 + 이름)를 모두 맞춰야 연결되도록 한다.
  const email = typeof body.student_email === 'string' ? body.student_email.trim() : '';
  const name = typeof body.student_name === 'string' ? body.student_name.trim() : '';
  if (!email || !name || email.length > 120 || name.length > 60) {
    return jsonResponse(
      { message: '자녀의 아이디와 이름을 모두 입력해주세요.' },
      400,
    );
  }
  // 학생 로그인 아이디는 '@' 없이 쓰면 '<id>@class.local' 로 정규화된다(login.ts와 동일 규칙).
  const normalizedEmail = email.includes('@') ? email : `${email}@class.local`;

  const student = await context.env.DB.prepare(
    'SELECT id, role, parent_id, name FROM profiles WHERE email = ?',
  )
    .bind(normalizedEmail)
    .first<{ id: string; role: string; parent_id: string | null; name: string }>();

  if (!student || student.role !== 'student' || student.name !== name) {
    // 존재 여부를 흘리지 않도록 동일한 메시지를 쓴다.
    await logAudit(context.env.DB, {
      actorId: userId,
      actorRole: 'parent',
      action: 'parent_child_link_failed',
      targetType: 'email',
      targetId: normalizedEmail,
      ip: clientIp(context.request),
    });
    return jsonResponse(
      { message: '아이디 또는 이름이 일치하는 학생이 없습니다.' },
      404,
    );
  }
  if (student.parent_id && student.parent_id !== userId) {
    return jsonResponse({ message: '이미 다른 학부모와 연결된 학생입니다.' }, 409);
  }

  await context.env.DB.prepare(
    'UPDATE profiles SET parent_id = ?, updated_at = ? WHERE id = ?',
  ).bind(userId, new Date().toISOString(), student.id).run();

  await logAudit(context.env.DB, {
    actorId: userId,
    actorRole: 'parent',
    action: 'parent_child_link',
    targetType: 'user',
    targetId: student.id,
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
