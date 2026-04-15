// Cloudflare Pages Function: POST /api/auth/bulk-create
// Creates multiple student accounts in D1 for cross-device login

import { hashPassword } from "../../lib/crypto";

interface Env {
  DB: D1Database;
  AUTH_SECRET: string;
}

interface BulkCreateBody {
  students: {
    email: string;
    name: string;
    password: string;
    grade: number;
    semester: number;
    class_name: string;
    teacher_id: string;
    student_number: number;
  }[];
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { students } = (await context.request.json()) as BulkCreateBody;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return jsonResponse({ message: "학생 데이터가 필요합니다." }, 400);
    }

    if (students.length > 100) {
      return jsonResponse({ message: "한 번에 최대 100명까지 생성 가능합니다." }, 400);
    }

    const now = new Date().toISOString();
    const created: string[] = [];
    const skipped: string[] = [];

    // Ensure teacher exists in D1 (upsert stub if missing)
    const firstStudent = students[0];
    if (firstStudent?.teacher_id) {
      const teacher = await context.env.DB.prepare(
        "SELECT id FROM profiles WHERE id = ?",
      ).bind(firstStudent.teacher_id).first();
      if (!teacher) {
        await context.env.DB.prepare(
          `INSERT OR IGNORE INTO profiles (id, email, name, role, password_hash, approval_status, subscription_plan, streak_count, total_points, created_at, updated_at)
           VALUES (?, ?, 'Teacher', 'teacher', '', 'approved', 'free', 0, 0, ?, ?)`,
        ).bind(firstStudent.teacher_id, `teacher-${firstStudent.teacher_id.slice(0,8)}@local`, now, now).run();
      }
    }

    for (const s of students) {
      // Check if email already exists
      const existing = await context.env.DB.prepare(
        "SELECT id FROM profiles WHERE email = ?",
      )
        .bind(s.email)
        .first();

      if (existing) {
        skipped.push(s.email);
        continue;
      }

      const id = crypto.randomUUID();
      await context.env.DB.prepare(
        `INSERT INTO profiles (id, email, name, role, grade, semester, class_name, teacher_id, student_number, password_hash, approval_status, subscription_plan, streak_count, total_points, created_at, updated_at)
         VALUES (?, ?, ?, 'student', ?, ?, ?, ?, ?, ?, 'approved', 'free', 0, 0, ?, ?)`,
      )
        .bind(
          id,
          s.email,
          s.name,
          s.grade,
          s.semester,
          s.class_name,
          s.teacher_id,
          s.student_number,
          await hashPassword(s.password),
          now,
          now,
        )
        .run();

      created.push(s.email);
    }

    return jsonResponse({
      created: created.length,
      skipped: skipped.length,
      message: `${created.length}명 생성, ${skipped.length}명 이미 존재`,
    }, 201);
  } catch {
    return jsonResponse(
      { message: "학생 일괄생성 중 오류가 발생했습니다." },
      500,
    );
  }
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
