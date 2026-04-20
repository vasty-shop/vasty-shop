<p align="center">
  <a href="https://vasty.shop">
    <img src="frontend/public/vasty-logo-small.png" alt="Vasty Shop" width="80">
  </a>
  <h1 align="center">Vasty Shop</h1>
  <p align="center">
    <strong>Marketplace de comercio electrónico multivendedor de código abierto</strong>
  </p>
  <p align="center">
    Marketplace de nivel empresarial con recomendaciones por IA, pagos automáticos con Stripe Connect, ventas flash, POS, gestión de entregas y soporte para 17 idiomas.
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
  <a href="https://vasty.shop">Sitio web</a> |
  <a href="#inicio-rápido">Inicio rápido</a> |
  <a href="#características">Características</a> |
  <a href="https://github.com/vasty-shop/vasty-shop/discussions">Discusiones</a> |
  <a href="CONTRIBUTING.md">Contribuir</a>
</p>

<p align="center">
  <a href="./README.md">English</a> | <a href="./README_JA.md">日本語</a> | <a href="./README_ZH.md">中文</a> | <a href="./README_KO.md">한국어</a> | <a href="./README_ID.md">Bahasa Indonesia</a> | <a href="./README_MS.md">Bahasa Melayu</a> | <a href="./README_ES.md">Español</a> | <a href="./README_FR.md">Français</a> | <a href="./README_DE.md">Deutsch</a> | <a href="./README_IT.md">Italiano</a> | <a href="./README_PT-BR.md">Português</a> | <a href="./README_AR.md">العربية</a> | <a href="./README_TR.md">Türkçe</a> | <a href="./README_HI.md">हिन्दी</a> | <a href="./README_BN.md">বাংলা</a> | <a href="./README_UR.md">اردو</a> | <a href="./README_RU.md">Русский</a>
</p>

---

## ¿Qué es Vasty Shop?

Vasty Shop es una plataforma de código abierto para crear marketplaces multivendedor. Construye tu propio marketplace como Amazon, Shopify o Etsy con recomendaciones potenciadas por IA, pagos automáticos a vendedores vía Stripe Connect, ventas flash, sistema POS y gestión de entregas — todo autohospedable.

## ¿Por qué Vasty Shop? (Comparación)

| Característica | Vasty Shop | Shopify | WooCommerce | Medusa | Saleor |
|---------|-----------|---------|-------------|--------|--------|
| **Multi-vendedor** | ✅ Marketplace integrado | 💰 Complemento | ⚠️ Plugin necesario | ❌ | ❌ |
| **Pagos Stripe Connect** | ✅ División automática | ✅ Shopify Payments | ⚠️ Plugin | ❌ | ⚠️ Plugin |
| **Recomendaciones IA** | ✅ Integrado | 💰 App requerida | ⚠️ Plugin | ❌ | ❌ |
| **Ventas flash** | ✅ Temporizador + stock | ✅ | ⚠️ Plugin | ❌ | ❌ |
| **Sistema POS** | ✅ Integrado + códigos de barras | ✅ Shopify POS | ⚠️ Plugin | ❌ | ❌ |
| **Tarjetas de regalo** | ✅ | ✅ | ⚠️ Plugin | ❌ | ✅ |
| **Zonas de entrega** | ✅ Precios por zona | ✅ | ⚠️ Plugin | ❌ | ⚠️ |
| **Fidelización/Cashback** | ✅ Puntos + cashback | ❌ | ⚠️ Plugin | ❌ | ❌ |
| **Sistema de referidos** | ✅ | ❌ | ⚠️ Plugin | ❌ | ❌ |
| **Precios dinámicos** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Sistema de alquiler** | ✅ | ❌ | ⚠️ Plugin | ❌ | ❌ |
| **CMS/Blog** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **17 idiomas** | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |
| **Autohospedado** | ✅ Docker | ❌ | ✅ | ✅ | ✅ |
| **Código abierto** | ✅ AGPL-3.0 | ❌ | ✅ GPL | ✅ MIT | ✅ BSD |
| **Precio** | 🟢 Gratis | 💰 $39-399/mes | 🟢 Gratis | 🟢 Gratis | 🟢 Gratis |

## Panel del Vendedor

Cada vendedor recibe un panel de control autoservicio con KPIs en tiempo real (ingresos, pedidos, productos, clientes), un desglose de ganancias — ventas brutas, costos de envío, beneficio neto — y gestión completa de pedidos, productos y aprobaciones.

