export const config = {
  // API Configuration
  api: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    apiVersion: 'v1',
    timeout: 300000, // 5 minutes (hooks longs peuvent override)
  },

  // Auth Configuration
  // ⚠️ Les tokens sont dans des cookies httpOnly (CDC §13).
  // Ces clés ne servent que si tu as un fallback localStorage en dev.
  auth: {
    tokenKey: 'codenligne_access_token',
    refreshTokenKey: 'codenligne_refresh_token',
    tokenExpirationBuffer: 360, // secondes avant expiration
  },

  // Frontend Configuration
  frontend: {
    baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // Routes — CODENLIGNE (CDC §2, §3, §4, §5, §6, §10, §11)
  routes: {
    // Public
    home: '/',
    register: '/inscription',
    login: '/connexion',
    assistance: '/assistance',
    status: '/statut',            // page « En attente » (CDC §3)
    terms: '/conditions',
    legal: '/mentions',

    // Espace apprenant
    courses: '/cours',
    exercises: '/exercices',
    progress: '/progression',
    account: '/compte',
    report: '/rapport',

    // Dashboard admin
    admin: '/admin',

    // Redirections post-action
    afterRegister: '/statut',     // CDC §3 : pas de dashboard tant que non validé
    afterLogin: '/cours',         // si actif ; sinon middleware → /statut
    afterLogout: '/',
  },

  // Fuseau horaire de référence (CDC §3)
  timezone: 'Africa/Abidjan',

  // Pagination
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
} as const;

export default config;