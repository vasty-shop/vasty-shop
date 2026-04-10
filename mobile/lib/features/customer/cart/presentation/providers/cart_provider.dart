import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../shared/models/cart_item_model.dart';
import '../../../../../shared/repositories/cart_repository.dart';
import '../../../../../features/auth/presentation/providers/auth_provider.dart';


import 'package:easy_localization/easy_localization.dart';// Cart Repository Provider
final cartRepositoryProvider = Provider<CartRepository>((ref) {
  return CartRepository();
});

// Cart State
class CartState {
  final List<CartItemModel> items;
  final bool isLoading;
  final String? error;

  CartState({
    this.items = const [],
    this.isLoading = false,
    this.error,
  });

  CartState copyWith({
    List<CartItemModel>? items,
    bool? isLoading,
    String? error,
  }) {
    return CartState(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  // Computed properties
  int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);

  double get subtotal =>
      items.fold(0.0, (sum, item) => sum + item.subtotal);

  double get shipping => subtotal > 50 ? 0.0 : 5.99;

  double get tax => subtotal * 0.1; // 10% tax

  double get total => subtotal + shipping + tax;
}

// Cart Notifier
class CartNotifier extends StateNotifier<CartState> {
  final CartRepository _repository;
  final Ref _ref;

  CartNotifier(this._repository, this._ref) : super(CartState());

  /// Load cart from API
  /// Note: For guests, cart operations will require backend session
  /// Guest users can browse and add to cart, but will need to login at checkout
  Future<void> loadCart() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final authState = _ref.read(authProvider);
      final isGuest = authState.isGuestMode || authState.user == null;

      if (isGuest) {
        // For guest mode, start with empty cart
        // Backend will create session cart when items are added
        state = CartState(items: [], isLoading: false);
      } else {
        final items = await _repository.getCart();
        state = CartState(items: items, isLoading: false);
      }
    } catch (e) {
      // For guests, errors are expected - just show empty cart
      final authState = _ref.read(authProvider);
      final isGuest = authState.isGuestMode || authState.user == null;
      if (isGuest) {
        state = CartState(items: [], isLoading: false);
      } else {
        state = state.copyWith(isLoading: false, error: e.toString());
      }
    }
  }

  /// Add item to cart
  Future<bool> addToCart({
    required String productId,
    required int quantity,
    String? size,
    String? color,
    String? shopId,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      // Always use repository for now - guest cart requires product details
      // In a full implementation, guest cart would need to store/fetch product data
      // For this MVP, we'll make cart require login at checkout
      final allCartItems = await _repository.addToCart(
        productId: productId,
        quantity: quantity,
        size: size,
        color: color,
        shopId: shopId,
      );

      state = CartState(items: allCartItems, isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  /// Update cart item quantity
  Future<bool> updateQuantity(String itemId, int quantity) async {
    if (quantity <= 0) {
      return removeItem(itemId);
    }

    state = state.copyWith(isLoading: true, error: null);

    try {
      // Backend returns entire cart with all items
      final allCartItems = await _repository.updateCartItem(
        itemId: itemId,
        quantity: quantity,
      );

      state = CartState(items: allCartItems, isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  /// Remove item from cart
  Future<bool> removeItem(String itemId) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      await _repository.removeFromCart(itemId);

      final updatedItems =
          state.items.where((item) => item.id != itemId).toList();

      state = CartState(items: updatedItems, isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  /// Clear cart
  Future<bool> clearCart() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      await _repository.clearCart();
      state = CartState(isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  /// Increment item quantity
  Future<void> incrementQuantity(String itemId) async {
    final item = state.items.firstWhere((item) => item.id == itemId);
    await updateQuantity(itemId, item.quantity + 1);
  }

  /// Decrement item quantity
  Future<void> decrementQuantity(String itemId) async {
    final item = state.items.firstWhere((item) => item.id == itemId);
    await updateQuantity(itemId, item.quantity - 1);
  }
}

// Cart Provider
final cartProvider = StateNotifierProvider<CartNotifier, CartState>((ref) {
  return CartNotifier(ref.watch(cartRepositoryProvider), ref);
});

// Convenience providers
final cartItemCountProvider = Provider<int>((ref) {
  return ref.watch(cartProvider).itemCount;
});

final cartTotalProvider = Provider<double>((ref) {
  return ref.watch(cartProvider).total;
});
