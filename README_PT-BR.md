<p align="center">
  <a href="https://vasty.shop">
    <img src="frontend/public/vasty-logo-small.png" alt="Vasty Shop" width="80">
  </a>
  <h1 align="center">Vasty Shop</h1>
  <p align="center">
    <strong>Marketplace de e-commerce multi-vendedor open source</strong>
  </p>
  <p align="center">
    Marketplace de nível empresarial com recomendações por IA, pagamentos Stripe Connect, vendas relâmpago, POS, gestão de entregas e suporte a 17 idiomas.
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
  <a href="https://vasty.shop">Site</a> |
  <a href="#início-rápido">Início rápido</a> |
  <a href="#recursos">Recursos</a> |
  <a href="https://github.com/vasty-shop/vasty-shop/discussions">Discussões</a> |
  <a href="CONTRIBUTING.md">Contribuir</a>
</p>

<p align="center">
  <a href="./README.md">English</a> | <a href="./README_JA.md">日本語</a> | <a href="./README_ZH.md">中文</a> | <a href="./README_KO.md">한국어</a> | <a href="./README_ID.md">Bahasa Indonesia</a> | <a href="./README_MS.md">Bahasa Melayu</a> | <a href="./README_ES.md">Español</a> | <a href="./README_FR.md">Français</a> | <a href="./README_DE.md">Deutsch</a> | <a href="./README_IT.md">Italiano</a> | <a href="./README_PT-BR.md">Português</a> | <a href="./README_AR.md">العربية</a> | <a href="./README_TR.md">Türkçe</a> | <a href="./README_HI.md">हिन्दी</a> | <a href="./README_BN.md">বাংলা</a> | <a href="./README_UR.md">اردو</a> | <a href="./README_RU.md">Русский</a>
</p>

---

## O que é Vasty Shop?

Vasty Shop é uma plataforma open source para marketplaces de e-commerce multi-vendedor. Construa seu próprio marketplace como Amazon, Shopify ou Etsy com recomendações de IA, pagamentos automáticos a vendedores via Stripe Connect, vendas relâmpago, sistema POS e gestão de entregas — tudo autohospedável.

## Por que Vasty Shop? (Comparação)

| Recurso | Vasty Shop | Shopify | WooCommerce | Medusa | Saleor |
|---------|-----------|---------|-------------|--------|--------|
| **Multi-vendedor** | ✅ Marketplace embutido | 💰 Add-on | ⚠️ Plugin necessário | ❌ | ❌ |
| **Pagamentos Stripe Connect** | ✅ Split automático | ✅ Shopify Payments | ⚠️ Plugin | ❌ | ⚠️ Plugin |
| **Recomendações IA** | ✅ Embutido | 💰 App necessária | ⚠️ Plugin | ❌ | ❌ |
| **Vendas relâmpago** | ✅ Timer + estoque | ✅ | ⚠️ Plugin | ❌ | ❌ |
| **Sistema POS** | ✅ Embutido + código de barras | ✅ Shopify POS | ⚠️ Plugin | ❌ | ❌ |
| **Cartões-presente** | ✅ | ✅ | ⚠️ Plugin | ❌ | ✅ |
| **Zonas de entrega** | ✅ Preço por zona | ✅ | ⚠️ Plugin | ❌ | ⚠️ |
| **Fidelidade/Cashback** | ✅ Pontos + cashback | ❌ | ⚠️ Plugin | ❌ | ❌ |
| **Indicação** | ✅ | ❌ | ⚠️ Plugin | ❌ | ❌ |
| **Preço dinâmico** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Aluguel** | ✅ | ❌ | ⚠️ Plugin | ❌ | ❌ |
| **CMS/Blog** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **17 idiomas** | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |
| **Autohospedado** | ✅ Docker | ❌ | ✅ | ✅ | ✅ |
| **Open Source** | ✅ AGPL-3.0 | ❌ | ✅ GPL | ✅ MIT | ✅ BSD |
| **Preço** | 🟢 Grátis | 💰 $39-399/mês | 🟢 Grátis | 🟢 Grátis | 🟢 Grátis |

## Início rápido

### Docker (Recomendado)

> **Pré-requisitos**: [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/install/)

```bash
git clone https://github.com/vasty-shop/vasty-shop.git
cd vasty-shop

# 1. Criar arquivos .env a partir dos exemplos
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. (Opcional) Executar assistente de configuração para escolher provedores
docker compose --profile setup run --rm setup

# 3. Iniciar todos os serviços (PostgreSQL, Redis, Backend, Frontend)
docker compose up --build

# 4. Rodar migrações do banco (em um novo terminal)
docker compose exec backend npm run migrate

# 5. (Opcional) Popular o banco de dados
docker compose exec backend npm run seed
```

A aplicação estará disponível em:

| Serviço | URL |
|---------|-----|
| **Frontend** | http://localhost:5186 |
| **API Backend** | http://localhost:4005/api/v1 |
| **Docs da API (Swagger)** | http://localhost:4005/api/v1/docs |
| **Saúde (Provedores)** | http://localhost:4005/api/v1/health/providers |
| **WebSocket** | http://localhost:3002 |

#### Credenciais de admin padrão

| Campo | Valor |
|-------|-------|
| **Email** | `admin@vasty.shop` |
| **Senha** | `admin123` |

> **Nota:** Altere a senha do admin imediatamente em produção.

#### Serviços Docker

| Serviço | Imagem | Porta |
|---------|-------|------|
| **PostgreSQL** | postgres:16-alpine | 5433 |
| **Redis** | redis:7-alpine | 6379 |
| **Backend** | node:20-alpine (NestJS) | 4005, 3002 |
| **Frontend** | node:20-alpine (Vite) | 5186 |

#### Comandos úteis

