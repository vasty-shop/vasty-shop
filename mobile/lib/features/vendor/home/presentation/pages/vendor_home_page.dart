import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../auth/presentation/providers/auth_provider.dart';
import '../../../../auth/presentation/pages/login_page.dart';
import '../../../products/presentation/pages/vendor_products_page.dart';
import '../../../products/presentation/pages/vendor_product_detail_page.dart';
import '../../../products/presentation/pages/add_product_page.dart';
import '../../../products/presentation/providers/vendor_products_provider.dart';
import '../../../orders/presentation/pages/vendor_orders_page.dart';
import '../../../orders/presentation/pages/vendor_order_detail_page.dart';
import '../../../orders/presentation/providers/vendor_order_provider.dart';
import '../../../delivery/presentation/pages/vendor_delivery_page.dart';
import '../../../../../shared/repositories/shop_repository.dart';
import '../../../../auth/data/models/shop_model.dart';
import '../../../settings/presentation/pages/shop_settings_page.dart';
import '../../../profile/presentation/pages/vendor_profile_page.dart';
import '../../../dashboard/presentation/providers/vendor_statistics_provider.dart';
import '../../../analytics/presentation/pages/vendor_analytics_page.dart';
import '../../../reviews/presentation/pages/vendor_reviews_page.dart';
import '../../../offers/presentation/pages/vendor_offers_page.dart';
import '../../../team/presentation/pages/vendor_team_page.dart';
import '../../../billing/presentation/pages/vendor_billing_page.dart';
import '../../../../notifications/presentation/widgets/notification_bell.dart';

import 'package:easy_localization/easy_localization.dart';class VendorHomePage extends ConsumerStatefulWidget {
  const VendorHomePage({super.key});

  @override
  ConsumerState<VendorHomePage> createState() => _VendorHomePageState();
}

class _VendorHomePageState extends ConsumerState<VendorHomePage> {
  int _selectedIndex = 0;
  ShopModel? _shopData;
  bool _isLoadingShop = false;

  @override
  void initState() {
    super.initState();
    // Load vendor products and orders to get stats
    Future.microtask(() {
      ref.read(vendorProductsProvider.notifier).loadVendorProducts(refresh: true);
      ref.read(vendorStatisticsProvider.notifier).loadStatistics();
      _loadShopData();
      _loadOrders();
    });
  }

  Future<void> _loadOrders() async {
    final authState = ref.read(authProvider);
    final shopId = authState.user?.metadata?['shopId'] as String?;

    if (shopId == null) return;

    try {
      await ref.read(vendorOrderProvider(shopId).notifier).loadOrders();
    } catch (e) {
      debugPrint('Error loading orders: $e');
    }
  }

