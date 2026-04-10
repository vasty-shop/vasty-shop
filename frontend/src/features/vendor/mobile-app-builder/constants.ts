/**
 * Mobile App Builder Constants
 * Default themes, screen templates, and presets for Customer and Delivery apps
 */

import type {
  MobileAppTheme,
  MobileThemePreset,
  ScreenTemplate,
  MobileAppConfig,
  NavigationConfig,
  SplashScreenConfig,
  OnboardingConfig,
  MobileAppFeatures,
  PushNotificationConfig,
  BaseScreen,
  // Common screens
  SplashScreen,
  OnboardingScreen,
  LoginScreen,
  SignupScreen,
  ForgotPasswordScreen,
  // Customer screens
  HomeScreen,
  ProductsScreen,
  ProductDetailScreen,
  CartScreen,
  CheckoutScreen,
  OrdersScreen,
  OrderDetailScreen,
  OrderTrackingScreen,
  WishlistScreen,
  ProfileScreen,
  // Vendor screens
  VendorDashboardScreen,
  VendorProductDetailScreen,
  AddProductScreen,
  VendorOrderDetailScreen,
  DeliveryManagementScreen,
  AnalyticsScreen,
  OffersScreen,
  VendorReviewsScreen,
  TeamScreen,
  BillingScreen,
  ShopSettingsScreen,
  // Delivery screens
  DashboardScreen,
  ActiveDeliveriesScreen,
  DeliveryDetailScreen,
  DeliveryOrderDetailScreen,
  RouteMapScreen,
  DeliveryHistoryScreen,
  DeliveryReviewsScreen,
  DeliveryZonesScreen,
  EarningsScreen,
  ProofOfDeliveryScreen,
  MobileAppType,
  MobileAppScreen,
} from './types';

// Color palettes for different schemes
export const COLOR_PALETTES = {
  blue: {
    primaryColor: '#2563EB',
    secondaryColor: '#3B82F6',
    accentColor: '#0EA5E9',
    backgroundColor: '#F8FAFC',
    surfaceColor: '#FFFFFF',
    textColor: '#1E293B',
    textSecondaryColor: '#64748B',
  },
  purple: {
    primaryColor: '#7C3AED',
    secondaryColor: '#8B5CF6',
    accentColor: '#A855F7',
    backgroundColor: '#FAF5FF',
    surfaceColor: '#FFFFFF',
    textColor: '#1E1B4B',
    textSecondaryColor: '#6B7280',
  },
  green: {
    primaryColor: '#059669',
    secondaryColor: '#10B981',
    accentColor: '#34D399',
    backgroundColor: '#F0FDF4',
    surfaceColor: '#FFFFFF',
    textColor: '#064E3B',
    textSecondaryColor: '#6B7280',
  },
  orange: {
    primaryColor: '#EA580C',
    secondaryColor: '#F97316',
    accentColor: '#FB923C',
    backgroundColor: '#FFF7ED',
    surfaceColor: '#FFFFFF',
    textColor: '#431407',
    textSecondaryColor: '#6B7280',
  },
  pink: {
    primaryColor: '#DB2777',
    secondaryColor: '#EC4899',
    accentColor: '#F472B6',
    backgroundColor: '#FDF2F8',
    surfaceColor: '#FFFFFF',
    textColor: '#500724',
    textSecondaryColor: '#6B7280',
  },
  indigo: {
    primaryColor: '#4F46E5',
    secondaryColor: '#6366F1',
    accentColor: '#818CF8',
    backgroundColor: '#EEF2FF',
    surfaceColor: '#FFFFFF',
    textColor: '#1E1B4B',
    textSecondaryColor: '#6B7280',
  },
  teal: {
    primaryColor: '#0D9488',
    secondaryColor: '#14B8A6',
    accentColor: '#2DD4BF',
    backgroundColor: '#F0FDFA',
    surfaceColor: '#FFFFFF',
    textColor: '#134E4A',
    textSecondaryColor: '#6B7280',
  },
  red: {
    primaryColor: '#DC2626',
    secondaryColor: '#EF4444',
    accentColor: '#F87171',
    backgroundColor: '#FEF2F2',
    surfaceColor: '#FFFFFF',
    textColor: '#450A0A',
    textSecondaryColor: '#6B7280',
  },
  neutral: {
    primaryColor: '#374151',
    secondaryColor: '#4B5563',
    accentColor: '#6B7280',
    backgroundColor: '#F9FAFB',
    surfaceColor: '#FFFFFF',
    textColor: '#111827',
    textSecondaryColor: '#6B7280',
  },
  lime: {
    primaryColor: '#65A30D',
    secondaryColor: '#84CC16',
    accentColor: '#A3E635',
    backgroundColor: '#F7FEE7',
    surfaceColor: '#FFFFFF',
    textColor: '#1A2E05',
    textSecondaryColor: '#6B7280',
  },
};

