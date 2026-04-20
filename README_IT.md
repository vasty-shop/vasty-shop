<p align="center">
  <a href="https://vasty.shop">
    <img src="frontend/public/vasty-logo-small.png" alt="Vasty Shop" width="80">
  </a>
  <h1 align="center">Vasty Shop</h1>
  <p align="center">
    <strong>Marketplace e-commerce multi-vendor open source</strong>
  </p>
  <p align="center">
    Marketplace di livello enterprise con raccomandazioni IA, pagamenti Stripe Connect, vendite flash, POS, gestione consegne e supporto per 17 lingue.
  </p>
</p>

<p align="center">
  <a href="https://github.com/vasty-shop/vasty-shop/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="License"></a>
  <a href="https://github.com/vasty-shop/vasty-shop/actions/workflows/ci.yml"><img src="https://github.com/vasty-shop/vasty-shop/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/vasty-shop/vasty-shop/stargazers"><img src="https://img.shields.io/github/stars/vasty-shop/vasty-shop?style=social" alt="Stars"></a>
  <a href="https://github.com/vasty-shop/vasty-shop/issues"><img src="https://img.shields.io/github/issues/vasty-shop/vasty-shop" alt="Issues"></a>
  <a href="https://github.com/vasty-shop/vasty-shop/pulls"><img src="https://img.shields.io/github/issues-pr/vasty-shop/vasty-shop" alt="PRs"></a>
</p>

<p align="center">
  <a href="https://vasty.shop">Sito web</a> |
  <a href="#avvio-rapido">Avvio rapido</a> |
  <a href="#funzionalità">Funzionalità</a> |
  <a href="https://github.com/vasty-shop/vasty-shop/discussions">Discussioni</a> |
  <a href="CONTRIBUTING.md">Contribuire</a>
</p>

<p align="center">
  <a href="./README.md">English</a> | <a href="./README_JA.md">日本語</a> | <a href="./README_ZH.md">中文</a> | <a href="./README_KO.md">한국어</a> | <a href="./README_ID.md">Bahasa Indonesia</a> | <a href="./README_MS.md">Bahasa Melayu</a> | <a href="./README_ES.md">Español</a> | <a href="./README_FR.md">Français</a> | <a href="./README_DE.md">Deutsch</a> | <a href="./README_IT.md">Italiano</a> | <a href="./README_PT-BR.md">Português</a> | <a href="./README_AR.md">العربية</a> | <a href="./README_TR.md">Türkçe</a> | <a href="./README_HI.md">हिन्दी</a> | <a href="./README_BN.md">বাংলা</a> | <a href="./README_UR.md">اردو</a> | <a href="./README_RU.md">Русский</a>
</p>

---

## Cos'è Vasty Shop?

Vasty Shop è una piattaforma open source per creare marketplace e-commerce multi-vendor. Costruisci il tuo marketplace come Amazon, Shopify o Etsy con raccomandazioni IA, pagamenti automatici ai venditori tramite Stripe Connect, vendite flash, sistema POS e gestione consegne — tutto self-hosted.

## Perché Vasty Shop? (Confronto)

| Funzionalità | Vasty Shop | Shopify | WooCommerce | Medusa | Saleor |
|---------|-----------|---------|-------------|--------|--------|
| **Multi-vendor** | ✅ Marketplace integrato | 💰 Add-on | ⚠️ Plugin richiesto | ❌ | ❌ |
| **Pagamenti Stripe Connect** | ✅ Suddivisione auto | ✅ Shopify Payments | ⚠️ Plugin | ❌ | ⚠️ Plugin |
| **Raccomandazioni IA** | ✅ Integrato | 💰 App richiesta | ⚠️ Plugin | ❌ | ❌ |
| **Vendite flash** | ✅ Timer + stock | ✅ | ⚠️ Plugin | ❌ | ❌ |
| **Sistema POS** | ✅ Integrato + codice a barre | ✅ Shopify POS | ⚠️ Plugin | ❌ | ❌ |
| **Carte regalo** | ✅ | ✅ | ⚠️ Plugin | ❌ | ✅ |
| **Zone di consegna** | ✅ Prezzi per zona | ✅ | ⚠️ Plugin | ❌ | ⚠️ |
| **Fidelizzazione/Cashback** | ✅ Punti + cashback | ❌ | ⚠️ Plugin | ❌ | ❌ |
| **Sistema referral** | ✅ | ❌ | ⚠️ Plugin | ❌ | ❌ |
| **Prezzi dinamici** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Sistema di noleggio** | ✅ | ❌ | ⚠️ Plugin | ❌ | ❌ |
| **CMS/Blog** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **17 lingue** | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |
| **Self-hosted** | ✅ Docker | ❌ | ✅ | ✅ | ✅ |
| **Open Source** | ✅ AGPL-3.0 | ❌ | ✅ GPL | ✅ MIT | ✅ BSD |
| **Prezzo** | 🟢 Gratuito | 💰 $39-399/mese | 🟢 Gratuito | 🟢 Gratuito | 🟢 Gratuito |

