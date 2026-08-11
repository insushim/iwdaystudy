// D1-backed rate limiter for Cloudflare Pages Functions.
// Returns { ok: false } with a retryAfter hint when the client exceeds the budget.

interface RateLimitRule {
  /** 버킷 이름. 키를 경로가 아니라 이 이름으로 잡아야 임의 경로로 버킷을 무한히
   *  쪼개(= 사실상 무제한 요청 + rate_limits 행 무한 증식) 우회하지 못한다. */
  id: string;
  matches: (pathname: string) => boolean;
  windowSec: number;
  max: number;
}

// matches 는 normalizePath 를 거친 소문자·끝슬래시 없는 경로를 받는다.
// ⚠️ 학교는 NAT 뒤에서 한 반(20~30명)이 **같은 공인 IP** 를 쓴다.
// IP 기준 한도를 브루트포스 기준(10회/분)으로 잡으면 아침 조회 시간에
// 11번째 학생부터 로그인이 429로 막힌다. 그래서 IP 한도는 학급 규모를
// 감당할 만큼 넉넉히 두고, 실제 브루트포스 방어는 login.ts 의
// **계정(이메일) 단위 제한**(checkAccountRateLimit)이 담당한다.
const RULES: RateLimitRule[] = [
  { id: 'login', matches: (p) => p === '/api/auth/login', windowSec: 60, max: 60 },
  { id: 'signup', matches: (p) => p === '/api/auth/signup', windowSec: 300, max: 20 },
  { id: 'generate', matches: (p) => p.startsWith('/api/generate'), windowSec: 60, max: 5 },
  { id: 'bulk-create', matches: (p) => p.startsWith('/api/auth/bulk-create'), windowSec: 60, max: 3 },
  { id: 'api', matches: (p) => p.startsWith('/api'), windowSec: 60, max: 600 },
];

/**
 * trailingSlash: true 라 같은 엔드포인트가 '/api/auth/login' 과
 * '/api/auth/login/' 두 형태로 들어온다. 정규화하지 않으면 버킷이 갈라져
 * 로그인 브루트포스 예산이 두 배가 된다(실측 재현).
 */
export function normalizePath(pathname: string): string {
  let p = pathname.toLowerCase();
  p = p.replace(/\/{2,}/g, '/');       // '//api//auth' → '/api/auth'
  if (p.length > 1) p = p.replace(/\/+$/, ''); // 끝 슬래시 제거
  return p || '/';
}

function clientKey(request: Request, bucket: string): string {
  // CF-Connecting-IP 는 Cloudflare 엣지가 덮어쓰므로 클라이언트가 위조할 수 없다.
  // X-Forwarded-For 는 위조 가능하니 폴백으로만 쓴다.
  const ip =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown';
  return `${ip}:${bucket}`;
}

export async function checkRateLimit(
  db: D1Database,
  request: Request,
  pathname: string,
): Promise<{ ok: true } | { ok: false; retryAfter: number }> {
  const path = normalizePath(pathname);
  const rule = RULES.find((r) => r.matches(path));
  if (!rule) return { ok: true };

  const key = clientKey(request, rule.id);
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - rule.windowSec;

  try {
    // Opportunistic cleanup of expired rows (runs cheaply).
    await db
      .prepare('DELETE FROM rate_limits WHERE window_start < ?')
      .bind(windowStart - 3600)
      .run();

    const row = await db
      .prepare('SELECT count, window_start FROM rate_limits WHERE key = ?')
      .bind(key)
      .first<{ count: number; window_start: number }>();

    if (!row || row.window_start < windowStart) {
      await db
        .prepare(
          `INSERT INTO rate_limits (key, count, window_start) VALUES (?, 1, ?)
           ON CONFLICT(key) DO UPDATE SET count = 1, window_start = excluded.window_start`,
        )
        .bind(key, now)
        .run();
      return { ok: true };
    }

    if (row.count >= rule.max) {
      const retryAfter = Math.max(1, rule.windowSec - (now - row.window_start));
      return { ok: false, retryAfter };
    }

    await db
      .prepare('UPDATE rate_limits SET count = count + 1 WHERE key = ?')
      .bind(key)
      .run();
    return { ok: true };
  } catch {
    // Never fail-open the request due to the limiter itself.
    return { ok: true };
  }
}

/**
 * 계정(이메일) 단위 제한 — 같은 계정에 대한 연속 로그인 실패를 막는다.
 * 한 반이 NAT 로 IP 를 공유해도 계정별로는 정확히 걸리므로, 정상 학생을
 * 막지 않으면서 브루트포스만 차단한다.
 */
export async function checkAccountRateLimit(
  db: D1Database,
  accountKey: string,
  windowSec = 300,
  max = 10,
): Promise<{ ok: true } | { ok: false; retryAfter: number }> {
  const key = `acct:${accountKey.toLowerCase().slice(0, 120)}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - windowSec;
  try {
    const row = await db
      .prepare('SELECT count, window_start FROM rate_limits WHERE key = ?')
      .bind(key)
      .first<{ count: number; window_start: number }>();

    if (!row || row.window_start < windowStart) {
      await db
        .prepare(
          `INSERT INTO rate_limits (key, count, window_start) VALUES (?, 1, ?)
           ON CONFLICT(key) DO UPDATE SET count = 1, window_start = excluded.window_start`,
        )
        .bind(key, now)
        .run();
      return { ok: true };
    }
    if (row.count >= max) {
      return { ok: false, retryAfter: Math.max(1, windowSec - (now - row.window_start)) };
    }
    await db
      .prepare('UPDATE rate_limits SET count = count + 1 WHERE key = ?')
      .bind(key)
      .run();
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

/** 로그인 성공 시 해당 계정의 실패 카운터를 초기화한다. */
export async function clearAccountRateLimit(db: D1Database, accountKey: string): Promise<void> {
  try {
    await db
      .prepare('DELETE FROM rate_limits WHERE key = ?')
      .bind(`acct:${accountKey.toLowerCase().slice(0, 120)}`)
      .run();
  } catch {
    /* 카운터 초기화 실패가 로그인을 막아서는 안 된다 */
  }
}
