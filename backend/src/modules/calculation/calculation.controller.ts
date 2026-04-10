import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CalculationService } from './calculation.service';
import {
  CalculateOrderDto,
  CalculateShippingDto,
  CalculateTaxOnlyDto,
  OrderTotalsResponseDto,
  ShippingCostResponseDto,
  TaxOnlyResponseDto,
} from './dto/calculate-order.dto';

@ApiTags('Calculation')
@Controller('calculation')
export class CalculationController {
  constructor(private readonly calculationService: CalculationService) {}

  /**
   * Calculate complete order totals including tax, shipping, and discounts
   */
  @Post('order-totals')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calculate order totals',
    description:
      'Calculate complete order totals including subtotal, tax, shipping, discounts, and grand total with formatted currency values',
  })
  @ApiResponse({
    status: 200,
    description: 'Order totals calculated successfully',
    type: OrderTotalsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async calculateOrderTotals(
    @Body() calculateOrderDto: CalculateOrderDto,
  ): Promise<OrderTotalsResponseDto> {
    return this.calculationService.calculateOrderTotals(calculateOrderDto);
  }

  /**
   * Calculate shipping cost only
   */
  @Post('shipping')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calculate shipping cost',
    description:
      'Calculate shipping cost based on country, delivery method, weight, and order amount (for free shipping rules)',
  })
  @ApiResponse({
    status: 200,
    description: 'Shipping cost calculated successfully',
    type: ShippingCostResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid shipping parameters',
  })
  async calculateShipping(
    @Body() calculateShippingDto: CalculateShippingDto,
  ): Promise<ShippingCostResponseDto> {
    return this.calculationService.calculateShippingOnly(calculateShippingDto);
  }

  /**
   * Calculate tax only
   */
  @Post('tax')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calculate tax',
    description:
      'Calculate tax amount based on items, country, and state/province with detailed tax breakdown',
  })
  @ApiResponse({
    status: 200,
    description: 'Tax calculated successfully',
    type: TaxOnlyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid tax calculation parameters',
  })
  async calculateTax(
    @Body() calculateTaxDto: CalculateTaxOnlyDto,
  ): Promise<TaxOnlyResponseDto> {
    return this.calculationService.calculateTaxOnly(calculateTaxDto);
  }
}
