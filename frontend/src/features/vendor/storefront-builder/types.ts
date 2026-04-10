/**
 * Storefront Builder Types
 * Defines the data structure for AI-generated and customizable storefronts
 */

// Theme configuration
export interface StorefrontTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
  buttonStyle: 'solid' | 'outline' | 'ghost';
  cardStyle: 'flat' | 'elevated' | 'bordered';
}

// Section types
export type SectionType =
  | 'hero'
  | 'featured-products'
  | 'categories'
  | 'about'
  | 'testimonials'
  | 'newsletter'
  | 'banner'
  | 'product-grid'
  | 'collection'
  | 'video'
  | 'gallery'
  | 'faq'
  | 'contact'
  | 'custom-html';

// Base section interface
export interface BaseSection {
  id: string;
  type: SectionType;
  enabled: boolean;
  order: number;
}

// Hero slide for slideshow variant
export interface HeroSlide {
  id: string;
  headline: string;
  subheadline: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
  backgroundGradient?: string;
  overlayOpacity?: number; // 0-100
}

// Content position for hero sections
export type ContentPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

// Hero section
export interface HeroSection extends BaseSection {
  type: 'hero';
  variant: 'centered' | 'split' | 'video' | 'slideshow' | 'minimal';
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundType: 'image' | 'video' | 'gradient' | 'color';
  backgroundImage?: string;
  backgroundVideo?: string;
  backgroundColor?: string;
  backgroundGradient?: string;
  overlayOpacity: number;
  textAlignment: 'left' | 'center' | 'right';
  contentPosition?: ContentPosition; // Position of content in hero
  height: 'small' | 'medium' | 'large' | 'full';
  // Slideshow specific
  slides?: HeroSlide[];
  autoplay?: boolean;
  autoplayInterval?: number; // in seconds
  useDynamicContent?: boolean; // Use products for dynamic slides
}

// Featured Products section
export interface FeaturedProductsSection extends BaseSection {
  type: 'featured-products';
  variant: 'grid' | 'carousel' | 'list' | 'masonry';
  title: string;
  subtitle?: string;
  productIds: string[];
  showPrice: boolean;
  showRating: boolean;
  showAddToCart: boolean;
  columns: 2 | 3 | 4 | 5;
  limit: number;
}

// Categories section
export interface CategoriesSection extends BaseSection {
  type: 'categories';
  variant: 'grid' | 'carousel' | 'list' | 'icons';
  title: string;
  subtitle?: string;
  categoryIds: string[];
  showProductCount: boolean;
  columns: 2 | 3 | 4 | 6;
  useDynamicContent?: boolean; // Use categories from shop dynamically
}

// About/Story section
export interface AboutSection extends BaseSection {
  type: 'about';
  variant: 'split' | 'centered' | 'timeline';
  title: string;
  content: string;
  image?: string;
  imagePosition: 'left' | 'right';
  stats?: { label: string; value: string }[];
  ctaText?: string;
  ctaLink?: string;
}

// Testimonials section
export interface TestimonialsSection extends BaseSection {
  type: 'testimonials';
  variant: 'carousel' | 'grid' | 'masonry';
  title: string;
  subtitle?: string;
  testimonials: {
    id: string;
    name: string;
    role?: string;
    avatar?: string;
    content: string;
    rating?: number;
  }[];
  showRating: boolean;
  autoplay: boolean;
}

// Newsletter section
export interface NewsletterSection extends BaseSection {
  type: 'newsletter';
  variant: 'inline' | 'card' | 'banner';
  title: string;
  subtitle?: string;
  placeholder: string;
  buttonText: string;
  backgroundColor?: string;
  backgroundImage?: string;
}

// Banner section
export interface BannerSection extends BaseSection {
  type: 'banner';
  variant: 'full' | 'split' | 'minimal';
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  textColor?: string;
  height: 'small' | 'medium' | 'large';
}

// Product Grid section
export interface ProductGridSection extends BaseSection {
  type: 'product-grid';
  title: string;
  subtitle?: string;
  source: 'all' | 'category' | 'collection' | 'manual';
  categoryId?: string;
  collectionId?: string;
  productIds?: string[];
  sortBy: 'newest' | 'popular' | 'price-asc' | 'price-desc';
  columns: 2 | 3 | 4 | 5;
  limit: number;
  showFilters: boolean;
  showSort: boolean;
}