// Mobile Theme Presets
export const MOBILE_THEME_PRESETS: MobileThemePreset[] = [
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    description: 'Clean, professional look with blue accents',
    preview: '/mobile-themes/modern-blue.png',
    category: 'modern',
    theme: {
      id: 'modern-blue',
      name: 'Modern Blue',
      designVariant: 'modern',
      colorScheme: 'blue',
      ...COLOR_PALETTES.blue,
      borderRadius: 'medium',
      fontFamily: 'Inter',
      darkMode: false,
    },
  },
  {
    id: 'minimal-neutral',
    name: 'Minimal Neutral',
    description: 'Simple, elegant design with subtle tones',
    preview: '/mobile-themes/minimal-neutral.png',
    category: 'minimal',
    theme: {
      id: 'minimal-neutral',
      name: 'Minimal Neutral',
      designVariant: 'minimal',
      colorScheme: 'neutral',
      ...COLOR_PALETTES.neutral,
      borderRadius: 'small',
      fontFamily: 'SF Pro Display',
      darkMode: false,
    },
  },
  {
    id: 'glassmorphism-purple',
    name: 'Glass Purple',
    description: 'Modern frosted glass effect with purple tones',
    preview: '/mobile-themes/glass-purple.png',
    category: 'glassmorphism',
    theme: {
      id: 'glassmorphism-purple',
      name: 'Glass Purple',
      designVariant: 'glassmorphism',
      colorScheme: 'purple',
      ...COLOR_PALETTES.purple,
      borderRadius: 'large',
      fontFamily: 'Poppins',
      darkMode: false,
    },
  },
  {
    id: 'neumorphism-light',
    name: 'Soft Light',
    description: 'Soft, embossed 3D effect design',
    preview: '/mobile-themes/neumorphism-light.png',
    category: 'neumorphism',
    theme: {
      id: 'neumorphism-light',
      name: 'Soft Light',
      designVariant: 'neumorphism',
      colorScheme: 'neutral',
      primaryColor: '#6B7280',
      secondaryColor: '#9CA3AF',
      accentColor: '#3B82F6',
      backgroundColor: '#E5E7EB',
      surfaceColor: '#E5E7EB',
      textColor: '#1F2937',
      textSecondaryColor: '#6B7280',
      borderRadius: 'large',
      fontFamily: 'Inter',
      darkMode: false,
    },
  },
  {
    id: 'vibrant-pink',
    name: 'Vibrant Pink',
    description: 'Bold, energetic design with pink accents',
    preview: '/mobile-themes/vibrant-pink.png',
    category: 'vibrant',
    theme: {
      id: 'vibrant-pink',
      name: 'Vibrant Pink',
      designVariant: 'vibrant',
      colorScheme: 'pink',
      ...COLOR_PALETTES.pink,
      borderRadius: 'large',
      fontFamily: 'Nunito',
      darkMode: false,
    },
  },
  {
    id: 'elegant-dark',
    name: 'Elegant Dark',
    description: 'Sophisticated dark theme with gold accents',
    preview: '/mobile-themes/elegant-dark.png',
    category: 'elegant',
    theme: {
      id: 'elegant-dark',
      name: 'Elegant Dark',
      designVariant: 'elegant',
      colorScheme: 'neutral',
      primaryColor: '#B8860B',
      secondaryColor: '#D4AF37',
      accentColor: '#FFD700',
      backgroundColor: '#0F172A',
      surfaceColor: '#1E293B',
      textColor: '#F8FAFC',
      textSecondaryColor: '#94A3B8',
      borderRadius: 'small',
      fontFamily: 'Playfair Display',
      darkMode: true,
    },
  },
  {
    id: 'lime-fresh',
    name: 'Fresh Lime',
    description: 'Fresh, eco-friendly design with lime green',
    preview: '/mobile-themes/lime-fresh.png',
    category: 'modern',
    theme: {
      id: 'lime-fresh',
      name: 'Fresh Lime',
      designVariant: 'modern',
      colorScheme: 'lime',
      ...COLOR_PALETTES.lime,
      borderRadius: 'medium',
      fontFamily: 'Inter',
      darkMode: false,
    },
  },
  {
    id: 'teal-calm',
    name: 'Calm Teal',
    description: 'Calming, trustworthy design with teal',
    preview: '/mobile-themes/teal-calm.png',
    category: 'minimal',
    theme: {
      id: 'teal-calm',
      name: 'Calm Teal',
      designVariant: 'minimal',
      colorScheme: 'teal',
      ...COLOR_PALETTES.teal,
      borderRadius: 'medium',
      fontFamily: 'Lato',
      darkMode: false,
    },
  },
];

// Default Navigation for Customer App
export const DEFAULT_CUSTOMER_NAVIGATION: NavigationConfig = {
  type: 'bottom-tabs',
  position: 'bottom',
  style: 'default',
  showLabels: true,
  hapticFeedback: true,
  items: [
    { id: 'home', label: 'Home', icon: 'home', activeIcon: 'home-filled', route: 'Home' },
    { id: 'categories', label: 'Categories', icon: 'grid', activeIcon: 'grid-filled', route: 'Categories' },
    { id: 'cart', label: 'Cart', icon: 'shopping-cart', activeIcon: 'shopping-cart-filled', route: 'Cart', badge: 'cart' },
    { id: 'orders', label: 'Orders', icon: 'package', activeIcon: 'package-filled', route: 'Orders' },
    { id: 'profile', label: 'Profile', icon: 'user', activeIcon: 'user-filled', route: 'Profile' },
  ],
};

