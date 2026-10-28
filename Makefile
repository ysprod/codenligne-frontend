# ============================================================================
# Mon Étoile — Frontend (Next.js 15) — Makefile unique (racine)
# ----------------------------------------------------------------------------
# Piloté depuis TON ordinateur. Déploiement en CONTENEUR DOCKER sur le VPS,
# sous /opt/mon-etoile-frontend. Guide : README-DEPLOIEMENT.md
#
#   LOCAL   (ton ordinateur) : install, env, dev, build, start, lint
#   DISTANT (laptop → VPS, Docker) : setup, deploy, release, update, pull,
#                                     env-push, env-check, up/start, down/stop,
#                                     restart, build-nc, ps/status, logs, shell,
#                                     clean, ssh
#
# ⚠ Next.js fige les NEXT_PUBLIC_* AU BUILD → l'image est reconstruite sur le
# VPS à chaque déploiement avec le .env.production courant.
# ============================================================================
-include .env.production
-include .env.local

# ── Déploiement (SSH + Docker) ──────────────────────────────────────────────
VPS_USER  ?= apimanager
VPS_HOST  ?= 51.210.42.70
APP_DIR   ?= /opt/mon-etoile-frontend
REPO_URL  ?= git@gitlab.com:dss-civ/monetoilefrontend.git
BRANCH    ?= main
RELEASE_FROM ?= develop
# Hôte Git déduit de REPO_URL (SSH ou HTTPS) → bascule GitLab/GitHub sans autre réglage
GIT_HOST := $(shell echo '$(REPO_URL)' | sed -E 's|^[a-z]+://||; s|.*@||; s|[:/].*||')
# Chemin d'ajout de la Deploy Key, déduit de GIT_HOST (affiché par make vps-key)
DEPLOY_KEY_HINT := $(if $(filter github.com,$(GIT_HOST)),Repo ▸ Settings ▸ Deploy keys ▸ Add deploy key,Projet ▸ Settings ▸ Repository ▸ Deploy keys ▸ Add key)

SSH_KEY   ?= $(HOME)/.ssh/id_ed25519
SSH_OPTS  ?= -i $(SSH_KEY) -o IdentitiesOnly=yes
SSH       := ssh $(SSH_OPTS) $(VPS_USER)@$(VPS_HOST)
SSHT      := ssh -t $(SSH_OPTS) $(VPS_USER)@$(VPS_HOST)

# ── Docker côté VPS ─────────────────────────────────────────────────────────
PROJECT_NAME = mon-etoile-front
SERVICE      = web
REMOTE_DC    = $(APP_DIR)/deployment
DC           = docker compose --env-file ../.env.production -p $(PROJECT_NAME) -f docker-compose.yml
PREP_DIRS    = mkdir -p ../logs && { chmod -R 777 ../logs 2>/dev/null || true; }

# ── Local ────────────────────────────────────────────────────────────────────
PM ?= npm

.PHONY: help install env dev build start lint \
        vps-key setup deploy release update pull env-push env-check up start-remote down stop \
        restart build-nc status ps logs shell clean ssh \
        caddy-check caddy-sync caddy-reload caddy-status caddy-logs caddy-test \
        firewall-check firewall ssh-admin

help:
	@echo "Mon Étoile Frontend — cibles disponibles"
	@echo ""
	@echo "  LOCAL (ton ordinateur) :"
	@echo "    make install    - npm install + .env.local (généré si absent)"
	@echo "    make dev        - dev server (:3000) — backend requis sur :3001"
	@echo "    make build/start/lint"
	@echo ""
	@echo "  DISTANT (SSH -> VPS, conteneur Docker) :"
	@echo "    make vps-key    - genere/affiche la Deploy Key du VPS (a coller sur $(GIT_HOST))"
	@echo "    make setup      - 1ere installation (init + build image + up)"
	@echo "    make deploy     - push local + build/bascule zero-downtime (deploy.sh)"
	@echo "    make release    - promeut $(RELEASE_FROM) -> $(BRANCH) puis deploie"
	@echo "    make update     - secours : recale le VPS sur origin/$(BRANCH) + deploy.sh"
	@echo "    make env-push   - envoie .env.production -> VPS"
	@echo "    make up/start   - demarre | make down/stop - arrete | make restart"
	@echo "    make build-nc   - rebuild image sans cache | make clean - nettoie Docker"
	@echo "    make ps/status  - etat | make logs - logs live | make shell - sh conteneur"
	@echo "    make ssh        - session SSH"
	@echo ""
	@echo "  CADDY (alias vers le repo backend — source unique du Caddyfile) :"
	@echo "    make caddy-check / caddy-sync / caddy-status / caddy-logs / caddy-test"
	@echo "    make firewall-check / firewall | make ssh-admin (session admin, sudo)"
	@echo ""
	@echo "  VPS_USER=$(VPS_USER) VPS_HOST=$(VPS_HOST) APP_DIR=$(APP_DIR) BRANCH=$(BRANCH)"

