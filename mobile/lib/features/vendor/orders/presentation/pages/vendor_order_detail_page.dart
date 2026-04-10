import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../../shared/models/order_model.dart';
import '../../../../../shared/models/delivery_man_model.dart';
import '../../../../../shared/repositories/vendor_order_repository.dart';
import '../../../delivery/presentation/providers/delivery_man_provider.dart';
import '../providers/vendor_order_provider.dart';

class VendorOrderDetailPage extends ConsumerStatefulWidget {
  final String orderId;
  final String shopId;

  const VendorOrderDetailPage({
    super.key,
    required this.orderId,
    required this.shopId,
  });

  @override
  ConsumerState<VendorOrderDetailPage> createState() => _VendorOrderDetailPageState();
}

class _VendorOrderDetailPageState extends ConsumerState<VendorOrderDetailPage> {
  OrderModel? _order;
  bool _isLoading = true;
  String? _error;
  bool _isAssigning = false;
  final _cancelReasonController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadOrder();
  }

  @override
  void dispose() {
    _cancelReasonController.dispose();
    super.dispose();
  }

  Future<void> _loadOrder() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final orders = await VendorOrderRepository().getVendorOrders(
        shopId: widget.shopId,
        limit: 100,
      );
      final order = orders.firstWhere((o) => o.id == widget.orderId);

      if (mounted) {
        setState(() {
          _order = order;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _acceptOrder() async {
    try {
      await ref.read(vendorOrderProvider(widget.shopId).notifier).acceptOrder(widget.orderId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Order accepted successfully'),
            backgroundColor: Colors.green,
          ),
        );
        _loadOrder();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error accepting order: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _markAsShipped() async {
    final trackingNumber = await showDialog<String>(
      context: context,
      builder: (context) {
        final controller = TextEditingController();
        return AlertDialog(
          title: const Text('Mark as Shipped'),
          content: TextField(
            controller: controller,
            decoration: const InputDecoration(
              labelText: 'Tracking Number (Optional)',
              hintText: 'Enter tracking number',
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('common.cancel'.tr()),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context, controller.text),
              child: Text('common.confirm'.tr()),
            ),
          ],
        );
      },
    );

    if (trackingNumber == null) return;

    try {
      await ref.read(vendorOrderProvider(widget.shopId).notifier).markAsShipped(
        widget.orderId,
        trackingNumber: trackingNumber.isNotEmpty ? trackingNumber : null,
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Order marked as shipped'),
            backgroundColor: Colors.green,
          ),
        );
        _loadOrder();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error marking as shipped: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _cancelOrder() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('orders.cancelOrder'.tr()),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Please provide a reason for cancellation:'),
            const SizedBox(height: 16),
            TextField(
              controller: _cancelReasonController,
              decoration: const InputDecoration(
                labelText: 'Reason',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('common.back'.tr()),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: Text('orders.cancelOrder'.tr()),
          ),
        ],
      ),
    );

    if (confirmed != true || _cancelReasonController.text.trim().isEmpty) {
      if (mounted && confirmed == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Please provide a cancellation reason'),
            backgroundColor: Colors.orange,
          ),
        );
      }
      return;
    }

    try {
      await ref.read(vendorOrderProvider(widget.shopId).notifier).cancelOrder(
        widget.orderId,
        _cancelReasonController.text.trim(),
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Order cancelled'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error cancelling order: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _showAssignDeliveryManDialog() async {
    // Load delivery men
    await ref.read(deliveryManProvider(widget.shopId).notifier).loadDeliveryMen();

    if (!mounted) return;

    final deliveryManState = ref.read(deliveryManProvider(widget.shopId));
    final deliveryMen = deliveryManState.deliveryMen;

    if (deliveryMen.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('vendor.delivery.noDeliveryMen'.tr()),
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
                        Text(
                          'vendor.delivery.assignDeliveryMan'.tr(),
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
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
                        decoration: InputDecoration(
                          labelText: 'vendor.delivery.deliveryFee'.tr(),
                          prefixText: '\$ ',
                          border: const OutlineInputBorder(),
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
                            child: Text('vendor.delivery.assign'.tr()),
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
        orderId: widget.orderId,
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
        _loadOrder();
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

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(_order != null ? 'Order #${_order!.orderNumber}' : 'Order Details'),
        actions: _order != null
            ? [
                PopupMenuButton<String>(
                  onSelected: (value) {
                    switch (value) {
                      case 'cancel':
                        _cancelOrder();
                        break;
                    }
                  },
                  itemBuilder: (context) => [
                    if (_order!.status.toLowerCase() != 'cancelled' &&
                        _order!.status.toLowerCase() != 'delivered')
                      PopupMenuItem(
                        value: 'cancel',
                        child: Row(
                          children: [
                            const Icon(Icons.cancel, color: Colors.red),
                            const SizedBox(width: 8),
                            Text('orders.cancelOrder'.tr(), style: const TextStyle(color: Colors.red)),
                          ],
                        ),
                      ),
                  ],
                ),
              ]
            : null,
      ),
      body: _buildBody(theme),
      bottomNavigationBar: _order != null ? _buildActionButtons(theme) : null,
    );
  }

  Widget _buildBody(ThemeData theme) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              const Text(
                'Error loading order',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Text(
                _error!,
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey.shade600),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _loadOrder,
                child: Text('common.retry'.tr()),
              ),
            ],
          ),
        ),
      );
    }

    if (_order == null) {
      return const Center(child: Text('Order not found'));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Order Status
          _buildStatusCard(theme),
          const SizedBox(height: 16),

          // Customer Info
          _buildInfoCard(
            theme,
            'Customer Information',
            Icons.person,
            [
              _buildInfoRow('Name', _order!.shippingAddress.fullName),
              _buildInfoRow('Phone', _order!.shippingAddress.phone),
            ],
          ),
          const SizedBox(height: 16),

          // Shipping Address
          _buildInfoCard(
            theme,
            'Shipping Address',
            Icons.location_on,
            [
              Text(
                _order!.shippingAddress.fullAddress,
                style: const TextStyle(fontSize: 16),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Delivery Man Info
          _buildDeliveryManCard(theme),
          const SizedBox(height: 16),

          // Order Items
          _buildItemsCard(theme),
          const SizedBox(height: 16),

          // Order Summary
          _buildSummaryCard(theme),
        ],
      ),
    );
  }

  Widget _buildStatusCard(ThemeData theme) {
    Color statusColor;
    switch (_order!.status.toLowerCase()) {
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

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('orders.orderStatus'.tr(),
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: statusColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        _order!.statusLabel,
                        style: TextStyle(
                          color: statusColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('orders.orderDate'.tr(),
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      DateFormat('MMM dd, yyyy').format(_order!.orderDate),
                      style: const TextStyle(
                        fontSize: 16,
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
    );
  }

  Widget _buildInfoCard(
    ThemeData theme,
    String title,
    IconData icon,
    List<Widget> children,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: theme.colorScheme.primary),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                color: Colors.grey,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildItemsCard(ThemeData theme) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.shopping_bag, color: theme.colorScheme.primary),
                const SizedBox(width: 8),
                const Text(
                  'Order Items',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ..._order!.items.map((item) =>
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  children: [
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade200,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.image),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.productName,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Qty: ${item.quantity}',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey.shade600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      '\$${item.price.toStringAsFixed(2)}',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: theme.colorScheme.primary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryCard(ThemeData theme) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('checkout.orderSummary'.tr(),
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            _buildSummaryRow('Subtotal', '\$${_order!.subtotal.toStringAsFixed(2)}'),
            _buildSummaryRow('Shipping', '\$${_order!.shipping.toStringAsFixed(2)}'),
            _buildSummaryRow('Tax', '\$${_order!.tax.toStringAsFixed(2)}'),
            if (_order!.discount > 0)
              _buildSummaryRow(
                'Discount',
                '-\$${_order!.discount.toStringAsFixed(2)}',
                isDiscount: true,
              ),
            const Divider(height: 24),
            _buildSummaryRow(
              'Total',
              '\$${_order!.total.toStringAsFixed(2)}',
              isTotal: true,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isTotal = false, bool isDiscount = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: isTotal ? 18 : 16,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              color: isTotal ? Colors.black : Colors.grey.shade700,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: isTotal ? 20 : 16,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.w600,
              color: isDiscount ? Colors.red : (isTotal ? Colors.black : Colors.grey.shade900),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDeliveryManCard(ThemeData theme) {
    final deliveryMan = _order!.deliveryMan;
    final status = _order!.status.toLowerCase();
    // Allow assignment for orders that are not yet delivered or cancelled
    final canAssign = !['delivered', 'cancelled', 'refunded', 'returned'].contains(status);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.delivery_dining, color: theme.colorScheme.primary),
                const SizedBox(width: 8),
                const Text(
                  'Delivery Man',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (deliveryMan != null) ...[
              // Show assigned delivery man
              Row(
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: theme.colorScheme.primary.withValues(alpha: 0.1),
                    backgroundImage: deliveryMan.imageUrl != null
                        ? NetworkImage(deliveryMan.imageUrl!)
                        : null,
                    child: deliveryMan.imageUrl == null
                        ? Icon(Icons.person, color: theme.colorScheme.primary)
                        : null,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          deliveryMan.name,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        if (deliveryMan.phone != null)
                          Text(
                            deliveryMan.phone!,
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey.shade600,
                            ),
                          ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.green.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'Assigned',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.green,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              if (canAssign) ...[
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: _isAssigning ? null : _showAssignDeliveryManDialog,
                    icon: _isAssigning
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.swap_horiz),
                    label: const Text('Change Delivery Man'),
                  ),
                ),
              ],
            ] else if (canAssign) ...[
              // No delivery man assigned - show assign button
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.orange.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.orange.withValues(alpha: 0.3)),
                ),
                child: Column(
                  children: [
                    Icon(
                      Icons.warning_amber_rounded,
                      color: Colors.orange.shade700,
                      size: 32,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'No delivery man assigned',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Colors.orange.shade700,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton.icon(
                      onPressed: _isAssigning ? null : _showAssignDeliveryManDialog,
                      icon: _isAssigning
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.person_add),
                      label: const Text('Assign Delivery Man'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.orange,
                        foregroundColor: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ] else ...[
              // Not in a state where assignment is possible
              Text(
                'Not applicable for this order status',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey.shade600,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget? _buildActionButtons(ThemeData theme) {
    final status = _order!.status.toLowerCase();

    if (status == 'cancelled' || status == 'delivered') {
      return null;
    }

    List<Widget> buttons = [];

    if (status == 'pending') {
      buttons.add(
        Expanded(
          child: ElevatedButton(
            onPressed: _acceptOrder,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            child: const Text('Accept Order'),
          ),
        ),
      );
    } else if (status == 'processing') {
      buttons.add(
        Expanded(
          child: ElevatedButton(
            onPressed: _markAsShipped,
            style: ElevatedButton.styleFrom(
              backgroundColor: theme.colorScheme.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            child: const Text('Mark as Shipped'),
          ),
        ),
      );
    }

    if (buttons.isEmpty) {
      return null;
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 4,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: buttons,
      ),
    );
  }
}
