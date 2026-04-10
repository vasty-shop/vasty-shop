import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
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
import { LoyaltyService } from './loyalty.service';
import {
  RedeemPointsDto,
  GetLoyaltyTransactionsDto,
  LoyaltyPointsResponseDto,
  LoyaltyTransactionResponseDto,
  AdminAwardPointsDto,
  AdminDeductPointsDto,
} from './dto/loyalty.dto';

@ApiTags('Loyalty Points')
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  // ============================================
  // CUSTOMER ENDPOINTS
  // ============================================

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get loyalty account' })
  @ApiResponse({ status: 200, description: 'Loyalty account details', type: LoyaltyPointsResponseDto })
  async getLoyaltyAccount(@Req() req: any) {
    const userId = req.user?.sub || req.user?.userId;
    return this.loyaltyService.getOrCreateLoyaltyAccount(userId);
  }

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get points balance with tier info' })
  @ApiResponse({ status: 200, description: 'Points balance and tier details' })
  async getPointsBalance(@Req() req: any) {
    const userId = req.user?.sub || req.user?.userId;
    return this.loyaltyService.getPointsBalance(userId);
  }

  @Get('tiers')
  @ApiOperation({ summary: 'Get loyalty tiers' })
  @ApiResponse({ status: 200, description: 'List of loyalty tiers' })
  async getTiers() {
    return this.loyaltyService.getTiers();
  }

  @Post('redeem')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redeem points for discount' })
  @ApiResponse({ status: 200, description: 'Points redeemed successfully' })
  async redeemPoints(@Req() req: any, @Body() dto: RedeemPointsDto) {
    const userId = req.user?.sub || req.user?.userId;
    return this.loyaltyService.redeemPoints(userId, dto);
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get points transaction history' })
  @ApiResponse({ status: 200, description: 'Transaction list', type: [LoyaltyTransactionResponseDto] })
  async getTransactions(@Req() req: any, @Query() dto: GetLoyaltyTransactionsDto) {
    const userId = req.user?.sub || req.user?.userId;
    return this.loyaltyService.getTransactions(userId, dto);
  }

  @Get('calculate/:points')
  @ApiOperation({ summary: 'Calculate discount value for points' })
  @ApiResponse({ status: 200, description: 'Discount value' })
  async calculatePointsValue(@Param('points') points: string) {
    const pointsNum = parseInt(points, 10);
    return {
      points: pointsNum,
      discountValue: this.loyaltyService.getPointsValue(pointsNum),
      currency: 'USD',
    };
  }

  @Get('points-for/:amount')
  @ApiOperation({ summary: 'Calculate points needed for discount amount' })
  @ApiResponse({ status: 200, description: 'Points needed' })
  async getPointsForDiscount(@Param('amount') amount: string) {
    const amountNum = parseFloat(amount);
    return {
      discountAmount: amountNum,
      pointsRequired: this.loyaltyService.getPointsForDiscount(amountNum),
      currency: 'USD',
    };
  }

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  @Post('admin/award')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: Award bonus points to user' })
  @ApiResponse({ status: 200, description: 'Points awarded' })
  async adminAwardPoints(@Req() req: any, @Body() dto: AdminAwardPointsDto) {
    const adminUserId = req.user?.sub || req.user?.userId;
    // TODO: Add admin role check
    return this.loyaltyService.awardBonusPoints(
      dto.userId,
      dto.points,
      dto.reason,
      'admin',
      adminUserId,
    );
  }

  @Post('admin/deduct')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: Deduct points from user' })
  @ApiResponse({ status: 200, description: 'Points deducted' })
  async adminDeductPoints(@Req() req: any, @Body() dto: AdminDeductPointsDto) {
    const adminUserId = req.user?.sub || req.user?.userId;
    // TODO: Add admin role check
    return this.loyaltyService.adminAdjustPoints(
      adminUserId,
      dto.userId,
      -dto.points,
      dto.reason,
    );
  }

  @Get('admin/user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get user loyalty account' })
  @ApiResponse({ status: 200, description: 'User loyalty account' })
  async adminGetUserAccount(@Param('userId') userId: string) {
    // TODO: Add admin role check
    return this.loyaltyService.getOrCreateLoyaltyAccount(userId);
  }

  @Get('admin/user/:userId/transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get user transaction history' })
  @ApiResponse({ status: 200, description: 'User transaction list' })
  async adminGetUserTransactions(
    @Param('userId') userId: string,
    @Query() dto: GetLoyaltyTransactionsDto,
  ) {
    // TODO: Add admin role check
    return this.loyaltyService.getTransactions(userId, dto);
  }
}
