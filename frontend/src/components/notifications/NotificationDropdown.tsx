import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, BellOff } from 'lucide-react';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
}) => {
  const { notifications, unreadCount, markAllAsRead, fetchNotifications, isLoading } =
    useNotificationStore();

  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      fetchNotifications({ limit: 10 });
    }
  }, [isOpen]);

  const recentNotifications = notifications.slice(0, 10);
  const hasNotifications = recentNotifications.length > 0;

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={onClose} />

          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-primary-lime rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1.5 text-xs font-medium text-primary-lime hover:text-primary-lime-dark transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-[480px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-lime"></div>
                </div>
              ) : hasNotifications ? (
                <div className="divide-y divide-gray-100">
                  {recentNotifications.map((notification) => (
                    <div key={notification.id} className="px-3 py-2" onClick={onClose}>
                      <NotificationItem notification={notification} compact />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <BellOff className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">No notifications yet</h4>
                  <p className="text-xs text-gray-500 text-center">
                    When you receive notifications, they'll appear here
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {hasNotifications && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <Link to="/notifications" onClick={onClose}>
                  <Button
                    variant="outline"
                    className="w-full text-sm font-medium text-primary-lime hover:text-primary-lime-dark hover:bg-primary-lime/5 border-primary-lime/20"
                  >
                    View All Notifications
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
