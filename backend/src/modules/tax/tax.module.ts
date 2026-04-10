import { Module } from '@nestjs/common';
import { TaxController } from './tax.controller';
import { TaxService } from './tax.service';

@Module({
  controllers: [TaxController],
  providers: [TaxService],
  exports: [TaxService], // Export service for use in other modules
})
export class TaxModule {}