// Default Navigation for Vendor App
export const DEFAULT_VENDOR_NAVIGATION: NavigationConfig = {
  type: 'bottom-tabs',
  position: 'bottom',
  style: 'default',
  showLabels: true,
  hapticFeedback: true,
  items: [
    { id: 'dashboard', label: 'Dashboard', icon: 'home', activeIcon: 'home-filled', route: 'Dashboard' },
    { id: 'products', label: 'Products', icon: 'package', activeIcon: 'package-filled', route: 'Products' },
    { id: 'orders', label: 'Orders', icon: 'shopping-cart', activeIcon: 'shopping-cart-filled', route: 'Orders', badge: 'orders' },
    { id: 'earnings', label: 'Earnings', icon: 'dollar-sign', activeIcon: 'dollar-sign-filled', route: 'Earnings' },
    { id: 'profile', label: 'Profile', icon: 'user', activeIcon: 'user-filled', route: 'Profile' },
  ],
};

// Default Navigation for Delivery App
export const DEFAULT_DELIVERY_NAVIGATION: NavigationConfig = {
  type: 'bottom-tabs',
  position: 'bottom',
  style: 'default',
  showLabels: true,
  hapticFeedback: true,
  items: [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid', activeIcon: 'grid-filled', route: 'Dashboard' },
    { id: 'earnings', label: 'Earnings', icon: 'dollar-sign', activeIcon: 'dollar-sign-filled', route: 'Earnings' },
    { id: 'active-deliveries', label: 'History', icon: 'package', activeIcon: 'package-filled', route: 'History' },
    { id: 'profile', label: 'Orders', icon: 'truck', activeIcon: 'truck-filled', route: 'Orders' },
  ],
};

// Default Splash Screen
export const DEFAULT_SPLASH_SCREEN: SplashScreenConfig = {
  backgroundColor: '#FFFFFF',
  animationType: 'fade',
  duration: 2000,
};

// Default Onboarding for Customer App
export const DEFAULT_CUSTOMER_ONBOARDING: OnboardingConfig = {
  enabled: true,
  skipButton: true,
  showDots: true,
  slides: [
    {
      id: 'welcome',
      title: 'Welcome to Our Shop',
      description: 'Discover amazing products curated just for you',
      backgroundColor: '#F0F9FF',
    },
    {
      id: 'browse',
      title: 'Browse & Shop',
      description: 'Find what you love from our wide selection',
      backgroundColor: '#F0FDF4',
    },
    {
      id: 'delivery',
      title: 'Fast Delivery',
      description: 'Get your orders delivered right to your doorstep',
      backgroundColor: '#FEF3C7',
    },
  ],
};

// Default Onboarding for Delivery App
export const DEFAULT_DELIVERY_ONBOARDING: OnboardingConfig = {
  enabled: true,
  skipButton: true,
  showDots: true,
  slides: [
    {
      id: 'welcome',
      title: 'Welcome, Partner!',
      description: 'Start earning by delivering orders in your area',
      backgroundColor: '#F0F9FF',
    },
    {
      id: 'navigate',
      title: 'Easy Navigation',
      description: 'Get optimized routes to deliver faster',
      backgroundColor: '#F0FDF4',
    },
    {
      id: 'earn',
      title: 'Track Earnings',
      description: 'Monitor your earnings and performance in real-time',
      backgroundColor: '#FEF3C7',
    },
  ],
};

// Default Features for Customer App
export const DEFAULT_CUSTOMER_FEATURES: MobileAppFeatures = {
  darkMode: true,
  biometricAuth: true,
  pushNotifications: true,
  inAppChat: true,
  wishlist: true,
  reviews: true,
  socialShare: true,
  offlineMode: false,
  language: 'en',
};

// Default Features for Delivery App
export const DEFAULT_DELIVERY_FEATURES: MobileAppFeatures = {
  darkMode: true,
  biometricAuth: true,
  pushNotifications: true,
  inAppChat: true,
  wishlist: false,
  reviews: false,
  socialShare: false,
  offlineMode: true,
  language: 'en',
  liveTracking: true,
  routeOptimization: true,
  proofOfDelivery: true,
};

// Default Push Notifications for Customer App
export const DEFAULT_CUSTOMER_PUSH_NOTIFICATIONS: PushNotificationConfig = {
  enabled: true,
  orderUpdates: true,
  promotions: true,
  chat: true,
};

// Default Push Notifications for Delivery App
export const DEFAULT_DELIVERY_PUSH_NOTIFICATIONS: PushNotificationConfig = {
  enabled: true,
  orderUpdates: true,
  promotions: false,
  chat: true,
  newDeliveries: true,
  deliveryUpdates: true,
};

