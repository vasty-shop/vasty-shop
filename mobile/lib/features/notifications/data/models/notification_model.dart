import 'package:freezed_annotation/freezed_annotation.dart';

part 'notification_model.freezed.dart';
part 'notification_model.g.dart';

/// Notification types matching backend enum
enum NotificationType {
  @JsonValue('ORDER_CREATED')
  orderCreated,
  @JsonValue('ORDER_UPDATED')
  orderUpdated,
  @JsonValue('ORDER_SHIPPED')
  orderShipped,
  @JsonValue('ORDER_DELIVERED')
  orderDelivered,
  @JsonValue('ORDER_CANCELLED')
  orderCancelled,
  @JsonValue('PAYMENT_SUCCESS')
  paymentSuccess,
  @JsonValue('PAYMENT_FAILED')
  paymentFailed,
  @JsonValue('REFUND_PROCESSED')
  refundProcessed,
  @JsonValue('SYSTEM_ANNOUNCEMENT')
  systemAnnouncement,
}

/// Notification model
@freezed
class NotificationModel with _$NotificationModel {
  const factory NotificationModel({
    required String id,
    required String userId,
    required NotificationType type,
    required String title,
    required String message,
    NotificationData? data,
    @Default(false) bool read,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _NotificationModel;

  factory NotificationModel.fromJson(Map<String, dynamic> json) =>
      _$NotificationModelFromJson(json);
}

/// Additional notification data
@freezed
class NotificationData with _$NotificationData {
  const factory NotificationData({
    String? orderId,
    String? orderNumber,
    String? trackingNumber,
    double? amount,
    double? refundAmount,
  }) = _NotificationData;

  factory NotificationData.fromJson(Map<String, dynamic> json) =>
      _$NotificationDataFromJson(json);
}

/// Notification filter
@freezed
class NotificationFilter with _$NotificationFilter {
  const factory NotificationFilter({
    NotificationType? type,
    bool? read,
    @Default(1) int page,
    @Default(20) int limit,
  }) = _NotificationFilter;

  factory NotificationFilter.fromJson(Map<String, dynamic> json) =>
      _$NotificationFilterFromJson(json);
}

/// Notification response
@freezed
class NotificationResponse with _$NotificationResponse {
  const factory NotificationResponse({
    required List<NotificationModel> notifications,
    required int total,
    required int page,
    required int totalPages,
    required int unreadCount,
  }) = _NotificationResponse;

  factory NotificationResponse.fromJson(Map<String, dynamic> json) =>
      _$NotificationResponseFromJson(json);
}
