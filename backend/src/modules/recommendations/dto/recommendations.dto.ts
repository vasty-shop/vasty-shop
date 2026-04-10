import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, Min, Max } from 'class-validator';

// ============================================
// ENUMS
// ============================================

export enum RecommendationType {
  SIMILAR_PRODUCTS = 'similar_products',
  FREQUENTLY_BOUGHT_TOGETHER = 'frequently_bought_together',
  CUSTOMERS_ALSO_BOUGHT = 'customers_also_bought',
  TRENDING = 'trending',
  BESTSELLERS = 'bestsellers',
  NEW_ARRIVALS = 'new_arrivals',
  PERSONALIZED = 'personalized',
  CATEGORY_BASED = 'category_based',
  PRICE_BASED = 'price_based',
  VIEWED_ALSO_VIEWED = 'viewed_also_viewed',
  RECENTLY_VIEWED = 'recently_viewed',
  WISHLIST_BASED = 'wishlist_based',
  CART_BASED = 'cart_based',
  PURCHASE_HISTORY = 'purchase_history',
  COMPLEMENTARY = 'complementary',
  UPSELL = 'upsell',
  CROSS_SELL = 'cross_sell',
  AI_POWERED = 'ai_powered',
}

export enum RecommendationContext {
  HOME_PAGE = 'home_page',
  PRODUCT_PAGE = 'product_page',
  CART_PAGE = 'cart_page',
  CHECKOUT = 'checkout',
  CATEGORY_PAGE = 'category_page',
  SEARCH_RESULTS = 'search_results',
  WISHLIST = 'wishlist',
  ORDER_CONFIRMATION = 'order_confirmation',
  EMAIL = 'email',
  PUSH_NOTIFICATION = 'push_notification',
}

export enum SimilarityMetric {
  CATEGORY = 'category',
  ATTRIBUTES = 'attributes',
  PRICE = 'price',
  BRAND = 'brand',
  TAGS = 'tags',
  BEHAVIOR = 'behavior',
  COMBINED = 'combined',
}

export enum UserSegment {
  NEW_USER = 'new_user',
  RETURNING_USER = 'returning_user',
  HIGH_VALUE = 'high_value',
  AT_RISK = 'at_risk',
  DORMANT = 'dormant',
  FREQUENT_BUYER = 'frequent_buyer',
  BARGAIN_HUNTER = 'bargain_hunter',
  PREMIUM_BUYER = 'premium_buyer',
}

// ============================================
// PRODUCT RECOMMENDATION DTOs
// ============================================

export class GetProductRecommendationsDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsArray()
  productIds?: string[];

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsEnum(RecommendationType)
  type?: RecommendationType;

  @IsOptional()
  @IsEnum(RecommendationContext)
  context?: RecommendationContext;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @IsArray()
  excludeProductIds?: string[];

  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsBoolean()
  inStockOnly?: boolean;

  @IsOptional()
  @IsBoolean()
  includeOutOfStock?: boolean;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsArray()
  attributes?: { key: string; value: string }[];
}

export class GetPersonalizedRecommendationsDto {
  @IsOptional()
  @IsEnum(RecommendationContext)
  context?: RecommendationContext;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsArray()
  excludeProductIds?: string[];

  @IsOptional()
  @IsBoolean()
  includeReasons?: boolean;
}

export class GetSimilarProductsDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsEnum(SimilarityMetric)
  similarityMetric?: SimilarityMetric;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  minSimilarity?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @IsArray()
  excludeProductIds?: string[];
}

export class GetFrequentlyBoughtTogetherDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  minConfidence?: number;
}

export class GetCartRecommendationsDto {
  @IsArray()
  cartItems: { productId: string; quantity: number }[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  limit?: number;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsBoolean()
  includeUpsells?: boolean;

  @IsOptional()
  @IsBoolean()
  includeCrossSells?: boolean;
}

// ============================================
// STORE RECOMMENDATION DTOs
// ============================================

export class GetStoreRecommendationsDto {
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  radiusKm?: number;

  @IsOptional()
  @IsArray()
  categoryIds?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @IsBoolean()
  sortByDistance?: boolean;

  @IsOptional()
  @IsBoolean()
  sortByRating?: boolean;

  @IsOptional()
  @IsNumber()
  minRating?: number;
}

export class GetNearbyStoresDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsNumber()
  radiusKm?: number;

  @IsOptional()
  @IsArray()
  categoryIds?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;
}

// ============================================
// TRENDING & POPULAR DTOs
// ============================================

export class GetTrendingProductsDto {
  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  period?: 'hour' | 'day' | 'week' | 'month';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @IsString()
  zoneId?: string;
}

export class GetBestSellersDto {
  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  period?: 'week' | 'month' | 'quarter' | 'year' | 'all_time';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class GetNewArrivalsDto {
  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsNumber()
  daysOld?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;
}

// ============================================
// USER BEHAVIOR TRACKING DTOs
// ============================================

export class TrackProductViewDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsNumber()
  viewDurationSeconds?: number;

  @IsOptional()
  @IsNumber()
  scrollDepth?: number;
}

export class TrackProductInteractionDto {
  @IsString()
  productId: string;

