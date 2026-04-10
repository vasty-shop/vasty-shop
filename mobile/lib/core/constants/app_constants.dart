import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConstants {
  // App Info
  static String get appName => dotenv.env['APP_NAME'] ?? 'database Shop';
  static const String appVersion = '1.0.0';

  // Shop Configuration
  static String get shopId => dotenv.env['SHOP_ID'] ?? '94ccb780-7d72-4c0c-a251-3693619b850a';

  // Storage Keys
  static const String authTokenKey = 'auth_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userDataKey = 'user_data';
  static const String guestModeKey = 'guest_mode';
  static const String hasSeenOnboardingKey = 'has_seen_onboarding';
  static const String rememberMeKey = 'remember_me';
  static const String themeMode = 'theme_mode';
  static const String languageCode = 'language_code';

  // User Roles
  static const String roleCustomer = 'customer';
  static const String roleVendor = 'vendor';
  static const String roleAdmin = 'admin';
  static const String roleDeliveryMan = 'delivery_man';

  // Validation
  static const int minPasswordLength = 8;
  static const int maxPasswordLength = 50;
  static const int minNameLength = 2;
  static const int maxNameLength = 100;

  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;

  // Image Upload
  static const int maxImageSizeMB = 5;
  static const List<String> allowedImageExtensions = ['jpg', 'jpeg', 'png', 'webp'];

  // Misc
  static const String supportEmail = 'support@databaseshop.com';
  static const String privacyPolicyUrl = 'https://databaseshop.com/privacy';
  static const String termsOfServiceUrl = 'https://databaseshop.com/terms';
}