# ===========================================================================
# LOCAL — développement direct avec Node
# ===========================================================================
install: env
	$(PM) install

env:
	@if [ -f .env.local ]; then \
		echo "✓ .env.local déjà présent — rien à faire."; \
	else \
		{ \
		printf '%s\n' \
		'# Mon Étoile Frontend — env de dev local (généré par make env)' \
		'NEXT_PUBLIC_API_URL=http://localhost:3001' \
		'BACKEND_URL=http://localhost:3001' \
		'NEXT_PUBLIC_APP_URL=http://localhost:3000' \
		'NEXT_PUBLIC_SITE_URL=http://localhost:3000' \
		'NEXT_PUBLIC_BASE_URL=http://localhost:3000' \
		'REDIS_HOST=127.0.0.1' \
		'REDIS_PORT=6379' \
		'REDIS_PASSWORD=' \
		'REDIS_DB=0' \
		'' \
		'# ── Déploiement (lu par ce Makefile — SSH vers le VPS) ───────' \
		'VPS_USER=apimanager' \
		'VPS_HOST=51.210.42.70' \
		'APP_DIR=/opt/mon-etoile-frontend' \
		'REPO_URL=git@gitlab.com:dss-civ/monetoilefrontend.git' \
		'BRANCH=main' ; \
		} > .env.local; \
		echo "→ .env.local généré."; \
	fi

dev:
	$(PM) run dev

build:
	$(PM) run build

start:
	$(PM) start

lint:
	$(PM) run lint

# ===========================================================================
# DISTANT — pilotage du VPS par SSH (Docker Compose depuis $(APP_DIR)/deployment)
# ===========================================================================

# Génère (si absente) la clé SSH du VPS et affiche sa clé PUBLIQUE à coller comme
# Deploy Key (lecture seule) sur ton hébergeur — chemin ($(DEPLOY_KEY_HINT)) et clé
# d'hôte ($(GIT_HOST)) déduits de REPO_URL.
vps-key:
	$(SSH) '\
		set -e ; mkdir -p ~/.ssh && chmod 700 ~/.ssh ; \
		grep -q "$(GIT_HOST)" ~/.ssh/known_hosts 2>/dev/null || ssh-keyscan -t ed25519,rsa $(GIT_HOST) >> ~/.ssh/known_hosts 2>/dev/null ; \
		[ -f ~/.ssh/id_ed25519 ] || ssh-keygen -t ed25519 -C "$(VPS_USER)@dss-vps" -f ~/.ssh/id_ed25519 -N "" ; \
		KEY=$$(cut -d" " -f1-2 ~/.ssh/id_ed25519.pub) ; printf "%s %s\n" "$$KEY" "$(VPS_USER)@dss-vps" > ~/.ssh/id_ed25519.pub ; \
		echo "" ; echo "===== COLLE CETTE CLÉ COMME DEPLOY KEY SUR $(GIT_HOST) (lecture seule) =====" ; \
		cat ~/.ssh/id_ed25519.pub ; \
		echo "==================================================================" ; \
		echo "$(DEPLOY_KEY_HINT)" '

setup:
	$(SSH) '\
		set -e ; mkdir -p ~/.ssh && chmod 700 ~/.ssh ; \
		grep -q "$(GIT_HOST)" ~/.ssh/known_hosts 2>/dev/null || ssh-keyscan -t ed25519,rsa $(GIT_HOST) >> ~/.ssh/known_hosts 2>/dev/null ; \
		mkdir -p $(APP_DIR) ; cd $(APP_DIR) ; \
		git init -q ; \
		git remote add origin $(REPO_URL) 2>/dev/null || git remote set-url origin $(REPO_URL) ; \
		git fetch origin $(BRANCH) ; git checkout -f -B $(BRANCH) origin/$(BRANCH) ; \
		if [ ! -f .env.production ]; then echo "❌ cree $(APP_DIR)/.env.production (make env-push depuis ton poste)" ; exit 1 ; fi ; \
		cd deployment && $(PREP_DIRS) && $(DC) build --no-cache $(SERVICE) && $(DC) up -d --remove-orphans '

