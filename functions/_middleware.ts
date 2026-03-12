// Cloudflare Pages middleware: CORS headers, auth token validation, and dynamic route rewriting

interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

// Paths that do NOT require authentication
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/bulk-create',
  '/api/version',
];

// Dynamic route patterns: prefix to match → placeholder base path
const DYNAMIC_ROUTE_PREFIXES: { pattern: RegExp; placeholder: string }[] = [
  { pattern: /^\/teacher\/classes\/(?!placeholder\b)[^/]+/, placeholder: '/teacher/classes/placeholder' },
  { pattern: /^\/teacher\/students\/(?!placeholder\b|bulk-create\b)[^/]+/, placeholder: '/teacher/students/placeholder' },
  { pattern: /^\/student\/daily\/(?!placeholder\b)[^/]+/, placeholder: '/student/daily/placeholder' },
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

  // Rewrite Next.js RSC segment files: __next.X.Y.Z.txt → __next.X/Y/Z.txt
  // Next.js uses dot-separated URLs but stores files in directories
  const pathParts = url.pathname.split('/');
  const lastPart = pathParts[pathParts.length - 1];
  if (lastPart.startsWith('__next.') && lastPart.endsWith('.txt')) {
    const segments = lastPart.split('.');
    // segments like ["__next", "login", "__PAGE__", "txt"] → length 4+
    // Flat files like ["__next", "_tree", "txt"] → length 3, no rewrite needed
    if (segments.length > 3) {
      const dirName = segments[0] + '.' + segments[1]; // __next.login
      const filePath = segments.slice(2, -1).join('/') + '.txt'; // __PAGE__.txt
      const basePath = pathParts.slice(0, -1).join('/'); // /login
      const rewritePath = basePath + '/' + dirName + '/' + filePath;
      const assetUrl = new URL(rewritePath, url.origin);
      return context.env.ASSETS.fetch(new Request(assetUrl.toString()));
    }
  }

  // Rewrite dynamic routes to placeholder assets (for Next.js static export)
  // Handles both HTML pages and internal Next.js files (__next.*.txt, index.txt, etc.)
  for (const route of DYNAMIC_ROUTE_PREFIXES) {
    if (route.pattern.test(url.pathname)) {
      // Extract the file portion after the dynamic segment (e.g., "/__next._tree.txt")
      const match = url.pathname.match(route.pattern);
      if (match) {
        const matchedPart = match[0];
        const rest = url.pathname.slice(matchedPart.length); // e.g., "/__next._tree.txt" or "/" or ""
        let rewritePath: string;
        if (!rest || rest === '/') {
          rewritePath = route.placeholder + '/index.html';
        } else {
          rewritePath = route.placeholder + rest;
        }
        const assetUrl = new URL(rewritePath, url.origin);
        return context.env.ASSETS.fetch(new Request(assetUrl.toString()));
      }
    }
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

  // Prevent caching of HTML pages (JS/CSS with hashes are fine to cache)
  const ct = response.headers.get('Content-Type') || '';
  if (ct.includes('text/html') || url.pathname === '/' || (!url.pathname.includes('.') && !url.pathname.startsWith('/api'))) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }

  return response;
};
