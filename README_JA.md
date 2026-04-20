<p align="center">
  <a href="https://vasty.shop">
    <img src="frontend/public/vasty-logo-small.png" alt="Vasty Shop" width="80">
  </a>
  <h1 align="center">Vasty Shop</h1>
  <p align="center">
    <strong>オープンソースのマルチベンダーEコマースマーケットプレイス</strong>
  </p>
  <p align="center">
    AIレコメンデーション、Stripe Connect による出品者への自動送金、フラッシュセール、POS、配送管理、17言語対応を備えたエンタープライズ級マーケットプレイス。
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
  <a href="https://vasty.shop">ウェブサイト</a> |
  <a href="#クイックスタート">クイックスタート</a> |
  <a href="#機能">機能</a> |
  <a href="https://github.com/vasty-shop/vasty-shop/discussions">ディスカッション</a> |
  <a href="CONTRIBUTING.md">コントリビュート</a>
</p>

<p align="center">
  <a href="./README.md">English</a> | <a href="./README_JA.md">日本語</a> | <a href="./README_ZH.md">中文</a> | <a href="./README_KO.md">한국어</a> | <a href="./README_ID.md">Bahasa Indonesia</a> | <a href="./README_MS.md">Bahasa Melayu</a> | <a href="./README_ES.md">Español</a> | <a href="./README_FR.md">Français</a> | <a href="./README_DE.md">Deutsch</a> | <a href="./README_IT.md">Italiano</a> | <a href="./README_PT-BR.md">Português</a> | <a href="./README_AR.md">العربية</a> | <a href="./README_TR.md">Türkçe</a> | <a href="./README_HI.md">हिन्दी</a> | <a href="./README_BN.md">বাংলা</a> | <a href="./README_UR.md">اردو</a> | <a href="./README_RU.md">Русский</a>
</p>

---

## Vasty Shop とは？

Vasty Shop はオープンソースのマルチベンダーEコマースマーケットプレイスプラットフォームです。Amazon、Shopify、Etsy のような自分だけのマーケットプレイスを構築できます。AI によるレコメンデーション、Stripe Connect による出品者への自動送金、フラッシュセール、POS システム、配送管理を備え、すべてセルフホスト可能です。

## なぜ Vasty Shop なのか？（比較）

| 機能 | Vasty Shop | Shopify | WooCommerce | Medusa | Saleor |
|---------|-----------|---------|-------------|--------|--------|
| **マルチベンダー** | ✅ 組み込み | 💰 アドオン | ⚠️ プラグイン必要 | ❌ | ❌ |
| **Stripe Connect 送金** | ✅ 自動分配 | ✅ Shopify Payments | ⚠️ プラグイン | ❌ | ⚠️ プラグイン |
| **AI レコメンド** | ✅ 組み込み | 💰 アプリ必要 | ⚠️ プラグイン | ❌ | ❌ |
| **フラッシュセール** | ✅ タイマー + 在庫 | ✅ | ⚠️ プラグイン | ❌ | ❌ |
| **POS システム** | ✅ 組み込み + バーコード | ✅ Shopify POS | ⚠️ プラグイン | ❌ | ❌ |
| **ギフトカード** | ✅ | ✅ | ⚠️ プラグイン | ❌ | ✅ |
| **配送ゾーン** | ✅ ゾーン別価格 | ✅ | ⚠️ プラグイン | ❌ | ⚠️ |
| **ロイヤルティ/キャッシュバック** | ✅ ポイント + キャッシュバック | ❌ | ⚠️ プラグイン | ❌ | ❌ |
| **紹介システム** | ✅ | ❌ | ⚠️ プラグイン | ❌ | ❌ |
| **サージ価格** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **レンタルシステム** | ✅ | ❌ | ⚠️ プラグイン | ❌ | ❌ |
| **CMS/ブログ** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **17 言語対応** | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |
| **セルフホスト** | ✅ Docker | ❌ | ✅ | ✅ | ✅ |
| **オープンソース** | ✅ AGPL-3.0 | ❌ | ✅ GPL | ✅ MIT | ✅ BSD |
| **価格** | 🟢 無料 | 💰 $39-399/月 | 🟢 無料 | 🟢 無料 | 🟢 無料 |

