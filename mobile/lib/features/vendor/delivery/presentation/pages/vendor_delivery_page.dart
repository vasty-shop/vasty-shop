import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../../shared/repositories/delivery_repository.dart';
import '../../../../../shared/repositories/vendor_order_repository.dart';
import 'delivery_methods_tab.dart';
import 'shipping_zones_tab.dart';
import 'delivery_men_tab.dart';
import 'tracking_tab.dart';

// Provider for delivery stats
final deliveryStatsProvider = FutureProvider.family<Map<String, dynamic>, String?>((ref, shopId) async {
  final deliveryRepo = DeliveryRepository();
  final orderRepo = VendorOrderRepository();

  try {
    // Fetch delivery methods for active count and avg delivery time
    final methods = await deliveryRepo.getDeliveryMethods(shopId: shopId);
    final activeMethods = methods.where((m) => m.isActive).length;

    // Calculate avg delivery time from methods
    double avgDays = 0;
    if (methods.isNotEmpty) {
      final totalDays = methods.fold<double>(0, (sum, m) {
        final days = m.estimatedDays.split('-').first;
        return sum + (double.tryParse(days) ?? 0);
      });
      avgDays = totalDays / methods.length;
    }

    // Fetch orders for shipped today and in transit
    int shippedToday = 0;
    int inTransit = 0;

    if (shopId != null) {
      final orders = await orderRepo.getVendorOrders(shopId: shopId, limit: 100);
      final today = DateTime.now();

      for (final order in orders) {
        final status = order.status.toLowerCase();
        if (status == 'shipped' || status == 'in_transit') {
          inTransit++;
          // Check if shipped today (using order date as proxy)
          final orderDateValue = order.orderDate;
          if (orderDateValue.year == today.year &&
              orderDateValue.month == today.month &&
              orderDateValue.day == today.day) {
            shippedToday++;
          }
        }
      }
    }

    return {
      'activeMethods': activeMethods,
      'shippedToday': shippedToday,
      'inTransit': inTransit,
      'avgDeliveryTime': avgDays.toStringAsFixed(1),
    };
  } catch (e) {
    return {
      'activeMethods': 0,
      'shippedToday': 0,
      'inTransit': 0,
      'avgDeliveryTime': '0',
    };
  }
});

class VendorDeliveryPage extends ConsumerStatefulWidget {
  final String? shopId;

  const VendorDeliveryPage({super.key, this.shopId});

  @override
  ConsumerState<VendorDeliveryPage> createState() => _VendorDeliveryPageState();
}

class _VendorDeliveryPageState extends ConsumerState<VendorDeliveryPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _tabController.addListener(() {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final statsAsync = ref.watch(deliveryStatsProvider(widget.shopId));

    final tabs = [
      _TabItem(
        id: 0,
        icon: Icons.local_shipping_outlined,
        activeIcon: Icons.local_shipping,
        label: 'vendorDelivery.tabMethods'.tr(),
      ),
      _TabItem(
        id: 1,
        icon: Icons.map_outlined,
        activeIcon: Icons.map,
        label: 'vendorDelivery.tabZones'.tr(),
      ),
      _TabItem(
        id: 2,
        icon: Icons.people_outline,
        activeIcon: Icons.people,
        label: 'vendorDelivery.tabDeliveryMen'.tr(),
      ),
      _TabItem(
        id: 3,
        icon: Icons.track_changes_outlined,
        activeIcon: Icons.track_changes,
        label: 'vendorDelivery.tabTracking'.tr(),
      ),
    ];

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      body: Column(
        children: [
          // Stats Cards - matching frontend
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: statsAsync.when(
              data: (stats) => Row(
                children: [
                  Expanded(
                    child: _buildStatCard(
                      'vendorDelivery.activeMethods'.tr(),
                      '${stats['activeMethods']}',
                      Icons.local_shipping,
                      [Colors.blue.shade400, Colors.cyan.shade500],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildStatCard(
                      'vendorDelivery.shippedToday'.tr(),
                      '${stats['shippedToday']}',
                      Icons.inventory_2,
                      [Colors.green.shade400, Colors.teal.shade500],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildStatCard(
                      'vendorDelivery.inTransit'.tr(),
                      '${stats['inTransit']}',
                      Icons.schedule,
                      [Colors.purple.shade400, Colors.pink.shade400],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildStatCard(
                      'vendorDelivery.avgDeliveryTime'.tr(),
                      '${stats['avgDeliveryTime']} ${'vendorDelivery.days'.tr()}',
                      Icons.trending_up,
                      [Colors.orange.shade400, Colors.red.shade400],
                    ),
                  ),
                ],
              ),
              loading: () => Row(
                children: List.generate(4, (index) => Expanded(
                  child: Container(
                    margin: EdgeInsets.only(left: index > 0 ? 8 : 0),
                    height: 90,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade200,
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                )),
              ),
              error: (e, s) => const SizedBox.shrink(),
            ),
          ),

          // Tab Bar Card
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: tabs.map((tab) {
                  final isActive = _tabController.index == tab.id;
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: InkWell(
                      onTap: () {
                        _tabController.animateTo(tab.id);
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: isActive
                              ? theme.colorScheme.primary.withValues(alpha: 0.1)
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isActive
                                ? theme.colorScheme.primary.withValues(alpha: 0.3)
                                : Colors.transparent,
                            width: 1,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              isActive ? tab.activeIcon : tab.icon,
                              size: 20,
                              color: isActive
                                  ? theme.colorScheme.primary
                                  : Colors.grey.shade500,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              tab.label,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                                color: isActive
                                    ? theme.colorScheme.primary
                                    : Colors.grey.shade600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          // Tab Views
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                DeliveryMethodsTab(shopId: widget.shopId),
                ShippingZonesTab(shopId: widget.shopId),
                DeliveryMenTab(shopId: widget.shopId),
                TrackingTab(shopId: widget.shopId),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, List<Color> gradientColors) {
    return Container(
      height: 90,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: gradientColors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: gradientColors.first.withValues(alpha: 0.3),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: Colors.white, size: 18),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 9,
              color: Colors.white.withValues(alpha: 0.9),
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _TabItem {
  final int id;
  final IconData icon;
  final IconData activeIcon;
  final String label;

  _TabItem({
    required this.id,
    required this.icon,
    required this.activeIcon,
    required this.label,
  });
}
