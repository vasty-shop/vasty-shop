/**
 * Mobile App Builder Types
 * Defines the data structure for AI-generated and customizable mobile apps
 * One unified app with multiple panels: Customer, Vendor, Delivery
 */

// App Type (actually Panel Type - one app with multiple panels)
export type MobileAppType = 'customer' | 'vendor' | 'delivery';

// Design Variant (React Native design patterns)
export type DesignVariant =
  | 'modern'
  | 'minimal'
  | 'glassmorphism'
  | 'neumorphism'
  | 'vibrant'
  | 'elegant';

// Color Scheme
export type ColorScheme =
  | 'blue'
  | 'purple'
  | 'green'
  | 'orange'
  | 'pink'
  | 'indigo'
  | 'teal'
  | 'red'
  | 'neutral'
  | 'lime';

// Theme configuration for mobile app
export interface MobileAppTheme {
  id: string;
  name: string;
  designVariant: DesignVariant;
  colorScheme: ColorScheme;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textSecondaryColor: string;
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
  fontFamily: string;
  darkMode: boolean;
}

// Screen types for Customer App
export type CustomerScreenType =
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'home'
  | 'products'
  | 'product-detail'
  | 'categories'
  | 'search'
  | 'cart'
  | 'checkout'
  | 'orders'
  | 'order-detail'
  | 'order-tracking'
  | 'wishlist'
  | 'profile'
  | 'addresses'
  | 'payment-methods'
  | 'reviews'
  | 'chat';

// Screen types for Vendor App
export type VendorScreenType =
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'dashboard'
  | 'products'
  | 'product-detail'
  | 'add-product'
  | 'orders'
  | 'order-detail'
  | 'delivery-management'
  | 'tracking-settings'
  | 'analytics'
  | 'offers'
  | 'reviews'
  | 'team'
  | 'wallet'
  | 'billing'
  | 'earnings'
  | 'profile'
  | 'account-settings'
  | 'shop-settings'
  | 'notifications'
  | 'chat';

// Screen types for Delivery App
export type DeliveryScreenType =
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'dashboard'
  | 'active-deliveries'
  | 'delivery-detail'
  | 'order-detail'
  | 'route-map'
  | 'delivery-history'
  | 'earnings'
  | 'reviews'
  | 'zones'
  | 'profile'
  | 'settings'
  | 'notifications'
  | 'proof-of-delivery'
  | 'chat';

// Base screen interface
export interface BaseScreen {
  id: string;
  type: CustomerScreenType | VendorScreenType | DeliveryScreenType;
  enabled: boolean;
  order: number;
  title: string;
  icon?: string;
  showInNavigation: boolean;
}

// Home Screen (Customer)
export interface HomeScreen extends BaseScreen {
  type: 'home';
  sections: HomeScreenSection[];
}

export type HomeScreenSectionType =
  | 'hero-banner'
  | 'search-bar'
  | 'categories-horizontal'
  | 'featured-products'
  | 'flash-sale'
  | 'new-arrivals'
  | 'best-sellers'
  | 'promotions'
  | 'recent-orders';

export interface HomeScreenSection {
  id: string;
  type: HomeScreenSectionType;
  enabled: boolean;
  order: number;
  title?: string;
  variant?: string;
  config?: Record<string, any>;
}

// Products Screen
export interface ProductsScreen extends BaseScreen {
  type: 'products';
  layout: 'grid' | 'list';
  columns: 2 | 3;
  showFilters: boolean;
  showSort: boolean;
  showSearch: boolean;
}

// Product Detail Screen
export interface ProductDetailScreen extends BaseScreen {
  type: 'product-detail';
  imageLayout: 'carousel' | 'gallery' | 'stack';
  showReviews: boolean;
  showRelated: boolean;
  showSizeGuide: boolean;
  showShareButton: boolean;
  addToCartPosition: 'bottom-fixed' | 'inline';
}

// Cart Screen
export interface CartScreen extends BaseScreen {
  type: 'cart';
  showCouponInput: boolean;
  showRecommendations: boolean;
  showDeliveryEstimate: boolean;
}

// Checkout Screen
export interface CheckoutScreen extends BaseScreen {
  type: 'checkout';
  steps: ('address' | 'payment' | 'review')[];
  showOrderSummary: boolean;
}

// Orders Screen
export interface OrdersScreen extends BaseScreen {
  type: 'orders';
  showFilters: boolean;
  defaultFilter: 'all' | 'active' | 'completed';
}

// Profile Screen
export interface ProfileScreen extends BaseScreen {
  type: 'profile';
  showAvatar: boolean;
  showStats: boolean;
  menuItems: ProfileMenuItem[];
}

