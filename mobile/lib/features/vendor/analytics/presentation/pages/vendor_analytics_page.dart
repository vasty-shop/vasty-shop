import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:easy_localization/easy_localization.dart';
import '../providers/analytics_provider.dart';
import '../../../orders/presentation/providers/vendor_order_provider.dart';
import '../../../orders/presentation/pages/vendor_orders_page.dart';

class VendorAnalyticsPage extends ConsumerStatefulWidget {
  const VendorAnalyticsPage({super.key});

  @override
  ConsumerState<VendorAnalyticsPage> createState() => _VendorAnalyticsPageState();
}

class _VendorAnalyticsPageState extends ConsumerState<VendorAnalyticsPage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(analyticsProvider.notifier).loadAnalytics();
      // Load orders for recent orders section
      final shopId = ref.read(analyticsProvider).analytics?.shopId;
      if (shopId != null && shopId.isNotEmpty) {
        ref.read(vendorOrderProvider(shopId).notifier).loadOrders();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final analyticsState = ref.watch(analyticsProvider);

    // Load orders when analytics loads and we have shopId
    final shopId = analyticsState.analytics?.shopId ?? '';
    if (shopId.isNotEmpty) {
      // Watch the orders provider only when we have a shopId
      final ordersState = ref.watch(vendorOrderProvider(shopId));
      // Ensure orders are loaded
      if (ordersState.orders.isEmpty && !ordersState.isLoading && ordersState.error == null) {
        Future.microtask(() {
          ref.read(vendorOrderProvider(shopId).notifier).loadOrders();
        });
      }
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('vendor.analytics'.tr()),
        actions: [
          IconButton(
            icon: const Icon(Icons.file_download_outlined),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Export report coming soon')),
              );
            },
          ),
        ],
      ),
      body: analyticsState.isLoading && analyticsState.analytics == null
          ? const Center(child: CircularProgressIndicator())
          : analyticsState.error != null && analyticsState.analytics == null
              ? _buildErrorState(theme, analyticsState.error!)
              : RefreshIndicator(
                  onRefresh: () async {
                    await ref.read(analyticsProvider.notifier).refresh();
                  },
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      // Time Range Selector
                      _buildTimeRangeSelector(theme, analyticsState.selectedTimeRange),
                      const SizedBox(height: 16),

                      // Metric Cards
                      _buildMetricCards(theme, analyticsState),
                      const SizedBox(height: 24),

                      // 1. Revenue & Orders Trend
                      if (analyticsState.analytics?.revenueData.isNotEmpty ?? false) ...[
                        _buildChartCard(
                          theme,
                          'vendorAnalytics.revenueOrdersTrend'.tr(),
                          _buildRevenueChart(analyticsState),
                        ),
                        const SizedBox(height: 24),
                      ],

                      // 2. Order Status Breakdown
                      if (analyticsState.analytics?.statusBreakdown != null) ...[
                        _buildOrderStatusSection(theme, analyticsState),
                        const SizedBox(height: 24),
                      ],

                      // 3. Category Distribution
                      if (analyticsState.analytics?.categoryData.isNotEmpty ?? false) ...[
                        _buildChartCard(
                          theme,
                          'vendorAnalytics.categoryDistribution'.tr(),
                          _buildCategoryChart(analyticsState),
                        ),
                        const SizedBox(height: 24),
                      ],

                      // 4. Product Status Breakdown
                      if (analyticsState.analytics != null &&
                          (analyticsState.analytics!.productsActive > 0 ||
                           analyticsState.analytics!.productsDraft > 0 ||
                           analyticsState.analytics!.productsOutOfStock > 0)) ...[
                        _buildProductStatusSection(theme, analyticsState),
                        const SizedBox(height: 24),
                      ],

                      // 5. Top Products
                      if (analyticsState.analytics?.topProducts.isNotEmpty ?? false) ...[
                        _buildSectionHeader('vendorAnalytics.topProducts'.tr()),
                        const SizedBox(height: 12),
                        _buildTopProducts(theme, analyticsState),
                        const SizedBox(height: 24),
                      ],

                      // 6. Recent Orders
                      _buildRecentOrdersSection(theme, analyticsState),
                    ],
                  ),
                ),
    );
  }

  Widget _buildErrorState(ThemeData theme, String error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.red.shade300),
            const SizedBox(height: 16),
            const Text(
              'Failed to load analytics',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              error,
              style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                ref.read(analyticsProvider.notifier).loadAnalytics();
              },
              icon: const Icon(Icons.refresh),
              label: Text('common.retry'.tr()),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimeRangeSelector(ThemeData theme, String selectedRange) {
    final ranges = [
      {'value': '7d', 'label': '7 Days'},
      {'value': '30d', 'label': '30 Days'},
      {'value': '3m', 'label': '3 Months'},
      {'value': '6m', 'label': '6 Months'},
      {'value': '1y', 'label': '1 Year'},
    ];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: ranges.map((range) {
          final isSelected = selectedRange == range['value'];
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: Text(range['label']!),
              selected: isSelected,
              onSelected: (selected) {
                if (selected) {
                  ref.read(analyticsProvider.notifier).setTimeRange(range['value']!);
                }
              },
              selectedColor: theme.colorScheme.primary.withValues(alpha: 0.2),
              checkmarkColor: theme.colorScheme.primary,
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildMetricCards(ThemeData theme, AnalyticsState analyticsState) {
    final analytics = analyticsState.analytics;

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.3,
      children: [
        _buildMetricCard(
          theme,
          'Total Revenue',
          analytics?.formattedTotalSales ?? '\$0.00',
          Icons.attach_money,
          [Colors.green.shade400, Colors.green.shade600],
          subtitle: '${analytics?.completedOrders ?? 0} paid orders',
        ),
        _buildMetricCard(
          theme,
          'Total Orders',
          '${analytics?.totalOrders ?? 0}',
          Icons.shopping_cart,
          [Colors.blue.shade400, Colors.blue.shade600],
          subtitle: '${analytics?.completedOrders ?? 0} completed',
        ),
        _buildMetricCard(
          theme,
          'Avg Order Value',
          analytics?.formattedAverageOrderValue ?? '\$0.00',
          Icons.trending_up,
          [Colors.purple.shade400, Colors.purple.shade600],
          subtitle: 'Per order',
        ),
        _buildMetricCard(
          theme,
          'Products',
          '${analytics?.totalProducts ?? 0}',
          Icons.inventory_2,
          [Colors.orange.shade400, Colors.orange.shade600],
          subtitle: 'Rating: ${analytics?.formattedRating ?? '0.0'}/5',
        ),
      ],
    );
  }

  Widget _buildMetricCard(
    ThemeData theme,
    String title,
    String value,
    IconData icon,
    List<Color> gradientColors,
    {String? subtitle}
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: gradientColors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: gradientColors[0].withValues(alpha: 0.3),
            blurRadius: 8,
            offset: const Offset(0, 4),
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
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 13,
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Icon(
                icon,
                color: Colors.white.withValues(alpha: 0.8),
                size: 24,
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 11,
                color: Colors.white.withValues(alpha: 0.9),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildOrderStatusSection(ThemeData theme, AnalyticsState analyticsState) {
    final statusBreakdown = analyticsState.analytics?.statusBreakdown;
    if (statusBreakdown == null) return const SizedBox.shrink();

    final total = statusBreakdown.total;

    // Prepare pie chart data
    final statusData = [
      {'label': 'vendorAnalytics.pending'.tr(), 'value': statusBreakdown.pending, 'color': Colors.amber},
      {'label': 'vendorAnalytics.processing'.tr(), 'value': statusBreakdown.processing, 'color': Colors.blue},
      {'label': 'vendorAnalytics.completed'.tr(), 'value': statusBreakdown.completed, 'color': Colors.green},
      {'label': 'vendorAnalytics.cancelled'.tr(), 'value': statusBreakdown.cancelled, 'color': Colors.red},
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'vendorAnalytics.orderStatus'.tr(),
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          // Pie Chart and Legend Row
          Row(
            children: [
              // Donut Chart
              SizedBox(
                width: 140,
                height: 140,
                child: total > 0
                    ? PieChart(
                        PieChartData(
                          sections: statusData.map((data) {
                            final value = data['value'] as int;
                            final color = data['color'] as Color;
                            final percentage = total > 0 ? (value / total * 100) : 0.0;
                            return PieChartSectionData(
                              color: color,
                              value: value.toDouble(),
                              title: percentage >= 5 ? '${percentage.toStringAsFixed(0)}%' : '',
                              radius: 35,
                              titleStyle: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            );
                          }).toList(),
                          sectionsSpace: 2,
                          centerSpaceRadius: 35,
                          startDegreeOffset: -90,
                        ),
                      )
                    : Center(
                        child: Text(
                          'No data',
                          style: TextStyle(color: Colors.grey.shade400),
                        ),
                      ),
              ),
              const SizedBox(width: 16),
              // Legend
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: statusData.map((data) {
                    final label = data['label'] as String;
                    final value = data['value'] as int;
                    final color = data['color'] as Color;
                    final percentage = total > 0 ? (value / total * 100) : 0.0;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              color: color,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              label,
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey.shade600,
                              ),
                            ),
                          ),
                          Text(
                            '$value',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '(${percentage.toStringAsFixed(0)}%)',
                            style: TextStyle(
                              fontSize: 10,
                              color: Colors.grey.shade500,
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Total orders info
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'vendorAnalytics.totalOrders'.tr(),
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '$total',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductStatusSection(ThemeData theme, AnalyticsState analyticsState) {
    final analytics = analyticsState.analytics;
    if (analytics == null) return const SizedBox.shrink();

    final active = analytics.productsActive;
    final draft = analytics.productsDraft;
    final outOfStock = analytics.productsOutOfStock;
    final total = active + draft + outOfStock;

    if (total == 0) return const SizedBox.shrink();

    // Prepare pie chart data
    final statusData = [
      {'label': 'vendorAnalytics.active'.tr(), 'value': active, 'color': Colors.green},
      {'label': 'vendorAnalytics.draft'.tr(), 'value': draft, 'color': Colors.grey},
      {'label': 'vendorAnalytics.outOfStock'.tr(), 'value': outOfStock, 'color': Colors.red},
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'vendorAnalytics.productStatus'.tr(),
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          // Pie Chart and Legend Row
          Row(
            children: [
              // Donut Chart
              SizedBox(
                width: 140,
                height: 140,
                child: total > 0
                    ? PieChart(
                        PieChartData(
                          sections: statusData.where((data) => (data['value'] as int) > 0).map((data) {
                            final value = data['value'] as int;
                            final color = data['color'] as Color;
                            final percentage = total > 0 ? (value / total * 100) : 0.0;
                            return PieChartSectionData(
                              color: color,
                              value: value.toDouble(),
                              title: percentage >= 5 ? '${percentage.toStringAsFixed(0)}%' : '',
                              radius: 35,
                              titleStyle: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            );
                          }).toList(),
                          sectionsSpace: 2,
                          centerSpaceRadius: 35,
                          startDegreeOffset: -90,
                        ),
                      )
                    : Center(
                        child: Text(
                          'No data',
                          style: TextStyle(color: Colors.grey.shade400),
                        ),
                      ),
              ),
              const SizedBox(width: 16),
              // Legend
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: statusData.map((data) {
                    final label = data['label'] as String;
                    final value = data['value'] as int;
                    final color = data['color'] as Color;
                    final percentage = total > 0 ? (value / total * 100) : 0.0;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              color: color,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              label,
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey.shade600,
                              ),
                            ),
                          ),
                          Text(
                            '$value',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '(${percentage.toStringAsFixed(0)}%)',
                            style: TextStyle(
                              fontSize: 10,
                              color: Colors.grey.shade500,
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Total products info
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'vendorAnalytics.totalProducts'.tr(),
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '$total',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChartCard(ThemeData theme, String title, Widget chart) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          chart,
        ],
      ),
    );
  }

  Widget _buildRevenueChart(AnalyticsState analyticsState) {
    final data = analyticsState.analytics?.revenueData ?? [];

    if (data.isEmpty) {
      return const SizedBox(
        height: 250,
        child: Center(child: Text('No revenue data available')),
      );
    }

    return SizedBox(
      height: 250,
      child: LineChart(
        LineChartData(
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            horizontalInterval: 1,
            getDrawingHorizontalLine: (value) {
              return FlLine(
                color: Colors.grey.shade200,
                strokeWidth: 1,
              );
            },
          ),
          titlesData: FlTitlesData(
            show: true,
            rightTitles: const AxisTitles(
              sideTitles: SideTitles(showTitles: false),
            ),
            topTitles: const AxisTitles(
              sideTitles: SideTitles(showTitles: false),
            ),
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 30,
                interval: 1,
                getTitlesWidget: (double value, TitleMeta meta) {
                  if (value.toInt() >= 0 && value.toInt() < data.length) {
                    return Padding(
                      padding: const EdgeInsets.only(top: 8.0),
                      child: Text(
                        data[value.toInt()].name,
                        style: TextStyle(
                          color: Colors.grey.shade600,
                          fontSize: 10,
                        ),
                      ),
                    );
                  }
                  return const Text('');
                },
              ),
            ),
            leftTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 40,
                getTitlesWidget: (double value, TitleMeta meta) {
                  return Text(
                    '\$${value.toInt()}',
                    style: TextStyle(
                      color: Colors.grey.shade600,
                      fontSize: 10,
                    ),
                  );
                },
              ),
            ),
          ),
          borderData: FlBorderData(show: false),
          minX: 0,
          maxX: (data.length - 1).toDouble(),
          minY: 0,
          maxY: data.map((e) => e.revenue).reduce((a, b) => a > b ? a : b) * 1.2,
          lineBarsData: [
            LineChartBarData(
              spots: data
                  .asMap()
                  .entries
                  .map((e) => FlSpot(e.key.toDouble(), e.value.revenue))
                  .toList(),
              isCurved: true,
              color: Colors.cyan,
              barWidth: 3,
              isStrokeCapRound: true,
              dotData: FlDotData(
                show: true,
                getDotPainter: (spot, percent, barData, index) {
                  return FlDotCirclePainter(
                    radius: 4,
                    color: Colors.cyan,
                    strokeWidth: 2,
                    strokeColor: Colors.white,
                  );
                },
              ),
              belowBarData: BarAreaData(
                show: true,
                gradient: LinearGradient(
                  colors: [
                    Colors.cyan.withValues(alpha: 0.3),
                    Colors.cyan.withValues(alpha: 0.0),
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryChart(AnalyticsState analyticsState) {
    final data = analyticsState.analytics?.categoryData ?? [];

    if (data.isEmpty) {
      return const SizedBox(
        height: 200,
        child: Center(child: Text('No category data available')),
      );
    }

    // Find max value for Y-axis scaling
    final maxValue = data.map((c) => c.value).reduce((a, b) => a > b ? a : b);
    final yAxisMax = (maxValue * 1.2).ceilToDouble();

    return SizedBox(
      height: 280,
      child: BarChart(
        BarChartData(
          alignment: BarChartAlignment.spaceAround,
          maxY: yAxisMax,
          barTouchData: BarTouchData(
            enabled: true,
            touchTooltipData: BarTouchTooltipData(
              getTooltipItem: (group, groupIndex, rod, rodIndex) {
                final category = data[group.x.toInt()];
                return BarTooltipItem(
                  '${category.name}\n${category.value.toStringAsFixed(1)}%',
                  const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                );
              },
            ),
          ),
          titlesData: FlTitlesData(
            show: true,
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                getTitlesWidget: (value, meta) {
                  final index = value.toInt();
                  if (index >= 0 && index < data.length) {
                    final name = data[index].name;
                    // Truncate long names
                    final displayName = name.length > 8 ? '${name.substring(0, 7)}...' : name;
                    return Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Transform.rotate(
                        angle: -0.5, // Slight angle for readability
                        child: Text(
                          displayName,
                          style: TextStyle(
                            color: Colors.grey.shade600,
                            fontSize: 10,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    );
                  }
                  return const Text('');
                },
                reservedSize: 40,
              ),
            ),
            leftTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                getTitlesWidget: (value, meta) {
                  return Text(
                    '${value.toInt()}%',
                    style: TextStyle(
                      color: Colors.grey.shade500,
                      fontSize: 10,
                    ),
                  );
                },
                reservedSize: 35,
              ),
            ),
            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          ),
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            horizontalInterval: yAxisMax / 4,
            getDrawingHorizontalLine: (value) {
              return FlLine(
                color: Colors.grey.shade200,
                strokeWidth: 1,
                dashArray: [5, 5],
              );
            },
          ),
          borderData: FlBorderData(show: false),
          barGroups: data.asMap().entries.map((entry) {
            final index = entry.key;
            final category = entry.value;
            return BarChartGroupData(
              x: index,
              barRods: [
                BarChartRodData(
                  toY: category.value,
                  gradient: LinearGradient(
                    colors: [
                      Colors.cyan.shade400,
                      Colors.blue.shade500,
                    ],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                  width: 24,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(6),
                    topRight: Radius.circular(6),
                  ),
                ),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildTopProducts(ThemeData theme, AnalyticsState analyticsState) {
    final products = analyticsState.analytics?.topProducts ?? [];

    return Column(
      children: products.asMap().entries.map((entry) {
        final index = entry.key;
        final product = entry.value;

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Row(
            children: [
              // Rank Badge
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: index == 0
                        ? [Colors.yellow.shade600, Colors.orange.shade600]
                        : [Colors.grey.shade400, Colors.grey.shade600],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Text(
                    '${index + 1}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
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
                      '${product.sales} sales',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),

              // Revenue & Trend
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
                  if (product.trend != 0) ...[
                    const SizedBox(height: 4),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          product.trend > 0
                              ? Icons.trending_up
                              : Icons.trending_down,
                          size: 14,
                          color: product.trend > 0 ? Colors.green : Colors.red,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${product.trend > 0 ? '+' : ''}${product.trend.toStringAsFixed(1)}%',
                          style: TextStyle(
                            fontSize: 12,
                            color: product.trend > 0 ? Colors.green : Colors.red,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildRecentOrdersSection(ThemeData theme, AnalyticsState analyticsState) {
    final shopId = analyticsState.analytics?.shopId ?? '';
    if (shopId.isEmpty) return const SizedBox.shrink();

    final ordersState = ref.watch(vendorOrderProvider(shopId));
    final recentOrders = ordersState.orders.take(5).toList();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'vendorAnalytics.recentOrders'.tr(),
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              TextButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => VendorOrdersPage(shopId: shopId),
                    ),
                  );
                },
                child: Text(
                  'vendorAnalytics.viewAll'.tr(),
                  style: TextStyle(
                    fontSize: 12,
                    color: theme.colorScheme.primary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (ordersState.isLoading)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: CircularProgressIndicator(),
              ),
            )
          else if (recentOrders.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    Icon(
                      Icons.receipt_long_outlined,
                      size: 48,
                      color: Colors.grey.shade300,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'vendorAnalytics.noRecentOrders'.tr(),
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade500,
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            ...recentOrders.map((order) => _buildOrderItem(theme, order)),
        ],
      ),
    );
  }

  Widget _buildOrderItem(ThemeData theme, dynamic order) {
    final statusColor = _getStatusColor(order.status);
    final formattedDate = DateFormat('MMM dd, yyyy').format(order.orderDate);

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          // Order Icon
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: statusColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              Icons.receipt_outlined,
              color: statusColor,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          // Order Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '#${order.orderNumber}',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  formattedDate,
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.grey.shade500,
                  ),
                ),
              ],
            ),
          ),
          // Status & Amount
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '\$${order.total.toStringAsFixed(2)}',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.primary,
                ),
              ),
              const SizedBox(height: 2),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  order.status.toUpperCase(),
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w600,
                    color: statusColor,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return Colors.orange;
      case 'processing':
        return Colors.blue;
      case 'shipped':
      case 'in_transit':
        return Colors.purple;
      case 'delivered':
      case 'completed':
        return Colors.green;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}