## Dashboard Vendor

Ogni vendor ottiene un pannello self-service con KPI in tempo reale (ricavi, ordini, prodotti, clienti), un riepilogo guadagni — vendite lorde, costi di consegna, profitto netto — e gestione completa di ordini, prodotti e approvazioni.

![Dashboard Vendor](./docs/screenshots/VastyDash.png)

## Avvio rapido

### Docker (Consigliato)

> **Prerequisiti**: [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/install/)

```bash
git clone https://github.com/vasty-shop/vasty-shop.git
cd vasty-shop

# 1. Crea i file env dagli esempi
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. (Opzionale) Esegui la procedura guidata di configurazione
docker compose --profile setup run --rm setup

# 3. Avvia tutti i servizi (PostgreSQL, Redis, Backend, Frontend)
docker compose up --build

# 4. Esegui le migrazioni del database (in un nuovo terminale)
docker compose exec backend npm run migrate

# 5. (Opzionale) Popola il database
docker compose exec backend npm run seed
```

L'app sarà disponibile su:

| Servizio | URL |
|---------|-----|
| **Frontend** | http://localhost:5186 |
| **API Backend** | http://localhost:4005/api/v1 |
| **Docs API (Swagger)** | http://localhost:4005/api/v1/docs |
| **Health (Provider)** | http://localhost:4005/api/v1/health/providers |
| **WebSocket** | http://localhost:3002 |

#### Credenziali admin predefinite

| Campo | Valore |
|-------|-------|
| **Email** | `admin@vasty.shop` |
| **Password** | `admin123` |

> **Nota:** Cambia la password admin immediatamente in produzione.

#### Servizi Docker

| Servizio | Immagine | Porta |
|---------|-------|------|
| **PostgreSQL** | postgres:16-alpine | 5433 |
| **Redis** | redis:7-alpine | 6379 |
| **Backend** | node:20-alpine (NestJS) | 4005, 3002 |
| **Frontend** | node:20-alpine (Vite) | 5186 |

#### Comandi utili

```bash
# Ferma tutti i servizi
docker compose down

# Ferma e rimuovi tutti i dati
docker compose down -v

# Visualizza log del backend
docker compose logs -f backend

# Esegui migrazioni
docker compose exec backend npm run migrate

# Popola database
docker compose exec backend npm run seed

# Accedi alla shell PostgreSQL
docker compose exec postgres psql -U postgres -d vasty_shop_dev

# Esegui setup wizard
docker compose --profile setup run --rm setup

# Avvia con servizi opzionali (es. Meilisearch, MinIO)
docker compose --profile meilisearch --profile minio up -d
```

### Sviluppo locale (senza Docker)

> **Prerequisiti**: Node.js 20+, PostgreSQL 16+, Redis 7+

```bash
git clone https://github.com/vasty-shop/vasty-shop.git
cd vasty-shop

# Backend
cd backend
cp .env.example .env
# Modifica .env: imposta DATABASE_HOST=localhost e REDIS_HOST=localhost
npm install
npm run migrate
npm run start:dev

# Frontend (nuovo terminale)
cd frontend
cp .env.example .env
npm install --legacy-peer-deps
npm run dev
```

## Funzionalità

### Core E-Commerce
- **Prodotti** -- Varianti, attributi, inventario, prodotti digitali, import in blocco
- **Ordini** -- Divisione multi-vendor, tracking status, rimborsi
- **Carrello** -- Persistente, checkout ospite, multi-valuta
- **Categorie** -- Nidificate con filtri e ricerca
- **Recensioni** -- Valutazioni, foto, badge acquisto verificato

### Pagamenti e Finanza
- **Stripe Connect** -- Pagamenti automatici ai venditori con commissione piattaforma
- **PayPal** -- Gateway di pagamento alternativo
- **Wallet** -- Portafoglio cliente con ricarica e spesa
- **Escrow** -- Pagamento protetto fino alla consegna
- **Disbursement** -- Pagamenti in blocco ai venditori, tracking commissioni
- **Spese** -- Tracking spese per venditori