export interface ProfileMenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  enabled: boolean;
}

// Dashboard Screen (Delivery)
export interface DashboardScreen extends BaseScreen {
  type: 'dashboard';
  showEarningsCard: boolean;
  showActiveDeliveries: boolean;
  showPerformanceStats: boolean;
  showRecentActivity: boolean;
}

// Active Deliveries Screen (Delivery)
export interface ActiveDeliveriesScreen extends BaseScreen {
  type: 'active-deliveries';
  showMap: boolean;
  sortBy: 'distance' | 'time' | 'priority';
}

// Delivery Detail Screen
export interface DeliveryDetailScreen extends BaseScreen {
  type: 'delivery-detail';
  showCustomerInfo: boolean;
  showOrderItems: boolean;
  showNavigation: boolean;
  showCallButton: boolean;
  showChatButton: boolean;
}

// Route Map Screen (Delivery)
export interface RouteMapScreen extends BaseScreen {
  type: 'route-map';
  showOptimizedRoute: boolean;
  showTrafficInfo: boolean;
  navigationProvider: 'google' | 'apple' | 'waze' | 'in-app';
}

// Earnings Screen (Delivery)
export interface EarningsScreen extends BaseScreen {
  type: 'earnings';
  showChart: boolean;
  showBreakdown: boolean;
  periods: ('daily' | 'weekly' | 'monthly')[];
}

// Proof of Delivery Screen
export interface ProofOfDeliveryScreen extends BaseScreen {
  type: 'proof-of-delivery';
  requirePhoto: boolean;
  requireSignature: boolean;
  requireNotes: boolean;
}

// ============= NEW CUSTOMER SCREENS =============

// Splash Screen
export interface SplashScreen extends BaseScreen {
  type: 'splash';
  showLogo: boolean;
  showAppName: boolean;
  animationType: 'fade' | 'scale' | 'slide' | 'none';
}

// Onboarding Screen
export interface OnboardingScreen extends BaseScreen {
  type: 'onboarding';
  slidesCount: number;
  showSkipButton: boolean;
  showDots: boolean;
}

// Login Screen
export interface LoginScreen extends BaseScreen {
  type: 'login';
  showSocialLogin: boolean;
  showForgotPassword: boolean;
  showSignupLink: boolean;
  showBiometric: boolean;
}

// Signup Screen
export interface SignupScreen extends BaseScreen {
  type: 'signup';
  showSocialSignup: boolean;
  showTermsCheckbox: boolean;
  showRoleSelection: boolean;
  fields: ('name' | 'email' | 'phone' | 'password')[];
}

// Forgot Password Screen
export interface ForgotPasswordScreen extends BaseScreen {
  type: 'forgot-password';
  resetMethod: 'email' | 'phone' | 'both';
}

// Order Detail Screen
export interface OrderDetailScreen extends BaseScreen {
  type: 'order-detail';
  showTimeline: boolean;
  showItems: boolean;
  showPaymentInfo: boolean;
  showDeliveryInfo: boolean;
  showTrackButton: boolean;
  showReorderButton: boolean;
}

// Order Tracking Screen
export interface OrderTrackingScreen extends BaseScreen {
  type: 'order-tracking';
  showMap: boolean;
  showDriverInfo: boolean;
  showLiveLocation: boolean;
  showEstimatedTime: boolean;
  showCallButton: boolean;
  showChatButton: boolean;
}

// Wishlist Screen
export interface WishlistScreen extends BaseScreen {
  type: 'wishlist';
  layout: 'grid' | 'list';
  showAddToCart: boolean;
  showRemoveButton: boolean;
  showPriceAlert: boolean;
}

// ============= VENDOR SCREENS =============

// Vendor Dashboard Screen
export interface VendorDashboardScreen extends BaseScreen {
  type: 'dashboard';
  showRevenueSummary: boolean;
  showOrdersStats: boolean;
  showProductsStats: boolean;
  showRecentOrders: boolean;
  showPerformanceChart: boolean;
  showQuickActions: boolean;
}

// Vendor Product Detail Screen
export interface VendorProductDetailScreen extends BaseScreen {
  type: 'product-detail';
  showEditButton: boolean;
  showDeleteButton: boolean;
  showStockInfo: boolean;
  showSalesInfo: boolean;
  showReviews: boolean;
}

// Add Product Screen (Vendor)
export interface AddProductScreen extends BaseScreen {
  type: 'add-product';
  steps: ('basic' | 'pricing' | 'inventory' | 'variants' | 'images' | 'seo')[];
  showDraft: boolean;
  showPreview: boolean;
  maxImages: number;
}

