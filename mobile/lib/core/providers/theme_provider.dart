import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Theme mode preference provider - Always light mode
final themeModeProvider = StateNotifierProvider<ThemeModeNotifier, ThemeMode>((ref) {
  return ThemeModeNotifier(ref);
});

class ThemeModeNotifier extends StateNotifier<ThemeMode> {
  final Ref ref;

  // Always use light mode
  ThemeModeNotifier(this.ref) : super(ThemeMode.light);

  Future<void> setThemeMode(ThemeMode mode) async {
    // Force light mode always
    state = ThemeMode.light;
    debugPrint('🎨 Theme forced to light mode');
  }
}
