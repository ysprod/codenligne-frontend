import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import config from '../config';
import { clearClientApplicationState } from '../cache/clientState';
import { dispatchLoginNavigation } from '../navigation/clientNavigation';
import { logger } from '../utils/logger';

type DecodedToken = {
  exp?: number;
  role?: string;
  roles?: string[];
};

type ExtendedAxiosRequestConfig = InternalAxiosRequestConfig & {
  skipAuth?: boolean;
  skip401Redirect?: boolean;
};

// ⚠️ Doit correspondre aux cookies posés par le backend (CDC §13 : cookies sécurisés)
const ACCESS_TOKEN_COOKIE = 'codenligne_access_token';
const REQUEST_TIMEOUT_MS = 300000; // 5 min

// Pages publiques d'authentification (CDC §15)
const AUTH_PAGES = ['/connexion', '/inscription'];

let authRedirectInFlight = false;

/**
 * Base64URL → Base64 compatible atob
 */
function normalizeBase64Url(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const paddingNeeded = (4 - (normalized.length % 4)) % 4;
  return normalized + '='.repeat(paddingNeeded);
}

function decodeToken(token: string): DecodedToken | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const json = globalThis.atob(normalizeBase64Url(payload));
    return JSON.parse(json) as DecodedToken;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  return decoded.exp <= Math.floor(Date.now() / 1000);
}

function getAccessTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${ACCESS_TOKEN_COOKIE.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function isOnAuthPage(): boolean {
  if (typeof window === 'undefined') return false;
  return AUTH_PAGES.some((path) => window.location.pathname.startsWith(path));
}

function clearAccessTokenCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; SameSite=Lax`;
}

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/logout') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/me') ||
    url.includes('/auth/reset-request') ||
    url.includes('/auth/reset-confirm')
  );
}

/**
 * Routes protégées CODENLIGNE (CDC §2, §4, §5, §10, §11, §12)
 * - /cours, /exercices, /progression, /compte, /rapport : espace apprenant
 * - /admin : dashboard administrateur
 */
function isProtectedRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const pathname = window.location.pathname;
  return (
    pathname.startsWith('/cours') ||
    pathname.startsWith('/exercices') ||
    pathname.startsWith('/progression') ||
    pathname.startsWith('/compte') ||
    pathname.startsWith('/rapport') ||
    pathname.startsWith('/admin')
  );
}

function shouldRedirectOn401(error: AxiosError): boolean {
  const status = error.response?.status;
  if (status !== 401) return false;

  const requestConfig = error.config as ExtendedAxiosRequestConfig | undefined;

  if (requestConfig?.skip401Redirect) return false;
  if (isAuthEndpoint(requestConfig?.url)) return false;
  if (isOnAuthPage()) return false;
  if (!isProtectedRoute()) return false;

  return true;
}

function redirectToLogin(): void {
  if (typeof window === 'undefined') return;
  if (isOnAuthPage()) return;
  if (authRedirectInFlight) return;

  authRedirectInFlight = true;

  const returnTo = `${window.location.pathname}${window.location.search}`;

  void clearClientApplicationState()
    .catch((err) => {
      logger.warn('Erreur lors du nettoyage du state client avant redirect login', err);
    })
    .finally(() => {
      clearAccessTokenCookie();
      dispatchLoginNavigation(returnTo);

      window.setTimeout(() => {
        authRedirectInFlight = false;
      }, 600);
    });
}

const computedBaseURL = (() => {
  if (typeof window !== 'undefined') {
    return '/api/v1';
  }
  const cleanBaseURL = (process.env.BACKEND_URL || config.api.baseURL).replace(/\/+$/, '');
  const hasApiPath = cleanBaseURL.endsWith('/api') || /\/api\//.test(cleanBaseURL);
  return hasApiPath
    ? `${cleanBaseURL}/${config.api.apiVersion}`
    : `${cleanBaseURL}/api/${config.api.apiVersion}`;
})();

const apiClient: AxiosInstance = axios.create({
  baseURL: computedBaseURL,
  timeout: REQUEST_TIMEOUT_MS,
  withCredentials: true,
  maxRedirects: 5,
  validateStatus: (status) => status >= 200 && status < 300,
});

apiClient.interceptors.request.use(
  async (requestConfig: InternalAxiosRequestConfig) => {
    const config = requestConfig as ExtendedAxiosRequestConfig;

    if (config.skipAuth) {
      return config;
    }

    config.headers = config.headers || {};

    if (config.headers.Authorization) {
      return config;
    }

    const token = getAccessTokenFromCookie();

    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const requestConfig = error.config as ExtendedAxiosRequestConfig | undefined;

    if (shouldRedirectOn401(error)) {
      logger.warn('401 détecté, redirection login déclenchée.', {
        url: requestConfig?.url,
        method: requestConfig?.method,
      });

      redirectToLogin();
    }

    if (error.response?.status === 403) {
      logger.error('Permission refusée (403):', {
        url: requestConfig?.url,
        method: requestConfig?.method,
        data: error.response.data,
      });
    }

    if (
      !error.response &&
      error.name !== 'CanceledError' &&
      error.name !== 'AbortError'
    ) {
      logger.error('Erreur réseau ou timeout:', {
        url: requestConfig?.url,
        method: requestConfig?.method,
        message: error.message,
      });
    }

    return Promise.reject(error);
  },
);

export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig & { skipAuth?: boolean; skip401Redirect?: boolean }) =>
    apiClient.get<T>(url, config),

  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig & { skipAuth?: boolean; skip401Redirect?: boolean },
  ) => apiClient.post<T>(url, data, config),

  put: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig & { skipAuth?: boolean; skip401Redirect?: boolean },
  ) => apiClient.put<T>(url, data, config),

  patch: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig & { skipAuth?: boolean; skip401Redirect?: boolean },
  ) => apiClient.patch<T>(url, data, config),

  delete: <T = unknown>(
    url: string,
    config?: AxiosRequestConfig & { skipAuth?: boolean; skip401Redirect?: boolean },
  ) => apiClient.delete<T>(url, config),
};

export default apiClient;