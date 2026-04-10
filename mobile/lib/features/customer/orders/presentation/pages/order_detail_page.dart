import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../../shared/models/order_model.dart';
import '../providers/order_provider.dart';
import '../../../cart/presentation/providers/cart_provider.dart';

class OrderDetailPage extends ConsumerWidget {
  final OrderModel order;

  const OrderDetailPage({super.key, required this.order});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final statusColors = _getStatusColors(order.status);

    return Scaffold(
      appBar: AppBar(
        title: Text('Order #${order.orderNumber}'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order Status Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              color: statusColors['bg'],
              child: Column(
                children: [
                  Icon(
                    statusColors['icon'] as IconData,
                    size: 60,
                    color: statusColors['color'],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    order.statusLabel,
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: statusColors['color'],
                    ),
                  ),
                  const SizedBox(height: 8),
                  if (order.estimatedDelivery != null)
                    Text(
                      'Estimated Delivery: ${_formatDate(order.estimatedDelivery!)}',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade700,
                      ),
                    ),
                  if (order.deliveryDate != null)
                    Text(
                      'Delivered on: ${_formatDate(order.deliveryDate!)}',
                      style: const TextStyle(
                        fontSize: 14,
                        color: Colors.green,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                ],
              ),
            ),

            // Order Items
            _buildSection(
              context,
              theme,
              'Order Items',
              Column(
                children: order.items.map((item) {
                  return _buildOrderItem(context, theme, item);
                }).toList(),
              ),
            ),

            // Shipping Address
            _buildSection(
              context,
              theme,
              'Shipping Address',
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.person, size: 16, color: Colors.grey.shade600),
                      const SizedBox(width: 8),
                      Text(
                        order.shippingAddress.fullName,
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.phone, size: 16, color: Colors.grey.shade600),
                      const SizedBox(width: 8),
                      Text(order.shippingAddress.phone),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(Icons.location_on, size: 16, color: Colors.grey.shade600),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(order.shippingAddress.fullAddress),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Payment Information
            _buildSection(
              context,
              theme,
              'Payment Information',
              Column(
                children: [
                  _buildInfoRow('Payment Method', _getPaymentMethodLabel(order.paymentMethod)),
                  const Divider(height: 20),
                  _buildInfoRow('Subtotal', '\$${order.subtotal.toStringAsFixed(2)}'),
                  if (order.discount > 0)
                    _buildInfoRow(
                      'Discount',
                      '-\$${order.discount.toStringAsFixed(2)}',
                      valueColor: Colors.green,
                    ),
                  _buildInfoRow(
                    'Shipping',
                    order.shipping > 0
                        ? '\$${order.shipping.toStringAsFixed(2)}'
                        : 'FREE',
                    valueColor: order.shipping == 0 ? Colors.green : null,
                  ),
                  _buildInfoRow('Tax', '\$${order.tax.toStringAsFixed(2)}'),
                  const Divider(height: 20),
                  _buildInfoRow(
                    'Total',
                    '\$${order.total.toStringAsFixed(2)}',
                    isTotal: true,
                    valueColor: theme.colorScheme.primary,
                  ),
                ],
              ),
            ),

            // Action Buttons
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  if (order.trackingNumber != null)
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: () {
                          // TODO: Navigate to tracking page
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Tracking: ${order.trackingNumber}'),
                            ),
                          );
                        },
                        icon: const Icon(Icons.local_shipping),
                        label: Text('orders.trackOrder'.tr()),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                      ),
                    ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () => _handleBuyAgain(context, ref, order),
                      icon: const Icon(Icons.shopping_cart),
                      label: const Text('Buy Again'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                  ),
                  if (order.canCancel) ...[
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: () => _handleCancelOrder(context, ref, order),
                        icon: const Icon(Icons.cancel, color: Colors.red),
                        label: Text('orders.cancelOrder'.tr(),
                          style: TextStyle(color: Colors.red),
                        ),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          side: const BorderSide(color: Colors.red),
                        ),
                      ),
                    ),
                  ],
                  if (order.canReturn) ...[
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: () => _handleRequestReturn(context, ref, order),
                        icon: const Icon(Icons.keyboard_return),
                        label: const Text('Request Return'),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(
    BuildContext context,
    ThemeData theme,
    String title,
    Widget content,
  ) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          content,
        ],
      ),
    );
  }

  Widget _buildOrderItem(BuildContext context, ThemeData theme, OrderItemModel item) {
    return Container(
      padding: const EdgeInsets.only(bottom: 16),
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(color: Colors.grey.shade200),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: CachedNetworkImage(
              imageUrl: item.productImage ?? '',
              width: 80,
              height: 80,
              fit: BoxFit.cover,
              placeholder: (context, url) => Container(
                color: Colors.grey.shade200,
              ),
              errorWidget: (context, url, error) => Container(
                color: Colors.grey.shade200,
                child: const Icon(Icons.image, size: 32),
              ),
            ),
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
                if (item.shopName != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    item.shopName!,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
                const SizedBox(height: 8),
                Row(
                  children: [
                    if (item.size != null) ...[
                      Text(
                        'Size: ${item.size}',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                      const SizedBox(width: 12),
                    ],
                    Text(
                      'Qty: ${item.quantity}',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  '\$${item.subtotal.toStringAsFixed(2)}',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.primary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(
    String label,
    String value, {
    bool isTotal = false,
    Color? valueColor,
  }) {
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
              color: Colors.grey.shade700,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: isTotal ? 18 : 14,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.w600,
              color: valueColor ?? Colors.black87,
            ),
          ),
        ],
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
      case 'refunded':
      case 'returned':
        return {
          'color': Colors.grey.shade700,
          'bg': Colors.grey.shade100,
          'icon': Icons.restart_alt,
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
    return DateFormat('MMM dd, yyyy').format(date);
  }

  String _getPaymentMethodLabel(String method) {
    switch (method.toLowerCase()) {
      case 'credit_card':
        return 'Credit Card';
      case 'paypal':
        return 'PayPal';
      case 'cash_on_delivery':
        return 'Cash on Delivery';
      case 'bank_transfer':
        return 'Bank Transfer';
      default:
        return method;
    }
  }

  Future<void> _handleBuyAgain(BuildContext context, WidgetRef ref, OrderModel order) async {
    try {
      for (final item in order.items) {
        await ref.read(cartProvider.notifier).addToCart(
              productId: item.productId,
              quantity: item.quantity,
            );
      }

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${order.items.length} items added to cart'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to add items: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _handleCancelOrder(BuildContext context, WidgetRef ref, OrderModel order) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('orders.cancelOrder'.tr()),
        content: const Text('Are you sure you want to cancel this order?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('common.no'.tr()),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );

    if (confirmed == true && context.mounted) {
      final success = await ref.read(orderProvider.notifier).cancelOrder(
            order.id,
            'Customer requested cancellation',
          );

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              success ? 'Order cancelled successfully' : 'Failed to cancel order',
            ),
            backgroundColor: success ? Colors.green : Colors.red,
          ),
        );

        if (success) {
          Navigator.pop(context);
        }
      }
    }
  }

  Future<void> _handleRequestReturn(BuildContext context, WidgetRef ref, OrderModel order) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Request Return'),
        content: const Text(
          'Do you want to request a return for this order? We will review your request within 24-48 hours.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('common.cancel'.tr()),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Request Return'),
          ),
        ],
      ),
    );

    if (confirmed == true && context.mounted) {
      final success = await ref.read(orderProvider.notifier).requestReturn(
            order.id,
            'Customer requested return',
          );

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              success ? 'Return request submitted' : 'Failed to request return',
            ),
            backgroundColor: success ? Colors.green : Colors.red,
          ),
        );

        if (success) {
          Navigator.pop(context);
        }
      }
    }
  }
}
