// Cloudflare Pages Function: POST /api/auth/login

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { email, password } = await context.request.json() as {
      email: string;
      password: string;
    };

    if (!email || !password) {
      return jsonResponse({ message: '이메일과 비밀번호를 입력해주세요.' }, 400);
    }

    // Query D1 for user by email
    const user = await context.env.DB.prepare(
      'SELECT * FROM profiles WHERE email = ?'
    ).bind(email).first();

    if (!user) {
      return jsonResponse({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401);
    }

    // Verify password hash
    if (user.password_hash !== simpleHash(password)) {
      return jsonResponse({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401);
    }

    // Generate auth token (base64 encoded JSON with expiry)
    const token = btoa(
      JSON.stringify({
        id: user.id,
        email: user.email,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      })
    );

    // Return user data without password_hash
    const { password_hash, ...safeUser } = user as Record<string, unknown>;

    return jsonResponse({ user: safeUser, token });
  } catch (err: any) {
    return jsonResponse({ message: err.message || '로그인 처리 중 오류가 발생했습니다.' }, 500);
  }
};

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
