import 'package:flutter/foundation.dart';
import '../models/notification_model.dart';
import '../../../../core/network/dio_client.dart';

class NotificationService {
  final DioClient _dioClient = DioClient.instance;

  /// Fetch notifications with filters
  Future<NotificationResponse> getNotifications({
    String? type,
    bool? read,
    int? page,
    int? limit,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (type != null) queryParams['type'] = type;
      if (read != null) queryParams['unreadOnly'] = !read; // Backend uses unreadOnly
      if (page != null) queryParams['offset'] = ((page - 1) * (limit ?? 20)); // Backend uses offset
      if (limit != null) queryParams['limit'] = limit;

      debugPrint('🔔 Fetching notifications with params: $queryParams');

      final response = await _dioClient.get(
        '/notifications',
        queryParameters: queryParams,
      );

      debugPrint('🔔 Notifications response: ${response.data}');

      // Backend returns: { data: [...], total, limit, offset }
      // We need to transform to: { notifications, total, page, totalPages, unreadCount }
      final responseData = response.data;
      List<dynamic> notificationsData = [];
      int total = 0;
      int currentLimit = limit ?? 20;
      int offset = 0;

      if (responseData is Map) {
        // Check if data is wrapped in another data field
        if (responseData['data'] != null) {
          final innerData = responseData['data'];
          if (innerData is List) {
            notificationsData = innerData;
            total = responseData['total'] ?? notificationsData.length;
          } else if (innerData is Map) {
            notificationsData = innerData['data'] as List? ?? [];
            total = innerData['total'] ?? notificationsData.length;
            currentLimit = innerData['limit'] ?? currentLimit;
            offset = innerData['offset'] ?? 0;
          }
        }
        total = responseData['total'] ?? total;
        currentLimit = responseData['limit'] ?? currentLimit;
        offset = responseData['offset'] ?? offset;
      }

      debugPrint('🔔 Parsed ${notificationsData.length} notifications');

      // Transform notification data to match model
      final notifications = notificationsData.map((n) {
        // Backend uses isRead, mobile model uses read
        final notificationMap = Map<String, dynamic>.from(n as Map);
        if (notificationMap['isRead'] != null && notificationMap['read'] == null) {
          notificationMap['read'] = notificationMap['isRead'];
        }
        return NotificationModel.fromJson(notificationMap);
      }).toList();

      // Calculate page info
      final currentPage = (offset ~/ currentLimit) + 1;
      final totalPages = (total / currentLimit).ceil();

      // Get unread count separately
      int unreadCount = 0;
      try {
        final unreadResult = await getUnreadCount();
        unreadCount = unreadResult['unreadCount'] ?? unreadResult['count'] ?? 0;
      } catch (e) {
        debugPrint('🔔 Failed to get unread count: $e');
      }

      return NotificationResponse(
        notifications: notifications,
        total: total,
        page: currentPage,
        totalPages: totalPages > 0 ? totalPages : 1,
        unreadCount: unreadCount,
      );
    } catch (e) {
      debugPrint('🔔 Error fetching notifications: $e');
      rethrow;
    }
  }

  /// Get unread count
  Future<Map<String, dynamic>> getUnreadCount() async {
    try {
      final response = await _dioClient.get('/notifications/unread-count');
      debugPrint('🔔 Unread count response: ${response.data}');

      // Backend returns { count: X } or { data: { count: X } }
      if (response.data is Map) {
        if (response.data['data'] != null && response.data['data'] is Map) {
          final count = response.data['data']['count'] ?? 0;
          return {'unreadCount': count, 'count': count};
        }
        final count = response.data['count'] ?? 0;
        return {'unreadCount': count, 'count': count};
      }
      return {'unreadCount': 0, 'count': 0};
    } catch (e) {
      debugPrint('🔔 Error fetching unread count: $e');
      return {'unreadCount': 0, 'count': 0};
    }
  }

  /// Mark notification as read
  Future<NotificationModel> markAsRead(String id) async {
    try {
      final response = await _dioClient.patch('/notifications/$id/read', data: {});
      debugPrint('🔔 Mark as read response: ${response.data}');

      // Handle response structure
      Map<String, dynamic> notificationData;
      if (response.data is Map && response.data['data'] != null) {
        notificationData = Map<String, dynamic>.from(response.data['data'] as Map);
      } else if (response.data is Map) {
        notificationData = Map<String, dynamic>.from(response.data as Map);
      } else {
        throw Exception('Invalid response format');
      }

      // Transform isRead to read
      if (notificationData['isRead'] != null && notificationData['read'] == null) {
        notificationData['read'] = notificationData['isRead'];
      }

      return NotificationModel.fromJson(notificationData);
    } catch (e) {
      debugPrint('🔔 Error marking as read: $e');
      rethrow;
    }
  }

  /// Mark all notifications as read
  Future<Map<String, dynamic>> markAllAsRead() async {
    try {
      final response = await _dioClient.patch('/notifications/read-all', data: {});
      debugPrint('🔔 Mark all as read response: ${response.data}');

      if (response.data is Map && response.data['data'] != null) {
        return response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        return response.data as Map<String, dynamic>;
      }
      return {'message': 'All notifications marked as read', 'count': 0};
    } catch (e) {
      debugPrint('🔔 Error marking all as read: $e');
      rethrow;
    }
  }

  /// Delete notification
  Future<void> deleteNotification(String id) async {
    try {
      await _dioClient.delete('/notifications/$id');
    } catch (e) {
      rethrow;
    }
  }

  /// Delete all read notifications
  Future<Map<String, dynamic>> deleteAllRead() async {
    try {
      final response = await _dioClient.delete('/notifications/read');
      return response.data['data'] as Map<String, dynamic>;
    } catch (e) {
      rethrow;
    }
  }
}
