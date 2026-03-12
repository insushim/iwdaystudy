// Cloudflare Pages Function: POST /api/auth/signup

import { hashPassword, createToken } from "../../lib/crypto";

interface Env {
  DB: D1Database;
  AUTH_SECRET: string;
}

interface SignupBody {
  email: string;
  password: string;
  name: string;
  role: "student" | "teacher" | "parent";
  grade?: number;
  semester?: number;
  school_name?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = (await context.request.json()) as SignupBody;
    const { email, password, name, role, grade, semester, school_name } = body;

    if (!email || !password || !name || !role) {
      return jsonResponse({ message: "필수 항목을 모두 입력해주세요." }, 400);
    }

    if (!["student", "teacher", "parent"].includes(role)) {
      return jsonResponse({ message: "올바르지 않은 역할입니다." }, 400);
    }

    if (password.length < 4) {
      return jsonResponse(
        { message: "비밀번호는 최소 4자 이상이어야 합니다." },
        400,
      );
    }

    const existing = await context.env.DB.prepare(
      "SELECT id FROM profiles WHERE email = ?",
    )
      .bind(email)
      .first();

    if (existing) {
      return jsonResponse({ message: "이미 등록된 이메일입니다." }, 409);
    }

    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    // All roles auto-approved (admin can revoke later if needed)
    const approvalStatus = "approved";

    await context.env.DB.prepare(
      `INSERT INTO profiles (id, email, name, role, grade, semester, school_name, password_hash, approval_status, subscription_plan, streak_count, total_points, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'free', 0, 0, ?, ?)`,
    )
      .bind(
        id, email, name, role,
        grade ?? null, semester ?? null, school_name ?? null,
        passwordHash, approvalStatus, now, now,
      )
      .run();

    const token = await createToken(
      { id, email, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 },
      context.env.AUTH_SECRET,
    );

    const user = {
      id, email, name, role,
      avatar_url: null, grade: grade ?? null, semester: semester ?? null,
      school_name: school_name ?? null, class_name: null,
      student_number: null, parent_id: null, teacher_id: null,
      subscription_plan: "free", subscription_expires_at: null,
      streak_count: 0, total_points: 0,
      approval_status: approvalStatus, created_at: now, updated_at: now,
    };

    return jsonResponse({ user, token }, 201);
  } catch (err: any) {
    return jsonResponse(
      { message: "회원가입 처리 중 오류가 발생했습니다." },
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
