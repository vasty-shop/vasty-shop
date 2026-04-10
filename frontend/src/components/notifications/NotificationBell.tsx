import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useUserStore } from '@/stores/useUserStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { NotificationDropdown } from './NotificationDropdown';
import { Notification } from '@/types/notification';

export const NotificationBell: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const { unreadCount, addNotification, fetchNotifications } = useNotificationStore();
  const { user } = useUserStore();

  // Check if user is authenticated
  const isAuthenticated = !!user || !!localStorage.getItem('authToken');

  // Handle new notifications from WebSocket
  const handleNotification = (notification: Notification) => {
    addNotification(notification);
    setHasNewNotification(true);

    // Show toast notification
    toast.success(notification.title, {
      description: notification.message,
      duration: 5000,
    });

    // Reset animation after 1 second
    setTimeout(() => {
      setHasNewNotification(false);
    }, 1000);
  };

  // Initialize WebSocket connection only when authenticated
  const { isConnected } = useWebSocket({
    enabled: isAuthenticated,
    onNotification: handleNotification,
    onConnect: () => {
      fetchNotifications({ limit: 10 });
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    },
  });

  // Fetch notifications on mount only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications({ limit: 10 });
    }
  }, [isAuthenticated]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={toggleDropdown}
        className={cn(
          'relative p-2 hover:bg-gray-100 rounded-lg transition-all duration-200',
          isDropdownOpen && 'bg-gray-100'
        )}
        aria-label="Notifications"
      >
        {/* Bell Icon with Animation */}
        <motion.div
          animate={hasNewNotification ? { rotate: [0, -15, 15, -15, 15, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Bell
            className={cn(
              'w-6 h-6 transition-colors',
              isConnected ? 'text-gray-700' : 'text-gray-400'
            )}
          />
        </motion.div>

        {/* Unread Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute -top-1 -right-1 bg-badge-sale text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow-md"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Connection Indicator Dot */}
        {isConnected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white"
          />
        )}

        {/* Pulse Effect for New Notifications */}
        {hasNewNotification && (
          <motion.div
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-primary-lime rounded-lg"
          />
        )}
      </button>

      {/* Dropdown */}
      <NotificationDropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} />
    </div>
  );
};
