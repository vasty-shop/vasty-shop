import { Notification, NotificationFilter, NotificationResponse } from '@/types/notification';
import { apiClient } from '@/lib/api-client';

/**
 * Fetch notifications with optional filters
 */
export const fetchNotifications = async (
  filter: NotificationFilter = {}
): Promise<NotificationResponse> => {
  const params = new URLSearchParams();

  if (filter.type && filter.type !== 'all') {
    params.append('type', filter.type);
  }

  if (filter.read !== undefined && filter.read !== 'all') {
    params.append('read', String(filter.read));
  }

  if (filter.page) {
    params.append('page', String(filter.page));
  }

  if (filter.limit) {
    params.append('limit', String(filter.limit));
  }

  const queryString = params.toString();
  const url = queryString ? `/notifications?${queryString}` : '/notifications';

  const response = await apiClient.get<NotificationResponse>(url);
  return response.data;
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (): Promise<number> => {
  const response = await apiClient.get<{ unreadCount: number }>('/notifications/unread-count');
  return response.data.unreadCount;
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (notificationId: string): Promise<Notification> => {
  const response = await apiClient.patch<Notification>(`/notifications/${notificationId}/read`, {});
  return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<{ success: boolean; modifiedCount: number }> => {
  const response = await apiClient.patch<{ success: boolean; modifiedCount: number }>('/notifications/read-all', {});
  return response.data;
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete<{ success: boolean }>(`/notifications/${notificationId}`);
  return response.data;
};

/**
 * Delete all read notifications
 */
export const deleteAllRead = async (): Promise<{ success: boolean; deletedCount: number }> => {
  const response = await apiClient.delete<{ success: boolean; deletedCount: number }>('/notifications/read');
  return response.data;
};
