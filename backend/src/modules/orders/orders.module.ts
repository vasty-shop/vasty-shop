import { Module, forwardRef } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthModule } from '../auth/auth.module';
import { CurrencyModule } from '../currency/currency.module';
import { PaymentModule } from '../payment/payment.module';
import { DigitalProductsModule } from '../digital-products/digital-products.module';

@Module({
  imports: [
    AuthModule,
    CurrencyModule,
    forwardRef(() => NotificationsModule),
    forwardRef(() => PaymentModule),
    DigitalProductsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