// Collection section
export interface CollectionSection extends BaseSection {
  type: 'collection';
  variant: 'hero' | 'grid' | 'list';
  collectionId: string;
  title: string;
  description?: string;
  backgroundImage?: string;
}

// Video section
export interface VideoSection extends BaseSection {
  type: 'video';
  variant: 'full' | 'inline' | 'background';
  videoUrl: string;
  posterImage?: string;
  title?: string;
  description?: string;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
}

// Gallery section
export interface GallerySection extends BaseSection {
  type: 'gallery';
  variant: 'grid' | 'masonry' | 'carousel';
  title?: string;
  images: {
    id: string;
    url: string;
    alt?: string;
    caption?: string;
  }[];
  columns: 2 | 3 | 4;
  gap: 'none' | 'small' | 'medium' | 'large';
}

// FAQ section
export interface FAQSection extends BaseSection {
  type: 'faq';
  variant: 'accordion' | 'grid' | 'list';
  title: string;
  subtitle?: string;
  faqs: {
    id: string;
    question: string;
    answer: string;
  }[];
}

// Contact section
export interface ContactSection extends BaseSection {
  type: 'contact';
  variant: 'split' | 'centered' | 'minimal';
  title: string;
  subtitle?: string;
  showForm: boolean;
  showMap: boolean;
  showSocial: boolean;
  email?: string;
  phone?: string;
  address?: string;
}

// Custom HTML section
export interface CustomHtmlSection extends BaseSection {
  type: 'custom-html';
  html: string;
  css?: string;
}

// Union type for all sections
export type StorefrontSection =
  | HeroSection
  | FeaturedProductsSection
  | CategoriesSection
  | AboutSection
  | TestimonialsSection
  | NewsletterSection
  | BannerSection
  | ProductGridSection
  | CollectionSection
  | VideoSection
  | GallerySection
  | FAQSection
  | ContactSection
  | CustomHtmlSection;

// Header configuration
export interface StorefrontHeader {
  variant: 'centered' | 'left' | 'split' | 'minimal';
  showLogo: boolean;
  showSearch: boolean;
  showCart: boolean;
  showAccount: boolean;
  sticky: boolean;
  transparent: boolean;
  menuItems: {
    id: string;
    label: string;
    link: string;
    children?: { id: string; label: string; link: string }[];
  }[];
  announcementBar?: {
    enabled: boolean;
    text: string;
    link?: string;
    backgroundColor: string;
    textColor: string;
  };
}

// Footer configuration
export interface StorefrontFooter {
  variant: 'simple' | 'columns' | 'minimal' | 'centered';
  showLogo: boolean;
  showSocial: boolean;
  showNewsletter: boolean;
  showPaymentIcons: boolean;
  copyrightText: string;
  columns: {
    id: string;
    title: string;
    links: { label: string; link: string }[];
  }[];
  socialLinks: {
    platform: 'facebook' | 'twitter' | 'instagram' | 'youtube' | 'tiktok' | 'linkedin';
    url: string;
  }[];
}

// SEO configuration
export interface StorefrontSEO {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  favicon?: string;
}

// Complete storefront configuration
export interface StorefrontConfig {
  id: string;
  shopId: string;
  version: number;
  published: boolean;
  publishedAt?: string;
  theme: StorefrontTheme;
  header: StorefrontHeader;
  sections: StorefrontSection[];
  footer: StorefrontFooter;
  seo: StorefrontSEO;
  customCss?: string;
  customJs?: string;
  createdAt: string;
  updatedAt: string;
}

// AI Generation types
export interface AIGenerationPrompt {
  description: string;
  storeType: string;
  style: 'modern' | 'minimal' | 'bold' | 'elegant' | 'playful' | 'professional';
  colorPreference?: string;
  targetAudience?: string;
  uniqueFeatures?: string[];
}

export interface AIGenerationResult {
  theme: StorefrontTheme;
  sections: StorefrontSection[];
  header: Partial<StorefrontHeader>;
  footer: Partial<StorefrontFooter>;
  seo: Partial<StorefrontSEO>;
}

