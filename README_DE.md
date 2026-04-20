<p align="center">
  <a href="https://vasty.shop">
    <img src="frontend/public/vasty-logo-small.png" alt="Vasty Shop" width="80">
  </a>
  <h1 align="center">Vasty Shop</h1>
  <p align="center">
    <strong>Open-Source Multi-Vendor E-Commerce-Marktplatz</strong>
  </p>
  <p align="center">
    Enterprise-tauglicher Marktplatz mit KI-Empfehlungen, Stripe Connect-Auszahlungen, Flash-Verkäufen, POS, Lieferverwaltung und Unterstützung für 17 Sprachen.
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
  <a href="https://vasty.shop">Webseite</a> |
  <a href="#schnellstart">Schnellstart</a> |
  <a href="#funktionen">Funktionen</a> |
  <a href="https://github.com/vasty-shop/vasty-shop/discussions">Diskussionen</a> |
  <a href="CONTRIBUTING.md">Mitwirken</a>
</p>

<p align="center">
  <a href="./README.md">English</a> | <a href="./README_JA.md">日本語</a> | <a href="./README_ZH.md">中文</a> | <a href="./README_KO.md">한국어</a> | <a href="./README_ID.md">Bahasa Indonesia</a> | <a href="./README_MS.md">Bahasa Melayu</a> | <a href="./README_ES.md">Español</a> | <a href="./README_FR.md">Français</a> | <a href="./README_DE.md">Deutsch</a> | <a href="./README_IT.md">Italiano</a> | <a href="./README_PT-BR.md">Português</a> | <a href="./README_AR.md">العربية</a> | <a href="./README_TR.md">Türkçe</a> | <a href="./README_HI.md">हिन्दी</a> | <a href="./README_BN.md">বাংলা</a> | <a href="./README_UR.md">اردو</a> | <a href="./README_RU.md">Русский</a>
</p>

---

## Was ist Vasty Shop?

Vasty Shop ist eine Open-Source-Plattform für Multi-Vendor-E-Commerce-Marktplätze. Baue deinen eigenen Marktplatz wie Amazon, Shopify oder Etsy — mit KI-gestützten Empfehlungen, Stripe Connect-Auszahlungen an Händler, Flash-Verkäufen, POS-System und Lieferverwaltung — alles selbst hostbar.

## Warum Vasty Shop? (Vergleich)

| Funktion | Vasty Shop | Shopify | WooCommerce | Medusa | Saleor |
|---------|-----------|---------|-------------|--------|--------|
| **Multi-Vendor** | ✅ Integrierter Marktplatz | 💰 Marktplatz-Add-on | ⚠️ Plugin nötig | ❌ | ❌ |
| **Stripe Connect-Auszahlungen** | ✅ Autom. Händler-Splits | ✅ Shopify Payments | ⚠️ Plugin | ❌ | ⚠️ Plugin |
| **KI-Empfehlungen** | ✅ Integriert | 💰 App erforderlich | ⚠️ Plugin | ❌ | ❌ |
| **Flash-Verkäufe** | ✅ Timer + Bestand | ✅ | ⚠️ Plugin | ❌ | ❌ |
| **POS-System** | ✅ Integriert + Barcode | ✅ Shopify POS | ⚠️ Plugin | ❌ | ❌ |
| **Geschenkgutscheine** | ✅ | ✅ | ⚠️ Plugin | ❌ | ✅ |
| **Lieferzonen** | ✅ Zonenbasierte Preise | ✅ | ⚠️ Plugin | ❌ | ⚠️ |
| **Treue/Cashback** | ✅ Punkte + Cashback | ❌ | ⚠️ Plugin | ❌ | ❌ |
| **Empfehlungssystem** | ✅ | ❌ | ⚠️ Plugin | ❌ | ❌ |
| **Surge-Pricing** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Mietsystem** | ✅ | ❌ | ⚠️ Plugin | ❌ | ❌ |
| **CMS/Blog** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **17 Sprachen** | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |
| **Selbst gehostet** | ✅ Docker | ❌ | ✅ | ✅ | ✅ |
| **Open Source** | ✅ AGPL-3.0 | ❌ | ✅ GPL | ✅ MIT | ✅ BSD |
| **Preis** | 🟢 Kostenlos | 💰 $39-399/Mon. | 🟢 Kostenlos | 🟢 Kostenlos | 🟢 Kostenlos |

## Händler-Dashboard

Jeder Händler erhält ein Self-Service-Bedienfeld mit Echtzeit-KPIs (Umsatz, Bestellungen, Produkte, Kunden), einer Einnahmenübersicht — Bruttoumsatz, Lieferkosten, Nettogewinn — und vollständiger Bestell-, Produkt- und Genehmigungsverwaltung.

