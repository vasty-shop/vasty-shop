/**
 * FeaturedProductsCarousel Component Types
 *
 * Type definitions for the FeaturedProductsCarousel component
 */

import type { Product } from '@/types';

/**
 * Featured product structure
 * Simplified product data for carousel display
 */
export interface FeaturedProduct {
  /** Unique product identifier */
  id: string;

  /** Product name */
  name: string;

  /** Product category or subcategory */
  category: string;

  /** Product price in USD */
  price: number;

  /** Product image URL or path */
  image: string;

  /** Optional sale price */
  salePrice?: number;

  /** Optional discount percentage */
  discountPercent?: number;
}

/**
 * Props for the FeaturedProductsCarousel component
 */
export interface FeaturedProductsCarouselProps {
  /**
   * Set of product IDs that are currently in the wishlist
   * @default new Set()
   */
  wishlistedProducts?: Set<string>;

  /**
   * Callback when wishlist button is toggled
   * @param productId - ID of the product being toggled
   */
  onWishlistToggle?: (productId: string) => void;

  /**
   * Callback when add to cart button is clicked
   * @param product - Product being added to cart
   */
  onAddToCart?: (product: Product) => void;

  /**
   * Callback when quick view (eye icon) is clicked
   * @param product - Product to quick view
   */
  onQuickView?: (product: Product) => void;

  /**
   * Callback when "See All" link is clicked
   */
  onSeeAll?: () => void;

  /**
   * Optional array of featured products to display
   * If not provided, uses default products
   */
  products?: FeaturedProduct[];

  /**
   * Additional CSS classes for the container
   */
  className?: string;

  /**
   * Whether to show navigation arrows
   * @default true
   */
  showNavigation?: boolean;

  /**
   * Whether to show wishlist button
   * @default true
   */
  showWishlist?: boolean;

  /**
   * Whether to show quick view button
   * @default true
   */
  showQuickView?: boolean;

  /**
   * Whether to show add to cart button on hover
   * @default true
   */
  showAddToCart?: boolean;

  /**
   * Scroll amount in pixels when arrow is clicked
   * @default 300
   */
  scrollAmount?: number;
}

/**
 * Carousel navigation direction
 */
export type CarouselDirection = 'left' | 'right';

/**
 * Carousel scroll state
 */
export interface CarouselScrollState {
  /** Can scroll to the left */
  canScrollLeft: boolean;

  /** Can scroll to the right */
  canScrollRight: boolean;

  /** Current scroll position */
  scrollLeft: number;

  /** Total scrollable width */
  scrollWidth: number;

  /** Visible width */
  clientWidth: number;
}

/**
 * Product card hover state
 */
export interface ProductCardState {
  /** ID of currently hovered product */
  hoveredProductId: string | null;

  /** Whether product is wishlisted */
  isWishlisted: boolean;

  /** Whether product image is loaded */
  imageLoaded: boolean;
}

/**
 * Analytics event for carousel interactions
 */
export interface CarouselAnalyticsEvent {
  /** Event type */
  eventType:
    | 'product_click'
    | 'add_to_cart'
    | 'wishlist_add'
    | 'wishlist_remove'
    | 'quick_view'
    | 'see_all'
    | 'scroll_left'
    | 'scroll_right';

  /** Product ID (if applicable) */
  productId?: string;

  /** Timestamp of the event */
  timestamp: Date;

  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Carousel configuration options
 */
export interface CarouselConfig {
  /** Auto-scroll interval in milliseconds (0 = disabled) */
  autoScrollInterval?: number;

  /** Pause auto-scroll on hover */
  pauseOnHover?: boolean;

  /** Enable infinite scroll */
  infiniteScroll?: boolean;

  /** Show scroll indicators */
  showScrollIndicators?: boolean;

  /** Enable touch/swipe gestures */
  enableSwipe?: boolean;

  /** Scroll snap behavior */
  snapToCards?: boolean;
}

/**
 * Product card action handlers
 */
export interface ProductCardActions {
  /** Handle wishlist toggle */
  onWishlistClick: (e: React.MouseEvent, productId: string) => void;

  /** Handle add to cart */
  onAddToCartClick: (e: React.MouseEvent, product: FeaturedProduct) => void;

  /** Handle quick view */
  onQuickViewClick: (e: React.MouseEvent, product: FeaturedProduct) => void;

  /** Handle product click */
  onProductClick?: (product: FeaturedProduct) => void;
}

/**
 * Carousel animation configuration
 */
export interface CarouselAnimation {
  /** Enable entrance animations */
  enableEntrance?: boolean;

  /** Stagger delay between card animations (ms) */
  staggerDelay?: number;

  /** Card hover animation scale */
  hoverScale?: number;

  /** Animation duration (s) */
  duration?: number;

  /** Animation easing */
  easing?: string;
}

/**
 * Featured products data source
 */
export interface FeaturedProductsDataSource {
  /** Fetch featured products */
  fetchProducts: () => Promise<FeaturedProduct[]>;

  /** Check if product is wishlisted */
  isWishlisted: (productId: string) => boolean;

  /** Add product to wishlist */
  addToWishlist: (productId: string) => Promise<void>;

  /** Remove product from wishlist */
  removeFromWishlist: (productId: string) => Promise<void>;

  /** Add product to cart */
  addToCart: (product: FeaturedProduct, quantity?: number) => Promise<void>;
}

/**
 * Responsive breakpoint configuration
 */
export interface ResponsiveConfig {
  /** Card width on mobile */
  mobileCardWidth?: number;

  /** Card width on tablet */
  tabletCardWidth?: number;

  /** Card width on desktop */
  desktopCardWidth?: number;

  /** Gap between cards on mobile */
  mobileGap?: number;

  /** Gap between cards on tablet */
  tabletGap?: number;

  /** Gap between cards on desktop */
  desktopGap?: number;
}

/**
 * Carousel loading state
 */
export interface CarouselLoadingState {
  /** Whether products are loading */
  isLoading: boolean;

  /** Error message if loading failed */
  error?: string;

  /** Retry function */
  retry?: () => void;
}

/**
 * Product card image configuration
 */
export interface ProductImageConfig {
  /** Image aspect ratio */
  aspectRatio?: '1/1' | '3/4' | '4/5';

  /** Image object fit */
  objectFit?: 'cover' | 'contain' | 'fill';

  /** Show placeholder while loading */
  showPlaceholder?: boolean;

  /** Placeholder background color */
  placeholderColor?: string;

  /** Enable lazy loading */
  lazyLoad?: boolean;
}

/**
 * Carousel accessibility configuration
 */
export interface AccessibilityConfig {
  /** ARIA label for carousel */
  ariaLabel?: string;

  /** ARIA label for previous button */
  previousButtonLabel?: string;

  /** ARIA label for next button */
  nextButtonLabel?: string;

  /** Enable keyboard navigation */
  enableKeyboardNav?: boolean;

  /** Announce changes to screen readers */
  announceChanges?: boolean;
}

// Re-export Product type for convenience
export type { Product } from '@/types';