// Section templates
export interface SectionTemplate {
  id: string;
  name: string;
  description: string;
  type: SectionType | PageSectionType;
  preview?: string;
  defaultConfig: Record<string, unknown>;
}

// Theme presets
// Layout configuration for theme presets
export interface ThemeLayoutConfig {
  // Header configuration
  header: {
    variant: 'centered' | 'left' | 'minimal' | 'split';
    sticky: boolean;
    transparent: boolean;
    showAnnouncementBar: boolean;
  };

  // Hero section defaults
  hero: {
    variant: 'centered' | 'split' | 'video' | 'slideshow' | 'minimal';
    height: 'small' | 'medium' | 'large' | 'full';
    textAlignment: 'left' | 'center' | 'right';
    contentPosition: ContentPosition;
    overlayOpacity: number;
  };

  // Featured products defaults
  featuredProducts: {
    variant: 'grid' | 'carousel' | 'list' | 'masonry';
    columns: 2 | 3 | 4 | 5;
    showAddToCart: boolean;
    showRating: boolean;
  };

  // Categories defaults
  categories: {
    variant: 'grid' | 'carousel' | 'list' | 'icons';
    columns: 2 | 3 | 4 | 6;
  };

  // Testimonials defaults
  testimonials: {
    variant: 'carousel' | 'grid' | 'masonry';
  };

  // Newsletter defaults
  newsletter: {
    variant: 'inline' | 'card' | 'banner';
  };

  // Collection page defaults
  collection: {
    filterPosition: 'sidebar' | 'top' | 'drawer';
    productCardStyle: 'minimal' | 'detailed' | 'hover-info' | 'overlay';
    columns: 2 | 3 | 4 | 5;
    gap: 'small' | 'medium' | 'large';
  };

  // Product page defaults
  product: {
    galleryLayout: 'thumbnails-left' | 'thumbnails-bottom' | 'thumbnails-right' | 'grid' | 'single';
    galleryPosition: 'left' | 'right';
    tabsLayout: 'tabs' | 'accordion' | 'stacked';
  };

  // Cart page defaults
  cart: {
    layout: 'two-column' | 'single-column';
    itemsLayout: 'detailed' | 'compact' | 'minimal';
  };

  // Checkout page defaults
  checkout: {
    style: 'single-page' | 'multi-step';
    formLayout: 'single-column' | 'two-column';
  };

  // Footer configuration
  footer: {
    variant: 'columns' | 'centered' | 'minimal' | 'simple';
    showNewsletter: boolean;
    showSocial: boolean;
    showPaymentIcons: boolean;
  };

  // Sections to show/hide by default
  defaultSections: {
    showAbout: boolean;
    showTestimonials: boolean;
    showNewsletter: boolean;
  };
}

export interface ThemePreset {
  id: string;
  name: string;
  preview: string;
  theme: StorefrontTheme;
  category: 'modern' | 'minimal' | 'bold' | 'elegant' | 'playful';
  // Layout configuration for this theme
  layoutConfig: ThemeLayoutConfig;
  // Description of this theme's style
  description?: string;
}

// Editor state
export interface StorefrontEditorState {
  config: StorefrontConfig;
  selectedSectionId: string | null;
  activePanel: 'sections' | 'theme' | 'settings' | 'seo' | null;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  undoStack: StorefrontConfig[];
  redoStack: StorefrontConfig[];
}

// ============================================
// Multi-Page Storefront Types (V2)
// ============================================

// Page types supported by the builder
export type PageType =
  | 'landing'
  | 'collection'
  | 'collections'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'wishlist'
  | 'profile'
  | 'trackOrder'
  | 'about'
  | 'contact'
  | 'search';

