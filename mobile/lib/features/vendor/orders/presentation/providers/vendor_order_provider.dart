import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../shared/models/order_model.dart';
import '../../../../../shared/repositories/vendor_order_repository.dart';

class VendorOrderState {
  final List<OrderModel> orders;
  final bool isLoading;
  final String? error;
  final String? selectedStatus;
  final String searchQuery;
  final String dateRange;
  final String paymentMethod;

  VendorOrderState({
    this.orders = const [],
    this.isLoading = false,
    this.error,
    this.selectedStatus,
    this.searchQuery = '',
    this.dateRange = 'all',
    this.paymentMethod = 'all',
  });

  VendorOrderState copyWith({
    List<OrderModel>? orders,
    bool? isLoading,
    String? error,
    String? selectedStatus,
    String? searchQuery,
    String? dateRange,
    String? paymentMethod,
  }) {
    return VendorOrderState(
      orders: orders ?? this.orders,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      selectedStatus: selectedStatus ?? this.selectedStatus,
      searchQuery: searchQuery ?? this.searchQuery,
      dateRange: dateRange ?? this.dateRange,
      paymentMethod: paymentMethod ?? this.paymentMethod,
    );
  }

  List<OrderModel> get filteredOrders {
    var filtered = orders;

    // Filter by status
    if (selectedStatus != null && selectedStatus != 'all') {
      filtered = filtered.where((order) => order.status.toLowerCase() == selectedStatus!.toLowerCase()).toList();
    }

    // Filter by search query
    if (searchQuery.isNotEmpty) {
      final query = searchQuery.toLowerCase();
      filtered = filtered.where((order) {
        return order.orderNumber.toLowerCase().contains(query) ||
            order.id.toLowerCase().contains(query) ||
            order.shippingAddress.fullAddress.toLowerCase().contains(query);
      }).toList();
    }

    // Filter by date range
    if (dateRange != 'all') {
      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);

      filtered = filtered.where((order) {
        final orderDate = order.orderDate;
        switch (dateRange) {
          case 'today':
            return orderDate.isAfter(today) || orderDate.isAtSameMomentAs(today);
          case 'week':
            final weekAgo = today.subtract(const Duration(days: 7));
            return orderDate.isAfter(weekAgo);
          case 'month':
            final monthAgo = DateTime(now.year, now.month - 1, now.day);
            return orderDate.isAfter(monthAgo);
          case 'year':
            final yearAgo = DateTime(now.year - 1, now.month, now.day);
            return orderDate.isAfter(yearAgo);
          default:
            return true;
        }
      }).toList();
    }

    // Filter by payment method
    if (paymentMethod != 'all') {
      filtered = filtered.where((order) =>
        order.paymentMethod.toLowerCase() == paymentMethod.toLowerCase()
      ).toList();
    }

    return filtered;
  }

  bool get hasActiveFilters =>
      (selectedStatus != null && selectedStatus != 'all') ||
      searchQuery.isNotEmpty ||
      dateRange != 'all' ||
      paymentMethod != 'all';

  int get totalOrders => orders.length;

  int get pendingOrders => orders.where((o) => o.status.toLowerCase() == 'pending').length;

  int get processingOrders => orders.where((o) => o.status.toLowerCase() == 'processing').length;

  int get shippedOrders => orders.where((o) => o.status.toLowerCase() == 'shipped' || o.status.toLowerCase() == 'in_transit').length;

  int get deliveredOrders => orders.where((o) => o.status.toLowerCase() == 'delivered').length;

  double get totalRevenue => orders
      .where((o) => o.status.toLowerCase() == 'delivered')
      .fold(0.0, (sum, order) => sum + order.total);
}

class VendorOrderNotifier extends StateNotifier<VendorOrderState> {
  final VendorOrderRepository _repository;
  final String shopId;

  VendorOrderNotifier(this._repository, this.shopId) : super(VendorOrderState());

  Future<void> loadOrders({String? status}) async {
    state = state.copyWith(isLoading: true, error: null, selectedStatus: status);
    try {
      final orders = await _repository.getVendorOrders(
        shopId: shopId,
        status: status != null && status != 'all' ? status : null,
        limit: 100,
      );
      state = VendorOrderState(orders: orders, isLoading: false, selectedStatus: status);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> refreshOrders() async {
    await loadOrders(status: state.selectedStatus);
  }

  void filterByStatus(String? status) {
    state = state.copyWith(selectedStatus: status);
  }

  void setSearchQuery(String query) {
    state = state.copyWith(searchQuery: query);
  }

  void setDateRange(String range) {
    state = state.copyWith(dateRange: range);
  }

  void setPaymentMethod(String method) {
    state = state.copyWith(paymentMethod: method);
  }

  void clearFilters() {
    state = state.copyWith(
      selectedStatus: 'all',
      searchQuery: '',
      dateRange: 'all',
      paymentMethod: 'all',
    );
  }

  Future<bool> acceptOrder(String orderId) async {
    try {
      await _repository.acceptOrder(orderId, shopId);
      // Refresh orders after accepting
      await refreshOrders();
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  Future<bool> markAsShipped(String orderId, {String? trackingNumber}) async {
    try {
      await _repository.markAsShipped(orderId, shopId, trackingNumber: trackingNumber);
      // Refresh orders after marking as shipped
      await refreshOrders();
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  Future<bool> cancelOrder(String orderId, String reason) async {
    try {
      await _repository.cancelOrder(orderId, shopId, reason);
      // Refresh orders after cancelling
      await refreshOrders();
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }
}

final vendorOrderRepositoryProvider = Provider<VendorOrderRepository>((ref) {
  return VendorOrderRepository();
});

final vendorOrderProvider = StateNotifierProvider.family<VendorOrderNotifier, VendorOrderState, String>(
  (ref, shopId) {
    final repository = ref.watch(vendorOrderRepositoryProvider);
    return VendorOrderNotifier(repository, shopId);
  },
);
