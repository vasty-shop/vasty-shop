import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CreateReviewDto,
  UpdateReviewDto,
  ShopResponseDto,
  ReportReviewDto,
  ModerateReviewDto,
  QueryReviewsDto,
  ReviewStatus,
} from './dto';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Create a new review
   */
  async createReview(dto: CreateReviewDto, userId: string, userContext?: any) {
    // Verify product exists
    const product = await this.db.getEntity('products', dto.productId);
    if (!product || product.deleted_at) {
      throw new NotFoundException('Product not found');
    }

    // Check if user already reviewed this product
    const existingReviews = await this.db.queryEntities('reviews', {
      filters: {
        product_id: dto.productId,
        user_id: userId,
      },
    });

    if (existingReviews.data && existingReviews.data.length > 0) {
      throw new ConflictException('You have already reviewed this product');
    }

    // Verify order if provided (for verified purchase badge)
    let isVerifiedPurchase = false;
    if (dto.orderId) {
      const order = await this.db.getEntity('orders', dto.orderId);
      if (order && order.user_id === userId && order.status === 'delivered') {
        // Check if order contains this product
        const orderItems = await this.db.queryEntities('order_items', {
          filters: { order_id: dto.orderId, product_id: dto.productId },
        });
        isVerifiedPurchase = orderItems.data && orderItems.data.length > 0;
      }
    }

    // Extract user info from the request context (populated by auth guard)
    // This is more reliable than getUserById as it uses the JWT token data
    let userName = 'Customer';
    let userAvatar: string | null = null;

    if (userContext) {
      try {
        this.logger.log(`[createReview] User context keys: ${Object.keys(userContext).join(', ')}`);
      } catch {
        // Ignore logging errors
      }
      // Try to get name from various possible locations in user context
      // If no name is set, use full email as display name
      userName = userContext.user_metadata?.full_name ||
                 userContext.user_metadata?.name ||
                 userContext.raw_user_meta_data?.full_name ||
                 userContext.raw_user_meta_data?.name ||
                 userContext.name ||
                 userContext.full_name ||
                 userContext.email ||
                 'Customer';
      userAvatar = userContext.user_metadata?.avatar_url ||
                   userContext.raw_user_meta_data?.avatar_url ||
                   userContext.avatar_url ||
                   userContext.avatar ||
                   null;
    }

    // Fallback: try to fetch from database if we still don't have a proper name
    if (userName === 'Customer' || !userName) {
      try {
        const userResult: any = await this.db.getUserById(userId);
        const user = userResult?.data?.user || userResult?.user || userResult;
        if (user) {
          userName = user.user_metadata?.full_name ||
                     user.user_metadata?.name ||
                     user.raw_user_meta_data?.full_name ||
                     user.raw_user_meta_data?.name ||
                     user.email ||
                     userName;
          userAvatar = userAvatar || user.user_metadata?.avatar_url ||
                       user.raw_user_meta_data?.avatar_url ||
                       null;
        }
      } catch (e: any) {
        this.logger.warn(`[createReview] Could not fetch user info for ${userId}: ${e?.message || e}`);
      }
    }

    this.logger.log(`[createReview] Final userName: ${userName}`);

    // Create review
    // Note: reviews table links to products via product_id; shop is determined through product.shop_id
    const now = new Date().toISOString();
    const reviewData: any = {
      product_id: dto.productId,
      user_id: userId,
      order_id: dto.orderId || null,
      rating: dto.rating,
      title: dto.title || '',
      review_text: dto.reviewText,
      review_images: dto.images || [],
      is_verified_purchase: isVerifiedPurchase,
      helpful_count: 0,
      not_helpful_count: 0,
      status: ReviewStatus.APPROVED, // Auto-approve for now
      created_at: now,
      updated_at: now,
    };

    // Always store user_name for display purposes
    // Use email as display name if no name set (better than 'Anonymous')
    const displayName = userName && userName !== 'Customer'
      ? userName
      : (userContext?.email || 'Customer');
    reviewData.user_name = displayName;

    if (userAvatar) {
      reviewData.user_avatar = userAvatar;
    }

    this.logger.log(`[createReview] Creating review with data: ${JSON.stringify(reviewData)}`);

    let review;
    try {
      review = await this.db.createEntity('reviews', reviewData);
    } catch (createError: any) {
      this.logger.error(`[createReview] Failed to create review: ${createError?.message || createError}`);
      throw createError;
    }

    // Update product rating
    await this.updateProductRating(dto.productId);

    // Add userName for frontend (camelCase mapping)
    review.userName = userName;
    review.userAvatar = userAvatar;

    return review;
  }

  /**
   * Get reviews for a product
   */
  async getProductReviews(productId: string, query: QueryReviewsDto) {
    const filters: any = {
      product_id: productId,
      deleted_at: null,
    };

    // Apply filters
    if (query.rating) {
      filters.rating = query.rating;
    }

    if (query.status) {
      filters.status = query.status;
    } else {
      // Default to showing only approved reviews
      filters.status = ReviewStatus.APPROVED;
    }

    if (query.verifiedOnly) {
      filters.is_verified_purchase = true;
    }

    if (query.withImagesOnly) {
      // Use JSONB query to check if images array is not empty
      filters.images = { $ne: [] };
    }

    // Determine sorting
    let orderBy = 'created_at';
    let order: 'asc' | 'desc' = 'desc';

    if (query.sortBy) {
      switch (query.sortBy) {
        case 'recent':
          orderBy = 'created_at';
          order = 'desc';
          break;
        case 'helpful':
          orderBy = 'helpful_count';
          order = 'desc';
          break;
        case 'rating_high':
          orderBy = 'rating';
          order = 'desc';
          break;
        case 'rating_low':
          orderBy = 'rating';
          order = 'asc';
          break;
      }
    }

    const reviews = await this.db.queryEntities('reviews', {
      filters,
      orderBy,
      order,
      limit: query.limit || 20,
      offset: query.offset || 0,
    });

    // Map user details for each review - prefer stored user_name, fallback to auth lookup
    for (const review of reviews.data || []) {
      // Use stored user_name if available (from when the review was created)
      if (review.user_name) {
        review.userName = review.user_name;
        review.userAvatar = review.user_avatar || null;
      } else {
        // Fallback: try to fetch from auth (for older reviews without stored name)
        try {
          if (review.user_id) {
            const userResult: any = await this.db.getUserById(review.user_id);
            const user = userResult?.data?.user || userResult?.user || userResult;
            if (user && user.email) {
              review.userName = user.user_metadata?.full_name ||
                                user.user_metadata?.name ||
                                user.raw_user_meta_data?.full_name ||
                                user.raw_user_meta_data?.name ||
                                user.email;
              review.userAvatar = user.user_metadata?.avatar_url ||
                                  user.raw_user_meta_data?.avatar_url ||
                                  null;
            } else {
              review.userName = 'Anonymous';
              review.userAvatar = null;
            }
          } else {
            review.userName = 'Anonymous';
            review.userAvatar = null;
          }
        } catch (e: any) {
          this.logger.warn(`[getProductReviews] Error fetching user ${review.user_id}: ${e?.message || e}`);
          review.userName = 'Anonymous';
          review.userAvatar = null;
        }
      }
      review.user = { id: review.user_id };
    }

    return reviews;
  }

  /**
   * Get reviews by a user
   */
  async getUserReviews(userId: string, query: QueryReviewsDto) {
    const reviews = await this.db.queryEntities('reviews', {
      filters: { user_id: userId, deleted_at: null },
      orderBy: 'created_at',
      order: 'desc',
      limit: query.limit || 20,
      offset: query.offset || 0,
    });

    // Get product details for each review
    for (const review of reviews.data || []) {
      const product = await this.db.getEntity('products', review.product_id);
      review.product = product;
    }

    return reviews;
  }

  /**
   * Get reviews for a shop
   */
  async getShopReviews(shopId: string, query: QueryReviewsDto) {
    try {
      // First, get all products for this shop
      const productsResult = await this.db
        .query()
        .from('products')
        .select('id')
        .where('shop_id', shopId)
        .get();

      const productIds = (productsResult || []).map((p: any) => p.id);

      if (productIds.length === 0) {
        return { data: [], count: 0 };
      }

      // Build query for reviews using query builder
      let reviewQuery = this.db
        .query()
        .from('reviews')
        .select('*')
        .whereIn('product_id', productIds)
        .whereNull('deleted_at');

      // Apply filters
      if (query.rating) {
        reviewQuery = reviewQuery.where('rating', query.rating);
      }

      if (query.status) {
        reviewQuery = reviewQuery.where('status', query.status);
      } else {
        // Default to showing only approved reviews
        reviewQuery = reviewQuery.where('status', ReviewStatus.APPROVED);
      }

      if (query.verifiedOnly) {
        reviewQuery = reviewQuery.where('is_verified_purchase', true);
      }

      // Determine sorting
      let orderColumn = 'created_at';
      let orderDirection: 'asc' | 'desc' = 'desc';

      if (query.sortBy) {
        switch (query.sortBy) {
          case 'recent':
            orderColumn = 'created_at';
            orderDirection = 'desc';
            break;
          case 'helpful':
            orderColumn = 'helpful_count';
            orderDirection = 'desc';
            break;
          case 'rating_high':
            orderColumn = 'rating';
            orderDirection = 'desc';
            break;
          case 'rating_low':
            orderColumn = 'rating';
            orderDirection = 'asc';
            break;
        }
      }

      reviewQuery = reviewQuery
        .orderBy(orderColumn, orderDirection)
        .limit(query.limit || 20)
        .offset(query.offset || 0);

      const reviews = await reviewQuery.get();

      // Get product and user details for each review
      for (const review of reviews || []) {
        try {
          const product = await this.db.getEntity('products', review.product_id);
          review.product = product;
        } catch {
          review.product = null;
        }

        // Use stored user_name if available, fallback to auth lookup
        if (review.user_name) {
          review.userName = review.user_name;
          review.userAvatar = review.user_avatar || null;
        } else {
          try {
            if (review.user_id) {
              const userResult: any = await this.db.getUserById(review.user_id);
              const user = userResult?.data?.user || userResult?.user || userResult;
              if (user && user.email) {
                review.userName = user.user_metadata?.full_name ||
                                  user.user_metadata?.name ||
                                  user.raw_user_meta_data?.full_name ||
                                  user.raw_user_meta_data?.name ||
                                  user.email?.split('@')[0] ||
                                  'Customer';
                review.userAvatar = user.user_metadata?.avatar_url ||
                                    user.raw_user_meta_data?.avatar_url ||
                                    null;
              } else {
                review.userName = 'Customer';
                review.userAvatar = null;
              }
            } else {
              review.userName = 'Customer';
              review.userAvatar = null;
            }
          } catch (e) {
            review.userName = 'Customer';
            review.userAvatar = null;
          }
        }
        review.user = { id: review.user_id };
      }

      return { data: reviews || [], count: reviews?.length || 0 };
    } catch (error) {
      this.logger.error('Failed to get shop reviews:', error);
      return { data: [], count: 0 };
    }
  }

  /**
   * Get a single review
   */
  async getReview(reviewId: string) {
    const review = await this.db.getEntity('reviews', reviewId);

    if (!review || review.deleted_at) {
      throw new NotFoundException('Review not found');
    }

    // Get product and user details
    const product = await this.db.getEntity('products', review.product_id);
    review.product = product;
    review.user = { id: review.user_id };

    return review;
  }

  /**
   * Update a review
   */
  async updateReview(reviewId: string, dto: UpdateReviewDto, userId: string) {
    const review = await this.db.getEntity('reviews', reviewId);

    if (!review || review.deleted_at) {
      throw new NotFoundException('Review not found');
    }

    if (review.user_id !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    const updateData: any = {
      updated_at: new Date(),
    };
    if (dto.rating !== undefined) updateData.rating = dto.rating;
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.reviewText !== undefined) updateData.review_text = dto.reviewText;
    if (dto.images !== undefined) updateData.review_images = dto.images;

    const updated = await this.db.updateEntity('reviews', reviewId, updateData);

    // Update product rating if rating changed
    if (dto.rating && dto.rating !== review.rating) {
      await this.updateProductRating(review.product_id);
    }

    return updated;
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string, userId: string) {
    const review = await this.db.getEntity('reviews', reviewId);

    if (!review || review.deleted_at) {
      throw new NotFoundException('Review not found');
    }

    if (review.user_id !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.db.updateEntity('reviews', reviewId, {
      deleted_at: new Date(),
    });

    // Update product rating
    await this.updateProductRating(review.product_id);

    return { success: true, message: 'Review deleted successfully' };
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: string, userId: string) {
    const review = await this.db.getEntity('reviews', reviewId);

    if (!review || review.deleted_at) {
      throw new NotFoundException('Review not found');
    }

    // Simply increment the helpful count
    // Note: A proper implementation would track who voted to prevent duplicate votes
    const newHelpfulCount = (review.helpful_count || 0) + 1;

    return await this.db.updateEntity('reviews', reviewId, {
      helpful_count: newHelpfulCount,
      updated_at: new Date(),
    });
  }

  /**
   * Report a review
   */
  async reportReview(reviewId: string, dto: ReportReviewDto, userId: string) {
    const review = await this.db.getEntity('reviews', reviewId);

    if (!review || review.deleted_at) {
      throw new NotFoundException('Review not found');
    }

    // Create report record
    await this.db.createEntity('review_reports', {
      review_id: reviewId,
      reporter_id: userId,
      reason: dto.reason,
      details: dto.details,
      status: 'pending',
      created_at: new Date(),
    });

    // Auto-flag review if multiple reports
    const reports = await this.db.queryEntities('review_reports', {
      filters: { review_id: reviewId, status: 'pending' },
    });

    if (reports.data && reports.data.length >= 3) {
      await this.db.updateEntity('reviews', reviewId, {
        status: ReviewStatus.FLAGGED,
        updated_at: new Date(),
      });
    }

    return { success: true, message: 'Review reported successfully' };
  }

  /**
   * Shop response to review
   */
  async addShopResponse(reviewId: string, dto: ShopResponseDto, userId: string, shopId: string) {
    const review = await this.db.getEntity('reviews', reviewId);

    if (!review || review.deleted_at) {
      throw new NotFoundException('Review not found');
    }

    // Get the product to verify it belongs to the shop
    const product = await this.db.getEntity('products', review.product_id);
    if (!product || product.shop_id !== shopId) {
      throw new ForbiddenException('This review does not belong to your shop');
    }

    // Verify user owns the shop or is a team member with permission
    const shop = await this.db.getEntity('shops', product.shop_id);
    if (shop.owner_id !== userId) {
      // Check if user is a team member with permission
      const teamMembers = await this.db.queryEntities('shop_team_members', {
        filters: {
          shop_id: product.shop_id,
          user_id: userId,
          status: 'active',
        },
      });

      if (!teamMembers.data || teamMembers.data.length === 0) {
        throw new ForbiddenException('You do not have permission to respond to this review');
      }

      const member = teamMembers.data[0];
      const hasPermission =
        member.role === 'owner' ||
        member.role === 'admin' ||
        member.permissions.includes('manage_reviews');

      if (!hasPermission) {
        throw new ForbiddenException('You do not have permission to respond to this review');
      }
    }

    return await this.db.updateEntity('reviews', reviewId, {
      shop_response: dto.responseText,
      responded_by: userId,
      responded_at: new Date(),
      updated_at: new Date(),
    });
  }

  /**
   * Moderate a review (admin only)
   */
  async moderateReview(reviewId: string, dto: ModerateReviewDto, userId: string) {
    // Verify user is admin or platform moderator
    await this.verifyAdminPermission(userId);

    const review = await this.db.getEntity('reviews', reviewId);

    if (!review || review.deleted_at) {
      throw new NotFoundException('Review not found');
    }

    return await this.db.updateEntity('reviews', reviewId, {
      status: dto.status,
      rejection_reason: dto.moderationNote || null,
      updated_at: new Date(),
    });
  }

  /**
   * Get review summary for a product
   */
  async getProductReviewSummary(productId: string) {
    const reviews = await this.db.queryEntities('reviews', {
      filters: {
        product_id: productId,
        status: ReviewStatus.APPROVED,
        deleted_at: null,
      },
    });

    if (!reviews.data || reviews.data.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
        verifiedPurchases: 0,
      };
    }

    const totalReviews = reviews.data.length;
    const sumRating = reviews.data.reduce((sum: number, r: any) => sum + r.rating, 0);
    const averageRating = sumRating / totalReviews;

    const ratingDistribution = {
      5: reviews.data.filter((r: any) => r.rating === 5).length,
      4: reviews.data.filter((r: any) => r.rating === 4).length,
      3: reviews.data.filter((r: any) => r.rating === 3).length,
      2: reviews.data.filter((r: any) => r.rating === 2).length,
      1: reviews.data.filter((r: any) => r.rating === 1).length,
    };

    const verifiedPurchases = reviews.data.filter((r: any) => r.is_verified_purchase).length;

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      ratingDistribution,
      verifiedPurchases,
    };
  }

  /**
   * Update product average rating
   */
  async updateProductRating(productId: string) {
    const summary = await this.getProductReviewSummary(productId);

    const updateData = {
      rating: Number(summary.averageRating) || 0,
      total_reviews: Number(summary.totalReviews) || 0,
      updated_at: new Date().toISOString(),
    };

    this.logger.log(`[updateProductRating] Updating product ${productId} with data: ${JSON.stringify(updateData)}`);

    try {
      await this.db.updateEntity('products', productId, updateData);
      this.logger.log(`[updateProductRating] Successfully updated product ${productId}`);
    } catch (error: any) {
      this.logger.error(`[updateProductRating] Failed to update product ${productId}: ${error?.message || error}`);
      // Try alternative approach if first one fails
      try {
        await this.db.query_builder()
          .from('products')
          .where('id', productId)
          .update(updateData)
          .execute();
        this.logger.log(`[updateProductRating] Successfully updated product ${productId} via query builder`);
      } catch (err2: any) {
        this.logger.error(`[updateProductRating] Query builder also failed: ${err2?.message || err2}`);
      }
    }
  }

  /**
   * Get all reviews for admin (platform-wide)
   */
  async getAdminReviews(query: QueryReviewsDto) {
    try {
      // Build query for all reviews
      let reviewQuery = this.db
        .query()
        .from('reviews')
        .select('*')
        .whereNull('deleted_at');

      // Apply filters
      if (query.rating) {
        reviewQuery = reviewQuery.where('rating', query.rating);
      }

      if (query.status) {
        reviewQuery = reviewQuery.where('status', query.status);
      }

      if (query.verifiedOnly) {
        reviewQuery = reviewQuery.where('is_verified_purchase', true);
      }

      // Sorting
      let orderColumn = 'created_at';
      let orderDirection: 'asc' | 'desc' = 'desc';

      if (query.sortBy) {
        switch (query.sortBy) {
          case 'recent':
            orderColumn = 'created_at';
            orderDirection = 'desc';
            break;
          case 'helpful':
            orderColumn = 'helpful_count';
            orderDirection = 'desc';
            break;
          case 'rating_high':
            orderColumn = 'rating';
            orderDirection = 'desc';
            break;
          case 'rating_low':
            orderColumn = 'rating';
            orderDirection = 'asc';
            break;
        }
      }

      reviewQuery = reviewQuery.orderBy(orderColumn, orderDirection);

      // Pagination
      const page = query.page || 1;
      const limit = query.limit || 10;
      const offset = (page - 1) * limit;

      reviewQuery = reviewQuery.limit(limit).offset(offset);

      const reviews = await reviewQuery.get();

      // Calculate stats
      const allReviewsResult = await this.db
        .query()
        .from('reviews')
        .select('rating', 'status')
        .whereNull('deleted_at')
        .get();

      const allReviews = allReviewsResult || [];
      const totalReviews = allReviews.length;
      const averageRating = totalReviews > 0
        ? allReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / totalReviews
        : 0;
      const pendingModeration = allReviews.filter((r: any) => r.status === 'pending').length;
      const approved = allReviews.filter((r: any) => r.status === 'approved').length;

      // Enrich reviews with product, user, and shop info
      const enrichedReviews = await Promise.all(
        (reviews || []).map(async (review: any) => {
          try {
            // Get product info
            const product = await this.db.getEntity('products', review.product_id);

            // Get user info - prefer stored user_name, fallback to auth
            let customerName = review.user_name || 'Unknown';
            let customerEmail = 'N/A';
            if (!review.user_name) {
              try {
                if (review.user_id) {
                  const userResult: any = await this.db.getUserById(review.user_id);
                  const user = userResult?.data?.user || userResult?.user || userResult;
                  if (user && user.email) {
                    customerName = user.user_metadata?.full_name ||
                                   user.user_metadata?.name ||
                                   user.raw_user_meta_data?.full_name ||
                                   user.raw_user_meta_data?.name ||
                                   user.email?.split('@')[0] ||
                                   'Customer';
                    customerEmail = user.email;
                  }
                }
              } catch (e) {
                // Silent fail - user might be deleted
              }
            }

            // Get shop info
            let shopName = 'Unknown Shop';
            let shopId = null;
            // Check for shop_id in product (could be different field names)
            const productShopId = product?.shop_id || product?.shopId;
            if (productShopId) {
              shopId = productShopId;
              try {
                const shop = await this.db.getEntity('shops', productShopId);
                if (shop) {
                  shopName = shop.name || 'Unknown Shop';
                }
              } catch (e) {
                this.logger.warn(`Failed to fetch shop ${productShopId}:`, e);
              }
            }

            return {
              id: review.id,
              productId: review.product_id,
              productName: product?.name || 'Unknown Product',
              productImage: product?.images?.[0] || '',
              customerId: review.user_id,
              customerName,
              customerEmail,
              shopId,
              shopName,
              rating: review.rating,
              comment: review.review_text || review.title || '',
              status: review.status || 'pending',
              createdAt: review.created_at,
            };
          } catch (error) {
            this.logger.warn(`Failed to enrich review ${review.id}:`, error);
            return {
              id: review.id,
              productId: review.product_id,
              productName: 'Unknown Product',
              productImage: '',
              customerId: review.user_id,
              customerName: 'Unknown',
              customerEmail: 'N/A',
              shopId: null,
              shopName: 'Unknown Shop',
              rating: review.rating,
              comment: review.review_text || review.title || '',
              status: review.status || 'pending',
              createdAt: review.created_at,
            };
          }
        }),
      );

      return {
        data: enrichedReviews,
        count: totalReviews,
        stats: {
          totalReviews,
          averageRating,
          pendingModeration,
          approved,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get admin reviews:', error);
      return { data: [], count: 0, stats: { totalReviews: 0, averageRating: 0, pendingModeration: 0, approved: 0 } };
    }
  }

  /**
   * Get shop review statistics
   */
  async getShopStatistics(shopId: string) {
    try {
      // First, get all products for this shop
      const productsResult = await this.db
        .query()
        .from('products')
        .select('id')
        .where('shop_id', shopId)
        .get();

      const productIds = (productsResult || []).map((p: any) => p.id);

      const emptyStats = {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        pendingCount: 0,
      };

      if (productIds.length === 0) {
        return emptyStats;
      }

      // Get approved reviews
      const reviews = await this.db
        .query()
        .from('reviews')
        .select('*')
        .whereIn('product_id', productIds)
        .where('status', ReviewStatus.APPROVED)
        .whereNull('deleted_at')
        .get();

      if (!reviews || reviews.length === 0) {
        return emptyStats;
      }

      const totalReviews = reviews.length;
      const sumRating = reviews.reduce((sum: number, r: any) => sum + Number(r.rating || 0), 0);
      const averageRating = sumRating / totalReviews;

      const ratingDistribution = {
        5: reviews.filter((r: any) => Number(r.rating) === 5).length,
        4: reviews.filter((r: any) => Number(r.rating) === 4).length,
        3: reviews.filter((r: any) => Number(r.rating) === 3).length,
        2: reviews.filter((r: any) => Number(r.rating) === 2).length,
        1: reviews.filter((r: any) => Number(r.rating) === 1).length,
      };

      // Get pending reviews count
      const pendingReviews = await this.db
        .query()
        .from('reviews')
        .select('id')
        .whereIn('product_id', productIds)
        .where('status', ReviewStatus.PENDING)
        .whereNull('deleted_at')
        .get();

      return {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
        pendingCount: pendingReviews?.length || 0,
      };
    } catch (error) {
      this.logger.error('Failed to get shop statistics:', error);
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        pendingCount: 0,
      };
    }
  }

  /**
   * Toggle review featured status (vendor only)
   */
  async toggleFeatured(reviewId: string, userId: string, shopId: string) {
    const review = await this.db.getEntity('reviews', reviewId);

    if (!review || review.deleted_at) {
      throw new NotFoundException('Review not found');
    }

    // Get the product to verify it belongs to the shop
    const product = await this.db.getEntity('products', review.product_id);
    if (!product || product.shop_id !== shopId) {
      throw new ForbiddenException('This review does not belong to your shop');
    }

    // Verify user owns the shop or is a team member with permission
    const shop = await this.db.getEntity('shops', product.shop_id);
    if (shop.owner_id !== userId) {
      const teamMembers = await this.db.queryEntities('shop_team_members', {
        filters: {
          shop_id: product.shop_id,
          user_id: userId,
          status: 'active',
        },
      });

      if (!teamMembers.data || teamMembers.data.length === 0) {
        throw new ForbiddenException('You do not have permission to feature this review');
      }

      const member = teamMembers.data[0];
      const hasPermission =
        member.role === 'owner' ||
        member.role === 'admin' ||
        member.permissions.includes('manage_reviews');

      if (!hasPermission) {
        throw new ForbiddenException('You do not have permission to feature this review');
      }
    }

    // Note: is_featured is not in the reviews schema, returning review as-is
    // To implement this feature, add is_featured column to reviews table
    return review;
  }

  /**
   * Toggle review visibility (hidden/visible) (vendor only)
   */
  async toggleVisibility(reviewId: string, userId: string, shopId: string) {
    const review = await this.db.getEntity('reviews', reviewId);

    if (!review || review.deleted_at) {
      throw new NotFoundException('Review not found');
    }

    // Get the product to verify it belongs to the shop
    const product = await this.db.getEntity('products', review.product_id);
    if (!product || product.shop_id !== shopId) {
      throw new ForbiddenException('This review does not belong to your shop');
    }

    // Verify user owns the shop or is a team member with permission
    const shop = await this.db.getEntity('shops', product.shop_id);
    if (shop.owner_id !== userId) {
      const teamMembers = await this.db.queryEntities('shop_team_members', {
        filters: {
          shop_id: product.shop_id,
          user_id: userId,
          status: 'active',
        },
      });

      if (!teamMembers.data || teamMembers.data.length === 0) {
        throw new ForbiddenException('You do not have permission to hide this review');
      }

      const member = teamMembers.data[0];
      const hasPermission =
        member.role === 'owner' ||
        member.role === 'admin' ||
        member.permissions.includes('manage_reviews');

      if (!hasPermission) {
        throw new ForbiddenException('You do not have permission to hide this review');
      }
    }

    // Note: is_hidden is not in the reviews schema, returning review as-is
    // To implement this feature, add is_hidden column to reviews table
    return review;
  }

  /**
   * Verify user has admin/moderator permission for review moderation
   * Checks user role from database auth
   */
  private async verifyAdminPermission(userId: string): Promise<void> {
    try {
      // Get user from database auth
      const user = await this.db.getUserById(userId);

      if (!user) {
        throw new ForbiddenException('User not found');
      }

      // Check for admin/moderator role (role is stored directly in user.role)
      const userRole = user.role || 'user';
      const allowedRoles = ['admin', 'platform_admin', 'moderator', 'super_admin'];

      if (!allowedRoles.includes(userRole)) {
        throw new ForbiddenException('Only administrators can moderate reviews');
      }
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      // If we can't verify, deny access for security
      throw new ForbiddenException('Unable to verify admin permissions');
    }
  }

  // TODO: Implement review moderation queue
  // TODO: Implement review analytics (most helpful reviewers, etc.)
  // TODO: Implement review reply notifications
  // TODO: Implement review images upload
  // TODO: Implement review voting (helpful/not helpful)
  // TODO: Implement bulk moderation for admins
}
