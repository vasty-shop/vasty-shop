class OrderModel {
  final String id;
  final String orderNumber;
  final String status;
  final double total;
  final double subtotal;
  final double shipping;
  final double tax;
  final double discount;
  final String paymentMethod;
  final DateTime orderDate;
  final DateTime? estimatedDelivery;
  final DateTime? deliveryDate;
  final List<OrderItemModel> items;
  final ShippingAddressModel shippingAddress;
  final String? trackingNumber;
  final String? invoiceUrl;
  final bool canCancel;
  final bool canReturn;
  final bool canReview;
  final OrderDeliveryManModel? deliveryMan;

  OrderModel({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.total,
    required this.subtotal,
    required this.shipping,
    required this.tax,
    required this.discount,
    required this.paymentMethod,
    required this.orderDate,
    this.estimatedDelivery,
    this.deliveryDate,
    required this.items,
    required this.shippingAddress,
    this.trackingNumber,
    this.invoiceUrl,
    this.canCancel = false,
    this.canReturn = false,
    this.canReview = false,
    this.deliveryMan,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id'] as String,
      orderNumber: json['orderNumber'] as String? ?? json['order_number'] as String? ?? json['id'] as String,
      status: json['status'] as String? ?? json['paymentStatus'] as String? ?? json['payment_status'] as String? ?? 'pending',
      total: _parseDouble(json['total']),
      subtotal: _parseDouble(json['subtotal']),
      shipping: _parseDouble(json['shipping'] ?? json['shippingCost'] ?? json['shipping_cost']),
      tax: _parseDouble(json['tax']),
      discount: _parseDouble(json['discount']),
      paymentMethod: json['paymentMethod'] as String? ?? json['payment_method'] as String? ?? 'unknown',
      orderDate: json['orderDate'] != null
          ? DateTime.parse(json['orderDate'] as String)
          : json['createdAt'] != null
              ? DateTime.parse(json['createdAt'] as String)
              : json['created_at'] != null
                  ? DateTime.parse(json['created_at'] as String)
                  : DateTime.now(),
      estimatedDelivery: (json['estimatedDelivery'] ?? json['estimated_delivery']) != null
          ? DateTime.parse((json['estimatedDelivery'] ?? json['estimated_delivery']) as String)
          : null,
      deliveryDate: json['deliveryDate'] != null
          ? DateTime.parse(json['deliveryDate'] as String)
          : (json['deliveredAt'] ?? json['delivered_at']) != null
              ? DateTime.parse((json['deliveredAt'] ?? json['delivered_at']) as String)
              : null,
      items: (json['items'] as List?)
              ?.map((item) => OrderItemModel.fromJson(item as Map<String, dynamic>))
              .toList() ??
          [],
      shippingAddress: ShippingAddressModel.fromJson(
        (json['shippingAddress'] ?? json['shipping_address']) as Map<String, dynamic>? ?? {},
      ),
      trackingNumber: json['trackingNumber'] as String? ?? json['tracking_number'] as String?,
      invoiceUrl: json['invoiceUrl'] as String? ?? json['invoice_url'] as String?,
      canCancel: json['canCancel'] as bool? ?? json['can_cancel'] as bool? ?? _canCancelOrder(json),
      canReturn: json['canReturn'] as bool? ?? json['can_return'] as bool? ?? false,
      canReview: json['canReview'] as bool? ?? json['can_review'] as bool? ?? false,
      deliveryMan: (json['deliveryMan'] ?? json['delivery_man']) != null
          ? OrderDeliveryManModel.fromJson((json['deliveryMan'] ?? json['delivery_man']) as Map<String, dynamic>)
          : null,
    );
  }

  static bool _canCancelOrder(Map<String, dynamic> json) {
    final status = (json['status'] as String? ?? json['paymentStatus'] as String? ?? 'pending').toLowerCase();
    return ['pending', 'processing', 'confirmed'].contains(status);
  }

  static double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

  String get statusLabel {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'confirmed':
        return 'Confirmed';
      case 'shipped':
        return 'Shipped';
      case 'in_transit':
        return 'In Transit';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      case 'refunded':
        return 'Refunded';
      case 'returned':
        return 'Returned';
      default:
        return 'Unknown';
    }
  }
}

class OrderItemModel {
  final String id;
  final String productId;
  final String productName;
  final String? productImage;
  final double price;
  final int quantity;
  final String? size;
  final String? color;
  final String? shopName;

  OrderItemModel({
    required this.id,
    required this.productId,
    required this.productName,
    this.productImage,
    required this.price,
    required this.quantity,
    this.size,
    this.color,
    this.shopName,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      id: json['id'] as String? ?? json['productId'] as String? ?? json['product_id'] as String? ?? '',
      productId: json['productId'] as String? ?? json['product_id'] as String? ?? '',
      productName: json['name'] as String? ?? json['productName'] as String? ?? json['product_name'] as String? ?? 'Product',
      productImage: json['image'] as String? ?? json['productImage'] as String? ?? json['product_image'] as String?,
      price: _parseDouble(json['price']),
      quantity: json['quantity'] as int? ?? 1,
      size: json['size'] as String?,
      color: json['color'] as String?,
      shopName: json['shopName'] as String? ?? json['shop_name'] as String?,
    );
  }

  static double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

  double get subtotal => price * quantity;
}

class ShippingAddressModel {
  final String fullName;
  final String phone;
  final String addressLine1;
  final String addressLine2;
  final String city;
  final String state;
  final String zipCode;
  final String country;

  ShippingAddressModel({
    required this.fullName,
    required this.phone,
    required this.addressLine1,
    this.addressLine2 = '',
    required this.city,
    required this.state,
    required this.zipCode,
    required this.country,
  });

  factory ShippingAddressModel.fromJson(Map<String, dynamic> json) {
    return ShippingAddressModel(
      fullName: json['fullName'] as String? ?? json['full_name'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      addressLine1: json['addressLine1'] as String? ?? json['address_line_1'] as String? ?? '',
      addressLine2: json['addressLine2'] as String? ?? json['address_line_2'] as String? ?? '',
      city: json['city'] as String? ?? '',
      state: json['state'] as String? ?? '',
      zipCode: json['zipCode'] as String? ?? json['zip_code'] as String? ?? json['postalCode'] as String? ?? json['postal_code'] as String? ?? '',
      country: json['country'] as String? ?? 'US',
    );
  }

  String get fullAddress {
    final parts = [
      addressLine1,
      if (addressLine2.isNotEmpty) addressLine2,
      '$city, $state $zipCode',
      country,
    ];
    return parts.join('\n');
  }
}

class OrderDeliveryManModel {
  final String id;
  final String name;
  final String? phone;
  final String? email;
  final String? imageUrl;
  final String? status;

  OrderDeliveryManModel({
    required this.id,
    required this.name,
    this.phone,
    this.email,
    this.imageUrl,
    this.status,
  });

  factory OrderDeliveryManModel.fromJson(Map<String, dynamic> json) {
    return OrderDeliveryManModel(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? json['fullName'] as String? ?? 'Unknown',
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      imageUrl: json['imageUrl'] as String? ?? json['image_url'] as String? ?? json['avatar'] as String?,
      status: json['status'] as String?,
    );
  }
}
