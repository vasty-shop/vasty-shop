import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionService } from './subscription.service';
import {
  CreatePlanDto,
  UpdatePlanDto,
  SubscribeDto,
  ChangePlanDto,
  CancelSubscriptionDto,
  PlanResponseDto,
  SubscriptionResponseDto,
} from './dto/subscription.dto';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  // ============================================
  // PLAN ENDPOINTS (Public)
  // ============================================

  @Get('plans')
  @ApiOperation({ summary: 'Get all subscription plans' })
  @ApiResponse({ status: 200, description: 'List of plans', type: [PlanResponseDto] })
  async getPlans(@Query('includeInactive') includeInactive?: string) {
    return this.subscriptionService.getPlans(includeInactive === 'true');
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Get plan by ID or slug' })
  @ApiResponse({ status: 200, description: 'Plan details', type: PlanResponseDto })
  async getPlan(@Param('id') id: string) {
    return this.subscriptionService.getPlan(id);
  }

  // ============================================
  // SHOP SUBSCRIPTION ENDPOINTS
  // ============================================

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subscribe a shop to a plan' })
  @ApiResponse({ status: 201, description: 'Subscription created', type: SubscriptionResponseDto })
  async subscribe(@Body() dto: SubscribeDto) {
    return this.subscriptionService.subscribe(dto);
  }

  @Get('shop/:shopId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get shop subscription' })
  @ApiResponse({ status: 200, description: 'Subscription details', type: SubscriptionResponseDto })
  async getShopSubscription(@Param('shopId') shopId: string) {
    return this.subscriptionService.getShopSubscription(shopId);
  }

  @Put('shop/:shopId/change-plan')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change subscription plan' })
  @ApiResponse({ status: 200, description: 'Plan changed', type: SubscriptionResponseDto })
  async changePlan(@Param('shopId') shopId: string, @Body() dto: ChangePlanDto) {
    return this.subscriptionService.changePlan(shopId, dto);
  }

  @Post('shop/:shopId/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled' })
  async cancelSubscription(@Param('shopId') shopId: string, @Body() dto: CancelSubscriptionDto) {
    return this.subscriptionService.cancelSubscription(shopId, dto);
  }

  @Post('shop/:shopId/reactivate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reactivate cancelled subscription' })
  @ApiResponse({ status: 200, description: 'Subscription reactivated' })
  async reactivateSubscription(@Param('shopId') shopId: string) {
    return this.subscriptionService.reactivateSubscription(shopId);
  }

  @Get('shop/:shopId/can-add-product')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if shop can add more products' })
  @ApiResponse({ status: 200, description: 'Product limit check result' })
  async canAddProduct(@Param('shopId') shopId: string) {
    return this.subscriptionService.canAddProduct(shopId);
  }

  @Get('shop/:shopId/invoices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subscription invoices' })
  @ApiResponse({ status: 200, description: 'List of invoices' })
  async getInvoices(@Param('shopId') shopId: string, @Query('limit') limit?: string) {
    return this.subscriptionService.getInvoices(shopId, limit ? parseInt(limit, 10) : 20);
  }

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  @Post('plans')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create subscription plan (Admin)' })
  @ApiResponse({ status: 201, description: 'Plan created', type: PlanResponseDto })
  async createPlan(@Body() dto: CreatePlanDto) {
    // TODO: Add admin role check
    return this.subscriptionService.createPlan(dto);
  }

  @Put('plans/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update subscription plan (Admin)' })
  @ApiResponse({ status: 200, description: 'Plan updated', type: PlanResponseDto })
  async updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    // TODO: Add admin role check
    return this.subscriptionService.updatePlan(id, dto);
  }

  @Delete('plans/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete subscription plan (Admin)' })
  @ApiResponse({ status: 204, description: 'Plan deleted' })
  async deletePlan(@Param('id') id: string) {
    // TODO: Add admin role check
    await this.subscriptionService.deletePlan(id);
  }
}
