# Mon Étoile Frontend — Guide de déploiement

> **Site Next.js 15 (App Router)** — Interface utilisateur et console d'administration de la plateforme **Mon Étoile**.

---

## Table des matières

- [Stack technique](#stack-technique)
- [Architecture et Fonctionnement](#architecture-et-fonctionnement)
- [La règle d'or des variables Next.js](#la-règle-dor-des-variables-nextjs)
- [Développement local](#développement-local)
- [Déploiement (VPS)](#déploiement-vps)
  - [Le vocabulaire en 1 minute](#le-vocabulaire-en-1-minute)
  - [Étape 1 — Préparer le VPS (Droits d'accès)](#étape-1--préparer-le-vps-droits-daccès)
  - [Étape 2 — Clé SSH n°2 : le VPS → le dépôt Git (Deploy Key)](#étape-2--clé-ssh-n2--le-vps--le-dépôt-git-deploy-key)
    - [Version A — GitLab](#version-a--gitlab)
    - [Version B — GitHub](#version-b--github)
  - [Étape 3 — Configurer la télécommande (`.env.local` local)](#étape-3--configurer-la-télécommande-envlocal-local)
  - [Étape 4 — Première mise en ligne (setup)](#étape-4--première-mise-en-ligne-setup)
  - [Étape 5 — Domaine + HTTPS (via Caddy)](#étape-5--domaine--https-via-caddy)
- [Mises à jour suivantes (deploy)](#mises-à-jour-suivantes-deploy)
- [Variables d'environnement](#variables-denvironnement)
- [Dépannage et maintenance](#dépannage-et-maintenance)

---

## Stack technique

| Composant | Technologie |
|---|---|
| Framework | Next.js 15 (App Router, React 18) |
| Styles | Tailwind CSS |
| Gestion d'état | Zustand + TanStack Query |
| Accès public | HTTPS **`monetoile.org`** via **Caddy** (natif sur le VPS, Let's Encrypt) |
| Conteneurisation | Docker + Docker Compose (build "standalone") |
| Build & exécution VPS | Docker (image reconstruite à chaque déploiement) |

---

## Architecture et Fonctionnement

```
┌─────────────────────────┐           ┌────────────────────────────────────────────────────────┐
│  TON ORDINATEUR         │           │  VPS (51.210.42.70)                                     │
│  ─────────────────────  │    SSH    │  ─────────────────────────────────────────────────────  │
│  code + make deploy ────┼──────────▶│  Utilisateur : apimanager                              │
│                         │           │  Dossier : /opt/mon-etoile-frontend                │
│  .env.production        │           │  Conteneurs Docker :                                   │
│  make env-push ─────────┼──────────▶│   • mon-etoile-front (network_mode host, :3000)        │
│                         │           │  Caddy (VPS) : https://monetoile.org → 127.0.0.1:3000   │
│                         │           │  (Caddyfile versionné dans le repo backend)            │
└─────────────────────────┘           └────────────────────────────────────────────────────────┘
```

* **Build sur le serveur** : Le site Next.js est compilé directement sur le VPS (dans l'image Docker) pour intégrer les variables de production.
* **Reverse proxy** : **Caddy**, installé nativement sur le VPS, termine le TLS de `monetoile.org` (Let's Encrypt) et proxy-passe vers le conteneur Next en `127.0.0.1:3000`. Le conteneur tourne en `network_mode: host` : Next écoute directement sur l'hôte et joint l'API en `127.0.0.1:3001` et le Redis du VPS (cache SSR).

---

## La règle d'or des variables Next.js

Toutes les variables qui commencent par le préfixe **`NEXT_PUBLIC_`** sont compilées et **figées dans le code statique lors du build** (`npm run build`, exécuté dans l'image Docker).

1. Le build se fait sur le VPS (via `make deploy` ou `make setup`) avec le fichier de production `.env.production`.
2. Si tu modifies une variable `NEXT_PUBLIC_*` locale, tu dois l'envoyer sur le serveur (`make env-push`) puis reconstruire obligatoirement l'application (`make deploy`). Redémarrer le conteneur ne suffit pas.
3. Il ne doit pas y avoir de fichier `.env.local` sur le VPS car Next.js lui donnerait la priorité sur le fichier `.env.production` (les Makefile bloquent le déploiement s'il est présent).

---

## Développement local

### Prérequis
* Node.js ≥ 20
* `npm` (fourni avec Node.js)

### Lancement

Le backend doit être démarré (port 3001) avant de lancer le client.

```bash
# 1. Installer les dépendances et générer le fichier .env.local
make install  # (lance npm install et configure .env.local)

# 2. Démarrer le serveur de développement local (port 3000)
make dev
```

L'application est accessible sur `http://localhost:3000`.

---

## Déploiement (VPS)

### Le vocabulaire en 1 minute
* **`apimanager`** : L'utilisateur système non-root dédié sous lequel tournent toutes nos applications.
* **Caddy (VPS)** : Reverse proxy installé nativement sur le VPS. Il termine le TLS de `monetoile.org` et route vers le conteneur Next (`127.0.0.1:3000`) et l'API (`127.0.0.1:3001`). Sa config est versionnée dans le repo **backend** (`deployment/caddy/`).
* **Docker** : Le frontend tourne dans un conteneur isolé (`network_mode: host`), relancé automatiquement (`restart: always`) au reboot du VPS.

---

### Étape 1 — Préparer le VPS (Droits d'accès)

Connecte-toi en `root` sur ton VPS pour créer le dossier et en attribuer la propriété à `apimanager` :

```bash
sudo mkdir -p /opt/mon-etoile-frontend
sudo chown -R apimanager:apimanager /opt/mon-etoile-frontend
```

---

### Étape 2 — Clé SSH n°2 : le VPS → le dépôt Git (Deploy Key)

Le VPS doit lire ton dépôt privé. Une commande génère/affiche sa clé sur le VPS
(et ajoute la clé d'hôte du serveur Git) :

```bash
make vps-key
```

> [!NOTE]
> `make vps-key` est **ré-exécutable sans risque** : si la clé du VPS
> (`~/.ssh/id_ed25519`) n'existe pas encore, elle la crée ; si elle existe déjà,
> elle se contente de la ré-afficher. Lance-la que ce soit ta première
> installation ou non.

Copie la clé publique affichée, puis suis **la version qui correspond à ton
hébergeur** ci-dessous.

#### Version A — GitLab

**Si ce n'est pas encore fait** (clé jamais ajoutée à ce dépôt) — sur GitLab
(dépôt **frontend**) : **Projet ▸ Settings ▸ Repository ▸ Deploy keys ▸ Add
key**, en **lecture seule**.

**Si c'est déjà fait** (clé déjà ajoutée au dépôt backend) — pas besoin de la
recréer : dans **Deploy keys**, onglet des clés déjà disponibles, **active** la
clé existante en un clic.

> [!TIP]
> C'est le **même VPS** que le backend → la **même** clé sert aux deux dépôts,
> ce qui rend l'activation en un clic possible ici.

Dans l'Étape 3, l'URL SSH du dépôt est de la forme :

```env
REPO_URL=git@gitlab.com:dss-civ/monetoilefrontend.git
```

#### Version B — GitHub

**Si ce n'est pas encore fait** — sur GitHub (dépôt **frontend**) : **Repo ▸
Settings ▸ Deploy keys ▸ Add deploy key**, **« Allow write access » décoché**
(lecture seule).

**Si la clé du VPS est déjà utilisée sur le dépôt backend** — tu **ne peux pas**
la réutiliser ici : génère une clé dédiée au frontend (voir WARNING ci-dessous),
ajoute-la via **Add deploy key**, puis route ce dépôt vers elle.

> [!WARNING]
> GitHub **refuse la même Deploy Key sur deux dépôts** (« Key is already in
> use »). La clé du VPS (`~/.ssh/id_ed25519`) étant déjà utilisée pour le dépôt
> backend, tu **ne peux pas** la réutiliser ici. Options :
> - générer une **clé dédiée au frontend** sur le VPS
>   (`ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_front -N ""`) et router ce
>   dépôt vers elle via `~/.ssh/config` sur le VPS (`Host github-front` →
>   `IdentityFile ~/.ssh/id_ed25519_front`), **ou**
> - un **compte machine** (machine user) ayant accès aux deux dépôts, **ou**
> - un **Personal Access Token** en HTTPS au lieu d'une Deploy Key SSH.

> [!NOTE]
> `make vps-key` ajoute automatiquement la **bonne** clé d'hôte : elle est
> déduite de `REPO_URL` (variable `GIT_HOST` du Makefile). Si `REPO_URL` pointe
> sur `github.com`, la clé d'hôte `github.com` est ajoutée toute seule — **rien
> à modifier** dans le `Makefile`.

Dans l'Étape 3, l'URL SSH du dépôt devient :

```env
REPO_URL=git@github.com:ysprod/monetoilefrontend.git
```

---

### Étape 3 — Configurer la télécommande (`.env.local` local)

Sur **ton ordinateur**, crée ou édite le fichier `monetoilefrontend/.env.local` (exclu de Git) avec les paramètres de ton VPS :

```env
VPS_USER=apimanager
VPS_HOST=51.210.42.70
APP_DIR=/opt/mon-etoile-frontend
REPO_URL=git@gitlab.com:dss-civ/monetoilefrontend.git  # URL SSH — GitLab OU GitHub (voir ci-dessous)
SSH_KEY=$(HOME)/.ssh/id_ed25519                       # Ta clé SSH privée vers le VPS (par défaut id_ed25519)
```

> [!IMPORTANT]
> **C'est `REPO_URL` qui décide de l'hébergeur d'où le code est récupéré.** Les
> targets `make setup` et `make pull` font `git ... $(REPO_URL)`, et le Makefile
> charge ce `.env.local` (`-include .env.local`) → ta valeur **écrase** le défaut
> GitLab. Mets l'URL **SSH** selon ton cas :
> - GitLab : `REPO_URL=git@gitlab.com:dss-civ/monetoilefrontend.git`
> - GitHub : `REPO_URL=git@github.com:ysprod/monetoilefrontend.git`
>
> ✅ **`REPO_URL` suffit** : le Makefile en déduit automatiquement la clé d'hôte
> à ajouter au VPS (variable `GIT_HOST` → `ssh-keyscan`), donc **aucun autre
> réglage** pour passer de GitLab à GitHub. Il reste seulement à poser la Deploy
> Key sur le bon hébergeur (Étape 2).

---

### Étape 4 — Première mise en ligne (setup)

1. Sur **ton ordinateur**, ouvre le fichier `.env.production` de `monetoilefrontend/` et configure les adresses de production (domaine `https://monetoile.org` — voir Étape 5).
2. Envoie le fichier de prod vers le serveur :
   ```bash
   make env-push
   ```
3. Lance l'installation et la compilation sur le VPS :
   ```bash
   make setup
   ```
   *`make setup` récupère le code via git (Deploy Key de l'Étape 2 requise), construit l'image Docker et lance le conteneur `mon-etoile-front` en `network_mode: host` (Next écoute sur l'hôte en `3000`, proxy-passé par Caddy). Ré-exécutable : il recale toujours sur `origin/main`.*

---

### Étape 5 — Domaine + HTTPS (via Caddy)

Le site est servi sur **https://monetoile.org** par **Caddy**, installé
nativement sur le VPS. Caddy termine le TLS (certificats Let's Encrypt
automatiques) et route par chemin : `/api/v1`, `/socket.io`, `/uploads` → API
`127.0.0.1:3001`, tout le reste → ce front `127.0.0.1:3000`. Le Caddyfile est
versionné dans le repo **backend** (`deployment/caddy/Caddyfile`) ; les cibles
`make caddy-*` de ce repo relaient vers lui.

Le conteneur front tourne en **`network_mode: host`** : Next écoute sur l'hôte
en `3000`, Caddy le joint en `127.0.0.1:3000`. Le port 3000 est fermé au public
(ufw) — Caddy est le seul point d'entrée, sur 80/443.

**`.env.production`** (déjà appliqué dans ce repo) :

```env
NEXT_PUBLIC_API_URL=https://monetoile.org   # navigateur : même origine (API, socket.io, images)
NEXT_PUBLIC_APP_URL=https://monetoile.org
NEXT_PUBLIC_SITE_URL=https://monetoile.org
NEXT_PUBLIC_BASE_URL=https://monetoile.org
BACKEND_URL=http://127.0.0.1:3001           # cible interne SSR (host mode ; pas host.docker.internal)
REDIS_HOST=51.210.42.70                     # Redis du VPS (conteneur publié sur 6379, mot de passe)
WEB_PORT=3000                               # Next écoute sur l'hôte en 3000 (PORT par défaut)
```

> [!WARNING]
> Les `NEXT_PUBLIC_*` sont **figées au build** → après toute modif :
> `make env-push && make deploy` (rebuild, pas un simple restart).

> [!NOTE]
> `BACKEND_URL` n'est **pas** passé au build Docker : le rewrite Next
> `/api/v1/:path*` (`next.config.js`) retombe donc sur `NEXT_PUBLIC_API_URL`
> (`https://monetoile.org`). C'est pour ça que Caddy doit router `/api/v1`
> **exact** vers l'API : sinon ce chemin arrive au front, qui le renvoie vers
> lui-même en boucle. Le SSR, lui, lit `BACKEND_URL` au runtime.

Vérifie :

```bash
curl -sI https://monetoile.org | head -3                                  # -> 200
curl -s -o /dev/null -w '%{http_code}\n' https://monetoile.org/api/v1     # -> 200
```

---

## Mises à jour suivantes (deploy)

Dès que tu as commité des modifications de code locales sur ton ordinateur :

```bash
make deploy
```
La commande envoie le code sur GitLab, ordonne au VPS de le récupérer, reconstruit l'image Docker (avec les variables de production) puis recrée le conteneur (quelques secondes de coupure : en `network_mode: host`, une seule instance peut tenir le port 3000 — cf. `deployment/scripts/deploy.sh`).

---

## Variables d'environnement

| Variable | Usage |
|---|---|
| `NEXT_PUBLIC_API_URL` | Adresse de l'API vue par le navigateur (`https://monetoile.org`) |
| `BACKEND_URL` | Adresse interne de l'API pour le SSR (front en host mode → `http://127.0.0.1:3001`) |
| `NEXT_PUBLIC_APP_URL` / `SITE_URL` | L'URL publique du site (`https://monetoile.org`) |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_DB` | Redis du VPS (conteneur `redis` publié sur 6379, `REDIS_PASSWORD`) — cache SSR, `REDIS_DB=1` |

---

## Dépannage et maintenance

Toutes les commandes se lancent depuis **ton ordinateur** :

* **Voir les conteneurs** : `make status` (docker compose ps)
* **Consulter les logs du site** : `make logs`
* **Redémarrer le serveur Next.js** : `make restart`
* **Se connecter au terminal VPS** : `make ssh`

---

_Jésus est Seigneur et Sauveur — HonorIT_
