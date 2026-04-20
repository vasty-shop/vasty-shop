<p align="center">
  <a href="https://vasty.shop">
    <img src="frontend/public/vasty-logo-small.png" alt="Vasty Shop" width="80">
  </a>
  <h1 align="center">Vasty Shop</h1>
  <p align="center">
    <strong>Marketplace e-commerce multi-vendor sumber terbuka</strong>
  </p>
  <p align="center">
    Marketplace kelas enterprise dengan rekomendasi AI, pencairan Stripe Connect, flash sale, POS, manajemen pengiriman, dan dukungan 17 bahasa.
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
  <a href="https://vasty.shop">Situs web</a> |
  <a href="#mulai-cepat">Mulai Cepat</a> |
  <a href="#fitur">Fitur</a> |
  <a href="https://github.com/vasty-shop/vasty-shop/discussions">Diskusi</a> |
  <a href="CONTRIBUTING.md">Berkontribusi</a>
</p>

<p align="center">
  <a href="./README.md">English</a> | <a href="./README_JA.md">日本語</a> | <a href="./README_ZH.md">中文</a> | <a href="./README_KO.md">한국어</a> | <a href="./README_ID.md">Bahasa Indonesia</a> | <a href="./README_MS.md">Bahasa Melayu</a> | <a href="./README_ES.md">Español</a> | <a href="./README_FR.md">Français</a> | <a href="./README_DE.md">Deutsch</a> | <a href="./README_IT.md">Italiano</a> | <a href="./README_PT-BR.md">Português</a> | <a href="./README_AR.md">العربية</a> | <a href="./README_TR.md">Türkçe</a> | <a href="./README_HI.md">हिन्दी</a> | <a href="./README_BN.md">বাংলা</a> | <a href="./README_UR.md">اردو</a> | <a href="./README_RU.md">Русский</a>
</p>

---

## Apa itu Vasty Shop?

Vasty Shop adalah platform marketplace e-commerce multi-vendor sumber terbuka. Bangun marketplace Anda sendiri seperti Amazon, Shopify, atau Etsy dengan rekomendasi bertenaga AI, pencairan otomatis ke vendor melalui Stripe Connect, flash sale, sistem POS, dan manajemen pengiriman — semuanya dapat di-host sendiri.

## Mengapa Vasty Shop? (Perbandingan)

| Fitur | Vasty Shop | Shopify | WooCommerce | Medusa | Saleor |
|---------|-----------|---------|-------------|--------|--------|
| **Multi-vendor** | ✅ Bawaan | 💰 Add-on | ⚠️ Butuh plugin | ❌ | ❌ |
| **Pencairan Stripe Connect** | ✅ Pembagian otomatis | ✅ Shopify Payments | ⚠️ Plugin | ❌ | ⚠️ Plugin |
| **Rekomendasi AI** | ✅ Bawaan | 💰 Butuh app | ⚠️ Plugin | ❌ | ❌ |
| **Flash sale** | ✅ Timer + stok | ✅ | ⚠️ Plugin | ❌ | ❌ |
| **Sistem POS** | ✅ Bawaan + barcode | ✅ Shopify POS | ⚠️ Plugin | ❌ | ❌ |
| **Kartu hadiah** | ✅ | ✅ | ⚠️ Plugin | ❌ | ✅ |
| **Zona pengiriman** | ✅ Harga per zona | ✅ | ⚠️ Plugin | ❌ | ⚠️ |
| **Loyalty/Cashback** | ✅ Poin + cashback | ❌ | ⚠️ Plugin | ❌ | ❌ |
| **Sistem referral** | ✅ | ❌ | ⚠️ Plugin | ❌ | ❌ |
| **Harga dinamis** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Sistem sewa** | ✅ | ❌ | ⚠️ Plugin | ❌ | ❌ |
| **CMS/Blog** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **17 bahasa** | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |
| **Self-hosted** | ✅ Docker | ❌ | ✅ | ✅ | ✅ |
| **Open Source** | ✅ AGPL-3.0 | ❌ | ✅ GPL | ✅ MIT | ✅ BSD |
| **Harga** | 🟢 Gratis | 💰 $39-399/bln | 🟢 Gratis | 🟢 Gratis | 🟢 Gratis |

