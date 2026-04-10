import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Notification, NotificationFilter } from '@/types/notification';
import * as notificationApi from '@/lib/api/notifications';

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;

  // Actions
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (notificationId: string) => Promise<void>;
  fetchNotifications: (filter?: NotificationFilter) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  setNotifications: (notifications: Notification[]) => void;
  setUnreadCount: (count: number) => void;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      currentPage: 1,
      totalPages: 1,

      addNotification: (notification) => {
        set((state) => {
          // Check if notification already exists
          const exists = state.notifications.some((n) => n.id === notification.id);
          if (exists) {
            return state;
          }

          return {
            notifications: [notification, ...state.notifications],
            unreadCount: notification.read ? state.unreadCount : state.unreadCount + 1,
          };
        });
      },

      markAsRead: async (notificationId) => {
        try {
          await notificationApi.markAsRead(notificationId);

          set((state) => {
            const notification = state.notifications.find((n) => n.id === notificationId);
            const wasUnread = notification && !notification.read;

            return {
              notifications: state.notifications.map((n) =>
                n.id === notificationId ? { ...n, read: true } : n
              ),
              unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
            };
          });
        } catch (error) {
          set({ error: 'Failed to mark notification as read' });
          console.error('Error marking notification as read:', error);
        }
      },

      markAllAsRead: async () => {
        try {
          await notificationApi.markAllAsRead();

          set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
          }));
        } catch (error) {
          set({ error: 'Failed to mark all notifications as read' });
          console.error('Error marking all notifications as read:', error);
        }
      },

      removeNotification: async (notificationId) => {
        try {
          await notificationApi.deleteNotification(notificationId);

          set((state) => {
            const notification = state.notifications.find((n) => n.id === notificationId);
            const wasUnread = notification && !notification.read;

            return {
              notifications: state.notifications.filter((n) => n.id !== notificationId),
              unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
            };
          });
        } catch (error) {
          set({ error: 'Failed to delete notification' });
          console.error('Error deleting notification:', error);
        }
      },

      fetchNotifications: async (filter = {}) => {
        set({ isLoading: true, error: null });

        try {
          const response = await notificationApi.fetchNotifications(filter);

          set({
            notifications: response.notifications,
            unreadCount: response.unreadCount,
            currentPage: response.page,
            totalPages: response.totalPages,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: 'Failed to fetch notifications',
            isLoading: false,
          });
          console.error('Error fetching notifications:', error);
        }
      },

      fetchUnreadCount: async () => {
        try {
          const count = await notificationApi.getUnreadCount();
          set({ unreadCount: count });
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      },

      setNotifications: (notifications) => {
        set({ notifications });
      },

      setUnreadCount: (count) => {
        set({ unreadCount: count });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        unreadCount: state.unreadCount,
      }),
    }
  )
);
