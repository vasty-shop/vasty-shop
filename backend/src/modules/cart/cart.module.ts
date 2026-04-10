import { AuthModule } from '../auth/auth.module';
import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { TaxModule } from '../tax/tax.module';
import { DeliveryModule } from '../delivery/delivery.module';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [AuthModule, TaxModule, DeliveryModule, CurrencyModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
