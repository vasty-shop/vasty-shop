import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../orders/data/repositories/delivery_repository.dart';
import '../../../orders/data/models/delivery_order_model.dart';

/// Simple notification model for delivery
class DeliveryNotification {
  final String id;
  final String title;
  final String message;
  final String type; // order, earning, system
  final DateTime createdAt;
  final bool read;
  final String? orderId;

  DeliveryNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.createdAt,
    this.read = false,
    this.orderId,
  });

  DeliveryNotification copyWith({bool? read}) {
    return DeliveryNotification(
      id: id,
      title: title,
      message: message,
      type: type,
      createdAt: createdAt,
      read: read ?? this.read,
      orderId: orderId,
    );
  }
}

/// Delivery notification state
class DeliveryNotificationState {
  final List<DeliveryNotification> notifications;
  final int unreadCount;
  final bool isLoading;
  final String? error;

  DeliveryNotificationState({
    this.notifications = const [],
    this.unreadCount = 0,
    this.isLoading = false,
    this.error,
  });

  DeliveryNotificationState copyWith({
    List<DeliveryNotification>? notifications,
    int? unreadCount,
    bool? isLoading,
    String? error,
  }) {
    return DeliveryNotificationState(
      notifications: notifications ?? this.notifications,
      unreadCount: unreadCount ?? this.unreadCount,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Delivery notification notifier - generates notifications from orders
class DeliveryNotificationNotifier extends StateNotifier<DeliveryNotificationState> {
  final DeliveryRepository _repository;
  Set<String> _readNotificationIds = {};

  DeliveryNotificationNotifier(this._repository) : super(DeliveryNotificationState()) {
    _loadReadNotifications();
    fetchNotifications();
  }

  Future<void> _loadReadNotifications() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final readIds = prefs.getStringList('delivery_read_notification_ids') ?? [];
      _readNotificationIds = readIds.toSet();
    } catch (e) {
      debugPrint('❌ Error loading read notifications: $e');
    }
  }

  Future<void> _saveReadNotifications() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList('delivery_read_notification_ids', _readNotificationIds.toList());
    } catch (e) {
      debugPrint('❌ Error saving read notifications: $e');
    }
  }

  /// Fetch notifications by generating from orders and history
  Future<void> fetchNotifications() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      debugPrint('🔔 Generating notifications from orders...');

      final List<DeliveryNotification> notifications = [];

      // Fetch active orders
      try {
        final orders = await _repository.getDeliveryOrders();
        debugPrint('🔔 Got ${orders.length} orders');

        for (final order in orders) {
          final notification = _createNotificationFromOrder(order);
          if (notification != null) {
            notifications.add(notification);
          }
        }
      } catch (e) {
        debugPrint('🔔 Error fetching orders: $e');
      }

      // Fetch history
      try {
        final history = await _repository.getHistory();
        debugPrint('🔔 Got ${history.length} history items');

        for (final order in history) {
          final notification = _createNotificationFromOrder(order, isHistory: true);
          if (notification != null) {
            notifications.add(notification);
          }
        }
      } catch (e) {
        debugPrint('🔔 Error fetching history: $e');
      }

      // Sort by date (newest first)
      notifications.sort((a, b) => b.createdAt.compareTo(a.createdAt));

      // Count unread
      final unreadCount = notifications.where((n) => !n.read).length;

      debugPrint('🔔 Generated ${notifications.length} notifications, $unreadCount unread');

      state = state.copyWith(
        notifications: notifications,
        unreadCount: unreadCount,
        isLoading: false,
      );
    } catch (e) {
      debugPrint('❌ Error generating notifications: $e');
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  DeliveryNotification? _createNotificationFromOrder(DeliveryOrderModel order, {bool isHistory = false}) {
    final id = 'order_${order.id}_${order.status}';
    final isRead = _readNotificationIds.contains(id);

    String title;
    String message;
    String type;

    if (order.isDelivered) {
      title = 'Delivery Completed';
      message = 'Order #${order.orderNumber} delivered successfully. Earned ${order.formattedTotalEarnings}';
      type = 'earning';
    } else if (order.isCancelled) {
      title = 'Order Cancelled';
      message = 'Order #${order.orderNumber} has been cancelled';
      type = 'system';
    } else if (order.isPending) {
      title = 'New Order Assigned';
      message = 'Order #${order.orderNumber} - ${order.itemCount} items, ${order.formattedDistance}';
      type = 'order';
    } else if (order.isAccepted) {
      title = 'Order Accepted';
      message = 'Order #${order.orderNumber} ready for pickup at ${order.shop?.name ?? 'store'}';
      type = 'order';
    } else if (order.isPickedUp) {
      title = 'Order Picked Up';
      message = 'Order #${order.orderNumber} - delivering to ${order.customer.name}';
      type = 'order';
    } else if (order.isOnTheWay) {
      title = 'On The Way';
      message = 'Order #${order.orderNumber} - delivering to ${order.deliveryAddress.street}';
      type = 'order';
    } else {
      title = 'Order Update';
      message = 'Order #${order.orderNumber} status: ${order.statusDisplay}';
      type = 'order';
    }

    DateTime createdAt;
    try {
      createdAt = DateTime.parse(order.createdAt);
    } catch (e) {
      createdAt = DateTime.now();
    }

    return DeliveryNotification(
      id: id,
      title: title,
      message: message,
      type: type,
      createdAt: createdAt,
      read: isRead,
      orderId: order.id,
    );
  }

  /// Mark notification as read
  Future<void> markAsRead(String id) async {
    _readNotificationIds.add(id);
    await _saveReadNotifications();

    final updatedNotifications = state.notifications.map((n) {
      if (n.id == id) {
        return n.copyWith(read: true);
      }
      return n;
    }).toList();

    state = state.copyWith(
      notifications: updatedNotifications,
      unreadCount: state.unreadCount > 0 ? state.unreadCount - 1 : 0,
    );
  }

  /// Mark all as read
  Future<void> markAllAsRead() async {
    for (final n in state.notifications) {
      _readNotificationIds.add(n.id);
    }
    await _saveReadNotifications();

    final updatedNotifications = state.notifications.map((n) {
      return n.copyWith(read: true);
    }).toList();

    state = state.copyWith(
      notifications: updatedNotifications,
      unreadCount: 0,
    );
  }

  /// Refresh notifications
  Future<void> refresh() async {
    await fetchNotifications();
  }

  /// Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }
}

/// Delivery repository provider
final deliveryRepositoryProvider = Provider<DeliveryRepository>((ref) {
  return DeliveryRepository();
});

/// Delivery notification provider
final deliveryNotificationProvider = StateNotifierProvider<DeliveryNotificationNotifier, DeliveryNotificationState>((ref) {
  final repository = ref.watch(deliveryRepositoryProvider);
  return DeliveryNotificationNotifier(repository);
});
