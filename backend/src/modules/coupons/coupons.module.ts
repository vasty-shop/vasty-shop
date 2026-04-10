import { AuthModule } from '../auth/auth.module';
import { Module, forwardRef } from '@nestjs/common';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [AuthModule, forwardRef(() => SubscriptionModule)],
  controllers: [CouponsController],
  providers: [CouponsService],
  exports: [CouponsService],
})
export class CouponsModule {}
