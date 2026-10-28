/**
 * Utilitaires Service Worker — CODENLIGNE
 *
 * ⚠️ IMPORTANT (CDC §13) : les médias réservés (cours, illustrations, vidéos)
 * doivent être servis APRÈS contrôle d'accès. Le service worker ne doit
 * JAMAIS mettre en cache :
 *   - /api/auth/*        (session, login, logout)
 *   - /api/access/*      (statut d'accès : actif / bloqué / expiré)
 *   - /uploads/*         (médias protégés)
 *   - /api/attempts/*    (tentatives en cours, sauvegarde progressive)
 *
 * Ces exclusions doivent être déclarées dans `public/service-worker.js`
 * (fetch handler). Si le SW actuel met en cache tout par défaut, il faut
 * le corriger AVANT mise en production : sinon un apprenant bloqué pourrait
 * rejouer une leçon ou une tentative depuis le cache hors ligne.
 */

const SW_PATH = '/service-worker.js';
const UPDATE_INTERVAL = 60 * 60 * 1000; // 1 heure

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  // En développement, le SW gèle le code : les chunks Next dev n'ont pas de
  // hash de contenu, le cache statique sert donc d'anciennes versions à
  // l'infini. On le désactive et on purge un éventuel SW résiduel.
  if (process.env.NODE_ENV !== 'production') {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch { /* silencieux */ }
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(SW_PATH, { scope: '/' });

    setInterval(() => registration.update().catch(() => {}), UPDATE_INTERVAL);

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          newWorker.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    });

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;
    return await registration.unregister();
  } catch {
    return false;
  }
}

export async function clearServiceWorkerCache(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration?.active) return;

  return new Promise<void>((resolve, reject) => {
    const channel = new MessageChannel();
    const timeout = setTimeout(() => reject(new Error('Cache clear timeout')), 5000);

    channel.port1.onmessage = (event) => {
      clearTimeout(timeout);
      if (event.data?.success) {
        resolve();
        return;
      }

      reject(new Error('Cache clear failed'));
    };

    registration.active!.postMessage({ type: 'CLEAR_CACHE' }, [channel.port2]);
  });
}

export async function getCacheSize(): Promise<number> {
  if (typeof navigator === 'undefined') return 0;

  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return estimate.usage ?? 0;
    } catch { /* fallback */ }
  }

  if (!('caches' in window)) return 0;
  try {
    const names = await caches.keys();
    let total = 0;
    for (const name of names) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      total += keys.length;
    }
    return total;
  } catch {
    return 0;
  }
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 octets';
  const k = 1024;
  const sizes = ['octets', 'Ko', 'Mo', 'Go'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}