import { QueryClient } from '@tanstack/react-query';

/**
 * Clé de persistance du cache React Query.
 * Renommée pour CODENLIGNE : l'ancienne ('monetoile-react-query-cache')
 * aurait fait fuiter l'identité Mon Étoile dans le localStorage des apprenants.
 */
export const PERSISTED_QUERY_CACHE_KEY = 'codenligne-react-query-cache';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes
      gcTime: 1000 * 60 * 30,    // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Clés de requête CODENLIGNE.
 *
 * Convention : le premier élément est un namespace ('auth', 'access',
 * 'courses', 'quizzes', 'attempts', 'admin'…) utilisé par la liste
 * `excludedQueryKeys` du provider de persistance (voir app/providers.tsx).
 *
 * Ne jamais persister :
 * - 'auth'   : état de session (login/logout)
 * - 'access' : statut d'accès de l'apprenant (actif / bloqué / expiré)
 *
 * Aucune clé 'payment' : le CDC §1 interdit tout paiement dans cette version.
 */
export const QUERY_KEYS = {
  // ─── Authentification & accès ─────────────────────────────
  AUTH_ME: ['auth', 'me'] as const,
  ACCESS_STATUS: ['access', 'status'] as const,
  NOTIFICATIONS: ['notifications', 'list'] as const,
  NOTIFICATIONS_UNREAD_COUNT: ['notifications', 'unread-count'] as const,
  // ─── Cours (Thème → Chapitre → Leçon) ─────────────────────
  THEMES: ['courses', 'themes'] as const,
  THEME_DETAIL: (themeId: string) => ['courses', 'theme', themeId] as const,
  CHAPTERS: (themeId: string) => ['courses', 'chapters', themeId] as const,
  CHAPTER_DETAIL: (chapterId: string) => ['courses', 'chapter', chapterId] as const,
  LESSONS: (chapterId: string) => ['courses', 'lessons', chapterId] as const,
  LESSON_DETAIL: (lessonId: string) => ['courses', 'lesson', lessonId] as const,
  LAST_LESSON: ['courses', 'last-lesson'] as const,
  PROGRESS: ['courses', 'progress'] as const,

  // ─── QCM / Tentatives ─────────────────────────────────────
  QUIZZES: ['quizzes', 'list'] as const,
  QUIZ_DETAIL: (quizId: string) => ['quizzes', 'detail', quizId] as const,
  QUIZ_BY_LESSON: (lessonId: string) => ['quizzes', 'by-lesson', lessonId] as const,
  ATTEMPT_CURRENT: (attemptId: string) => ['attempts', 'current', attemptId] as const,
  ATTEMPT_HISTORY: ['attempts', 'history'] as const,
  ATTEMPT_RESULT: (attemptId: string) => ['attempts', 'result', attemptId] as const,

  // ─── Tableau de bord apprenant ────────────────────────────
  LEARNER_DASHBOARD: ['learner', 'dashboard'] as const,
  LEARNER_RESULTS_BY_THEME: ['learner', 'results-by-theme'] as const,
  LEARNER_RECOMMENDATIONS: ['learner', 'recommendations'] as const,

  // ─── Dashboard administrateur ─────────────────────────────
  ADMIN_OVERVIEW: ['admin', 'overview'] as const,
  ADMIN_USERS: ['admin', 'users'] as const,
  ADMIN_USER_DETAIL: (userId: string) => ['admin', 'user', userId] as const,
  ADMIN_PENDING_ACCOUNTS: ['admin', 'pending-accounts'] as const,
  ADMIN_ACCESSES: ['admin', 'accesses'] as const,
  ADMIN_COURSES: ['admin', 'courses'] as const,
  ADMIN_QUESTIONS: ['admin', 'questions'] as const,
  ADMIN_QUESTION_DETAIL: (questionId: string) => ['admin', 'question', questionId] as const,
  ADMIN_QUIZZES: ['admin', 'quizzes'] as const,
  ADMIN_QUIZ_DETAIL: (quizId: string) => ['admin', 'quiz', quizId] as const,
  ADMIN_RESULTS: ['admin', 'results'] as const,
  ADMIN_REPORTS: ['admin', 'reports'] as const,
  ADMIN_SETTINGS: ['admin', 'settings'] as const,
  ADMIN_AUDIT_LOGS: ['admin', 'audit-logs'] as const,

  // ─── Paramètres publics (identité du site, assistance) ────
  PUBLIC_SETTINGS: ['settings', 'public'] as const,
} as const;

export function clearPersistedQueryCache() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(PERSISTED_QUERY_CACHE_KEY);
}