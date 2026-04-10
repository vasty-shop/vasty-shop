import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'mobile_config_model.dart';

class DynamicTheme {
  final ThemeConfig config;

  DynamicTheme(this.config) {
    debugPrint('🎨 DynamicTheme initialized with fontFamily: ${config.fontFamily}');
  }

  /// Get the font family name for Google Fonts
  String _getGoogleFontName() {
    final fontFamily = config.fontFamily.toLowerCase().trim();
    debugPrint('🔤 Processing fontFamily: "$fontFamily"');

    // Map common variations to Google Fonts names
    switch (fontFamily) {
      case 'nunito':
        return 'Nunito';
      case 'roboto':
        return 'Roboto';
      case 'poppins':
        return 'Poppins';
      case 'open sans':
      case 'opensans':
      case 'open-sans':
        return 'Open Sans';
      case 'lato':
        return 'Lato';
      case 'montserrat':
        return 'Montserrat';
      case 'raleway':
        return 'Raleway';
      case 'ubuntu':
        return 'Ubuntu';
      case 'inter':
        return 'Inter';
      case 'playfair display':
      case 'playfairdisplay':
        return 'Playfair Display';
      case 'source sans pro':
      case 'sourcesanspro':
        return 'Source Sans Pro';
      case 'merriweather':
        return 'Merriweather';
      case 'pt sans':
      case 'ptsans':
        return 'PT Sans';
      case 'work sans':
      case 'worksans':
        return 'Work Sans';
      default:
        debugPrint('⚠️ Unknown font "$fontFamily", falling back to Poppins');
        return 'Poppins';
    }
  }

  /// Get TextTheme based on font family from API
  TextTheme _getTextTheme([TextTheme? base]) {
    final googleFontName = _getGoogleFontName();
    debugPrint('🎯 Applying Google Font: $googleFontName');

    try {
      // Use GoogleFonts.getTextTheme for dynamic font loading
      final textTheme = GoogleFonts.getTextTheme(googleFontName, base);
      debugPrint('✅ Successfully loaded font: $googleFontName');
      return textTheme;
    } catch (e) {
      debugPrint('❌ Failed to load font "$googleFontName": $e');
      // Fallback to Poppins
      return GoogleFonts.poppinsTextTheme(base);
    }
  }

  /// Generate light theme from configuration
  ThemeData get lightTheme {
    // Get the base theme first, then apply Google Font
    final baseTheme = ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
    );

    // Apply Google Font to the base text theme
    final fontTextTheme = _getTextTheme(baseTheme.textTheme);

    // Apply colors to the font text theme
    final textTheme = fontTextTheme.apply(
      bodyColor: config.textColorValue,
      displayColor: config.textColorValue,
    ).copyWith(
      bodySmall: fontTextTheme.bodySmall?.copyWith(color: config.textSecondaryColorValue),
      labelMedium: fontTextTheme.labelMedium?.copyWith(color: config.textSecondaryColorValue),
      labelSmall: fontTextTheme.labelSmall?.copyWith(color: config.textSecondaryColorValue),
    );

    debugPrint('🎨 Light theme built with font: ${config.fontFamily}');

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      textTheme: textTheme,
      colorScheme: ColorScheme.light(
        primary: config.primaryColorValue,
        secondary: config.secondaryColorValue,
        surface: config.surfaceColorValue,
        error: Colors.red.shade700,
      ),
      scaffoldBackgroundColor: config.backgroundColorValue,
      appBarTheme: AppBarTheme(
        backgroundColor: config.surfaceColorValue,
        foregroundColor: config.textColorValue,
        elevation: 0,
        centerTitle: false,
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: config.surfaceColorValue,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(config.borderRadiusValue),
          side: BorderSide(color: Colors.grey.shade200),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: config.surfaceColorValue,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(config.borderRadiusValue),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(config.borderRadiusValue),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(config.borderRadiusValue),
          borderSide: BorderSide(color: config.primaryColorValue, width: 2),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: config.primaryColorValue,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(config.borderRadiusValue),
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: config.primaryColorValue,
          side: BorderSide(color: config.primaryColorValue),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(config.borderRadiusValue),
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: config.primaryColorValue,
        ),
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: config.primaryColorValue,
        foregroundColor: Colors.white,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: config.primaryColorValue.withValues(alpha: 0.1),
        labelStyle: TextStyle(color: config.primaryColorValue),
        secondaryLabelStyle: TextStyle(color: config.primaryColorValue),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: config.surfaceColorValue,
        selectedItemColor: config.primaryColorValue,
        unselectedItemColor: config.textSecondaryColorValue,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
    );
  }

  /// Generate dark theme from configuration
  ThemeData get darkTheme {
    if (!config.darkMode) {
      return lightTheme;
    }

    // Get the base dark theme first, then apply Google Font
    final baseTheme = ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
    );

    // Apply Google Font to the base text theme with white color for dark mode
    final fontTextTheme = _getTextTheme(baseTheme.textTheme);
    final textTheme = fontTextTheme.apply(
      bodyColor: Colors.white,
      displayColor: Colors.white,
    );

    debugPrint('🌙 Dark theme built with font: ${config.fontFamily}');

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      textTheme: textTheme,
      colorScheme: ColorScheme.dark(
        primary: config.accentColorValue,
        secondary: config.secondaryColorValue,
        surface: const Color(0xFF0E2A3B),
        error: Colors.red.shade400,
      ),
      scaffoldBackgroundColor: const Color(0xFF0A1A29),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF0E2A3B),
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: const Color(0xFF0E2A3B),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(config.borderRadiusValue),
          side: BorderSide(color: Colors.grey.shade800),
        ),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: const Color(0xFF0E2A3B),
        selectedItemColor: config.accentColorValue,
        unselectedItemColor: Colors.grey.shade500,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
    );
  }

  /// Get theme mode based on configuration
  ThemeMode get themeMode {
    if (config.darkMode) {
      return ThemeMode.system;
    }
    return ThemeMode.light;
  }
}
