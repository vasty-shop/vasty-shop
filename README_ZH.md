<p align="center">
  <a href="https://vasty.shop">
    <img src="frontend/public/vasty-logo-small.png" alt="Vasty Shop" width="80">
  </a>
  <h1 align="center">Vasty Shop</h1>
  <p align="center">
    <strong>开源多商户电商平台</strong>
  </p>
  <p align="center">
    企业级电商平台，内置 AI 推荐、Stripe Connect 商户自动结算、闪购、POS、配送管理以及 17 种语言支持。
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
  <a href="https://vasty.shop">官网</a> |
  <a href="#快速开始">快速开始</a> |
  <a href="#功能">功能</a> |
  <a href="https://github.com/vasty-shop/vasty-shop/discussions">讨论区</a> |
  <a href="CONTRIBUTING.md">贡献</a>
</p>

<p align="center">
  <a href="./README.md">English</a> | <a href="./README_JA.md">日本語</a> | <a href="./README_ZH.md">中文</a> | <a href="./README_KO.md">한국어</a> | <a href="./README_ID.md">Bahasa Indonesia</a> | <a href="./README_MS.md">Bahasa Melayu</a> | <a href="./README_ES.md">Español</a> | <a href="./README_FR.md">Français</a> | <a href="./README_DE.md">Deutsch</a> | <a href="./README_IT.md">Italiano</a> | <a href="./README_PT-BR.md">Português</a> | <a href="./README_AR.md">العربية</a> | <a href="./README_TR.md">Türkçe</a> | <a href="./README_HI.md">हिन्दी</a> | <a href="./README_BN.md">বাংলা</a> | <a href="./README_UR.md">اردو</a> | <a href="./README_RU.md">Русский</a>
</p>

---

## 什么是 Vasty Shop？

Vasty Shop 是一个开源的多商户电商平台。你可以像 Amazon、Shopify 或 Etsy 那样搭建属于自己的市场，内置 AI 推荐、Stripe Connect 商户自动结算、闪购、POS 系统和配送管理 — 全部支持自部署。

## 为什么选择 Vasty Shop？（对比）

| 功能 | Vasty Shop | Shopify | WooCommerce | Medusa | Saleor |
|---------|-----------|---------|-------------|--------|--------|
| **多商户** | ✅ 内置 | 💰 插件 | ⚠️ 需插件 | ❌ | ❌ |
| **Stripe Connect 结算** | ✅ 自动分账 | ✅ Shopify Payments | ⚠️ 插件 | ❌ | ⚠️ 插件 |
| **AI 推荐** | ✅ 内置 | 💰 需 App | ⚠️ 插件 | ❌ | ❌ |
| **闪购** | ✅ 倒计时 + 库存 | ✅ | ⚠️ 插件 | ❌ | ❌ |
| **POS 系统** | ✅ 内置 + 扫码 | ✅ Shopify POS | ⚠️ 插件 | ❌ | ❌ |
| **礼品卡** | ✅ | ✅ | ⚠️ 插件 | ❌ | ✅ |
| **配送区域** | ✅ 按区计费 | ✅ | ⚠️ 插件 | ❌ | ⚠️ |
| **积分/返现** | ✅ 积分 + 返现 | ❌ | ⚠️ 插件 | ❌ | ❌ |
| **推荐系统** | ✅ | ❌ | ⚠️ 插件 | ❌ | ❌ |
| **动态定价** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **租赁系统** | ✅ | ❌ | ⚠️ 插件 | ❌ | ❌ |
| **CMS/博客** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **17 种语言** | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |
| **自部署** | ✅ Docker | ❌ | ✅ | ✅ | ✅ |
| **开源** | ✅ AGPL-3.0 | ❌ | ✅ GPL | ✅ MIT | ✅ BSD |
| **价格** | 🟢 免费 | 💰 $39-399/月 | 🟢 免费 | 🟢 免费 | 🟢 免费 |

## 快速开始

### Docker（推荐）