![Händler-Dashboard](./docs/screenshots/VastyDash.png)

## Schnellstart

### Docker (Empfohlen)

> **Voraussetzungen**: [Docker](https://docs.docker.com/get-docker/) und [Docker Compose](https://docs.docker.com/compose/install/)

```bash
git clone https://github.com/vasty-shop/vasty-shop.git
cd vasty-shop

# 1. Env-Dateien aus den Beispielen erstellen
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. (Optional) Setup-Assistent ausführen, um Provider interaktiv auszuwählen
docker compose --profile setup run --rm setup

# 3. Alle Dienste starten (PostgreSQL, Redis, Backend, Frontend)
docker compose up --build

# 4. Datenbank-Migrationen ausführen (in einem neuen Terminal)
docker compose exec backend npm run migrate

# 5. (Optional) Datenbank mit Testdaten füllen
docker compose exec backend npm run seed
```

Die App ist erreichbar unter:

| Dienst | URL |
|---------|-----|
| **Frontend** | http://localhost:5186 |
| **Backend-API** | http://localhost:4005/api/v1 |
| **API-Dokumentation (Swagger)** | http://localhost:4005/api/v1/docs |
| **Health (Provider)** | http://localhost:4005/api/v1/health/providers |
| **WebSocket** | http://localhost:3002 |

#### Standard-Admin-Zugangsdaten

| Feld | Wert |
|-------|-------|
| **E-Mail** | `admin@vasty.shop` |
| **Passwort** | `admin123` |

> **Hinweis:** Ändere das Admin-Passwort sofort in der Produktion.

#### Docker-Dienste

| Dienst | Image | Port |
|---------|-------|------|
| **PostgreSQL** | postgres:16-alpine | 5433 |
| **Redis** | redis:7-alpine | 6379 |
| **Backend** | node:20-alpine (NestJS) | 4005, 3002 |
| **Frontend** | node:20-alpine (Vite) | 5186 |

#### Nützliche Befehle

```bash
# Alle Dienste stoppen
docker compose down

# Stoppen und alle Daten entfernen (Datenbank, Redis)
docker compose down -v

# Backend-Logs anzeigen
docker compose logs -f backend

# Migrationen ausführen
docker compose exec backend npm run migrate

# Datenbank mit Testdaten füllen
docker compose exec backend npm run seed

# PostgreSQL-Shell öffnen
docker compose exec postgres psql -U postgres -d vasty_shop_dev

# Setup-Assistent ausführen
docker compose --profile setup run --rm setup

# Mit optionalen Diensten starten (z. B. Meilisearch, MinIO)
docker compose --profile meilisearch --profile minio up -d
```

### Lokale Entwicklung (ohne Docker)

> **Voraussetzungen**: Node.js 20+, PostgreSQL 16+, Redis 7+

```bash
git clone https://github.com/vasty-shop/vasty-shop.git
cd vasty-shop

# Backend
cd backend
cp .env.example .env
# .env bearbeiten: DATABASE_HOST=localhost und REDIS_HOST=localhost setzen
npm install
npm run migrate
npm run start:dev

# Frontend (neues Terminal)
cd frontend
cp .env.example .env
npm install --legacy-peer-deps
npm run dev
```

## Funktionen

### E-Commerce-Kern
- **Produkte** -- Varianten, Attribute, Lagerbestand, digitale Produkte, Bulk-Import
- **Bestellungen** -- Aufteilung auf mehrere Händler, Statusverfolgung, Rückerstattungen
- **Warenkorb** -- Persistenter Warenkorb, Gast-Checkout, Multi-Währung
- **Kategorien** -- Verschachtelte Kategorien mit Filtern und Suche
- **Bewertungen** -- Sterne, Fotos, verifizierte Käufer-Badges

### Zahlungen & Finanzen
- **Stripe Connect** -- Automatische Händlerauszahlungen mit Plattformgebühr
- **PayPal** -- Alternatives Zahlungs-Gateway
- **Wallet** -- Kundenguthaben mit Aufladung und Abzug
- **Treuhand (Escrow)** -- Sichere Zahlung bis zur Lieferung
- **Auszahlung** -- Sammelauszahlungen an Händler, Provisionsverfolgung
- **Ausgaben** -- Geschäftsausgabenverfolgung für Händler

### Marketing & Wachstum
- **Flash-Verkäufe** -- Zeitlich begrenzte Angebote mit Countdown
- **Kampagnen** -- Werbekampagnen mit Terminplanung
- **Gutscheine** -- Prozent, Festbetrag, kostenloser Versand
- **Geschenkkarten** -- Digitale Geschenkkarten mit Guthaben
- **Treue** -- Punktesystem mit Cashback
- **Empfehlungen** -- Kundenempfehlungsprogramm
- **Surge-Pricing** -- Dynamische Preise nach Nachfrage

### Betrieb
- **POS** -- Kassensystem mit Barcode-Scanning
- **Lieferung** -- Zonenbasierte Preise, Tracking, Lieferpartner
- **Paket** -- Paketzustellungsverwaltung
- **Steuer** -- Regionale Steuerberechnung
- **Export** -- Datenexport als CSV/Excel

### Plattform
- **17 Sprachen** -- AR, BN, DE, EN, ES, FR, HI, ID, IT, JA, KO, MS, PT, RU, TR, UR, ZH
- **KI** -- Produktempfehlungen, intelligente Suche
- **Blog/CMS** -- Content-Management
- **Chat** -- Echtzeit-Nachrichten zwischen Kunden und Händlern
- **Benachrichtigungen** -- E-Mail, WebSocket, Push
- **Admin-Dashboard** -- Vollständige Plattformanalyse

## Lieferverwaltung

Plattformweite Liefer- und Versandvorgänge an einem Ort: Versandmethoden und -zonen konfigurieren, Lieferpartner registrieren und verwalten, aktive Sendungen verfolgen und KPIs wie durchschnittliche Lieferzeit und Anzahl unterwegs auf einen Blick überwachen.

![Lieferverwaltung](./docs/screenshots/VastyDelivery.png)

## Storefront-Builder

Händler gestalten ihr Schaufenster mit einem Drag-and-Drop-Seitenersteller — Hero-Banner, ausgewählte Produkte, Kategorien, Testimonials und benutzerdefinierte Seiten — mit einer Live-Vorschau, die jede Änderung sofort nebeneinander darstellt.

![Storefront-Builder](./docs/screenshots/VastyAppPreview.png)

## Technologie-Stack

| Ebene | Technologie |
|-------|------------|
| **Backend** | NestJS, TypeScript, PostgreSQL (raw SQL), Redis, Socket.io |
| **Frontend** | React, Vite, TypeScript, Tailwind CSS, Radix UI, i18next |
| **Speicher** | Anbindbar: local-fs, S3, Cloudflare R2, MinIO, B2, GCS, Azure |
| **Zahlungen** | Stripe, Stripe Connect, PayPal |
| **KI** | OpenAI, Anthropic, Gemini, Groq, Ollama |
| **Suche** | PostgreSQL (pg-trgm), Meilisearch, Typesense |

## Projektstruktur

```
vasty-shop/
├── backend/              # NestJS API (69 Module, 80+ Tabellen)
│   ├── src/modules/      # products, orders, cart, payments, delivery,
│   │                     # campaigns, coupons, flash-sales, gift-cards,
│   │                     # loyalty, referral, pos, ai, blog, chat, ...
│   └── migrations/       # PostgreSQL-Migrationen
├── frontend/             # React + Vite + Tailwind (17 Sprachen)
├── shared/               # Gemeinsame Typen und Utilities
└── .github/workflows/    # CI/CD
```

## Mitwirkende

Danke an alle wunderbaren Menschen, die zu Vasty Shop beigetragen haben! 🎉

<a href="https://github.com/vasty-shop/vasty-shop/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=vasty-shop/vasty-shop&anon=1&max=100&columns=10" />
</a>

Möchtest du dein Gesicht hier sehen? Schau in unseren [Contributing Guide](CONTRIBUTING.md) und beginne noch heute mitzuwirken!

## Projektaktivität

<p align="center">
  <img src="https://img.shields.io/github/stars/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=yellow" alt="Stars">
  <img src="https://img.shields.io/github/forks/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=blue" alt="Forks">
  <img src="https://img.shields.io/github/contributors/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=green" alt="Contributors">
  <img src="https://img.shields.io/github/last-commit/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=orange" alt="Last Commit">
</p>

## Sicherheit

Bitte melde Schwachstellen verantwortungsvoll. Siehe [SECURITY.md](SECURITY.md).

## Lizenz

Dieses Projekt ist unter der **AGPL-3.0-Lizenz** lizenziert — siehe die Datei [LICENSE](LICENSE) für Details.

Das bedeutet, dass du diese Software frei verwenden, modifizieren und verteilen kannst, aber alle Modifikationen müssen unter derselben Lizenz als Open Source veröffentlicht werden.

Copyright 2025 Vasty Shop Contributors.
