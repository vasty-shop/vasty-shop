import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:share_plus/share_plus.dart';
import '../../../../../core/network/dio_client.dart';
import '../../../../../core/constants/api_constants.dart';

// Types
class TrackingUpdate {
  final String date;
  final String time;
  final String status;
  final String? location;
  final String description;

  TrackingUpdate({
    required this.date,
    required this.time,
    required this.status,
    this.location,
    required this.description,
  });
}

class OrderItem {
  final String id;
  final String name;
  final String image;
  final int quantity;
  final double price;
  final String? size;
  final String? color;

  OrderItem({
    required this.id,
    required this.name,
    required this.image,
    required this.quantity,
    required this.price,
    this.size,
    this.color,
  });
}

class DeliveryManInfo {
  final String id;
  final String name;
  final String firstName;
  final String lastName;
  final String? phone;
  final String? avatar;
  final double rating;
  final int totalDeliveries;
  final String? vehicleType;
  final String? vehicleNumber;
  final String status;

  DeliveryManInfo({
    required this.id,
    required this.name,
    required this.firstName,
    required this.lastName,
    this.phone,
    this.avatar,
    required this.rating,
    required this.totalDeliveries,
    this.vehicleType,
    this.vehicleNumber,
    required this.status,
  });
}

class ShippingAddress {
  final String name;
  final String street;
  final String city;
  final String state;
  final String zip;
  final String country;

  ShippingAddress({
    required this.name,
    required this.street,
    required this.city,
    required this.state,
    required this.zip,
    required this.country,
  });
}

class OrderData {
  final String orderNumber;
  final String orderDate;
  final String estimatedDelivery;
  final String carrier;
  final String trackingNumber;
  final int currentStatus;
  final ShippingAddress shippingAddress;
  final List<OrderItem> items;
  final List<TrackingUpdate> trackingHistory;
  final double totalAmount;
  final String shippingMethod;
  final DeliveryManInfo? deliveryMan;

  OrderData({
    required this.orderNumber,
    required this.orderDate,
    required this.estimatedDelivery,
    required this.carrier,
    required this.trackingNumber,
    required this.currentStatus,
    required this.shippingAddress,
    required this.items,
    required this.trackingHistory,
    required this.totalAmount,
    required this.shippingMethod,
    this.deliveryMan,
  });
}

// Tracking stages
class TrackingStage {
  final int id;
  final String label;
  final IconData icon;
  final String status;

  const TrackingStage({
    required this.id,
    required this.label,
    required this.icon,
    required this.status,
  });
}

const List<TrackingStage> trackingStages = [
  TrackingStage(id: 0, label: 'Order Placed', icon: Icons.check_circle, status: 'order_placed'),
  TrackingStage(id: 1, label: 'Confirmed', icon: Icons.check_circle, status: 'confirmed'),
  TrackingStage(id: 2, label: 'Assigned', icon: Icons.inventory_2, status: 'assigned'),
  TrackingStage(id: 3, label: 'Shipped', icon: Icons.local_shipping, status: 'shipped'),
  TrackingStage(id: 4, label: 'Delivered', icon: Icons.check_circle, status: 'delivered'),
];

// Status to stage mapping
int mapStatusToStage(String? status, String? deliveryManStatus) {
  if (deliveryManStatus != null) {
    final dmStatus = deliveryManStatus.toLowerCase();
    if (dmStatus == 'delivered') return 4;
    if (['on_the_way', 'picked_up', 'out_for_delivery'].contains(dmStatus)) return 3;
    if (['accepted', 'assigned'].contains(dmStatus)) return 2;
  }

  final statusMap = {
    'pending': 0,
    'order_placed': 0,
    'processing': 1,
    'confirmed': 1,
    'assigned': 2,
    'accepted': 2,
    'picked_up': 3,
    'shipped': 3,
    'in_transit': 3,
    'on_the_way': 3,
    'out_for_delivery': 3,
    'delivered': 4,
  };
  return statusMap[status?.toLowerCase()] ?? 0;
}

class TrackOrderPage extends ConsumerStatefulWidget {
  final String? initialOrderNumber;
  final bool showAppBar;

  const TrackOrderPage({
    super.key,
    this.initialOrderNumber,
    this.showAppBar = true,
  });

  @override
  ConsumerState<TrackOrderPage> createState() => _TrackOrderPageState();
}

