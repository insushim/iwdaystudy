// GET /api/classes - list classes (teacher sees own, admin sees all)
// POST /api/classes - create a class (teacher/admin)

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
  if (!caller) return jsonResponse({ message: '사용자를 찾을 수 없습니다.' }, 404);

  const sql = caller.role === 'admin'
    ? 'SELECT * FROM classes ORDER BY created_at DESC LIMIT 500'
    : 'SELECT * FROM classes WHERE teacher_id = ? ORDER BY created_at DESC LIMIT 500';

  const stmt = caller.role === 'admin'
    ? context.env.DB.prepare(sql)
    : context.env.DB.prepare(sql).bind(userId);

  const result = await stmt.all();
  return jsonResponse({ classes: result.results || [] });
};

interface CreateBody {
  name: string;
  grade: number;
  semester: number;
  school_name?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const userId = (context as any).userId as string | undefined;
  if (!userId) return jsonResponse({ message: '인증이 필요합니다.' }, 401);

  const caller = await context.env.DB.prepare(
    'SELECT role, approval_status FROM profiles WHERE id = ?',
  ).bind(userId).first<{ role: string; approval_status: string | null }>();
  if (!caller || (caller.role !== 'teacher' && caller.role !== 'admin')) {
    return jsonResponse({ message: '교사 또는 관리자 권한이 필요합니다.' }, 403);
  }
  if (caller.role === 'teacher' && caller.approval_status !== 'approved') {
    return jsonResponse({ message: '승인되지 않은 교사 계정입니다.' }, 403);
  }

  const body = (await context.request.json()) as CreateBody;
  if (!body.name || typeof body.name !== 'string' || body.name.length > 60) {
    return jsonResponse({ message: '반 이름이 올바르지 않습니다.' }, 400);
  }
  if (typeof body.grade !== 'number' || body.grade < 1 || body.grade > 6) {
    return jsonResponse({ message: '학년이 올바르지 않습니다.' }, 400);
  }
  if (body.semester !== 1 && body.semester !== 2) {
    return jsonResponse({ message: '학기가 올바르지 않습니다.' }, 400);
  }
  if (body.school_name && (typeof body.school_name !== 'string' || body.school_name.length > 80)) {
    return jsonResponse({ message: '학교명이 너무 깁니다.' }, 400);
  }

  const id = crypto.randomUUID();
  const inviteCode = Math.random().toString(36).slice(2, 10).toUpperCase();
  const year = new Date().getFullYear();

  await context.env.DB.prepare(
    `INSERT INTO classes (id, teacher_id, name, grade, semester, school_name, year, invite_code, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
  ).bind(
    id, userId, body.name, body.grade, body.semester,
    body.school_name ?? null, year, inviteCode, new Date().toISOString(),
  ).run();

  await logAudit(context.env.DB, {
    actorId: userId,
    actorRole: caller.role,
    action: 'class_create',
    targetType: 'class',
    targetId: id,
    ip: clientIp(context.request),
  });

  return jsonResponse({
    id, teacher_id: userId, name: body.name, grade: body.grade, semester: body.semester,
    school_name: body.school_name ?? null, year, invite_code: inviteCode, is_active: 1,
  }, 201);
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
