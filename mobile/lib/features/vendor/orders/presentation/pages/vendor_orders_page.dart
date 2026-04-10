import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../../shared/models/order_model.dart';
import '../../../../../shared/models/delivery_man_model.dart';
import '../../../delivery/presentation/providers/delivery_man_provider.dart';
import '../providers/vendor_order_provider.dart';

class VendorOrdersPage extends ConsumerStatefulWidget {
  final String shopId;

  const VendorOrdersPage({super.key, required this.shopId});

  @override
  ConsumerState<VendorOrdersPage> createState() => _VendorOrdersPageState();
}

class _VendorOrdersPageState extends ConsumerState<VendorOrdersPage> {
  String _selectedStatus = 'all';
  String _selectedDateRange = 'all';
  String _selectedPaymentMethod = 'all';
  OrderModel? _selectedOrder;
  bool _showCancelDialog = false;
  OrderModel? _orderToCancel;
  bool _isAssigning = false;
  final _cancelReasonController = TextEditingController();
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(vendorOrderProvider(widget.shopId).notifier).loadOrders();
    });
  }

  @override
  void dispose() {
    _cancelReasonController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final orderState = ref.watch(vendorOrderProvider(widget.shopId));

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      body: Stack(
        children: [
          Column(
            children: [
              // Statistics Cards
              _buildStatisticsCards(theme, orderState),

              // Search and Filter Toolbar
              _buildSearchAndFilterToolbar(theme, orderState),

              // Status Filter Tabs
              _buildStatusTabs(theme),

              // Orders List
              Expanded(
                child: orderState.isLoading && orderState.orders.isEmpty
                    ? const Center(child: CircularProgressIndicator())
                    : orderState.filteredOrders.isEmpty
                        ? _buildEmptyState(theme)
                        : RefreshIndicator(
                            onRefresh: () => ref.read(vendorOrderProvider(widget.shopId).notifier).refreshOrders(),
                            child: ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: orderState.filteredOrders.length,
                              itemBuilder: (context, index) {
                                return _buildOrderCard(
                                  context,
                                  theme,
                                  orderState.filteredOrders[index],
                                );
                              },
                            ),
                          ),
              ),
            ],
          ),

          // Order Details Modal
          if (_selectedOrder != null) _buildOrderDetailsModal(context, theme),

          // Cancel Dialog
          if (_showCancelDialog && _orderToCancel != null) _buildCancelDialog(context, theme),
        ],
      ),
    );
  }

  Widget _buildOrderDetailsModal(BuildContext context, ThemeData theme) {
    return Material(
      color: Colors.black54,
      child: Center(
        child: Container(
          margin: const EdgeInsets.all(16),
          constraints: const BoxConstraints(maxWidth: 600, maxHeight: 600),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(color: Colors.grey.shade200),
                  ),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('orders.orderDetails'.tr(),
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            'Order #${_selectedOrder!.orderNumber}',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey.shade600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () {
                        setState(() {
                          _selectedOrder = null;
                        });
                      },
                      icon: const Icon(Icons.close),
                    ),
                  ],
                ),
              ),

              // Content
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    // Status
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Status',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey.shade600,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _selectedOrder!.statusLabel,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Shipping Address
                    Text('checkout.shippingAddress'.tr(),
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _selectedOrder!.shippingAddress.fullAddress,
                      style: const TextStyle(fontSize: 14),
                    ),
                    const Divider(height: 32),

                    // Order Items
                    Text(
                      'Order Items',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    ..._selectedOrder!.items.map((item) {
                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade50,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.productName,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Qty: ${item.quantity}',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey.shade600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Text(
                              '\$${item.subtotal.toStringAsFixed(2)}',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      );
                    }),
                    const Divider(height: 32),

                    // Payment Summary
                    Text(
                      'Payment Summary',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    _buildSummaryRow('Subtotal', '\$${_selectedOrder!.subtotal.toStringAsFixed(2)}'),
                    _buildSummaryRow('Shipping', '\$${_selectedOrder!.shipping.toStringAsFixed(2)}'),
                    _buildSummaryRow('Tax', '\$${_selectedOrder!.tax.toStringAsFixed(2)}'),
                    if (_selectedOrder!.discount > 0)
                      _buildSummaryRow(
                        'Discount',
                        '-\$${_selectedOrder!.discount.toStringAsFixed(2)}',
                        color: Colors.green,
                      ),
                    const Divider(height: 16),
                    _buildSummaryRow(
                      'Total',
                      '\$${_selectedOrder!.total.toStringAsFixed(2)}',
                      isTotal: true,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isTotal = false, Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: isTotal ? 16 : 14,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              color: color,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: isTotal ? 18 : 14,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCancelDialog(BuildContext context, ThemeData theme) {
    return Material(
      color: Colors.black54,
      child: Center(
        child: Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(24),
          constraints: const BoxConstraints(maxWidth: 400),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      Icons.cancel,
                      color: Colors.red.shade700,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('orders.cancelOrder'.tr(),
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Order #${_orderToCancel!.orderNumber}',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              const Text(
                'Are you sure you want to cancel this order? Please provide a reason:',
                style: TextStyle(fontSize: 14),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _cancelReasonController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Enter cancellation reason...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        setState(() {
                          _showCancelDialog = false;
                          _orderToCancel = null;
                          _cancelReasonController.clear();
                        });
                      },
                      child: Text('common.close'.tr()),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _handleCancelOrder,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Confirm Cancel'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatisticsCards(ThemeData theme, VendorOrderState orderState) {
    return Container(
      padding: const EdgeInsets.all(16),
      color: Colors.white,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _buildStatCard(
              'Total',
              '${orderState.totalOrders}',
              Icons.shopping_bag,
              Colors.blue,
              theme,
            ),
            const SizedBox(width: 12),
            _buildStatCard(
              'Pending',
              '${orderState.pendingOrders}',
              Icons.schedule,
              Colors.orange,
              theme,
            ),
            const SizedBox(width: 12),
            _buildStatCard(
              'Processing',
              '${orderState.processingOrders}',
              Icons.autorenew,
              Colors.blue,
              theme,
            ),
            const SizedBox(width: 12),
            _buildStatCard(
              'Shipped',
              '${orderState.shippedOrders}',
              Icons.local_shipping,
              Colors.purple,
              theme,
            ),
            const SizedBox(width: 12),
            _buildStatCard(
              'Delivered',
              '${orderState.deliveredOrders}',
              Icons.check_circle,
              Colors.green,
              theme,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchAndFilterToolbar(ThemeData theme, VendorOrderState orderState) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: Colors.white,
      child: Column(
        children: [
          // Search Bar
          TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: 'Search by order number or address...',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear),
                      onPressed: () {
                        _searchController.clear();
                        ref.read(vendorOrderProvider(widget.shopId).notifier).setSearchQuery('');
                      },
                    )
                  : null,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey.shade300),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey.shade300),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: theme.colorScheme.primary),
              ),
              filled: true,
              fillColor: Colors.grey.shade50,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
            onChanged: (value) {
              ref.read(vendorOrderProvider(widget.shopId).notifier).setSearchQuery(value);
              setState(() {}); // Refresh for suffix icon
            },
          ),
          const SizedBox(height: 12),
          // Filter Row
          Row(
            children: [
              // Date Range Filter
              Expanded(
                child: InkWell(
                  onTap: () => _showDateRangeFilterSheet(theme),
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey.shade300),
                      borderRadius: BorderRadius.circular(8),
                      color: _selectedDateRange != 'all' ? theme.colorScheme.primary.withValues(alpha: 0.1) : null,
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.calendar_today,
                          size: 18,
                          color: _selectedDateRange != 'all' ? theme.colorScheme.primary : Colors.grey.shade600,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _getDateRangeLabel(_selectedDateRange),
                            style: TextStyle(
                              fontSize: 14,
                              color: _selectedDateRange != 'all' ? theme.colorScheme.primary : Colors.grey.shade700,
                              fontWeight: _selectedDateRange != 'all' ? FontWeight.w600 : FontWeight.normal,
                            ),
                          ),
                        ),
                        Icon(
                          Icons.arrow_drop_down,
                          color: _selectedDateRange != 'all' ? theme.colorScheme.primary : Colors.grey.shade600,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Payment Method Filter
              Expanded(
                child: InkWell(
                  onTap: () => _showPaymentMethodFilterSheet(theme),
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey.shade300),
                      borderRadius: BorderRadius.circular(8),
                      color: _selectedPaymentMethod != 'all' ? theme.colorScheme.primary.withValues(alpha: 0.1) : null,
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.payment,
                          size: 18,
                          color: _selectedPaymentMethod != 'all' ? theme.colorScheme.primary : Colors.grey.shade600,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _getPaymentMethodLabel(_selectedPaymentMethod),
                            style: TextStyle(
                              fontSize: 14,
                              color: _selectedPaymentMethod != 'all' ? theme.colorScheme.primary : Colors.grey.shade700,
                              fontWeight: _selectedPaymentMethod != 'all' ? FontWeight.w600 : FontWeight.normal,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Icon(
                          Icons.arrow_drop_down,
                          color: _selectedPaymentMethod != 'all' ? theme.colorScheme.primary : Colors.grey.shade600,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _getDateRangeLabel(String range) {
    switch (range) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'year':
        return 'This Year';
      default:
        return 'All Time';
    }
  }

  String _getPaymentMethodLabel(String method) {
    switch (method.toLowerCase()) {
      case 'cash':
        return 'Cash';
      case 'card':
        return 'Card';
      case 'stripe':
        return 'Stripe';
      case 'paypal':
        return 'PayPal';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'cod':
        return 'Cash on Delivery';
      default:
        return 'All Methods';
    }
  }

  void _showPaymentMethodFilterSheet(ThemeData theme) {
    final paymentMethods = [
      {'value': 'all', 'label': 'All Methods', 'icon': Icons.all_inclusive},
      {'value': 'cash', 'label': 'Cash', 'icon': Icons.money},
      {'value': 'card', 'label': 'Card', 'icon': Icons.credit_card},
      {'value': 'stripe', 'label': 'Stripe', 'icon': Icons.payment},
      {'value': 'paypal', 'label': 'PayPal', 'icon': Icons.account_balance_wallet},
      {'value': 'bank_transfer', 'label': 'Bank Transfer', 'icon': Icons.account_balance},
      {'value': 'cod', 'label': 'Cash on Delivery', 'icon': Icons.local_shipping},
    ];

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          decoration: BoxDecoration(
            color: theme.scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Handle bar
              Center(
                child: Container(
                  margin: const EdgeInsets.only(top: 12),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Icon(Icons.payment, color: theme.colorScheme.primary),
                    const SizedBox(width: 12),
                    const Text(
                      'Filter by Payment Method',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              ...paymentMethods.map((method) {
                final isSelected = _selectedPaymentMethod == method['value'];
                return ListTile(
                  onTap: () {
                    setState(() {
                      _selectedPaymentMethod = method['value'] as String;
                    });
                    ref.read(vendorOrderProvider(widget.shopId).notifier).setPaymentMethod(method['value'] as String);
                    Navigator.pop(context);
                  },
                  leading: Icon(
                    method['icon'] as IconData,
                    color: isSelected ? theme.colorScheme.primary : Colors.grey.shade600,
                  ),
                  title: Text(
                    method['label'] as String,
                    style: TextStyle(
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      color: isSelected ? theme.colorScheme.primary : null,
                    ),
                  ),
                  trailing: isSelected
                      ? Icon(Icons.check_circle, color: theme.colorScheme.primary)
                      : null,
                );
              }),
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    );
  }

  void _showDateRangeFilterSheet(ThemeData theme) {
    final dateRanges = [
      {'value': 'all', 'label': 'All Time', 'icon': Icons.all_inclusive},
      {'value': 'today', 'label': 'Today', 'icon': Icons.today},
      {'value': 'week', 'label': 'This Week', 'icon': Icons.date_range},
      {'value': 'month', 'label': 'This Month', 'icon': Icons.calendar_month},
      {'value': 'year', 'label': 'This Year', 'icon': Icons.calendar_today},
    ];

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          decoration: BoxDecoration(
            color: theme.scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Handle bar
              Center(
                child: Container(
                  margin: const EdgeInsets.only(top: 12),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Icon(Icons.filter_list, color: theme.colorScheme.primary),
                    const SizedBox(width: 12),
                    const Text(
                      'Filter by Date Range',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              ...dateRanges.map((range) {
                final isSelected = _selectedDateRange == range['value'];
                return ListTile(
                  onTap: () {
                    setState(() {
                      _selectedDateRange = range['value'] as String;
                    });
                    ref.read(vendorOrderProvider(widget.shopId).notifier).setDateRange(range['value'] as String);
                    Navigator.pop(context);
                  },
                  leading: Icon(
                    range['icon'] as IconData,
                    color: isSelected ? theme.colorScheme.primary : Colors.grey.shade600,
                  ),
                  title: Text(
                    range['label'] as String,
                    style: TextStyle(
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      color: isSelected ? theme.colorScheme.primary : null,
                    ),
                  ),
                  trailing: isSelected
                      ? Icon(Icons.check_circle, color: theme.colorScheme.primary)
                      : null,
                );
              }),
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatCard(
    String label,
    String value,
    IconData icon,
    Color color,
    ThemeData theme,
  ) {
    return Container(
      width: 80,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              color: Colors.grey.shade700,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildStatusTabs(ThemeData theme) {
    final statuses = [
      {'value': 'all', 'label': 'All'},
      {'value': 'pending', 'label': 'Pending'},
      {'value': 'processing', 'label': 'Processing'},
      {'value': 'shipped', 'label': 'Shipped'},
      {'value': 'delivered', 'label': 'Delivered'},
      {'value': 'cancelled', 'label': 'Cancelled'},
    ];

    return Container(
      height: 50,
      color: Colors.white,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        scrollDirection: Axis.horizontal,
        itemCount: statuses.length,
        separatorBuilder: (context, index) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final status = statuses[index];
          final isSelected = _selectedStatus == status['value'];
          return FilterChip(
            label: Text(status['label']!),
            selected: isSelected,
            onSelected: (selected) {
              setState(() {
                _selectedStatus = status['value']!;
              });
              ref.read(vendorOrderProvider(widget.shopId).notifier).filterByStatus(
                    status['value'] == 'all' ? null : status['value'],
                  );
            },
            selectedColor: theme.colorScheme.primary.withValues(alpha: 0.2),
            checkmarkColor: theme.colorScheme.primary,
            labelStyle: TextStyle(
              color: isSelected ? theme.colorScheme.primary : Colors.grey.shade700,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            ),
          );
        },
      ),
    );
  }

  Widget _buildOrderCard(BuildContext context, ThemeData theme, OrderModel order) {
    final statusColors = _getStatusColors(order.status);

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: InkWell(
        onTap: () {
          setState(() {
            _selectedOrder = order;
          });
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Order Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Order #${order.orderNumber}',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _formatDate(order.orderDate),
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: statusColors['bg'],
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          statusColors['icon'] as IconData,
                          size: 14,
                          color: statusColors['color'],
                        ),
                        const SizedBox(width: 4),
                        Text(
                          order.statusLabel,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: statusColors['color'],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const Divider(height: 24),

              // Order Items Preview
              Text(
                '${order.items.length} ${order.items.length == 1 ? 'item' : 'items'}',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey.shade600,
                ),
              ),
              const SizedBox(height: 8),
              ...order.items.take(2).map((item) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          '${item.quantity}x ${item.productName}',
                          style: const TextStyle(fontSize: 14),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Text(
                        '\$${item.subtotal.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                );
              }),
              if (order.items.length > 2)
                Text(
                  '+${order.items.length - 2} more',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),

              const Divider(height: 24),

              // Total and Actions
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('cart.total'.tr(),
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '\$${order.total.toStringAsFixed(2)}',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: theme.colorScheme.primary,
                        ),
                      ),
                    ],
                  ),
                  Wrap(
                    spacing: 8,
                    children: [
                      if (order.status.toLowerCase() == 'pending')
                        ElevatedButton.icon(
                          onPressed: () => _handleAcceptOrder(order),
                          icon: const Icon(Icons.check_circle, size: 16),
                          label: Text('delivery.accept'.tr()),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          ),
                        ),
                      if (order.status.toLowerCase() == 'processing')
                        ElevatedButton.icon(
                          onPressed: () => _handleMarkAsShipped(order),
                          icon: const Icon(Icons.local_shipping, size: 16),
                          label: const Text('Ship'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: theme.colorScheme.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          ),
                        ),
                      // Assign Delivery Man button - show for orders not delivered/cancelled
                      if (!['delivered', 'cancelled', 'refunded', 'returned', 'pending'].contains(order.status.toLowerCase()))
                        ElevatedButton.icon(
                          onPressed: _isAssigning ? null : () => _showAssignDeliveryManDialog(order),
                          icon: _isAssigning
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              : Icon(
                                  order.deliveryMan != null ? Icons.swap_horiz : Icons.person_add,
                                  size: 16,
                                ),
                          label: Text(order.deliveryMan != null ? 'Reassign' : 'Assign'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.orange,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          ),
                        ),
                      if (order.status.toLowerCase() == 'pending' ||
                          order.status.toLowerCase() == 'processing')
                        IconButton(
                          onPressed: () {
                            setState(() {
                              _orderToCancel = order;
                              _showCancelDialog = true;
                            });
                          },
                          icon: const Icon(Icons.cancel, color: Colors.red),
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
  }

  Widget _buildEmptyState(ThemeData theme) {
    final orderState = ref.watch(vendorOrderProvider(widget.shopId));
    final hasFilters = orderState.hasActiveFilters;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              hasFilters ? Icons.filter_list_off : Icons.shopping_bag_outlined,
              size: 100,
              color: Colors.grey.shade300,
            ),
            const SizedBox(height: 24),
            Text(
              hasFilters ? 'No Matching Orders' : 'No Orders Found',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.grey.shade700,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              hasFilters
                  ? 'Try adjusting your filters to see more orders'
                  : 'Orders will appear here once customers start purchasing',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey.shade600,
              ),
            ),
            if (hasFilters) ...[
              const SizedBox(height: 24),
              OutlinedButton.icon(
                onPressed: () {
                  setState(() {
                    _searchController.clear();
                    _selectedStatus = 'all';
                    _selectedDateRange = 'all';
                    _selectedPaymentMethod = 'all';
                  });
                  ref.read(vendorOrderProvider(widget.shopId).notifier).clearFilters();
                },
                icon: const Icon(Icons.clear_all),
                label: const Text('Clear All Filters'),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Map<String, dynamic> _getStatusColors(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          'color': Colors.orange.shade700,
          'bg': Colors.orange.shade50,
          'icon': Icons.schedule,
        };
      case 'processing':
        return {
          'color': Colors.blue.shade700,
          'bg': Colors.blue.shade50,
          'icon': Icons.autorenew,
        };
      case 'confirmed':
        return {
          'color': Colors.green.shade700,
          'bg': Colors.green.shade50,
          'icon': Icons.check_circle,
        };
      case 'shipped':
      case 'in_transit':
        return {
          'color': Colors.purple.shade700,
          'bg': Colors.purple.shade50,
          'icon': Icons.local_shipping,
        };
      case 'out_for_delivery':
        return {
          'color': Colors.indigo.shade700,
          'bg': Colors.indigo.shade50,
          'icon': Icons.delivery_dining,
        };
      case 'delivered':
        return {
          'color': Colors.green.shade700,
          'bg': Colors.green.shade50,
          'icon': Icons.check_circle,
        };
      case 'cancelled':
        return {
          'color': Colors.red.shade700,
          'bg': Colors.red.shade50,
          'icon': Icons.cancel,
        };
      default:
        return {
          'color': Colors.grey.shade700,
          'bg': Colors.grey.shade100,
          'icon': Icons.help_outline,
        };
    }
  }

  String _formatDate(DateTime date) {
    return DateFormat('MMM dd, yyyy HH:mm').format(date);
  }

  Future<void> _handleAcceptOrder(OrderModel order) async {
    final success = await ref.read(vendorOrderProvider(widget.shopId).notifier).acceptOrder(order.id);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            success ? 'Order accepted successfully' : 'Failed to accept order',
          ),
          backgroundColor: success ? Colors.green : Colors.red,
        ),
      );
    }
  }

  Future<void> _handleMarkAsShipped(OrderModel order) async {
    final success = await ref.read(vendorOrderProvider(widget.shopId).notifier).markAsShipped(order.id);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            success ? 'Order marked as shipped' : 'Failed to mark as shipped',
          ),
          backgroundColor: success ? Colors.green : Colors.red,
        ),
      );
    }
  }

  Future<void> _showAssignDeliveryManDialog(OrderModel order) async {
    // Load delivery men
    await ref.read(deliveryManProvider(widget.shopId).notifier).loadDeliveryMen();

    if (!mounted) return;

    final deliveryManState = ref.read(deliveryManProvider(widget.shopId));
    final deliveryMen = deliveryManState.deliveryMen;

    if (deliveryMen.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('No delivery men available. Please add delivery men first.'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    DeliveryManModel? selectedDeliveryMan;
    final deliveryFeeController = TextEditingController(text: '5.00');

    final result = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            final theme = Theme.of(context);
            return Container(
              decoration: BoxDecoration(
                color: theme.scaffoldBackgroundColor,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              ),
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Handle bar
                  Center(
                    child: Container(
                      margin: const EdgeInsets.only(top: 12),
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  // Header
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Icon(Icons.delivery_dining, color: theme.colorScheme.primary),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Assign Delivery Man',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                'Order #${order.orderNumber}',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 1),
                  // Delivery Men List
                  ConstrainedBox(
                    constraints: BoxConstraints(
                      maxHeight: MediaQuery.of(context).size.height * 0.4,
                    ),
                    child: ListView.builder(
                      shrinkWrap: true,
                      itemCount: deliveryMen.length,
                      itemBuilder: (context, index) {
                        final dm = deliveryMen[index];
                        final isSelected = selectedDeliveryMan?.id == dm.id;
                        final isActive = dm.status.toLowerCase() == 'active';

                        return ListTile(
                          onTap: () {
                            setModalState(() {
                              selectedDeliveryMan = dm;
                            });
                          },
                          leading: CircleAvatar(
                            backgroundColor: isSelected
                                ? theme.colorScheme.primary
                                : Colors.grey.shade200,
                            child: Icon(
                              Icons.person,
                              color: isSelected ? Colors.white : Colors.grey,
                            ),
                          ),
                          title: Text(
                            dm.name,
                            style: TextStyle(
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            ),
                          ),
                          subtitle: Text(dm.phone.isNotEmpty ? dm.fullPhone : 'No phone'),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: isActive
                                      ? Colors.green.withValues(alpha: 0.1)
                                      : Colors.grey.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  isActive ? 'Active' : 'Inactive',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: isActive ? Colors.green : Colors.grey,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                              if (isSelected) ...[
                                const SizedBox(width: 8),
                                Icon(Icons.check_circle, color: theme.colorScheme.primary),
                              ],
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                  // Delivery Fee
                  if (selectedDeliveryMan != null) ...[
                    const Divider(height: 1),
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: TextField(
                        controller: deliveryFeeController,
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        decoration: const InputDecoration(
                          labelText: 'Delivery Fee',
                          prefixText: '\$ ',
                          border: OutlineInputBorder(),
                          helperText: 'Amount paid to delivery man',
                        ),
                      ),
                    ),
                  ],
                  // Actions
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => Navigator.pop(context),
                            child: Text('common.cancel'.tr()),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: selectedDeliveryMan == null
                                ? null
                                : () {
                                    Navigator.pop(context, {
                                      'deliveryMan': selectedDeliveryMan,
                                      'deliveryFee': double.tryParse(deliveryFeeController.text) ?? 5.0,
                                    });
                                  },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: theme.colorScheme.primary,
                              foregroundColor: Colors.white,
                            ),
                            child: const Text('Assign'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );

    deliveryFeeController.dispose();

    if (result == null) return;

    final deliveryMan = result['deliveryMan'] as DeliveryManModel;
    final deliveryFee = result['deliveryFee'] as double;

    setState(() {
      _isAssigning = true;
    });

    try {
      final success = await ref.read(deliveryManProvider(widget.shopId).notifier).assignOrderToDeliveryMan(
        orderId: order.id,
        deliveryManId: deliveryMan.id,
        notes: 'Delivery Fee: \$${deliveryFee.toStringAsFixed(2)}',
      );

      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Assigned to ${deliveryMan.name} successfully'),
            backgroundColor: Colors.green,
          ),
        );
        // Refresh orders
        ref.read(vendorOrderProvider(widget.shopId).notifier).refreshOrders();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to assign: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isAssigning = false;
        });
      }
    }
  }

  Future<void> _handleCancelOrder() async {
    if (_orderToCancel == null || _cancelReasonController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please provide a cancellation reason'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final success = await ref
        .read(vendorOrderProvider(widget.shopId).notifier)
        .cancelOrder(_orderToCancel!.id, _cancelReasonController.text.trim());

    if (mounted) {
      setState(() {
        _showCancelDialog = false;
        _orderToCancel = null;
        _cancelReasonController.clear();
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            success ? 'Order cancelled successfully' : 'Failed to cancel order',
          ),
          backgroundColor: success ? Colors.green : Colors.red,
        ),
      );
    }
  }
}
