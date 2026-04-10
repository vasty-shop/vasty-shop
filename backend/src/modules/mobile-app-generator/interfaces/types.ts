/**
 * Mobile App Generator Types
 * Defines interfaces for React Native code generation
 */

export type MobileAppType = 'customer' | 'delivery' | 'both';
export type AppType = MobileAppType; // Alias for convenience

export type DesignVariant =
  | 'modern'
  | 'minimal'
  | 'glassmorphism'
  | 'neumorphism'
  | 'vibrant'
  | 'elegant';

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

export interface MobileAppTheme {
  id?: string;
  name?: string;
  designVariant: DesignVariant;
  colorScheme?: ColorScheme;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textSecondaryColor: string;
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
  fontFamily: string;
  darkMode?: boolean;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  activeIcon?: string;
  route: string;
  badge?: 'cart' | 'notifications' | 'orders' | 'deliveries';
}

export interface NavigationConfig {
  type: 'bottom-tabs' | 'drawer' | 'stack';
  position?: 'bottom' | 'top';
  style: 'default' | 'floating' | 'minimal';
  showLabels: boolean;
  hapticFeedback: boolean;
  items: NavigationItem[];
  // Additional navigation options for code generation
  tabBarStyle?: 'default' | 'floating' | 'minimal' | 'elevated';
  drawerEnabled?: boolean;
  headerStyle?: 'default' | 'transparent' | 'solid';
}

export interface SplashScreenConfig {
  backgroundColor: string;
  logoUrl?: string;
  animationType: 'fade' | 'scale' | 'slide' | 'none';
  duration?: number;
}

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image?: string;
  backgroundColor?: string;
}

export interface OnboardingConfig {
  enabled: boolean;
  slides: OnboardingSlide[];
  skipButton: boolean;
  showDots: boolean;
}

export interface MobileAppFeatures {
  darkMode: boolean;
  biometricAuth: boolean;
  pushNotifications: boolean;
  inAppChat: boolean;
  wishlist: boolean;
  reviews: boolean;
  socialShare: boolean;
  offlineMode: boolean;
  liveTracking?: boolean;
  routeOptimization?: boolean;
  proofOfDelivery?: boolean;
  // Additional features for code generation
  socialLogin?: boolean;
  guestCheckout?: boolean;
  productReviews?: boolean;
  orderTracking?: boolean;
  onboarding?: boolean;
}

export interface MobileAppConfig {
  id?: string;
  shopId: string;
  appType: MobileAppType;
  version?: number;
  appName: string;
  appSlogan?: string;
  appIcon?: string;
  theme: MobileAppTheme;
  splashScreen: SplashScreenConfig;
  onboarding?: OnboardingConfig;
  navigation: NavigationConfig;
  screens?: any[];
  features: MobileAppFeatures;
  pushNotifications?: any;
  published?: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;

  // API Configuration
  apiBaseUrl?: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
  type: 'component' | 'screen' | 'navigation' | 'api' | 'theme' | 'config' | 'asset';
}

export interface GeneratedAppResult {
  appType: MobileAppType;
  shopId: string;
  files: GeneratedFile[];
  totalFiles: number;
  generatedAt: string;
  structure: AppStructure;
}

export interface AppStructure {
  screens: string[];
  components: string[];
  navigation: string[];
  api: string[];
  theme: string[];
  config: string[];
}

export interface GenerationOptions {
  preview?: boolean;
  includeTests?: boolean;
  outputDir?: string;
  apiBaseUrl?: string;
}

// Screen configuration types
export interface ScreenConfig {
  id: string;
  type: string;
  enabled: boolean;
  order: number;
  title: string;
  icon?: string;
  showInNavigation: boolean;
  [key: string]: any;
}

// API Endpoints for code generation
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    refreshToken: '/auth/refresh-token',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    changePassword: '/auth/change-password',
  },
  // Products
  products: {
    list: '/products',
    detail: '/products/:id',
    search: '/products/search',
    byCategory: '/products/category/:categoryId',
    featured: '/products/featured',
    bestsellers: '/products/bestsellers',
  },
  // Categories
  categories: {
    list: '/categories',
    detail: '/categories/:id',
  },
  // Cart
  cart: {
    get: '/cart',
    add: '/cart/add',
    update: '/cart/update',
    remove: '/cart/remove/:itemId',
    clear: '/cart/clear',
    applyCoupon: '/cart/apply-coupon',
    removeCoupon: '/cart/remove-coupon',
  },
  // Wishlist
  wishlist: {
    list: '/wishlist',
    add: '/wishlist',
    remove: '/wishlist/:productId',
    check: '/wishlist/check/:productId',
  },
  // Orders
  orders: {
    list: '/orders',
    detail: '/orders/:id',
    create: '/orders',
    cancel: '/orders/:id/cancel',
    track: '/orders/:id/track',
    reorder: '/orders/:id/reorder',
  },
  // Delivery
  delivery: {
    addresses: '/delivery/addresses',
    addAddress: '/delivery/addresses',
    updateAddress: '/delivery/addresses/:id',
    deleteAddress: '/delivery/addresses/:id',
    setDefault: '/delivery/addresses/:id/default',
    methods: '/delivery/methods',
    calculateCost: '/delivery/calculate',
  },
  // Delivery Man
  deliveryMan: {
    dashboard: '/delivery-man/dashboard',
    activeDeliveries: '/delivery-man/active',
    deliveryHistory: '/delivery-man/history',
    earnings: '/delivery-man/earnings',
    updateStatus: '/delivery-man/delivery/:id/status',
    acceptDelivery: '/delivery-man/delivery/:id/accept',
    completeDelivery: '/delivery-man/delivery/:id/complete',
    profile: '/delivery-man/profile',
    updateLocation: '/delivery-man/location',
    availability: '/delivery-man/availability',
  },
  // Vendor
  vendor: {
    dashboard: '/shops/current/dashboard',
    products: '/shops/current/products',
    orders: '/shops/current/orders',
    updateOrderStatus: '/shops/current/orders/:id/status',
    analytics: '/shops/current/analytics',
    settings: '/shops/current/settings',
    deliveryMethods: '/shops/current/delivery-methods',
    deliveryZones: '/shops/current/delivery-zones',
    deliveryMen: '/shops/current/delivery-men',
  },
  // Reviews
  reviews: {
    productReviews: '/reviews/product/:productId',
    addReview: '/reviews',
    userReviews: '/reviews/user',
  },
  // Notifications
  notifications: {
    list: '/notifications',
    markRead: '/notifications/:id/read',
    markAllRead: '/notifications/read-all',
    settings: '/notifications/settings',
    registerDevice: '/notifications/register-device',
  },
  // Payment
  payment: {
    methods: '/payment/methods',
    createIntent: '/payment/create-intent',
    confirm: '/payment/confirm',
    walletBalance: '/wallet/balance',
    addToWallet: '/wallet/add',
  },
  // Shop
  shop: {
    info: '/shops/:shopId',
    storefront: '/shops/:shopId/storefront',
    products: '/shops/:shopId/products',
    categories: '/shops/:shopId/categories',
    reviews: '/shops/:shopId/reviews',
  },
  // Banners & Offers
  banners: {
    list: '/banners',
    active: '/banners/active',
  },
  offers: {
    list: '/offers',
    active: '/offers/active',
    detail: '/offers/:id',
  },
  // Coupons
  coupons: {
    validate: '/coupons/validate',
    apply: '/coupons/apply',
  },
  // Flash Sales
  flashSales: {
    active: '/flash-sales/active',
    upcoming: '/flash-sales/upcoming',
  },
};
