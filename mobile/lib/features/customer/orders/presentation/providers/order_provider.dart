import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../shared/models/order_model.dart';
import '../../../../../shared/repositories/order_repository.dart';

// Order State
class OrderState {
  final List<OrderModel> orders;
  final bool isLoading;
  final String? error;
  final String? selectedStatus;

  OrderState({
    this.orders = const [],
    this.isLoading = false,
    this.error,
    this.selectedStatus,
  });

  OrderState copyWith({
    List<OrderModel>? orders,
    bool? isLoading,
    String? error,
    String? selectedStatus,
  }) {
    return OrderState(
      orders: orders ?? this.orders,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      selectedStatus: selectedStatus ?? this.selectedStatus,
    );
  }

  // Computed properties
  int get totalOrders => orders.length;

  int get activeOrders => orders
      .where((order) => [
            'processing',
            'confirmed',
            'shipped',
            'in_transit',
            'out_for_delivery'
          ].contains(order.status.toLowerCase()))
      .length;

  double get totalSpent => orders
      .where((order) =>
          !['cancelled', 'refunded'].contains(order.status.toLowerCase()))
      .fold(0.0, (sum, order) => sum + order.total);

  int get pendingReturns =>
      orders.where((order) => order.status.toLowerCase() == 'returned').length;

  List<OrderModel> get filteredOrders {
    if (selectedStatus == null || selectedStatus == 'all') {
      return orders;
    }
    return orders
        .where((order) => order.status.toLowerCase() == selectedStatus!.toLowerCase())
        .toList();
  }
}

// Order Notifier
class OrderNotifier extends StateNotifier<OrderState> {
  final OrderRepository _repository;

  OrderNotifier(this._repository) : super(OrderState());

  /// Load all orders
  Future<void> loadOrders({String? status}) async {
    state = state.copyWith(isLoading: true, error: null, selectedStatus: status);

    try {
      final orders = await _repository.getOrders(status: status);
      state = OrderState(orders: orders, isLoading: false, selectedStatus: status);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Refresh orders
  Future<void> refreshOrders() async {
    await loadOrders(status: state.selectedStatus);
  }

  /// Filter orders by status
  void filterByStatus(String? status) {
    state = state.copyWith(selectedStatus: status);
  }

  /// Cancel an order
  Future<bool> cancelOrder(String orderId, String? reason) async {
    try {
      await _repository.cancelOrder(orderId, reason: reason);

      // Update local state
      state = state.copyWith(
        orders: state.orders.map((order) {
          if (order.id == orderId) {
            return OrderModel(
              id: order.id,
              orderNumber: order.orderNumber,
              status: 'cancelled',
              total: order.total,
              subtotal: order.subtotal,
              shipping: order.shipping,
              tax: order.tax,
              discount: order.discount,
              paymentMethod: order.paymentMethod,
              orderDate: order.orderDate,
              estimatedDelivery: order.estimatedDelivery,
              deliveryDate: order.deliveryDate,
              items: order.items,
              shippingAddress: order.shippingAddress,
              trackingNumber: order.trackingNumber,
              invoiceUrl: order.invoiceUrl,
              canCancel: false,
              canReturn: order.canReturn,
              canReview: order.canReview,
            );
          }
          return order;
        }).toList(),
      );

      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  /// Request return for an order
  Future<bool> requestReturn(String orderId, String reason) async {
    try {
      await _repository.requestReturn(orderId, reason);

      // Update local state
      state = state.copyWith(
        orders: state.orders.map((order) {
          if (order.id == orderId) {
            return OrderModel(
              id: order.id,
              orderNumber: order.orderNumber,
              status: order.status,
              total: order.total,
              subtotal: order.subtotal,
              shipping: order.shipping,
              tax: order.tax,
              discount: order.discount,
              paymentMethod: order.paymentMethod,
              orderDate: order.orderDate,
              estimatedDelivery: order.estimatedDelivery,
              deliveryDate: order.deliveryDate,
              items: order.items,
              shippingAddress: order.shippingAddress,
              trackingNumber: order.trackingNumber,
              invoiceUrl: order.invoiceUrl,
              canCancel: order.canCancel,
              canReturn: false,
              canReview: order.canReview,
            );
          }
          return order;
        }).toList(),
      );

      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }
}

// Providers
final orderRepositoryProvider = Provider<OrderRepository>((ref) {
  return OrderRepository();
});

final orderProvider = StateNotifierProvider<OrderNotifier, OrderState>((ref) {
  final repository = ref.watch(orderRepositoryProvider);
  return OrderNotifier(repository);
});

// Helper providers
final orderCountProvider = Provider<int>((ref) {
  return ref.watch(orderProvider).totalOrders;
});

final activeOrderCountProvider = Provider<int>((ref) {
  return ref.watch(orderProvider).activeOrders;
});
