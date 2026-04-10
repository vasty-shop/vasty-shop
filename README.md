<p align="center">
  <a href="https://vasty.shop">
    <img src="frontend/public/vasty-logo-small.png" alt="Vasty Shop" width="80">
  </a>
  <h1 align="center">Vasty Shop</h1>
  <p align="center">
    <strong>Open-source multi-vendor e-commerce marketplace</strong>
  </p>
  <p align="center">
    Enterprise-grade marketplace with AI recommendations, Stripe Connect payouts, flash sales, POS, delivery management, and 17-language support.
  </p>
</p>

<p align="center">
  <a href="https://github.com/vasty-shop/vasty-shop/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License"></a>
  <a href="https://github.com/vasty-shop/vasty-shop/actions/workflows/ci.yml"><img src="https://github.com/vasty-shop/vasty-shop/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/vasty-shop/vasty-shop/stargazers"><img src="https://img.shields.io/github/stars/vasty-shop/vasty-shop?style=social" alt="Stars"></a>
  <a href="https://github.com/vasty-shop/vasty-shop/issues"><img src="https://img.shields.io/github/issues/vasty-shop/vasty-shop" alt="Issues"></a>
  <a href="https://github.com/vasty-shop/vasty-shop/pulls"><img src="https://img.shields.io/github/issues-pr/vasty-shop/vasty-shop" alt="PRs"></a>
</p>

<p align="center">
  <a href="https://vasty.shop">Website</a> |
  <a href="#quick-start">Quick Start</a> |
  <a href="#features">Features</a> |
  <a href="https://github.com/vasty-shop/vasty-shop/discussions">Discussions</a> |
  <a href="CONTRIBUTING.md">Contributing</a>
</p>

<p align="center">
  <a href="./README.md">English</a> |
  <a href="./README_JA.md">日本語</a> |
  <a href="./README_ZH.md">中文</a> |
  <a href="./README_KO.md">한국어</a> |
  <a href="./README_ES.md">Español</a> |
  <a href="./README_FR.md">Français</a> |
  <a href="./README_DE.md">Deutsch</a> |
  <a href="./README_PT-BR.md">Português</a> |
  <a href="./README_AR.md">العربية</a> |
  <a href="./README_HI.md">हिन्दी</a> |
  <a href="./README_RU.md">Русский</a>
</p>

---

## What is Vasty Shop?

Vasty Shop is an open-source multi-vendor e-commerce marketplace platform. Build your own marketplace like Amazon, Shopify, or Etsy with AI-powered recommendations, Stripe Connect vendor payouts, flash sales, POS system, and delivery management — all self-hostable.

## Why Vasty Shop? (Comparison)

| Feature | Vasty Shop | Shopify | WooCommerce | Medusa | Saleor |
|---------|-----------|---------|-------------|--------|--------|
| **Multi-Vendor** | ✅ Built-in marketplace | 💰 Marketplace add-on | ⚠️ Plugin needed | ❌ | ❌ |
| **Stripe Connect Payouts** | ✅ Auto vendor splits | ✅ Shopify Payments | ⚠️ Plugin | ❌ | ⚠️ Plugin |
| **AI Recommendations** | ✅ Built-in | 💰 App required | ⚠️ Plugin | ❌ | ❌ |
| **Flash Sales** | ✅ Timer + inventory | ✅ | ⚠️ Plugin | ❌ | ❌ |
| **POS System** | ✅ Built-in + barcode | ✅ Shopify POS | ⚠️ Plugin | ❌ | ❌ |
| **Gift Cards** | ✅ | ✅ | ⚠️ Plugin | ❌ | ✅ |
| **Delivery Zones** | ✅ Zone-based pricing | ✅ | ⚠️ Plugin | ❌ | ⚠️ |
| **Loyalty/Cashback** | ✅ Points + cashback | ❌ | ⚠️ Plugin | ❌ | ❌ |
| **Referral System** | ✅ | ❌ | ⚠️ Plugin | ❌ | ❌ |
| **Surge Pricing** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Rental System** | ✅ | ❌ | ⚠️ Plugin | ❌ | ❌ |
| **CMS/Blog** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Mobile App** | ✅ Flutter | ✅ Shopify app | ❌ | ❌ | ❌ |
| **17 Languages** | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |
| **Self-Hosted** | ✅ Docker | ❌ | ✅ | ✅ | ✅ |
| **Open Source** | ✅ MIT | ❌ | ✅ GPL | ✅ MIT | ✅ BSD |
| **Pricing** | 🟢 Free | 💰 $39-399/mo | 🟢 Free | 🟢 Free | 🟢 Free |