// Default Screens for Customer App
export const DEFAULT_CUSTOMER_SCREENS: MobileAppScreen[] = [
  // Auth Screens
  {
    id: 'splash',
    type: 'splash',
    enabled: true,
    order: 0,
    title: 'Splash',
    icon: 'loader',
    showInNavigation: false,
    showLogo: true,
    showAppName: true,
    animationType: 'fade',
  } as SplashScreen,
  {
    id: 'onboarding',
    type: 'onboarding',
    enabled: true,
    order: 1,
    title: 'Onboarding',
    icon: 'book-open',
    showInNavigation: false,
    slidesCount: 3,
    showSkipButton: true,
    showDots: true,
  } as OnboardingScreen,
  {
    id: 'login',
    type: 'login',
    enabled: true,
    order: 2,
    title: 'Login',
    icon: 'log-in',
    showInNavigation: false,
    showSocialLogin: true,
    showForgotPassword: true,
    showSignupLink: true,
    showBiometric: true,
  } as LoginScreen,
  {
    id: 'signup',
    type: 'signup',
    enabled: true,
    order: 3,
    title: 'Sign Up',
    icon: 'user-plus',
    showInNavigation: false,
    showSocialSignup: true,
    showTermsCheckbox: true,
    showRoleSelection: false,
    fields: ['name', 'email', 'phone', 'password'],
  } as SignupScreen,
  {
    id: 'forgot-password',
    type: 'forgot-password',
    enabled: true,
    order: 4,
    title: 'Forgot Password',
    icon: 'key',
    showInNavigation: false,
    resetMethod: 'email',
  } as ForgotPasswordScreen,
  // Main Screens
  {
    id: 'home',
    type: 'home',
    enabled: true,
    order: 5,
    title: 'Home',
    icon: 'home',
    showInNavigation: true,
    sections: [
      { id: 'search', type: 'search-bar', enabled: true, order: 0 },
      { id: 'hero', type: 'hero-banner', enabled: true, order: 1, variant: 'carousel' },
      { id: 'categories', type: 'categories-horizontal', enabled: true, order: 2, title: 'Categories' },
      { id: 'featured', type: 'featured-products', enabled: true, order: 3, title: 'Featured' },
      { id: 'flash-sale', type: 'flash-sale', enabled: true, order: 4, title: 'Flash Sale' },
      { id: 'new-arrivals', type: 'new-arrivals', enabled: true, order: 5, title: 'New Arrivals' },
      { id: 'best-sellers', type: 'best-sellers', enabled: true, order: 6, title: 'Best Sellers' },
      { id: 'promotions', type: 'promotions', enabled: true, order: 7, title: 'Promotions' },
      { id: 'recent-orders', type: 'recent-orders', enabled: true, order: 8, title: 'Recent Orders' },
    ],
  } as HomeScreen,
  {
    id: 'products',
    type: 'products',
    enabled: true,
    order: 8,
    title: 'Products',
    icon: 'grid',
    showInNavigation: false,
    layout: 'grid',
    columns: 2,
    showFilters: true,
    showSort: true,
    showSearch: true,
  } as ProductsScreen,
  {
    id: 'product-detail',
    type: 'product-detail',
    enabled: true,
    order: 9,
    title: 'Product Details',
    icon: 'file-text',
    showInNavigation: false,
    imageLayout: 'carousel',
    showReviews: true,
    showRelated: true,
    showSizeGuide: true,
    showShareButton: true,
    addToCartPosition: 'bottom-fixed',
  } as ProductDetailScreen,
  {
    id: 'cart',
    type: 'cart',
    enabled: true,
    order: 10,
    title: 'Cart',
    icon: 'shopping-cart',
    showInNavigation: true,
    showCouponInput: true,
    showRecommendations: true,
    showDeliveryEstimate: true,
  } as CartScreen,
  {
    id: 'checkout',
    type: 'checkout',
    enabled: true,
    order: 11,
    title: 'Checkout',
    icon: 'credit-card',
    showInNavigation: false,
    steps: ['address', 'payment', 'review'],
    showOrderSummary: true,
  } as CheckoutScreen,
  {
    id: 'wishlist',
    type: 'wishlist',
    enabled: true,
    order: 12,
    title: 'Wishlist',
    icon: 'heart',
    showInNavigation: true,
    layout: 'grid',
    showAddToCart: true,
    showRemoveButton: true,
    showPriceAlert: true,
  } as WishlistScreen,
  {
    id: 'orders',
    type: 'orders',
    enabled: true,
    order: 13,
    title: 'My Orders',
    icon: 'package',
    showInNavigation: true,
    showFilters: true,
    defaultFilter: 'all',
  } as OrdersScreen,
  {
    id: 'order-detail',
    type: 'order-detail',
    enabled: true,
    order: 14,
    title: 'Order Details',
    icon: 'file-text',
    showInNavigation: false,
    showTimeline: true,
    showItems: true,
    showPaymentInfo: true,
    showDeliveryInfo: true,
    showTrackButton: true,
    showReorderButton: true,
  } as OrderDetailScreen,
  {
    id: 'order-tracking',
    type: 'order-tracking',
    enabled: true,
    order: 15,
    title: 'Track Order',
    icon: 'map',
    showInNavigation: false,
    showMap: true,
    showDriverInfo: true,
    showLiveLocation: true,
    showEstimatedTime: true,
    showCallButton: true,
    showChatButton: true,
  } as OrderTrackingScreen,
  {
    id: 'profile',
    type: 'profile',
    enabled: true,
    order: 16,
    title: 'Profile',
    icon: 'user',
    showInNavigation: true,
    showAvatar: true,
    showStats: true,
    menuItems: [
      { id: 'addresses', label: 'My Addresses', icon: 'map-pin', route: 'Addresses', enabled: true },
      { id: 'payments', label: 'Payment Methods', icon: 'credit-card', route: 'PaymentMethods', enabled: true },
      { id: 'help', label: 'Help & Support', icon: 'help-circle', route: 'Help', enabled: true },
    ],
  } as ProfileScreen,
];

// Default Features for Vendor App
export const DEFAULT_VENDOR_FEATURES: MobileAppFeatures = {
  darkMode: true,
  biometricAuth: true,
  pushNotifications: true,
  inAppChat: true,
  wishlist: false,
  reviews: true,
  socialShare: false,
  offlineMode: false,
  language: 'en',
};

// Default Push Notifications for Vendor App
export const DEFAULT_VENDOR_PUSH_NOTIFICATIONS: PushNotificationConfig = {
  enabled: true,
  orderUpdates: true,
  promotions: false,
  chat: true,
};