```bash
# Parar todos os serviços
docker compose down

# Parar e remover todos os dados
docker compose down -v

# Ver logs do backend
docker compose logs -f backend

# Rodar migrações
docker compose exec backend npm run migrate

# Popular banco
docker compose exec backend npm run seed

# Acessar shell do PostgreSQL
docker compose exec postgres psql -U postgres -d vasty_shop_dev

# Executar assistente de configuração
docker compose --profile setup run --rm setup

# Iniciar com serviços opcionais (ex: Meilisearch, MinIO)
docker compose --profile meilisearch --profile minio up -d
```

### Desenvolvimento local (sem Docker)

> **Pré-requisitos**: Node.js 20+, PostgreSQL 16+, Redis 7+

```bash
git clone https://github.com/vasty-shop/vasty-shop.git
cd vasty-shop

# Backend
cd backend
cp .env.example .env
# Edite .env: defina DATABASE_HOST=localhost e REDIS_HOST=localhost
npm install
npm run migrate
npm run start:dev

# Frontend (novo terminal)
cd frontend
cp .env.example .env
npm install --legacy-peer-deps
npm run dev
```

## Recursos

### Núcleo E-Commerce
- **Produtos** -- Variantes, atributos, estoque, produtos digitais, importação em massa
- **Pedidos** -- Divisão multi-vendedor, rastreio de status, reembolsos
- **Carrinho** -- Carrinho persistente, checkout como visitante, multi-moeda
- **Categorias** -- Aninhadas com filtros e busca
- **Avaliações** -- Estrelas, fotos, selos de compra verificada

### Pagamentos e Finanças
- **Stripe Connect** -- Pagamentos automáticos aos vendedores com taxa de plataforma
- **PayPal** -- Gateway de pagamento alternativo
- **Carteira** -- Saldo do cliente com recarga e gasto
- **Escrow** -- Retenção segura até a entrega
- **Desembolso** -- Pagamentos em lote aos vendedores, controle de comissões
- **Despesas** -- Controle de despesas dos vendedores

### Marketing e Crescimento
- **Vendas relâmpago** -- Ofertas por tempo limitado com contagem regressiva
- **Campanhas** -- Campanhas promocionais com agendamento
- **Cupons** -- Porcentagem, valor fixo, frete grátis
- **Cartões-presente** -- Cartões digitais com saldo
- **Fidelidade** -- Sistema de pontos com cashback
- **Indicação** -- Programa de indicação de clientes
- **Preço dinâmico** -- Preços variáveis conforme demanda

### Operações
- **POS** -- Ponto de venda com leitor de código de barras
- **Entregas** -- Preço por zona, rastreio, parceiros de entrega
- **Encomendas** -- Gestão de entregas de encomendas
- **Impostos** -- Cálculo fiscal por região
- **Exportação** -- Exportação CSV/Excel

### Plataforma
- **17 idiomas** -- AR, BN, DE, EN, ES, FR, HI, ID, IT, JA, KO, MS, PT, RU, TR, UR, ZH
- **IA** -- Recomendações de produtos, busca inteligente
- **Blog/CMS** -- Gestão de conteúdo
- **Chat** -- Mensagens em tempo real entre cliente e vendedor
- **Notificações** -- Email, WebSocket, push
- **Painel admin** -- Analytics completo da plataforma

## Stack de tecnologia

| Camada | Tecnologia |
|-------|------------|
| **Backend** | NestJS, TypeScript, PostgreSQL (SQL direto), Redis, Socket.io |
| **Frontend** | React, Vite, TypeScript, Tailwind CSS, Radix UI, i18next |
| **Armazenamento** | Conectável: local-fs, S3, Cloudflare R2, MinIO, B2, GCS, Azure |
| **Pagamentos** | Stripe, Stripe Connect, PayPal, bKash |
| **IA** | OpenAI, Anthropic, Gemini, Groq, Ollama |
| **Busca** | PostgreSQL (pg-trgm), Meilisearch, Typesense |

## Estrutura do projeto

```
vasty-shop/
├── backend/              # API NestJS (69 módulos, 80+ tabelas)
│   ├── src/modules/      # products, orders, cart, payments, delivery,
│   │                     # campaigns, coupons, flash-sales, gift-cards,
│   │                     # loyalty, referral, pos, ai, blog, chat, ...
│   └── migrations/       # Migrações PostgreSQL
├── frontend/             # React + Vite + Tailwind (17 idiomas)
├── shared/               # Tipos e utilitários compartilhados
└── .github/workflows/    # CI/CD
```

## Colaboradores

Obrigado a todas as pessoas incríveis que contribuíram com o Vasty Shop! 🎉

<a href="https://github.com/vasty-shop/vasty-shop/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=vasty-shop/vasty-shop&anon=1&max=100&columns=10" />
</a>

Quer ver seu rosto aqui? Confira nosso [Guia de Contribuição](CONTRIBUTING.md) e comece a contribuir hoje!

## Atividade do projeto

<p align="center">
  <img src="https://img.shields.io/github/stars/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=yellow" alt="Stars">
  <img src="https://img.shields.io/github/forks/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=blue" alt="Forks">
  <img src="https://img.shields.io/github/contributors/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=green" alt="Contributors">
  <img src="https://img.shields.io/github/last-commit/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=orange" alt="Last Commit">
</p>

## Segurança

Por favor, reporte vulnerabilidades de forma responsável. Veja [SECURITY.md](SECURITY.md).

## Licença

Este projeto é licenciado sob a **Licença AGPL-3.0** — veja o arquivo [LICENSE](LICENSE) para detalhes.

Isso significa que você pode usar, modificar e distribuir este software livremente, mas qualquer modificação também deve ser publicada como open source sob a mesma licença.

Copyright 2025 Vasty Shop Contributors.
