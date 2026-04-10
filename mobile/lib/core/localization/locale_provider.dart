import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/mobile_config_service.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';

/// Locale State Notifier
class LocaleNotifier extends StateNotifier<Locale> {
  final SharedPreferences _prefs;
  final Ref _ref;
  static const String _localeKey = 'selected_locale';

  static String get localeKey => _localeKey;

  LocaleNotifier(this._prefs, this._ref) : super(const Locale('en')) {
    _loadLocale();
  }

  /// Load saved locale from SharedPreferences or API default
  Future<void> _loadLocale() async {
    final savedLocale = _prefs.getString(_localeKey);
    if (savedLocale != null) {
      debugPrint('🌐 Loading saved locale: $savedLocale');
      state = Locale(savedLocale);
    } else {
      // Use default language from API config
      final defaultLanguage = _ref.read(defaultLanguageProvider);
      debugPrint('🌐 No saved locale, using API default: $defaultLanguage');
      state = Locale(defaultLanguage);
    }
  }

  /// Change locale and save to SharedPreferences
  Future<void> changeLocale(String languageCode) async {
    debugPrint('🌐 Changing locale to: $languageCode');
    state = Locale(languageCode);
    await _prefs.setString(_localeKey, languageCode);
    // Set flag so app.dart knows user manually selected locale (prevents API sync override)
    await _prefs.setBool('user_selected_locale', true);
  }

  /// Get locale from language code
  Locale getLocaleFromCode(String code) {
    return Locale(code);
  }
}

/// Locale Provider with API synchronization
final localeProvider = StateNotifierProvider<LocaleNotifier, Locale>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  final notifier = LocaleNotifier(prefs, ref);

  // Watch for config changes and update locale if not manually set
  ref.listen<String>(defaultLanguageProvider, (previous, next) {
    final savedLocale = prefs.getString(LocaleNotifier.localeKey);
    if (savedLocale == null && next != notifier.state.languageCode) {
      debugPrint('🌐 API language changed to: $next, updating locale');
      notifier.state = Locale(next);
    }
  });

  return notifier;
});

/// Get default language from API config
final defaultLanguageProvider = Provider<String>((ref) {
  return ref.watch(mobileConfigProvider).maybeWhen(
    data: (config) => config.defaultLanguage,
    orElse: () => 'en',
  );
});

/// Get supported languages from API config
final supportedLanguagesProvider = Provider<List<String>>((ref) {
  return ref.watch(mobileConfigProvider).maybeWhen(
    data: (config) => config.supportedLanguages,
    orElse: () => ['en', 'es', 'fr'],
  );
});
