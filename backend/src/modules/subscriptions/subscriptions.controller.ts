import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { SubscriptionsService } from './subscriptions.service';
import {
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  CreateSubscriptionDto,
} from './dto/subscription.dto';

@ApiTags('subscriptions')
@Controller()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // ============================================
  // SUBSCRIPTION PLAN ENDPOINTS (vendor)
  // ============================================

  @Post('subscription-plans')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a subscription plan (vendor)' })
  @ApiResponse({ status: 201, description: 'Plan created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createPlan(@Request() req: any, @Body() dto: CreateSubscriptionPlanDto) {
    // The vendor's shop ID should come from their context.
    // Use shopId from JWT payload or header.
    const vendorId = req.user.shopId || req.headers['x-shop-id'];
    if (!vendorId) {
      throw new Error('Shop ID is required. Provide via x-shop-id header or JWT shopId claim.');
    }
    return this.subscriptionsService.createSubscriptionPlan(vendorId, dto);
  }

  @Get('subscription-plans')
  @Public()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List subscription plans (public, filterable)' })
  @ApiQuery({ name: 'vendorId', required: false })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Plans listed' })
  async listPlans(
    @Query('vendorId') vendorId?: string,
    @Query('productId') productId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.subscriptionsService.listPlans({
      vendorId,
      productId,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get('subscription-plans/:id')
  @Public()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get subscription plan details (public)' })
  @ApiResponse({ status: 200, description: 'Plan details' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async getPlan(@Param('id') id: string) {
    return this.subscriptionsService.getPlan(id);
  }

  @Put('subscription-plans/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a subscription plan (vendor)' })
  @ApiResponse({ status: 200, description: 'Plan updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async updatePlan(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionPlanDto,
  ) {
    const vendorId = req.user.shopId || req.headers['x-shop-id'];
    if (!vendorId) {
      throw new Error('Shop ID is required. Provide via x-shop-id header or JWT shopId claim.');
    }
    return this.subscriptionsService.updatePlan(vendorId, id, dto);
  }

  // ============================================
  // SUBSCRIPTION ENDPOINTS (buyer)
  // ============================================

  @Post('subscriptions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Subscribe to a plan (buyer)' })
  @ApiResponse({ status: 201, description: 'Subscribed' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async subscribe(@Request() req: any, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.subscribe(req.user.userId, dto);
  }

  @Get('subscriptions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List my subscriptions (buyer)' })
  @ApiResponse({ status: 200, description: 'User subscriptions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async mySubscriptions(@Request() req: any) {
    return this.subscriptionsService.getSubscriptionsByUser(req.user.userId);
  }

  @Patch('subscriptions/:id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel subscription (effective at end of period)' })
  @ApiResponse({ status: 200, description: 'Subscription cancelling' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async cancel(@Request() req: any, @Param('id') id: string) {
    return this.subscriptionsService.cancelSubscription(req.user.userId, id);
  }

  @Patch('subscriptions/:id/pause')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Pause subscription' })
  @ApiResponse({ status: 200, description: 'Subscription paused' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async pause(@Request() req: any, @Param('id') id: string) {
    return this.subscriptionsService.pauseSubscription(req.user.userId, id);
  }

  @Patch('subscriptions/:id/resume')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Resume a paused subscription' })
  @ApiResponse({ status: 200, description: 'Subscription resumed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async resume(@Request() req: any, @Param('id') id: string) {
    return this.subscriptionsService.resumeSubscription(req.user.userId, id);
  }

  // ============================================
  // VENDOR SUBSCRIPTION ENDPOINTS
  // ============================================

  @Get('vendor/subscriptions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "List vendor's subscribers" })
  @ApiResponse({ status: 200, description: "Vendor's subscriptions" })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async vendorSubscriptions(@Request() req: any) {
    const vendorId = req.user.shopId || req.headers['x-shop-id'];
    if (!vendorId) {
      throw new Error('Shop ID is required. Provide via x-shop-id header or JWT shopId claim.');
    }
    return this.subscriptionsService.getSubscriptionsByVendor(vendorId);
  }

  @Get('vendor/subscriptions/analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get subscription analytics (MRR, churn, LTV)' })
  @ApiResponse({ status: 200, description: 'Analytics data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async vendorAnalytics(@Request() req: any) {
    const vendorId = req.user.shopId || req.headers['x-shop-id'];
    if (!vendorId) {
      throw new Error('Shop ID is required. Provide via x-shop-id header or JWT shopId claim.');
    }
    return this.subscriptionsService.getSubscriptionAnalytics(vendorId);
  }
}