![Panel del Vendedor](./docs/screenshots/VastyDash.png)

## Inicio rápido

### Docker (Recomendado)

> **Requisitos**: [Docker](https://docs.docker.com/get-docker/) y [Docker Compose](https://docs.docker.com/compose/install/)

```bash
git clone https://github.com/vasty-shop/vasty-shop.git
cd vasty-shop

# 1. Crear archivos env a partir de los ejemplos
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. (Opcional) Ejecutar el asistente de configuración para elegir proveedores
docker compose --profile setup run --rm setup

# 3. Iniciar todos los servicios (PostgreSQL, Redis, Backend, Frontend)
docker compose up --build

# 4. Ejecutar migraciones de base de datos (en una nueva terminal)
docker compose exec backend npm run migrate

# 5. (Opcional) Sembrar la base de datos
docker compose exec backend npm run seed
```

La aplicación estará disponible en:

| Servicio | URL |
|---------|-----|
| **Frontend** | http://localhost:5186 |
| **API Backend** | http://localhost:4005/api/v1 |
| **Documentación API (Swagger)** | http://localhost:4005/api/v1/docs |
| **Salud (Proveedores)** | http://localhost:4005/api/v1/health/providers |
| **WebSocket** | http://localhost:3002 |

#### Credenciales de admin por defecto

| Campo | Valor |
|-------|-------|
| **Correo** | `admin@vasty.shop` |
| **Contraseña** | `admin123` |

> **Nota:** Cambia la contraseña de admin inmediatamente en producción.

#### Servicios Docker

| Servicio | Imagen | Puerto |
|---------|-------|------|
| **PostgreSQL** | postgres:16-alpine | 5433 |
| **Redis** | redis:7-alpine | 6379 |
| **Backend** | node:20-alpine (NestJS) | 4005, 3002 |
| **Frontend** | node:20-alpine (Vite) | 5186 |

#### Comandos útiles

```bash
# Detener todos los servicios
docker compose down

# Detener y eliminar todos los datos (base de datos, redis)
docker compose down -v

# Ver logs del backend
docker compose logs -f backend

# Ejecutar migraciones
docker compose exec backend npm run migrate

# Sembrar base de datos
docker compose exec backend npm run seed

# Acceder a la shell de PostgreSQL
docker compose exec postgres psql -U postgres -d vasty_shop_dev

# Ejecutar asistente de configuración
docker compose --profile setup run --rm setup

# Iniciar con servicios opcionales (p. ej. Meilisearch, MinIO)
docker compose --profile meilisearch --profile minio up -d
```

### Desarrollo local (sin Docker)

> **Requisitos**: Node.js 20+, PostgreSQL 16+, Redis 7+

```bash
git clone https://github.com/vasty-shop/vasty-shop.git
cd vasty-shop

# Backend
cd backend
cp .env.example .env
# Edita .env: establece DATABASE_HOST=localhost y REDIS_HOST=localhost
npm install
npm run migrate
npm run start:dev

# Frontend (nueva terminal)
cd frontend
cp .env.example .env
npm install --legacy-peer-deps
npm run dev
```

## Características

### Núcleo E-commerce
- **Productos** -- Variantes, atributos, inventario, productos digitales, importación masiva
- **Pedidos** -- División entre múltiples vendedores, seguimiento de estado, reembolsos
- **Carrito** -- Carrito persistente, checkout como invitado, multi-moneda
- **Categorías** -- Categorías anidadas con filtros y búsqueda
- **Reseñas** -- Valoraciones, fotos, insignias de compra verificada

### Pagos y Finanzas
- **Stripe Connect** -- Pagos automáticos a vendedores con comisión de plataforma
- **PayPal** -- Pasarela de pago alternativa
- **Billetera** -- Saldo del cliente con recarga y gasto
- **Custodia** -- Retención segura del pago hasta la entrega
- **Desembolsos** -- Pagos masivos a vendedores, seguimiento de comisiones
- **Gastos** -- Seguimiento de gastos comerciales para vendedores

### Marketing y Crecimiento
- **Ventas flash** -- Ofertas por tiempo limitado con cuenta regresiva
- **Campañas** -- Campañas promocionales con programación
- **Cupones** -- Porcentaje, monto fijo, envío gratis
- **Tarjetas de regalo** -- Tarjetas digitales con saldo
- **Fidelización** -- Sistema de puntos con cashback
- **Referidos** -- Programa de referidos de clientes
- **Precios dinámicos** -- Precios según demanda

### Operaciones
- **POS** -- Punto de venta con escáner de códigos de barras
- **Entregas** -- Precios por zona, seguimiento, socios de entrega
- **Paquetería** -- Gestión de entregas de paquetes
- **Impuestos** -- Cálculo fiscal por región
- **Exportación** -- Exportación de datos en CSV/Excel

### Plataforma
- **17 idiomas** -- AR, BN, DE, EN, ES, FR, HI, ID, IT, JA, KO, MS, PT, RU, TR, UR, ZH
- **IA** -- Recomendaciones de productos, búsqueda inteligente
- **Blog/CMS** -- Gestión de contenido
- **Chat** -- Mensajería en tiempo real cliente-vendedor
- **Notificaciones** -- Correo, WebSocket, push
- **Panel de admin** -- Analíticas completas de la plataforma

## Gestión de Entregas

Operaciones de entrega y envío a nivel de plataforma en un solo lugar: configura métodos y zonas de envío, registra y gestiona socios de entrega, sigue envíos activos y observa KPIs como tiempo promedio de entrega y envíos en tránsito de un vistazo.

![Gestión de Entregas](./docs/screenshots/VastyDelivery.png)

## Constructor de Tienda

Los vendedores diseñan su propia tienda con un editor de páginas de arrastrar y soltar — banners, productos destacados, categorías, testimonios y páginas personalizadas — con una vista previa en vivo que muestra cada cambio al instante.

![Constructor de Tienda](./docs/screenshots/VastyAppPreview.png)

## Tecnologías

| Capa | Tecnología |
|-------|------------|
| **Backend** | NestJS, TypeScript, PostgreSQL (SQL directo), Redis, Socket.io |
| **Frontend** | React, Vite, TypeScript, Tailwind CSS, Radix UI, i18next |
| **Almacenamiento** | Conectable: local-fs, S3, Cloudflare R2, MinIO, B2, GCS, Azure |
| **Pagos** | Stripe, Stripe Connect, PayPal |
| **IA** | OpenAI, Anthropic, Gemini, Groq, Ollama |
| **Búsqueda** | PostgreSQL (pg-trgm), Meilisearch, Typesense |

## Estructura del proyecto

```
vasty-shop/
├── backend/              # API NestJS (69 módulos, 80+ tablas)
│   ├── src/modules/      # products, orders, cart, payments, delivery,
│   │                     # campaigns, coupons, flash-sales, gift-cards,
│   │                     # loyalty, referral, pos, ai, blog, chat, ...
│   └── migrations/       # Migraciones PostgreSQL
├── frontend/             # React + Vite + Tailwind (17 idiomas)
├── shared/               # Tipos y utilidades compartidas
└── .github/workflows/    # CI/CD
```

## Colaboradores

¡Gracias a todas las personas increíbles que han contribuido a Vasty Shop! 🎉

<a href="https://github.com/vasty-shop/vasty-shop/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=vasty-shop/vasty-shop&anon=1&max=100&columns=10" />
</a>

¿Quieres ver tu cara aquí? Consulta nuestra [Guía de Contribución](CONTRIBUTING.md) y empieza a contribuir hoy mismo.

## Actividad del proyecto

<p align="center">
  <img src="https://img.shields.io/github/stars/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=yellow" alt="Stars">
  <img src="https://img.shields.io/github/forks/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=blue" alt="Forks">
  <img src="https://img.shields.io/github/contributors/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=green" alt="Contributors">
  <img src="https://img.shields.io/github/last-commit/vasty-shop/vasty-shop?style=for-the-badge&logo=github&color=orange" alt="Last Commit">
</p>

## Seguridad

Por favor, reporta vulnerabilidades de forma responsable. Consulta [SECURITY.md](SECURITY.md).

## Licencia

Este proyecto está licenciado bajo la **Licencia AGPL-3.0** — consulta el archivo [LICENSE](LICENSE) para más detalles.

Esto significa que puedes usar, modificar y distribuir libremente este software, pero cualquier modificación también debe publicarse como código abierto bajo la misma licencia.

Copyright 2025 Vasty Shop Contributors.
