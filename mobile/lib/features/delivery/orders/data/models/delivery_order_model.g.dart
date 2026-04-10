// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'delivery_order_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

DeliveryOrderModel _$DeliveryOrderModelFromJson(Map<String, dynamic> json) =>
    DeliveryOrderModel(
      id: json['id'] as String,
      orderNumber: json['orderNumber'] as String,
      status: json['status'] as String,
      totalAmount: (json['totalAmount'] as num).toDouble(),
      deliveryFee: (json['deliveryFee'] as num).toDouble(),
      paymentStatus: json['paymentStatus'] as String,
      paymentMethod: json['paymentMethod'] as String,
      customer: CustomerInfo.fromJson(json['customer'] as Map<String, dynamic>),
      pickupAddress: AddressInfo.fromJson(
        json['pickupAddress'] as Map<String, dynamic>,
      ),
      deliveryAddress: AddressInfo.fromJson(
        json['deliveryAddress'] as Map<String, dynamic>,
      ),
      items: (json['items'] as List<dynamic>)
          .map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      notes: json['notes'] as String?,
      deliveryNotes: json['deliveryNotes'] as String?,
      createdAt: json['createdAt'] as String,
      acceptedAt: json['acceptedAt'] as String?,
      pickedUpAt: json['pickedUpAt'] as String?,
      deliveredAt: json['deliveredAt'] as String?,
      estimatedDeliveryTime: json['estimatedDeliveryTime'] as String?,
      distance: (json['distance'] as num?)?.toDouble(),
      shop: json['shop'] == null
          ? null
          : ShopInfo.fromJson(json['shop'] as Map<String, dynamic>),
      tip: (json['tip'] as num?)?.toDouble(),
    );

Map<String, dynamic> _$DeliveryOrderModelToJson(DeliveryOrderModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'orderNumber': instance.orderNumber,
      'status': instance.status,
      'totalAmount': instance.totalAmount,
      'deliveryFee': instance.deliveryFee,
      'paymentStatus': instance.paymentStatus,
      'paymentMethod': instance.paymentMethod,
      'customer': instance.customer,
      'pickupAddress': instance.pickupAddress,
      'deliveryAddress': instance.deliveryAddress,
      'items': instance.items,
      'notes': instance.notes,
      'deliveryNotes': instance.deliveryNotes,
      'createdAt': instance.createdAt,
      'acceptedAt': instance.acceptedAt,
      'pickedUpAt': instance.pickedUpAt,
      'deliveredAt': instance.deliveredAt,
      'estimatedDeliveryTime': instance.estimatedDeliveryTime,
      'distance': instance.distance,
      'shop': instance.shop,
      'tip': instance.tip,
    };

CustomerInfo _$CustomerInfoFromJson(Map<String, dynamic> json) => CustomerInfo(
  id: json['id'] as String,
  name: json['name'] as String,
  phone: json['phone'] as String?,
  email: json['email'] as String?,
);

Map<String, dynamic> _$CustomerInfoToJson(CustomerInfo instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'phone': instance.phone,
      'email': instance.email,
    };

AddressInfo _$AddressInfoFromJson(Map<String, dynamic> json) => AddressInfo(
  street: json['street'] as String,
  city: json['city'] as String,
  state: json['state'] as String?,
  postalCode: json['postalCode'] as String?,
  country: json['country'] as String?,
  latitude: (json['latitude'] as num?)?.toDouble(),
  longitude: (json['longitude'] as num?)?.toDouble(),
  instructions: json['instructions'] as String?,
);

Map<String, dynamic> _$AddressInfoToJson(AddressInfo instance) =>
    <String, dynamic>{
      'street': instance.street,
      'city': instance.city,
      'state': instance.state,
      'postalCode': instance.postalCode,
      'country': instance.country,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
      'instructions': instance.instructions,
    };

OrderItem _$OrderItemFromJson(Map<String, dynamic> json) => OrderItem(
  id: json['id'] as String,
  productId: json['productId'] as String,
  name: json['name'] as String,
  quantity: (json['quantity'] as num).toInt(),
  price: (json['price'] as num).toDouble(),
  image: json['image'] as String?,
  size: json['size'] as String?,
  color: json['color'] as String?,
);

Map<String, dynamic> _$OrderItemToJson(OrderItem instance) => <String, dynamic>{
  'id': instance.id,
  'productId': instance.productId,
  'name': instance.name,
  'quantity': instance.quantity,
  'price': instance.price,
  'image': instance.image,
  'size': instance.size,
  'color': instance.color,
};

ShopInfo _$ShopInfoFromJson(Map<String, dynamic> json) => ShopInfo(
  id: json['id'] as String,
  name: json['name'] as String,
  phone: json['phone'] as String?,
  logo: json['logo'] as String?,
);

Map<String, dynamic> _$ShopInfoToJson(ShopInfo instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'phone': instance.phone,
  'logo': instance.logo,
};

DeliveryEarnings _$DeliveryEarningsFromJson(Map<String, dynamic> json) =>
    DeliveryEarnings(
      totalEarnings: (json['totalEarnings'] as num).toDouble(),
      todayEarnings: (json['todayEarnings'] as num).toDouble(),
      weekEarnings: (json['weekEarnings'] as num).toDouble(),
      monthEarnings: (json['monthEarnings'] as num).toDouble(),
      totalDeliveries: (json['totalDeliveries'] as num).toInt(),
      todayDeliveries: (json['todayDeliveries'] as num).toInt(),
      weekDeliveries: (json['weekDeliveries'] as num).toInt(),
      monthDeliveries: (json['monthDeliveries'] as num).toInt(),
      averageRating: (json['averageRating'] as num).toDouble(),
      totalRatings: (json['totalRatings'] as num).toInt(),
    );

Map<String, dynamic> _$DeliveryEarningsToJson(DeliveryEarnings instance) =>
    <String, dynamic>{
      'totalEarnings': instance.totalEarnings,
      'todayEarnings': instance.todayEarnings,
      'weekEarnings': instance.weekEarnings,
      'monthEarnings': instance.monthEarnings,
      'totalDeliveries': instance.totalDeliveries,
      'todayDeliveries': instance.todayDeliveries,
      'weekDeliveries': instance.weekDeliveries,
      'monthDeliveries': instance.monthDeliveries,
      'averageRating': instance.averageRating,
      'totalRatings': instance.totalRatings,
    };
