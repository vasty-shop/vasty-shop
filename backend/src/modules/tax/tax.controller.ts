import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TaxService } from './tax.service';
import {
  CalculateTaxDto,
  TaxCalculationResultDto,
  TaxRatesResponseDto,
} from './dto/calculate-tax.dto';

@ApiTags('Tax')
@Controller('tax')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  /**
   * Calculate tax for given items
   */
  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calculate tax for items',
    description: 'Calculate tax based on country, province (for Canada), and item categories',
  })
  @ApiResponse({
    status: 200,
    description: 'Tax calculation successful',
    type: TaxCalculationResultDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or unsupported country',
  })
  async calculateTax(@Body() calculateTaxDto: CalculateTaxDto): Promise<TaxCalculationResultDto> {
    return this.taxService.calculateTax(calculateTaxDto);
  }

  /**
   * Get tax rates for a country
   */
  @Get('rates/:countryCode')
  @ApiOperation({
    summary: 'Get tax rates for a country',
    description: 'Retrieve tax rate information for a specific country (JP, BD, or CA)',
  })
  @ApiParam({
    name: 'countryCode',
    description: 'ISO 3166-1 alpha-2 country code',
    enum: ['JP', 'BD', 'CA'],
    example: 'JP',
  })
  @ApiResponse({
    status: 200,
    description: 'Tax rates retrieved successfully',
    type: TaxRatesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or unsupported country code',
  })
  async getTaxRates(@Param('countryCode') countryCode: string): Promise<TaxRatesResponseDto> {
    return this.taxService.getTaxRates(countryCode);
  }
}
