import { User } from '@/lib/interfaces';
import type { LoginDto, RegisterDto, AuthResponse } from '@/lib/types/auth.types';

/**
 * Routes d'authentification — CODENLIGNE
 *
 * On utilise des URLs RELATIVES (/api/v1/auth/...) pour passer par le proxy Next.js.
 * En dev : le proxy (next.config.js rewrites) relaye vers localhost:3001.
 * En prod : nginx relaye directement.
 * Avantage : les cookies SameSite=Lax sont envoyés car même domaine (localhost:3000).
 *
 * Routes CODENLIGNE (CDC §3) :
 * - login / register / me / logout : parcours standard
 * - reset-request : l'admin génère un code à usage unique (canal manuel)
 * - reset-confirm : l'apprenant saisit le code + nouveau mot de passe
 */
const AUTH_ROUTES = {
  login: '/api/v1/auth/login',
  register: '/api/v1/auth/register',
  me: '/api/v1/auth/me',
  logout: '/api/v1/auth/logout',
  resetRequest: '/api/v1/auth/reset-request',
  resetConfirm: '/api/v1/auth/reset-confirm',
} as const;

export class AuthRequestError extends Error {
  status: number | null;
  code: 'http' | 'network' | 'invalid-payload';

  constructor(message: string, options?: { status?: number | null; code?: 'http' | 'network' | 'invalid-payload' }) {
    super(message);
    this.name = 'AuthRequestError';
    this.status = options?.status ?? null;
    this.code = options?.code ?? 'http';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function ensureUserPayload(payload: unknown): User {
  if (!isRecord(payload)) {
    throw new AuthRequestError('Invalid user payload', { code: 'invalid-payload' });
  }

  const identifier = payload._id || payload.id;
  if (typeof identifier !== 'string' || typeof payload.username !== 'string') {
    throw new AuthRequestError('Invalid user payload', { code: 'invalid-payload' });
  }

  return payload as User;
}

function ensureAuthResponse(payload: unknown): AuthResponse {
  if (!isRecord(payload)) {
    throw new AuthRequestError('Invalid authentication response', { code: 'invalid-payload' });
  }

  return {
    user: ensureUserPayload(payload.user),
  };
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (isRecord(payload) && typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message;
  }

  return fallback;
}

async function requestAuthRoute<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(input, {
      ...init,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(init?.headers || {}),
      },
      cache: 'no-store',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication request failed';
    throw new AuthRequestError(message, { code: 'network' });
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new AuthRequestError(getErrorMessage(payload, 'Authentication request failed'), {
      status: response.status,
      code: 'http',
    });
  }

  return payload as T;
}

export const authService = {
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const payload = await requestAuthRoute<AuthResponse>(AUTH_ROUTES.register, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    return ensureAuthResponse(payload);
  },

  login: async (data: LoginDto): Promise<AuthResponse> => {
    const payload = await requestAuthRoute<AuthResponse>(AUTH_ROUTES.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    return ensureAuthResponse(payload);
  },

  me: async (): Promise<User> => {
    const payload = await requestAuthRoute<User>(AUTH_ROUTES.me, {
      method: 'GET',
    });

    return ensureUserPayload(payload);
  },

  logout: async (): Promise<void> => {
    await requestAuthRoute<{ success: boolean }>(AUTH_ROUTES.logout, {
      method: 'POST',
    });
  },

  /**
   * Demande de réinitialisation — CDC §3
   * Déclenchée par un administrateur après vérification d'identité.
   * Retourne un code temporaire à usage unique, valable 30 minutes.
   * L'admin le communique par un canal convenu (manuel).
   */
  requestReset: async (userId: string): Promise<{ code: string; expiresAt: string }> => {
    return requestAuthRoute<{ code: string; expiresAt: string }>(AUTH_ROUTES.resetRequest, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  },

  /**
   * Confirmation de réinitialisation — CDC §3
   * Le code ne fonctionne qu'une fois. Le changement de mot de passe
   * révoque les sessions antérieures côté serveur.
   */
  resetConfirm: async (data: {
    userId: string;
    code: string;
    newPassword: string;
  }): Promise<void> => {
    await requestAuthRoute<{ success: boolean }>(AUTH_ROUTES.resetConfirm, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
};

export default authService;