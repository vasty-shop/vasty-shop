import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:easy_localization/easy_localization.dart';
import 'app.dart';
import 'core/config/mobile_config_service.dart';
import 'core/services/stripe_service.dart';
import 'features/auth/presentation/providers/auth_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load environment variables
  await dotenv.load(fileName: ".env");

  // Initialize Stripe
  await StripeService().initialize();

  // Initialize EasyLocalization
  await EasyLocalization.ensureInitialized();

  // Set preferred orientations
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Initialize SharedPreferences
  final sharedPreferences = await SharedPreferences.getInstance();

  // Determine initial locale from API config or user preference
  Locale startLocale = const Locale('en');
  try {
    // Check if user has manually set a language from settings
    final hasManualLocale = sharedPreferences.getBool('user_selected_locale') ?? false;

    if (hasManualLocale) {
      // Use the locale saved by EasyLocalization
      final savedLocaleCode = sharedPreferences.getString('locale');
      if (savedLocaleCode != null) {
        startLocale = Locale(savedLocaleCode);
        debugPrint('🌐 Using user-selected locale: $savedLocaleCode');
      }
    } else {
      // Fetch API config to get default language
      debugPrint('🌐 No manual locale set, fetching from API...');
      final container = ProviderContainer(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(sharedPreferences),
        ],
      );

      final configService = MobileConfigService();
      final config = await configService.fetchMobileConfig();

      if (config.defaultLanguage.isNotEmpty) {
        startLocale = Locale(config.defaultLanguage);
        debugPrint('🌐 Using API config language: ${config.defaultLanguage}');
      }

      container.dispose();
    }
  } catch (e) {
    debugPrint('⚠️ Error loading language config: $e');
  }

  debugPrint('🌐 Starting app with locale: ${startLocale.languageCode}');

  runApp(
    EasyLocalization(
      supportedLocales: const [
        Locale('en'),
        Locale('es'),
        Locale('fr'),
        Locale('de'),
        Locale('it'),
        Locale('pt'),
        Locale('ar'),
        Locale('zh'),
        Locale('ja'),
        Locale('ko'),
        Locale('hi'),
        Locale('bn'),
        Locale('ru'),
        Locale('tr'),
      ],
      path: 'assets/translations',
      fallbackLocale: const Locale('en'),
      startLocale: startLocale,
      saveLocale: true,
      child: ProviderScope(
        overrides: [
          // Override the SharedPreferences provider with the actual instance
          sharedPreferencesProvider.overrideWithValue(sharedPreferences),
        ],
        child: const databaseApp(),
      ),
    ),
  );
}
