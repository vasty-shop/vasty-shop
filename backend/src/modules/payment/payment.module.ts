import { AuthModule } from '../auth/auth.module';
import { Module, forwardRef, OnModuleInit } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { StripeConnectController } from './stripe-connect.controller';
import { StripeConnectService } from './stripe-connect.service';
import { OrdersModule } from '../orders/orders.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrdersService } from '../orders/orders.service';
import { ModuleRef } from '@nestjs/core';

@Module({
  imports: [AuthModule,
    forwardRef(() => OrdersModule),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [PaymentController, StripeConnectController],
  providers: [PaymentService, StripeConnectService],
  exports: [PaymentService, StripeConnectService],
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
