// GET /api/users/me - current user profile
// PATCH /api/users/me - update own profile

import { authUserId } from '../../lib/ctx';
interface Env {
  DB: D1Database;
}

// Whitelisted self-editable fields, each with its own value validator so a
// bad value returns 400 instead of tripping a D1 CHECK constraint (which would
// surface as a 500 with a stack trace).
const FIELD_VALIDATORS: Record<string, (v: unknown) => boolean> = {
  name: (v) => typeof v === 'string' && v.trim().length >= 1 && v.length <= 60,
  avatar_url: (v) => v === null || (typeof v === 'string' && v.length <= 500),
  grade: (v) => v === null || (typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 6),
  semester: (v) => v === null || v === 1 || v === 2,
  school_name: (v) => v === null || (typeof v === 'string' && v.length <= 80),
  class_name: (v) => v === null || (typeof v === 'string' && v.length <= 40),
  // 스키마·bulk-create 에는 학번 상한이 없다. 100 으로 좁히면 기존 101번+
  // 학번을 가진 계정이 프로필을 저장하지 못한다(회귀).
  student_number: (v) =>
    v === null || (typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 9999),
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const userId = authUserId(context.data) as string | undefined;
  if (!userId) return jsonResponse({ message: '인증이 필요합니다.' }, 401);

  const row = await context.env.DB.prepare(
    'SELECT * FROM profiles WHERE id = ?',
  ).bind(userId).first();
  if (!row) return jsonResponse({ message: '프로필을 찾을 수 없습니다.' }, 404);

  const { password_hash: _ph, ...safe } = row as Record<string, unknown>;
  return jsonResponse(safe);
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const userId = authUserId(context.data) as string | undefined;
  if (!userId) return jsonResponse({ message: '인증이 필요합니다.' }, 401);

  let body: Record<string, unknown>;
  try {
    body = (await context.request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ message: '요청 형식이 올바르지 않습니다.' }, 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return jsonResponse({ message: '요청 형식이 올바르지 않습니다.' }, 400);
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  for (const [k, v] of Object.entries(body)) {
    // hasOwnProperty 로 조회해야 한다. FIELD_VALIDATORS[k] 는 '__proto__',
    // 'constructor', 'toString' 같은 키에 프로토타입 체인의 함수를 돌려주므로
    // 그대로 두면 컬럼명이 아닌 값이 SQL 조립에 들어간다.
    if (!Object.prototype.hasOwnProperty.call(FIELD_VALIDATORS, k)) continue;
    const validate = FIELD_VALIDATORS[k];
    if (!validate(v)) {
      return jsonResponse({ message: `'${k}' 값이 올바르지 않습니다.` }, 400);
    }
    updates.push(`${k} = ?`);
    values.push(typeof v === 'string' ? v.trim() : v);
  }

  if (updates.length === 0) {
    return jsonResponse({ message: '변경할 항목이 없습니다.' }, 400);
  }

  updates.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(userId);

  await context.env.DB.prepare(
    `UPDATE profiles SET ${updates.join(', ')} WHERE id = ?`,
  ).bind(...values).run();

  const row = await context.env.DB.prepare(
    'SELECT * FROM profiles WHERE id = ?',
  ).bind(userId).first();
  const { password_hash: _ph, ...safe } = (row || {}) as Record<string, unknown>;
  return jsonResponse(safe);
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
