# Mon Étoile — Frontend

App Next.js 15 (App Router, TypeScript) pour la plateforme de voyance. `package.json` name : `plan-cosmique`.

## Stack

- **Next.js 15** App Router + **React 18**
- **Tailwind 3** (`tailwind.config.ts`) + `next-themes` (dark mode)
- **État** : **Zustand** (`lib/store/`) + **TanStack Query** (avec persist IndexedDB via `idb`) ; `swr` présent aussi
- **HTTP** : `axios` (`lib/api/client.ts`)
- **Temps réel** : `socket.io-client` (`lib/sockets/useAnalysisSocket.ts`)
- **UI** : `framer-motion`, `lucide-react`, `recharts`, `react-markdown` (+ `remark-gfm`, `remark-breaks`)
- **PDF** : `@react-pdf/renderer` (`lib/pdf/`)
- **Redis** : `ioredis` côté serveur pour cache SSR (`lib/ssrRedisCache.ts`, `lib/redis.ts`)

## Scripts

```bash
npm run dev            # dev server (port 3000)
npm run build          # build prod (buildId aléatoire = cache busting)
npm start              # serveur prod
npm run lint           # eslint (.js,.jsx,.ts,.tsx)
npm run env:local      # bascule env -> local  (scripts/switch-env.js)
npm run env:prod       # bascule env -> prod
```

## Routing (App Router)

`app/` — routes. Zones principales :
- `app/star/` — espace utilisateur connecté : `profil`, `consultations`, `voyance`, `carteduciel`, `cinqportes`, `marcheoffrandes`, `livres`, `blog`, `wallet`, `transaction`, `messagerie`, `notifications`, `grade`, `abonnement`, `medium`, `rubriques`, `category`, `monprofil`
- `app/admin/` — back-office : `users`, `consultants`, `consultations`, `payments`, `grades`, `books`, `blog`, `categories`, `rubriques`, `offrandes`, `settings`
- `app/auth/` — `login`, `register`, `logout`
- `app/api/` — route handlers Next : `payments/moneyfusion`, `webhooks/moneyfusion`, `cities`
- `app/callback`, `terms`, `about`, `a-propos`
- Racine : `layout.tsx`, `providers.tsx` (QueryClient + thème), `page.tsx`, `error.tsx`, `not-found.tsx`, `sitemap.ts`

`pages/_document.tsx` subsiste (Pages Router pour le doc uniquement).

## Auth & middleware

`middleware.ts` (Edge) protège `/star/*` et `/admin/*` :
- lit le cookie **`monetoile_access_token`**, décode le JWT (sans lib Node, `atob`), vérifie l'expiration
- redirige vers `/auth/login?returnTo=...` si absent/expiré sur route protégée
- applique les **headers de sécurité** (CSP-ish : X-Frame-Options, HSTS, etc.) sur toutes les réponses
- matcher : `/star/*`, `/admin/*`, `/auth/*`, `/callback`, `/wallet`

Constantes auth (nom du cookie, buffer d'expiration) : `lib/config.ts` (`config.auth`).

## Organisation code

- `components/` — par domaine, miroir des routes (`voyance`, `consultations`, `carteduciel`, `cinqportes`, `marcheoffrandes`, `admin`, `wallet`, `blog`, `grade`, `star`, `layout`, `commons`, `ui`, …)
- `hooks/` — hooks React par domaine (`voyance`, `consultations`, `carteduciel`, `medium`, `grade`, `messaging`, `notifications`, `auth`, `cache`, …)
- `lib/` — cœur non-UI :
  - `api/` — `client.ts` (axios), `endpoints.ts`, `server/`, `services/`
  - `store/` — `auth.store.ts`, `monetoile.store.ts` (Zustand)
  - `config.ts` — config centrale (API baseURL, auth, routes, pagination)
  - `sockets/`, `cache/`, `pdf/`, `types/`, `interfaces.ts`, `constants.ts`, `utils/`, `functions.ts`, `birthCountries.ts`

## Config / env

- `NEXT_PUBLIC_API_URL` — URL backend (défaut `http://localhost:3001`), utilisée par axios + `next.config.js` (remotePatterns images)
- `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_SITE_URL` — URL front
- `next.config.js` : `remotePatterns` pour images backend `/uploads/**`, `monetoile.org`, youtube, placehold.co ; `buildId` aléatoire par build
- API sans préfixe de version (routes directes, cf. `config.api.apiVersion` non utilisé)
- Timeout axios : 5 min (hooks d'analyse IA longs)

## Conventions

- Français pour l'UI et les commentaires.
- Un domaine métier = un dossier dans `app/`, `components/`, `hooks/` (mêmes noms).
- Data fetching : TanStack Query via hooks de `hooks/`, jamais d'appel axios direct dans un composant.
- Paiement des offrandes : la passerelle active vient du back (`GET /payments/provider`, hook `hooks/payments/usePaymentProvider.ts`). `CheckoutModal` bascule entre `useRayMoneyCheckout` (saisie opérateur/numéro) et `useFineoPayCheckout` (redirection vers la page hébergée).
- `docs/` contient les guides d'intégration front (~25 fichiers).
