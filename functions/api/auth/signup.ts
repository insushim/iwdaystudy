// Cloudflare Pages Function: POST /api/auth/signup

interface Env {
  DB: D1Database;
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

    // Validate required fields
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

    // Check if email already exists
    const existing = await context.env.DB.prepare(
      "SELECT id FROM profiles WHERE email = ?",
    )
      .bind(email)
      .first();

    if (existing) {
      return jsonResponse({ message: "이미 등록된 이메일입니다." }, 409);
    }

    // Generate UUID
    const id = crypto.randomUUID();
    const passwordHash = simpleHash(password);
    const now = new Date().toISOString();

    // Teachers require approval; students/parents are auto-approved
    const approvalStatus = role === "teacher" ? "pending" : "approved";

    // Insert new user
    await context.env.DB.prepare(
      `INSERT INTO profiles (id, email, name, role, grade, semester, school_name, password_hash, approval_status, subscription_plan, streak_count, total_points, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'free', 0, 0, ?, ?)`,
    )
      .bind(
        id,
        email,
        name,
        role,
        grade ?? null,
        semester ?? null,
        school_name ?? null,
        passwordHash,
        approvalStatus,
        now,
        now,
      )
      .run();

    // Generate auth token
    const token = btoa(
      JSON.stringify({
        id,
        email,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
      }),
    );

    // Return the newly created user (without password_hash)
    const user = {
      id,
      email,
      name,
      role,
      avatar_url: null,
      grade: grade ?? null,
      semester: semester ?? null,
      school_name: school_name ?? null,
      class_name: null,
      student_number: null,
      parent_id: null,
      teacher_id: null,
      subscription_plan: "free",
      subscription_expires_at: null,
      streak_count: 0,
      total_points: 0,
      approval_status: approvalStatus,
      created_at: now,
      updated_at: now,
    };

    return jsonResponse({ user, token }, 201);
  } catch (err: any) {
    return jsonResponse(
      { message: err.message || "회원가입 처리 중 오류가 발생했습니다." },
      500,
    );
  }
};

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
