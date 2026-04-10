import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
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
  RecommendationType,
  RecommendationContext,
  SimilarityMetric,
} from './dto/recommendations.dto';

@Injectable()
export class RecommendationsService {
  constructor(private readonly db: DatabaseService) {}

  // ============================================
  // PRODUCT RECOMMENDATIONS
  // ============================================

  async getProductRecommendations(dto: GetProductRecommendationsDto, userId?: string) {
    const type = dto.type || RecommendationType.SIMILAR_PRODUCTS;
    const limit = dto.limit || 10;

    switch (type) {
      case RecommendationType.SIMILAR_PRODUCTS:
        return this.getSimilarProducts({ productId: dto.productId!, limit });
      case RecommendationType.FREQUENTLY_BOUGHT_TOGETHER:
        return this.getFrequentlyBoughtTogether({ productId: dto.productId!, limit });
      case RecommendationType.TRENDING:
        return this.getTrendingProducts({ shopId: dto.shopId, categoryId: dto.categoryId, limit });
      case RecommendationType.BESTSELLERS:
        return this.getBestSellers({ shopId: dto.shopId, categoryId: dto.categoryId, limit });
      case RecommendationType.NEW_ARRIVALS:
        return this.getNewArrivals({ shopId: dto.shopId, categoryId: dto.categoryId, limit });
      case RecommendationType.PERSONALIZED:
        return this.getPersonalizedRecommendations({ context: dto.context, limit, shopId: dto.shopId }, userId!);
      case RecommendationType.CATEGORY_BASED:
        return this.getCategoryBasedRecommendations(dto.categoryId!, limit, dto.excludeProductIds);
      default:
        return this.getSimilarProducts({ productId: dto.productId!, limit });
    }
  }

  async getPersonalizedRecommendations(dto: GetPersonalizedRecommendationsDto, userId: string) {
    const limit = dto.limit || 10;

    // Get user's activity history
    const viewHistory = await this.getUserViewHistory(userId, 50);
    const purchaseHistory = await this.getUserPurchaseHistory(userId, 50);
    const wishlistItems = await this.getUserWishlistItems(userId);
    const preferences = await this.getUserPreferences(userId);

    // Build user profile
    const userProfile = await this.buildUserProfile(userId, viewHistory, purchaseHistory, wishlistItems, preferences);

    // Get product scores
    const productScores = await this.calculateProductScores(userProfile, dto.shopId);

    // Filter and sort
    const recommendations = productScores
      .filter((p: any) => !dto.excludeProductIds?.includes(p.id))
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, limit);

    // Get full product details
    const productIds = recommendations.map((r: any) => r.id);
    const products = await this.getProductsByIds(productIds);

