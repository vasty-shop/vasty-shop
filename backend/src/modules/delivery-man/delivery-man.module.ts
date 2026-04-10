import { AuthModule } from '../auth/auth.module';
import { Module, forwardRef } from '@nestjs/common';
import { DeliveryManController } from './delivery-man.controller';
import { DeliveryManService } from './delivery-man.service';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [AuthModule, forwardRef(() => PaymentModule)],
  controllers: [DeliveryManController],
  providers: [DeliveryManService],
  exports: [DeliveryManService],
})
export class DeliveryManModule {}
