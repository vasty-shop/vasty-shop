<p align="center">
  <a href="https://vasty.shop">
    <img src="frontend/public/vasty-logo-small.png" alt="Vasty Shop" width="80">
  </a>
  <h1 align="center">Vasty Shop</h1>
  <p align="center">
    <strong>Open-source мультивендорный маркетплейс электронной коммерции</strong>
  </p>
  <p align="center">
    Маркетплейс корпоративного уровня с AI-рекомендациями, выплатами Stripe Connect, флэш-распродажами, POS, управлением доставкой и поддержкой 17 языков.
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
  <a href="https://vasty.shop">Сайт</a> |
  <a href="#быстрый-старт">Быстрый старт</a> |
  <a href="#возможности">Возможности</a> |
  <a href="https://github.com/vasty-shop/vasty-shop/discussions">Обсуждения</a> |
  <a href="CONTRIBUTING.md">Участие</a>
</p>

<p align="center">
  <a href="./README.md">English</a> | <a href="./README_JA.md">日本語</a> | <a href="./README_ZH.md">中文</a> | <a href="./README_KO.md">한국어</a> | <a href="./README_ID.md">Bahasa Indonesia</a> | <a href="./README_MS.md">Bahasa Melayu</a> | <a href="./README_ES.md">Español</a> | <a href="./README_FR.md">Français</a> | <a href="./README_DE.md">Deutsch</a> | <a href="./README_IT.md">Italiano</a> | <a href="./README_PT-BR.md">Português</a> | <a href="./README_AR.md">العربية</a> | <a href="./README_TR.md">Türkçe</a> | <a href="./README_HI.md">हिन्दी</a> | <a href="./README_BN.md">বাংলা</a> | <a href="./README_UR.md">اردو</a> | <a href="./README_RU.md">Русский</a>
</p>

---

## Что такое Vasty Shop?

Vasty Shop — это open-source платформа для мультивендорных маркетплейсов электронной коммерции. Создайте собственный маркетплейс в стиле Amazon, Shopify или Etsy с AI-рекомендациями, автоматическими выплатами продавцам через Stripe Connect, флэш-распродажами, POS-системой и управлением доставкой — всё с возможностью самостоятельного размещения.

## Почему Vasty Shop? (Сравнение)

| Функция | Vasty Shop | Shopify | WooCommerce | Medusa | Saleor |
|---------|-----------|---------|-------------|--------|--------|
| **Мультивендорность** | ✅ Встроено | 💰 Надстройка | ⚠️ Нужен плагин | ❌ | ❌ |
| **Выплаты Stripe Connect** | ✅ Авторазделение | ✅ Shopify Payments | ⚠️ Плагин | ❌ | ⚠️ Плагин |
| **AI-рекомендации** | ✅ Встроено | 💰 Нужна App | ⚠️ Плагин | ❌ | ❌ |
| **Флэш-распродажи** | ✅ Таймер + склад | ✅ | ⚠️ Плагин | ❌ | ❌ |
| **POS-система** | ✅ Встроено + штрихкод | ✅ Shopify POS | ⚠️ Плагин | ❌ | ❌ |
| **Подарочные карты** | ✅ | ✅ | ⚠️ Плагин | ❌ | ✅ |
| **Зоны доставки** | ✅ Цены по зонам | ✅ | ⚠️ Плагин | ❌ | ⚠️ |
| **Лояльность/Кэшбэк** | ✅ Баллы + кэшбэк | ❌ | ⚠️ Плагин | ❌ | ❌ |
| **Реферальная программа** | ✅ | ❌ | ⚠️ Плагин | ❌ | ❌ |
| **Динамическое ценообразование** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Аренда** | ✅ | ❌ | ⚠️ Плагин | ❌ | ❌ |
| **CMS/Блог** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **17 языков** | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |
| **Self-hosted** | ✅ Docker | ❌ | ✅ | ✅ | ✅ |
| **Open Source** | ✅ AGPL-3.0 | ❌ | ✅ GPL | ✅ MIT | ✅ BSD |
| **Цена** | 🟢 Бесплатно | 💰 $39-399/мес | 🟢 Бесплатно | 🟢 Бесплатно | 🟢 Бесплатно |