> **前置条件**: [Docker](https://docs.docker.com/get-docker/) 和 [Docker Compose](https://docs.docker.com/compose/install/)

```bash
git clone https://github.com/vasty-shop/vasty-shop.git
cd vasty-shop

# 1. 从示例创建 env 文件
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2.（可选）运行安装向导以交互方式选择服务商
docker compose --profile setup run --rm setup

# 3. 启动所有服务（PostgreSQL、Redis、Backend、Frontend）
docker compose up --build

# 4. 运行数据库迁移（在新终端中）
docker compose exec backend npm run migrate

# 5.（可选）填充数据库
docker compose exec backend npm run seed
```

应用将运行在以下地址:

| 服务 | URL |
|---------|-----|
| **前端** | http://localhost:5186 |
| **后端 API** | http://localhost:4005/api/v1 |
| **API 文档 (Swagger)** | http://localhost:4005/api/v1/docs |
| **健康检查 (服务商)** | http://localhost:4005/api/v1/health/providers |
| **WebSocket** | http://localhost:3002 |

#### 默认管理员凭据

| 字段 | 值 |
|-------|-------|
| **邮箱** | `admin@vasty.shop` |
| **密码** | `admin123` |

> **注意:** 请在生产环境立即修改管理员密码。

#### Docker 服务

| 服务 | 镜像 | 端口 |
|---------|-------|------|
| **PostgreSQL** | postgres:16-alpine | 5432 |
| **Redis** | redis:7-alpine | 6379 |
| **Backend** | node:20-alpine (NestJS) | 4005, 3002 |
| **Frontend** | node:20-alpine (Vite) | 5186 |

#### 常用命令

```bash
# 停止所有服务
docker compose down

# 停止并删除所有数据（数据库、redis）
docker compose down -v

# 查看后端日志
docker compose logs -f backend

# 运行迁移
docker compose exec backend npm run migrate

# 填充数据库
docker compose exec backend npm run seed

# 进入 PostgreSQL 命令行
docker compose exec postgres psql -U postgres -d vasty_shop_dev

# 运行安装向导
docker compose --profile setup run --rm setup

# 启动可选服务（例如 Meilisearch、MinIO）
docker compose --profile meilisearch --profile minio up -d
```

### 本地开发（不使用 Docker）

> **前置条件**: Node.js 20+、PostgreSQL 16+、Redis 7+

```bash
git clone https://github.com/vasty-shop/vasty-shop.git
cd vasty-shop

# Backend
cd backend
cp .env.example .env
# 编辑 .env: 设置 DATABASE_HOST=localhost 和 REDIS_HOST=localhost
npm install
npm run migrate
npm run start:dev

# Frontend（新终端）
cd frontend
cp .env.example .env
npm install --legacy-peer-deps
npm run dev
```

## 功能

### 电商核心
- **商品** -- 规格、属性、库存、数字商品、批量导入
- **订单** -- 多商户分单、状态追踪、退款
- **购物车** -- 持久化购物车、访客结账、多币种
- **分类** -- 嵌套分类，支持筛选和搜索
- **评价** -- 评分、图片、已购认证

### 支付与财务
- **Stripe Connect** -- 自动商户结算带平台抽成
- **PayPal** -- 备用支付网关
- **钱包** -- 客户充值与消费
- **托管** -- 收货前资金托管
- **打款** -- 商户批量打款、佣金追踪
- **费用** -- 商户业务费用追踪

### 营销与增长
- **闪购** -- 带倒计时的限时促销
- **活动** -- 可调度的营销活动
- **优惠券** -- 百分比、满减、免运费
- **礼品卡** -- 带余额的数字礼品卡
- **积分** -- 积分 + 返现
- **推荐** -- 老带新推荐计划
- **动态定价** -- 基于需求的定价

### 运营
- **POS** -- 支持扫码的收银台
- **配送** -- 区域定价、物流追踪、配送伙伴
- **包裹** -- 包裹派送管理
- **税费** -- 按地区计算税费
- **导出** -- CSV/Excel 数据导出

### 平台
- **17 种语言** -- AR, BN, DE, EN, ES, FR, HI, ID, IT, JA, KO, MS, PT, RU, TR, UR, ZH
- **AI** -- 商品推荐、智能搜索
- **博客/CMS** -- 内容管理
- **聊天** -- 客户与商户的实时消息
- **通知** -- 邮件、WebSocket、推送
- **管理后台** -- 完整的平台分析

## 技术栈

| 层级 | 技术 |
|-------|------------|
| **后端** | NestJS、TypeScript、PostgreSQL（原生 SQL）、Redis、Socket.io |
| **前端** | React、Vite、TypeScript、Tailwind CSS、Radix UI、i18next |
| **存储** | 可插拔: local-fs、S3、Cloudflare R2、MinIO、B2、GCS、Azure |
| **支付** | Stripe、Stripe Connect、PayPal |
| **AI** | OpenAI（推荐、搜索）|
| **搜索** | Qdrant（向量）、PostgreSQL（全文）|

## 项目结构

```
vasty-shop/
├── backend/              # NestJS API（53 个模块，67 张表）
│   ├── src/modules/      # products, orders, cart, payments, delivery,
│   │                     # campaigns, coupons, flash-sales, gift-cards,
│   │                     # loyalty, referral, pos, ai, blog, chat, ...
│   └── migrations/       # PostgreSQL 迁移
├── frontend/             # React + Vite + Tailwind（17 种语言）
├── shared/               # 共享类型与工具
└── .github/workflows/    # CI/CD
```

## 贡献者

感谢所有为 Vasty Shop 做出贡献的优秀开发者！🎉

<a href="https://github.com/vasty-shop/vasty-shop/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=vasty-shop/vasty-shop&anon=1&max=100&columns=10" />
</a>

想在这里看到自己的头像吗？查看我们的[贡献指南](CONTRIBUTING.md)，今天就开始贡献吧！

## 项目活跃度

<p align="center">
  <img src="https://img.shields.io/github/stars/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=yellow" alt="Stars">
  <img src="https://img.shields.io/github/forks/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=blue" alt="Forks">
  <img src="https://img.shields.io/github/contributors/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=green" alt="Contributors">
  <img src="https://img.shields.io/github/last-commit/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=orange" alt="Last Commit">
</p>

## 安全

请负责任地报告漏洞。请参阅 [SECURITY.md](SECURITY.md)。

## 许可证

本项目采用 **AGPL-3.0 许可证** — 详见 [LICENSE](LICENSE) 文件。

这意味着你可以自由使用、修改和分发本软件，但任何修改也必须以相同许可证开源。

Copyright 2025 Vasty Shop Contributors.
