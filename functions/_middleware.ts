// Cloudflare Pages middleware: CORS headers and auth token validation

interface Env {
  DB: D1Database;
}

// Paths that do NOT require authentication
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/version',
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname === `${p}/`);
}

function parseToken(authHeader: string | null): { id: string; email?: string; exp: number } | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.slice(7);
    const decoded = JSON.parse(atob(token));
    if (!decoded.id || !decoded.exp) return null;
    if (decoded.exp < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const url = new URL(request.url);

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Only apply auth checks to /api routes
  if (url.pathname.startsWith('/api') && !isPublicPath(url.pathname)) {
    const tokenData = parseToken(request.headers.get('Authorization'));
    if (!tokenData) {
      return new Response(
        JSON.stringify({ message: '인증이 필요합니다.' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
    // Attach user info to context for downstream functions
    (context as any).userId = tokenData.id;
    (context as any).userEmail = tokenData.email;
  }

  // Continue to the actual function handler
  const response = await context.next();

  // Add CORS headers to all responses
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
};
