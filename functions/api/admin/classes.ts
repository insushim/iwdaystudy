// GET /api/admin/classes - list all classes with teacher name + student count (admin only)

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const userId = (context as any).userId as string | undefined;
  if (!userId) return jsonResponse({ message: "인증이 필요합니다." }, 401);

  const caller = await context.env.DB.prepare(
    "SELECT role FROM profiles WHERE id = ?",
  ).bind(userId).first<{ role: string }>();
  if (!caller || caller.role !== "admin") {
    return jsonResponse({ message: "관리자 권한이 필요합니다." }, 403);
  }

  const result = await context.env.DB.prepare(
    `SELECT
       c.id, c.name, c.grade, c.semester, c.school_name, c.year,
       c.invite_code, c.is_active, c.created_at, c.teacher_id,
       p.name AS teacher_name, p.email AS teacher_email,
       (SELECT COUNT(*) FROM class_members cm WHERE cm.class_id = c.id) AS student_count
     FROM classes c
     LEFT JOIN profiles p ON c.teacher_id = p.id
     ORDER BY c.created_at DESC
     LIMIT 500`,
  ).all();

  return jsonResponse({ classes: result.results || [] });
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
