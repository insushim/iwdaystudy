// Cloudflare Pages Function: POST /api/auth/login

import {
  verifyPassword,
  isLegacyHash,
  hashPassword,
  createToken,
} from "../../lib/crypto";
import { logAudit, clientIp } from "../../lib/audit";
import {
  checkAccountRateLimit,
  clearAccountRateLimit,
} from "../../lib/rate-limit";

interface Env {
  DB: D1Database;
  AUTH_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { email, password, expected_role } =
      (await context.request.json()) as {
        email: string;
        password: string;
        expected_role?: "student" | "staff";
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

    // 계정 단위 제한: 학교 NAT 때문에 IP 한도는 넉넉히 두므로,
    // 브루트포스 방어는 여기(같은 계정 5분 10회)가 담당한다.
    const acct = await checkAccountRateLimit(context.env.DB, normalizedEmail);
    if (!acct.ok) {
      await logAudit(context.env.DB, {
        action: "login_rate_limited",
        targetType: "email",
        targetId: normalizedEmail,
        ip: clientIp(context.request),
      });
      return jsonResponse(
        {
          message:
            "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.",
        },
        429,
      );
    }

    const user = await context.env.DB.prepare(
      "SELECT * FROM profiles WHERE email = ?",
    )
      .bind(normalizedEmail)
      .first();

    if (!user) {
      await logAudit(context.env.DB, {
        action: "login_failed",
        targetType: "email",
        targetId: normalizedEmail,
        ip: clientIp(context.request),
        metadata: { reason: "unknown_user" },
      });
      return jsonResponse(
        { message: "이메일 또는 비밀번호가 올바르지 않습니다." },
        401,
      );
    }

    const isValid = await verifyPassword(
      password,
      user.password_hash as string,
    );
    if (!isValid) {
      await logAudit(context.env.DB, {
        actorId: user.id as string,
        actorRole: user.role as string,
        action: "login_failed",
        targetType: "user",
        targetId: user.id as string,
        ip: clientIp(context.request),
        metadata: { reason: "wrong_password" },
      });
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

    // Enforce role-gated login (student tab vs. staff tab)
    if (expected_role === "student" && user.role !== "student") {
      return jsonResponse(
        { message: "학생 로그인 탭에서는 학생 계정만 로그인할 수 있습니다." },
        403,
      );
    }
    if (
      expected_role === "staff" &&
      user.role !== "teacher" &&
      user.role !== "parent" &&
      user.role !== "admin"
    ) {
      return jsonResponse(
        {
          message:
            "선생님/학부모 로그인 탭에서는 학생 계정으로 로그인할 수 없습니다.",
        },
        403,
      );
    }

    // Block unapproved teachers.
    // approval_status 가 NULL 인 교사 레코드(과거 수동 SQL 등으로 생길 수 있음)는
    // 미들웨어 게이트에서 403 이 되므로, 로그인 단계도 같은 판정을 내려야
    // "로그인은 되는데 아무것도 안 되는" 상태가 안 생긴다.
    if (user.role === "teacher" && !user.approval_status) {
      return jsonResponse(
        {
          message:
            "승인 대기 중인 계정입니다. 관리자 승인 후 로그인할 수 있습니다.",
        },
        403,
      );
    }
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

    // 로그인 성공 → 이 계정의 실패 카운터 초기화(정상 사용자가 다음날 막히지 않게)
    await clearAccountRateLimit(context.env.DB, normalizedEmail);

    // Generate signed token
    const token = await createToken(
      {
        id: user.id as string,
        email: user.email as string,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
      },
      context.env.AUTH_SECRET,
    );

    await logAudit(context.env.DB, {
      actorId: user.id as string,
      actorRole: user.role as string,
      action: "login_success",
      targetType: "user",
      targetId: user.id as string,
      ip: clientIp(context.request),
    });

    const { password_hash: _ph, ...safeUser } = user as Record<string, unknown>;
    return jsonResponse({ user: safeUser, token });
  } catch {
    return jsonResponse(
      { message: "로그인 처리 중 오류가 발생했습니다." },
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