class _TrackOrderPageState extends ConsumerState<TrackOrderPage> {
  final _searchController = TextEditingController();
  bool _isSearching = false;
  OrderData? _orderData;
  bool _notificationsEnabled = false;
  bool _copied = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialOrderNumber != null) {
      _searchController.text = widget.initialOrderNumber!;
      _handleSearch();
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _handleSearch() async {
    final query = _searchController.text.trim();
    if (query.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('tracking.enterOrderNumber'.tr()),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isSearching = true);

    try {
      final dioClient = DioClient.instance;
      final response = await dioClient.get('${ApiConstants.trackOrder}/$query');
      final order = response.data;

      // Debug logging
      debugPrint('🔍 Track order response: ${order['orderNumber'] ?? order['order_number']}');

      // Map API response to OrderData (handle both camelCase and snake_case)
      final mappedOrder = OrderData(
        orderNumber: order['orderNumber'] ?? order['order_number'] ?? order['id'] ?? query,
        orderDate: _formatDate(order['createdAt'] ?? order['created_at'] ?? order['orderDate']),
        estimatedDelivery: (order['estimatedDelivery'] ?? order['estimated_delivery']) != null
            ? _formatDate(order['estimatedDelivery'] ?? order['estimated_delivery'])
            : 'TBD',
        carrier: order['carrier'] ?? 'Standard Shipping',
        trackingNumber: order['trackingNumber'] ?? order['tracking_number'] ?? query,
        currentStatus: mapStatusToStage(
          order['status'],
          order['deliveryMan']?['status'] ?? order['delivery_man']?['status'],
        ),
        shippingAddress: _parseShippingAddress(order['shippingAddress'] ?? order['shipping_address']),
        items: (order['items'] as List? ?? []).map<OrderItem>((item) {
          return OrderItem(
            id: item['id'] ?? item['productId'] ?? item['product_id'] ?? '',
            name: item['product']?['name'] ?? item['productName'] ?? item['product_name'] ?? item['name'] ?? 'Product',
            image: item['product']?['images']?[0] ?? item['productImage'] ?? item['product_image'] ?? item['image'] ?? '',
            quantity: (item['quantity'] as num?)?.toInt() ?? 1,
            price: (item['price'] as num?)?.toDouble() ?? 0.0,
            size: item['size'],
            color: item['color'],
          );
        }).toList(),
        trackingHistory: _buildTrackingHistory(order['timeline'] as List? ?? []),
        totalAmount: (order['total'] as num?)?.toDouble() ?? 0.0,
        shippingMethod: order['deliveryMethod'] ?? order['delivery_method'] ?? 'Standard Shipping',
        deliveryMan: _parseDeliveryMan(order['deliveryMan'] ?? order['delivery_man']),
      );

      setState(() {
        _orderData = mappedOrder;
        _isSearching = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('tracking.orderFound'.tr()),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 1),
          ),
        );
      }
    } catch (e) {
      setState(() => _isSearching = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('tracking.orderNotFound'.tr()),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return 'TBD';
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('MMMM d, yyyy').format(date);
    } catch (e) {
      return dateStr;
    }
  }

  ShippingAddress _parseShippingAddress(Map<String, dynamic>? address) {
    if (address == null) {
      return ShippingAddress(
        name: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
      );
    }
    return ShippingAddress(
      name: address['fullName'] ?? address['full_name'] ?? '',
      street: address['addressLine1'] ?? address['address_line_1'] ?? address['street'] ?? '',
      city: address['city'] ?? '',
      state: address['state'] ?? '',
      zip: address['postalCode'] ?? address['postal_code'] ?? address['zipCode'] ?? address['zip_code'] ?? '',
      country: address['country'] ?? '',
    );
  }

  DeliveryManInfo? _parseDeliveryMan(Map<String, dynamic>? dm) {
    if (dm == null) return null;
    return DeliveryManInfo(
      id: dm['id'] ?? '',
      name: dm['name'] ?? '',
      firstName: dm['firstName'] ?? dm['first_name'] ?? '',
      lastName: dm['lastName'] ?? dm['last_name'] ?? '',
      phone: dm['phone'],
      avatar: dm['avatar'] ?? dm['image_url'],
      rating: (dm['rating'] as num?)?.toDouble() ?? 0.0,
      totalDeliveries: (dm['totalDeliveries'] ?? dm['total_deliveries'] as num?)?.toInt() ?? 0,
      vehicleType: dm['vehicleType'] ?? dm['vehicle_type'],
      vehicleNumber: dm['vehicleNumber'] ?? dm['vehicle_number'],
      status: dm['status'] ?? 'assigned',
    );
  }

  List<TrackingUpdate> _buildTrackingHistory(List timeline) {
    final seen = <String>{};
    return timeline
        .where((event) {
          final status = event['status'] ?? '';
          if (seen.contains(status)) return false;
          seen.add(status);
          return true;
        })
        .map<TrackingUpdate>((event) {
          final timestamp = event['timestamp'];
          DateTime? date;
          try {
            date = timestamp != null ? DateTime.parse(timestamp) : null;
          } catch (e) {
            date = null;
          }
          return TrackingUpdate(
            date: date != null ? DateFormat('MMM d').format(date) : '',
            time: date != null ? DateFormat('h:mm a').format(date) : '',
            status: event['title'] ?? event['status'] ?? '',
            location: event['location'],
            description: event['description'] ?? '',
          );
        })
        .toList();
  }

  void _handleCopyTracking() {
    if (_orderData != null) {
      Clipboard.setData(ClipboardData(text: _orderData!.trackingNumber));
      setState(() => _copied = true);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('tracking.trackingNumberCopied'.tr()),
          backgroundColor: Colors.green,
          duration: const Duration(seconds: 1),
        ),
      );
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) setState(() => _copied = false);
      });
    }
  }

  void _handleShare() async {
    if (_orderData != null) {
      await Share.share(
        'Track my order: ${_orderData!.orderNumber}',
        subject: 'Order ${_orderData!.orderNumber}',
      );
    }
  }

  void _handleToggleNotifications() {
    setState(() => _notificationsEnabled = !_notificationsEnabled);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          _notificationsEnabled
              ? 'tracking.notificationsEnabled'.tr()
              : 'tracking.notificationsDisabled'.tr(),
        ),
        backgroundColor: Colors.green,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _callDeliveryPartner() async {
    if (_orderData?.deliveryMan?.phone != null) {
      final url = Uri.parse('tel:${_orderData!.deliveryMan!.phone}');
      if (await canLaunchUrl(url)) {
        await launchUrl(url);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: widget.showAppBar
          ? AppBar(
              backgroundColor: Colors.white,
              elevation: 0,
              title: Text(
                'tracking.trackOrder'.tr(),
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            )
          : null,
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Hero Section with Search
            _buildHeroSection(theme),

            // Order Data Display
            if (_orderData != null) ...[
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    // Progress Timeline
                    _buildProgressTimeline(theme),
                    const SizedBox(height: 24),

                    // Order Details Card
                    _buildOrderDetailsCard(theme),
                    const SizedBox(height: 16),

                    // Items in Order
                    _buildItemsCard(theme),
                    const SizedBox(height: 16),

                    // Delivery Updates Timeline
                    _buildDeliveryUpdatesCard(theme),
                    const SizedBox(height: 16),

                    // Shipping Address
                    _buildShippingAddressCard(theme),

                    // Delivery Man Info
                    if (_orderData!.deliveryMan != null) ...[
                      const SizedBox(height: 16),
                      _buildDeliveryManCard(theme),
                    ],

                    const SizedBox(height: 16),
                    // Contact Support Card
                    _buildContactSupportCard(theme),
                  ],
                ),
              ),
            ] else ...[
              // Help Section when no order
              _buildHelpSection(theme),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildHeroSection(ThemeData theme) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            theme.colorScheme.primary,
            theme.colorScheme.primary.withValues(alpha: 0.8),
            Colors.green.shade600,
          ],
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              // Title
              Text(
                'tracking.trackYourOrder'.tr(),
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'tracking.enterOrderNumberHint'.tr(),
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.white.withValues(alpha: 0.9),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),

              // Search Bar
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.1),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        decoration: InputDecoration(
                          hintText: 'tracking.orderNumberPlaceholder'.tr(),
                          prefixIcon: const Icon(Icons.search),
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 16,
                          ),
                        ),
                        onSubmitted: (_) => _handleSearch(),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ElevatedButton(
                        onPressed: _isSearching ? null : _handleSearch,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: theme.colorScheme.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 24,
                            vertical: 14,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: _isSearching
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    Colors.white,
                                  ),
                                ),
                              )
                            : Text('tracking.track'.tr()),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),
              Text(
                'tracking.example'.tr(),
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.7),
                  fontSize: 13,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProgressTimeline(ThemeData theme) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Order Status',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 24),

            // Mobile Timeline (vertical)
            ...trackingStages.map((stage) {
              final isCompleted = stage.id <= _orderData!.currentStatus;
              final isCurrent = stage.id == _orderData!.currentStatus;

              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Row(
                  children: [
                    // Icon
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: isCompleted
                            ? theme.colorScheme.primary
                            : Colors.grey.shade200,
                        shape: BoxShape.circle,
                        boxShadow: isCurrent
                            ? [
                                BoxShadow(
                                  color: theme.colorScheme.primary.withValues(alpha: 0.4),
                                  blurRadius: 12,
                                  offset: const Offset(0, 4),
                                ),
                              ]
                            : null,
                      ),
                      child: Icon(
                        stage.icon,
                        color: isCompleted ? Colors.white : Colors.grey.shade400,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 16),

                    // Label
                    Expanded(
                      child: Text(
                        stage.label,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: isCompleted ? FontWeight.w600 : FontWeight.normal,
                          color: isCompleted
                              ? Colors.black87
                              : Colors.grey.shade500,
                        ),
                      ),
                    ),

                    // Check mark
                    if (isCompleted)
                      Icon(
                        Icons.check_circle,
                        color: theme.colorScheme.primary,
                        size: 24,
                      ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderDetailsCard(ThemeData theme) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'tracking.orderDetails'.tr(),
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${'common.order'.tr()} #${_orderData!.orderNumber}',
                      style: TextStyle(
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    IconButton(
                      onPressed: _handleShare,
                      icon: const Icon(Icons.share_outlined),
                      tooltip: 'tracking.share'.tr(),
                    ),
                    IconButton(
                      onPressed: _handleToggleNotifications,
                      icon: Icon(
                        _notificationsEnabled
                            ? Icons.notifications_active
                            : Icons.notifications_off_outlined,
                        color: _notificationsEnabled
                            ? theme.colorScheme.primary
                            : null,
                      ),
                      tooltip: _notificationsEnabled
                          ? 'tracking.disableNotifications'.tr()
                          : 'tracking.enableNotifications'.tr(),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Info Grid
            _buildInfoRow(
              icon: Icons.calendar_today,
              iconColor: Colors.blue,
              label: 'tracking.orderDate'.tr(),
              value: _orderData!.orderDate,
            ),
            const SizedBox(height: 16),
            _buildInfoRow(
              icon: Icons.access_time,
              iconColor: Colors.green,
              label: 'tracking.estimatedDelivery'.tr(),
              value: _orderData!.estimatedDelivery,
              valueStyle: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.primary,
              ),
            ),
            const SizedBox(height: 16),
            _buildInfoRow(
              icon: Icons.local_shipping,
              iconColor: Colors.purple,
              label: 'tracking.carrier'.tr(),
              value: _orderData!.carrier,
              subtitle: _orderData!.shippingMethod,
            ),
            const SizedBox(height: 16),
            _buildTrackingNumberRow(theme),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
    String? subtitle,
    TextStyle? valueStyle,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: iconColor.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: iconColor, size: 20),
        ),
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
              const SizedBox(height: 2),
              Text(
                value,
                style: valueStyle ??
                    const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                    ),
              ),
              if (subtitle != null) ...[
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade500,
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTrackingNumberRow(ThemeData theme) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: Colors.orange.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Icon(Icons.inventory_2, color: Colors.orange, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'tracking.trackingNumber'.tr(),
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey.shade600,
                ),
              ),
              const SizedBox(height: 2),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      _orderData!.trackingNumber,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: _handleCopyTracking,
                    icon: Icon(
                      _copied ? Icons.check : Icons.copy,
                      size: 20,
                      color: theme.colorScheme.primary,
                    ),
                    tooltip: 'tracking.copy'.tr(),
                    constraints: const BoxConstraints(
                      minWidth: 32,
                      minHeight: 32,
                    ),
                    padding: EdgeInsets.zero,
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildItemsCard(ThemeData theme) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${'tracking.itemsInOrder'.tr()} (${_orderData!.items.length})',
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),

            // Items List
            ...List.generate(_orderData!.items.length, (index) {
              final item = _orderData!.items[index];
              return Container(
                margin: EdgeInsets.only(
                  bottom: index < _orderData!.items.length - 1 ? 12 : 0,
                ),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    // Product Image
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: item.image.isNotEmpty
                          ? CachedNetworkImage(
                              imageUrl: item.image,
                              width: 64,
                              height: 64,
                              fit: BoxFit.cover,
                              placeholder: (context, url) => Container(
                                width: 64,
                                height: 64,
                                color: Colors.grey.shade200,
                                child: const Center(
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                ),
                              ),
                              errorWidget: (context, url, error) => Container(
                                width: 64,
                                height: 64,
                                color: Colors.grey.shade200,
                                child: const Icon(Icons.image_not_supported),
                              ),
                            )
                          : Container(
                              width: 64,
                              height: 64,
                              color: Colors.grey.shade200,
                              child: const Icon(Icons.inventory_2),
                            ),
                    ),
                    const SizedBox(width: 12),

                    // Product Details
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.name,
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Wrap(
                            spacing: 8,
                            children: [
                              if (item.size != null)
                                Text(
                                  'Size: ${item.size}',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey.shade600,
                                  ),
                                ),
                              if (item.color != null)
                                Text(
                                  'Color: ${item.color}',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey.shade600,
                                  ),
                                ),
                              Text(
                                'Qty: ${item.quantity}',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '\$${item.price.toStringAsFixed(2)}',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            }),

            // Order Total
            const Divider(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'tracking.orderTotal'.tr(),
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  '\$${_orderData!.totalAmount.toStringAsFixed(2)}',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.primary,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDeliveryUpdatesCard(ThemeData theme) {
    if (_orderData!.trackingHistory.isEmpty) {
      return const SizedBox.shrink();
    }

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'tracking.deliveryUpdates'.tr(),
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),

            // Timeline
            ...List.generate(_orderData!.trackingHistory.length, (index) {
              final update = _orderData!.trackingHistory[index];
              final isFirst = index == 0;
              final isLast = index == _orderData!.trackingHistory.length - 1;

              return IntrinsicHeight(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Timeline indicator
                    SizedBox(
                      width: 24,
                      child: Column(
                        children: [
                          Container(
                            width: 12,
                            height: 12,
                            decoration: BoxDecoration(
                              color: isFirst
                                  ? theme.colorScheme.primary
                                  : Colors.white,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: isFirst
                                    ? theme.colorScheme.primary
                                    : Colors.grey.shade300,
                                width: 2,
                              ),
                            ),
                          ),
                          if (!isLast)
                            Expanded(
                              child: Container(
                                width: 2,
                                color: Colors.grey.shade200,
                              ),
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),

                    // Content
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.only(bottom: 20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    update.status,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                                Text(
                                  '${update.date}, ${update.time}',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey.shade500,
                                  ),
                                ),
                              ],
                            ),
                            if (update.location != null &&
                                update.location!.isNotEmpty) ...[
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Icon(
                                    Icons.location_on,
                                    size: 14,
                                    color: Colors.grey.shade500,
                                  ),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      update.location!,
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.grey.shade600,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                            if (update.description.isNotEmpty) ...[
                              const SizedBox(height: 4),
                              Text(
                                update.description,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildShippingAddressCard(ThemeData theme) {
    final address = _orderData!.shippingAddress;

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.location_on,
                  color: theme.colorScheme.primary,
                ),
                const SizedBox(width: 8),
                Text(
                  'tracking.shippingAddress'.tr(),
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              address.name,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              address.street,
              style: TextStyle(color: Colors.grey.shade600),
            ),
            Text(
              '${address.city}, ${address.state} ${address.zip}',
              style: TextStyle(color: Colors.grey.shade600),
            ),
            Text(
              address.country,
              style: TextStyle(color: Colors.grey.shade600),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDeliveryManCard(ThemeData theme) {
    final deliveryMan = _orderData!.deliveryMan!;

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.local_shipping,
                  color: theme.colorScheme.primary,
                ),
                const SizedBox(width: 8),
                Text(
                  'tracking.yourDeliveryPartner'.tr(),
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            Row(
              children: [
                // Avatar
                CircleAvatar(
                  radius: 32,
                  backgroundColor: Colors.orange.shade100,
                  backgroundImage: deliveryMan.avatar != null
                      ? CachedNetworkImageProvider(deliveryMan.avatar!)
                      : null,
                  child: deliveryMan.avatar == null
                      ? Text(
                          deliveryMan.firstName.isNotEmpty
                              ? deliveryMan.firstName[0].toUpperCase()
                              : 'D',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.orange.shade800,
                          ),
                        )
                      : null,
                ),
                const SizedBox(width: 16),

                // Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${deliveryMan.firstName} ${deliveryMan.lastName}',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.star, color: Colors.amber, size: 16),
                          const SizedBox(width: 4),
                          Text(
                            deliveryMan.rating.toStringAsFixed(1),
                            style: TextStyle(
                              color: Colors.grey.shade600,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Text(
                            '${deliveryMan.totalDeliveries} deliveries',
                            style: TextStyle(
                              color: Colors.grey.shade600,
                            ),
                          ),
                        ],
                      ),
                      if (deliveryMan.vehicleType != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          '${deliveryMan.vehicleType}${deliveryMan.vehicleNumber != null ? ' - ${deliveryMan.vehicleNumber}' : ''}',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade500,
                          ),
                        ),
                      ],
                      const SizedBox(height: 8),
                      // Status Badge
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: _getStatusColor(deliveryMan.status).withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          _getStatusLabel(deliveryMan.status),
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: _getStatusColor(deliveryMan.status),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            // Call Button
            if (deliveryMan.phone != null) ...[
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _callDeliveryPartner,
                  icon: const Icon(Icons.phone),
                  label: Text('tracking.callDeliveryPartner'.tr()),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: theme.colorScheme.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'delivered':
        return Colors.green;
      case 'picked_up':
      case 'on_the_way':
        return Colors.blue;
      default:
        return Colors.orange;
    }
  }

  String _getStatusLabel(String status) {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'Delivered';
      case 'picked_up':
        return 'Picked Up';
      case 'on_the_way':
        return 'On The Way';
      case 'accepted':
        return 'Order Accepted';
      default:
        return 'Assigned';
    }
  }

  Widget _buildContactSupportCard(ThemeData theme) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: theme.colorScheme.primary.withValues(alpha: 0.05),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'tracking.needHelp'.tr(),
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'tracking.contactSupportDesc'.tr(),
              style: TextStyle(
                color: Colors.grey.shade600,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  // TODO: Navigate to contact page
                },
                icon: const Icon(Icons.chat_bubble_outline),
                label: Text('tracking.contactSupport'.tr()),
                style: ElevatedButton.styleFrom(
                  backgroundColor: theme.colorScheme.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () async {
                      final url = Uri.parse('tel:1-800-358-9391');
                      if (await canLaunchUrl(url)) {
                        await launchUrl(url);
                      }
                    },
                    icon: const Icon(Icons.phone, size: 18),
                    label: Text('tracking.callUs'.tr()),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () async {
                      final url = Uri.parse('mailto:support@vasty.shop');
                      if (await canLaunchUrl(url)) {
                        await launchUrl(url);
                      }
                    },
                    icon: const Icon(Icons.email_outlined, size: 18),
                    label: Text('tracking.email'.tr()),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHelpSection(ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Text(
            'tracking.howToTrack'.tr(),
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 32),

          // Step 1
          _buildHelpStep(
            theme: theme,
            icon: Icons.search,
            title: 'tracking.step1Title'.tr(),
            description: 'tracking.step1Desc'.tr(),
          ),
          const SizedBox(height: 20),

          // Step 2
          _buildHelpStep(
            theme: theme,
            icon: Icons.local_shipping,
            title: 'tracking.step2Title'.tr(),
            description: 'tracking.step2Desc'.tr(),
          ),
          const SizedBox(height: 20),

          // Step 3
          _buildHelpStep(
            theme: theme,
            icon: Icons.notifications,
            title: 'tracking.step3Title'.tr(),
            description: 'tracking.step3Desc'.tr(),
          ),

          const SizedBox(height: 32),

          // FAQ Section
          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'tracking.faqTitle'.tr(),
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildFaqItem(
                    'tracking.faq1Question'.tr(),
                    theme,
                  ),
                  _buildFaqItem(
                    'tracking.faq2Question'.tr(),
                    theme,
                  ),
                  _buildFaqItem(
                    'tracking.faq3Question'.tr(),
                    theme,
                  ),
                  _buildFaqItem(
                    'tracking.faq4Question'.tr(),
                    theme,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHelpStep({
    required ThemeData theme,
    required IconData icon,
    required String title,
    required String description,
  }) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                color: theme.colorScheme.primary,
                size: 28,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
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
                  const SizedBox(height: 4),
                  Text(
                    description,
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
      ),
    );
  }

  Widget _buildFaqItem(String question, ThemeData theme) {
    return InkWell(
      onTap: () {
        // TODO: Navigate to FAQ page
      },
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Row(
          children: [
            Expanded(
              child: Text(
                question,
                style: const TextStyle(fontSize: 15),
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: Colors.grey.shade400,
            ),
          ],
        ),
      ),
    );
  }
}
