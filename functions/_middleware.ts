// Cloudflare Pages middleware: CORS headers, auth token validation, security headers, and dynamic route rewriting

import { verifyToken } from "./lib/crypto";

interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  AUTH_SECRET: string;
}

// Paths that do NOT require authentication
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/signup',
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

  // Sequential URL rewriting: dynamic route → RSC segment → fetch asset
  let assetPath = url.pathname;
  let needsRewrite = false;

  // Step 1: Replace dynamic route segments with placeholder
  for (const route of DYNAMIC_ROUTE_PREFIXES) {
    if (route.pattern.test(assetPath)) {
      const match = assetPath.match(route.pattern);
      if (match) {
        const matchedPart = match[0];
        const rest = assetPath.slice(matchedPart.length);
        if (!rest || rest === '/') {
          assetPath = route.placeholder + '/index.html';
        } else {
          assetPath = route.placeholder + rest;
        }
        needsRewrite = true;
        break;
      }
    }
  }

  // Step 2: Rewrite RSC segment files: __next.X.Y.Z.txt → __next.X/Y/Z.txt
  const rewriteParts = assetPath.split('/');
  const lastPart = rewriteParts[rewriteParts.length - 1];
  if (lastPart.startsWith('__next.') && lastPart.endsWith('.txt')) {
    const segments = lastPart.split('.');
    if (segments.length > 3) {
      const dirName = segments[0] + '.' + segments[1];
      const filePath = segments.slice(2, -1).join('/') + '.txt';
      const basePath = rewriteParts.slice(0, -1).join('/');
      assetPath = basePath + '/' + dirName + '/' + filePath;
      needsRewrite = true;
    }
  }

  // Fetch rewritten asset
  if (needsRewrite) {
    const assetUrl = new URL(assetPath, url.origin);
    return context.env.ASSETS.fetch(new Request(assetUrl.toString()));
  }

  // Only apply auth checks to /api routes
  if (url.pathname.startsWith('/api') && !isPublicPath(url.pathname)) {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const tokenData = token ? await verifyToken(token, context.env.AUTH_SECRET) : null;
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


  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Prevent caching of HTML pages (JS/CSS with hashes are fine to cache)
  const ct = response.headers.get('Content-Type') || '';
  if (ct.includes('text/html') || url.pathname === '/' || (!url.pathname.includes('.') && !url.pathname.startsWith('/api'))) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }

  return response;
};
