// GET /api/classes/members?class_id=xxx - list students in a class
// POST /api/classes/members - add student to class { class_id, student_id }
// DELETE /api/classes/members - remove student from class { class_id, student_id }

import { authUserId } from '../../lib/ctx';
import { logAudit, clientIp } from '../../lib/audit';

interface Env {
  DB: D1Database;
}

async function authorizeClassAccess(
  db: D1Database,
  userId: string,
  classId: string,
): Promise<{ ok: boolean; role: string; teacherId?: string }> {
  const caller = await db
    .prepare('SELECT role FROM profiles WHERE id = ?')
    .bind(userId)
    .first<{ role: string }>();
  if (!caller) return { ok: false, role: 'unknown' };

  if (caller.role === 'admin') return { ok: true, role: 'admin' };
  if (caller.role !== 'teacher') return { ok: false, role: caller.role };

  const cls = await db
    .prepare('SELECT teacher_id FROM classes WHERE id = ?')
    .bind(classId)
    .first<{ teacher_id: string }>();
  if (!cls) return { ok: false, role: 'teacher' };
  return { ok: cls.teacher_id === userId, role: 'teacher', teacherId: cls.teacher_id };
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const userId = authUserId(context.data) as string | undefined;
  if (!userId) return jsonResponse({ message: '인증이 필요합니다.' }, 401);

  const url = new URL(context.request.url);
  const classId = url.searchParams.get('class_id');
  if (!classId) return jsonResponse({ message: 'class_id가 필요합니다.' }, 400);

  const auth = await authorizeClassAccess(context.env.DB, userId, classId);
  if (!auth.ok) return jsonResponse({ message: '접근 권한이 없습니다.' }, 403);

  const result = await context.env.DB.prepare(
    `SELECT p.id, p.email, p.name, p.grade, p.semester, p.student_number, p.streak_count, p.total_points, cm.joined_at
     FROM class_members cm
     JOIN profiles p ON cm.student_id = p.id
     WHERE cm.class_id = ?
     ORDER BY p.student_number ASC, p.name ASC`,
  ).bind(classId).all();

  return jsonResponse({ students: result.results || [] });
};

interface MemberBody {
  class_id: string;
  student_id: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const userId = authUserId(context.data) as string | undefined;
  if (!userId) return jsonResponse({ message: '인증이 필요합니다.' }, 401);

  const body = (await context.request.json()) as MemberBody;
  if (!body.class_id || !body.student_id) {
    return jsonResponse({ message: 'class_id와 student_id가 필요합니다.' }, 400);
  }

  const auth = await authorizeClassAccess(context.env.DB, userId, body.class_id);
  if (!auth.ok) return jsonResponse({ message: '접근 권한이 없습니다.' }, 403);

  const student = await context.env.DB
    .prepare('SELECT role, teacher_id FROM profiles WHERE id = ?')
    .bind(body.student_id)
    .first<{ role: string; teacher_id: string | null }>();
  if (!student || student.role !== 'student') {
    return jsonResponse({ message: '학생을 찾을 수 없습니다.' }, 404);
  }

  // 학급 소유권만 확인하면 다른 교사의 학생을 자기 반에 무단 편입시킨 뒤
  // 리포트(이름·학교·성적·정서기록)까지 열람할 수 있다. 담당 학생이거나
  // 아직 담임이 지정되지 않은 학생만 추가할 수 있게 막는다(관리자는 예외).
  // 담임이 지정되지 않은 학생(자가가입 학생)까지 허용하면, 아무 교사나 UUID만
  // 알면 남의 학생을 자기 반에 넣고 리포트를 볼 수 있다. 교사는 자기가 만든
  // 학생(bulk-create 가 teacher_id 를 채운다)만 학급에 추가할 수 있게 한다.
  if (auth.role !== 'admin' && student.teacher_id !== userId) {
    await logAudit(context.env.DB, {
      actorId: userId,
      actorRole: auth.role,
      action: 'class_member_add_denied',
      targetType: 'user',
      targetId: body.student_id,
      ip: clientIp(context.request),
      metadata: { reason: 'not_own_student', class_id: body.class_id },
    });
    return jsonResponse(
      { message: '다른 선생님의 학생은 학급에 추가할 수 없습니다.' },
      403,
    );
  }


  await context.env.DB.prepare(
    `INSERT OR IGNORE INTO class_members (id, class_id, student_id, joined_at)
     VALUES (?, ?, ?, ?)`,
  ).bind(crypto.randomUUID(), body.class_id, body.student_id, new Date().toISOString()).run();

  await logAudit(context.env.DB, {
    actorId: userId,
    actorRole: auth.role,
    action: 'class_member_add',
    targetType: 'class_member',
    targetId: `${body.class_id}:${body.student_id}`,
    ip: clientIp(context.request),
  });

  return jsonResponse({ ok: true });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const userId = authUserId(context.data) as string | undefined;
  if (!userId) return jsonResponse({ message: '인증이 필요합니다.' }, 401);

  const body = (await context.request.json()) as MemberBody;
  if (!body.class_id || !body.student_id) {
    return jsonResponse({ message: 'class_id와 student_id가 필요합니다.' }, 400);
  }

  const auth = await authorizeClassAccess(context.env.DB, userId, body.class_id);
  if (!auth.ok) return jsonResponse({ message: '접근 권한이 없습니다.' }, 403);

  await context.env.DB.prepare(
    'DELETE FROM class_members WHERE class_id = ? AND student_id = ?',
  ).bind(body.class_id, body.student_id).run();

  await logAudit(context.env.DB, {
    actorId: userId,
    actorRole: auth.role,
    action: 'class_member_remove',
    targetType: 'class_member',
    targetId: `${body.class_id}:${body.student_id}`,
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