## クイックスタート

### Docker（推奨）

> **前提条件**: [Docker](https://docs.docker.com/get-docker/) と [Docker Compose](https://docs.docker.com/compose/install/)

```bash
git clone https://github.com/vasty-shop/vasty-shop.git
cd vasty-shop

# 1. サンプルから env ファイルを作成
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. （オプション）セットアップウィザードでプロバイダを対話的に選択
docker compose --profile setup run --rm setup

# 3. 全サービスを起動（PostgreSQL、Redis、Backend、Frontend）
docker compose up --build

# 4. データベースマイグレーションを実行（新しいターミナルで）
docker compose exec backend npm run migrate

# 5. （オプション）データベースをシード
docker compose exec backend npm run seed
```

アプリは以下の URL で利用できます:

| サービス | URL |
|---------|-----|
| **フロントエンド** | http://localhost:5186 |
| **バックエンド API** | http://localhost:4005/api/v1 |
| **API ドキュメント (Swagger)** | http://localhost:4005/api/v1/docs |
| **ヘルスチェック (プロバイダ)** | http://localhost:4005/api/v1/health/providers |
| **WebSocket** | http://localhost:3002 |

#### デフォルトの管理者認証情報

| フィールド | 値 |
|-------|-------|
| **メール** | `admin@vasty.shop` |
| **パスワード** | `admin123` |

> **注意:** 本番環境では管理者パスワードを直ちに変更してください。

#### Docker サービス

| サービス | イメージ | ポート |
|---------|-------|------|
| **PostgreSQL** | postgres:16-alpine | 5433 |
| **Redis** | redis:7-alpine | 6379 |
| **Backend** | node:20-alpine (NestJS) | 4005, 3002 |
| **Frontend** | node:20-alpine (Vite) | 5186 |

#### 便利なコマンド

```bash
# 全サービスを停止
docker compose down

# 全データを削除して停止（データベース、redis）
docker compose down -v

# バックエンドのログを表示
docker compose logs -f backend

# マイグレーションを実行
docker compose exec backend npm run migrate

# データベースをシード
docker compose exec backend npm run seed

# PostgreSQL シェルへアクセス
docker compose exec postgres psql -U postgres -d vasty_shop_dev

# セットアップウィザードを実行
docker compose --profile setup run --rm setup

# オプションサービス付きで起動（例: Meilisearch、MinIO）
docker compose --profile meilisearch --profile minio up -d
```

### ローカル開発（Docker なし）

> **前提条件**: Node.js 20+、PostgreSQL 16+、Redis 7+

```bash
git clone https://github.com/vasty-shop/vasty-shop.git
cd vasty-shop

# Backend
cd backend
cp .env.example .env
# .env を編集: DATABASE_HOST=localhost と REDIS_HOST=localhost を設定
npm install
npm run migrate
npm run start:dev

# Frontend（新しいターミナル）
cd frontend
cp .env.example .env
npm install --legacy-peer-deps
npm run dev
```

## 機能

### Eコマースのコア
- **商品** -- バリアント、属性、在庫、デジタル商品、一括インポート
- **注文** -- マルチベンダー注文分割、ステータス追跡、返金
- **カート** -- 永続カート、ゲスト購入、マルチ通貨
- **カテゴリ** -- フィルタと検索付きのネストカテゴリ
- **レビュー** -- 評価、写真、購入済みバッジ

### 決済と金融
- **Stripe Connect** -- プラットフォーム手数料付きの自動出品者送金
- **PayPal** -- 代替決済ゲートウェイ
- **ウォレット** -- チャージと支払いができる顧客ウォレット
- **エスクロー** -- 配達まで支払いを安全に保持
- **支払い処理** -- 出品者への一括送金、手数料追跡
- **経費** -- 出品者向け経費追跡

### マーケティングと成長
- **フラッシュセール** -- カウントダウン付きの期間限定セール
- **キャンペーン** -- スケジュール可能なプロモーション
- **クーポン** -- パーセント、定額、送料無料
- **ギフトカード** -- 残高付きデジタルギフトカード
- **ロイヤルティ** -- キャッシュバック付きポイントシステム
- **紹介** -- 顧客紹介プログラム
- **サージ価格** -- 需要に応じた動的価格設定

### 運用
- **POS** -- バーコードスキャン対応 POS
- **配送** -- ゾーン別価格、追跡、配送パートナー
- **小包** -- 小包配送管理
- **税** -- 地域別税計算
- **エクスポート** -- CSV/Excel データエクスポート

### プラットフォーム
- **17 言語** -- AR, BN, DE, EN, ES, FR, HI, ID, IT, JA, KO, MS, PT, RU, TR, UR, ZH
- **AI** -- 商品レコメンド、スマート検索
- **ブログ/CMS** -- コンテンツ管理
- **チャット** -- 顧客と出品者のリアルタイムメッセージング
- **通知** -- メール、WebSocket、プッシュ
- **管理ダッシュボード** -- プラットフォーム全体の分析

## 技術スタック

| レイヤー | 技術 |
|-------|------------|
| **Backend** | NestJS、TypeScript、PostgreSQL（Raw SQL）、Redis、Socket.io |
| **Frontend** | React、Vite、TypeScript、Tailwind CSS、Radix UI、i18next |
| **ストレージ** | プラグイン式: local-fs、S3、Cloudflare R2、MinIO、B2、GCS、Azure |
| **決済** | Stripe、Stripe Connect、PayPal |
| **AI** | OpenAI、Anthropic、Gemini、Groq、Ollama |
| **検索** | PostgreSQL（pg-trgm）、Meilisearch、Typesense |

## プロジェクト構成

```
vasty-shop/
├── backend/              # NestJS API（69 モジュール、80+ テーブル）
│   ├── src/modules/      # products, orders, cart, payments, delivery,
│   │                     # campaigns, coupons, flash-sales, gift-cards,
│   │                     # loyalty, referral, pos, ai, blog, chat, ...
│   └── migrations/       # PostgreSQL マイグレーション
├── frontend/             # React + Vite + Tailwind（17 言語）
├── shared/               # 共有型とユーティリティ
└── .github/workflows/    # CI/CD
```

## コントリビューター

Vasty Shop にコントリビュートしてくださった素晴らしい方々に感謝します！ 🎉

<a href="https://github.com/vasty-shop/vasty-shop/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=vasty-shop/vasty-shop&anon=1&max=100&columns=10" />
</a>

ここに自分の顔を載せたいですか？[コントリビューションガイド](CONTRIBUTING.md)を確認して、今日からコントリビュートを始めましょう！

## プロジェクト活動

<p align="center">
  <img src="https://img.shields.io/github/stars/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=yellow" alt="Stars">
  <img src="https://img.shields.io/github/forks/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=blue" alt="Forks">
  <img src="https://img.shields.io/github/contributors/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=green" alt="Contributors">
  <img src="https://img.shields.io/github/last-commit/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=orange" alt="Last Commit">
</p>

## セキュリティ

脆弱性は責任を持って報告してください。[SECURITY.md](SECURITY.md) を参照してください。

## ライセンス

このプロジェクトは **AGPL-3.0 ライセンス** の下でライセンスされています — 詳細は [LICENSE](LICENSE) ファイルをご覧ください。

これは、このソフトウェアを自由に使用、変更、再配布できますが、すべての変更も同じライセンスの下でオープンソース化する必要があることを意味します。

Copyright 2025 Vasty Shop Contributors.
