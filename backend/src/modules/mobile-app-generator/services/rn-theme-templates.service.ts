import { Injectable } from '@nestjs/common';
import { MobileAppConfig, GeneratedFile } from '../interfaces/types';

@Injectable()
export class RNThemeTemplatesService {
  /**
   * Generate all theme-related files
   */
  generateThemeFiles(config: MobileAppConfig): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // Theme Context
    files.push(this.generateThemeContext(config));

    // Theme types
    files.push(this.generateThemeTypes(config));

    // Theme constants
    files.push(this.generateThemeConstants(config));

    // Theme index
    files.push(this.generateThemeIndex());

    // Styled components helpers
    files.push(this.generateStyledHelpers(config));

    return files;
  }

  /**
   * Generate Theme Context
   */
  private generateThemeContext(config: MobileAppConfig): GeneratedFile {
    const { theme } = config;

    return {
      path: 'src/theme/ThemeContext.tsx',
      type: 'theme',
      content: `import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeColors, lightColors, darkColors, createTheme } from './constants';

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(${config.features.darkMode ? 'systemColorScheme === "dark"' : 'false'});

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    };
    loadThemePreference();
  }, []);

  ${config.features.darkMode ? `
  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Only update if user hasn't set a preference
      AsyncStorage.getItem(THEME_STORAGE_KEY).then((savedTheme) => {
        if (savedTheme === null) {
          setIsDarkMode(colorScheme === 'dark');
        }
      });
    });
    return () => subscription.remove();
  }, []);` : ''}

  const toggleTheme = async () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, newValue ? 'dark' : 'light');
  };

  const setDarkModeValue = async (value: boolean) => {
    setIsDarkMode(value);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, value ? 'dark' : 'light');
  };

  const theme = useMemo(() => {
    const colors = isDarkMode ? darkColors : lightColors;
    return createTheme(colors, isDarkMode);
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode,
        toggleTheme,
        setDarkMode: setDarkModeValue,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
`,
    };
  }

  /**
   * Generate Theme Types
   */
  private generateThemeTypes(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/theme/types.ts',
      type: 'theme',
      content: `export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  // Semantic colors
  card: string;
  input: string;
  placeholder: string;
  disabled: string;
  overlay: string;
  shadow: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeBorderRadius {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface ThemeTypography {
  fontFamily: {
    regular: string;
    medium: string;
    semiBold: string;
    bold: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface ThemeShadows {
  sm: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  md: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  lg: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  typography: ThemeTypography;
  shadows: ThemeShadows;
  isDark: boolean;
}

export type DesignVariant =
  | 'modern'
  | 'minimal'
  | 'glassmorphism'
  | 'neumorphism'
  | 'vibrant'
  | 'elegant';
`,
    };
  }

  /**
   * Generate Theme Constants
   */
  private generateThemeConstants(config: MobileAppConfig): GeneratedFile {
    const { theme } = config;
    const borderRadiusMap = {
      none: '0',
      small: '4',
      medium: '8',
      large: '16',
      full: '999',
    };
    const borderRadius = borderRadiusMap[theme.borderRadius] || '8';

    return {
      path: 'src/theme/constants.ts',
      type: 'theme',
      content: `import { Theme, ThemeColors, ThemeSpacing, ThemeBorderRadius, ThemeTypography, ThemeShadows } from './types';

// Light theme colors (from mobile app config)
export const lightColors: ThemeColors = {
  primary: '${theme.primaryColor}',
  secondary: '${theme.secondaryColor}',
  accent: '${theme.accentColor}',
  background: '${theme.backgroundColor}',
  surface: '${theme.surfaceColor}',
  text: '${theme.textColor}',
  textSecondary: '${theme.textSecondaryColor}',
  border: '#E2E8F0',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  card: '${theme.surfaceColor}',
  input: '#F8FAFC',
  placeholder: '#94A3B8',
  disabled: '#CBD5E1',
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: '#000000',
};

// Dark theme colors
export const darkColors: ThemeColors = {
  primary: '${theme.primaryColor}',
  secondary: '${theme.secondaryColor}',
  accent: '${theme.accentColor}',
  background: '#0F172A',
  surface: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#334155',
  error: '#F87171',
  success: '#34D399',
  warning: '#FBBF24',
  info: '#60A5FA',
  card: '#1E293B',
  input: '#334155',
  placeholder: '#64748B',
  disabled: '#475569',
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: '#000000',
};

// Spacing scale
export const spacing: ThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const borderRadius: ThemeBorderRadius = {
  none: 0,
  sm: 4,
  md: ${borderRadius},
  lg: 16,
  xl: 24,
  full: 9999,
};

// Typography
export const typography: ThemeTypography = {
  fontFamily: {
    regular: '${theme.fontFamily}',
    medium: '${theme.fontFamily}-Medium',
    semiBold: '${theme.fontFamily}-SemiBold',
    bold: '${theme.fontFamily}-Bold',
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Shadow styles
const createShadows = (isDark: boolean): ThemeShadows => ({
  sm: {
    shadowColor: isDark ? '#000' : '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: isDark ? '#000' : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.4 : 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: isDark ? '#000' : '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.5 : 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});

// Create complete theme object
export const createTheme = (colors: ThemeColors, isDark: boolean): Theme => ({
  colors,
  spacing,
  borderRadius,
  typography,
  shadows: createShadows(isDark),
  isDark,
});

// Default themes
export const lightTheme = createTheme(lightColors, false);
export const darkTheme = createTheme(darkColors, true);

// Design variant: ${theme.designVariant}
export const DESIGN_VARIANT = '${theme.designVariant}';

// Component-specific styles based on design variant
export const getVariantStyles = (variant: string) => {
  switch (variant) {
    case 'glassmorphism':
      return {
        card: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
        },
      };
    case 'neumorphism':
      return {
        card: {
          backgroundColor: lightColors.background,
          shadowColor: '#BEBEBE',
          shadowOffset: { width: 5, height: 5 },
          shadowOpacity: 1,
          shadowRadius: 10,
        },
      };
    case 'vibrant':
      return {
        card: {
          borderWidth: 2,
          borderColor: lightColors.primary,
        },
      };
    case 'elegant':
      return {
        card: {
          borderWidth: 1,
          borderColor: lightColors.border,
        },
      };
    case 'minimal':
      return {
        card: {
          borderWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
      };
    default: // modern
      return {
        card: {},
      };
  }
};
`,
    };
  }

  /**
   * Generate Theme Index
   */
  private generateThemeIndex(): GeneratedFile {
    return {
      path: 'src/theme/index.ts',
      type: 'theme',
      content: `export { ThemeProvider, useTheme } from './ThemeContext';
export type { Theme, ThemeColors, ThemeSpacing, ThemeBorderRadius, ThemeTypography, ThemeShadows, DesignVariant } from './types';
export {
  lightColors,
  darkColors,
  spacing,
  borderRadius,
  typography,
  createTheme,
  lightTheme,
  darkTheme,
  DESIGN_VARIANT,
  getVariantStyles,
} from './constants';
export { useStyles, createStyles } from './styled';
`,
    };
  }

  /**
   * Generate Styled Helpers
   */
  private generateStyledHelpers(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/theme/styled.ts',
      type: 'theme',
      content: `import { useMemo } from 'react';
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { useTheme } from './ThemeContext';
import { Theme } from './types';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };
type StyleCreator<T extends NamedStyles<T>> = (theme: Theme) => T;

/**
 * Hook to create theme-aware styles
 * @example
 * const styles = useStyles((theme) => ({
 *   container: {
 *     backgroundColor: theme.colors.background,
 *     padding: theme.spacing.md,
 *   },
 * }));
 */
export function useStyles<T extends NamedStyles<T>>(styleCreator: StyleCreator<T>): T {
  const { theme } = useTheme();

  return useMemo(() => {
    return StyleSheet.create(styleCreator(theme));
  }, [theme, styleCreator]);
}

/**
 * Create static styles with theme access
 * Use for styles that don't need to respond to theme changes
 */
export function createStyles<T extends NamedStyles<T>>(styleCreator: StyleCreator<T>) {
  return (theme: Theme): T => {
    return StyleSheet.create(styleCreator(theme)) as T;
  };
}

/**
 * Common style utilities
 */
export const styleUtils = {
  // Center content
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  // Row layout
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  // Row with space between
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,

  // Fill container
  fill: {
    flex: 1,
  } as ViewStyle,

  // Full width
  fullWidth: {
    width: '100%',
  } as ViewStyle,

  // Absolute fill
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  } as ViewStyle,
};

/**
 * Get responsive font size
 */
export const responsiveFontSize = (size: number, factor = 0.5): number => {
  // This can be enhanced with Dimensions for more sophisticated scaling
  return size;
};
`,
    };
  }
}
