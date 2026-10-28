import { NextRequest, NextResponse } from 'next/server';

export const ACCESS_TOKEN_COOKIE = 'monetoile_access_token';
export const REFRESH_TOKEN_COOKIE = 'monetoile_refresh_token';

const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function stripTrailingSlashes(value: string) {
  return value.replace(/\/+$/, '');
}

export function getBackendApiUrl(pathname: string) {
  // Server-side : API en interne via BACKEND_URL (évite le hairpin NAT du VPS). Fallback public.
  const rawBaseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const cleanBaseURL = stripTrailingSlashes(rawBaseUrl);
  const hasApiPath = cleanBaseURL.endsWith('/api') || /\/api\//.test(cleanBaseURL);
  const apiVersion = 'v1';
  const computedBaseURL = hasApiPath ? `${cleanBaseURL}/${apiVersion}` : `${cleanBaseURL}/api/${apiVersion}`;
  const normalizedPath = pathname.replace(/^\/+/, '');
  return `${computedBaseURL}/${normalizedPath}`;
}

export function getRequestSessionTokens(request: NextRequest) {
  return {
    accessToken: request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ?? null,
    refreshToken: request.cookies.get(REFRESH_TOKEN_COOKIE)?.value ?? null,
  };
}

function isSecureCookie(request: NextRequest) {
  const forwardedProto = request.headers.get('x-forwarded-proto');
  if (forwardedProto) {
    return forwardedProto === 'https';
  }

  return request.nextUrl.protocol === 'https:';
}

function buildCookieOptions(request: NextRequest, maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isSecureCookie(request),
    path: '/',
    maxAge,
  };
}

export function applySessionCookies(
  request: NextRequest,
  response: NextResponse,
  session: { accessToken: string; refreshToken?: string | null },
) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, session.accessToken, buildCookieOptions(request, ACCESS_TOKEN_MAX_AGE_SECONDS));

  if (session.refreshToken) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, session.refreshToken, buildCookieOptions(request, REFRESH_TOKEN_MAX_AGE_SECONDS));
  }
}

export function clearSessionCookies(request: NextRequest, response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, '', { ...buildCookieOptions(request, 0), expires: new Date(0) });
  response.cookies.set(REFRESH_TOKEN_COOKIE, '', { ...buildCookieOptions(request, 0), expires: new Date(0) });
}

export async function refreshBackendSession(refreshToken: string) {
  const response = await fetch(getBackendApiUrl('auth/refresh'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Unable to refresh session');
  }

  return response.json() as Promise<{ accessToken: string; refreshToken?: string }>;
}

export type BackendSessionFetchResult = {
  backendResponse: Response;
  refreshedSession: { accessToken: string; refreshToken?: string } | null;
};

export async function fetchBackendWithSession(
  request: NextRequest,
  pathname: string,
  init?: {
    method?: string;
    accessToken?: string | null;
    refreshToken?: string | null;
    bodyText?: string;
    search?: string;
    retryOnUnauthorized?: boolean;
  },
): Promise<BackendSessionFetchResult> {
  const method = init?.method || request.method;
  const accessToken = init?.accessToken ?? getRequestSessionTokens(request).accessToken;
  const refreshToken = init?.refreshToken ?? getRequestSessionTokens(request).refreshToken;
  const search = init?.search ?? '';
  const retryOnUnauthorized = init?.retryOnUnauthorized ?? true;

  const performFetch = (token?: string | null) => fetch(`${getBackendApiUrl(pathname)}${search}`, {
    method,
    headers: buildBackendHeaders(request, token),
    body: method === 'GET' || method === 'HEAD' ? undefined : init?.bodyText,
    cache: 'no-store',
    redirect: 'manual',
  });

  let refreshedSession: { accessToken: string; refreshToken?: string } | null = null;

  let backendResponse = await performFetch(accessToken);

  if (backendResponse.status === 401 && refreshToken && retryOnUnauthorized) {
    refreshedSession = await refreshBackendSession(refreshToken);
    backendResponse = await performFetch(refreshedSession.accessToken);
  }

  return {
    backendResponse,
    refreshedSession,
  };
}

export async function readJsonResponse<T>(response: Response, fallback: T): Promise<T> {
  return response.json().catch(() => fallback) as Promise<T>;
}

export function createUnauthorizedResponse(request: NextRequest, message = 'Unauthorized') {
  const response = NextResponse.json({ message }, { status: 401 });
  clearSessionCookies(request, response);
  return response;
}

export async function proxyAuthMutation(request: NextRequest, pathname: string) {
  const body = await request.text();
  const backendResponse = await fetch(getBackendApiUrl(pathname), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body,
    cache: 'no-store',
  });

  const payload = await readJsonResponse<Record<string, unknown>>(backendResponse, {});

  if (!backendResponse.ok) {
    const errorResponse = NextResponse.json(payload, { status: backendResponse.status });
    clearSessionCookies(request, errorResponse);
    return errorResponse;
  }

  const response = NextResponse.json({ user: payload.user }, { status: backendResponse.status });
  applySessionCookies(request, response, payload as { accessToken: string; refreshToken?: string | null });
  return response;
}

export function buildBackendHeaders(request: NextRequest, accessToken?: string | null) {
  const headers = new Headers();

  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers.set('Content-Type', contentType);
  }

  const accept = request.headers.get('accept');
  if (accept) {
    headers.set('Accept', accept);
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return headers;
}