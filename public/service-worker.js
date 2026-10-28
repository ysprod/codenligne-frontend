// Service Worker avancé pour Mon Étoile
// - Cache-First pour assets statiques/images, Network-Only pour pages/API/auth
// - Fallback offline, gestion fine de l'expiration, éviction LRU, sécurité headers
// - Incrémentez CACHE_VERSION pour forcer la mise à jour

const CACHE_VERSION = 'v230';
const CACHE_STATIC = `monetoile-${CACHE_VERSION}-static`;
const CACHE_IMAGES = `monetoile-${CACHE_VERSION}-images`;

const PRECACHE_ASSETS = ['/offline.html'];
const MAX_ENTRIES = { static: 500, images: 200 };
const MAX_AGE = {
  static: 30 * 24 * 60 * 60 * 1000, // 30 jours
  images: 7 * 24 * 60 * 60 * 1000,  // 7 jours
};

// ─── Installation ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .catch(() => { }) // Fail silently en dev
  );
  self.skipWaiting();
});

// ─── Activation & nettoyage des anciens caches ─────────────────
self.addEventListener('activate', (event) => {
  const currentCaches = new Set([CACHE_STATIC, CACHE_IMAGES]);
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((name) => !currentCaches.has(name)).map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

// ─── Helpers ───────────────────────────────────────────────────


/**
 * Classifie une URL. Retourne 'static' | 'image' | null (network-only)
 * - static: fichiers Next.js, polices, CSS
 * - image: images courantes
 */
function classify(pathname) {
  if (pathname.startsWith('/_next/static/')) return 'static';
  if (/\.(woff2?|ttf|eot|css)$/i.test(pathname)) return 'static';
  if (/\.(jpe?g|png|gif|webp|avif|svg|ico)$/i.test(pathname)) return 'image';
  return null;
}

/** Éviction LRU asynchrone en arrière-plan (n'est PAS dans le chemin critique) */
let evictionScheduled = false;
function scheduleEviction(cacheName, maxEntries) {
  if (evictionScheduled) return;
  evictionScheduled = true;
  // Exécuter après que la réponse a déjà été envoyée
  setTimeout(async () => {
    evictionScheduled = false;
    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      if (keys.length > maxEntries) {
        // Supprimer les plus anciennes entrées (FIFO)
        const toDelete = keys.slice(0, keys.length - maxEntries);
        await Promise.all(toDelete.map((key) => cache.delete(key)));
      }
    } catch (e) { /* ignore */ }
  }, 5000);
}


// ─── Fetch handler ─────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!url.protocol.startsWith('http')) return;

  // Ne jamais intercepter l'auth, les API, ni les pages dynamiques sensibles
  if (/\/api\//.test(url.pathname) || /\/auth\//.test(url.pathname) || /\/logout/.test(url.pathname)) {
    return;
  }

  const type = classify(url.pathname);
  if (!type) return;

  const cacheName = type === 'static' ? CACHE_STATIC : CACHE_IMAGES;
  const maxAge = type === 'static' ? MAX_AGE.static : MAX_AGE.images;
  const maxEntries = type === 'static' ? MAX_ENTRIES.static : MAX_ENTRIES.images;

  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    let cached = await cache.match(request);

    // Vérifier l'expiration
    if (cached) {
      const cachedAt = cached.headers.get('sw-cached-at');
      if (!cachedAt || (Date.now() - Number(cachedAt)) < maxAge) {
        return cached;
      }
      // Cache expiré : on tente le réseau, fallback sur cache expiré
    }

    try {
      const response = await fetch(request, { credentials: 'same-origin' });
      if (response.ok && response.type !== 'opaque') {
        // Sécurise les headers, ajoute le timestamp
        const headers = new Headers(response.headers);
        headers.set('sw-cached-at', String(Date.now()));
        // Supprime les headers sensibles
        headers.delete('set-cookie');
        headers.delete('cookie');
        const cloned = new Response(response.clone().body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
        cache.put(request, cloned);
        scheduleEviction(cacheName, maxEntries);
      }
      return response;
    } catch (err) {
      // Hors ligne : retourne le cache même expiré
      if (cached) return cached;
      // Navigation offline : fallback page offline
      if (request.mode === 'navigate') {
        const offline = await caches.match('/offline.html');
        if (offline) return offline;
      }
      throw err;
    }
  })());
});

// ─── Messages depuis le client ─────────────────────────────────
self.addEventListener('message', (event) => {
  if (!event.data) return;

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.keys()
          .then((names) => Promise.all(names.map((n) => caches.delete(n))))
          .then(() => {
            if (event.ports?.[0]) event.ports[0].postMessage({ success: true });
          })
      );
      break;
  }
});