import 'package:flutter/material.dart';

/// Mobile Configuration Model
class MobileConfig {
  final ThemeConfig theme;
  final NavigationConfig navigation;
  final FeaturesConfig features;
  final ShopInfo shopInfo;
  final String defaultLanguage;
  final List<String> supportedLanguages;

  MobileConfig({
    required this.theme,
    required this.navigation,
    required this.features,
    required this.shopInfo,
    this.defaultLanguage = 'en',
    this.supportedLanguages = const ['en', 'es', 'fr'],
  });

  factory MobileConfig.fromJson(Map<String, dynamic> json) {
    final features = FeaturesConfig.fromJson(json['features'] as Map<String, dynamic>);

    // Get language from features.language or defaultLanguage field
    final defaultLang = json['defaultLanguage'] as String? ??
                       features.language ??
                       'en';

    final supportedLangs = (json['supportedLanguages'] as List<dynamic>?)
          ?.map((e) => e.toString())
          .toList() ?? const ['en', 'es', 'fr', 'ja'];

    debugPrint('🌐 MobileConfig Language Settings:');
    debugPrint('  - features.language from API: ${features.language}');
    debugPrint('  - defaultLanguage from API: ${json['defaultLanguage']}');
    debugPrint('  - Final defaultLanguage: $defaultLang');
    debugPrint('  - supportedLanguages: $supportedLangs');

    return MobileConfig(
      theme: ThemeConfig.fromJson(json['theme'] as Map<String, dynamic>),
      navigation: NavigationConfig.fromJson(json['navigation'] as Map<String, dynamic>),
      features: features,
      shopInfo: ShopInfo.fromJson(json['shopInfo'] as Map<String, dynamic>),
      defaultLanguage: defaultLang,
      supportedLanguages: supportedLangs,
    );
  }
}

/// Theme Configuration
class ThemeConfig {
  final bool darkMode;
  final String textColor;
  final String fontFamily;
  final String accentColor;
  final String colorScheme;
  final String borderRadius;
  final String primaryColor;
  final String styleVariant;
  final String surfaceColor;
  final String secondaryColor;
  final String backgroundColor;
  final String textSecondaryColor;

  ThemeConfig({
    required this.darkMode,
    required this.textColor,
    required this.fontFamily,
    required this.accentColor,
    required this.colorScheme,
    required this.borderRadius,
    required this.primaryColor,
    required this.styleVariant,
    required this.surfaceColor,
    required this.secondaryColor,
    required this.backgroundColor,
    required this.textSecondaryColor,
  });

  factory ThemeConfig.fromJson(Map<String, dynamic> json) {
    return ThemeConfig(
      darkMode: json['darkMode'] as bool? ?? false,
      textColor: json['textColor'] as String? ?? '#1A2E05',
      fontFamily: json['fontFamily'] as String? ?? 'Poppins',
      accentColor: json['accentColor'] as String? ?? '#A3E635',
      colorScheme: json['colorScheme'] as String? ?? 'lime',
      borderRadius: json['borderRadius'] as String? ?? 'large',
      primaryColor: json['primaryColor'] as String? ?? '#65A30D',
      styleVariant: json['styleVariant'] as String? ?? 'modern',
      surfaceColor: json['surfaceColor'] as String? ?? '#FFFFFF',
      secondaryColor: json['secondaryColor'] as String? ?? '#84CC16',
      backgroundColor: json['backgroundColor'] as String? ?? '#F7FEE7',
      textSecondaryColor: json['textSecondaryColor'] as String? ?? '#6B7280',
    );
  }

  // Color conversions
  Color get primaryColorValue => _hexToColor(primaryColor);
  Color get secondaryColorValue => _hexToColor(secondaryColor);
  Color get accentColorValue => _hexToColor(accentColor);
  Color get backgroundColorValue => _hexToColor(backgroundColor);
  Color get surfaceColorValue => _hexToColor(surfaceColor);
  Color get textColorValue => _hexToColor(textColor);
  Color get textSecondaryColorValue => _hexToColor(textSecondaryColor);

  double get borderRadiusValue {
    switch (borderRadius.toLowerCase()) {
      case 'small':
        return 4.0;
      case 'medium':
        return 8.0;
      case 'large':
        return 16.0;
      case 'xlarge':
        return 24.0;
      default:
        return 16.0;
    }
  }

  Color _hexToColor(String hexString) {
    final buffer = StringBuffer();
    if (hexString.length == 6 || hexString.length == 7) buffer.write('ff');
    buffer.write(hexString.replaceFirst('#', ''));
    return Color(int.parse(buffer.toString(), radix: 16));
  }
}

/// Navigation Configuration
class NavigationConfig {
  final String type;
  final String style;
  final bool showLabels;
  final bool hapticFeedback;

  NavigationConfig({
    required this.type,
    required this.style,
    required this.showLabels,
    required this.hapticFeedback,
  });

  factory NavigationConfig.fromJson(Map<String, dynamic> json) {
    return NavigationConfig(
      type: json['type'] as String? ?? 'bottom-tabs',
      style: json['style'] as String? ?? 'default',
      showLabels: json['showLabels'] as bool? ?? true,
      hapticFeedback: json['hapticFeedback'] as bool? ?? true,
    );
  }
}

/// Features Configuration
class FeaturesConfig {
  final bool darkMode;
  final bool biometricAuth;
  final bool pushNotifications;
  final String? language;

  FeaturesConfig({
    required this.darkMode,
    required this.biometricAuth,
    required this.pushNotifications,
    this.language,
  });

  factory FeaturesConfig.fromJson(Map<String, dynamic> json) {
    return FeaturesConfig(
      darkMode: json['darkMode'] as bool? ?? false,
      biometricAuth: json['biometricAuth'] as bool? ?? false,
      pushNotifications: json['pushNotifications'] as bool? ?? false,
      language: json['language'] as String?,
    );
  }
}

/// Shop Information
class ShopInfo {
  final String id;
  final String name;
  final String? logo;
  final String? description;
  final String? category;
  final String businessEmail;

  ShopInfo({
    required this.id,
    required this.name,
    this.logo,
    this.description,
    this.category,
    required this.businessEmail,
  });

  factory ShopInfo.fromJson(Map<String, dynamic> json) {
    return ShopInfo(
      id: json['id'] as String,
      name: json['name'] as String,
      logo: json['logo'] as String?,
      description: json['description'] as String?,
      category: json['category'] as String?,
      businessEmail: json['businessEmail'] as String,
    );
  }
}