    return products.map((p: any) => {
      const rec = recommendations.find((r: any) => r.id === p.id);
      return {
        ...this.formatProduct(p),
        recommendationScore: rec?.score,
        recommendationReason: dto.includeReasons ? rec?.reason : undefined,
      };
    });
  }

  async getSimilarProducts(dto: GetSimilarProductsDto) {
    const limit = dto.limit || 10;
    const metric = dto.similarityMetric || SimilarityMetric.COMBINED;

    // Get source product
    const products = await this.db.query_builder()
      .from('products')
      .select('*')
      .where('id', dto.productId)
      .get();

    if (products.length === 0) {
      throw new NotFoundException('Product not found');
    }

    const sourceProduct = products[0];

    // Find similar products based on metric
    let similarProducts: any[] = [];

    switch (metric) {
      case SimilarityMetric.CATEGORY:
        similarProducts = await this.findSimilarByCategory(sourceProduct, limit, dto.excludeProductIds);
        break;
      case SimilarityMetric.PRICE:
        similarProducts = await this.findSimilarByPrice(sourceProduct, limit, dto.excludeProductIds);
        break;
      case SimilarityMetric.BRAND:
        similarProducts = await this.findSimilarByBrand(sourceProduct, limit, dto.excludeProductIds);
        break;
      case SimilarityMetric.ATTRIBUTES:
        similarProducts = await this.findSimilarByAttributes(sourceProduct, limit, dto.excludeProductIds);
        break;
      case SimilarityMetric.COMBINED:
      default:
        similarProducts = await this.findSimilarCombined(sourceProduct, limit, dto.excludeProductIds);
    }

    return similarProducts.map(this.formatProduct);
  }

  async getFrequentlyBoughtTogether(dto: GetFrequentlyBoughtTogetherDto): Promise<any[]> {
    const limit = dto.limit || 5;

    // First get order IDs that contain this product
    const orderIdsResult = await this.db.query_builder()
      .from('order_items')
      .select('order_id')
      .where('product_id', dto.productId)
      .get();

    const orderIds = orderIdsResult.map((o: any) => o.order_id);

    if (orderIds.length === 0) {
      return [];
    }

    // Get co-purchase data from those orders
    const coPurchases = await this.db.query_builder()
      .from('order_items')
      .select('product_id')
      .whereIn('order_id', orderIds)
      .where('product_id', '!=', dto.productId)
      .get();

    // Count frequency
    const frequencyMap: Record<string, number> = {};
    coPurchases.forEach((item: any) => {
      frequencyMap[item.product_id] = (frequencyMap[item.product_id] || 0) + 1;
    });

    // Sort by frequency
    const topProductIds = Object.entries(frequencyMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id]) => id);

    if (topProductIds.length === 0) {
      // Fallback to similar products
      const similar = await this.getSimilarProducts({ productId: dto.productId, limit });
      return Array.isArray(similar) ? similar : [];
    }

    const products = await this.getProductsByIds(topProductIds);

    return products.map((p: any) => ({
      ...this.formatProduct(p),
      coOccurrenceCount: frequencyMap[p.id],
      confidence: frequencyMap[p.id] / coPurchases.length,
    }));
  }

  async getCartRecommendations(dto: GetCartRecommendationsDto, userId?: string) {
    const limit = dto.limit || 5;
    const cartProductIds = dto.cartItems.map(item => item.productId);

    // Get frequently bought together for all cart items
    const allRecommendations: any[] = [];

    for (const item of dto.cartItems) {
      const fbt = await this.getFrequentlyBoughtTogether({
        productId: item.productId,
        limit: 3,
      });
      allRecommendations.push(...fbt);
    }

    // Deduplicate and filter out cart items
    const uniqueRecommendations = allRecommendations
      .filter((p, index, self) =>
        index === self.findIndex((t) => t.id === p.id) &&
        !cartProductIds.includes(p.id)
      )
      .slice(0, limit);

    // Add upsells if requested
    if (dto.includeUpsells) {
      const upsells = await this.getUpsellRecommendations({
        productId: cartProductIds[0],
        limit: 3,
      });
      uniqueRecommendations.push(...upsells.filter((u: any) => !cartProductIds.includes(u.id)));
    }

    // Add cross-sells if requested
    if (dto.includeCrossSells) {
      const crossSells = await this.getCrossSellRecommendations({
        productIds: cartProductIds,
        limit: 3,
      }, userId);
      uniqueRecommendations.push(...crossSells.filter((c: any) => !cartProductIds.includes(c.id)));
    }

    return uniqueRecommendations.slice(0, limit);
  }

  async getCategoryBasedRecommendations(categoryId: string, limit: number = 10, excludeIds?: string[]) {
    let query = this.db.query_builder()
      .from('products')
      .select('*')
      .where('category_id', categoryId)
      .where('status', 'active')
      .where('stock', '>', 0);

    if (excludeIds && excludeIds.length > 0) {
      query = query.whereNotIn('id', excludeIds);
    }

    const products = await query
      .orderBy('rating', 'DESC')
      .limit(limit)
      .get();

    return products.map(this.formatProduct);
  }

  // ============================================
  // STORE RECOMMENDATIONS
  // ============================================

  async getStoreRecommendations(dto: GetStoreRecommendationsDto, userId?: string) {
    let query = this.db.query_builder()
      .from('shops')
      .select('*')
      .where('status', 'active');

    if (dto.minRating) {
      query = query.where('rating', '>=', dto.minRating);
    }

    const shops = await query.get();

    // If location provided, calculate distances
    let result = shops;
    if (dto.latitude && dto.longitude) {
      result = shops.map((shop: any) => {
        const distance = this.calculateDistance(
          dto.latitude!,
          dto.longitude!,
          parseFloat(shop.latitude),
          parseFloat(shop.longitude)
        );
        return { ...shop, distance };
      });

      if (dto.radiusKm) {
        result = result.filter((shop: any) => shop.distance <= dto.radiusKm!);
      }

      if (dto.sortByDistance) {
        result.sort((a: any, b: any) => a.distance - b.distance);
      }
    }

    if (dto.sortByRating) {
      result.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
    }

    // Filter by categories if provided
    if (dto.categoryIds && dto.categoryIds.length > 0) {
      // Would need to join with shop_categories table
    }

    return result.slice(0, dto.limit || 20).map(this.formatStore);
  }

  async getNearbyStores(dto: GetNearbyStoresDto) {
    return this.getStoreRecommendations({
      latitude: dto.latitude,
      longitude: dto.longitude,
      radiusKm: dto.radiusKm || 10,
      categoryIds: dto.categoryIds,
      limit: dto.limit,
      sortByDistance: true,
    });
  }

  // ============================================
  // TRENDING & POPULAR
  // ============================================

  async getTrendingProducts(dto: GetTrendingProductsDto) {
    const limit = dto.limit || 10;
    const period = dto.period || 'day';

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case 'hour':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get view counts
    const viewCounts = await this.db.query_builder()
      .from('product_views')
      .select('product_id')
      .where('created_at', '>=', startDate.toISOString())
      .get();

    // Count views per product
    const viewCountMap: Record<string, number> = {};
    viewCounts.forEach((v: any) => {
      viewCountMap[v.product_id] = (viewCountMap[v.product_id] || 0) + 1;
    });

    // Sort by view count
    const topProductIds = Object.entries(viewCountMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id]) => id);

    if (topProductIds.length === 0) {
      // Map trending periods to bestseller periods
      const periodMap: Record<string, 'week' | 'month'> = {
        hour: 'week',
        day: 'week',
        week: 'week',
        month: 'month',
      };
      return this.getBestSellers({
        shopId: dto.shopId,
        categoryId: dto.categoryId,
        limit: dto.limit,
        period: periodMap[dto.period || 'day'] || 'week',
      });
    }

    let query = this.db.query_builder()
      .from('products')
      .select('*')
      .whereIn('id', topProductIds)
      .where('status', 'active');

    if (dto.shopId) {
      query = query.where('shop_id', dto.shopId);
    }
    if (dto.categoryId) {
      query = query.where('category_id', dto.categoryId);
    }

    const products = await query.get();

    // Sort by view count
    const sorted = products.sort((a: any, b: any) =>
      (viewCountMap[b.id] || 0) - (viewCountMap[a.id] || 0)
    );

    return sorted.map((p: any) => ({
      ...this.formatProduct(p),
      trendingScore: viewCountMap[p.id],
    }));
  }

  async getBestSellers(dto: GetBestSellersDto) {
    const limit = dto.limit || 10;

    // Get sales counts
    let query = this.db.query_builder()
      .from('order_items')
      .select('product_id');

    // Join with orders to filter by date
    const period = dto.period || 'month';
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    const sales = await query.get();

    // Count sales per product
    const salesMap: Record<string, number> = {};
    sales.forEach((s: any) => {
      salesMap[s.product_id] = (salesMap[s.product_id] || 0) + 1;
    });

    const topProductIds = Object.entries(salesMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id]) => id);

    if (topProductIds.length === 0) {
      // Fallback to highly rated products
      let fallbackQuery = this.db.query_builder()
        .from('products')
        .select('*')
        .where('status', 'active')
        .orderBy('rating', 'DESC')
        .limit(limit);

      if (dto.shopId) fallbackQuery = fallbackQuery.where('shop_id', dto.shopId);
      if (dto.categoryId) fallbackQuery = fallbackQuery.where('category_id', dto.categoryId);

      const fallback = await fallbackQuery.get();
      return fallback.map(this.formatProduct);
    }

    const products = await this.getProductsByIds(topProductIds);

    return products.sort((a: any, b: any) =>
      (salesMap[b.id] || 0) - (salesMap[a.id] || 0)
    ).map((p: any) => ({
      ...this.formatProduct(p),
      salesCount: salesMap[p.id],
    }));
  }

  async getNewArrivals(dto: GetNewArrivalsDto) {
    const limit = dto.limit || 10;
    const daysOld = dto.daysOld || 30;
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    let query = this.db.query_builder()
      .from('products')
      .select('*')
      .where('status', 'active')
      .where('created_at', '>=', cutoffDate.toISOString());

    if (dto.shopId) {
      query = query.where('shop_id', dto.shopId);
    }
    if (dto.categoryId) {
      query = query.where('category_id', dto.categoryId);
    }

    const products = await query
      .orderBy('created_at', 'DESC')
      .limit(limit)
      .get();

    return products.map(this.formatProduct);
  }

  // ============================================
  // UPSELL & CROSS-SELL
  // ============================================

  async getUpsellRecommendations(dto: GetUpsellRecommendationsDto) {
    const limit = dto.limit || 5;

    // Get source product
    const sourceProducts = await this.db.query_builder()
      .from('products')
      .select('*')
      .where('id', dto.productId)
      .get();

    if (sourceProducts.length === 0) {
      throw new NotFoundException('Product not found');
    }

    const sourceProduct = sourceProducts[0];
    const sourcePrice = parseFloat(sourceProduct.price);

    // Find higher-priced products in same category
    let query = this.db.query_builder()
      .from('products')
      .select('*')
      .where('category_id', sourceProduct.category_id)
      .where('status', 'active')
      .where('id', '!=', dto.productId)
      .where('price', '>', sourcePrice);

    if (dto.maxPriceIncrease) {
      const maxPrice = sourcePrice * (1 + dto.maxPriceIncrease / 100);
      query = query.where('price', '<=', maxPrice);
    }

    const products = await query
      .orderBy('rating', 'DESC')
      .limit(limit)
      .get();

    return products.map((p: any) => ({
      ...this.formatProduct(p),
      priceIncrease: parseFloat(p.price) - sourcePrice,
      priceIncreasePercent: ((parseFloat(p.price) - sourcePrice) / sourcePrice * 100).toFixed(2),
    }));
  }

  async getCrossSellRecommendations(dto: GetCrossSellRecommendationsDto, userId?: string) {
    const limit = dto.limit || 5;

    // Get categories of input products
    const products = await this.db.query_builder()
      .from('products')
      .select('category_id')
      .whereIn('id', dto.productIds)
      .get();

    const categoryIds = [...new Set(products.map((p: any) => p.category_id))];

    // Find complementary categories (would need a category_complements table)
    // For now, find products from different categories that are frequently bought together
    let query = this.db.query_builder()
      .from('products')
      .select('*')
      .where('status', 'active')
      .whereNotIn('id', dto.productIds)
      .whereNotIn('category_id', categoryIds);

    const complementary = await query
      .orderBy('rating', 'DESC')
      .limit(limit)
      .get();

    // If user provided, filter out already owned
    if (userId && dto.excludeOwned) {
      const ownedIds = await this.getUserPurchasedProductIds(userId);
      return complementary
        .filter((p: any) => !ownedIds.includes(p.id))
        .map(this.formatProduct);
    }

    return complementary.map(this.formatProduct);
  }

  async getBundleSuggestions(dto: GetBundleSuggestionsDto) {
    const bundleSize = dto.bundleSize || 3;
    const limit = dto.limit || 5;

    // Get frequently bought together
    const fbt = await this.getFrequentlyBoughtTogether({
      productId: dto.productId,
      limit: bundleSize * 3, // Get more to filter
    });

    // Get source product
    const sourceProducts = await this.db.query_builder()
      .from('products')
      .select('*')
      .where('id', dto.productId)
      .get();

    const sourceProduct = sourceProducts[0];

    // Generate bundle combinations
    const bundles: any[] = [];
    for (let i = 0; i < Math.min(limit, fbt.length - bundleSize + 1); i++) {
      const bundleProducts = [sourceProduct, ...fbt.slice(i, i + bundleSize - 1)];
      const totalPrice = bundleProducts.reduce((sum, p) => sum + parseFloat(p.price), 0);

      if (dto.maxBundlePrice && totalPrice > dto.maxBundlePrice) continue;

      bundles.push({
        products: bundleProducts.map(this.formatProduct),
        totalPrice,
        suggestedDiscount: 10, // Default 10% bundle discount
        bundlePrice: totalPrice * 0.9,
      });
    }

    return bundles;
  }

  // ============================================
  // BEHAVIOR TRACKING
  // ============================================

  async trackProductView(dto: TrackProductViewDto, userId?: string) {
    await this.db.query_builder()
      .from('product_views')
      .insert({
        product_id: dto.productId,
        user_id: userId,
        session_id: dto.sessionId,
        source: dto.source,
        view_duration_seconds: dto.viewDurationSeconds,
        scroll_depth: dto.scrollDepth,
        created_at: new Date().toISOString(),
      })
      .execute();

    return { success: true };
  }

  async trackProductInteraction(dto: TrackProductInteractionDto, userId?: string) {
    await this.db.query_builder()
      .from('product_interactions')
      .insert({
        product_id: dto.productId,
        user_id: userId,
        session_id: dto.sessionId,
        interaction_type: dto.interactionType,
        metadata: JSON.stringify(dto.metadata || {}),
        created_at: new Date().toISOString(),
      })
      .execute();

    return { success: true };
  }

  async trackSearch(dto: TrackSearchDto, userId?: string) {
    await this.db.query_builder()
      .from('search_logs')
      .insert({
        user_id: userId,
        query: dto.query,
        result_product_ids: JSON.stringify(dto.resultProductIds || []),
        result_count: dto.resultCount,
        clicked_product_id: dto.clickedProductId,
        click_position: dto.clickPosition,
        created_at: new Date().toISOString(),
      })
      .execute();

    return { success: true };
  }

  async trackPurchase(dto: TrackPurchaseDto, userId: string) {
    await this.db.query_builder()
      .from('purchase_events')
      .insert({
        user_id: userId,
        order_id: dto.orderId,
        shop_id: dto.shopId,
        products: JSON.stringify(dto.products),
        created_at: new Date().toISOString(),
      })
      .execute();

    return { success: true };
  }

  // ============================================
  // USER PREFERENCES
  // ============================================

  async updateUserPreferences(dto: UpdateUserPreferencesDto, userId: string) {
    const existing = await this.db.query_builder()
      .from('user_preferences')
      .select('id')
      .where('user_id', userId)
      .get();

    const data = {
      preferred_categories: JSON.stringify(dto.preferredCategories || []),
      preferred_brands: JSON.stringify(dto.preferredBrands || []),
      min_price_range: dto.minPriceRange,
      max_price_range: dto.maxPriceRange,
      preferred_attributes: JSON.stringify(dto.preferredAttributes || []),
      enable_personalization: dto.enablePersonalization !== false,
      show_similar_product_emails: dto.showSimilarProductEmails,
      show_price_drop_alerts: dto.showPriceDropAlerts,
      show_back_in_stock_alerts: dto.showBackInStockAlerts,
      updated_at: new Date().toISOString(),
    };

    if (existing.length > 0) {
      await this.db.query_builder()
        .from('user_preferences')
        .where('id', existing[0].id)
        .update(data)
        .execute();
    } else {
      await this.db.query_builder()
        .from('user_preferences')
        .insert({ ...data, user_id: userId, created_at: new Date().toISOString() })
        .execute();
    }

    return this.getUserPreferences(userId);
  }

  async getUserPreferences(userId: string) {
    const prefs = await this.db.query_builder()
      .from('user_preferences')
      .select('*')
      .where('user_id', userId)
      .get();

    if (prefs.length === 0) {
      return {
        preferredCategories: [],
        preferredBrands: [],
        enablePersonalization: true,
      };
    }

    const pref = prefs[0];
    return {
      preferredCategories: JSON.parse(pref.preferred_categories || '[]'),
      preferredBrands: JSON.parse(pref.preferred_brands || '[]'),
      minPriceRange: pref.min_price_range,
      maxPriceRange: pref.max_price_range,
      preferredAttributes: JSON.parse(pref.preferred_attributes || '[]'),
      enablePersonalization: pref.enable_personalization,
      showSimilarProductEmails: pref.show_similar_product_emails,
      showPriceDropAlerts: pref.show_price_drop_alerts,
      showBackInStockAlerts: pref.show_back_in_stock_alerts,
    };
  }

  // ============================================
  // ANALYTICS
  // ============================================

  async getRecommendationAnalytics(dto: RecommendationAnalyticsDto) {
    // Get recommendation impressions
    const impressions = await this.db.query_builder()
      .from('recommendation_impressions')
      .select('*')
      .where('created_at', '>=', dto.startDate || '2024-01-01')
      .get();

    // Get clicks
    const clicks = await this.db.query_builder()
      .from('recommendation_clicks')
      .select('*')
      .where('created_at', '>=', dto.startDate || '2024-01-01')
      .get();

    // Get conversions
    const conversions = await this.db.query_builder()
      .from('recommendation_conversions')
      .select('*')
      .where('created_at', '>=', dto.startDate || '2024-01-01')
      .get();

    const totalImpressions = impressions.length;
    const totalClicks = clicks.length;
    const totalConversions = conversions.length;

    return {
      impressions: totalImpressions,
      clicks: totalClicks,
      conversions: totalConversions,
      ctr: totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0,
      conversionRate: totalClicks > 0 ? (totalConversions / totalClicks * 100).toFixed(2) : 0,
      byType: this.groupByType(impressions, clicks, conversions),
      byContext: this.groupByContext(impressions, clicks, conversions),
    };
  }

  async getRecommendationPerformance(dto: GetRecommendationPerformanceDto) {
    return this.getRecommendationAnalytics({
      shopId: dto.shopId,
      startDate: this.getPeriodStartDate(dto.period || 'week'),
    });
  }

  // ============================================
  // A/B TESTING
  // ============================================

  async createRecommendationTest(dto: CreateRecommendationTestDto, userId: string) {
    const test = await this.db.query_builder()
      .from('recommendation_tests')
      .insert({
        name: dto.name,
        description: dto.description,
        shop_id: dto.shopId,
        context: dto.context,
        variants: JSON.stringify(dto.variants),
        traffic_allocation: dto.trafficAllocation || 100,
        start_date: dto.startDate,
        end_date: dto.endDate,
        status: 'draft',
        created_by: userId,
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return test[0];
  }

  async getTestResults(dto: GetTestResultsDto) {
    const test = await this.db.query_builder()
      .from('recommendation_tests')
      .select('*')
      .where('id', dto.testId)
      .get();

    if (test.length === 0) {
      throw new NotFoundException('Test not found');
    }

    const variants = JSON.parse(test[0].variants);

    // Get metrics for each variant
    const variantResults = await Promise.all(
      variants.map(async (variant: any) => {
        const impressions = await this.db.query_builder()
          .from('recommendation_impressions')
          .select('id')
          .where('test_id', dto.testId)
          .where('variant_name', variant.name)
          .get();

        const clicks = await this.db.query_builder()
          .from('recommendation_clicks')
          .select('id')
          .where('test_id', dto.testId)
          .where('variant_name', variant.name)
          .get();

        return {
          variant: variant.name,
          impressions: impressions.length,
          clicks: clicks.length,
          ctr: impressions.length > 0 ? (clicks.length / impressions.length * 100).toFixed(2) : 0,
        };
      })
    );

    return {
      testId: dto.testId,
      name: test[0].name,
      status: test[0].status,
      variants: variantResults,
      winner: this.determineWinner(variantResults),
    };
  }

  // ============================================
  // FEEDBACK
  // ============================================

  async submitFeedback(dto: SubmitRecommendationFeedbackDto, userId: string) {
    await this.db.query_builder()
      .from('recommendation_feedback')
      .insert({
        recommendation_id: dto.recommendationId,
        product_id: dto.productId,
        user_id: userId,
        action: dto.action,
        reason: dto.reason,
        created_at: new Date().toISOString(),
      })
      .execute();

    return { success: true };
  }

  // ============================================
  // CONFIGURATION
  // ============================================

  async configureEngine(dto: ConfigureRecommendationEngineDto, userId: string) {
    const existing = await this.db.query_builder()
      .from('recommendation_config')
      .select('id')
      .where('shop_id', dto.shopId || 'global')
      .get();

    const data = {
      shop_id: dto.shopId || 'global',
      enable_ai: dto.enableAI,
      enable_collaborative_filtering: dto.enableCollaborativeFiltering,
      enable_content_based_filtering: dto.enableContentBasedFiltering,
      enable_hybrid: dto.enableHybridRecommendations,
      weights: JSON.stringify(dto.weights || {}),
      excluded_products: JSON.stringify(dto.excludedProducts || []),
      promoted_products: JSON.stringify(dto.promotedProducts || []),
      diversity_factor: dto.diversityFactor,
      novelty_factor: dto.noveltyFactor,
      recency_decay_days: dto.recencyDecayDays,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    };

    if (existing.length > 0) {
      await this.db.query_builder()
        .from('recommendation_config')
        .where('id', existing[0].id)
        .update(data)
        .execute();
    } else {
      await this.db.query_builder()
        .from('recommendation_config')
        .insert({ ...data, created_at: new Date().toISOString() })
        .execute();
    }

    return { success: true };
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private async getUserViewHistory(userId: string, limit: number) {
    return this.db.query_builder()
      .from('product_views')
      .select('product_id', 'created_at')
      .where('user_id', userId)
      .orderBy('created_at', 'DESC')
      .limit(limit)
      .get();
  }

  private async getUserPurchaseHistory(userId: string, limit: number) {
    // First get user's order IDs
    const ordersResult = await this.db.query_builder()
      .from('orders')
      .select('id')
      .where('user_id', userId)
      .get();

    const orderIds = ordersResult.map((o: any) => o.id);

    if (orderIds.length === 0) {
      return [];
    }

    return this.db.query_builder()
      .from('order_items')
      .select('product_id')
      .whereIn('order_id', orderIds)
      .limit(limit)
      .get();
  }

  private async getUserWishlistItems(userId: string) {
    return this.db.query_builder()
      .from('wishlist_items')
      .select('product_id')
      .where('user_id', userId)
      .get();
  }

  private async getUserPurchasedProductIds(userId: string): Promise<string[]> {
    const purchases = await this.getUserPurchaseHistory(userId, 1000);
    return purchases.map((p: any) => p.product_id);
  }

  private async buildUserProfile(userId: string, viewHistory: any[], purchaseHistory: any[], wishlistItems: any[], preferences: any) {
    // Extract category affinities
    const viewedProductIds = viewHistory.map(v => v.product_id);
    const purchasedProductIds = purchaseHistory.map(p => p.product_id);
    const wishlistProductIds = wishlistItems.map(w => w.product_id);

    const allProductIds = [...new Set([...viewedProductIds, ...purchasedProductIds, ...wishlistProductIds])];

    if (allProductIds.length === 0) {
      return { categoryAffinities: {}, brandAffinities: {}, priceRange: {} };
    }

    const products = await this.getProductsByIds(allProductIds);

    // Calculate affinities
    const categoryAffinities: Record<string, number> = {};
    const brandAffinities: Record<string, number> = {};
    const prices: number[] = [];

    products.forEach((p: any) => {
      const weight = purchasedProductIds.includes(p.id) ? 3 :
                     wishlistProductIds.includes(p.id) ? 2 : 1;

      categoryAffinities[p.category_id] = (categoryAffinities[p.category_id] || 0) + weight;
      if (p.brand) {
        brandAffinities[p.brand] = (brandAffinities[p.brand] || 0) + weight;
      }
      prices.push(parseFloat(p.price));
    });

    return {
      categoryAffinities,
      brandAffinities,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
        avg: prices.reduce((a, b) => a + b, 0) / prices.length,
      },
      preferences,
    };
  }

  private async calculateProductScores(userProfile: any, shopId?: string): Promise<{ id: string; score: number; reason: string }[]> {
    let query = this.db.query_builder()
      .from('products')
      .select('*')
      .where('status', 'active')
      .limit(200);

    if (shopId) {
      query = query.where('shop_id', shopId);
    }

    const products = await query.get();

    return products.map((p: any) => {
      let score = 0;
      let reason = '';

      // Category affinity
      if (userProfile.categoryAffinities[p.category_id]) {
        score += userProfile.categoryAffinities[p.category_id] * 10;
        reason = 'Based on your browsing history';
      }

      // Brand affinity
      if (p.brand && userProfile.brandAffinities[p.brand]) {
        score += userProfile.brandAffinities[p.brand] * 5;
        reason = `You like ${p.brand}`;
      }

      // Price range fit
      if (userProfile.priceRange.min && userProfile.priceRange.max) {
        const price = parseFloat(p.price);
        if (price >= userProfile.priceRange.min && price <= userProfile.priceRange.max) {
          score += 5;
        }
      }

      // Rating boost
      if (p.rating) {
        score += parseFloat(p.rating) * 2;
      }

      return { id: p.id, score, reason };
    });
  }

  private async findSimilarByCategory(sourceProduct: any, limit: number, excludeIds?: string[]) {
    let query = this.db.query_builder()
      .from('products')
      .select('*')
      .where('category_id', sourceProduct.category_id)
      .where('status', 'active')
      .where('id', '!=', sourceProduct.id);

    if (excludeIds && excludeIds.length > 0) {
      query = query.whereNotIn('id', excludeIds);
    }

    return query.orderBy('rating', 'DESC').limit(limit).get();
  }

  private async findSimilarByPrice(sourceProduct: any, limit: number, excludeIds?: string[]) {
    const price = parseFloat(sourceProduct.price);
    const minPrice = price * 0.7;
    const maxPrice = price * 1.3;

    let query = this.db.query_builder()
      .from('products')
      .select('*')
      .where('price', '>=', minPrice)
      .where('price', '<=', maxPrice)
      .where('status', 'active')
      .where('id', '!=', sourceProduct.id);

    if (excludeIds && excludeIds.length > 0) {
      query = query.whereNotIn('id', excludeIds);
    }

    return query.orderBy('rating', 'DESC').limit(limit).get();
  }

  private async findSimilarByBrand(sourceProduct: any, limit: number, excludeIds?: string[]) {
    if (!sourceProduct.brand) {
      return this.findSimilarByCategory(sourceProduct, limit, excludeIds);
    }

    let query = this.db.query_builder()
      .from('products')
      .select('*')
      .where('brand', sourceProduct.brand)
      .where('status', 'active')
      .where('id', '!=', sourceProduct.id);

    if (excludeIds && excludeIds.length > 0) {
      query = query.whereNotIn('id', excludeIds);
    }

    return query.orderBy('rating', 'DESC').limit(limit).get();
  }

  private async findSimilarByAttributes(sourceProduct: any, limit: number, excludeIds?: string[]) {
    // Would need to compare product attributes
    return this.findSimilarByCategory(sourceProduct, limit, excludeIds);
  }

  private async findSimilarCombined(sourceProduct: any, limit: number, excludeIds?: string[]) {
    // Combine multiple similarity metrics
    const [byCategory, byPrice, byBrand] = await Promise.all([
      this.findSimilarByCategory(sourceProduct, limit * 2, excludeIds),
      this.findSimilarByPrice(sourceProduct, limit * 2, excludeIds),
      this.findSimilarByBrand(sourceProduct, limit * 2, excludeIds),
    ]);

    // Score and combine
    const scoreMap: Record<string, number> = {};
    const productMap: Record<string, any> = {};

    [...byCategory, ...byPrice, ...byBrand].forEach(p => {
      scoreMap[p.id] = (scoreMap[p.id] || 0) + 1;
      productMap[p.id] = p;
    });

    return Object.entries(scoreMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id]) => productMap[id]);
  }

  private async getProductsByIds(ids: string[]): Promise<any[]> {
    if (ids.length === 0) return [];

    return this.db.query_builder()
      .from('products')
      .select('*')
      .whereIn('id', ids)
      .get();
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private getPeriodStartDate(period: string): string {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  private groupByType(impressions: any[], clicks: any[], conversions: any[]) {
    // Group metrics by recommendation type
    return {};
  }

  private groupByContext(impressions: any[], clicks: any[], conversions: any[]) {
    // Group metrics by context
    return {};
  }

  private determineWinner(variantResults: any[]) {
    if (variantResults.length === 0) return null;
    return variantResults.reduce((best, current) =>
      parseFloat(current.ctr) > parseFloat(best.ctr) ? current : best
    );
  }

  private formatProduct(product: any): any {
    if (!product) return null;
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      originalPrice: product.original_price,
      image: product.image,
      images: JSON.parse(product.images || '[]'),
      rating: product.rating,
      reviewCount: product.review_count,
      stock: product.stock,
      categoryId: product.category_id,
      shopId: product.shop_id,
      brand: product.brand,
    };
  }

  private formatStore(store: any): any {
    if (!store) return null;
    return {
      id: store.id,
      name: store.name,
      slug: store.slug,
      logo: store.logo,
      coverImage: store.cover_image,
      rating: store.rating,
      reviewCount: store.review_count,
      latitude: store.latitude,
      longitude: store.longitude,
      address: store.address,
      distance: store.distance,
    };
  }
}
