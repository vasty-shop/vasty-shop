<p align="center">
  <a href="https://vasty.shop">
    <img src="frontend/public/vasty-logo-small.png" alt="Vasty Shop" width="80">
  </a>
  <h1 align="center">Vasty Shop</h1>
  <p align="center">
    <strong>Açık kaynaklı çok satıcılı e-ticaret pazaryeri</strong>
  </p>
  <p align="center">
    Yapay zeka önerileri, Stripe Connect satıcı ödemeleri, flaş satışlar, POS, teslimat yönetimi ve 17 dil desteği ile kurumsal düzeyde pazaryeri.
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
  <a href="https://vasty.shop">Web sitesi</a> |
  <a href="#hızlı-başlangıç">Hızlı Başlangıç</a> |
  <a href="#özellikler">Özellikler</a> |
  <a href="https://github.com/vasty-shop/vasty-shop/discussions">Tartışmalar</a> |
  <a href="CONTRIBUTING.md">Katkı</a>
</p>

<p align="center">
  <a href="./README.md">English</a> | <a href="./README_JA.md">日本語</a> | <a href="./README_ZH.md">中文</a> | <a href="./README_KO.md">한국어</a> | <a href="./README_ID.md">Bahasa Indonesia</a> | <a href="./README_MS.md">Bahasa Melayu</a> | <a href="./README_ES.md">Español</a> | <a href="./README_FR.md">Français</a> | <a href="./README_DE.md">Deutsch</a> | <a href="./README_IT.md">Italiano</a> | <a href="./README_PT-BR.md">Português</a> | <a href="./README_AR.md">العربية</a> | <a href="./README_TR.md">Türkçe</a> | <a href="./README_HI.md">हिन्दी</a> | <a href="./README_BN.md">বাংলা</a> | <a href="./README_UR.md">اردو</a> | <a href="./README_RU.md">Русский</a>
</p>

---

## Vasty Shop Nedir?

Vasty Shop, açık kaynaklı bir çok satıcılı e-ticaret pazaryeri platformudur. Amazon, Shopify veya Etsy gibi kendi pazaryerinizi yapay zeka destekli öneriler, Stripe Connect ile satıcıya otomatik ödemeler, flaş satışlar, POS sistemi ve teslimat yönetimi ile oluşturun — hepsi kendi sunucunuzda barındırılabilir.

## Neden Vasty Shop? (Karşılaştırma)

| Özellik | Vasty Shop | Shopify | WooCommerce | Medusa | Saleor |
|---------|-----------|---------|-------------|--------|--------|
| **Çok satıcılı** | ✅ Entegre | 💰 Eklenti | ⚠️ Eklenti gerekli | ❌ | ❌ |
| **Stripe Connect ödemeleri** | ✅ Otomatik paylaşım | ✅ Shopify Payments | ⚠️ Eklenti | ❌ | ⚠️ Eklenti |
| **AI önerileri** | ✅ Entegre | 💰 Uygulama gerekli | ⚠️ Eklenti | ❌ | ❌ |
| **Flaş satışlar** | ✅ Zamanlayıcı + stok | ✅ | ⚠️ Eklenti | ❌ | ❌ |
| **POS sistemi** | ✅ Entegre + barkod | ✅ Shopify POS | ⚠️ Eklenti | ❌ | ❌ |
| **Hediye kartları** | ✅ | ✅ | ⚠️ Eklenti | ❌ | ✅ |
| **Teslimat bölgeleri** | ✅ Bölge bazlı fiyat | ✅ | ⚠️ Eklenti | ❌ | ⚠️ |
| **Sadakat/Cashback** | ✅ Puan + cashback | ❌ | ⚠️ Eklenti | ❌ | ❌ |
| **Referans sistemi** | ✅ | ❌ | ⚠️ Eklenti | ❌ | ❌ |
| **Dinamik fiyatlandırma** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Kiralama sistemi** | ✅ | ❌ | ⚠️ Eklenti | ❌ | ❌ |
| **CMS/Blog** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **17 dil** | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |
| **Kendi sunucuda** | ✅ Docker | ❌ | ✅ | ✅ | ✅ |
| **Açık kaynak** | ✅ AGPL-3.0 | ❌ | ✅ GPL | ✅ MIT | ✅ BSD |
| **Fiyat** | 🟢 Ücretsiz | 💰 $39-399/ay | 🟢 Ücretsiz | 🟢 Ücretsiz | 🟢 Ücretsiz |

