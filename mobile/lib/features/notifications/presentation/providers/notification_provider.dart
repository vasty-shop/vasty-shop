import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/notification_model.dart';
import '../../data/services/notification_service.dart';

/// Notification service provider
final notificationServiceProvider = Provider<NotificationService>((ref) {
  return NotificationService();
});

/// Notification state
class NotificationState {
  final List<NotificationModel> notifications;
  final int unreadCount;
  final bool isLoading;
  final String? error;
  final int currentPage;
  final int totalPages;

  NotificationState({
    this.notifications = const [],
    this.unreadCount = 0,
    this.isLoading = false,
    this.error,
    this.currentPage = 1,
    this.totalPages = 1,
  });

  NotificationState copyWith({
    List<NotificationModel>? notifications,
    int? unreadCount,
    bool? isLoading,
    String? error,
    int? currentPage,
    int? totalPages,
  }) {
    return NotificationState(
      notifications: notifications ?? this.notifications,
      unreadCount: unreadCount ?? this.unreadCount,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      currentPage: currentPage ?? this.currentPage,
      totalPages: totalPages ?? this.totalPages,
    );
  }
}

/// Notification notifier
class NotificationNotifier extends StateNotifier<NotificationState> {
  final NotificationService _service;

  NotificationNotifier(this._service) : super(NotificationState()) {
    fetchUnreadCount();
  }

  /// Fetch notifications with filters
  Future<void> fetchNotifications({
    NotificationType? type,
    bool? read,
    int page = 1,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _service.getNotifications(
        type: type?.name,
        read: read,
        page: page,
        limit: 20,
      );

      state = state.copyWith(
        notifications: page == 1
            ? response.notifications
            : [...state.notifications, ...response.notifications],
        unreadCount: response.unreadCount,
        currentPage: response.page,
        totalPages: response.totalPages,
        isLoading: false,
      );
    } catch (e) {
      debugPrint('Error fetching notifications: $e');
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Fetch unread count
  Future<void> fetchUnreadCount() async {
    try {
      final result = await _service.getUnreadCount();
      final count = result['unreadCount'] as int? ?? 0;
      state = state.copyWith(unreadCount: count);
    } catch (e) {
      debugPrint('Error fetching unread count: $e');
    }
  }

  /// Mark notification as read
  Future<void> markAsRead(String id) async {
    try {
      await _service.markAsRead(id);

      // Update local state
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
    } catch (e) {
      debugPrint('Error marking notification as read: $e');
    }
  }

  /// Mark all as read
  Future<void> markAllAsRead() async {
    try {
      await _service.markAllAsRead();

      // Update local state
      final updatedNotifications = state.notifications.map((n) {
        return n.copyWith(read: true);
      }).toList();

      state = state.copyWith(
        notifications: updatedNotifications,
        unreadCount: 0,
      );
    } catch (e) {
      debugPrint('Error marking all as read: $e');
    }
  }

  /// Delete notification
  Future<void> deleteNotification(String id) async {
    try {
      await _service.deleteNotification(id);

      // Remove from local state
      final updatedNotifications = state.notifications.where((n) => n.id != id).toList();

      state = state.copyWith(notifications: updatedNotifications);
    } catch (e) {
      debugPrint('Error deleting notification: $e');
    }
  }

  /// Delete all read notifications
  Future<void> deleteAllRead() async {
    try {
      await _service.deleteAllRead();

      // Remove read notifications from local state
      final updatedNotifications = state.notifications.where((n) => !n.read).toList();

      state = state.copyWith(notifications: updatedNotifications);
    } catch (e) {
      debugPrint('Error deleting read notifications: $e');
    }
  }

  /// Add new notification (for real-time updates)
  void addNotification(NotificationModel notification) {
    state = state.copyWith(
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    );
  }

  /// Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }

  /// Refresh notifications
  Future<void> refresh() async {
    await Future.wait([
      fetchNotifications(page: 1),
      fetchUnreadCount(),
    ]);
  }
}

/// Notification provider
final notificationProvider = StateNotifierProvider<NotificationNotifier, NotificationState>((ref) {
  final service = ref.watch(notificationServiceProvider);
  return NotificationNotifier(service);
});
