// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notification_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$NotificationModelImpl _$$NotificationModelImplFromJson(
  Map<String, dynamic> json,
) => _$NotificationModelImpl(
  id: json['id'] as String,
  userId: json['userId'] as String,
  type: $enumDecode(_$NotificationTypeEnumMap, json['type']),
  title: json['title'] as String,
  message: json['message'] as String,
  data: json['data'] == null
      ? null
      : NotificationData.fromJson(json['data'] as Map<String, dynamic>),
  read: json['read'] as bool? ?? false,
  createdAt: DateTime.parse(json['createdAt'] as String),
  updatedAt: DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$$NotificationModelImplToJson(
  _$NotificationModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'userId': instance.userId,
  'type': _$NotificationTypeEnumMap[instance.type]!,
  'title': instance.title,
  'message': instance.message,
  'data': instance.data,
  'read': instance.read,
  'createdAt': instance.createdAt.toIso8601String(),
  'updatedAt': instance.updatedAt.toIso8601String(),
};

const _$NotificationTypeEnumMap = {
  NotificationType.orderCreated: 'ORDER_CREATED',
  NotificationType.orderUpdated: 'ORDER_UPDATED',
  NotificationType.orderShipped: 'ORDER_SHIPPED',
  NotificationType.orderDelivered: 'ORDER_DELIVERED',
  NotificationType.orderCancelled: 'ORDER_CANCELLED',
  NotificationType.paymentSuccess: 'PAYMENT_SUCCESS',
  NotificationType.paymentFailed: 'PAYMENT_FAILED',
  NotificationType.refundProcessed: 'REFUND_PROCESSED',
  NotificationType.systemAnnouncement: 'SYSTEM_ANNOUNCEMENT',
};

_$NotificationDataImpl _$$NotificationDataImplFromJson(
  Map<String, dynamic> json,
) => _$NotificationDataImpl(
  orderId: json['orderId'] as String?,
  orderNumber: json['orderNumber'] as String?,
  trackingNumber: json['trackingNumber'] as String?,
  amount: (json['amount'] as num?)?.toDouble(),
  refundAmount: (json['refundAmount'] as num?)?.toDouble(),
);

Map<String, dynamic> _$$NotificationDataImplToJson(
  _$NotificationDataImpl instance,
) => <String, dynamic>{
  'orderId': instance.orderId,
  'orderNumber': instance.orderNumber,
  'trackingNumber': instance.trackingNumber,
  'amount': instance.amount,
  'refundAmount': instance.refundAmount,
};

_$NotificationFilterImpl _$$NotificationFilterImplFromJson(
  Map<String, dynamic> json,
) => _$NotificationFilterImpl(
  type: $enumDecodeNullable(_$NotificationTypeEnumMap, json['type']),
  read: json['read'] as bool?,
  page: (json['page'] as num?)?.toInt() ?? 1,
  limit: (json['limit'] as num?)?.toInt() ?? 20,
);

Map<String, dynamic> _$$NotificationFilterImplToJson(
  _$NotificationFilterImpl instance,
) => <String, dynamic>{
  'type': _$NotificationTypeEnumMap[instance.type],
  'read': instance.read,
  'page': instance.page,
  'limit': instance.limit,
};

_$NotificationResponseImpl _$$NotificationResponseImplFromJson(
  Map<String, dynamic> json,
) => _$NotificationResponseImpl(
  notifications: (json['notifications'] as List<dynamic>)
      .map((e) => NotificationModel.fromJson(e as Map<String, dynamic>))
      .toList(),
  total: (json['total'] as num).toInt(),
  page: (json['page'] as num).toInt(),
  totalPages: (json['totalPages'] as num).toInt(),
  unreadCount: (json['unreadCount'] as num).toInt(),
);

Map<String, dynamic> _$$NotificationResponseImplToJson(
  _$NotificationResponseImpl instance,
) => <String, dynamic>{
  'notifications': instance.notifications,
  'total': instance.total,
  'page': instance.page,
  'totalPages': instance.totalPages,
  'unreadCount': instance.unreadCount,
};