## Mulai Cepat

### Docker (Direkomendasikan)

> **Prasyarat**: [Docker](https://docs.docker.com/get-docker/) dan [Docker Compose](https://docs.docker.com/compose/install/)

```bash
git clone https://github.com/vasty-shop/vasty-shop.git
cd vasty-shop

# 1. Buat file env dari contoh
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. (Opsional) Jalankan wizard setup untuk memilih provider secara interaktif
docker compose --profile setup run --rm setup

# 3. Jalankan semua layanan (PostgreSQL, Redis, Backend, Frontend)
docker compose up --build

# 4. Jalankan migrasi database (di terminal baru)
docker compose exec backend npm run migrate

# 5. (Opsional) Seed database
docker compose exec backend npm run seed
```

Aplikasi akan tersedia di:

| Layanan | URL |
|---------|-----|
| **Frontend** | http://localhost:5186 |
| **Backend API** | http://localhost:4005/api/v1 |
| **Dokumen API (Swagger)** | http://localhost:4005/api/v1/docs |
| **Health (Provider)** | http://localhost:4005/api/v1/health/providers |
| **WebSocket** | http://localhost:3002 |

#### Kredensial Admin Default

| Field | Nilai |
|-------|-------|
| **Email** | `admin@vasty.shop` |
| **Password** | `admin123` |

> **Catatan:** Segera ubah password admin di produksi.

#### Layanan Docker

| Layanan | Image | Port |
|---------|-------|------|
| **PostgreSQL** | postgres:16-alpine | 5433 |
| **Redis** | redis:7-alpine | 6379 |
| **Backend** | node:20-alpine (NestJS) | 4005, 3002 |
| **Frontend** | node:20-alpine (Vite) | 5186 |

#### Perintah Berguna

```bash
# Hentikan semua layanan
docker compose down

# Hentikan dan hapus semua data
docker compose down -v

# Lihat log backend
docker compose logs -f backend

# Jalankan migrasi
docker compose exec backend npm run migrate

# Seed database
docker compose exec backend npm run seed

# Akses shell PostgreSQL
docker compose exec postgres psql -U postgres -d vasty_shop_dev

# Jalankan wizard setup
docker compose --profile setup run --rm setup

# Mulai dengan layanan opsional (misalnya Meilisearch, MinIO)
docker compose --profile meilisearch --profile minio up -d
```

### Pengembangan Lokal (tanpa Docker)

> **Prasyarat**: Node.js 20+, PostgreSQL 16+, Redis 7+

```bash
git clone https://github.com/vasty-shop/vasty-shop.git
cd vasty-shop

# Backend
cd backend
cp .env.example .env
# Edit .env: atur DATABASE_HOST=localhost dan REDIS_HOST=localhost
npm install
npm run migrate
npm run start:dev

# Frontend (terminal baru)
cd frontend
cp .env.example .env
npm install --legacy-peer-deps
npm run dev
```

## Fitur

### Inti E-Commerce
- **Produk** -- Varian, atribut, inventaris, produk digital, impor massal
- **Pesanan** -- Pembagian pesanan multi-vendor, pelacakan status, pengembalian dana
- **Keranjang** -- Keranjang persisten, checkout tamu, multi-mata uang
- **Kategori** -- Kategori bersarang dengan filter dan pencarian
- **Ulasan** -- Rating, foto, badge pembelian terverifikasi

### Pembayaran & Keuangan
- **Stripe Connect** -- Pencairan otomatis ke vendor dengan biaya platform
- **PayPal** -- Gateway pembayaran alternatif
- **Dompet** -- Saldo pelanggan dengan top-up dan pengeluaran
- **Escrow** -- Penahanan pembayaran aman hingga pengiriman
- **Pencairan** -- Pencairan massal ke vendor, pelacakan komisi
- **Pengeluaran** -- Pelacakan pengeluaran bisnis untuk vendor

### Pemasaran & Pertumbuhan
- **Flash sale** -- Penawaran terbatas waktu dengan hitung mundur
- **Kampanye** -- Kampanye promosi dengan penjadwalan
- **Kupon** -- Persentase, nominal tetap, ongkir gratis
- **Kartu hadiah** -- Kartu hadiah digital dengan saldo
- **Loyalty** -- Sistem poin dengan cashback
- **Referral** -- Program referral pelanggan
- **Harga surge** -- Harga dinamis berdasarkan permintaan

### Operasional
- **POS** -- Point-of-sale dengan pemindai barcode
- **Pengiriman** -- Harga per zona, pelacakan, mitra pengiriman
- **Paket** -- Manajemen pengiriman paket
- **Pajak** -- Kalkulasi pajak per wilayah
- **Ekspor** -- Ekspor data CSV/Excel

### Platform
- **17 bahasa** -- AR, BN, DE, EN, ES, FR, HI, ID, IT, JA, KO, MS, PT, RU, TR, UR, ZH
- **AI** -- Rekomendasi produk, pencarian cerdas
- **Blog/CMS** -- Manajemen konten
- **Chat** -- Pesan real-time pelanggan-vendor
- **Notifikasi** -- Email, WebSocket, push
- **Dasbor Admin** -- Analitik platform lengkap

## Tech Stack

| Layer | Teknologi |
|-------|------------|
| **Backend** | NestJS, TypeScript, PostgreSQL (raw SQL), Redis, Socket.io |
| **Frontend** | React, Vite, TypeScript, Tailwind CSS, Radix UI, i18next |
| **Penyimpanan** | Pluggable: local-fs, S3, Cloudflare R2, MinIO, B2, GCS, Azure |
| **Pembayaran** | Stripe, Stripe Connect, PayPal |
| **AI** | OpenAI, Anthropic, Gemini, Groq, Ollama |
| **Pencarian** | PostgreSQL (pg-trgm), Meilisearch, Typesense |

## Struktur Proyek

```
vasty-shop/
├── backend/              # NestJS API (69 modul, 80+ tabel)
│   ├── src/modules/      # products, orders, cart, payments, delivery,
│   │                     # campaigns, coupons, flash-sales, gift-cards,
│   │                     # loyalty, referral, pos, ai, blog, chat, ...
│   └── migrations/       # Migrasi PostgreSQL
├── frontend/             # React + Vite + Tailwind (17 bahasa)
├── shared/               # Tipe dan utilitas bersama
└── .github/workflows/    # CI/CD
```

## Kontributor

Terima kasih kepada semua orang luar biasa yang telah berkontribusi ke Vasty Shop! 🎉

<a href="https://github.com/vasty-shop/vasty-shop/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=vasty-shop/vasty-shop&anon=1&max=100&columns=10" />
</a>

Ingin melihat wajah Anda di sini? Baca [Panduan Kontribusi](CONTRIBUTING.md) kami dan mulai berkontribusi hari ini!

## Aktivitas Proyek

<p align="center">
  <img src="https://img.shields.io/github/stars/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=yellow" alt="Stars">
  <img src="https://img.shields.io/github/forks/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=blue" alt="Forks">
  <img src="https://img.shields.io/github/contributors/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=green" alt="Contributors">
  <img src="https://img.shields.io/github/last-commit/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=orange" alt="Last Commit">
</p>

## Keamanan

Harap laporkan kerentanan secara bertanggung jawab. Lihat [SECURITY.md](SECURITY.md).

## Lisensi

Proyek ini dilisensikan di bawah **Lisensi AGPL-3.0** — lihat file [LICENSE](LICENSE) untuk detailnya.

Artinya Anda bebas menggunakan, memodifikasi, dan mendistribusikan perangkat lunak ini, tetapi setiap modifikasi juga harus dibuat open source di bawah lisensi yang sama.

Copyright 2025 Vasty Shop Contributors.
