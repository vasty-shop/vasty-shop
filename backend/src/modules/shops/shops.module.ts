import { AuthModule } from '../auth/auth.module';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';
import { ShopInvitationService } from './shop-invitation.service';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    JwtModule,
    forwardRef(() => SubscriptionModule),
  ],
  controllers: [ShopsController],
  providers: [ShopsService, ShopInvitationService],
  exports: [ShopsService, ShopInvitationService],
})
export class ShopsModule {}
