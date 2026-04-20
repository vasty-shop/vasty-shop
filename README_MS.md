<p align="center">
  <a href="https://vasty.shop">
    <img src="frontend/public/vasty-logo-small.png" alt="Vasty Shop" width="80">
  </a>
  <h1 align="center">Vasty Shop</h1>
  <p align="center">
    <strong>Pasaran e-dagang pelbagai vendor sumber terbuka</strong>
  </p>
  <p align="center">
    Pasaran bertaraf enterprise dengan cadangan AI, pembayaran Stripe Connect kepada vendor, jualan kilat, POS, pengurusan penghantaran, dan sokongan 17 bahasa.
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
  <a href="https://vasty.shop">Laman web</a> |
  <a href="#mula-pantas">Mula Pantas</a> |
  <a href="#ciri-ciri">Ciri-ciri</a> |
  <a href="https://github.com/vasty-shop/vasty-shop/discussions">Perbincangan</a> |
  <a href="CONTRIBUTING.md">Menyumbang</a>
</p>

<p align="center">
  <a href="./README.md">English</a> | <a href="./README_JA.md">日本語</a> | <a href="./README_ZH.md">中文</a> | <a href="./README_KO.md">한국어</a> | <a href="./README_ID.md">Bahasa Indonesia</a> | <a href="./README_MS.md">Bahasa Melayu</a> | <a href="./README_ES.md">Español</a> | <a href="./README_FR.md">Français</a> | <a href="./README_DE.md">Deutsch</a> | <a href="./README_IT.md">Italiano</a> | <a href="./README_PT-BR.md">Português</a> | <a href="./README_AR.md">العربية</a> | <a href="./README_TR.md">Türkçe</a> | <a href="./README_HI.md">हिन्दी</a> | <a href="./README_BN.md">বাংলা</a> | <a href="./README_UR.md">اردو</a> | <a href="./README_RU.md">Русский</a>
</p>

---

## Apakah Vasty Shop?

Vasty Shop ialah platform pasaran e-dagang pelbagai vendor sumber terbuka. Bina pasaran anda sendiri seperti Amazon, Shopify atau Etsy dengan cadangan berkuasa AI, pembayaran automatik kepada vendor melalui Stripe Connect, jualan kilat, sistem POS dan pengurusan penghantaran — semuanya boleh di-host sendiri.

## Kenapa Vasty Shop? (Perbandingan)

| Ciri | Vasty Shop | Shopify | WooCommerce | Medusa | Saleor |
|---------|-----------|---------|-------------|--------|--------|
| **Pelbagai vendor** | ✅ Terbina | 💰 Add-on | ⚠️ Plugin diperlukan | ❌ | ❌ |
| **Pembayaran Stripe Connect** | ✅ Pembahagian auto | ✅ Shopify Payments | ⚠️ Plugin | ❌ | ⚠️ Plugin |
| **Cadangan AI** | ✅ Terbina | 💰 Perlu app | ⚠️ Plugin | ❌ | ❌ |
| **Jualan kilat** | ✅ Pemasa + stok | ✅ | ⚠️ Plugin | ❌ | ❌ |
| **Sistem POS** | ✅ Terbina + kod bar | ✅ Shopify POS | ⚠️ Plugin | ❌ | ❌ |
| **Kad hadiah** | ✅ | ✅ | ⚠️ Plugin | ❌ | ✅ |
| **Zon penghantaran** | ✅ Harga mengikut zon | ✅ | ⚠️ Plugin | ❌ | ⚠️ |
| **Kesetiaan/Cashback** | ✅ Mata + cashback | ❌ | ⚠️ Plugin | ❌ | ❌ |
| **Sistem rujukan** | ✅ | ❌ | ⚠️ Plugin | ❌ | ❌ |
| **Harga dinamik** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Sistem sewaan** | ✅ | ❌ | ⚠️ Plugin | ❌ | ❌ |
| **CMS/Blog** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **17 bahasa** | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |
| **Self-hosted** | ✅ Docker | ❌ | ✅ | ✅ | ✅ |
| **Sumber Terbuka** | ✅ AGPL-3.0 | ❌ | ✅ GPL | ✅ MIT | ✅ BSD |
| **Harga** | 🟢 Percuma | 💰 $39-399/bln | 🟢 Percuma | 🟢 Percuma | 🟢 Percuma |