// Default Onboarding for Vendor App
export const DEFAULT_VENDOR_ONBOARDING: OnboardingConfig = {
  enabled: true,
  skipButton: true,
  showDots: true,
  slides: [
    {
      id: 'welcome',
      title: 'Welcome, Seller!',
      description: 'Start selling your products online with ease',
      backgroundColor: '#F0F9FF',
    },
    {
      id: 'manage',
      title: 'Manage Your Store',
      description: 'Add products, track orders, and grow your business',
      backgroundColor: '#F0FDF4',
    },
    {
      id: 'earn',
      title: 'Track Earnings',
      description: 'Monitor your sales and earnings in real-time',
      backgroundColor: '#FEF3C7',
    },
  ],
};

// Default Screens for Vendor App
export const DEFAULT_VENDOR_SCREENS: MobileAppScreen[] = [
  // Auth Screens
  {
    id: 'splash',
    type: 'splash',
    enabled: true,
    order: 0,
    title: 'Splash',
    icon: 'loader',
    showInNavigation: false,
    showLogo: true,
    showAppName: true,
    animationType: 'fade',
  } as SplashScreen,
  {
    id: 'onboarding',
    type: 'onboarding',
    enabled: true,
    order: 1,
    title: 'Onboarding',
    icon: 'book-open',
    showInNavigation: false,
    slidesCount: 3,
    showSkipButton: true,
    showDots: true,
  } as OnboardingScreen,
  {
    id: 'login',
    type: 'login',
    enabled: true,
    order: 2,
    title: 'Login',
    icon: 'log-in',
    showInNavigation: false,
    showSocialLogin: true,
    showForgotPassword: true,
    showSignupLink: true,
    showBiometric: true,
  } as LoginScreen,
  {
    id: 'signup',
    type: 'signup',
    enabled: true,
    order: 3,
    title: 'Sign Up',
    icon: 'user-plus',
    showInNavigation: false,
    showSocialSignup: true,
    showTermsCheckbox: true,
    showRoleSelection: true,
    fields: ['name', 'email', 'phone', 'password'],
  } as SignupScreen,
  {
    id: 'forgot-password',
    type: 'forgot-password',
    enabled: true,
    order: 4,
    title: 'Forgot Password',
    icon: 'key',
    showInNavigation: false,
    resetMethod: 'email',
  } as ForgotPasswordScreen,
  // Main Screens
  {
    id: 'dashboard',
    type: 'dashboard',
    enabled: true,
    order: 6,
    title: 'Dashboard',
    icon: 'home',
    showInNavigation: true,
    showRevenueSummary: true,
    showOrdersStats: true,
    showProductsStats: true,
    showRecentOrders: true,
    showPerformanceChart: true,
    showQuickActions: true,
  } as VendorDashboardScreen,
  {
    id: 'products',
    type: 'products',
    enabled: true,
    order: 7,
    title: 'Products',
    icon: 'package',
    showInNavigation: true,
    layout: 'grid',
    columns: 2,
    showSearch: true,
    showFilters: true,
    showSort: true,
  } as ProductsScreen,
  {
    id: 'product-detail',
    type: 'product-detail',
    enabled: true,
    order: 8,
    title: 'Product Details',
    icon: 'file-text',
    showInNavigation: false,
    showEditButton: true,
    showDeleteButton: true,
    showStockInfo: true,
    showSalesInfo: true,
    showReviews: true,
  } as VendorProductDetailScreen,
  {
    id: 'add-product',
    type: 'add-product',
    enabled: true,
    order: 9,
    title: 'Add Product',
    icon: 'plus',
    showInNavigation: false,
    steps: ['basic', 'pricing', 'inventory', 'variants', 'images', 'seo'],
    showDraft: true,
    showPreview: true,
    maxImages: 10,
  } as AddProductScreen,
  {
    id: 'orders',
    type: 'orders',
    enabled: true,
    order: 10,
    title: 'Orders',
    icon: 'shopping-bag',
    showInNavigation: true,
    showFilters: true,
    defaultFilter: 'active',
  } as OrdersScreen,
  {
    id: 'order-detail',
    type: 'order-detail',
    enabled: true,
    order: 11,
    title: 'Order Details',
    icon: 'file-text',
    showInNavigation: false,
    showStatusUpdate: true,
    showCustomerInfo: true,
    showDeliveryAssignment: true,
    showPrintInvoice: true,
    showTimeline: true,
  } as VendorOrderDetailScreen,
  {
    id: 'delivery-management',
    type: 'delivery-management',
    enabled: true,
    order: 12,
    title: 'Delivery',
    icon: 'truck',
    showInNavigation: false,
    tabs: ['methods', 'zones', 'men', 'tracking'],
    showAddButton: true,
  } as DeliveryManagementScreen,
  {
    id: 'analytics',
    type: 'analytics',
    enabled: true,
    order: 17,
    title: 'Analytics',
    icon: 'bar-chart',
    showInNavigation: false,
    showRevenueChart: true,
    showOrdersChart: true,
    showProductsPerformance: true,
    showCustomerInsights: true,
    periods: ['daily', 'weekly', 'monthly', 'yearly'],
  } as AnalyticsScreen,
  {
    id: 'offers',
    type: 'offers',
    enabled: true,
    order: 18,
    title: 'Offers',
    icon: 'tag',
    showInNavigation: false,
    showActiveOffers: true,
    showExpiredOffers: true,
    showAddOffer: true,
    showAnalytics: true,
  } as OffersScreen,
  {
    id: 'reviews',
    type: 'reviews',
    enabled: true,
    order: 19,
    title: 'Reviews',
    icon: 'star',
    showInNavigation: false,
    showFilters: true,
    showReply: true,
    showRatingSummary: true,
    showReportOption: true,
  } as VendorReviewsScreen,
  {
    id: 'team',
    type: 'team',
    enabled: true,
    order: 20,
    title: 'Team',
    icon: 'users',
    showInNavigation: false,
    showAddMember: true,
    showRoles: true,
    showPermissions: true,
    showActivity: true,
  } as TeamScreen,
  {
    id: 'billing',
    type: 'billing',
    enabled: true,
    order: 22,
    title: 'Billing',
    icon: 'file-text',
    showInNavigation: false,
    showInvoices: true,
    showSubscription: true,
    showPaymentHistory: true,
    showUpgrade: true,
  } as BillingScreen,
  {
    id: 'profile',
    type: 'profile',
    enabled: true,
    order: 24,
    title: 'Profile',
    icon: 'user',
    showInNavigation: true,
    showAvatar: true,
    showStats: true,
    menuItems: [
      { id: 'shop-settings', label: 'Shop Settings', icon: 'store', route: 'ShopSettings', enabled: true },
      { id: 'team', label: 'Team', icon: 'users', route: 'Team', enabled: true },
      { id: 'delivery', label: 'Delivery', icon: 'truck', route: 'DeliveryManagement', enabled: true },
      { id: 'analytics', label: 'Analytics', icon: 'bar-chart', route: 'Analytics', enabled: true },
      { id: 'offers', label: 'Offers', icon: 'tag', route: 'Offers', enabled: true },
      { id: 'reviews', label: 'Reviews', icon: 'star', route: 'Reviews', enabled: true },
      { id: 'billing', label: 'Billing', icon: 'file-text', route: 'Billing', enabled: true },
      { id: 'notifications', label: 'Notifications', icon: 'bell', route: 'Notifications', enabled: true },
      { id: 'help', label: 'Help & Support', icon: 'help-circle', route: 'Help', enabled: true },
    ],
  } as ProfileScreen,
  {
    id: 'shop-settings',
    type: 'shop-settings',
    enabled: true,
    order: 26,
    title: 'Shop Settings',
    icon: 'store',
    showInNavigation: false,
    showBasicInfo: true,
    showBranding: true,
    showPolicies: true,
    showPayment: true,
    showDelivery: true,
  } as ShopSettingsScreen,
];

