import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import {
  CalculateTaxDto,
  TaxCalculationResultDto,
  TaxLineItemResultDto,
  TaxRatesResponseDto,
} from './dto/calculate-tax.dto';
import {
  getTaxConfig,
  isSupportedCountry,
  TaxCategory,
  CountryTaxConfig,
  ProvinceTaxRate,
} from './config/tax-rates.config';

@Injectable()
export class TaxService {
  private readonly logger = new Logger(TaxService.name);

  /**
   * Calculate tax for given items based on country and province
   */
  async calculateTax(input: CalculateTaxDto): Promise<TaxCalculationResultDto> {
    this.logger.log(`Calculating tax for country: ${input.countryCode}`);

    // Validate country code
    if (!isSupportedCountry(input.countryCode)) {
      throw new BadRequestException(
        `Country code '${input.countryCode}' is not supported. Supported countries: JP, BD, CA`,
      );
    }

    const taxConfig = getTaxConfig(input.countryCode);
    if (!taxConfig) {
      throw new BadRequestException(`Tax configuration not found for country: ${input.countryCode}`);
    }

    // Validate Canada province requirement
    if (input.countryCode.toUpperCase() === 'CA' && !input.provinceCode) {
      throw new BadRequestException('Province code is required for Canada tax calculations');
    }

    // Validate items
    if (!input.items || input.items.length === 0) {
      throw new BadRequestException('At least one item is required for tax calculation');
    }

    // Get province info for Canada
    let provinceInfo: ProvinceTaxRate | null = null;
    if (input.countryCode.toUpperCase() === 'CA' && input.provinceCode) {
      provinceInfo = this.getProvinceRate(taxConfig, input.provinceCode);
      if (!provinceInfo) {
        throw new BadRequestException(
          `Invalid province code: ${input.provinceCode}. Please use valid Canadian province codes.`,
        );
      }
    }

    // Calculate tax for each item
    const itemResults: TaxLineItemResultDto[] = [];
    let subtotal = 0;
    let totalTax = 0;

    for (const item of input.items) {
      const itemSubtotal = item.unitPrice * item.quantity;
      const taxRate = this.determineTaxRate(taxConfig, item.category, provinceInfo);
      const taxAmount = this.calculateItemTax(itemSubtotal, taxRate, provinceInfo);
      const itemTotal = itemSubtotal + taxAmount;

      const itemResult: TaxLineItemResultDto = {
        itemId: item.itemId,
        itemName: item.itemName,
        subtotal: this.roundTo2Decimals(itemSubtotal),
        taxRate: this.roundTo2Decimals(taxRate),
        taxAmount: this.roundTo2Decimals(taxAmount),
        total: this.roundTo2Decimals(itemTotal),
        category: item.category,
      };

      // Add tax breakdown for Canada
      if (input.countryCode.toUpperCase() === 'CA' && provinceInfo) {
        itemResult.taxBreakdown = this.calculateCanadaTaxBreakdown(itemSubtotal, provinceInfo);
      }

      itemResults.push(itemResult);
      subtotal += itemSubtotal;
      totalTax += taxAmount;
    }

    // Generate tax summary
    const taxSummary = this.generateTaxSummary(itemResults);

    const result: TaxCalculationResultDto = {
      countryCode: taxConfig.countryCode,
      countryName: taxConfig.countryName,
      provinceCode: input.provinceCode?.toUpperCase(),
      provinceName: provinceInfo?.provinceName,
      subtotal: this.roundTo2Decimals(subtotal),
      totalTax: this.roundTo2Decimals(totalTax),
      grandTotal: this.roundTo2Decimals(subtotal + totalTax),
      currency: input.currency || 'USD',
      items: itemResults,
      taxSummary,
      calculatedAt: new Date().toISOString(),
    };

    this.logger.log(
      `Tax calculation completed: ${result.items.length} items, total tax: ${result.totalTax}`,
    );

    return result;
  }

  /**
   * Get tax rates for a specific country
   */
  async getTaxRates(countryCode: string): Promise<TaxRatesResponseDto> {
    this.logger.log(`Fetching tax rates for country: ${countryCode}`);

    if (!isSupportedCountry(countryCode)) {
      throw new BadRequestException(
        `Country code '${countryCode}' is not supported. Supported countries: JP, BD, CA`,
      );
    }

    const taxConfig = getTaxConfig(countryCode);
    if (!taxConfig) {
      throw new BadRequestException(`Tax configuration not found for country: ${countryCode}`);
    }

    const response: TaxRatesResponseDto = {
      countryCode: taxConfig.countryCode,
      countryName: taxConfig.countryName,
      defaultRate: taxConfig.defaultRate,
      categoryRates: taxConfig.categoryRates as Record<string, number>,
      provinceRates: taxConfig.provinceRates,
      metadata: {
        lastUpdated: '2025-10-29',
        notes: this.getTaxNotes(countryCode),
      },
    };

    return response;
  }

