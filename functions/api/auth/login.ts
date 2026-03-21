// Cloudflare Pages Function: POST /api/auth/login

import {
  verifyPassword,
  isLegacyHash,
  hashPassword,
  createToken,
} from "../../lib/crypto";

interface Env {
  DB: D1Database;
  AUTH_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { email, password } = (await context.request.json()) as {
      email: string;
      password: string;
    };

    if (!email || !password) {
      return jsonResponse(
        { message: "이메일과 비밀번호를 입력해주세요." },
        400,
      );
    }

    // Normalize student login ID: "ara21" → "ara21@class.local"
    const normalizedEmail = email.includes("@")
      ? email
      : `${email}@class.local`;

    const user = await context.env.DB.prepare(
      "SELECT * FROM profiles WHERE email = ?",
    )
      .bind(normalizedEmail)
      .first();

    if (!user) {
      return jsonResponse(
        { message: "이메일 또는 비밀번호가 올바르지 않습니다." },
        401,
      );
    }

    // Verify password (supports both new SHA-256 and legacy simpleHash)
    const isValid = await verifyPassword(
      password,
      user.password_hash as string,
    );
    if (!isValid) {
      return jsonResponse(
        { message: "이메일 또는 비밀번호가 올바르지 않습니다." },
        401,
      );
    }

    // Auto-migrate legacy hash to SHA-256
    if (isLegacyHash(user.password_hash as string)) {
      const newHash = await hashPassword(password);
      await context.env.DB.prepare(
        "UPDATE profiles SET password_hash = ?, updated_at = ? WHERE id = ?",
      )
        .bind(newHash, new Date().toISOString(), user.id)
        .run();
    }

    // Block unapproved teachers
    if (user.role === "teacher" && user.approval_status === "pending") {
      return jsonResponse(
        {
          message:
            "승인 대기 중인 계정입니다. 관리자 승인 후 로그인할 수 있습니다.",
        },
        403,
      );
    }
    if (user.role === "teacher" && user.approval_status === "rejected") {
      return jsonResponse(
        { message: "승인이 거절된 계정입니다. 관리자에게 문의해주세요." },
        403,
      );
    }

    // Generate signed token
    const token = await createToken(
      {
        id: user.id as string,
        email: user.email as string,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
      },
      context.env.AUTH_SECRET,
    );

    const { password_hash, ...safeUser } = user as Record<string, unknown>;
    return jsonResponse({ user: safeUser, token });
  } catch (err: any) {
    return jsonResponse(
      {
        message: "로그인 처리 중 오류가 발생했습니다.",
        _debug: err?.message || String(err),
      },
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
