import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../orders/presentation/providers/delivery_orders_provider.dart';
import '../../../orders/presentation/pages/order_detail_page.dart';
import '../../../orders/data/models/delivery_order_model.dart';
import '../../../earnings/presentation/pages/earnings_page.dart';
import '../../../earnings/presentation/providers/earnings_provider.dart';
import '../../../history/presentation/pages/history_page.dart';
import '../../../profile/presentation/pages/delivery_profile_page.dart';
import '../../../settings/presentation/pages/delivery_settings_page.dart';
import '../../../reviews/presentation/pages/delivery_reviews_page.dart';
import '../../../zones/presentation/pages/delivery_zones_page.dart';
import '../../../../auth/presentation/providers/auth_provider.dart';
import '../../../../auth/presentation/pages/login_page.dart';
import '../../../notifications/presentation/widgets/delivery_notification_bell.dart';

import 'package:easy_localization/easy_localization.dart';class DeliveryHomePage extends ConsumerStatefulWidget {
  const DeliveryHomePage({super.key});

  @override
  ConsumerState<DeliveryHomePage> createState() => _DeliveryHomePageState();
}

class _DeliveryHomePageState extends ConsumerState<DeliveryHomePage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _selectedIndex = 0;
  String? _processingOrderId;
  String _availabilityStatus = 'ONLINE'; // ONLINE, OFFLINE, ON_DELIVERY
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(_onTabChanged);

    // Load orders on init
    Future.microtask(() {
      ref.read(deliveryOrdersProvider.notifier).loadOrders(refresh: true);
    });
  }

  void _onTabChanged() {
    if (_tabController.indexIsChanging) return;
    setState(() {});
  }

  @override
  void dispose() {
    _tabController.removeListener(_onTabChanged);
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _onBottomNavTap(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  String _getAppBarTitle() {
    switch (_selectedIndex) {
      case 0:
        return 'delivery.dashboard'.tr();
      case 1:
        return 'delivery.earnings.title'.tr();
      case 2:
        return 'delivery.history.title'.tr();
      case 3:
        return 'delivery.orders.title'.tr();
      default:
        return 'delivery.dashboard'.tr();
    }
  }

  Widget _getBody(BuildContext context, ThemeData theme) {
    switch (_selectedIndex) {
      case 0:
        return _buildDashboard(context, theme);
      case 1:
        return const EarningsPage();
      case 2:
        return const HistoryPage();
      case 3:
        return _buildOrdersView(context, theme);
      default:
        return _buildDashboard(context, theme);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      drawer: _buildDrawer(context),
      appBar: AppBar(
        backgroundColor: theme.appBarTheme.backgroundColor,
        elevation: 0,
        title: Text(
          _getAppBarTitle(),
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: theme.appBarTheme.foregroundColor,
          ),
        ),
        actions: [
          // Refresh Button (only show on Dashboard and Orders tabs)
          if (_selectedIndex == 0 || _selectedIndex == 3)
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: () async {
                await Future.wait([
                  ref.read(deliveryOrdersProvider.notifier).refresh(),
                  ref.read(earningsProvider.notifier).refresh(),
                ]);
              },
              tooltip: 'delivery.refreshData'.tr(),
            ),
          // Availability Toggle
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
            child: _buildAvailabilityToggle(theme),
          ),
          // Notifications
          const DeliveryNotificationBell(),
        ],
      ),
      body: _getBody(context, theme),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onBottomNavTap,
        selectedItemColor: theme.colorScheme.primary,
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        items: [
          BottomNavigationBarItem(
            icon: const Icon(Icons.dashboard),
            label: 'delivery.dashboard'.tr(),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.account_balance_wallet),
            label: 'delivery.earnings.title'.tr(),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.history),
            label: 'delivery.history.title'.tr(),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.delivery_dining),
            label: 'delivery.orders.title'.tr(),
          ),
        ],
      ),
    );
  }

  Widget _buildOrdersView(BuildContext context, ThemeData theme) {
    return Column(
      children: [
        // Search Bar
        Container(
          color: theme.colorScheme.surface,
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
          child: TextField(
            controller: _searchController,
            onChanged: (value) {
              setState(() {
                _searchQuery = value;
              });
            },
            decoration: InputDecoration(
              hintText: 'delivery.orders.searchOrders'.tr(),
              hintStyle: TextStyle(color: theme.hintColor),
              prefixIcon: Icon(Icons.search, color: theme.hintColor),
              suffixIcon: _searchQuery.isNotEmpty
                  ? IconButton(
                      icon: Icon(Icons.clear, color: theme.hintColor),
                      onPressed: () {
                        setState(() {
                          _searchController.clear();
                          _searchQuery = '';
                        });
                      },
                    )
                  : null,
              filled: true,
              fillColor: theme.colorScheme.surfaceContainerHighest,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
          ),
        ),
        // Segmented Control Tabs (like frontend)
        Container(
          color: theme.colorScheme.surface,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Consumer(
            builder: (context, ref, child) {
              final ordersState = ref.watch(deliveryOrdersProvider);
              final totalCount = ordersState.orders.length;
              final activeCount = ordersState.activeOrders.length;

              return Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    // All Tab
                    Expanded(
                      child: _buildSegmentedTab(
                        theme: theme,
                        label: 'delivery.orders.all'.tr(),
                        count: totalCount,
                        isSelected: _tabController.index == 0,
                        onTap: () {
                          _tabController.animateTo(0);
                          ref.read(deliveryOrdersProvider.notifier).filterByStatus(null);
                        },
                      ),
                    ),
                    const SizedBox(width: 4),
                    // Active Tab
                    Expanded(
                      child: _buildSegmentedTab(
                        theme: theme,
                        label: 'delivery.orders.activeFilter'.tr(),
                        count: activeCount,
                        isSelected: _tabController.index == 1,
                        showBadge: activeCount > 0,
                        badgeColor: Colors.blue,
                        onTap: () {
                          _tabController.animateTo(1);
                          ref.read(deliveryOrdersProvider.notifier).filterByStatus('assigned,accepted,picked_up,on_the_way');
                        },
                      ),
                    ),
                    const SizedBox(width: 4),
                    // Completed Tab
                    Expanded(
                      child: _buildSegmentedTab(
                        theme: theme,
                        label: 'delivery.orders.completedFilter'.tr(),
                        isSelected: _tabController.index == 2,
                        onTap: () {
                          _tabController.animateTo(2);
                          ref.read(deliveryOrdersProvider.notifier).filterByStatus('delivered,cancelled');
                        },
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
        Expanded(
          child: RefreshIndicator(
            onRefresh: () async {
              await ref.read(deliveryOrdersProvider.notifier).refresh();
            },
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildOrdersList(context, theme, 'all'),
                _buildOrdersList(context, theme, 'active'),
                _buildOrdersList(context, theme, 'completed'),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDashboard(BuildContext context, ThemeData theme) {
    final ordersState = ref.watch(deliveryOrdersProvider);
    final earningsState = ref.watch(earningsProvider);
    final user = ref.watch(authProvider).user;

    // Load earnings if not loaded
    if (earningsState.earnings == null && !earningsState.isLoading) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(earningsProvider.notifier).loadEarnings();
      });
    }

    // Calculate stats
    final pendingOrders = ordersState.pendingOrders;
    final activeOrders = ordersState.activeOrders;
    final allOrders = ordersState.orders;
    final earnings = earningsState.earnings;

    final today = DateTime.now();
    final todayStart = DateTime(today.year, today.month, today.day);

    final todayDeliveries = earnings?.todayDeliveries ?? allOrders.where((order) {
      if (order.deliveredAt == null) return false;
      final deliveredDate = DateTime.parse(order.deliveredAt!);
      return deliveredDate.isAfter(todayStart);
    }).length;

    final weekDeliveries = earnings?.weekDeliveries ?? 0;
    final todayEarnings = earnings?.todayEarnings ?? 0.0;
    final pendingEarnings = 0.0; // Could be calculated if needed
    final averageRating = earnings?.averageRating ?? 0.0;
    final totalReviews = earnings?.totalRatings ?? 0;

    return RefreshIndicator(
      onRefresh: () async {
        await Future.wait([
          ref.read(deliveryOrdersProvider.notifier).refresh(),
          ref.read(earningsProvider.notifier).refresh(),
        ]);
      },
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Welcome Section
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  theme.colorScheme.primary,
                  theme.colorScheme.primary.withValues(alpha: 0.7),
                ],
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${'delivery.welcomeBack'.tr()}, ${user?.name.split(' ').first ?? 'delivery.rider'.tr()}!',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'delivery.happeningToday'.tr(),
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Stats Grid - Matching Frontend Layout
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            childAspectRatio: 1.5,
            children: [
              _buildStatCard(
                theme,
                'delivery.stats.todayDeliveries'.tr(),
                '$todayDeliveries',
                Icons.inventory_2_outlined,
                Colors.orange,
                subtitle: '$weekDeliveries ${'delivery.stats.thisWeek'.tr()}',
              ),
              _buildStatCard(
                theme,
                'delivery.stats.todayEarnings'.tr(),
                '\$${todayEarnings.toStringAsFixed(2)}',
                Icons.account_balance_wallet_outlined,
                Colors.green,
                subtitle: '\$${pendingEarnings.toStringAsFixed(2)} ${'delivery.stats.pending'.tr()}',
              ),
              _buildStatCard(
                theme,
                'delivery.stats.activeOrders'.tr(),
                '${activeOrders.length}',
                Icons.access_time,
                Colors.blue,
                subtitle: '${pendingOrders.length} ${'delivery.stats.pending'.tr()}',
              ),
              _buildStatCard(
                theme,
                'delivery.stats.rating'.tr(),
                averageRating.toStringAsFixed(1),
                Icons.star_outline,
                Colors.purple,
                subtitle: '$totalReviews ${'delivery.reviews.totalReviews'.tr()}',
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Performance & Earnings Row
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Performance Summary
              Expanded(
                child: _buildPerformanceSummary(
                  theme,
                  completionRate: allOrders.isNotEmpty
                      ? (allOrders.where((o) => o.isDelivered).length / allOrders.length * 100).round()
                      : 0,
                  totalDeliveries: allOrders.where((o) => o.isDelivered).length,
                  averageRating: averageRating,
                ),
              ),
              const SizedBox(width: 12),
              // Earnings Summary
              Expanded(
                child: _buildEarningsSummary(
                  theme,
                  weekDeliveries: weekDeliveries,
                  weekEarnings: earnings?.weekEarnings ?? 0.0,
                  pendingEarnings: pendingEarnings,
                  totalEarnings: earnings?.totalEarnings ?? 0.0,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Pending Orders Section
          _buildSectionHeader('delivery.pendingOrders'.tr(), onSeeAll: () {
            setState(() {
              _selectedIndex = 3;
              _tabController.index = 0;
            });
          }),
          const SizedBox(height: 12),
          _buildPendingOrdersList(context, theme, pendingOrders),
        ],
      ),
    );
  }

  Widget _buildPerformanceSummary(
    ThemeData theme, {
    required int completionRate,
    required int totalDeliveries,
    required double averageRating,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: theme.dividerColor),
        boxShadow: [
          BoxShadow(
            color: theme.shadowColor.withValues(alpha: 0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'delivery.stats.performance'.tr(),
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 10),
          // Completion Rate
          _buildProgressItem(
            theme,
            label: 'delivery.stats.completionRate'.tr(),
            value: '$completionRate%',
            progress: completionRate / 100,
            color: Colors.green,
          ),
          const SizedBox(height: 8),
          // Total Deliveries
          _buildProgressItem(
            theme,
            label: 'delivery.stats.totalDeliveries'.tr(),
            value: '$totalDeliveries',
            progress: (totalDeliveries / 100).clamp(0.0, 1.0),
            color: Colors.blue,
          ),
          const SizedBox(height: 8),
          // Customer Rating
          _buildProgressItem(
            theme,
            label: 'delivery.stats.customerRating'.tr(),
            value: '${averageRating.toStringAsFixed(1)}/5',
            progress: averageRating / 5,
            color: Colors.amber,
          ),
        ],
      ),
    );
  }

  Widget _buildProgressItem(
    ThemeData theme, {
    required String label,
    required String value,
    required double progress,
    required Color color,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  color: theme.hintColor,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            Text(
              value,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.onSurface,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: BorderRadius.circular(3),
          child: LinearProgressIndicator(
            value: progress.clamp(0.0, 1.0),
            backgroundColor: color.withValues(alpha: 0.15),
            valueColor: AlwaysStoppedAnimation<Color>(color),
            minHeight: 4,
          ),
        ),
      ],
    );
  }

  Widget _buildEarningsSummary(
    ThemeData theme, {
    required int weekDeliveries,
    required double weekEarnings,
    required double pendingEarnings,
    required double totalEarnings,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.orange.shade500,
            Colors.amber.shade500,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.orange.withValues(alpha: 0.3),
            blurRadius: 6,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'delivery.stats.thisWeek'.tr(),
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 10),
          _buildEarningsRow(
            'delivery.stats.deliveries'.tr(),
            '$weekDeliveries',
          ),
          const SizedBox(height: 6),
          _buildEarningsRow(
            'delivery.earnings.title'.tr(),
            '\$${weekEarnings.toStringAsFixed(2)}',
          ),
          const SizedBox(height: 6),
          _buildEarningsRow(
            'delivery.stats.pending'.tr(),
            '\$${pendingEarnings.toStringAsFixed(2)}',
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 6),
            child: Divider(color: Colors.white24, height: 1),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'delivery.stats.totalEarned'.tr(),
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: Colors.white,
                ),
              ),
              Text(
                '\$${totalEarnings.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEarningsRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            color: Colors.white.withValues(alpha: 0.8),
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildSectionHeader(String title, {VoidCallback? onSeeAll}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        if (onSeeAll != null)
          TextButton(
            onPressed: onSeeAll,
            child: Text('delivery.seeAll'.tr()),
          ),
      ],
    );
  }

  Widget _buildPendingOrdersList(
    BuildContext context,
    ThemeData theme,
    List<DeliveryOrderModel> orders,
  ) {
    if (orders.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: theme.dividerColor),
        ),
        child: Column(
          children: [
            Icon(Icons.inbox_outlined, size: 64, color: theme.disabledColor),
            const SizedBox(height: 16),
            Text(
              'delivery.noPendingOrders'.tr(),
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: theme.hintColor,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'delivery.newOrdersWillAppear'.tr(),
              style: TextStyle(
                fontSize: 14,
                color: theme.hintColor,
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      children: orders.take(3).map((order) {
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          child: _buildOrderCard(context, theme, order),
        );
      }).toList(),
    );
  }

  Widget _buildStatCard(
    ThemeData theme,
    String title,
    String value,
    IconData icon,
    Color color, {
    String? subtitle,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: theme.dividerColor),
        boxShadow: [
          BoxShadow(
            color: theme.shadowColor.withValues(alpha: 0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [color, color.withValues(alpha: 0.7)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: Colors.white, size: 18),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: theme.hintColor,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                if (subtitle != null)
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 10,
                      color: theme.hintColor,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrdersList(BuildContext context, ThemeData theme, String filter) {
    final ordersState = ref.watch(deliveryOrdersProvider);

    if (ordersState.orders.isEmpty && ordersState.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (ordersState.orders.isEmpty && ordersState.error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              Text(
                'delivery.errorLoadingOrders'.tr(),
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                '${ordersState.error}',
                textAlign: TextAlign.center,
                style: TextStyle(color: theme.hintColor),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  ref.read(deliveryOrdersProvider.notifier).refresh();
                },
                child: Text('common.retry'.tr()),
              ),
            ],
          ),
        ),
      );
    }

    // Filter orders based on current tab
    List<DeliveryOrderModel> displayOrders;
    if (filter == 'active') {
      displayOrders = ordersState.activeOrders;
    } else if (filter == 'completed') {
      displayOrders = ordersState.completedOrders;
    } else {
      // 'all' - show all orders
      displayOrders = ordersState.orders;
    }

    // Filter by search query
    if (_searchQuery.isNotEmpty) {
      final query = _searchQuery.toLowerCase();
      displayOrders = displayOrders.where((order) {
        return order.orderNumber.toLowerCase().contains(query) ||
            order.customer.name.toLowerCase().contains(query) ||
            (order.customer.phone?.contains(query) ?? false) ||
            order.deliveryAddress.fullAddress.toLowerCase().contains(query) ||
            (order.shop?.name.toLowerCase().contains(query) ?? false);
      }).toList();
    }

    if (displayOrders.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                _searchQuery.isNotEmpty ? Icons.search_off : Icons.inbox_outlined,
                size: 100,
                color: theme.disabledColor,
              ),
              const SizedBox(height: 24),
              Text(
                _searchQuery.isNotEmpty
                    ? 'delivery.orders.noOrdersMatch'.tr()
                    : 'delivery.noOrdersFound'.tr(),
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _searchQuery.isNotEmpty
                    ? 'delivery.orders.tryDifferentSearch'.tr()
                    : filter == 'active'
                        ? 'delivery.orders.noActiveOrders'.tr()
                        : filter == 'completed'
                            ? 'delivery.orders.noCompletedOrders'.tr()
                            : 'delivery.noOrdersYet'.tr(),
                style: TextStyle(
                  fontSize: 16,
                  color: theme.hintColor,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: displayOrders.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final order = displayOrders[index];
        return _buildOrderCard(context, theme, order);
      },
    );
  }

  Widget _buildOrderCard(
    BuildContext context,
    ThemeData theme,
    DeliveryOrderModel order,
  ) {
    Color statusColor;
    IconData statusIcon;

    if (order.isPending) {
      statusColor = Colors.orange;
      statusIcon = Icons.notification_important;
    } else if (order.isAccepted) {
      statusColor = Colors.blue;
      statusIcon = Icons.check_circle_outline;
    } else if (order.isPickedUp) {
      statusColor = Colors.purple;
      statusIcon = Icons.inventory_2;
    } else if (order.isOnTheWay) {
      statusColor = Colors.indigo;
      statusIcon = Icons.local_shipping;
    } else if (order.isDelivered) {
      statusColor = Colors.green;
      statusIcon = Icons.check_circle;
    } else {
      statusColor = Colors.grey;
      statusIcon = Icons.info_outline;
    }

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => OrderDetailPage(order: order),
            ),
          );
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Order number and status
              Row(
                children: [
                  Expanded(
                    child: Text(
                      '${'delivery.orderNumber'.tr()}${order.orderNumber}',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      children: [
                        Icon(statusIcon, size: 16, color: statusColor),
                        const SizedBox(width: 4),
                        Text(
                          order.statusDisplay,
                          style: TextStyle(
                            color: statusColor,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Customer info
              Row(
                children: [
                  Icon(Icons.person_outline, size: 16, color: theme.hintColor),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      order.customer.name,
                      style: TextStyle(
                        fontSize: 14,
                        color: theme.colorScheme.onSurface.withValues(alpha: 0.8),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // Delivery address
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.location_on_outlined, size: 16, color: theme.hintColor),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      order.deliveryAddress.fullAddress,
                      style: TextStyle(
                        fontSize: 14,
                        color: theme.colorScheme.onSurface.withValues(alpha: 0.8),
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Divider
              Divider(color: theme.dividerColor, height: 1),
              const SizedBox(height: 12),

              // Order details
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(Icons.shopping_bag_outlined, size: 16, color: theme.hintColor),
                      const SizedBox(width: 4),
                      Text(
                        '${order.itemCount} ${'delivery.items'.tr()}',
                        style: TextStyle(
                          fontSize: 14,
                          color: theme.colorScheme.onSurface.withValues(alpha: 0.8),
                        ),
                      ),
                    ],
                  ),
                  if (order.distance != null)
                    Row(
                      children: [
                        Icon(Icons.route, size: 16, color: theme.hintColor),
                        const SizedBox(width: 4),
                        Text(
                          order.formattedDistance,
                          style: TextStyle(
                            fontSize: 14,
                            color: theme.colorScheme.onSurface.withValues(alpha: 0.8),
                          ),
                        ),
                      ],
                    ),
                  Text(
                    order.formattedDeliveryFee,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                ],
              ),

              // Accept/Reject buttons for pending orders
              if (order.isPending) ...[
                const SizedBox(height: 12),
                Divider(color: theme.dividerColor, height: 1),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: _processingOrderId == order.id
                            ? null
                            : () => _handleAcceptOrder(order),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        icon: _processingOrderId == order.id
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Icon(Icons.check_circle, size: 18),
                        label: Text('delivery.accept'.tr()),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _processingOrderId == order.id
                            ? null
                            : () => _handleRejectOrder(order),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.red,
                          side: const BorderSide(color: Colors.red),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        icon: const Icon(Icons.cancel, size: 18),
                        label: Text('delivery.decline'.tr()),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handleAcceptOrder(DeliveryOrderModel order) async {
    setState(() {
      _processingOrderId = order.id;
    });

    try {
      await ref.read(deliveryOrdersProvider.notifier).acceptOrder(order.id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('delivery.orderAcceptedSuccessfully'.tr()),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${'delivery.failedToAcceptOrder'.tr()}: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _processingOrderId = null;
        });
      }
    }
  }

  Future<void> _handleRejectOrder(DeliveryOrderModel order) async {
    // Show confirmation dialog
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('delivery.declineOrder'.tr()),
        content: Text('${'delivery.confirmDeclineOrder'.tr()} #${order.orderNumber}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('common.cancel'.tr()),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: Text('delivery.decline'.tr()),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() {
      _processingOrderId = order.id;
    });

    try {
      await ref.read(deliveryOrdersProvider.notifier).rejectOrder(order.id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('delivery.orderDeclined'.tr()),
            backgroundColor: Colors.orange,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${'delivery.failedToDeclineOrder'.tr()}: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _processingOrderId = null;
        });
      }
    }
  }

  Widget _buildDrawer(BuildContext context) {
    final theme = Theme.of(context);
    final user = ref.watch(authProvider).user;

    return Drawer(
      child: SafeArea(
        child: Column(
          children: [
            // User Header
            Container(
              padding: const EdgeInsets.all(20),
              color: theme.colorScheme.primary.withValues(alpha: 0.1),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 32,
                    backgroundColor: theme.colorScheme.primary.withValues(alpha: 0.2),
                    child: Icon(
                      Icons.delivery_dining,
                      size: 32,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user?.name ?? 'delivery.deliveryPartner'.tr(),
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          user?.email ?? '',
                          style: TextStyle(
                            fontSize: 14,
                            color: theme.hintColor,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Menu Items
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  ListTile(
                    leading: const Icon(Icons.person),
                    title: Text('common.profile'.tr()),
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const DeliveryProfilePage()),
                      );
                    },
                  ),
                  ListTile(
                    leading: const Icon(Icons.star),
                    title: Text('delivery.reviews.title'.tr()),
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const DeliveryReviewsPage()),
                      );
                    },
                  ),
                  ListTile(
                    leading: const Icon(Icons.map),
                    title: Text('delivery.zones.myZone'.tr()),
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const DeliveryZonesPage()),
                      );
                    },
                  ),
                  ListTile(
                    leading: const Icon(Icons.settings),
                    title: Text('settings.settings'.tr()),
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const DeliverySettingsPage()),
                      );
                    },
                  ),
                  const Divider(),
                  ListTile(
                    leading: const Icon(Icons.logout, color: Colors.red),
                    title: Text(
                      'common.logout'.tr(),
                      style: const TextStyle(color: Colors.red),
                    ),
                    onTap: () async {
                      await ref.read(authProvider.notifier).logout();
                      if (context.mounted) {
                        Navigator.of(context).pushAndRemoveUntil(
                          MaterialPageRoute(builder: (_) => const LoginPage()),
                          (route) => false,
                        );
                      }
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSegmentedTab({
    required ThemeData theme,
    required String label,
    int? count,
    required bool isSelected,
    bool showBadge = false,
    Color? badgeColor,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
        decoration: BoxDecoration(
          color: isSelected ? theme.colorScheme.surface : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  )
                ]
              : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                color: isSelected ? theme.colorScheme.onSurface : theme.hintColor,
              ),
            ),
            if (count != null && isSelected)
              Text(
                ' ($count)',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: theme.colorScheme.onSurface,
                ),
              ),
            if (showBadge && count != null && count > 0) ...[
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: badgeColor ?? theme.colorScheme.primary,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '$count',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildAvailabilityToggle(ThemeData theme) {
    Color bgColor;
    Color textColor;
    IconData icon;
    String label;

    switch (_availabilityStatus) {
      case 'ONLINE':
        bgColor = Colors.green;
        textColor = Colors.white;
        icon = Icons.circle;
        label = 'delivery.onlineStatus'.tr();
        break;
      case 'ON_DELIVERY':
        bgColor = Colors.orange;
        textColor = Colors.white;
        icon = Icons.local_shipping;
        label = 'delivery.onDelivery'.tr();
        break;
      default:
        bgColor = theme.disabledColor;
        textColor = theme.colorScheme.onSurface;
        icon = Icons.circle_outlined;
        label = 'delivery.offlineStatus'.tr();
    }

    return InkWell(
      onTap: _showAvailabilityDialog,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 12, color: textColor),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: textColor,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAvailabilityDialog() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'delivery.availabilityStatus'.tr(),
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            _buildStatusOption(
              'ONLINE',
              'delivery.onlineStatus'.tr(),
              'delivery.youAreOnline'.tr(),
              Colors.green,
              Icons.circle,
            ),
            const SizedBox(height: 12),
            _buildStatusOption(
              'OFFLINE',
              'delivery.offlineStatus'.tr(),
              'delivery.youAreOffline'.tr(),
              Colors.grey,
              Icons.circle_outlined,
            ),
            const SizedBox(height: 12),
            _buildStatusOption(
              'ON_DELIVERY',
              'delivery.onDelivery'.tr(),
              'delivery.youAreOnDelivery'.tr(),
              Colors.orange,
              Icons.local_shipping,
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusOption(
    String status,
    String title,
    String subtitle,
    Color color,
    IconData icon,
  ) {
    final isSelected = _availabilityStatus == status;

    return InkWell(
      onTap: () {
        setState(() {
          _availabilityStatus = status;
        });
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(subtitle),
            backgroundColor: color,
            duration: const Duration(seconds: 2),
          ),
        );
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? color.withValues(alpha: 0.1) : Theme.of(context).colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? color : Colors.transparent,
            width: 2,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: isSelected ? color : Theme.of(context).colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 12,
                      color: Theme.of(context).hintColor,
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              Icon(Icons.check_circle, color: color),
          ],
        ),
      ),
    );
  }
}
