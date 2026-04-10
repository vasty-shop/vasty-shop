import 'package:json_annotation/json_annotation.dart';


part 'delivery_order_model.g.dart';

@JsonSerializable()
class DeliveryOrderModel {
  final String id;
  final String orderNumber;
  final String status; // pending, accepted, picked_up, in_transit, delivered, cancelled
  final double totalAmount;
  final double deliveryFee;
  final String paymentStatus; // pending, paid, refunded
  final String paymentMethod;
  final CustomerInfo customer;
  final AddressInfo pickupAddress;
  final AddressInfo deliveryAddress;
  final List<OrderItem> items;
  final String? notes;
  final String? deliveryNotes;
  final String createdAt;
  final String? acceptedAt;
  final String? pickedUpAt;
  final String? deliveredAt;
  final String? estimatedDeliveryTime;
  final double? distance; // in km
  final ShopInfo? shop;
  final double? tip;

  DeliveryOrderModel({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.totalAmount,
    required this.deliveryFee,
    required this.paymentStatus,
    required this.paymentMethod,
    required this.customer,
    required this.pickupAddress,
    required this.deliveryAddress,
    required this.items,
    this.notes,
    this.deliveryNotes,
    required this.createdAt,
    this.acceptedAt,
    this.pickedUpAt,
    this.deliveredAt,
    this.estimatedDeliveryTime,
    this.distance,
    this.shop,
    this.tip,
  });

  factory DeliveryOrderModel.fromJson(Map<String, dynamic> json) =>
      _$DeliveryOrderModelFromJson(json);
  Map<String, dynamic> toJson() => _$DeliveryOrderModelToJson(this);

  // Helper getters
  bool get isPending => status == 'pending';
  bool get isAccepted => status == 'accepted';
  bool get isPickedUp => status == 'picked_up';
  bool get isOnTheWay => status == 'in_transit';
  bool get isDelivered => status == 'delivered';
  bool get isCancelled => status == 'cancelled';

  String get statusDisplay {
    switch (status) {
      case 'pending':
        return 'New Order';
      case 'accepted':
        return 'Accepted';
      case 'picked_up':
        return 'Picked Up';
      case 'in_transit':
        return 'In Transit';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }

  String get formattedTotalAmount => '\$${totalAmount.toStringAsFixed(2)}';
  String get formattedDeliveryFee => '\$${deliveryFee.toStringAsFixed(2)}';
  String get formattedDistance => distance != null ? '${distance!.toStringAsFixed(1)} km' : 'N/A';
  String get formattedTip => '\$${(tip ?? 0).toStringAsFixed(2)}';
  String get formattedTotalEarnings => '\$${(deliveryFee + (tip ?? 0)).toStringAsFixed(2)}';

  int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);
}

@JsonSerializable()
class CustomerInfo {
  final String id;
  final String name;
  final String? phone;
  final String? email;

  CustomerInfo({
    required this.id,
    required this.name,
    this.phone,
    this.email,
  });

  factory CustomerInfo.fromJson(Map<String, dynamic> json) =>
      _$CustomerInfoFromJson(json);
  Map<String, dynamic> toJson() => _$CustomerInfoToJson(this);
}

@JsonSerializable()
class AddressInfo {
  final String street;
  final String city;
  final String? state;
  final String? postalCode;
  final String? country;
  final double? latitude;
  final double? longitude;
  final String? instructions;

  AddressInfo({
    required this.street,
    required this.city,
    this.state,
    this.postalCode,
    this.country,
    this.latitude,
    this.longitude,
    this.instructions,
  });

  factory AddressInfo.fromJson(Map<String, dynamic> json) =>
      _$AddressInfoFromJson(json);
  Map<String, dynamic> toJson() => _$AddressInfoToJson(this);

  String get fullAddress {
    final parts = [street, city, state, postalCode, country]
        .where((p) => p != null && p.isNotEmpty)
        .toList();
    return parts.join(', ');
  }
}

@JsonSerializable()
class OrderItem {
  final String id;
  final String productId;
  final String name;
  final int quantity;
  final double price;
  final String? image;
  final String? size;
  final String? color;

  OrderItem({
    required this.id,
    required this.productId,
    required this.name,
    required this.quantity,
    required this.price,
    this.image,
    this.size,
    this.color,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) =>
      _$OrderItemFromJson(json);
  Map<String, dynamic> toJson() => _$OrderItemToJson(this);

  String get formattedPrice => '\$${price.toStringAsFixed(2)}';
  double get totalPrice => price * quantity;
  String get formattedTotalPrice => '\$${totalPrice.toStringAsFixed(2)}';
}

@JsonSerializable()
class ShopInfo {
  final String id;
  final String name;
  final String? phone;
  final String? logo;

  ShopInfo({
    required this.id,
    required this.name,
    this.phone,
    this.logo,
  });

  factory ShopInfo.fromJson(Map<String, dynamic> json) =>
      _$ShopInfoFromJson(json);
  Map<String, dynamic> toJson() => _$ShopInfoToJson(this);
}

@JsonSerializable()
class DeliveryEarnings {
  final double totalEarnings;
  final double todayEarnings;
  final double weekEarnings;
  final double monthEarnings;
  final int totalDeliveries;
  final int todayDeliveries;
  final int weekDeliveries;
  final int monthDeliveries;
  final double averageRating;
  final int totalRatings;

  DeliveryEarnings({
    required this.totalEarnings,
    required this.todayEarnings,
    required this.weekEarnings,
    required this.monthEarnings,
    required this.totalDeliveries,
    required this.todayDeliveries,
    required this.weekDeliveries,
    required this.monthDeliveries,
    required this.averageRating,
    required this.totalRatings,
  });

  factory DeliveryEarnings.fromJson(Map<String, dynamic> json) =>
      _$DeliveryEarningsFromJson(json);
  Map<String, dynamic> toJson() => _$DeliveryEarningsToJson(this);

  String get formattedTotalEarnings => '\$${totalEarnings.toStringAsFixed(2)}';
  String get formattedTodayEarnings => '\$${todayEarnings.toStringAsFixed(2)}';
  String get formattedWeekEarnings => '\$${weekEarnings.toStringAsFixed(2)}';
  String get formattedMonthEarnings => '\$${monthEarnings.toStringAsFixed(2)}';
}
