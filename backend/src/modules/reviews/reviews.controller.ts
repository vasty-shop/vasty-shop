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
  Request,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateReviewDto,
  UpdateReviewDto,
  ShopResponseDto,
  ReportReviewDto,
  ModerateReviewDto,
  QueryReviewsDto,
} from './dto';

@ApiTags('reviews')
@Controller('reviews')
@ApiHeader({
  name: 'x-shop-id',
  description: 'Shop ID for vendor context (required for vendor operations)',
  required: false,
})
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /**
   * Create a new review
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a product review' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'User already reviewed this product' })
  async createReview(@Body() dto: CreateReviewDto, @Request() req) {
    return this.reviewsService.createReview(dto, req.user.userId, req.user);
  }

  /**
   * Get reviews for a product
   */
  @Get('product/:productId')
  @ApiOperation({ summary: 'Get product reviews' })
  @ApiResponse({ status: 200, description: 'List of product reviews' })
  async getProductReviews(
    @Param('productId') productId: string,
    @Query() query: QueryReviewsDto,
  ) {
    return this.reviewsService.getProductReviews(productId, query);
  }

  /**
   * Get review summary for a product
   */
  @Get('product/:productId/summary')
  @ApiOperation({ summary: 'Get review summary for a product' })
  @ApiResponse({
    status: 200,
    description: 'Review summary with statistics',
    schema: {
      example: {
        totalReviews: 150,
        averageRating: 4.5,
        ratingDistribution: { 5: 80, 4: 40, 3: 20, 2: 5, 1: 5 },
        verifiedPurchases: 120,
        wouldRecommendPercentage: 95,
      },
    },
  })
  async getProductReviewSummary(@Param('productId') productId: string) {
    return this.reviewsService.getProductReviewSummary(productId);
  }

  /**
   * Recalculate product rating from reviews
   */
  @Post('product/:productId/recalculate-rating')
  @ApiOperation({ summary: 'Recalculate product rating from reviews' })
  @ApiResponse({ status: 200, description: 'Rating recalculated successfully' })
  async recalculateProductRating(@Param('productId') productId: string) {
    await this.reviewsService.updateProductRating(productId);
    const summary = await this.reviewsService.getProductReviewSummary(productId);
    return {
      success: true,
      message: 'Rating recalculated successfully',
      rating: summary.averageRating,
      totalReviews: summary.totalReviews,
    };
  }

  /**
   * Get reviews by authenticated user
   */
  @Get('user/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get authenticated user reviews' })
  @ApiResponse({ status: 200, description: 'List of user reviews' })
  async getUserReviews(@Query() query: QueryReviewsDto, @Request() req) {
    return this.reviewsService.getUserReviews(req.user.userId, query);
  }

  /**
   * Get reviews by user ID
   */
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user reviews by user ID' })
  @ApiResponse({ status: 200, description: 'List of user reviews' })
  async getUserReviewsById(
    @Param('userId') userId: string,
    @Query() query: QueryReviewsDto,
  ) {
    return this.reviewsService.getUserReviews(userId, query);
  }

  /**
   * Get all reviews for admin (platform-wide)
   * IMPORTANT: This must come BEFORE @Get(':id') to avoid route conflict
   */
  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all reviews (admin only)' })
  @ApiResponse({ status: 200, description: 'All reviews returned successfully' })
  async getAdminReviews(@Query() query: QueryReviewsDto) {
    return this.reviewsService.getAdminReviews(query);
  }

  /**
   * Get reviews for a shop (vendor endpoint using x-shop-id header)
   * IMPORTANT: This must come BEFORE @Get(':id') to avoid route conflict
   */
  @Get('shop')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get reviews for shop (uses x-shop-id header)' })
  @ApiResponse({ status: 200, description: 'Shop reviews returned successfully' })
  @ApiResponse({ status: 400, description: 'Shop ID missing from header' })
  async getShopReviews(
    @Query() query: QueryReviewsDto,
    @Request() req,
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.reviewsService.getShopReviews(shopId, query);
  }

  /**
   * Get shop review statistics
   * IMPORTANT: This must come BEFORE @Get(':id') to avoid route conflict
   */
  @Get('shop/statistics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get shop review statistics (uses x-shop-id header)' })
  @ApiResponse({ status: 200, description: 'Shop review statistics' })
  @ApiResponse({ status: 400, description: 'Shop ID missing from header' })
  async getShopStatistics(@Request() req) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.reviewsService.getShopStatistics(shopId);
  }

  /**
   * Get reviews for a shop by shop ID (legacy endpoint for backward compatibility)
   */
  @Get('by-shop/:shopId')
  @ApiOperation({ summary: 'Get reviews for shop (legacy - use shop endpoint with x-shop-id header instead)' })
  @ApiResponse({ status: 200, description: 'Shop reviews returned successfully' })
  async getShopReviewsLegacy(
    @Param('shopId') shopId: string,
    @Query() query: QueryReviewsDto,
  ) {
    return this.reviewsService.getShopReviews(shopId, query);
  }

  /**
   * Get a single review
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get review by ID' })
  @ApiResponse({ status: 200, description: 'Review details' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async getReview(@Param('id') id: string) {
    return this.reviewsService.getReview(id);
  }

  /**
   * Update a review
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update review' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your review' })
  async updateReview(
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
    @Request() req,
  ) {
    return this.reviewsService.updateReview(id, dto, req.user.userId);
  }

  /**
   * Delete a review
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete review' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your review' })
  async deleteReview(@Param('id') id: string, @Request() req) {
    return this.reviewsService.deleteReview(id, req.user.userId);
  }

  /**
   * Mark review as helpful (no auth required)
   */
  @Post(':id/helpful')
  @ApiOperation({ summary: 'Mark review as helpful' })
  @ApiResponse({ status: 200, description: 'Review marked as helpful' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async markHelpful(@Param('id') id: string) {
    return this.reviewsService.markHelpful(id, 'anonymous');
  }

  /**
   * Report a review
   */
  @Post(':id/report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Report a review' })
  @ApiResponse({ status: 201, description: 'Review reported successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async reportReview(
    @Param('id') id: string,
    @Body() dto: ReportReviewDto,
    @Request() req,
  ) {
    return this.reviewsService.reportReview(id, dto, req.user.userId);
  }

  /**
   * Shop response to review
   */
  @Post(':id/respond')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add shop response to review (uses x-shop-id header for validation)' })
  @ApiResponse({ status: 200, description: 'Response added successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not shop owner/admin' })
  @ApiResponse({ status: 400, description: 'Shop ID missing from header' })
  async addShopResponse(
    @Param('id') id: string,
    @Body() dto: ShopResponseDto,
    @Request() req,
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.reviewsService.addShopResponse(id, dto, req.user.userId, shopId);
  }

  /**
   * Moderate a review (admin only)
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Moderate a review (admin only)' })
  @ApiResponse({ status: 200, description: 'Review moderated successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  async moderateReview(
    @Param('id') id: string,
    @Body() dto: ModerateReviewDto,
    @Request() req,
  ) {
    return this.reviewsService.moderateReview(id, dto, req.user.userId);
  }

  /**
   * Toggle review featured status
   */
  @Patch(':id/featured')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle review featured status' })
  @ApiResponse({ status: 200, description: 'Review featured status toggled' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async toggleFeatured(@Param('id') id: string, @Request() req) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.reviewsService.toggleFeatured(id, req.user.userId, shopId);
  }

  /**
   * Toggle review visibility (hidden/visible)
   */
  @Patch(':id/visibility')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle review visibility' })
  @ApiResponse({ status: 200, description: 'Review visibility toggled' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async toggleVisibility(@Param('id') id: string, @Request() req) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.reviewsService.toggleVisibility(id, req.user.userId, shopId);
  }
}