// Page-specific section types
export type PageSectionType =
  | SectionType
  // Collection page sections
  | 'collection-hero'
  | 'collection-filters'
  | 'collection-grid'
  | 'collection-sidebar'
  // Collections page (all collections)
  | 'collections-page'
  // Product page sections
  | 'product-gallery'
  | 'product-info'
  | 'product-tabs'
  | 'product-reviews'
  | 'related-products'
  // Cart page sections
  | 'cart-items'
  | 'cart-summary'
  | 'cart-recommendations'
  | 'cart-promo'
  // Checkout page sections
  | 'checkout-steps'
  | 'checkout-form'
  | 'checkout-summary'
  | 'checkout-payment'
  | 'checkout-page'
  // Wishlist page sections
  | 'wishlist-header'
  | 'wishlist-items'
  | 'wishlist-share'
  // Profile page sections
  | 'profile-sidebar'
  | 'profile-info'
  | 'profile-orders'
  | 'profile-addresses'
  | 'profile-settings'
  // Track order sections
  | 'order-search'
  | 'order-timeline'
  | 'order-details'
  | 'order-support'
  | 'track-order-page'
  // About page sections
  | 'about-hero'
  | 'about-content'
  | 'about-stats'
  | 'about-values'
  // Contact page sections
  | 'contact-hero'
  | 'contact-form'
  | 'contact-info'
  | 'contact-map'
  // Search page sections
  | 'search-page';

// Base page section interface
export interface BasePageSection {
  id: string;
  type: PageSectionType;
  enabled: boolean;
  order: number;
}

// ============================================
// Collection Page Sections
// ============================================

export interface CollectionHeroSection extends BasePageSection {
  type: 'collection-hero';
  showTitle: boolean;
  showDescription: boolean;
  showBreadcrumbs: boolean;
  showProductCount: boolean;
  backgroundType: 'image' | 'color' | 'gradient' | 'dynamic';
  backgroundColor?: string;
  backgroundGradient?: string;
  height: 'small' | 'medium' | 'large';
  textAlignment: 'left' | 'center' | 'right';
  overlayOpacity: number;
}

export interface CollectionFiltersSection extends BasePageSection {
  type: 'collection-filters';
  position: 'sidebar' | 'top' | 'drawer';
  showCategories: boolean;
  showPriceRange: boolean;
  showColors: boolean;
  showSizes: boolean;
  showBrands: boolean;
  showRatings: boolean;
  collapsible: boolean;
  stickyOnScroll: boolean;
}

export interface CollectionGridSection extends BasePageSection {
  type: 'collection-grid';
  columns: 2 | 3 | 4 | 5;
  gap: 'small' | 'medium' | 'large';
  productCardStyle: 'minimal' | 'detailed' | 'hover-info' | 'overlay';
  showQuickView: boolean;
  showAddToCart: boolean;
  showWishlist: boolean;
  showRating: boolean;
  showPrice: boolean;
  showSaleTag: boolean;
  infiniteScroll: boolean;
  productsPerPage: number;
}

// ============================================
// Product Page Sections
// ============================================

export interface ProductGallerySection extends BasePageSection {
  type: 'product-gallery';
  layout: 'thumbnails-left' | 'thumbnails-bottom' | 'thumbnails-right' | 'grid' | 'single';
  showZoom: boolean;
  showFullscreen: boolean;
  showThumbnails: boolean;
  thumbnailSize: 'small' | 'medium' | 'large';
  autoplay: boolean;
  aspectRatio: '1:1' | '4:3' | '3:4' | '16:9';
}

export interface ProductInfoSection extends BasePageSection {
  type: 'product-info';
  showBrand: boolean;
  showSku: boolean;
  showRating: boolean;
  showReviewCount: boolean;
  showStock: boolean;
  showVariants: boolean;
  variantStyle: 'buttons' | 'dropdown' | 'swatches';
  showQuantity: boolean;
  showWishlist: boolean;
  showShare: boolean;
  showCompare: boolean;
  ctaStyle: 'full-width' | 'inline' | 'sticky';
  showTrustBadges: boolean;
}

export interface ProductTabsSection extends BasePageSection {
  type: 'product-tabs';
  layout: 'tabs' | 'accordion' | 'sections';
  showDescription: boolean;
  showSpecifications: boolean;
  showShipping: boolean;
  showReturns: boolean;
  showSizeGuide: boolean;
}

