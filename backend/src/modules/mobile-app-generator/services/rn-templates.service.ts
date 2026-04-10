import { Injectable } from '@nestjs/common';
import { MobileAppConfig, GeneratedFile, GenerationOptions } from '../interfaces/types';

@Injectable()
export class RNTemplatesService {
  /**
   * Generate package.json
   */
  generatePackageJson(config: MobileAppConfig): string {
    const appName = config.appName.toLowerCase().replace(/\s+/g, '-');
    const isDelivery = config.appType === 'delivery';

    return JSON.stringify(
      {
        name: appName,
        version: '1.0.0',
        private: true,
        scripts: {
          android: 'react-native run-android',
          ios: 'react-native run-ios',
          start: 'react-native start',
          test: 'jest',
          lint: 'eslint .',
          'pod-install': 'cd ios && pod install && cd ..',
        },
        dependencies: {
          react: '18.2.0',
          'react-native': '0.73.4',
          '@react-navigation/native': '^6.1.9',
          '@react-navigation/native-stack': '^6.9.17',
          '@react-navigation/bottom-tabs': '^6.5.11',
          '@react-navigation/drawer': '^6.6.6',
          'react-native-screens': '^3.29.0',
          'react-native-safe-area-context': '^4.8.2',
          'react-native-gesture-handler': '^2.14.1',
          'react-native-reanimated': '^3.6.2',
          '@tanstack/react-query': '^5.17.19',
          axios: '^1.6.7',
          'zustand': '^4.5.0',
          '@react-native-async-storage/async-storage': '^1.21.0',
          'react-native-vector-icons': '^10.0.3',
          'react-native-svg': '^14.1.0',
          'react-native-fast-image': '^8.6.3',
          'react-native-toast-message': '^2.2.0',
          'react-native-linear-gradient': '^2.8.3',
          'react-native-image-picker': '^7.1.0',
          ...(config.features.pushNotifications && {
            '@react-native-firebase/app': '^18.8.0',
            '@react-native-firebase/messaging': '^18.8.0',
          }),
          ...(config.features.biometricAuth && {
            'react-native-biometrics': '^3.0.1',
          }),
          ...(isDelivery && {
            'react-native-maps': '^1.10.3',
            '@react-native-community/geolocation': '^3.2.1',
            'react-native-maps-directions': '^1.9.0',
          }),
          'react-native-config': '^1.5.1',
          'react-native-haptic-feedback': '^2.2.0',
          'react-native-skeleton-placeholder': '^5.2.4',
          'date-fns': '^3.3.1',
        },
        devDependencies: {
          '@babel/core': '^7.23.9',
          '@babel/preset-env': '^7.23.9',
          '@babel/runtime': '^7.23.9',
          '@react-native/babel-preset': '^0.73.19',
          '@react-native/eslint-config': '^0.73.2',
          '@react-native/metro-config': '^0.73.3',
          '@react-native/typescript-config': '^0.73.1',
          '@types/react': '^18.2.48',
          '@types/react-native-vector-icons': '^6.4.18',
          'eslint': '^8.56.0',
          'prettier': '^3.2.4',
          'typescript': '^5.3.3',
          'jest': '^29.7.0',
          '@types/jest': '^29.5.12',
          'react-test-renderer': '18.2.0',
        },
      },
      null,
      2,
    );
  }

  /**
   * Generate tsconfig.json
   */
  generateTsConfig(): string {
    return JSON.stringify(
      {
        extends: '@react-native/typescript-config/tsconfig.json',
        compilerOptions: {
          strict: true,
          noImplicitAny: true,
          strictNullChecks: true,
          baseUrl: '.',
          paths: {
            '@/*': ['src/*'],
            '@components/*': ['src/components/*'],
            '@screens/*': ['src/screens/*'],
            '@navigation/*': ['src/navigation/*'],
            '@api/*': ['src/api/*'],
            '@hooks/*': ['src/hooks/*'],
            '@store/*': ['src/store/*'],
            '@theme/*': ['src/theme/*'],
            '@utils/*': ['src/utils/*'],
            '@types/*': ['src/types/*'],
          },
        },
      },
      null,
      2,
    );
  }

  /**
   * Generate babel.config.js
   */
  generateBabelConfig(): string {
    return `module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@navigation': './src/navigation',
          '@api': './src/api',
          '@hooks': './src/hooks',
          '@store': './src/store',
          '@theme': './src/theme',
          '@utils': './src/utils',
          '@types': './src/types',
        },
      },
    ],
  ],
};
`;
  }