## Quick Start

```bash
git clone https://github.com/vasty-shop/vasty-shop.git
cd vasty-shop

# Backend
cd backend
cp .env.example .env
npm install
npm run migrate
npm run start:dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Features

### E-Commerce Core
- **Products** -- Variants, attributes, inventory, digital products, bulk import
- **Orders** -- Multi-vendor order splitting, status tracking, refunds
- **Cart** -- Persistent cart, guest checkout, multi-currency
- **Categories** -- Nested categories with filters and search
- **Reviews** -- Ratings, photos, verified purchase badges

### Payments & Finance
- **Stripe Connect** -- Auto vendor payouts with platform fee
- **PayPal** -- Alternative payment gateway
- **Wallet** -- Customer wallet with top-up and spend
- **Escrow** -- Secure payment holding until delivery
- **Disbursement** -- Bulk vendor payouts, commission tracking
- **Expenses** -- Business expense tracking for vendors

### Marketing & Growth
- **Flash Sales** -- Time-limited deals with countdown
- **Campaigns** -- Promotional campaigns with scheduling
- **Coupons** -- Percentage, fixed, free shipping
- **Gift Cards** -- Digital gift cards with balance
- **Loyalty** -- Points system with cashback
- **Referral** -- Customer referral program
- **Surge Pricing** -- Dynamic pricing based on demand

### Operations
- **POS** -- Point-of-sale with barcode scanning
- **Delivery** -- Zone-based pricing, tracking, delivery partners
- **Parcel** -- Parcel delivery management
- **Tax** -- Tax calculation by region
- **Export** -- CSV/Excel data export

### Platform
- **17 Languages** -- AR, BN, DE, EN, ES, FR, HI, ID, IT, JA, KO, MS, PT, RU, TR, UR, ZH
- **Mobile App** -- Flutter (iOS + Android)
- **AI** -- Product recommendations, smart search
- **Blog/CMS** -- Content management
- **Chat** -- Real-time customer-vendor messaging
- **Notifications** -- Email, WebSocket, push
- **Admin Dashboard** -- Full platform analytics

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | NestJS, TypeScript, PostgreSQL (raw SQL), Redis, Socket.io |
| **Frontend** | React, Vite, TypeScript, Tailwind CSS, Radix UI, i18next |
| **Mobile** | Flutter (iOS, Android) |
| **Payments** | Stripe, Stripe Connect, PayPal |
| **AI** | OpenAI (recommendations, search) |
| **Search** | Qdrant (vector), PostgreSQL (full-text) |

## Project Structure

```
vasty-shop/
├── backend/              # NestJS API (53 modules, 67 tables)
│   ├── src/modules/      # products, orders, cart, payments, delivery,
│   │                     # campaigns, coupons, flash-sales, gift-cards,
│   │                     # loyalty, referral, pos, ai, blog, chat, ...
│   └── migrations/       # PostgreSQL migrations
├── frontend/             # React + Vite + Tailwind (17 languages)
├── mobile/               # Flutter app (iOS + Android)
├── shared/               # Shared types and utilities
└── .github/workflows/    # CI/CD
```

## Contributors

Thank you to all the amazing people who have contributed to Vasty Shop! 🎉

<a href="https://github.com/vasty-shop/vasty-shop/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=vasty-shop/vasty-shop&anon=1&max=100&columns=10" />
</a>

Want to see your face here? Check out our [Contributing Guide](CONTRIBUTING.md) and start contributing today!

## Project Activity

<p align="center">
  <img src="https://img.shields.io/github/stars/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=yellow" alt="Stars">
  <img src="https://img.shields.io/github/forks/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=blue" alt="Forks">
  <img src="https://img.shields.io/github/contributors/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=green" alt="Contributors">
  <img src="https://img.shields.io/github/last-commit/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=orange" alt="Last Commit">
</p>

## Security

Please report vulnerabilities responsibly. See [SECURITY.md](SECURITY.md).

## License

This project is licensed under the [MIT License](LICENSE).

Copyright 2025 Vasty Shop Contributors.
