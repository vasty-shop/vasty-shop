# Tax Module Integration Guide

## Quick Start

### 1. Register the Module

Add `TaxModule` to your main application module:

**File: `/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TaxModule } from './modules/tax/tax.module';

@Module({
  imports: [
    TaxModule, // Add this line
    // ... other modules
  ],
})
export class AppModule {}
```

### 2. That's it!

The tax module is now available at:
- `POST /api/tax/calculate` - Calculate taxes
- `GET /api/tax/rates/:countryCode` - Get tax rates

## Advanced Integration

### Using TaxService in Other Modules

If you want to use the tax calculation logic in other services:

**Example: OrderModule**

```typescript
// order.module.ts
import { Module } from '@nestjs/common';
import { TaxModule } from '../tax/tax.module';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';

@Module({
  imports: [
    TaxModule, // Import TaxModule to use TaxService
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
```

**Example: OrderService**

```typescript
// order.service.ts
import { Injectable } from '@nestjs/common';
import { TaxService } from '../tax/tax.service';
import { TaxCategory } from '../tax/config/tax-rates.config';

@Injectable()
export class OrderService {
  constructor(private readonly taxService: TaxService) {}

  async createOrder(orderDto: CreateOrderDto) {
    // Calculate tax for the order
    const taxResult = await this.taxService.calculateTax({
      countryCode: orderDto.shippingAddress.countryCode,
      provinceCode: orderDto.shippingAddress.provinceCode,
      currency: orderDto.currency,
      items: orderDto.items.map(item => ({
        itemId: item.productId,
        itemName: item.productName,
        unitPrice: item.price,
        quantity: item.quantity,
        category: this.mapProductCategoryToTaxCategory(item.category),
      })),
    });

    // Create order with tax information
    return {
      orderId: this.generateOrderId(),
      items: orderDto.items,
      subtotal: taxResult.subtotal,
      tax: taxResult.totalTax,
      taxDetails: taxResult,
      total: taxResult.grandTotal,
      currency: orderDto.currency,
      createdAt: new Date(),
    };
  }

  private mapProductCategoryToTaxCategory(productCategory: string): TaxCategory {
    const categoryMap: Record<string, TaxCategory> = {
      'food': TaxCategory.ESSENTIAL_FOOD,
      'groceries': TaxCategory.ESSENTIAL_FOOD,
      'electronics': TaxCategory.ELECTRONICS,
      'clothing': TaxCategory.CLOTHING,
      'luxury': TaxCategory.LUXURY_GOODS,
      'services': TaxCategory.SERVICES,
    };

    return categoryMap[productCategory.toLowerCase()] || TaxCategory.STANDARD;
  }
}
```

### Using in GraphQL Resolvers

**Example: CheckoutResolver**

```typescript
import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { TaxService } from '../tax/tax.service';

@Resolver()
export class CheckoutResolver {
  constructor(private readonly taxService: TaxService) {}

  @Mutation(() => CheckoutResult)
  async calculateCheckout(
    @Args('input') input: CheckoutInput,
  ): Promise<CheckoutResult> {
    const taxResult = await this.taxService.calculateTax({
      countryCode: input.countryCode,
      provinceCode: input.provinceCode,
      currency: input.currency,
      items: input.items,
    });

    return {
      subtotal: taxResult.subtotal,
      tax: taxResult.totalTax,
      total: taxResult.grandTotal,
      taxBreakdown: taxResult.taxSummary,
    };
  }
}
```

## Configuration

### Environment Variables (Optional)

If you want to override tax rates via environment variables:

```env
# .env
TAX_JP_STANDARD_RATE=10.0
TAX_JP_REDUCED_RATE=8.0
TAX_BD_STANDARD_RATE=15.0
TAX_CA_GST_RATE=5.0
```

Then modify `tax-rates.config.ts` to use ConfigService if needed.

## Validation

The module uses class-validator for input validation. Ensure you have the following installed:

