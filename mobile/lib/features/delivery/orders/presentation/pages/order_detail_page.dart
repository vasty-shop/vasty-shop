import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../data/models/delivery_order_model.dart';
import '../providers/delivery_orders_provider.dart';


import 'package:easy_localization/easy_localization.dart';class OrderDetailPage extends ConsumerWidget {
  final DeliveryOrderModel order;

  const OrderDetailPage({
    super.key,
    required this.order,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'Order #${order.orderNumber}',
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        iconTheme: const IconThemeData(color: Colors.black87),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Status banner
            _buildStatusBanner(context, theme),

            // Customer information
            _buildSection(
              title: 'delivery.customerInformation'.tr(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildInfoRow(
                    icon: Icons.person,
                    label: 'delivery.name'.tr(),
                    value: order.customer.name,
                  ),
                  if (order.customer.phone != null) ...[
                    const SizedBox(height: 12),
                    _buildInfoRow(
                      icon: Icons.phone,
                      label: 'delivery.phone'.tr(),
                      value: order.customer.phone!,
                      isClickable: true,
                      onTap: () {
                        // TODO: Implement call functionality
                      },
                    ),
                  ],
                ],
              ),
            ),

            // Pickup address
            _buildSection(
              title: 'delivery.pickupAddress'.tr(),
              child: _buildAddressCard(
                order.pickupAddress,
                Icons.store,
                Colors.blue,
                shopName: order.shop?.name,
              ),
            ),

            // Delivery address
            _buildSection(
              title: 'delivery.deliveryAddress'.tr(),
              child: _buildAddressCard(
                order.deliveryAddress,
                Icons.home,
                Colors.green,
              ),
            ),

            // Order items
            _buildSection(
              title: '${'delivery.orderItems'.tr()} (${order.itemCount})',
              child: Column(
                children: order.items.map((item) {
                  return _buildOrderItem(item);
                }).toList(),
              ),
            ),

            // Payment summary
            _buildSection(
              title: 'delivery.paymentSummary'.tr(),
              child: Column(
                children: [
                  _buildPaymentRow('delivery.subtotal'.tr(), order.formattedTotalAmount),
                  const SizedBox(height: 8),
                  _buildPaymentRow('delivery.deliveryFee'.tr(), order.formattedDeliveryFee),
                  if (order.tip != null && order.tip! > 0) ...[
                    const SizedBox(height: 8),
                    _buildPaymentRow('delivery.tip'.tr(), order.formattedTip, isGreen: true),
                  ],
                  const Divider(height: 24),
                  _buildPaymentRow(
                    'delivery.yourEarnings'.tr(),
                    order.formattedTotalEarnings,
                    isBold: true,
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: order.paymentStatus == 'paid'
                          ? Colors.green.withValues(alpha: 0.1)
                          : Colors.orange.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'delivery.paymentStatus'.tr(),
                          style: TextStyle(color: Colors.grey.shade700),
                        ),
                        Text(
                          order.paymentStatus == 'paid'
                              ? 'delivery.paid'.tr()
                              : 'delivery.paymentPending'.tr(),
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: order.paymentStatus == 'paid'
                                ? Colors.green.shade700
                                : Colors.orange.shade700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Delivery notes
            if (order.deliveryNotes != null) ...[
              _buildSection(
                title: 'delivery.deliveryNotes'.tr(),
                child: Text(
                  order.deliveryNotes!,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey.shade700,
                  ),
                ),
              ),
            ],

            const SizedBox(height: 100), // Space for action buttons
          ],
        ),
      ),
      bottomNavigationBar: _buildActionButtons(context, theme, ref),
    );
  }

  Widget _buildStatusBanner(BuildContext context, ThemeData theme) {
    Color bannerColor;
    IconData icon;
    String statusText;

    if (order.isPending) {
      bannerColor = Colors.orange;
      icon = Icons.notification_important;
      statusText = 'delivery.bannerPending'.tr();
    } else if (order.isAccepted) {
      bannerColor = Colors.blue;
      icon = Icons.check_circle_outline;
      statusText = 'delivery.bannerAccepted'.tr();
    } else if (order.isPickedUp) {
      bannerColor = Colors.purple;
      icon = Icons.inventory_2;
      statusText = 'delivery.bannerPickedUp'.tr();
    } else if (order.isOnTheWay) {
      bannerColor = Colors.indigo;
      icon = Icons.local_shipping;
      statusText = 'delivery.bannerOnTheWay'.tr();
    } else if (order.isDelivered) {
      bannerColor = Colors.green;
      icon = Icons.check_circle;
      statusText = 'delivery.bannerDelivered'.tr();
    } else {
      bannerColor = Colors.grey;
      icon = Icons.info;
      statusText = order.statusDisplay;
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bannerColor,
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.white, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              statusText,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection({
    required String title,
    required Widget child,
  }) {
    return Container(
      margin: const EdgeInsets.only(top: 16),
      padding: const EdgeInsets.all(16),
      color: Colors.white,
      width: double.infinity,
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
          child,
        ],
      ),
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
    bool isClickable = false,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: isClickable ? onTap : null,
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.grey.shade600),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: isClickable ? Colors.blue : Colors.black87,
                  ),
                ),
              ],
            ),
          ),
          if (isClickable)
            Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey.shade400),
        ],
      ),
    );
  }

  Widget _buildAddressCard(
    AddressInfo address,
    IconData icon,
    Color color, {
    String? shopName,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.shade300),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (shopName != null) ...[
                  Text(
                    shopName,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                ],
                Text(
                  address.fullAddress,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey.shade700,
                  ),
                ),
                if (address.instructions != null) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.amber.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.info_outline, size: 16, color: Colors.amber),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            address.instructions!,
                            style: const TextStyle(fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
          IconButton(
            onPressed: () {
              // TODO: Open in maps
            },
            icon: const Icon(Icons.navigation, color: Colors.blue),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderItem(OrderItem item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.shade200),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          // Product image
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(8),
            ),
            child: item.image != null
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: CachedNetworkImage(
                      imageUrl: item.image!,
                      fit: BoxFit.cover,
                      errorWidget: (context, url, error) =>
                          Icon(Icons.image, color: Colors.grey.shade400),
                    ),
                  )
                : Icon(Icons.image, color: Colors.grey.shade400),
          ),
          const SizedBox(width: 12),

          // Product details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.name,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
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
                      if (item.color != null) const Text(' • '),
                    ],
                    if (item.color != null)
                      Text(
                        'Color: ${item.color}',
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

          // Quantity and price
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                'x${item.quantity}',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey.shade700,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                item.formattedTotalPrice,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentRow(String label, String value, {bool isBold = false, bool isGreen = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
            color: isGreen ? Colors.green.shade700 : Colors.grey.shade700,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
            color: isGreen ? Colors.green.shade700 : null,
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons(
    BuildContext context,
    ThemeData theme,
    WidgetRef ref,
  ) {
    if (order.isDelivered || order.isCancelled) {
      return const SizedBox.shrink();
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: SafeArea(
        child: _buildButtonsForStatus(context, theme, ref),
      ),
    );
  }

  Widget _buildButtonsForStatus(
    BuildContext context,
    ThemeData theme,
    WidgetRef ref,
  ) {
    if (order.isPending) {
      return Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () async {
                final reason = await _showRejectDialog(context);
                if (reason != null && context.mounted) {
                  try {
                    await ref
                        .read(deliveryOrdersProvider.notifier)
                        .rejectOrder(order.id, reason: reason);
                    if (context.mounted) {
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('delivery.orderDeclined'.tr()),
                          backgroundColor: Colors.orange,
                        ),
                      );
                    }
                  } catch (e) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('${'common.error'.tr()}: $e'),
                          backgroundColor: Colors.red,
                        ),
                      );
                    }
                  }
                }
              },
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                side: BorderSide(color: Colors.red.shade400),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.cancel, color: Colors.red.shade600, size: 18),
                  const SizedBox(width: 4),
                  Text(
                    'delivery.decline'.tr(),
                    style: TextStyle(
                      color: Colors.red.shade600,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: ElevatedButton(
              onPressed: () async {
                try {
                  await ref
                      .read(deliveryOrdersProvider.notifier)
                      .acceptOrder(order.id);
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('delivery.orderAcceptedSuccessfully'.tr()),
                        backgroundColor: Colors.green,
                      ),
                    );
                  }
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('${'common.error'.tr()}: $e'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                }
              },
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: Colors.green,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.check_circle, color: Colors.white, size: 18),
                  const SizedBox(width: 8),
                  Text(
                    'delivery.acceptOrder'.tr(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      );
    } else if (order.isAccepted) {
      return SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: () async {
            try {
              await ref
                  .read(deliveryOrdersProvider.notifier)
                  .pickupOrder(order.id);
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('delivery.orderPickedUp'.tr()),
                    backgroundColor: Colors.purple,
                  ),
                );
              }
            } catch (e) {
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('${'common.error'.tr()}: $e'),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            }
          },
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 16),
            backgroundColor: Colors.purple,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.inventory_2, color: Colors.white),
              const SizedBox(width: 8),
              Text(
                'delivery.markPickedUp'.tr(),
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      );
    } else if (order.isPickedUp) {
      return SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: () async {
            try {
              await ref
                  .read(deliveryOrdersProvider.notifier)
                  .markOnTheWay(order.id);
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('delivery.markedOnTheWay'.tr()),
                    backgroundColor: Colors.indigo,
                  ),
                );
              }
            } catch (e) {
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('${'common.error'.tr()}: $e'),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            }
          },
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 16),
            backgroundColor: Colors.indigo,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.navigation, color: Colors.white),
              const SizedBox(width: 8),
              Text(
                'delivery.markOnTheWay'.tr(),
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      );
    } else if (order.isOnTheWay) {
      return SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: () async {
            try {
              await ref
                  .read(deliveryOrdersProvider.notifier)
                  .deliverOrder(order.id);
              if (context.mounted) {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('delivery.orderDeliveredSuccess'.tr()),
                    backgroundColor: Colors.green,
                  ),
                );
              }
            } catch (e) {
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('${'common.error'.tr()}: $e'),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            }
          },
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 16),
            backgroundColor: Colors.green,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.check_circle, color: Colors.white),
              const SizedBox(width: 8),
              Text(
                'delivery.markDelivered'.tr(),
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return const SizedBox.shrink();
  }

  Future<String?> _showRejectDialog(BuildContext context) {
    final reasonController = TextEditingController();

    return showDialog<String?>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('delivery.rejectOrder'.tr()),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'delivery.confirmRejectOrder'.tr(),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: reasonController,
              decoration: InputDecoration(
                labelText: 'delivery.declineReason'.tr(),
                hintText: 'delivery.declineReasonHint'.tr(),
                border: const OutlineInputBorder(),
              ),
              maxLines: 2,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, null),
            child: Text('common.cancel'.tr()),
          ),
          TextButton(
            onPressed: () {
              final reason = reasonController.text.trim();
              Navigator.pop(context, reason.isEmpty ? 'Declined by delivery partner' : reason);
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: Text('delivery.decline'.tr()),
          ),
        ],
      ),
    );
  }
}
