/**
 * Currency Controller
 * API endpoints for currency operations
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CurrencyService } from './currency.service';
import { DEFAULT_CURRENCY, getActiveCurrencies } from './config/currencies.config';
import {
  ConvertCurrencyDto,
  ConvertCurrencyResponseDto,
  FormatCurrencyDto,
  FormatCurrencyResponseDto,
  UpdateCurrencyPreferenceDto,
  SupportedCurrenciesResponseDto,
  UserCurrencyResponseDto,
  CurrencyInfoDto,
} from './dto/currency.dto';
import { UserCurrency, CurrencyInfo } from './decorators/user-currency.decorator';

@ApiTags('Currency')
@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  /**
   * GET /api/currency/supported
   * Get all supported currencies
   */
  @Get('supported')
  @ApiOperation({
    summary: 'Get all supported currencies',
    description: 'Returns a list of all currencies supported by the platform',
  })
  @ApiResponse({
    status: 200,
    description: 'List of supported currencies',
    type: SupportedCurrenciesResponseDto,
  })
  getSupportedCurrencies(): SupportedCurrenciesResponseDto {
    const currencies = getActiveCurrencies();

    return {
      currencies: currencies.map((currency) => ({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        symbolNative: currency.symbolNative,
        decimalDigits: currency.decimalDigits,
        symbolPosition: currency.symbolPosition,
        decimalSeparator: currency.decimalSeparator,
        thousandSeparator: currency.thousandSeparator,
        countries: currency.countries,
      })),
      defaultCurrency: DEFAULT_CURRENCY,
      total: currencies.length,
    };
  }

  /**
   * POST /api/currency/convert
   * Convert amount between currencies
   */
  @Post('convert')
  @ApiOperation({
    summary: 'Convert amount between currencies',
    description: 'Converts an amount from one currency to another using current exchange rates',
  })
  @ApiResponse({
    status: 200,
    description: 'Conversion successful',
    type: ConvertCurrencyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid currency code or amount',
  })
  async convertCurrency(
    @Body(ValidationPipe) dto: ConvertCurrencyDto,
  ): Promise<ConvertCurrencyResponseDto> {
    const convertedAmount = await this.currencyService.convertCurrency(
      dto.amount,
      dto.from.toUpperCase(),
      dto.to.toUpperCase(),
    );

    const rate = await this.currencyService.getExchangeRate(
      dto.from.toUpperCase(),
      dto.to.toUpperCase(),
    );

    const formatted = this.currencyService.formatCurrency(convertedAmount, dto.to.toUpperCase());

    return {
      amount: dto.amount,
      from: dto.from.toUpperCase(),
      to: dto.to.toUpperCase(),
      convertedAmount,
      rate,
      formatted,
      rateUpdatedAt: new Date().toISOString(),
    };
  }

  /**
   * GET /api/currency/format
   * Format amount with currency symbol
   */
  @Get('format')
  @ApiOperation({
    summary: 'Format amount with currency symbol',
    description: 'Formats a number with the appropriate currency symbol and separators',
  })
  @ApiQuery({ name: 'amount', type: Number, required: true, example: 1234.56 })
  @ApiQuery({
    name: 'currency',
    type: String,
    required: false,
    example: 'USD',
    description: 'Currency code (defaults to USD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Formatted currency string',
    type: FormatCurrencyResponseDto,
  })
  formatCurrency(
    @Query('amount') amount: string,
    @Query('currency') currency?: string,
  ): FormatCurrencyResponseDto {
    const numAmount = parseFloat(amount);
    const currencyCode = currency?.toUpperCase() || DEFAULT_CURRENCY;

    const currencyInfo = this.currencyService.getCurrencyInfo(currencyCode);
    const formatted = this.currencyService.formatCurrency(numAmount, currencyCode);

    return {
      amount: numAmount,
      currency: currencyCode,
      formatted,
      symbol: currencyInfo?.symbol || '$',
      name: currencyInfo?.name || 'US Dollar',
    };
  }

  /**
   * GET /api/currency/me
   * Get current user's detected currency
   */
  @Get('me')
  @ApiOperation({
    summary: 'Get current user currency',
    description: 'Returns the detected currency for the current request',
  })
  @ApiResponse({
    status: 200,
    description: 'User currency information',
    type: UserCurrencyResponseDto,
  })
  async getUserCurrency(@CurrencyInfo() currencyInfo: { currency: string; source: string }) {
    const info = this.currencyService.getCurrencyInfo(currencyInfo.currency);

    return {
      currency: currencyInfo.currency,
      source: currencyInfo.source as any,
      info: info
        ? {
            code: info.code,
            name: info.name,
            symbol: info.symbol,
            symbolNative: info.symbolNative,
            decimalDigits: info.decimalDigits,
            symbolPosition: info.symbolPosition,
            decimalSeparator: info.decimalSeparator,
            thousandSeparator: info.thousandSeparator,
            countries: info.countries,
          }
        : null,
    };
  }

  /**
   * POST /api/currency/preference
   * Update user's currency preference
   */
  @Post('preference')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user currency preference',
    description: 'Sets the preferred currency for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Currency preference updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid currency code',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  async updateCurrencyPreference(
    @Body(ValidationPipe) dto: UpdateCurrencyPreferenceDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return {
        success: false,
        message: 'User not authenticated',
      };
    }

    await this.currencyService.updateUserCurrency(userId, dto.currency.toUpperCase());

    return {
      success: true,
      message: 'Currency preference updated successfully',
      currency: dto.currency.toUpperCase(),
    };
  }

  /**
   * GET /api/currency/exchange-rate
   * Get exchange rate between two currencies
   */
  @Get('exchange-rate')
  @ApiOperation({
    summary: 'Get exchange rate between currencies',
    description: 'Returns the current exchange rate from one currency to another',
  })
  @ApiQuery({ name: 'from', type: String, required: true, example: 'USD' })
  @ApiQuery({ name: 'to', type: String, required: true, example: 'EUR' })
  @ApiResponse({
    status: 200,
    description: 'Exchange rate information',
  })
  async getExchangeRate(@Query('from') from: string, @Query('to') to: string) {
    const fromCurrency = from.toUpperCase();
    const toCurrency = to.toUpperCase();

    const rate = await this.currencyService.getExchangeRate(fromCurrency, toCurrency);

    return {
      from: fromCurrency,
      to: toCurrency,
      rate,
      inverseRate: rate !== 0 ? 1 / rate : 0,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /api/currency/:code
   * Get information about a specific currency
   */
  @Get(':code')
  @ApiOperation({
    summary: 'Get currency information',
    description: 'Returns detailed information about a specific currency',
  })
  @ApiResponse({
    status: 200,
    description: 'Currency information',
    type: CurrencyInfoDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Currency not found',
  })
  getCurrencyInfo(@Query('code') code: string): CurrencyInfoDto | { error: string } {
    const info = this.currencyService.getCurrencyInfo(code.toUpperCase());

    if (!info) {
      return { error: 'Currency not found' };
    }

    return {
      code: info.code,
      name: info.name,
      symbol: info.symbol,
      symbolNative: info.symbolNative,
      decimalDigits: info.decimalDigits,
      symbolPosition: info.symbolPosition,
      decimalSeparator: info.decimalSeparator,
      thousandSeparator: info.thousandSeparator,
      countries: info.countries,
    };
  }
}
