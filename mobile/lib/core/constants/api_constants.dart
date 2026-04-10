class ApiConstants {
  // Base URL - Change this to your backend URL
  static const String baseUrl = 'https://api.vasty.shop/api/v1';

  // Auth Endpoints
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String logout = '/auth/logout';
  static const String profile = '/auth/profile';
  static const String refreshToken = '/auth/refresh';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';
  static const String changePassword = '/auth/change-password';
  static const String verifyEmail = '/auth/verify-email';
  static const String resendVerification = '/auth/resend-verification';

  // OAuth
  static const String googleOAuth = '/auth/oauth/google';
  static const String githubOAuth = '/auth/oauth/github';
  static const String oauthExchange = '/auth/oauth/exchange';

  // Store Customer Auth
  static const String storeProfile = '/auth/store'; // /auth/store/:shopId/profile

  // Vendor Auth
  static const String vendorRegister = '/auth/vendor/register';
  static const String vendorLogin = '/auth/vendor/login';
  static const String vendorProfile = '/auth/vendor/profile';

  // Shops
  static const String shops = '/shops';
  static const String shopDetail = '/shops'; // /shops/:id
  static const String mobileConfig = '/shops/mobile-config'; // Get mobile app configuration

  // Products
  static const String products = '/products';
  static const String productDetail = '/products'; // /products/:id
  static const String featuredProducts = '/products/featured';
  static const String newProducts = '/products/new';
  static const String searchProducts = '/products/search';
  static const String shopProducts = '/products/shop'; // Vendor's products filtered by shop

  // Categories
  static const String categories = '/categories';
  static const String categoryDetail = '/categories'; // /categories/:id

  // Cart
  static const String cart = '/cart';
  static const String cartItems = '/cart/items';
  static const String addToCart = '/cart/add';
  static const String updateCartItem = '/cart/item';
  static const String removeFromCart = '/cart/item';
  static const String clearCart = '/cart/clear';

  // Coupons
  static const String validateCoupon = '/coupons/validate';

  // Wishlist
  static const String wishlist = '/wishlist';
  static const String addToWishlist = '/wishlist/add';
  static const String removeFromWishlist = '/wishlist/remove';

  // Reviews
  static const String reviews = '/reviews';
  static const String productReviews = '/reviews/product'; // /reviews/product/:productId
  static const String reviewStats = '/reviews/product'; // /reviews/product/:productId/summary
  static const String createReview = '/reviews';
  static const String updateReview = '/reviews'; // /reviews/:id
  static const String deleteReview = '/reviews'; // /reviews/:id
  static const String markHelpful = '/reviews'; // /reviews/:id/helpful

  // Orders
  static const String orders = '/orders';
  static const String orderDetail = '/orders'; // /orders/:id
  static const String trackOrder = '/orders/track'; // /orders/track/:orderNumber
  static const String createOrder = '/orders';
  static const String updateOrderStatus = '/orders'; // /orders/:id/status

  // Vendor Orders
  static const String vendorOrders = '/orders/shop'; // Vendor-scoped endpoint with x-shop-id header
  static const String vendorAcceptOrder = '/orders'; // /orders/:id/accept
  static const String vendorMarkShipped = '/orders'; // /orders/:id/ship
  static const String vendorCancelOrder = '/orders'; // /orders/:id/cancel

  // Delivery Partner
  static const String deliveryOrders = '/delivery/orders'; // Orders assigned to delivery partner
  static const String acceptOrder = '/delivery/orders'; // /delivery/orders/:id/accept
  static const String rejectOrder = '/delivery/orders'; // /delivery/orders/:id/reject
  static const String pickupOrder = '/delivery/orders'; // /delivery/orders/:id/pickup
  static const String deliverOrder = '/delivery/orders'; // /delivery/orders/:id/deliver
  static const String deliveryEarnings = '/delivery/earnings';
  static const String deliveryHistory = '/delivery/history';
  static const String deliveryProfile = '/delivery/profile';
  static const String updateLocation = '/delivery/location';
  static const String deliveryReviews = '/delivery-man'; // /:id/reviews - Get delivery man reviews
  static const String deliveryStats = '/delivery-man'; // /:id/stats - Get delivery man stats
  static const String deliverySettings = '/delivery-man'; // /:id/settings - Get/Update settings
  static const String deliveryAvailability = '/delivery-man'; // /:id/availability - Update availability

  // Vendor Delivery Management
  static const String deliveryMen = '/delivery-man'; // Get all delivery men
  static const String registerDeliveryMan = '/delivery-man/register'; // Register new delivery man
  static const String deliveryZones = '/zones'; // Get delivery zones
  static const String assignOrderToDeliveryMan = '/delivery-man/assign-order'; // Assign order to delivery man
  static const String deliveryMethods = '/delivery/methods'; // Get/Create delivery methods
  static const String shippingZones = '/delivery/zones'; // Get/Create shipping zones
  static const String shopShippingZones = '/delivery/zones/shop'; // Get shop-specific zones
  static const String shopOrders = '/orders/shop'; // Get shop orders for shipments

  // Timeout
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
