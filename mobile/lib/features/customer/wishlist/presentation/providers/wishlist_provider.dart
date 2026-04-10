import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../shared/models/product_model.dart';
import '../../data/repositories/wishlist_repository.dart';


import 'package:easy_localization/easy_localization.dart';// Wishlist item model
class WishlistItem {
  final ProductModel product;
  final DateTime addedAt;
  final double priceAtAdd;

  WishlistItem({
    required this.product,
    required this.addedAt,
    required this.priceAtAdd,
  });

  factory WishlistItem.fromJson(Map<String, dynamic> json) {
    return WishlistItem(
      product: ProductModel.fromJson(json['product'] as Map<String, dynamic>),
      addedAt: json['addedAt'] != null
          ? DateTime.parse(json['addedAt'] as String)
          : DateTime.now(),
      priceAtAdd: (json['priceAtAdd'] ??
          json['product']?['salePrice'] ??
          json['product']?['price'] ??
          0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'product': product.toJson(),
      'addedAt': addedAt.toIso8601String(),
      'priceAtAdd': priceAtAdd,
    };
  }
}

// Wishlist state
class WishlistState {
  final List<WishlistItem> items;
  final bool isLoading;
  final String? error;

  WishlistState({
    this.items = const [],
    this.isLoading = false,
    this.error,
  });

  WishlistState copyWith({
    List<WishlistItem>? items,
    bool? isLoading,
    String? error,
  }) {
    return WishlistState(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  int get totalItems => items.length;

  bool isInWishlist(String productId) {
    return items.any((item) => item.product.id == productId);
  }
}

// Wishlist notifier
class WishlistNotifier extends StateNotifier<WishlistState> {
  final WishlistRepository _repository;

  WishlistNotifier(this._repository) : super(WishlistState()) {
    loadWishlist();
  }

  // Load wishlist from backend
  Future<void> loadWishlist() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final data = await _repository.getWishlist();
      final items = data
          .map((json) => WishlistItem.fromJson(json as Map<String, dynamic>))
          .toList();

      state = state.copyWith(items: items, isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  // Add item to wishlist
  Future<void> addItem(ProductModel product) async {
    // Check if already in wishlist
    if (state.isInWishlist(product.id)) {
      return;
    }

    // Optimistic update
    final newItem = WishlistItem(
      product: product,
      addedAt: DateTime.now(),
      priceAtAdd: product.salePrice ?? product.price,
    );

    state = state.copyWith(
      items: [...state.items, newItem],
    );

    try {
      await _repository.addToWishlist(product.id);
    } catch (e) {
      // Rollback on error
      state = state.copyWith(
        items: state.items.where((item) => item.product.id != product.id).toList(),
        error: e.toString(),
      );
      rethrow;
    }
  }

  // Remove item from wishlist
  Future<void> removeItem(String productId) async {
    debugPrint('🗑️ WishlistNotifier.removeItem called');
    debugPrint('   Product ID to remove: $productId');
    debugPrint('   Current items count: ${state.items.length}');

    // Find the item to remove
    final itemIndex = state.items.indexWhere((item) => item.product.id == productId);
    if (itemIndex == -1) {
      debugPrint('   ⚠️ Product not found in local state!');
      // Still try to remove from backend in case of sync issue
    } else {
      debugPrint('   Found item at index: $itemIndex');
    }

    // Store for rollback
    final itemToRemove = itemIndex != -1
        ? state.items[itemIndex]
        : null;

    // Optimistic update
    state = state.copyWith(
      items: state.items.where((item) => item.product.id != productId).toList(),
    );

    debugPrint('   Items after optimistic update: ${state.items.length}');

    try {
      await _repository.removeFromWishlist(productId);
      debugPrint('   ✅ Remove successful');
    } catch (e) {
      debugPrint('   ❌ Remove failed: $e');
      // Rollback on error
      if (itemToRemove != null) {
        state = state.copyWith(
          items: [...state.items, itemToRemove],
          error: e.toString(),
        );
      }
      rethrow;
    }
  }

  // Toggle item in wishlist
  Future<void> toggleItem(ProductModel product) async {
    if (state.isInWishlist(product.id)) {
      await removeItem(product.id);
    } else {
      await addItem(product);
    }
  }

  // Clear wishlist
  Future<void> clearWishlist() async {
    final oldItems = state.items;

    // Optimistic update
    state = state.copyWith(items: []);

    try {
      for (final item in oldItems) {
        await _repository.removeFromWishlist(item.product.id);
      }
    } catch (e) {
      // Rollback on error
      state = state.copyWith(
        items: oldItems,
        error: e.toString(),
      );
      rethrow;
    }
  }
}

// Provider
final wishlistRepositoryProvider = Provider<WishlistRepository>((ref) {
  return WishlistRepository();
});

final wishlistProvider = StateNotifierProvider<WishlistNotifier, WishlistState>((ref) {
  final repository = ref.watch(wishlistRepositoryProvider);
  return WishlistNotifier(repository);
});

// Helper provider to get wishlist count
final wishlistCountProvider = Provider<int>((ref) {
  final wishlist = ref.watch(wishlistProvider);
  return wishlist.totalItems;
});
