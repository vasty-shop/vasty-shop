/**
 * Product Component Types
 *
 * Extended types specific to product card and grid components
 */

import type { Product } from '@/types';

/**
 * Badge types that can appear on product cards
 */
export type ProductBadgeType = 'NEW' | 'HOT' | 'SALE' | 'FLASH_SALE' | 'DISCOUNT';

/**
 * Product card display variant
 */
export type ProductCardVariant = 'standard' | 'flash-sale' | 'compact';

/**
 * Flash sale configuration for a product
 */
export interface FlashSaleConfig {
  endTime: Date;
  soldCount: number;
  totalStock: number;
}

/**
 * Flash sale configuration for grid of products
 */
export interface FlashSaleGridConfig {
  endTime: Date;
  getSoldCount?: (productId: string) => number;
  getTotalStock?: (productId: string) => number;
}

/**
 * Grid column configuration
 */
export type GridColumns = 2 | 3 | 4 | 5;

/**
 * Product filter/category
 */
export type ProductFilter =
  | 'ALL'
  | 'WOMAN'
  | 'MEN'
  | 'CHILDREN'
  | 'SHORTS'
  | 'JACKETS'
  | 'SHOES'
  | 'T-SHIRT'
  | 'ACCESSORIES'
  | string;

/**
 * Extended product with additional display metadata
 */
export interface ProductWithMetadata extends Product {
  isNew?: boolean;
  isHot?: boolean;
  isFeatured?: boolean;
  soldCount?: number;
  badge?: ProductBadgeType;
}

/**
 * Product card event handlers
 */
export interface ProductCardHandlers {
  onWishlistToggle?: (productId: string) => void;
  onAddToCart?: (product: Product) => void;
  onClick?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onColorSelect?: (productId: string, color: string) => void;
  onSizeSelect?: (productId: string, size: string) => void;
}

/**
 * Product grid event handlers
 */
export interface ProductGridHandlers extends ProductCardHandlers {
  onSeeAllClick?: () => void;
  onFilterChange?: (filter: string) => void;
  onSortChange?: (sortBy: string) => void;
  onLoadMore?: () => void;
}

/**
 * Product grid display options
 */
export interface ProductGridOptions {
  showQuickAdd?: boolean;
  showRating?: boolean;
  showBadges?: boolean;
  showBrand?: boolean;
  showColors?: boolean;
  showSoldCount?: boolean;
  enableLazyLoading?: boolean;
}

/**
 * Product sort options
 */
export type ProductSortOption =
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc'
  | 'newest'
  | 'popular'
  | 'discount';

/**
 * Product grid layout configuration
 */
export interface ProductGridLayout {
  columns: GridColumns;
  gap?: 'sm' | 'md' | 'lg';
  cardSize?: 'sm' | 'md' | 'lg';
}

/**
 * Wishlist item with timestamp
 */
export interface WishlistItem {
  productId: string;
  addedAt: Date;
}

/**
 * Cart action payload
 */
export interface AddToCartPayload {
  product: Product;
  quantity?: number;
  selectedSize?: string;
  selectedColor?: string;
}

/**
 * Product analytics event
 */
export interface ProductAnalyticsEvent {
  eventType: 'view' | 'click' | 'add_to_cart' | 'wishlist_add' | 'wishlist_remove';
  productId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Product card animation configuration
 */
export interface ProductCardAnimation {
  enabled: boolean;
  hoverScale?: number;
  hoverElevation?: number;
  staggerDelay?: number;
}

/**
 * Product image configuration
 */
export interface ProductImageConfig {
  aspectRatio?: '1/1' | '3/4' | '4/5' | '16/9';
  objectFit?: 'cover' | 'contain' | 'fill';
  showPlaceholder?: boolean;
  placeholderBlur?: number;
}

/**
 * Product price display configuration
 */
export interface ProductPriceConfig {
  showOriginalPrice?: boolean;
  showDiscount?: boolean;
  discountFormat?: 'percentage' | 'amount';
  currency?: string;
  currencyPosition?: 'before' | 'after';
}

/**
 * Countdown timer state
 */
export interface CountdownState {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

/**
 * Product grid pagination
 */
export interface ProductGridPagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Product grid state
 */
export interface ProductGridState {
  products: Product[];
  filteredProducts: Product[];
  activeFilter: ProductFilter;
  sortBy: ProductSortOption;
  loading: boolean;
  error?: string;
  pagination?: ProductGridPagination;
}

/**
 * Product availability status
 */
export type ProductAvailability =
  | 'in_stock'
  | 'low_stock'
  | 'out_of_stock'
  | 'pre_order'
  | 'discontinued';

/**
 * Extended product for display with availability
 */
export interface DisplayProduct extends Product {
  availability?: ProductAvailability;
  stockCount?: number;
  estimatedDelivery?: Date;
  isOnSale?: boolean;
  flashSale?: FlashSaleConfig;
}

// Re-export Product type for convenience
export type { Product } from '@/types';
