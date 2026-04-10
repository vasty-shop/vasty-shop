import 'package:flutter/material.dart';
import '../../features/auth/presentation/pages/splash_page.dart';
import '../../features/auth/presentation/pages/onboarding_page.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/signup_page.dart';
import '../../features/auth/presentation/pages/forgot_password_page.dart';
import '../../features/customer/home/presentation/pages/customer_home_page.dart';
import '../../features/vendor/home/presentation/pages/vendor_home_page.dart';
import '../../features/delivery/dashboard/presentation/pages/delivery_home_page.dart';
import '../../features/auth/data/models/user_model.dart';
import '../../features/notifications/presentation/pages/notifications_page.dart';
import '../../features/customer/orders/presentation/pages/track_order_page.dart';

/// App Route Names
class AppRoutes {
  static const String splash = '/';
  static const String onboarding = '/onboarding';
  static const String login = '/login';
  static const String signup = '/signup';
  static const String forgotPassword = '/forgot-password';

  // Role-based home routes
  static const String customerHome = '/customer/home';
  static const String vendorHome = '/vendor/home';
  static const String deliveryHome = '/delivery/home';

  // Notifications
  static const String notifications = '/notifications';

  // Track Order
  static const String trackOrder = '/track-order';
}

/// App Router Configuration
class AppRouter {
  /// Generate routes for the app
  static Route<dynamic>? onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case AppRoutes.splash:
        return MaterialPageRoute(builder: (_) => const SplashPage());

      case AppRoutes.onboarding:
        return MaterialPageRoute(builder: (_) => const OnboardingPage());

      case AppRoutes.login:
        return MaterialPageRoute(builder: (_) => const LoginPage());

      case AppRoutes.signup:
        return MaterialPageRoute(builder: (_) => const SignUpPage());

      case AppRoutes.forgotPassword:
        return MaterialPageRoute(builder: (_) => const ForgotPasswordPage());

      case AppRoutes.customerHome:
        return MaterialPageRoute(builder: (_) => const CustomerHomePage());

      case AppRoutes.vendorHome:
        return MaterialPageRoute(builder: (_) => const VendorHomePage());

      case AppRoutes.deliveryHome:
        return MaterialPageRoute(builder: (_) => const DeliveryHomePage());

      case AppRoutes.notifications:
        return MaterialPageRoute(builder: (_) => const NotificationsPage());

      case AppRoutes.trackOrder:
        final args = settings.arguments as Map<String, dynamic>?;
        return MaterialPageRoute(
          builder: (_) => TrackOrderPage(
            initialOrderNumber: args?['orderNumber'] as String?,
          ),
        );

      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(
              child: Text('No route defined for ${settings.name}'),
            ),
          ),
        );
    }
  }

  /// Get home route based on user role
  static String getHomeRouteForRole(String? role) {
    if (role == null) return AppRoutes.login;

    switch (role.toLowerCase()) {
      case 'customer':
        return AppRoutes.customerHome;
      case 'vendor':
        return AppRoutes.vendorHome;
      case 'delivery_man':
      case 'delivery':
        return AppRoutes.deliveryHome;
      default:
        return AppRoutes.customerHome; // Default to customer
    }
  }

  /// Navigate to home based on user role
  static void navigateToHome(BuildContext context, UserModel? user) {
    if (user == null) {
      Navigator.of(context).pushNamedAndRemoveUntil(
        AppRoutes.login,
        (route) => false,
      );
      return;
    }

    final homeRoute = getHomeRouteForRole(user.role);
    Navigator.of(context).pushNamedAndRemoveUntil(
      homeRoute,
      (route) => false,
    );
  }

  /// Navigate to login (clears navigation stack)
  static void navigateToLogin(BuildContext context) {
    Navigator.of(context).pushNamedAndRemoveUntil(
      AppRoutes.login,
      (route) => false,
    );
  }

  /// Navigate to customer home (for guest users)
  static void navigateToCustomerHome(BuildContext context) {
    Navigator.of(context).pushNamedAndRemoveUntil(
      AppRoutes.customerHome,
      (route) => false,
    );
  }

  /// Navigate to role-specific home and remove all previous routes
  static void navigateAndClearStack(BuildContext context, String routeName) {
    Navigator.of(context).pushNamedAndRemoveUntil(
      routeName,
      (route) => false,
    );
  }
}
