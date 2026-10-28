'use client';

import { useAuthStore } from '@/lib/store/auth.store';
import { clearIndexedDbCache } from './indexedDB';
import { clearPersistedQueryCache, queryClient } from './queryClient';

/**
 * Clés localStorage à préserver lors du nettoyage.
 * - 'codenligne-auth' : le store Zustand se vide via logout(), pas besoin
 *   de le préserver ici, mais on garde le mécanisme pour d'éventuelles
 *   préférences utilisateur (thème, langue).
 */
const PRESERVED_LOCAL_STORAGE_KEYS = new Set(['codenligne-preferences']);

function clearCodenligneStorage(storage: Storage | undefined) {
  if (!storage) {
    return;
  }

  const keysToRemove: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key) {
      continue;
    }

    if (key.startsWith('codenligne') && !PRESERVED_LOCAL_STORAGE_KEYS.has(key)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => storage.removeItem(key));
}

/**
 * Purge complète de l'état client — CODENLIGNE
 *
 * Appelée lors d'un logout, d'un 401, ou d'une réinitialisation de mot de passe.
 * Ne touche PAS aux cookies httpOnly (c'est le rôle du serveur, CDC §13).
 *
 * Suppression de toutes les références Mon Étoile :
 * - useMonEtoileStore (blog, grades, consultations) → supprimé
 * - 'monetoile-*' dans localStorage → remplacé par 'codenligne-*'
 */
export async function clearClientApplicationState() {
  if (typeof window === 'undefined') {
    return;
  }

  // 1. Cache React Query (mémoire + persistance localStorage)
  queryClient.clear();
  clearPersistedQueryCache();

  // 2. Store d'authentification Zustand
  useAuthStore.getState().logout();

  // 3. Cache IndexedDB (médias, si utilisé)
  try {
    await clearIndexedDbCache();
  } catch {
    // noop
  }

  // 4. localStorage / sessionStorage (clés 'codenligne-*' sauf préférences)
  clearCodenligneStorage(window.localStorage);
  clearCodenligneStorage(window.sessionStorage);
}