export interface ProductReviewsSection extends BasePageSection {
  type: 'product-reviews';
  showRatingBreakdown: boolean;
  showWriteReview: boolean;
  showPhotos: boolean;
  showHelpful: boolean;
  sortOptions: ('newest' | 'oldest' | 'highest' | 'lowest' | 'helpful')[];
  reviewsPerPage: number;
}

export interface RelatedProductsSection extends BasePageSection {
  type: 'related-products';
  title: string;
  source: 'category' | 'tags' | 'manual' | 'ai';
  layout: 'carousel' | 'grid';
  columns: 2 | 3 | 4 | 5;
  limit: number;
  showPrice: boolean;
  showRating: boolean;
  showAddToCart: boolean;
}

// ============================================
// Cart Page Sections
// ============================================

export interface CartItemsSection extends BasePageSection {
  type: 'cart-items';
  layout: 'detailed' | 'compact' | 'minimal';
  showImage: boolean;
  imageSize: 'small' | 'medium' | 'large';
  showQuantityControls: boolean;
  showRemoveButton: boolean;
  showSaveForLater: boolean;
  showItemPrice: boolean;
  showLineTotal: boolean;
  showVariants: boolean;
}

export interface CartSummarySection extends BasePageSection {
  type: 'cart-summary';
  showSubtotal: boolean;
  showShipping: boolean;
  showTax: boolean;
  showDiscount: boolean;
  showPromoCode: boolean;
  showSecureCheckout: boolean;
  showPaymentIcons: boolean;
  showEstimatedDelivery: boolean;
  ctaText: string;
  ctaStyle: 'primary' | 'gradient' | 'outline';
}

export interface CartRecommendationsSection extends BasePageSection {
  type: 'cart-recommendations';
  title: string;
  source: 'related' | 'popular' | 'recently-viewed';
  layout: 'carousel' | 'grid';
  limit: number;
  showPrice: boolean;
  showAddToCart: boolean;
}

export interface CartPromoSection extends BasePageSection {
  type: 'cart-promo';
  showBanner: boolean;
  bannerText?: string;
  bannerBackgroundColor?: string;
  showFreeShippingProgress: boolean;
  freeShippingThreshold?: number;
}

// ============================================
// Checkout Page Sections
// ============================================

export interface CheckoutStepsSection extends BasePageSection {
  type: 'checkout-steps';
  style: 'numbered' | 'icons' | 'progress-bar' | 'tabs';
  steps: { id: string; label: string; icon?: string }[];
  showLabels: boolean;
  showConnectors: boolean;
}

export interface CheckoutFormSection extends BasePageSection {
  type: 'checkout-form';
  layout: 'single-column' | 'two-column';
  showGuestCheckout: boolean;
  showSaveAddress: boolean;
  showBillingAddress: boolean;
  billingDefault: 'same' | 'different';
  showOrderNotes: boolean;
}

export interface CheckoutSummarySection extends BasePageSection {
  type: 'checkout-summary';
  position: 'right' | 'bottom';
  sticky: boolean;
  showItemImages: boolean;
  showEditCart: boolean;
  collapsible: boolean;
  showTrustBadges: boolean;
}

export interface CheckoutPaymentSection extends BasePageSection {
  type: 'checkout-payment';
  showSavedCards: boolean;
  showSecurityBadge: boolean;
  paymentLayout: 'tabs' | 'accordion' | 'list';
}

// ============================================
// Wishlist Page Sections
// ============================================

export interface WishlistHeaderSection extends BasePageSection {
  type: 'wishlist-header';
  showTitle: boolean;
  showItemCount: boolean;
  showShareButton: boolean;
  showClearAll: boolean;
  showMoveToCart: boolean;
}

export interface WishlistItemsSection extends BasePageSection {
  type: 'wishlist-items';
  layout: 'grid' | 'list';
  columns: 2 | 3 | 4;
  showImage: boolean;
  showPrice: boolean;
  showStock: boolean;
  showAddToCart: boolean;
  showRemove: boolean;
  showPriceDropAlert: boolean;
}

export interface WishlistShareSection extends BasePageSection {
  type: 'wishlist-share';
  showCopyLink: boolean;
  showEmail: boolean;
  showSocialShare: boolean;
  socialPlatforms: ('facebook' | 'twitter' | 'pinterest' | 'whatsapp')[];
}