  @IsString()
  interactionType: string; // click, hover, zoom, share, add_to_cart, wishlist, etc.

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class TrackSearchDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsArray()
  resultProductIds?: string[];

  @IsOptional()
  @IsNumber()
  resultCount?: number;

  @IsOptional()
  @IsString()
  clickedProductId?: string;

  @IsOptional()
  @IsNumber()
  clickPosition?: number;
}

export class TrackPurchaseDto {
  @IsString()
  orderId: string;

  @IsArray()
  products: { productId: string; quantity: number; price: number }[];

  @IsOptional()
  @IsString()
  shopId?: string;
}

// ============================================
// USER PREFERENCES DTOs
// ============================================

export class UpdateUserPreferencesDto {
  @IsOptional()
  @IsArray()
  preferredCategories?: string[];

  @IsOptional()
  @IsArray()
  preferredBrands?: string[];

  @IsOptional()
  @IsNumber()
  minPriceRange?: number;

  @IsOptional()
  @IsNumber()
  maxPriceRange?: number;

  @IsOptional()
  @IsArray()
  preferredAttributes?: { key: string; value: string }[];

  @IsOptional()
  @IsBoolean()
  enablePersonalization?: boolean;

  @IsOptional()
  @IsBoolean()
  showSimilarProductEmails?: boolean;

  @IsOptional()
  @IsBoolean()
  showPriceDropAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  showBackInStockAlerts?: boolean;
}

export class GetUserPreferencesDto {
  @IsOptional()
  @IsBoolean()
  includeInferred?: boolean;
}

// ============================================
// AI CONFIGURATION DTOs
// ============================================

export class RecommendationWeightsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  viewHistory?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  purchaseHistory?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  wishlistItems?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  cartItems?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  categoryAffinity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  brandAffinity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  priceRange?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  popularityScore?: number;
}

export class ConfigureRecommendationEngineDto {
  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsBoolean()
  enableAI?: boolean;

  @IsOptional()
  @IsBoolean()
  enableCollaborativeFiltering?: boolean;

  @IsOptional()
  @IsBoolean()
  enableContentBasedFiltering?: boolean;

  @IsOptional()
  @IsBoolean()
  enableHybridRecommendations?: boolean;

  @IsOptional()
  weights?: RecommendationWeightsDto;

  @IsOptional()
  @IsArray()
  excludedProducts?: string[];

  @IsOptional()
  @IsArray()
  promotedProducts?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  diversityFactor?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  noveltyFactor?: number;

  @IsOptional()
  @IsNumber()
  recencyDecayDays?: number;
}

// ============================================
// ANALYTICS DTOs
// ============================================

export class RecommendationAnalyticsDto {
  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsEnum(RecommendationType)
  type?: RecommendationType;

  @IsOptional()
  @IsEnum(RecommendationContext)
  context?: RecommendationContext;
}

export class GetRecommendationPerformanceDto {
  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsString()
  period?: 'day' | 'week' | 'month';

  @IsOptional()
  @IsArray()
  metrics?: string[];
}

// ============================================
// A/B TESTING DTOs
// ============================================

export class RecommendationTestVariantDto {
  @IsString()
  name: string;

  @IsEnum(RecommendationType)
  type: RecommendationType;

  @IsOptional()
  config?: Record<string, any>;

  @IsNumber()
  @Min(0)
  @Max(100)
  trafficPercent: number;
}

export class CreateRecommendationTestDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  shopId: string;

  @IsEnum(RecommendationContext)
  context: RecommendationContext;

  @IsArray()
  variants: RecommendationTestVariantDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  trafficAllocation?: number;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class GetTestResultsDto {
  @IsString()
  testId: string;

  @IsOptional()
  @IsArray()
  metrics?: string[];
}

// ============================================
// BUNDLE & UPSELL DTOs
// ============================================

export class GetUpsellRecommendationsDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsNumber()
  currentPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  limit?: number;

  @IsOptional()
  @IsNumber()
  maxPriceIncrease?: number; // Percentage or fixed amount
}

export class GetCrossSellRecommendationsDto {
  @IsArray()
  productIds: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  limit?: number;

  @IsOptional()
  @IsBoolean()
  excludeOwned?: boolean;
}

export class GetBundleSuggestionsDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(10)
  bundleSize?: number;

  @IsOptional()
  @IsNumber()
  maxBundlePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  limit?: number;
}

// ============================================
// SEASONAL & CONTEXTUAL DTOs
// ============================================

export class GetSeasonalRecommendationsDto {
  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsString()
  season?: 'spring' | 'summer' | 'fall' | 'winter';

  @IsOptional()
  @IsString()
  event?: string; // christmas, valentines, black_friday, etc.

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class GetContextualRecommendationsDto {
  @IsOptional()
  @IsString()
  weather?: string;

  @IsOptional()
  @IsString()
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';

  @IsOptional()
  @IsString()
  dayOfWeek?: string;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;
}

// ============================================
// FEEDBACK DTOs
// ============================================

export class SubmitRecommendationFeedbackDto {
  @IsString()
  recommendationId: string;

  @IsString()
  productId: string;

  @IsString()
  action: 'clicked' | 'purchased' | 'dismissed' | 'not_interested';

  @IsOptional()
  @IsString()
  reason?: string;
}
