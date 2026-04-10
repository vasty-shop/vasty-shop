import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, CheckCheck, BellOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import { NotificationType, NotificationFilter } from '@/types/notification';

interface NotificationsListProps {
  className?: string;
}

export const NotificationsList: React.FC<NotificationsListProps> = ({ className }) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    currentPage,
    totalPages,
    fetchNotifications,
    markAllAsRead,
  } = useNotificationStore();

  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [selectedType, selectedStatus, currentPage]);

  const loadNotifications = () => {
    const filter: NotificationFilter = {
      page: currentPage,
      limit: 20,
    };

    if (selectedType !== 'all') {
      filter.type = selectedType;
    }

    if (selectedStatus === 'unread') {
      filter.read = false;
    } else if (selectedStatus === 'read') {
      filter.read = true;
    }

    fetchNotifications(filter);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    loadNotifications();
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      fetchNotifications({
        page: currentPage + 1,
        limit: 20,
        type: selectedType !== 'all' ? selectedType : undefined,
        read: selectedStatus !== 'all' ? selectedStatus === 'read' : undefined,
      });
    }
  };

  const notificationTypes = [
    { value: 'all', label: 'All Notifications' },
    { value: NotificationType.ORDER_CREATED, label: 'Orders' },
    { value: NotificationType.PAYMENT_SUCCESS, label: 'Payments' },
    { value: NotificationType.ORDER_SHIPPED, label: 'Shipping' },
    { value: NotificationType.SYSTEM_ANNOUNCEMENT, label: 'System' },
  ];

  const statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' },
  ];

  const hasNotifications = notifications.length > 0;

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header with Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold text-white bg-primary-lime rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-sm"
              >
                <CheckCheck className="w-4 h-4 mr-1.5" />
                Mark all read
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn('text-sm', showFilters && 'bg-gray-100')}
            >
              <Filter className="w-4 h-4 mr-1.5" />
              Filters
            </Button>
          </div>
        </div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-gray-200 overflow-hidden"
            >
              <div className="px-4 py-3 space-y-3">
                {/* Type Filter */}
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-2 block">
                    Notification Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {notificationTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setSelectedType(type.value as any)}
                        className={cn(
                          'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                          selectedType === type.value
                            ? 'bg-primary-lime text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        )}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-2 block">Status</label>
                  <div className="flex gap-2">
                    {statusFilters.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => setSelectedStatus(status.value as any)}
                        className={cn(
                          'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                          selectedStatus === status.value
                            ? 'bg-primary-lime text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        )}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary-lime animate-spin" />
          </div>
        ) : hasNotifications ? (
          <div className="space-y-2 p-4">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                showRemove
              />
            ))}

            {/* Load More Button */}
            {currentPage < totalPages && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="min-w-[200px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BellOff className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
            <p className="text-sm text-gray-500 text-center max-w-sm">
              {selectedType !== 'all' || selectedStatus !== 'all'
                ? 'No notifications match your filters. Try adjusting your filter settings.'
                : "You don't have any notifications yet. When you do, they'll appear here."}
            </p>
            {(selectedType !== 'all' || selectedStatus !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedType('all');
                  setSelectedStatus('all');
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