// ============================================
// Profile Page Sections
// ============================================

export interface ProfileSidebarSection extends BasePageSection {
  type: 'profile-sidebar';
  showAvatar: boolean;
  showName: boolean;
  showEmail: boolean;
  showMemberSince: boolean;
  menuItems: { id: string; label: string; icon: string; link: string }[];
  showLogout: boolean;
}

export interface ProfileInfoSection extends BasePageSection {
  type: 'profile-info';
  showPersonalInfo: boolean;
  showChangePassword: boolean;
  showPhoneNumber: boolean;
  showBirthday: boolean;
  showGender: boolean;
  showNewsletterPreference: boolean;
}

export interface ProfileOrdersSection extends BasePageSection {
  type: 'profile-orders';
  showOrderStatus: boolean;
  showOrderDate: boolean;
  showOrderTotal: boolean;
  showTrackButton: boolean;
  showReorderButton: boolean;
  showReviewButton: boolean;
  ordersPerPage: number;
}

export interface ProfileAddressesSection extends BasePageSection {
  type: 'profile-addresses';
  showDefaultBadge: boolean;
  showEditButton: boolean;
  showDeleteButton: boolean;
  showAddNew: boolean;
  layout: 'grid' | 'list';
}

export interface ProfileSettingsSection extends BasePageSection {
  type: 'profile-settings';
  showNotifications: boolean;
  showPrivacy: boolean;
  showLanguage: boolean;
  showCurrency: boolean;
  showDeleteAccount: boolean;
}

// ============================================
// Track Order Page Sections
// ============================================

export interface OrderSearchSection extends BasePageSection {
  type: 'order-search';
  showHeroBackground: boolean;
  backgroundColor?: string;
  backgroundGradient?: string;
  showOrderNumberInput: boolean;
  showEmailInput: boolean;
  showPhoneInput: boolean;
  showExampleFormat: boolean;
}

export interface OrderTimelineSection extends BasePageSection {
  type: 'order-timeline';
  layout: 'horizontal' | 'vertical';
  showIcons: boolean;
  showDates: boolean;
  showTime: boolean;
  showLocation: boolean;
  showDescription: boolean;
  animateProgress: boolean;
}

export interface OrderDetailsSection extends BasePageSection {
  type: 'order-details';
  showOrderItems: boolean;
  showShippingAddress: boolean;
  showBillingAddress: boolean;
  showPaymentMethod: boolean;
  showCarrierInfo: boolean;
  showTrackingNumber: boolean;
  showCopyButton: boolean;
}

export interface OrderSupportSection extends BasePageSection {
  type: 'order-support';
  showContactCard: boolean;
  showCallButton: boolean;
  showEmailButton: boolean;
  showChatButton: boolean;
  showFAQ: boolean;
  faqs?: { question: string; answer: string }[];
}

// ============================================
// Page Configuration Interfaces
// ============================================

// Base page configuration
export interface StorefrontPage {
  enabled: boolean;
  slug: string;
  title: string;
  sections: (StorefrontSection | BasePageSection)[];
  seo?: StorefrontSEO;
  layout?: 'default' | 'full-width' | 'sidebar-left' | 'sidebar-right';
}

// Collection page specific config
export interface CollectionPageConfig extends StorefrontPage {
  variant: 'category-grid' | 'featured-collection' | 'both';
  productsPerPage: number;
  defaultSort: 'newest' | 'price-asc' | 'price-desc' | 'popular' | 'rating';
  showFilters: boolean;
  filterPosition: 'sidebar' | 'top' | 'drawer';
}

// Product page specific config
export interface ProductPageConfig extends StorefrontPage {
  galleryPosition: 'left' | 'right';
  showBreadcrumbs: boolean;
  showRelatedProducts: boolean;
  relatedProductsCount: number;
  showRecentlyViewed: boolean;
  showReviews: boolean;
  tabsLayout: 'tabs' | 'accordion' | 'sections';
}

// Cart page specific config
export interface CartPageConfig extends StorefrontPage {
  cartLayout: 'two-column' | 'single-column';
  showRecommendations: boolean;
  recommendationsCount: number;
  showPromoInput: boolean;
  showEstimatedShipping: boolean;
  showTrustBadges: boolean;
}