  /**
   * Generate metro.config.js
   */
  generateMetroConfig(): string {
    return `const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
`;
  }

  /**
   * Generate app.json
   */
  generateAppJson(config: MobileAppConfig): string {
    const appName = config.appName.replace(/\s+/g, '');
    const displayName = config.appName;

    return JSON.stringify(
      {
        name: appName,
        displayName: displayName,
        expo: {
          name: displayName,
          slug: appName.toLowerCase(),
          version: '1.0.0',
          orientation: 'portrait',
          icon: config.appIcon || './assets/icon.png',
          userInterfaceStyle: config.features.darkMode ? 'automatic' : 'light',
          splash: {
            image: './assets/splash.png',
            resizeMode: 'contain',
            backgroundColor: config.splashScreen.backgroundColor,
          },
          ios: {
            supportsTablet: true,
            bundleIdentifier: `com.database.${appName.toLowerCase()}`,
          },
          android: {
            adaptiveIcon: {
              foregroundImage: './assets/adaptive-icon.png',
              backgroundColor: config.theme.primaryColor,
            },
            package: `com.database.${appName.toLowerCase()}`,
          },
        },
      },
      null,
      2,
    );
  }

  /**
   * Generate .env file
   */
  generateEnvFile(config: MobileAppConfig, options: GenerationOptions): string {
    const apiUrl = options.apiBaseUrl || config.apiBaseUrl || 'https://api.database.shop/api/v1';

    return `# API Configuration
API_BASE_URL=${apiUrl}
SHOP_ID=${config.shopId}

# App Configuration
APP_NAME=${config.appName}
APP_VERSION=1.0.0

# Feature Flags
ENABLE_DARK_MODE=${config.features.darkMode}
ENABLE_BIOMETRIC_AUTH=${config.features.biometricAuth}
ENABLE_PUSH_NOTIFICATIONS=${config.features.pushNotifications}
ENABLE_IN_APP_CHAT=${config.features.inAppChat}

# Firebase (if push notifications enabled)
# FIREBASE_API_KEY=
# FIREBASE_PROJECT_ID=

# Maps (for delivery app)
# GOOGLE_MAPS_API_KEY=
`;
  }

  /**
   * Generate .env.example
   */
  generateEnvExample(): string {
    return `# API Configuration
API_BASE_URL=https://api.database.shop/api/v1
SHOP_ID=your-shop-id

# App Configuration
APP_NAME=vasty Shop
APP_VERSION=1.0.0

# Feature Flags
ENABLE_DARK_MODE=true
ENABLE_BIOMETRIC_AUTH=true
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_IN_APP_CHAT=true

# Firebase (if push notifications enabled)
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_PROJECT_ID=your-firebase-project-id

# Maps (for delivery app)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
`;
  }

  /**
   * Generate App.tsx entry point
   */
  generateAppEntry(config: MobileAppConfig): GeneratedFile {
    const isDelivery = config.appType === 'delivery';

    return {
      path: 'src/App.tsx',
      type: 'config',
      content: `import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { ThemeProvider, useTheme } from '@theme/ThemeContext';
import { AuthProvider, useAuth } from '@store/AuthContext';
import { RootNavigator } from '@navigation/RootNavigator';
import { toastConfig } from '@components/Toast/toastConfig';
${config.features.pushNotifications ? "import { initializePushNotifications } from '@utils/notifications';" : ''}

// Ignore specific warnings in development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    ${config.features.pushNotifications ? `if (isAuthenticated) {
      initializePushNotifications();
    }` : '// Push notifications disabled'}
  }, [isAuthenticated]);

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <NavigationContainer
        theme={{
          dark: isDarkMode,
          colors: {
            primary: theme.colors.primary,
            background: theme.colors.background,
            card: theme.colors.surface,
            text: theme.colors.text,
            border: theme.colors.border,
            notification: theme.colors.accent,
          },
        }}
      >
        <RootNavigator />
      </NavigationContainer>
      <Toast config={toastConfig} />
    </>
  );
};

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
`,
    };
  }

  /**
   * Generate index.js
   */
  generateIndex(config: MobileAppConfig): GeneratedFile {
    const appName = config.appName.replace(/\s+/g, '');

    return {
      path: 'index.js',
      type: 'config',
      content: `import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
`,
    };
  }
}
