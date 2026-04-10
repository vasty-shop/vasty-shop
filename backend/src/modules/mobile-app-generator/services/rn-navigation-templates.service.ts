import { Injectable } from '@nestjs/common';
import { MobileAppConfig, GeneratedFile } from '../interfaces/types';

@Injectable()
export class RNNavigationTemplatesService {
  /**
   * Generate all navigation files
   */
  generateNavigationFiles(config: MobileAppConfig): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // Root Navigator
    files.push(this.generateRootNavigator(config));

    // Auth Navigator
    files.push(this.generateAuthNavigator(config));

    // Customer Tab Navigator
    if (config.appType === 'customer' || config.appType === 'both') {
      files.push(this.generateCustomerTabNavigator(config));
      files.push(this.generateCustomerStackNavigator(config));
    }

    // Delivery Tab Navigator
    if (config.appType === 'delivery' || config.appType === 'both') {
      files.push(this.generateDeliveryTabNavigator(config));
      files.push(this.generateDeliveryStackNavigator(config));
    }

    // Navigation Types
    files.push(this.generateNavigationTypes(config));

    // Navigation Index
    files.push(this.generateNavigationIndex(config));

    return files;
  }

  /**
   * Generate Root Navigator
   */
  private generateRootNavigator(config: MobileAppConfig): GeneratedFile {
    const isDelivery = config.appType === 'delivery';
    const isBoth = config.appType === 'both';

    return {
      path: 'src/navigation/RootNavigator.tsx',
      type: 'navigation',
      content: `import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '@store/AuthContext';
import { AuthNavigator } from './AuthNavigator';
${!isDelivery ? "import { CustomerTabNavigator } from './CustomerTabNavigator';" : ''}
${isDelivery || isBoth ? "import { DeliveryTabNavigator } from './DeliveryTabNavigator';" : ''}
import { SplashScreen } from '@screens/auth/SplashScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading${isBoth ? ', user' : ''} } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        ${isBoth ? `user?.role === 'delivery' ? (
          <Stack.Screen name="DeliveryMain" component={DeliveryTabNavigator} />
        ) : (
          <Stack.Screen name="CustomerMain" component={CustomerTabNavigator} />
        )` : isDelivery ? '<Stack.Screen name="DeliveryMain" component={DeliveryTabNavigator} />' : '<Stack.Screen name="CustomerMain" component={CustomerTabNavigator} />'}
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
`,
    };
  }

  /**
   * Generate Auth Navigator
   */
  private generateAuthNavigator(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/navigation/AuthNavigator.tsx',
      type: 'navigation',
      content: `import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '@screens/auth/LoginScreen';
import { SignupScreen } from '@screens/auth/SignupScreen';
import { ForgotPasswordScreen } from '@screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '@screens/auth/ResetPasswordScreen';
${config.features.onboarding ? "import { OnboardingScreen } from '@screens/auth/OnboardingScreen';" : ''}
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      ${config.features.onboarding ? 'initialRouteName="Onboarding"' : 'initialRouteName="Login"'}
    >
      ${config.features.onboarding ? '<Stack.Screen name="Onboarding" component={OnboardingScreen} />' : ''}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
`,
    };
  }

  /**
   * Generate Customer Tab Navigator
   */
  private generateCustomerTabNavigator(config: MobileAppConfig): GeneratedFile {
    const { navigation } = config;
    const tabStyle = navigation.tabBarStyle;

    return {
      path: 'src/navigation/CustomerTabNavigator.tsx',
      type: 'navigation',
      content: `import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '@theme/ThemeContext';
import { CustomerStackNavigator } from './CustomerStackNavigator';
import { CustomerTabParamList } from './types';

// Import screens for tabs
import { HomeScreen } from '@screens/customer/HomeScreen';
import { CategoriesScreen } from '@screens/customer/CategoriesScreen';
import { CartScreen } from '@screens/customer/CartScreen';
import { WishlistScreen } from '@screens/customer/WishlistScreen';
import { ProfileScreen } from '@screens/customer/ProfileScreen';

const Tab = createBottomTabNavigator<CustomerTabParamList>();

interface TabConfig {
  name: keyof CustomerTabParamList;
  icon: string;
  iconOutline: string;
  label: string;
  component: React.ComponentType<any>;
}

const TABS: TabConfig[] = [
  { name: 'HomeTab', icon: 'home', iconOutline: 'home-outline', label: 'Home', component: HomeScreen },
  { name: 'CategoriesTab', icon: 'view-grid', iconOutline: 'view-grid-outline', label: 'Categories', component: CategoriesScreen },
  { name: 'CartTab', icon: 'cart', iconOutline: 'cart-outline', label: 'Cart', component: CartScreen },
  { name: 'WishlistTab', icon: 'heart', iconOutline: 'heart-outline', label: 'Wishlist', component: WishlistScreen },
  { name: 'ProfileTab', icon: 'account', iconOutline: 'account-outline', label: 'Profile', component: ProfileScreen },
];

${tabStyle === 'floating' ? `
const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { theme } = useTheme();

  return (
    <View style={{
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 25,
      flexDirection: 'row',
      paddingVertical: 10,
      ...theme.shadows.lg,
    }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const tab = TABS[index];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={{ flex: 1, alignItems: 'center' }}
          >
            <Icon
              name={isFocused ? tab.icon : tab.iconOutline}
              size={24}
              color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text style={{
              fontSize: 10,
              marginTop: 4,
              color: isFocused ? theme.colors.primary : theme.colors.textSecondary,
              fontWeight: isFocused ? '600' : '400',
            }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
` : ''}

export const CustomerTabNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          ${tabStyle === 'minimal' ? 'borderTopWidth: 0,' : ''}
          ${tabStyle === 'elevated' ? `...theme.shadows.md,
          borderTopWidth: 0,` : ''}
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
      ${tabStyle === 'floating' ? 'tabBar={(props) => <CustomTabBar {...props} />}' : ''}
    >
      {TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: tab.label,
            tabBarIcon: ({ focused, color }) => (
              <Icon name={focused ? tab.icon : tab.iconOutline} size={24} color={color} />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default CustomerTabNavigator;
`,
    };
  }

  /**
   * Generate Customer Stack Navigator
   */
  private generateCustomerStackNavigator(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/navigation/CustomerStackNavigator.tsx',
      type: 'navigation',
      content: `import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '@theme/ThemeContext';

// Customer Screens
import { HomeScreen } from '@screens/customer/HomeScreen';
import { ProductsScreen } from '@screens/customer/ProductsScreen';
import { ProductDetailScreen } from '@screens/customer/ProductDetailScreen';
import { CategoriesScreen } from '@screens/customer/CategoriesScreen';
import { CartScreen } from '@screens/customer/CartScreen';
import { CheckoutScreen } from '@screens/customer/CheckoutScreen';
import { WishlistScreen } from '@screens/customer/WishlistScreen';
import { OrdersScreen } from '@screens/customer/OrdersScreen';
import { OrderDetailScreen } from '@screens/customer/OrderDetailScreen';
import { ProfileScreen } from '@screens/customer/ProfileScreen';
import { SettingsScreen } from '@screens/customer/SettingsScreen';
import { NotificationsScreen } from '@screens/customer/NotificationsScreen';
import { AddressesScreen } from '@screens/customer/AddressesScreen';
import { SearchScreen } from '@screens/customer/SearchScreen';

import { CustomerStackParamList } from './types';

const Stack = createNativeStackNavigator<CustomerStackParamList>();

export const CustomerStackNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Products" component={ProductsScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Addresses" component={AddressesScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
    </Stack.Navigator>
  );
};

export default CustomerStackNavigator;
`,
    };
  }

  /**
   * Generate Delivery Tab Navigator
   */
  private generateDeliveryTabNavigator(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/navigation/DeliveryTabNavigator.tsx',
      type: 'navigation',
      content: `import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '@theme/ThemeContext';
import { DeliveryTabParamList } from './types';

// Import screens for tabs
import { DashboardScreen } from '@screens/delivery/DashboardScreen';
import { ActiveDeliveriesScreen } from '@screens/delivery/ActiveDeliveriesScreen';
import { EarningsScreen } from '@screens/delivery/EarningsScreen';
import { DeliveryProfileScreen } from '@screens/delivery/DeliveryProfileScreen';

const Tab = createBottomTabNavigator<DeliveryTabParamList>();

interface TabConfig {
  name: keyof DeliveryTabParamList;
  icon: string;
  iconOutline: string;
  label: string;
  component: React.ComponentType<any>;
}

const TABS: TabConfig[] = [
  { name: 'DashboardTab', icon: 'view-dashboard', iconOutline: 'view-dashboard-outline', label: 'Dashboard', component: DashboardScreen },
  { name: 'DeliveriesTab', icon: 'package-variant', iconOutline: 'package-variant', label: 'Deliveries', component: ActiveDeliveriesScreen },
  { name: 'EarningsTab', icon: 'wallet', iconOutline: 'wallet-outline', label: 'Earnings', component: EarningsScreen },
  { name: 'ProfileTab', icon: 'account', iconOutline: 'account-outline', label: 'Profile', component: DeliveryProfileScreen },
];

export const DeliveryTabNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      {TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: tab.label,
            tabBarIcon: ({ focused, color }) => (
              <Icon name={focused ? tab.icon : tab.iconOutline} size={24} color={color} />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default DeliveryTabNavigator;
`,
    };
  }

  /**
   * Generate Delivery Stack Navigator
   */
  private generateDeliveryStackNavigator(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/navigation/DeliveryStackNavigator.tsx',
      type: 'navigation',
      content: `import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '@theme/ThemeContext';

// Delivery Screens
import { DashboardScreen } from '@screens/delivery/DashboardScreen';
import { ActiveDeliveriesScreen } from '@screens/delivery/ActiveDeliveriesScreen';
import { DeliveryDetailScreen } from '@screens/delivery/DeliveryDetailScreen';
import { DeliveryHistoryScreen } from '@screens/delivery/DeliveryHistoryScreen';
import { RouteMapScreen } from '@screens/delivery/RouteMapScreen';
import { EarningsScreen } from '@screens/delivery/EarningsScreen';
import { DeliveryProfileScreen } from '@screens/delivery/DeliveryProfileScreen';
import { DeliverySettingsScreen } from '@screens/delivery/DeliverySettingsScreen';
import { NotificationsScreen } from '@screens/customer/NotificationsScreen';

import { DeliveryStackParamList } from './types';

const Stack = createNativeStackNavigator<DeliveryStackParamList>();

export const DeliveryStackNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="ActiveDeliveries" component={ActiveDeliveriesScreen} />
      <Stack.Screen name="DeliveryDetail" component={DeliveryDetailScreen} />
      <Stack.Screen name="DeliveryHistory" component={DeliveryHistoryScreen} />
      <Stack.Screen name="RouteMap" component={RouteMapScreen} />
      <Stack.Screen name="Earnings" component={EarningsScreen} />
      <Stack.Screen name="DeliveryProfile" component={DeliveryProfileScreen} />
      <Stack.Screen name="DeliverySettings" component={DeliverySettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
};

export default DeliveryStackNavigator;
`,
    };
  }

  /**
   * Generate Navigation Types
   */
  private generateNavigationTypes(config: MobileAppConfig): GeneratedFile {
    const isDelivery = config.appType === 'delivery';
    const isCustomer = config.appType === 'customer';
    const isBoth = config.appType === 'both';

    return {
      path: 'src/navigation/types.ts',
      type: 'navigation',
      content: `import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  ${config.features.onboarding ? 'Onboarding: undefined;' : ''}
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

${!isDelivery ? `// Customer Tab Navigator
export type CustomerTabParamList = {
  HomeTab: undefined;
  CategoriesTab: undefined;
  CartTab: undefined;
  WishlistTab: undefined;
  ProfileTab: undefined;
};

// Customer Stack Navigator
export type CustomerStackParamList = {
  Home: undefined;
  Products: { categoryId?: string; title?: string; search?: string };
  ProductDetail: { id: string };
  Categories: undefined;
  Cart: undefined;
  Checkout: undefined;
  Wishlist: undefined;
  Orders: undefined;
  OrderDetail: { id: string };
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
  Addresses: undefined;
  Search: undefined;
};
` : ''}

${isDelivery || isBoth ? `// Delivery Tab Navigator
export type DeliveryTabParamList = {
  DashboardTab: undefined;
  DeliveriesTab: undefined;
  EarningsTab: undefined;
  ProfileTab: undefined;
};

// Delivery Stack Navigator
export type DeliveryStackParamList = {
  Dashboard: undefined;
  ActiveDeliveries: undefined;
  DeliveryDetail: { id: string };
  DeliveryHistory: undefined;
  RouteMap: { id: string };
  Earnings: undefined;
  DeliveryProfile: undefined;
  DeliverySettings: undefined;
  Notifications: undefined;
};
` : ''}

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  ${!isDelivery ? 'CustomerMain: NavigatorScreenParams<CustomerTabParamList>;' : ''}
  ${isDelivery || isBoth ? 'DeliveryMain: NavigatorScreenParams<DeliveryTabParamList>;' : ''}
};

// Type helpers for useNavigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
`,
    };
  }

  /**
   * Generate Navigation Index
   */
  private generateNavigationIndex(config: MobileAppConfig): GeneratedFile {
    const isDelivery = config.appType === 'delivery';
    const isBoth = config.appType === 'both';

    return {
      path: 'src/navigation/index.ts',
      type: 'navigation',
      content: `export { RootNavigator } from './RootNavigator';
export { AuthNavigator } from './AuthNavigator';
${!isDelivery ? "export { CustomerTabNavigator } from './CustomerTabNavigator';\nexport { CustomerStackNavigator } from './CustomerStackNavigator';" : ''}
${isDelivery || isBoth ? "export { DeliveryTabNavigator } from './DeliveryTabNavigator';\nexport { DeliveryStackNavigator } from './DeliveryStackNavigator';" : ''}
export * from './types';
`,
    };
  }
}
