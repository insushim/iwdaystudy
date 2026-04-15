// GET /api/admin/teachers?status=pending - list teachers by approval status

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
  const status = url.searchParams.get('status');

  let sql = 'SELECT id, email, name, school_name, class_name, approval_status, created_at FROM profiles WHERE role = ?';
  const binds: unknown[] = ['teacher'];
  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    sql += ' AND approval_status = ?';
    binds.push(status);
  }
  sql += ' ORDER BY created_at DESC LIMIT 500';

  const result = await context.env.DB.prepare(sql).bind(...binds).all();
  return jsonResponse({ teachers: result.results || [] });
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
