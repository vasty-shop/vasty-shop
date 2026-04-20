<p align="center">
  <a href="https://vasty.shop">
    <img src="frontend/public/vasty-logo-small.png" alt="Vasty Shop" width="80">
  </a>
  <h1 align="center">Vasty Shop</h1>
  <p align="center">
    <strong>منصة تجارة إلكترونية متعددة البائعين مفتوحة المصدر</strong>
  </p>
  <p align="center">
    منصة سوق إلكتروني بمستوى المؤسسات مع توصيات الذكاء الاصطناعي، تحويلات Stripe Connect للبائعين، العروض السريعة، نقطة البيع، إدارة التوصيل، ودعم 17 لغة.
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
  <a href="https://vasty.shop">الموقع</a> |
  <a href="#البدء-السريع">البدء السريع</a> |
  <a href="#الميزات">الميزات</a> |
  <a href="https://github.com/vasty-shop/vasty-shop/discussions">نقاشات</a> |
  <a href="CONTRIBUTING.md">المساهمة</a>
</p>

<p align="center">
  <a href="./README.md">English</a> | <a href="./README_JA.md">日本語</a> | <a href="./README_ZH.md">中文</a> | <a href="./README_KO.md">한국어</a> | <a href="./README_ID.md">Bahasa Indonesia</a> | <a href="./README_MS.md">Bahasa Melayu</a> | <a href="./README_ES.md">Español</a> | <a href="./README_FR.md">Français</a> | <a href="./README_DE.md">Deutsch</a> | <a href="./README_IT.md">Italiano</a> | <a href="./README_PT-BR.md">Português</a> | <a href="./README_AR.md">العربية</a> | <a href="./README_TR.md">Türkçe</a> | <a href="./README_HI.md">हिन्दी</a> | <a href="./README_BN.md">বাংলা</a> | <a href="./README_UR.md">اردو</a> | <a href="./README_RU.md">Русский</a>
</p>

---

## ما هو Vasty Shop؟

Vasty Shop هو منصة مفتوحة المصدر لبناء أسواق التجارة الإلكترونية متعددة البائعين. ابنِ سوقك الخاص مثل Amazon أو Shopify أو Etsy مع توصيات مدعومة بالذكاء الاصطناعي، تحويلات تلقائية للبائعين عبر Stripe Connect، عروض سريعة، نظام نقطة بيع، وإدارة التوصيل — كل ذلك قابل للاستضافة الذاتية.

## لماذا Vasty Shop؟ (مقارنة)

| الميزة | Vasty Shop | Shopify | WooCommerce | Medusa | Saleor |
|---------|-----------|---------|-------------|--------|--------|
| **تعدد البائعين** | ✅ مدمج | 💰 إضافة | ⚠️ يتطلب مكوّناً | ❌ | ❌ |
| **تحويلات Stripe Connect** | ✅ تقسيم تلقائي | ✅ Shopify Payments | ⚠️ مكوّن | ❌ | ⚠️ مكوّن |
| **توصيات AI** | ✅ مدمج | 💰 يحتاج تطبيقاً | ⚠️ مكوّن | ❌ | ❌ |
| **العروض السريعة** | ✅ عدّاد + مخزون | ✅ | ⚠️ مكوّن | ❌ | ❌ |
| **نظام POS** | ✅ مدمج + باركود | ✅ Shopify POS | ⚠️ مكوّن | ❌ | ❌ |
| **بطاقات الهدايا** | ✅ | ✅ | ⚠️ مكوّن | ❌ | ✅ |
| **مناطق التوصيل** | ✅ تسعير بالمنطقة | ✅ | ⚠️ مكوّن | ❌ | ⚠️ |
| **الولاء/الكاش باك** | ✅ نقاط + كاش باك | ❌ | ⚠️ مكوّن | ❌ | ❌ |
| **نظام الإحالة** | ✅ | ❌ | ⚠️ مكوّن | ❌ | ❌ |
| **تسعير ديناميكي** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **نظام التأجير** | ✅ | ❌ | ⚠️ مكوّن | ❌ | ❌ |
| **CMS/مدونة** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **17 لغة** | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |
| **استضافة ذاتية** | ✅ Docker | ❌ | ✅ | ✅ | ✅ |
| **مفتوح المصدر** | ✅ AGPL-3.0 | ❌ | ✅ GPL | ✅ MIT | ✅ BSD |
| **السعر** | 🟢 مجاني | 💰 $39-399/شهر | 🟢 مجاني | 🟢 مجاني | 🟢 مجاني |

