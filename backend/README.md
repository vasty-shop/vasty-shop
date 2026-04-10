# Fluxez Shop Backend

A comprehensive e-commerce backend built with NestJS and Fluxez SDK, supporting multi-vendor marketplace functionality.

## Features

### Core E-commerce
- ✅ **Products & Categories**: Full CRUD, variants, inventory management, SEO-friendly slugs
- ✅ **Shopping Cart**: Guest and user carts, coupon application, cart calculations
- ✅ **Orders**: Order creation, status tracking, timeline, order number generation
- ✅ **Payments**: Stripe integration, payment intent creation, transaction tracking
- ✅ **Delivery**: Address management, delivery tracking, notifications
- ✅ **Wishlist**: Multiple wishlists, privacy settings, share functionality
- ✅ **Reviews**: Product reviews, verified purchases, shop responses, moderation

### Marketing
- ✅ **Campaigns**: Flash sales, seasonal promotions, analytics tracking
- ✅ **Offers**: Percentage discounts, fixed discounts, free shipping, BOGO deals

### Multi-Vendor
- ✅ **Shops**: Multiple shops per platform, shop profiles, statistics
- ✅ **Team Management**: Shop owners, admins, managers, staff with role-based permissions
- ✅ **Shop Analytics**: Sales tracking, revenue reports

### Authentication
- ✅ **Fluxez Auth**: Managed by Fluxez auth.users table
- ✅ **JWT**: Token-based authentication
- ✅ **Role-Based Access**: Guards for shop owners, admins, team members

## Tech Stack

- **Framework**: NestJS 10.3.0
- **Database**: PostgreSQL via Fluxez SDK
- **Authentication**: Fluxez Auth + JWT
- **Payments**: Stripe v19.1.0
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator, class-transformer
- **Language**: TypeScript 5.9.2

## Project Structure

```
backend/
├── src/
│   ├── common/              # Shared utilities
│   │   ├── decorators/      # Custom decorators (Roles)
│   │   └── guards/          # Auth guards (RolesGuard, ShopOwnerGuard)
│   ├── database/
│   │   └── schema.ts        # Fluxez database schema (15 tables)
│   ├── modules/
│   │   ├── fluxez/          # Fluxez service wrapper
│   │   ├── auth/            # Authentication module
│   │   ├── products/        # Products & Categories
│   │   ├── shops/           # Multi-vendor shops
│   │   ├── cart/            # Shopping cart
│   │   ├── orders/          # Order management
│   │   ├── payment/         # Stripe payments
│   │   ├── delivery/        # Delivery & tracking
│   │   ├── campaigns/       # Marketing campaigns
│   │   ├── offers/          # Discount offers
│   │   ├── wishlist/        # Wishlist management
│   │   ├── reviews/         # Product reviews
│   │   └── notifications/   # In-app notifications
│   ├── app.module.ts        # Root module
│   └── main.ts              # Entry point
├── .env                     # Development environment
├── .env.production          # Production environment
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript config
```

## Database Schema

### Tables (15 total)

1. **shops** - Multi-vendor shop profiles
2. **shop_team_members** - Team members with roles
3. **products** - Product catalog with variants
4. **categories** - Product categories (hierarchical)
5. **carts** - Shopping carts (guest + user)
6. **orders** - Order records
7. **order_items** - Order line items
8. **campaigns** - Marketing campaigns
9. **offers** - Discount offers
10. **delivery_addresses** - Customer addresses
11. **delivery_tracking** - Package tracking
12. **wishlists** - User wishlists
13. **reviews** - Product reviews
14. **payment_transactions** - Payment records
15. **notifications** - In-app notifications

### Users
Users are managed by Fluxez in the `auth.users` table. All application tables reference `user_id` (string) which corresponds to the Fluxez user ID.

## Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database (via Fluxez)
- Stripe account

### Steps

1. **Install dependencies**:
```bash
cd backend
npm install
```

2. **Configure environment**:

Copy `.env.example` to `.env` and fill in:

```bash
# Fluxez Configuration
FLUXEZ_API_KEY=your_service_key_here
FLUXEZ_ANON_KEY=your_anon_key_here

# Server Configuration
PORT=5186
NODE_ENV=development
API_PREFIX=api/v1

# Frontend CORS
CORS_ORIGIN=http://localhost:4007
FRONTEND_URL=http://localhost:4007

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

3. **Run database migration**:
```bash
npm run migrate
```

This will create all 15 tables in your Fluxez database.

4. **Start development server**:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3001/api/v1`

## API Documentation

Once the server is running, access the Swagger documentation at:
```
http://localhost:3001/api/docs
```

## API Endpoints

