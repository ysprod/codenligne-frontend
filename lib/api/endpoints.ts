/**
 * Endpoints API — CODENLIGNE
 *
 * Toutes les routes sont préfixées par `/api/v1` (proxy Next.js en dev,
 * nginx en prod). Les entités Mon Étoile (books, consultations, services,
 * payments, grades, blog, userAccess) sont supprimées.
 *
 * Les endpoints admin sont regroupés sous `admin.*` pour refléter
 * le dashboard (CDC §6).
 */
export const endpoints = {
  root: '/',

  // ─── Authentification (CDC §3) ──────────────────────────
  auth: {
    register: '/api/v1/auth/register',
    login: '/api/v1/auth/login',
    refresh: '/api/v1/auth/refresh',
    me: '/api/v1/auth/me',
    logout: '/api/v1/auth/logout',
    resetRequest: '/api/v1/auth/reset-request',   // admin génère un code
    resetConfirm: '/api/v1/auth/reset-confirm',   // apprenant confirme
  },

  // ─── Espace apprenant ───────────────────────────────────
  users: {
    me: '/api/v1/users/me',
    mePassword: '/api/v1/users/me/password',
    meReport: '/api/v1/users/me/report',          // données du rapport PDF (CDC §11)
  },

  courses: {
    themes: '/api/v1/courses/themes',
    themeById: (id: string) => `/api/v1/courses/themes/${id}`,
    chaptersByTheme: (themeId: string) => `/api/v1/courses/themes/${themeId}/chapters`,
    chapterById: (id: string) => `/api/v1/courses/chapters/${id}`,
    lessonsByChapter: (chapterId: string) => `/api/v1/courses/chapters/${chapterId}/lessons`,
    lessonById: (id: string) => `/api/v1/courses/lessons/${id}`,
    lastLesson: '/api/v1/courses/last-lesson',
    markLessonCompleted: (lessonId: string) => `/api/v1/courses/lessons/${lessonId}/complete`,
    progress: '/api/v1/courses/progress',
  },

  quizzes: {
    list: '/api/v1/quizzes',
    byId: (id: string) => `/api/v1/quizzes/${id}`,
    byLesson: (lessonId: string) => `/api/v1/quizzes/by-lesson/${lessonId}`,
    startAttempt: (quizId: string) => `/api/v1/quizzes/${quizId}/attempts`,
    currentAttempt: (attemptId: string) => `/api/v1/attempts/${attemptId}`,
    saveAnswer: (attemptId: string) => `/api/v1/attempts/${attemptId}/answers`,
    finalizeAttempt: (attemptId: string) => `/api/v1/attempts/${attemptId}/finalize`,
    attemptResult: (attemptId: string) => `/api/v1/attempts/${attemptId}/result`,
    attemptHistory: '/api/v1/attempts/history',
  },

  learner: {
    dashboard: '/api/v1/learner/dashboard',
    resultsByTheme: '/api/v1/learner/results-by-theme',
    recommendations: '/api/v1/learner/recommendations',
  },

  notifications: {
    list: '/api/v1/notifications',
    unreadCount: '/api/v1/notifications/unread-count',
    markAsRead: (id: string) => `/api/v1/notifications/${id}/read`,
    markAllAsRead: '/api/v1/notifications/read-all',
  },

  // ─── Dashboard administrateur (CDC §6) ───────────────────
  admin: {
    overview: '/api/v1/admin/overview',

    // Apprenants & accès (CDC §3, §12)
    users: {
      list: '/api/v1/admin/users',
      byId: (id: string) => `/api/v1/admin/users/${id}`,
      pending: '/api/v1/admin/users/pending',
      activate: (id: string) => `/api/v1/admin/users/${id}/activate`,
      refuse: (id: string) => `/api/v1/admin/users/${id}/refuse`,
      block: (id: string) => `/api/v1/admin/users/${id}/block`,
      reactivate: (id: string) => `/api/v1/admin/users/${id}/reactivate`,
      extend: (id: string) => `/api/v1/admin/users/${id}/extend`,
      accessLogs: (id: string) => `/api/v1/admin/users/${id}/access-logs`,
    },

    // Contenus (CDC §4, §7)
    themes: {
      list: '/api/v1/admin/themes',
      byId: (id: string) => `/api/v1/admin/themes/${id}`,
    },
    chapters: {
      list: '/api/v1/admin/chapters',
      byId: (id: string) => `/api/v1/admin/chapters/${id}`,
    },
    lessons: {
      list: '/api/v1/admin/lessons',
      byId: (id: string) => `/api/v1/admin/lessons/${id}`,
    },

    // Questions (CDC §7)
    questions: {
      list: '/api/v1/admin/questions',
      byId: (id: string) => `/api/v1/admin/questions/${id}`,
      duplicate: (id: string) => `/api/v1/admin/questions/${id}/duplicate`,
      publish: (id: string) => `/api/v1/admin/questions/${id}/publish`,
      archive: (id: string) => `/api/v1/admin/questions/${id}/archive`,
      versions: (id: string) => `/api/v1/admin/questions/${id}/versions`,
    },

    // Questionnaires (CDC §8)
    quizzes: {
      list: '/api/v1/admin/quizzes',
      byId: (id: string) => `/api/v1/admin/quizzes/${id}`,
      publish: (id: string) => `/api/v1/admin/quizzes/${id}/publish`,
      preview: (id: string) => `/api/v1/admin/quizzes/${id}/preview`,
    },

    // Résultats & rapports (CDC §10, §11)
    results: {
      list: '/api/v1/admin/results',
      byUser: (userId: string) => `/api/v1/admin/results/user/${userId}`,
      export: '/api/v1/admin/results/export',
    },
    reports: {
      generate: (userId: string) => `/api/v1/admin/reports/${userId}`,
    },

    // Paramètres (CDC §6)
    settings: {
      get: '/api/v1/admin/settings',
      update: '/api/v1/admin/settings',
    },

    // Audit (CDC §12, §13)
    auditLogs: '/api/v1/admin/audit-logs',

    // Collaborateurs (réservé au super admin — CDC §12)
    collaborators: {
      list: '/api/v1/admin/collaborators',
      byId: (id: string) => `/api/v1/admin/collaborators/${id}`,
      updatePermissions: (id: string) => `/api/v1/admin/collaborators/${id}/permissions`,
    },
  },
} as const;

export default endpoints;