## Hızlı Başlangıç

### Docker (Önerilen)

> **Ön koşullar**: [Docker](https://docs.docker.com/get-docker/) ve [Docker Compose](https://docs.docker.com/compose/install/)

```bash
git clone https://github.com/vasty-shop/vasty-shop.git
cd vasty-shop

# 1. Örneklerden env dosyalarını oluştur
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. (İsteğe bağlı) Sağlayıcıları etkileşimli seçmek için kurulum sihirbazını çalıştır
docker compose --profile setup run --rm setup

# 3. Tüm servisleri başlat (PostgreSQL, Redis, Backend, Frontend)
docker compose up --build

# 4. Veritabanı migrasyonlarını çalıştır (yeni bir terminalde)
docker compose exec backend npm run migrate

# 5. (İsteğe bağlı) Veritabanını seed et
docker compose exec backend npm run seed
```

Uygulama şu adreslerde çalışacak:

| Servis | URL |
|---------|-----|
| **Frontend** | http://localhost:5186 |
| **Backend API** | http://localhost:4005/api/v1 |
| **API Dokümantasyonu (Swagger)** | http://localhost:4005/api/v1/docs |
| **Health (Sağlayıcılar)** | http://localhost:4005/api/v1/health/providers |
| **WebSocket** | http://localhost:3002 |

#### Varsayılan Yönetici Kimlik Bilgileri

| Alan | Değer |
|-------|-------|
| **E-posta** | `admin@vasty.shop` |
| **Şifre** | `admin123` |

> **Not:** Üretimde yönetici şifresini hemen değiştirin.

#### Docker Servisleri

| Servis | İmaj | Port |
|---------|-------|------|
| **PostgreSQL** | postgres:16-alpine | 5433 |
| **Redis** | redis:7-alpine | 6379 |
| **Backend** | node:20-alpine (NestJS) | 4005, 3002 |
| **Frontend** | node:20-alpine (Vite) | 5186 |

#### Yararlı Komutlar

```bash
# Tüm servisleri durdur
docker compose down

# Tüm verileri silerek durdur
docker compose down -v

# Backend loglarını gör
docker compose logs -f backend

# Migrasyonları çalıştır
docker compose exec backend npm run migrate

# Veritabanını seed et
docker compose exec backend npm run seed

# PostgreSQL kabuğuna eriş
docker compose exec postgres psql -U postgres -d vasty_shop_dev

# Kurulum sihirbazını çalıştır
docker compose --profile setup run --rm setup

# Opsiyonel servislerle başla (örn. Meilisearch, MinIO)
docker compose --profile meilisearch --profile minio up -d
```

### Yerel Geliştirme (Docker olmadan)

> **Ön koşullar**: Node.js 20+, PostgreSQL 16+, Redis 7+

```bash
git clone https://github.com/vasty-shop/vasty-shop.git
cd vasty-shop

# Backend
cd backend
cp .env.example .env
# .env'i düzenle: DATABASE_HOST=localhost ve REDIS_HOST=localhost ayarla
npm install
npm run migrate
npm run start:dev

# Frontend (yeni terminal)
cd frontend
cp .env.example .env
npm install --legacy-peer-deps
npm run dev
```

## Özellikler

### E-Ticaret Çekirdeği
- **Ürünler** -- Varyantlar, öznitelikler, stok, dijital ürünler, toplu içe aktarma
- **Siparişler** -- Çok satıcılı sipariş bölme, durum takibi, iade
- **Sepet** -- Kalıcı sepet, misafir ödemesi, çoklu para birimi
- **Kategoriler** -- Filtre ve arama ile iç içe kategoriler
- **Değerlendirmeler** -- Puan, fotoğraf, doğrulanmış alım rozetleri

### Ödemeler ve Finans
- **Stripe Connect** -- Platform komisyonlu otomatik satıcı ödemeleri
- **PayPal** -- Alternatif ödeme ağ geçidi
- **Cüzdan** -- Yükleme ve harcama için müşteri cüzdanı
- **Escrow** -- Teslimata kadar güvenli ödeme saklama
- **Dağıtım** -- Toplu satıcı ödemeleri, komisyon takibi
- **Giderler** -- Satıcılar için iş gideri takibi

### Pazarlama ve Büyüme
- **Flaş satışlar** -- Geri sayımlı zaman sınırlı teklifler
- **Kampanyalar** -- Zamanlamalı promosyon kampanyaları
- **Kuponlar** -- Yüzde, sabit tutar, ücretsiz kargo
- **Hediye kartları** -- Bakiyeli dijital hediye kartları
- **Sadakat** -- Cashback'li puan sistemi
- **Referans** -- Müşteri referans programı
- **Surge fiyatlandırma** -- Talebe göre dinamik fiyatlar

### Operasyon
- **POS** -- Barkod tarayıcılı satış noktası
- **Teslimat** -- Bölge bazlı fiyat, takip, teslimat ortakları
- **Koli** -- Koli teslimat yönetimi
- **Vergi** -- Bölgeye göre vergi hesaplama
- **Dışa aktarma** -- CSV/Excel veri dışa aktarma

### Platform
- **17 dil** -- AR, BN, DE, EN, ES, FR, HI, ID, IT, JA, KO, MS, PT, RU, TR, UR, ZH
- **AI** -- Ürün önerileri, akıllı arama
- **Blog/CMS** -- İçerik yönetimi
- **Sohbet** -- Müşteri-satıcı gerçek zamanlı mesajlaşma
- **Bildirimler** -- E-posta, WebSocket, push
- **Yönetici Paneli** -- Tam platform analitiği

## Teknoloji Yığını

| Katman | Teknoloji |
|-------|------------|
| **Backend** | NestJS, TypeScript, PostgreSQL (raw SQL), Redis, Socket.io |
| **Frontend** | React, Vite, TypeScript, Tailwind CSS, Radix UI, i18next |
| **Depolama** | Takılabilir: local-fs, S3, Cloudflare R2, MinIO, B2, GCS, Azure |
| **Ödemeler** | Stripe, Stripe Connect, PayPal, bKash |
| **AI** | OpenAI, Anthropic, Gemini, Groq, Ollama |
| **Arama** | PostgreSQL (pg-trgm), Meilisearch, Typesense |

## Proje Yapısı

```
vasty-shop/
├── backend/              # NestJS API (69 modül, 80+ tablo)
│   ├── src/modules/      # products, orders, cart, payments, delivery,
│   │                     # campaigns, coupons, flash-sales, gift-cards,
│   │                     # loyalty, referral, pos, ai, blog, chat, ...
│   └── migrations/       # PostgreSQL migrasyonları
├── frontend/             # React + Vite + Tailwind (17 dil)
├── shared/               # Paylaşılan tipler ve yardımcılar
└── .github/workflows/    # CI/CD
```

## Katkıda Bulunanlar

Vasty Shop'a katkıda bulunan tüm harika insanlara teşekkürler! 🎉

<a href="https://github.com/vasty-shop/vasty-shop/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=vasty-shop/vasty-shop&anon=1&max=100&columns=10" />
</a>

Yüzünüzü burada görmek ister misiniz? [Katkı Rehberimize](CONTRIBUTING.md) göz atın ve bugün katkıda bulunmaya başlayın!

## Proje Aktivitesi

<p align="center">
  <img src="https://img.shields.io/github/stars/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=yellow" alt="Stars">
  <img src="https://img.shields.io/github/forks/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=blue" alt="Forks">
  <img src="https://img.shields.io/github/contributors/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=green" alt="Contributors">
  <img src="https://img.shields.io/github/last-commit/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=orange" alt="Last Commit">
</p>

## Güvenlik

Lütfen güvenlik açıklarını sorumlu şekilde bildirin. [SECURITY.md](SECURITY.md) dosyasına bakın.

## Lisans

Bu proje **AGPL-3.0 Lisansı** altında lisanslıdır — ayrıntılar için [LICENSE](LICENSE) dosyasına bakın.

Bu, yazılımı serbestçe kullanabileceğiniz, değiştirebileceğiniz ve dağıtabileceğiniz anlamına gelir, ancak herhangi bir değişiklik de aynı lisans altında açık kaynak olarak yayınlanmalıdır.

Copyright 2025 Vasty Shop Contributors.
