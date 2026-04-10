import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:timeago/timeago.dart' as timeago;
import 'package:easy_localization/easy_localization.dart';
import '../providers/delivery_notification_provider.dart';

class DeliveryNotificationsPage extends ConsumerStatefulWidget {
  const DeliveryNotificationsPage({super.key});

  @override
  ConsumerState<DeliveryNotificationsPage> createState() => _DeliveryNotificationsPageState();
}

class _DeliveryNotificationsPageState extends ConsumerState<DeliveryNotificationsPage> {
  String _filter = 'all'; // all, unread, read

  @override
  void initState() {
    super.initState();
    // Fetch notifications on page load
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(deliveryNotificationProvider.notifier).fetchNotifications();
    });
  }

  List<DeliveryNotification> _getFilteredNotifications(List<DeliveryNotification> notifications) {
    switch (_filter) {
      case 'unread':
        return notifications.where((n) => !n.read).toList();
      case 'read':
        return notifications.where((n) => n.read).toList();
      default:
        return notifications;
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(deliveryNotificationProvider);
    final theme = Theme.of(context);
    final filteredNotifications = _getFilteredNotifications(state.notifications);

    // Calculate stats
    final totalActivity = state.notifications.length;
    final unreadCount = state.notifications.where((n) => !n.read).length;
    final deliveriesCount = state.notifications.where((n) => n.type == 'order').length;
    final completedCount = state.notifications.where((n) => n.type == 'earning').length;

    return Scaffold(
      appBar: AppBar(
        title: Text('delivery.notifications.title'.tr()),
        actions: [
          if (state.unreadCount > 0)
            TextButton(
              onPressed: () {
                ref.read(deliveryNotificationProvider.notifier).markAllAsRead();
              },
              child: Text('delivery.notifications.markAllRead'.tr()),
            ),
        ],
      ),
      body: state.isLoading && state.notifications.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : state.error != null && state.notifications.isEmpty
              ? _buildErrorState(state.error!)
              : RefreshIndicator(
                  onRefresh: () => ref.read(deliveryNotificationProvider.notifier).refresh(),
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Stats Cards
                        _buildStatsCards(
                          theme,
                          totalActivity: totalActivity,
                          unreadCount: unreadCount,
                          deliveriesCount: deliveriesCount,
                          completedCount: completedCount,
                        ),
                        const SizedBox(height: 16),
                        // Filter Buttons
                        _buildFilterButtons(theme),
                        const SizedBox(height: 16),
                        // Notifications List
                        if (filteredNotifications.isEmpty)
                          _buildEmptyState(theme)
                        else
                          _buildNotificationsList(filteredNotifications, theme),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildStatsCards(
    ThemeData theme, {
    required int totalActivity,
    required int unreadCount,
    required int deliveriesCount,
    required int completedCount,
  }) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                icon: Icons.notifications_rounded,
                label: 'delivery.notifications.totalActivity'.tr(),
                value: totalActivity.toString(),
                gradientColors: [Colors.orange.shade400, Colors.orange.shade600],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatCard(
                icon: Icons.mark_email_unread_rounded,
                label: 'delivery.notifications.unread'.tr(),
                value: unreadCount.toString(),
                gradientColors: [Colors.red.shade400, Colors.red.shade600],
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                icon: Icons.local_shipping_rounded,
                label: 'delivery.notifications.deliveries'.tr(),
                value: deliveriesCount.toString(),
                gradientColors: [Colors.blue.shade400, Colors.blue.shade600],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatCard(
                icon: Icons.check_circle_rounded,
                label: 'delivery.notifications.completed'.tr(),
                value: completedCount.toString(),
                gradientColors: [Colors.green.shade400, Colors.green.shade600],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String label,
    required String value,
    required List<Color> gradientColors,
  }) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.dividerColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: theme.hintColor,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: gradientColors,
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: gradientColors[0].withValues(alpha: 0.3),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Icon(icon, color: Colors.white, size: 24),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterButtons(ThemeData theme) {
    return Row(
      children: [
        _buildFilterButton('all', 'delivery.notifications.filterAll'.tr(), theme),
        const SizedBox(width: 8),
        _buildFilterButton('unread', 'delivery.notifications.filterUnread'.tr(), theme),
        const SizedBox(width: 8),
        _buildFilterButton('read', 'delivery.notifications.filterRead'.tr(), theme),
      ],
    );
  }

  Widget _buildFilterButton(String filter, String label, ThemeData theme) {
    final isSelected = _filter == filter;
    return GestureDetector(
      onTap: () {
        setState(() {
          _filter = filter;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? Colors.orange : theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(10),
          border: isSelected ? null : Border.all(color: theme.dividerColor),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: isSelected ? Colors.white : theme.colorScheme.onSurface.withValues(alpha: 0.7),
          ),
        ),
      ),
    );
  }

  Widget _buildNotificationsList(List<DeliveryNotification> notifications, ThemeData theme) {
    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.dividerColor),
      ),
      child: Column(
        children: notifications.asMap().entries.map((entry) {
          final index = entry.key;
          final notification = entry.value;
          final isLast = index == notifications.length - 1;
          return Column(
            children: [
              _DeliveryNotificationItem(notification: notification),
              if (!isLast)
                Divider(height: 1, color: theme.dividerColor),
            ],
          );
        }).toList(),
      ),
    );
  }

  Widget _buildEmptyState(ThemeData theme) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.notifications_none_rounded,
                size: 64,
                color: Colors.grey.shade400,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'delivery.notifications.noNotifications'.tr(),
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'delivery.notifications.noNotificationsDesc'.tr(),
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(String error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline_rounded,
              size: 64,
              color: Colors.red.shade300,
            ),
            const SizedBox(height: 16),
            Text(
              'delivery.notifications.errorLoading'.tr(),
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                ref.read(deliveryNotificationProvider.notifier).refresh();
              },
              child: Text('common.retry'.tr()),
            ),
          ],
        ),
      ),
    );
  }
}

class _DeliveryNotificationItem extends ConsumerWidget {
  final DeliveryNotification notification;

  const _DeliveryNotificationItem({required this.notification});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return InkWell(
      onTap: () {
        if (!notification.read) {
          ref.read(deliveryNotificationProvider.notifier).markAsRead(notification.id);
        }
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: notification.read
              ? theme.colorScheme.surface
              : theme.primaryColor.withValues(alpha: 0.05),
          border: Border(
            bottom: BorderSide(color: theme.dividerColor),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildIcon(),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          notification.title,
                          style: TextStyle(
                            fontWeight: notification.read ? FontWeight.normal : FontWeight.bold,
                            fontSize: 15,
                            color: theme.colorScheme.onSurface,
                          ),
                        ),
                      ),
                      if (!notification.read)
                        Container(
                          width: 10,
                          height: 10,
                          decoration: BoxDecoration(
                            color: theme.primaryColor,
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    notification.message,
                    style: TextStyle(
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    timeago.format(notification.createdAt),
                    style: TextStyle(
                      color: Colors.grey.shade500,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildIcon() {
    IconData icon;
    Color color;

    switch (notification.type) {
      case 'order':
        icon = Icons.local_shipping_rounded;
        color = Colors.blue;
        break;
      case 'earning':
        icon = Icons.attach_money_rounded;
        color = Colors.green;
        break;
      case 'system':
        icon = Icons.info_rounded;
        color = Colors.orange;
        break;
      default:
        icon = Icons.notifications_rounded;
        color = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Icon(icon, color: color, size: 24),
    );
  }
}
