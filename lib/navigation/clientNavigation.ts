'use client';

/**
 * Événement de navigation client — CODENLIGNE
 * Renommé : l'ancien namespace `monetoile:navigate` fuyait l'identité Mon Étoile
 * dans les DevTools / logs. Tout écouteur doit utiliser la constante exportée.
 */
export const CLIENT_NAVIGATION_EVENT = 'codenligne:navigate';

export type ClientNavigationDetail = {
  href: string;
  replace?: boolean;
  refresh?: boolean;
};

export function dispatchClientNavigation(detail: ClientNavigationDetail) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent<ClientNavigationDetail>(CLIENT_NAVIGATION_EVENT, { detail }));
}

/**
 * Redirige vers la page de connexion CODENLIGNE.
 * Route : /connexion (CDC §15 : accès Connexion depuis la page publique).
 * L'ancienne route `/auth/login` est abandonnée.
 */
export function dispatchLoginNavigation(returnTo?: string) {
  const params = new URLSearchParams();

  if (returnTo) {
    params.set('returnTo', returnTo);
  }

  dispatchClientNavigation({
    href: params.size ? `/connexion?${params.toString()}` : '/connexion',
    replace: true,
    refresh: true,
  });
}