deploy:
	@git diff --quiet && git diff --cached --quiet || echo "⚠ Modifications non commitées — elles ne partiront PAS sur le serveur."
	git push origin $(BRANCH)
	$(SSH) '\
		set -e ; cd $(APP_DIR) ; \
		if [ ! -f .env.production ]; then echo "❌ .env.production manquant — fais make env-push" ; exit 1 ; fi ; \
		git fetch origin $(BRANCH) ; git reset --hard origin/$(BRANCH) ; \
		cd deployment && chmod +x scripts/deploy.sh && ./scripts/deploy.sh '
	@echo "✅ Déployé sur $(VPS_HOST) ($(BRANCH))."

release:
	@echo "🚀 Release : $(RELEASE_FROM) → $(BRANCH)"
	git push origin $(RELEASE_FROM)
	git fetch origin
	git checkout $(BRANCH)
	git reset --hard origin/$(BRANCH)
	git merge --no-ff origin/$(RELEASE_FROM) -m "release: merge $(RELEASE_FROM) into $(BRANCH)"
	git push origin $(BRANCH)
	git checkout $(RELEASE_FROM)
	@$(MAKE) deploy
	@echo "✅ $(BRANCH) déployé."

update:
	$(SSH) '\
		set -e ; cd $(APP_DIR) ; \
		git remote set-url origin $(REPO_URL) ; \
		git fetch origin $(BRANCH) ; git reset --hard origin/$(BRANCH) ; \
		cd deployment && chmod +x scripts/deploy.sh && ./scripts/deploy.sh '
	@echo "✅ VPS recalé sur origin/$(BRANCH) et redéployé."

pull:
	$(SSH) 'cd $(APP_DIR) && git fetch origin $(BRANCH) && git reset --hard origin/$(BRANCH)'

env-push:
	@[ -f .env.production ] || { echo "❌ .env.production introuvable en local"; exit 1; }
	$(SSH) 'mkdir -p $(APP_DIR)'
	scp $(SSH_OPTS) .env.production $(VPS_USER)@$(VPS_HOST):$(APP_DIR)/.env.production
	@echo "✅ .env.production poussé — reconstruis : make deploy (NEXT_PUBLIC_* figées au build)"

env-check:
	$(SSH) 'test -f $(APP_DIR)/.env.production && echo ".env.production present" || echo "ATTENTION: .env.production manquant"'

up start-remote:
	$(SSH) 'cd $(REMOTE_DC) && $(PREP_DIRS) && $(DC) up -d --remove-orphans'

down stop:
	$(SSH) 'cd $(REMOTE_DC) && $(DC) down'

restart:
	$(SSH) 'cd $(REMOTE_DC) && $(DC) restart $(SERVICE)'

build-nc:
	$(SSH) 'cd $(REMOTE_DC) && $(DC) build --no-cache $(SERVICE) && docker image prune -f'

status ps:
	$(SSH) 'cd $(REMOTE_DC) && $(DC) ps'

logs:
	$(SSHT) 'cd $(REMOTE_DC) && $(DC) logs -f --tail=100 $(SERVICE)'

shell:
	$(SSHT) 'cd $(REMOTE_DC) && $(DC) exec $(SERVICE) /bin/sh'

clean:
	$(SSH) 'docker system prune -f && docker image prune -f'

ssh:
	$(SSHT)

# ===========================================================================
# REVERSE PROXY CADDY — alias délégués au repo backend (source unique).
# Caddy sert front + back via un seul Caddyfile, versionné dans le repo backend
# (deployment/caddy/). Ces cibles relaient simplement vers lui, pour pouvoir les
# lancer aussi depuis le repo frontend sans `cd`.
# ===========================================================================
BACKEND_DIR ?= ../monetoilebackend

caddy-check caddy-sync caddy-reload caddy-status caddy-logs caddy-test firewall-check firewall ssh-admin:
	@test -d $(BACKEND_DIR) || { echo "❌ $(BACKEND_DIR) introuvable — Caddy est piloté depuis le repo backend (deployment/caddy/)."; exit 1; }
	@$(MAKE) -C $(BACKEND_DIR) $@
