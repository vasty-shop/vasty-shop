import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/routing/app_router.dart';
import '../providers/auth_provider.dart';

class SplashPage extends ConsumerStatefulWidget {
  const SplashPage({super.key});

  @override
  ConsumerState<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends ConsumerState<SplashPage> {
  @override
  void initState() {
    super.initState();
    _checkAndNavigate();
  }

  Future<void> _checkAndNavigate() async {
    // Wait for initialization
    await Future.delayed(const Duration(seconds: 2));

    if (!mounted) return;

    try {
      // Check if user has seen onboarding
      final prefs = await SharedPreferences.getInstance();
      final hasSeenOnboarding = prefs.getBool(AppConstants.hasSeenOnboardingKey) ?? false;

      // Check auth status
      await ref.read(authProvider.notifier).checkAuthStatus();
      final authState = ref.read(authProvider);
      final isAuthenticated = authState.isAuthenticated;
      final user = authState.user;

      if (!mounted) return;

      // Navigate based on state
      if (!hasSeenOnboarding) {
        // Show onboarding
        Navigator.of(context).pushReplacementNamed(AppRoutes.onboarding);
      } else if (isAuthenticated && user != null && (user.role == 'vendor' || user.role == 'delivery_man' || user.role == 'delivery')) {
        // Only vendors and delivery need authentication - navigate to their home
        AppRouter.navigateToHome(context, user);
      } else {
        // For customers, always go directly to customer home (guest mode)
        AppRouter.navigateToCustomerHome(context);
      }
    } catch (e) {
      // On error, navigate to customer home
      if (mounted) {
        AppRouter.navigateToCustomerHome(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Use lime green to match frontend theme
    const splashColor = Color(0xFF65A30D);
    const iconColor = Color(0xFF65A30D);

    return Scaffold(
      backgroundColor: splashColor,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Logo
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(30),
              ),
              child: const Icon(
                Icons.shopping_bag_rounded,
                size: 72,
                color: iconColor,
              ),
            ),

            const SizedBox(height: 24),

            // App name
            Text(
              AppConstants.appName,
              style: const TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),

            const SizedBox(height: 48),

            // Loading indicator
            const SizedBox(
              width: 40,
              height: 40,
              child: CircularProgressIndicator(
                strokeWidth: 3,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