## البدء السريع

### Docker (موصى به)

> **المتطلبات**: [Docker](https://docs.docker.com/get-docker/) و [Docker Compose](https://docs.docker.com/compose/install/)

```bash
git clone https://github.com/vasty-shop/vasty-shop.git
cd vasty-shop

# 1. إنشاء ملفات env من الأمثلة
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. (اختياري) تشغيل معالج الإعداد لاختيار المزودين تفاعلياً
docker compose --profile setup run --rm setup

# 3. تشغيل جميع الخدمات (PostgreSQL، Redis، Backend، Frontend)
docker compose up --build

# 4. تشغيل ترحيلات قاعدة البيانات (في محطة طرفية جديدة)
docker compose exec backend npm run migrate

# 5. (اختياري) تعبئة قاعدة البيانات
docker compose exec backend npm run seed
```

التطبيق سيكون متاحاً على:

| الخدمة | URL |
|---------|-----|
| **الواجهة الأمامية** | http://localhost:5186 |
| **Backend API** | http://localhost:4005/api/v1 |
| **توثيق API (Swagger)** | http://localhost:4005/api/v1/docs |
| **الصحة (المزودون)** | http://localhost:4005/api/v1/health/providers |
| **WebSocket** | http://localhost:3002 |

#### بيانات المسؤول الافتراضية

| الحقل | القيمة |
|-------|-------|
| **البريد** | `admin@vasty.shop` |
| **كلمة المرور** | `admin123` |

> **ملاحظة:** قم بتغيير كلمة مرور المسؤول فوراً في الإنتاج.

#### خدمات Docker

| الخدمة | الصورة | المنفذ |
|---------|-------|------|
| **PostgreSQL** | postgres:16-alpine | 5433 |
| **Redis** | redis:7-alpine | 6379 |
| **Backend** | node:20-alpine (NestJS) | 4005, 3002 |
| **Frontend** | node:20-alpine (Vite) | 5186 |

#### أوامر مفيدة

```bash
# إيقاف جميع الخدمات
docker compose down

# إيقاف وإزالة جميع البيانات
docker compose down -v

# عرض سجلات backend
docker compose logs -f backend

# تشغيل الترحيلات
docker compose exec backend npm run migrate

# تعبئة قاعدة البيانات
docker compose exec backend npm run seed

# الوصول إلى صدفة PostgreSQL
docker compose exec postgres psql -U postgres -d vasty_shop_dev

# تشغيل معالج الإعداد
docker compose --profile setup run --rm setup

# البدء مع خدمات اختيارية (مثل Meilisearch، MinIO)
docker compose --profile meilisearch --profile minio up -d
```

### التطوير المحلي (بدون Docker)

> **المتطلبات**: Node.js 20+، PostgreSQL 16+، Redis 7+

```bash
git clone https://github.com/vasty-shop/vasty-shop.git
cd vasty-shop

# Backend
cd backend
cp .env.example .env
# تحرير .env: اضبط DATABASE_HOST=localhost و REDIS_HOST=localhost
npm install
npm run migrate
npm run start:dev

# Frontend (محطة طرفية جديدة)
cd frontend
cp .env.example .env
npm install --legacy-peer-deps
npm run dev
```

## الميزات

### جوهر التجارة الإلكترونية
- **المنتجات** -- متغيرات، سمات، مخزون، منتجات رقمية، استيراد بالجملة
- **الطلبات** -- تقسيم متعدد البائعين، تتبع الحالة، استرداد
- **السلة** -- سلة دائمة، دفع كضيف، تعدد العملات
- **الفئات** -- فئات متداخلة مع فلاتر وبحث
- **التقييمات** -- تقييمات، صور، شارات شراء موثق

### المدفوعات والتمويل
- **Stripe Connect** -- دفعات تلقائية للبائعين مع عمولة المنصة
- **PayPal** -- بوابة دفع بديلة
- **المحفظة** -- رصيد العميل مع شحن وإنفاق
- **الضمان (Escrow)** -- حفظ الدفع حتى التوصيل
- **التوزيع** -- دفعات جماعية للبائعين، تتبع العمولة
- **النفقات** -- تتبع نفقات الأعمال للبائعين

### التسويق والنمو
- **العروض السريعة** -- عروض محدودة زمنياً بعدّاد
- **الحملات** -- حملات ترويجية مجدولة
- **الكوبونات** -- نسبة، مبلغ ثابت، شحن مجاني
- **بطاقات الهدايا** -- بطاقات رقمية برصيد
- **الولاء** -- نظام نقاط مع كاش باك
- **الإحالة** -- برنامج إحالة العملاء
- **التسعير الديناميكي** -- أسعار بناءً على الطلب

### العمليات
- **POS** -- نقطة بيع مع ماسح باركود
- **التوصيل** -- تسعير بالمنطقة، تتبع، شركاء توصيل
- **الطرود** -- إدارة توصيل الطرود
- **الضرائب** -- احتساب الضرائب حسب المنطقة
- **التصدير** -- تصدير CSV/Excel

### المنصة
- **17 لغة** -- AR, BN, DE, EN, ES, FR, HI, ID, IT, JA, KO, MS, PT, RU, TR, UR, ZH
- **AI** -- توصيات منتجات، بحث ذكي
- **Blog/CMS** -- إدارة المحتوى
- **المحادثة** -- رسائل فورية بين العميل والبائع
- **الإشعارات** -- بريد، WebSocket، دفع
- **لوحة المسؤول** -- تحليلات كاملة للمنصة

## التقنيات المستخدمة

| الطبقة | التقنية |
|-------|------------|
| **Backend** | NestJS، TypeScript، PostgreSQL (raw SQL)، Redis، Socket.io |
| **Frontend** | React، Vite، TypeScript، Tailwind CSS، Radix UI، i18next |
| **التخزين** | قابل للتوصيل: local-fs، S3، Cloudflare R2، MinIO، B2، GCS، Azure |
| **المدفوعات** | Stripe، Stripe Connect، PayPal |
| **AI** | OpenAI، Anthropic، Gemini، Groq، Ollama |
| **البحث** | PostgreSQL (pg-trgm)، Meilisearch، Typesense |

## هيكل المشروع

```
vasty-shop/
├── backend/              # NestJS API (69 وحدة، 80+ جدول)
│   ├── src/modules/      # products, orders, cart, payments, delivery,
│   │                     # campaigns, coupons, flash-sales, gift-cards,
│   │                     # loyalty, referral, pos, ai, blog, chat, ...
│   └── migrations/       # ترحيلات PostgreSQL
├── frontend/             # React + Vite + Tailwind (17 لغة)
├── shared/               # أنواع وأدوات مشتركة
└── .github/workflows/    # CI/CD
```

## المساهمون

شكراً لجميع الأشخاص الرائعين الذين ساهموا في Vasty Shop! 🎉

<a href="https://github.com/vasty-shop/vasty-shop/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=vasty-shop/vasty-shop&anon=1&max=100&columns=10" />
</a>

هل تريد رؤية وجهك هنا؟ اطلع على [دليل المساهمة](CONTRIBUTING.md) وابدأ المساهمة اليوم!

## نشاط المشروع

<p align="center">
  <img src="https://img.shields.io/github/stars/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=yellow" alt="Stars">
  <img src="https://img.shields.io/github/forks/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=blue" alt="Forks">
  <img src="https://img.shields.io/github/contributors/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=green" alt="Contributors">
  <img src="https://img.shields.io/github/last-commit/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=orange" alt="Last Commit">
</p>

## الأمان

يرجى الإبلاغ عن الثغرات بمسؤولية. انظر [SECURITY.md](SECURITY.md).

## الترخيص

هذا المشروع مرخص بموجب **ترخيص AGPL-3.0** — انظر ملف [LICENSE](LICENSE) للتفاصيل.

هذا يعني أنه يمكنك استخدام وتعديل وتوزيع هذا البرنامج بحرية، ولكن يجب أيضاً نشر أي تعديلات كمفتوحة المصدر تحت نفس الترخيص.

Copyright 2025 Vasty Shop Contributors.
