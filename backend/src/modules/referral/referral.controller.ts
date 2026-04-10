import {
  Controller,
  Get,
  Post,
  Put,
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
import { ReferralService } from './referral.service';
import {
  UpdateReferralConfigDto,
  ApplyReferralCodeDto,
  CreateCustomCodeDto,
  GetReferralsDto,
  ReferralConfigResponseDto,
  ReferralCodeResponseDto,
  ReferralResponseDto,
  ReferralStatsResponseDto,
} from './dto/referral.dto';

@ApiTags('Referrals')
@Controller('referrals')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  @Get('config')
  @ApiOperation({ summary: 'Get referral program configuration' })
  @ApiResponse({ status: 200, description: 'Referral config', type: ReferralConfigResponseDto })
  async getConfig() {
    return this.referralService.getConfig();
  }

  @Get('code/:code/info')
  @ApiOperation({ summary: 'Get referral code info (for validation)' })
  @ApiResponse({ status: 200, description: 'Code info' })
  async getCodeInfo(@Param('code') code: string) {
    return this.referralService.getReferralCodeInfo(code);
  }

  // ============================================
  // USER ENDPOINTS
  // ============================================

  @Get('my-code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get or create user referral code' })
  @ApiResponse({ status: 200, description: 'User referral code', type: ReferralCodeResponseDto })
  async getMyCode(@Req() req: any) {
    const userId = req.user?.sub || req.user?.userId;
    return this.referralService.getUserReferralCode(userId);
  }

  @Post('my-code/custom')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create custom referral code' })
  @ApiResponse({ status: 201, description: 'Custom code created', type: ReferralCodeResponseDto })
  async createCustomCode(@Req() req: any, @Body() dto: CreateCustomCodeDto) {
    const userId = req.user?.sub || req.user?.userId;
    return this.referralService.createReferralCode(userId, dto.code);
  }

  @Get('my-stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user referral stats' })
  @ApiResponse({ status: 200, description: 'Referral stats', type: ReferralStatsResponseDto })
  async getMyStats(@Req() req: any) {
    const userId = req.user?.sub || req.user?.userId;
    return this.referralService.getUserReferralStats(userId);
  }

  @Get('my-referrals')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user referrals list' })
  @ApiResponse({ status: 200, description: 'Referrals list', type: [ReferralResponseDto] })
  async getMyReferrals(@Req() req: any, @Query() dto: GetReferralsDto) {
    const userId = req.user?.sub || req.user?.userId;
    return this.referralService.getUserReferrals(userId, dto);
  }

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apply referral code (for new users)' })
  @ApiResponse({ status: 200, description: 'Referral applied' })
  async applyCode(@Req() req: any, @Body() dto: ApplyReferralCodeDto) {
    const userId = req.user?.sub || req.user?.userId;
    return this.referralService.applyReferralCode(userId, dto.code);
  }

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  @Put('config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update referral config (Admin)' })
  @ApiResponse({ status: 200, description: 'Config updated', type: ReferralConfigResponseDto })
  async updateConfig(@Body() dto: UpdateReferralConfigDto) {
    // TODO: Add admin role check
    return this.referralService.updateConfig(dto);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all referrals (Admin)' })
  @ApiResponse({ status: 200, description: 'All referrals', type: [ReferralResponseDto] })
  async getAllReferrals(@Query() dto: GetReferralsDto) {
    // TODO: Add admin role check
    return this.referralService.getAllReferrals(dto);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get program statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Program stats' })
  async getProgramStats() {
    // TODO: Add admin role check
    return this.referralService.getProgramStats();
  }
}