  /**
   * Determine the applicable tax rate for an item
   */
  private determineTaxRate(
    config: CountryTaxConfig,
    category?: TaxCategory,
    provinceInfo?: ProvinceTaxRate | null,
  ): number {
    // For Canada, use province rate
    if (config.countryCode === 'CA' && provinceInfo) {
      return provinceInfo.totalRate;
    }

    // For other countries, use category rate if available
    if (category && config.categoryRates && category in config.categoryRates) {
      return config.categoryRates[category];
    }

    // Fall back to default rate
    return config.defaultRate;
  }

  /**
   * Calculate tax amount for an item
   */
  private calculateItemTax(
    subtotal: number,
    taxRate: number,
    provinceInfo?: ProvinceTaxRate | null,
  ): number {
    return (subtotal * taxRate) / 100;
  }

  /**
   * Calculate tax breakdown for Canada (GST/PST/HST)
   */
  private calculateCanadaTaxBreakdown(
    subtotal: number,
    provinceInfo: ProvinceTaxRate,
  ): { gst?: number; pst?: number; hst?: number } {
    const breakdown: { gst?: number; pst?: number; hst?: number } = {};

    if (provinceInfo.hst) {
      breakdown.hst = this.roundTo2Decimals((subtotal * provinceInfo.hst) / 100);
    } else {
      if (provinceInfo.gst) {
        breakdown.gst = this.roundTo2Decimals((subtotal * provinceInfo.gst) / 100);
      }
      if (provinceInfo.pst) {
        breakdown.pst = this.roundTo2Decimals((subtotal * provinceInfo.pst) / 100);
      }
    }

    return breakdown;
  }

  /**
   * Get province rate information
   */
  private getProvinceRate(config: CountryTaxConfig, provinceCode: string): ProvinceTaxRate | null {
    if (!config.provinceRates) {
      return null;
    }
    return config.provinceRates[provinceCode.toUpperCase()] || null;
  }

  /**
   * Generate tax summary by rate
   */
  private generateTaxSummary(
    items: TaxLineItemResultDto[],
  ): { rate: number; taxableAmount: number; taxAmount: number; itemCount: number }[] {
    const summaryMap = new Map<
      number,
      { rate: number; taxableAmount: number; taxAmount: number; itemCount: number }
    >();

    for (const item of items) {
      const rate = item.taxRate;
      if (!summaryMap.has(rate)) {
        summaryMap.set(rate, {
          rate,
          taxableAmount: 0,
          taxAmount: 0,
          itemCount: 0,
        });
      }

      const summary = summaryMap.get(rate)!;
      summary.taxableAmount += item.subtotal;
      summary.taxAmount += item.taxAmount;
      summary.itemCount += 1;
    }

    return Array.from(summaryMap.values()).map((summary) => ({
      ...summary,
      taxableAmount: this.roundTo2Decimals(summary.taxableAmount),
      taxAmount: this.roundTo2Decimals(summary.taxAmount),
    }));
  }

  /**
   * Get tax notes for a country
   */
  private getTaxNotes(countryCode: string): string {
    const notes: Record<string, string> = {
      JP: 'Standard rate: 10%, Reduced rate: 8% for food and beverages (excluding alcohol and dining out)',
      BD: 'Standard VAT: 15%, Essential food items are exempt (0%), Clothing: 5%',
      CA: 'Tax rates vary by province. HST applies in Atlantic provinces and Ontario. GST+PST in BC, MB, SK, QC. GST only in AB and territories.',
    };
    return notes[countryCode.toUpperCase()] || '';
  }

  /**
   * Round number to 2 decimal places
   */
  private roundTo2Decimals(value: number): number {
    return Math.round(value * 100) / 100;
  }

  /**
   * Validate tax calculation input
   */
  private validateInput(input: CalculateTaxDto): void {
    if (!input.items || input.items.length === 0) {
      throw new BadRequestException('At least one item is required');
    }

    for (const item of input.items) {
      if (item.unitPrice < 0) {
        throw new BadRequestException(`Invalid unit price for item ${item.itemId}`);
      }
      if (item.quantity <= 0) {
        throw new BadRequestException(`Invalid quantity for item ${item.itemId}`);
      }
    }
  }
}