### Marketing e Crescita
- **Vendite flash** -- Offerte a tempo con countdown
- **Campagne** -- Campagne promozionali con pianificazione
- **Coupon** -- Percentuale, importo fisso, spedizione gratuita
- **Carte regalo** -- Carte digitali con saldo
- **Fidelizzazione** -- Sistema punti con cashback
- **Referral** -- Programma segnalazioni clienti
- **Prezzi dinamici** -- Prezzi basati sulla domanda

### Operazioni
- **POS** -- Punto vendita con scanner codice a barre
- **Consegne** -- Prezzi per zona, tracking, partner di consegna
- **Pacchi** -- Gestione spedizioni pacchi
- **Tasse** -- Calcolo fiscale per regione
- **Esportazione** -- Export CSV/Excel

### Piattaforma
- **17 lingue** -- AR, BN, DE, EN, ES, FR, HI, ID, IT, JA, KO, MS, PT, RU, TR, UR, ZH
- **IA** -- Raccomandazioni prodotti, ricerca intelligente
- **Blog/CMS** -- Gestione contenuti
- **Chat** -- Messaggistica in tempo reale cliente-venditore
- **Notifiche** -- Email, WebSocket, push
- **Dashboard admin** -- Analytics completa della piattaforma

## Gestione Consegne

Operazioni di consegna e spedizione dell'intera piattaforma in un unico posto: configura metodi e zone di spedizione, registra e gestisci partner di consegna, traccia le spedizioni attive e monitora KPI come tempo medio di consegna e spedizioni in transito a colpo d'occhio.

![Gestione Consegne](./docs/screenshots/VastyDelivery.png)

## Storefront Builder

I vendor progettano il proprio storefront con un page builder drag-and-drop — hero banner, prodotti in evidenza, categorie, testimonial e pagine personalizzate — con un'anteprima live che mostra ogni modifica istantaneamente.

![Storefront Builder](./docs/screenshots/VastyAppPreview.png)

## Stack tecnologico

| Livello | Tecnologia |
|-------|------------|
| **Backend** | NestJS, TypeScript, PostgreSQL (SQL diretto), Redis, Socket.io |
| **Frontend** | React, Vite, TypeScript, Tailwind CSS, Radix UI, i18next |
| **Storage** | Pluggable: local-fs, S3, Cloudflare R2, MinIO, B2, GCS, Azure |
| **Pagamenti** | Stripe, Stripe Connect, PayPal |
| **IA** | OpenAI, Anthropic, Gemini, Groq, Ollama |
| **Ricerca** | PostgreSQL (pg-trgm), Meilisearch, Typesense |

## Struttura del progetto

```
vasty-shop/
├── backend/              # API NestJS (69 moduli, 80+ tabelle)
│   ├── src/modules/      # products, orders, cart, payments, delivery,
│   │                     # campaigns, coupons, flash-sales, gift-cards,
│   │                     # loyalty, referral, pos, ai, blog, chat, ...
│   └── migrations/       # Migrazioni PostgreSQL
├── frontend/             # React + Vite + Tailwind (17 lingue)
├── shared/               # Tipi e utilità condivise
└── .github/workflows/    # CI/CD
```

## Contributori

Grazie a tutte le persone fantastiche che hanno contribuito a Vasty Shop! 🎉

<a href="https://github.com/vasty-shop/vasty-shop/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=vasty-shop/vasty-shop&anon=1&max=100&columns=10" />
</a>

Vuoi vedere il tuo volto qui? Dai un'occhiata alla nostra [Guida ai Contributi](CONTRIBUTING.md) e inizia a contribuire oggi!

## Attività del progetto

<p align="center">
  <img src="https://img.shields.io/github/stars/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=yellow" alt="Stars">
  <img src="https://img.shields.io/github/forks/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=blue" alt="Forks">
  <img src="https://img.shields.io/github/contributors/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=green" alt="Contributors">
  <img src="https://img.shields.io/github/last-commit/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=orange" alt="Last Commit">
</p>

## Sicurezza

Segnala le vulnerabilità in modo responsabile. Vedi [SECURITY.md](SECURITY.md).

## Licenza

Questo progetto è rilasciato sotto **Licenza AGPL-3.0** — consulta il file [LICENSE](LICENSE) per i dettagli.

Significa che puoi usare, modificare e distribuire liberamente questo software, ma ogni modifica deve essere rilasciata come open source sotto la stessa licenza.

Copyright 2025 Vasty Shop Contributors.
