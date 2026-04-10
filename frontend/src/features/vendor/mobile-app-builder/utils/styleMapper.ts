/**
 * Maps storefront styles to mobile app theme presets
 * Creates minimal mobile app configuration
 */

import { MOBILE_THEME_PRESETS } from '../constants';

/**
 * Style mapping from storefront (Modern, Minimal, Bold, etc.) to mobile themes
 */
const STYLE_TO_THEME_MAP: Record<string, string> = {
  'modern': 'modern-blue',
  'minimal': 'minimal-neutral',
  'bold': 'vibrant-pink',
  'elegant': 'elegant-dark',
  'playful': 'glassmorphism-purple',
  'professional': 'modern-blue',
};

/**
 * Create minimal unified mobile config from storefront style
 * Returns a simplified config structure with only theme, navigation, and features
 * Note: shopInfo is NOT included - backend always fetches fresh shop data
 */
export function createUnifiedMobileConfig(
  style: string,
  shopId: string,
  shopName: string
): Record<string, any> {
  // Get the corresponding mobile theme preset
  const themeId = STYLE_TO_THEME_MAP[style.toLowerCase()] || 'modern-blue';
  const themePreset = MOBILE_THEME_PRESETS.find(p => p.id === themeId) || MOBILE_THEME_PRESETS[0];

  // Return minimal config structure
  // Note: shopInfo is NOT included here - backend always fetches fresh shop data
  return {
    theme: {
      primaryColor: themePreset.theme.primaryColor,
      secondaryColor: themePreset.theme.secondaryColor,
      accentColor: themePreset.theme.accentColor,
      backgroundColor: themePreset.theme.backgroundColor,
      surfaceColor: themePreset.theme.surfaceColor,
      textColor: themePreset.theme.textColor,
      textSecondaryColor: themePreset.theme.textSecondaryColor,
      fontFamily: themePreset.theme.fontFamily,
      borderRadius: themePreset.theme.borderRadius,
      colorScheme: themePreset.theme.colorScheme,
      styleVariant: style.toLowerCase(), // Keep the original style selection (modern, minimal, bold, etc.)
      darkMode: false,
    },
    navigation: {
      type: 'bottom-tabs',
      style: 'default',
      showLabels: true,
      hapticFeedback: true,
    },
    features: {
      darkMode: true,
      pushNotifications: true,
      biometricAuth: true,
    },
  };
}