```bash
npm install class-validator class-transformer
```

And enable validation pipes in your main.ts:

```typescript
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  await app.listen(3000);
}
bootstrap();
```

## Swagger Documentation

The module includes Swagger decorators. To enable API documentation:

```bash
npm install @nestjs/swagger swagger-ui-express
```

**File: `main.ts`**

```typescript
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Fluxez Shop API')
    .setDescription('E-commerce API with tax calculation')
    .setVersion('1.0')
    .addTag('Tax', 'Tax calculation endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
bootstrap();
```

Access Swagger UI at: `http://localhost:3000/api/docs`

## Testing the Module

### Unit Tests

```typescript
// tax.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TaxService } from './tax.service';
import { BadRequestException } from '@nestjs/common';
import { TaxCategory } from './config/tax-rates.config';

describe('TaxService', () => {
  let service: TaxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaxService],
    }).compile();

    service = module.get<TaxService>(TaxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateTax', () => {
    it('should calculate Japan reduced rate correctly', async () => {
      const result = await service.calculateTax({
        countryCode: 'JP',
        items: [
          {
            itemId: 'test-001',
            itemName: 'Rice',
            unitPrice: 1000,
            quantity: 1,
            category: TaxCategory.ESSENTIAL_FOOD,
          },
        ],
      });

      expect(result.countryCode).toBe('JP');
      expect(result.subtotal).toBe(1000);
      expect(result.totalTax).toBe(80); // 8% of 1000
      expect(result.grandTotal).toBe(1080);
    });

    it('should calculate Bangladesh VAT exempt correctly', async () => {
      const result = await service.calculateTax({
        countryCode: 'BD',
        items: [
          {
            itemId: 'test-002',
            itemName: 'Rice',
            unitPrice: 100,
            quantity: 10,
            category: TaxCategory.ESSENTIAL_FOOD,
          },
        ],
      });

      expect(result.countryCode).toBe('BD');
      expect(result.subtotal).toBe(1000);
      expect(result.totalTax).toBe(0); // 0% for essential food
      expect(result.grandTotal).toBe(1000);
    });

    it('should calculate Canada HST correctly', async () => {
      const result = await service.calculateTax({
        countryCode: 'CA',
        provinceCode: 'ON',
        items: [
          {
            itemId: 'test-003',
            itemName: 'Book',
            unitPrice: 100,
            quantity: 1,
          },
        ],
      });

      expect(result.countryCode).toBe('CA');
      expect(result.provinceCode).toBe('ON');
      expect(result.subtotal).toBe(100);
      expect(result.totalTax).toBe(13); // 13% HST
      expect(result.grandTotal).toBe(113);
    });

    it('should throw error for unsupported country', async () => {
      await expect(
        service.calculateTax({
          countryCode: 'US',
          items: [
            {
              itemId: 'test-004',
              itemName: 'Item',
              unitPrice: 100,
              quantity: 1,
            },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error for Canada without province', async () => {
      await expect(
        service.calculateTax({
          countryCode: 'CA',
          items: [
            {
              itemId: 'test-005',
              itemName: 'Item',
              unitPrice: 100,
              quantity: 1,
            },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTaxRates', () => {
    it('should return Japan tax rates', async () => {
      const result = await service.getTaxRates('JP');

      expect(result.countryCode).toBe('JP');
      expect(result.countryName).toBe('Japan');
      expect(result.defaultRate).toBe(10);
      expect(result.categoryRates).toBeDefined();
    });

    it('should throw error for unsupported country', async () => {
      await expect(service.getTaxRates('US')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
```

Run tests:
```bash
npm run test
```

### E2E Tests

