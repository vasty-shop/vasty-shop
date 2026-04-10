import { Injectable } from '@nestjs/common';
import { MobileAppConfig, GeneratedFile } from '../interfaces/types';

@Injectable()
export class RNDeliveryTemplatesService {
  /**
   * Generate all delivery man app screens
   */
  generateDeliveryScreens(config: MobileAppConfig): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // Dashboard Screen
    files.push(this.generateDashboardScreen(config));

    // Active Deliveries Screen
    files.push(this.generateActiveDeliveriesScreen(config));

    // Delivery Detail Screen
    files.push(this.generateDeliveryDetailScreen(config));

    // Delivery History Screen
    files.push(this.generateDeliveryHistoryScreen(config));

    // Route Map Screen
    files.push(this.generateRouteMapScreen(config));

    // Earnings Screen
    files.push(this.generateEarningsScreen(config));

    // Profile Screen (Delivery)
    files.push(this.generateDeliveryProfileScreen(config));

    // Settings Screen (Delivery)
    files.push(this.generateDeliverySettingsScreen(config));

    // Availability Toggle Component
    files.push(this.generateAvailabilityToggle(config));

    return files;
  }

  /**
   * Generate Dashboard Screen
   */
  private generateDashboardScreen(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/screens/delivery/DashboardScreen.tsx',
      type: 'screen',
      content: `import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { deliveryManApi } from '@api/deliveryMan';
import { AvailabilityToggle } from '@components/delivery/AvailabilityToggle';
import { Theme } from '@theme/types';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = useStyles(createStyles);

  const {
    data: dashboard,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['delivery-dashboard'],
    queryFn: () => deliveryManApi.getDashboard(),
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const stats = [
    {
      icon: 'package-variant',
      label: 'Active',
      value: dashboard?.data?.activeDeliveries || 0,
      color: theme.colors.primary,
      onPress: () => navigation.navigate('ActiveDeliveries'),
    },
    {
      icon: 'check-circle',
      label: 'Completed',
      value: dashboard?.data?.completedToday || 0,
      color: theme.colors.success,
      onPress: () => navigation.navigate('DeliveryHistory'),
    },
    {
      icon: 'currency-usd',
      label: 'Earnings',
      value: \`\${dashboard?.data?.currency || '$'}\${dashboard?.data?.todayEarnings || 0}\`,
      color: theme.colors.accent,
      onPress: () => navigation.navigate('Earnings'),
    },
    {
      icon: 'star',
      label: 'Rating',
      value: dashboard?.data?.rating?.toFixed(1) || '0.0',
      color: theme.colors.warning,
      onPress: () => {},
    },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.name}>{dashboard?.data?.name || 'Driver'}</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Icon name="bell-outline" size={24} color={theme.colors.text} />
          {(dashboard?.data?.unreadNotifications || 0) > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {dashboard?.data?.unreadNotifications}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Availability Toggle */}
        <AvailabilityToggle />

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.statCard}
              onPress={stat.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.statIconContainer, { backgroundColor: stat.color + '20' }]}>
                <Icon name={stat.icon} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Active Deliveries Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Deliveries</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ActiveDeliveries')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {(dashboard?.data?.recentDeliveries || []).length === 0 ? (
            <View style={styles.emptyCard}>
              <Icon name="package-variant" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>No active deliveries</Text>
              <Text style={styles.emptySubtext}>New orders will appear here</Text>
            </View>
          ) : (
            dashboard?.data?.recentDeliveries?.slice(0, 3).map((delivery: any) => (
              <TouchableOpacity
                key={delivery.id}
                style={styles.deliveryCard}
                onPress={() => navigation.navigate('DeliveryDetail', { id: delivery.id })}
              >
                <View style={styles.deliveryHeader}>
                  <Text style={styles.orderId}>#{delivery.orderNumber}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(delivery.status, theme) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(delivery.status, theme) }]}>
                      {delivery.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.deliveryInfo}>
                  <Icon name="map-marker" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.deliveryAddress} numberOfLines={1}>
                    {delivery.deliveryAddress}
                  </Text>
                </View>
                <View style={styles.deliveryFooter}>
                  <Text style={styles.deliveryTime}>
                    <Icon name="clock-outline" size={14} color={theme.colors.textSecondary} />{' '}
                    {delivery.estimatedTime}
                  </Text>
                  <Text style={styles.deliveryAmount}>
                    {dashboard?.data?.currency || '$'}{delivery.total}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => navigation.navigate('Earnings')}
            >
              <Icon name="wallet" size={24} color={theme.colors.primary} />
              <Text style={styles.quickActionText}>Earnings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => navigation.navigate('DeliveryHistory')}
            >
              <Icon name="history" size={24} color={theme.colors.primary} />
              <Text style={styles.quickActionText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => navigation.navigate('DeliveryProfile')}
            >
              <Icon name="account" size={24} color={theme.colors.primary} />
              <Text style={styles.quickActionText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => navigation.navigate('DeliverySettings')}
            >
              <Icon name="cog" size={24} color={theme.colors.primary} />
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStatusColor = (status: string, theme: Theme) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return theme.colors.warning;
    case 'picked_up':
    case 'in_transit':
      return theme.colors.info;
    case 'delivered':
      return theme.colors.success;
    case 'cancelled':
      return theme.colors.error;
    default:
      return theme.colors.textSecondary;
  }
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  greeting: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  name: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  statCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    marginRight: '4%',
    ...theme.shadows.sm,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.typography.fontSize.xxl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
  },
  seeAllText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.medium,
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.medium,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  deliveryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  orderId: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
    textTransform: 'capitalize',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  deliveryAddress: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },
  deliveryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryTime: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  deliveryAmount: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.primary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  quickActionBtn: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
});

export default DashboardScreen;
`,
    };
  }

  /**
   * Generate Active Deliveries Screen
   */
  private generateActiveDeliveriesScreen(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/screens/delivery/ActiveDeliveriesScreen.tsx',
      type: 'screen',
      content: `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { deliveryManApi } from '@api/deliveryMan';
import { Theme } from '@theme/types';

type DeliveryStatus = 'pending' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered';

interface Delivery {
  id: string;
  orderNumber: string;
  status: DeliveryStatus;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  estimatedTime: string;
  distance: string;
  total: number;
  items: number;
  createdAt: string;
}

export const ActiveDeliveriesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = useStyles(createStyles);
  const queryClient = useQueryClient();

  const [selectedTab, setSelectedTab] = useState<'active' | 'pending'>('active');

  const {
    data: deliveries,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['active-deliveries', selectedTab],
    queryFn: () => deliveryManApi.getActiveDeliveries({ status: selectedTab }),
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => deliveryManApi.acceptDelivery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-dashboard'] });
      Toast.show({
        type: 'success',
        text1: 'Delivery Accepted',
        text2: 'Navigate to pickup location',
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to accept delivery',
      });
    },
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const renderDeliveryItem = ({ item }: { item: Delivery }) => (
    <TouchableOpacity
      style={styles.deliveryCard}
      onPress={() => navigation.navigate('DeliveryDetail', { id: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
          <Text style={styles.itemCount}>{item.items} items</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status, theme) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status, theme) }]}>
            {formatStatus(item.status)}
          </Text>
        </View>
      </View>

      {/* Pickup Location */}
      <View style={styles.locationRow}>
        <View style={styles.locationDot}>
          <View style={[styles.dot, { backgroundColor: theme.colors.success }]} />
        </View>
        <View style={styles.locationInfo}>
          <Text style={styles.locationLabel}>Pickup</Text>
          <Text style={styles.locationAddress} numberOfLines={1}>{item.pickupAddress}</Text>
        </View>
      </View>

      {/* Delivery Location */}
      <View style={styles.locationRow}>
        <View style={styles.locationDot}>
          <View style={[styles.dot, { backgroundColor: theme.colors.error }]} />
        </View>
        <View style={styles.locationInfo}>
          <Text style={styles.locationLabel}>Delivery</Text>
          <Text style={styles.locationAddress} numberOfLines={1}>{item.deliveryAddress}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerInfo}>
          <Icon name="clock-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.footerText}>{item.estimatedTime}</Text>
        </View>
        <View style={styles.footerInfo}>
          <Icon name="map-marker-distance" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.footerText}>{item.distance}</Text>
        </View>
        <Text style={styles.amount}>\${item.total.toFixed(2)}</Text>
      </View>

      {item.status === 'pending' && (
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => acceptMutation.mutate(item.id)}
          disabled={acceptMutation.isPending}
        >
          {acceptMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Icon name="check" size={20} color="#FFFFFF" />
              <Text style={styles.acceptButtonText}>Accept Delivery</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deliveries</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'active' && styles.activeTab]}
          onPress={() => setSelectedTab('active')}
        >
          <Text style={[styles.tabText, selectedTab === 'active' && styles.activeTabText]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'pending' && styles.activeTab]}
          onPress={() => setSelectedTab('pending')}
        >
          <Text style={[styles.tabText, selectedTab === 'pending' && styles.activeTabText]}>
            New Requests
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={deliveries?.data || []}
          renderItem={renderDeliveryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="package-variant" size={64} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Deliveries</Text>
              <Text style={styles.emptySubtitle}>
                {selectedTab === 'active'
                  ? 'You have no active deliveries right now'
                  : 'No new delivery requests available'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const getStatusColor = (status: string, theme: Theme) => {
  switch (status) {
    case 'pending':
      return theme.colors.warning;
    case 'accepted':
      return theme.colors.info;
    case 'picked_up':
    case 'in_transit':
      return theme.colors.primary;
    case 'delivered':
      return theme.colors.success;
    default:
      return theme.colors.textSecondary;
  }
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\\b\\w/g, (l) => l.toUpperCase());
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.medium,
  },
  activeTabText: {
    color: theme.colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  deliveryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  orderNumber: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
  },
  itemCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  locationDot: {
    width: 24,
    alignItems: 'center',
    paddingTop: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  locationInfo: {
    flex: 1,
    marginLeft: theme.spacing.xs,
  },
  locationLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  footerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  amount: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
    marginLeft: 'auto',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.success,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  acceptButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: '#FFFFFF',
    marginLeft: theme.spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});

export default ActiveDeliveriesScreen;
`,
    };
  }

  /**
   * Generate Delivery Detail Screen
   */
  private generateDeliveryDetailScreen(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/screens/delivery/DeliveryDetailScreen.tsx',
      type: 'screen',
      content: `import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { deliveryManApi } from '@api/deliveryMan';
import { Theme } from '@theme/types';

type RouteParams = {
  DeliveryDetail: { id: string };
};

const STATUS_FLOW = ['pending', 'accepted', 'picked_up', 'in_transit', 'delivered'];

export const DeliveryDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'DeliveryDetail'>>();
  const { theme } = useTheme();
  const styles = useStyles(createStyles);
  const queryClient = useQueryClient();

  const { id } = route.params;

  const { data: delivery, isLoading } = useQuery({
    queryKey: ['delivery-detail', id],
    queryFn: () => deliveryManApi.getDeliveryDetail(id),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => deliveryManApi.updateDeliveryStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['active-deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-dashboard'] });
      Toast.show({
        type: 'success',
        text1: 'Status Updated',
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update status',
      });
    },
  });

  const handleCall = (phone: string) => {
    Linking.openURL(\`tel:\${phone}\`);
  };

  const handleNavigate = (address: string) => {
    const url = \`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(address)}\`;
    Linking.openURL(url);
  };

  const handleUpdateStatus = () => {
    const currentIndex = STATUS_FLOW.indexOf(delivery?.data?.status);
    if (currentIndex < STATUS_FLOW.length - 1) {
      const nextStatus = STATUS_FLOW[currentIndex + 1];
      Alert.alert(
        'Update Status',
        \`Change status to "\${formatStatus(nextStatus)}"?\`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: () => updateStatusMutation.mutate(nextStatus),
          },
        ]
      );
    }
  };

  const getNextStatusLabel = () => {
    const currentIndex = STATUS_FLOW.indexOf(delivery?.data?.status);
    if (currentIndex < STATUS_FLOW.length - 1) {
      const nextStatus = STATUS_FLOW[currentIndex + 1];
      switch (nextStatus) {
        case 'accepted':
          return 'Accept Order';
        case 'picked_up':
          return 'Mark as Picked Up';
        case 'in_transit':
          return 'Start Delivery';
        case 'delivered':
          return 'Complete Delivery';
        default:
          return 'Update Status';
      }
    }
    return null;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const data = delivery?.data;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{data?.orderNumber}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('RouteMap', { id })}>
          <Icon name="map" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Status</Text>
          <View style={styles.timeline}>
            {STATUS_FLOW.map((status, index) => {
              const currentIndex = STATUS_FLOW.indexOf(data?.status);
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <View key={status} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineDot,
                        isCompleted && styles.timelineDotCompleted,
                        isCurrent && styles.timelineDotCurrent,
                      ]}
                    >
                      {isCompleted && <Icon name="check" size={12} color="#FFFFFF" />}
                    </View>
                    {index < STATUS_FLOW.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          isCompleted && styles.timelineLineCompleted,
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text
                      style={[
                        styles.timelineStatus,
                        isCompleted && styles.timelineStatusCompleted,
                      ]}
                    >
                      {formatStatus(status)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Icon name="account" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.cardText}>{data?.customerName}</Text>
            </View>
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() => handleCall(data?.customerPhone)}
            >
              <Icon name="phone" size={20} color={theme.colors.primary} />
              <Text style={[styles.cardText, { color: theme.colors.primary }]}>
                {data?.customerPhone}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pickup Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Location</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Icon name="store" size={20} color={theme.colors.success} />
              <Text style={styles.cardText}>{data?.storeName}</Text>
            </View>
            <View style={styles.cardRow}>
              <Icon name="map-marker" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.cardText}>{data?.pickupAddress}</Text>
            </View>
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={() => handleNavigate(data?.pickupAddress)}
            >
              <Icon name="navigation" size={18} color="#FFFFFF" />
              <Text style={styles.navigateButtonText}>Navigate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Delivery Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Location</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Icon name="map-marker" size={20} color={theme.colors.error} />
              <Text style={styles.cardText}>{data?.deliveryAddress}</Text>
            </View>
            {data?.deliveryNotes && (
              <View style={styles.cardRow}>
                <Icon name="note-text" size={20} color={theme.colors.textSecondary} />
                <Text style={styles.cardText}>{data?.deliveryNotes}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={() => handleNavigate(data?.deliveryAddress)}
            >
              <Icon name="navigation" size={18} color="#FFFFFF" />
              <Text style={styles.navigateButtonText}>Navigate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <View style={styles.card}>
            {data?.items?.map((item: any, index: number) => (
              <View
                key={index}
                style={[
                  styles.orderItem,
                  index < data.items.length - 1 && styles.orderItemBorder,
                ]}
              >
                <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>\${item.price.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.card}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>\${data?.subtotal?.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>\${data?.deliveryFee?.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>\${data?.total?.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Your Earnings</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                \${data?.earnings?.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Update Status Button */}
      {getNextStatusLabel() && (
        <View style={styles.bottomAction}>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdateStatus}
            disabled={updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.updateButtonText}>{getNextStatusLabel()}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\\b\\w/g, (l) => l.toUpperCase());
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
  },
  section: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  cardText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  navigateButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#FFFFFF',
    marginLeft: theme.spacing.xs,
  },
  timeline: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: theme.colors.success,
  },
  timelineDotCurrent: {
    backgroundColor: theme.colors.primary,
  },
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: theme.colors.border,
  },
  timelineLineCompleted: {
    backgroundColor: theme.colors.success,
  },
  timelineContent: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  timelineStatus: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  timelineStatusCompleted: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.medium,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  orderItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemQuantity: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.primary,
    width: 40,
  },
  itemName: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    flex: 1,
  },
  itemPrice: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.medium,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  updateButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: '#FFFFFF',
  },
});

export default DeliveryDetailScreen;
`,
    };
  }

  /**
   * Generate Delivery History Screen
   */
  private generateDeliveryHistoryScreen(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/screens/delivery/DeliveryHistoryScreen.tsx',
      type: 'screen',
      content: `import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useInfiniteQuery } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';

import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { deliveryManApi } from '@api/deliveryMan';
import { Theme } from '@theme/types';

type FilterType = 'all' | 'delivered' | 'cancelled';

export const DeliveryHistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = useStyles(createStyles);

  const [filter, setFilter] = useState<FilterType>('all');

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['delivery-history', filter],
    queryFn: ({ pageParam = 1 }) =>
      deliveryManApi.getDeliveryHistory({ page: pageParam, status: filter }),
    getNextPageParam: (lastPage) =>
      lastPage.data.hasMore ? lastPage.data.page + 1 : undefined,
    initialPageParam: 1,
  });

  const deliveries = data?.pages.flatMap((page) => page.data.items) || [];

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.deliveryCard}
      onPress={() => navigation.navigate('DeliveryDetail', { id: item.id })}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
          <Text style={styles.date}>
            {format(new Date(item.completedAt), 'MMM dd, yyyy • HH:mm')}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === 'delivered'
                  ? theme.colors.success + '20'
                  : theme.colors.error + '20',
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  item.status === 'delivered'
                    ? theme.colors.success
                    : theme.colors.error,
              },
            ]}
          >
            {item.status === 'delivered' ? 'Delivered' : 'Cancelled'}
          </Text>
        </View>
      </View>

      <View style={styles.addressRow}>
        <Icon name="map-marker" size={16} color={theme.colors.textSecondary} />
        <Text style={styles.address} numberOfLines={1}>
          {item.deliveryAddress}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.earnings}>
          Earned: <Text style={styles.earningsAmount}>\${item.earnings.toFixed(2)}</Text>
        </Text>
        <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === f.key && styles.filterChipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={deliveries}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[theme.colors.primary]}
            />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.primary}
                style={styles.loadingMore}
              />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="history" size={64} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>No History</Text>
              <Text style={styles.emptySubtitle}>
                Your completed deliveries will appear here
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.sm,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.medium,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  deliveryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  orderNumber: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
  },
  date: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  address: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  earnings: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  earningsAmount: {
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.success,
  },
  loadingMore: {
    paddingVertical: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});

export default DeliveryHistoryScreen;
`,
    };
  }

  /**
   * Generate Route Map Screen
   */
  private generateRouteMapScreen(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/screens/delivery/RouteMapScreen.tsx',
      type: 'screen',
      content: `import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { deliveryManApi } from '@api/deliveryMan';
import { Theme } from '@theme/types';

type RouteParams = {
  RouteMap: { id: string };
};

interface Location {
  latitude: number;
  longitude: number;
}

export const RouteMapScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'RouteMap'>>();
  const { theme } = useTheme();
  const styles = useStyles(createStyles);
  const mapRef = useRef<MapView>(null);

  const { id } = route.params;

  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  const { data: delivery, isLoading } = useQuery({
    queryKey: ['delivery-route', id],
    queryFn: () => deliveryManApi.getDeliveryRoute(id),
  });

  useEffect(() => {
    // Get current location
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => console.log('Location error:', error),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    if (delivery?.data && mapRef.current) {
      const coordinates = [
        delivery.data.pickupLocation,
        delivery.data.deliveryLocation,
      ];

      if (currentLocation) {
        coordinates.unshift(currentLocation);
      }

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
        animated: true,
      });
    }
  }, [delivery, currentLocation]);

  const openInMaps = (destination: Location) => {
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });
    const url = Platform.select({
      ios: \`\${scheme}?daddr=\${destination.latitude},\${destination.longitude}\`,
      android: \`\${scheme}\${destination.latitude},\${destination.longitude}?q=\${destination.latitude},\${destination.longitude}\`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const data = delivery?.data;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        showsMyLocationButton={false}
        initialRegion={{
          latitude: data?.pickupLocation?.latitude || 0,
          longitude: data?.pickupLocation?.longitude || 0,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Pickup Marker */}
        {data?.pickupLocation && (
          <Marker
            coordinate={data.pickupLocation}
            title="Pickup"
            description={data.pickupAddress}
          >
            <View style={[styles.markerContainer, { backgroundColor: theme.colors.success }]}>
              <Icon name="store" size={20} color="#FFFFFF" />
            </View>
          </Marker>
        )}

        {/* Delivery Marker */}
        {data?.deliveryLocation && (
          <Marker
            coordinate={data.deliveryLocation}
            title="Delivery"
            description={data.deliveryAddress}
          >
            <View style={[styles.markerContainer, { backgroundColor: theme.colors.error }]}>
              <Icon name="map-marker" size={20} color="#FFFFFF" />
            </View>
          </Marker>
        )}

        {/* Route Polyline */}
        {data?.routeCoordinates && (
          <Polyline
            coordinates={data.routeCoordinates}
            strokeColor={theme.colors.primary}
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom Card */}
      <View style={styles.bottomCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderNumber}>#{data?.orderNumber}</Text>
          <View style={styles.distanceTime}>
            <Icon name="clock-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.distanceText}>{data?.estimatedTime}</Text>
            <Icon name="map-marker-distance" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.distanceText}>{data?.distance}</Text>
          </View>
        </View>

        {/* Pickup */}
        <View style={styles.locationItem}>
          <View style={[styles.locationDot, { backgroundColor: theme.colors.success }]} />
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Pickup</Text>
            <Text style={styles.locationAddress} numberOfLines={1}>
              {data?.pickupAddress}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.navigateBtn}
            onPress={() => openInMaps(data?.pickupLocation)}
          >
            <Icon name="navigation" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Delivery */}
        <View style={styles.locationItem}>
          <View style={[styles.locationDot, { backgroundColor: theme.colors.error }]} />
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Delivery</Text>
            <Text style={styles.locationAddress} numberOfLines={1}>
              {data?.deliveryAddress}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.navigateBtn}
            onPress={() => openInMaps(data?.deliveryLocation)}
          >
            <Icon name="navigation" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Open in Maps Button */}
        <TouchableOpacity
          style={styles.openMapsButton}
          onPress={() => {
            const destination =
              data?.status === 'picked_up' || data?.status === 'in_transit'
                ? data?.deliveryLocation
                : data?.pickupLocation;
            if (destination) {
              openInMaps(destination);
            }
          }}
        >
          <Icon name="google-maps" size={20} color="#FFFFFF" />
          <Text style={styles.openMapsText}>Open in Maps</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  map: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.md,
    marginTop: theme.spacing.sm,
    ...theme.shadows.md,
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  orderNumber: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
  },
  distanceTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: 4,
    marginRight: theme.spacing.sm,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  locationInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  locationLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  locationAddress: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    marginTop: 2,
  },
  navigateBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  openMapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  openMapsText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: '#FFFFFF',
    marginLeft: theme.spacing.sm,
  },
});

export default RouteMapScreen;
`,
    };
  }

  /**
   * Generate Earnings Screen
   */
  private generateEarningsScreen(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/screens/delivery/EarningsScreen.tsx',
      type: 'screen',
      content: `import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { deliveryManApi } from '@api/deliveryMan';
import { Theme } from '@theme/types';

type Period = 'today' | 'week' | 'month';

export const EarningsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = useStyles(createStyles);

  const [period, setPeriod] = useState<Period>('today');

  const getDateRange = () => {
    const now = new Date();
    switch (period) {
      case 'today':
        return {
          startDate: format(now, 'yyyy-MM-dd'),
          endDate: format(now, 'yyyy-MM-dd'),
        };
      case 'week':
        return {
          startDate: format(startOfWeek(now), 'yyyy-MM-dd'),
          endDate: format(endOfWeek(now), 'yyyy-MM-dd'),
        };
      case 'month':
        return {
          startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
        };
    }
  };

  const {
    data: earnings,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['delivery-earnings', period],
    queryFn: () => deliveryManApi.getEarnings(getDateRange()),
  });

  const periods: { key: Period; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ];

  const data = earnings?.data;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Period Selector */}
      <View style={styles.periodContainer}>
        {periods.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[styles.periodButton, period === p.key && styles.periodButtonActive]}
            onPress={() => setPeriod(p.key)}
          >
            <Text style={[styles.periodText, period === p.key && styles.periodTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[theme.colors.primary]}
            />
          }
        >
          {/* Total Earnings Card */}
          <View style={styles.earningsCard}>
            <Text style={styles.earningsLabel}>Total Earnings</Text>
            <Text style={styles.earningsAmount}>
              {data?.currency || '$'}{data?.totalEarnings?.toFixed(2) || '0.00'}
            </Text>
            <View style={styles.earningsStats}>
              <View style={styles.earningStat}>
                <Text style={styles.statValue}>{data?.deliveriesCompleted || 0}</Text>
                <Text style={styles.statLabel}>Deliveries</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.earningStat}>
                <Text style={styles.statValue}>{data?.totalHours || 0}h</Text>
                <Text style={styles.statLabel}>Online</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.earningStat}>
                <Text style={styles.statValue}>
                  {data?.currency || '$'}{data?.avgPerDelivery?.toFixed(2) || '0.00'}
                </Text>
                <Text style={styles.statLabel}>Per Delivery</Text>
              </View>
            </View>
          </View>

          {/* Earnings Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Breakdown</Text>
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownRow}>
                <View style={styles.breakdownLeft}>
                  <View style={[styles.breakdownIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                    <Icon name="bike" size={20} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.breakdownLabel}>Delivery Fees</Text>
                </View>
                <Text style={styles.breakdownValue}>
                  {data?.currency || '$'}{data?.deliveryFees?.toFixed(2) || '0.00'}
                </Text>
              </View>

              <View style={styles.breakdownRow}>
                <View style={styles.breakdownLeft}>
                  <View style={[styles.breakdownIcon, { backgroundColor: theme.colors.success + '20' }]}>
                    <Icon name="cash" size={20} color={theme.colors.success} />
                  </View>
                  <Text style={styles.breakdownLabel}>Tips</Text>
                </View>
                <Text style={styles.breakdownValue}>
                  {data?.currency || '$'}{data?.tips?.toFixed(2) || '0.00'}
                </Text>
              </View>

              <View style={styles.breakdownRow}>
                <View style={styles.breakdownLeft}>
                  <View style={[styles.breakdownIcon, { backgroundColor: theme.colors.accent + '20' }]}>
                    <Icon name="gift" size={20} color={theme.colors.accent} />
                  </View>
                  <Text style={styles.breakdownLabel}>Bonuses</Text>
                </View>
                <Text style={styles.breakdownValue}>
                  {data?.currency || '$'}{data?.bonuses?.toFixed(2) || '0.00'}
                </Text>
              </View>
            </View>
          </View>

          {/* Recent Transactions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {(data?.recentTransactions || []).length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No transactions for this period</Text>
              </View>
            ) : (
              <View style={styles.transactionsCard}>
                {data?.recentTransactions?.map((transaction: any, index: number) => (
                  <View
                    key={transaction.id}
                    style={[
                      styles.transactionRow,
                      index < data.recentTransactions.length - 1 && styles.transactionBorder,
                    ]}
                  >
                    <View style={styles.transactionLeft}>
                      <Text style={styles.transactionTitle}>
                        Order #{transaction.orderNumber}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {format(new Date(transaction.date), 'MMM dd, HH:mm')}
                      </Text>
                    </View>
                    <Text style={styles.transactionAmount}>
                      +{data?.currency || '$'}{transaction.amount.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={{ height: theme.spacing.xl }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
  },
  periodContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  periodButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: 4,
    borderRadius: theme.borderRadius.md,
  },
  periodButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  periodText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.medium,
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  earningsCard: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  earningsAmount: {
    fontSize: 40,
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
    marginVertical: theme.spacing.sm,
  },
  earningsStats: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
  },
  earningStat: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  statValue: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  section: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  breakdownCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  breakdownValue: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
  },
  transactionsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  transactionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.medium,
  },
  transactionDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.success,
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});

export default EarningsScreen;
`,
    };
  }

  /**
   * Generate Delivery Profile Screen
   */
  private generateDeliveryProfileScreen(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/screens/delivery/DeliveryProfileScreen.tsx',
      type: 'screen',
      content: `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { deliveryManApi } from '@api/deliveryMan';
import { useAuth } from '@store/AuthContext';
import { Theme } from '@theme/types';

export const DeliveryProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = useStyles(createStyles);
  const { logout } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['delivery-profile'],
    queryFn: () => deliveryManApi.getProfile(),
  });

  const menuItems = [
    {
      icon: 'account-edit',
      label: 'Edit Profile',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      icon: 'file-document',
      label: 'Documents',
      onPress: () => navigation.navigate('Documents'),
    },
    {
      icon: 'car',
      label: 'Vehicle Info',
      onPress: () => navigation.navigate('VehicleInfo'),
    },
    {
      icon: 'bank',
      label: 'Bank Account',
      onPress: () => navigation.navigate('BankAccount'),
    },
    {
      icon: 'history',
      label: 'Delivery History',
      onPress: () => navigation.navigate('DeliveryHistory'),
    },
    {
      icon: 'wallet',
      label: 'Earnings',
      onPress: () => navigation.navigate('Earnings'),
    },
    {
      icon: 'cog',
      label: 'Settings',
      onPress: () => navigation.navigate('DeliverySettings'),
    },
    {
      icon: 'help-circle',
      label: 'Help & Support',
      onPress: () => navigation.navigate('Support'),
    },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const data = profile?.data;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {data?.avatar ? (
              <Image source={{ uri: data.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name="account" size={40} color={theme.colors.textSecondary} />
              </View>
            )}
            <View style={[styles.statusIndicator, { backgroundColor: data?.isOnline ? theme.colors.success : theme.colors.textSecondary }]} />
          </View>
          <Text style={styles.name}>{data?.name}</Text>
          <Text style={styles.email}>{data?.email}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="star" size={20} color={theme.colors.warning} />
              <Text style={styles.statValue}>{data?.rating?.toFixed(1) || '0.0'}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Icon name="check-circle" size={20} color={theme.colors.success} />
              <Text style={styles.statValue}>{data?.totalDeliveries || 0}</Text>
              <Text style={styles.statLabel}>Deliveries</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Icon name="clock-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.statValue}>{data?.memberSince || 'New'}</Text>
              <Text style={styles.statLabel}>Member</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuLeft}>
                <Icon name={item.icon} size={22} color={theme.colors.text} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Icon name="chevron-right" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Icon name="logout" size={22} color={theme.colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: theme.spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
  },
  profileCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  name: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
  },
  email: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  statValue: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  menuContainer: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.error + '10',
    borderRadius: theme.borderRadius.md,
  },
  logoutText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
  },
});

export default DeliveryProfileScreen;
`,
    };
  }

  /**
   * Generate Delivery Settings Screen
   */
  private generateDeliverySettingsScreen(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/screens/delivery/DeliverySettingsScreen.tsx',
      type: 'screen',
      content: `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { Theme } from '@theme/types';

export const DeliverySettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const styles = useStyles(createStyles);

  const [notifications, setNotifications] = React.useState(true);
  const [sounds, setSounds] = React.useState(true);
  const [vibration, setVibration] = React.useState(true);
  const [autoAccept, setAutoAccept] = React.useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="bell" size={22} color={theme.colors.text} />
                <Text style={styles.settingLabel}>Push Notifications</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }}
                thumbColor={notifications ? theme.colors.primary : theme.colors.textSecondary}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="volume-high" size={22} color={theme.colors.text} />
                <Text style={styles.settingLabel}>Sound</Text>
              </View>
              <Switch
                value={sounds}
                onValueChange={setSounds}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }}
                thumbColor={sounds ? theme.colors.primary : theme.colors.textSecondary}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="vibrate" size={22} color={theme.colors.text} />
                <Text style={styles.settingLabel}>Vibration</Text>
              </View>
              <Switch
                value={vibration}
                onValueChange={setVibration}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }}
                thumbColor={vibration ? theme.colors.primary : theme.colors.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* Delivery Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="check-circle" size={22} color={theme.colors.text} />
                <View>
                  <Text style={styles.settingLabel}>Auto Accept</Text>
                  <Text style={styles.settingDescription}>
                    Automatically accept new delivery requests
                  </Text>
                </View>
              </View>
              <Switch
                value={autoAccept}
                onValueChange={setAutoAccept}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }}
                thumbColor={autoAccept ? theme.colors.primary : theme.colors.textSecondary}
              />
            </View>

            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="map-marker-radius" size={22} color={theme.colors.text} />
                <Text style={styles.settingLabel}>Delivery Radius</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>10 km</Text>
                <Icon name="chevron-right" size={22} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon
                  name={isDarkMode ? 'weather-night' : 'weather-sunny'}
                  size={22}
                  color={theme.colors.text}
                />
                <Text style={styles.settingLabel}>Dark Mode</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }}
                thumbColor={isDarkMode ? theme.colors.primary : theme.colors.textSecondary}
              />
            </View>

            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="translate" size={22} color={theme.colors.text} />
                <Text style={styles.settingLabel}>Language</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>English</Text>
                <Icon name="chevron-right" size={22} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="file-document" size={22} color={theme.colors.text} />
                <Text style={styles.settingLabel}>Terms of Service</Text>
              </View>
              <Icon name="chevron-right" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="shield-check" size={22} color={theme.colors.text} />
                <Text style={styles.settingLabel}>Privacy Policy</Text>
              </View>
              <Icon name="chevron-right" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="information" size={22} color={theme.colors.text} />
                <Text style={styles.settingLabel}>App Version</Text>
              </View>
              <Text style={styles.settingValue}>1.0.0</Text>
            </View>
          </View>
        </View>

        <View style={{ height: theme.spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
  },
  section: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  settingDescription: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.md,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.xs,
  },
});

export default DeliverySettingsScreen;
`,
    };
  }

  /**
   * Generate Availability Toggle Component
   */
  private generateAvailabilityToggle(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/components/delivery/AvailabilityToggle.tsx',
      type: 'component',
      content: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { deliveryManApi } from '@api/deliveryMan';
import { Theme } from '@theme/types';

interface AvailabilityToggleProps {
  initialStatus?: boolean;
}

export const AvailabilityToggle: React.FC<AvailabilityToggleProps> = ({
  initialStatus = false,
}) => {
  const { theme } = useTheme();
  const styles = useStyles(createStyles);
  const queryClient = useQueryClient();

  const [isOnline, setIsOnline] = useState(initialStatus);

  const toggleMutation = useMutation({
    mutationFn: (status: boolean) => deliveryManApi.updateAvailability(status),
    onSuccess: (_, status) => {
      setIsOnline(status);
      queryClient.invalidateQueries({ queryKey: ['delivery-dashboard'] });
      Toast.show({
        type: 'success',
        text1: status ? 'You are now online' : 'You are now offline',
        text2: status ? 'You will receive delivery requests' : 'You won\\'t receive new requests',
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update availability',
      });
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          isOnline ? styles.toggleOnline : styles.toggleOffline,
        ]}
        onPress={() => toggleMutation.mutate(!isOnline)}
        disabled={toggleMutation.isPending}
        activeOpacity={0.8}
      >
        {toggleMutation.isPending ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Icon
              name={isOnline ? 'power' : 'power-off'}
              size={24}
              color="#FFFFFF"
            />
            <View style={styles.toggleContent}>
              <Text style={styles.toggleStatus}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
              <Text style={styles.toggleHint}>
                {isOnline ? 'Tap to go offline' : 'Tap to go online'}
              </Text>
            </View>
            <View style={[styles.indicator, isOnline && styles.indicatorOnline]} />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  toggleOnline: {
    backgroundColor: theme.colors.success,
  },
  toggleOffline: {
    backgroundColor: theme.colors.textSecondary,
  },
  toggleContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  toggleStatus: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: '#FFFFFF',
  },
  toggleHint: {
    fontSize: theme.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorOnline: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});

export default AvailabilityToggle;
`,
    };
  }
}
