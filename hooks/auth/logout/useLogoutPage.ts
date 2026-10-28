import { useAuth } from '@/lib/auth/AuthContext';
import { useAuthStore } from '@/lib/store/auth.store';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

const PROGRESS_INTERVAL = 100;
const PROGRESS_STEP = 10;
const SUCCESS_REDIRECT_DELAY = 4000;
const ERROR_REDIRECT_DELAY = 500;
const MAX_LOGOUT_WAIT = 10000;

export function useLogoutPage() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState("loading");
  const [progress, setProgress] = useState(0);
  const logoutStore = useAuthStore((s) => s.logout);

  const progressIntervalRef = useRef<NodeJS.Timeout | number | null>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | number | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | number | null>(null);
  const logoutCompletedRef = useRef(false);

   if (typeof document !== 'undefined') {
    document.cookie = 'monetoile_access_token=; Max-Age=0; path=/;';
  }

  const cleanup = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    const redirectToLogin = () => {
      if (typeof window !== 'undefined') {
        window.location.replace('/auth/login');
      } else {
        router.replace('/auth/login');
        router.refresh();
      }
    };

    const performLogout = async () => {
      logoutStore(); // Clear client-side auth state immediately
      if (!user) {
        setStatus("success");
        redirectTimeoutRef.current = setTimeout(() => {
          redirectToLogin();
        }, SUCCESS_REDIRECT_DELAY);
        return;
      }
      
      try {
        progressIntervalRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
              }
              return 90;
            }
            return Math.min(prev + PROGRESS_STEP, 90);
          });
        }, PROGRESS_INTERVAL);
        errorTimeoutRef.current = setTimeout(() => {
          if (!logoutCompletedRef.current) {
            cleanup();
            setStatus("error");
            redirectTimeoutRef.current = setTimeout(() => {
              redirectToLogin();
            }, ERROR_REDIRECT_DELAY);
          }
        }, MAX_LOGOUT_WAIT);
        await logout();
        logoutCompletedRef.current = true;
        cleanup();
        setProgress(100);
        setStatus("success");
        redirectTimeoutRef.current = setTimeout(() => {
          redirectToLogin();
        }, SUCCESS_REDIRECT_DELAY);
      } catch {
        cleanup();
        setStatus("error");
        redirectTimeoutRef.current = setTimeout(() => {
          redirectToLogin();
        }, ERROR_REDIRECT_DELAY);
      }
    };
    performLogout();

    return cleanup;
  }, [cleanup, logout, logoutStore, router, user]);

  return { status, progress };
}