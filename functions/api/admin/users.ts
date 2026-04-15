// GET /api/admin/users?role=&limit=&offset= - list all users (admin only)

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const userId = (context as any).userId as string | undefined;
  if (!userId) return jsonResponse({ message: '인증이 필요합니다.' }, 401);

  const caller = await context.env.DB.prepare(
    'SELECT role FROM profiles WHERE id = ?',
  ).bind(userId).first<{ role: string }>();
  if (!caller || caller.role !== 'admin') {
    return jsonResponse({ message: '관리자 권한이 필요합니다.' }, 403);
  }

  const url = new URL(context.request.url);
  const role = url.searchParams.get('role');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '200', 10), 500);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10), 0);

  let sql = 'SELECT id, email, name, role, grade, semester, school_name, class_name, student_number, approval_status, subscription_plan, streak_count, total_points, created_at FROM profiles';
  const binds: unknown[] = [];
  if (role && ['student', 'teacher', 'parent', 'admin'].includes(role)) {
    sql += ' WHERE role = ?';
    binds.push(role);
  }
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  binds.push(limit, offset);

  const result = await context.env.DB.prepare(sql).bind(...binds).all();
  return jsonResponse({ users: result.results || [] });
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
