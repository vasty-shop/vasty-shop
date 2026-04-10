import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { CurrencyService } from '../currency/currency.service';
import { TaxService } from '../tax/tax.service';
import {
  CalculateOrderDto,
  CalculateShippingDto,
  CalculateTaxOnlyDto,
  OrderTotalsResponseDto,
  ShippingCostResponseDto,
  TaxOnlyResponseDto,
  FormattedAmountsDto,
  TaxBreakdownDto,
  ShippingDetailsDto,
  DiscountDetailsDto,
} from './dto/calculate-order.dto';
import {
  ShippingMethod,
  getShippingConfig,
  getShippingRate,
  calculateShippingCost,
  qualifiesForFreeShipping,
} from './config/shipping.config';
import {
  validateCoupon,
  calculateItemsDiscount,
  applyDiscount,
  getCouponByCode,
  DiscountType,
} from './config/discount.config';
import { TaxLineItemDto } from '../tax/dto/calculate-tax.dto';
import { TaxCategory } from '../tax/config/tax-rates.config';

@Injectable()
export class CalculationService {
  private readonly logger = new Logger(CalculationService.name);

  constructor(
    private readonly currencyService: CurrencyService,
    private readonly taxService: TaxService,
  ) {}

  /**
   * Calculate complete order totals including tax, shipping, and discounts
   */
  async calculateOrderTotals(input: CalculateOrderDto): Promise<OrderTotalsResponseDto> {
    this.logger.log(
      `Calculating order totals: ${input.items.length} items, country: ${input.countryCode}`,
    );

    try {
      // Validate input
      this.validateCalculationInput(input);

      // Step 1: Calculate subtotal from items
      const subtotal = this.calculateSubtotal(input.items);
      this.logger.debug(`Subtotal calculated: ${subtotal}`);

      // Step 2: Apply discounts/coupons
      const discountResult = await this.calculateDiscounts(
        input.items,
        input.coupons || [],
        subtotal,
      );
      const discountAmount = discountResult.totalDiscount;
      this.logger.debug(`Discount calculated: ${discountAmount}`);

      // Subtotal after discount (for tax and shipping calculation)
      const discountedSubtotal = subtotal - discountAmount;

      // Step 3: Calculate shipping
      const totalWeight = this.calculateTotalWeight(input.items);
      const shippingResult = await this.calculateShipping(
        input.countryCode,
        input.deliveryMethod,
        totalWeight,
        discountedSubtotal,
        input.currency,
        discountResult.hasFreeShippingCoupon,
      );
      this.logger.debug(`Shipping calculated: ${shippingResult.cost}`);

      // Step 4: Calculate tax (on subtotal after discount, but before shipping)
      const taxResult = await this.calculateTax(
        input.items,
        input.countryCode,
        input.stateCode,
        input.currency,
      );
      this.logger.debug(`Tax calculated: ${taxResult.tax}`);

      // Step 5: Calculate grand total
      const total = discountedSubtotal + taxResult.tax + shippingResult.cost;

      // Step 6: Format all amounts with currency
      const formatted = this.formatAmounts(
        {
          subtotal,
          tax: taxResult.tax,
          shipping: shippingResult.cost,
          discount: discountAmount,
          total,
        },
        input.currency,
      );

      const response: OrderTotalsResponseDto = {
        subtotal: this.roundTo2Decimals(subtotal),
        tax: this.roundTo2Decimals(taxResult.tax),
        taxBreakdown: taxResult.taxBreakdown,
        shipping: this.roundTo2Decimals(shippingResult.cost),
        shippingDetails: shippingResult,
        discount: this.roundTo2Decimals(discountAmount),
        discountDetails: discountResult.details,
        total: this.roundTo2Decimals(total),
        currency: input.currency,
        formatted,
        calculatedAt: new Date().toISOString(),
      };

      this.logger.log(
        `Order totals calculated successfully: Total = ${response.formatted.total}`,
      );

      return response;
    } catch (error) {
      this.logger.error(`Error calculating order totals: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Calculate shipping cost only
   */
  async calculateShippingOnly(input: CalculateShippingDto): Promise<ShippingCostResponseDto> {
    this.logger.log(
      `Calculating shipping: ${input.countryCode}, method: ${input.deliveryMethod}`,
    );

    const shippingRate = getShippingRate(input.countryCode, input.deliveryMethod);

    if (!shippingRate) {
      throw new BadRequestException(
        `Shipping method ${input.deliveryMethod} not available for country ${input.countryCode}`,
      );
    }

    const cost = calculateShippingCost(
      input.countryCode,
      input.deliveryMethod,
      input.weight,
    );

    const isFree =
      input.deliveryMethod === ShippingMethod.PICKUP ||
      (input.orderAmount !== undefined &&
        qualifiesForFreeShipping(
          input.countryCode,
          input.deliveryMethod,
          input.orderAmount,
        ));

    const finalCost = isFree ? 0 : cost;

    return {
      cost: this.roundTo2Decimals(finalCost),
      isFree,
      method: input.deliveryMethod,
      estimatedDays: shippingRate.estimatedDays,
      currency: input.currency,
      formatted: this.currencyService.formatCurrency(finalCost, input.currency),
    };
  }

  /**
   * Calculate tax only
   */
  async calculateTaxOnly(input: CalculateTaxOnlyDto): Promise<TaxOnlyResponseDto> {
    this.logger.log(`Calculating tax only: ${input.countryCode}`);

    const subtotal = this.calculateSubtotal(input.items);
    const taxResult = await this.calculateTax(
      input.items,
      input.countryCode,
      input.stateCode,
      input.currency,
    );

    return {
      tax: this.roundTo2Decimals(taxResult.tax),
      taxBreakdown: taxResult.taxBreakdown,
      subtotal: this.roundTo2Decimals(subtotal),
      currency: input.currency,
      formatted: this.currencyService.formatCurrency(taxResult.tax, input.currency),
    };
  }

  /**
   * Calculate subtotal from items
   */
  private calculateSubtotal(
    items: Array<{ price: number; quantity: number }>,
  ): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  /**
   * Calculate total weight
   */
  private calculateTotalWeight(items: Array<{ weight: number; quantity: number }>): number {
    return items.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  }

  /**
   * Calculate discounts from coupons
   */
  private async calculateDiscounts(
    items: Array<{
      productId: string;
      price: number;
      quantity: number;
      category: string;
    }>,
    coupons: Array<{ code: string; type?: string; value?: number }>,
    subtotal: number,
  ): Promise<{
    totalDiscount: number;
    details: DiscountDetailsDto;
    hasFreeShippingCoupon: boolean;
  }> {
    let totalDiscount = 0;
    const appliedCoupons: Array<{ code: string; type: string; amount: number }> = [];
    let hasFreeShippingCoupon = false;

    for (const coupon of coupons) {
      // Validate coupon
      const validation = validateCoupon(coupon.code, subtotal);

      if (!validation.valid) {
        this.logger.warn(`Invalid coupon: ${coupon.code} - ${validation.message}`);
        continue;
      }

      const couponConfig = getCouponByCode(coupon.code);
      if (!couponConfig) {
        continue;
      }

      // Check if it's a free shipping coupon
      if (couponConfig.type === DiscountType.FREE_SHIPPING) {
        hasFreeShippingCoupon = true;
        appliedCoupons.push({
          code: coupon.code,
          type: couponConfig.type,
          amount: 0, // Will be calculated in shipping
        });
        continue;
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (couponConfig.scope === 'ORDER') {
        discountAmount = applyDiscount(subtotal - totalDiscount, couponConfig);
      } else {
        discountAmount = calculateItemsDiscount(items, couponConfig);
      }

      totalDiscount += discountAmount;
      appliedCoupons.push({
        code: coupon.code,
        type: couponConfig.type,
        amount: discountAmount,
      });

      this.logger.debug(
        `Applied coupon ${coupon.code}: ${discountAmount} discount`,
      );
    }

    return {
      totalDiscount,
      details: {
        amount: totalDiscount,
        appliedCoupons: appliedCoupons.length > 0 ? appliedCoupons : undefined,
      },
      hasFreeShippingCoupon,
    };
  }

  /**
   * Calculate shipping with free shipping rules
   */
  private async calculateShipping(
    countryCode: string,
    method: ShippingMethod,
    weight: number,
    orderAmount: number,
    currency: string,
    hasFreeShippingCoupon: boolean,
  ): Promise<ShippingDetailsDto> {
    const shippingRate = getShippingRate(countryCode, method);

    if (!shippingRate) {
      throw new BadRequestException(
        `Shipping method ${method} not available for country ${countryCode}`,
      );
    }

    const originalCost = calculateShippingCost(countryCode, method, weight);

    // Check free shipping conditions
    const isFreeByThreshold = qualifiesForFreeShipping(
      countryCode,
      method,
      orderAmount,
    );
    const isFree =
      hasFreeShippingCoupon ||
      isFreeByThreshold ||
      method === ShippingMethod.PICKUP;

    const finalCost = isFree ? 0 : originalCost;

    return {
      method,
      methodName: shippingRate.name,
      cost: this.roundTo2Decimals(finalCost),
      isFree,
      estimatedDays: shippingRate.estimatedDays,
      originalCost: isFree ? this.roundTo2Decimals(originalCost) : undefined,
    };
  }

  /**
   * Calculate tax using TaxService
   */
  private async calculateTax(
    items: Array<{
      productId: string;
      price: number;
      quantity: number;
      category: string;
      name?: string;
    }>,
    countryCode: string,
    stateCode?: string,
    currency?: string,
  ): Promise<{ tax: number; taxBreakdown: TaxBreakdownDto }> {
    // Convert items to TaxLineItemDto format
    const taxItems: TaxLineItemDto[] = items.map((item, index) => ({
      itemId: item.productId || `item-${index}`,
      itemName: item.name || `Item ${index + 1}`,
      unitPrice: item.price,
      quantity: item.quantity,
      category: this.mapCategoryToTaxCategory(item.category),
    }));

    try {
      // Call TaxService
      const taxResult = await this.taxService.calculateTax({
        countryCode,
        provinceCode: stateCode,
        items: taxItems,
        currency: currency || 'USD',
      });

      // Build tax breakdown
      const taxBreakdown: TaxBreakdownDto = {
        rate: taxResult.items.length > 0 ? taxResult.items[0].taxRate : 0,
        taxableAmount: taxResult.subtotal,
        countryName: taxResult.countryName,
        provinceName: taxResult.provinceName,
      };

      // Add GST/PST/HST breakdown if available
      if (taxResult.items.length > 0 && taxResult.items[0].taxBreakdown) {
        taxBreakdown.gst = taxResult.items[0].taxBreakdown.gst;
        taxBreakdown.pst = taxResult.items[0].taxBreakdown.pst;
        taxBreakdown.hst = taxResult.items[0].taxBreakdown.hst;
      }

      return {
        tax: taxResult.totalTax,
        taxBreakdown,
      };
    } catch (error) {
      // If tax calculation fails for unsupported country, return 0 tax
      this.logger.warn(
        `Tax calculation failed for ${countryCode}: ${error.message}`,
      );
      return {
        tax: 0,
        taxBreakdown: {
          rate: 0,
          taxableAmount: 0,
          countryName: countryCode,
        },
      };
    }
  }

  /**
   * Map product category to tax category
   */
  private mapCategoryToTaxCategory(category: string): TaxCategory {
    const categoryMap: Record<string, TaxCategory> = {
      ELECTRONICS: TaxCategory.ELECTRONICS,
      CLOTHING: TaxCategory.CLOTHING,
      FOOD: TaxCategory.ESSENTIAL_FOOD,
      LUXURY: TaxCategory.LUXURY_GOODS,
      SERVICES: TaxCategory.SERVICES,
    };

    return categoryMap[category.toUpperCase()] || TaxCategory.STANDARD;
  }

  /**
   * Format amounts with currency symbols
   */
  private formatAmounts(
    amounts: {
      subtotal: number;
      tax: number;
      shipping: number;
      discount: number;
      total: number;
    },
    currency: string,
  ): FormattedAmountsDto {
    return {
      subtotal: this.currencyService.formatCurrency(amounts.subtotal, currency),
      tax: this.currencyService.formatCurrency(amounts.tax, currency),
      shipping: this.currencyService.formatCurrency(amounts.shipping, currency),
      discount: this.currencyService.formatCurrency(amounts.discount, currency),
      total: this.currencyService.formatCurrency(amounts.total, currency),
    };
  }

  /**
   * Validate calculation input
   */
  private validateCalculationInput(input: CalculateOrderDto): void {
    if (!input.items || input.items.length === 0) {
      throw new BadRequestException('At least one item is required');
    }

    for (const item of input.items) {
      if (item.price < 0) {
        throw new BadRequestException(
          `Invalid price for item ${item.productId}`,
        );
      }
      if (item.quantity <= 0) {
        throw new BadRequestException(
          `Invalid quantity for item ${item.productId}`,
        );
      }
      if (item.weight < 0) {
        throw new BadRequestException(
          `Invalid weight for item ${item.productId}`,
        );
      }
    }

    // Validate shipping method availability
    const shippingConfig = getShippingConfig(input.countryCode);
    const hasMethod = shippingConfig.rates.some(
      (rate) => rate.method === input.deliveryMethod,
    );

    if (!hasMethod) {
      throw new BadRequestException(
        `Shipping method ${input.deliveryMethod} not available for country ${input.countryCode}`,
      );
    }

    // Check weight limit
    const totalWeight = this.calculateTotalWeight(input.items);
    if (shippingConfig.weightLimit && totalWeight > shippingConfig.weightLimit) {
      throw new BadRequestException(
        `Total weight ${totalWeight}kg exceeds limit of ${shippingConfig.weightLimit}kg for ${input.countryCode}`,
      );
    }
  }

  /**
   * Round number to 2 decimal places
   */
  private roundTo2Decimals(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
