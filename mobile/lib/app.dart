import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'core/routing/app_router.dart';
import 'core/config/mobile_config_service.dart';
import 'core/config/mobile_config_model.dart';
import 'core/config/dynamic_theme.dart';
import 'core/providers/theme_provider.dart';
import 'features/auth/presentation/pages/splash_page.dart';

class databaseApp extends ConsumerStatefulWidget {
  const databaseApp({super.key});

  @override
  ConsumerState<databaseApp> createState() => _databaseAppState();
}

class _databaseAppState extends ConsumerState<databaseApp> {
  @override
  Widget build(BuildContext context) {
    final configAsync = ref.watch(mobileConfigProvider);
    final themeMode = ref.watch(themeModeProvider);

    return configAsync.when(
      data: (config) {
        // Sync locale with API config if user hasn't manually set it
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _syncLocaleWithConfig(context, config);
        });

        final theme = DynamicTheme(config.theme);

        return MaterialApp(
          title: config.shopInfo.name,
          debugShowCheckedModeBanner: false,
          theme: theme.lightTheme,
          darkTheme: theme.darkTheme,
          themeMode: themeMode,
          localizationsDelegates: context.localizationDelegates,
          supportedLocales: context.supportedLocales,
          locale: context.locale,
          home: const SplashPage(),
          onGenerateRoute: AppRouter.onGenerateRoute,
        );
      },
      loading: () => const MaterialApp(
        debugShowCheckedModeBanner: false,
        home: Scaffold(
          body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 16),
                Text('Loading...'),
              ],
            ),
          ),
        ),
      ),
      error: (error, stack) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 64, color: Colors.red),
                  const SizedBox(height: 16),
                  const Text('Failed to load configuration'),
                  const SizedBox(height: 8),
                  Text(error.toString(), textAlign: TextAlign.center),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      ref.invalidate(mobileConfigProvider);
                    },
                    child: const Text('Retry'),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  void _syncLocaleWithConfig(BuildContext context, MobileConfig config) async {
    if (!mounted) return;

    try {
      // Check if user has manually set locale from settings
      final prefs = await SharedPreferences.getInstance();
      final hasManualLocale = prefs.containsKey('user_selected_locale');

      if (!mounted) return;

      // Always sync with API language unless user manually changed it from settings
      if (!hasManualLocale && config.defaultLanguage.isNotEmpty) {
        final currentLocale = context.locale;
        final apiLocale = Locale(config.defaultLanguage);

        if (currentLocale.languageCode != apiLocale.languageCode && mounted) {
          debugPrint('🌐 Syncing language from API: ${config.defaultLanguage}');
          debugPrint('🌐 Current locale: ${currentLocale.languageCode} -> New locale: ${apiLocale.languageCode}');
          await context.setLocale(apiLocale);

          // Force rebuild to apply new locale
          if (mounted) {
            setState(() {});
          }
        }
      }
    } catch (e) {
      debugPrint('⚠️ Error syncing locale: $e');
    }
  }
}
