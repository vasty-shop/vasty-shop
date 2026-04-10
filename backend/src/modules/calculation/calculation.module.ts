import { Module } from '@nestjs/common';
import { CalculationController } from './calculation.controller';
import { CalculationService } from './calculation.service';
import { CurrencyModule } from '../currency/currency.module';
import { TaxModule } from '../tax/tax.module';

@Module({
  imports: [
    CurrencyModule, // Import for currency formatting
    TaxModule, // Import for tax calculations
  ],
  controllers: [CalculationController],
  providers: [CalculationService],
  exports: [CalculationService], // Export for use in other modules
})
export class CalculationModule {}