// Checkout page specific config
export interface CheckoutPageConfig extends StorefrontPage {
  style: 'single-page' | 'multi-step';
  showOrderSummary: boolean;
  summaryPosition: 'right' | 'bottom';
  showTrustBadges: boolean;
  showSecurityInfo: boolean;
}

// Wishlist page specific config
export interface WishlistPageConfig extends StorefrontPage {
  showRecommendations: boolean;
  showShareOptions: boolean;
  wishlistLayout: 'grid' | 'list';
  columns: 2 | 3 | 4;
}

// Profile page specific config
export interface ProfilePageConfig extends StorefrontPage {
  sidebarPosition: 'left' | 'right';
  showStats: boolean;
  defaultTab: 'dashboard' | 'orders' | 'addresses' | 'settings';
}

// Track order page specific config
export interface TrackOrderPageConfig extends StorefrontPage {
  showHeroSection: boolean;
  timelinePosition: 'top' | 'left';
  showDeliveryPartner: boolean;
  showContactSupport: boolean;
}

// About page specific config
export interface AboutPageConfig extends StorefrontPage {
  showHeroSection: boolean;
  showStatsSection: boolean;
  showValuesSection: boolean;
  showTeamSection: boolean;
}

// Contact page specific config
export interface ContactPageConfig extends StorefrontPage {
  showHeroSection: boolean;
  showFormSection: boolean;
  showMapSection: boolean;
  showSocialSection: boolean;
}

// All pages configuration
export interface StorefrontPages {
  landing: StorefrontPage;
  collection: CollectionPageConfig;
  product: ProductPageConfig;
  cart: CartPageConfig;
  checkout: CheckoutPageConfig;
  wishlist: WishlistPageConfig;
  profile: ProfilePageConfig;
  trackOrder: TrackOrderPageConfig;
  about: AboutPageConfig;
  contact: ContactPageConfig;
}

// ============================================
// StorefrontConfig V2 with Pages
// ============================================

export interface StorefrontConfigV2 {
  id: string;
  shopId: string;
  shopName?: string;
  version: 2;
  published: boolean;
  publishedAt?: string;
  theme: StorefrontTheme;
  header: StorefrontHeader;
  footer: StorefrontFooter;
  globalSeo: StorefrontSEO;
  seo: StorefrontSEO; // Alias for globalSeo, used by SEOEditor
  pages: StorefrontPages;
  customCss?: string;
  customJs?: string;
  createdAt: string;
  updatedAt: string;
  // Deprecated - kept for backward compatibility with v1
  sections?: StorefrontSection[];
}

// Updated Editor State for V2
export interface StorefrontEditorStateV2 {
  config: StorefrontConfigV2;
  currentPage: PageType;
  selectedSectionId: string | null;
  activePanel: 'pages' | 'sections' | 'theme' | 'settings' | 'seo' | null;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  undoStack: StorefrontConfigV2[];
  redoStack: StorefrontConfigV2[];
}

// Page metadata for the editor
export interface PageTypeInfo {
  id: PageType;
  name: string;
  description: string;
  icon: string;
  slug: string;
  requiredSections: PageSectionType[];
  availableSections: PageSectionType[];
}

// Union type for all page sections
export type PageSection =
  | CollectionHeroSection
  | CollectionFiltersSection
  | CollectionGridSection
  | ProductGallerySection
  | ProductInfoSection
  | ProductTabsSection
  | ProductReviewsSection
  | RelatedProductsSection
  | CartItemsSection
  | CartSummarySection
  | CartRecommendationsSection
  | CartPromoSection
  | CheckoutStepsSection
  | CheckoutFormSection
  | CheckoutSummarySection
  | CheckoutPaymentSection
  | WishlistHeaderSection
  | WishlistItemsSection
  | WishlistShareSection
  | ProfileSidebarSection
  | ProfileInfoSection
  | ProfileOrdersSection
  | ProfileAddressesSection
  | ProfileSettingsSection
  | OrderSearchSection
  | OrderTimelineSection
  | OrderDetailsSection
  | OrderSupportSection;
