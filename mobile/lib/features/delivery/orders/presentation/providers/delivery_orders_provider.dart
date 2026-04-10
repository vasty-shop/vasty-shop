import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/delivery_order_model.dart';
import '../../data/repositories/delivery_repository.dart';


/// State for delivery orders
class DeliveryOrdersState {
  final List<DeliveryOrderModel> orders;
  final bool isLoading;
  final String? error;
  final int currentPage;
  final bool hasMore;
  final String? currentFilter; // pending, accepted, picked_up, delivered

  DeliveryOrdersState({
    this.orders = const [],
    this.isLoading = false,
    this.error,
    this.currentPage = 1,
    this.hasMore = true,
    this.currentFilter,
  });

  DeliveryOrdersState copyWith({
    List<DeliveryOrderModel>? orders,
    bool? isLoading,
    String? error,
    int? currentPage,
    bool? hasMore,
    String? currentFilter,
  }) {
    return DeliveryOrdersState(
      orders: orders ?? this.orders,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
      currentFilter: currentFilter ?? this.currentFilter,
    );
  }

  // Get orders by status
  List<DeliveryOrderModel> get pendingOrders =>
      orders.where((o) => o.isPending).toList();
  List<DeliveryOrderModel> get activeOrders =>
      orders.where((o) => o.isAccepted || o.isPickedUp || o.isOnTheWay).toList();
  List<DeliveryOrderModel> get completedOrders =>
      orders.where((o) => o.isDelivered).toList();
}

/// Delivery Orders Notifier
class DeliveryOrdersNotifier extends StateNotifier<DeliveryOrdersState> {
  final DeliveryRepository _repository;

  DeliveryOrdersNotifier(this._repository) : super(DeliveryOrdersState());

  /// Load delivery orders
  Future<void> loadOrders({bool refresh = false, String? status}) async {
    if (state.isLoading && !refresh) return;

    state = state.copyWith(
      isLoading: true,
      error: null,
      currentFilter: status,
    );

    try {
      final orders = await _repository.getDeliveryOrders(
        page: refresh ? 1 : state.currentPage,
        limit: 20,
        status: status,
      );

      state = DeliveryOrdersState(
        orders: refresh ? orders : [...state.orders, ...orders],
        isLoading: false,
        hasMore: orders.length >= 20,
        currentPage: refresh ? 2 : state.currentPage + 1,
        currentFilter: status,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Refresh orders
  Future<void> refresh() async {
    await loadOrders(refresh: true, status: state.currentFilter);
  }

  /// Accept an order
  Future<void> acceptOrder(String orderId) async {
    try {
      final updatedOrder = await _repository.acceptOrder(orderId);

      // Update the order in the list
      final updatedOrders = state.orders.map((order) {
        return order.id == orderId ? updatedOrder : order;
      }).toList();

      state = state.copyWith(orders: updatedOrders);
    } catch (e) {
      state = state.copyWith(error: e.toString());
      rethrow;
    }
  }

  /// Reject an order
  Future<void> rejectOrder(String orderId, {String? reason}) async {
    try {
      await _repository.rejectOrder(orderId, reason: reason);

      // Remove the order from the list
      final updatedOrders =
          state.orders.where((order) => order.id != orderId).toList();

      state = state.copyWith(orders: updatedOrders);
    } catch (e) {
      state = state.copyWith(error: e.toString());
      rethrow;
    }
  }

  /// Mark order as picked up
  Future<void> pickupOrder(String orderId) async {
    try {
      final updatedOrder = await _repository.pickupOrder(orderId);

      // Update the order in the list
      final updatedOrders = state.orders.map((order) {
        return order.id == orderId ? updatedOrder : order;
      }).toList();

      state = state.copyWith(orders: updatedOrders);
    } catch (e) {
      state = state.copyWith(error: e.toString());
      rethrow;
    }
  }

  /// Mark order as on the way
  Future<void> markOnTheWay(String orderId) async {
    try {
      final updatedOrder = await _repository.markOnTheWay(orderId);

      // Update the order in the list
      final updatedOrders = state.orders.map((order) {
        return order.id == orderId ? updatedOrder : order;
      }).toList();

      state = state.copyWith(orders: updatedOrders);
    } catch (e) {
      state = state.copyWith(error: e.toString());
      rethrow;
    }
  }

  /// Mark order as delivered
  Future<void> deliverOrder(
    String orderId, {
    String? notes,
    String? signature,
  }) async {
    try {
      final updatedOrder = await _repository.deliverOrder(
        orderId,
        notes: notes,
        signature: signature,
      );

      // Update the order in the list
      final updatedOrders = state.orders.map((order) {
        return order.id == orderId ? updatedOrder : order;
      }).toList();

      state = state.copyWith(orders: updatedOrders);
    } catch (e) {
      state = state.copyWith(error: e.toString());
      rethrow;
    }
  }

  /// Filter orders by status
  void filterByStatus(String? status) {
    loadOrders(refresh: true, status: status);
  }
}

/// Provider for delivery orders
final deliveryOrdersProvider =
    StateNotifierProvider<DeliveryOrdersNotifier, DeliveryOrdersState>((ref) {
  return DeliveryOrdersNotifier(DeliveryRepository());
});

/// Provider for pending orders count
final pendingOrdersCountProvider = Provider<int>((ref) {
  final state = ref.watch(deliveryOrdersProvider);
  return state.pendingOrders.length;
});

/// Provider for active orders count
final activeOrdersCountProvider = Provider<int>((ref) {
  final state = ref.watch(deliveryOrdersProvider);
  return state.activeOrders.length;
});