  Future<void> _loadShopData() async {
    final authState = ref.read(authProvider);
    final shopId = authState.user?.metadata?['shopId'] as String?;

    if (shopId == null) return;

    setState(() => _isLoadingShop = true);

    try {
      final shopRepository = ShopRepository();
      final shop = await shopRepository.getShopById(shopId);
      if (mounted) {
        setState(() {
          _shopData = shop;
          _isLoadingShop = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingShop = false);
      }
      debugPrint('Error loading shop data: $e');
    }
  }

  String _getAppBarTitle() {
    switch (_selectedIndex) {
      case 0:
        return 'vendor.dashboard'.tr();
      case 1:
        return 'vendor.myProducts'.tr();
      case 2:
        return 'vendor.orders'.tr();
      case 3:
        return 'vendor.deliveries'.tr();
      default:
        return 'vendor.dashboard'.tr();
    }
  }

  List<Widget> _getAppBarActions() {
    switch (_selectedIndex) {
      case 0:
        // Dashboard - show notifications
        return [
          const NotificationBell(),
        ];
      case 1:
        // Products - search is in the page itself
        return [];
      case 2:
        // Orders - filter is in the page itself
        return [];
      default:
        return [];
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final user = ref.watch(authProvider).user;
    final authState = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(_getAppBarTitle()),
        actions: _getAppBarActions(),
      ),
      drawer: _buildDrawer(context, theme, user, authState),
      body: _selectedIndex == 0
          ? _buildDashboard(context, theme)
          : _selectedIndex == 1
              ? const VendorProductsPage()
              : _selectedIndex == 2
                  ? _buildOrdersTab(context, theme)
                  : _buildDeliveriesTab(context, theme),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: theme.colorScheme.primary,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_outlined),
            activeIcon: Icon(Icons.dashboard),
            label: 'vendor.dashboard'.tr(),
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.inventory_outlined),
            activeIcon: Icon(Icons.inventory),
            label: 'vendor.products'.tr(),
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_bag_outlined),
            activeIcon: Icon(Icons.shopping_bag),
            label: 'vendor.orders'.tr(),
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.delivery_dining_outlined),
            activeIcon: Icon(Icons.delivery_dining),
            label: 'vendor.deliveries'.tr(),
          ),
        ],
      ),
    );
  }

  Widget _buildDrawer(
    BuildContext context,
    ThemeData theme,
    user,
    authState,
  ) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          UserAccountsDrawerHeader(
            decoration: BoxDecoration(
              color: theme.colorScheme.primary,
            ),
            currentAccountPicture: CircleAvatar(
              backgroundColor: Colors.white,
              child: user?.avatar != null
                  ? ClipOval(
                      child: Image.network(
                        user!.avatar!,
                        width: 90,
                        height: 90,
                        fit: BoxFit.cover,
                      ),
                    )
                  : Text(
                      user?.initials ?? 'V',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: theme.colorScheme.primary,
                      ),
                    ),
            ),
            accountName: Text(user?.name ?? 'Vendor'),
            accountEmail: Text(user?.email ?? ''),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.person_outline),
            title: Text('common.profile'.tr()),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              Navigator.pop(context);
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => const VendorProfilePage(),
                ),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.local_offer_outlined),
            title: Text('vendor.offers'.tr()),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              Navigator.pop(context);
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => const VendorOffersPage(),
                ),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.star_outline),
            title: Text('vendor.reviews'.tr()),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              Navigator.pop(context);
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => const VendorReviewsPage(),
                ),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.analytics_outlined),
            title: Text('vendor.analytics'.tr()),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              Navigator.pop(context);
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => const VendorAnalyticsPage(),
                ),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.people_outline),
            title: Text('vendor.team'.tr()),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              Navigator.pop(context);
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => const VendorTeamPage(),
                ),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.receipt_long_outlined),
            title: Text('vendor.billing'.tr()),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              Navigator.pop(context);
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => const VendorBillingPage(),
                ),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.settings_outlined),
            title: Text('vendor.settings'.tr()),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              Navigator.pop(context);
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => const ShopSettingsPage(),
                ),
              );
            },
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: Text('settings.logout'.tr(), style: TextStyle(color: Colors.red)),
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
    );
  }

  Widget _buildDashboard(BuildContext context, ThemeData theme) {
    return RefreshIndicator(
      onRefresh: () async {
        // Refresh all dashboard data
        await Future.wait([
          ref.read(vendorProductsProvider.notifier).loadVendorProducts(refresh: true),
          ref.read(vendorStatisticsProvider.notifier).refresh(),
          _loadShopData(),
          _loadOrders(),
        ]);
      },
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Shop Status Card
          _buildShopStatusCard(theme),
          const SizedBox(height: 16),

          // Stats Grid
          _buildStatsGrid(theme),
          const SizedBox(height: 24),

          // Earnings Breakdown
          _buildEarningsBreakdown(theme),
          const SizedBox(height: 24),

          // Quick Actions
          _buildQuickActions(theme),
          const SizedBox(height: 24),

          // Recent Orders
          _buildSectionHeader('vendor.recentOrders'.tr(), onSeeAll: () {
            setState(() {
              _selectedIndex = 2; // Navigate to Orders tab
            });
          }),
          const SizedBox(height: 12),
          _buildRecentOrders(theme),
          const SizedBox(height: 24),

          // Top Products
          _buildSectionHeader('vendor.topProducts'.tr(), onSeeAll: () {
            setState(() {
              _selectedIndex = 1; // Navigate to Products tab
            });
          }),
          const SizedBox(height: 12),
          _buildTopProducts(theme),
          const SizedBox(height: 24),

          // Performance Metrics
          _buildPerformanceMetrics(theme),
        ],
      ),
    );
  }

  Widget _buildShopStatusCard(ThemeData theme) {
    final shopName = _shopData?.name ?? 'My Shop';
    final isVerified = _shopData?.isVerified ?? false;
    final status = _shopData?.status ?? 'pending';

    // Determine badge color and text based on verification and status
    Color badgeColor;
    Color borderColor;
    String badgeText;

    if (isVerified) {
      badgeColor = Colors.green.withValues(alpha: 0.3);
      borderColor = Colors.green;
      badgeText = 'vendor.verified'.tr();
    } else if (status == 'active') {
      badgeColor = Colors.blue.withValues(alpha: 0.3);
      borderColor = Colors.blue;
      badgeText = 'vendor.active'.tr();
    } else if (status == 'suspended') {
      badgeColor = Colors.red.withValues(alpha: 0.3);
      borderColor = Colors.red;
      badgeText = 'vendor.suspended'.tr();
    } else {
      badgeColor = Colors.orange.withValues(alpha: 0.3);
      borderColor = Colors.orange;
      badgeText = 'vendor.pendingVerification'.tr();
    }

    return Container(
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
          Row(
            children: [
              Icon(
                Icons.store,
                color: Colors.white.withValues(alpha: 0.9),
                size: 32,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      shopName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: badgeColor,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: borderColor, width: 1.5),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (isVerified)
                                Icon(
                                  Icons.verified,
                                  size: 14,
                                  color: borderColor,
                                ),
                              if (isVerified) const SizedBox(width: 4),
                              Text(
                                badgeText,
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (_isLoadingShop) ...[
                          const SizedBox(width: 8),
                          SizedBox(
                            width: 12,
                            height: 12,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatsGrid(ThemeData theme) {
    final statsState = ref.watch(vendorStatisticsProvider);
    final stats = statsState.statistics;

    // Show loading state
    if (statsState.isLoading && stats == null) {
      return GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 1.5,
        children: List.generate(
          4,
          (index) => Container(
            decoration: BoxDecoration(
              color: Colors.grey.shade200,
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      );
    }

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: [
        _buildStatCard(
          theme,
          'vendor.totalRevenue'.tr(),
          stats?.revenue.formattedTotal ?? '\$0.00',
          Icons.attach_money,
          Colors.green,
          change: stats?.revenue.change,
        ),
        _buildStatCard(
          theme,
          'vendor.totalOrders'.tr(),
          '${stats?.orders.total ?? 0}',
          Icons.shopping_cart_outlined,
          Colors.blue,
          change: stats?.orders.change,
        ),
        _buildStatCard(
          theme,
          'vendor.products'.tr(),
          '${stats?.products.total ?? 0}',
          Icons.inventory_2_outlined,
          Colors.purple,
          subtitle: '${stats?.products.active ?? 0} ${'vendor.active'.tr().toLowerCase()}',
        ),
        _buildStatCard(
          theme,
          'vendor.customers'.tr(),
          '${stats?.customers.total ?? 0}',
          Icons.people_outline,
          Colors.orange,
          change: stats?.customers.change,
        ),
      ],
    );
  }

  Widget _buildEarningsBreakdown(ThemeData theme) {
    final statsState = ref.watch(vendorStatisticsProvider);
    final revenue = statsState.statistics?.revenue;

    if (statsState.isLoading && revenue == null) {
      return Container(
        height: 200,
        decoration: BoxDecoration(
          color: Colors.grey.shade200,
          borderRadius: BorderRadius.circular(12),
        ),
      );
    }

    final grossSales = revenue?.grossSales ?? revenue?.total ?? 0;
    final deliveryCosts = revenue?.deliveryCosts ?? 0;
    final netProfit = revenue?.netProfit ?? (grossSales - deliveryCosts);
    final profitMargin = grossSales > 0 ? ((grossSales - deliveryCosts) / grossSales * 100) : 0;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'vendor.earningsBreakdown'.tr(),
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'vendor.profitAfterDeductions'.tr(),
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.grey.shade600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Three Cards
          Column(
            children: [
              // Gross Sales
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.green.shade100),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: Colors.green,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.attach_money, color: Colors.white, size: 16),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'vendor.grossSales'.tr(),
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Colors.green.shade700,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '\$${grossSales.toStringAsFixed(2)}',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.green.shade800,
                      ),
                    ),
                    Text(
                      'vendor.totalOrderValue'.tr(),
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.green.shade600,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              // Delivery Costs
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.blue.shade100),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: Colors.blue,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.local_shipping, color: Colors.white, size: 16),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'vendor.deliveryCosts'.tr(),
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Colors.blue.shade700,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '-\$${deliveryCosts.toStringAsFixed(2)}',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.blue.shade800,
                      ),
                    ),
                    Text(
                      'vendor.paidToDeliveryPartners'.tr(),
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.blue.shade600,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              // Net Profit
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      theme.colorScheme.primary.withValues(alpha: 0.1),
                      Colors.green.shade100,
                    ],
                  ),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: theme.colorScheme.primary.withValues(alpha: 0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [theme.colorScheme.primary, Colors.green.shade600],
                            ),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.trending_up, color: Colors.white, size: 16),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'vendor.netProfit'.tr(),
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Colors.green.shade700,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '\$${netProfit.toStringAsFixed(2)}',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.green.shade800,
                      ),
                    ),
                    Text(
                      'vendor.actualEarnings'.tr(),
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.green.shade600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          // Profit Margin Progress Bar
          const SizedBox(height: 16),
          const Divider(),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'vendor.profitMargin'.tr(),
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.grey.shade600,
                ),
              ),
              Text(
                '${profitMargin.toStringAsFixed(0)}%',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: profitMargin / 100,
              minHeight: 12,
              backgroundColor: Colors.grey.shade100,
              valueColor: AlwaysStoppedAnimation<Color>(theme.colorScheme.primary),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'vendor.quickActions'.tr(),
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildQuickActionCard(
                theme,
                'vendor.addProduct'.tr(),
                Icons.add_box_outlined,
                Colors.blue,
                () async {
                  // Navigate to Add Product page
                  final result = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const AddProductPage(),
                    ),
                  );

                  // Refresh data if product was added
                  if (result == true) {
                    ref.read(vendorProductsProvider.notifier).loadVendorProducts(refresh: true);
                    ref.read(vendorStatisticsProvider.notifier).refresh();
                  }
                },
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildQuickActionCard(
                theme,
                'vendor.viewOrders'.tr(),
                Icons.shopping_bag_outlined,
                Colors.orange,
                () {
                  setState(() {
                    _selectedIndex = 2; // Navigate to Orders tab
                  });
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildQuickActionCard(
                theme,
                'vendor.shopSettings'.tr(),
                Icons.store_outlined,
                Colors.purple,
                () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => const ShopSettingsPage(),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildQuickActionCard(
                theme,
                'vendor.analytics'.tr(),
                Icons.analytics_outlined,
                Colors.green,
                () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => const VendorAnalyticsPage(),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildQuickActionCard(
    ThemeData theme,
    String title,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 28),
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(
    ThemeData theme,
    String title,
    String value,
    IconData icon,
    Color color,
    {double? change, String? subtitle}
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.grey.shade600,
                ),
              ),
              Icon(
                icon,
                color: color,
                size: 24,
              ),
            ],
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          if (change != null || subtitle != null)
            Row(
              children: [
                if (change != null) ...[
                  Icon(
                    change >= 0 ? Icons.trending_up : Icons.trending_down,
                    color: change >= 0 ? Colors.green : Colors.red,
                    size: 16,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${change >= 0 ? '+' : ''}${change.toStringAsFixed(1)}%',
                    style: TextStyle(
                      fontSize: 12,
                      color: change >= 0 ? Colors.green : Colors.red,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
                if (subtitle != null) ...[
                  if (change != null) const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ],
            ),
        ],
      ),
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
            child: Text('vendor.seeAll'.tr()),
          ),
      ],
    );
  }

  Widget _buildRecentOrders(ThemeData theme) {
    final authState = ref.watch(authProvider);
    final shopId = authState.user?.metadata?['shopId'] as String?;

    if (shopId == null) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.grey.shade50,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Column(
          children: [
            Icon(Icons.shopping_bag_outlined, size: 48, color: Colors.grey),
            SizedBox(height: 12),
            Text(
              'vendor.noShopFound'.tr(),
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Colors.grey,
              ),
            ),
          ],
        ),
      );
    }

    final ordersState = ref.watch(vendorOrderProvider(shopId));

    if (ordersState.isLoading) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.grey.shade50,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: const Center(child: CircularProgressIndicator()),
      );
    }

    if (ordersState.orders.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.grey.shade50,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Column(
          children: [
            const Icon(Icons.shopping_bag_outlined, size: 48, color: Colors.grey),
            const SizedBox(height: 12),
            Text('orders.noOrders'.tr(),
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Colors.grey,
              ),
            ),
            SizedBox(height: 4),
            Text(
              'vendor.ordersWillAppearHere'.tr(),
              style: TextStyle(fontSize: 14, color: Colors.grey),
            ),
          ],
        ),
      );
    }

    // Show recent 3 orders
    final recentOrders = ordersState.orders.take(3).toList();

    return Column(
      children: recentOrders.map((order) {
        Color statusColor;
        switch (order.status.toLowerCase()) {
          case 'pending':
            statusColor = Colors.orange;
            break;
          case 'processing':
            statusColor = Colors.blue;
            break;
          case 'shipped':
          case 'in_transit':
            statusColor = Colors.purple;
            break;
          case 'delivered':
            statusColor = Colors.green;
            break;
          case 'cancelled':
            statusColor = Colors.red;
            break;
          default:
            statusColor = Colors.grey;
        }

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: InkWell(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => VendorOrderDetailPage(
                    orderId: order.id,
                    shopId: shopId,
                  ),
                ),
              );
            },
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(Icons.shopping_bag, color: statusColor),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      order.orderNumber.isNotEmpty
                        ? 'Order #${order.orderNumber}'
                        : 'Order #${order.id.substring(0, 8)}',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: statusColor.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            order.status,
                            style: TextStyle(
                              fontSize: 12,
                              color: statusColor,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '${order.items.length} items',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '\$${order.total.toStringAsFixed(2)}',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                ],
              ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildTopProducts(ThemeData theme) {
    final statsState = ref.watch(vendorStatisticsProvider);
    final topProducts = statsState.statistics?.products.topProducts;

    // Check if we have top products from statistics (with real sales data)
    if (topProducts == null || topProducts.isEmpty) {
      // Fall back to products provider if statistics doesn't have top products
      final productsState = ref.watch(vendorProductsProvider);

      if (productsState.products.isEmpty) {
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.grey.shade50,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Column(
            children: [
              const Icon(Icons.inventory_outlined, size: 48, color: Colors.grey),
              const SizedBox(height: 12),
              Text(
                'vendor.noProductsYet'.tr(),
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'vendor.addFirstProduct'.tr(),
                style: TextStyle(fontSize: 14, color: Colors.grey),
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () {
                  setState(() {
                    _selectedIndex = 1; // Navigate to Products tab
                  });
                },
                icon: const Icon(Icons.add),
                label: Text('vendor.addProduct'.tr()),
                style: ElevatedButton.styleFrom(
                  backgroundColor: theme.colorScheme.primary,
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ),
        );
      }

      // Show first 3 products as fallback (no sales data available)
      final fallbackProducts = productsState.products.take(3).toList();

      return Column(
        children: fallbackProducts.map((product) {
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: InkWell(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => VendorProductDetailPage(productId: product.id),
                  ),
                );
              },
              borderRadius: BorderRadius.circular(12),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    // Product Image
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.network(
                        product.mainImage,
                        width: 60,
                        height: 60,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            width: 60,
                            height: 60,
                            color: Colors.grey.shade200,
                            child: const Icon(Icons.image_not_supported),
                          );
                        },
                      ),
                    ),
                    const SizedBox(width: 12),

                    // Product Info
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            product.name,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            product.displayPrice,
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: theme.colorScheme.primary,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Stock
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          'Stock',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                          ),
                        ),
                        Text(
                          '${product.stock ?? 0}',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      );
    }

    // Show top products with real sales data from statistics API
    return Column(
      children: topProducts.take(3).map((product) {
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: InkWell(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => VendorProductDetailPage(productId: product.id),
                ),
              );
            },
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  // Product Image
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: product.image != null
                        ? Image.network(
                            product.image!,
                            width: 60,
                            height: 60,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                width: 60,
                                height: 60,
                                color: Colors.grey.shade200,
                                child: const Icon(Icons.inventory_2_outlined),
                              );
                            },
                          )
                        : Container(
                            width: 60,
                            height: 60,
                            decoration: BoxDecoration(
                              color: theme.colorScheme.primary.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Icon(
                              Icons.inventory_2_outlined,
                              color: theme.colorScheme.primary,
                            ),
                          ),
                  ),
                  const SizedBox(width: 12),

                  // Product Info with sales data
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          product.name,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(
                              Icons.shopping_cart_outlined,
                              size: 14,
                              color: Colors.grey.shade600,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '${product.sales} ${'vendor.sales'.tr()}',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey.shade600,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Revenue from this product
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        product.formattedRevenue,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: theme.colorScheme.primary,
                        ),
                      ),
                      if (product.change != null && product.change != 0)
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              product.change! >= 0 ? Icons.trending_up : Icons.trending_down,
                              size: 12,
                              color: product.change! >= 0 ? Colors.green : Colors.red,
                            ),
                            const SizedBox(width: 2),
                            Text(
                              '${product.change! >= 0 ? '+' : ''}${product.change!.toStringAsFixed(1)}%',
                              style: TextStyle(
                                fontSize: 11,
                                color: product.change! >= 0 ? Colors.green : Colors.red,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildOrdersTab(BuildContext context, ThemeData theme) {
    final authState = ref.watch(authProvider);
    final shopId = authState.user?.metadata?['shopId'] as String?;

    if (shopId == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.store_outlined,
              size: 100,
              color: Colors.grey.shade300,
            ),
            const SizedBox(height: 24),
            Text(
              'vendor.noShopFound'.tr(),
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'vendor.noShopFoundMessage'.tr(),
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey.shade600,
              ),
            ),
          ],
        ),
      );
    }

    return VendorOrdersPage(shopId: shopId);
  }

  Widget _buildDeliveriesTab(BuildContext context, ThemeData theme) {
    final authState = ref.watch(authProvider);
    final shopId = authState.user?.metadata?['shopId'] as String?;

    if (shopId == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.store_outlined,
              size: 100,
              color: Colors.grey.shade300,
            ),
            const SizedBox(height: 24),
            Text(
              'vendor.noShopFound'.tr(),
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'vendor.noShopFoundMessage'.tr(),
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey.shade600,
              ),
            ),
          ],
        ),
      );
    }

    return VendorDeliveryPage(shopId: shopId);
  }

  Widget _buildPerformanceMetrics(ThemeData theme) {
    final statsState = ref.watch(vendorStatisticsProvider);
    final performance = statsState.statistics?.performance;

    // Don't show if no performance data
    if (performance == null) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'vendor.performanceMetrics'.tr(),
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withValues(alpha: 0.1),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                    child: _buildMetricItem(
                      theme,
                      Icons.attach_money,
                      'vendor.avgOrderValue'.tr(),
                      '\$${(performance.averageOrderValue ?? 0).toStringAsFixed(0)}',
                      Colors.green,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildMetricItem(
                      theme,
                      Icons.trending_up,
                      'vendor.conversionRate'.tr(),
                      '${((performance.conversionRate ?? 0) * 100).toStringAsFixed(1)}%',
                      Colors.blue,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _buildMetricItem(
                      theme,
                      Icons.visibility_outlined,
                      'vendor.storeViews'.tr(),
                      '${performance.storeViews ?? 0}',
                      Colors.purple,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildMetricItem(
                      theme,
                      Icons.star_outline,
                      'vendor.avgRating'.tr(),
                      '${(performance.rating ?? 0).toStringAsFixed(1)}/5',
                      Colors.orange,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMetricItem(
    ThemeData theme,
    IconData icon,
    String label,
    String value,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.grey.shade900,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 11,
              color: Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }
}