// Default Screens for Delivery App
export const DEFAULT_DELIVERY_SCREENS: MobileAppScreen[] = [
  // Auth Screens
  {
    id: 'splash',
    type: 'splash',
    enabled: true,
    order: 0,
    title: 'Splash',
    icon: 'loader',
    showInNavigation: false,
    showLogo: true,
    showAppName: true,
    animationType: 'fade',
  } as SplashScreen,
  {
    id: 'onboarding',
    type: 'onboarding',
    enabled: true,
    order: 1,
    title: 'Onboarding',
    icon: 'book-open',
    showInNavigation: false,
    slidesCount: 3,
    showSkipButton: true,
    showDots: true,
  } as OnboardingScreen,
  {
    id: 'login',
    type: 'login',
    enabled: true,
    order: 2,
    title: 'Login',
    icon: 'log-in',
    showInNavigation: false,
    showSocialLogin: true,
    showForgotPassword: true,
    showSignupLink: true,
    showBiometric: true,
  } as LoginScreen,
  {
    id: 'signup',
    type: 'signup',
    enabled: true,
    order: 3,
    title: 'Sign Up',
    icon: 'user-plus',
    showInNavigation: false,
    showSocialSignup: true,
    showTermsCheckbox: true,
    showRoleSelection: true,
    fields: ['name', 'email', 'phone', 'password'],
  } as SignupScreen,
  {
    id: 'forgot-password',
    type: 'forgot-password',
    enabled: true,
    order: 4,
    title: 'Forgot Password',
    icon: 'key',
    showInNavigation: false,
    resetMethod: 'email',
  } as ForgotPasswordScreen,
  // Main Screens
  {
    id: 'dashboard',
    type: 'dashboard',
    enabled: true,
    order: 5,
    title: 'Dashboard',
    icon: 'home',
    showInNavigation: true,
    showEarningsCard: true,
    showActiveDeliveries: true,
    showPerformanceStats: true,
    showRecentActivity: true,
  } as DashboardScreen,
  {
    id: 'orders',
    type: 'orders',
    enabled: true,
    order: 6,
    title: 'Orders',
    icon: 'package',
    showInNavigation: true,
    showFilters: true,
    defaultFilter: 'all',
  } as OrdersScreen,
  {
    id: 'order-detail',
    type: 'order-detail',
    enabled: true,
    order: 7,
    title: 'Order Details',
    icon: 'file-text',
    showInNavigation: false,
    showPickupInfo: true,
    showDeliveryInfo: true,
    showItems: true,
    showNavigation: true,
    showCallButtons: true,
    showStatusUpdate: true,
  } as DeliveryOrderDetailScreen,
  {
    id: 'delivery-history',
    type: 'delivery-history',
    enabled: true,
    order: 8,
    title: 'History',
    icon: 'clock',
    showInNavigation: true,
    showFilters: true,
    showStats: true,
    showEarnings: true,
    groupByDate: true,
  } as DeliveryHistoryScreen,
  {
    id: 'earnings',
    type: 'earnings',
    enabled: true,
    order: 9,
    title: 'Earnings',
    icon: 'dollar-sign',
    showInNavigation: true,
    showChart: true,
    showBreakdown: true,
    periods: ['daily', 'weekly', 'monthly'],
  } as EarningsScreen,
  {
    id: 'reviews',
    type: 'reviews',
    enabled: true,
    order: 10,
    title: 'Reviews',
    icon: 'star',
    showInNavigation: false,
    showRatingSummary: true,
    showFilters: true,
    showTips: true,
  } as DeliveryReviewsScreen,
  {
    id: 'zones',
    type: 'zones',
    enabled: true,
    order: 11,
    title: 'Delivery Zones',
    icon: 'map',
    showInNavigation: false,
    showMap: true,
    showActiveZones: true,
    showPreferences: true,
  } as DeliveryZonesScreen,
  {
    id: 'profile',
    type: 'profile',
    enabled: true,
    order: 12,
    title: 'Profile',
    icon: 'user',
    showInNavigation: true,
    showAvatar: true,
    showStats: true,
    menuItems: [
      { id: 'history', label: 'Delivery History', icon: 'clock', route: 'DeliveryHistory', enabled: true },
      { id: 'reviews', label: 'My Reviews', icon: 'star', route: 'Reviews', enabled: true },
      { id: 'zones', label: 'Delivery Zones', icon: 'map', route: 'Zones', enabled: true },
      { id: 'vehicle', label: 'Vehicle Info', icon: 'truck', route: 'VehicleInfo', enabled: true },
      { id: 'documents', label: 'Documents', icon: 'file-text', route: 'Documents', enabled: true },
      { id: 'notifications', label: 'Notifications', icon: 'bell', route: 'Notifications', enabled: true },
      { id: 'settings', label: 'Settings', icon: 'settings', route: 'Settings', enabled: true },
      { id: 'help', label: 'Help & Support', icon: 'help-circle', route: 'Help', enabled: true },
    ],
  } as ProfileScreen,
];

