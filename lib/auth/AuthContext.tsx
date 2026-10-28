'use client';

import { AuthRequestError, authService } from '@/lib/api/services';
import { clearClientApplicationState } from '@/lib/cache/clientState';
import { Role } from '@/lib/interfaces';
import { useAuthStore } from '@/lib/store/auth.store';
import type { LoginDto, Permission, RegisterDto } from '@/lib/types/auth.types';
import { logger } from '@/lib/utils/logger';
import { useRouter } from 'next/navigation';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '../interfaces';

// ============================================================================
// TYPES
// ============================================================================

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (roles: Role | Role[]) => boolean;
  hasPermission: (permissions: Permission | Permission[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ============================================================================
// ROUTES PUBLIQUES / PROTÉGÉES — CODENLIGNE
// ============================================================================
// Le CDC §2 distingue 3 espaces : public, apprenant, dashboard admin.
// Les routes ci-dessous sont utilisées pour éviter d'appeler /auth/me
// sur une page publique (gain de performance, pas de 401 inutile).

const PUBLIC_ROUTES = [
  '/',
  '/inscription',
  '/connexion',
  '/assistance',
  '/statut',          // page de statut « En attente » (CDC §3)
  '/conditions',      // CGU
  '/mentions',
] as const;

const PROTECTED_ROUTE_PREFIXES = [
  '/cours',           // espace cours (CDC §4)
  '/exercices',       // espace QCM (CDC §5)
  '/progression',     // progression apprenant
  '/compte',          // espace apprenant — mon compte
  '/rapport',         // rapport imprimable (CDC §11)
  '/admin',           // dashboard administrateur (CDC §6)
] as const;

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) =>
    route === '/' ? pathname === '/' : pathname.startsWith(route)
  );
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// ============================================================================
// PROVIDER
// ============================================================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logoutStore = useAuthStore((s) => s.logout);
  const persistLogin = useAuthStore((s) => s.login);
  const persistUser = useAuthStore((s) => s.updateUser);
  const persistLogout = useAuthStore((s) => s.logout);

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Initialisation au montage ─────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      if (typeof window === 'undefined') return;

      const pathname = window.location.pathname;

      // Route publique : pas de /auth/me, on évite un 401 inutile
      if (isPublicRoute(pathname)) {
        setIsLoading(false);
        return;
      }

      // Route non protégée (ex. page marketing) : pas besoin d'auth
      if (!isProtectedRoute(pathname) && !isPublicRoute(pathname)) {
        // On tente quand même /auth/me si un cookie de session existe,
        // mais sans bloquer l'affichage.
      }

      try {
        const currentUser = await authService.me();
        if (!isMounted) return;
        persistLogin(currentUser);
      } catch (error) {
        if (error instanceof AuthRequestError && error.status === 401) {
          // Session invalide : on nettoie côté client.
          // Le middleware Next.js gère la redirection si la route est protégée.
          await clearClientApplicationState().catch(() => {});
          if (typeof document !== 'undefined') {
            document.cookie = 'codenligne_access_token=; Max-Age=0; path=/;';
            document.cookie = 'codenligne_refresh_token=; Max-Age=0; path=/;';
          }
        } else {
          // Erreur réseau/timeout : ne pas déconnecter
          logger.warn('Auth initialization skipped after non-auth error:', error);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void initAuth();

    return () => {
      isMounted = false;
    };
  }, [persistLogin]);

  // ─── Connexion ────────────────────────────────────────────
  const login = useCallback(async (credentials: LoginDto): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      persistLogin(response.user);
      setAccessToken(response.accessToken ?? null);
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [persistLogin]);

  // ─── Inscription ──────────────────────────────────────────
  // CDC §3 : après inscription, le compte est « En attente ».
  // On NE redirige PAS vers un dashboard : on redirige vers /statut.
  const register = useCallback(async (data: RegisterDto): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      persistLogin(response.user);
      router.replace('/statut');
      router.refresh();
    } catch (error) {
      logger.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [persistLogin, router]);

  // ─── Déconnexion ──────────────────────────────────────────
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    logoutStore();
    try {
      if (typeof document !== 'undefined') {
        document.cookie = 'codenligne_access_token=; Max-Age=0; path=/;';
        document.cookie = 'codenligne_refresh_token=; Max-Age=0; path=/;';
      }
      await authService.logout();
    } catch (error) {
      logger.error('Logout error:', error);
    } finally {
      setAccessToken(null);
      persistLogout();
      await clearClientApplicationState();
      setIsLoading(false);
    }
  }, [logoutStore, persistLogout]);

  // ─── Rafraîchissement ────────────────────────────────────
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const currentUser = await authService.me();
      persistUser(currentUser);
    } catch (error) {
      logger.error('Error refreshing user:', error);
      throw error;
    }
  }, [persistUser]);

  // ─── Vérification de rôle ─────────────────────────────────
  const hasRole = useCallback((roles: Role | Role[]): boolean => {
    if (!user?.role) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  }, [user]);

  // ─── Vérification de permission ──────────────────────────
  const hasPermission = useCallback((permissions: Permission | Permission[]): boolean => {
    if (!user) return false;
    if (user.role === Role.SUPER_ADMIN) return true;

    const permissionArray = Array.isArray(permissions) ? permissions : [permissions];
    return user.customPermissions
      ? permissionArray.some((perm) => user.customPermissions?.includes(perm))
      : false;
  }, [user]);

  const isAuthenticated = useMemo(() => !!user, [user]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      accessToken,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
      hasRole,
      hasPermission,
    }),
    [user, accessToken, isAuthenticated, isLoading, login, register, logout, refreshUser, hasRole, hasPermission]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;