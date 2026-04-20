<p align="center">
  <a href="https://vasty.shop">
    <img src="frontend/public/vasty-logo-small.png" alt="Vasty Shop" width="80">
  </a>
  <h1 align="center">Vasty Shop</h1>
  <p align="center">
    <strong>Marketplace e-commerce multi-vendeurs open source</strong>
  </p>
  <p align="center">
    Marketplace de niveau entreprise avec recommandations par IA, paiements Stripe Connect, ventes flash, POS, gestion des livraisons et support de 17 langues.
  </p>
  <p align="center">
    <a href="https://vasty.shop"><strong>🌐 Essayer la démo en direct →</strong></a>
  </p>
</p>

<p align="center">
  <a href="https://vasty.shop"><img src="https://img.shields.io/badge/demo-live-brightgreen.svg" alt="Live Demo"></a>
  <a href="https://github.com/vasty-shop/vasty-shop/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="License"></a>
  <a href="https://github.com/vasty-shop/vasty-shop/actions/workflows/ci.yml"><img src="https://github.com/vasty-shop/vasty-shop/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/vasty-shop/vasty-shop/stargazers"><img src="https://img.shields.io/github/stars/vasty-shop/vasty-shop?style=social" alt="Stars"></a>
  <a href="https://github.com/vasty-shop/vasty-shop/issues"><img src="https://img.shields.io/github/issues/vasty-shop/vasty-shop" alt="Issues"></a>
  <a href="https://github.com/vasty-shop/vasty-shop/pulls"><img src="https://img.shields.io/github/issues-pr/vasty-shop/vasty-shop" alt="PRs"></a>
</p>

<p align="center">
  <a href="https://vasty.shop">Démo en direct</a> |
  <a href="#démarrage-rapide">Démarrage rapide</a> |
  <a href="#fonctionnalités">Fonctionnalités</a> |
  <a href="#déploiement">Déploiement</a> |
  <a href="https://github.com/vasty-shop/vasty-shop/discussions">Discussions</a> |
  <a href="CONTRIBUTING.md">Contribuer</a>
</p>

<p align="center">
  <a href="./README.md">English</a> | <a href="./README_JA.md">日本語</a> | <a href="./README_ZH.md">中文</a> | <a href="./README_KO.md">한국어</a> | <a href="./README_ID.md">Bahasa Indonesia</a> | <a href="./README_MS.md">Bahasa Melayu</a> | <a href="./README_ES.md">Español</a> | <a href="./README_FR.md">Français</a> | <a href="./README_DE.md">Deutsch</a> | <a href="./README_IT.md">Italiano</a> | <a href="./README_PT-BR.md">Português</a> | <a href="./README_AR.md">العربية</a> | <a href="./README_TR.md">Türkçe</a> | <a href="./README_HI.md">हिन्दी</a> | <a href="./README_BN.md">বাংলা</a> | <a href="./README_UR.md">اردو</a> | <a href="./README_RU.md">Русский</a>
</p>

---

## Table des matières

