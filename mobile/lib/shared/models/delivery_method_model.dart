import 'package:easy_localization/easy_localization.dart';
class DeliveryMethodModel {
  final String id;
  final String type;
  final String name;
  final double baseCost;
  final String estimatedDays;
  final String description;
  final bool isActive;
  final String? carrier;
  final bool trackingEnabled;
  final List<String> zones;

  DeliveryMethodModel({
    required this.id,
    required this.type,
    required this.name,
    required this.baseCost,
    required this.estimatedDays,
    required this.description,
    this.isActive = true,
    this.carrier,
    this.trackingEnabled = true,
    this.zones = const ['domestic'],
  });

  factory DeliveryMethodModel.fromJson(Map<String, dynamic> json) {
    return DeliveryMethodModel(
      id: json['id'] as String? ?? json['type'] as String,
      type: json['type'] as String,
      name: json['name'] as String,
      baseCost: _parseDouble(json['baseCost'] ?? json['rate']),
      estimatedDays: json['estimatedDays']?.toString() ?? '3-5',
      description: json['description'] as String? ?? '',
      isActive: json['isActive'] as bool? ?? true,
      carrier: json['carrier'] as String?,
      trackingEnabled: json['trackingEnabled'] as bool? ?? true,
      zones: (json['zones'] as List?)?.map((e) => e.toString()).toList() ?? ['domestic'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'name': name,
      'baseCost': baseCost,
      'estimatedDays': estimatedDays,
      'description': description,
      'isActive': isActive,
      if (carrier != null) 'carrier': carrier,
      'trackingEnabled': trackingEnabled,
      'zones': zones,
    };
  }

  static double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

  String get typeLabel {
    switch (type.toLowerCase()) {
      case 'own_delivery':
        return 'Own Delivery Man';
      case 'flat_rate':
        return 'Flat Rate';
      case 'free':
        return 'Free Shipping';
      case 'local_pickup':
        return 'Local Pickup';
      case 'express':
        return 'Express';
      case 'same_day':
        return 'Same Day Delivery';
      case 'next_day':
        return 'Next Day Delivery';
      default:
        return type;
    }
  }
}

class ShippingZoneModel {
  final String id;
  final String? shopId;
  final String name;
  final String? description;
  final String type;
  final double? radius;
  final String? city;
  final String? state;
  final String? country;
  final bool isActive;
  final List<String> countries;
  final List<String> regions;

  ShippingZoneModel({
    required this.id,
    this.shopId,
    required this.name,
    this.description,
    this.type = 'city',
    this.radius,
    this.city,
    this.state,
    this.country,
    this.isActive = true,
    this.countries = const [],
    this.regions = const [],
  });

  factory ShippingZoneModel.fromJson(Map<String, dynamic> json) {
    double? parseRadius(dynamic value) {
      if (value == null) return null;
      if (value is num) return value.toDouble();
      if (value is String) return double.tryParse(value);
      return null;
    }

    return ShippingZoneModel(
      id: json['id']?.toString() ?? '',
      shopId: json['shopId']?.toString(),
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString(),
      type: json['type']?.toString() ?? 'city',
      radius: parseRadius(json['radius']),
      city: json['city']?.toString(),
      state: json['state']?.toString(),
      country: json['country']?.toString(),
      isActive: json['isActive'] != false,
      countries: (json['countries'] as List?)?.map((e) => e.toString()).toList() ?? [],
      regions: (json['regions'] as List?)?.map((e) => e.toString()).toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      if (shopId != null) 'shopId': shopId,
      'name': name,
      if (description != null) 'description': description,
      'type': type,
      if (radius != null) 'radius': radius,
      if (city != null) 'city': city,
      if (state != null) 'state': state,
      if (country != null) 'country': country,
      'isActive': isActive,
      'countries': countries,
      'regions': regions,
    };
  }

  String get locationDisplay {
    final parts = <String>[];
    if (city != null && city!.isNotEmpty) parts.add(city!);
    if (state != null && state!.isNotEmpty) parts.add(state!);
    if (country != null && country!.isNotEmpty) parts.add(country!);
    return parts.join(', ');
  }

  String get typeDisplay {
    switch (type) {
      case 'city':
        return 'City';
      case 'circle':
        return 'Radius';
      case 'postal_code':
        return 'Postal Code';
      default:
        return type;
    }
  }
}

class ShipmentModel {
  final String id;
  final String orderId;
  final String orderNumber;
  final String customer;
  final String method;
  final String carrier;
  final String trackingNumber;
  final String status;
  final DateTime? shippedDate;
  final DateTime? estimatedDelivery;

  ShipmentModel({
    required this.id,
    required this.orderId,
    required this.orderNumber,
    required this.customer,
    required this.method,
    required this.carrier,
    required this.trackingNumber,
    required this.status,
    this.shippedDate,
    this.estimatedDelivery,
  });

  factory ShipmentModel.fromJson(Map<String, dynamic> json) {
    return ShipmentModel(
      id: json['id'] as String,
      orderId: json['orderId'] as String,
      orderNumber: json['orderNumber'] as String? ?? json['orderId'] as String,
      customer: json['customer'] as String? ?? json['customerName'] as String? ?? 'Unknown',
      method: json['method'] as String? ?? 'Standard',
      carrier: json['carrier'] as String? ?? '',
      trackingNumber: json['trackingNumber'] as String? ?? '',
      status: json['status'] as String? ?? 'pending',
      shippedDate: json['shippedDate'] != null
          ? DateTime.parse(json['shippedDate'] as String)
          : null,
      estimatedDelivery: json['estimatedDelivery'] != null
          ? DateTime.parse(json['estimatedDelivery'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'orderId': orderId,
      'orderNumber': orderNumber,
      'customer': customer,
      'method': method,
      'carrier': carrier,
      'trackingNumber': trackingNumber,
      'status': status,
      if (shippedDate != null) 'shippedDate': shippedDate!.toIso8601String(),
      if (estimatedDelivery != null) 'estimatedDelivery': estimatedDelivery!.toIso8601String(),
    };
  }

  String get statusLabel {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
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
}
