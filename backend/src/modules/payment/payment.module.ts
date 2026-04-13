import { AuthModule } from '../auth/auth.module';
import { Module, forwardRef, OnModuleInit } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { StripeConnectController } from './stripe-connect.controller';
import { StripeConnectService } from './stripe-connect.service';
import { PaymentProviderService } from './payment-provider.service';
import { OrdersModule } from '../orders/orders.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrdersService } from '../orders/orders.service';
import { ModuleRef } from '@nestjs/core';

/**
 * Payment module.
 *
 * Exposes three services:
 *
 * - `PaymentProviderService` (NEW, pluggable)
 *   The façade over the multi-provider adapter (stripe, paypal,
 *   bkash, none). Switch providers with `PAYMENT_PROVIDER` in .env.
 *   See `docs/providers/payments.md`.
 *
 * - `PaymentService` (legacy, Stripe-hardcoded)
 *   Still exported for backwards compatibility. The existing
 *   controllers + circular OrdersService wiring still use it.
 *
 * - `StripeConnectService` (legacy, Stripe-specific)
 *   Handles vendor onboarding + account status queries. Still
 *   Stripe-only until the follow-up multi-vendor PR.
 */
@Module({
  imports: [AuthModule,
    forwardRef(() => OrdersModule),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [PaymentController, StripeConnectController],
  providers: [PaymentService, StripeConnectService, PaymentProviderService],
  exports: [PaymentService, StripeConnectService, PaymentProviderService],
})
export class PaymentModule implements OnModuleInit {
  constructor(
    private moduleRef: ModuleRef,
    private paymentService: PaymentService,
    private stripeConnectService: StripeConnectService,
  ) {}

  onModuleInit() {
    // Set up circular dependencies after module initialization
    const ordersService = this.moduleRef.get(OrdersService, { strict: false });

    this.paymentService.setOrdersService(ordersService);
    this.paymentService.setStripeConnectService(this.stripeConnectService);
  }
}
