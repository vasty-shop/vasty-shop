import { AuthModule } from '../auth/auth.module';
import { Module } from '@nestjs/common';
import { POSController } from './pos.controller';
import { POSService } from './pos.service';

@Module({
  imports: [AuthModule],
  controllers: [POSController],
  providers: [POSService],
  exports: [POSService],
})
export class POSModule {}