// Vendor Order Detail Screen
export interface VendorOrderDetailScreen extends BaseScreen {
  type: 'order-detail';
  showStatusUpdate: boolean;
  showCustomerInfo: boolean;
  showDeliveryAssignment: boolean;
  showPrintInvoice: boolean;
  showTimeline: boolean;
}

// Delivery Management Screen (Vendor)
export interface DeliveryManagementScreen extends BaseScreen {
  type: 'delivery-management';
  tabs: ('methods' | 'zones' | 'men' | 'tracking')[];
  showAddButton: boolean;
}

// Analytics Screen (Vendor)
export interface AnalyticsScreen extends BaseScreen {
  type: 'analytics';
  showRevenueChart: boolean;
  showOrdersChart: boolean;
  showProductsPerformance: boolean;
  showCustomerInsights: boolean;
  periods: ('daily' | 'weekly' | 'monthly' | 'yearly')[];
}

// Offers Screen (Vendor)
export interface OffersScreen extends BaseScreen {
  type: 'offers';
  showActiveOffers: boolean;
  showExpiredOffers: boolean;
  showAddOffer: boolean;
  showAnalytics: boolean;
}

// Reviews Screen (Vendor)
export interface VendorReviewsScreen extends BaseScreen {
  type: 'reviews';
  showFilters: boolean;
  showReply: boolean;
  showRatingSummary: boolean;
  showReportOption: boolean;
}

// Team Screen (Vendor)
export interface TeamScreen extends BaseScreen {
  type: 'team';
  showAddMember: boolean;
  showRoles: boolean;
  showPermissions: boolean;
  showActivity: boolean;
}

// Billing Screen (Vendor)
export interface BillingScreen extends BaseScreen {
  type: 'billing';
  showInvoices: boolean;
  showSubscription: boolean;
  showPaymentHistory: boolean;
  showUpgrade: boolean;
}

// Shop Settings Screen (Vendor)
export interface ShopSettingsScreen extends BaseScreen {
  type: 'shop-settings';
  showBasicInfo: boolean;
  showBranding: boolean;
  showPolicies: boolean;
  showPayment: boolean;
  showDelivery: boolean;
}

// ============= ADDITIONAL DELIVERY SCREENS =============

// Delivery Order Detail Screen
export interface DeliveryOrderDetailScreen extends BaseScreen {
  type: 'order-detail';
  showPickupInfo: boolean;
  showDeliveryInfo: boolean;
  showItems: boolean;
  showNavigation: boolean;
  showCallButtons: boolean;
  showStatusUpdate: boolean;
}

// Delivery History Screen
export interface DeliveryHistoryScreen extends BaseScreen {
  type: 'delivery-history';
  showFilters: boolean;
  showStats: boolean;
  showEarnings: boolean;
  groupByDate: boolean;
}

// Delivery Reviews Screen
export interface DeliveryReviewsScreen extends BaseScreen {
  type: 'reviews';
  showRatingSummary: boolean;
  showFilters: boolean;
  showTips: boolean;
}

// Delivery Zones Screen
export interface DeliveryZonesScreen extends BaseScreen {
  type: 'zones';
  showMap: boolean;
  showActiveZones: boolean;
  showPreferences: boolean;
}

// Union type for all screens
export type MobileAppScreen =
  // Common screens
  | SplashScreen
  | OnboardingScreen
  | LoginScreen
  | SignupScreen
  | ForgotPasswordScreen
  // Customer screens
  | HomeScreen
  | ProductsScreen
  | ProductDetailScreen
  | CartScreen
  | CheckoutScreen
  | OrdersScreen
  | OrderDetailScreen
  | OrderTrackingScreen
  | WishlistScreen
  | ProfileScreen
  // Vendor screens
  | VendorDashboardScreen
  | VendorProductDetailScreen
  | AddProductScreen
  | VendorOrderDetailScreen
  | DeliveryManagementScreen
  | AnalyticsScreen
  | OffersScreen
  | VendorReviewsScreen
  | TeamScreen
  | BillingScreen
  | ShopSettingsScreen
  // Delivery screens
  | DashboardScreen
  | ActiveDeliveriesScreen
  | DeliveryDetailScreen
  | DeliveryOrderDetailScreen
  | RouteMapScreen
  | DeliveryHistoryScreen
  | DeliveryReviewsScreen
  | DeliveryZonesScreen
  | EarningsScreen
  | ProofOfDeliveryScreen
  | BaseScreen;

// Navigation configuration
export interface NavigationConfig {
  type: 'bottom-tabs' | 'drawer' | 'stack';
  position?: 'bottom' | 'top';
  style: 'default' | 'floating' | 'minimal';
  showLabels: boolean;
  hapticFeedback: boolean;
  items: NavigationItem[];
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  activeIcon?: string;
  route: string;
  badge?: 'cart' | 'notifications' | 'orders' | 'deliveries';
}

