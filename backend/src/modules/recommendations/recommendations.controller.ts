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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/decorators/roles.decorator';
import { RecommendationsService } from './recommendations.service';
import {
  GetProductRecommendationsDto,
  GetPersonalizedRecommendationsDto,
  GetSimilarProductsDto,
  GetFrequentlyBoughtTogetherDto,
  GetCartRecommendationsDto,
  GetStoreRecommendationsDto,
  GetNearbyStoresDto,
  GetTrendingProductsDto,
  GetBestSellersDto,
  GetNewArrivalsDto,
  TrackProductViewDto,
  TrackProductInteractionDto,
  TrackSearchDto,
  TrackPurchaseDto,
  UpdateUserPreferencesDto,
  ConfigureRecommendationEngineDto,
  RecommendationAnalyticsDto,
  GetRecommendationPerformanceDto,
  CreateRecommendationTestDto,
  GetTestResultsDto,
  GetUpsellRecommendationsDto,
  GetCrossSellRecommendationsDto,
  GetBundleSuggestionsDto,
  GetSeasonalRecommendationsDto,
  GetContextualRecommendationsDto,
  SubmitRecommendationFeedbackDto,
} from './dto/recommendations.dto';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  // ============================================
  // PUBLIC PRODUCT RECOMMENDATIONS
  // ============================================

  @Get('products')
  async getProductRecommendations(@Query() dto: GetProductRecommendationsDto, @Req() req: any) {
    const userId = req.user?.sub || req.user?.userId;
    return this.recommendationsService.getProductRecommendations(dto, userId);
  }

  @Get('products/similar/:productId')
  async getSimilarProducts(
    @Param('productId') productId: string,
    @Query() dto: Omit<GetSimilarProductsDto, 'productId'>,
  ) {
    return this.recommendationsService.getSimilarProducts({ ...dto, productId });
  }

  @Get('products/frequently-bought-together/:productId')
  async getFrequentlyBoughtTogether(
    @Param('productId') productId: string,
    @Query() dto: Omit<GetFrequentlyBoughtTogetherDto, 'productId'>,
  ) {
    return this.recommendationsService.getFrequentlyBoughtTogether({ ...dto, productId });
  }

  @Get('products/trending')
  async getTrendingProducts(@Query() dto: GetTrendingProductsDto) {
    return this.recommendationsService.getTrendingProducts(dto);
  }

  @Get('products/bestsellers')
  async getBestSellers(@Query() dto: GetBestSellersDto) {
    return this.recommendationsService.getBestSellers(dto);
  }

  @Get('products/new-arrivals')
  async getNewArrivals(@Query() dto: GetNewArrivalsDto) {
    return this.recommendationsService.getNewArrivals(dto);
  }

  @Get('products/category/:categoryId')
  async getCategoryRecommendations(
    @Param('categoryId') categoryId: string,
    @Query('limit') limit?: string,
  ) {
    return this.recommendationsService.getCategoryBasedRecommendations(
      categoryId,
      limit ? parseInt(limit) : 10
    );
  }

  // ============================================
  // PERSONALIZED RECOMMENDATIONS (AUTH REQUIRED)
  // ============================================

  @Get('personalized')
  @UseGuards(JwtAuthGuard)
  async getPersonalizedRecommendations(
    @Query() dto: GetPersonalizedRecommendationsDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.recommendationsService.getPersonalizedRecommendations(dto, userId);
  }

  @Post('cart')
  @UseGuards(JwtAuthGuard)
  async getCartRecommendations(@Body() dto: GetCartRecommendationsDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.recommendationsService.getCartRecommendations(dto, userId);
  }

  // ============================================
  // UPSELL & CROSS-SELL
  // ============================================

  @Get('products/upsell/:productId')
  async getUpsellRecommendations(
    @Param('productId') productId: string,
    @Query() dto: Omit<GetUpsellRecommendationsDto, 'productId'>,
  ) {
    return this.recommendationsService.getUpsellRecommendations({ ...dto, productId });
  }

  @Post('products/cross-sell')
  async getCrossSellRecommendations(@Body() dto: GetCrossSellRecommendationsDto, @Req() req: any) {
    const userId = req.user?.sub || req.user?.userId;
    return this.recommendationsService.getCrossSellRecommendations(dto, userId);
  }

  @Get('products/bundles/:productId')
  async getBundleSuggestions(
    @Param('productId') productId: string,
    @Query() dto: Omit<GetBundleSuggestionsDto, 'productId'>,
  ) {
    return this.recommendationsService.getBundleSuggestions({ ...dto, productId });
  }

  // ============================================
  // STORE RECOMMENDATIONS
  // ============================================

  @Get('stores')
  async getStoreRecommendations(@Query() dto: GetStoreRecommendationsDto, @Req() req: any) {
    const userId = req.user?.sub || req.user?.userId;
    return this.recommendationsService.getStoreRecommendations(dto, userId);
  }

  @Get('stores/nearby')
  async getNearbyStores(@Query() dto: GetNearbyStoresDto) {
    return this.recommendationsService.getNearbyStores(dto);
  }

  // ============================================
  // BEHAVIOR TRACKING
  // ============================================

  @Post('track/view')
  async trackProductView(@Body() dto: TrackProductViewDto, @Req() req: any) {
    const userId = req.user?.sub || req.user?.userId;
    return this.recommendationsService.trackProductView(dto, userId);
  }

  @Post('track/interaction')
  async trackProductInteraction(@Body() dto: TrackProductInteractionDto, @Req() req: any) {
    const userId = req.user?.sub || req.user?.userId;
    return this.recommendationsService.trackProductInteraction(dto, userId);
  }

  @Post('track/search')
  async trackSearch(@Body() dto: TrackSearchDto, @Req() req: any) {
    const userId = req.user?.sub || req.user?.userId;
    return this.recommendationsService.trackSearch(dto, userId);
  }

  @Post('track/purchase')
  @UseGuards(JwtAuthGuard)
  async trackPurchase(@Body() dto: TrackPurchaseDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.recommendationsService.trackPurchase(dto, userId);
  }

  // ============================================
  // USER PREFERENCES
  // ============================================

  @Get('preferences')
  @UseGuards(JwtAuthGuard)
  async getUserPreferences(@Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.recommendationsService.getUserPreferences(userId);
  }

  @Put('preferences')
  @UseGuards(JwtAuthGuard)
  async updateUserPreferences(@Body() dto: UpdateUserPreferencesDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.recommendationsService.updateUserPreferences(dto, userId);
  }

  // ============================================
  // FEEDBACK
  // ============================================

  @Post('feedback')
  @UseGuards(JwtAuthGuard)
  async submitFeedback(@Body() dto: SubmitRecommendationFeedbackDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.recommendationsService.submitFeedback(dto, userId);
  }

  // ============================================
  // ANALYTICS (ADMIN/VENDOR)
  // ============================================

  @Get('analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async getRecommendationAnalytics(@Query() dto: RecommendationAnalyticsDto) {
    return this.recommendationsService.getRecommendationAnalytics(dto);
  }

  @Get('analytics/performance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async getRecommendationPerformance(@Query() dto: GetRecommendationPerformanceDto) {
    return this.recommendationsService.getRecommendationPerformance(dto);
  }

  // ============================================
  // A/B TESTING (ADMIN)
  // ============================================

  @Post('tests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createRecommendationTest(@Body() dto: CreateRecommendationTestDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.recommendationsService.createRecommendationTest(dto, userId);
  }

  @Get('tests/:testId/results')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getTestResults(@Param('testId') testId: string, @Query('metrics') metrics?: string) {
    return this.recommendationsService.getTestResults({
      testId,
      metrics: metrics?.split(','),
    });
  }

  // ============================================
  // CONFIGURATION (ADMIN)
  // ============================================

  @Put('config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SHOP_OWNER)
  async configureEngine(@Body() dto: ConfigureRecommendationEngineDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.recommendationsService.configureEngine(dto, userId);
  }
}