## Mula Pantas

### Docker (Disyorkan)

> **Prasyarat**: [Docker](https://docs.docker.com/get-docker/) dan [Docker Compose](https://docs.docker.com/compose/install/)

```bash
git clone https://github.com/vasty-shop/vasty-shop.git
cd vasty-shop

# 1. Cipta fail env daripada contoh
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. (Pilihan) Jalankan wizard persediaan untuk memilih penyedia secara interaktif
docker compose --profile setup run --rm setup

# 3. Mulakan semua perkhidmatan (PostgreSQL, Redis, Backend, Frontend)
docker compose up --build

# 4. Jalankan migrasi pangkalan data (dalam terminal baru)
docker compose exec backend npm run migrate

# 5. (Pilihan) Semai pangkalan data
docker compose exec backend npm run seed
```

Aplikasi akan tersedia di:

| Perkhidmatan | URL |
|---------|-----|
| **Frontend** | http://localhost:5186 |
| **Backend API** | http://localhost:4005/api/v1 |
| **Dokumentasi API (Swagger)** | http://localhost:4005/api/v1/docs |
| **Health (Penyedia)** | http://localhost:4005/api/v1/health/providers |
| **WebSocket** | http://localhost:3002 |

#### Kelayakan Admin Lalai

| Medan | Nilai |
|-------|-------|
| **E-mel** | `admin@vasty.shop` |
| **Kata Laluan** | `admin123` |

> **Nota:** Tukar kata laluan admin serta-merta dalam pengeluaran.

#### Perkhidmatan Docker

| Perkhidmatan | Imej | Port |
|---------|-------|------|
| **PostgreSQL** | postgres:16-alpine | 5432 |
| **Redis** | redis:7-alpine | 6379 |
| **Backend** | node:20-alpine (NestJS) | 4005, 3002 |
| **Frontend** | node:20-alpine (Vite) | 5186 |

#### Arahan Berguna

```bash
# Henti semua perkhidmatan
docker compose down

# Henti dan padam semua data
docker compose down -v

# Lihat log backend
docker compose logs -f backend

# Jalankan migrasi
docker compose exec backend npm run migrate

# Semai pangkalan data
docker compose exec backend npm run seed

# Akses shell PostgreSQL
docker compose exec postgres psql -U postgres -d vasty_shop_dev

# Jalankan wizard persediaan
docker compose --profile setup run --rm setup

# Mulakan dengan perkhidmatan pilihan (cth. Meilisearch, MinIO)
docker compose --profile meilisearch --profile minio up -d
```

### Pembangunan Tempatan (tanpa Docker)

> **Prasyarat**: Node.js 20+, PostgreSQL 16+, Redis 7+

```bash
git clone https://github.com/vasty-shop/vasty-shop.git
cd vasty-shop

# Backend
cd backend
cp .env.example .env
# Sunting .env: tetapkan DATABASE_HOST=localhost dan REDIS_HOST=localhost
npm install
npm run migrate
npm run start:dev

# Frontend (terminal baru)
cd frontend
cp .env.example .env
npm install --legacy-peer-deps
npm run dev
```

## Ciri-ciri

### Teras E-Dagang
- **Produk** -- Varian, atribut, inventori, produk digital, import pukal
- **Pesanan** -- Pembahagian pesanan pelbagai vendor, penjejakan status, bayaran balik
- **Troli** -- Troli berterusan, checkout tetamu, pelbagai mata wang
- **Kategori** -- Kategori bersarang dengan penapis dan carian
- **Ulasan** -- Penilaian, foto, lencana pembelian disahkan

### Pembayaran & Kewangan
- **Stripe Connect** -- Pembayaran auto kepada vendor dengan yuran platform
- **PayPal** -- Gerbang pembayaran alternatif
- **Dompet** -- Baki pelanggan dengan tambah nilai dan belanja
- **Escrow** -- Penahanan pembayaran selamat sehingga penghantaran
- **Pengeluaran** -- Pembayaran pukal kepada vendor, penjejakan komisen
- **Perbelanjaan** -- Penjejakan perbelanjaan perniagaan untuk vendor

### Pemasaran & Pertumbuhan
- **Jualan kilat** -- Tawaran masa terhad dengan kira detik
- **Kempen** -- Kempen promosi dengan penjadualan
- **Kupon** -- Peratusan, tetap, penghantaran percuma
- **Kad hadiah** -- Kad hadiah digital dengan baki
- **Kesetiaan** -- Sistem mata dengan cashback
- **Rujukan** -- Program rujukan pelanggan
- **Harga surge** -- Harga dinamik berdasarkan permintaan

### Operasi
- **POS** -- Point-of-sale dengan pengimbas kod bar
- **Penghantaran** -- Harga zon, penjejakan, rakan penghantaran
- **Bungkusan** -- Pengurusan penghantaran bungkusan
- **Cukai** -- Pengiraan cukai mengikut wilayah
- **Eksport** -- Eksport data CSV/Excel

### Platform
- **17 bahasa** -- AR, BN, DE, EN, ES, FR, HI, ID, IT, JA, KO, MS, PT, RU, TR, UR, ZH
- **AI** -- Cadangan produk, carian pintar
- **Blog/CMS** -- Pengurusan kandungan
- **Sembang** -- Pemesejan masa nyata pelanggan-vendor
- **Notifikasi** -- E-mel, WebSocket, tolakan
- **Papan Pemuka Admin** -- Analitis platform lengkap

## Tindanan Teknologi

| Lapisan | Teknologi |
|-------|------------|
| **Backend** | NestJS, TypeScript, PostgreSQL (raw SQL), Redis, Socket.io |
| **Frontend** | React, Vite, TypeScript, Tailwind CSS, Radix UI, i18next |
| **Storan** | Boleh pasang: local-fs, S3, Cloudflare R2, MinIO, B2, GCS, Azure |
| **Pembayaran** | Stripe, Stripe Connect, PayPal |
| **AI** | OpenAI (cadangan, carian) |
| **Carian** | Qdrant (vektor), PostgreSQL (teks penuh) |

## Struktur Projek

```
vasty-shop/
├── backend/              # API NestJS (53 modul, 67 jadual)
│   ├── src/modules/      # products, orders, cart, payments, delivery,
│   │                     # campaigns, coupons, flash-sales, gift-cards,
│   │                     # loyalty, referral, pos, ai, blog, chat, ...
│   └── migrations/       # Migrasi PostgreSQL
├── frontend/             # React + Vite + Tailwind (17 bahasa)
├── shared/               # Jenis dan utiliti dikongsi
└── .github/workflows/    # CI/CD
```

## Penyumbang

Terima kasih kepada semua orang yang hebat yang telah menyumbang kepada Vasty Shop! 🎉

<a href="https://github.com/vasty-shop/vasty-shop/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=vasty-shop/vasty-shop&anon=1&max=100&columns=10" />
</a>

Mahu melihat wajah anda di sini? Lihat [Panduan Menyumbang](CONTRIBUTING.md) kami dan mula menyumbang hari ini!

## Aktiviti Projek

<p align="center">
  <img src="https://img.shields.io/github/stars/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=yellow" alt="Stars">
  <img src="https://img.shields.io/github/forks/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=blue" alt="Forks">
  <img src="https://img.shields.io/github/contributors/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=green" alt="Contributors">
  <img src="https://img.shields.io/github/last-commit/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=orange" alt="Last Commit">
</p>

## Keselamatan

Sila laporkan kelemahan dengan bertanggungjawab. Lihat [SECURITY.md](SECURITY.md).

## Lesen

Projek ini dilesenkan di bawah **Lesen AGPL-3.0** — lihat fail [LICENSE](LICENSE) untuk maklumat lanjut.

Ini bermaksud anda boleh menggunakan, mengubah suai dan mengedarkan perisian ini secara bebas, tetapi sebarang pengubahsuaian juga mesti dikeluarkan sebagai sumber terbuka di bawah lesen yang sama.

Copyright 2025 Vasty Shop Contributors.
