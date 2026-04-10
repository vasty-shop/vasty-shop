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
import { BannersService } from './banners.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  CreateBannerDto,
  UpdateBannerDto,
  QueryBannersDto,
  CreateAdDto,
  UpdateAdDto,
  QueryAdsDto,
  AdPricingDto,
  RecordInteractionDto,
  BannerPlacement,
  AdStatus,
} from './dto/banner.dto';

@ApiTags('banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  // ============================================
  // PUBLIC BANNER ENDPOINTS
  // ============================================

  @Get('active')
  @ApiOperation({ summary: 'Get active banners for display' })
  @ApiQuery({ name: 'placement', required: false, enum: BannerPlacement })
  @ApiQuery({ name: 'zoneId', required: false })
  @ApiResponse({ status: 200, description: 'Active banners' })
  async getActiveBanners(
    @Query('placement') placement?: BannerPlacement,
    @Query('zoneId') zoneId?: string,
  ) {
    return this.bannersService.getActiveBanners(placement, zoneId);
  }

  @Post('interaction')
  @ApiOperation({ summary: 'Record banner/ad interaction' })
  @ApiResponse({ status: 200, description: 'Interaction recorded' })
  async recordInteraction(@Body() dto: RecordInteractionDto, @Request() req) {
    const userId = req.user?.sub || req.user?.userId;
    return this.bannersService.recordInteraction(dto, userId);
  }

  // ============================================
  // ADMIN BANNER ENDPOINTS
  // ============================================

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new banner (admin)' })
  @ApiResponse({ status: 201, description: 'Banner created' })
  async createBanner(@Body() dto: CreateBannerDto, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.bannersService.createBanner(dto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all banners (admin)' })
  @ApiResponse({ status: 200, description: 'List of banners' })
  async getBanners(@Query() query: QueryBannersDto) {
    return this.bannersService.getBanners(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get banner by ID (admin)' })
  @ApiResponse({ status: 200, description: 'Banner details' })
  async getBanner(@Param('id') id: string) {
    return this.bannersService.getBanner(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update banner (admin)' })
  @ApiResponse({ status: 200, description: 'Banner updated' })
  async updateBanner(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.bannersService.updateBanner(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete banner (admin)' })
  @ApiResponse({ status: 200, description: 'Banner deleted' })
  async deleteBanner(@Param('id') id: string) {
    return this.bannersService.deleteBanner(id);
  }

  @Post('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reorder banners (admin)' })
  @ApiResponse({ status: 200, description: 'Banners reordered' })
  async reorderBanners(@Body('bannerIds') bannerIds: string[]) {
    return this.bannersService.reorderBanners(bannerIds);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get banner statistics (admin)' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month', 'all'] })
  @ApiResponse({ status: 200, description: 'Banner statistics' })
  async getBannerStats(@Param('id') id: string, @Query('period') period?: string) {
    return this.bannersService.getStats('banner', id, period);
  }

  // ============================================
  // PAID ADS ENDPOINTS
  // ============================================

  @Post('ads')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a paid ad (vendor)' })
  @ApiResponse({ status: 201, description: 'Ad created' })
  async createAd(@Body() dto: CreateAdDto, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.bannersService.createAd(dto, userId);
  }

  @Get('ads')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all ads (admin)' })
  @ApiResponse({ status: 200, description: 'List of ads' })
  async getAds(@Query() query: QueryAdsDto) {
    return this.bannersService.getAds(query);
  }

  @Get('ads/my-ads')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my ads (vendor)' })
  @ApiQuery({ name: 'status', required: false, enum: AdStatus })
  @ApiResponse({ status: 200, description: 'Vendor ads' })
  async getMyAds(@Request() req, @Query('status') status?: AdStatus) {
    const userId = req.user.sub || req.user.userId;
    return this.bannersService.getVendorAds(userId, status);
  }

  @Get('ads/pricing')
  @ApiOperation({ summary: 'Get ad pricing' })
  @ApiResponse({ status: 200, description: 'Ad pricing' })
  async getAdPricing() {
    return this.bannersService.getAdPricing();
  }

  @Post('ads/pricing')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Set ad pricing (admin)' })
  @ApiResponse({ status: 200, description: 'Pricing set' })
  async setAdPricing(@Body() dto: AdPricingDto) {
    return this.bannersService.setAdPricing(dto);
  }

  @Get('ads/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get ad by ID' })
  @ApiResponse({ status: 200, description: 'Ad details' })
  async getAd(@Param('id') id: string) {
    return this.bannersService.getAd(id);
  }

  @Put('ads/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update ad (vendor)' })
  @ApiResponse({ status: 200, description: 'Ad updated' })
  async updateAd(@Param('id') id: string, @Body() dto: UpdateAdDto) {
    return this.bannersService.updateAd(id, dto);
  }

  @Patch('ads/:id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Review ad (admin)' })
  @ApiResponse({ status: 200, description: 'Ad reviewed' })
  async reviewAd(
    @Param('id') id: string,
    @Body('approved') approved: boolean,
    @Body('reason') reason?: string,
  ) {
    return this.bannersService.reviewAd(id, approved, reason);
  }

  @Patch('ads/:id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Pause/Resume ad (vendor)' })
  @ApiResponse({ status: 200, description: 'Ad toggled' })
  async toggleAd(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.bannersService.toggleAdStatus(id, userId);
  }

  @Get('ads/:id/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get ad statistics' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month', 'all'] })
  @ApiResponse({ status: 200, description: 'Ad statistics' })
  async getAdStats(@Param('id') id: string, @Query('period') period?: string) {
    return this.bannersService.getStats('ad', id, period);
  }
}