```typescript
// tax.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TaxModule } from '../src/modules/tax/tax.module';

describe('Tax Module (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TaxModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/api/tax/calculate (POST)', () => {
    it('should calculate tax for Japan', () => {
      return request(app.getHttpServer())
        .post('/api/tax/calculate')
        .send({
          countryCode: 'JP',
          items: [
            {
              itemId: 'test-001',
              itemName: 'Rice',
              unitPrice: 1000,
              quantity: 1,
              category: 'ESSENTIAL_FOOD',
            },
          ],
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.countryCode).toBe('JP');
          expect(res.body.totalTax).toBe(80);
        });
    });

    it('should return 400 for unsupported country', () => {
      return request(app.getHttpServer())
        .post('/api/tax/calculate')
        .send({
          countryCode: 'US',
          items: [
            {
              itemId: 'test-001',
              itemName: 'Item',
              unitPrice: 100,
              quantity: 1,
            },
          ],
        })
        .expect(400);
    });
  });

  describe('/api/tax/rates/:countryCode (GET)', () => {
    it('should return tax rates for Japan', () => {
      return request(app.getHttpServer())
        .get('/api/tax/rates/JP')
        .expect(200)
        .expect((res) => {
          expect(res.body.countryCode).toBe('JP');
          expect(res.body.defaultRate).toBe(10);
        });
    });

    it('should return 400 for unsupported country', () => {
      return request(app.getHttpServer())
        .get('/api/tax/rates/US')
        .expect(400);
    });
  });
});
```

Run E2E tests:
```bash
npm run test:e2e
```

## Common Patterns

### 1. Cart Tax Calculation

```typescript
async calculateCartTax(cart: Cart, shippingAddress: Address) {
  return this.taxService.calculateTax({
    countryCode: shippingAddress.countryCode,
    provinceCode: shippingAddress.provinceCode,
    currency: cart.currency,
    items: cart.items.map(item => ({
      itemId: item.id,
      itemName: item.name,
      unitPrice: item.price,
      quantity: item.quantity,
      category: item.taxCategory,
    })),
  });
}
```

### 2. Invoice Generation

```typescript
async generateInvoice(orderId: string) {
  const order = await this.getOrder(orderId);

  const taxResult = await this.taxService.calculateTax({
    countryCode: order.billingAddress.countryCode,
    provinceCode: order.billingAddress.provinceCode,
    currency: order.currency,
    items: order.items,
  });

  return {
    invoiceNumber: this.generateInvoiceNumber(),
    order,
    taxSummary: taxResult.taxSummary,
    subtotal: taxResult.subtotal,
    tax: taxResult.totalTax,
    total: taxResult.grandTotal,
  };
}
```

### 3. Price Display with Tax

```typescript
async getProductWithTax(
  productId: string,
  countryCode: string,
  provinceCode?: string,
) {
  const product = await this.getProduct(productId);

  const taxResult = await this.taxService.calculateTax({
    countryCode,
    provinceCode,
    items: [
      {
        itemId: product.id,
        itemName: product.name,
        unitPrice: product.price,
        quantity: 1,
        category: product.taxCategory,
      },
    ],
  });

  return {
    ...product,
    priceBeforeTax: product.price,
    taxRate: taxResult.items[0].taxRate,
    taxAmount: taxResult.items[0].taxAmount,
    priceAfterTax: taxResult.items[0].total,
  };
}
```

## Troubleshooting

### Issue: "Country code is not supported"
**Solution:** Ensure you're using one of the supported country codes: JP, BD, CA (case-insensitive)

### Issue: "Province code is required for Canada"
**Solution:** Always provide `provinceCode` when `countryCode` is 'CA'

### Issue: Validation errors
**Solution:** Ensure ValidationPipe is enabled globally in main.ts

### Issue: Tax rates seem incorrect
**Solution:** Check the category mapping and ensure you're using the correct TaxCategory enum

## Support

For questions or issues:
1. Check the README.md for basic usage
2. Review EXAMPLES.md for request/response examples
3. Consult this integration guide for advanced usage
4. Review the source code comments in tax.service.ts

## License

This module is part of the Fluxez Shop backend application.