### Products
- `GET /api/v1/products` - List products (with filters)
- `GET /api/v1/products/:id` - Get product details
- `POST /api/v1/products` - Create product (shop owner)
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

### Categories
- `GET /api/v1/categories` - List categories
- `GET /api/v1/categories/:id` - Get category details
- `POST /api/v1/categories` - Create category
- `PUT /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

### Cart
- `GET /api/v1/cart` - Get user cart
- `POST /api/v1/cart/add` - Add item to cart
- `PUT /api/v1/cart/update` - Update cart item
- `DELETE /api/v1/cart/remove/:productId` - Remove from cart
- `POST /api/v1/cart/apply-coupon` - Apply coupon
- `DELETE /api/v1/cart/clear` - Clear cart

### Orders
- `GET /api/v1/orders` - List user orders
- `GET /api/v1/orders/:id` - Get order details
- `POST /api/v1/orders` - Create order
- `PATCH /api/v1/orders/:id/status` - Update order status
- `POST /api/v1/orders/:id/cancel` - Cancel order

### Shops
- `GET /api/v1/shops` - List shops
- `GET /api/v1/shops/:id` - Get shop details
- `POST /api/v1/shops` - Create shop
- `PUT /api/v1/shops/:id` - Update shop
- `POST /api/v1/shops/:shopId/team/invite` - Invite team member
- `GET /api/v1/shops/:shopId/team` - List team members

### Wishlist
- `GET /api/v1/wishlist` - Get user wishlists
- `POST /api/v1/wishlist/add` - Add to wishlist
- `DELETE /api/v1/wishlist/remove/:productId` - Remove from wishlist
- `GET /api/v1/wishlist/check/:productId` - Check if in wishlist
- `POST /api/v1/wishlist/:id/move-to-cart` - Move to cart

### Reviews
- `POST /api/v1/reviews` - Create review
- `GET /api/v1/reviews/product/:productId` - Get product reviews
- `GET /api/v1/reviews/product/:productId/summary` - Get review summary
- `PUT /api/v1/reviews/:id` - Update review
- `DELETE /api/v1/reviews/:id` - Delete review
- `POST /api/v1/reviews/:id/helpful` - Mark helpful
- `POST /api/v1/reviews/:id/respond` - Shop response

### Payment
- `POST /api/v1/payment/create-intent` - Create payment intent
- `POST /api/v1/payment/webhook` - Stripe webhook

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

Use the Fluxez auth endpoints to sign in and get a token:

```bash
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "user@example.com"
  }
}
```

## Role-Based Access Control

### User Roles

- `admin` - Platform administrators
- `user` - Regular customers
- `shop_owner` - Shop owners (full shop access)
- `shop_admin` - Shop administrators
- `shop_manager` - Shop managers
- `shop_staff` - Shop staff (limited access)

### Shop Team Roles

- **Owner**: Full access to shop, can manage team
- **Admin**: Manage products, orders, team (except owner)
- **Manager**: Manage products, orders, view analytics
- **Staff**: View products, update order status

### Using Guards

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ShopOwnerGuard } from './common/guards/shop-owner.guard';
import { Roles, UserRole } from './common/decorators/roles.decorator';
import { RolesGuard } from './common/guards/roles.guard';

// Require authentication only
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile() { }

// Require admin role
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Get('admin-only')
adminEndpoint() { }

// Require shop ownership
@UseGuards(JwtAuthGuard, ShopOwnerGuard)
@Post('shops/:shopId/products')
createProduct() { }
```

## Migration

To create or update the database schema:

```bash
npm run migrate
```

This command:
1. Builds the project
2. Runs the Fluxez migration tool
3. Creates/updates all 15 tables in the database

### Manual Migration

```bash
# Build first
npm run build

# Run migration
npx fluxez migrate dist/src/database/schema.js
```

## Deployment

### Production Checklist

1. **Environment Variables**:
   - Set production environment variables in `.env.production`
   - Use production Fluxez keys
   - Use production Stripe keys
   - Set secure JWT_SECRET

2. **Build**:
```bash
npm run build
```

3. **Run Migration**:
```bash
NODE_ENV=production npm run migrate
```

4. **Start Server**:
```bash
NODE_ENV=production npm run start:prod
```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 5186

CMD ["node", "dist/main.js"]
```

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `FLUXEZ_API_KEY` | Fluxez service key | `service_abc123...` |
| `FLUXEZ_ANON_KEY` | Fluxez anon key | `anon_xyz456...` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `API_PREFIX` | API prefix | `api/v1` |
| `CORS_ORIGIN` | CORS origin | `http://localhost:4007` |
| `JWT_EXPIRES_IN` | JWT expiration | `7d` |

## TODO / Future Enhancements

