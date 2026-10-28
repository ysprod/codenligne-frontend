'use client';

import { PERSISTED_QUERY_CACHE_KEY, queryClient } from '@/lib/cache/queryClient';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ThemeProvider } from 'next-themes';
import { memo, ReactNode, Suspense, useEffect, useMemo, useState } from 'react';
import ClientProviders from '../components/layout/ClientProviders/ClientProviders';

// ============================================================================
// CONFIGURATION DU CACHE PERSISTÉ
// ============================================================================

const QUERY_PERSIST_CONFIG = {
  maxAge: 1000 * 60 * 60 * 24, // 24 heures
  throttleTime: 1000,
  /**
   * Clés de requête à ne jamais persister :
   * - 'auth'   : l'état de session doit toujours être frais (login/logout)
   * - 'access' : statut d'accès de l'apprenant (actif, bloqué, expiré) —
   *              le CDC §3 impose une vérification côté serveur à chaque requête.
   *              Servir un statut obsolète depuis le cache afficherait un accès
   *              qui n'est plus valide.
   *
   * Aucune clé 'payment' : le CDC §1 interdit tout paiement dans cette version.
   */
  excludedQueryKeys: ['auth', 'access'] as string[],
};

const ClientProvidersLazy = ClientProviders;

// ============================================================================
// PROVIDER REACT QUERY
// ============================================================================

function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const persister = useMemo(() => {
    if (!isHydrated || typeof window === 'undefined') return null;

    return createSyncStoragePersister({
      storage: window.localStorage,
      key: PERSISTED_QUERY_CACHE_KEY,
      throttleTime: QUERY_PERSIST_CONFIG.throttleTime,
    });
  }, [isHydrated]);

  if (!persister) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: QUERY_PERSIST_CONFIG.maxAge,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            query.state.status === 'success' &&
            !QUERY_PERSIST_CONFIG.excludedQueryKeys.includes(query.queryKey[0] as string),
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}

// ============================================================================
// SKIP LINK — accessibilité clavier
// ============================================================================

const RootSkipLink = memo(function RootSkipLink() {
  return (
    <a
      href="#main-content"
      className="
        sr-only
        focus:not-sr-only
        focus:fixed focus:top-4 focus:left-4 focus:z-[9999]
        focus:py-3 focus:px-6
        focus:bg-secondary focus:text-white
        focus:rounded-md focus:shadow-card focus:font-semibold focus:text-base
        focus:outline-none focus:ring-4 focus:ring-primary/35
      "
    >
      Aller au contenu principal
    </a>
  );
});

RootSkipLink.displayName = 'RootSkipLink';

// ============================================================================
// PORTAILS RACINE — modales et toasts
// ============================================================================

const RootPortals = memo(function RootPortals() {
  return (
    <>
      <div id="modal-root" aria-live="polite" />
      <div id="toast-root" aria-live="assertive" aria-atomic="true" />
    </>
  );
});

RootPortals.displayName = 'RootPortals';

// ============================================================================
// PROVIDERS RACINE
// ============================================================================

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      // CDC §15 : thème clair imposé, pas de mode sombre.
      forcedTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <ReactQueryProvider>
        <ClientProvidersLazy>
          <Suspense
            fallback={
              <div
                className="min-h-screen bg-white"
                role="status"
                aria-label="Chargement"
              />
            }
          >
            {children}
          </Suspense>
        </ClientProvidersLazy>
      </ReactQueryProvider>
    </ThemeProvider>
  );
}

export { RootSkipLink, RootPortals };