- [Qu'est-ce que Vasty Shop ?](#quest-ce-que-vasty-shop-)
- [Pourquoi Vasty Shop ?](#pourquoi-vasty-shop--comparaison)
- [Tableau de bord vendeur](#tableau-de-bord-vendeur)
- [Démarrage rapide](#démarrage-rapide)
- [Fonctionnalités](#fonctionnalités)
- [Gestion des livraisons](#gestion-des-livraisons)
- [Éditeur de vitrine](#éditeur-de-vitrine)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Déploiement](#déploiement)
- [Journal des modifications](#journal-des-modifications)
- [Contribuer](CONTRIBUTING.md)
- [Sécurité](#sécurité)
- [Licence](#licence)

## Qu'est-ce que Vasty Shop ?

Vasty Shop est une plateforme open source de marketplace e-commerce multi-vendeurs. Créez votre propre marketplace comme Amazon, Shopify ou Etsy avec des recommandations IA, des paiements automatiques aux vendeurs via Stripe Connect, des ventes flash, un système POS et la gestion des livraisons — le tout auto-hébergeable.

## Pourquoi Vasty Shop ? (Comparaison)

| Fonctionnalité | Vasty Shop | Shopify | WooCommerce | Medusa | Saleor |
|---------|-----------|---------|-------------|--------|--------|
| **Multi-vendeurs** | ✅ Marketplace intégré | 💰 Add-on | ⚠️ Plugin requis | ❌ | ❌ |
| **Paiements Stripe Connect** | ✅ Répartition auto | ✅ Shopify Payments | ⚠️ Plugin | ❌ | ⚠️ Plugin |
| **Recommandations IA** | ✅ Intégré | 💰 App requise | ⚠️ Plugin | ❌ | ❌ |
| **Ventes flash** | ✅ Timer + stock | ✅ | ⚠️ Plugin | ❌ | ❌ |
| **Système POS** | ✅ Intégré + code-barres | ✅ Shopify POS | ⚠️ Plugin | ❌ | ❌ |
| **Cartes cadeaux** | ✅ | ✅ | ⚠️ Plugin | ❌ | ✅ |
| **Zones de livraison** | ✅ Tarifs par zone | ✅ | ⚠️ Plugin | ❌ | ⚠️ |
| **Fidélité/Cashback** | ✅ Points + cashback | ❌ | ⚠️ Plugin | ❌ | ❌ |
| **Système de parrainage** | ✅ | ❌ | ⚠️ Plugin | ❌ | ❌ |
| **Tarification dynamique** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Système de location** | ✅ | ❌ | ⚠️ Plugin | ❌ | ❌ |
| **CMS/Blog** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **17 langues** | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |
| **Auto-hébergé** | ✅ Docker | ❌ | ✅ | ✅ | ✅ |
| **Open source** | ✅ AGPL-3.0 | ❌ | ✅ GPL | ✅ MIT | ✅ BSD |
| **Tarif** | 🟢 Gratuit | 💰 $39-399/mois | 🟢 Gratuit | 🟢 Gratuit | 🟢 Gratuit |

## Tableau de bord vendeur

Chaque vendeur dispose d'un panneau en libre-service avec des KPI en temps réel (revenus, commandes, produits, clients), une ventilation des gains — ventes brutes, frais de livraison, bénéfice net — et une gestion complète des commandes, produits et approbations.

![Tableau de bord vendeur](./docs/screenshots/VastyDash.png)

## Démarrage rapide

### Docker (Recommandé)

> **Prérequis** : [Docker](https://docs.docker.com/get-docker/) et [Docker Compose](https://docs.docker.com/compose/install/)

```bash
git clone https://github.com/vasty-shop/vasty-shop.git
cd vasty-shop

# 1. Créer les fichiers env à partir des exemples
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. (Optionnel) Exécuter l'assistant de configuration pour choisir les fournisseurs
docker compose --profile setup run --rm setup

# 3. Démarrer tous les services (PostgreSQL, Redis, Backend, Frontend)
docker compose up --build

# 4. Exécuter les migrations (dans un nouveau terminal)
docker compose exec backend npm run migrate

# 5. (Optionnel) Peupler la base de données
docker compose exec backend npm run seed
```

L'application sera disponible sur :

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5186 |
| **API Backend** | http://localhost:4005/api/v1 |
| **Docs API (Swagger)** | http://localhost:4005/api/v1/docs |
| **Santé (Fournisseurs)** | http://localhost:4005/api/v1/health/providers |
| **WebSocket** | http://localhost:3002 |

#### Identifiants admin par défaut

| Champ | Valeur |
|-------|-------|
| **E-mail** | `admin@vasty.shop` |
| **Mot de passe** | `admin123` |

> **Note** : Changez le mot de passe admin immédiatement en production.

#### Services Docker

| Service | Image | Port |
|---------|-------|------|
| **PostgreSQL** | postgres:16-alpine | 5433 |
| **Redis** | redis:7-alpine | 6379 |
| **Backend** | node:20-alpine (NestJS) | 4005, 3002 |
| **Frontend** | node:20-alpine (Vite) | 5186 |

#### Commandes utiles

```bash
# Arrêter tous les services
docker compose down

# Arrêter et supprimer toutes les données
docker compose down -v

# Voir les logs du backend
docker compose logs -f backend

# Exécuter les migrations
docker compose exec backend npm run migrate

# Peupler la base
docker compose exec backend npm run seed

# Accéder au shell PostgreSQL
docker compose exec postgres psql -U postgres -d vasty_shop_dev

# Lancer l'assistant de configuration
docker compose --profile setup run --rm setup

# Démarrer avec des services optionnels (ex. Meilisearch, MinIO)
docker compose --profile meilisearch --profile minio up -d
```

### Développement local (sans Docker)

> **Prérequis** : Node.js 20+, PostgreSQL 16+, Redis 7+

```bash
git clone https://github.com/vasty-shop/vasty-shop.git
cd vasty-shop

# Backend
cd backend
cp .env.example .env
# Modifier .env : définir DATABASE_HOST=localhost et REDIS_HOST=localhost
npm install
npm run migrate
npm run start:dev

# Frontend (nouveau terminal)
cd frontend
cp .env.example .env
npm install --legacy-peer-deps
npm run dev
```

## Fonctionnalités

### Noyau e-commerce
Tout ce qu'il faut pour faire tourner une boutique en ligne — catalogue, panier, paiement et post-achat.

- **Produits** -- Variantes, attributs, stock, produits numériques, import en masse
- **Commandes** -- Répartition multi-vendeurs, suivi des statuts, remboursements
- **Panier** -- Panier persistant, commande en invité, multi-devises
- **Catégories** -- Catégories imbriquées avec filtres et recherche
- **Avis** -- Notes, photos, badges achat vérifié

### Paiements et Finance
Paiements multi-fournisseurs avec commissions plateforme automatiques, versements aux vendeurs et suivi financier.

- **Stripe Connect** -- Paiements automatiques aux vendeurs avec commission plateforme
- **PayPal** -- Passerelle de paiement alternative
- **Portefeuille** -- Solde client avec recharge et dépense
- **Séquestre** -- Retenue sécurisée jusqu'à la livraison
- **Versements** -- Paiements groupés aux vendeurs, suivi des commissions
- **Dépenses** -- Suivi des dépenses pour les vendeurs

### Marketing et Croissance
Outils de génération de demande intégrés — aucun plugin tiers nécessaire.

- **Ventes flash** -- Offres limitées avec compte à rebours
- **Campagnes** -- Campagnes promotionnelles avec planification
- **Coupons** -- Pourcentage, montant fixe, livraison gratuite
- **Cartes cadeaux** -- Cartes numériques avec solde
- **Fidélité** -- Système de points avec cashback
- **Parrainage** -- Programme de parrainage client
- **Tarification dynamique** -- Prix selon la demande

### Opérations
Flux de travail en magasin et d'expédition pour les vendeurs qui vendent au-delà du web.

- **POS** -- Point de vente avec scanner code-barres
- **Livraison** -- Tarifs par zone, suivi, partenaires de livraison
- **Colis** -- Gestion des colis
- **Taxes** -- Calcul fiscal par région
- **Export** -- Export CSV/Excel

### Plateforme
Capacités fondamentales qui font fonctionner tous les autres modules.

- **17 langues** -- AR, BN, DE, EN, ES, FR, HI, ID, IT, JA, KO, MS, PT, RU, TR, UR, ZH
- **IA** -- Recommandations produits, recherche intelligente
- **Blog/CMS** -- Gestion de contenu
- **Chat** -- Messagerie temps réel client-vendeur
- **Notifications** -- E-mail, WebSocket, push
- **Tableau de bord admin** -- Analytique complète de la plateforme

## Gestion des livraisons

Toutes les opérations de livraison et d'expédition en un seul endroit : configurez méthodes et zones d'expédition, enregistrez et gérez les partenaires de livraison, suivez les expéditions actives et surveillez les KPI comme le temps moyen de livraison et le nombre de colis en transit d'un coup d'œil.

![Gestion des livraisons](./docs/screenshots/VastyDelivery.png)

## Éditeur de vitrine

Les vendeurs conçoivent leur vitrine avec un éditeur de pages en glisser-déposer — bannières hero, produits phares, catégories, témoignages et pages personnalisées — avec un aperçu en direct qui reflète chaque changement instantanément.

![Éditeur de vitrine](./docs/screenshots/VastyAppPreview.png)

## Stack technique

| Couche | Technologie |
|-------|------------|
| **Backend** | NestJS, TypeScript, PostgreSQL (SQL direct), Redis, Socket.io |
| **Frontend** | React, Vite, TypeScript, Tailwind CSS, Radix UI, i18next |
| **Stockage** | Connectable : local-fs, S3, Cloudflare R2, MinIO, B2, GCS, Azure |
| **Paiements** | Stripe, Stripe Connect, PayPal |
| **IA** | OpenAI, Anthropic, Gemini, Groq, Ollama |
| **Recherche** | PostgreSQL (pg-trgm), Meilisearch, Typesense |

## Structure du projet

```
vasty-shop/
├── backend/              # API NestJS (69 modules, 80+ tables)
│   ├── src/modules/      # products, orders, cart, payments, delivery,
│   │                     # campaigns, coupons, flash-sales, gift-cards,
│   │                     # loyalty, referral, pos, ai, blog, chat, ...
│   └── migrations/       # Migrations PostgreSQL
├── frontend/             # React + Vite + Tailwind (17 langues)
├── shared/               # Types et utilitaires partagés
└── .github/workflows/    # CI/CD
```

## Déploiement

Vasty Shop est conçu pour l'auto-hébergement. Exécutez-le sur tout hôte compatible Docker — un VPS, Render/Railway/Fly, ou votre propre cluster Kubernetes.

**Chemins de déploiement courants :**

- **Docker mono-hôte** — le `docker-compose.yml` inclus est apte à la production avec quelques ajustements d'env (changer les cibles de build, utiliser des volumes gérés, placer un reverse proxy en façade).
- **Postgres + Redis managés** — pointez `DATABASE_URL` / `REDIS_HOST` vers une instance managée et lancez uniquement les conteneurs backend/frontend.
- **Configuration des fournisseurs** — stockage, e-mail, paiements, recherche, SMS et IA sont tous pluggables via des variables d'environnement. Catalogue complet des fournisseurs et guides de configuration : [`backend/docs/providers/`](backend/docs/providers).

**Checklist avant le lancement :**

- [ ] Changez le mot de passe admin par défaut (`admin@vasty.shop` / `admin123`)
- [ ] Définissez `JWT_SECRET` à une valeur aléatoire forte
- [ ] Définissez `NODE_ENV=production` côté backend
- [ ] Configurez au moins un fournisseur e-mail pour les courriels transactionnels
- [ ] Configurez un fournisseur de stockage (S3/R2/MinIO) pour les médias uploadés
- [ ] Sortez les secrets de `backend/.env` du dépôt et du contrôle de version

## Journal des modifications

Consultez [CHANGELOG.md](CHANGELOG.md) pour l'historique des versions et les changements notables.

## Contributeurs

Merci à toutes les personnes formidables qui ont contribué à Vasty Shop ! 🎉

<a href="https://github.com/vasty-shop/vasty-shop/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=vasty-shop/vasty-shop&anon=1&max=100&columns=10" />
</a>

Vous voulez voir votre visage ici ? Consultez notre [Guide de contribution](CONTRIBUTING.md) et commencez à contribuer dès aujourd'hui !

## Activité du projet

<p align="center">
  <img src="https://img.shields.io/github/stars/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=yellow" alt="Stars">
  <img src="https://img.shields.io/github/forks/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=blue" alt="Forks">
  <img src="https://img.shields.io/github/contributors/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=green" alt="Contributors">
  <img src="https://img.shields.io/github/last-commit/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=orange" alt="Last Commit">
</p>

## Sécurité

Merci de signaler les vulnérabilités de manière responsable. Voir [SECURITY.md](SECURITY.md).

## Licence

Ce projet est sous **Licence AGPL-3.0** — voir le fichier [LICENSE](LICENSE) pour plus de détails.

Cela signifie que vous pouvez librement utiliser, modifier et distribuer ce logiciel, mais toute modification doit également être publiée en open source sous la même licence.

Copyright 2025 Vasty Shop Contributors.
