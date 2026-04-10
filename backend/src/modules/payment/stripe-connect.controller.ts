import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StripeConnectService, CreateConnectAccountDto } from './stripe-connect.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@ApiTags('stripe-connect')
@Controller('stripe-connect')
export class StripeConnectController {
  private stripe: Stripe;

  constructor(
    private readonly stripeConnectService: StripeConnectService,
    private readonly configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeSecretKey) {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16',
      });
    }
  }

  @Post('account/:shopId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create Stripe Connect Express account for a shop' })
  @ApiResponse({ status: 201, description: 'Connect account created, returns onboarding URL' })
  @ApiResponse({ status: 400, description: 'Bad request or account already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async createConnectAccount(
    @Param('shopId') shopId: string,
    @Body() dto: CreateConnectAccountDto,
    @Headers('x-return-url') returnUrl?: string,
  ) {
    // Use provided return URL or construct default
    const baseUrl = returnUrl || this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const redirectUrl = `${baseUrl}/shop/${shopId}/vendor/payment-settings`;

    return this.stripeConnectService.createConnectAccount(shopId, dto, redirectUrl);
  }

  @Get('onboarding/:shopId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get onboarding link for incomplete Connect account setup' })
  @ApiResponse({ status: 200, description: 'Returns onboarding URL' })
  @ApiResponse({ status: 400, description: 'No Connect account exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async getOnboardingLink(
    @Param('shopId') shopId: string,
    @Headers('x-return-url') returnUrl?: string,
  ) {
    const baseUrl = returnUrl || this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const redirectUrl = `${baseUrl}/shop/${shopId}/vendor/payment-settings`;

    return this.stripeConnectService.getOnboardingLink(shopId, redirectUrl);
  }

  @Get('status/:shopId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get Connect account status for a shop' })
  @ApiResponse({ status: 200, description: 'Returns account status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async getAccountStatus(@Param('shopId') shopId: string) {
    return this.stripeConnectService.getAccountStatus(shopId);
  }

  @Get('dashboard/:shopId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get Stripe Express Dashboard login link' })
  @ApiResponse({ status: 200, description: 'Returns dashboard URL' })
  @ApiResponse({ status: 400, description: 'No Connect account exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async getDashboardLink(@Param('shopId') shopId: string) {
    return this.stripeConnectService.getDashboardLink(shopId);
  }

  @Delete('account/:shopId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Disconnect Stripe Connect account from shop' })
  @ApiResponse({ status: 200, description: 'Account disconnected successfully' })
  @ApiResponse({ status: 400, description: 'No Connect account exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async disconnectAccount(@Param('shopId') shopId: string) {
    return this.stripeConnectService.disconnectAccount(shopId);
  }

  @Get('balance/:shopId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get vendor balance from their connected account' })
  @ApiResponse({ status: 200, description: 'Returns balance details' })
  @ApiResponse({ status: 400, description: 'No Connect account exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async getVendorBalance(@Param('shopId') shopId: string) {
    return this.stripeConnectService.getVendorBalance(shopId);
  }

  @Get('transfers/:shopId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get recent transfers to vendor connected account' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of records (default: 20)' })
  @ApiResponse({ status: 200, description: 'Returns list of transfers' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async getVendorTransfers(
    @Param('shopId') shopId: string,
    @Query('limit') limit?: number,
  ) {
    return this.stripeConnectService.getVendorTransfers(shopId, limit || 20);
  }

  @Get('payouts/:shopId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get vendor payout history from database' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of records (default: 50)' })
  @ApiResponse({ status: 200, description: 'Returns list of payouts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async getPayoutHistory(
    @Param('shopId') shopId: string,
    @Query('limit') limit?: number,
  ) {
    return this.stripeConnectService.getPayoutHistory(shopId, limit || 50);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe Connect webhook handler' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  async handleConnectWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = this.configService.get<string>('STRIPE_CONNECT_WEBHOOK_SECRET') ||
                          this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!this.stripe || !webhookSecret) {
      throw new Error('Stripe Connect webhook not configured');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        webhookSecret,
      );

      await this.stripeConnectService.handleConnectWebhook(event);

      return { received: true };
    } catch (error) {
      throw new Error(`Webhook error: ${error.message}`);
    }
  }

  @Get('supported-countries')
  @ApiOperation({ summary: 'Get list of Stripe Connect supported countries' })
  @ApiResponse({ status: 200, description: 'Returns list of supported countries' })
  getSupportedCountries() {
    // Stripe Connect supported countries
    return {
      countries: [
        { code: 'US', name: 'United States', flag: '🇺🇸' },
        { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
        { code: 'CA', name: 'Canada', flag: '🇨🇦' },
        { code: 'AU', name: 'Australia', flag: '🇦🇺' },
        { code: 'JP', name: 'Japan', flag: '🇯🇵' },
        { code: 'DE', name: 'Germany', flag: '🇩🇪' },
        { code: 'FR', name: 'France', flag: '🇫🇷' },
        { code: 'IT', name: 'Italy', flag: '🇮🇹' },
        { code: 'ES', name: 'Spain', flag: '🇪🇸' },
        { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
        { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
        { code: 'AT', name: 'Austria', flag: '🇦🇹' },
        { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
        { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
        { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
        { code: 'NO', name: 'Norway', flag: '🇳🇴' },
        { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
        { code: 'FI', name: 'Finland', flag: '🇫🇮' },
        { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
        { code: 'PL', name: 'Poland', flag: '🇵🇱' },
        { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
        { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
        { code: 'RO', name: 'Romania', flag: '🇷🇴' },
        { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
        { code: 'HR', name: 'Croatia', flag: '🇭🇷' },
        { code: 'SI', name: 'Slovenia', flag: '🇸🇮' },
        { code: 'SK', name: 'Slovakia', flag: '🇸🇰' },
        { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
        { code: 'LV', name: 'Latvia', flag: '🇱🇻' },
        { code: 'LT', name: 'Lithuania', flag: '🇱🇹' },
        { code: 'GR', name: 'Greece', flag: '🇬🇷' },
        { code: 'CY', name: 'Cyprus', flag: '🇨🇾' },
        { code: 'MT', name: 'Malta', flag: '🇲🇹' },
        { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
        { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
        { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
        { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
        { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
        { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
        { code: 'IN', name: 'India', flag: '🇮🇳' },
        { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
        { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
        { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
        { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
        { code: 'CL', name: 'Chile', flag: '🇨🇱' },
        { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
        { code: 'PE', name: 'Peru', flag: '🇵🇪' },
        { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
        { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
        { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
        { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
        { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
        { code: 'IL', name: 'Israel', flag: '🇮🇱' },
        { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
        { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
        { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
        { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
        { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
        { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
      ],
    };
  }
}
