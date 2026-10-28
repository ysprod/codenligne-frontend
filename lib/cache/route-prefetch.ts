import { api } from '@/lib/api/client';
import type { User } from '@/lib/interfaces';
import type { QueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from './queryClient';

// ============================================================================
// REGISTRE DE PREFETCH — CODENLIGNE
// ============================================================================
//
// Chaque entrée associe une route à un prefetch de données.
// Les routes Mon Étoile (/star/*, /admin/consultations, /admin/books) sont
// supprimées. Les routes CODENLIGNE sont :
//   - /cours           : thèmes, chapitres, leçons
//   - /exercices       : questionnaires, tentatives
//   - /progression     : dashboard apprenant
//   - /compte          : profil apprenant
//   - /rapport         : rapport imprimable
//   - /admin           : vue générale
//   - /admin/apprenants: liste + détail apprenant
//   - /admin/resultats : résultats & rapports
//
// Les prefetch qui dépendent des stubs (courses, quizzes, admin) sont
// commentés. On les réactive au fur et à mesure de l'implémentation.

const inFlightDataPrefetches = new Map<string, Promise<void>>();
const inFlightAdminUserPrefetches = new Map<string, Promise<void>>();

type PrefetchEntry = {
  route: string;
  requiresAuth?: boolean;
  prefetch: (queryClient: QueryClient) => Promise<void>;
};

const prefetchRegistry: PrefetchEntry[] = [
  // ─── Espace apprenant ─────────────────────────────────
  // TODO (étape « Espace cours ») : décommenter quand courses.service est implémenté
  // {
  //   route: '/cours',
  //   requiresAuth: true,
  //   prefetch: async (queryClient) => {
  //     await queryClient.prefetchQuery({
  //       queryKey: QUERY_KEYS.THEMES,
  //       queryFn: () => coursesService.getThemes(),
  //     });
  //   },
  // },

  // TODO (étape « Espace QCM ») : décommenter quand quizzes.service est implémenté
  // {
  //   route: '/exercices',
  //   requiresAuth: true,
  //   prefetch: async (queryClient) => {
  //     await queryClient.prefetchQuery({
  //       queryKey: QUERY_KEYS.QUIZZES,
  //       queryFn: () => quizzesService.getQuizzes(),
  //     });
  //   },
  // },

  // TODO (étape « Tableau de bord apprenant »)
  // {
  //   route: '/progression',
  //   requiresAuth: true,
  //   prefetch: async (queryClient) => {
  //     await queryClient.prefetchQuery({
  //       queryKey: QUERY_KEYS.LEARNER_DASHBOARD,
  //       queryFn: () => coursesService.getLearnerDashboard(),
  //     });
  //   },
  // },

  // ─── Notifications (service stub, on garde le prefetch en place) ───
  // TODO : activer quand notificationsService sera implémenté
  // {
  //   route: '/compte/notifications',
  //   requiresAuth: true,
  //   prefetch: async (queryClient) => {
  //     await queryClient.prefetchQuery({
  //       queryKey: QUERY_KEYS.NOTIFICATIONS,
  //       queryFn: () => notificationsService.getUnreadNotifications(),
  //     });
  //   },
  // },

  // ─── Dashboard admin ──────────────────────────────────
  // TODO (étape « Dashboard admin ») : décommenter quand adminService est implémenté
  // {
  //   route: '/admin',
  //   requiresAuth: true,
  //   prefetch: async (queryClient) => {
  //     await queryClient.prefetchQuery({
  //       queryKey: QUERY_KEYS.ADMIN_OVERVIEW,
  //       queryFn: () => adminService.getOverview(),
  //     });
  //   },
  // },

  // TODO : décommenter quand adminService est implémenté
  // {
  //   route: '/admin/apprenants',
  //   requiresAuth: true,
  //   prefetch: async (queryClient) => {
  //     await queryClient.prefetchQuery({
  //       queryKey: QUERY_KEYS.ADMIN_USERS,
  //       queryFn: () => adminService.getUsers(),
  //     });
  //   },
  // },
];

// ============================================================================
// HELPERS
// ============================================================================

export function normalizePrefetchHref(href: string): string | null {
  if (!href.startsWith('/')) {
    return null;
  }

  const pathname = href.split('#')[0]?.split('?')[0]?.trim();
  if (!pathname) {
    return null;
  }

  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

export function prefetchRouteData(
  queryClient: QueryClient,
  href: string,
  isAuthenticated: boolean,
): Promise<void> {
  const normalizedHref = normalizePrefetchHref(href);
  if (!normalizedHref) {
    return Promise.resolve();
  }

  const entry = prefetchRegistry.find((candidate) => candidate.route === normalizedHref);
  if (!entry) {
    return Promise.resolve();
  }

  if (entry.requiresAuth && !isAuthenticated) {
    return Promise.resolve();
  }

  const existing = inFlightDataPrefetches.get(normalizedHref);
  if (existing) {
    return existing;
  }

  const pending = entry
    .prefetch(queryClient)
    .catch(() => undefined)
    .finally(() => {
      inFlightDataPrefetches.delete(normalizedHref);
    });

  inFlightDataPrefetches.set(normalizedHref, pending);
  return pending;
}

// ============================================================================
// PREFETCH DÉTAIL APPRENANT (admin)
// ============================================================================

export function prefetchAdminUserDetail(queryClient: QueryClient, userId: string): Promise<void> {
  const normalizedId = userId.trim();
  if (!normalizedId) {
    return Promise.resolve();
  }

  const existing = inFlightAdminUserPrefetches.get(normalizedId);
  if (existing) {
    return existing;
  }

  const pending = queryClient
    .prefetchQuery({
      queryKey: QUERY_KEYS.ADMIN_USER_DETAIL(normalizedId),
      queryFn: async () => {
        const response = await api.get<User>(`/admin/users/${normalizedId}`);
        return response.data;
      },
      staleTime: 1000 * 60,
    })
    .catch(() => undefined)
    .finally(() => {
      inFlightAdminUserPrefetches.delete(normalizedId);
    });

  inFlightAdminUserPrefetches.set(normalizedId, pending);
  return pending;
}

// ============================================================================
// SUPPRIMÉ — prefetch spécifiques Mon Étoile
// ============================================================================
//
// Les fonctions suivantes ont été supprimées car liées à Mon Étoile :
// - prefetchConsultationFrontData  (consultations)
// - prefetchAdminConsultationDetail (consultations)
// - prefetchRubriqueDetail         (rubriques)
// - prefetchBookDetail             (books)
// - prefetchWalletData             (wallet)
//
// Si tu veux un prefetch de détail (leçon, question, tentative), on l'ajoutera
// au fur et à mesure dans ce fichier.