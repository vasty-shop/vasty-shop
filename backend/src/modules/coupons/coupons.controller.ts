import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  CreateCouponDto,
  UpdateCouponDto,
  ApplyCouponDto,
  QueryCouponsDto,
  CouponUsageDto,
  BulkCouponActionDto,
} from './dto/coupon.dto';

@ApiTags('coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  @Get('code/:code')
  @ApiOperation({ summary: 'Get coupon by code' })
  @ApiResponse({ status: 200, description: 'Coupon details' })
  async getByCode(@Param('code') code: string) {
    return this.couponsService.findByCode(code);
  }

  // ============================================
  // USER ENDPOINTS
  // ============================================

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Apply coupon to cart/order' })
  @ApiResponse({ status: 200, description: 'Coupon applied' })
  async applyCoupon(@Body() dto: ApplyCouponDto, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.couponsService.applyCoupon(dto, userId);
  }

  @Get('available')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get available coupons for user' })
  @ApiQuery({ name: 'shopId', required: false })
  @ApiQuery({ name: 'zoneId', required: false })
  @ApiResponse({ status: 200, description: 'Available coupons' })
  async getAvailableCoupons(
    @Request() req,
    @Query('shopId') shopId?: string,
    @Query('zoneId') zoneId?: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.couponsService.getAvailableCoupons(userId, shopId, zoneId);
  }

  // ============================================
  // ADMIN/VENDOR ENDPOINTS
  // ============================================

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new coupon' })
  @ApiResponse({ status: 201, description: 'Coupon created' })
  async create(@Body() dto: CreateCouponDto, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.couponsService.create(dto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all coupons' })
  @ApiResponse({ status: 200, description: 'List of coupons' })
  async findAll(@Query() query: QueryCouponsDto) {
    return this.couponsService.findAll(query);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get coupon statistics' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month'] })
  @ApiQuery({ name: 'shopId', required: false })
  @ApiResponse({ status: 200, description: 'Coupon statistics' })
  async getStats(@Query('period') period?: string, @Query('shopId') shopId?: string) {
    return this.couponsService.getStats(period, shopId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get coupon by ID' })
  @ApiResponse({ status: 200, description: 'Coupon details' })
  async findById(@Param('id') id: string) {
    return this.couponsService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update coupon' })
  @ApiResponse({ status: 200, description: 'Coupon updated' })
  async update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete coupon' })
  @ApiResponse({ status: 200, description: 'Coupon deleted' })
  async delete(@Param('id') id: string) {
    return this.couponsService.delete(id);
  }

  @Post('bulk-action')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Bulk action on coupons (admin)' })
  @ApiResponse({ status: 200, description: 'Bulk action completed' })
  async bulkAction(@Body() dto: BulkCouponActionDto) {
    return this.couponsService.bulkAction(dto);
  }

  @Post('record-usage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Record coupon usage (internal)' })
  @ApiResponse({ status: 200, description: 'Usage recorded' })
  async recordUsage(@Body() dto: CouponUsageDto, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.couponsService.recordUsage(dto, userId);
  }
}
