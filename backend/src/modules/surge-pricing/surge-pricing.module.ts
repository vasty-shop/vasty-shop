import { AuthModule } from '../auth/auth.module';
import { Module } from '@nestjs/common';
import { SurgePricingController } from './surge-pricing.controller';
import { SurgePricingService } from './surge-pricing.service';

@Module({
  imports: [AuthModule],
  controllers: [SurgePricingController],
  providers: [SurgePricingService],
  exports: [SurgePricingService],
})
export class SurgePricingModule {}
