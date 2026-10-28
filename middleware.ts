import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── JWT helpers (edge-compatible, no Node.js APIs) ────────────────────────
type DecodedToken = {
  exp: number;
  role?: string;
  roles?: string[];
};

function decodeToken(token: string): DecodedToken | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const rawBase64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = rawBase64 + '='.repeat((4 - (rawBase64.length % 4)) % 4);
    const json = globalThis.atob(paddedBase64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  return decoded.exp < Math.floor(Date.now() / 1000);
}

function getTokenRole(token: string): string | null {
  const decoded = decodeToken(token);
  return decoded?.role ?? null;
}

// ─── Role-based access control ───────────────────────────────────────────────
const ADMIN_ONLY_PREFIXES = ['/admin'];

function isAdminRole(role: string | null): boolean {
  if (!role) return false;
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

// ─── Security headers applied to every response ────────────────────────────
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-DNS-Prefetch-Control': 'on',
};

function withSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

// ─── Middleware ──────────────────────────────────────────────────────────────
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  
  // ⚠️ Mise à jour du nom du cookie pour CODENLIGNE
  const token = request.cookies.get('codenligne_access_token')?.value;
  
  const isAdminRoute = ADMIN_ONLY_PREFIXES.some(p => pathname.startsWith(p));
  const isApprenantRoute = pathname.startsWith('/cours') || pathname.startsWith('/exercices') || pathname.startsWith('/progression');
  const isProtected = isAdminRoute || isApprenantRoute;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

  // ── 1. Token présent mais expiré ──────────────────────────────────────────
  if (token && isTokenExpired(token)) {
    if (isProtected) {
      // Redirection vers la nouvelle page de connexion CODENLIGNE
      const url = new URL(`/connexion?returnTo=${encodeURIComponent(pathname + search)}`, baseUrl);
      const res = NextResponse.redirect(url);
      res.cookies.delete('codenligne_access_token');
      res.cookies.delete('codenligne_refresh_token');
      return withSecurityHeaders(res);
    }
    const res = NextResponse.next();
    res.cookies.delete('codenligne_access_token');
    res.cookies.delete('codenligne_refresh_token');
    return withSecurityHeaders(res);
  }

  // ── 2. Route protégée sans token → redirect login ─────────────────────────
  if (isProtected && !token) {
    const url = new URL(`/connexion?returnTo=${encodeURIComponent(pathname + search)}`, baseUrl);
    return withSecurityHeaders(NextResponse.redirect(url));
  }

  // ── 3. Route admin avec token valide mais rôle insuffisant → page 403 ─────
  if (isAdminRoute && token && !isTokenExpired(token)) {
    const role = getTokenRole(token);
    if (!isAdminRole(role)) {
      const url = new URL('/403', baseUrl); // Assure-toi d'avoir une page app/403/page.tsx
      return withSecurityHeaders(NextResponse.redirect(url));
    }
  }

  return withSecurityHeaders(NextResponse.next());
}

// ─── Matcher ────────────────────────────────────────────────────────────────
export const config = {
  matcher: [
    '/admin/:path*',
    '/cours/:path*',
    '/exercices/:path*',
    '/progression/:path*',
  ],
};