// Screen Templates for Customer App
export const CUSTOMER_SCREEN_TEMPLATES: ScreenTemplate[] = [
  {
    id: 'home-standard',
    name: 'Standard Home',
    description: 'Classic e-commerce home with all sections',
    type: 'home',
    appType: 'customer',
    preview: '/screens/home-standard.png',
    defaultConfig: DEFAULT_CUSTOMER_SCREENS[1] as Partial<MobileAppScreen>,
  },
  {
    id: 'products-grid',
    name: 'Product Grid',
    description: 'Grid layout with filters and sort',
    type: 'products',
    appType: 'customer',
    preview: '/screens/products-grid.png',
    defaultConfig: DEFAULT_CUSTOMER_SCREENS[2] as Partial<MobileAppScreen>,
  },
];

// Screen Templates for Delivery App
export const DELIVERY_SCREEN_TEMPLATES: ScreenTemplate[] = [
  {
    id: 'dashboard-standard',
    name: 'Standard Dashboard',
    description: 'Full featured delivery dashboard',
    type: 'dashboard',
    appType: 'delivery',
    preview: '/screens/dashboard-standard.png',
    defaultConfig: DEFAULT_DELIVERY_SCREENS[0],
  },
  {
    id: 'deliveries-map',
    name: 'Deliveries with Map',
    description: 'Active deliveries with integrated map',
    type: 'active-deliveries',
    appType: 'delivery',
    preview: '/screens/deliveries-map.png',
    defaultConfig: DEFAULT_DELIVERY_SCREENS[1],
  },
];

// Font Options for Mobile
export const MOBILE_FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter', category: 'sans-serif' },
  { value: 'SF Pro Display', label: 'SF Pro Display', category: 'sans-serif' },
  { value: 'Poppins', label: 'Poppins', category: 'sans-serif' },
  { value: 'Roboto', label: 'Roboto', category: 'sans-serif' },
  { value: 'Nunito', label: 'Nunito', category: 'sans-serif' },
  { value: 'Lato', label: 'Lato', category: 'sans-serif' },
  { value: 'Open Sans', label: 'Open Sans', category: 'sans-serif' },
  { value: 'Montserrat', label: 'Montserrat', category: 'sans-serif' },
  { value: 'Playfair Display', label: 'Playfair Display', category: 'serif' },
];