### Payment
- [ ] Direct card payments (currently only subscription)
- [ ] PayPal integration
- [ ] Apple Pay
- [ ] Google Pay
- [ ] Split payments for multi-vendor orders

### Wishlist
- [ ] Price drop tracking
- [ ] Back-in-stock alerts
- [ ] Email notifications for price drops
- [ ] Wishlist sharing via email

### Reviews
- [ ] Review moderation queue
- [ ] Review analytics
- [ ] Review reply notifications
- [ ] Review images upload
- [ ] Bulk moderation for admins

### General
- [x] Real-time notifications (WebSocket) - IMPLEMENTED
- [x] Email notifications (Email Templates Module) - IMPLEMENTED
- [x] SMS notifications - IMPLEMENTED (Phase 3)
- [ ] Advanced analytics dashboard
- [x] Export reports (CSV, JSON) - IMPLEMENTED
- [x] Multi-language support (i18n) - IMPLEMENTED (Phase 3)
- [x] Currency conversion - IMPLEMENTED

## Phase 3 Features (NEW)

### Multi-Language Support (i18n)
- **16 API endpoints** for language and translation management
- Language CRUD with RTL/LTR direction support
- Translation namespacing (common, product, checkout, etc.)
- Content translations for products, categories, pages
- Import/Export translations as JSON
- Translation progress tracking per language
- In-memory caching for performance

### SMS Notifications
- **14 API endpoints** for SMS management
- 5 provider integrations: Twilio, Nexmo, AWS SNS, MSG91, Firebase
- 25+ SMS template types (OTP, orders, payments, marketing)
- OTP system with configurable length and expiry
- Bulk SMS with per-recipient variables
- Delivery status webhooks
- SMS logging and statistics

### Delivery Zones
- **15 API endpoints** for zone management
- 4 zone types: polygon, circle, city, postal_code
- Point-in-polygon and Haversine distance calculations
- Multiple delivery options per zone (standard, express, same-day)
- Per-zone pricing with distance-based fees
- Shop-specific zone overrides
- Free delivery threshold support

### Store Schedule
- **15 API endpoints** for schedule management
- Weekly schedule with multiple time slots per day
- Holiday management with recurring support
- Temporary closures with custom messages
- Pre-order configuration with lead time
- Real-time availability checking
- Available time slot generation

### Disbursement Management
- **14 API endpoints** for vendor payouts
- 5 payment methods: bank transfer, Stripe Connect, PayPal, wallet, check
- Configurable payout schedules (daily, weekly, monthly, on-demand)
- Balance tracking with hold periods
- 1% platform fee on withdrawals
- Stripe Connect Express onboarding
- Disbursement request workflow (pending → processing → completed)

### Gift Cards
- **16 API endpoints** for gift card management
- Preset and custom amount support
- Digital and physical card types
- Partial redemption support
- Gift card transfers between users
- Top-up functionality
- Transaction history tracking
- Admin statistics dashboard

## Phase 4 Features (NEW)

### Surge Pricing
- **11 API endpoints** for dynamic pricing
- 5 surge types: time-based, demand-based, zone-based, event-based, weather-based
- Applies to: delivery fees, product prices, or all
- Configurable multipliers (1x-10x) with max surge caps
- Time window configuration (specific days/hours)
- Demand-based thresholds with automatic surge levels
- Priority-based rule stacking
- Real-time surge calculation endpoint
- Statistics and analytics dashboard

### Expense Tracking
- **16 API endpoints** for vendor expense management
- 15 built-in categories + custom categories per shop
- Full CRUD for expenses with approval workflow
- Status flow: pending → approved/rejected → paid
- Recurring expense support (daily/weekly/monthly/quarterly/yearly)
- Budget management per category with alerts
- Receipt/attachment upload support
- Tax deductible tracking
- Expense reports with projections
- CSV/JSON export functionality
- Monthly trend analysis

### AI Product Auto-Fill
- **15 API endpoints** for AI-powered product management
- OpenAI GPT-4o integration for image analysis
- Auto-fill from: product images, text/name, barcode/UPC
- AI description generation with tone/length options
- Description improvement suggestions
- SEO metadata generation (meta title, description, slug, keywords)
- Automatic tag generation
- Category suggestions from available categories
- Pricing suggestions based on product analysis
- Image analysis: color extraction, object detection, alt text
- Product translation to any language
- Bulk auto-fill for multiple products
- Configurable AI settings per shop
- Usage statistics and cost tracking

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Support

For issues or questions:
- Fluxez Documentation: https://docs.fluxez.com
- NestJS Documentation: https://docs.nestjs.com
- Stripe Documentation: https://stripe.com/docs

## License

MIT
