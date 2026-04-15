// D1-backed rate limiter for Cloudflare Pages Functions.
// Returns { ok: false } with a retryAfter hint when the client exceeds the budget.

interface RateLimitRule {
  matches: (pathname: string) => boolean;
  windowSec: number;
  max: number;
}

const RULES: RateLimitRule[] = [
  { matches: (p) => p === '/api/auth/login' || p === '/api/auth/login/', windowSec: 60, max: 10 },
  { matches: (p) => p === '/api/auth/signup' || p === '/api/auth/signup/', windowSec: 300, max: 5 },
  { matches: (p) => p.startsWith('/api/generate'), windowSec: 60, max: 5 },
  { matches: (p) => p.startsWith('/api/auth/bulk-create'), windowSec: 60, max: 3 },
  { matches: (p) => p.startsWith('/api'), windowSec: 60, max: 120 },
];

function clientKey(request: Request, pathname: string): string {
  const ip =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown';
  return `${ip}:${pathname}`;
}

export async function checkRateLimit(
  db: D1Database,
  request: Request,
  pathname: string,
): Promise<{ ok: true } | { ok: false; retryAfter: number }> {
  const rule = RULES.find((r) => r.matches(pathname));
  if (!rule) return { ok: true };

  const key = clientKey(request, pathname);
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