// Language Options for Multilanguage Support
export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Spanish', flag: '🇪🇸' },
  { value: 'fr', label: 'French', flag: '🇫🇷' },
  { value: 'de', label: 'German', flag: '🇩🇪' },
  { value: 'it', label: 'Italian', flag: '🇮🇹' },
  { value: 'pt', label: 'Portuguese', flag: '🇵🇹' },
  { value: 'ar', label: 'Arabic', flag: '🇸🇦' },
  { value: 'zh', label: 'Chinese', flag: '🇨🇳' },
  { value: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { value: 'ko', label: 'Korean', flag: '🇰🇷' },
  { value: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { value: 'bn', label: 'Bengali', flag: '🇧🇩' },
  { value: 'ru', label: 'Russian', flag: '🇷🇺' },
  { value: 'tr', label: 'Turkish', flag: '🇹🇷' },
];

// Design Variant Descriptions
export const DESIGN_VARIANT_INFO = {
  modern: {
    name: 'Modern',
    description: 'Clean, contemporary design with subtle shadows',
    keywords: ['clean', 'contemporary', 'professional'],
  },
  minimal: {
    name: 'Minimal',
    description: 'Simple, refined design with focus on content',
    keywords: ['simple', 'clean', 'elegant'],
  },
  glassmorphism: {
    name: 'Glassmorphism',
    description: 'Frosted glass effect with transparency',
    keywords: ['glass', 'blur', 'modern'],
  },
  neumorphism: {
    name: 'Neumorphism',
    description: 'Soft, embossed 3D effect design',
    keywords: ['soft', '3d', 'embossed'],
  },
  vibrant: {
    name: 'Vibrant',
    description: 'Bold colors with energetic feel',
    keywords: ['colorful', 'bold', 'energetic'],
  },
  elegant: {
    name: 'Elegant',
    description: 'Sophisticated, premium appearance',
    keywords: ['luxury', 'premium', 'sophisticated'],
  },
};

// Create default mobile app config
export function createDefaultMobileAppConfig(
  shopId: string,
  shopName: string,
  appType: MobileAppType
): MobileAppConfig {
  const defaultTheme = MOBILE_THEME_PRESETS[0].theme;

  // Get app name and slogan based on type
  const getAppName = () => {
    switch (appType) {
      case 'vendor':
        return `${shopName} Vendor`;
      case 'delivery':
        return `${shopName} Delivery`;
      default:
        return shopName;
    }
  };

  const getAppSlogan = () => {
    switch (appType) {
      case 'vendor':
        return 'Manage your store';
      case 'delivery':
        return 'Deliver with us';
      default:
        return 'Shop anytime, anywhere';
    }
  };

  // Get onboarding based on type
  const getOnboarding = () => {
    switch (appType) {
      case 'vendor':
        return DEFAULT_VENDOR_ONBOARDING;
      case 'delivery':
        return DEFAULT_DELIVERY_ONBOARDING;
      default:
        return DEFAULT_CUSTOMER_ONBOARDING;
    }
  };

  // Get navigation based on type
  const getNavigation = () => {
    switch (appType) {
      case 'vendor':
        return DEFAULT_VENDOR_NAVIGATION;
      case 'delivery':
        return DEFAULT_DELIVERY_NAVIGATION;
      default:
        return DEFAULT_CUSTOMER_NAVIGATION;
    }
  };

  // Get screens based on type
  const getScreens = () => {
    switch (appType) {
      case 'vendor':
        return DEFAULT_VENDOR_SCREENS.map((s) => ({ ...s }));
      case 'delivery':
        return DEFAULT_DELIVERY_SCREENS.map((s) => ({ ...s }));
      default:
        return DEFAULT_CUSTOMER_SCREENS.map((s) => ({ ...s }));
    }
  };

  // Get features based on type
  const getFeatures = () => {
    switch (appType) {
      case 'vendor':
        return DEFAULT_VENDOR_FEATURES;
      case 'delivery':
        return DEFAULT_DELIVERY_FEATURES;
      default:
        return DEFAULT_CUSTOMER_FEATURES;
    }
  };

  // Get push notifications based on type
  const getPushNotifications = () => {
    switch (appType) {
      case 'vendor':
        return DEFAULT_VENDOR_PUSH_NOTIFICATIONS;
      case 'delivery':
        return DEFAULT_DELIVERY_PUSH_NOTIFICATIONS;
      default:
        return DEFAULT_CUSTOMER_PUSH_NOTIFICATIONS;
    }
  };

  return {
    id: `mobile-app-${appType}-${shopId}`,
    shopId,
    appType,
    version: 1,
    appName: getAppName(),
    appSlogan: getAppSlogan(),
    theme: {
      ...defaultTheme,
      id: `${appType}-theme-${shopId}`,
      name: `${shopName} Theme`,
    },
    splashScreen: {
      ...DEFAULT_SPLASH_SCREEN,
      backgroundColor: defaultTheme.primaryColor,
    },
    onboarding: getOnboarding(),
    navigation: getNavigation(),
    screens: getScreens(),
    features: getFeatures(),
    pushNotifications: getPushNotifications(),
    published: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Style suggestions for AI prompts
export const MOBILE_STYLE_SUGGESTIONS = {
  customer: {
    fashion: [
      'Sleek shopping app with elegant product displays and wishlist',
      'Modern fashion boutique app with Instagram-style browsing',
      'Minimalist clothing store app with focus on imagery',
    ],
    electronics: [
      'Tech store app with detailed product specs and comparisons',
      'Gadget shop app with futuristic design and AR preview',
      'Smart device store with clean, professional interface',
    ],
    food: [
      'Food delivery app with mouth-watering product photos',
      'Grocery shopping app with easy categories and quick cart',
      'Restaurant ordering app with menu sections and combos',
    ],
    general: [
      'Modern e-commerce app with smooth animations',
      'User-friendly shopping app with quick checkout',
      'Premium marketplace app with personalized recommendations',
    ],
  },
  delivery: {
    general: [
      'Efficient delivery app with real-time tracking and route optimization',
      'Driver-friendly app with clear navigation and earnings tracker',
      'Fast delivery app with one-tap proof of delivery',
    ],
  },
};