## Быстрый старт

### Docker (рекомендуется)

> **Требования**: [Docker](https://docs.docker.com/get-docker/) и [Docker Compose](https://docs.docker.com/compose/install/)

```bash
git clone https://github.com/vasty-shop/vasty-shop.git
cd vasty-shop

# 1. Создать env-файлы из примеров
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. (Опционально) Запустить мастер настройки для выбора провайдеров
docker compose --profile setup run --rm setup

# 3. Запустить все сервисы (PostgreSQL, Redis, Backend, Frontend)
docker compose up --build

# 4. Выполнить миграции БД (в новом терминале)
docker compose exec backend npm run migrate

# 5. (Опционально) Наполнить БД тестовыми данными
docker compose exec backend npm run seed
```

Приложение будет доступно по адресам:

| Сервис | URL |
|---------|-----|
| **Frontend** | http://localhost:5186 |
| **Backend API** | http://localhost:4005/api/v1 |
| **API Docs (Swagger)** | http://localhost:4005/api/v1/docs |
| **Health (провайдеры)** | http://localhost:4005/api/v1/health/providers |
| **WebSocket** | http://localhost:3002 |

#### Учётные данные администратора по умолчанию

| Поле | Значение |
|-------|-------|
| **Email** | `admin@vasty.shop` |
| **Пароль** | `admin123` |

> **Примечание:** Немедленно смените пароль администратора в продакшене.

#### Сервисы Docker

| Сервис | Образ | Порт |
|---------|-------|------|
| **PostgreSQL** | postgres:16-alpine | 5433 |
| **Redis** | redis:7-alpine | 6379 |
| **Backend** | node:20-alpine (NestJS) | 4005, 3002 |
| **Frontend** | node:20-alpine (Vite) | 5186 |

#### Полезные команды

```bash
# Остановить все сервисы
docker compose down

# Остановить и удалить все данные
docker compose down -v

# Логи backend
docker compose logs -f backend

# Выполнить миграции
docker compose exec backend npm run migrate

# Наполнить БД
docker compose exec backend npm run seed

# Зайти в PostgreSQL shell
docker compose exec postgres psql -U postgres -d vasty_shop_dev

# Запустить мастер настройки
docker compose --profile setup run --rm setup

# Запустить с опциональными сервисами (напр. Meilisearch, MinIO)
docker compose --profile meilisearch --profile minio up -d
```

### Локальная разработка (без Docker)

> **Требования**: Node.js 20+, PostgreSQL 16+, Redis 7+

```bash
git clone https://github.com/vasty-shop/vasty-shop.git
cd vasty-shop

# Backend
cd backend
cp .env.example .env
# Редактируй .env: DATABASE_HOST=localhost и REDIS_HOST=localhost
npm install
npm run migrate
npm run start:dev

# Frontend (новый терминал)
cd frontend
cp .env.example .env
npm install --legacy-peer-deps
npm run dev
```

## Возможности

### Ядро E-Commerce
- **Товары** -- Варианты, атрибуты, инвентарь, цифровые товары, массовый импорт
- **Заказы** -- Разделение между продавцами, отслеживание статуса, возвраты
- **Корзина** -- Постоянная корзина, гостевой чекаут, мультивалютность
- **Категории** -- Вложенные категории с фильтрами и поиском
- **Отзывы** -- Рейтинги, фото, бейджи подтверждённой покупки

### Платежи и финансы
- **Stripe Connect** -- Автовыплаты продавцам с комиссией платформы
- **PayPal** -- Альтернативный платёжный шлюз
- **Кошелёк** -- Баланс клиента с пополнением и списанием
- **Эскроу** -- Безопасное хранение платежа до доставки
- **Выплаты** -- Массовые выплаты продавцам, учёт комиссий
- **Расходы** -- Учёт бизнес-расходов продавцов

### Маркетинг и рост
- **Флэш-распродажи** -- Временные скидки с обратным отсчётом
- **Кампании** -- Промо-кампании с расписанием
- **Купоны** -- Процент, фиксированная сумма, бесплатная доставка
- **Подарочные карты** -- Цифровые карты с балансом
- **Лояльность** -- Бонусная система с кэшбэком
- **Рефералы** -- Программа привлечения клиентов
- **Динамические цены** -- Цены в зависимости от спроса

### Операции
- **POS** -- Точка продаж со сканером штрихкодов
- **Доставка** -- Цены по зонам, трекинг, партнёры доставки
- **Посылки** -- Управление посылочной доставкой
- **Налоги** -- Расчёт налогов по регионам
- **Экспорт** -- Экспорт в CSV/Excel

### Платформа
- **17 языков** -- AR, BN, DE, EN, ES, FR, HI, ID, IT, JA, KO, MS, PT, RU, TR, UR, ZH
- **AI** -- Рекомендации товаров, умный поиск
- **Blog/CMS** -- Управление контентом
- **Чат** -- Мгновенные сообщения клиент-продавец
- **Уведомления** -- Email, WebSocket, push
- **Админ-панель** -- Полная аналитика платформы

## Технологический стек

| Слой | Технология |
|-------|------------|
| **Backend** | NestJS, TypeScript, PostgreSQL (raw SQL), Redis, Socket.io |
| **Frontend** | React, Vite, TypeScript, Tailwind CSS, Radix UI, i18next |
| **Хранилище** | Подключаемое: local-fs, S3, Cloudflare R2, MinIO, B2, GCS, Azure |
| **Платежи** | Stripe, Stripe Connect, PayPal, bKash |
| **AI** | OpenAI, Anthropic, Gemini, Groq, Ollama |
| **Поиск** | PostgreSQL (pg-trgm), Meilisearch, Typesense |

## Структура проекта

```
vasty-shop/
├── backend/              # NestJS API (69 модулей, 80+ таблиц)
│   ├── src/modules/      # products, orders, cart, payments, delivery,
│   │                     # campaigns, coupons, flash-sales, gift-cards,
│   │                     # loyalty, referral, pos, ai, blog, chat, ...
│   └── migrations/       # PostgreSQL миграции
├── frontend/             # React + Vite + Tailwind (17 языков)
├── shared/               # Общие типы и утилиты
└── .github/workflows/    # CI/CD
```

## Контрибьюторы

Спасибо всем замечательным людям, которые внесли вклад в Vasty Shop! 🎉

<a href="https://github.com/vasty-shop/vasty-shop/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=vasty-shop/vasty-shop&anon=1&max=100&columns=10" />
</a>

Хотите увидеть своё лицо здесь? Ознакомьтесь с нашим [руководством по участию](CONTRIBUTING.md) и начните вносить вклад уже сегодня!

## Активность проекта

<p align="center">
  <img src="https://img.shields.io/github/stars/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=yellow" alt="Stars">
  <img src="https://img.shields.io/github/forks/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=blue" alt="Forks">
  <img src="https://img.shields.io/github/contributors/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=green" alt="Contributors">
  <img src="https://img.shields.io/github/last-commit/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=orange" alt="Last Commit">
</p>

## Безопасность

Пожалуйста, сообщайте об уязвимостях ответственно. См. [SECURITY.md](SECURITY.md).

## Лицензия

Этот проект распространяется под лицензией **AGPL-3.0** — подробности в файле [LICENSE](LICENSE).

Это означает, что вы можете свободно использовать, изменять и распространять это программное обеспечение, но любые изменения также должны быть открыты под той же лицензией.

Copyright 2025 Vasty Shop Contributors.
