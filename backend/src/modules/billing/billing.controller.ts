import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Headers,
  HttpCode,
  HttpStatus,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillingService } from './billing.service';
import { SubscriptionService } from '../subscription/subscription.service';
import {
  CreateCheckoutDto,
  CancelSubscriptionDto,
  SubscriptionResponseDto,
  PlanResponseDto,
  InvoiceResponseDto,
  PaymentMethodResponseDto,
  CheckoutSessionResponseDto,
  SetupSessionResponseDto,
} from './dto/billing.dto';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  // ============================================
  // SUBSCRIPTION ENDPOINTS
  // ============================================

  @Get('subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current subscription' })
  @ApiResponse({ status: 200, description: 'Current subscription', type: SubscriptionResponseDto })
  async getSubscription(
    @Request() req,
    @Headers('x-shop-id') headerShopId?: string,
  ): Promise<SubscriptionResponseDto> {
    const userId = req.user.sub || req.user.userId;
    const shopId = headerShopId || req.user.shopId;
    return this.billingService.getSubscription(userId, shopId);
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get available subscription plans' })
  @ApiResponse({ status: 200, description: 'List of plans' })
  async getPlans(): Promise<{ plans: PlanResponseDto[] }> {
    return this.billingService.getPlans();
  }

  @Get('usage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current usage and limits' })
  @ApiResponse({ status: 200, description: 'Current usage and limits' })
  async getUsage(@Request() req): Promise<{
    plan: string;
    stores: { used: number; limit: number };
    products: { used: number; limit: number };
  }> {
    const userId = req.user.sub || req.user.userId;
    const planTier = await this.subscriptionService.getUserPlanTier(userId);
    const limits = this.subscriptionService.getPlanLimits(planTier);
    const storeCount = await this.subscriptionService.getUserStoreCount(userId);
    const productCount = await this.subscriptionService.getUserProductCount(userId);

    return {
      plan: planTier,
      stores: {
        used: storeCount,
        limit: limits.stores === Infinity ? -1 : limits.stores,
      },
      products: {
        used: productCount,
        limit: limits.products === Infinity ? -1 : limits.products,
      },
    };
  }

  @Get('features')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all feature access for current user plan' })
  @ApiResponse({ status: 200, description: 'Feature access based on plan' })
  async getFeatures(@Request() req): Promise<{
    planTier: string;
    stores: number;
    products: number;
    teamMembers: number;
    customDomain: boolean;
    premiumThemes: boolean;
    analytics: string;
    mobileApp: boolean;
    apiAccess: boolean;
    whiteLabel: boolean;
    promotions: boolean;
    prioritySupport: boolean;
  }> {
    const userId = req.user.sub || req.user.userId;
    return this.subscriptionService.getUserFeatureAccess(userId);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  @ApiResponse({ status: 201, description: 'Checkout session created', type: CheckoutSessionResponseDto })
  async createCheckout(
    @Request() req,
    @Body() dto: CreateCheckoutDto,
    @Headers('x-shop-id') headerShopId?: string,
  ): Promise<CheckoutSessionResponseDto> {
    const userId = req.user.sub || req.user.userId;
    // Priority: x-shop-id header > req.user.shopId
    const shopId = headerShopId || req.user.shopId;
    return this.billingService.createCheckout(userId, shopId, dto);
  }

  @Post('subscription/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled', type: SubscriptionResponseDto })
  async cancelSubscription(
    @Request() req,
    @Body() dto: CancelSubscriptionDto,
    @Headers('x-shop-id') headerShopId?: string,
  ): Promise<SubscriptionResponseDto> {
    const userId = req.user.sub || req.user.userId;
    const shopId = headerShopId || req.user.shopId;
    return this.billingService.cancelSubscription(userId, shopId, dto);
  }

  @Post('subscription/resume')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resume cancelled subscription' })
  @ApiResponse({ status: 200, description: 'Subscription resumed', type: SubscriptionResponseDto })
  async resumeSubscription(
    @Request() req,
    @Headers('x-shop-id') headerShopId?: string,
  ): Promise<SubscriptionResponseDto> {
    const userId = req.user.sub || req.user.userId;
    const shopId = headerShopId || req.user.shopId;
    return this.billingService.resumeSubscription(userId, shopId);
  }

  @Post('subscription/sync')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync subscription from Stripe' })
  @ApiResponse({ status: 200, description: 'Subscription synced', type: SubscriptionResponseDto })
  async syncSubscription(
    @Request() req,
    @Headers('x-shop-id') headerShopId?: string,
  ): Promise<SubscriptionResponseDto | null> {
    const userId = req.user.sub || req.user.userId;
    const shopId = headerShopId || req.user.shopId;
    return this.billingService.syncSubscription(userId, shopId);
  }

  // ============================================
  // INVOICE ENDPOINTS
  // ============================================

  @Get('invoices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get invoices' })
  @ApiResponse({ status: 200, description: 'List of invoices' })
  async getInvoices(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Headers('x-shop-id') headerShopId?: string,
  ): Promise<{ invoices: InvoiceResponseDto[]; total: number }> {
    const userId = req.user.sub || req.user.userId;
    const shopId = headerShopId || req.user.shopId;
    return this.billingService.getInvoices(
      userId,
      shopId,
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  // ============================================
  // PAYMENT METHOD ENDPOINTS
  // ============================================

  @Get('payment-methods')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment methods' })
  @ApiResponse({ status: 200, description: 'List of payment methods' })
  async getPaymentMethods(
    @Request() req,
    @Headers('x-shop-id') headerShopId?: string,
  ): Promise<{ paymentMethods: PaymentMethodResponseDto[] }> {
    const userId = req.user.sub || req.user.userId;
    const shopId = headerShopId || req.user.shopId;
    return this.billingService.getPaymentMethods(userId, shopId);
  }

  @Delete('payment-methods/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete payment method' })
  @ApiResponse({ status: 200, description: 'Payment method deleted' })
  async deletePaymentMethod(@Param('id') paymentMethodId: string): Promise<{ message: string }> {
    return this.billingService.deletePaymentMethod(paymentMethodId);
  }

  @Post('setup-session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create setup session for new payment method' })
  @ApiResponse({ status: 201, description: 'Setup session created', type: SetupSessionResponseDto })
  async createSetupSession(
    @Request() req,
    @Headers('x-shop-id') headerShopId?: string,
  ): Promise<SetupSessionResponseDto> {
    const userId = req.user.sub || req.user.userId;
    const shopId = headerShopId || req.user.shopId;
    return this.billingService.createSetupSession(userId, shopId);
  }

  // ============================================
  // WEBHOOK ENDPOINT
  // ============================================

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook received' })
  async handleWebhook(
    @Req() req: RawBodyRequest<ExpressRequest>,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new Error('Raw body is missing. Ensure raw body parser is enabled.');
    }
    return this.billingService.handleWebhook(rawBody, signature);
  }
}
