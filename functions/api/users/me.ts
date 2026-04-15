// GET /api/users/me - current user profile
// PATCH /api/users/me - update own profile

interface Env {
  DB: D1Database;
}

const ALLOWED_FIELDS = new Set([
  'name',
  'avatar_url',
  'grade',
  'semester',
  'school_name',
  'class_name',
  'student_number',
]);

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const userId = (context as any).userId as string | undefined;
  if (!userId) return jsonResponse({ message: '인증이 필요합니다.' }, 401);

  const row = await context.env.DB.prepare(
    'SELECT * FROM profiles WHERE id = ?',
  ).bind(userId).first();
  if (!row) return jsonResponse({ message: '프로필을 찾을 수 없습니다.' }, 404);

  const { password_hash: _ph, ...safe } = row as Record<string, unknown>;
  return jsonResponse(safe);
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const userId = (context as any).userId as string | undefined;
  if (!userId) return jsonResponse({ message: '인증이 필요합니다.' }, 401);

  const body = (await context.request.json()) as Record<string, unknown>;
  const updates: string[] = [];
  const values: unknown[] = [];

  for (const [k, v] of Object.entries(body)) {
    if (!ALLOWED_FIELDS.has(k)) continue;
    if (typeof v === 'string' && v.length > 200) {
      return jsonResponse({ message: '값이 너무 깁니다.' }, 400);
    }
    updates.push(`${k} = ?`);
    values.push(v);
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