// Splash Screen configuration
export interface SplashScreenConfig {
  backgroundColor: string;
  logoUrl?: string;
  animationType: 'fade' | 'scale' | 'slide' | 'none';
  duration: number;
}

// Onboarding configuration
export interface OnboardingConfig {
  enabled: boolean;
  slides: OnboardingSlide[];
  skipButton: boolean;
  showDots: boolean;
}

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image?: string;
  backgroundColor?: string;
}

// Push Notification configuration
export interface PushNotificationConfig {
  enabled: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  chat: boolean;
  // Delivery specific
  newDeliveries?: boolean;
  deliveryUpdates?: boolean;
}

// Supported languages
export type SupportedLanguage =
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'it'
  | 'pt'
  | 'ar'
  | 'zh'
  | 'ja'
  | 'ko'
  | 'hi'
  | 'bn'
  | 'ru'
  | 'tr';

// App Features
export interface MobileAppFeatures {
  darkMode: boolean;
  biometricAuth: boolean;
  pushNotifications: boolean;
  inAppChat: boolean;
  wishlist: boolean;
  reviews: boolean;
  socialShare: boolean;
  offlineMode: boolean;
  // Language support
  language: SupportedLanguage;
  // Delivery specific
  liveTracking?: boolean;
  routeOptimization?: boolean;
  proofOfDelivery?: boolean;
}

// Complete Mobile App Configuration
export interface MobileAppConfig {
  id: string;
  shopId: string;
  appType: MobileAppType;
  version: number;

  // App Identity
  appName: string;
  appSlogan?: string;
  appIcon?: string;

  // Design
  theme: MobileAppTheme;
  splashScreen: SplashScreenConfig;
  onboarding: OnboardingConfig;

  // Navigation & Screens
  navigation: NavigationConfig;
  screens: MobileAppScreen[];

  // Features
  features: MobileAppFeatures;
  pushNotifications: PushNotificationConfig;

  // Publishing Status
  published: boolean;
  publishedAt?: string;

  // App Store Info (for future use)
  appStoreInfo?: {
    bundleId?: string;
    iosAppId?: string;
    androidPackageName?: string;
    appStoreUrl?: string;
    playStoreUrl?: string;
  };

  createdAt: string;
  updatedAt: string;
}

// AI Generation types
export interface MobileAppGenerationPrompt {
  description: string;
  appType: MobileAppType;
  storeType: string;
  style: DesignVariant;
  colorPreference?: ColorScheme;
  targetAudience?: string;
  features?: string[];
}

export interface MobileAppGenerationResult {
  theme: MobileAppTheme;
  screens: MobileAppScreen[];
  navigation: NavigationConfig;
  splashScreen: SplashScreenConfig;
  onboarding: OnboardingConfig;
  features: MobileAppFeatures;
}

// Combined Generation Prompt (Site + Mobile)
export interface CombinedGenerationPrompt {
  description: string;
  storeType: string;
  style: string;
  targetAudience?: string;

  // Generation targets
  generateSite: boolean;
  generateMobileApp: boolean;

  // Mobile specific
  mobileAppTypes?: MobileAppType[];
  mobileColorScheme?: ColorScheme;
}

export interface CombinedGenerationResult {
  storefrontConfig?: any; // StorefrontConfig from storefront-builder types
  customerAppConfig?: MobileAppConfig;
  deliveryAppConfig?: MobileAppConfig;
}

// Theme presets
export interface MobileThemePreset {
  id: string;
  name: string;
  description: string;
  preview: string;
  theme: MobileAppTheme;
  category: DesignVariant;
}

// Screen templates
export interface ScreenTemplate {
  id: string;
  name: string;
  description: string;
  type: CustomerScreenType | VendorScreenType | DeliveryScreenType;
  appType: MobileAppType;
  preview: string;
  defaultConfig: Partial<MobileAppScreen>;
}

// Editor state
export interface MobileAppEditorState {
  config: MobileAppConfig;
  selectedScreenId: string | null;
  activePanel: 'screens' | 'theme' | 'navigation' | 'features' | null;
  previewDevice: 'iphone' | 'android' | 'ipad';
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  undoStack: MobileAppConfig[];
  redoStack: MobileAppConfig[];
}

// Preview state
export interface MobileAppPreviewState {
  currentScreen: string;
  darkMode: boolean;
  device: 'iphone' | 'android' | 'ipad';
  orientation: 'portrait' | 'landscape';
  scale: number;
}
